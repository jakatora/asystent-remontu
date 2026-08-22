// Testy czystego serializera wyceny — bez Expressa i bazy. Weryfikują, że kwoty
// przechodzą 1:1 w GROSZACH i że pozycje nierozpoznane NIE znikają z odpowiedzi.
import assert from "node:assert/strict";
import test from "node:test";

import {
  estimateProjectCostFromCalculation,
  estimateStageCostFromCalculation,
} from "@workspace/pricing-service";

import {
  serializeProject,
  serializeStage,
} from "../src/lib/pricing-serialize";
import {
  EXPECTED_CHEAPEST,
  EXPECTED_PAINT_STAGE_GROSZE,
  emptyJob,
  fakeDeps,
  paintJob,
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
