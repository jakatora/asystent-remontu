import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {createRemontService} from '../src/shared-backend';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {createRetailerQuoter} from '../src/lib/retailer-delivery';
import {AnonymousShop} from '../src/lib/retailer-http';
import {confirmSkyshopBasket,inspectSkyshopProduct,MATBUD_ORIGIN,type SkyshopExpectedLine} from '../src/lib/skyshop-product';
import {confirmSkyshopBasketCalculation,confirmSkyshopBasketShipping} from '../src/lib/skyshop-delivery';
import {passiveBaskets,passiveCard,passiveParameters,passiveProduct} from './fixtures/skyshop-passive.fixture';
import {skyshopBaskets,skyshopCard,skyshopParameters,skyshopProduct} from './fixtures/skyshop.fixture';

const source=RETAIL_SOURCES.find(row=>row.id==='matbud-yetico-gamma-passive-033-15cm')!;
const white=RETAIL_SOURCES.find(row=>row.id==='matbud-yetico-gamma-fasada-044-10cm')!;
const copy=<T>(value:T):T=>structuredClone(value);
const inspect=(html=passiveCard,api:any=copy(passiveProduct),parameters:any=copy(passiveParameters))=>inspectSkyshopProduct(html,api,parameters,source);
const basket=(count:number,mixed=false)=>({store:source.store,materialsGrosze:count*5998+(mixed?50*6974:0),deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown' as const,lines:[{source,count,price:5998},...(mixed?[{source:white,count:50,price:6974}]:[])].map(({source,count,price})=>({product:{id:'remont-'+source.ean,name:source.name,imageUrl:null},unit:'m2',packages:[{offerId:source.id,store:source.store,url:source.url,packageSize:source.packageSize,minimumPackages:50,count,unitPriceGrosze:price,lineCostGrosze:count*price}]}))});
function expected(fixture:typeof passiveBaskets[number]):SkyshopExpectedLine[]{return fixture.cart.items.map(item=>({productId:item.product.id,count:item.quantity,unitPriceGrosze:item.product.id===131345?2999:6974,itemId:item.id}));}

function mockShop(){
 const requests:{path:string;method:string;body?:string}[]=[];let items=new Map<number,number>();
 const fetchImpl:typeof fetch=async(input,init)=>{
  const url=new URL(String(input));assert.equal(url.origin,MATBUD_ORIGIN);const path=url.pathname+url.search,method=init?.method??'GET';requests.push({path,method,body:typeof init?.body==='string'?init.body:undefined});
  const fixture=()=>copy(items.size===2?passiveBaskets.find(row=>row.label==='mixed')!:items.has(131345)?passiveBaskets.find(row=>row.label===String(items.get(131345)===360?362:items.get(131345)))!:skyshopBaskets.find(row=>row.count===(items.get(96729)??50))!);
  let value:any,type='application/json';
  if(path===new URL(source.url).pathname){type='text/html';value=passiveCard;}
  else if(path===new URL(white.url).pathname){type='text/html';value=skyshopCard;}
  else if(path==='/proxy_public_api?endpoint=/sky2/api-public/products/131345')value=copy(passiveProduct);
  else if(path==='/proxy_public_api?endpoint=/sky2/api-public/products/131345/choosable-parameters?')value=copy(passiveParameters);
  else if(path==='/proxy_public_api?endpoint=/sky2/api-public/products/96729')value=copy(skyshopProduct);
  else if(path==='/proxy_public_api?endpoint=/sky2/api-public/products/96729/choosable-parameters?')value=copy(skyshopParameters);
  else if(path==='/proxy_public_api?endpoint=/sky2/api-public/carts/latest'){items=new Map();value=copy(passiveBaskets[0].empty);}
  else if(path.endsWith('/items')){
   assert.equal(method,'POST');assert.equal(new Headers(init?.headers).get('Content-Type'),'application/json');
   const body=JSON.parse(String(init?.body));assert.deepEqual(Object.keys(body).sort(),['parameters','productId','quantity']);assert.deepEqual(body.parameters,[]);assert.ok([96729,131345].includes(body.productId));
   assert.ok(!items.has(body.productId));items.set(body.productId,body.quantity);value={id:passiveBaskets[0].empty.id,addedCartItem:{quantity:body.quantity}};
  }else if(path.includes('/carts/'))value=fixture().cart;
  else if(path==='/cart'){type='text/html';value='<main>Synchronizacja koszyka</main>';}
  else if(path==='/order'){type='text/html';value=fixture().shippingHtml;}
  else if(path==='/order/?json=1&pay_id=5&c=PL&sel=&wdt=0'){assert.equal(method,'POST');assert.equal(init?.body,'');value=fixture().methods;}
  else if(path==='/order/?json=1&recalculate=1&c=PL&pay_id=5&shipment=s182be0c5c&wdt=0&gratis='){assert.equal(method,'GET');value=fixture().calculation;}
  else throw Error('Unreviewed native request '+method+' '+path);
  if(path.includes('/carts/')&&!path.endsWith('/latest'))assert.match(new Headers(init?.headers).get('Cookie')??'',/sky2_cart_id=00000000-0000-4000-8000-000000000001/);
  return new Response(type==='application/json'?JSON.stringify(value):value,{headers:{'content-type':type}});
 };
 return{fetchImpl,requests};
}

test('Passive native M2 price and stock become physical 2m2 packs only after confirming the reviewed product',()=>{
 const result=inspect();assert.equal(result.nativePriceGrosze,2999);assert.equal(result.priceGrosze,5998);assert.equal(result.stock,180);assert.equal(result.product.gtin13,'5902578307268');assert.equal(result.product.offers.price,'59.98');
 assert.equal(passiveProduct.ean,null);assert.equal(passiveProduct.amount.unit,'M2');assert.equal(source.packageSize,2);assert.equal(source.minimumPackages,50);
});
test('Passive pack conversion rejects changed unit, increment, minimum, dimensions, colour and unreviewed duplicate SKU',()=>{
 for(const html of [passiveCard.replace('powierzchnia płyt: 2 m2','powierzchnia płyt: 1,91 m2'),passiveCard.replace('kolor: grafitowy','kolor: biały'),passiveCard.replace('grubość płyty: 15 cm','grubość płyty: 10 cm'),passiveCard.replace('data-boxamount="2"','data-boxamount="1"'),passiveCard.replace('"price":"29.99"','"price":"59.98"')])assert.throws(()=>inspect(html));
 for(const mutate of [(v:any)=>{v.amount.unit='OP';},(v:any)=>{v.amount.tick=1;},(v:any)=>{v.amount.minAmount=50;},(v:any)=>{v.symbol='FASADA 044 15CM';},(v:any)=>{v.ean='5902578307442';}]){const api=copy(passiveProduct);mutate(api);assert.throws(()=>inspect(passiveCard,api));}
 for(const altered of [{...source,productId:133024},{...source,packageSize:1},{...source,minimumPackages:100},{...source,ean:'5902578307442'}])assert.throws(()=>inspectSkyshopProduct(passiveCard,passiveProduct,passiveParameters,altered));
});
test('Passive cart requires native 100/102m2 counts and native unit gross, not a tempting half-price pack',()=>{
 for(const label of ['100','102']){const f=passiveBaskets.find(row=>row.label===label)!;assert.equal(confirmSkyshopBasket(f.cart,expected(f)).items[0].quantity,Number(label));}
 const f=passiveBaskets[0],wanted=expected(f);
 assert.throws(()=>confirmSkyshopBasket(f.cart,[{...wanted[0],count:50}]),/invalid_basket/);
 assert.throws(()=>confirmSkyshopBasket(f.cart,[{...wanted[0],unitPriceGrosze:5998}]),/price_changed/);
 const clamped=passiveBaskets.find(row=>row.label==='362')!;assert.throws(()=>confirmSkyshopBasket(clamped.cart,[{productId:131345,count:362,unitPriceGrosze:2999}]),/insufficient_stock/);
});
test('mixed OP/M2 shipping validates both exact products, counts, cart hashes and whole gross, never a partial basket',()=>{
 const f=passiveBaskets.find(row=>row.label==='mixed')!,wanted=expected(f);
 assert.equal(confirmSkyshopBasket(f.cart,wanted).items.length,2);assert.equal(confirmSkyshopBasketShipping(f.shippingHtml,f.methods,wanted).price,0);assert.equal(confirmSkyshopBasketCalculation(f.calculation,wanted,true).orderPriceTotal,6545.98);
 for(const mutate of [(v:any)=>{v.products.pop();},(v:any)=>{v.products[0]=copy(v.products[1]);},(v:any)=>{v.products[0].hash=v.products[1].hash;},(v:any)=>{v.products[1].amount=51;},(v:any)=>{v.orderPriceTotal=3058.98;},(v:any)=>{v.shipment.name='Odbiór osobisty';}]){const value=copy(f.calculation);mutate(value);assert.throws(()=>confirmSkyshopBasketCalculation(value,wanted,true));}
 const cart=copy(f.cart);cart.items.pop();assert.throws(()=>confirmSkyshopBasket(cart,wanted));
});
test('native transport permits reviewed even M2 quantities and refuses unreviewed product IDs without a request',async()=>{
 const mock=mockShop(),client=new AnonymousShop(MATBUD_ORIGIN,mock.fetchImpl,AbortSignal.timeout(5000));await client.skyshop('create-cart');const calls=mock.requests.length;
 for(const id of [133024,96730,0,NaN])await assert.rejects(client.skyshop('product',undefined,id),/invalid_cart_action/);
 for(const count of [50,99,101,100.5,20002])await assert.rejects(client.skyshop('add',count,131345),/invalid_cart_action/);
 assert.equal(mock.requests.length,calls);
});
test('real adapter converts observation to59.98 per pack and sends102m2 for51packs, including one mixed cart',async()=>{
 const mock=mockShop(),observation=await readRetailSource(source,mock.fetchImpl);assert.equal(observation.priceGrosze,5998);assert.equal(observation.stockPackages,180);
 for(const mixed of [false,true]){const result=await createRetailerQuoter(mock.fetchImpl)(basket(51,mixed),'80-001');assert.ok('quote'in result,JSON.stringify(result));assert.equal(result.quote.costGrosze,0);assert.equal(result.quote.destinationScope,'PL');}
 const adds=mock.requests.filter(row=>row.path.endsWith('/items')).map(row=>JSON.parse(row.body!));assert.ok(adds.some(row=>row.productId===131345&&row.quantity===100));assert.equal(adds.filter(row=>row.productId===131345&&row.quantity===102).length,2);
 assert.ok(mock.requests.every(row=>row.method!=='POST'||row.path.endsWith('/items')||row.path==='/order/?json=1&pay_id=5&c=PL&sel=&wdt=0'));
});
test('half-price stale pack and181packs are rejected before any new merchant cart',async()=>{
 const stale=basket(50);stale.materialsGrosze=50*2999;stale.lines[0].packages[0].unitPriceGrosze=2999;stale.lines[0].packages[0].lineCostGrosze=50*2999;
 for(const [order,reason]of [[stale,'price_changed'],[basket(181),'insufficient_stock']]as const){const mock=mockShop();assert.deepEqual(await createRetailerQuoter(mock.fetchImpl)(order,'00-001'),{reason});assert.ok(!mock.requests.some(row=>row.path.endsWith('/carts/latest')));}
});
test('in-stock180packs do not acquire fictitious free delivery when the actual whole-cart methods omit home shipping',async()=>{
 const mock=mockShop();assert.deepEqual(await createRetailerQuoter(mock.fetchImpl)(basket(180),'00-001'),{reason:'no_home_delivery'});
 assert.ok(mock.requests.some(row=>row.path==='/order/?json=1&pay_id=5&c=PL&sel=&wdt=0'));assert.ok(!mock.requests.some(row=>row.path.includes('recalculate=1')));
});
test('real HTTP consolidates rooms into51physical packs and quotes the complete mixed basket once',async()=>{
 const mock=mockShop(),observations=await Promise.all([source,white].map(row=>readRetailSource(row,mockShop().fetchImpl))),service=createRemontService({initialObservations:observations,background:false,fetchImpl:mock.fetchImpl});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const root='http://127.0.0.1:'+(server.address()as{port:number}).port;
  const post=async(quantities:number[],mixed=false)=>{const jobs=quantities.map((quantity,index)=>({jobId:'passive-'+index,materials:[{material:{id:'passive',name:'Styropian fasadowy grafitowy Yetico Gamma Passive EPS 033 150 mm (2 m²)',category:'insulation',unit:'m2'},quantity}]}));if(mixed)jobs.push({jobId:'white',materials:[{material:{id:'white',name:'Styropian fasadowy biały Yetico Gamma Fasada 044 100 mm (3 m²)',category:'insulation',unit:'m2'},quantity:3}]});const response=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs,options:{store:source.store,delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(response.status,200);return response.json();};
  for(const [quantities,count]of [[[2],50],[[50,52],51]]as const){const result=await post([...quantities]);assert.equal(result.consolidated.lines[0].packages[0].count,count);assert.equal(result.consolidated.lines[0].packages[0].packageSize,2);assert.equal(result.deliveryComparison.best.totalGrosze,count*5998);}
  const mixed=await post([102],true);assert.equal(mixed.deliveryComparison.best.totalGrosze,654598);assert.equal(mixed.deliveryComparison.best.deliveryGrosze,0);assert.equal(mixed.deliveryComparison.best.stores.length,1);assert.equal(mixed.deliveryComparison.best.stores[0].lines.length,2);
  const beforeShort=mock.requests.length,missing=await post([362]);assert.equal(missing.deliveryComparison.best,null);assert.equal(missing.deliveryComparison.status,'partial');assert.equal(missing.stages[0].lines[0].reason,'insufficient-stock');assert.equal(missing.consolidated.lines.length,0);assert.equal(mock.requests.length,beforeShort);
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
