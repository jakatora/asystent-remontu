import assert from "node:assert/strict";
import { test } from "node:test";

import {
  computePriceStats,
  computeProductPriceStatsGrosze,
  effectivePrice,
  effectivePriceGrosze,
  normalizeProductName,
  pickCheapestOffer,
  priceToGrosze,
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

test("priceToGrosze: PLN (string/number) -> grosze, śmieci -> null", () => {
  assert.equal(priceToGrosze("129.99"), 12999);
  assert.equal(priceToGrosze("80.00"), 8000);
  assert.equal(priceToGrosze(145), 14500);
  assert.equal(priceToGrosze(0), 0);
  assert.equal(priceToGrosze(null), null);
  assert.equal(priceToGrosze(undefined), null);
  assert.equal(priceToGrosze("-5"), null); // ujemna = odrzucona
  assert.equal(priceToGrosze("abc"), null);
});

test("effectivePriceGrosze: promo bije regularną, brak ceny -> null", () => {
  assert.equal(effectivePriceGrosze({ price: "100.00", promoPrice: "80.00" }), 8000);
  assert.equal(effectivePriceGrosze({ price: "100.00", promoPrice: null }), 10000);
  assert.equal(effectivePriceGrosze({ price: null, promoPrice: null }), null);
});

test("computeProductPriceStatsGrosze: lowest/average/current/diff/changePct/promo", () => {
  const d = (iso: string) => new Date(iso);
  // Historia: 200, 200, 160 (spadek), current oferta = 130 (nowy dołek).
  const stats = computeProductPriceStatsGrosze(
    [
      { price: "200.00", promoPrice: null, fetchedAt: d("2026-01-01") },
      { price: "200.00", promoPrice: null, fetchedAt: d("2026-02-01") },
      { price: "160.00", promoPrice: null, fetchedAt: d("2026-03-01") },
    ],
    13000, // aktualna najtańsza oferta = 130,00 zł
  );
  assert.equal(stats.count, 3);
  assert.equal(stats.lowest, 16000); // najniższy pomiar historyczny
  assert.equal(stats.average, Math.round((20000 + 20000 + 16000) / 3)); // 18667
  assert.equal(stats.current, 13000);
  assert.equal(stats.changeVsLowest, 13000 - 16000); // -3000: poniżej dołka
  // Ostatni ruch w historii: 160 vs 200 => (160-200)/200 = -20%
  assert.equal(stats.changePct, -20);
  assert.equal(stats.isRealPromo, true); // 13000 <= round(18667*0.95)=17734
});

test("computeProductPriceStatsGrosze: sztuczna promocja nie jest prawdziwa", () => {
  const d = (iso: string) => new Date(iso);
  // Cena zawsze ~150 (średnia ≈ current) — „promo" jest sztuczne.
  const stats = computeProductPriceStatsGrosze(
    [
      { price: "150.00", promoPrice: null, fetchedAt: d("2026-01-01") },
      { price: "150.00", promoPrice: null, fetchedAt: d("2026-02-01") },
    ],
    15000,
  );
  assert.equal(stats.isRealPromo, false);
  assert.equal(stats.changePct, 0); // 150 vs 150
  assert.equal(stats.changeVsLowest, 0);
});

test("computeProductPriceStatsGrosze: brak oferty -> current z ostatniego pomiaru", () => {
  const d = (iso: string) => new Date(iso);
  const stats = computeProductPriceStatsGrosze(
    [{ price: "99.00", promoPrice: null, fetchedAt: d("2026-01-01") }],
    null,
  );
  assert.equal(stats.current, 9900);
  assert.equal(stats.changePct, null); // < 2 punktów
  assert.equal(stats.isRealPromo, false); // 9900 vs średnia 9900 -> nie promo
});

test("computeProductPriceStatsGrosze: brak historii -> zera i current z oferty", () => {
  const stats = computeProductPriceStatsGrosze([], 5000);
  assert.deepEqual(stats, {
    count: 0,
    lowest: null,
    average: null,
    current: 5000,
    changeVsLowest: null,
    changePct: null,
    isRealPromo: false,
  });
});
