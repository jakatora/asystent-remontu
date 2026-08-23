import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createSourcesFromEnv,
  listSourceSlugs,
  resolveSourceSlugs,
} from "./index";

test("resolveSourceSlugs: domyślnie wszystkie, ENV filtruje, nieznane osobno", () => {
  assert.deepEqual(resolveSourceSlugs({}).slugs, listSourceSlugs());
  const r = resolveSourceSlugs({
    PRICE_COLLECTOR_SOURCES: "mrowka, nieznany ,leroy-merlin",
  });
  assert.deepEqual(r.slugs, ["mrowka", "leroy-merlin"]);
  assert.deepEqual(r.unknown, ["nieznany"]);
});

test("oba zarejestrowane sklepy dają ofertę na TEN SAM EAN (selectCheapestOffer ma co porównywać)", async () => {
  const SHARED_EAN = "5903973005797";
  const { slugs } = resolveSourceSlugs({});
  const sources = await createSourcesFromEnv(slugs, {});

  const priceByStore = new Map<string, number>();
  for (const s of sources) {
    const offers = await s.fetchOffers();
    const match = offers.find((o) => o.ean === SHARED_EAN && o.price != null);
    if (match) priceByStore.set(s.slug, match.price!);
  }

  // Co najmniej 2 sklepy z ceną na ten sam EAN.
  assert.ok(
    priceByStore.size >= 2,
    `oczekiwano >=2 sklepów z EAN ${SHARED_EAN}, jest ${priceByStore.size}`,
  );
  assert.ok(priceByStore.has("leroy-merlin"));
  assert.ok(priceByStore.has("mrowka"));
  // Ceny różne -> jedna jest najtańsza (Leroy 79,98 < Mrówka 86,99).
  assert.notEqual(
    priceByStore.get("leroy-merlin"),
    priceByStore.get("mrowka"),
  );
});

test("createSourcesFromEnv: honoruje STORE2_FEED_URL dla Castoramy przez wstrzyknięty fetch", async () => {
  const feedJson = JSON.stringify([
    {
      gtin: "5903973005797",
      title: "Farba Śnieżka Eko 10 l z feedu",
      link: "https://www.castorama.pl/feed_CAPL.prd",
      price: "92,00",
      unitPricingMeasure: "10 l",
    },
  ]);
  let fetchedUrl: string | null = null;
  const sources = await createSourcesFromEnv(
    ["castorama"],
    { STORE2_FEED_URL: "https://feeds.example/castorama.json" },
    {
      fetchImpl: async (url) => {
        fetchedUrl = url;
        return { ok: true, status: 200, text: async () => feedJson };
      },
    },
  );
  assert.equal(fetchedUrl, "https://feeds.example/castorama.json");
  assert.equal(sources.length, 1);
  assert.equal(sources[0]!.slug, "castorama");
  const offers = await sources[0]!.fetchOffers();
  assert.equal(offers[0]!.price, 9200); // z feedu, nie z fixture (94,98)
});

test("trzy zarejestrowane sklepy dają REALNĄ ofertę na TEN SAM EAN (Leroy < Mrówka < Castorama)", async () => {
  const SHARED_EAN = "5903973005797";
  const sources = await createSourcesFromEnv(
    ["leroy-merlin", "mrowka", "castorama"],
    {},
  );

  const priceByStore = new Map<string, number>();
  for (const s of sources) {
    const offers = await s.fetchOffers();
    const match = offers.find((o) => o.ean === SHARED_EAN && o.price != null);
    if (match) priceByStore.set(s.slug, match.price!);
  }

  // Castorama pokrywa EAN wspólny z Mrówką -> >=2 (tu 3) realne oferty do porównania.
  assert.equal(priceByStore.size, 3);
  assert.equal(priceByStore.get("leroy-merlin"), 7998);
  assert.equal(priceByStore.get("mrowka"), 8699);
  assert.equal(priceByStore.get("castorama"), 9498);
  // selectCheapestOffer ma realny wybór: najtańszy to Leroy.
  const cheapest = Math.min(...priceByStore.values());
  assert.equal(cheapest, priceByStore.get("leroy-merlin"));
});

test("createSourcesFromEnv: honoruje STORE3_FEED_URL dla Leroy Merlin przez wstrzyknięty fetch", async () => {
  const feedJson = JSON.stringify([
    {
      gtin: "5903973005797",
      title: "Farba Śnieżka Eko 10 l z feedu",
      link: "https://www.leroymerlin.pl/produkty/feed-43041761.html",
      price: "77,00",
      unitPricingMeasure: "10 l",
    },
  ]);
  let fetchedUrl: string | null = null;
  const sources = await createSourcesFromEnv(
    ["leroy-merlin"],
    { STORE3_FEED_URL: "https://feeds.example/leroy.json" },
    {
      fetchImpl: async (url) => {
        fetchedUrl = url;
        return { ok: true, status: 200, text: async () => feedJson };
      },
    },
  );
  assert.equal(fetchedUrl, "https://feeds.example/leroy.json");
  assert.equal(sources.length, 1);
  assert.equal(sources[0]!.slug, "leroy-merlin");
  const offers = await sources[0]!.fetchOffers();
  assert.equal(offers[0]!.price, 7700); // z feedu, nie z fixture (79,98)
});

test("createSourcesFromEnv: honoruje MROWKA_FEED_URL przez wstrzyknięty fetch", async () => {
  const feedJson = JSON.stringify([
    {
      gtin: "5903973005797",
      title: "Farba z feedu 10 l",
      link: "https://mrowkaonline.pl/feed.html",
      price: "84,00",
      unitPricingMeasure: "10 l",
    },
  ]);
  const sources = await createSourcesFromEnv(
    ["mrowka"],
    { MROWKA_FEED_URL: "https://feeds.example/mrowka.json" },
    {
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        text: async () => feedJson,
      }),
    },
  );
  assert.equal(sources.length, 1);
  const offers = await sources[0]!.fetchOffers();
  assert.equal(offers[0]!.price, 8400); // z feedu, nie z fixture
});

test("createSourcesFromEnv: STORE_FEED_URL (feed XML) ma pierwszeństwo i narasta realne ceny", async () => {
  const feedXml = `<rss xmlns:g="http://base.google.com/ns/1.0"><channel>
    <item>
      <g:gtin>5903973005797</g:gtin>
      <title>Farba z feedu XML 10 l</title>
      <link>https://mrowkaonline.pl/xml.html</link>
      <g:price>82,50 PLN</g:price>
      <g:unit_pricing_measure>10 l</g:unit_pricing_measure>
    </item>
  </channel></rss>`;
  let fetchedUrl: string | null = null;
  const sources = await createSourcesFromEnv(
    ["mrowka"],
    {
      STORE_FEED_URL: "https://feeds.example/mrowka.xml",
      MROWKA_FEED_URL: "https://legacy.example/should-not-win.json",
    },
    {
      fetchImpl: async (url) => {
        fetchedUrl = url;
        return { ok: true, status: 200, text: async () => feedXml };
      },
    },
  );
  assert.equal(fetchedUrl, "https://feeds.example/mrowka.xml"); // STORE_FEED_URL wygrywa
  const offers = await sources[0]!.fetchOffers();
  assert.equal(offers[0]!.ean, "5903973005797");
  assert.equal(offers[0]!.price, 8250);
  assert.equal(offers[0]!.currency, "PLN");
});
