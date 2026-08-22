import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CastoramaSource,
  loadCastoramaFromFeedUrl,
} from "./castorama.source";
import type { FetchLike } from "./merchant-feed";

test("CastoramaSource: fixture zwraca ofertę z EAN 5903973005797 w groszach", async () => {
  const src = new CastoramaSource();
  const offers = await src.fetchOffers();
  assert.equal(offers.length, 1);
  const o = offers[0]!;
  assert.equal(o.source, "castorama");
  assert.equal(o.ean, "5903973005797");
  assert.equal(o.price, 9498); // 94,98 zł -> grosze
  assert.equal(o.currency, "PLN");
  assert.equal(o.packageSize, 10);
  assert.equal(o.unit, "l");
  assert.equal(o.availability, "in_stock");
});

test("CastoramaSource: fetchProducts mapuje kategorię, markę i URL sklepu", async () => {
  const products = await new CastoramaSource().fetchProducts();
  const p = products[0]!;
  assert.equal(p.ean, "5903973005797");
  assert.equal(p.brand, "Śnieżka");
  assert.equal(p.category, "biale");
  assert.match(p.productUrl ?? "", /^https:\/\/www\.castorama\.pl\//);
  assert.equal(p.gtin, null); // EAN-13 trzymamy jako ean, nie gtin
});

test("loadCastoramaFromFeedUrl: pobiera i parsuje feed JSON przez wstrzyknięty fetch", async () => {
  const feedJson = JSON.stringify([
    {
      gtin: "5903973005797",
      title: "Farba Śnieżka Eko 10 l",
      link: "https://www.castorama.pl/x_CAPL.prd",
      price: "94,98",
      unitPricingMeasure: "10 l",
    },
  ]);
  const fakeFetch: FetchLike = async (url: string) => {
    assert.equal(url, "https://feeds.example/castorama.json");
    return { ok: true, status: 200, text: async () => feedJson };
  };
  const src = await loadCastoramaFromFeedUrl(
    "https://feeds.example/castorama.json",
    fakeFetch,
  );
  const offers = await src.fetchOffers();
  assert.equal(offers.length, 1);
  assert.equal(offers[0]!.source, "castorama");
  assert.equal(offers[0]!.ean, "5903973005797");
  assert.equal(offers[0]!.price, 9498);
});

test("loadCastoramaFromFeedUrl: parsuje realny feed XML (Google Merchant, auto-detekcja)", async () => {
  const xml = `<rss xmlns:g="http://base.google.com/ns/1.0"><channel>
    <item>
      <g:gtin>5903973005797</g:gtin>
      <title>Farba Śnieżka Eko 10 l</title>
      <link>https://www.castorama.pl/x_CAPL.prd</link>
      <g:price>94,98 PLN</g:price>
      <g:unit_pricing_measure>10 l</g:unit_pricing_measure>
    </item>
  </channel></rss>`;
  const fakeFetch: FetchLike = async () => ({
    ok: true,
    status: 200,
    text: async () => xml,
  });
  const src = await loadCastoramaFromFeedUrl(
    "https://feeds.example/castorama.xml",
    fakeFetch,
  );
  const offers = await src.fetchOffers();
  assert.equal(offers[0]!.ean, "5903973005797");
  assert.equal(offers[0]!.price, 9498);
  assert.equal(offers[0]!.currency, "PLN");
});

test("loadCastoramaFromFeedUrl: 4xx (np. 403) NIE jest ponawiane (bez omijania blokad)", async () => {
  let calls = 0;
  const blocked: FetchLike = async () => {
    calls++;
    return { ok: false, status: 403, text: async () => "" };
  };
  await assert.rejects(
    loadCastoramaFromFeedUrl("https://feeds.example/x", blocked, {
      retries: 2,
      sleep: async () => {},
    }),
    /HTTP 403/,
  );
  assert.equal(calls, 1); // fail-fast, brak ponawiania
});
