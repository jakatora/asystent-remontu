import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine, computeRawQuantity } from './engine';
import { finishingQuantity, WALL_FINISHING_MODEL } from './wallFinishing';
import { getJobById } from '@/features/content/registry';
import { getRequiredQuantity } from './requirements';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { upgradeCalculation, projectShopping } from './upgrades';
import { applyProjectShopping } from '@/features/pricing/projectShoppingInput';
import { getProductPhoto } from '@/data/products/photos';
import type { ShoppingItem } from '@/types/domain';

const calc=(jobId='wall-repair',more:Record<string,number>={})=>calculatorEngine.calculate(getJobById(jobId)!,{wallArea:10,repairArea:0.5,repairDepthMm:2,repairTapeLength:3,coarsePaperSheets:2,finePaperSheets:1,...more});
test('repair uses the patched area/depth and measured tape length independently of the whole primed wall',()=>{
  const c=calc(),line=(id:string)=>c.materials.find(row=>row.material.id===id)!;
  assert.equal(c.quantityModel,WALL_FINISHING_MODEL);
  assert.equal(line('filler').rawQuantity,1.1);assert.equal(line('filler').quantity,5);
  assert.equal(line('mesh-tape').rawQuantity,3.3);assert.equal(line('mesh-tape').quantity,20);
  assert.equal(line('primer-repair').rawQuantity,1.5);
  const larger=calc('wall-repair',{wallArea:20});assert.equal(larger.materials[0].rawQuantity,1.1);assert.equal(larger.materials[1].rawQuantity,3.3);
  const tape=calc('wall-repair',{repairTapeLength:0});assert.ok(!toPricingStageInput(tape).materials.some(row=>row.material.id==='mesh-tape'));
  const small=calc('wall-repair',{wallArea:0.01,repairArea:0.01,repairDepthMm:2,repairTapeLength:0});
  assert.equal(small.materials[0].rawQuantity,0.022);assert.equal(small.materials.find(row=>row.material.id==='primer-repair')!.rawQuantity,0.0015);
  assert.equal(getJobById('wall-repair')!.measurementInputs.find(row=>row.id==='wallArea')!.min,0.001);
  assert.equal(getRequiredQuantity(line('filler'),c),1.1);assert.equal(computeRawQuantity(line('filler').material,c.measurements),1.1);
});
test('each grain is a separate sheet quantity, not an area allowance or a 225mm disc',()=>{
  for(const id of ['wall-repair','skim-coat']){
    const input=toPricingStageInput(calc(id));
    const paper=input.materials.filter(row=>row.material.category?.startsWith('hand-abrasive'));
    assert.deepEqual(paper.map(row=>row.quantity),[2,1]);assert.deepEqual(paper.map(row=>row.material.ean),[id==='wall-repair'?'5907560017644':'5907560023553','5907560039820']);
    assert.ok(paper.every(row=>row.material.unit==='szt'));
    assert.ok(!input.materials.some(row=>row.material.name.includes('225')));
    for(const row of calc(id).materials)assert.ok(getProductPhoto(row.material));
  }
});
test('skim coat uses layer thickness and count; its primer is the actual ready Knauf product, not Dragon concentrate',()=>{
  const c=calc('skim-coat',{layers:2,skimLayerThicknessMm:2}),input=toPricingStageInput(c);
  assert.equal(c.materials.find(row=>row.material.id==='skim-coat')!.rawQuantity,44);
  assert.equal(input.materials.find(row=>row.material.id==='skim-coat')!.quantity,44);
  const primer=input.materials.find(row=>row.material.id==='primer-skim')!;
  assert.equal(primer.material.ean,'5901793357737');assert.equal(primer.quantity,1.5);
  assert.ok(!c.materials.some(row=>/koncentrat|Dragon/.test(row.material.name)));
});
test('explicit pack choice preserves physical demand and exact product in every tier and calculator view',()=>{
  for(const id of ['wall-repair','skim-coat'])for(const size of [5,20]){
    const c=calc(id,{fillerPackSize:size}),d=calculatorEngine.calculateDetailed(getJobById(id)!,c.measurements);
    assert.deepEqual(c.materials.map(row=>[row.rawQuantity,row.quantity,row.cost]),d.materials.map(row=>[row.rawQuantity,row.quantity,row.cost]));
    assert.equal(c.quantityModel,d.quantityModel);assert.equal(c.materials[0].material.packaging?.size,size);
    for(const tier of ['economy','standard','better'] as const){
      const input=toPricingStageInput(c,tier);assert.equal(input.materials[0].material.ean,size===5?'5903973104414':'5903973104421');
      assert.equal(getMaterialsForJob(id,tier,c.measurements).length,id==='wall-repair'?5:4);
    }
    assert.ok(getJobById(id)!.materials.every(row=>!('formula' in row)));
  }
});
test('missing or invalid dimensions, packs and fractional sheets remain unconfirmed instead of disappearing as free material',()=>{
  const invalid:Record<string,number>[]=[{repairArea:NaN},{repairArea:0},{repairArea:11},{repairDepthMm:31},{fillerPackSize:10},{fillerReservePercent:Infinity}];
  for(const more of invalid){
    const c=calc('wall-repair',more);assert.equal(c.materials[0].quantityKnown,false);
    assert.equal(toPricingStageInput(c).materials.find(row=>row.material.id==='filler')!.material.unit,'pozycja');
  }
  assert.equal(finishingQuantity('wall-repair','filler',{wallArea:10}),null);
  assert.equal(calc('wall-repair',{coarsePaperSheets:1.5}).materials.find(row=>row.material.id==='sandpaper-repair')!.quantityKnown,false);
  assert.equal(calc('skim-coat',{layers:1.5}).materials[0].quantityKnown,false);
  assert.equal(calc('skim-coat',{skimLayerThicknessMm:0.5}).materials[0].quantityKnown,false);
});
test('old area-based repair and combined papers require review without mutating the saved project or substituting a price',()=>{
  const c=calc(),old={...c,quantityModel:'substrate-primer-v1',materials:c.materials.filter(row=>row.material.id!=='finishing-paper-240')},before=JSON.stringify(old);
  const upgraded=upgradeCalculation(old)!;assert.equal(JSON.stringify(old),before);assert.equal(upgraded.materials.filter(row=>row.quantityKnown===false).length,4);
  assert.deepEqual(upgradeCalculation(upgraded),upgraded);
  assert.equal(toPricingStageInput(old).materials.filter(row=>row.material.unit==='pozycja').length,4);
  const ref=getMaterialsForJob(c.jobId,'standard',c.measurements)[0];assert.equal(resolveMaterialQuantity(ref,old),null);
  const altered={...c,materials:c.materials.map((row,i)=>i===0?{...row,material:{...row.material,ean:'5903973104421'}}:row)};
  assert.equal(resolveMaterialQuantity(ref,altered),null);
});
test('same-model leftovers cover raw demand; a different pack, amount or unit cannot silently suppress a purchase',()=>{
  const c=calc(),line=c.materials[0],item:ShoppingItem={id:'i',projectId:'p',materialId:'filler',name:line.material.name,quantity:1.2,unit:line.material.unit,estimatedPrice:0,owned:true,purchased:false,itemType:'material',tier:'standard',createdAt:''};
  assert.equal(projectShopping([item],c)[0].owned,true);assert.equal(projectShopping([item],c)[0].requiredQuantity,1.1);
  assert.ok(!applyProjectShopping(toPricingStageInput(c),c,'p',[item]).stage.materials.some(row=>row.material.id==='filler'));
  for(const bad of [{...item,quantity:1},{...item,unit:'worek'},{...item,name:'Inna masa'}])assert.ok(applyProjectShopping(toPricingStageInput(c),c,'p',[bad]).stage.materials.some(row=>row.material.id==='filler'));
  const next=calc('wall-repair',{fillerPackSize:20});assert.ok(applyProjectShopping(toPricingStageInput(next),next,'p',[item]).stage.materials.some(row=>row.material.id==='filler'));
});
