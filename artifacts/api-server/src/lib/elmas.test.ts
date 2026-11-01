import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import fixture from './fixtures/elmas-tape-wave176.json';
import {ELMAS_TAPE,ELMAS_ORIGIN,ELMAS_HOME_CARRIER} from './elmas-source';
import {readElmasProduct,readElmasNativeCard} from './elmas-product';
import {quoteElmas} from './elmas-delivery';
import {parseRetailPage} from './retail-pages';
import {AnonymousShop} from './retailer-http';
import {createRemontService} from '../shared-backend';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

function order(count=1):DeliveredStoreBasket{return{store:'Elmas',materialsGrosze:count*2289,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+ELMAS_TAPE.ean,name:ELMAS_TAPE.name,imageUrl:ELMAS_TAPE.imageUrl!},unit:'m',packages:[{offerId:ELMAS_TAPE.id,store:'Elmas',url:ELMAS_TAPE.url,packageSize:30,count,unitPriceGrosze:2289,lineCostGrosze:count*2289}]}]};}
function network(count=1,change?:(phase:string,data:any)=>void){
  const row=fixture.cases.find(c=>c.count===count)!,calls:{url:string;method:string;body?:any}[]=[];
  const fetcher:typeof fetch=async(input,init)=>{
    const url=String(input),method=init?.method??'GET',body=init?.body?JSON.parse(String(init.body)):undefined;calls.push({url,method,body});
    if(url===ELMAS_TAPE.url){assert.equal(method,'GET');return new Response(fixture.html,{headers:{'content-type':'text/html'}});}
    if(url===ELMAS_ORIGIN+'/api/public/p/'+ELMAS_TAPE.retailerSku+'?lang=pl&id=1'){const data=structuredClone(fixture.api);change?.('product',data);return Response.json(data);}
    assert.equal(url,ELMAS_ORIGIN+'/api/public/order/form');assert.equal(method,'POST');assert.equal(new Headers(init?.headers).get('content-type'),'application/json');assert.equal(body.deliveryCountry,'pl');assert.equal(body.currency,'PLN');assert.equal(body.basket.length,1);assert.equal(body.basket[0].product._id,ELMAS_TAPE.retailerSku);assert.equal(body.basket[0].quantity,count);assert.equal(body.basket[0].product.weight,0.3);
    assert.equal(body.basket[0].product.price.discountBrutto,22.89);assert.ok(Object.keys(body).every(k=>['step','code','giftCardCode','currency','basket','lang','deliveryCountry','total','init','selectedDeliveryId'].includes(k)));
    const phase=body.selectedDeliveryId===undefined?'initial':'selected';if(phase==='selected')assert.equal(body.selectedDeliveryId,ELMAS_HOME_CARRIER);const data=structuredClone(row[phase]);change?.(phase,data);return Response.json(data);
  };
  return{fetcher,calls};
}
const state=(change:(p:any)=>void)=>fixture.html.replace(/(<script>__state__=\s*)([\s\S]*?)(<\/script>)/,(_all,start,raw,end)=>{const x=JSON.parse(raw);change(x.product);return start+JSON.stringify(x)+end;});

