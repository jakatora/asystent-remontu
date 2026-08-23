// Testy czystego serializera wyceny — bez Expressa i bazy. Weryfikują, że kwoty
// przechodzą 1:1 w GROSZACH i że pozycje nierozpoznane NIE znikają z odpowiedzi.
import assert from "node:assert/strict";
import test from "node:test";

import {
  estimateProjectCostFromCalculation,
  estimateStageCostFromCalculation,
} from "@workspace/pricing-service";

import { computeProductPriceStatsGrosze } from "@workspace/db/repositories";

import {
  serializePriceHistory,
  serializeProject,
  serializeStage,
} from "../src/lib/pricing-serialize";
import {
  CURRENT_CHEAPEST_GROSZE,
  EXPECTED_CHEAPEST,
  EXPECTED_HISTORY_STATS,
  EXPECTED_PAINT_STAGE_GROSZE,
  emptyJob,
  fakeDeps,
  historyRows,
  offerLeroy,
  paintJob,
  product,
} from "./fixtures";

const noDb = {} as never;

test("serializeStage: suma etapu w groszach + najtańsza oferta + opakowania", async () => {
  const stage = await estimateStageCostFromCalculation(
    noDb,
    paintJob,
    {},
    fakeDeps,
  );
  const out = serializeStage(stage);

  assert.equal(out.jobId, "paint");
  assert.equal(out.stageTotalGrosze, EXPECTED_PAINT_STAGE_GROSZE);
  assert.equal(out.lines.length, 2);

  const resolved = out.lines.find((l) => l.resolved);
  assert.ok(resolved, "powinna być pozycja rozpoznana");
  assert.equal(resolved!.cheapestOffer?.store, EXPECTED_CHEAPEST.store);
  assert.equal(resolved!.cheapestOffer?.url, EXPECTED_CHEAPEST.url);
  assert.equal(
    resolved!.cheapestOffer?.unitPriceGrosze,
    EXPECTED_CHEAPEST.unitPriceGrosze,
  );
  assert.equal(resolved!.packagesNeeded, EXPECTED_CHEAPEST.packagesNeeded);
  assert.equal(
    resolved!.lineCostGrosze,
    EXPECTED_CHEAPEST.unitPriceGrosze * EXPECTED_CHEAPEST.packagesNeeded,
  );
});

test("serializeStage: rozpoznana pozycja ma listę WSZYSTKICH ofert posortowaną od najtańszej (promo, regular, dostępność, url)", async () => {
  const stage = await estimateStageCostFromCalculation(
    noDb,
    paintJob,
    {},
    fakeDeps,
  );
  const out = serializeStage(stage);

  const resolved = out.lines.find((l) => l.resolved);
  assert.ok(resolved, "powinna być pozycja rozpoznana");
  const offers = resolved!.offers;
  assert.ok(offers, "rozpoznana pozycja musi mieć listę ofert");
  assert.equal(offers!.length, 2);

  // Sortowanie rosnąco: Leroy (promo 80,00 = 8000) przed Castoramą (100,00 = 10000).
  const [cheapest, second] = offers!;
  assert.equal(cheapest!.store, "Leroy Merlin");
  assert.equal(cheapest!.priceGrosze, 8000); // efektywna = promo
  assert.equal(cheapest!.regularPriceGrosze, 9000); // „była" cena do przekreślenia
  assert.equal(cheapest!.url, "https://leroymerlin.pl/farba");
  assert.equal(cheapest!.availability, "in_stock");
  // Świeżość i źródło ceny przepisane 1:1 z rekordu oferty (Date -> ISO, source null).
  assert.equal(cheapest!.fetchedAt, offerLeroy.fetchedAt.toISOString());
  assert.equal(cheapest!.source, offerLeroy.source);
  // Pierwsza oferta z ceną jest najtańsza => spójna z cheapestOffer.
  assert.equal(cheapest!.offerId, resolved!.cheapestOffer?.offerId);

  assert.equal(second!.store, "Castorama");
  assert.equal(second!.priceGrosze, 10000);
  assert.equal(second!.regularPriceGrosze, 10000); // brak realnej promocji (== aktualnej)
});

