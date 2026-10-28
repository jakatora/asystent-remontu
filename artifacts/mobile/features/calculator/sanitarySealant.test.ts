import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine, computeRawQuantity } from './engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { upgradeCalculation, upgradeProject, projectShopping } from './upgrades';
import { applyProjectShopping, shoppingQuantityAction } from '@/features/pricing/projectShoppingInput';
import { buildRenovationBasket } from '@/features/pricing/renovationBasket';
import { SANITARY_MODEL, sanitaryQuantity, sanitarySiliconeId, SANITARY_STOP_REFERENCE } from './sanitarySealant';
import { getProductPhoto } from '@/data/products/photos';
import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';

const calc=(jobId='silicone-refresh',more:Record<string,number>={})=>calculatorEngine.calculate(getJobById(jobId)!,{siliconeLength:4,linearMeters:4,...more});
const silicone=(c:CalculationResult)=>c.materials.find(line=>line.material.id===sanitarySiliconeId(c.jobId))!;
const project=(c:CalculationResult):Project=>({id:'p',name:'Wymiana spoin',jobId:c.jobId,jobName:'Silikon',categoryId:'silicone',measurements:c.measurements,calculationResult:c,status:'planning',createdAt:'',updatedAt:''});
const owned=(c:CalculationResult,id:string,quantity:number):ShoppingItem=>{const line=c.materials.find(row=>row.material.id===id)!;return{id:'owned-'+id,projectId:'p',materialId:id,name:line.material.name,quantity,unit:line.material.unit,estimatedPrice:0,owned:true,purchased:false,itemType:'material',tier:'standard',createdAt:''};};

test('refresh uses the original siliconeLength input and never drops the new silicone from its shopping basket',()=>{
  const first=calc(),second=calc('silicone-refresh',{siliconeLength:8,linearMeters:999});
  assert.equal(silicone(first).rawQuantity,110);assert.equal(silicone(second).rawQuantity,220);
  assert.equal(first.quantityModel,SANITARY_MODEL);
  assert.ok(toPricingStageInput(first).materials.some(line=>line.material.id==='fresh-silicone'&&line.quantity===110));
  assert.equal(computeRawQuantity(silicone(first).material,first.measurements),110);
  assert.equal(silicone(calc('silicone-sealing',{linearMeters:8,siliconeLength:999})).rawQuantity,220);
});

test('volume reflects actual width, depth and explicit reserve, without prematurely rounding each room to a cartridge',()=>{
  assert.equal(silicone(calc('silicone-refresh',{sealantWidthMm:10})).rawQuantity,220);
  assert.equal(silicone(calc('silicone-refresh',{sealantWidthMm:10,sealantReservePercent:0})).rawQuantity,200);
  assert.equal(silicone(calc('silicone-refresh',{sealantWidthMm:10,sealantDepthMm:10})).rawQuantity,440);
  const edge=calc('silicone-refresh',{siliconeLength:10.181819});
  assert.ok(silicone(edge).rawQuantity!>280);assert.equal(silicone(edge).packs,2);
  assert.ok(toPricingStageInput(edge).materials.find(line=>line.material.id==='fresh-silicone')!.quantity>280);
});

test('zero, missing, nonfinite, unsupported models and out-of-range joint dimensions remain unconfirmed, not a free missing material',()=>{
  const invalid:Record<string,number>[]=[{siliconeLength:0},{siliconeLength:NaN},{siliconeLength:Infinity},{sealantWidthMm:4},{sealantWidthMm:31},{sealantDepthMm:0},{sealantDepthMm:31},{sealantReservePercent:-1},{sealantReservePercent:31},{sealantModel:2}];
  for(const more of invalid){
    const c=calc('silicone-refresh',more);assert.equal(silicone(c).quantityKnown,false,JSON.stringify(more));
    assert.equal(toPricingStageInput(c).materials.find(line=>line.material.id==='fresh-silicone')!.material.unit,'pozycja');
  }
  assert.equal(sanitaryQuantity('silicone-refresh','fresh-silicone',{}),null);
  assert.equal(calc('silicone-refresh',{sealantTapeModel:2}).materials.find(line=>line.material.id==='masking-tape-sil')!.quantityKnown,false);
  assert.equal(calc('silicone-refresh',{sealantRemoverPacks:1.5}).materials.find(line=>line.material.id==='silicone-remover')!.quantityKnown,false);
});

test('actual 280ml models, tape width and independent 100ml remover survive all price tiers',()=>{
  for(const model of [0,1])for(const tapeModel of [0,1])for(const tier of ['economy','standard','better'] as const){
    const c=calc('silicone-refresh',{sealantModel:model,sealantTapeModel:tapeModel}),input=toPricingStageInput(c,tier);
    assert.equal(input.materials.find(line=>line.material.id==='fresh-silicone')!.material.ean,model?'5411183200326':'5411183157064');
    assert.equal(input.materials.find(line=>line.material.id==='masking-tape-sil')!.material.ean,tapeModel?'5907758507285':'5907758515952');
    assert.equal(input.materials.find(line=>line.material.id==='silicone-remover')!.quantity,100);
    assert.equal(input.materials.find(line=>line.material.id==='masking-tape-sil')!.quantity,8.8);
    assert.ok(getProductPhoto(silicone(c).material));
    const refs=getMaterialsForJob(c.jobId,tier,c.measurements);assert.equal(refs.filter(row=>row.materialType==='silicone').length,1);
    if(model)assert.equal(refs.find(row=>row.materialType==='silicone')!.id,SANITARY_STOP_REFERENCE);
  }
});

