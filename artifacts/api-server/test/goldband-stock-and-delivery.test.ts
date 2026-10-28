import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/goldband-stock-and-delivery.json' with {type:'json'};
import supplies from './fixtures/plaster-supplies.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage,readRetailSource} from '../src/lib/retail-pages';
import {readKrasnyStock} from '../src/lib/krasny-stock';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import {createRemontService} from '../src/shared-backend';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

const krasny=RETAIL_SOURCES.find(s=>s.id==='krasny-goldband-25kg')!,liderzy=RETAIL_SOURCES.find(s=>s.id===fixture.liderzy.sourceId)!;
const clone=<T,>(x:T):T=>JSON.parse(JSON.stringify(x));
const card=(stockHtml=fixture.krasny.stockHtml,product:unknown=fixture.krasny.product)=>`<script type="application/ld+json">${JSON.stringify(product)}</script>${stockHtml}`;

test('Krasny InStock is constrained by the exact visible central warehouse quantity, never the backorder cart',()=>{
 const current=parseRetailPage(card(),krasny,new Date());assert.equal(current.stockPackages,2);assert.equal(current.priceGrosze,4989);
 for(const stock of ['',fixture.krasny.stockHtml.repeat(2),fixture.krasny.stockHtml.replace('2 szt.','2 kg'),fixture.krasny.stockHtml.replace('2 szt.','-2 szt.'),fixture.krasny.stockHtml.replace('2 szt.','2,5 szt.'),fixture.krasny.stockHtml.replace('Magazyn Centralny','Inny magazyn')])assert.throws(()=>parseRetailPage(card(stock),krasny,new Date()),/stock_not_confirmed/);
 assert.throws(()=>parseRetailPage(card(fixture.krasny.stockHtml.replace('2 szt.','0 szt.')),krasny,new Date()),/retailer_out_of_stock/);
 assert.throws(()=>readKrasnyStock(card(),{...krasny,packageSize:1}),/source_not_reviewed/);
 assert.throws(()=>readKrasnyStock(card(),{...krasny,ean:'0000000000000'}),/source_not_reviewed/);
 const wrong=clone(fixture.krasny.product);wrong.gtin13='0000000000000';assert.throws(()=>parseRetailPage(card(undefined,wrong),krasny,new Date()),/ean_not_confirmed/);
 // No script execution or fallback to an unrelated recommendation's quantity.
 assert.throws(()=>readKrasnyStock(`<script>${fixture.krasny.stockHtml}</script>`,krasny),/stock_not_confirmed/);
});

test('LiderzyCen confirms the whole25kg bag gross price and exact SKU, rejecting net, another unit and changed pack',async()=>{
 const observation=await readRetailSource(liderzy,async()=>Response.json(fixture.liderzy.product));assert.equal(observation.priceGrosze,3038);assert.equal(observation.ean,'5902367206383');
 for(const mutate of [(p:any)=>p.ean='0000000000000',(p:any)=>p.code='wrong',(p:any)=>p.unit.name='kg',(p:any)=>p.unit.floating_point=true,(p:any)=>p.name=p.name.replace('25 kg','1 kg'),(p:any)=>p.can_buy=false,(p:any)=>p.price.gross.final_float=24.7]){const p=clone(fixture.liderzy.product);mutate(p);await assert.rejects(readRetailSource(liderzy,async()=>Response.json(p)));}
 await assert.rejects(readRetailSource({...liderzy,packageSize:1},async()=>Response.json(fixture.liderzy.product)),/package_not_confirmed/);
});