test('actual primary card identifies a single 30 m Norgips roll, exact EAN, stock, gross price and image',()=>{
  const card=readElmasProduct(fixture.html,ELMAS_TAPE);assert.equal(card.priceGrosze,2289);assert.equal(card.maxPackages,197);assert.equal(card.imageUrl,ELMAS_TAPE.imageUrl);const observation=parseRetailPage(fixture.html,ELMAS_TAPE,new Date(fixture.capturedAt));assert.equal(observation.ean,'5907651698004');assert.equal(observation.stockPackages,197);assert.equal(observation.priceGrosze,2289);assert.equal(observation.availability,'in_stock');
});
test('wrong EAN, primary card, factory volume or carton multiplier cannot borrow a recommendation identity',()=>{
  assert.throws(()=>readElmasProduct(fixture.html.replace('Kod produktu: </span>5907651698004','Kod produktu: </span>5907651698011'),ELMAS_TAPE));
  assert.throws(()=>readElmasProduct(fixture.html.replace('data-p-id="6a69c6cc869b9bc4c7953c25"','data-p-id="other"'),ELMAS_TAPE));
  assert.throws(()=>readElmasProduct(fixture.html+fixture.html,ELMAS_TAPE));
  for(const patch of [{ean:'5907651698011'},{unit:'kg'},{packageSize:1},{purchaseMultiple:18},{minimumPackages:20},{retailerSku:'other'},{url:ELMAS_ORIGIN+'/p/other'}])assert.throws(()=>readElmasProduct(fixture.html,{...ELMAS_TAPE,...patch}));
});
test('missing stock, preorder, another native variant, fractional money and contradictory metadata stop import',()=>{
  for(const mutate of [(p:any)=>{p.variants[0].count=0;},(p:any)=>{p.variants[0].locked=p.variants[0].count;},(p:any)=>{p.preorder=true;},(p:any)=>{p.personalization=[{required:true}];},(p:any)=>{p.variants.push(p.variants[0]);},(p:any)=>{p.variants[0].weight=30;},(p:any)=>{p.price.quantityFactor=18;},(p:any)=>{p.price.currency='EUR';},(p:any)=>{p.ean='5907651698011';},(p:any)=>{p.price.discountBrutto=22.891;},(p:any)=>{p.manufacturer.name='SILA';}])assert.throws(()=>readElmasProduct(state(mutate),ELMAS_TAPE));
  assert.throws(()=>readElmasNativeCard({...fixture.api,variants:[]},ELMAS_TAPE));
});
test('real native home-courier calculations keep 40 PLN lockers separate from 50 PLN courier and confirm a free larger basket',async()=>{
  for(const count of [1,2,8,9]){const api=network(count),result=await quoteElmas(order(count),api.fetcher);assert.ok('quote'in result);assert.equal(result.quote.costGrosze,count===9?0:5000);assert.equal(result.quote.carrier,'InPost Kurier');assert.equal(result.quote.payment,'Przelewy24');assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(api.calls.length,4);assert.ok(api.calls.every(c=>!c.url.endsWith('/order/new')));}
});
test('locker-only, disabled carrier or missing prepaid payment never become a home-delivery quote',async()=>{
  for(const mutate of [(d:any)=>{d.deliveryOptions=d.deliveryOptions.filter((x:any)=>x.type.includes('locker'));},(d:any)=>{d.deliveryOptions.find((x:any)=>x.id===ELMAS_HOME_CARRIER).disabled=true;},(d:any)=>{d.paymentOptions.forEach((x:any)=>x.disabled=true);},(d:any)=>{d.deliveryOptions.push(d.deliveryOptions.find((x:any)=>x.id===ELMAS_HOME_CARRIER));}]){const api=network(1,(phase,data)=>{if(phase==='initial')mutate(data);});await assert.rejects(quoteElmas(order(),api.fetcher),/no_home_delivery/);}
});
test('missing, altered or fractional delivery totals cannot silently become zero',async()=>{
  for(const value of [undefined,null,-1,50.001,0]){const api=network(1,(phase,data)=>{if(phase==='selected')data.selectedDelivery.price=value;});await assert.rejects(quoteElmas(order(),api.fetcher),/basket_not_confirmed/);}
  const api=network(1,(phase,data)=>{if(phase==='initial')data.options.countries=[];});await assert.rejects(quoteElmas(order(),api.fetcher),/no_home_delivery/);
});
test('fresh native price and stock are checked before a shipping calculation',async()=>{
  const changed=network(1,(phase,p)=>{if(phase==='product'){p.price.brutto=p.price.discountBrutto=p.variants[0].price.brutto=p.variants[0].price.discountBrutto=23.99;p.price.netto=p.price.discountNetto=p.variants[0].price.netto=p.variants[0].price.discountNetto=19.5;}});await assert.rejects(quoteElmas(order(),changed.fetcher),/price_changed/);assert.equal(changed.calls.length,2);
  const exhausted=network(9,(phase,p)=>{if(phase==='product')p.variants[0].count=8;});await assert.rejects(quoteElmas(order(9),exhausted.fetcher),/insufficient_stock/);assert.equal(exhausted.calls.length,2);
});
test('the scoped transport cannot accept customer fields, another country, generic action or final order route',async()=>{
  let calls=0;const client=new AnonymousShop(ELMAS_ORIGIN,async()=>{calls++;throw Error('must not reach network');},AbortSignal.timeout(1000)),base={count:1,priceGrosze:2289,nettoGrosze:1861,stock:197};
  for(const patch of [{count:0},{count:1.5},{count:198},{priceGrosze:1},{email:'not-sent@example.org'},{deliveryCountry:'de'},{path:'/api/public/order/new'},{selected:ELMAS_HOME_CARRIER},{previousTotalGrosze:NaN}])await assert.rejects(client.elmasShipping({...base,...patch} as any),/invalid_cart_action/);
  const other=new AnonymousShop('https://other.example',fetch,AbortSignal.timeout(1000));await assert.rejects(other.elmasShipping(base),/invalid_cart_action/);assert.equal(calls,0);
});
test('real Express estimation buys a whole roll for tiny demand and carries the confirmed national courier cost',async()=>{
  const api=network(),service=createRemontService({background:false,initialObservations:[parseRetailPage(fixture.html,ELMAS_TAPE,new Date())],fetchImpl:api.fetcher}),app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  try{const response=await fetch('http://127.0.0.1:'+(server.address() as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'additional-materials',materials:[{material:{id:'tape',ean:ELMAS_TAPE.ean,name:ELMAS_TAPE.name,unit:'m',category:ELMAS_TAPE.category},quantity:1e-8}]}],options:{delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(response.status,200);const data:any=await response.json();assert.equal(data.deliveryComparison.best.totalGrosze,7289);assert.equal(data.deliveryComparison.best.deliveryGrosze,5000);assert.equal(data.deliveryComparison.best.stores[0].lines[0].packages[0].count,1);assert.equal(data.deliveryComparison.best.stores[0].lines[0].packages[0].packageSize,30);}finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});

test('generic methods and redirects cannot turn the public carrier calculation into an order submission',async()=>{
  let calls=0;const fetcher:typeof fetch=async()=>{calls++;return new Response('',{status:307,headers:{location:ELMAS_ORIGIN+'/api/public/order/new'}});};
  const client=new AnonymousShop(ELMAS_ORIGIN,fetcher,AbortSignal.timeout(1000));await assert.rejects(client.json('/api/public/order/new',{basket:[]}),/invalid_cart_route/);assert.equal(calls,0);
  await assert.rejects(client.elmasShipping({count:1,priceGrosze:2289,nettoGrosze:1861,stock:197}),/invalid_cart_route/);assert.equal(calls,1);
});

test('the same courier fee for different quantities still has basket-bound native evidence',async()=>{
  const hashes=[];for(const count of [1,2,8]){const result=await quoteElmas(order(count),network(count).fetcher);assert.ok('quote'in result);assert.equal(result.quote.costGrosze,5000);hashes.push(result.quote.evidenceSha256);}assert.equal(new Set(hashes).size,3);
});

test('HTTP surplus opt-in compares the recorded eight/nine-roll native carts while preserving the original 240 m request',async()=>{
  const eight=network(8),nine=network(9),fetcher:typeof fetch=async(input,init)=>{
    const body=init?.body?JSON.parse(String(init.body)):undefined;
    return(body?.basket?.[0]?.quantity===9?nine:eight).fetcher(input,init);
  },service=createRemontService({background:false,initialObservations:[parseRetailPage(fixture.html,ELMAS_TAPE,new Date())],fetchImpl:fetcher}),app=express();app.use(express.json());app.use(service.router);
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  const request=(allowExtraPackages:unknown)=>fetch('http://127.0.0.1:'+(server.address()as {port:number}).port+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'additional-materials',materials:[{material:{id:'tape',ean:ELMAS_TAPE.ean,name:ELMAS_TAPE.name,unit:'m',category:ELMAS_TAPE.category},quantity:240}]}],options:{delivery:{mode:'shipping',postalCode:'30-001',allowSeparateOrders:false,allowExtraPackages}}})});
  try{
    for(const enabled of [undefined,true,false]){const response=await request(enabled);assert.equal(response.status,200);const data:any=await response.json(),c=data.deliveryComparison;
      assert.equal(data.stages[0].lines[0].quantity,240);assert.equal(c.best.totalGrosze,23312);assert.equal(c.best.stores[0].lines[0].packages[0].count,8);
      if(enabled){assert.equal(c.extraPackageOption.basket.totalGrosze,20601);assert.equal(c.extraPackageOption.savingGrosze,2711);assert.equal(c.extraPackageOption.basket.stores[0].lines[0].packages[0].count,9);assert.equal(c.extraPackageOption.basket.stores[0].quote.destinationScope,'PL');}
      else assert.equal(c.extraPackageOption??null,null);
    }
    assert.equal((await request('yes')).status,400);assert.ok(nine.calls.length>0);assert.ok([...eight.calls,...nine.calls].every(call=>!call.url.endsWith('/order/new')));
  }finally{service.close();await new Promise<void>(r=>server.close(()=>r()));}
});
