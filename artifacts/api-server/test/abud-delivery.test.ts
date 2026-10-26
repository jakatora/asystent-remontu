import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import fixture from './fixtures/abud-delivery.json';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { AnonymousShop } from '../src/lib/retailer-http';
import { quoteAbud, selectAbudHomeRate, confirmAbudDestination, confirmAbudBasket } from '../src/lib/abud-delivery';
import { createRetailerQuoter, retailerDeliveryCapabilities } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const products = fixture.products as Record<string,{url:string;capturedAt:string;html:string}>;
const source = RETAIL_SOURCES.find(row=>row.id==='abud-fischer-wst140k-2')!;
function order(kind: 'paid'|'free'|'mixed' = 'paid'): DeliveredStoreBasket {
  const cart = fixture.carts[kind].basket;
  return {store:'ABUD',materialsGrosze:Math.round(cart.worth*100),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',
    lines:cart.products.map(row=>{const s=RETAIL_SOURCES.find(s=>s.store==='ABUD'&&String(s.productId)===row.id)!;
      return{product:{id:'remont-'+s.ean,name:s.name,imageUrl:null},unit:s.unit,packages:[{offerId:s.id,store:'ABUD',url:s.url,packageSize:s.packageSize,count:row.count,unitPriceGrosze:Math.round(Number(row.prices.gros)*100),lineCostGrosze:Math.round(Number(row.prices.worth_gros)*100)}]};})};
}
function native(kind: 'paid'|'free'|'mixed' = 'paid', change?: (value:any)=>void, pageChange?: (html:string)=>string) {
  const calls: {path:string;method:string;body?:string;fresh:boolean}[] = [];
  const fetchImpl: typeof fetch = async (input,init) => {
    const url=new URL(String(input)),headers=init?.headers as Record<string,string>,cookie=headers.Cookie;
    assert.equal(url.origin,'https://www.abud.pl');assert.ok(!cookie||cookie==='abudAnon=fixture');
    calls.push({path:url.pathname+url.search,method:init?.method??'GET',body:typeof init?.body==='string'?init.body:undefined,fresh:!cookie});
    const product=Object.values(products).find(row=>row.url===url.href);
    if(product){assert.equal(init?.method,'GET');return new Response(pageChange? pageChange(product.html):product.html,{headers:{'content-type':'text/html','set-cookie':'abudAnon=fixture; Path=/; Secure'}});}
    assert.equal(cookie,'abudAnon=fixture');
    if(url.pathname==='/ajax/client-new.php'){
      assert.equal(init?.method,'GET');assert.deepEqual([...url.searchParams.keys()],['checkDeliveryZipcode','region_id','zipcode']);
      assert.equal(url.searchParams.get('checkDeliveryZipcode'),'true');assert.equal(url.searchParams.get('region_id'),'1143020003');
      assert.match(url.searchParams.get('zipcode')!,/^\d{2}-\d{3}$/);
      return Response.json(url.searchParams.get('zipcode')==='40-001'?fixture.destinations.national:fixture.destinations.local);
    }
    if(url.pathname==='/basketchange.php'){
      assert.equal(init?.method,'POST');const form=new URLSearchParams(String(init.body));
      assert.deepEqual([...form.keys()],['getAjax','mode','product','size','number']);assert.equal(form.get('getAjax'),'true');assert.equal(form.get('mode'),'1');assert.equal(form.get('size'),'onesize');
      const wanted=order(kind).lines.flatMap(line=>line.packages).find(pack=>RETAIL_SOURCES.find(s=>s.id===pack.offerId)?.productId===Number(form.get('product')))!;
      assert.equal(Number(form.get('number')),wanted.count);
      const value=structuredClone(fixture.carts[kind]);change?.(value);return Response.json(value);
    }
    assert.equal(url.pathname,'/graphql/v1/','never calls an order, customer, payment or registration action');
    assert.equal(init?.method,'POST');assert.equal(headers['Content-Type'],'application/json');
    const body=JSON.parse(String(init.body));assert.deepEqual(Object.keys(body),['query']);assert.match(body.query,/^query \{ shipping\(ShippingInput: \{ mode: basket \}\)/);assert.doesNotMatch(body.query,/mutation|client|order|payment|customer/i);
    return Response.json(kind==='free'?fixture.rates.free:fixture.rates.paid);
  };
  return {fetchImpl,calls};
}

test('ABUD quotes one full postcode basket, including mixed products and actual free home courier', async()=>{
  for(const [kind,postalCode,shipping] of [['paid','00-001',1300],['paid','40-001',1300],['free','00-001',0],['mixed','00-001',1300]] as const){
    const api=native(kind),result=await quoteAbud(order(kind),postalCode,api.fetchImpl);
    assert.ok('quote'in result);assert.equal(result.quote.costGrosze,shipping);assert.equal(result.quote.carrier,'Pocztex Kurier 24');
    assert.equal(result.quote.postalCode,postalCode);assert.equal(result.quote.basis,'retailer_basket_postcode');assert.equal(result.quote.destinationScope,'postal_code');
    assert.equal(Date.parse(result.quote.expiresAt)-Date.parse(result.quote.checkedAt),600000);assert.match(result.quote.evidenceSha256,/^[a-f0-9]{64}$/);
    assert.equal(api.calls.filter(call=>call.path==='/graphql/v1/').length,1);assert.equal(api.calls.filter(call=>call.fresh).length,1);
  }
});
test('ABUD excludes locker, pickup, COD, unknown courier, malformed prices and conflicting rate duplicates',()=>{
  assert.equal(selectAbudHomeRate(fixture.rates.paid).costGrosze,1300);
  assert.throws(()=>selectAbudHomeRate({data:{shipping:{shipping:fixture.rates.paid.data.shipping.shipping.filter(rate=>rate.prepaid==='dvp'||[0,100149,100280,100335].includes(rate.courier.id))}}}),/no_home_delivery/);
  const rate=fixture.rates.paid.data.shipping.shipping.find(rate=>rate.prepaid==='prepaid'&&rate.courier.id===100037)!;
  for(const changed of [{...rate,cost:{value:0,formatted:'13,00 zł'}},{...rate,cost:{value:undefined,formatted:'0,00 zł'}},{...rate,cost:{value:-1,formatted:'-1,00 zł'}},{...rate,cost:{value:13,formatted:'13,00 EUR'}}]) assert.throws(()=>selectAbudHomeRate({data:{shipping:{shipping:[changed]}}}),/invalid_money/);
  assert.throws(()=>selectAbudHomeRate({data:{shipping:{shipping:[rate,rate]}}}),/invalid_response/);
  assert.throws(()=>selectAbudHomeRate({...fixture.rates.paid,errors:[{message:'Not ready'}]}),/invalid_response/);
});
test('ABUD accepts only the confirmed Poland root or its local area and rejects a different region',()=>{
  confirmAbudDestination(fixture.destinations.local);confirmAbudDestination(fixture.destinations.national);
  for(const mutate of [(r:any)=>{r.valid=false;},(r:any)=>{r.valid_region['1'][0].parent='DE';},(r:any)=>{r.valid_region['1'][0].shop_id='2';},(r:any)=>{r.valid_region['1'][0].url='https://other.example';},(r:any)=>{r.valid_region['1'][0].id_region='other';}]){const value=structuredClone(fixture.destinations.local);mutate(value);assert.throws(()=>confirmAbudDestination(value),/address_required/);}
});
test('ABUD refuses changed cart price, quantity, currency, deposit, extra items and insufficient stock before shipping', async()=>{
  for(const mutate of [(r:any)=>{r.error='Not added';},(r:any)=>{r.basket.shipping_exists=false;},(r:any)=>{r.basket.currency='EUR';},(r:any)=>{r.basket.worth=0;},(r:any)=>{r.basket.total_deposit=1;},(r:any)=>{r.basket.products[0].count=1;},(r:any)=>{r.basket.products[0].prices.gros='24.51';},(r:any)=>{r.basket.products[0].reservation_stocksown=1;},(r:any)=>{r.basket.products[0].price_unit='szt.';},(r:any)=>{r.basket.products.push(r.basket.products[0]);},(r:any)=>{delete r.basket.products[0].prices.gros_formatted;}]){
    const api=native('paid',mutate);await assert.rejects(quoteAbud(order(),'00-001',api.fetchImpl));assert.ok(!api.calls.some(call=>call.path==='/graphql/v1/'));
  }
  const expected=order().lines.map(line=>({source,count:line.packages[0].count,price:2450}));
  assert.equal(confirmAbudBasket(fixture.carts.paid,expected,4900).shippingCost,'0.00','unused cart placeholder is distinct from an actual delivery rate');
});
test('ABUD rechecks main product barcode and onesize purchase variant before cart actions', async()=>{
  for(const change of [(html:string)=>html.replaceAll('8590369454948','4006209806609'),(html:string)=>html.replace('value="onesize"','value="other"')]){
    const api=native('paid',undefined,change);await assert.rejects(quoteAbud(order(),'00-001',api.fetchImpl));assert.equal(api.calls.length,1);
  }
  const invalid=order();invalid.lines[0].packages[0].count=0;const api=native();await assert.rejects(quoteAbud(invalid,'00-001',api.fetchImpl),/invalid_basket/);assert.equal(api.calls.length,0);
});
test('ABUD native action gateway cannot accept another origin, product, customer field, GraphQL mutation or order action', async()=>{
  let calls=0;const fetchImpl:typeof fetch=async()=>{calls++;throw Error('must not reach network');};
  const client=new AnonymousShop('https://www.abud.pl',fetchImpl,AbortSignal.timeout(1000));
  for(const [action,args] of [['add',{productId:1,count:1}],['add',{productId:17848,count:0}],['destination',{postalCode:'00-001',address:'private'}],['shipping',{query:'mutation { placeOrder }'}],['order',{}]] as any[]) await assert.rejects(client.abud(action,args),/invalid_cart_action/);
  const foreign=new AnonymousShop('https://other.example',fetchImpl,AbortSignal.timeout(1000));await assert.rejects(foreign.abud('shipping'),/invalid_cart_action/);assert.equal(calls,0);
});
test('ABUD delivery cache shares an identical basket and keeps another postcode in a fresh anonymous session',async()=>{
  const api=native(),quote=createRetailerQuoter(api.fetchImpl);
  const [a,b]=await Promise.all([quote(order(),'00-001'),quote(order(),'00-001')]);assert.deepEqual(a,b);assert.equal(api.calls.length,4);
  const c=await quote(order(),'40-001');assert.ok('quote'in c);assert.equal(c.quote.postalCode,'40-001');assert.equal(api.calls.length,8);
  assert.equal(api.calls.filter(call=>call.fresh).length,2);assert.ok(retailerDeliveryCapabilities().automaticStores.includes('ABUD'));
});
test('actual HTTP consolidates two jobs into two fixing blisters and adds one 13 PLN delivery',async()=>{
  const api=native(),observed=parseRetailPage(products[source.id].html,source,new Date());
  const service=createRemontService({initialObservations:[observed],background:false,basketQuoter:createRetailerQuoter(api.fetchImpl)});
  const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  try{
    const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[1,2].map(id=>({jobId:'room-'+id,materials:[{material:{id:'fixing',name:source.name,ean:source.ean,category:source.category,unit:'szt'},quantity:2}]})),options:{store:'ABUD',delivery:{mode:'shipping',postalCode:'00-001'}}})});
    assert.equal(response.status,200);const result=await response.json();assert.equal(result.deliveryComparison.best.materialsGrosze,4900);assert.equal(result.deliveryComparison.best.deliveryGrosze,1300);assert.equal(result.deliveryComparison.best.totalGrosze,6200);
    assert.equal(result.consolidated.lines[0].totalQuantity,4);assert.equal(result.consolidated.lines[0].packages[0].count,2);assert.equal(api.calls.filter(call=>call.path==='/basketchange.php').length,1);
  }finally{service.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
