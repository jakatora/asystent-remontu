import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import snapshot from './fixtures/tamara-browser.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { observeCastoramaBrowser, type BrowserProductSnapshot } from '../src/lib/castorama-browser-observation';
import { createRemontService } from '../src/shared-backend';

const source=RETAIL_SOURCES.find(row=>row.id==='castorama-tamara-white-15m2')!;
const observed=()=>observeCastoramaBrowser(snapshot as BrowserProductSnapshot,source,new Date(snapshot.capturedAt));
test('native Tamara evidence confirms the whole 1.5m²/15-piece box, never its advertised square-metre price or a national branch stock',()=>{
 const before=JSON.stringify(snapshot),row=observed();assert.equal(row.priceGrosze,5997);assert.equal(row.ean,'5907518303911');assert.equal(row.stockPackages,undefined);assert.match(row.imageUrl!,/5907518303911/);
 assert.equal(row.observedAt,snapshot.capturedAt);assert.equal(JSON.stringify(snapshot),before);
 assert.throws(()=>observeCastoramaBrowser(snapshot as BrowserProductSnapshot,{...source,packageSize:1},new Date(snapshot.capturedAt)));
 assert.throws(()=>observeCastoramaBrowser(snapshot as BrowserProductSnapshot,{...source,ean:'5902610507960'},new Date(snapshot.capturedAt)));
 assert.throws(()=>observeCastoramaBrowser(snapshot as BrowserProductSnapshot,source,new Date(Date.parse(snapshot.capturedAt)+86400000)));
});
test('an absent native brand can only come from the matching visible technical table, while conflicting brands and invented tables are rejected',()=>{
 const native=JSON.parse(snapshot.schemas.find(s=>JSON.parse(s)['@type']==='Product')!);assert.equal(native.brand,undefined);assert.ok(observed());
 assert.throws(()=>observeCastoramaBrowser({...snapshot,tables:undefined} as BrowserProductSnapshot,source,new Date(snapshot.capturedAt)));
 const changed=structuredClone(snapshot);for(const table of changed.tables)for(const row of table)if(row[0]==='Marka')row[1]='Inna marka';
 assert.throws(()=>observeCastoramaBrowser(changed as BrowserProductSnapshot,source,new Date(snapshot.capturedAt)));
 const schemas=snapshot.schemas.map(s=>JSON.parse(s)['@type']==='Product'?JSON.stringify({...JSON.parse(s),brand:'Inna marka'}):s);
 assert.throws(()=>observeCastoramaBrowser({...snapshot,schemas} as BrowserProductSnapshot,source,new Date(snapshot.capturedAt)));
});
test('real HTTP combines tile requirements from two rooms before buying boxes, keeps historical Nati unresolved and never invents delivery',async t=>{
 t.mock.timers.enable({apis:['Date'],now:Date.parse(snapshot.capturedAt)});
 const service=createRemontService({initialObservations:[observed()],background:false}),api=express();api.use(express.json());api.use(service.router);
 const server=api.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const job=(id:string,quantity:number,ean='5907518303911')=>({jobId:id,materials:[{material:{id:'wall-tiles',name:'Glazura Tamara',category:'tile',unit:'m2',ean},quantity}]});
 const request=async(jobs:unknown[],mode='shipping')=>{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs,options:{store:'Castorama',delivery:{mode,postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();};
 try{
  const combined=await request([job('room-a',4.8),job('room-b',1.2)]),line=combined.consolidated.lines[0];
  assert.equal(line.packages[0].count,4);assert.equal(line.packages[0].packageSize,1.5);assert.equal(combined.consolidated.consolidatedTotalGrosze,23988);
  const mixed=await request([job('old',1.2,'5902610507960'),job('new',1.5)]);assert.equal(mixed.stages[0].lines[0].resolved,false);assert.equal(mixed.deliveryComparison.best,null);
  const shipping=await request([job('new',4.8)],'shipping');assert.equal(shipping.deliveryComparison.best,null);
 }finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