test('new sealing can explicitly omit remover and tape while renovation refresh keeps a separately declared remover allowance',()=>{
  const first=toPricingStageInput(calc('silicone-sealing',{sealantTapeNeeded:0,sealantRemoverPacks:0}));
  assert.deepEqual(first.materials.map(line=>line.material.id),['silicone']);
  assert.equal(sanitaryQuantity('silicone-refresh','masking-tape-sil',{sealantTapeNeeded:0}),0);
  const second=toPricingStageInput(calc('silicone-refresh',{sealantRemoverPacks:2,sealantTapeNeeded:0}));
  assert.equal(second.materials.find(line=>line.material.id==='silicone-remover')!.quantity,200);assert.equal(second.materials.length,2);
});

test('older saved zero-silicone calculations and ownership declarations remain visible for measurement review without changing saved JSON',()=>{
  const current=calc(),old={...current,quantityModel:undefined,materials:current.materials.filter(line=>line.material.id!=='masking-tape-sil').map(line=>line.material.id==='fresh-silicone'?{...line,rawQuantity:0,quantity:0}:line)},saved=JSON.stringify(old);
  const updated=upgradeCalculation(old)!;assert.equal(JSON.stringify(old),saved);
  assert.equal(updated.materials.filter(line=>line.quantityKnown===false).length,3);
  assert.equal(toPricingStageInput(old).materials.length,3);
  assert.ok(toPricingStageInput(old).materials.every(line=>line.material.unit==='pozycja'));
  assert.deepEqual(upgradeCalculation(updated),updated);
  const p=project(old),raw=JSON.stringify(p);assert.equal(upgradeProject(p).calculationResult!.materials.length,3);assert.equal(JSON.stringify(p),raw);
  assert.equal(buildRenovationBasket([p],['p'],'standard').measurementReviews[0].materials.length,3);
  const item=owned(current,'fresh-silicone',280);assert.equal(projectShopping([item],old)[0].owned,false);
  assert.equal(applyProjectShopping(toPricingStageInput(old),old,'p',[item]).stage.materials.length,3);
});

test('sufficient same-product leftovers cover raw demand; another model, unit or insufficient quantity cannot suppress a required purchase',()=>{
  const c=calc(),item=owned(c,'fresh-silicone',120),before=JSON.stringify(item);
  assert.equal(projectShopping([item],c)[0].owned,true);assert.equal(projectShopping([item],c)[0].requiredQuantity,110);
  assert.ok(!applyProjectShopping(toPricingStageInput(c),c,'p',[item]).stage.materials.some(line=>line.material.id==='fresh-silicone'));
  for(const bad of [{...item,quantity:100},{...item,unit:'kartusze'},{...item,name:'Inny silikon'},{...item,customQuantity:NaN}])assert.ok(applyProjectShopping(toPricingStageInput(c),c,'p',[bad]).stage.materials.some(line=>line.material.id==='fresh-silicone'));
  assert.ok(applyProjectShopping(toPricingStageInput(calc('silicone-refresh',{sealantModel:1})),calc('silicone-refresh',{sealantModel:1}),'p',[item]).stage.materials.some(line=>line.material.id==='fresh-silicone'));
  assert.equal(JSON.stringify(item),before);
  const short=projectShopping([{...item,quantity:100,customQuantity:100}],c)[0];assert.deepEqual(shoppingQuantityAction(c.jobId,short),{allowed:false});
});

test('existing explicitly identified cartridge allowances become 280ml only for their exact reviewed product',()=>{
  for(const[jobId,id]of [['wall-tiles-bathroom','wall-silicone'],['toilet-installation','wc-silicone'],['kitchen-countertop','countertop-silicone']]){
    const c=calculatorEngine.calculate(getJobById(jobId)!,{wallArea:10,linearMeters:10,toiletCount:1}),line=c.materials.find(row=>row.material.id===id)!;
    for(const tier of ['economy','standard','better'] as const){const input=toPricingStageInput(c,tier).materials.find(row=>row.material.id===id)!;assert.equal(input.material.unit,'ml');assert.equal(input.quantity,line.rawQuantity!*280);}
    const ref=getMaterialsForJob(jobId,'standard',c.measurements).find(row=>row.id==='mat-sanitary-silicone-soudal-280ml')!;
    assert.equal(resolveMaterialQuantity(ref,{...c,materials:c.materials.map(row=>row.material.id===id?{...row,material:{...row.material,brand:'Inny silikon 310ml'}}:row)}),null);
  }
});

test('both calculator views use the same model, amounts and full packages; each new sealing recipe remains homogeneous legacy data',()=>{
  for(const id of ['silicone-refresh','silicone-sealing']){
    const c=calc(id),d=calculatorEngine.calculateDetailed(getJobById(id)!,c.measurements);
    assert.equal(c.totalCost,d.totalCost);assert.equal(c.quantityModel,d.quantityModel);
    assert.deepEqual(c.materials.map(line=>['ean' in line.material?line.material.ean:undefined,line.rawQuantity,line.quantity]),d.materials.map(line=>['ean' in line.material?line.material.ean:undefined,line.rawQuantity,line.quantity]));
    assert.ok(getJobById(id)!.materials.every(material=>!('formula' in material)));
    assert.ok(d.materials.find(line=>line.material.id===sanitarySiliconeId(id))!.explanation.assumptions.some(text=>text.includes('5 × 5 mm')));
    assert.ok(getJobById(id)!.measurementInputs.some(input=>input.id===(id==='silicone-refresh'?'siliconeLength':'linearMeters')));
  }
});
