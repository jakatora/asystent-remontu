import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/plusmarket-pex-wave181.json';
import {RETAIL_SOURCES} from './retail-catalog';
import {confirmShoperPurchaseUnit,readRetailSource} from './retail-pages';
import {createRetailerQuoter} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';
const source=RETAIL_SOURCES.find(s=>s.id==='plusmarket-pex-pipe-16x2')!;
function order(count:number):DeliveredStoreBasket{return{store:source.store,materialsGrosze:399*count,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:source.imageUrl!},unit:'mb',packages:[{offerId:source.id,store:source.store,url:source.url,count,packageSize:1,unitPriceGrosze:399,lineCostGrosze:399*count}]}]};}
function network(count:number,change?:(phase:string,data:any)=>void){const sample=fixture.cases.find(c=>c.count===count)!,calls:{url:string;method:string}[]=[];const fetcher:typeof fetch=async(input,init)=>{const url=String(input),method=init?.method??'GET';calls.push({url,method});if(url.endsWith('/products/PLN/12990')){const p=structuredClone(sample.product);change?.('product',p);return Response.json(p);}assert.equal(url,'https://www.plus-market.pl/webapi/front/pl_PL/basket/PLN/');if(method==='POST'){assert.deepEqual(JSON.parse(String(init?.body)),{stock_id:13709,quantity:count});return Response.json(sample.add);}const b=structuredClone(sample.basket);change?.('basket',b);return Response.json(b);};return{fetcher,calls};}
test('reviewed metre sale keeps one metre distinct from the 200m stock roll and from every other floating-point unit',()=>{
  confirmShoperPurchaseUnit(fixture.cases[0].product,source);
  for(const patch of [{ean:'5901095517977'},{brand:'Tycner'},{packageSize:200},{unit:'kg'},{productId:12991},{url:source.url+'?other=1'},{purchaseMultiple:200}])assert.throws(()=>confirmShoperPurchaseUnit(fixture.cases[0].product,{...source,...patch}));
  assert.throws(()=>confirmShoperPurchaseUnit(fixture.cases[0].product,{...source,id:'unreviewed-metres'}));
  for(const patch of [{ean:'5901095517977'},{code:'other'},{stockId:13710},{producer:{name:'Other',id:174}},{unit:{name:'mb',floating_point:false}},{description:'Oferta dotyczy 200mb!'}])assert.throws(()=>confirmShoperPurchaseUnit({...fixture.cases[0].product,...patch},source));
});
test('four actual anonymous metre carts confirm gross price, whole quantities, PL and courier instead of locker, pickup or COD',async()=>{
  for(const count of [1,2,13,20]){const n=network(count),quote=await createRetailerQuoter(n.fetcher)(order(count),'30-001');assert.ok('quote'in quote);assert.equal(quote.quote.costGrosze,count===20?5500:2000);assert.equal(quote.quote.carrier,'Przesyłka kurierska (standard)');assert.equal(quote.quote.destinationScope,'PL');assert.equal(quote.quote.basis,'retailer_basket_national');assert.equal(n.calls.length,3);assert.equal(n.calls.filter(c=>c.method==='POST').length,1);}
});
test('altered native metre quantity, cost, unit or country cannot leave a confirmed delivered total',async()=>{
  for(const mutate of [(b:any)=>b.products[0].quantity=12.5,(b:any)=>b.products[0].sum_float=51.86,(b:any)=>b.products[0].unit.floating_point=false,(b:any)=>b.products[0].unit.name='szt.',(b:any)=>b.countries[0].selected=false]){const n=network(13,(phase,b)=>{if(phase==='basket')mutate(b);});assert.ok('reason'in await createRetailerQuoter(n.fetcher)(order(13),'30-001'));}
  const n=network(1);assert.ok('reason'in await createRetailerQuoter(n.fetcher)(order(0.5),'30-001'));assert.equal(n.calls.length,0);
});
test('a live metre offer needs the actual declared API gross price and purchase availability',async()=>{
  const observed=await readRetailSource(source,network(1).fetcher);assert.equal(observed.priceGrosze,399);assert.equal(observed.ean,'5901095517976');
  for(const mutate of [(p:any)=>p.can_buy=false,(p:any)=>p.price.gross.final_float=4.99]){const n=network(1,(phase,p)=>{if(phase==='product')mutate(p);});await assert.rejects(readRetailSource(source,n.fetcher));}
});
