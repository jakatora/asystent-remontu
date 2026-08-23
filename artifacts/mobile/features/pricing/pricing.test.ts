import assert from "node:assert/strict";
import { test } from "node:test";

import { LABOR_PRICES } from "@/data/prices/labor";
import { MATERIAL_PRICES } from "@/data/prices/materials";
import { REGIONS, getRegionOrBaseline } from "@/data/prices/regions";
import { getLaborForJob } from "@/features/pricing/registry";

// ─────────────────────────────────────────────────────────────────────────────
// STRAŻNIK CEN (2026-08-23)
// ─────────────────────────────────────────────────────────────────────────────
// Wycena to ścieżka pieniędzy: użytkownik podejmuje na jej podstawie decyzję o remoncie
// za kilkadziesiąt tysięcy złotych. A do dziś nie było tu ANI JEDNEGO testu — i dlatego
// przeszły dwie rzeczy, których nikt nie zauważył:
//   1. wybór Warszawy dawał ZERO pozycji robocizny (filtr po dokładnym regionie),
//      więc wycena po cichu pokazywała same materiały,
//   2. stawki robocizny nie miały ani jednego odnośnika do źródła, a ich widełki min→max
//      miały wszędzie ten sam mnożnik ×1,081 — czyli były wygenerowane, nie zebrane.
// Te testy pilnują, żeby jedno i drugie nie wróciło.

test("KAŻDY region zwraca stawki robocizny — nie tylko bazowy", () => {
  for (const region of REGIONS) {
    const stawki = getLaborForJob("paint-walls", region.code);
    assert.ok(
      stawki.length > 0,
      `region ${region.code} nie ma stawek robocizny — wycena pokazałaby same materiały`,
    );
  }
});

test("nieznany region też coś zwraca (fail-open do bazy)", () => {
  assert.ok(getLaborForJob("paint-walls", "nie-ma-takiego").length > 0);
});

test("Warszawa jest droższa od Łodzi, a Łódź jest bazą", () => {
  const lodz = getRegionOrBaseline("lodzkie");
  const warszawa = getRegionOrBaseline("mazowieckie");
  assert.equal(lodz.laborMultiplier, 1);
  assert.ok(
    warszawa.laborMultiplier > lodz.laborMultiplier,
    "robocizna w Warszawie musi być droższa niż w Łodzi",
  );
});

test("każdy region ma sensowny mnożnik robocizny", () => {
  for (const r of REGIONS) {
    assert.ok(
      typeof r.laborMultiplier === "number" && r.laborMultiplier >= 0.8 && r.laborMultiplier <= 2,
      `region ${r.code} ma podejrzany mnożnik: ${r.laborMultiplier}`,
    );
  }
});

test("każda stawka robocizny ma ŹRÓDŁO, do którego da się kliknąć", () => {
  for (const l of LABOR_PRICES) {
    assert.ok(
      l.sourceUrl && l.sourceUrl.startsWith("http"),
      `${l.id} nie ma sourceUrl — cena bez źródła jest nie do sprawdzenia`,
    );
    assert.ok(l.sourceName.length > 3, `${l.id} nie mówi, skąd pochodzi stawka`);
  }
});

test("widełki robocizny nie są wygenerowane jednym mnożnikiem", () => {
  // Stary zestaw miał min→max wszędzie ×1,081. Jeśli znów pojawi się jeden wspólny
  // współczynnik dla większości pozycji, to znak, że ktoś wypełnił tabelę wzorem.
  const ilorazy = LABOR_PRICES.map((l) => Math.round((l.laborPriceMax / l.laborPriceMin) * 100));
  const licznik = new Map<number, number>();
  for (const i of ilorazy) licznik.set(i, (licznik.get(i) ?? 0) + 1);
  const najczestszy = Math.max(...licznik.values());
  assert.ok(
    najczestszy <= LABOR_PRICES.length / 2,
    `${najczestszy} z ${LABOR_PRICES.length} pozycji ma identyczny stosunek max/min — to wzór, nie rynek`,
  );
});

test("stawki robocizny trzymają się realiów rynku 2026", () => {
  const zakresy: Record<string, [number, number]> = {
    // job → dopuszczalny przedział stawki bazowej (zł/m² netto), wg cenników kb.pl,
    // ceny-uslug.pl i ogarnijremont.pl. Szeroko, bo cenniki mocno się różnią —
    // to bezpiecznik przed absurdem, nie sztywna cena.
    "labor-wall-painting-3-coats": [15, 60],
    "labor-wall-primer": [5, 25],
    "labor-laminate-installation": [20, 90],
    "labor-gres-installation": [70, 200],
    "labor-wall-tiles-installation": [50, 200],
  };
  for (const [id, [min, max]] of Object.entries(zakresy)) {
    const l = LABOR_PRICES.find((x) => x.id === id);
    assert.ok(l, `brak stawki ${id}`);
    assert.ok(
      l!.laborPriceBaseline >= min && l!.laborPriceBaseline <= max,
      `${id}: ${l!.laborPriceBaseline} zł jest poza realiami rynku (${min}–${max} zł)`,
    );
  }
});

test("widełki są spójne: min ≤ baseline ≤ max", () => {
  for (const l of LABOR_PRICES) {
    assert.ok(
      l.laborPriceMin <= l.laborPriceBaseline && l.laborPriceBaseline <= l.laborPriceMax,
      `${l.id}: widełki się nie trzymają (${l.laborPriceMin}/${l.laborPriceBaseline}/${l.laborPriceMax})`,
    );
  }
});

test("każda cena materiału ma link do sklepu", () => {
  for (const m of MATERIAL_PRICES) {
    assert.ok(
      m.sourceUrl && m.sourceUrl.startsWith("http"),
      `${m.id} nie ma sourceUrl — nie da się sprawdzić, czy cena jest prawdziwa`,
    );
    assert.ok(m.pricePerPackage > 0, `${m.id} ma cenę ${m.pricePerPackage}`);
  }
});

test("żadna cena nie jest starsza niż pół roku", () => {
  const polRokuTemu = new Date();
  polRokuTemu.setMonth(polRokuTemu.getMonth() - 6);
  for (const m of MATERIAL_PRICES) {
    assert.ok(
      new Date(m.lastUpdated) >= polRokuTemu,
      `${m.id}: cena z ${m.lastUpdated} jest przeterminowana — materiały drożeją, wycena kłamie`,
    );
  }
  for (const l of LABOR_PRICES) {
    assert.ok(new Date(l.lastUpdated) >= polRokuTemu, `${l.id}: stawka z ${l.lastUpdated} jest za stara`);
  }
});
