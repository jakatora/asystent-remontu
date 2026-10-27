import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/irbud.json' with {type:'json'};
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {inspectIrbudCard} from '../src/lib/irbud-woo';
import {retailProductId,retailProductName} from '../src/lib/retail-sku';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import {AnonymousShop} from '../src/lib/retailer-http';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const source=RETAIL_SOURCES.find(s=>s.id==='irbud-norgips-cd60-06-3m')!;
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
function capture(mutate?:(v:any,path:string)=>void){const actions:string[]=[];const fetcher:typeof fetch=async(input,init)=>{const url=new URL(String(input)),path=url.pathname;assert.equal(url.origin,'https://irbudsklep.pl');if(path.includes('/produkt/'))return new Response(fixture.primary);const body=init?.body?JSON.parse(String(init.body)):null;actions.push(path);const sample=fixture.carts.find(r=>r.path===path&&JSON.stringify(r.body)===JSON.stringify(body));assert.ok(sample,'Only recorded cart/read, pinned add and shipping selection routes are allowed');const response=clone(sample.response);mutate?.(response,path);return Response.json(response,{headers:{'Cart-Token':'isolated-test-session'}});};return{fetcher,actions};}
const basket:DeliveredStoreBasket={store:'IRBUD',materialsGrosze:14885,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-sku-irbud-10911',name:source.name,imageUrl:null},unit:'mb',packages:[{offerId:source.id,count:13,packageSize:3,lineCostGrosze:14885,unitPriceGrosze:1145,store:'IRBUD',url:source.url}]}]};

test('IRBUD confirms a native3m profile at gross11.45 and keeps a merchant identity without inventing GTIN',async()=>{
 const o=await readRetailSource(source,capture().fetcher);assert.equal(o.priceGrosze,1145);assert.equal(o.ean,'');assert.equal(retailProductId(source),'remont-sku-irbud-10911');assert.match(retailProductName(source),/Norgips, oferta IRBUD/);
 for(const patch of [{ean:'5907651698899'},{packageSize:1},{productId:10912},{brand:'Budmat'},{skuIdentity:{...source.skuIdentity!,manufacturerSku:'10911'}}])assert.throws(()=>inspectIrbudCard(fixture.primary,{...source,...patch}));
 for(const [from,to]of [['11,45','11,46'],['Grubość blachy: 0,6 mm','Grubość blachy: 0,5 mm'],['NORGIPS','BUDMAT']]){const bad=fixture.primary.replaceAll(from,to);assert.notEqual(bad,fixture.primary);if(from==='11,45')assert.equal(inspectIrbudCard(bad,source).priceGrosze,1146);else assert.throws(()=>inspectIrbudCard(bad,source));}
 await assert.rejects(readRetailSource(source,capture((v,path)=>{if(path.endsWith('add-item'))v.items[0].sku='other';}).fetcher),/basket_not_confirmed/);
});

test('IRBUD confirms courier52 gross for13profiles; zero pickup and COD70 do not win the delivery comparison',async()=>{
 const {fetcher,actions}=capture(),result=await createRetailerQuoter(fetcher)(basket,'00-001');assert.ok('quote'in result);assert.equal(result.quote.costGrosze,5200);assert.equal(result.quote.destinationScope,'postal_code');assert.equal(result.quote.postalCode,'00-001');assert.equal(result.quote.payment,'Przelew bankowy');assert.equal(actions.at(-1),'/wp-json/wc/store/v1/cart/select-shipping-rate');
 const noHome=await createRetailerQuoter(capture((v,path)=>{if(path.endsWith('update-customer'))v.shipping_rates[0].shipping_rates=v.shipping_rates[0].shipping_rates.filter((r:any)=>r.method_id==='local_pickup');}).fetcher)(basket,'00-001');assert.deepEqual(noHome,{reason:'no_home_delivery'});
 const mismatch=await createRetailerQuoter(capture((v,path)=>{if(path.endsWith('select-shipping-rate'))v.totals.total_shipping='0';}).fetcher)(basket,'00-001');assert.deepEqual(mismatch,{reason:'basket_not_confirmed'});
 const wrongDestination=await createRetailerQuoter(capture((v,path)=>{if(path.endsWith('select-shipping-rate'))v.shipping_rates[0].destination.postcode='80-001';}).fetcher)(basket,'00-001');assert.deepEqual(wrongDestination,{reason:'basket_not_confirmed'});
 const changed=await createRetailerQuoter(capture().fetcher)({...basket,materialsGrosze:13000},'00-001');assert.deepEqual(changed,{reason:'price_changed'});
});

test('Woo selector cannot submit customer fields, payment/order actions, unreviewed carriers or another merchant',async()=>{
 let calls=0;for(const origin of ['https://irbudsklep.pl','https://domat24.pl']){const client=new AnonymousShop(origin,async()=>{calls++;throw Error('unexpected request');},AbortSignal.timeout(1000));for(const [path,body]of [['/wp-json/wc/store/v1/checkout',{}],['/wp-json/wc/store/v1/cart/update-customer',{shipping_address:{postcode:'00-001'}}],['/wp-json/wc/store/v1/cart/select-shipping-rate',{package_id:0,rate_id:'local_pickup:24'}],['/wp-json/wc/store/v1/cart/select-shipping-rate',{package_id:0,rate_id:'flexible_shipping_single:3',email:'not-sent@example.invalid'}]]as const)await assert.rejects(client.cartJson(path,body),/invalid_cart_route/);}assert.equal(calls,0);
});
