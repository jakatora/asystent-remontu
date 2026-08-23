import assert from "node:assert/strict";
import { test } from "node:test";

import type { Database } from "@workspace/db/repositories";

import { estimateStageLabor } from "./labor";
import {
  getLaborRateById,
  getRegionLaborProfile,
  LABOR_RATES,
  REGION_LABOR_PROFILES,
} from "./labor-data";
import {
  estimateProjectCostFromCalculation,
  estimateStageCostFromCalculation,
  type CalculatorStageResult,
} from "./from-calculator";
import type { EstimateDeps } from "./estimate";

const db = {} as unknown as Database;

/** DAO atrapy bez żadnych dopasowań materiałów — izolujemy koszt robocizny. */
const noMaterialDeps: EstimateDeps = {
  findProductByCode: async () => null,
  findProductByNameAndCategory: async () => null,
  listOffers: async () => [],
};

// --- dane robocizny --------------------------------------------------------

test("LABOR_RATES: unikalne id + kwoty w groszach (integer, min<=base<=max)", () => {
  const ids = new Set<string>();
  for (const r of LABOR_RATES) {
    assert.ok(!ids.has(r.id), `duplikat id: ${r.id}`);
    ids.add(r.id);
    assert.ok(Number.isInteger(r.priceBaselineGrosze), `${r.id} baseline nie-integer`);
    assert.ok(r.priceMinGrosze <= r.priceBaselineGrosze, `${r.id} min>base`);
    assert.ok(r.priceBaselineGrosze <= r.priceMaxGrosze, `${r.id} base>max`);
    assert.ok(r.sourceName.length > 0, `${r.id} bez source`);
  }
});

// --- estimateStageLabor ----------------------------------------------------

test("estimateStageLabor: m² × stawka bazowa (malowanie ścian)", () => {
  const res = estimateStageLabor("paint-walls", { wallArea: 20 });
  assert.equal(res.lines.length, 1);
  const l = res.lines[0]!;
  assert.equal(l.laborId, "labor-wall-painting-3-coats");
  assert.equal(l.estimated, true);
  assert.equal(l.quantity, 20);
  assert.equal(l.unitPriceGrosze, 2360);
  assert.equal(l.lineCostGrosze, 2360 * 20); // 47200
  assert.equal(res.laborTotalGrosze, 47200);
  assert.equal(res.unestimatedCount, 0);
});

test("estimateStageLabor: wiele pozycji sumuje się (płytki ścienne + gruntowanie)", () => {
  const res = estimateStageLabor("wall-tiles-bathroom", { wallArea: 10 });
  assert.equal(res.lines.length, 2);
  // 13300*10 + 976*10 = 133000 + 9760
  assert.equal(res.laborTotalGrosze, 133000 + 9760);
  assert.ok(res.lines.every((l) => l.estimated));
});

test("estimateStageLabor: mb bierze obwód, nie powierzchnię (listwy)", () => {
  const res = estimateStageLabor("skirting-boards", { wallArea: 999, perimeter: 12 });
  const l = res.lines[0]!;
  assert.equal(l.laborUnit, "mb");
  assert.equal(l.quantity, 12); // perimeter, NIE wallArea
  assert.equal(l.lineCostGrosze, 2000 * 12);
});

test("estimateStageLabor: szt domyślnie 1 gdy brak licznika (montaż umywalki)", () => {
  const res = estimateStageLabor("sink-installation", {});
  const l = res.lines[0]!;
  assert.equal(l.laborUnit, "szt");
  assert.equal(l.quantity, 1);
  assert.equal(l.lineCostGrosze, 42000);
  assert.equal(res.laborTotalGrosze, 42000);
});

test("estimateStageLabor: zaokrąglenie do pełnych groszy (Math.round)", () => {
  // wall-primer 791 gr/m² × 10,1 m² = 7989,1 gr => 7989 gr.
  const res = estimateStageLabor("wall-primer", { wallArea: 10.1 });
  assert.equal(res.lines[0]!.lineCostGrosze, 7989);
});

test("estimateStageLabor: brak obmiaru => pozycja NIEOSZACOWANA (nie zeruje sumy)", () => {
  const res = estimateStageLabor("paint-walls", {}); // brak wallArea
  const l = res.lines[0]!;
  assert.equal(l.estimated, false);
  assert.equal(l.reason, "no-quantity");
  assert.equal(l.lineCostGrosze, 0);
  assert.equal(res.laborTotalGrosze, 0);
  assert.equal(res.unestimatedCount, 1);
});

test("estimateStageLabor: job bez mapowania robocizny => brak pozycji, suma 0", () => {
  const res = estimateStageLabor("nieznany-job", { wallArea: 50 });
  assert.equal(res.lines.length, 0);
  assert.equal(res.laborTotalGrosze, 0);
  assert.equal(res.unestimatedCount, 0);
});

test("estimateStageLabor: job z pustą listą (grout-only) => brak robocizny", () => {
  const res = estimateStageLabor("grout-only", { wallArea: 10 });
  assert.equal(res.lines.length, 0);
  assert.equal(res.laborTotalGrosze, 0);
});

test("estimateStageLabor: region zaseedowany (mazowieckie) => mnożnik, BEZ fallbacku", () => {
  const res = estimateStageLabor("paint-walls", { wallArea: 5 }, { region: "mazowieckie" });
  assert.equal(res.regionCode, "mazowieckie");
  const l = res.lines[0]!;
  assert.equal(l.estimated, true);
  assert.equal(l.regionFallback, undefined); // realny region => brak fallbacku
  assert.equal(l.regionCode, "mazowieckie");
  // 2360 gr × 1.25 = 2950 gr/m²; ×5 = 14750 gr (drożej niż baza łódzka 11800).
  assert.equal(l.unitPriceGrosze, 2950);
  assert.equal(res.laborTotalGrosze, 2950 * 5);
});

