import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../src/shared-backend';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter,retailerDeliveryCapabilities} from '../src/lib/retailer-delivery';
import {AnonymousShop} from '../src/lib/retailer-http';
import {confirmSkyshopCart,inspectSkyshopProduct,MATBUD_ORIGIN} from '../src/lib/skyshop-product';
import {confirmSkyshopCalculation,confirmSkyshopShipping} from '../src/lib/skyshop-delivery';
import {skyshopBaskets,skyshopCard,skyshopParameters,skyshopProduct} from './fixtures/skyshop.fixture';

const source=RETAIL_SOURCES.find(row=>row.id==='matbud-yetico-gamma-fasada-044-10cm')!;
const copy=<T>(value:T):T=>structuredClone(value);
const inspect=(html=skyshopCard,api:any=copy(skyshopProduct),parameters:any=copy(skyshopParameters))=>inspectSkyshopProduct(html,api,parameters,source);
const basket=(count:number)=>({store:source.store,materialsGrosze:count*6974,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown' as const,lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:null},unit:'m2',packages:[{offerId:source.id,store:source.store,url:source.url,packageSize:3,minimumPackages:50,count,unitPriceGrosze:6974,lineCostGrosze:count*6974}]}]});

function mockShop(mutate?:(path:string,value:any)=>any){
 let count=50;const requests:{path:string;method:string;body?:string}[]=[];
 const fetchImpl:typeof fetch=async(input,init)=>{
  const url=new URL(String(input));assert.equal(url.origin,MATBUD_ORIGIN);
  const path=url.pathname+url.search,method=init?.method??'GET';requests.push({path,method,body:typeof init?.body==='string'?init.body:undefined});
  const data=()=>copy(skyshopBaskets.find(row=>row.count===count)!);
  let value:any,type='application/json';
  if(path===new URL(source.url).pathname){type='text/html';value=skyshopCard;}
  else if(path==='/proxy_public_api?endpoint=/sky2/api-public/products/96729')value=copy(skyshopProduct);
  else if(path==='/proxy_public_api?endpoint=/sky2/api-public/products/96729/choosable-parameters?')value=copy(skyshopParameters);
  else if(path==='/proxy_public_api?endpoint=/sky2/api-public/carts/latest')value=data().empty;
  else if(path.endsWith('/items')){
   assert.equal(method,'POST');assert.equal(new Headers(init?.headers).get('Content-Type'),'application/json');
   const body=JSON.parse(String(init?.body));assert.deepEqual(Object.keys(body).sort(),['parameters','productId','quantity']);assert.equal(body.productId,96729);assert.deepEqual(body.parameters,[]);count=body.quantity;assert.ok([50,51].includes(count));value=data().added;
  }else if(path.includes('/carts/'))value=data().cart;
  else if(path==='/cart'){type='text/html';value='<main>Synchronizacja koszyka</main>';}
  else if(path==='/order'){type='text/html';value=data().shippingHtml;}
  else if(path==='/order/?json=1&pay_id=5&c=PL&sel=&wdt=0'){assert.equal(method,'POST');assert.equal(init?.body,'');value=data().methods;}
  else if(path==='/order/?json=1&recalculate=1&c=PL&pay_id=5&shipment=s182be0c5c&wdt=0&gratis='){assert.equal(method,'GET');value=data().calculation;}
  else throw Error('Unreviewed native request '+method+' '+path);
  if(path.includes('/carts/')&&!path.endsWith('/latest'))assert.match(new Headers(init?.headers).get('Cookie')??'',/sky2_cart_id=00000000-0000-4000-8000-000000000001/);
  value=mutate?mutate(path,value):value;
  return new Response(type==='application/json'?JSON.stringify(value):value,{headers:{'content-type':type}});
 };
 return{fetchImpl,requests};
}

test('Matbud identifies the reviewed smooth physical pack without claiming a native barcode',()=>{
 const result=inspect();assert.equal(result.priceGrosze,6974);assert.equal(result.stock,120);assert.equal(result.product.gtin13,'5902578301976');
 assert.equal(skyshopProduct.ean,null);assert.equal(skyshopProduct.barCode,null);assert.ok(!skyshopCard.includes('gtin13'));
 assert.equal(source.minimumPackages,50);assert.equal(source.purchaseMultiple,undefined);
});

test('Matbud never borrows identity, quantity or pack facts from recommendations or another EPS variant',()=>{
 for(const html of [skyshopCard.replace('objętość opakowania: 0,3 m3','objętość opakowania: 0,287 m3'),skyshopCard.replace('powierzchnia płyt: 3 m2','powierzchnia płyt: 2,87 m2'),skyshopCard.replace('grubość płyty: 10 cm','grubość płyty: 15 cm'),skyshopCard.replace('data-product-id="96729"','data-product-id="96730"'),skyshopCard.replace('data-min="50"','data-min="1"'),skyshopCard.replace('data-tick="1"','data-tick="50"'),skyshopCard.replace('"price":"69.74"','"price":"1.00"')])assert.throws(()=>inspect(html));
 const wrong=copy(skyshopProduct);wrong.name='Styropian frezowany 10 cm';assert.throws(()=>inspect(skyshopCard,wrong));
 const code=copy(skyshopProduct) as any;code.ean='5902578302157';assert.throws(()=>inspect(skyshopCard,code));
 const related='<section><li>powierzchnia płyt: 3 m2</li></section>';
 assert.throws(()=>inspect(skyshopCard.replace('powierzchnia płyt: 3 m2','powierzchnia płyt: 2,87 m2')+related));
 const changed=copy(skyshopProduct);changed.amount.minAmount=1;assert.throws(()=>inspect(skyshopCard,changed),/purchase_rules_changed/);
});

test('Matbud cart checks catch a silent stock clamp, net-price confusion, discounts and missing lines',()=>{
 for(const fixture of skyshopBaskets)assert.equal(confirmSkyshopCart(fixture.cart,fixture.count,6974).items[0].quantity,fixture.count);
 for(const mutate of [
  (cart:any)=>{cart.items[0].quantity=49;},(cart:any)=>{cart.items[0].unitPriceSummary.final.gross=56.7;},
  (cart:any)=>{cart.items[0].product.id=96730;},(cart:any)=>{cart.items.push(copy(cart.items[0]));},
  (cart:any)=>{cart.discountCode='PROMO';},(cart:any)=>{cart.priceSummary.final.gross=0;},
  (cart:any)=>{cart.warnings.push({type:'STOCK',context:{}});},
 ]){const cart=copy(skyshopBaskets[0].cart);mutate(cart);assert.throws(()=>confirmSkyshopCart(cart,50,6974));}
 assert.throws(()=>confirmSkyshopCart(skyshopBaskets[0].cart,51,6974),/insufficient_stock/);
});

test('selected native home delivery and final gross total are required; empty order and pickup are not free-shipping proofs',()=>{
 const fixture=skyshopBaskets[0],id=fixture.cart.items[0].id;
 assert.equal(confirmSkyshopShipping(fixture.shippingHtml,fixture.methods,50,6974,id).price,0);
 assert.equal(confirmSkyshopCalculation(fixture.calculation,50,6974,id,true).orderPriceTotal,3487);
 for(const mutate of [(m:any)=>{delete m.s182be0c5c;},(m:any)=>{m.s182be0c5c.personal='yes';},(m:any)=>{m.s182be0c5c.price=34.99;},(m:any)=>{m.s182be0c5c.postal_codes=['61-315'];}]){const methods=copy(fixture.methods);mutate(methods);assert.throws(()=>confirmSkyshopShipping(fixture.shippingHtml,methods,50,6974,id));}
 assert.throws(()=>confirmSkyshopShipping('<section class="order" data-calc=""></section>',fixture.methods,50,6974,id));
 for(const mutate of [(v:any)=>{v.shipment.name='Odbiór osobisty';},(v:any)=>{v.orderPriceTotal=0;},(v:any)=>{v.products[0].amount=49;},(v:any)=>{v.orderCurrency='EUR';},(v:any)=>{v.orderPaymentOverhead=5;}]){const value=copy(fixture.calculation);mutate(value);assert.throws(()=>confirmSkyshopCalculation(value,50,6974,id,true));}
});

test('Sky-Shop transport is isolated and exposes only reviewed anonymous product/cart/shipping actions',async()=>{
 const mock=mockShop(),client=new AnonymousShop(MATBUD_ORIGIN,mock.fetchImpl,AbortSignal.timeout(5000));
 await assert.rejects(client.skyshop('add',50),/cart_session_not_confirmed/);
 await assert.rejects(new AnonymousShop('https://example.com',mock.fetchImpl,AbortSignal.timeout(5000)).skyshop('product'),/invalid_cart_action/);
 await client.skyshop('create-cart');
 const calls=mock.requests.length;
 for(const action of ['submit-order','checkout','customer','payment','/order/'])await assert.rejects(client.skyshop(action as any),/invalid_cart_action/);
 for(const count of [0,1,49,50.5,NaN,Infinity,10001])await assert.rejects(client.skyshop('add',count),/invalid_cart_action/);
 await assert.rejects(client.skyshop('create-cart'),/invalid_cart_action/);assert.equal(mock.requests.length,calls);
});

test('actual adapters preserve 50/51 native counts and reject stale price or insufficient stock before creating a cart',async()=>{
 for(const count of [50,51]){
  const mock=mockShop(),observation=await readRetailSource(source,mock.fetchImpl);
  assert.equal(observation.priceGrosze,6974);assert.equal(observation.stockPackages,120);assert.equal(observation.ean,source.ean);
  const quoted=await createRetailerQuoter(mock.fetchImpl)(basket(count),'80-001');assert.ok('quote'in quoted,JSON.stringify(quoted));assert.equal(quoted.quote.costGrosze,0);assert.equal(quoted.quote.destinationScope,'PL');
  assert.ok(mock.requests.some(request=>request.path==='/cart'));assert.ok(mock.requests.every(request=>request.path!=='/order/'||request.method!=='POST'));
 }
 for(const [order,reason]of [[basket(121),'insufficient_stock'],[{...basket(50),materialsGrosze:50},'quote_unavailable']]as const){
  const mock=mockShop(),result=await createRetailerQuoter(mock.fetchImpl)(order,'00-001');assert.deepEqual(result,{reason});assert.ok(!mock.requests.some(request=>request.path.endsWith('/carts/latest')));
 }
 const old=basket(50);old.lines[0].packages[0].unitPriceGrosze=1;old.lines[0].packages[0].lineCostGrosze=50;old.materialsGrosze=50;
 assert.deepEqual(await createRetailerQuoter(mockShop().fetchImpl)(old,'00-001'),{reason:'price_changed'});
 assert.ok(retailerDeliveryCapabilities().automaticStores.includes(source.store));
});

test('real HTTP consolidates the minimum once, quotes the complete basket and rejects over-stock delivery',async()=>{
 const mock=mockShop(),observation=await readRetailSource(source,mock.fetchImpl),service=createRemontService({initialObservations:[observation],background:false,fetchImpl:mock.fetchImpl});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const root='http://127.0.0.1:'+(server.address()as{port:number}).port;
  const post=async(quantities:number[],mode='shipping')=>{
   const response=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:quantities.map((quantity,index)=>({jobId:'room-'+index,materials:[{material:{id:'eps',name:'Styropian fasadowy biały Yetico Gamma Fasada 044 100 mm (3 m²)',category:'insulation',unit:'m2'},quantity}]})),options:{store:source.store,delivery:{mode,postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();
  };
  for(const [quantities,count]of [[[3],50],[[153],51],[[75,78],51]]as const){
   const result=await post([...quantities]);assert.equal(result.consolidated.consolidatedTotalGrosze,count*6974);assert.equal(result.consolidated.lines[0].packages[0].count,count);assert.equal(result.consolidated.lines[0].packages[0].minimumPackages,50);assert.equal(result.stages[0].lines[0].offers[0].minimumPackages,50);assert.equal(result.deliveryComparison.best.totalGrosze,count*6974);assert.equal(result.deliveryComparison.best.deliveryGrosze,0);
  }
  const beforeShort=mock.requests.length,unavailable=await post([363]);assert.equal(unavailable.deliveryComparison.best,null);assert.equal(unavailable.deliveryComparison.status,'partial');assert.equal(unavailable.stages[0].lines[0].reason,'insufficient-stock');assert.equal(unavailable.consolidated.lines.length,0);assert.equal(mock.requests.length,beforeShort);
  const pickup=await post([3],'pickup');assert.equal(pickup.deliveryComparison.best,null);assert.equal(pickup.stages[0].lines[0].reason,'no-offer');assert.ok(pickup.coverage.pickupConfirmationStores.includes(source.store));
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
