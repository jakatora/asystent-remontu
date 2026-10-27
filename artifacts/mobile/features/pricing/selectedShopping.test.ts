import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { generateShoppingItems } from '@/features/calculator/shopping';
import type { Project, ShoppingItem } from '@/types/domain';
import { applyLaminateChoices, LAMINATE_PRODUCTS } from './laminateChoice';
import { applyTileChoices } from './tileChoice';
import { applyProjectShopping, applyShoppingContexts, shoppingQuantityAction, withManualShopping } from './projectShoppingInput';
import { toPricingStageInput } from './pricingApi';
import { reviewSelectedShopping } from './selectedShopping';
import { buildRenovationBasket } from './renovationBasket';

const choice = { from: 'mat-laminate-kronospan-toledo-ac4-222', to: 'mat-laminate-classen-niasa-ac5-1973' };
const targetName = LAMINATE_PRODUCTS.find(ref => ref.id === choice.to)!.productLabel;
function fixture(id = 'a') {
  const calc = calculatorEngine.calculate(getJobById('laminate-flooring')!, { floorArea: 10, panelPackCoverageM2: 2.22 });
  const original = toPricingStageInput(calc), selected = applyLaminateChoices([original], [choice])[0];
  const item = { ...generateShoppingItems(id, calc).find(row => row.materialId === 'laminate-panels')!, id: 'shop-' + id, name: original.materials.find(row => row.material.id === 'laminate-panels')!.material.name, owned: true, purchased: false, customPrice: 123 };
  const project: Project = { id, name: id, jobId: calc.jobId, jobName: 'Panele', categoryId: 'laminate', measurements: calc.measurements, calculationResult: calc, status: 'planning', createdAt: '', updatedAt: '' };
  return { calc, original, selected, item, project };
}

test('switching a model keeps full raw demand and clears another product ownership and manual price without writing source rows', () => {
  const { calc, original, selected, item } = fixture(), before = JSON.stringify(item);
  for (const owned of [true, false]) {
    const saved = { ...item, owned, purchased: !owned };
    const view = reviewSelectedShopping([saved], original, selected)[0];
    assert.equal(view.name, targetName); assert.equal(view.owned, false); assert.equal(view.purchased, false);
    assert.equal(view.customPrice, undefined); assert.equal(view.estimatedPrice, 0);
    assert.equal(view.needsQuantityConfirmation, true); assert.equal(view.selectedProductChanged, true);
    assert.deepEqual(shoppingQuantityAction(calc.jobId, view), { allowed: true, confirmQuantity: 11 });
    const pending = applyProjectShopping(selected, calc, 'a', [view], original);
    assert.equal(pending.excludedMaterials, 0); assert.equal(pending.stage.materials.find(row => row.material.id === item.materialId)?.quantity, 11);
  }
  assert.equal(JSON.stringify(item), before);
});

test('confirmed identity and sufficient raw quantity exclude the chosen product while smaller or different-unit declarations cannot', () => {
  const { calc, original, selected, item } = fixture();
  for (const purchased of [true, false]) {
    const confirmed = { ...item, name: targetName, quantity: 12, customQuantity: 12, owned: !purchased, purchased };
    const view = reviewSelectedShopping([confirmed], original, selected)[0];
    assert.equal(view.needsQuantityConfirmation, false); assert.equal(view.customPrice, 123);
    assert.equal(applyProjectShopping(selected, calc, 'a', [view], original).excludedMaterials, 1);
    for (const invalid of [{ ...confirmed, quantity: 1, customQuantity: 1 }, { ...confirmed, unit: 'paczka' }, { ...confirmed, name: 'Panele Niasa' }])
      assert.equal(applyProjectShopping(selected, calc, 'a', [invalid], original).excludedMaterials, 0);
  }
});

test('projected choices can be changed again or restored without turning their displayed name into proof of ownership', () => {
  const { calc, original, selected, item } = fixture();
  const first = reviewSelectedShopping([item], original, selected);
  assert.deepEqual(reviewSelectedShopping(first, original, selected), first);
  const restored = reviewSelectedShopping(first, original, original)[0];
  assert.equal(restored.name, item.name); assert.equal(restored.owned, true); assert.equal(restored.customPrice, 123);
  assert.equal(applyProjectShopping(original, calc, 'a', first, original).excludedMaterials, 1);
  const another = applyLaminateChoices([original], [{ ...choice, to: 'mat-laminate-oakland-ac4' }])[0];
  assert.equal(applyProjectShopping(another, calc, 'a', first, original).excludedMaterials, 0);
  const confirmed = { ...item, name: targetName, customQuantity: 11 };
  assert.equal(applyProjectShopping(original, calc, 'a', [confirmed], original).excludedMaterials, 0);
});

