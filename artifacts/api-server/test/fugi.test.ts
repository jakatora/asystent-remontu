import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/fugi.json' with {type:'json'};
import {FUGI_SOURCES} from '../src/lib/fugi-sources';
import {inspectFugiCard,confirmFugiProduct,quoteFugi} from '../src/lib/fugi';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter,retailerDeliveryCapabilities} from '../src/lib/retailer-delivery';
import {AnonymousShop} from '../src/lib/retailer-http';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const token='fixture.cart.token',nonce=(i:number)=>i.toString(16).padStart(10,'a');
function basket(large=false):DeliveredStoreBasket{
 const counts:Record<number,number>={12115:large?2:1,3792:large?12:4,3793:large?3:1,3797:large?2:1,3798:large?3:1};
 const lines=FUGI_SOURCES.map(source=>{const p=fixture.products.find(p=>p.id===source.productId)!,price=Number(p.product.prices.price),count=counts[source.productId!];return{product:{id:'remont-'+source.ean,name:source.name,imageUrl:source.imageUrl!},unit:source.unit,packages:[{offerId:source.id,store:source.store,url:source.url,packageSize:source.packageSize,count,unitPriceGrosze:price,lineCostGrosze:count*price}]};});
 return{store:'FUGI.PL',materialsGrosze:lines.reduce((n,l)=>n+l.packages[0].lineCostGrosze,0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines};
}
function http(flow:'small'|'large'|'otherPostcode'='small',options:{card?:(s:string)=>string;api?:(p:any)=>any;cart?:(c:any,index:number)=>any;missingNonce?:boolean;badNonce?:boolean}={}){
 const calls:{path:string;method:string}[]=[],states=structuredClone(fixture[flow]);let stage=0;
 const fetchImpl=(async(input:any,init:any)=>{
  const u=new URL(input);assert.equal(u.origin,'https://fugi.pl');calls.push({path:u.pathname,method:init.method});
  const source=FUGI_SOURCES.find(s=>s.url===u.href),product=fixture.products.find(p=>u.pathname==='/wp-json/wc/store/v1/products/'+p.id);
  if(source){assert.equal(init.method,'GET');const p=fixture.products.find(p=>p.id===source.productId)!;return new Response(options.card?.(p.card)??p.card);}
  if(product){assert.equal(init.method,'GET');return Response.json(options.api?.(structuredClone(product.product))??product.product);}
  const step=states[stage];assert(step,'unexpected cart request');assert.equal(u.pathname,step.path);assert.equal(init.method,step.method);assert.deepEqual(init.body?JSON.parse(init.body):null,step.body);
  const headers=new Headers(init.headers);if(stage){assert.equal(headers.get('Cart-Token'),token);assert.equal(headers.get('Nonce'),nonce(stage-1));assert.equal(headers.get('Cookie'),'wp_fixture=anonymous');}
  const response=options.cart?.(structuredClone(step.response),stage)??step.response,index=stage++;
  return Response.json(response,{headers:{'Cart-Token':token,...(!options.missingNonce?{Nonce:options.badNonce?'bad/nonce':nonce(index)}:{}),...(index===0?{'Set-Cookie':'wp_fixture=anonymous; Path=/; Secure; HttpOnly'}:{})}});
 }) as typeof fetch;return{calls,fetchImpl};
}

test('FUGI binds all five native summaries to exact GTIN/SKU, gross API prices and authentic images; 120 mm cuffs remain two-packs',async()=>{
 for(const source of FUGI_SOURCES){const p=fixture.products.find(p=>p.id===source.productId)!,card=inspectFugiCard(p.card,source),product=confirmFugiProduct(p.product,source,card.priceGrosze);assert.equal(product.priceGrosze,Number(p.product.prices.price));const h=http(),o=await readRetailSource(source,h.fetchImpl);assert.equal(o.ean,source.ean);assert.equal(o.imageUrl,source.imageUrl);assert.equal(o.stockPackages,undefined);assert.equal(h.calls.length,2);}
 assert.equal(FUGI_SOURCES.find(s=>s.productId===3797)!.packageSize,2);assert(retailerDeliveryCapabilities().automaticStores.includes('FUGI.PL'));assert(!retailerDeliveryCapabilities().postcodeStores.includes('FUGI.PL'));
});
test('FUGI quotes the actual five-product basket with the cheaper reviewed home courier, public nonce rotation and bank prepayment',async()=>{
 const h=http(),quote=createRetailerQuoter(h.fetchImpl),result=await quote(basket(),'30-001');assert.ok('quote'in result);if(!('quote'in result))return;
 assert.equal(result.quote.costGrosze,1399);assert.equal(result.quote.carrier,'Kurier Inpost – przedpłata');assert.equal(result.quote.payment,'Przelew bankowy');assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);assert.equal(Date.parse(result.quote.expiresAt)-Date.parse(result.quote.checkedAt),600000);assert.equal(h.calls.length,19);
 assert.deepEqual(await quote(basket(),'30-001'),result);assert.equal(h.calls.length,19);assert(!h.calls.some(c=>/checkout|order|payment|login|coupon/.test(c.path)));
 const large=await quoteFugi(basket(true),'30-001',http('large').fetchImpl);assert.ok('quote'in large);if('quote'in large)assert.equal(large.quote.costGrosze,1399);
 const other=await quoteFugi(basket(),'00-001',http('otherPostcode').fetchImpl);assert.ok('quote'in other);if('quote'in other)assert.equal(other.quote.destinationScope,'PL');
});
test('FUGI rejects a changed identity, unit, stock, price or two-piece pack before accepting an offer',()=>{
 const source=FUGI_SOURCES[0],p=fixture.products.find(p=>p.id===source.productId)!;
 for(const card of [p.card.replace(source.ean,'0000000000000'),p.card.replaceAll('93.50','94.50'),p.card.replace('step="1"','step="0.5"'),p.card.replace('stock in-stock','stock out-of-stock')]){assert.notEqual(card,p.card);assert.throws(()=>{const read=inspectFugiCard(card,source);confirmFugiProduct(p.product,source,read.priceGrosze);});}
 for(const patch of [{id:1},{sku:'other'},{name:'other'},{is_in_stock:false},{has_options:true},{images:[]},{prices:{...p.product.prices,currency_code:'EUR'}},{prices:{...p.product.prices,price:'9351'}}])assert.throws(()=>confirmFugiProduct({...p.product,...patch},source,9350));
 assert.throws(()=>inspectFugiCard(p.card,{...source,packageSize:1}),/invalid_basket/);
});
test('FUGI never substitutes a locker/COD, empty rate, foreign postcode or unselected courier for confirmed home delivery',async()=>{
 const edits=[
  (c:any)=>{c.shipping_rates[0].shipping_rates=c.shipping_rates[0].shipping_rates.filter((r:any)=>!['flexible_shipping_single:15','flexible_shipping_single:22'].includes(r.rate_id));},
  (c:any)=>{for(const r of c.shipping_rates[0].shipping_rates)if(['flexible_shipping_single:15','flexible_shipping_single:22'].includes(r.rate_id)){r.price='0';r.taxes='0';}},
  (c:any)=>{c.shipping_rates[0].destination.postcode='00-001';},
  (c:any)=>{c.has_calculated_shipping=false;},
  (c:any)=>{c.payment_methods=['cod'];},
 ];
 for(const edit of edits)await assert.rejects(()=>quoteFugi(basket(),'30-001',http('small',{cart:(c,i)=>{if(i===6)edit(c);return c;}}).fetchImpl));
 await assert.rejects(()=>quoteFugi(basket(),'30-001',http('small',{cart:(c,i)=>{if(i===8)for(const r of c.shipping_rates[0].shipping_rates)r.selected=r.rate_id==='flexible_shipping_single:23';return c;}}).fetchImpl),/basket_not_confirmed/);
});
test('FUGI rejects incomplete quantities, a changed gross final total, coupon or surcharge instead of emitting a full quote',async()=>{
 for(const edit of [(c:any)=>{c.items.pop();},(c:any)=>{c.items[0].quantity++;},(c:any)=>{c.totals.total_price=String(Number(c.totals.total_price)+1);},(c:any)=>{c.fees=[{name:'extra'}];},(c:any)=>{c.coupons=[{code:'unreviewed'}];}])await assert.rejects(()=>quoteFugi(basket(),'30-001',http('small',{cart:(c,i)=>{if(i===8)edit(c);return c;}}).fetchImpl));
 const o=basket(),p=o.lines[0].packages[0];p.count=9;p.lineCostGrosze=p.count*p.unitPriceGrosze;o.materialsGrosze=o.lines.reduce((n,l)=>n+l.packages[0].lineCostGrosze,0);const h=http();await assert.rejects(()=>quoteFugi(o,'30-001',h.fetchImpl),/insufficient_stock/);assert.equal(h.calls.length,2);
});
test('FUGI requires the same anonymous cart nonce and rejects unreviewed products, address fields and final order routes',async()=>{
 for(const options of [{missingNonce:true},{badNonce:true}]){const h=http('small',options);await assert.rejects(()=>quoteFugi(basket(),'30-001',h.fetchImpl),/cart_session_not_confirmed|invalid_cart_session/);assert(!h.calls.some(c=>c.method==='POST'));}
 let calls=0;const never=(async()=>{calls++;throw Error('must not request');}) as typeof fetch;
 for(const [path,body]of [['/wp-json/wc/store/v1/checkout',{}],['/wp-json/wc/store/v1/cart',{email:'no@example.invalid'}],['/wp-json/wc/store/v1/cart/add-item',{id:1,quantity:1}],['/wp-json/wc/store/v1/cart/update-customer',{shipping_address:{country:'PL',postcode:'30-001',city:'unreviewed'}}],['/wp-json/wc/store/v1/cart/select-shipping-rate',{package_id:0,rate_id:'flexible_shipping_single:23'}]] as const)await assert.rejects(()=>new AnonymousShop('https://fugi.pl',never,AbortSignal.timeout(500)).cartJson(path,body),/invalid_cart_route/);
 await assert.rejects(()=>new AnonymousShop('https://fugi.pl',never,AbortSignal.timeout(500)).text('/checkout',{name:'unreviewed'}),/invalid_cart_route/);assert.equal(calls,0);
 const o=basket();o.lines.find(l=>l.packages[0].offerId==='fugi-mapeband-w-cuff-2')!.packages[0].packageSize=1;await assert.rejects(()=>quoteFugi(o,'30-001',never),/invalid_basket/);assert.equal(calls,0);const other=basket();other.lines[0].product.id='remont-unreviewed';await assert.rejects(()=>quoteFugi(other,'30-001',never),/invalid_basket/);assert.equal(calls,0);
});
