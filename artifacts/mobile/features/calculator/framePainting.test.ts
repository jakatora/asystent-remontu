import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { FRAME_MODEL, frameQuantity } from './framePainting';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { upgradeCalculation, projectShopping } from './upgrades';
import { applyProjectShopping } from '@/features/pricing/projectShoppingInput';
import { getProductPhoto } from '@/data/products/photos';
import { parseMeasurements } from '@/shared/lib/measurements';
import type { ShoppingItem } from '@/types/domain';

const job=getJobById('paint-frames')!;
const calc=(more:Record<string,number>={})=>calculatorEngine.calculate(job,{wallArea:5,coats:2,coveragePerLiter:10,...more});
test('frame basket uses real painted surface, independent primer area and exact 800ml cans',()=>{
  const c=calc(),line=(id:string)=>c.materials.find(row=>row.material.id===id)!;
  assert.equal(c.quantityModel,FRAME_MODEL);assert.equal(line('frame-paint').rawQuantity,1100);assert.equal(line('frame-paint').quantity,1600);
  assert.equal(line('frame-primer').rawQuantity,611.111111);assert.equal(line('frame-primer').quantity,800);
  assert.equal(line('frame-tape').rawQuantity,50);assert.equal(line('frame-paper-240').rawQuantity,2);
  assert.equal(line('frame-cleaner').rawQuantity,500);assert.equal(line('frame-sandpaper').rawQuantity,0);
  assert.equal(calc({framePrimerArea:2}).materials.find(row=>row.material.id==='frame-primer')!.rawQuantity,244.444444);
  assert.ok(!toPricingStageInput(calc({framePrimerArea:0})).materials.some(row=>row.material.id==='frame-primer'));
  assert.equal(frameQuantity('frame-paint',{wallArea:0.01,coats:2}),2.2);
});
test('wood, steel and PVC preserve the selected exact EAN in every tier and both calculator views',()=>{
  for(const [frameSystem,paint,primer] of [[0,'5903973147756','5903973231684'],[1,'5903973232131','5903973231684'],[2,'5903973147756','5903973228790'],[3,'5903973232131','5903973228790'],[4,'5904078222379',null]] as const){
    const c=calc({frameSystem,framePvcCleanerOwned:1}),detail=calculatorEngine.calculateDetailed(job,c.measurements);
    assert.deepEqual(c.materials.map(row=>[row.rawQuantity,row.quantity,row.cost]),detail.materials.map(row=>[row.rawQuantity,row.quantity,row.cost]));
    for(const tier of ['economy','standard','better'] as const){
      const input=toPricingStageInput(c,tier),paintLine=input.materials.find(row=>row.material.id==='frame-paint')!;
      assert.equal(paintLine.material.ean,paint);assert.equal(paintLine.quantity,1100);assert.equal(paintLine.material.unit,'ml');
      const primerLine=input.materials.find(row=>row.material.id==='frame-primer');assert.equal(primerLine?.material.ean??null,primer);
      assert.ok(getMaterialsForJob(job.id,tier,c.measurements).every(ref=>!ref.id.includes('universal-primer')));
      if(frameSystem===4)assert.ok(!input.materials.some(row=>row.material.id==='frame-cleaner'));
      for(const row of input.materials)assert.ok(getProductPhoto(row.material),row.material.name);
    }
  }
  assert.ok(job.materials.every(row=>!('formula'in row)));
  assert.deepEqual(job.measurementInputs.slice(0,3).map(row=>row.id),['wallArea','coats','coveragePerLiter']);
});
test('PVC preparation is a visible missing purchase until suitable detergent is explicitly owned',()=>{
  const missing=toPricingStageInput(calc({frameSystem:4})),owned=toPricingStageInput(calc({frameSystem:4,framePvcCleanerOwned:1}));
  assert.equal(missing.materials.find(row=>row.material.id==='frame-pvc-cleaner')!.material.unit,'pozycja');
  assert.ok(!owned.materials.some(row=>row.material.id==='frame-pvc-cleaner'));
});
test('invalid surface/coverage/primer combinations cannot turn into a cheap complete set',()=>{
  const invalid:Record<string,number>[]=[{frameSystem:9},{wallArea:0},{wallArea:NaN},{coveragePerLiter:15},{coats:1.5},{frameReservePercent:Infinity},{frameSystem:4,coats:1}];
  for(const more of invalid){
    assert.equal(calc(more).materials[0].quantityKnown,false);
    assert.equal(toPricingStageInput(calc(more)).materials[0].material.unit,'pozycja');
  }
  assert.equal(calc({framePrimerArea:6}).materials[1].quantityKnown,false);
  assert.equal(calc({framePrimerCoats:2}).materials[1].quantityKnown,false);
  assert.equal(calc({frameSystem:2,framePrimerCoats:2}).materials[1].quantityKnown,true);
  assert.equal(calc({frameFineSheets:1.5}).materials.find(row=>row.material.id==='frame-paper-240')!.quantityKnown,false);
  const raw=Object.fromEntries(job.measurementInputs.map(row=>[row.id,String(row.defaultValue??(row.id==='wallArea'?5:''))]));
  for(const more of [{coveragePerLiter:'15'},{framePrimerArea:'6'},{framePrimerCoats:'2'},{frameSystem:'4',coats:'1'}])assert.ok(parseMeasurements(job,{...raw,...more}).errors.length);
  assert.equal(parseMeasurements(job,raw).errors.length,0);
  const switched=parseMeasurements(job,{...raw,frameSystem:'4',frameCoarseSheets:'8',framePrimerArea:'100',framePrimerCoats:'2'});
  assert.equal(switched.errors.length,0);assert.equal(switched.values.framePrimerArea,undefined);assert.equal(switched.values.frameCoarseSheets,undefined);
});
test('legacy frame data stays intact and requires explicit review instead of substituting a guessed product',()=>{
  const c=calc(),old={...c,quantityModel:undefined,materials:c.materials.slice(0,4)},before=JSON.stringify(old),review=upgradeCalculation(old)!;
  assert.equal(JSON.stringify(old),before);assert.equal(review.materials.length,7);assert.ok(review.materials.every(row=>row.quantityKnown===false));
  assert.deepEqual(upgradeCalculation(review),review);assert.equal(toPricingStageInput(old).materials.length,7);
  const ref=getMaterialsForJob(job.id,'standard',c.measurements)[0];assert.equal(resolveMaterialQuantity(ref,old),null);
  const altered={...c,materials:c.materials.map((row,i)=>i===0?{...row,material:{...row.material,ean:'5903973232131'}}:row)};
  assert.equal(resolveMaterialQuantity(ref,altered),null);
});
test('owned paint must match product, volume unit and sufficient raw quantity; changing finish restores purchase',()=>{
  const c=calc(),line=c.materials[0],item:ShoppingItem={id:'i',projectId:'p',materialId:'frame-paint',name:line.material.name,quantity:1200,unit:'ml',estimatedPrice:0,owned:true,purchased:false,itemType:'material',tier:'standard',createdAt:''};
  assert.equal(projectShopping([item],c)[0].owned,true);
  assert.ok(!applyProjectShopping(toPricingStageInput(c),c,'p',[item]).stage.materials.some(row=>row.material.id==='frame-paint'));
  for(const bad of [{...item,quantity:800},{...item,unit:'puszka'},{...item,name:'Inna emalia'}])assert.ok(applyProjectShopping(toPricingStageInput(c),c,'p',[bad]).stage.materials.some(row=>row.material.id==='frame-paint'));
  const next=calc({frameSystem:1});assert.ok(applyProjectShopping(toPricingStageInput(next),next,'p',[item]).stage.materials.some(row=>row.material.id==='frame-paint'));
});
