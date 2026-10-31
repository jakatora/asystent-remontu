import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/arilla-light-grey-shoper.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {confirmShoperPurchaseUnit,readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import {withOrderPartitions} from '../../../lib/pricing-service/src/order-partitions';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const source=RETAIL_SOURCES.find(row=>row.id==='liderzy-goodhome-arilla-light-grey-25m2')!;
function network(product:any=fixture.product,mutate?:(cart:any)=>void):typeof fetch{
 const counts=[0,0];return async(input,init)=>{
  const url=new URL(String(input)),method=init?.method??'GET';assert.equal(url.origin,'https://liderzycen.pl');
  if(method==='GET'&&url.pathname==='/webapi/front/pl_PL/products/PLN/33716')return Response.json(product);
  if(method==='GET'&&url.pathname==='/webapi/front/pl_PL/products/PLN/32891')return Response.json(fixture.underlay);
  assert.equal(url.pathname,'/webapi/front/pl_PL/basket/PLN/');
  if(method==='POST'){const row=JSON.parse(String(init?.body)),index=[fixture.product.stockId,fixture.underlay.stockId].indexOf(row.stock_id);assert.ok(index>=0);counts[index]=row.quantity;return Response.json({});}
  const row=fixture.cases.find(row=>row.counts[0]===counts[0]&&row.counts[1]===counts[1]);assert.ok(row,'unreviewed native basket');const cart=structuredClone(row.cart);mutate?.(cart);return Response.json(cart);
 };
}
function basket(counts:number[]):DeliveredStoreBasket{
 const sources=[source,RETAIL_SOURCES.find(row=>row.id==='liderzy-volden-xps-lvt-625m2')!],prices=[16445,11388];
 return{store:'LiderzyCen',materialsGrosze:counts.reduce((n,count,i)=>n+count*prices[i],0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:sources.flatMap((s,i)=>counts[i]?[{product:{id:'remont-'+s.ean,name:s.name,imageUrl:s.imageUrl},unit:s.unit,packages:[{offerId:s.id,store:s.store,url:s.url,packageSize:s.packageSize,count:counts[i],unitPriceGrosze:prices[i],lineCostGrosze:counts[i]*prices[i]}]}]:[])};
}

test('the exact light-grey nine-panel box is2.5m², with its current gross pack price and its own photograph',async()=>{
 const observed=await readRetailSource(source,network());assert.equal(observed.priceGrosze,16445);assert.equal(observed.ean,'5059340969732');assert.match(observed.imageUrl!,/54664/);assert.equal(source.packageSize,2.5);
 for(const change of[{packageSize:1},{packageSize:2.235},{unit:'szt'},{brand:'Other'},{productId:138153},{apiPurchaseUnit:'m2'},{ean:'5059340969756'},{retailerSku:'ctma_other'}])assert.throws(()=>confirmShoperPurchaseUnit(fixture.product,{...source,...change}));
});

test('another colour, missing pack contents, unbuyable product and inconsistent gross price cannot become a fresh quote',async()=>{
 for(const mutate of[(row:any)=>row.ean='5059340969756',(row:any)=>row.name=row.name.replace('Light','Dark'),(row:any)=>row.unit.name='m2',(row:any)=>row.can_buy=false,(row:any)=>row.producer.name='Other',(row:any)=>row.description='Bez danych opakowania',(row:any)=>row.price.gross.final_float=1]){
  const product=structuredClone(fixture.product);mutate(product);await assert.rejects(readRetailSource(source,network(product)));
 }
});

test('real captured home freight is for whole baskets; changed units and quantities cannot reuse a tempting tariff',async()=>{
 for(const[counts,cost]of[[[1,0],2200],[[5,0],11000],[[0,2],2000],[[5,2],60000]]as const){const result=await createRetailerQuoter(network())(basket([...counts]),'30-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,cost);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);}
 for(const mutate of[(cart:any)=>cart.products[0].quantity++,(cart:any)=>cart.products[0].unit.name='m2',(cart:any)=>{cart.basket.sum_products_float=1;cart.basket.sum_products='1,00 zł';}])assert.deepEqual(await createRetailerQuoter(network(fixture.product,mutate))(basket([5,2]),'30-001'),{reason:'basket_not_confirmed'});
});

test('native partitioning keeps the full material sum and saves470PLN using two confirmed orders',async()=>{
 const quoter=withOrderPartitions((order,postcode)=>createRetailerQuoter(network())(order,postcode),()=>{}),result=await quoter(basket([5,2]),'30-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,13000);assert.equal(result.quote.orders?.length,2);assert.equal(result.quote.orders!.reduce((n,row)=>n+row.materialsGrosze,0),105001);assert.equal(60000-result.quote.costGrosze,47000);
});
