import assert from "node:assert/strict";
import { test } from "node:test";

import {
  upsertProductWithMatch,
  type Database,
} from "@workspace/db/repositories";
import type { Product, ProductOffer } from "@workspace/db/schema";

import {
  runCollection,
  runCollectionForSources,
  type CollectorDeps,
} from "./orchestrator";
import type { NormalizedOffer, NormalizedProduct, PriceSource } from "./types";

const db = {} as unknown as Database;

function offer(over: Partial<NormalizedOffer>): NormalizedOffer {
  return {
    ean: null,
    gtin: null,
    manufacturer: "Śnieżka",
    name: "Farba testowa",
    packageSize: 10,
    packageUnit: "l",
    price: 7998,
    promoPrice: null,
    regularPrice: null,
    pricePerUnit: 799.8,
    unit: "l",
    availability: null,
    currency: "PLN",
    url: "https://example.pl/p",
    source: "test-store",
    ...over,
  };
}

function fakeSource(
  offers: NormalizedOffer[],
  products: NormalizedProduct[] = [],
  slug = "test-store",
): PriceSource {
  return {
    slug,
    displayName: "Test Store",
    fetchProducts: async () => products,
    fetchOffers: async () => offers,
  };
}

// created_at == updated_at => produkt świeżo utworzony (patrz wasCreated).
function createdProduct(id: string, ean: string | null): Product {
  const now = new Date("2026-08-22T10:00:00Z");
  return { id, ean, createdAt: now, updatedAt: now } as unknown as Product;
}
function matchedProduct(id: string, ean: string | null): Product {
  return {
    id,
    ean,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-08-22T10:00:00Z"),
  } as unknown as Product;
}

test("runCollection: dopasowanie po EAN vs utworzenie nowego (bez łączenia po nazwie)", async () => {
  const productInputs: Array<{ ean: string | null }> = [];
  const offerInputs: Array<{ productId: string; price: string | null }> = [];

  const deps: CollectorDeps = {
    upsertProduct: async (_db, input) => {
      const i = input as { ean: string | null };
      productInputs.push({ ean: i.ean });
      // EAN obecny -> istniejący (matched); brak -> nowy (created).
      return i.ean
        ? matchedProduct("prod-existing", i.ean)
        : createdProduct("prod-new", null);
    },
    upsertOffer: async (_db, input) => {
      const i = input as { productId: string; price: string | null };
      offerInputs.push({ productId: i.productId, price: i.price });
      return {} as ProductOffer;
    },
  };

  const src = fakeSource([
    offer({ ean: "5903973005797", price: 7998 }),
    offer({ ean: null, name: "Farba testowa", price: 14500 }), // ta sama nazwa, brak EAN
  ]);

  const res = await runCollection(src, db, deps);

  assert.equal(res.source, "test-store");
  assert.equal(res.offersProcessed, 2);
  assert.equal(res.productsMatched, 1);
  assert.equal(res.productsCreated, 1);
  assert.equal(res.offersUpserted, 2);
  assert.deepEqual(res.errors, []);

  // Produkt bez EAN NIE jest łączony po nazwie -> forwardowany z ean=null.
  assert.deepEqual(
    productInputs.map((p) => p.ean),
    ["5903973005797", null],
  );
  // Grosze -> tekstowy numeric; productId spięty z wynikiem upsertu produktu.
  assert.deepEqual(offerInputs, [
    { productId: "prod-existing", price: "79.98" },
    { productId: "prod-new", price: "145.00" },
  ]);
});

test("runCollection: wzbogaca produkt metadanymi z fetchProducts po EAN", async () => {
  const productInputs: Array<Record<string, unknown>> = [];
  const deps: CollectorDeps = {
    upsertProduct: async (_db, input) => {
      productInputs.push(input as Record<string, unknown>);
      return matchedProduct("p", (input as { ean: string | null }).ean);
    },
    upsertOffer: async () => ({}) as ProductOffer,
  };

  const meta: NormalizedProduct = {
    ean: "5903973005797",
    gtin: null,
    manufacturer: "Śnieżka",
    brand: "Śnieżka",
    name: "Farba Eko",
    category: "farby-scienne-biale",
    packageSize: 10,
    packageUnit: "l",
    imageUrl: "https://example.pl/img.jpg",
    productUrl: "https://example.pl/p",
  };

  const src = fakeSource([offer({ ean: "5903973005797" })], [meta]);
  await runCollection(src, db, deps);

  assert.equal(productInputs.length, 1);
  // Metadane (brand/kategoria/zdjęcie) doklejone z fetchProducts po EAN.
  assert.equal(productInputs[0]!.brand, "Śnieżka");
  assert.equal(productInputs[0]!.category, "farby-scienne-biale");
  assert.equal(productInputs[0]!.imageUrl, "https://example.pl/img.jpg");
});

