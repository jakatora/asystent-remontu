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
  assert.equal(o.source, "mrowka-fixture");
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
    loadMrowkaFromFeedUrl("https://feeds.example/x.json", fakeFetch, {
      sleep: async () => {},
    }),
    /HTTP 503/,
  );
});

test("loadMrowkaFromFeedUrl: parsuje realny feed XML (auto-detekcja)", async () => {
  const xml = `<rss xmlns:g="http://base.google.com/ns/1.0"><channel>
    <item>
      <g:gtin>5903973005797</g:gtin>
      <title>Farba Eko 10 l</title>
      <link>https://mrowkaonline.pl/eko.html</link>
      <g:price>86,99 PLN</g:price>
      <g:unit_pricing_measure>10 l</g:unit_pricing_measure>
    </item>
  </channel></rss>`;
  const fakeFetch: FetchLike = async () => ({
    ok: true,
    status: 200,
    text: async () => xml,
  });
  const src = await loadMrowkaFromFeedUrl("https://feeds.example/mrowka.xml", fakeFetch);
  const offers = await src.fetchOffers();
  assert.equal(offers.length, 1);
  assert.equal(offers[0]!.ean, "5903973005797");
  assert.equal(offers[0]!.price, 8699);
  assert.equal(offers[0]!.currency, "PLN");
});

test("loadMrowkaFromFeedUrl: retry-lite ponawia po 5xx i zwraca sukces", async () => {
  const feedJson = JSON.stringify([
    { gtin: "5903973005797", title: "Farba 10 l", link: "https://a/x.html", price: "80,00" },
  ]);
  let calls = 0;
  const flaky: FetchLike = async () => {
    calls++;
    if (calls < 3) return { ok: false, status: 503, text: async () => "" };
    return { ok: true, status: 200, text: async () => feedJson };
  };
  const src = await loadMrowkaFromFeedUrl("https://feeds.example/x", flaky, {
    retries: 2,
    sleep: async () => {},
  });
  assert.equal(calls, 3); // 2 nieudane + 1 udana
  const offers = await src.fetchOffers();
  assert.equal(offers[0]!.price, 8000);
});

test("loadMrowkaFromFeedUrl: retry-lite ponawia po wyjątku sieci", async () => {
  const feedJson = JSON.stringify([
    { gtin: "5903973005797", title: "Farba 10 l", link: "https://a/x.html", price: "70,00" },
  ]);
  let calls = 0;
  const flaky: FetchLike = async () => {
    calls++;
    if (calls === 1) throw new Error("ECONNRESET");
    return { ok: true, status: 200, text: async () => feedJson };
  };
  const src = await loadMrowkaFromFeedUrl("https://feeds.example/x", flaky, {
    retries: 2,
    sleep: async () => {},
  });
  assert.equal(calls, 2);
  const offers = await src.fetchOffers();
  assert.equal(offers[0]!.price, 7000);
});

test("loadMrowkaFromFeedUrl: 4xx (np. 403) NIE jest ponawiane (bez omijania blokad)", async () => {
  let calls = 0;
  const blocked: FetchLike = async () => {
    calls++;
    return { ok: false, status: 403, text: async () => "" };
  };
  await assert.rejects(
    loadMrowkaFromFeedUrl("https://feeds.example/x", blocked, {
      retries: 2,
      sleep: async () => {},
    }),
    /HTTP 403/,
  );
  assert.equal(calls, 1); // fail-fast, brak ponawiania
});

test("loadMrowkaFromFeedUrl: timeout przerywa próbę (AbortController) i jest przejściowy", async () => {
  let calls = 0;
  const feedJson = JSON.stringify([
    { gtin: "5903973005797", title: "Farba 10 l", link: "https://a/x.html", price: "60,00" },
  ]);
  const withTimeout: FetchLike = async (_url, init) => {
    calls++;
    if (calls === 1) {
      // Symuluj zawieszenie: odrzuć, gdy sygnał aborta zadziała.
      return await new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new Error("aborted")),
        );
      });
    }
    return { ok: true, status: 200, text: async () => feedJson };
  };
  const src = await loadMrowkaFromFeedUrl("https://feeds.example/x", withTimeout, {
    timeoutMs: 20,
    retries: 2,
    sleep: async () => {},
  });
  assert.equal(calls, 2);
  const offers = await src.fetchOffers();
  assert.equal(offers[0]!.price, 6000);
});
