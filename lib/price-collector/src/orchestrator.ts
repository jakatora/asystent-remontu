// Orkiestrator zbierania cen: fetchOffers -> dopasowanie/utworzenie produktu w
// katalogu po EAN/GTIN -> zapis oferty przez upsertOffer (co automatycznie
// dopisuje do price_history przy zmianie ceny).
//
// Zależności DAO są WSTRZYKIWANE (deps), żeby:
//   1) nie ładować singletona `db` (który wymaga DATABASE_URL) przy imporcie,
//   2) móc testować orkiestrator na atrapach bez realnego Postgresa.

import {
  upsertOffer,
  upsertProductWithMatch,
  type Database,
} from "@workspace/db/repositories";
import type { Product, ProductOffer } from "@workspace/db/schema";

import { groszeToAmountString } from "./normalize";
import type { NormalizedOffer, NormalizedProduct, PriceSource } from "./types";

/** Kontrakt na operacje DAO potrzebne orkiestratorowi. */
export interface CollectorDeps {
  /**
   * Dopasowuje produkt NAJPIERW po EAN/GTIN, a gdy brak — fallbackiem po
   * DOKŁADNEJ parze (znormalizowana nazwa + kategoria), wzbogacając wtedy
   * istniejący rekord bez kodu danymi z feedu (tylko puste pola). Dopiero brak
   * obu tworzy nowy wpis. NIGDY nie łączy wyłącznie po podobnej nazwie
   * (gwarancja products.repo — fallback wymaga też zgodnej kategorii).
   */
  upsertProduct: (db: Database, input: unknown) => Promise<Product>;
  /** Upsert oferty; przy zmianie ceny sam dopisuje rekord do price_history. */
  upsertOffer: (db: Database, input: unknown) => Promise<ProductOffer>;
}

const defaultDeps: CollectorDeps = {
  upsertProduct: upsertProductWithMatch,
  upsertOffer,
};

export interface CollectionResult {
  source: string;
  offersProcessed: number;
  /** Produkty utworzone jako nowe wpisy w katalogu. */
  productsCreated: number;
  /** Produkty dopasowane do istniejącego wpisu (po EAN/GTIN lub nazwie+kategorii). */
  productsMatched: number;
  offersUpserted: number;
  /** Oferty, które się nie zapisały (nazwa produktu + komunikat błędu). */
  errors: Array<{ offer: string; message: string }>;
}

/** numeric(package_size) w DAO jest tekstem — konwertujemy liczbę na string. */
function packageSizeToString(size: number | null): string | null {
  return size === null ? null : String(size);
}

/**
 * Buduje wejście produktu dla products.repo z danych oferty, WZBOGACONE o
 * metadane katalogowe z `fetchProducts` (brand/kategoria/zdjęcie/subcategory),
 * dopasowane po EAN/GTIN. Oferta zawsze jest źródłem pewnych pól (nazwa, cena),
 * a metadane uzupełniają to, czego oferta nie niesie. Gdy brak metadanych
 * (np. źródło zwraca `fetchProducts: []`), zachowanie jest jak wcześniej.
 */
function toProductInput(offer: NormalizedOffer, meta?: NormalizedProduct) {
  return {
    ean: offer.ean,
    gtin: offer.gtin ?? meta?.gtin ?? null,
    manufacturer: offer.manufacturer ?? meta?.manufacturer ?? null,
    brand: meta?.brand ?? null,
    name: offer.name,
    category: meta?.category ?? null,
    packageSize: packageSizeToString(offer.packageSize ?? meta?.packageSize ?? null),
    packageUnit: offer.packageUnit ?? meta?.packageUnit ?? null,
    imageUrl: meta?.imageUrl ?? null,
    productUrl: offer.url ?? meta?.productUrl ?? null,
  };
}

/**
 * Indeksuje produkty z `fetchProducts` po kodzie (NAJPIERW EAN, potem GTIN) —
 * ta sama kolejność, którą stosuje dopasowanie w products.repo. NIGDY nie
 * indeksujemy po nazwie (to byłoby luźne dopasowanie). Produkty bez kodu są
 * pomijane w indeksie (i tak nie da się ich pewnie powiązać z ofertą).
 */
