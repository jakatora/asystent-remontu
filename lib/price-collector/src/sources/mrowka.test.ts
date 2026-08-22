import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MrowkaSource,
  loadMrowkaFromFeedUrl,
  type FetchLike,
} from "./mrowka.source";
import {
  mapFeedCategory,
  parseMrowkaFeed,
  parseUnitMeasure,
  slugifyCategory,
} from "./mrowka.feed";

test("slugifyCategory: usuwa polskie znaki i normalizuje", () => {
  assert.equal(slugifyCategory("Farby ścienne białe"), "farby-scienne-biale");
  assert.equal(slugifyCategory("  Gładź / Szpachla "), "gladz-szpachla");
});

test("mapFeedCategory: bierze ostatni segment ścieżki", () => {
  assert.equal(mapFeedCategory("Farby > Farby ścienne > Białe"), "biale");
  assert.equal(mapFeedCategory(null), null);
  assert.equal(mapFeedCategory("   "), null);
});

test("parseUnitMeasure: liczba PL + jednostka", () => {
  assert.deepEqual(parseUnitMeasure("10 l"), { size: 10, unit: "l" });
  assert.deepEqual(parseUnitMeasure("0,75 kg"), { size: 0.75, unit: "kg" });
  assert.deepEqual(parseUnitMeasure(null), { size: null, unit: null });
});

test("parseMrowkaFeed: parsuje poprawny JSON feedu", () => {
  const items = parseMrowkaFeed(
    JSON.stringify([
      {
        gtin: "5903973005797",
        title: "Farba Eko 10 l",
        link: "https://mrowkaonline.pl/x.html",
        price: "86,99",
      },
    ]),
  );
  assert.equal(items.length, 1);
  assert.equal(items[0]!.gtin, "5903973005797");
  assert.equal(items[0]!.price, "86,99");
});

test("parseMrowkaFeed: rzuca gdy korzeń nie jest tablicą", () => {
  assert.throws(() => parseMrowkaFeed('{"title":"x"}'), /tablicą/);
});

test("parseMrowkaFeed: rzuca gdy item bez title/link", () => {
  assert.throws(
    () => parseMrowkaFeed(JSON.stringify([{ link: "https://a" }])),
    /title/,
  );
});

test("MrowkaSource: fixture zwraca ofertę z EAN 5903973005797 w groszach", async () => {
  const src = new MrowkaSource();
  const offers = await src.fetchOffers();
  assert.equal(offers.length, 1);
  const o = offers[0]!;
  assert.equal(o.source, "mrowka");
  assert.equal(o.ean, "5903973005797");
  assert.equal(o.price, 8699); // 86,99 zł -> grosze
  assert.equal(o.currency, "PLN");
  assert.equal(o.packageSize, 10);
  assert.equal(o.unit, "l");
});

test("MrowkaSource: fetchProducts mapuje kategorię i zdjęcie", async () => {
  const products = await new MrowkaSource().fetchProducts();
  const p = products[0]!;
  assert.equal(p.ean, "5903973005797");
  assert.equal(p.category, "biale");
  assert.match(p.imageUrl ?? "", /^https:\/\//);
  assert.equal(p.gtin, null); // EAN-13 trzymamy jako ean, nie gtin
});

test("loadMrowkaFromFeedUrl: pobiera i parsuje feed przez wstrzyknięty fetch", async () => {
  const feedJson = JSON.stringify([
    {
      gtin: "1111111111116",
      title: "Test produkt 5 l",
      link: "https://mrowkaonline.pl/test.html",
      price: "50,00",
      unitPricingMeasure: "5 l",
    },
  ]);
  const fakeFetch: FetchLike = async (url: string) => {
    assert.equal(url, "https://feeds.example/mrowka.json");
    return { ok: true, status: 200, text: async () => feedJson };
  };
  const src = await loadMrowkaFromFeedUrl(
    "https://feeds.example/mrowka.json",
    fakeFetch,
  );
  const offers = await src.fetchOffers();
  assert.equal(offers.length, 1);
  assert.equal(offers[0]!.ean, "1111111111116");
  assert.equal(offers[0]!.price, 5000);
});

test("loadMrowkaFromFeedUrl: rzuca na błąd HTTP", async () => {
  const fakeFetch: FetchLike = async () => ({
    ok: false,
    status: 503,
    text: async () => "",
  });
  await assert.rejects(
    loadMrowkaFromFeedUrl("https://feeds.example/x.json", fakeFetch),
    /HTTP 503/,
  );
});
