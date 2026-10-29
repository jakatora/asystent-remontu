import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/integra-nyxa.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource,parseRetailPage} from '../src/lib/retail-pages';
import {integraContext,integraProductPage,confirmIntegraCart,integraTariff,quoteIntegra} from '../src/lib/integra';
import {createRetailerQuoter,retailerDeliveryCapabilities} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(s=>s.id==='integra-gtv-nyxa-128-black')!;
const product=fixture.records.find(r=>r.context==='read:1614'&&r.url.includes('/uchwyty/'))!.body;
const cart=integraContext(fixture.records.find(r=>r.context==='read:1614'&&r.url.includes('action=show'))!.body).cart;
const policy=fixture.records.find(r=>r.url.endsWith('/content/1-koszty-dostawy'))!.body;
const order=(count=1):DeliveredStoreBasket=>({store:source.store,materialsGrosze:1299*count,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'retail-'+source.ean,name:source.name,imageUrl:source.imageUrl!},unit:'szt',packages:[{offerId:source.id,count,packageSize:1,unitPriceGrosze:1299,lineCostGrosze:1299*count,url:source.url,store:source.store}]}]});
function replay(context:string,mutate?:(body:string,index:number)=>string){
 const rows=fixture.records.filter(r=>r.context===context);let index=0;
 const fetcher:typeof fetch=async(input,init)=>{
  const row=rows[index],url=new URL(String(input));assert.ok(row,'unexpected request');assert.equal(url.href,row.url);assert.equal(init?.method??'GET',row.method);assert.equal(String(init?.body??''),row.requestBody);assert.equal((init?.headers as Record<string,string>).Accept,'text/html');
  if(init?.method==='POST'){const fields=new URLSearchParams(String(init.body));assert.deepEqual([...fields.keys()].sort(),['action','add','ajax','id_customization','id_product','qty','token'].sort());assert.equal(fields.get('action'),'update');assert.equal(fields.get('add'),'1');}
  const body=mutate?.(row.body,index)??row.body;index++;return new Response(body,{status:row.status,headers:{'content-type':'text/html'}});
 };return{fetcher,done:()=>assert.equal(index,rows.length)};
}
test('Integra requires native-cart EAN confirmation and reads whole available handles with exact photos',async()=>{
 for(const id of [1614,1613]){const r=replay('read:'+id),s=RETAIL_SOURCES.find(s=>s.store===source.store&&s.productId===id)!,o=await readRetailSource(s,r.fetcher);r.done();assert.equal(o.priceGrosze,id===1614?1299:1350);assert.equal(o.stockPackages,id===1614?79:5);assert.equal(o.ean,s.ean);assert.equal(o.imageUrl,s.imageUrl);}
 assert.throws(()=>parseRetailPage(product,source,new Date()),/basket_required/);
 assert.throws(()=>integraProductPage(product,{...source,ean:'5902801422737'}),/not_reviewed/);
});
test('Integra tariff quotes whole baskets at four price tiers and does not claim postcode-specific pricing',async()=>{
 for(const[count,cost]of [[1,1495],[4,895],[8,495],[12,0],[15,0],[79,0]]){const r=replay('quote:'+count),q=await quoteIntegra(order(count),r.fetcher);r.done();assert.ok('quote'in q);assert.equal(q.quote.costGrosze,cost);assert.equal(q.quote.carrier,'Kurier InPost');assert.equal(q.quote.basis,'retailer_tariff_national');assert.equal(q.quote.destinationScope,'PL');assert.equal(q.quote.postalCode,undefined);assert.equal(Date.parse(q.quote.expiresAt)-Date.parse(q.quote.checkedAt),600000);}
});
test('Integra source rejects changed colour, stock, pack size, manufacturer, foreign context and hidden fees',()=>{
 for(const[a,b]of [['czarny mat','złoto szczotkowane'],['&quot;quantity&quot;:79','&quot;quantity&quot;:0'],['&quot;pack&quot;:0','&quot;pack&quot;:1'],['&quot;manufacturer_name&quot;:&quot;GTV&quot;','&quot;manufacturer_name&quot;:&quot;Inna&quot;'],['"iso_code":"PL"','"iso_code":"DE"'],['&quot;additional_shipping_cost&quot;:&quot;0.000000&quot;','&quot;additional_shipping_cost&quot;:&quot;5.000000&quot;']]){assert.ok(product.includes(a),a);assert.throws(()=>integraProductPage(product.replace(a,b),source));}
});
test('Integra native cart rejects mixed EAN, wrong amounts, count, duplicate/extra rows and discounts',()=>{
 const expected=new Map([[1614,{source,count:1,priceGrosze:1299}]]);assert.equal(confirmIntegraCart(cart,expected).total,1299);
 for(const patch of [{ean13:'5902801422737'},{quantity:2},{cart_quantity:'2'},{price_amount:0},{total:'0,00 zł'},{stock_quantity:0},{has_discount:true}]){const bad=structuredClone(cart);Object.assign(bad.products[0],patch);assert.throws(()=>confirmIntegraCart(bad,expected));}
 const extra=structuredClone(cart);extra.products.push(extra.products[0]);assert.throws(()=>confirmIntegraCart(extra,expected));const bad=structuredClone(cart);bad.subtotals.products.amount=0;assert.throws(()=>confirmIntegraCart(bad,expected));
});
test('Integra refuses unknown weight and the published 149.01–149.99 tariff gap; locker tariff cannot supply courier cost',()=>{
 for(const amount of [14901,14999])assert.throws(()=>integraTariff(policy,amount,120),/ambiguous/);
 for(const weight of [0,NaN,30001])assert.throws(()=>integraTariff(policy,1299,weight),/weight/);
 assert.throws(()=>integraTariff(policy.replace('Kurier InPost','Odbiór osobisty'),1299,120));
 assert.throws(()=>integraTariff(policy.replaceAll('14.95','14.00'),1299,120),/changed/);
 const gold=fixture.records.find(r=>r.context==='read:1613'&&r.url.includes('/uchwyty/'))!.body,s=RETAIL_SOURCES.find(s=>s.productId===1613&&s.store===source.store)!;assert.equal(integraProductPage(gold,s).weightGrams,null);
});
test('Integra detects insufficient stock before adding anything and never accepts fractional demand',async()=>{
 const r=replay('quote:80');await assert.rejects(quoteIntegra(order(80),r.fetcher),/insufficient_stock/);r.done();
 for(const count of [0,1.5,Infinity])await assert.rejects(quoteIntegra(order(count),async()=>{throw Error('must not fetch')}),/invalid_basket/);
});
test('Integra refuses changed prices and invalidates a native-cart barcode conflict',async()=>{
 await assert.rejects(quoteIntegra({...order(),materialsGrosze:1300,lines:[{...order().lines[0],packages:[{...order().lines[0].packages[0],unitPriceGrosze:1300,lineCostGrosze:1300}]}]},replay('quote:1').fetcher),/price_changed/);
 const r=replay('read:1614',(body,index)=>index===2?body.replace('5902801422652','5902801422737'):body);await assert.rejects(readRetailSource(source,r.fetcher),/basket_not_confirmed/);r.done();
});
test('Integra is wired into the shared automatic-delivery router with a national tariff and postcode validation',async()=>{
 assert.ok(retailerDeliveryCapabilities().automaticStores.includes(source.store));const r=replay('quote:4'),quoter=createRetailerQuoter(r.fetcher),a=await quoter(order(4),'42-209');assert.ok('quote'in a);assert.equal(a.quote.costGrosze,895);r.done();assert.deepEqual(await quoter(order(4),'wrong'),{reason:'invalid_postal_code'});
});
