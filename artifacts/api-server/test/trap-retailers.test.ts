import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/whb132-shoper.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
import express from 'express';
import {createRemontService} from '../src/shared-backend';
const sources=['instato-mcalpine-whb132','arena-mcalpine-whb132'].map(id=>RETAIL_SOURCES.find(s=>s.id===id)!);
function replay(context:string,mutate?:(body:string)=>string){const rows=fixture.records.filter(r=>r.context===context);let i=0;const fetcher:typeof fetch=async(input,init)=>{const r=rows[i++];assert.ok(r,'unexpected request');assert.equal(String(input),r.url);assert.equal(init?.method??'GET',r.method);assert.equal(String(init?.body??''),r.requestBody);if(init?.method==='POST')assert.deepEqual(Object.keys(JSON.parse(String(init.body))).sort(),['quantity','stock_id']);return new Response(mutate?.(r.body)??r.body,{status:r.status,headers:{'content-type':'application/json'}});};return{fetcher,done:()=>assert.equal(i,rows.length)};}
const order=(i:number,n:number):DeliveredStoreBasket=>({store:sources[i].store,source:'unknown',materialsGrosze:[8790,10619][i]*n,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,lines:[{product:{id:'remont-'+sources[i].ean,name:sources[i].name,imageUrl:sources[i].imageUrl!},unit:'szt',packages:[{offerId:sources[i].id,count:n,packageSize:1,unitPriceGrosze:[8790,10619][i],lineCostGrosze:[8790,10619][i]*n,url:sources[i].url,store:sources[i].store}]}]});
test('two basin trap retailers confirm the same EAN and gross prices instead of cheaper net or historic prices',async()=>{
 for(const[i,s]of sources.entries()){const r=replay('read:'+s.id),o=await readRetailSource(s,r.fetcher);r.done();assert.equal(o.ean,'5036484088390');assert.equal(o.priceGrosze,[8790,10619][i]);assert.ok(s.pickupRequiresConfirmation);assert.equal(s.packageSize,1);assert.ok(s.imageUrl?.includes('5036484088390'));}
});
test('whole trap baskets choose national home courier at both postcodes, excluding locker teaser rates',async()=>{
 for(const[i,s]of sources.entries())for(const[n,code]of [[1,'00-001'],[3,'00-001'],[2,'42-209'],[10,'00-001']] as const){const r=replay('quote:'+s.id+':'+n+':'+code),q=await createRetailerQuoter(r.fetcher)(order(i,n),code);r.done();assert.ok('quote'in q);assert.equal(q.quote.costGrosze,i===0&&n===10?0:[1590,2300][i]);assert.equal(q.quote.basis,'retailer_basket_national');assert.equal(q.quote.destinationScope,'PL');assert.equal(q.quote.postalCode,undefined);assert.match(q.quote.carrier,/kurier/i);}
});
test('trap sources reject wrong EAN, unavailable units and divergent gross-price metadata',async()=>{
 for(const change of [(b:string)=>b.replace('5036484088390','8595580556457'),(b:string)=>b.replace('"can_buy":true','"can_buy":false'),(b:string)=>b.replace('"final_float":87.9','"final_float":71.46')])await assert.rejects(readRetailSource(sources[0],replay('read:'+sources[0].id,change).fetcher));
});
test('whole basket quantity changes are rejected rather than returning a cheap partial shipment',async()=>{
 const r=replay('quote:'+sources[0].id+':3:00-001',body=>{const p=JSON.parse(body);if(p.products?.length)p.products[0].quantity=1;return JSON.stringify(p)}),q=await createRetailerQuoter(r.fetcher)(order(0,3),'00-001');r.done();assert.deepEqual(q,{reason:'basket_not_confirmed'});
});

test('trap pickup requires confirmation for all three retailers; online BLU stock cannot become a free salon basket',async()=>{
 const sources=RETAIL_SOURCES.filter(s=>s.ean==='5036484088390');assert.equal(sources.length,3);assert.ok(sources.every(s=>s.pickupRequiresConfirmation));
 const service=createRemontService({initialObservations:sources.map(s=>({sourceId:s.id,ean:s.ean,name:s.name,imageUrl:s.imageUrl!,priceGrosze:8790,currency:'PLN' as const,availability:'in_stock' as const,observedAt:new Date().toISOString(),sourceUrl:s.url,evidenceSha256:'a'.repeat(64)})),background:false,fetchImpl:async()=>new Response('',{status:503})});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
 try{const r=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'sink-trap-replace',materials:[{material:{id:'trap',name:'McAlpine WHB1-32',unit:'szt',category:'trap',ean:'5036484088390'},quantity:3}]}],options:{delivery:{mode:'pickup',postalCode:'00-001'}}})});assert.equal(r.status,200);const data=await r.json();assert.equal(data.deliveryComparison.best,null);assert.ok(data.coverage.pickupConfirmationStores.includes('BLU'));assert.ok(data.coverage.pickupConfirmationStores.includes('Instato'));assert.ok(data.coverage.pickupConfirmationStores.includes('Arena Łazienek'));}
 finally{await new Promise<void>(r=>server.close(()=>r()));service.close();}
});
