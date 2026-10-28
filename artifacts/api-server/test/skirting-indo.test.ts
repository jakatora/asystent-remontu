import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/skirting-indo.json' with {type:'json'};
import seed from '../../../deploy/shared-backend/verified-offers.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource,type RetailObservation} from '../src/lib/retail-pages';
import {quoteTopboden} from '../src/lib/topboden-delivery';
import {createRemontService} from '../src/shared-backend';
import {calculatorEngine} from '../../mobile/features/calculator/engine';
import {getJobById} from '../../mobile/features/content/registry';
import {toPricingStageInput} from '../../mobile/features/pricing/pricingApi';
function replay(context:string,mutate?:(v:any,i:number)=>any){const rows=fixture.records.filter(r=>r.context===context);let i=0;const fetcher:typeof fetch=async(input,init)=>{const u=new URL(String(input)),r=rows[i++];assert.ok(r,context);assert.equal(init?.method??'GET','GET');assert.equal(u.origin,r.origin);assert.equal(u.pathname+u.search,r.path);let v=structuredClone(r.response);v=mutate?.(v,i-1)??v;return typeof v==='string'?new Response(v,{status:r.status}):Response.json(v,{status:r.status})};return{fetcher,done:()=>assert.equal(i,rows.length)}}
test('Strongman is one300ml cartridge at the ordinary gross amount; optional coupons never become an unconfirmed price',async()=>{
 const s=RETAIL_SOURCES.find(s=>s.id==='topboden-strongman-300ml')!,r=replay('read:'+s.id),o=await readRetailSource(s,r.fetcher);r.done();assert.equal(o.priceGrosze,3189);assert.ok(o.imageUrl?.includes(s.ean));
 for(const patch of [{packageSize:1},{unit:'kg'},{apiPurchaseUnit:'ml'}])await assert.rejects(readRetailSource({...s,...patch},replay('read:'+s.id).fetcher));
 for(const change of [(v:any)=>({...v,promotionCode:{...v.promotionCode,freeProductsMessage:'Requires bundle'}}),(v:any)=>({...v,promotionCode:{...v.promotionCode,code:'CHANGED'}}),(v:any)=>({...v,price:{...v.price,isDiscount:true,discountPackageGrossPrice:2551}}),(v:any)=>({...v,price:{...v.price,packageGrossPrice:2551}})])await assert.rejects(readRetailSource(s,replay('read:'+s.id,(v,i)=>i===0?change(v):v).fetcher));
});
test('actual HTTP prices a whole six-product glued recipe and combines opposite endcap sides across rooms',async(t)=>{
 // The fixture proves captured native behaviour, not indefinitely fresh seed prices.
 t.mock.timers.enable({apis:['Date'],now:Date.parse(fixture.checkedAt)});
 const job=getJobById('skirting-boards')!,base={perimeter:18,skirtingSystem:1,skirtingInside:5,skirtingOutside:3,skirtingConnectors:5,skirtingEndLeft:3,skirtingEndRight:1,skirtingLayoutFit:1,skirtingMounting:1,skirtingGlueCartridges:2,skirtingMountFit:1};
 const cases=[{context:'full-glued',jobs:[base],total:50757,pairs:3},{context:'complementary-rooms',jobs:[{...base,perimeter:4,skirtingInside:2,skirtingOutside:0,skirtingConnectors:0,skirtingEndLeft:1,skirtingEndRight:0,skirtingGlueCartridges:1},{...base,perimeter:4,skirtingInside:2,skirtingOutside:0,skirtingConnectors:0,skirtingEndLeft:0,skirtingEndRight:1,skirtingGlueCartridges:1}],total:43757,pairs:1}];
 for(const c of cases){const r=replay('quote:'+c.context),service=createRemontService({initialObservations:seed.filter(o=>fixture.sources.some(s=>s.id===o.sourceId))as RetailObservation[],background:false,basketQuoter:b=>quoteTopboden(b,r.fetcher)}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{const response=await fetch(`http://127.0.0.1:${(server.address()as any).port}/pricing/project`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:c.jobs.map(m=>toPricingStageInput(calculatorEngine.calculate(job,m))),options:{delivery:{mode:'shipping',postalCode:'00-001',allowSeparateOrders:false}}})});assert.equal(response.status,200);const result=await response.json();assert.equal(result.deliveryComparison.missingProductCount,0);assert.equal(result.deliveryComparison.best.totalGrosze,c.total);const pair=result.consolidated.lines.find((l:any)=>l.product.ean==='5905167726358');assert.equal(pair.packagesNeeded,c.pairs);if(c.context==='complementary-rooms'){assert.equal(pair.indoEndcapPlan.savedPairs,1);assert.deepEqual([pair.indoEndcapPlan.left,pair.indoEndcapPlan.right],[1,1]);}r.done();}
 finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}}
});
