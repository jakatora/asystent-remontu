import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { SINK_QUANTITY_MODEL, sinkConnectionQuantity, upgradeSinkCalculation, projectSinkShopping } from './sink';
import { upgradeProject } from './upgrades';
import { getRequiredQuantity } from './requirements';
import { generateShoppingItems } from './shopping';
import { getJobById } from '@/features/content/registry';
import { parseMeasurements } from '@/shared/lib/measurements';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { computePricedBudget } from '@/features/pricing/engine';
import { buildRenovationBasket } from '@/features/pricing/renovationBasket';
import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';

const job = getJobById('sink-installation')!;
const calc = (sinkCount = 1, sinkExtraHoses = 0) => calculatorEngine.calculate(job, { sinkCount, sinkExtraHoses });
const line = (result: CalculationResult, id: string) => result.materials.find(row => row.material.id === id)!;
const project = (result: CalculationResult, id = 'a'): Project => ({ id, name: id, jobId: job.id, jobName: job.name, categoryId: job.categoryId, measurements: result.measurements, calculationResult: result, status: 'planning', createdAt: '', updatedAt: '' });
const valveItem = (quantity: number, changes: Partial<ShoppingItem> = {}): ShoppingItem => ({ id: 'v', projectId: 'a', materialId: 'angle-valve', name: 'Mój zawór', quantity, unit: 'szt.', estimatedPrice: 35, owned: true, purchased: false, itemType: 'material', tier: 'standard', createdAt: '', ...changes });
const historical = () => {
  const old = JSON.parse(JSON.stringify(calc(2))) as CalculationResult;
  const data = old as any; delete data.quantityModel; delete data.measurements.sinkExtraHoses;
  for (const id of ['angle-valve', 'flex-hose']) Object.assign(line(old, id), { quantity: 2, rawQuantity: 2, cost: line(old, id).material.pricePerUnit * 2 });
  return old;
};

test('sink connections use two valves per basin and do not bill included mixer hoses a second time', () => {
  for (const count of [1, 2, 10]) {
    const result = calc(count);
    assert.equal(result.quantityModel, SINK_QUANTITY_MODEL);
    assert.equal(line(result, 'angle-valve').quantity, count * 2);
    assert.equal(line(result, 'flex-hose').quantity, 0);
    const shopping = generateShoppingItems('a', result);
    assert.equal(shopping.find(row => row.materialId === 'angle-valve')?.quantity, count * 2);
    assert.ok(!shopping.some(row => row.materialId === 'flex-hose'));
    for (const tier of ['economy', 'standard', 'better'] as const) {
      const stage = toPricingStageInput(result, tier);
      assert.equal(stage.materials.find(row => row.material.id === 'angle-valve')?.quantity, count * 2);
      assert.ok(!stage.materials.some(row => row.material.id === 'flex-hose'));
      assert.match(stage.materials.find(row => row.material.id === 'basin-trap')!.material.name, /WHB1-32/);
      assert.equal(stage.materials.find(row => row.material.id === 'sanitary-silicone')?.quantity, count * 280);
      assert.equal(stage.materials.find(row => row.material.id === 'sanitary-silicone')?.material.unit, 'ml');
    }
  }
});

test('explicit extra hoses are a total piece count across the work, not another pair per basin', () => {
  const parsed = parseMeasurements(job, { sinkCount: '2', sinkExtraHoses: '3' });
  assert.equal(parsed.errors.length, 0);
  const result = calculatorEngine.calculate(job, parsed.values);
  assert.equal(line(result, 'flex-hose').quantity, 3);
  for (const tier of ['economy', 'standard', 'better'] as const) {
    assert.ok(getMaterialsForJob(job.id, tier).some(row => row.id === 'mat-hose-braided-invena-3-8-30'));
    assert.equal(toPricingStageInput(result, tier).materials.find(row => row.material.id === 'flex-hose')?.quantity, 3);
    const budget = computePricedBudget({ job, calc: result, regionCode: 'lodzkie', qualityTier: tier, overrides: [] });
    assert.equal(budget.materialDetails.find(row => row.materialRef.materialType === 'hose')?.quantity, 3);
    assert.equal(budget.materialDetails.find(row => row.materialRef.materialType === 'valve')?.quantity, 4);
  }
  assert.equal(parseMeasurements(job, { sinkCount: '2' }).values.sinkExtraHoses, 0);
  for (const [key, value] of [['sinkCount', '1,5'], ['sinkExtraHoses', '1,5'], ['sinkExtraHoses', '-1'], ['sinkExtraHoses', '21']] as const) {
    assert.ok(parseMeasurements(job, { sinkCount: '2', [key]: value }).errors.some(error => error.id === key));
  }
});

