import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import type { Project, ShoppingItem } from '@/types/domain';
import { applyFoilChoices, FOIL_PRODUCTS, foilReference, foilRequirements, parseFoilChoices } from './foilChoice';
import { applyLaminateChoices } from './laminateChoice';
import { buildRenovationBasket } from './renovationBasket';
import type { PricingStageInput } from './pricingApi';

const diall = FOIL_PRODUCTS.find(ref => ref.id === 'mat-vapor-foil-diall-pe-20m2')!;
const conpar = FOIL_PRODUCTS.find(ref => ref.id === 'mat-vapor-foil-conkret-conpar-100m2')!;
const choice = { from: diall.id, to: conpar.id };
const stages = (): PricingStageInput[] => [10.5, 14.5].map((quantity, index) => ({ jobId: 'room-' + index, measurements: { floorArea: quantity / 1.1 }, materials: [{ material: { id: 'vapor-barrier', name: diall.productLabel, category: 'vapor-barrier', unit: 'm²', ean: '5059340141428' }, quantity, packs: 77 }] }));

test('foil choices bind exact category, barcode and m² demand without accepting paint, flooring, a breathable membrane or a roll count', () => {
  assert.equal(FOIL_PRODUCTS.length, 2); assert.equal(conpar.packageSize, 100); assert.equal(diall.packageSize, 20);
  const material = stages()[0].materials[0].material;
  assert.equal(foilReference(material)?.id, diall.id);
  for (const row of [{ ...material, category: 'laminate' }, { ...material, unit: 'rolka' }, { ...material, unit: 'szt' },
    { ...material, gtin: '5902096430103' }, { ...material, ean: 'unknown' },
    { ...material, ean: undefined, name: 'Membrana dachowa paroprzepuszczalna' }]) assert.equal(foilReference(row), null);
  assert.deepEqual(foilRequirements(stages()).map(ref => ref.id), [diall.id]);
});

test('a foil choice preserves every room and raw quantity while changing the exact product and removing stale pack counts', () => {
  const original = stages(), before = JSON.stringify(original);
  const selected = applyFoilChoices(original, [choice]);
  assert.equal(JSON.stringify(original), before);
  assert.deepEqual(selected.map(stage => stage.measurements), original.map(stage => stage.measurements));
  assert.deepEqual(selected.map(stage => stage.materials[0].quantity), [10.5, 14.5]);
  for (const stage of selected) {
    assert.equal(stage.materials[0].material.ean, '5902096430103');
    assert.equal(stage.materials[0].material.name, conpar.productLabel);
    assert.equal(stage.materials[0].material.id, 'vapor-barrier');
    assert.equal(stage.materials[0].packs, undefined);
    assert.deepEqual(Object.keys(stage.materials[0]).sort(), ['material', 'quantity']);
  }
  assert.deepEqual(applyFoilChoices(original, []), original);
});

test('saved foil choices reject an unknown product, wrong group, corrupt or duplicate requirement instead of reverting to another SKU', () => {
  const saved = (choices: unknown, version = 1) => JSON.stringify({ version, choices });
  assert.deepEqual(parseFoilChoices(null), []); assert.deepEqual(parseFoilChoices(saved([choice])), [choice]);
  for (const raw of ['{', saved([choice], 2), saved({}), saved([choice, choice]), saved([{ from: diall.id, to: diall.id }]),
    saved([{ ...choice, to: 'mat-laminate-classen-niasa-ac5-1973' }]), saved([{ ...choice, from: 'unknown' }]), 'x'.repeat(8001)]) assert.throws(() => parseFoilChoices(raw));
});

test('a project foil choice reaches the renovation basket after ownership filtering and coexists with an explicit panel choice', () => {
  const calc = calculatorEngine.calculate(getJobById('laminate-flooring')!, { floorArea: 10, panelPackCoverageM2: 2.22 });
  const project: Project = { id: 'a', name: 'Podłoga', jobId: calc.jobId, jobName: 'Panele', categoryId: 'laminate', measurements: calc.measurements, calculationResult: calc, status: 'planning', createdAt: '', updatedAt: '' };
  const before = JSON.stringify(project);
  const panels = { from: 'mat-laminate-kronospan-toledo-ac4-222', to: 'mat-laminate-classen-niasa-ac5-1973' };
  const basket = buildRenovationBasket([project], ['a'], 'standard', {}, {}, { a: [panels] }, { a: [choice] });
  assert.equal(basket.stages[0].materials.find(line => line.material.id === 'vapor-barrier')?.material.ean, '5902096430103');
  assert.equal(basket.stages[0].materials.find(line => line.material.id === 'laminate-panels')?.material.ean, '4003992571974');
  const owned = { id: 'one', projectId: 'a', materialId: 'vapor-barrier', name: 'Folia', quantity: 11, unit: 'm²', itemType: 'material', owned: true, purchased: false } as ShoppingItem;
  const filtered = buildRenovationBasket([project], ['a'], 'standard', { a: [owned] }, {}, { a: [panels] }, { a: [choice] });
  assert.ok(!filtered.stages[0].materials.some(line => line.material.id === 'vapor-barrier'));
  assert.equal(filtered.excludedMaterials, 1); assert.equal(JSON.stringify(project), before);
  const together = applyFoilChoices(applyLaminateChoices(stages(), [panels]), [choice]);
  assert.equal(together[0].materials[0].material.ean, '5902096430103');
});
