import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRenovationBasket, MAX_BASKET_PROJECTS, measuredBasketProjectIds, parseBasketSelection } from './renovationBasket';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import type { Project, ShoppingItem } from '@/types/domain';

function project(id: string, area = 10): Project {
  const calc = calculatorEngine.calculate(getJobById('paint-walls')!, { wallArea: area, coats: 2, coveragePerLiter: 10, tapeRolls: 1, protectiveFilmPacks: 1 });
  return { id, name: id, jobId: 'paint-walls', jobName: 'Malowanie', categoryId: 'paint', measurements: calc.measurements, calculationResult: calc, status: 'planning', createdAt: '', updatedAt: '' };
}
const item = (projectId: string, materialId: string, owned = false, purchased = false) => ({ id: materialId, projectId, materialId, name: materialId, owned, purchased, itemType: 'material' }) as ShoppingItem;
test('bulk selection includes measured works only and respects the quote limit', () => {
  const ready = Array.from({ length: MAX_BASKET_PROJECTS + 2 }, (_, index) => project(`ready-${index}`));
  const pending = { ...project('pending'), calculationResult: undefined };
  const ids = measuredBasketProjectIds([pending, ...ready]);
  assert.equal(ids.length, MAX_BASKET_PROJECTS);
  assert.equal(ids[0], 'ready-0');
  assert.equal(ids.at(-1), `ready-${MAX_BASKET_PROJECTS - 1}`);
  assert.ok(!ids.includes('pending'));
});
test('explicit project selection is deduplicated; unrelated and deleted projects cannot enter the basket', () => {
  const selected = parseBasketSelection(JSON.stringify({ version: 1, projectIds: ['a', 'a', 4, '', 'deleted'] }));
  assert.deepEqual(selected, ['a', 'deleted']);
  const basket = buildRenovationBasket([project('a'), project('b')], selected, 'standard');
  assert.equal(basket.stages.length, 1); assert.equal(basket.includedProjects[0].id, 'a');
  assert.deepEqual(parseBasketSelection('{'), []);
  assert.deepEqual(parseBasketSelection(JSON.stringify({ version: 2, projectIds: ['a'] })), []);
});
test('two rooms keep their raw demand for one server-side package rounding', () => {
  const projects = [project('a'), project('b')];
  const basket = buildRenovationBasket(projects, ['a', 'b'], 'standard');
  assert.equal(basket.stages.length, 2);
  const paint = basket.stages.map(stage => stage.materials.find(line => line.material.id === 'paint')!);
  assert.ok(paint.every(line => line.quantity > 0 && line.quantity < 5));
  assert.ok(paint.reduce((sum, line) => sum + line.quantity, 0) <= 5);
  assert.equal(projects[0].calculationResult!.materials.length, 4);
});
test('Owned/Purchased exclusion is scoped to the selected work; ambiguous duplicates stay required', () => {
  const basket = buildRenovationBasket([project('a'), project('b')], ['a', 'b'], 'standard', {
    a: [item('a', 'paint', true), item('a', 'primer-paint', false, true), item('a', 'manual')],
    b: [item('b', 'paint', true), item('b', 'paint')],
  });
  assert.ok(!basket.stages[0].materials.some(line => ['paint', 'primer-paint'].includes(line.material.id)));
  assert.ok(basket.stages[1].materials.some(line => line.material.id === 'paint'));
  assert.equal(basket.excludedMaterials, 2); assert.equal(basket.manualItems, 1);
  assert.ok(basket.stages[0].materials.some(line => line.material.id === 'manual:manual' && line.material.unit === 'pozycja'));
  const missing = { ...project('empty'), calculationResult: undefined };
  assert.equal(buildRenovationBasket([missing], ['empty'], 'standard').missingCalculations, 1);
});

test('manually added Shopping requirements enter the whole basket with actual chosen quantities, never user prices or another project data', () => {
  const manual: ShoppingItem = { ...item('a', 'custom-extra'), id: 'manual-1', name: 'Dodatkowy klej', quantity: 10, customQuantity: 12.5, unit: 'kg', customPrice: 777, estimatedPrice: 888 };
  const owned = { ...manual, id: 'owned', materialId: 'custom-owned', owned: true };
  const tool = { ...manual, id: 'tool', materialId: 'custom-tool', itemType: 'tool' as const };
  const foreign = { ...manual, id: 'foreign', projectId: 'b' };
  const projects = [project('a')], items = { a: [manual, owned, tool, foreign] };
  const before = JSON.stringify({ projects, items }), result = buildRenovationBasket(projects, ['a'], 'standard', items);
  assert.equal(result.manualItems, 1);
  const line = result.stages[0].materials.find(line => line.material.id === 'manual:manual-1');
  assert.deepEqual(line, { material: { id: 'manual:manual-1', name: 'Dodatkowy klej', unit: 'kg', category: null }, quantity: 12.5 });
  assert.equal(JSON.stringify({ projects, items }), before);
  assert.ok(!result.stages[0].materials.some(line => /manual:(owned|tool|foreign)/.test(line.material.id)));
});
