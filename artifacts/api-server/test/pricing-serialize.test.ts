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
