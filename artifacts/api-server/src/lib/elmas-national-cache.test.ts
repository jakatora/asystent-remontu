import assert from 'node:assert/strict';
import {test} from 'node:test';
import single from './fixtures/elmas-tape-wave176.json';
import mixed from './fixtures/elmas-mixed-wave179.json';
import {ELMAS_TAPE,ELMAS_TAPE_75,ELMAS_ORIGIN} from './elmas-source';
import {elmasNationalBasketKey} from './elmas-delivery';
import {createRetailerQuoter,quoteBeforeDeadline} from './retailer-delivery';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

function order(count=1):DeliveredStoreBasket{return{store:'Elmas',materialsGrosze:count*2289,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+ELMAS_TAPE.ean,name:ELMAS_TAPE.name,imageUrl:ELMAS_TAPE.imageUrl!},unit:'m',packages:[{offerId:ELMAS_TAPE.id,store:'Elmas',url:ELMAS_TAPE.url,packageSize:30,count,unitPriceGrosze:2289,lineCostGrosze:count*2289}]}]};}
function network(options:{limited?:boolean;anyCounts?:boolean}={}){
  const calls:{url:string;method:string}[]=[];
  const fetcher:typeof fetch=async(input,init)=>{
    const url=String(input),method=init?.method??'GET';calls.push({url,method});
    for(const[source,f]of [[ELMAS_TAPE,single],[ELMAS_TAPE_75,mixed]]as const){if(url===source.url)return new Response(f.html,{headers:{'content-type':'text/html'}});if(url===ELMAS_ORIGIN+'/api/public/p/'+source.retailerSku+'?lang=pl&id=1')return Response.json(f.api);}
    assert.equal(url,ELMAS_ORIGIN+'/api/public/order/form');assert.equal(method,'POST');if(options.limited)return Response.json({error:'too_many_attempts_account_blocked'},{status:429});
    const body=JSON.parse(String(init?.body));assert.equal(body.deliveryCountry,'pl');assert.equal(body.currency,'PLN');assert.equal(body.postalCode,undefined);
    const counts=[ELMAS_TAPE,ELMAS_TAPE_75].map(s=>body.basket.find((r:any)=>r.product._id===s.retailerSku)?.quantity??0);
    const row=counts[1]?mixed.cases.find(c=>c.counts.join()===counts.join()):single.cases.find(c=>c.count===counts[0])??(options.anyCounts?single.cases[0]:undefined);assert.ok(row,'No recorded cart '+counts);
    return Response.json(body.selectedDeliveryId===undefined?row.initial:row.selected);
  };return{fetcher,calls};
}

test('one actual national basket result serves another valid postcode and deadline lookup without new I/O or a new expiry',async()=>{
  const n=network(),quote=createRetailerQuoter(n.fetcher),first=await quote(order(8),'30-001');assert.ok('quote'in first);assert.equal(n.calls.length,4);const before=JSON.stringify(first);
  const other=await quote(order(8),'00-001');assert.deepEqual(other,first);assert.equal(n.calls.length,4);assert.equal(JSON.stringify(first),before);
  assert.deepEqual(await quoteBeforeDeadline(quote,order(8),'42-209',Date.now()-1),first);assert.equal(n.calls.length,4);assert.equal(first.quote.destinationScope,'PL');assert.equal(first.quote.basis,'retailer_basket_national');assert.equal(first.quote.postalCode,undefined);
});

test('a mixed national basket is shared after reversing its lines, with both independent widths and one native courier',async()=>{
  const o=order();o.materialsGrosze+=3200;o.lines.push({product:{id:'remont-'+ELMAS_TAPE_75.ean,name:ELMAS_TAPE_75.name,imageUrl:ELMAS_TAPE_75.imageUrl!},unit:'m',packages:[{offerId:ELMAS_TAPE_75.id,store:'Elmas',url:ELMAS_TAPE_75.url,packageSize:30,count:1,unitPriceGrosze:3200,lineCostGrosze:3200}]});
  const n=network(),quote=createRetailerQuoter(n.fetcher),first=await quote(o,'30-001');assert.ok('quote'in first);assert.equal(first.quote.costGrosze,5000);assert.equal(n.calls.length,6);
  const reversed={...o,lines:o.lines.slice().reverse()};assert.equal(elmasNationalBasketKey(o),elmasNationalBasketKey(reversed));assert.deepEqual(await quote(reversed,'00-001'),first);assert.equal(n.calls.length,6);
});

