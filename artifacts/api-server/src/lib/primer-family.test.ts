import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../shared-backend';
import fixtures from './fixtures/primer-family-wave164.json';
import {PRIMER_G_PRO_FAMILY,PRIMER_G_PRO_FAMILY_NAME} from '../../../../lib/pricing-service/src/reviewed-package-families';

function request(quantity=6,patch:Record<string,unknown>={}){return{jobs:[{jobId:'additional-materials',materials:[{material:{id:'primer',name:PRIMER_G_PRO_FAMILY_NAME,unit:'l',category:'primer',packageFamily:PRIMER_G_PRO_FAMILY,...patch},quantity}]}],options:{refreshPrices:false,delivery:{mode:'shipping'}}};}
async function fixtureServer(run:(url:string,calls:string[])=>Promise<void>,change?:(item:any)=>void){
  const calls:string[]=[];
  const service=createRemontService({background:false,initialObservations:[],fetchImpl:async input=>{
    const url=String(input),id=Number(new URL(url).pathname.split('/').at(-1)),card=fixtures.cards.find(c=>c.item.id===id);assert.ok(card,url);calls.push(card.sourceId);const item=structuredClone(card.item);change?.(item);return Response.json(item);
  },basketQuoter:async()=>{throw Error('postcode required before native cart');}});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  try{await run('http://127.0.0.1:'+(server.address() as any).port,calls);}finally{service.close();await new Promise(r=>server.close(r));}
}
const post=(url:string,body:ReturnType<typeof request>)=>fetch(url+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});

test('a selected family checks all four reviewed native pack cards even without a manual refresh',async()=>{
  await fixtureServer(async(url,calls)=>{const response=await post(url,request());assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.materialsTotalGrosze,11780);assert.deepEqual(calls.slice().sort(),fixtures.cards.map(c=>c.sourceId).sort());assert.deepEqual(data.priceRefresh.confirmedOfferIds.slice().sort(),calls.slice().sort());assert.deepEqual(data.priceRefresh.failedOfferIds,[]);assert.equal(data.deliveryComparison.best,null);});
});

test('subsequent demand changes reuse the bounded recent checks instead of re-reading every card',async()=>{
  await fixtureServer(async(url,calls)=>{await post(url,request());const second=await post(url,request(21));assert.equal(second.status,200);const data:any=await second.json();assert.equal(data.materialsTotalGrosze,28690);assert.equal(calls.length,4);assert.equal(data.priceRefresh.status,'recent');});
});

test('unknown family identifiers fail validation; wrong units or names do not refresh arbitrary products',async()=>{
  await fixtureServer(async(url,calls)=>{assert.equal((await post(url,request(6,{packageFamily:'arbitrary-family'}))).status,400);
    for(const patch of [{unit:'kg'},{name:'Primer G'},{category:'paint'}]){const response=await post(url,request(6,patch));assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.stages[0].lines[0].resolved,false);}
    assert.deepEqual(calls,[]);
  });
});

test('an unavailable one-litre member is reported and the remaining verified cans can cover the family demand',async()=>{
  await fixtureServer(async(url)=>{const r=await post(url,request());assert.equal(r.status,200);const data:any=await r.json();assert.equal(data.materialsTotalGrosze,13990);assert.deepEqual(data.priceRefresh.failedOfferIds,['rabdom-primer-g-pro-1l']);assert.equal(data.stages[0].lines[0].resolved,true);},p=>{if(p.id===10970)p.can_buy=false;});
});

test('when every member is unavailable, the family stays unresolved without a freight-free payable total',async()=>{
  await fixtureServer(async(url)=>{const r=await post(url,request());assert.equal(r.status,200);const data:any=await r.json();assert.equal(data.stages[0].lines[0].resolved,false);assert.equal(data.deliveryComparison.best,null);assert.equal(data.priceRefresh.failedOfferIds.length,4);},p=>{p.can_buy=false;});
});

test('a positive sub-microlitre family remainder still has a real one-litre purchase cost',async()=>{
  await fixtureServer(async(url)=>{const r=await post(url,request(1e-8));assert.equal(r.status,200);const data:any=await r.json();assert.equal(data.materialsTotalGrosze,3790);assert.equal(data.stages[0].lines[0].resolved,true);});
});
