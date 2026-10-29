import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {applyProjectShopping} from '@/features/pricing/projectShoppingInput';
import {upgradeCalculation,projectShopping} from './upgrades';
import {parseMeasurements} from '@/shared/lib/measurements';
import {TRAP_JOB,TRAP_MODEL,trapQuantity} from './trapReplacement';
import type {ShoppingItem} from '@/types/domain';

const m={trapCount:3,trapVariant:1,trapFit:1,trapJoints:1};
const make=(patch={})=>calculatorEngine.calculate(getJobById(TRAP_JOB)!,{...m,...patch});
test('trap count buys exact whole WHB1-32 units without faucet defaults, waste or automatic PTFE',()=>{
 for(const trapCount of [1,3,10]){const c=make({trapCount,faucetCount:49});assert.equal(c.quantityModel,TRAP_MODEL);assert.deepEqual(c.materials.map(l=>l.rawQuantity),[trapCount,0]);assert.equal(c.materials[0].packs,trapCount);const s=toPricingStageInput(c);assert.equal(s.materials.length,1);assert.equal(s.materials[0].quantity,trapCount);assert.equal(s.materials[0].material.ean,'5036484088390');}
});
test('unknown model, incompatible fitting and invalid counts cannot receive a complete price',()=>{
 for(const p of [{trapVariant:0},{trapFit:0},{trapFit:2},...[0,-1,1.5,11,NaN,Infinity].map(trapCount=>({trapCount}))]){const c=make(p);assert.equal(trapQuantity('sink-trap-mat',c.measurements),null);assert.ok(c.materials.every(l=>l.quantityKnown===false));assert.ok(toPricingStageInput(c).materials.every(l=>!l.material.ean));}
});
test('unconfirmed or missing seals, waste and pipe remain an unresolved requirement beside the priced trap',()=>{
 for(const trapJoints of [undefined,0,2]){const c=make({trapJoints});assert.equal(c.materials[0].quantityKnown,true);assert.equal(c.materials[1].quantityKnown,false);const stage=toPricingStageInput(c);assert.equal(stage.materials.length,2);assert.equal(stage.materials[0].material.ean,'5036484088390');assert.equal(stage.materials[1].material.ean,undefined);assert.ok(stage.materials[1].quantity>0);}
});
test('normal and detailed trap calculation share identities and required quantities',()=>{
 const a=make(),b=calculatorEngine.calculateDetailed(getJobById(TRAP_JOB)!,m);assert.equal(b.quantityModel,TRAP_MODEL);assert.deepEqual(b.materials.map(l=>[l.rawQuantity,l.quantity,l.cost,l.quantityKnown]),a.materials.map(l=>[l.rawQuantity,l.quantity,l.cost,l.quantityKnown]));
});
test('old faucet-based snapshots, changed EANs and missing accessory rows are reviewed without mutation',()=>{
 const c=make(),old={...c,quantityModel:undefined},before=JSON.stringify(old);assert.ok(upgradeCalculation(old)!.materials.every(l=>l.quantityKnown===false));assert.equal(JSON.stringify(old),before);
 const altered={...c,materials:[{...c.materials[0],material:{...c.materials[0].material,ean:'8595580556457'}},c.materials[1]]};assert.equal(toPricingStageInput(altered).materials[0].material.ean,undefined);
 const missing=upgradeCalculation({...make({trapJoints:0}),materials:[c.materials[0]]})!;assert.equal(missing.materials.length,2);assert.equal(missing.materials[1].quantityKnown,false);
});
test('owned traps cannot hide increased counts, altered fittings or unresolved connection parts',()=>{
 const c=make(),item={id:'own-trap',projectId:'qa',materialId:'sink-trap-mat',name:c.materials[0].material.name,unit:'szt',quantity:3,owned:true,purchased:true,itemType:'material'} as ShoppingItem;
 assert.equal(applyProjectShopping(toPricingStageInput(c),c,'qa',[item]).stage.materials.length,0);
 for(const d of [make({trapCount:4}),make({trapFit:0}),{...c,quantityModel:undefined}]){assert.equal(projectShopping([item],d)[0].owned,false);assert.ok(applyProjectShopping(toPricingStageInput(d),d,'qa',[item]).stage.materials.length>0);}
 const unknown=make({trapJoints:0}),fake={...item,materialId:'teflon-trap',name:unknown.materials[1].material.name,quantity:1};assert.equal(applyProjectShopping(toPricingStageInput(unknown),unknown,'qa',[fake]).stage.materials.length,2);
});
test('trap replacement preserves legacy IDs and requires whole counts in wizard and editor',()=>{
 const job=getJobById(TRAP_JOB)!;assert.deepEqual(job.materials.map(l=>l.id),['sink-trap-mat','teflon-trap']);assert.ok(job.materials.every(l=>!('formula'in l)));assert.equal(parseMeasurements(job,{trapCount:'3',trapVariant:'1',trapFit:'1',trapJoints:'1'}).errors.length,0);assert.ok(parseMeasurements(job,{trapCount:'1.5'}).errors.length>0);
});
