import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/vinyl-click-shoper.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {confirmShoperPurchaseUnit,readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import {withOrderPartitions} from '../../../lib/pricing-service/src/order-partitions';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const source=RETAIL_SOURCES.find(s=>s.id==='liderzy-volden-xps-lvt-625m2')!;
const clone=<T,>(v:T):T=>structuredClone(v);
function network(product:any=fixture.product,changeCart?:(d:any)=>void):typeof fetch {
 const counts=[0,0];
 return async(input,init)=>{
  const u=new URL(String(input)),method=init?.method??'GET';assert.equal(u.origin,'https://liderzycen.pl');
  if(method==='GET'&&u.pathname==='/webapi/front/pl_PL/products/PLN/32891')return Response.json(product);
  if(method==='GET'&&u.pathname==='/webapi/front/pl_PL/products/PLN/185474')return Response.json(fixture.marvo);
  assert.equal(u.pathname,'/webapi/front/pl_PL/basket/PLN/');
  if(method==='POST'){const d=JSON.parse(String(init?.body)),i=[fixture.product.stockId,fixture.marvo.stockId].indexOf(d.stock_id);assert.ok(i>=0);counts[i]=d.quantity;return Response.json({});}
  const record=fixture.cases.find(r=>r.counts[0]===counts[0]&&r.counts[1]===counts[1]);assert.ok(record,'unreviewed native count');const d=clone(record.cart);changeCart?.(d);return Response.json(d);
 };
}
function basket(counts:number[]):DeliveredStoreBasket {
 const sources=[source,RETAIL_SOURCES.find(s=>s.id==='liderzy-goodhome-marvo-2235m2')!],prices=[11388,15082];
 return{store:'LiderzyCen',materialsGrosze:counts.reduce((n,c,i)=>n+c*prices[i],0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:sources.flatMap((s,i)=>counts[i]?[{product:{id:'remont-'+s.ean,name:s.name,imageUrl:s.imageUrl},unit:s.unit,packages:[{offerId:s.id,store:s.store,url:s.url,packageSize:s.packageSize,count:counts[i],unitPriceGrosze:prices[i],lineCostGrosze:counts[i]*prices[i]}]}]:[])};
}

test('Volden native integer piece remains the exact 6.25m² vinyl pack with its current gross price and photograph',async()=>{
 const row=await readRetailSource(source,network());assert.equal(row.priceGrosze,11388);assert.equal(row.ean,'5063022038326');assert.match(row.imageUrl!,/53817/);assert.equal(source.packageSize,6.25);
 for(const change of [{packageSize:6},{packageSize:10},{unit:'szt'},{brand:'Arbiton'},{retailerSku:'other'},{productId:32892},{apiPurchaseUnit:'m2'}])assert.throws(()=>confirmShoperPurchaseUnit(fixture.product,{...source,...change}));
 for(const mutate of [(p:any)=>p.unit.name='m2',(p:any)=>p.unit.floating_point=true,(p:any)=>p.ean='5063022038289',(p:any)=>p.name=p.name.replace('6,25','6,00'),(p:any)=>p.producer.name='GoodHome',(p:any)=>p.price.gross.final_float=1,(p:any)=>p.can_buy=false]){const changed=clone(fixture.product);mutate(changed);await assert.rejects(readRetailSource(source,network(changed)));}
});

test('native whole-cart freight changes with the underlay count and the mixed panel basket',async()=>{
 for(const [counts,expected]of [[[1,0],1650],[[2,0],2000],[[0,5],11000],[[2,5],60000]]as const){const result=await createRetailerQuoter(network())(basket([...counts]),'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,expected);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);}
 const altered=await createRetailerQuoter(network(fixture.product,c=>c.products[0].quantity++))(basket([2,0]),'00-001');assert.deepEqual(altered,{reason:'basket_not_confirmed'});
});

test('the real order partitioner prefers two native orders and saves470PLN without dividing a guessed tariff',async()=>{
 const quoter=withOrderPartitions((order,postcode)=>createRetailerQuoter(network())(order,postcode),()=>{}),result=await quoter(basket([2,5]),'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,13000);assert.equal(result.quote.orders?.length,2);assert.equal(result.quote.orders!.reduce((n,o)=>n+o.materialsGrosze,0),98186);assert.equal(60000-result.quote.costGrosze,47000);
});
