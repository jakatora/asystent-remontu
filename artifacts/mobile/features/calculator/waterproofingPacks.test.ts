import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine,computeRawQuantity} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {getProductPhoto} from '@/data/products/photos';
import {generateShoppingItems} from './shopping';
import {projectShopping} from './upgrades';
import {WATERPROOFING_JOB,WATERPROOFING_MODEL,waterproofingInputs,waterproofingInputDefinition,waterproofingInputVisible,waterproofingQuantity} from './waterproofing';
const base={wallArea:10,floorArea:5,perimeter:10,hydroSystem:3,hydroSubstrate:1,hydroPrimerPack:5,hydroTapeOverlaps:8,hydroInsideCorners:4,hydroOutsideCorners:1,hydroWallCollars:3,hydroFloorCollars:1,hydroCollarFit:1};
const job=getJobById(WATERPROOFING_JOB)!;
const calculate=(patch:Record<string,number>={})=>calculatorEngine.calculate(job,{...base,...patch});

test('three newly selectable buckets keep exact reviewed identities in one complete seven-product Mapei system',()=>{
 for(const [choice,ean,size]of [[4,'8022452242489',5],[5,'8022452242496',10],[6,'8022452249266',3]] as const){
  const calc=calculate({hydroSystem:choice}),input=toPricingStageInput(calc),membrane=input.materials.find(l=>l.material.id==='membrane')!;
  assert.equal(calc.quantityModel,WATERPROOFING_MODEL);assert.equal(calc.quantityIssues?.length,0);assert.equal(input.materials.length,7);assert.equal(membrane.material.ean,ean);assert.equal(membrane.material.unit,'kg');assert.equal(membrane.quantity,19.8);
  const line=calc.materials.find(l=>l.material.id==='membrane')!;assert.equal(line.material.packaging?.size,size);assert.equal(computeRawQuantity(line.material,calc.measurements),19.8);
  assert.equal(input.materials.find(l=>l.material.id==='primer-waterproof')!.quantity,3);assert.equal(input.materials.find(l=>l.material.id==='sealing-tape')!.quantity,10.4);
  assert.equal(input.materials.find(l=>l.material.id==='hydro-collar-wall')!.quantity,3);
  assert(input.materials.every(l=>l.material.ean&&getProductPhoto({ean:l.material.ean})));
  for(const tier of ['economy','standard','better'] as const){const refs=getMaterialsForJob(WATERPROOFING_JOB,tier,calc.measurements);assert.equal(refs.length,7);assert(refs.every(r=>r.brand==='Mapei'));assert.equal(refs.find(r=>r.materialType==='waterproofing')!.packageSize,size);}
 }
});

test('existing saved 5/10/20 kg choices preserve their previous GTINs and identical physical needs',()=>{
 for(const [choice,ean]of [[1,'8022452002113'],[2,'8022452002120'],[3,'8022452242502']] as const){const c=calculate({hydroSystem:choice}),m=toPricingStageInput(c).materials.find(l=>l.material.id==='membrane')!;assert.equal(m.material.ean,ean);assert.equal(m.quantity,19.8);}
 const saved=calculate({hydroSystem:1}),roundTrip=JSON.parse(JSON.stringify(saved));assert.deepEqual(toPricingStageInput(roundTrip),toPricingStageInput(saved));assert.equal(saved.measurements.hydroSystem,1);
});

test('new-project options expose 3/5/10/20 kg while the editor can restore a previously saved old identity',()=>{
 const input=waterproofingInputs.find(i=>i.id==='hydroSystem')!,before=JSON.stringify(input);
 const fresh=waterproofingInputDefinition(WATERPROOFING_JOB,input,{hydroSystem:0});assert.deepEqual(fresh.options?.map(o=>o.value),[0,6,4,5,3]);assert.equal(JSON.stringify(input),before);
 const saved=waterproofingInputDefinition(WATERPROOFING_JOB,input,{hydroSystem:1});assert(saved.options?.some(o=>o.value===1));
 const changed=waterproofingInputDefinition(WATERPROOFING_JOB,input,{hydroSystem:4},1);assert(changed.options?.some(o=>o.value===1));assert(changed.options?.some(o=>o.value===4));
 assert.equal(waterproofingInputDefinition('paint',input,{hydroSystem:0}),input);
});

test('all three choices retain detail gates and leave unconfirmed collars or unknown input unresolved',()=>{
 for(const hydroSystem of [4,5,6]){assert(waterproofingInputVisible(WATERPROOFING_JOB,'hydroSubstrate',{hydroSystem:String(hydroSystem)}));assert(!waterproofingInputVisible(WATERPROOFING_JOB,'hydroMembraneConsumption',{hydroSystem,hydroAdvanced:0}));assert(waterproofingInputVisible(WATERPROOFING_JOB,'hydroMembraneConsumption',{hydroSystem,hydroAdvanced:1}));assert.equal(toPricingStageInput(calculate({hydroSystem,hydroCollarFit:0})).materials.filter(l=>l.material.unit==='pozycja').length,2);}
 assert.equal(waterproofingQuantity('membrane',{...base,hydroSystem:7}),null);
 const zero=toPricingStageInput(calculate({hydroSystem:6,hydroInsideCorners:0,hydroOutsideCorners:0,hydroWallCollars:0,hydroFloorCollars:0,hydroCollarFit:0}));assert.equal(zero.materials.length,3);
});

test('changing the bucket identity requires re-confirming owned membrane while compatible accessories remain accounted for',()=>{
 const old=calculate({hydroSystem:1}),next=calculate({hydroSystem:4}),items=generateShoppingItems('qa',old).map((item,i)=>({...item,id:'owned-'+i,owned:true,purchased:true,needsQuantityConfirmation:false}));
 const reviewed=projectShopping(items,next),membrane=reviewed.find(i=>i.materialId==='membrane')!;assert.equal(membrane.owned,false);assert.equal(membrane.purchased,false);assert.equal(membrane.needsQuantityConfirmation,true);assert.equal(next.measurements.hydroSystem,4);
});
