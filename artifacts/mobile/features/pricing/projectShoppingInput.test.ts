import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { projectSinkShopping } from '@/features/calculator/sink';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from './pricingApi';
import { buildRenovationBasket } from './renovationBasket';
import { applyProjectShopping, shoppingQuantityAction } from './projectShoppingInput';
import { hasShoppingPrice, getEffectivePrice, buildShareText } from '@/components/project/helpers';
import type { Project, ShoppingItem } from '@/types/domain';

const calc = calculatorEngine.calculate(getJobById('sink-installation')!, { sinkCount: 2, sinkExtraHoses: 0 });
const item = (change: Partial<ShoppingItem> = {}): ShoppingItem => ({ id: 'v', projectId: 'a', materialId: 'angle-valve', name: 'Zawór', quantity: 4, unit: 'szt.', estimatedPrice: 140, owned: false, purchased: false, itemType: 'material', tier: 'standard', createdAt: '', ...change });
const project: Project = { id: 'a', jobId: calc.jobId, jobName: 'Montaż', categoryId: 'plumbing', name: 'Mój projekt', calculationResult: calc, measurements: calc.measurements, status: 'planning', createdAt: '', updatedAt: '' };

test('project quotes and whole renovation share the exact pending-material input without mutating shopping or calculations', () => {
  const items = [item({ owned: true }), item({ id: 'm', materialId: 'manual', name: 'Mój dodatkowy produkt', quantity: 2, unit: 'szt', customPrice: 50 })];
  const before = JSON.stringify({ calc, items });
  const pending = applyProjectShopping(toPricingStageInput(calc), calc, 'a', items);
  assert.equal(pending.excludedMaterials, 1); assert.equal(pending.manualItems, 1);
  assert.ok(!pending.stage.materials.some(row => row.material.id === 'angle-valve'));
  assert.ok(pending.stage.materials.some(row => row.material.id === 'manual:m'));
  assert.deepEqual(buildRenovationBasket([project], ['a'], 'standard', { a: items }).stages[0], pending.stage);
  assert.equal(JSON.stringify({ calc, items }), before);
});

test('purchased items are excluded while another project, conflicting duplicates and insufficient quantity cannot hide a requirement', () => {
  assert.equal(applyProjectShopping(toPricingStageInput(calc), calc, 'a', [item({ purchased: true })]).excludedMaterials, 1);
  for (const items of [[item({ owned: true, projectId: 'b' })], [item({ owned: true }), item({ id: 'other' })], [item({ owned: true, quantity: 2 })], [item({ owned: true, needsQuantityConfirmation: true })]]) {
    assert.ok(applyProjectShopping(toPricingStageInput(calc), calc, 'a', items).stage.materials.some(row => row.material.id === 'angle-valve'));
  }
});

test('quantity confirmation applies to sink as well as EPS and persists the newly required count before ownership', () => {
  const old = projectSinkShopping([item({ quantity: 2 })], calc)[0];
  assert.deepEqual(shoppingQuantityAction(calc.jobId, old), { allowed: true, confirmQuantity: 4 });
  assert.deepEqual(shoppingQuantityAction(calc.jobId, { ...old, customQuantity: 2 }), { allowed: false });
  assert.deepEqual(shoppingQuantityAction(calc.jobId, { ...old, quantityKnown: false }), { allowed: false });
  assert.deepEqual(shoppingQuantityAction('eps-insulation-bso', old), { allowed: true, confirmQuantity: 4 });
  assert.deepEqual(shoppingQuantityAction('paint-walls', old), { allowed: true });
});

test('a direct caller with historical JSON still cannot cover four current valves by owning the old two', () => {
  const old = JSON.parse(JSON.stringify(calc)); delete old.quantityModel; delete old.measurements.sinkExtraHoses;
  const valves = old.materials.find((row: {material:{id:string}}) => row.material.id === 'angle-valve');
  valves.quantity = 2; valves.rawQuantity = 2;
  const before = JSON.stringify(old);
  const pending = applyProjectShopping(toPricingStageInput(old), old, 'a', [item({ owned:true, quantity:2 })]);
  assert.equal(pending.excludedMaterials, 0);
  assert.equal(pending.stage.materials.find(row=>row.material.id==='angle-valve')?.quantity, 4);
  assert.equal(JSON.stringify(old), before);
});

test('zero placeholder prices are unknown while a valid explicit custom zero remains a user supplied value', () => {
  const tool = item({ itemType: 'tool', name: 'Moje narzędzie', estimatedPrice: 0 });
  assert.equal(hasShoppingPrice(tool), false); assert.equal(getEffectivePrice(tool), 0);
  assert.equal(hasShoppingPrice({ ...tool, customPrice: 0 }), true);
  for (const customPrice of [NaN, Infinity, -1]) assert.equal(hasShoppingPrice({ ...tool, customPrice }), false);
  const text = buildShareText('Projekt', [], [tool], 0, 0, 0, key => key);
  assert.match(text, /upgrade.shopping.referenceCosts/); assert.match(text, /upgrade.partial.title/); assert.match(text, /Moje narzędzie — —/);
  assert.ok(!text.includes('Moje narzędzie — 0'));
});
