// Wspólne atrapy do testów wyceny: produkt + oferty + wstrzykiwane DAO
// (EstimateDeps), dzięki czemu testy liczą realną logikę wyceny BEZ Postgresa.
import {
  computeProductPriceStatsGrosze,
  type PriceHistory,
} from "@workspace/db/repositories";
import type { EstimateDeps } from "@workspace/pricing-service";
import type { CalculatorStageResult } from "@workspace/pricing-service";
import type { HistoryDeps } from "../src/routes/pricing";

const now = new Date();

// Produkt katalogowy: farba 5 l, dopasowywana po EAN "111".
export const product = {
  id: "p1",
  ean: "111",
  gtin: null,
  manufacturer: null,
  brand: null,
  name: "Farba biała 5L",
  normalizedName: "farba biala 5l",
  category: "farby",
  subcategory: null,
  variant: null,
  packageSize: "5",
  packageUnit: "l",
  technicalParameters: null,
  imageUrl: null,
  productUrl: "https://example.pl/farba",
  createdAt: now,
  updatedAt: now,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Dwie oferty tego samego produktu — najtańsza to Leroy (promo 80,00 zł = 8000 gr).
export const offerCastorama = {
  id: "offA",
  productId: "p1",
  store: "Castorama",
  price: "100.00",
  promoPrice: null,
  regularPrice: "100.00",
  unit: "szt",
  packageSize: null,
  pricePerUnit: null,
  productUrl: "https://castorama.pl/farba",
  availability: "in_stock",
  fetchedAt: now,
  source: "retailer-feed",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

export const offerLeroy = {
  id: "offB",
  productId: "p1",
  store: "Leroy Merlin",
  price: "90.00",
  promoPrice: "80.00",
  regularPrice: "90.00",
  unit: "szt",
  packageSize: null,
  pricePerUnit: null,
  productUrl: "https://leroymerlin.pl/farba",
  availability: "in_stock",
  fetchedAt: now,
  source: "retailer-feed",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

/** DAO atrapy: EAN "111" => product z dwiema ofertami; reszta => brak. */
export const fakeDeps: EstimateDeps = {
  findProductByCode: async (_db, code) =>
    code.ean === "111" ? product : null,
  findProductByNameAndCategory: async () => null,
  listOffers: async (_db, productId) =>
    productId === "p1" ? [offerCastorama, offerLeroy] : [],
};

// Etap: 1 pozycja rozpoznana (farba, 12 l) + 1 nierozpoznana (EAN "999").
// packageSize=5 => ceil(12/5)=3 opakowania * 8000 gr = 24000 gr.
export const paintJob: CalculatorStageResult = {
  jobId: "paint",
  materials: [
    {
      material: {
        id: "m1",
        name: "Farba biała 5L",
        unit: "l",
        category: "farby",
        ean: "111",
      },
      quantity: 12,
    },
    {
      material: {
        id: "m2",
        name: "Nieznany produkt",
        unit: "szt",
        category: "inne",
        ean: "999",
      },
      quantity: 3,
    },
  ],
};

/** Drugi etap — bez rozpoznanych pozycji (suma 0). */
export const emptyJob: CalculatorStageResult = {
  jobId: "walls",
  materials: [
    {
      material: { id: "m3", name: "Coś", unit: "szt", category: "inne", ean: "888" },
      quantity: 2,
    },
  ],
};

export const EXPECTED_PAINT_STAGE_GROSZE = 24000;
export const EXPECTED_CHEAPEST = {
  store: "Leroy Merlin",
  url: "https://leroymerlin.pl/farba",
  unitPriceGrosze: 8000,
  packagesNeeded: 3,
};

// ─── Historia cen (do testów /pricing/history) ─────────────────────────────────
// Produkt p1: 3 pomiary (100, 100, 90 zł), aktualna najtańsza oferta = 80 zł (promo
// Leroy). Prawdziwa promocja: 8000 gr istotnie poniżej średniej historycznej.
const dh = (iso: string) => new Date(iso);

export const historyRows: PriceHistory[] = [
  {
    id: "h1",
    productId: "p1",
    store: "Castorama",
    price: "100.00",
    promoPrice: null,
    unit: "szt",
    fetchedAt: dh("2026-01-01T00:00:00Z"),
    source: "reference-seed",
  },
  {
    id: "h2",
    productId: "p1",
    store: "Castorama",
    price: "100.00",
    promoPrice: null,
    unit: "szt",
    fetchedAt: dh("2026-02-01T00:00:00Z"),
    source: "reference-seed",
  },
  {
    id: "h3",
    productId: "p1",
    store: "Leroy Merlin",
    price: "90.00",
    promoPrice: null,
    unit: "szt",
    fetchedAt: dh("2026-03-01T00:00:00Z"),
    source: "leroy",
  },
];

/** Aktualna najtańsza oferta p1 = 80,00 zł (promo Leroy) = 8000 gr. */
export const CURRENT_CHEAPEST_GROSZE = 8000;

/** DAO historii: p1 (albo EAN "111") => produkt z historyRows; reszta => brak. */
export const fakeHistoryDeps: HistoryDeps = {
  findProductById: async (_db, id) => (id === "p1" ? product : undefined),
  findProductByCode: async (_db, code) =>
    code.ean === "111" ? product : undefined,
  getPriceHistoryForProduct: async (_db, productId) =>
    productId === "p1" ? historyRows : [],
  getPriceStatsForProduct: async (_db, productId) =>
    computeProductPriceStatsGrosze(
      productId === "p1" ? historyRows : [],
      productId === "p1" ? CURRENT_CHEAPEST_GROSZE : null,
    ),
};

// Oczekiwane statystyki dla p1 (grosze): lowest=9000, average=round(29000/3)=9667,
// current=8000, diff=-1000, changePct: 90 vs 100 => -10%, promo=true (8000<=9184).
export const EXPECTED_HISTORY_STATS = {
  lowest: 9000,
  average: 9667,
  current: 8000,
  changeVsLowest: -1000,
  changePct: -10,
  isRealPromo: true,
  count: 3,
};
