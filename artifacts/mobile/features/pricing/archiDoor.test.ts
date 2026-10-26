import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { DOOR_LEAVES, makeDoorSelection, parseDoorSelection } from './doorSelection';
import { toPricingStageInput } from './pricingApi';
import { buildRenovationBasket } from './renovationBasket';
import type { Project } from '@/types/domain';

const current='mat-door-leaf-opp-archi-full-80-left' as const;
const calc=()=>calculatorEngine.calculate(getJobById('interior-doors')!,{doorWidth:90,doorHeight:210,wallThickness:10});

test('current Archi retains its own barcode and image instead of aliasing the discontinued leaf or a right-hand/ventilated model',()=>{
  const leaf=DOOR_LEAVES.find(row=>row.id===current)!,ref=MATERIAL_PRICES.find(row=>row.id===current)!;
  assert.equal(leaf.ean,'5063022524263');assert.equal(ref.packageSize,1);assert.equal(ref.packageUnit,'szt');
  assert.match(leaf.label,/lewe.*2035 × 844/);assert.equal(PRODUCT_PHOTOS.find(row=>row.ids.includes(current))?.ean,leaf.ean);
  assert.equal(DOOR_LEAVES.find(row=>row.id==='mat-door-leaf-archi-80-white')?.ean,'5903917782364');
  assert.notEqual(ref.sourceUrl,MATERIAL_PRICES.find(row=>row.id==='mat-door-leaf-archi-80-white')?.sourceUrl);
});

test('an explicit current Archi selection preserves opening measurements and leaves frame and handle unpriced unless owned',()=>{
  const result=calc(),before=JSON.stringify(result),selection=makeDoorSelection(result,current,false,false);
  assert.deepEqual(parseDoorSelection(JSON.stringify(selection),result),selection);
  const selected=toPricingStageInput(result,'standard',selection),leaf=selected.materials.find(row=>row.material.id==='door-set-leaf')!;
  assert.equal(leaf.material.ean,'5063022524263');assert.equal(leaf.quantity,1);
  assert.ok(selected.materials.some(row=>row.material.id==='door-set-frame'&&!row.material.ean));
  assert.ok(selected.materials.some(row=>row.material.id==='door-handle'&&!row.material.ean));
  assert.equal(JSON.stringify(result),before);
  const changed={...result,measurements:{...result.measurements,doorHeight:220}};
  assert.equal(parseDoorSelection(JSON.stringify(selection),changed),null);
});

test('the whole renovation basket keeps different door models in separate openings and honours the project choice',()=>{
  const result=calc();
  const project=(id:string):Project=>({id,name:id,jobId:result.jobId,jobName:'Drzwi',categoryId:'doors',measurements:result.measurements,calculationResult:result,status:'planning',createdAt:'',updatedAt:''});
  const basket=buildRenovationBasket([project('a'),project('b')],['a','b'],'economy',{},
    {a:makeDoorSelection(result,current,true,true),b:makeDoorSelection(result,'mat-door-leaf-archi-80-white',true,true)});
  assert.equal(basket.stages[0].materials.find(row=>row.material.id==='door-set-leaf')?.material.ean,'5063022524263');
  assert.equal(basket.stages[1].materials.find(row=>row.material.id==='door-set-leaf')?.material.ean,'5903917782364');
});
