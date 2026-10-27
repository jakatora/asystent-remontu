import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import type { Project, ShoppingItem } from '@/types/domain';
import { buildRenovationBasket } from './renovationBasket';
import { LAMINATE_PRODUCTS, applyLaminateChoices, laminateReference, laminateRequirements, parseLaminateChoices } from './laminateChoice';
import type { PricingMaterialInput, PricingStageInput } from './pricingApi';

const toledo = LAMINATE_PRODUCTS.find(ref => ref.id.includes('toledo'))!;
const niasa = LAMINATE_PRODUCTS.find(ref => ref.id.includes('niasa'))!;
const oakland = LAMINATE_PRODUCTS.find(ref => ref.id.includes('oakland'))!;
const ean = (id: string) => PRODUCT_PHOTOS.find(photo => photo.ids.includes(id))!.ean;
const identity = (ref = toledo): PricingMaterialInput => ({ id: 'laminate-panels', name: ref.productLabel, unit: 'm²', category: 'laminate', ean: ean(ref.id) });
const raw = (): PricingStageInput[] => [
  { jobId: 'room-a', measurements: { floorArea: 2 }, materials: [{ material: identity(), quantity: 2.2, packs: 99 }, { material: { id: 'other', name: 'Unknown material', unit: 'szt' }, quantity: 1 }] },
  { jobId: 'room-b', measurements: { floorArea: 1 }, materials: [{ material: identity(), quantity: 1.1 }, { material: identity(niasa), quantity: 0.3 }] },
];

test('laminate identity is exact and rejects another barcode, category, physical unit or ambiguous GTIN', () => {
  assert.equal(laminateReference(identity())?.id, toledo.id);
  assert.equal(laminateReference({ ...identity(), ean: undefined })?.id, toledo.id);
  for (const material of [
    { ...identity(), ean: '5059340809854' }, { ...identity(), gtin: ean(niasa.id) },
    { ...identity(), unit: 'szt' }, { ...identity(), category: 'tile' },
    { ...identity(), ean: undefined, name: 'Panele Toledo' }, { ...identity(), ean: undefined, category: null },
  ]) assert.equal(laminateReference(material), null);
});

test('saved product choices retain exact IDs and reject corrupt, duplicate or unreviewed requirements', () => {
  const choice = { from: toledo.id, to: niasa.id };
  const saved = (choices: unknown, version = 1) => JSON.stringify({ version, choices });
  assert.deepEqual(parseLaminateChoices(null), []);
  assert.deepEqual(parseLaminateChoices(saved([choice])), [choice]);
  for (const value of ['{', saved([choice], 2), saved({}), saved([choice, choice]), saved([{ ...choice, to: 'unknown' }]),
    saved([{ ...choice, from: 'mat-paint-economy-white-10l' }]), saved([{ from: toledo.id, to: toledo.id }]),
    saved([choice, choice, choice, choice]), saved([null]), 'x'.repeat(8001)]) assert.throws(() => parseLaminateChoices(value));
});

test('explicit panel changes preserve raw area, measurement and material IDs without prices or old pack counts', () => {
  const stages = raw(), before = JSON.stringify(stages);
  const chosen = applyLaminateChoices(stages, [{ from: toledo.id, to: niasa.id }]);
  assert.equal(JSON.stringify(stages), before);
  assert.deepEqual(chosen.map(stage => stage.measurements), stages.map(stage => stage.measurements));
  assert.equal(chosen[0].materials[0].quantity, 2.2);
  assert.equal(chosen[1].materials[0].quantity, 1.1);
  assert.equal(chosen[0].materials[0].material.id, 'laminate-panels');
  assert.equal(chosen[0].materials[0].material.ean, ean(niasa.id));
  assert.equal(chosen[0].materials[0].material.name, niasa.productLabel);
  assert.equal(chosen[0].materials[0].packs, undefined);
  assert.deepEqual(Object.keys(chosen[0].materials[0]).sort(), ['material', 'quantity']);
  assert.equal(chosen[0].materials[1], stages[0].materials[1]);
  assert.deepEqual(applyLaminateChoices(stages, []), stages);
  assert.deepEqual(laminateRequirements(stages).map(ref => ref.id), [toledo.id, niasa.id]);
});

test('choices apply once to the original identities and never cascade between models', () => {
  const stages = raw();
  const chosen = applyLaminateChoices(stages, [{ from: toledo.id, to: niasa.id }, { from: niasa.id, to: oakland.id }]);
  assert.equal(chosen[1].materials[0].material.ean, ean(niasa.id));
  assert.equal(chosen[1].materials[1].material.ean, ean(oakland.id));
  assert.throws(() => applyLaminateChoices(stages, [{ from: toledo.id, to: 'unknown' }]));
});

test('a restored GTIN is replaced with the chosen EAN and zero demand is never increased', () => {
  const stages: PricingStageInput[] = [{ jobId: 'one', materials: [{ material: { ...identity(), ean: undefined, gtin: ean(toledo.id) }, quantity: 0 }] }];
  const chosen = applyLaminateChoices(stages, [{ from: toledo.id, to: niasa.id }]);
  assert.equal(chosen[0].materials[0].material.gtin, undefined);
  assert.equal(chosen[0].materials[0].material.ean, ean(niasa.id));
  assert.equal(chosen[0].materials[0].quantity, 0);
  assert.deepEqual(laminateRequirements(stages), []);
});

test('project choices reach the common basket before ownership filtering, without changing other projects or the original calculations', () => {
  const make = (id: string): Project => {
    const calc = calculatorEngine.calculate(getJobById('laminate-flooring')!, { floorArea: 10, panelPackCoverageM2: 2.22 });
    return { id, name: id, jobId: calc.jobId, jobName: 'Podłoga', categoryId: 'laminate', measurements: calc.measurements, calculationResult: calc, status: 'planning', createdAt: '', updatedAt: '' };
  };
  const projects = [make('a'), make('b')], before = JSON.stringify(projects);
  const choices = { a: [{ from: toledo.id, to: niasa.id }] };
  const basket = buildRenovationBasket(projects, ['a', 'b'], 'standard', {}, {}, choices);
  assert.equal(basket.stages[0].materials.find(line => line.material.id === 'laminate-panels')?.material.ean, ean(niasa.id));
  assert.equal(basket.stages[1].materials.find(line => line.material.id === 'laminate-panels')?.material.name, toledo.productLabel);
  const owned = { id: 'one', projectId: 'a', materialId: 'laminate-panels', name: 'Panele', quantity: 11, unit: 'm²', itemType: 'material', owned: true, purchased: false } as ShoppingItem;
  const filtered = buildRenovationBasket(projects, ['a', 'b'], 'standard', { a: [owned] }, {}, choices);
  assert.equal(filtered.stages[0].materials.find(line => line.material.id === 'laminate-panels')?.material.ean, ean(niasa.id));
  assert.equal(filtered.excludedMaterials, 0);
  assert.equal(JSON.stringify(projects), before);
});
