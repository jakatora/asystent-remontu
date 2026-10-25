import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from './pricingApi';
import { applyDoorSelection, makeDoorSelection, parseDoorSelection } from './doorSelection';
import { buildRenovationBasket } from './renovationBasket';
import type { Project, ShoppingItem } from '@/types/domain';

const calc = () => calculatorEngine.calculate(getJobById('interior-doors')!, { doorWidth: 90, doorHeight: 210, wallThickness: 10 });
const credis = 'mat-door-leaf-erkado-credis-80-glazed' as const;
test('an explicit door leaf splits the real calculator set without hiding the missing complete frame or the other requirements', () => {
  const result = calc(), original = structuredClone(result), base = toPricingStageInput(result);
  assert.equal(base.materials.length, 3); assert.ok(base.materials.some(line => line.material.id === 'door-set'));
  const selected = toPricingStageInput(result, 'economy', makeDoorSelection(result, credis, false));
  assert.equal(selected.materials.length, 5); assert.ok(!selected.materials.some(line => line.material.id === 'door-set'));
  const leaf = selected.materials.find(line => line.material.id === 'door-set-leaf')!;
  assert.equal(leaf.material.ean, '5900378219590'); assert.equal(leaf.quantity, 1); assert.equal(leaf.material.unit, 'szt');
  const frame = selected.materials.find(line => line.material.id === 'door-set-frame')!;
  assert.equal(frame.material.category, 'door-frame-set'); assert.equal(frame.material.ean, undefined); assert.match(frame.material.name, /Kompletna/);
  assert.ok(selected.materials.some(line => line.material.id === 'door-handle' && !line.material.ean));
  for (const id of ['mounting-foam', 'door-threshold']) assert.deepEqual(selected.materials.find(line => line.material.id === id), base.materials.find(line => line.material.id === id));
  assert.deepEqual(result, original);
});
test('owned parts are removed only by explicit choices; an unchosen leaf remains an unresolved requirement', () => {
  const result = calc(), selection = makeDoorSelection(result, null, true);
  const pending = toPricingStageInput(result, 'standard', selection);
  assert.ok(pending.materials.some(line => line.material.id === 'door-set-leaf' && !line.material.ean));
  assert.ok(!pending.materials.some(line => line.material.id === 'door-set-frame'));
  assert.equal(toPricingStageInput(result, 'standard', makeDoorSelection(result, 'owned', true)).materials.length, 3);
  assert.equal(toPricingStageInput(result, 'standard', makeDoorSelection(result, 'owned', true, true)).materials.length, 2);
  assert.equal(toPricingStageInput(result, 'standard', makeDoorSelection(result, 'owned', false)).materials.length, 4);
});
test('corrupt or foreign saved choices and changed opening measurements cannot silently enter the quote', () => {
  const result = calc(), value = makeDoorSelection(result, credis, false), raw = JSON.stringify(value);
  assert.deepEqual(parseDoorSelection(raw, result), value);
  const legacy = JSON.parse(raw); delete legacy.handleOwned;
  assert.equal(parseDoorSelection(JSON.stringify(legacy), result)?.handleOwned, false);
  for (const patch of [{ version: 2 }, { leaf: 'mat-door-frame-perfectdoor-reg-80-100' }, { frameOwned: 'true' }, { handleOwned: 'true' }, { measurements: '' }]) assert.equal(parseDoorSelection(JSON.stringify({ ...value, ...patch }), result), null);
  assert.equal(parseDoorSelection('{', result), null); assert.equal(parseDoorSelection(' '.repeat(8001), result), null);
  const changed = { ...result, measurements: { ...result.measurements, doorWidth: 100 } };
  assert.equal(parseDoorSelection(raw, changed), null);
  assert.ok(toPricingStageInput(changed, 'standard', value).materials.some(line => line.material.id === 'door-set'));
  const duplicate = toPricingStageInput(result); assert.equal(applyDoorSelection({ ...duplicate, materials: [...duplicate.materials, duplicate.materials[0]] }, result, value).materials.length, 4);
});
test('the renovation basket retains each project door choice and whole-set ownership does not leak to another opening', () => {
  const result = calc();
  const project = (id: string): Project => ({ id, name: id, jobId: result.jobId, jobName: 'Drzwi', categoryId: 'doors', measurements: result.measurements, calculationResult: result, status: 'planning', createdAt: '', updatedAt: '' });
  const owned = { id: 'owned', projectId: 'a', materialId: 'door-set', itemType: 'material', owned: true, purchased: false } as ShoppingItem;
  const choices = { a: makeDoorSelection(result, credis, false), b: makeDoorSelection(result, credis, true) };
  const basket = buildRenovationBasket([project('a'), project('b')], ['a', 'b'], 'better', { a: [owned] }, choices);
  assert.equal(basket.stages[0].materials.length, 3); assert.equal(basket.stages[1].materials.length, 4);
  assert.equal(basket.stages[1].materials.find(line => line.material.ean === '5900378219590')?.quantity, 1);
  const conflicting = { ...owned, id: 'not-owned', owned: false };
  const retained = buildRenovationBasket([project('a')], ['a'], 'standard', { a: [owned, conflicting] }, choices);
  assert.equal(retained.stages[0].materials.length, 5);
});