test('the common-basket override rechecks omitted items using each room context and leaves extra requirements intact', () => {
  const a = fixture('a'), b = fixture('b');
  const basket = buildRenovationBasket([a.project, b.project], ['a', 'b'], 'standard', { a: [a.item], b: [b.item] });
  assert.equal(basket.excludedMaterials, 2);
  assert.ok(basket.stages.every(stage => !stage.materials.some(row => row.material.id === 'laminate-panels')));
  assert.ok(basket.selectionStages.every(stage => stage.materials.some(row => row.material.id === 'laminate-panels')));
  const changed = applyLaminateChoices(basket.selectionStages, [choice]);
  const extra = { jobId: 'extra', materials: [{ material: { id: 'extra', name: targetName, unit: 'm²', category: 'laminate' }, quantity: 1 }] };
  const pending = applyShoppingContexts([...changed, extra], basket.shoppingContexts);
  assert.equal(pending.excluded, 0); assert.equal(pending.stages[2], extra);
  assert.deepEqual(pending.stages.slice(0, 2).map(stage => stage.materials.find(row => row.material.id === 'laminate-panels')?.quantity), [11, 11]);
  const isolated = applyShoppingContexts(changed, [{ ...basket.shoppingContexts[0], items: [{ ...a.item, projectId: 'b', name: targetName, customQuantity: 11 }] }, basket.shoppingContexts[1]]);
  assert.equal(isolated.excluded, 0);
});

test('manual catalogue additions remain selectable once and do not duplicate after applying shopping contexts', () => {
  const { calc, original } = fixture();
  const manual = { id: 'manual-one', projectId: 'a', materialId: 'custom', name: LAMINATE_PRODUCTS.find(ref => ref.id === choice.from)!.productLabel, quantity: 3, unit: 'm²', owned: false, purchased: false, itemType: 'material' } as ShoppingItem;
  const raw = withManualShopping(original, calc, 'a', [manual]);
  const selected = applyLaminateChoices([raw], [choice])[0];
  const pending = applyProjectShopping(selected, calc, 'a', [manual], raw);
  const additions = pending.stage.materials.filter(row => row.material.id === 'manual:manual-one');
  assert.equal(additions.length, 1); assert.equal(additions[0].material.name, targetName); assert.equal(additions[0].quantity, 3);
});

test('changing tile geometry rechecks dependent adhesive quantities against the current exact product', () => {
  const calc = calculatorEngine.calculate(getJobById('wall-tiles-bathroom')!, { wallArea: 10 });
  const original = toPricingStageInput(calc);
  const selected = applyTileChoices([original], [{ from: 'mat-tile-wall-paradyz-nati-bianco-25x40', to: 'mat-gres-rekt-paradyz-u117-grey-60x60', use: 'wall' }])[0];
  const glue = selected.materials.find(row => row.material.id === 'wall-tile-adhesive')!;
  const item = { id: 'glue', projectId: 'a', materialId: glue.material.id, name: glue.material.name, unit: glue.material.unit, quantity: glue.quantity - 1, itemType: 'material', owned: true, purchased: false } as ShoppingItem;
  assert.equal(applyProjectShopping(selected, calc, 'a', [item], original).excludedMaterials, 0);
  assert.equal(applyProjectShopping(selected, calc, 'a', [{ ...item, quantity: glue.quantity + 1 }], original).excludedMaterials, 1);
});

test('real laminate calculations and historical snapshots use m² rather than a pack count, and rooms retain unrounded demand', () => {
  const a = fixture('a'), b = fixture('b');
  const panels = a.calc.materials.find(row => row.material.id === 'laminate-panels')!;
  assert.equal(panels.rawQuantity, 11); assert.equal(panels.packs, 5); assert.equal(panels.quantity, 11.1);
  const old = JSON.parse(JSON.stringify(a.calc));
  const stale = old.materials.find((row: any) => row.material.id === 'laminate-panels');
  stale.rawQuantity = 5; stale.quantity = 6.588; stale.packs = 3; stale.material.formulaKey = 'panelPacks';
  const before = JSON.stringify(old);
  assert.equal(toPricingStageInput(old).materials.find(row => row.material.id === 'laminate-panels')?.quantity, 11);
  assert.equal(JSON.stringify(old), before);
  const basket = buildRenovationBasket([{ ...a.project, calculationResult: old }, b.project], ['a', 'b'], 'standard', {}, {}, { a: [choice], b: [choice] });
  assert.deepEqual(basket.stages.map(stage => stage.materials.find(row => row.material.id === 'laminate-panels')?.quantity), [11, 11]);
  const oldOwned = { ...a.item, quantity: 6.588, customQuantity: undefined };
  assert.equal(applyProjectShopping(a.original, old, 'a', [oldOwned]).excludedMaterials, 0);
  const boundary = calculatorEngine.calculate(getJobById('laminate-flooring')!, { floorArea: 2.3, panelPackCoverageM2: 2.51 });
  const exact = boundary.materials.find(row => row.material.id === 'laminate-panels')!;
  assert.equal(exact.rawQuantity, 2.53); assert.equal(exact.packs, 2); assert.equal(exact.quantity, 5.02);
});
