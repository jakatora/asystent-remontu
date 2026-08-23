// Testy seeda katalogu: czyste mapowanie materiał->produkt/oferta, idempotencja
// oraz DOWÓD CELU — po zaseedowaniu katalogu wycena z kalkulatora rozpoznaje
// materiał i liczy realny koszt (koniec z "nierozpoznane"), na danych z realnego
// materials.ts (a nie na jednym EAN z fixture).
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";

import { normalizeProductName } from "@workspace/db/repositories";
import { estimateStageCostFromCalculation } from "@workspace/pricing-service";
import type { EstimateDeps } from "@workspace/pricing-service";

import {
  buildTechnicalParameters,
  computePricePerUnit,
  materialToOfferInput,
  materialToProductInput,
  seedCatalog,
  SEED_OFFER_SOURCE,
  type SeedDeps,
  type SeedMaterial,
} from "../src/lib/seed-catalog";
import { MATERIAL_EAN_OVERLAY } from "../src/lib/ean-overlay";

/** Ładuje realny katalog referencyjny materials.ts (bez aliasu `@/`). */
async function loadReferenceMaterials(): Promise<readonly SeedMaterial[]> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const materialsPath = path.resolve(
    here,
    "../../mobile/data/prices/materials.ts",
  );
  const mod = (await import(pathToFileURL(materialsPath).href)) as {
    MATERIAL_PRICES: readonly SeedMaterial[];
  };
  return mod.MATERIAL_PRICES;
}

const paint: SeedMaterial = {
  id: "mat-paint-economy-white-10l",
  materialType: "paint",
  productLabel: "Farba biała mat 10 l",
  packageSize: 10,
  packageUnit: "l",
  pricePerPackage: 54.98,
  category: "economy",
  storeName: "Castorama",
  lastUpdated: "2026-04-01",
  currency: "PLN",
};

/** Katalog w pamięci: dedup produktu po (nazwa+kategoria), oferty po (produkt+sklep+URL). */
function makeMemoryCatalog() {
  interface Row {
    id: string;
    name: string;
    normalizedName: string;
    category: string | null;
    ean: string | null;
    gtin: string | null;
    packageSize: string | null;
    createdAt: Date;
    updatedAt: Date;
    [k: string]: unknown;
  }
  const products: Row[] = [];
  const offers: Array<Record<string, unknown>> = [];
  let pSeq = 0;
  let oSeq = 0;

  const deps: SeedDeps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upsertProduct: async (_db, input: any) => {
      const normalizedName = normalizeProductName(input.name);
      const category = input.category ?? null;
      const now = new Date(Date.now() + pSeq + offers.length);
      const existing = products.find(
        (p) => p.normalizedName === normalizedName && p.category === category,
      );
      if (existing) {
        Object.assign(existing, input, {
          normalizedName,
          updatedAt: new Date(existing.updatedAt.getTime() + 1),
        });
        return existing as never;
      }
      const row: Row = {
        id: `p${++pSeq}`,
        ...input,
        normalizedName,
        createdAt: now,
        updatedAt: now,
      };
      products.push(row);
      return row as never;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upsertOffer: async (_db, input: any) => {
      const existing = offers.find(
        (o) =>
          o.productId === input.productId &&
          o.store === input.store &&
          (o.productUrl ?? null) === (input.productUrl ?? null),
      );
      if (existing) {
        Object.assign(existing, input);
        return existing as never;
      }
      const row = { id: `o${++oSeq}`, ...input, fetchedAt: new Date() };
      offers.push(row);
      return row as never;
    },
  };

  return { products, offers, deps };
}

test("materialToProductInput mapuje pola i NIE zmyśla kodów", () => {
  const input = materialToProductInput(paint);
  assert.equal(input.name, "Farba biała mat 10 l");
  assert.equal(input.category, "paint"); // materialType
  assert.equal(input.subcategory, "economy"); // tier
  assert.equal(input.ean, null);
  assert.equal(input.gtin, null);
  assert.equal(input.packageSize, "10");
  assert.equal(input.packageUnit, "l");
  assert.equal(input.productUrl, null);
  const tp = input.technicalParameters as Record<string, unknown>;
  assert.equal(tp.referenceId, "mat-paint-economy-white-10l");
  assert.equal(tp.tier, "economy");
});

