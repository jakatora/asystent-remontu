import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paintJob } from '@/data/jobs/paint';
import { skirtingJob } from '@/data/jobs/finishing';
import { calculateMaterials } from '@/features/calculator/engine';
import { computePricedBudget } from './engine';
import { toPricingStageInput } from './pricingApi';

test('the reference budget includes the retailer lot, including a custom piece price',()=>{
 const calc=calculateMaterials(skirtingJob,{perimeter:5});
 const input={job:skirtingJob,calc,regionCode:'lodzkie',qualityTier:'standard' as const,overrides:[]};
 const line=computePricedBudget(input).materialDetails.find(line=>line.materialRef.id==='mat-skirting-arbiton-2500')!;
 assert.ok(line);assert.equal(line.packagesNeeded,10);assert.equal(line.totalCost,319.80);
 const custom=computePricedBudget({...input,overrides:[{targetType:'material',targetId:line.materialRef.id,overridePrice:30} as never]}).materialDetails.find(row=>row.materialRef.id===line.materialRef.id)!;
 assert.equal(custom.packagesNeeded,10);assert.equal(custom.totalCost,300);
});
import { selfLevelingJob } from '@/data/jobs/floor-prep';
import { gypsumWallJob, gypsumCeilingJob } from '@/data/jobs/gypsum';

test('paint budget uses calculator consumption for each coat count, never square metres as litres', () => {
  for (const coats of [1, 2, 3]) {
    const calc = calculateMaterials(paintJob, { wallArea: 40, coats, coveragePerLiter: 10 });
    const budget = computePricedBudget({ job: paintJob, calc, regionCode: 'lodzkie', qualityTier: 'standard', overrides: [] });
    const line = budget.materialDetails.find(item => item.materialRef.materialType === 'paint')!;
    assert.equal(line.quantity, [4.2, 8.4, 12.6][coats - 1]);
    assert.equal(line.packagesNeeded, coats);
    assert.deepEqual(budget.unpricedMaterials, []);
    assert.ok(!budget.materialDetails.some(item => item.materialRef.materialType === 'skim-coat'));
  }
});

test('painting preparation uses explicit package counts and compatible base units', () => {
  const calc = calculateMaterials(paintJob, { wallArea: 40, coats: 2, coveragePerLiter: 10, tapeRolls: 2, protectiveFilmPacks: 3 });
  const budget = computePricedBudget({ job: paintJob, calc, regionCode: 'lodzkie', qualityTier: 'standard', overrides: [] });
  const tape = budget.materialDetails.find(line => line.materialRef.materialType === 'masking-tape')!;
  const film = budget.materialDetails.find(line => line.materialRef.materialType === 'protective-film')!;
  assert.equal(tape.quantity, 100); assert.equal(tape.packagesNeeded, 2);
  assert.equal(film.quantity, 60); assert.equal(film.packagesNeeded, 3);
  assert.equal(calc.materials.find(line => line.material.id === 'drop-cloth')?.packs, 3);
  const api = toPricingStageInput(calc);
  assert.equal(api.materials.find(line => line.material.id === 'painters-tape')?.quantity, 100);
  assert.equal(api.materials.find(line => line.material.id === 'drop-cloth')?.quantity, 60);
  const ownMaterials = toPricingStageInput(calculateMaterials(paintJob, { wallArea: 40, tapeRolls: 0, protectiveFilmPacks: 0 }));
  assert.ok(!ownMaterials.materials.some(line => ['painters-tape', 'drop-cloth'].includes(line.material.id)));
});

test('legacy painting snapshots retain their purchase counts when converted for price comparison', () => {
  const calc = JSON.parse(JSON.stringify(calculateMaterials(paintJob, { wallArea: 40 })));
  const tape = calc.materials.find((line: any) => line.material.id === 'painters-tape');
  tape.material.unit = 'rolka'; delete tape.material.packaging; tape.quantity = 5; tape.rawQuantity = 5; delete tape.packs;
  const film = calc.materials.find((line: any) => line.material.id === 'drop-cloth');
  film.material.packaging.size = 1; film.quantity = 1; film.rawQuantity = 1; film.packs = 1;
  const api = toPricingStageInput(calc);
  assert.equal(api.materials.find(line => line.material.id === 'painters-tape')?.quantity, 250);
  assert.equal(api.materials.find(line => line.material.id === 'drop-cloth')?.quantity, 20);
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

test('self-leveling demand scales with area and thickness and restores old constant-one snapshots', () => {
  for (const [floorArea, levelingThickness, quantity] of [[2,5,17.6],[20,5,176],[20,10,352]]) {
    const calc = calculateMaterials(selfLevelingJob, { floorArea, levelingThickness });
    assert.equal(calc.materials.find(line => line.material.id === 'leveling-compound')!.rawQuantity, quantity);
    const old = JSON.parse(JSON.stringify(calc));
    old.materials.find((line: any) => line.material.id === 'leveling-compound').rawQuantity = 1;
    assert.equal(toPricingStageInput(old, 'standard').materials.find(line => line.material.id === 'leveling-compound')!.quantity, quantity);
  }
  const thin = calculateMaterials(selfLevelingJob, { floorArea: 20, levelingThickness: 5 });
  assert.ok(!toPricingStageInput(thin, 'economy').materials.some(line => /Atlas SAM 200/.test(line.material.name)));
  const thick = calculateMaterials(selfLevelingJob, { floorArea: 20, levelingThickness: 25 });
  assert.equal(toPricingStageInput(thick, 'economy').materials.find(line => line.material.id === 'leveling-compound')!.quantity, 1100);
});

test('drywall hardware uses counted pieces before rounding to retail packs; wool thickness is not guessed', () => {
  const wall = toPricingStageInput(calculateMaterials(gypsumWallJob, { wallArea: 10, perimeter: 8 }));
  const screws = wall.materials.find(line => line.material.id === 'gk-screws')!;
  assert.match(screws.material.name, /Wkręt-Met/);
  assert.equal(screws.material.unit, 'szt');
  assert.equal(screws.quantity, 300);
  const dowels = wall.materials.find(line => line.material.id === 'dowels-uw')!;
  assert.match(dowels.material.name, /6×40/);
  assert.equal(dowels.quantity, 16);
  const wool = wall.materials.find(line => line.material.id === 'mineral-wool')!;
  assert.match(wool.material.name, /50mm/);
  assert.ok(!wool.material.name.includes('10 cm'));
  const ceiling = toPricingStageInput(calculateMaterials(gypsumCeilingJob, { ceilingArea: 10 }));
  assert.match(ceiling.materials.find(line => line.material.id === 'gk-screws-ceiling')!.material.name, /Wkręt-Met/);
});