test("runCollectionForSources: agreguje wyniki, błąd źródła nie zatrzymuje reszty", async () => {
  const deps: CollectorDeps = {
    upsertProduct: async () => createdProduct("p", null),
    upsertOffer: async () => ({}) as ProductOffer,
  };

  const good = fakeSource([offer({ name: "OK" })], [], "store-a");
  const broken: PriceSource = {
    slug: "store-b",
    displayName: "Broken",
    fetchProducts: async () => [],
    fetchOffers: async () => {
      throw new Error("feed down");
    },
  };

  const results = await runCollectionForSources([good, broken], db, deps);
  assert.equal(results.length, 2);
  assert.equal(results[0]!.source, "store-a");
  assert.equal(results[0]!.offersUpserted, 1);
  assert.equal(results[1]!.source, "store-b");
  assert.match(results[1]!.errors[0]!.message, /feed down/);
});

// Atrapa Drizzle dla realnego upsertProductWithMatch: zwraca wyniki SELECT-ów w
// kolejności wywołań i przechwytuje update()/insert(), żeby udowodnić, że oferta
// z feedu dopina się do istniejącego rekordu (update), a nie tworzy duplikatu.
function makeMatchDb(selectResults: unknown[][]) {
  const cap = { updates: [] as unknown[], inserts: [] as unknown[] };
  let selectCount = 0;
  const db = {
    select() {
      const idx = selectCount++;
      const b: Record<string, unknown> = {
        from: () => b,
        where: () => b,
        orderBy: () => b,
        limit: () => Promise.resolve(selectResults[idx] ?? []),
      };
      return b;
    },
    update() {
      let set: Record<string, unknown> = {};
      const b: Record<string, unknown> = {
        set: (v: Record<string, unknown>) => ((set = v), b),
        where: () => b,
        // createdAt != updatedAt (set niesie świeże updatedAt) => wasCreated()=false (matched).
        returning: () =>
          (cap.updates.push(set),
          Promise.resolve([{ id: "seed-id", createdAt: new Date(0), ...set }])),
      };
      return b;
    },
    insert() {
      let values: Record<string, unknown> = {};
      const b: Record<string, unknown> = {
        values: (v: Record<string, unknown>) => ((values = v), b),
        returning: () => (cap.inserts.push(values), Promise.resolve([{ id: "new-id", ...values }])),
      };
      return b;
    },
  };
  return { db: db as unknown as Database, cap };
}

test("runCollection (deps.upsertProduct = REALNY upsertProductWithMatch): oferta z EAN dopina się do materiału bez EAN", async () => {
  // Materiał zaseedowany bez EAN, dopasowywalny po nazwie+kategorii.
  const seeded = {
    id: "seed-id",
    ean: null,
    gtin: null,
    brand: "Śnieżka",
    manufacturer: null,
    name: "Farba testowa",
    normalizedName: "farba testowa",
    category: "farby-scienne-biale",
    imageUrl: null,
    productUrl: null,
    packageSize: "10",
    packageUnit: "l",
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
  } as unknown as Product;

  // SELECT #1 (po EAN) pusty, SELECT #2 (nazwa+kategoria) trafia w seed.
  const { db: matchDb, cap } = makeMatchDb([[], [seeded]]);

  const offerInputs: Array<{ productId: string }> = [];
  const deps: CollectorDeps = {
    upsertProduct: upsertProductWithMatch, // REALNA logika dopasowania
    upsertOffer: async (_db, input) => {
      offerInputs.push({ productId: (input as { productId: string }).productId });
      return {} as ProductOffer;
    },
  };

  // Oferta niesie EAN; metadane (fetchProducts) dają kategorię do dopasowania.
  const src = fakeSource(
    [offer({ ean: "5903973005797", name: "Farba testowa" })],
    [
      {
        ean: "5903973005797",
        gtin: null,
        manufacturer: null,
        brand: null,
        name: "Farba testowa",
        category: "farby-scienne-biale",
        packageSize: 10,
        packageUnit: "l",
        imageUrl: "https://example.pl/img.jpg",
        productUrl: "https://example.pl/p",
      },
    ],
  );

  const res = await runCollection(src, matchDb, deps);

  // Dopięto do istniejącego (matched), ŻADNEGO nowego produktu (bez duplikatu).
  assert.equal(res.productsMatched, 1);
  assert.equal(res.productsCreated, 0);
  assert.equal(cap.inserts.length, 0);
  assert.equal(cap.updates.length, 1);
  // Seed wzbogacony EAN-em i zdjęciem z feedu; oferta spięta z tym samym rekordem.
  assert.equal((cap.updates[0] as { ean?: string }).ean, "5903973005797");
  assert.equal(offerInputs[0]!.productId, "seed-id");
});

test("runCollection: błąd jednej oferty nie przerywa reszty", async () => {
  const deps: CollectorDeps = {
    upsertProduct: async () => createdProduct("p", null),
    upsertOffer: async (_db, input) => {
      const i = input as { price: string | null };
      if (i.price === "10.00") throw new Error("DB down");
      return {} as ProductOffer;
    },
  };

  const src = fakeSource([
    offer({ name: "OK-1", price: 2000 }),
    offer({ name: "ZŁA", price: 1000 }),
    offer({ name: "OK-2", price: 3000 }),
  ]);

  const res = await runCollection(src, db, deps);

  assert.equal(res.offersProcessed, 3);
  assert.equal(res.offersUpserted, 2);
  assert.equal(res.errors.length, 1);
  assert.equal(res.errors[0]!.offer, "ZŁA");
  assert.match(res.errors[0]!.message, /DB down/);
});