test("materialToOfferInput: cena w złotówkach, źródło reference-seed", () => {
  const offer = materialToOfferInput(paint, "p1");
  assert.equal(offer.productId, "p1");
  assert.equal(offer.store, "Castorama");
  assert.equal(offer.price, "54.98");
  assert.equal(offer.regularPrice, "54.98");
  assert.equal(offer.promoPrice, null);
  assert.equal(offer.unit, "l");
  assert.equal(offer.packageSize, "10");
  assert.equal(offer.pricePerUnit, "5.4980"); // 54.98 / 10
  assert.equal(offer.source, SEED_OFFER_SOURCE);
});

test("computePricePerUnit: null gdy packageSize <= 0", () => {
  assert.equal(computePricePerUnit({ ...paint, packageSize: 0 }), null);
  assert.equal(computePricePerUnit(paint), "5.4980");
});

test("buildTechnicalParameters pomija pola nieustawione", () => {
  const tp = buildTechnicalParameters(paint);
  assert.equal("pricePerM2" in tp, false);
  const laminate: SeedMaterial = {
    ...paint,
    materialType: "laminate",
    pricePerM2: 26.98,
  };
  assert.equal(buildTechnicalParameters(laminate).pricePerM2, 26.98);
});

test("seedCatalog jest idempotentny: drugi przebieg nie tworzy nowych rekordów", async () => {
  const cat = makeMemoryCatalog();
  const materials = [paint];

  const first = await seedCatalog(null as never, materials, cat.deps);
  assert.equal(first.materialsProcessed, 1);
  assert.equal(first.productsUpserted, 1);
  assert.equal(first.productsCreated, 1);
  assert.equal(first.offersUpserted, 1);
  assert.equal(first.errors.length, 0);
  assert.equal(cat.products.length, 1);
  assert.equal(cat.offers.length, 1);

  const second = await seedCatalog(null as never, materials, cat.deps);
  assert.equal(second.productsCreated, 0); // zaktualizowane, nie utworzone
  assert.equal(cat.products.length, 1); // brak duplikatów
  assert.equal(cat.offers.length, 1);
});

test("seeduje CAŁY realny materials.ts (każdy materiał -> produkt + oferta)", async () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const materialsPath = path.resolve(
    here,
    "../../mobile/data/prices/materials.ts",
  );
  const mod = (await import(pathToFileURL(materialsPath).href)) as {
    MATERIAL_PRICES: readonly SeedMaterial[];
  };
  assert.ok(mod.MATERIAL_PRICES.length >= 12);

  const cat = makeMemoryCatalog();
  const result = await seedCatalog(null as never, mod.MATERIAL_PRICES, cat.deps);
  assert.equal(result.errors.length, 0);
  assert.equal(result.materialsProcessed, mod.MATERIAL_PRICES.length);
  assert.equal(cat.products.length, mod.MATERIAL_PRICES.length);
  assert.equal(cat.offers.length, mod.MATERIAL_PRICES.length);
});

test("DOWÓD CELU: po seedzie wycena rozpoznaje materiał (koniec 'nierozpoznane')", async () => {
  const cat = makeMemoryCatalog();
  await seedCatalog(null as never, [paint], cat.deps);

  // EstimateDeps czytające ten sam katalog w pamięci.
  const estimateDeps: EstimateDeps = {
    findProductByCode: async (_db, code) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cat.products.find(
        (p) =>
          (code.ean && p.ean === code.ean) ||
          (code.gtin && p.gtin === code.gtin),
      ) as never) ?? null,
    findProductByNameAndCategory: async (_db, q) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cat.products.find(
        (p) => p.normalizedName === q.normalizedName && p.category === q.category,
      ) as never) ?? null,
    listOffers: async (_db, productId) =>
      cat.offers.filter((o) => o.productId === productId) as never,
  };

  // Materiał z kalkulatora: nazwa == productLabel, kategoria == materialType.
  const stageResult = {
    jobId: "paint-walls",
    materials: [
      {
        material: {
          id: "line-1",
          name: "Farba biała mat 10 l",
          unit: "l",
          category: "paint",
        },
        quantity: 25, // ceil(25/10) = 3 opakowania
      },
    ],
  };

  const stage = await estimateStageCostFromCalculation(
    null as never,
    stageResult,
    {},
    estimateDeps,
  );

  assert.equal(stage.unresolved.length, 0, "materiał NIE może być nierozpoznany");
  assert.equal(stage.lines.length, 1);
  const line = stage.lines[0]!;
  assert.equal(line.resolved, true);
  // 3 opakowania * 54.98 zł = 164.94 zł = 16494 groszy.
  assert.equal(stage.stageTotalGrosze, 16494);
});

// --- nakładka EAN (MATERIAL_EAN_OVERLAY) ------------------------------------

