import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRenovationBasket, parseBasketSelection } from './renovationBasket';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import type { Project, ShoppingItem } from '@/types/domain';

function project(id: string, area = 10): Project {
  const calc = calculatorEngine.calculate(getJobById('paint-walls')!, { wallArea: area, coats: 2, coveragePerLiter: 10, tapeRolls: 1, protectiveFilmPacks: 1 });
  return { id, name: id, jobId: 'paint-walls', jobName: 'Malowanie', categoryId: 'paint', measurements: calc.measurements, calculationResult: calc, status: 'planning', createdAt: '', updatedAt: '' };
}
const item = (projectId: string, materialId: string, owned = false, purchased = false) => ({ id: materialId, projectId, materialId, name: materialId, owned, purchased, itemType: 'material' }) as ShoppingItem;
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
  const missing = { ...project('empty'), calculationResult: undefined };
  assert.equal(buildRenovationBasket([missing], ['empty'], 'standard').missingCalculations, 1);
});
