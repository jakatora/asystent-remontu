import assert from "node:assert/strict";
import { test } from "node:test";

import {
  computePriceStats,
  effectivePrice,
  normalizeProductName,
  pickCheapestOffer,
  resolveUpsertKey,
  sortOffersWithCheapest,
} from "./helpers";

test("normalizeProductName usuwa polskie znaki i redukuje separatory", () => {
  assert.equal(normalizeProductName("Farba Śnieżka"), "farba sniezka");
  assert.equal(normalizeProductName("  Gładź   GIPSOWA  "), "gladz gipsowa");
  assert.equal(normalizeProductName("Płyta OSB-3 (18mm)"), "plyta osb 3 18mm");
  assert.equal(normalizeProductName("Żółć / łąka"), "zolc laka");
  assert.equal(normalizeProductName("!!!"), "");
});

test("resolveUpsertKey: EAN ma priorytet nad GTIN, nazwa nigdy nie jest kluczem", () => {
  assert.deepEqual(resolveUpsertKey({ ean: "590", gtin: "123" }), {
    field: "ean",
    value: "590",
  });
  assert.deepEqual(resolveUpsertKey({ ean: null, gtin: "123" }), {
    field: "gtin",
    value: "123",
  });
  // Puste/whitespace kody = brak klucza (nowy produkt, nie łączymy po nazwie).
  assert.equal(resolveUpsertKey({ ean: "  ", gtin: null }), null);
  assert.equal(resolveUpsertKey({}), null);
});

test("effectivePrice: promo bije cenę regularną, brak ceny -> null", () => {
  assert.equal(effectivePrice({ price: "20.00", promoPrice: "15.50" }), 15.5);
  assert.equal(effectivePrice({ price: "20.00", promoPrice: null }), 20);
  assert.equal(effectivePrice({ price: null, promoPrice: null }), null);
});

test("sortOffersWithCheapest sortuje rosnąco, oznacza najtańszą, nulle na koniec", () => {
  const offers = [
    { id: "a", price: "30.00", promoPrice: null },
    { id: "b", price: "40.00", promoPrice: "18.00" },
    { id: "c", price: null, promoPrice: null },
    { id: "d", price: "25.00", promoPrice: null },
  ];
  const sorted = sortOffersWithCheapest(offers);
  assert.deepEqual(
    sorted.map((o) => o.id),
    ["b", "d", "a", "c"],
  );
  assert.deepEqual(
    sorted.map((o) => o.isCheapest),
    [true, false, false, false],
  );
});

test("sortOffersWithCheapest oznacza wszystkie remisowo najtańsze", () => {
  const offers = [
    { id: "a", price: "10.00", promoPrice: null },
    { id: "b", price: "10.00", promoPrice: null },
    { id: "c", price: "12.00", promoPrice: null },
  ];
  const cheapest = sortOffersWithCheapest(offers).filter((o) => o.isCheapest);
  assert.deepEqual(cheapest.map((o) => o.id).sort(), ["a", "b"]);
});

test("pickCheapestOffer zwraca najtańszą albo null gdy brak cen", () => {
  assert.equal(
    pickCheapestOffer([
      { id: "a", price: "30.00", promoPrice: null },
      { id: "b", price: "20.00", promoPrice: null },
    ])?.id,
    "b",
  );
  assert.equal(pickCheapestOffer([{ price: null, promoPrice: null }]), null);
  assert.equal(pickCheapestOffer([]), null);
});

test("computePriceStats liczy min/avg/latest i ostatnią zmianę ceny", () => {
  const d = (iso: string) => new Date(iso);
  const stats = computePriceStats([
    { price: "20.00", promoPrice: null, fetchedAt: d("2026-01-01") },
    { price: "20.00", promoPrice: null, fetchedAt: d("2026-01-05") }, // bez zmiany
    { price: "16.00", promoPrice: null, fetchedAt: d("2026-01-10") }, // zmiana
    { price: "16.00", promoPrice: null, fetchedAt: d("2026-01-20") }, // bez zmiany
  ]);
  assert.equal(stats.count, 4);
  assert.equal(stats.min, 16);
  assert.equal(stats.avg, 18);
  assert.equal(stats.latest, 16);
  assert.equal(stats.lastChangeAt?.toISOString(), d("2026-01-10").toISOString());
});

test("computePriceStats: brak danych i sortowanie nieuporządkowanego wejścia", () => {
  const empty = computePriceStats([]);
  assert.deepEqual(empty, {
    count: 0,
    min: null,
    avg: null,
    latest: null,
    lastChangeAt: null,
  });

  const d = (iso: string) => new Date(iso);
  // Wejście w losowej kolejności — funkcja sortuje sama po fetchedAt.
  const stats = computePriceStats([
    { price: "16.00", promoPrice: null, fetchedAt: d("2026-01-10") },
    { price: "20.00", promoPrice: null, fetchedAt: d("2026-01-01") },
  ]);
  assert.equal(stats.latest, 16);
  assert.equal(stats.min, 16);
});
