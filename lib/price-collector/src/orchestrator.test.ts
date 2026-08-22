import assert from "node:assert/strict";
import { test } from "node:test";

import type { Database } from "@workspace/db/repositories";
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
