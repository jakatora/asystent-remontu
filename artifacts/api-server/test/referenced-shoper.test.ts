import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { referencedShoperProducts, referencedShoperCarts } from './fixtures/referenced-shoper';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource, confirmShoperPurchaseUnit, type RetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value));
const sources=referencedShoperProducts.map(row=>RETAIL_SOURCES.find(source=>source.id===row.sourceId)!);
const line=(source:RetailSource,price:number)=>({product:{id:'remont-'+source.ean,name:source.name,imageUrl:source.imageUrl!},unit:'szt',packages:[{offerId:source.id,store:source.store,packageSize:1,count:1,unitPriceGrosze:price,lineCostGrosze:price,url:source.url}]});
function fixtureFetch(products=referencedShoperProducts,cart:any=referencedShoperCarts[1]){
  const calls:{path:string;method:string}[]=[];
  const fetcher:typeof fetch=async(input,init)=>{const url=new URL(String(input)),method=init?.method??'GET';assert.equal(url.origin,'https://liderzycen.pl');calls.push({path:url.pathname,method});
    if(method==='GET'&&url.pathname.startsWith('/webapi/front/pl_PL/products/PLN/')){const row=products.find(row=>url.pathname.endsWith('/'+row.product.id));assert.ok(row,'Missing fixture '+url.pathname);return Response.json(row.product);}
    assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');
    if(method==='POST'){const body=JSON.parse(String(init?.body));assert.ok(products.some(row=>row.product.stockId===body.stock_id));assert.equal(body.quantity,1);return Response.json({});}
    return Response.json(cart);
  };return{fetcher,calls};
}

test('independent brand references retain the actual manufacturer instead of a Shoper store placeholder',async()=>{
  assert.equal(sources.length,3);assert.deepEqual(sources.map(s=>s.brand),['Kingfisher International Products B.V.','Metro','Erkado']);
  for(const [i,source] of sources.entries()){
    const observation=await readRetailSource(source,fixtureFetch().fetcher);assert.equal(observation.ean,referencedShoperProducts[i].product.ean);assert.equal(observation.priceGrosze,Math.round(referencedShoperProducts[i].product.price.gross.final_float*100));
    assert.equal(source.brandReference?.retailerValue,'liderzycen');assert.equal(source.brandReference?.retailerId,50);assert.notEqual(new URL(source.brandReference!.url).hostname,'liderzycen.pl');
    await assert.rejects(readRetailSource({...source,brandReference:undefined},fixtureFetch().fetcher),/variant_mismatch/);
  }
});

test('a reviewed brand reference cannot conceal a changed EAN, producer, SKU, unit or door handedness',()=>{
  for(const [i,source] of sources.entries())for(const mutate of [(p:any)=>p.ean='0000000000000',(p:any)=>p.producer.name='Another manufacturer',(p:any)=>p.producer.id=51,(p:any)=>p.code='wrong',(p:any)=>p.unit.floating_point=true,(p:any)=>p.name+=' inny wariant']){
    const changed=clone(referencedShoperProducts[i].product);mutate(changed);assert.throws(()=>confirmShoperPurchaseUnit(changed,source));
  }
  const door=clone(referencedShoperProducts[2].product);door.name=door.name.replace('lewe','prawe');assert.throws(()=>confirmShoperPurchaseUnit(door,sources[2]),/brand_not_confirmed/);
  for(const patch of [{brand:''},{retailerSku:undefined},{apiPurchaseUnit:undefined},{variant:[]},{brandReference:{...sources[0].brandReference!,url:'http://example.com/product'}},{brandReference:{...sources[0].brandReference!,url:sources[0].url}},{brandReference:{...sources[0].brandReference!,retailerValue:'Other brand'}}])assert.throws(()=>confirmShoperPurchaseUnit(referencedShoperProducts[0].product,{...sources[0],...patch}));
});

test('fresh delivery checks reject a changed door variant before adding anything to a cart',async()=>{
  const changed=clone(referencedShoperProducts);changed[2].product.name=changed[2].product.name.replace('lewe','prawe');const {fetcher,calls}=fixtureFetch(changed);
  const basket:DeliveredStoreBasket={store:'LiderzyCen',materialsGrosze:27936,lines:[line(sources[2],27936)],deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown'};
  assert.deepEqual(await createRetailerQuoter(fetcher)(basket,'00-001'),{reason:'quote_unavailable'});assert.equal(calls.filter(call=>call.method==='POST').length,0);assert.equal(calls.length,1);
});

test('actual HTTP returns the three exact pieces and whole-cart freight, rather than the small-item tariff',async()=>{
  const fetcher=fixtureFetch().fetcher,observations=await Promise.all(sources.map(source=>readRetailSource(source,fetcher)));
  const service=createRemontService({initialObservations:observations,background:false,basketQuoter:(order,postcode)=>createRetailerQuoter(fixtureFetch(referencedShoperProducts,order.lines.length===1?referencedShoperCarts[0]:referencedShoperCarts[1]).fetcher)(order,postcode)});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  try{const endpoint='http://127.0.0.1:'+(server.address()as{port:number}).port+'/pricing/project';
    const post=async(indices:number[])=>{const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'door-parts',materials:indices.map(i=>({material:{id:sources[i].id,ean:sources[i].ean,name:sources[i].name,category:sources[i].category,unit:'szt'},quantity:1}))}],options:{store:'LiderzyCen',delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(r.status,200);return r.json();};
    const hinge=await post([1]);assert.ok(hinge.deliveryComparison.best);assert.equal(hinge.deliveryComparison.best.materialsGrosze,1566);assert.equal(hinge.deliveryComparison.best.deliveryGrosze,1500);assert.equal(hinge.deliveryComparison.best.totalGrosze,3066);
    const all=await post([0,1,2]);assert.equal(all.deliveryComparison.best.materialsGrosze,30014);assert.equal(all.deliveryComparison.best.deliveryGrosze,60000);assert.equal(all.deliveryComparison.best.totalGrosze,90014);assert.equal(all.deliveryComparison.best.stores[0].lines.length,3);assert.match(all.stages[0].lines[2].product.name,/lewe/);
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