function order(count:number):DeliveredStoreBasket{return{store:liderzy.store,materialsGrosze:3038*count,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:liderzy.ean,name:liderzy.name,imageUrl:liderzy.imageUrl??null},unit:'kg',packages:[{offerId:liderzy.id,count,packageSize:25,unitPriceGrosze:3038,lineCostGrosze:3038*count,store:liderzy.store,url:liderzy.url}]}]};}
function storefront(changedCart?:any):typeof fetch{
 let lastCount=0;
 return async(input,init)=>{
  const url=new URL(String(input));
  if(url.origin==='https://realbud.com'){
   const p=supplies.products.find(r=>url.pathname==='/webapi/front/pl_PL/products/PLN/'+r.product.id);if(p)return Response.json(p.product);
   assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');if(init?.method==='POST'){const body=JSON.parse(String(init.body));assert.equal(body.quantity,1);return Response.json({});}return Response.json(supplies.cart);
  }
  assert.equal(url.origin,'https://liderzycen.pl');
  if(url.pathname==='/webapi/front/pl_PL/products/PLN/55390')return Response.json(fixture.liderzy.product);
  assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');
  if(init?.method==='POST'){const body=JSON.parse(String(init.body));assert.equal(body.stock_id,55478);lastCount=body.quantity;assert.ok([1,6,12].includes(lastCount));return Response.json({});}
  return Response.json(changedCart??fixture.liderzy.carts.find(c=>c.count===lastCount)!.cart);
 };
}

test('native carts for1,6and12bags each confirm230PLN national courier, not a postcode quote or net fee',async()=>{
 for(const count of [1,6,12]){const result=await createRetailerQuoter(storefront())(order(count),'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,23000);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_basket_national');}
 const bad=clone(fixture.liderzy.carts.find(c=>c.count===12)!.cart);bad.products[0].quantity=2;
 assert.deepEqual(await createRetailerQuoter(storefront(bad))(order(12),'00-001'),{reason:'basket_not_confirmed'});
});

test('Express prices the whole two-room basket with both couriers and rejects Krasny stock and unconfirmed pickup',async()=>{
 const observations=[parseRetailPage(card(),krasny,new Date()),await readRetailSource(liderzy,async()=>Response.json(fixture.liderzy.product)),...await Promise.all(supplies.products.map(p=>readRetailSource(RETAIL_SOURCES.find(s=>s.id===p.sourceId)!,async()=>Response.json(p.product))))];
 const service=createRemontService({initialObservations:observations,background:false,basketQuoter:createRetailerQuoter(storefront())}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const jobs=[0,1].map(i=>({jobId:'plaster-'+i,materials:[{material:{id:'plaster-base',name:liderzy.name,ean:liderzy.ean,category:'plaster',unit:'kg'},quantity:140.25},...supplies.products.map((p,j)=>{const s=RETAIL_SOURCES.find(s=>s.id===p.sourceId)!;return{material:{id:j?'plaster-mesh':'plaster-primer',name:s.name,ean:s.ean,category:s.category,unit:s.unit},quantity:j?(i?3.3:2.2):2.475};})]}));
  const post=async(options:any,selectedJobs:any=jobs)=>{const r=await fetch('http://127.0.0.1:'+(server.address()as{port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:selectedJobs,options})});assert.equal(r.status,200);return r.json();};
  const full=await post({delivery:{mode:'shipping',postalCode:'00-001'}});assert.equal(full.consolidated.consolidatedTotalGrosze,65835);assert.equal(full.deliveryComparison.best.totalGrosze,91335);assert.equal(full.deliveryComparison.best.deliveryGrosze,25500);assert.equal(full.deliveryComparison.best.stores.length,2);assert.equal(full.consolidated.lines.length,3);
  const supply=full.consolidated.lines.filter((l:any)=>l.product.ean!==liderzy.ean);assert.deepEqual(supply.map((l:any)=>l.packages[0].count),[1,1]);
  const short=await post({store:'Krasny',delivery:{mode:'shipping',postalCode:'00-001'}},[{jobId:'plaster',materials:[jobs[0].materials[0]]}]);assert.equal(short.deliveryComparison.best,null);assert.equal(short.stages[0].lines[0].resolved,false);assert.equal(short.stages[0].lines[0].reason,'insufficient-stock');
  const pickup=await post({store:'Krasny',delivery:{mode:'pickup'}},[{jobId:'plaster',materials:[{...jobs[0].materials[0],quantity:25}]}]);assert.equal(pickup.deliveryComparison.best,null);assert.ok(pickup.coverage.pickupConfirmationStores.includes('Krasny'));
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
