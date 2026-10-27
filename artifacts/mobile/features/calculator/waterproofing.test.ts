import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine, computeRawQuantity } from './engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { getProductPhoto } from '@/data/products/photos';
import { upgradeCalculation, projectShopping } from './upgrades';
import { generateShoppingItems } from './shopping';
import { WATERPROOFING_JOB, WATERPROOFING_MODEL, WATERPROOFING_IDS, waterproofingQuantity } from './waterproofing';
import type { CalculationResult } from '@/types/domain';

const measures = { wallArea: 10, floorArea: 5, perimeter: 10, hydroSystem: 3, hydroSubstrate: 1, hydroPrimerPack: 5, hydroTapeOverlaps: 8, hydroInsideCorners: 4, hydroOutsideCorners: 1, hydroWallCollars: 3, hydroFloorCollars: 1, hydroCollarFit: 1 };
const calculate = (patch: Record<string, number> = {}) => calculatorEngine.calculate(getJobById(WATERPROOFING_JOB)!, { ...measures, ...patch });
test('complete waterproofing uses one compatible seven-product system, exact physical units and both membrane coats once', () => {
  const calc = calculate(), input = toPricingStageInput(calc);
  assert.equal(calculatorEngine.calculateDetailed(getJobById(WATERPROOFING_JOB)!,measures).quantityModel,WATERPROOFING_MODEL);
  assert.equal(calc.quantityModel, WATERPROOFING_MODEL); assert.equal(calc.quantityIssues?.length, 0); assert.equal(input.materials.length, 7);
  for (const line of calc.materials) { assert.equal(line.quantityKnown, true); assert.equal(computeRawQuantity(line.material, calc.measurements), line.rawQuantity); assert.ok(getProductPhoto({ ean: 'ean' in line.material ? line.material.ean as string : '' })); }
  const byId = (id: string) => input.materials.find(row => row.material.id === id)!;
  assert.equal(byId('membrane').quantity, 19.8); assert.equal(byId('membrane').material.ean, '8022452242502');
  assert.equal(byId('primer-waterproof').quantity, 3); assert.equal(byId('primer-waterproof').material.unit, 'l');
  assert.equal(byId('sealing-tape').quantity, 10.4); assert.equal(byId('hydro-collar-wall').quantity, 3); assert.equal(byId('hydro-collar-floor').quantity, 1);
  for (const tier of ['economy', 'standard', 'better'] as const) { const refs = getMaterialsForJob(WATERPROOFING_JOB, tier, measures); assert.equal(refs.length, 7); assert.ok(refs.every(ref => ref.brand === 'Mapei')); assert.equal(refs.find(r => r.materialType === 'waterproofing')!.packageSize,20); }
  for (const [choice, ean] of [[1,'8022452002113'],[2,'8022452002120'],[3,'8022452242502']] as const) assert.equal(toPricingStageInput(calculate({ hydroSystem:choice })).materials.find(r=>r.material.id==='membrane')!.material.ean,ean);
});
test('unanswered details and unconfirmed collar fit remain missing; explicit zero excludes only those accessories', () => {
  const unknown = calculatorEngine.calculate(getJobById(WATERPROOFING_JOB)!, { wallArea:10,floorArea:5,perimeter:10 });
  assert.equal(toPricingStageInput(unknown).materials.filter(l=>l.material.unit==='pozycja').length,7);
  const unfitted = toPricingStageInput(calculate({ hydroCollarFit:0 })); assert.equal(unfitted.materials.filter(l=>l.material.unit==='pozycja').length,2);
  const zero = toPricingStageInput(calculate({ hydroInsideCorners:0,hydroOutsideCorners:0,hydroWallCollars:0,hydroFloorCollars:0,hydroCollarFit:0 })); assert.equal(zero.materials.length,3);
  assert.equal(waterproofingQuantity('sealing-tape',{...measures,hydroTapeOverlaps:-1}),null);
  assert.equal(waterproofingQuantity('membrane',{...measures,hydroMembraneConsumption:0.6}),null);
  assert.equal(waterproofingQuantity('membrane',{...measures,wallArea:-1}),null);
  assert.equal(toPricingStageInput(calculate({hydroSubstrate:2})).materials.find(l=>l.material.id==='primer-waterproof')!.material.unit,'pozycja');
});
test('historical three-line mixed-brand JSON cannot become a complete new system or retain stale owned stock', () => {
  const current = calculate(), old = { ...current, quantityModel: undefined, materials:current.materials.slice(0,3).map(line=>({...line,quantityKnown:undefined})) } as CalculationResult;
  const before = JSON.stringify(old), upgraded = upgradeCalculation(old)!; assert.equal(JSON.stringify(old),before); assert.equal(upgraded.materials.length,7); assert.ok(upgraded.materials.every(l=>l.quantityKnown===false));
  const owned = generateShoppingItems('qa', current).map((item,i)=>({...item,id:`owned-${i}`,owned:true,purchased:true,needsQuantityConfirmation:true}));
  const reviewed = projectShopping(owned,current); assert.ok(reviewed.filter(i=>i.itemType==='material').every(i=>!i.owned&&!i.purchased));
  const stale = projectShopping(generateShoppingItems('qa',old).map((item,i)=>({...item,id:`stale-${i}`,owned:true})),old); assert.ok(stale.filter(i=>i.itemType==='material').every(i=>!i.owned));
  assert.equal(WATERPROOFING_IDS.length,7);
});
