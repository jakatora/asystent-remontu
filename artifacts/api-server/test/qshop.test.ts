import assert from 'node:assert/strict';
import {test} from 'node:test';
import express from 'express';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {readRetailSource} from '../src/lib/retail-pages';
import {inspectTokmetProduct,confirmTokmetCart} from '../src/lib/qshop-product';
import {AnonymousShop} from '../src/lib/retailer-http';
import {createRemontService} from '../src/shared-backend';
import {TOKMET_FIXTURE as fixture} from './fixtures/tokmet';

const source=RETAIL_SOURCES.find(s=>s.id==='tokmet-invena-ws20-030')!;
const latin2=new Map(Array.from({length:256},(_,code)=>[new TextDecoder('iso-8859-2').decode(Uint8Array.of(code)),code]));
function nativeResponse(body:string){return new Response(Uint8Array.from([...body].map(char=>{const byte=latin2.get(char);if(byte===undefined)throw Error('fixture_character_not_latin2');return byte;})),{headers:{'content-type':'text/html','set-cookie':'PHPSESSID=own-test-cart; Path=/'}});}
function reader(changes:{list?:string;card?:string;empty?:string;cart?:string}={}){
 const calls:{url:URL;init:any}[]=[];let cartReads=0;
 const fetchImpl=async(input:any,init:any)=>{const url=new URL(String(input));calls.push({url,init});assert.equal(url.origin,'https://sklep.tokmet.pl');assert.equal(init.method,'GET');assert.equal(init.body,undefined);assert.ok(!String(init.headers.Cookie).includes('user-browser-session'));
  if(url.pathname==='/94,wezyki_w_oplocie_stalowym.html')return nativeResponse(changes.list??fixture.list);
  if(url.href===source.url)return nativeResponse(changes.card??fixture.card);
  if(url.pathname==='/cart.php')return nativeResponse(cartReads++===0?changes.empty??fixture.empty:changes.cart??fixture.cart);
  assert.equal(url.pathname,'/_dynamic_cart.php');assert.deepEqual([...url.searchParams],[['action','add'],['itemId','2806'],['qty','1'],['dbv',''],['view_only_price','false']]);assert.match(init.headers.Cookie,/PHPSESSID=own-test-cart/);
  return nativeResponse(fixture.added);
 };
 return{calls,fetchImpl:fetchImpl as typeof fetch};
}

test('TOK-MET exact manufacturer part crosswalk confirms a gross single hose, not an invented native barcode',()=>{
 assert.ok(!fixture.card.includes('5907798716258'));assert.ok(!fixture.list.includes('5907798716258'));
 const product=inspectTokmetProduct(fixture.list,fixture.card,source);assert.equal(product.priceGrosze,1114);assert.equal(product.stock,54);assert.match(product.imageUrl,/pic81087437639/);
 for(const list of [fixture.list.replace('WS-20-030-G','WS-21-030-G'),fixture.list.replaceAll('30 CM','40 CM'),fixture.list.replace('>54<','>0<'),fixture.list.replace('11,14','1,14')])assert.throws(()=>inspectTokmetProduct(list,fixture.card,source));
 for(const card of [fixture.card.replace('invena-INVENA.html','another-BRAND.html'),fixture.card.replace('Obecna waluta: PL','Obecna waluta: EUR'),fixture.card.replace('value="2806"','value="2807"'),fixture.card.replace('value="11.14"','value="1.14"'),fixture.card.replace('VAT: 23 %','VAT: 0 %'),fixture.card.replace('54 szt.','0 szt.'),fixture.card.replaceAll('DŁUGA','KRÓTKA'),fixture.card.replaceAll('pic81087437639','other-photo')])assert.throws(()=>inspectTokmetProduct(fixture.list,card,source));
 assert.throws(()=>inspectTokmetProduct(fixture.list,fixture.card,{...source,ean:'8429343054242'}));assert.throws(()=>inspectTokmetProduct(fixture.list,fixture.card,{...source,packageSize:10}));
});

test('the entire native cart confirms quantity, product and gross subtotal; footer freight and add-response advertising cannot become prices',()=>{
 assert.ok(fixture.added.includes('154,66'));confirmTokmetCart(fixture.cart,1114);
 for(const cart of [fixture.cart.replace('value="1"','value="2"'),fixture.cart.replace('cart_qty_type[2806]','cart_qty_type[2807]'),fixture.cart.replace('11,14','1,14'),fixture.cart.replace('simple_cart_step_1_sum_netto','another_total'),fixture.cart+'<input id="qty[2]" value="1"/>',fixture.cart.replaceAll('30 CM','50 CM')])assert.throws(()=>confirmTokmetCart(cart,1114));
});

test('real Latin-2 storefront reads use a fresh isolated cart and exactly one known item; never customer, consent or order endpoints',async()=>{
 const mock=reader(),observation=await readRetailSource(source,mock.fetchImpl);assert.equal(observation.priceGrosze,1114);assert.equal(observation.name,source.name);assert.equal(observation.ean,source.ean);assert.equal(observation.currency,'PLN');assert.match(observation.evidenceSha256,/^[a-f0-9]{64}$/);
 assert.deepEqual(mock.calls.map(c=>c.url.pathname),['/94,wezyki_w_oplocie_stalowym.html',new URL(source.url).pathname,'/cart.php','/_dynamic_cart.php','/cart.php']);
 assert.throws(()=>new AnonymousShop('https://another.example',fetch,new AbortController().signal,8,'iso-8859-2'));
});

test('a nonempty initial cart or a changed merchant cart cannot produce a current observation',async()=>{
 const nonempty=reader({empty:fixture.cart});await assert.rejects(()=>readRetailSource(source,nonempty.fetchImpl),/basket_not_confirmed/);assert.equal(nonempty.calls.filter(c=>c.url.pathname==='/_dynamic_cart.php').length,0);
 const changed=reader({cart:fixture.cart.replace('11,14','12,14')});await assert.rejects(()=>readRetailSource(source,changed.fetchImpl),/retailer_gross_price_mismatch/);
});

test('actual HTTP resolves the calculator hose label and shows a missing address quote instead of footer delivery or a complete total',async()=>{
 const mock=reader(),observation=await readRetailSource(source,mock.fetchImpl),service=createRemontService({initialObservations:[observation],background:false});
 const app=express();app.use(express.json());app.use(service.router);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{const root='http://127.0.0.1:'+(server.address() as {port:number}).port;
  const response=await fetch(root+'/pricing/project',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jobs:[{jobId:'test-hose',materials:[{material:{id:'mat-hose-braided-invena-3-8-30',name:'Wężyk przyłączeniowy w oplocie Invena 3/8"×M10 30 cm',category:'hose',unit:'szt'},quantity:2}]}],options:{delivery:{mode:'shipping',postalCode:'00-001'}}})});assert.equal(response.status,200);const body=await response.json();
  assert.equal(body.consolidated.lines[0].lineCostGrosze,2228);assert.equal(body.consolidated.lines[0].packagesNeeded,2);assert.equal(body.deliveryComparison.best,null);assert.ok(body.deliveryComparison.unavailableStores.some((s:any)=>s.store==='TOK-MET'&&s.reason==='address_required'));
 }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));service.close();}
});
