import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { getJobById } from '@/features/content/registry';
import { generateAllShoppingItems, generateShoppingItems } from './shopping';
import { projectShopping, upgradeCalculation } from './upgrades';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { applyProjectShopping } from '@/features/pricing/projectShoppingInput';
import { LAMINATE_SUPPLIES_MODEL, laminateSupplyQuantity } from './laminateSupplies';
import type { ShoppingItem } from '@/types/domain';

const job = getJobById('laminate-flooring')!;
const measures = { floorArea: 10, panelPackCoverageM2: 2.51, laminateUnderlayChoice: 1, laminateThresholdCount: 1, laminateThresholdFit: 1, laminateThresholdFixings: 1, laminateKitCount: 1, laminateJointTapeM: 7 };
const calculate = (patch: Record<string, number> = {}) => calculatorEngine.calculate(job, { ...measures, ...patch });
const line = (id: string, patch: Record<string, number> = {}) => calculate(patch).materials.find(row => row.material.id === id)!;
const ean = (id: string) => { const material=line(id).material;return 'ean' in material ? material.ean : undefined; };

test('laminate supply quantities use measured pieces, whole tool kits and raw metres, never guessed room counts or rolls', () => {
  const calc = calculate(); assert.equal(calc.quantityModel, LAMINATE_SUPPLIES_MODEL);
  for (const [id, quantity] of Object.entries({underlay:11,'vapor-barrier':11,threshold:1,spacers:1,'laminate-joint-tape':7,'threshold-fixings':0})) {
    assert.equal(laminateSupplyQuantity(id, measures), quantity); assert.equal(line(id).rawQuantity, quantity); assert.equal(line(id).quantityKnown, true);
  }
  assert.equal(ean('spacers'), '4006885693104'); assert.equal(line('spacers').packs, 1);
  assert.equal(ean('laminate-joint-tape'), '5905167698778'); assert.equal(line('laminate-joint-tape').quantity, 25); assert.equal(line('laminate-joint-tape').packs, 1);
  assert.equal(ean('threshold'), '5904584845215');
  const input = toPricingStageInput(calc, 'economy');
  assert.equal(input.materials.find(row => row.material.id === 'laminate-joint-tape')?.quantity, 7);
  assert.ok(!input.materials.some(row => row.material.id === 'threshold-fixings'));
});

test('missing, fractional and incompatible declarations stay unknown instead of supplying free or automatically fitting profiles', () => {
  const missing = calculatorEngine.calculate(job, { floorArea: 10 });
  for (const id of ['threshold', 'spacers', 'laminate-joint-tape', 'threshold-fixings']) assert.equal(missing.materials.find(row => row.material.id === id)?.quantityKnown, false);
  assert.match(missing.warnings.map(w => w.message).join(' '), /Niepełna wycena/);
  const invalid: Record<string,number>[] = [{laminateThresholdCount:1.5},{laminateThresholdFit:0},{laminateThresholdCount:-1}];
  for (const patch of invalid) assert.equal(line('threshold',patch).quantityKnown,false);
  assert.equal(line('threshold-fixings',{laminateThresholdFixings:0}).quantityKnown,false);
  assert.equal(line('spacers',{laminateKitCount:0.5}).quantityKnown,false);
  assert.equal(line('laminate-joint-tape',{laminateJointTapeM:-1}).quantityKnown,false);
});

test('explicit zero means already covered or unnecessary and an integrated 3in1 choice removes the second foil only for that product', () => {
  const calc = calculate({laminateThresholdCount:0,laminateThresholdFit:0,laminateThresholdFixings:0,laminateKitCount:0,laminateJointTapeM:0,laminateUnderlayChoice:2});
  const input = toPricingStageInput(calc,'economy');
  assert.ok(!input.materials.some(row => ['threshold','threshold-fixings','spacers','laminate-joint-tape','vapor-barrier'].includes(row.material.id)));
  const underlay = input.materials.find(row => row.material.id === 'underlay')!;
  assert.match(underlay.material.name,/Arbiton/); assert.equal(underlay.quantity,11);
  assert.ok(toPricingStageInput(calculate({laminateUnderlayChoice:1}),'economy').materials.some(row=>row.material.id==='vapor-barrier'));
});

test('installation kit components are not generated again as required tools, while the saw and measure remain separate', () => {
  const items = generateAllShoppingItems('a',calculate(),job);
  assert.equal(items.filter(row=>row.materialId==='spacers').length,1);
  assert.ok(!items.some(row=>row.itemType==='tool'&&['spacers','tapping-block','pull-bar'].includes(row.materialId)));
  assert.ok(items.some(row=>row.materialId==='saw'&&row.itemType==='tool'));
  assert.ok(items.some(row=>row.materialId==='tape-measure'&&row.itemType==='tool'));
  const oldTool = { id:'old-tool',projectId:'a',materialId:'tapping-block',name:'Klocek dobijak z tworzywa',quantity:1,unit:'szt.',itemType:'tool',owned:false,purchased:false,estimatedPrice:15 } as ShoppingItem;
  const before=JSON.stringify(oldTool);
  assert.equal(projectShopping([oldTool],calculate()).length,0);
  assert.equal(JSON.stringify(oldTool),before);
  assert.equal(projectShopping([{...oldTool,name:'Własny dodatkowy dobijak'}],calculate()).length,1);
});

test('historical calculations and old wedge ownership require a review and survive without writes or identity borrowing', () => {
  const old = JSON.parse(JSON.stringify(calculate())); delete old.quantityModel;
  old.materials = old.materials.filter((row:any)=>!['laminate-joint-tape','threshold-fixings'].includes(row.material.id));
  const before=JSON.stringify(old),upgraded=upgradeCalculation(old)!;
  assert.equal(upgraded.materials.find(row=>row.material.id==='spacers')?.quantityKnown,false);
  assert.equal(upgraded.materials.find(row=>row.material.id==='laminate-joint-tape')?.quantityKnown,false);
  const calc=calculate(),stage=toPricingStageInput(calc,'economy');
  const oldWedge={id:'old',projectId:'a',materialId:'spacers',name:'Kliny dystansowe',quantity:1,unit:'opak.',owned:true,purchased:false,itemType:'material'} as ShoppingItem;
  assert.equal(applyProjectShopping(stage,calc,'a',[oldWedge]).excludedMaterials,0);
  const correct={...oldWedge,name:line('spacers').material.name,unit:'szt',quantity:1};
  assert.equal(applyProjectShopping(stage,calc,'a',[correct]).excludedMaterials,1);
  const view=projectShopping([oldWedge],calc)[0]; assert.equal(view.owned,false); assert.equal(view.needsQuantityConfirmation,true);
  assert.equal(JSON.stringify(old),before);
  assert.ok(generateShoppingItems('a',upgraded).some(row=>row.materialId==='laminate-joint-tape'));
});
