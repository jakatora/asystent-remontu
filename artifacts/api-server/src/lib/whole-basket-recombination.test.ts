import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../shared-backend';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

test('the historical whole renovation can use the already quoted complete WinBud cart without extra merchant requests',async()=>{
 const fixture=JSON.parse(readFileSync(new URL('../../test/fixtures/whole-basket-recombination.json',import.meta.url),'utf8')),anchor=Date.parse(fixture.anchor),NativeDate=Date;
 const key=(order:DeliveredStoreBasket)=>JSON.stringify([order.store,order.materialsGrosze,order.lines.flatMap(line=>line.packages.map(pack=>[line.product.id,line.unit,pack.offerId,pack.count,pack.packageSize,pack.unitPriceGrosze,pack.cutRoll??null])).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))]);
 const quotes=new Map<string,DeliveredStoreBasket['quote']>(fixture.orders.map((order:DeliveredStoreBasket)=>[key(order),order.quote]));let calls=0;
 // Only this isolated test clock is frozen. Original observations and quote
 // dates are retained verbatim; no historical response becomes a live quote.
 globalThis.Date=new Proxy(NativeDate,{construct(target,args){return Reflect.construct(target,args.length?args:[anchor]);},get(target,property,receiver){return property==='now'?()=>anchor:Reflect.get(target,property,receiver);}});
 const service=createRemontService({background:false,initialObservations:fixture.observations,fetchImpl:async()=>{throw Error('External merchant network disabled in this controlled replay');},basketQuoter:async(order,postcode)=>{assert.equal(postcode,'30-001');calls++;const quote=quotes.get(key(order));return quote?{quote:structuredClone(quote)}:{reason:'controlled_fixture_missing_quote'};}}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');
 try{await new Promise<void>(r=>server.once('listening',r));const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(fixture.request)});assert.equal(response.status,200);const data:any=await response.json(),best=data.deliveryComparison.best;assert.ok(best);assert.ok(best.totalGrosze<=fixture.expectedAtMostGrosze);assert.equal(data.stages.flatMap((stage:any)=>stage.lines).length,16);assert.deepEqual(data.stages.flatMap((stage:any)=>stage.lines.map((line:any)=>line.quantity)),fixture.request.jobs.flatMap((job:any)=>job.materials.map((line:any)=>line.quantity)));assert.ok(calls<=80);assert.equal(best.totalGrosze,best.materialsGrosze+best.deliveryGrosze);assert.ok(best.stores.some((order:any)=>order.store==='WinBud'&&order.lines.some((line:any)=>line.product.id==='remont-8022452113802'&&line.packages.some((pack:any)=>pack.count===4))));assert.ok(!best.stores.some((order:any)=>order.store==='Dam-Bud'));}
 finally{service.close();await new Promise<void>(r=>server.close(()=>r()));globalThis.Date=NativeDate;}
});
