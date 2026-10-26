import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { sinkConnectionQuantity, SINK_FIXINGS_ID, upgradeSinkCalculation, projectSinkShopping } from './sink';
import { getJobById } from '@/features/content/registry';
import { parseMeasurements } from '@/shared/lib/measurements';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { computePricedBudget } from '@/features/pricing/engine';
import { buildRenovationBasket } from '@/features/pricing/renovationBasket';
import { generateShoppingItems } from './shopping';
import type { Project, CalculationResult } from '@/types/domain';

const job = getJobById('sink-installation')!;
const calc = (count = 2, choice?: number) => calculatorEngine.calculate(job, { sinkCount: count, sinkExtraHoses: 0, ...(choice === undefined ? {} : { sinkFixingChoice: choice }) });
const fixing = (result: CalculationResult) => result.materials.find(line => line.material.id === SINK_FIXINGS_ID)!;
test('unknown or invalid fixing selection keeps a required unpriced line on every tier', () => {
  for (const choice of [undefined, 0, -1, 1.5, 3, NaN]) {
    const result = calc(2, choice);
    assert.equal(fixing(result).quantityKnown, false);
    for (const tier of ['economy', 'standard', 'better'] as const) {
      const line = toPricingStageInput(result, tier).materials.find(row => row.material.id === SINK_FIXINGS_ID)!;
      assert.equal(line.material.unit, 'pozycja'); assert.equal(line.material.ean, undefined);
      const budget = computePricedBudget({ job, calc: result, regionCode: 'lodzkie', qualityTier: tier, overrides: [] });
      assert.ok(budget.unpricedMaterials!.some(name => name.includes('Mocowania')));
      assert.ok(!budget.materialDetails.some(row => row.materialRef.materialType === 'basin-fixings'));
    }
  }
});
test('explicit compatible Fischer selection counts two fastening points per basin and buys whole blisters', () => {
  for (const count of [1, 2, 10]) {
    const result = calc(count, 1);
    assert.equal(fixing(result).quantity, count * 2); assert.equal(fixing(result).cost, count * 24.5);
    assert.equal(calculatorEngine.calculateDetailed(job, result.measurements).materials.find(row => row.material.id === SINK_FIXINGS_ID)!.quantity, count * 2);
    for (const tier of ['economy', 'standard', 'better'] as const) {
      const line = toPricingStageInput(result, tier).materials.find(row => row.material.id === SINK_FIXINGS_ID)!;
      assert.equal(line.quantity, count * 2); assert.match(line.material.name, /WST 140 K NV/);
      const budget = computePricedBudget({ job, calc: result, regionCode: 'lodzkie', qualityTier: tier, overrides: [] });
      const detail = budget.materialDetails.find(row => row.materialRef.materialType === 'basin-fixings')!;
      assert.equal(detail.packagesNeeded, count); assert.equal(detail.totalCost, count * 24.5);
    }
  }
});
test('own suitable fixings is an explicit whole-work declaration, not an implicit default', () => {
  const result = calc(2, 2);
  assert.equal(fixing(result).quantityKnown, true); assert.equal(fixing(result).quantity, 0);
  assert.ok(!toPricingStageInput(result).materials.some(row => row.material.id === SINK_FIXINGS_ID));
  assert.ok(!generateShoppingItems('p', result).some(row => row.materialId === SINK_FIXINGS_ID));
  assert.equal(sinkConnectionQuantity(SINK_FIXINGS_ID, { sinkCount: 0, sinkFixingChoice: 2 }, true), null);
});
test('old saved basins acquire the missing requirement without changing JSON or inferring a compatible kit', () => {
  const old = JSON.parse(JSON.stringify(calc())) as CalculationResult;
  (old as any).materials = old.materials.filter(row => row.material.id !== SINK_FIXINGS_ID);
  const before = JSON.stringify(old), upgraded = upgradeSinkCalculation(old)!;
  assert.equal(JSON.stringify(old), before); assert.equal(fixing(upgraded).quantityKnown, false);
  assert.equal(upgradeSinkCalculation(upgraded)!.materials.filter(row => row.material.id === SINK_FIXINGS_ID).length, 1);
  const project = { id: 'p', jobId: job.id, calculationResult: old } as Project;
  assert.ok(buildRenovationBasket([project], ['p'], 'standard').stages[0].materials.some(row => row.material.id === SINK_FIXINGS_ID && row.material.unit === 'pozycja'));
});
test('select measurements reject arbitrary numbers and preserve the explicit unknown/default choice', () => {
  assert.equal(parseMeasurements(job, { sinkCount: '2' }).values.sinkFixingChoice, 0);
  for (const value of ['0.5', '1.5', '-1', '3', 'NaN']) assert.ok(parseMeasurements(job, { sinkCount: '2', sinkFixingChoice: value }).errors.some(error => error.id === 'sinkFixingChoice'));
  for (const value of ['0', '1', '2']) assert.equal(parseMeasurements(job, { sinkCount: '2', sinkFixingChoice: value }).errors.length, 0);
});
test('saved ownership of a smaller fixing quantity does not remove the new requirement', () => {
  const item = { ...generateShoppingItems('p', calc(1, 1)).find(row => row.materialId === SINK_FIXINGS_ID)!, id: 'f', owned: true };
  const view = projectSinkShopping([item], calc(2, 1))[0];
  assert.equal(view.quantity, 4); assert.equal(view.owned, false); assert.equal(view.needsQuantityConfirmation, true);
  assert.equal(projectSinkShopping([item], calc(1, 1))[0].owned, true);
  assert.equal(projectSinkShopping([item], calc(2, 2)).length, 0);
});
