// Seed WIELOOFERTOWY + startowa historia cen dla katalogu.
//
// Cel: dla KAŻDEGO materiału katalogu, który ma potwierdzony kod EAN
// (MATERIAL_EAN_OVERLAY), utworzyć realistyczne oferty w ≥3 sklepach
// (Leroy Merlin / Castorama / Mrówka) z lekko różnymi cenami (regularna +
// okazjonalnie promo) oraz zaseedować 5–8 punktów startowych do price_history na
// produkt, rozłożonych w czasie, z JEDNYM realnym spadkiem (= „prawdziwa
// promocja", którą wykryje warstwa odczytu getPriceStatsForProduct, próg 5%).
//
// Dzięki temu ekran wyceny od pierwszego uruchomienia pokazuje porównanie ofert
// (Sklep A/B/C + najtańszy) i sensowny wykres/statystyki historii — bez czekania
// na cykl kolektora.
//
// MONEY-PATH: to WYŁĄCZNIE dane wejściowe warstwy ODCZYTU (oferty + historia).
// NIE dotyka estimate.ts ani logiki liczenia należności. Wszystkie kwoty liczymy
// w GROSZACH (integer), a do DB zapisujemy numeric w złotówkach przez
// groszeToAmountString — spójnie z price-collector i tym, jak estimate.ts czyta
// ceny (parsePriceToGrosze). Ceny są DETERMINISTYCZNE (brak Math.random), więc
// ponowne uruchomienie daje ten sam wynik i jest idempotentne.

import {
  computePricePerUnitGrosze,
  effectivePriceGrosze,
  groszeToAmountString,
  parsePriceToGrosze,
} from "@workspace/price-collector";
import type {
  Database,
  PriceHistory,
  Product,
  ProductOffer,
} from "@workspace/db/repositories";

import { materialToProductInput, type SeedMaterial } from "./seed-catalog";
import { getEanOverlay } from "./ean-overlay";

/** Źródło ofert wieloofertowego seeda (odróżnia od 'reference-seed' bazowego). */
export const SEED_OFFER_MULTI_SOURCE = "reference-seed-multi";
/** Źródło startowych punktów historii (marker idempotencji trajektorii). */
export const SEED_HISTORY_SOURCE = "reference-seed-history";

/** Sklepy, w których generujemy oferty (akceptowane sklepy PL). */
export const SEED_STORES = ["Leroy Merlin", "Castorama", "Mrówka"] as const;
export type SeedStore = (typeof SEED_STORES)[number];

/** Bazowy narzut/rabat sklepu względem ceny referencyjnej (deterministyczny). */
const STORE_BASE_FACTOR: Readonly<Record<SeedStore, number>> = {
  "Leroy Merlin": 1.0,
  Castorama: 1.05,
  Mrówka: 0.98,
};

const DAY_MS = 86_400_000;
/** Ile dni wstecz sięgają startowe punkty trajektorii (najstarszy → najnowszy). */
const HISTORY_DAYS_AGO = [150, 120, 90, 60, 30] as const;
/** Indeks punktu trajektorii, w którym siedzi realny spadek (prawdziwa promocja). */
const HISTORY_PROMO_INDEX = 2;

/**
 * Deterministyczny hash tekstu (FNV-1a, 32-bit) — służy do stabilnego rozrzutu
 * cen/kierunków per materiał. Świadomie BEZ Math.random, żeby seed był
 * powtarzalny (ten sam wynik przy re-runie = idempotencja).
 */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Cena regularna produktu w danym sklepie (grosze). Bazę (cena referencyjna z
 * materials.ts) mnożymy przez stały narzut sklepu + mały, deterministyczny
 * rozrzut per materiał (−3..+3%), żeby sklepy nie miały identycznych cen.
 */
export function storeRegularGrosze(
  baseGrosze: number,
  materialId: string,
  store: SeedStore,
): number {
  const jitterPct = (hashString(`${materialId}|${store}`) % 7) - 3; // −3..+3
  const factor = STORE_BASE_FACTOR[store] * (1 + jitterPct / 100);
  return Math.round(baseGrosze * factor);
}

/** Sklep, którego bieżąca oferta jest „na promocji" (jeden na produkt, deterministycznie). */
export function dealStoreFor(materialId: string): SeedStore {
  return SEED_STORES[hashString(`${materialId}|deal`) % SEED_STORES.length]!;
}

