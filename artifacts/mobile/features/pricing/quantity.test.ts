import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paintJob } from '@/data/jobs/paint';
import { calculateMaterials } from '@/features/calculator/engine';
import { computePricedBudget } from './engine';
import { toPricingStageInput } from './pricingApi';

test('paint budget uses calculator consumption for each coat count, never square metres as litres', () => {
  for (const coats of [1, 2, 3]) {
    const calc = calculateMaterials(paintJob, { wallArea: 40, coats, coveragePerLiter: 10 });
    const budget = computePricedBudget({ job: paintJob, calc, regionCode: 'lodzkie', qualityTier: 'standard', overrides: [] });
    const line = budget.materialDetails.find(item => item.materialRef.materialType === 'paint')!;
    assert.equal(line.quantity, [4.2, 8.4, 12.6][coats - 1]);
    assert.equal(line.packagesNeeded, coats);
    assert.ok(budget.unpricedMaterials?.includes('Taśma malarska'));
    assert.ok(!budget.materialDetails.some(item => item.materialRef.materialType === 'skim-coat'));
  }
});

test('prices with explicit native-unit basis charge the full bought volume', () => {
  const calc = calculateMaterials(paintJob, { wallArea: 40, coats: 2, coveragePerLiter: 10 });
  const paint = calc.materials.find(item => item.material.id === 'paint')!;
  assert.equal(paint.rawQuantity, 8.4);
  assert.equal(paint.quantity, 10);
  assert.equal(paint.cost, 400);
  const api = toPricingStageInput(calc);
  assert.equal(api.materials.find(item => item.material.id === 'paint')?.quantity, 8.4);
});

test('old saved results still resolve original consumption without double rounding', () => {
  const calc = calculateMaterials(paintJob, { wallArea: 40, coats: 2, coveragePerLiter: 10 });
  const oldCalc = JSON.parse(JSON.stringify({ ...calc, materials: calc.materials.map(({ rawQuantity, ...rest }) => rest) }));
  const budget = computePricedBudget({ job: paintJob, calc: oldCalc, regionCode: 'lodzkie', qualityTier: 'standard', overrides: [] });
  assert.equal(budget.materialDetails.find(item => item.materialRef.materialType === 'paint')?.quantity, 8.4);
  assert.equal(toPricingStageInput(oldCalc).materials.find(item => item.material.id === 'paint')?.quantity, 8.4);
});


test('API input uses the selected catalogue product, with compatible units and original quantities', () => {
  const calc = calculateMaterials(paintJob, { wallArea: 40, coats: 2, coveragePerLiter: 10 });
  const economy = toPricingStageInput(calc, 'economy').materials.find(line => line.material.id === 'paint')!;
  const standard = toPricingStageInput(calc, 'standard').materials.find(line => line.material.id === 'paint')!;
  assert.match(economy.material.name, /Dekoral/);
  assert.match(standard.material.name, /Śnieżka/);
  assert.equal(standard.material.category, 'paint');
  assert.equal(standard.material.unit, 'l');
  assert.equal(standard.quantity, 8.4);
});
