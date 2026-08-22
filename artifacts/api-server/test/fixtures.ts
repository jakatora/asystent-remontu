// Wspólne atrapy do testów wyceny: produkt + oferty + wstrzykiwane DAO
// (EstimateDeps), dzięki czemu testy liczą realną logikę wyceny BEZ Postgresa.
import type { EstimateDeps } from "@workspace/pricing-service";
import type { CalculatorStageResult } from "@workspace/pricing-service";

const now = new Date("2026-08-22T00:00:00Z");

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
  source: null,
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
  source: null,
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
