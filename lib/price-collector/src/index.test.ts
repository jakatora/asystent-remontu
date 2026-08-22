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
