import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRetailPage } from '../src/lib/retail-pages';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { confirmKronosferaCart, quoteKronosfera } from '../src/lib/kronosfera-delivery';
import { KRONOSFERA_PRODUCT, KRONOSFERA_EMPTY, KRONOSFERA_CART_1, KRONOSFERA_CART_2, KRONOSFERA_CART_14, KRONOSFERA_CART_79, KRONOSFERA_ADD } from './fixtures/kronosfera';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';
import express from 'express';
import { createRemontService } from '../src/shared-backend';

const source=RETAIL_SOURCES.find(source=>source.id==='kronosfera-skirting-lk100f-240')!;
const wanted=(count:number)=>new Map([[source.url,{count,price:3199}]]);
const order=(count:number):DeliveredStoreBasket=>({store:'Kronosfera',materialsGrosze:count*3199,lines:[{product:{id:'remont-'+source.ean},packages:[{offerId:source.id,count,unitPriceGrosze:3199,packageSize:2.4}]}]} as DeliveredStoreBasket);

test('Kronosfera binds the reviewed manufacturer SKU/model crosswalk to its own form, gross piece price, dimensions and online sale',()=>{
 const observation=parseRetailPage(KRONOSFERA_PRODUCT,source,new Date('2026-10-26T01:30:00Z'));
 assert.equal(observation.priceGrosze,3199);assert.equal(observation.ean,'5907555424969');assert.equal(observation.availability,'in_stock');assert.match(observation.imageUrl!,/^https:\/\/kronosfera.pl\//);
 // The product record must not pretend that this store publishes a barcode.
 assert.ok(!KRONOSFERA_PRODUCT.includes('gtin13'));assert.equal(source.pickupUnavailable,true);
 for(const html of [
  KRONOSFERA_PRODUCT.replaceAll('LK100F24-9002','LK80L24-9002'),
  KRONOSFERA_PRODUCT.replace('"brand":"KronoOriginal"','"brand":"Another"'),
  KRONOSFERA_PRODUCT.replace('"sku":"LK100F24-9002"','"sku":"LK100F24-9002","gtin13":"5907555424976"'),
  KRONOSFERA_PRODUCT.replace('"sku":"LK100F24-9002"','"sku":"LK100F24-9002","gtin14":"05907555424969"'),
  KRONOSFERA_PRODUCT.replace('>2400<','>2500<'),KRONOSFERA_PRODUCT.replace('>100<','>80<'),
  KRONOSFERA_PRODUCT.replace('>biały<','>szary<'),KRONOSFERA_PRODUCT.replace('main-unit-type="szt"','main-unit-type="m2"'),
  KRONOSFERA_PRODUCT.replace('step="1"','step="2"'),KRONOSFERA_PRODUCT.replace('"price":"31.99"','"price":"1.99"'),
  KRONOSFERA_PRODUCT.replace('schema.org/InStock','schema.org/OutOfStock'),
 ]) assert.throws(()=>parseRetailPage(html,source,new Date()),html.slice(-100));
 assert.throws(()=>parseRetailPage(KRONOSFERA_PRODUCT,{...source,ean:'5907555424976'},new Date()));
});

test('whole native carts account for parcel weight and genuine free freight; no saved flat fee is multiplied by product count',()=>{
 for(const [count,html,cost] of [[1,KRONOSFERA_CART_1,8749],[2,KRONOSFERA_CART_2,8749],[14,KRONOSFERA_CART_14,17498],[79,KRONOSFERA_CART_79,0]] as const){
  const quote=confirmKronosferaCart(html,wanted(count),3199*count);assert.equal(quote.costGrosze,cost);assert.match(quote.payment,/Przelewy24/);
 }
});

test('a changed price, quantity, merchant, courier, unpaid delivery or ambiguous total never becomes a cheap complete quote',()=>{
 for(const html of [KRONOSFERA_CART_2.replaceAll('63,98 zł','60,00 zł'),KRONOSFERA_CART_2.replace('value="2"','value="1"'),
  KRONOSFERA_CART_2.replaceAll('31,99 zł','1,99 zł'),KRONOSFERA_CART_2.replaceAll('Przesyłka kurierska (paczka 2620x300x300mm, 30kg)','Odbiór osobisty'),
  KRONOSFERA_CART_2.replaceAll('87,49 zł','0,00 zł'),KRONOSFERA_CART_2.replaceAll('151,47 zł','63,98 zł'),
  KRONOSFERA_CART_2.replaceAll('/k/listwa-przypodlogowa-lk100f24-9002,2068','/k/inny-produkt,2069'),
  KRONOSFERA_CART_2.replaceAll('Płatności elektroniczne Przelewy24','Pobranie')]) assert.throws(()=>confirmKronosferaCart(html,wanted(2),6398));
 assert.throws(()=>confirmKronosferaCart(KRONOSFERA_CART_1,wanted(2),6398));
});

test('delivery performs only a fresh empty-cart read, exact product add and first cart step, without submitting customer details or orders',async()=>{
 const calls:{method:string;path:string;body:string}[]=[];
 const fetchImpl=async(input:any,init:any)=>{const url=new URL(String(input));calls.push({method:init.method,path:url.pathname,body:init.body??''});
  assert.equal(url.origin,'https://kronosfera.pl');assert.ok(!String(init.headers.Cookie).includes('user-cookie'));
  if(url.pathname==='/koszyk')return new Response(calls.length===1?KRONOSFERA_EMPTY:KRONOSFERA_CART_2,{headers:{'content-type':'text/html','set-cookie':'anonymous_cart=fake-session; Path=/'}});
  if(url.href===source.url)return new Response(KRONOSFERA_PRODUCT,{headers:{'content-type':'text/html'}});
  assert.equal(url.pathname,'/ajax/store/product/purchase/1/pl/2068');assert.equal(init.method,'POST');
  const body=new URLSearchParams(init.body);assert.deepEqual([...body.keys()].sort(),['_token','quantity']);assert.equal(body.get('quantity'),'2');
  return Response.json({...KRONOSFERA_ADD,quantity:'2',total:'63,98'});
 };
 const result=await quoteKronosfera(order(2),fetchImpl as typeof fetch);
 assert.equal(result.quote?.costGrosze,8749);assert.equal(result.quote?.basis,'retailer_basket_national');assert.equal(result.quote?.destinationScope,'PL');
 assert.deepEqual(calls.map(call=>call.path),['/koszyk',new URL(source.url).pathname,'/ajax/store/product/purchase/1/pl/2068','/koszyk']);
 assert.equal(calls.filter(call=>call.method==='POST').length,1);
});

test('actual HTTP resolves a calculator label and exposes delivery-only products without inventing free self collection',async()=>{
 const service=createRemontService({initialObservations:[parseRetailPage(KRONOSFERA_PRODUCT,source,new Date())],background:false});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const root='http://127.0.0.1:'+(server.address() as {port:number}).port;
  const post=async(mode:string)=>{const response=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'skirting-boards',materials:[{material:{id:'skirting',name:'Listwa przypodłogowa MDF biała Krono Original LK100F (2,4 mb)',unit:'mb',category:'skirting'},quantity:3}]}],options:{store:'Kronosfera',delivery:{mode}}})});assert.equal(response.status,200);return response.json();};
  const shipping=await post('shipping');assert.equal(shipping.consolidated.lines[0].packagesNeeded,2);assert.equal(shipping.consolidated.lines[0].lineCostGrosze,6398);assert.ok(shipping.coverage.pickupUnavailableStores.includes('Kronosfera'));
  const pickup=await post('pickup');assert.equal(pickup.stages[0].lines[0].resolved,false);assert.equal(pickup.deliveryComparison.best,null);
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));service.close();}
});
