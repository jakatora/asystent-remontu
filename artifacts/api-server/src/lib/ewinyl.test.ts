import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {RETAIL_SOURCES} from './retail-catalog';
import {parseRetailPage} from './retail-pages';
import {confirmEwinylCart,confirmEwinylShipping,quoteEwinyl} from './ewinyl';
import {readEwinylProduct} from './ewinyl-product';
import {AnonymousShop} from './retailer-http';
import {cutRollPackagePlan,ORION_ROLLS} from '../../../../lib/pricing-service/src/cut-rolls';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';
const fixture=(name:string)=>fs.readFileSync(fileURLToPath(new URL('./fixtures/ewinyl-'+name+'.html',import.meta.url)),'utf8');
const source=RETAIL_SOURCES.find(s=>s.id==='ewinyl-orion514-2m')!;
const expected=[{widthMm:2000,lengthMm:3100,count:1,cost:34100}];
function order():DeliveredStoreBasket {
 const product={...ORION_ROLLS[0],ean:null,gtin:null,brand:'Lentex',category:'vinyl-roll',packageSize:'1',packageUnit:'m2',imageUrl:null}as any;
 const plan=cutRollPackagePlan(product,{version:1,widthMm:2000,cuts:[{id:'a',lengthMm:3100}]},6.2,[{id:source.id,productId:product.id,price:'55.00',promoPrice:null,store:'eWinyl',productUrl:source.url}as any])!;
 return{store:'eWinyl',materialsGrosze:34100,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product,unit:'m2',packages:plan.packages}]};
}
test('the reviewed merchant model and both explicit widths retain m² price; no merchant SKU becomes an EAN',()=>{
 for(const width of [2,4]){const s=RETAIL_SOURCES.find(s=>s.id===`ewinyl-orion514-${width}m`)!;const p=readEwinylProduct(fixture('orion-product'),s);assert.equal(p.sku,`ewinyl-5329-${width}m`);assert.equal(p.gtin13,undefined);assert.equal(parseRetailPage(fixture('orion-product'),s,new Date()).priceGrosze,5500);}
 for(const html of [fixture('orion-product').replace('value="5329"','value="5330"'),fixture('orion-product').replace('value="4"','value="3"'),fixture('orion-product').replace('<p>Lentex</p>','<p>Other</p>')])assert.throws(()=>readEwinylProduct(html,source));
 assert.throws(()=>readEwinylProduct(fixture('orion-product'),{...source,ean:'5901234567890'}));
});
test('actual cart dimensions and destination are mandatory; collection, unrelated totals and changed cuts never count as delivered',()=>{
 assert.equal(confirmEwinylCart(fixture('cart'),expected),34100);
 assert.deepEqual(confirmEwinylShipping(fixture('quote'),'00-001',34100),{costGrosze:19900,carrier:'Wysyłka kurierem'});
 assert.throws(()=>confirmEwinylCart(fixture('cart'),[{...expected[0],lengthMm:3200}]));
 assert.throws(()=>confirmEwinylCart(fixture('cart').replace('341,00','342,00'),expected));
 assert.throws(()=>confirmEwinylShipping(fixture('quote'),'30-001',34100));
 assert.throws(()=>confirmEwinylShipping(fixture('quote'),'00-001',34099));
 assert.throws(()=>confirmEwinylShipping(fixture('quote').replace('value="flat_rate:1"','value="local_pickup:10"'),'00-001',34100));
});
test('the adapter posts only exact cut dimensions and the user postcode, then verifies selected upfront checkout without ordering',async()=>{
 const calls:{url:URL;method:string;form:URLSearchParams}[]=[];
 const fetcher=async(input:any,init:any)=>{
  const url=new URL(String(input)),method=init.method??'GET',form=new URLSearchParams(init.body??'');calls.push({url,method,form});
  assert.equal(url.origin,'https://ewinyl.pl');assert.ok(!/email|billing_|shipping_address|terms|place_order/.test(form.toString()));
  return new Response(url.pathname.includes('/produkt/')?method==='GET'?fixture('orion-product'):fixture('cart'):url.pathname==='/zamowienie/'?fixture('checkout'):method==='POST'?fixture('quote'):fixture('cart'),{headers:{'content-type':'text/html','set-cookie':'qa_cart=isolated; Path=/'}});
 };
 const result=await quoteEwinyl(order(),'00-001',fetcher as typeof fetch);assert.ok('quote'in result);assert.equal(result.quote.costGrosze,19900);assert.equal(result.quote.postalCode,'00-001');assert.equal(result.quote.payment,'Przelew bankowy');
 assert.equal(calls.filter(c=>c.method==='POST').length,2);const add=calls.find(c=>c.form.has('add-to-cart'))!;assert.equal(add.form.get('length_needed'),'3.10');assert.equal(add.form.get('width_needed'),'2');assert.equal(add.form.get('_measurement_needed'),'6.20');
 assert.equal(calls.find(c=>c.form.has('calc_shipping'))!.form.get('calc_shipping_postcode'),'00-001');assert.ok(calls.filter(c=>c.url.pathname==='/zamowienie/').every(c=>c.method==='GET'));
});
test('unreviewed actions, changed primary price and forged package geometry fail before a cart is submitted',async()=>{
 const noFetch=async()=>{throw Error('unexpected HTTP')};const c=new AnonymousShop('https://ewinyl.pl',noFetch as any,AbortSignal.timeout(1000));
 for(const args of [[3000,3100,1],[2000,3101,1],[2000,3100,0]])await assert.rejects(()=>c.ewinylAdd(...args as [number,number,number]),/invalid_cart_action/);
 const bad=order();bad.lines[0].packages[0].cutRoll!.lengthMm=3200;
 await assert.rejects(()=>quoteEwinyl(bad,'00-001',(async()=>new Response(fixture('orion-product')))as any),/invalid_basket/);
 const changed=fixture('orion-product').replaceAll('55,00','56,00').replaceAll('"price":55','"price":56').replaceAll('"product_price":"55"','"product_price":"56"');
 await assert.rejects(()=>quoteEwinyl(order(),'00-001',(async()=>new Response(changed))as any),/price_changed/);
});