/** Czy trajektoria cen tego materiału opada (true) czy rośnie (false). */
export function isFallingTrend(materialId: string): boolean {
  return hashString(`${materialId}|dir`) % 2 === 0;
}

/** Wejście oferty w kształcie akceptowanym przez upsertOffer (numeric = złotówki). */
export interface OfferInput {
  productId: string;
  store: SeedStore;
  price: string | null;
  promoPrice: string | null;
  regularPrice: string | null;
  unit: string;
  packageSize: string;
  pricePerUnit: string | null;
  productUrl: string | null;
  availability: string;
  source: string;
}

/** Wejście punktu historii dla appendPrice (z jawnym fetchedAt = backdating). */
export interface HistoryInput {
  productId: string;
  store: SeedStore;
  price: string | null;
  promoPrice: string | null;
  unit: string;
  source: string;
  fetchedAt: Date;
}

/**
 * Buduje bieżące oferty (daysAgo=0) dla 3 sklepów. Dokładnie jeden sklep dostaje
 * cenę promocyjną (deal store), reszta cenę regularną. pricePerUnit liczony z
 * ceny EFEKTYWNEJ (promo, gdy jest) — spójnie z resztą money-path.
 */
export function buildCurrentOffers(
  m: SeedMaterial,
  productId: string,
  baseGrosze: number,
): OfferInput[] {
  const overlay = getEanOverlay(m.id);
  const dealStore = dealStoreFor(m.id);
  const productUrl = overlay?.productUrl ?? m.sourceUrl ?? null;

  return SEED_STORES.map((store) => {
    const regular = storeRegularGrosze(baseGrosze, m.id, store);
    // Promo tylko w deal store: 13% taniej — realna okazja (> próg 5%).
    const promo = store === dealStore ? Math.round(regular * 0.87) : null;
    const effective = effectivePriceGrosze({ price: regular, promoPrice: promo });
    return {
      productId,
      store,
      price: groszeToAmountString(regular),
      promoPrice: groszeToAmountString(promo),
      regularPrice: groszeToAmountString(regular),
      unit: m.packageUnit,
      packageSize: String(m.packageSize),
      pricePerUnit: groszeToAmountString(
        computePricePerUnitGrosze(effective, m.packageSize),
        4,
      ),
      productUrl,
      availability: "in_stock",
      source: SEED_OFFER_MULTI_SOURCE,
    };
  });
}

/**
 * Buduje trajektorię startową historii cen (5 punktów wstecz) dla sklepu
 * wiodącego (najtańszy narzut). Cena dryfuje lekko (malejąco albo rosnąco,
 * deterministycznie per materiał), a w jednym punkcie (HISTORY_PROMO_INDEX)
 * siedzi realny spadek 15% = „prawdziwa promocja". Punkty są datowane wstecz
 * (jawny fetchedAt), żeby wykres pokazał rozłożony w czasie trend.
 */
export function buildHistoryTrajectory(
  m: SeedMaterial,
  productId: string,
  baseGrosze: number,
  now: Date,
): HistoryInput[] {
  // Sklep wiodący dla historii = ten z najniższym narzutem (spójna oś czasu).
  const store = SEED_STORES.reduce((cheapest, s) =>
    storeRegularGrosze(baseGrosze, m.id, s) <
    storeRegularGrosze(baseGrosze, m.id, cheapest)
      ? s
      : cheapest,
  );
  const anchor = storeRegularGrosze(baseGrosze, m.id, store);
  const falling = isFallingTrend(m.id);
  const n = HISTORY_DAYS_AGO.length;

  return HISTORY_DAYS_AGO.map((daysAgo, i) => {
    const t = n > 1 ? i / (n - 1) : 0; // 0..1 wzdłuż osi czasu
    // Dryf ±4% w poprzek okna czasowego (kierunek zależny od trendu).
    const mul = falling ? 1.04 - 0.08 * t : 0.96 + 0.08 * t;
    const price = Math.round(anchor * mul);
    const promo =
      i === HISTORY_PROMO_INDEX ? Math.round(price * 0.85) : null; // realny dołek
    return {
      productId,
      store,
      price: groszeToAmountString(price),
      promoPrice: groszeToAmountString(promo),
      unit: m.packageUnit,
      source: SEED_HISTORY_SOURCE,
      fetchedAt: new Date(now.getTime() - daysAgo * DAY_MS),
    };
  });
}