test("serializeStage: rozpoznana pozycja ma rozbicie na opakowania (packages) spójne z kosztem", async () => {
  const stage = await estimateStageCostFromCalculation(
    noDb,
    paintJob,
    {},
    fakeDeps,
  );
  const out = serializeStage(stage);

  const resolved = out.lines.find((l) => l.resolved);
  assert.ok(resolved, "powinna być pozycja rozpoznana");
  // p1: jedna wielkość opakowania (5 l) => plan = 3×5 l, spójny z lineCost.
  assert.ok(resolved!.packages, "rozpoznana pozycja musi mieć rozbicie packages");
  assert.equal(resolved!.packages!.length, 1);
  const pkg = resolved!.packages![0]!;
  assert.equal(pkg.packageSize, 5);
  assert.equal(pkg.count, EXPECTED_CHEAPEST.packagesNeeded); // 3
  assert.equal(pkg.unitPriceGrosze, EXPECTED_CHEAPEST.unitPriceGrosze); // 8000
  assert.equal(pkg.lineCostGrosze, 3 * EXPECTED_CHEAPEST.unitPriceGrosze);
  assert.equal(pkg.store, EXPECTED_CHEAPEST.store);

  // Łączny koszt planu = koszt pozycji; przy jednej wielkości brak oszczędności.
  assert.equal(resolved!.packagesTotalGrosze, resolved!.lineCostGrosze);
  assert.equal(resolved!.packagesSavingsGrosze, 0);
  // Naddatek = 3×5 - 12 = 3 l.
  assert.equal(resolved!.packagesOverage, 3);
});

test("serializeStage: pozycja nierozpoznana zostaje w odpowiedzi z reason", async () => {
  const stage = await estimateStageCostFromCalculation(
    noDb,
    paintJob,
    {},
    fakeDeps,
  );
  const out = serializeStage(stage);

  assert.equal(out.unresolvedCount, 1);
  const unresolved = out.lines.find((l) => !l.resolved);
  assert.ok(unresolved, "pozycja bez produktu nie może zniknąć");
  assert.equal(unresolved!.reason, "no-product");
  assert.equal(unresolved!.lineCostGrosze, 0);
});

test("serializeProject: suma remontu = suma etapów (w groszach)", async () => {
  const project = await estimateProjectCostFromCalculation(
    noDb,
    [paintJob, emptyJob],
    {},
    fakeDeps,
  );
  const out = serializeProject(project);

  assert.equal(out.stages.length, 2);
  assert.equal(out.projectTotalGrosze, EXPECTED_PAINT_STAGE_GROSZE);
  assert.equal(
    out.projectTotalGrosze,
    out.stages.reduce((sum, s) => sum + s.stageTotalGrosze, 0),
  );
});

test("serializeProject: skonsolidowana lista łączy ten sam produkt z 2 etapów i pokazuje oszczędność", async () => {
  // Dwa razy ten sam etap (farba 12 l, opak. 5 l, 8000 gr) => ten sam produkt p1.
  const project = await estimateProjectCostFromCalculation(
    noDb,
    [paintJob, paintJob],
    {},
    fakeDeps,
  );
  const out = serializeProject(project);

  // Per-etap: ceil(12/5)=3 opak. w każdym etapie => 2 * 24000 = 48000 gr.
  assert.equal(out.projectTotalGrosze, 2 * EXPECTED_PAINT_STAGE_GROSZE);

  // Konsolidacja: jeden produkt zebrany z 2 etapów, qty 24 => ceil(24/5)=5 opak.
  assert.equal(out.consolidated.lines.length, 1);
  const line = out.consolidated.lines[0]!;
  assert.equal(line.product.id, "p1");
  assert.equal(line.totalQuantity, 24);
  assert.equal(line.packagesNeeded, 5);
  assert.equal(line.lineCostGrosze, 5 * EXPECTED_CHEAPEST.unitPriceGrosze); // 40000
  assert.equal(line.perStageCostGrosze, 48000);
  assert.equal(line.savingsGrosze, 8000);

  assert.equal(out.consolidated.consolidatedTotalGrosze, 40000);
  assert.equal(out.consolidated.perStageTotalGrosze, out.projectTotalGrosze);
  assert.equal(out.consolidated.savingsGrosze, 8000); // kupując łącznie: 80 zł taniej
});

