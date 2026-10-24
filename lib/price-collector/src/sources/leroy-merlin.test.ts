import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LeroyMerlinSource,
  loadLeroyFromFeedUrl,
} from "./leroy-merlin.source";
import type { FetchLike } from "./merchant-feed";

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
  assert.equal(withEan!.source, "leroy-merlin-fixture");
  assert.equal(withEan!.packageSize, 10);
  assert.equal(withEan!.unit, "l");
  assert.equal(withEan!.availability, "in_stock");
  assert.ok(withEan!.url?.startsWith("https://www.leroymerlin.pl/"));

  const noEan = offers.find((o) => o.ean === null);
  assert.ok(noEan, "produkt bez EAN musi istnieć (test ścieżki 'utwórz nowy')");
  assert.equal(noEan!.price, 14500); // 145,00 zł
});

test("fetchProducts: mapuje kategorię, markę i URL sklepu", async () => {
  const products = await new LeroyMerlinSource().fetchProducts();
  assert.equal(products.length, 2);
  const p = products.find((x) => x.ean === "5903973005797")!;
  assert.equal(p.brand, "Śnieżka");
  assert.equal(p.category, "biale");
  assert.equal(p.gtin, null); // EAN-13 trzymamy jako ean, nie gtin
  for (const prod of products) {
    assert.equal(prod.name, prod.name.trim());
    assert.ok(prod.productUrl?.startsWith("https://www.leroymerlin.pl/"));
  }
});

test("loadLeroyFromFeedUrl: pobiera i parsuje feed JSON przez wstrzyknięty fetch", async () => {
  const feedJson = JSON.stringify([
    {
      gtin: "5903973005797",
      title: "Farba Śnieżka Eko 10 l",
      link: "https://www.leroymerlin.pl/produkty/x-43041761.html",
      price: "79,98",
      unitPricingMeasure: "10 l",
    },
  ]);
  const fakeFetch: FetchLike = async (url: string) => {
    assert.equal(url, "https://feeds.example/leroy.json");
    return { ok: true, status: 200, text: async () => feedJson };
  };
  const src = await loadLeroyFromFeedUrl(
    "https://feeds.example/leroy.json",
    fakeFetch,
  );
  const offers = await src.fetchOffers();
  assert.equal(offers.length, 1);
  assert.equal(offers[0]!.source, "leroy-merlin-feed");
  assert.equal(offers[0]!.ean, "5903973005797");
  assert.equal(offers[0]!.price, 7998);
});

test("loadLeroyFromFeedUrl: parsuje realny feed XML (Google Merchant, auto-detekcja)", async () => {
  const xml = `<rss xmlns:g="http://base.google.com/ns/1.0"><channel>
    <item>
      <g:gtin>5903973005797</g:gtin>
      <title>Farba Śnieżka Eko 10 l</title>
      <link>https://www.leroymerlin.pl/produkty/x-43041761.html</link>
      <g:price>79,98 PLN</g:price>
      <g:unit_pricing_measure>10 l</g:unit_pricing_measure>
    </item>
  </channel></rss>`;
  const fakeFetch: FetchLike = async () => ({
    ok: true,
    status: 200,
    text: async () => xml,
  });
  const src = await loadLeroyFromFeedUrl(
    "https://feeds.example/leroy.xml",
    fakeFetch,
  );
  const offers = await src.fetchOffers();
  assert.equal(offers[0]!.ean, "5903973005797");
  assert.equal(offers[0]!.price, 7998);
  assert.equal(offers[0]!.currency, "PLN");
});

test("loadLeroyFromFeedUrl: 4xx (np. 403) NIE jest ponawiane (bez omijania blokad)", async () => {
  let calls = 0;
  const blocked: FetchLike = async () => {
    calls++;
    return { ok: false, status: 403, text: async () => "" };
  };
  await assert.rejects(
    loadLeroyFromFeedUrl("https://feeds.example/x", blocked, {
      retries: 2,
      sleep: async () => {},
    }),
    /HTTP 403/,
  );
  assert.equal(calls, 1); // fail-fast, brak ponawiania
});