test('old JSON quantities are corrected read-only and missing hose decisions stay unknown after repeated reads', () => {
  const old = historical(), copy = structuredClone(old);
  const upgraded = upgradeSinkCalculation(old)!;
  assert.deepEqual(old, copy);
  assert.equal(line(upgraded, 'angle-valve').quantity, 4);
  assert.equal(getRequiredQuantity(line(old, 'angle-valve'), old), 4);
  assert.equal(line(upgraded, 'flex-hose').quantityKnown, false);
  assert.equal(line(upgradeSinkCalculation(upgraded)!, 'flex-hose').quantityKnown, false);
  const stage = toPricingStageInput(old);
  assert.equal(stage.materials.find(row => row.material.id === 'angle-valve')?.quantity, 4);
  assert.match(stage.materials.find(row => row.material.id === 'flex-hose')!.material.name, /ilość do ustalenia/);
  assert.equal(stage.materials.find(row => row.material.id === 'flex-hose')?.material.unit, 'pozycja');
  assert.equal(line(upgradeProject(project(old)).calculationResult!, 'angle-valve').quantity, 4);
  const paint = calculatorEngine.calculate(getJobById('paint-walls')!, { wallArea: 30 });
  assert.equal(upgradeSinkCalculation(paint), paint);
});

test('saved ownership of an insufficient valve quantity cannot hide the current requirement or another project', () => {
  const result = calc(2), before = JSON.stringify(result);
  const old = valveItem(2, { customPrice: 25, notes: 'Moje dane' });
  const custom = valveItem(99, { id: 'x', materialId: 'manual-x' });
  const raw = [old, custom], original = structuredClone(raw);
  const viewed = projectSinkShopping(raw, result);
  assert.deepEqual(raw, original);
  assert.equal(viewed[0].quantity, 4); assert.equal(viewed[0].owned, false); assert.equal(viewed[0].needsQuantityConfirmation, true);
  assert.equal(viewed[0].customPrice, 25); assert.deepEqual(viewed[1], custom);
  assert.equal(projectSinkShopping([valveItem(4)], result)[0].owned, true);
  const projects = [project(result), project(calc(), 'b')];
  const basket = buildRenovationBasket(projects, ['a', 'b'], 'standard', { a: [old] });
  assert.equal(basket.excludedMaterials, 0);
  assert.equal(basket.stages[0].materials.find(row => row.material.id === 'angle-valve')?.quantity, 4);
  assert.equal(basket.stages[1].materials.find(row => row.material.id === 'angle-valve')?.quantity, 2);
  const covered = buildRenovationBasket(projects, ['a', 'b'], 'standard', { a: [valveItem(4)] });
  assert.equal(covered.excludedMaterials, 1);
  assert.ok(!covered.stages[0].materials.some(row => row.material.id === 'angle-valve'));
  assert.equal(covered.stages[1].materials.find(row => row.material.id === 'angle-valve')?.quantity, 2);
  assert.equal(JSON.stringify(result), before);
});

test('ordinary and detailed sink results share quantities and missing input never becomes a free priced material', () => {
  const result = calc(2, 2), detailed = calculatorEngine.calculateDetailed(job, result.measurements);
  assert.deepEqual(detailed.materials.map(row => [row.quantity, row.quantityKnown, row.cost]), result.materials.map(row => [row.quantity, row.quantityKnown, row.cost]));
  assert.equal(detailed.quantityModel, result.quantityModel); assert.equal(detailed.totalCost, result.totalCost);
  for (const count of [NaN, Infinity, 0, -1, 1.5, 11]) assert.equal(sinkConnectionQuantity('angle-valve', { sinkCount: count }, true), null);
  const unknown = historical();
  const budget = computePricedBudget({ job, calc: unknown, regionCode: 'lodzkie', qualityTier: 'standard', overrides: [] });
  assert.ok(budget.unpricedMaterials?.some(name => name.includes('wężyk')));
  assert.ok(!budget.materialDetails.some(row => row.materialRef.materialType === 'hose'));
  const zero = computePricedBudget({ job, calc: calc(), regionCode: 'lodzkie', qualityTier: 'standard', overrides: [] });
  assert.ok(!zero.materialDetails.some(row => row.materialRef.materialType === 'hose'));
  const hose = valveItem(2, { materialId: 'flex-hose' });
  assert.equal(projectSinkShopping([hose], calc()).length, 0);
  assert.equal(projectSinkShopping([hose], unknown)[0].quantityKnown, false);
});
