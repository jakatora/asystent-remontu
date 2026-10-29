import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {applyProjectShopping} from '@/features/pricing/projectShoppingInput';
import {upgradeCalculation,projectShopping} from './upgrades';
import {parseMeasurements} from '@/shared/lib/measurements';
import {SOCKET_FRAME_JOB,SOCKET_FRAME_MODEL,socketFrameQuantity} from './socketFrames';
import type {ShoppingItem} from '@/types/domain';

const m={frameCount:10,frameSeriesConfirmed:1,frameLayout:2,frameDoubleCount:2,frameTripleCount:1};
const make=(patch={})=>calculatorEngine.calculate(getJobById(SOCKET_FRAME_JOB)!,{...m,...patch});
test('mixed frames are whole pieces; total10 includes7single2double1triple without opening multiplication or waste',()=>{
 const c=make({faucetCount:49});assert.equal(c.quantityModel,SOCKET_FRAME_MODEL);assert.deepEqual(c.materials.map(l=>l.rawQuantity),[7,2,1]);assert.deepEqual(c.materials.map(l=>l.packs),[7,2,1]);assert.equal(c.totalCost,46.90);
 const stage=toPricingStageInput(c);assert.deepEqual(stage.materials.map(l=>l.quantity),[7,2,1]);assert.deepEqual(stage.materials.map(l=>l.material.ean),['3606480527166','3606480527180','3606480527203']);
});
test('single-only choice omits other frame types, including stale hidden mixed counts',()=>{
 for(const n of [1,5,50]){const c=make({frameCount:n,frameLayout:1,frameDoubleCount:49,frameTripleCount:49});assert.deepEqual(c.materials.map(l=>l.rawQuantity),[n,0,0]);assert.equal(toPricingStageInput(c).materials.length,1);}
 const c=make({frameCount:5,frameDoubleCount:3,frameTripleCount:2});assert.deepEqual(toPricingStageInput(c).materials.map(l=>l.quantity),[3,2]);
});
test('unknown compatibility/layout and invalid or overallocated counts remain unresolved',()=>{
 for(const p of [{frameSeriesConfirmed:0},{frameLayout:0},{frameDoubleCount:undefined},{frameTripleCount:undefined},{frameDoubleCount:10},{frameTripleCount:1.5},...[0,-1,1.5,51,NaN,Infinity].map(frameCount=>({frameCount}))]){const c=make(p);assert.equal(socketFrameQuantity('socket-frames',c.measurements),null);assert.ok(c.materials.every(l=>l.quantityKnown===false));assert.ok(toPricingStageInput(c).materials.every(l=>!l.material.ean));}
});
test('normal and detailed calculations agree on the three exact products and omit zero types',()=>{
 const a=make(),b=calculatorEngine.calculateDetailed(getJobById(SOCKET_FRAME_JOB)!,m);assert.equal(b.quantityModel,SOCKET_FRAME_MODEL);assert.deepEqual(b.materials.map(l=>[l.rawQuantity,l.quantity,l.cost,l.quantityKnown]),a.materials.map(l=>[l.rawQuantity,l.quantity,l.cost,l.quantityKnown]));
});
test('parser hides irrelevant split inputs and rejects impossible whole-frame totals',()=>{
 const job=getJobById(SOCKET_FRAME_JOB)!;assert.equal(parseMeasurements(job,{frameCount:'5',frameSeriesConfirmed:'1',frameLayout:'1',frameDoubleCount:'bad'}).errors.length,0);
 for(const raw of [{frameCount:'5',frameDoubleCount:'5',frameTripleCount:'1'},{frameCount:'5',frameDoubleCount:'1.5',frameTripleCount:'1'},{frameCount:'5',frameDoubleCount:'2'}])assert.ok(parseMeasurements(job,{frameSeriesConfirmed:'1',frameLayout:'2',...raw}).errors.length>0);
});
test('historical faucet-based snapshots and altered saved identities or quantities cannot acquire current prices',()=>{
 const c=make(),old={...c,quantityModel:undefined},before=JSON.stringify(old);assert.ok(upgradeCalculation(old)!.materials.every(l=>l.quantityKnown===false));assert.equal(JSON.stringify(old),before);
 const bad={...c,materials:[{...c.materials[0],rawQuantity:1},...c.materials.slice(1)]};assert.equal(toPricingStageInput(bad).materials[0].material.ean,undefined);
 const missing=upgradeCalculation({...c,materials:[c.materials[0]]})!;assert.equal(missing.materials.length,3);assert.equal(missing.materials[1].quantityKnown,false);
});
test('owned single frames cannot hide changed counts, unknown series or different frame types',()=>{
 const c=make(),item={id:'owned-frame',projectId:'qa',materialId:'socket-frames',name:c.materials[0].material.name,unit:'szt',quantity:7,owned:true,purchased:true,itemType:'material'} as ShoppingItem;
 const a=applyProjectShopping(toPricingStageInput(c),c,'qa',[item]);assert.equal(a.stage.materials.length,2);assert.deepEqual(a.stage.materials.map(l=>l.quantity),[2,1]);
 for(const d of [make({frameCount:11}),make({frameSeriesConfirmed:0}),{...c,quantityModel:undefined}]){assert.equal(projectShopping([item],d)[0].owned,false);assert.equal(applyProjectShopping(toPricingStageInput(d),d,'qa',[item]).stage.materials.length,3);}
});
test('frame replacement retains the existing input/material/job IDs and removes the unsafe live-work reassurance',()=>{
 const job=getJobById(SOCKET_FRAME_JOB)!;assert.ok(job.measurementInputs.some(i=>i.id==='frameCount'));assert.ok(job.materials.some(i=>i.id==='socket-frames'));assert.ok(job.materials.every(i=>!('formula'in i)));assert.match(job.warningRules[0].message,/odłącz zasilanie/);assert.doesNotMatch(job.warningRules[0].message,/NIE wymaga/);
});
