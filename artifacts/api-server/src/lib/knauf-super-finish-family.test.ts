import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import express from 'express';
import {createRemontService} from '../shared-backend';
import {KNAUF_FINISH_SOURCES} from './knauf-finishes';
import {KNAUF_SUPER_FINISH_FAMILY,KNAUF_SUPER_FINISH_FAMILY_NAME} from '../../../../lib/pricing-service/src/reviewed-package-families';
const fixture=(name:string)=>readFileSync(new URL('../../test/fixtures/knauf-finishes/'+name,import.meta.url),'utf8');
const cards=new Map([
 ['abud-knauf-superfinish-54kg',fixture('abud-superfinish-small.html')],
 ['abud-knauf-superfinish-28kg',fixture('abud-superfinish-28.html')],
 ['realbud-knauf-superfinish-28kg',fixture('realbud-superfinish-28.json')],
 ['sewera-knauf-superfinish-28kg',fixture('sewera-superfinish-28.html')],
]);
const request=(quantity=29,patch:Record<string,unknown>={})=>({jobs:[{jobId:'additional-materials',materials:[{material:{id:'finish',name:KNAUF_SUPER_FINISH_FAMILY_NAME,unit:'kg',category:'skim-coat',packageFamily:KNAUF_SUPER_FINISH_FAMILY,...patch},quantity}]}],options:{refreshPrices:false,delivery:{mode:'shipping'}}});
async function server(run:(url:string,calls:string[])=>Promise<void>,unavailable=false){
 const calls:string[]=[];
 const service=createRemontService({background:false,initialObservations:[],fetchImpl:async input=>{
  const url=new URL(String(input)),source=KNAUF_FINISH_SOURCES.find(s=>s.url===url.href||s.format==='shoper-api'&&new URL(s.url).origin===url.origin&&url.pathname.endsWith('/products/PLN/'+s.productId));
  assert.ok(source,url.href);calls.push(source.id);const raw=cards.get(source.id);assert.ok(raw);
  return new Response(unavailable?'unavailable':raw,{status:unavailable?503:200,headers:{'content-type':source.format==='shoper-api'?'application/json':'text/html'}});
 },basketQuoter:async()=>{throw Error('A postcode is required before native freight');}});
 const app=express();app.use(express.json());app.use(service.router);const listener=app.listen(0,'127.0.0.1');await new Promise(r=>listener.once('listening',r));
 try{await run('http://127.0.0.1:'+(listener.address() as any).port,calls);}finally{service.close();await new Promise(r=>listener.close(r));}
}
const post=(url:string,body:ReturnType<typeof request>)=>fetch(url+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});

test('Super Finish checks only four reviewed current offers, not an invented 20 kg price',async()=>{
 await server(async(url,calls)=>{
  const response=await post(url,request());assert.equal(response.status,200);const data:any=await response.json();
  assert.equal(data.materialsTotalGrosze,14160);assert.deepEqual(calls.slice().sort(),[...cards.keys()].sort());assert.deepEqual(data.priceRefresh.failedOfferIds,[]);
  assert.equal(data.deliveryComparison.best,null);assert.equal(data.stages[0].lines[0].quantity,29);
  const packages=data.stages[0].lines[0].packages;assert.deepEqual(packages.map((p:any)=>[p.packageSize,p.count]).sort((a:any,b:any)=>a[0]-b[0]),[[5.4,1],[28,1]]);
  const next=await post(url,request(5.5));assert.equal(next.status,200);const nextData:any=await next.json();assert.equal(nextData.materialsTotalGrosze,8940);assert.equal(calls.length,4);assert.equal(nextData.priceRefresh.status,'recent');
 });
});

test('invalid or contradictory family identities cannot initiate a retail card refresh',async()=>{
 await server(async(url,calls)=>{
  assert.equal((await post(url,request(29,{packageFamily:'arbitrary-family'}))).status,400);
  for(const patch of [{unit:'l'},{category:'primer'},{name:'Knauf Fill & Finish Light'},{ean:'5901793357935'}]){
   const response=await post(url,request(29,patch));assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.stages[0].lines[0].resolved,false);
  }
  assert.deepEqual(calls,[]);
 });
});

test('failed current source checks leave the family unresolved and the delivered total unknown',async()=>{
 await server(async(url)=>{const response=await post(url,request());assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.stages[0].lines[0].resolved,false);assert.equal(data.deliveryComparison.best,null);assert.equal(data.priceRefresh.failedOfferIds.length,4);},true);
});
