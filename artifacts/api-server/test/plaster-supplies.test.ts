import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/plaster-supplies.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import {createRemontService} from '../src/shared-backend';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const sources=fixture.products.map(row=>RETAIL_SOURCES.find(s=>s.id===row.sourceId)!);
const clone=<T,>(x:T):T=>JSON.parse(JSON.stringify(x));

test('native gross prices bind the whole5kg bucket and1×50m roll, rejecting wrong identity, unit and package',async()=>{
 for(const[index,row]of fixture.products.entries()){
  const source=sources[index],o=await readRetailSource(source,async()=>Response.json(row.product));
  assert.equal(o.priceGrosze,[6679,22700][index]);assert.equal(o.ean,source.ean);assert.equal(source.packageSize,[5,50][index]);
  assert.notEqual(o.priceGrosze,Math.round(row.product.price.net.final_float*100));
  for(const mutate of [(p:any)=>p.ean='0000000000000',(p:any)=>p.id++,(p:any)=>p.code='wrong',(p:any)=>p.unit.name='m²',(p:any)=>p.unit.floating_point=true,(p:any)=>p.price.gross.final_float=1,(p:any)=>p.can_buy=false,(p:any)=>p.name=p.name.replace(index?'1000':'5 kg',index?'333':'1 kg')]){
   const wrong=clone(row.product);mutate(wrong);await assert.rejects(readRetailSource(source,async()=>Response.json(wrong)));
  }
  await assert.rejects(readRetailSource({...source,packageSize:1},async()=>Response.json(row.product)),/package_not_confirmed/);
  await assert.rejects(readRetailSource({...source,unit:index?'mb':'l'},async()=>Response.json(row.product)),/package_not_confirmed/);
 }
});
const order:DeliveredStoreBasket={store:'Realbud',materialsGrosze:29379,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:sources.map((s,i)=>({product:{id:s.ean,name:s.name,imageUrl:s.imageUrl??null},unit:s.unit,packages:[{offerId:s.id,count:1,packageSize:s.packageSize,unitPriceGrosze:[6679,22700][i],lineCostGrosze:[6679,22700][i],store:s.store,url:s.url}]}))};
function fetchCart(cart:any=fixture.cart,changedProduct?:any):typeof fetch{
 return async(input,init)=>{
  const url=new URL(String(input));assert.equal(url.origin,'https://realbud.com');
  const row=fixture.products.find(r=>url.pathname==='/webapi/front/pl_PL/products/PLN/'+r.product.id);
  if(row)return Response.json(changedProduct??row.product);
  assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');
  if(init?.method==='POST'){const body=JSON.parse(String(init.body));assert.equal(body.quantity,1);assert.ok(fixture.products.some(r=>r.product.stockId===body.stock_id));return Response.json({});}
  return Response.json(cart);
 };
}
test('the actual two-product Realbud cart costs293.79 plus25 courier; a free quote placeholder is not home delivery',async()=>{
 const result=await createRetailerQuoter(fetchCart())(order,'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,2500);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_basket_national');
 const bad=clone(fixture.cart);bad.products[0].quantity=2;assert.deepEqual(await createRetailerQuoter(fetchCart(bad))(order,'00-001'),{reason:'basket_not_confirmed'});
 const net=clone(fixture.products[0].product);net.price.gross.final='54,30 zł';net.price.gross.final_float=54.3;assert.deepEqual(await createRetailerQuoter(fetchCart(undefined,net))(order,'00-001'),{reason:'price_changed'});
});
test('Express combines two rooms before buying bucket and roll, includes the real courier and refuses unconfirmed pickup',async()=>{
 const observations=await Promise.all(sources.map((s,i)=>readRetailSource(s,async()=>Response.json(fixture.products[i].product))));
 const service=createRemontService({initialObservations:observations,background:false,basketQuoter:createRetailerQuoter(fetchCart())});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const post=async(mode:string)=>{const r=await fetch('http://127.0.0.1:'+(server.address()as{port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[0,1].map(i=>({jobId:'plaster-'+i,materials:sources.map((s,j)=>({material:{id:j?'plaster-mesh':'plaster-primer',name:s.name,ean:s.ean,category:s.category,unit:s.unit},quantity:j?(i?3.3:2.2):2.475}))})),options:{store:'Realbud',delivery:{mode,postalCode:'00-001'}}})});assert.equal(r.status,200);return r.json();};
  const result=await post('shipping');assert.equal(result.consolidated.consolidatedTotalGrosze,29379);
  assert.deepEqual(result.consolidated.lines.map((l:any)=>l.packages[0].count),[1,1]);
  assert.equal(result.deliveryComparison.best.totalGrosze,31879);assert.equal(result.deliveryComparison.best.deliveryGrosze,2500);
  const pickup=await post('pickup');assert.equal(pickup.deliveryComparison.best,null);assert.ok(pickup.coverage.pickupConfirmationStores.includes('Realbud'));
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
