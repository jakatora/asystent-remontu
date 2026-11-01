import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../shared-backend';
import supplies from './fixtures/mapei-supplies-wave163.json';
import packs from './fixtures/mapegum-packs-wave165.json';
import {RETAIL_SOURCES} from './retail-catalog';
import {MAPEGUM_WPS_FAMILY,MAPEGUM_WPS_FAMILY_NAME} from '../../../../lib/pricing-service/src/reviewed-package-families';
const cards=[...supplies.cards.filter(c=>c.sourceId.includes('mapegum')),...packs.rabCards.filter(c=>c.sourceId.includes('mapegum'))],pages=packs.seweraCards;
function request(quantity=6,patch:Record<string,unknown>={}){return{jobs:[{jobId:'additional-materials',materials:[{material:{id:'membrane',name:MAPEGUM_WPS_FAMILY_NAME,unit:'kg',category:'waterproofing',packageFamily:MAPEGUM_WPS_FAMILY,...patch},quantity}]}],options:{refreshPrices:false,delivery:{mode:'shipping'}}};}
async function fixtureServer(run:(url:string,calls:string[])=>Promise<void>,unavailable=false){
  const calls:string[]=[];
  const service=createRemontService({background:false,initialObservations:[],fetchImpl:async input=>{
    const url=new URL(String(input)),source=RETAIL_SOURCES.find(s=>s.url===url.href||s.format==='shoper-api'&&new URL(s.url).origin===url.origin&&url.pathname.endsWith('/products/PLN/'+s.productId));assert.ok(source,url.href);calls.push(source.id);
    const card=cards.find(c=>c.sourceId===source.id);if(card)return Response.json({...card.item,...(unavailable?{can_buy:false}:{})});
    const page=pages.find(p=>p.sourceId===source.id);assert.ok(page);if(unavailable)return new Response('unavailable',{status:503});return new Response(page.html,{headers:{'content-type':'text/html'}});
  },basketQuoter:async()=>{throw Error('A postcode is required before the native quote');}}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  try{await run('http://127.0.0.1:'+(server.address() as any).port,calls);}finally{service.close();await new Promise(r=>server.close(r));}
}
const post=(url:string,body:ReturnType<typeof request>)=>fetch(url+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
test('Mapegum automatically checks seven exact offers across three stores before choosing bucket sizes',async()=>{
  await fixtureServer(async(url,calls)=>{const response=await post(url,request());assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.materialsTotalGrosze,15980);assert.equal(calls.length,7);assert.deepEqual(calls.slice().sort(),[...cards,...pages].map(c=>c.sourceId).sort());assert.deepEqual(data.priceRefresh.failedOfferIds,[]);assert.equal(data.deliveryComparison.best,null);});
});
test('Mapegum demand changes reuse recent bounded card checks',async()=>{
  await fixtureServer(async(url,calls)=>{await post(url,request());const response=await post(url,request(11));assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.materialsTotalGrosze,27215);assert.equal(calls.length,7);assert.equal(data.priceRefresh.status,'recent');});
});
test('unknown, contradictory or wrongly measured families do not refresh arbitrary cards',async()=>{
  await fixtureServer(async(url,calls)=>{assert.equal((await post(url,request(6,{packageFamily:'arbitrary-family'}))).status,400);for(const patch of [{unit:'l'},{category:'primer'},{name:'Mapelastic'},{ean:'8022452242489'}]){const response=await post(url,request(6,patch));assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.stages[0].lines[0].resolved,false);}assert.deepEqual(calls,[]);});
});
test('unavailable Mapegum offers stay unresolved without a free payable total',async()=>{
  await fixtureServer(async(url)=>{const response=await post(url,request());assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.stages[0].lines[0].resolved,false);assert.equal(data.deliveryComparison.best,null);assert.equal(data.priceRefresh.failedOfferIds.length,7);},true);
});
test('a tiny positive Mapegum remainder still requires a physical three-kilogram bucket',async()=>{
  await fixtureServer(async(url)=>{const response=await post(url,request(1e-8));assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.materialsTotalGrosze,7990);assert.equal(data.stages[0].lines[0].resolved,true);});
});