test("estimateStageLabor: NIEznany region => fallback na 'lodzkie' (flaga, suma niezerowa)", () => {
  const res = estimateStageLabor("paint-walls", { wallArea: 5 }, { region: "pomorskie" });
  assert.equal(res.regionCode, "pomorskie"); // region żądany zachowany na etapie
  const l = res.lines[0]!;
  assert.equal(l.estimated, true);
  assert.equal(l.regionFallback, true);
  assert.equal(l.regionCode, "lodzkie"); // faktycznie użyta stawka bazowa
  assert.equal(l.unitPriceGrosze, 2360); // mnożnik 1.00
  assert.equal(res.laborTotalGrosze, 2360 * 5);
});

test("estimateStageLabor: sumy robocizny RÓŻNIĄ się między regionami (money-path)", () => {
  const measure = { wallArea: 20 };
  const lodz = estimateStageLabor("paint-walls", measure, { region: "lodzkie" });
  const mazo = estimateStageLabor("paint-walls", measure, { region: "mazowieckie" });
  const malo = estimateStageLabor("paint-walls", measure, { region: "malopolskie" });
  // Mazowieckie najdroższe, łódzkie baza; małopolskie pomiędzy.
  assert.ok(mazo.laborTotalGrosze > lodz.laborTotalGrosze, "mazowieckie > łódzkie");
  assert.ok(malo.laborTotalGrosze > lodz.laborTotalGrosze, "małopolskie > łódzkie");
  assert.ok(mazo.laborTotalGrosze > malo.laborTotalGrosze, "mazowieckie > małopolskie");
  assert.equal(lodz.laborTotalGrosze, 2360 * 20); // baza bez zmiany (regresja)
});

test("REGION_LABOR_PROFILES: unikalne kody, mnożniki > 0, source, baza=lodzkie 1.00", () => {
  const codes = new Set<string>();
  for (const p of REGION_LABOR_PROFILES) {
    assert.ok(!codes.has(p.regionCode), `duplikat regionu: ${p.regionCode}`);
    codes.add(p.regionCode);
    assert.ok(p.multiplier > 0, `${p.regionCode} mnożnik <= 0`);
    assert.ok(p.sourceName.length > 0, `${p.regionCode} bez source`);
    assert.ok(p.lastUpdated.length > 0, `${p.regionCode} bez lastUpdated`);
  }
  // Min. 4 nowe regiony + baza łódzka.
  assert.ok(REGION_LABOR_PROFILES.length >= 5, "za mało regionów");
  const base = getRegionLaborProfile("lodzkie");
  assert.ok(base, "brak profilu bazowego 'lodzkie'");
  assert.equal(base!.multiplier, 1.0);
  for (const code of ["mazowieckie", "malopolskie", "wielkopolskie", "slaskie"]) {
    assert.ok(getRegionLaborProfile(code), `brak profilu regionu ${code}`);
  }
});

test("estimateStageLabor: każda oszacowana pozycja niesie source stawki", () => {
  const res = estimateStageLabor("floor-tiles", { floorArea: 8 });
  const l = res.lines[0]!;
  const rate = getLaborRateById(l.laborId)!;
  assert.equal(l.source.name, rate.sourceName);
  assert.equal(l.source.type, rate.sourceType);
  assert.equal(l.source.lastUpdated, rate.lastUpdated);
});

// --- integracja z from-calculator ------------------------------------------

test("estimateStageCostFromCalculation: dokłada robociznę ADDYTYWNIE (materiały bez zmian)", async () => {
  const jobResult: CalculatorStageResult = {
    jobId: "paint-walls",
    materials: [], // brak materiałów => materialsTotal 0
    measurements: { wallArea: 20 },
  };
  const stage = await estimateStageCostFromCalculation(db, jobResult, {}, noMaterialDeps);

  assert.equal(stage.stageTotalGrosze, 0); // materiały — bez zmian
  assert.equal(stage.materialsTotalGrosze, 0);
  assert.equal(stage.laborTotalGrosze, 47200);
  assert.equal(stage.stageTotalWithLaborGrosze, 47200);
  assert.equal(stage.labor?.lines.length, 1);
  assert.equal(stage.labor?.laborTotalGrosze, 47200);
});

test("estimateStageCostFromCalculation: brak measurements => robocizna nieoszacowana, materiały OK", async () => {
  const jobResult: CalculatorStageResult = {
    jobId: "paint-walls",
    materials: [],
  };
  const stage = await estimateStageCostFromCalculation(db, jobResult, {}, noMaterialDeps);
  assert.equal(stage.laborTotalGrosze, 0);
  assert.equal(stage.stageTotalWithLaborGrosze, 0);
  assert.equal(stage.labor?.unestimatedCount, 1);
});

test("estimateProjectCostFromCalculation: sumuje robociznę tylko z pozycji oszacowanych", async () => {
  const stageOk: CalculatorStageResult = {
    jobId: "paint-walls",
    materials: [],
    measurements: { wallArea: 10 }, // 2360*10 = 23600
  };
  const stageNoMeasure: CalculatorStageResult = {
    jobId: "floor-tiles",
    materials: [],
    // brak measurements => robocizna nieoszacowana (nie wchodzi do sumy)
  };
  const project = await estimateProjectCostFromCalculation(
    db,
    [stageOk, stageNoMeasure],
    {},
    noMaterialDeps,
  );

  assert.equal(project.projectTotalGrosze, 0); // materiały
  assert.equal(project.materialsTotalGrosze, 0);
  assert.equal(project.laborTotalGrosze, 23600); // tylko etap z obmiarem
  assert.equal(project.projectTotalWithLaborGrosze, 23600);
});