test("materialToProductInput: materiał z nakładki dostaje POTWIERDZONY kod EAN", () => {
  const skimCoat: SeedMaterial = {
    id: "mat-skim-coat-standard-18kg",
    materialType: "skim-coat",
    productLabel: "Gotowa gładź polimerowa Atlas GTA 18 kg",
    brand: "Atlas",
    packageSize: 18,
    packageUnit: "kg",
    pricePerPackage: 69.78,
    category: "standard",
    storeName: "Castorama",
    lastUpdated: "2026-04-01",
    currency: "PLN",
  };
  const input = materialToProductInput(skimCoat);
  // EAN Atlas GTA 18 kg potwierdzony w URL Castoramy i Mrówki (patrz ean-overlay.ts).
  assert.equal(input.ean, "5905400542509");
  assert.equal(input.manufacturer, "Atlas");
  assert.equal(input.productUrl, MATERIAL_EAN_OVERLAY[skimCoat.id]!.productUrl);
});

test("materialToProductInput: wariant z nakładki trafia do pola variant", () => {
  const skirting: SeedMaterial = {
    id: "mat-skirting-arbiton-2500",
    materialType: "skirting",
    productLabel: "Listwa przypodłogowa PCV Arbiton Indo 2500 mm",
    brand: "Arbiton",
    packageSize: 2.5,
    packageUnit: "mb",
    pricePerPackage: 31.98,
    category: "standard",
    storeName: "Castorama",
    lastUpdated: "2026-04-01",
    currency: "PLN",
  };
  const input = materialToProductInput(skirting);
  assert.equal(input.ean, "5905167781685");
  assert.equal(input.variant, "biały mat");
});

test("materialToProductInput: materiał BEZ nakładki nadal ma ean/gtin = null", () => {
  const input = materialToProductInput(paint); // mat-paint-economy-white-10l
  assert.equal(input.ean, null);
  assert.equal(input.gtin, null);
});

test("INTEGRALNOŚĆ: każdy klucz nakładki to realny id z materials.ts (typo pęka cicho)", async () => {
  const materials = await loadReferenceMaterials();
  const ids = new Set(materials.map((m) => m.id));
  for (const key of Object.keys(MATERIAL_EAN_OVERLAY)) {
    assert.ok(ids.has(key), `nakładka wskazuje nieistniejący id materiału: ${key}`);
  }
  // Każdy wpis ma kod EAN albo GTIN (nakładka bez kodu jest bez sensu).
  for (const [key, entry] of Object.entries(MATERIAL_EAN_OVERLAY)) {
    assert.ok(entry.ean || entry.gtin, `nakładka ${key} bez kodu EAN/GTIN`);
  }
});

test("DOWÓD CELU: oferta z feedu po EAN dopina się do WIELU zaseedowanych materiałów", async () => {
  const materials = await loadReferenceMaterials();
  const cat = makeMemoryCatalog();
  await seedCatalog(null as never, materials, cat.deps);

  // Dla każdego materiału z nakładki: zaseedowany produkt niesie właśnie ten EAN,
  // więc oferta z feedu sklepu (kluczowana po EAN) trafia w konkretny produkt —
  // a nie w jeden demo-EAN. To sedno ulepszenia.
  const overlaidIds = Object.keys(MATERIAL_EAN_OVERLAY);
  assert.ok(overlaidIds.length >= 2, "nakładka musi wiązać >1 materiał (WIELU)");

  for (const id of overlaidIds) {
    const material = materials.find((m) => m.id === id)!;
    const expectedEan = MATERIAL_EAN_OVERLAY[id]!.ean;
    const seeded = cat.products.find((p) => p.name === material.productLabel);
    assert.ok(seeded, `brak zaseedowanego produktu dla ${id}`);
    assert.equal(seeded!.ean, expectedEan, `zły EAN w katalogu dla ${id}`);

    // Symulacja dopasowania po kodzie (jak findByEanOrGtin / upsertProductWithMatch):
    // oferta z feedu z tym EAN znajduje DOKŁADNIE ten produkt.
    const matched = cat.products.filter((p) => p.ean === expectedEan);
    assert.equal(matched.length, 1, `EAN ${expectedEan} musi wskazywać 1 produkt`);
    assert.equal(matched[0]!.id, seeded!.id);
  }

  // Kody są różne między materiałami (żaden nie kolizuje z demo-EAN).
  const eans = overlaidIds.map((id) => MATERIAL_EAN_OVERLAY[id]!.ean);
  assert.equal(new Set(eans).size, eans.length, "EAN-y muszą być unikalne");
  assert.equal(eans.includes("5903973005797"), false, "nie używamy demo-EAN");
});
