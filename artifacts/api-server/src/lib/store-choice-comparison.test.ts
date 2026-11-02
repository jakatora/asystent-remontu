import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../shared-backend';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

test('one selected-store HTTP request also returns all material choices without quoting other retailers',async()=>{
 const fixture=JSON.parse(readFileSync(new URL('../../test/fixtures/store-choice-comparison.json',import.meta.url),'utf8')),anchor=Date.parse(fixture.anchor),NativeDate=Date,quotedStores:string[]=[];
 const signature=(order:DeliveredStoreBasket)=>JSON.stringify([order.store,order.materialsGrosze,order.lines.flatMap(line=>line.packages.map(pack=>[pack.offerId,pack.count,pack.packageSize,pack.unitPriceGrosze])).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))]);
 // Controlled replay only: keep original observation/quote dates unchanged.
 globalThis.Date=new Proxy(NativeDate,{construct(target,args){return Reflect.construct(target,args.length?args:[anchor]);},get(target,property,receiver){return property==='now'?()=>anchor:Reflect.get(target,property,receiver);}});
 const service=createRemontService({background:false,initialObservations:fixture.observations,fetchImpl:async()=>{assert.fail('The comparison must not initiate a retailer request');},basketQuoter:async(order,postcode)=>{quotedStores.push(order.store);assert.equal(order.store,'Decowant');assert.equal(postcode,'30-001');return signature(order)===signature(fixture.order)?{quote:structuredClone(fixture.order.quote)}:{reason:'controlled_fixture_missing_quote'};}}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');
 try{
  await new Promise<void>(r=>server.once('listening',r));const endpoint='http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project';
  const post=async(body:any)=>{const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');return response.json() as Promise<any>;};
  const all=structuredClone(fixture.request);delete all.options.store;delete all.options.delivery.postalCode;const materialOnly=await post(all);assert.equal(quotedStores.length,0);
  const original=await post(fixture.request);assert.equal(original.storeChoiceComparison,undefined);
  const chosen=await post({...fixture.request,options:{...fixture.request.options,includeStoreChoices:true}});const{storeChoiceComparison,...main}=chosen;assert.deepEqual(main,original);
  assert.deepEqual(storeChoiceComparison,{stages:materialOnly.stages,consolidated:materialOnly.consolidated,storeComparison:materialOnly.storeComparison});assert.equal('deliveryComparison' in storeChoiceComparison,false);assert(storeChoiceComparison.storeComparison.stores.some((s:any)=>s.store==='Lobo'));assert(chosen.storeComparison.stores.every((s:any)=>s.store==='Decowant'));assert(quotedStores.length>0&&quotedStores.every(store=>store==='Decowant'));assert.equal(chosen.deliveryComparison.best.totalGrosze,56361);
  assert.deepEqual(chosen.stages.flatMap((s:any)=>s.lines.map((l:any)=>l.quantity)),fixture.request.jobs.flatMap((s:any)=>s.materials.map((l:any)=>l.quantity)));
 }finally{service.close();await new Promise<void>(r=>server.close(()=>r()));globalThis.Date=NativeDate;}
});
