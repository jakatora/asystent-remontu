import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import snapshot from './fixtures/archi-full-browser.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { observeCastoramaBrowser, type BrowserProductSnapshot } from '../src/lib/castorama-browser-observation';
import { createRemontService } from '../src/shared-backend';

const source=RETAIL_SOURCES.find(row=>row.id==='castorama-opp-archi-full-80-left')!;
const observed=()=>observeCastoramaBrowser(snapshot as BrowserProductSnapshot,source,new Date(snapshot.capturedAt));

test('the actual browser card confirms only the distinct current whole leaf and expires without inventing national branch stock or shipping',()=>{
  const row=observed();assert.equal(row.priceGrosze,35800);assert.equal(row.ean,'5063022524263');
  assert.equal(row.observedAt,snapshot.capturedAt);assert.equal(row.verification?.method,'browser');assert.equal(row.stockPackages,undefined);
  for(const change of [{ean:'5903917782364'},{packageSize:2},{name:'Drzwi pełne OPP Archi 80 prawe białe'}])assert.throws(()=>observeCastoramaBrowser(snapshot as BrowserProductSnapshot,{...source,...change},new Date(snapshot.capturedAt)));
  assert.throws(()=>observeCastoramaBrowser(snapshot as BrowserProductSnapshot,source,new Date(Date.parse(snapshot.capturedAt)+86400000)),/not_current/);
});

test('real HTTP separates old and new Archi identities and refuses to call a partial door set or unquoted freight complete',async t=>{
  // Freeze only the test clock; never change the captured observation date.
  t.mock.timers.enable({apis:['Date'],now:Date.parse(snapshot.capturedAt)});
  const service=createRemontService({initialObservations:[observed()],background:false});
  const api=express();api.use(express.json());api.use(service.router);const server=api.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  const material=(ean:string)=>({material:{id:'door-set-leaf',name:'Archi',category:'door-leaf',unit:'szt',ean},quantity:1});
  const request=async(materials:unknown[])=>{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'interior-doors',materials}],options:{delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();};
  try{
    const old=await request([material('5903917782364')]);assert.equal(old.stages[0].lines[0].resolved,false);
    const current=await request([material('5063022524263')]);assert.equal(current.stages[0].lines[0].resolved,true);assert.equal(current.consolidated.consolidatedTotalGrosze,35800);assert.equal(current.deliveryComparison.best,null);
    const full=await request([material('5063022524263'),{material:{id:'door-set-frame',name:'Kompletna ościeżnica do dobrania',category:'door-frame-set',unit:'szt'},quantity:1}]);
    assert.equal(full.deliveryComparison.best,null);assert.equal(full.deliveryComparison.missingProductCount,1);
  }finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
