// Testy seeda WIELOOFERTOWEGO + startowej historii cen: czyste generatory
// (oferty 3 sklepów, trajektoria historii z realnym spadkiem), idempotencja
// orkiestratora oraz DOWÓD CELU — po seedzie warstwa odczytu widzi ≥3 oferty i
// wykrywa „prawdziwą promocję" (spójność z money-path, próg 5%).
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";

import {
  computeProductPriceStatsGrosze,
  effectivePriceGrosze as effectiveGroszeFromRow,
} from "@workspace/db/repositories";
import { parsePriceToGrosze } from "@workspace/price-collector";

import {
  buildCurrentOffers,
  buildHistoryTrajectory,
  dealStoreFor,
  hashString,
  SEED_HISTORY_SOURCE,
  SEED_OFFER_MULTI_SOURCE,
  SEED_STORES,
  seedOffers,
  storeRegularGrosze,
  type SeedOffersDeps,
} from "../src/lib/seed-offers";
import type { SeedMaterial } from "../src/lib/seed-catalog";
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

// Materiał z nakładki EAN (Atlas GTA 18 kg) — do testów jednostkowych generatora.
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

// Materiał BEZ nakładki EAN (farba economy) — powinien być pominięty.
const paintNoEan: SeedMaterial = {
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

const FIXED_NOW = new Date("2026-08-23T00:00:00.000Z");

/**
 * Katalog w pamięci naśladujący semantykę DAO:
 * - upsertProduct: match po EAN → aktualizacja, inaczej nowy rekord.
 * - upsertOffer: klucz (produkt+sklep+URL), append do historii TYLKO przy zmianie ceny.
 * - appendPrice: append-only.
 * - getHistoryForProduct: wszystkie punkty produktu, chronologicznie.
 */
function makeMemoryCatalog() {
  interface ProductRow {
    id: string;
    name: string;
    category: string | null;
    ean: string | null;
    gtin: string | null;
    createdAt: Date;
    updatedAt: Date;
    [k: string]: unknown;
  }
  interface OfferRow {
    id: string;
    productId: string;
    store: string;
    price: string | null;
    promoPrice: string | null;
    productUrl: string | null;
    source: string | null;
    unit: string | null;
    [k: string]: unknown;
  }
  interface HistoryRow {
    id: string;
    productId: string;
    store: string;
    price: string | null;
    promoPrice: string | null;
    unit: string | null;
    source: string | null;
    fetchedAt: Date;
  }
  const products: ProductRow[] = [];
  const offers: OfferRow[] = [];
  const history: HistoryRow[] = [];
  let pSeq = 0;
  let oSeq = 0;
  let hSeq = 0;

  const deps: SeedOffersDeps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upsertProduct: async (_db, input: any) => {
      const existing = input.ean
        ? products.find((p) => p.ean === input.ean)
        : undefined;
      if (existing) {
        Object.assign(existing, input, {
          updatedAt: new Date(existing.updatedAt.getTime() + 1),
        });
        return existing as never;
      }
      const now = new Date(FIXED_NOW.getTime() + pSeq);
      const row: ProductRow = {
        id: `p${++pSeq}`,
        ...input,
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
      const priceChanged =
        !existing ||
        existing.price !== input.price ||
        existing.promoPrice !== input.promoPrice;
      let row: OfferRow;
      if (existing) {
        Object.assign(existing, input);
        row = existing;
      } else {
        row = { id: `o${++oSeq}`, ...input };
        offers.push(row);
      }
      if (priceChanged) {
        history.push({
          id: `h${++hSeq}`,
          productId: row.productId,
          store: row.store,
          price: row.price,
          promoPrice: row.promoPrice,
          unit: row.unit ?? null,
          source: row.source ?? null,
          fetchedAt: new Date(FIXED_NOW.getTime() + hSeq),
        });
      }
      return row as never;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appendPrice: async (_db, input: any) => {
      const row: HistoryRow = { id: `h${++hSeq}`, ...input };
      history.push(row);
      return row as never;
    },
    getHistoryForProduct: async (_db, productId) =>
      history
        .filter((h) => h.productId === productId)
        .sort((a, b) => a.fetchedAt.getTime() - b.fetchedAt.getTime()) as never,
  };

  return { products, offers, history, deps };
}

test("storeRegularGrosze: sklepy dają różne, deterministyczne ceny", () => {
  const base = parsePriceToGrosze(skimCoat.pricePerPackage)!;
  const prices = SEED_STORES.map((s) =>
    storeRegularGrosze(base, skimCoat.id, s),
  );
  // Każda cena dodatnia i deterministyczna (ten sam wynik przy powtórzeniu).
  for (const p of prices) assert.ok(p > 0);
  const again = SEED_STORES.map((s) => storeRegularGrosze(base, skimCoat.id, s));
  assert.deepEqual(prices, again);
  // Co najmniej dwa sklepy mają różną cenę (narzuty się różnią).
  assert.ok(new Set(prices).size >= 2, "sklepy nie mogą mieć identycznych cen");
});

test("hashString jest deterministyczny", () => {
  assert.equal(hashString("abc"), hashString("abc"));
});

test("buildCurrentOffers: 3 oferty, dokładnie jedna promocyjna, poprawny pricePerUnit", () => {
  const base = parsePriceToGrosze(skimCoat.pricePerPackage)!;
  const built = buildCurrentOffers(skimCoat, "p1", base);
  assert.equal(built.length, 3);
  assert.deepEqual(
    built.map((o) => o.store).sort(),
    [...SEED_STORES].sort(),
  );

  const promoted = built.filter((o) => o.promoPrice !== null);
  assert.equal(promoted.length, 1, "dokładnie jeden sklep na promocji");
  assert.equal(promoted[0]!.store, dealStoreFor(skimCoat.id));

  for (const o of built) {
    assert.equal(o.source, SEED_OFFER_MULTI_SOURCE);
    assert.equal(o.unit, "kg");
    assert.equal(o.packageSize, "18");
    assert.equal(o.availability, "in_stock");
    // pricePerUnit = cena efektywna / packageSize, 4 miejsca.
    const eff = parsePriceToGrosze(o.promoPrice ?? o.price)!;
    const expected = (eff / 18 / 100).toFixed(4);
    assert.equal(o.pricePerUnit, expected);
    // Promo < regularna (realny rabat).
    if (o.promoPrice !== null) {
      assert.ok(parsePriceToGrosze(o.promoPrice)! < parsePriceToGrosze(o.price)!);
    }
  }
});

test("buildHistoryTrajectory: 5 punktów wstecz, jeden realny spadek, jeden sklep", () => {
  const base = parsePriceToGrosze(skimCoat.pricePerPackage)!;
  const points = buildHistoryTrajectory(skimCoat, "p1", base, FIXED_NOW);
  assert.equal(points.length, 5);
  // Wszystkie z jednego sklepu (spójna oś czasu) i markerem historii.
  assert.equal(new Set(points.map((p) => p.store)).size, 1);
  for (const p of points) assert.equal(p.source, SEED_HISTORY_SOURCE);
  // Datowane wstecz i chronologiczne (najstarszy pierwszy).
  for (let i = 1; i < points.length; i += 1) {
    assert.ok(points[i]!.fetchedAt.getTime() > points[i - 1]!.fetchedAt.getTime());
  }
  assert.ok(points[points.length - 1]!.fetchedAt.getTime() <= FIXED_NOW.getTime());
  // Dokładnie jeden punkt to promo (realny dołek).
  const promo = points.filter((p) => p.promoPrice !== null);
  assert.equal(promo.length, 1);
  const promoG = parsePriceToGrosze(promo[0]!.promoPrice)!;
  const regG = parsePriceToGrosze(promo[0]!.price)!;
  assert.ok(promoG < regG * 0.95, "dołek musi być realny (>5% poniżej ceny dnia)");
});

test("seedOffers pomija materiał BEZ kodu EAN (nie zgadujemy ofert)", async () => {
  const cat = makeMemoryCatalog();
  const r = await seedOffers(null as never, [paintNoEan], cat.deps, {
    now: FIXED_NOW,
  });
  assert.equal(r.materialsProcessed, 1);
  assert.equal(r.skippedNoEan, 1);
  assert.equal(r.offersUpserted, 0);
  assert.equal(r.historyPointsInserted, 0);
  assert.equal(cat.products.length, 0);
});

test("seedOffers jest IDEMPOTENTNY: drugi przebieg nie mnoży ofert ani historii", async () => {
  const cat = makeMemoryCatalog();
  const materials = [skimCoat];

  const first = await seedOffers(null as never, materials, cat.deps, {
    now: FIXED_NOW,
  });
  assert.equal(first.errors.length, 0);
  assert.equal(first.productsUpserted, 1);
  assert.equal(first.offersUpserted, 3);
  assert.equal(first.historyPointsInserted, 5);
  assert.equal(cat.offers.length, 3);
  // 5 z trajektorii + 3 z bieżących ofert (każda nowa oferta = 1 punkt) = 8.
  assert.equal(cat.history.length, 8);

  const second = await seedOffers(null as never, materials, cat.deps, {
    now: FIXED_NOW,
  });
  assert.equal(second.offersUpserted, 3); // upsert (aktualizacja), nie nowe
  assert.equal(second.historyPointsInserted, 0); // marker już istnieje
  assert.equal(cat.offers.length, 3, "brak duplikatów ofert");
  assert.equal(cat.history.length, 8, "brak duplikatów historii");
});

test("DOWÓD CELU: po seedzie ≥3 oferty i wykryta PRAWDZIWA promocja", async () => {
  const cat = makeMemoryCatalog();
  await seedOffers(null as never, [skimCoat], cat.deps, { now: FIXED_NOW });

  const product = cat.products[0]!;
  const productOffers = cat.offers.filter((o) => o.productId === product.id);
  assert.ok(productOffers.length >= 3, "muszą być ≥3 oferty do porównania sklepów");

  // Bieżąca najtańsza oferta (cena efektywna) = wejście `current` warstwy odczytu.
  const currentGrosze = productOffers
    .map((o) =>
      effectiveGroszeFromRow({
        price: parsePriceToGrosze(o.price),
        promoPrice: parsePriceToGrosze(o.promoPrice),
      }),
    )
    .filter((v): v is number => v !== null)
    .reduce((min, v) => Math.min(min, v), Infinity);

  // Ta sama funkcja, której używa /pricing/history (getPriceStatsForProduct).
  const rows = cat.history
    .filter((h) => h.productId === product.id)
    .map((h) => ({
      price: parsePriceToGrosze(h.price),
      promoPrice: parsePriceToGrosze(h.promoPrice),
      fetchedAt: h.fetchedAt,
    }));
  const stats = computeProductPriceStatsGrosze(rows as never, currentGrosze);

  assert.ok(stats.count >= 5, "historia musi mieć ≥5 punktów");
  assert.ok(stats.average !== null && stats.lowest !== null);
  assert.equal(
    stats.isRealPromo,
    true,
    "bieżąca najtańsza oferta musi być realną promocją (>5% < średniej)",
  );
});

test("INTEGRALNOŚĆ: seed CAŁEGO materials.ts pokrywa dokładnie materiały z nakładki EAN", async () => {
  const materials = await loadReferenceMaterials();
  const cat = makeMemoryCatalog();
  const r = await seedOffers(null as never, materials, cat.deps, {
    now: FIXED_NOW,
  });

  const overlaidCount = materials.filter((m) => {
    const key = m.id as keyof typeof MATERIAL_EAN_OVERLAY;
    const e = MATERIAL_EAN_OVERLAY[key];
    return Boolean(e?.ean || e?.gtin);
  }).length;

  assert.equal(r.errors.length, 0);
  assert.equal(r.materialsProcessed, materials.length);
  assert.equal(r.materialsProcessed - r.skippedNoEan, overlaidCount);
  assert.equal(r.productsUpserted, overlaidCount);
  assert.equal(r.offersUpserted, overlaidCount * 3);
  assert.equal(r.historyPointsInserted, overlaidCount * 5);
  assert.ok(overlaidCount >= 10, "nakładka powinna pokrywać ≥10 materiałów");
});
