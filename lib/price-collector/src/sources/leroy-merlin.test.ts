import assert from "node:assert/strict";
import { test } from "node:test";

import { LeroyMerlinSource } from "./leroy-merlin.source";

test("LeroyMerlinSource: metadane adaptera", () => {
  const src = new LeroyMerlinSource();
  assert.equal(src.slug, "leroy-merlin");
  assert.equal(src.displayName, "Leroy Merlin");
});

test("fetchOffers: normalizuje realne dane fixture do groszy", async () => {
  const offers = await new LeroyMerlinSource().fetchOffers();
  assert.equal(offers.length, 2);

  const withEan = offers.find((o) => o.ean === "5903973005797");
  assert.ok(withEan, "produkt z EAN musi istnieć");
  assert.equal(withEan!.price, 7998); // 79,98 zł -> grosze
  assert.equal(withEan!.pricePerUnit, 799.8); // 7998 / 10 l
  assert.equal(withEan!.currency, "PLN");
  assert.equal(withEan!.source, "leroy-merlin");
  assert.ok(withEan!.url?.startsWith("https://www.leroymerlin.pl/"));

  const noEan = offers.find((o) => o.ean === null);
  assert.ok(noEan, "produkt bez EAN musi istnieć (test ścieżki 'utwórz nowy')");
  assert.equal(noEan!.price, 14500); // 145,00 zł
});

test("fetchProducts: przycina nazwy i zwraca URL produktu", async () => {
  const products = await new LeroyMerlinSource().fetchProducts();
  assert.equal(products.length, 2);
  for (const p of products) {
    assert.equal(p.name, p.name.trim());
    assert.ok(p.productUrl?.startsWith("https://www.leroymerlin.pl/"));
  }
});
