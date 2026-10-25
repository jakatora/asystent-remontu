import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { niasaProduct, niasaCart1, niasaCart2 } from './fixtures/niasa-shoper';
import { extraShoperProducts } from './fixtures/extra-shoper-products';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource, confirmShoperPurchaseUnit } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(s=>s.id==='liderzy-classen-niasa-1973m2')!;
const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value));
const basket=(count=1):DeliveredStoreBasket=>({store:source.store,materialsGrosze:count*11242,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:source.ean,name:source.name,imageUrl:null},unit:'m2',packages:[{offerId:source.id,count,packageSize:1.973,unitPriceGrosze:11242,lineCostGrosze:11242*count,store:source.store,url:source.url}]}]});
function fetchFixture(count=1,product:any=niasaProduct,cart:any=count===1?niasaCart1:niasaCart2){
  const calls:{path:string;method:string}[]=[];
  const fetcher:typeof fetch=async(input,init)=>{const url=new URL(String(input)),method=init?.method??'GET';calls.push({path:url.pathname,method});assert.equal(url.origin,'https://liderzycen.pl');
    if(method==='GET'&&url.pathname==='/webapi/front/pl_PL/products/PLN/31535')return Response.json(product);
    if(url.pathname==='/webapi/front/pl_PL/basket/PLN/'){
      if(method==='POST'){assert.deepEqual(JSON.parse(String(init?.body)),{stock_id:31623,quantity:count});return Response.json({});}
      return Response.json(cart);
    }
    throw Error('Unreviewed request '+method+' '+url.pathname);
  };return{fetcher,calls};
}

test('Niasa Shoper offer binds a whole 1.973m² pack to the native integer piece, SKU and explicit package description',async()=>{
  const observation=await readRetailSource(source,fetchFixture().fetcher);assert.equal(observation.priceGrosze,11242);assert.equal(observation.ean,'4003992571974');assert.equal(source.packageSize,1.973);assert.equal(source.apiPurchaseUnit,'szt.');assert.match(observation.imageUrl!,/52181/);
  const mutations:((item:any)=>void)[]=[p=>p.id++,p=>p.ean='0000000000000',p=>p.code='wrong',p=>p.unit.name='m²',p=>p.unit.floating_point=true,p=>p.description=p.description.replace('Ilość m2 w opakowaniu: 1,973 m2','Ilość m2 w opakowaniu: 1,970 m2'),p=>p.price.gross.final_float=1,p=>p.can_buy=false];
  for(const mutate of mutations){const changed=clone(niasaProduct);mutate(changed);assert.notDeepEqual(changed,niasaProduct);await assert.rejects(readRetailSource(source,fetchFixture(1,changed).fetcher));}
  assert.throws(()=>confirmShoperPurchaseUnit(niasaProduct,{...source,apiPurchaseUnit:'m2'}),/unit_not_confirmed/);
});

test('Niasa freight is quoted for the actual whole basket: one pack costs22PLN to ship, two packs44PLN',async()=>{
  for(const count of [1,2]){const {fetcher,calls}=fetchFixture(count),result=await createRetailerQuoter(fetcher)(basket(count),'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,count*2200);assert.equal(result.quote.carrier,'Kurier P2');assert.equal(result.quote.payment,'Przelewy24');assert.equal(result.quote.destinationScope,'PL');assert.equal(calls.filter(c=>c.method==='POST').length,1);}
  const badCart=clone(niasaCart1);badCart.products[0].unit.name='m2';const result=await createRetailerQuoter(fetchFixture(1,niasaProduct,badCart).fetcher)(basket(),'00-001');assert.deepEqual(result,{reason:'basket_not_confirmed'});
  const changed=clone(niasaProduct);changed.unit.floating_point=true;assert.ok('reason'in await createRetailerQuoter(fetchFixture(1,changed).fetcher)(basket(),'00-001'));
});

test('Niasa HTTP combines rooms before rounding packs and keeps quantity-dependent freight',async()=>{
  const observation=await readRetailSource(source,fetchFixture().fetcher);
  const service=createRemontService({initialObservations:[observation],background:false,basketQuoter:(order,postcode)=>createRetailerQuoter(fetchFixture(order.lines[0].packages[0].count).fetcher)(order,postcode)});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  try{const endpoint='http://127.0.0.1:'+(server.address() as{port:number}).port+'/pricing/project';
    const post=async(quantities:number[],mode='shipping')=>{const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:quantities.map((quantity,i)=>({jobId:'floor-'+i,materials:[{material:{id:'niasa',ean:source.ean,name:source.name,category:'laminate',unit:'m2'},quantity}]})),options:{store:source.store,delivery:{mode,postalCode:'00-001'}}})});assert.equal(r.status,200);return r.json();};
    const one=await post([0.9,1.073]);assert.equal(one.deliveryComparison.best.materialsGrosze,11242);assert.equal(one.deliveryComparison.best.totalGrosze,13442);assert.equal(one.deliveryComparison.best.stores[0].lines[0].packages[0].count,1);
    const two=await post([3.946]);assert.equal(two.deliveryComparison.best.materialsGrosze,22484);assert.equal(two.deliveryComparison.best.deliveryGrosze,4400);assert.equal(two.deliveryComparison.best.totalGrosze,26884);
    const over=await post([3.947],'pickup');assert.equal(over.deliveryComparison.best.totalGrosze,33726);assert.equal(over.deliveryComparison.best.stores[0].lines[0].packages[0].count,3);
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});

test('reviewed Oakland, Volden, Guigliano, Ferro and Marvo offers retain their native pieces and physical package contents',async()=>{
  assert.equal(extraShoperProducts.length,5);
  for(const fixture of extraShoperProducts){const source=RETAIL_SOURCES.find(s=>s.id===fixture.sourceId)!;assert.ok(source);assert.equal(source.apiPurchaseUnit,'szt.');
    const fetcher:typeof fetch=async input=>{assert.equal(new URL(String(input)).pathname,'/webapi/front/pl_PL/products/PLN/'+source.productId);return Response.json(fixture.product);};
    const observation=await readRetailSource(source,fetcher);assert.equal(observation.ean,fixture.product.ean);assert.equal(observation.priceGrosze,Math.round(fixture.product.price.gross.final_float*100));assert.ok(observation.imageUrl?.includes('productGfx_'+fixture.product.main_image+'_'));
    for(const mutate of [(p:any)=>p.unit.name='m2',(p:any)=>p.code='wrong',(p:any)=>p.unit.floating_point=true]){const changed=clone(fixture.product);mutate(changed);assert.notDeepEqual(changed,fixture.product);assert.throws(()=>confirmShoperPurchaseUnit(changed,source));}
  }
});
