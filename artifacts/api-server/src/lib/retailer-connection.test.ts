import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../shared-backend';
import {KNAUF_FINISH_SOURCES} from './knauf-finishes';
import {parseRetailPage} from './retail-pages';
import {createQuoteRelayHandler} from './quote-relay-server';
import {quoteThroughRelay,readThroughRelay} from './quote-relay-client';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const small=KNAUF_FINISH_SOURCES.find(s=>s.id==='abud-knauf-superfinish-54kg')!;
const card=readFileSync(new URL('../../test/fixtures/knauf-finishes/abud-superfinish-small.html',import.meta.url),'utf8');
const request=(postalCode='30-001')=>({jobs:[{jobId:'additional-materials',materials:[{material:{id:'finish',name:small.name,ean:small.ean,category:small.category,unit:'kg'},quantity:5.5}]}],options:{refreshPrices:true,delivery:{mode:'shipping',method:'automatic',postalCode,allowSeparateOrders:false,allowExtraPackages:false}}});

test('one actual connection failure is not repeated for price and freight; quantities and unknown totals remain intact',async()=>{
 let calls=0;const beforeMode=process.env.REMONT_QUOTE_RELAY_MODE;delete process.env.REMONT_QUOTE_RELAY_MODE;
 const previous=parseRetailPage(card,small,new Date(Date.now()-3600000));
 const service=createRemontService({background:false,initialObservations:[previous],fetchImpl:async input=>{calls++;assert.equal(String(input),small.url);throw new TypeError('fetch failed',{cause:Object.assign(new Error('connect timed out'),{code:'UND_ERR_CONNECT_TIMEOUT'})});}});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base='http://127.0.0.1:'+(server.address()as {port:number}).port;
 try{
  for(const postalCode of ['30-001','00-001']){
   const r=await fetch(base+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request(postalCode))});assert.equal(r.status,200);const data:any=await r.json(),c=data.deliveryComparison;
   assert.equal(c.best,null);assert.equal(c.postalCode,postalCode);assert.equal(c.lowerBound.totalGrosze,null);assert.equal(c.lowerBound.deliveryGrosze,null);assert.equal(c.lowerBound.materialsGrosze,8940);assert.deepEqual(c.lowerBound.stores[0].lines[0].packages.map((p:any)=>[p.count,p.packageSize]),[[2,5.4]]);assert.equal(data.stages[0].lines[0].quantity,5.5);
   assert.equal(calls,1,'The failed price connection must not be repeated by freight or another postcode during the short cooldown');
   assert(c.unavailableStores.some((s:any)=>s.store==='ABUD'&&s.reason==='retailer_connection_unavailable'));
   assert.equal(service.status().sources.find(s=>s.id===small.id)?.checkedAt,previous.observedAt);
  }
 }finally{service.close();await new Promise<void>(r=>server.close(()=>r()));if(beforeMode===undefined)delete process.env.REMONT_QUOTE_RELAY_MODE;else process.env.REMONT_QUOTE_RELAY_MODE=beforeMode;}
});

test('the actual signed relay shares a connection failure between price and freight without inventing a quote',async()=>{
 const secret='2'.repeat(64);let merchantCalls=0;const app=express();app.use(createQuoteRelayHandler({secret,fetchImpl:async input=>{merchantCalls++;assert.equal(String(input),small.url);throw new TypeError('fetch failed',{cause:Object.assign(Error('connect'),{code:'UND_ERR_CONNECT_TIMEOUT'})});}}));const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base='http://127.0.0.1:'+(server.address()as {port:number}).port,localTransport:typeof fetch=(_input,init)=>fetch(base,init);
 const order:DeliveredStoreBasket={store:'ABUD',materialsGrosze:8940,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+small.ean,name:small.name,imageUrl:null},unit:'kg',packages:[{offerId:small.id,store:'ABUD',url:small.url,packageSize:5.4,count:2,unitPriceGrosze:4470,lineCostGrosze:8940}]}]};
 try{await assert.rejects(readThroughRelay(small,localTransport,secret),/^Error: retailer_connection_unavailable$/);assert.deepEqual(await quoteThroughRelay(order,'30-001',localTransport,secret),{reason:'retailer_connection_unavailable'});assert.equal(merchantCalls,1);}finally{await new Promise<void>(r=>server.close(()=>r()));}
});
