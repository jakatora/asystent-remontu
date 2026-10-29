import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {generateShoppingItems} from './shopping';
import {upgradeCalculation,projectShopping} from './upgrades';
import {applyProjectShopping,shoppingQuantityAction} from '@/features/pricing/projectShoppingInput';
import {parseMeasurements} from '@/shared/lib/measurements';
import {UNDERLAY_JOB,UNDERLAY_MODEL,underlayQuantity,underlayInputVisible,withUnderlayMeasurement} from './underlayInstall';
import type {ShoppingItem} from '@/types/domain';
const job=getJobById(UNDERLAY_JOB)!,m={floorArea:10,underlaySystem:1,underlayFit:1,underlayReservePercent:10,underlayBarrierChoice:3,underlayFoilFit:1,underlayFoilAreaM2:12,underlayTapeM:7};
const calc=(patch:Record<string,number>={})=>calculatorEngine.calculate(job,{...m,...patch});
test('standalone underlay uses measured foil/tape and only adds the declared reserve to the underlay',()=>{
 const c=calc();assert.equal(c.quantityModel,UNDERLAY_MODEL);assert.deepEqual(c.materials.map(l=>l.rawQuantity),[11,12,7]);assert.deepEqual(c.materials.map(l=>l.packs),[2,2,1]);assert.deepEqual(c.materials.map(l=>l.material.unit),['m2','m2','m']);assert.equal(calc({underlayReservePercent:0}).materials[0].rawQuantity,10);assert.equal(calc({underlayReservePercent:20}).materials[1].rawQuantity,12);
});
test('reviewed 3in1 does not buy another barrier and explicit zero tape excludes a roll',()=>{
 const c=calc({underlaySystem:2,underlayBarrierChoice:0,underlayFoilFit:0,underlayFoilAreaM2:NaN,underlayTapeM:0});assert.deepEqual(c.materials.map(l=>l.rawQuantity),[11,0,0]);assert.ok(c.materials.every(l=>l.quantityKnown));assert.equal(toPricingStageInput(c,'standard').materials.length,1);assert.equal(c.materials[0].packs,2);
 const existing=calc({underlayBarrierChoice:4});assert.equal(existing.materials[1].rawQuantity,0);assert.equal(existing.materials[1].quantityKnown,true);
});
test('missing compatibility, quantity or foil decision remains unresolved rather than a free complete purchase',()=>{
 for(const patch of [{underlayFit:0},{underlaySystem:0},{underlayFoilFit:0},{underlayFoilAreaM2:9},{underlayBarrierChoice:0},{underlayTapeM:NaN}] as Record<string,number>[]){const c=calc(patch);assert.ok(c.materials.some(l=>l.quantityKnown===false));assert.ok(toPricingStageInput(c,'standard').materials.some(l=>l.material.unit==='pozycja'));}
 assert.equal(underlayQuantity('vapor-barrier',{...m,underlayFoilAreaM2:12}),12);
});
test('tiers preserve the chosen exact underlay and barrier, with strict package/EAN/unit validation',()=>{
 const c=calc();for(const tier of ['economy','standard','better']as const){assert.deepEqual(toPricingStageInput(c,tier).materials.map(l=>l.material.ean),['5063022038289','5905167875223','5905167698778']);assert.equal(getMaterialsForJob(UNDERLAY_JOB,tier,c.measurements).length,3);}
 const ref=getMaterialsForJob(UNDERLAY_JOB,'standard',c.measurements)[1];assert.equal(resolveMaterialQuantity(ref,c)?.quantity,12);assert.equal(resolveMaterialQuantity({...ref,packageSize:100},c),null);assert.equal(resolveMaterialQuantity(ref,{...c,quantityModel:undefined}),null);assert.equal(resolveMaterialQuantity(ref,{...c,materials:c.materials.map((l,i)=>i===1?{...l,material:{...l.material,unit:'rolka'}}:l)}),null);
});
test('foil changes and underlay changes require renewed compatibility and hide only irrelevant fields',()=>{
 const raw=Object.fromEntries(Object.entries(m).map(([k,v])=>[k,String(v)]));assert.equal(withUnderlayMeasurement(raw,'underlaySystem',2).underlayFit,'0');assert.equal(withUnderlayMeasurement(raw,'underlayBarrierChoice',1).underlayFoilFit,'0');assert.equal(underlayInputVisible(UNDERLAY_JOB,'underlayBarrierChoice',{...m,underlaySystem:2}),false);assert.equal(underlayInputVisible(UNDERLAY_JOB,'underlayFoilAreaM2',{...m,underlayBarrierChoice:4}),false);
 const hidden={...raw,underlaySystem:'2',underlayFoilAreaM2:'bad'};assert.equal(parseMeasurements(job,hidden).errors.length,0);assert.ok(parseMeasurements(job,{...raw,underlayFoilAreaM2:'9'}).errors.some(e=>e.id==='underlayFoilAreaM2'));
});
test('normal and detailed views agree, use one material schema and no extra foil/tape waste',()=>{
 const c=calc(),d=calculatorEngine.calculateDetailed(job,c.measurements);assert.deepEqual(c.materials.map(l=>[l.quantity,l.rawQuantity,l.cost]),d.materials.map(l=>[l.quantity,l.rawQuantity,l.cost]));assert.equal(d.materials[1].wasteQuantity,0);assert.equal(d.materials[2].wasteQuantity,0);assert.ok(job.materials.every(l=>!('formula'in l)));assert.deepEqual(job.materials.map(l=>l.id),['underlay','vapor-barrier','adhesive-tape']);
});
test('old roll declarations and damaged current snapshots cannot remove required materials from the shared basket',()=>{
 const c=calc(),items=generateShoppingItems('u',c).map((i,n)=>({...i,id:String(n),owned:true,purchased:false}))as ShoppingItem[];assert.equal(applyProjectShopping(toPricingStageInput(c,'standard'),c,'u',items).stage.materials.length,0);
 const old={...c,quantityModel:undefined};assert.ok(upgradeCalculation(old)!.materials.every(l=>l.quantityKnown===false));assert.equal(applyProjectShopping(toPricingStageInput(old,'standard'),old,'u',items).stage.materials.length,3);
 const damaged={...c,measurements:{...c.measurements,underlayFoilAreaM2:1}};assert.equal(toPricingStageInput(damaged,'standard').materials[1].material.unit,'pozycja');
 const short=items.map(i=>i.materialId==='adhesive-tape'?{...i,customQuantity:1}:i),reviewed=projectShopping(short,c);assert.equal(shoppingQuantityAction(UNDERLAY_JOB,reviewed.find(i=>i.materialId==='adhesive-tape')!).allowed,false);assert.equal(applyProjectShopping(toPricingStageInput(c,'standard'),c,'u',short).stage.materials.length,1);
});