/** Kontrakt DAO potrzebny seedowi (wstrzykiwany w testach). */
export interface SeedOffersDeps {
  upsertProduct: (db: Database, input: unknown) => Promise<Product>;
  upsertOffer: (db: Database, input: unknown) => Promise<ProductOffer>;
  appendPrice: (db: Database, input: unknown) => Promise<PriceHistory>;
  getHistoryForProduct: (
    db: Database,
    productId: string,
  ) => Promise<readonly PriceHistory[]>;
}

export interface SeedOffersResult {
  materialsProcessed: number;
  /** Materiały pominięte, bo nie mają kodu EAN w nakładce (nie generujemy). */
  skippedNoEan: number;
  productsUpserted: number;
  offersUpserted: number;
  /** Startowe punkty historii faktycznie wstawione (0, gdy już były). */
  historyPointsInserted: number;
  errors: Array<{ material: string; message: string }>;
}

export interface SeedOffersOptions {
  /** Kotwica czasu do datowania historii wstecz (domyślnie teraz). */
  now?: Date;
}

/**
 * Czy produkt ma już zaseedowaną trajektorię historii (marker
 * SEED_HISTORY_SOURCE). Trajektoria jest append-only i nie ma klucza
 * naturalnego, więc idempotencję realizujemy przez pominięcie, gdy marker już
 * istnieje — dzięki temu re-run NIE mnoży punktów historii.
 */
function hasSeededHistory(rows: readonly PriceHistory[]): boolean {
  return rows.some((r) => r.source === SEED_HISTORY_SOURCE);
}

/**
 * Seeduje oferty wieloofertowe + startową historię dla materiałów z kodem EAN.
 * Idempotentne: oferty przez upsertOffer (klucz produkt+sklep+URL), trajektoria
 * historii wstawiana tylko, gdy marker jeszcze nie istnieje. Błąd pojedynczego
 * materiału trafia do errors[] i nie przerywa całości.
 */
export async function seedOffers(
  db: Database,
  materials: readonly SeedMaterial[],
  deps: SeedOffersDeps,
  options: SeedOffersOptions = {},
): Promise<SeedOffersResult> {
  const now = options.now ?? new Date();
  const result: SeedOffersResult = {
    materialsProcessed: 0,
    skippedNoEan: 0,
    productsUpserted: 0,
    offersUpserted: 0,
    historyPointsInserted: 0,
    errors: [],
  };

  for (const m of materials) {
    result.materialsProcessed += 1;

    const overlay = getEanOverlay(m.id);
    if (!overlay?.ean && !overlay?.gtin) {
      result.skippedNoEan += 1;
      continue; // bez pewnego kodu nie generujemy wieloofertowego seeda
    }

    const baseGrosze = parsePriceToGrosze(m.pricePerPackage);
    if (baseGrosze === null || baseGrosze <= 0) {
      result.errors.push({
        material: m.productLabel,
        message: `brak poprawnej ceny bazowej (${m.pricePerPackage})`,
      });
      continue;
    }

    try {
      // 1) Upewnij się, że produkt istnieje (match po EAN → idempotentnie).
      const product = await deps.upsertProduct(db, materialToProductInput(m));
      result.productsUpserted += 1;

      // 2) Oferty bieżące w 3 sklepach (upsert = brak duplikatów przy re-runie).
      for (const offer of buildCurrentOffers(m, product.id, baseGrosze)) {
        await deps.upsertOffer(db, offer);
        result.offersUpserted += 1;
      }

      // 3) Startowa trajektoria historii — tylko gdy jeszcze jej nie ma.
      const existingHistory = await deps.getHistoryForProduct(db, product.id);
      if (!hasSeededHistory(existingHistory)) {
        for (const point of buildHistoryTrajectory(
          m,
          product.id,
          baseGrosze,
          now,
        )) {
          await deps.appendPrice(db, point);
          result.historyPointsInserted += 1;
        }
      }
    } catch (err) {
      result.errors.push({
        material: m.productLabel,
        message: (err as Error)?.message ?? String(err),
      });
    }
  }

  return result;
}
