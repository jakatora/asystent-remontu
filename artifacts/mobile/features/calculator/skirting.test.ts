import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine,computeRawQuantity} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {upgradeCalculation,projectShopping} from './upgrades';
import {generateShoppingItems} from './shopping';
import {SKIRTING_MODEL,skirtingPieces,skirtingQuantity,skirtingInputVisible} from './skirting';
import type {CalculationResult} from '@/types/domain';
const job=getJobById('skirting-boards')!;
const m={perimeter:18,skirtingSystem:1,skirtingInside:5,skirtingOutside:3,skirtingConnectors:5,skirtingEndLeft:3,skirtingEndRight:1,skirtingLayoutFit:1,skirtingMounting:1,skirtingGlueCartridges:2,skirtingMountFit:1};
const calc=(patch:Record<string,number>={})=>calculatorEngine.calculate(job,{...m,...patch});
test('INDO recipe restores exact stock pieces, six compatible products and handed endcaps without doubling cartridges',()=>{
 const c=calc(),input=toPricingStageInput(c);assert.equal(c.quantityModel,SKIRTING_MODEL);assert.equal(calculatorEngine.calculateDetailed(job,m).quantityModel,SKIRTING_MODEL);assert.equal(c.quantityIssues?.length,0);assert.equal(input.materials.length,6);
 for(const line of c.materials)assert.equal(computeRawQuantity(line.material,m),line.rawQuantity);
 assert.equal(skirtingPieces(m),8);assert.equal(input.materials.find(l=>l.material.id==='skirting')!.quantity,20);
 const pair=input.materials.find(l=>l.material.id==='skirting-endcaps')!;assert.equal(pair.quantity,3);assert.deepEqual(pair.indoEndcaps,{version:1,left:3,right:1});assert.equal(pair.material.unit,'kpl');
 assert.equal(input.materials.find(l=>l.material.id==='skirting-glue')!.quantity,600);assert.equal(input.materials.find(l=>l.material.id==='skirting-glue')!.material.ean,'5905167788264');
 for(const tier of ['economy','standard','better']as const){const refs=getMaterialsForJob(job.id,tier,m);assert.equal(refs.length,6);assert.ok(refs.every(r=>r.brand==='Arbiton'));}
});
test('missing choices, unsupported counts, layout and mounting remain unknown while explicit zero omits accessories',()=>{
 const bare=toPricingStageInput(calculatorEngine.calculate(job,{perimeter:18}));assert.equal(bare.materials.filter(l=>l.material.unit==='pozycja').length,7);
 assert.equal(skirtingQuantity('skirting',{...m,skirtingLayoutFit:0}),null);assert.equal(skirtingQuantity('skirting-glue',{...m,skirtingMountFit:0}),null);assert.equal(skirtingQuantity('skirting-glue',{...m,skirtingGlueCartridges:0}),null);
 assert.equal(skirtingQuantity('skirting-endcaps',{...m,skirtingEndLeft:NaN}),null);assert.equal(skirtingQuantity('corner-inside',{...m,skirtingInside:1.5}),null);
 const none=toPricingStageInput(calc({skirtingInside:0,skirtingOutside:0,skirtingConnectors:0,skirtingEndLeft:0,skirtingEndRight:0,skirtingMounting:2}));assert.equal(none.materials.length,1);
 assert.equal(skirtingPieces({...m,perimeter:2.5,skirtingReservePercent:0}),1);assert.equal(skirtingPieces({...m,perimeter:2.500001,skirtingReservePercent:0}),2);assert.equal(skirtingPieces({...m,skirtingExtraPieces:2}),10);
 assert.equal(skirtingInputVisible(job.id,'skirtingGlueCartridges',{skirtingSystem:'1',skirtingMounting:'1'}),true);assert.equal(skirtingInputVisible(job.id,'skirtingGlueCartridges',{skirtingSystem:'1',skirtingMounting:'2'}),false);
});
test('old generic skirting JSON cannot claim a current kit or keep an unconfirmed owned accessory',()=>{
 const current=calc(),old={...current,quantityModel:undefined,materials:current.materials.slice(0,3).map(l=>({...l,quantityKnown:undefined}))}as CalculationResult,before=JSON.stringify(old),reviewed=upgradeCalculation(old)!;
 assert.equal(JSON.stringify(old),before);assert.ok(reviewed.materials.length>=7);assert.ok(reviewed.materials.every(l=>l.quantityKnown===false));
 const owned=generateShoppingItems('qa',current).map((item,i)=>({...item,id:'owned-'+i,owned:true,purchased:true,needsQuantityConfirmation:true}));assert.ok(projectShopping(owned,current).every(i=>!i.owned&&!i.purchased));
});
