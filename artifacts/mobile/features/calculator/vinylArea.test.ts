import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { getJobById } from '@/features/content/registry';
import { getRequiredQuantity } from './requirements';
import { generateShoppingItems } from './shopping';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { computePricedBudget } from '@/features/pricing/engine';
import { applyProjectShopping } from '@/features/pricing/projectShoppingInput';
import { reviewSelectedShopping } from '@/features/pricing/selectedShopping';
import type { ShoppingItem } from '@/types/domain';

const job = getJobById('vinyl-flooring')!;
test('click-vinyl keeps square metres until the retailer rounds to its actual package, including the boundary', () => {
  const calc = calculatorEngine.calculate(job, { floorArea: 10, panelPackCoverageM2: 2 });
  const line = calc.materials.find(l => l.material.id === 'vinyl-panels')!;
  assert.equal(line.rawQuantity, 11); assert.equal(line.packs, 5); assert.equal(line.quantity, 11.175);
  const api = toPricingStageInput(calc, 'better').materials.find(l => l.material.id === 'vinyl-panels')!;
  assert.equal(api.quantity, 11); assert.equal(api.material.unit, 'm2'); assert.match(api.material.name, /Marvo/);
  const priced = computePricedBudget({ job, calc, qualityTier: 'better', regionCode: 'lodzkie', overrides: [] }).materialDetails.find(l => l.materialRef.materialType === 'vinyl-panel')!;
  assert.equal(priced.quantity, 11); assert.equal(priced.packagesNeeded, 5); assert.equal(priced.totalCost, 754.10);
  const edge = calculatorEngine.calculate(job, { floorArea: 2.032, panelPackCoverageM2: 2.235 }).materials.find(l => l.material.id === 'vinyl-panels')!;
  assert.equal(edge.rawQuantity, 2.2352); assert.equal(edge.packs, 2); assert.equal(edge.quantity, 4.47);
  // A real selected model supplies pack coverage; stale generic input cannot change it.
  for (const coverage of [NaN, 0, -1, 2.5]) assert.equal(calculatorEngine.calculate(job, { floorArea: 10, panelPackCoverageM2: coverage }).materials.find(l => l.material.id === 'vinyl-panels')!.packs, 5);
  for (const floorArea of [NaN, 0, -1]) assert.equal(calculatorEngine.calculate(job, { floorArea }).materials.find(l => l.material.id === 'vinyl-panels')!.quantityKnown, false);
});

test('historical vinyl pack counts cannot cover the restored m² requirement or rewrite saved data', () => {
  const calc = calculatorEngine.calculate(job, { floorArea: 10, panelPackCoverageM2: 2 });
  const saved = JSON.parse(JSON.stringify(calc)), line = saved.materials.find((l: any) => l.material.id === 'vinyl-panels');
  line.rawQuantity = 6; line.quantity = 6; line.packs = 3; line.material.formulaKey = 'panelPacks';
  const before = JSON.stringify(saved), stage = toPricingStageInput(saved, 'better'), target = stage.materials.find(l => l.material.id === 'vinyl-panels')!;
  assert.equal(getRequiredQuantity(line, saved), 11); assert.equal(target.quantity, 11); assert.equal(JSON.stringify(saved), before);
  const item = { ...generateShoppingItems('vinyl', calc).find(r => r.materialId === 'vinyl-panels')!, id: 'old-vinyl', name: target.material.name, unit: target.material.unit, quantity: 6, customQuantity: 6, owned: true, purchased: false } as ShoppingItem;
  const view = reviewSelectedShopping([item], stage, stage)[0];
  assert.equal(view.owned, false); assert.equal(view.requiredQuantity, 11); assert.equal(view.needsQuantityConfirmation, true);
  assert.equal(applyProjectShopping(stage, saved, 'vinyl', [item]).excludedMaterials, 0);
  assert.equal(applyProjectShopping(stage, saved, 'vinyl', [{ ...item, quantity: 11, customQuantity: 11 }]).excludedMaterials, 1);
  assert.equal(JSON.stringify(saved), before);
});