test("serializeProject: porównanie sklepów (koszt całości per sklep + najtańszy sklep + koszyk optymalny)", async () => {
  const project = await estimateProjectCostFromCalculation(
    noDb,
    [paintJob],
    {},
    fakeDeps,
  );
  const out = serializeProject(project);
  const cmp = out.storeComparison;

  assert.equal(cmp.productCount, 1);

  // Koszyk optymalny = najtańsza oferta p1 (Leroy 8000) * ceil(12/5)=3 = 24000.
  assert.equal(cmp.optimalBasketGrosze, 24000);
  assert.equal(cmp.optimalBasketGrosze, out.consolidated.consolidatedTotalGrosze);
  assert.deepEqual(cmp.optimalByStore, [
    { store: "Leroy Merlin", totalGrosze: 24000, itemCount: 1 },
  ]);

  // Koszt całości per sklep, rosnąco: Leroy 3*8000=24000, Castorama 3*10000=30000.
  assert.equal(cmp.stores.length, 2);
  assert.equal(cmp.stores[0]!.store, "Leroy Merlin");
  assert.equal(cmp.stores[0]!.totalGrosze, 24000);
  assert.equal(cmp.stores[0]!.missingCount, 0);
  assert.equal(cmp.stores[1]!.store, "Castorama");
  assert.equal(cmp.stores[1]!.totalGrosze, 30000);

  // Oba sklepy mają komplet => najtańszy pełny = Leroy; różnica vs optymalny = 0.
  assert.equal(cmp.cheapestFullStore?.store, "Leroy Merlin");
  assert.equal(cmp.singleStoreExtraGrosze, 0);
});

test("serializeStage: dokłada rozbicie robocizny (materiały bez zmian + labor)", async () => {
  // jobId 'paint-walls' ma stawkę robocizny; obmiar wallArea=20 => 2360*20=47200.
  const jobResult = {
    jobId: "paint-walls",
    materials: [],
    measurements: { wallArea: 20 },
  } as const;
  const stage = await estimateStageCostFromCalculation(
    noDb,
    jobResult,
    {},
    fakeDeps,
  );
  const out = serializeStage(stage);

  assert.equal(out.stageTotalGrosze, 0); // materiały bez zmian znaczenia
  assert.equal(out.materialsTotalGrosze, 0);
  assert.equal(out.laborTotalGrosze, 47200);
  assert.equal(out.stageTotalWithLaborGrosze, 47200);
  assert.equal(out.labor?.lines.length, 1);
  const laborLine = out.labor!.lines[0]!;
  assert.equal(laborLine.laborId, "labor-wall-painting-3-coats");
  assert.equal(laborLine.estimated, true);
  assert.equal(laborLine.lineCostGrosze, 47200);
  assert.ok(laborLine.source.name.length > 0, "pozycja robocizny musi mieć source");
});

test("serializeStage: bez measurements => robocizna nieoszacowana, poza sumą", async () => {
  const jobResult = { jobId: "paint-walls", materials: [] } as const;
  const stage = await estimateStageCostFromCalculation(
    noDb,
    jobResult,
    {},
    fakeDeps,
  );
  const out = serializeStage(stage);
  assert.equal(out.laborTotalGrosze, 0);
  assert.equal(out.stageTotalWithLaborGrosze, 0);
  assert.equal(out.labor?.unestimatedCount, 1);
  assert.equal(out.labor?.lines[0]!.estimated, false);
});

test("serializeProject: sumuje robociznę etapów (materiały + robocizna osobno)", async () => {
  const stageOk = {
    jobId: "paint-walls",
    materials: [],
    measurements: { wallArea: 10 }, // 2360*10 = 23600
  } as const;
  const project = await estimateProjectCostFromCalculation(
    noDb,
    [stageOk],
    {},
    fakeDeps,
  );
  const out = serializeProject(project);
  assert.equal(out.projectTotalGrosze, 0);
  assert.equal(out.materialsTotalGrosze, 0);
  assert.equal(out.laborTotalGrosze, 23600);
  assert.equal(out.projectTotalWithLaborGrosze, 23600);
});

test("serializePriceHistory: statystyki 1:1 (grosze) + punkty chronologiczne z ISO", () => {
  const stats = computeProductPriceStatsGrosze(historyRows, CURRENT_CHEAPEST_GROSZE);
  const out = serializePriceHistory(product, stats, historyRows);

  assert.equal(out.product.id, "p1");
  assert.equal(out.stats.lowest, EXPECTED_HISTORY_STATS.lowest);
  assert.equal(out.stats.average, EXPECTED_HISTORY_STATS.average);
  assert.equal(out.stats.current, EXPECTED_HISTORY_STATS.current);
  assert.equal(out.stats.changePct, EXPECTED_HISTORY_STATS.changePct);
  assert.equal(out.stats.isRealPromo, EXPECTED_HISTORY_STATS.isRealPromo);

  assert.equal(out.history.length, 3);
  assert.equal(out.history[0]!.priceGrosze, 10000);
  assert.equal(out.history[0]!.effectiveGrosze, 10000);
  assert.equal(out.history[2]!.effectiveGrosze, 9000);
  // fetchedAt serializowane jako ISO string.
  assert.equal(out.history[0]!.fetchedAt, "2026-01-01T00:00:00.000Z");
});
