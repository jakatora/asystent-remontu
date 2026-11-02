import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '../calculator/engine';
import { getJobById } from '../content/registry';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { toPricingStageInput, type PricingStageInput } from './pricingApi';
import { applyCeilingPaintChoices, ceilingPaintRequirements, parseCeilingPaintChoices, CEILING_PAINT_PRODUCTS, CEILING_PAINT_TARGET } from './ceilingPaintChoice';
import { buildRenovationBasket } from './renovationBasket';
import { reviewSelectedShopping } from './selectedShopping';
import { generateShoppingItems } from '../calculator/shopping';
import type { Project } from '@/types/domain';

const calc = () => calculatorEngine.calculate(getJobById('paint-ceiling')!, { ceilingArea: 20, coats: 2, coveragePerLiter: 10, ceilingPrimerChoice: 1, primerConsumption: 0.15 });
const original = () => toPricingStageInput(calc(), 'standard');
const choice = { from: 'mat-paint-standard-white-10l', to: CEILING_PAINT_TARGET };
test('both missing ceiling variants can explicitly select the exact EKO Plus SKU while retaining raw litres, measurements and primer', () => {
  for (const tier of ['economy', 'standard'] as const) {
    const stage = toPricingStageInput(calc(), tier), before = JSON.stringify(stage), from = ceilingPaintRequirements([stage])[0];
    const selected = applyCeilingPaintChoices([stage], [{ from: from.id, to: CEILING_PAINT_TARGET }])[0];
    assert.equal(JSON.stringify(stage), before);
    assert.equal(selected.measurements, stage.measurements);
    const paint = selected.materials.find(line => line.material.id === 'ceiling-paint')!;
    assert.equal(paint.quantity, 4.2); assert.equal(paint.material.ean, '5903973205982'); assert.equal(paint.material.unit, 'l');
    assert.equal(paint.material.name, CEILING_PAINT_PRODUCTS.find(ref => ref.id === CEILING_PAINT_TARGET)!.productLabel);
    assert.deepEqual(selected.materials.filter(line => line.material.id !== 'ceiling-paint'), stage.materials.filter(line => line.material.id !== 'ceiling-paint'));
    assert.ok(!('packs' in paint));
    assert.deepEqual(applyCeilingPaintChoices([stage], []), [stage]);
  }
  assert.equal(ceilingPaintRequirements([toPricingStageInput(calc(), 'better')]).length, 0);
  assert.ok(PRODUCT_PHOTOS.find(photo => photo.ids.includes(CEILING_PAINT_TARGET) && photo.ean === '5903973205982' && photo.imageUrl.startsWith('https://')));
});
test('a ceiling choice cannot replace wall paint, manual extras, unknown quantities or a conflicting barcode', () => {
  const stage = original(), line = stage.materials[0];
  const unrelated: PricingStageInput[] = [
    { ...stage, jobId: 'paint-walls' },
    { ...stage, materials: [{ ...line, material: { ...line.material, id: 'manual-paint' } }] },
    { ...stage, materials: [{ ...line, material: { ...line.material, unit: 'pozycja' } }] },
    { ...stage, materials: [{ ...line, material: { ...line.material, ean: '5059340271620', gtin: '5903973205982' } }] },
  ];
  assert.deepEqual(applyCeilingPaintChoices(unrelated, [choice]), unrelated);
  assert.deepEqual(ceilingPaintRequirements(unrelated), []);
  assert.deepEqual(parseCeilingPaintChoices(null), []);
  for (const choices of [[{ from: choice.to, to: choice.from }], [{ ...choice, to: choice.from }], [choice, choice], [{ ...choice, from: 'missing' }]]) assert.throws(() => parseCeilingPaintChoices(JSON.stringify({ version: 1, choices })));
});
test('a saved project paint survives the shared basket; a shared choice does not mutate project selections', () => {
  const project = { id: 'ceiling', name: 'Sufit', jobId: 'paint-ceiling', calculationResult: calc() } as Project;
  const choices = { ceiling: [choice] }, before = JSON.stringify(project);
  const selected = buildRenovationBasket([project], ['ceiling'], 'standard', {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, choices);
  assert.equal(selected.stages[0].materials[0].material.ean, '5903973205982');
  assert.equal(selected.stages[0].materials[0].quantity, 4.2);
  assert.equal(JSON.stringify(project), before); assert.deepEqual(choices, { ceiling: [choice] });
  const unchanged = buildRenovationBasket([project], ['ceiling'], 'standard');
  const common = applyCeilingPaintChoices(unchanged.selectionStages, [choice]);
  assert.equal(common[0].materials[0].material.ean, '5903973205982');
  assert.notEqual(unchanged.selectionStages[0].materials[0].material.ean, '5903973205982');
});
test('owned original paint cannot pay for a newly selected different paint; restoring the original restores its stock declaration', () => {
  const stage = original(), selected = applyCeilingPaintChoices([stage], [choice])[0];
  const items = generateShoppingItems('ceiling', calc()).map((item, i) => ({ ...item, id: 'item-' + i, owned: true }));
  const reviewed = reviewSelectedShopping(items, stage, selected);
  const paint = reviewed.find(item => item.materialId === 'ceiling-paint')!;
  assert.equal(paint.owned, false); assert.equal(paint.selectedProductChanged, true);
  assert.equal(reviewSelectedShopping(reviewed, stage, stage).find(item => item.materialId === 'ceiling-paint')!.owned, true);
});
