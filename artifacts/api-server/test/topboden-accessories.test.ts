import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/topboden-accessories.json' with {type:'json'};
import seed from '../../../deploy/shared-backend/verified-offers.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource,type RetailObservation} from '../src/lib/retail-pages';
import {confirmTopbodenProduct} from '../src/lib/topboden-product';
import {quoteTopboden} from '../src/lib/topboden-delivery';
import {createRemontService} from '../src/shared-backend';

function replay(context:string,mutate?:(value:any,index:number)=>any){const rows=fixture.records.filter(row=>row.context===context);let i=0;const fetcher:typeof fetch=async(input,init)=>{const u=new URL(String(input)),row=rows[i++];assert.ok(row,context);assert.equal(init?.method??'GET','GET');assert.equal(u.origin,row.origin);assert.equal(u.pathname+u.search,row.path);let value=structuredClone(row.response);value=mutate?.(value,i-1)??value;return typeof value==='string'?new Response(value,{status:row.status}):Response.json(value,{status:row.status})};return{fetcher,done:()=>assert.equal(i,rows.length)}}

test('four actual TopBoden accessory packs bind whole-pack prices and distinguish a left/right pair',async()=>{
 const sources=fixture.sources.filter(s=>s.apiPurchaseUnit==='opk.');assert.equal(sources.length,4);
 for(const raw of sources){const source=RETAIL_SOURCES.find(s=>s.id===raw.id)!;const r=replay('read:'+source.id),o=await readRetailSource(source,r.fetcher);r.done();assert.equal(o.ean,source.ean);assert.equal(o.priceGrosze,source.id.includes('connector')?1000:800);assert.ok(o.imageUrl?.includes(source.ean));
  for(const patch of [{packageSize:source.packageSize+1},{unit:'mb'},{apiPurchaseUnit:'szt.'},{productUuid:'00000000-0000-0000-0000-000000000000'}])await assert.rejects(readRetailSource({...source,...patch},replay('read:'+source.id).fetcher));
  for(const change of [(v:any)=>({...v,units:{...v.units,orderUnit:'szt.'}}),(v:any)=>({...v,ean:'5900000000000'}),(v:any)=>({...v,units:{...v.units,numerator:2}}),(v:any)=>({...v,name:v.name.replace('połysk','mat')})])await assert.rejects(readRetailSource(source,replay('read:'+source.id,(v,i)=>i===0?change(v):v).fetcher));
  for(const replacement of [['"priceCurrency":"PLN"','"priceCurrency":"EUR"'],[source.ean+'_P_','5900000000000_P_'],['"brand":"Arbiton"','"brand":"Other"']])await assert.rejects(readRetailSource(source,replay('read:'+source.id,(v,i)=>i===1?String(v).replaceAll(replacement[0],replacement[1]):v).fetcher));
 }
});

test('native accessory stock is in sealed packs; three packs still contain six corners',()=>{
 const source=RETAIL_SOURCES.find(s=>s.id==='topboden-indo-inside-gloss-2')!;
 const p=structuredClone(fixture.records.find(r=>r.context==='read:'+source.id&&r.origin==='https://api.topboden.pl')!.response) as any;p.baseUnitStock=3;
 assert.equal(confirmTopbodenProduct(p,source,3).priceGrosze,800);
 assert.throws(()=>confirmTopbodenProduct(p,source,4),/insufficient_stock/);
});

test('actual Express HTTP combines purchased accessories and minimum skirting lot before one delivery',async(t)=>{
 // Replay at capture time; production freshness must still expire old observations.
 t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.checkedAt)});
 const r=replay('quote:skirting-and-accessories');const service=createRemontService({initialObservations:seed.filter(o=>fixture.sources.some(s=>s.id===o.sourceId)) as RetailObservation[],background:false,basketQuoter:basket=>quoteTopboden(basket,r.fetcher)});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const specs=[['5905167725719','mb',12.5,10],['5905167726037','szt',3,2],['5905167726198','szt',1,2],['5905167725870','szt',2,3],['5905167726358','kpl',1,2]] as const;
 const jobs=[0,1].map(i=>({jobId:'explicit-skirting-purchases',materials:specs.map(([ean,unit,a,b])=>({material:{id:ean,ean,name:fixture.sources.find(s=>s.ean===ean)!.name,unit,category:ean==='5905167725719'?'skirting':'skirting-accessory'},quantity:i===0?a:b}))}));
 try{const response=await fetch(`http://127.0.0.1:${(server.address() as any).port}/pricing/project`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs,options:{delivery:{mode:'shipping',postalCode:'00-001',allowSeparateOrders:false}}})});assert.equal(response.status,200);const result=await response.json();const best=result.deliveryComparison.best;assert.ok(best);assert.equal(result.deliveryComparison.missingProductCount,0);assert.equal(best.materialsGrosze,41380);assert.equal(best.deliveryGrosze,2999);assert.equal(best.totalGrosze,44379);const packs=Object.fromEntries(result.consolidated.lines.map((line:any)=>[line.product.ean,line.packagesNeeded]));assert.deepEqual(packs,{'5905167725719':10,'5905167726037':3,'5905167726198':2,'5905167725870':3,'5905167726358':3});r.done();}
 finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