test('another quantity or fresh material price needs its own merchant confirmation',async()=>{
  const n=network(),quote=createRetailerQuoter(n.fetcher);assert.ok('quote'in await quote(order(),'30-001'));assert.equal(n.calls.length,4);
  assert.equal(quote.cached!(order(2),'00-001'),null);assert.ok('quote'in await quote(order(2),'00-001'));assert.equal(n.calls.length,8);
  const changed=order();changed.materialsGrosze=2290;changed.lines[0].packages[0].unitPriceGrosze=2290;changed.lines[0].packages[0].lineCostGrosze=2290;
  assert.equal(quote.cached!(changed,'30-001'),null);assert.deepEqual(await quote(changed,'30-001'),{reason:'price_changed'});assert.equal(n.calls.length,10);assert.equal(n.calls.filter(c=>c.method==='POST').length,4);
});

test('country, postcode-specific basis, evidence, cost and validity contradictions cannot supply a national fallback',async()=>{
  const now=Date.now();for(const patch of [{destinationScope:'postal_code',postalCode:'30-001'},{destinationScope:'DE'},{basis:'retailer_basket'},{postalCode:'30-001'},{sourceUrl:'https://other.example/form'},{evidenceSha256:''},{costGrosze:NaN},{checkedAt:new Date(now+60_000).toISOString()},{expiresAt:new Date(now-1).toISOString()},{expiresAt:new Date(now+900_000).toISOString()}]){
    const n=network(),quote=createRetailerQuoter(n.fetcher),first=await quote(order(),'30-001');assert.ok('quote'in first);Object.assign(first.quote,patch);
    assert.equal(quote.cached!(order(),'00-001'),null);assert.deepEqual(await quoteBeforeDeadline(quote,order(),'00-001',Date.now()-1),{reason:'quote_timeout'});assert.equal(n.calls.length,4);
    const renewed=await quote(order(),'00-001');assert.ok('quote'in renewed);assert.equal(n.calls.length,8);assert.equal(renewed.quote.destinationScope,'PL');assert.equal(renewed.quote.costGrosze,5000);
  }
});

test('a malformed reviewed basket cannot borrow a valid quote, even under its original postcode',async()=>{
  const n=network(),quote=createRetailerQuoter(n.fetcher);assert.ok('quote'in await quote(order(),'30-001'));
  for(const mutate of [(o:DeliveredStoreBasket)=>o.lines[0].unit='kg',(o:DeliveredStoreBasket)=>o.lines[0].product.id='remont-'+ELMAS_TAPE_75.ean,(o:DeliveredStoreBasket)=>o.lines[0].packages[0].url=ELMAS_TAPE_75.url,(o:DeliveredStoreBasket)=>o.lines[0].packages[0].purchaseMultiple=18,(o:DeliveredStoreBasket)=>o.lines[0].packages[0].lineCostGrosze++,(o:DeliveredStoreBasket)=>o.lines.push(o.lines[0])]){
    const changed=order();mutate(changed);assert.equal(elmasNationalBasketKey(changed),null);for(const postcode of ['30-001','00-001']){assert.equal(quote.cached!(changed,postcode),null);assert.deepEqual(await quote(changed,postcode),{reason:'quote_unavailable'});}
  }assert.equal(n.calls.length,4);
  assert.deepEqual(await quote(order(),'DE-123'),{reason:'invalid_postal_code'});assert.equal(quote.cached!(order(),'DE-123'),null);assert.equal(n.calls.length,4);
});

test('the existing expiry safety margin triggers a fresh national quote and never extends the previous evidence',async t=>{
  t.mock.timers.enable({apis:['Date'],now:Date.now()});const n=network(),quote=createRetailerQuoter(n.fetcher),first=await quote(order(),'30-001');assert.ok('quote'in first);const expiry=first.quote.expiresAt;
  t.mock.timers.tick(540001);assert.equal(quote.cached!(order(),'00-001'),null);const second=await quote(order(),'00-001');assert.ok('quote'in second);assert.equal(n.calls.length,8);assert.equal(first.quote.expiresAt,expiry);assert.ok(Date.parse(second.quote.expiresAt)>Date.parse(expiry));
});

test('rate-limited or otherwise unconfirmed calculations never become a national delivery result',async()=>{
  const n=network({limited:true}),quote=createRetailerQuoter(n.fetcher);assert.deepEqual(await quote(order(),'30-001'),{reason:'retailer_rate_limited'});assert.equal(quote.cached!(order(),'00-001'),null);
  assert.deepEqual(await quoteBeforeDeadline(quote,order(),'00-001',Date.now()-1),{reason:'quote_timeout'});assert.equal(n.calls.length,3);assert.deepEqual(await quote(order(),'00-001'),{reason:'retailer_rate_limited'});assert.equal(n.calls.length,6);
});

test('national cache stays bounded: old baskets are evicted while the latest still-confirmed basket remains available',async()=>{
  const n=network({anyCounts:true}),quote=createRetailerQuoter(n.fetcher);for(let count=1;count<=70;count++)assert.ok('quote'in await quote(order(count),'30-001'));
  const before=n.calls.length;assert.equal(quote.cached!(order(1),'00-001'),null);assert.ok(quote.cached!(order(70),'00-001'));assert.equal(n.calls.length,before);
});
