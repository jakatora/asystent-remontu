import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import type { Project, ShoppingItem } from '@/types/domain';
import { toPricingStageInput } from './pricingApi';
import { applyWashbasinChoices, parseWashbasinChoices, washbasinReference, washbasinRequirements } from './washbasinChoice';
import { buildRenovationBasket } from './renovationBasket';

const old = 'mat-washbasin-cersanit-facile-50', current = 'mat-washbasin-cersanit-atlantic-new-50';
const choice = { from: old, to: current };
const calc = () => calculatorEngine.calculate(getJobById('sink-installation')!, { sinkCount: 2 });
const saved = (choices: unknown[]) => JSON.stringify({ version: 1, choices });

test('Atlantic New has its exact barcode and photograph and never aliases the historical Facile basin', () => {
  const ref = MATERIAL_PRICES.find(row => row.id === current)!;
  assert.equal(ref.packageSize, 1); assert.equal(ref.packageUnit, 'szt');
  assert.equal(PRODUCT_PHOTOS.find(row => row.ids.includes(current))?.ean, '5901771226987');
  assert.equal(PRODUCT_PHOTOS.find(row => row.ids.includes(old))?.ean, '5907720650025');
  assert.match(ref.notes!, /Ovida K36-031/); assert.match(ref.notes!, /bez baterii, syfonu i mocowań/);
  assert.equal(new URL(ref.sourceUrl!).pathname.split('/').at(-1), '5901771226987_CAPL.prd');
});

test('an explicit basin choice preserves count, unrelated plumbing, source IDs and the saved calculation', () => {
  const result = calc(), input = [toPricingStageInput(result)], before = JSON.stringify({ result, input });
  assert.equal(washbasinRequirements(input)[0].id, old);
  const output = applyWashbasinChoices(input, [choice]);
  const basin = output[0].materials.find(row => row.material.id === 'washbasin')!;
  assert.equal(basin.material.ean, '5901771226987'); assert.equal(basin.quantity, 2); assert.equal(basin.packs, undefined);
  assert.deepEqual(output[0].measurements, { sinkCount: 2 });
  assert.deepEqual(output[0].materials.filter(row => row !== basin), input[0].materials.filter(row => row.material.id !== 'washbasin'));
  assert.equal(JSON.stringify({ result, input }), before);
  assert.deepEqual(applyWashbasinChoices(input, []), input);
});

test('basin choices reject another category, corrupt preferences and conflicting identities instead of silently quoting a different model', () => {
  assert.deepEqual(parseWashbasinChoices(saved([choice])), [choice]);
  for (const raw of [saved([choice, choice]), saved([{ from: old, to: old }]), saved([{ from: old, to: 'mat-door-leaf-opp-archi-full-80-left' }]), saved([{ from: 'unknown', to: current }]), '{}', 'x'.repeat(8001)]) assert.throws(() => parseWashbasinChoices(raw));
  const material = { id: 'w', name: MATERIAL_PRICES.find(row => row.id === old)!.productLabel, category: 'washbasin', unit: 'szt' };
  assert.equal(washbasinReference({ ...material, unit: 'm2' }), null);
  assert.equal(washbasinReference({ ...material, category: 'tile' }), null);
  assert.equal(washbasinReference({ ...material, ean: '5907720650025', gtin: '5901771226987' }), null);
});

test('a project basin choice reaches the common basket without changing another project or restoring an owned basin', () => {
  const result = calc();
  const project = (id: string): Project => ({ id, name: id, jobId: result.jobId, jobName: 'Umywalka', categoryId: 'plumbing', measurements: result.measurements, calculationResult: result, status: 'planning', createdAt: '', updatedAt: '' });
  const projects = [project('a'), project('b')], before = JSON.stringify(projects);
  const basket = buildRenovationBasket(projects, ['a', 'b'], 'standard', {}, {}, {}, {}, { a: [choice] });
  assert.equal(basket.stages[0].materials.find(row => row.material.id === 'washbasin')?.material.ean, '5901771226987');
  assert.equal(basket.stages[1].materials.find(row => row.material.id === 'washbasin')?.material.ean, null);
  const owned = { id: 'owned', projectId: 'a', materialId: 'washbasin', name: 'Moja umywalka', quantity: 2, unit: 'szt.', itemType: 'material', owned: true, purchased: false } as ShoppingItem;
  const filtered = buildRenovationBasket(projects, ['a', 'b'], 'standard', { a: [owned] }, {}, {}, {}, { a: [choice] });
  assert.ok(!filtered.stages[0].materials.some(row => row.material.id === 'washbasin')); assert.equal(filtered.excludedMaterials, 1);
  assert.equal(JSON.stringify(projects), before);
});