function indexProductsByCode(
  products: NormalizedProduct[],
): Map<string, NormalizedProduct> {
  const map = new Map<string, NormalizedProduct>();
  for (const p of products) {
    const key = p.ean ?? p.gtin;
    if (key && !map.has(key)) map.set(key, p);
  }
  return map;
}

/** Znajduje metadane produktu dla oferty po EAN/GTIN (bez łączenia po nazwie). */
function findMeta(
  index: Map<string, NormalizedProduct>,
  offer: NormalizedOffer,
): NormalizedProduct | undefined {
  const key = offer.ean ?? offer.gtin;
  return key ? index.get(key) : undefined;
}

/** Buduje wejście oferty dla product-offers.repo (kwoty grosze -> numeric). */
function toOfferInput(offer: NormalizedOffer, productId: string, store: string) {
  return {
    productId,
    store,
    price: groszeToAmountString(offer.price),
    promoPrice: groszeToAmountString(offer.promoPrice),
    regularPrice: groszeToAmountString(offer.regularPrice),
    unit: offer.unit,
    packageSize: packageSizeToString(offer.packageSize),
    pricePerUnit: groszeToAmountString(offer.pricePerUnit, 4),
    productUrl: offer.url,
    availability: offer.availability,
    source: offer.source,
  };
}

/**
 * Produkt jest "świeżo utworzony", gdy created_at == updated_at (repo ustawia
 * updated_at = teraz przy KAŻDEJ aktualizacji, więc dopasowany wpis ma różne
 * znaczniki). Metryka best-effort, wyłącznie do raportu — nie steruje logiką.
 */
function wasCreated(product: Product): boolean {
  return product.createdAt.getTime() === product.updatedAt.getTime();
}

/**
 * Pobiera oferty ze źródła i zapisuje je do katalogu + historii cen.
 * Błąd pojedynczej oferty nie przerywa całości — trafia do `errors[]`.
 */
export async function runCollection(
  source: PriceSource,
  db: Database,
  deps: CollectorDeps = defaultDeps,
): Promise<CollectionResult> {
  const offers = await source.fetchOffers();
  // Metadane katalogowe (brand/kategoria/zdjęcie) do wzbogacenia produktu.
  // Best-effort: brak/awaria fetchProducts nie może zatrzymać zbierania ofert.
  let productIndex = new Map<string, NormalizedProduct>();
  try {
    productIndex = indexProductsByCode(await source.fetchProducts());
  } catch {
    productIndex = new Map();
  }

  const result: CollectionResult = {
    source: source.slug,
    offersProcessed: offers.length,
    productsCreated: 0,
    productsMatched: 0,
    offersUpserted: 0,
    errors: [],
  };

  for (const offer of offers) {
    try {
      const meta = findMeta(productIndex, offer);
      const product = await deps.upsertProduct(db, toProductInput(offer, meta));
      if (wasCreated(product)) {
        result.productsCreated += 1;
      } else {
        result.productsMatched += 1;
      }

      await deps.upsertOffer(db, toOfferInput(offer, product.id, source.slug));
      result.offersUpserted += 1;
    } catch (err) {
      result.errors.push({
        offer: offer.name,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

/**
 * Zbiera ceny z WIELU źródeł po kolei nad tym samym `db`. Błąd całego źródła
 * (np. fetchOffers rzuca) nie przerywa pozostałych — trafia do wyniku jako
 * `CollectionResult` z pojedynczym błędem. Dzięki temu jeden padnięty sklep nie
 * blokuje zebrania cen z reszty.
 */
export async function runCollectionForSources(
  sources: readonly PriceSource[],
  db: Database,
  deps: CollectorDeps = defaultDeps,
): Promise<CollectionResult[]> {
  const results: CollectionResult[] = [];
  for (const source of sources) {
    try {
      results.push(await runCollection(source, db, deps));
    } catch (err) {
      results.push({
        source: source.slug,
        offersProcessed: 0,
        productsCreated: 0,
        productsMatched: 0,
        offersUpserted: 0,
        errors: [
          {
            offer: "*",
            message: err instanceof Error ? err.message : String(err),
          },
        ],
      });
    }
  }
  return results;
}
