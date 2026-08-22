// Orkiestrator zbierania cen: fetchOffers -> dopasowanie/utworzenie produktu w
// katalogu po EAN/GTIN -> zapis oferty przez upsertOffer (co automatycznie
// dopisuje do price_history przy zmianie ceny).
//
// Zależności DAO są WSTRZYKIWANE (deps), żeby:
//   1) nie ładować singletona `db` (który wymaga DATABASE_URL) przy imporcie,
//   2) móc testować orkiestrator na atrapach bez realnego Postgresa.

import {
  upsertByEanOrGtin,
  upsertOffer,
  type Database,
} from "@workspace/db/repositories";
import type { Product, ProductOffer } from "@workspace/db/schema";

import { groszeToAmountString } from "./normalize";
import type { NormalizedOffer, PriceSource } from "./types";

/** Kontrakt na operacje DAO potrzebne orkiestratorowi. */
export interface CollectorDeps {
  /**
   * Dopasowuje produkt po EAN/GTIN i aktualizuje, a gdy brak dopasowania —
   * tworzy nowy wpis. NIGDY nie łączy po samej nazwie (gwarancja products.repo).
   */
  upsertProduct: (db: Database, input: unknown) => Promise<Product>;
  /** Upsert oferty; przy zmianie ceny sam dopisuje rekord do price_history. */
  upsertOffer: (db: Database, input: unknown) => Promise<ProductOffer>;
}

const defaultDeps: CollectorDeps = {
  upsertProduct: upsertByEanOrGtin,
  upsertOffer,
};

export interface CollectionResult {
  source: string;
  offersProcessed: number;
  /** Produkty utworzone jako nowe wpisy w katalogu. */
  productsCreated: number;
  /** Produkty dopasowane do istniejącego wpisu po EAN/GTIN. */
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
 * Buduje wejście produktu dla products.repo z danych oferty. Zawiera tylko
 * pewne pola z oferty; brand/kategoria/zdjęcie uzupełnia osobny sync katalogu.
 */
function toProductInput(offer: NormalizedOffer) {
  return {
    ean: offer.ean,
    gtin: offer.gtin,
    manufacturer: offer.manufacturer,
    name: offer.name,
    packageSize: packageSizeToString(offer.packageSize),
    packageUnit: offer.packageUnit,
    productUrl: offer.url,
  };
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
      const product = await deps.upsertProduct(db, toProductInput(offer));
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
