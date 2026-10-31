import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/dekorator.json' with {type:'json'};
import {AnonymousShop} from '../src/lib/retailer-http';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage} from '../src/lib/retail-pages';
import {readDekoratorProduct,confirmDekoratorCart,quoteDekorator} from '../src/lib/dekorator';
import {createRetailerQuoter,retailerDeliveryCapabilities,knownUnavailableRetailers} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(s=>s.id==='dekorator-arbiton-secura-thermo-6m2')!;
const order=(count=2):DeliveredStoreBasket=>({store:source.store,materialsGrosze:count*4150,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:null},unit:'m2',packages:[{offerId:source.id,store:source.store,url:source.url,packageSize:6,count,unitPriceGrosze:4150,lineCostGrosze:count*4150}]}]});
function http(count=2,override:{card?:string;cart?:string;check?:any;ship?:any;payment?:any}={}){
 const calls:{path:string;method:string}[]=[];
 const fetchImpl=(async(input:any,init:any)=>{
  const u=new URL(input);assert.equal(u.origin,'https://dekoratormarket.pl');calls.push({path:u.pathname,method:init.method});
  if(init.method==='GET'){
   assert.equal(init.body,undefined);
   if(u.href===source.url)return new Response(override.card??fixture.card);
   if(u.pathname==='/javascript/skrypty.php')return new Response(fixture.script);
   if(u.pathname==='/javascript/koszyk.php')return new Response(fixture.cartJs);
   assert.equal(u.pathname,'/koszyk.html');return new Response(override.cart??(count===44?fixture.largeCart:fixture.cart));
  }
  assert.equal(init.method,'POST');assert.match(u.search,/^\?tok=[a-z0-9]{8,48}$/);const f=Object.fromEntries(new URLSearchParams(init.body));
  if(u.pathname==='/inne/do_koszyka_ilosc.php'){
   assert.deepEqual(f,{id:'1367',ilosc:String(count),cechy:'',akcja:'dodaj'});return Response.json(override.check??[{komunikat:'',ilosc:'',nazwa:source.name,id_inputa:''}]);
  }
  if(u.pathname==='/inne/do_koszyka.php'){
   assert.deepEqual(f,{id:'1367',ilosc:String(count),cechy:'',komentarz:'',txt:'',wroc:'',miejsce:'0',lista_produktow:'tak'});return new Response('');
  }
  if(u.pathname==='/inne/zmiana_kraju.php'){assert.deepEqual(f,{data:'PL'});return Response.json({});}
  assert.deepEqual(f,{data:'1'});
  if(u.pathname==='/inne/zmiana_wysylki.php')return Response.json(override.ship??(count===44?fixture.largeShip:fixture.ship));
  assert.equal(u.pathname,'/inne/zmiana_platnosci.php');return Response.json(override.payment??(count===44?fixture.largePayment:fixture.payment));
 }) as typeof fetch;
 return{calls,fetchImpl};
}

test('DekoratorMarket confirms one exact 6m² pack at gross 41.50, barcode and picture; stock icon is no numeric quantity',()=>{
 const p=readDekoratorProduct(fixture.card,source);assert.equal(p.gtin13,'5905167826942');assert.equal(p.offers.price,'41.50');
 const row=parseRetailPage(fixture.card,source,new Date());assert.equal(row.priceGrosze,4150);assert.equal(row.stockPackages,undefined);assert.equal(row.imageUrl,'https://dekoratormarket.pl/images/securathermominia.png');
 assert.equal(confirmDekoratorCart(fixture.cart,2,4150),2500);assert.equal(confirmDekoratorCart(fixture.largeCart,44,4150),0);
 assert.ok(retailerDeliveryCapabilities().automaticStores.includes('DekoratorMarket'));assert.ok(!retailerDeliveryCapabilities().postcodeStores.includes('DekoratorMarket'));assert.equal(knownUnavailableRetailers().DekoratorMarket,undefined);
});
test('DekoratorMarket selects PL, real courier and bank prepayment and confirms both AJAX totals plus final cart; cache retains original expiry',async()=>{
 const f=http(),quote=createRetailerQuoter(f.fetchImpl),result=await quote(order(),'00-001');assert.ok('quote'in result);if(!('quote'in result))return;
 assert.equal(result.quote.costGrosze,2500);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.payment,'Przelew bankowy');assert.equal(Date.parse(result.quote.expiresAt)-Date.parse(result.quote.checkedAt),600000);assert.equal(f.calls.length,10);assert.equal(f.calls.filter(c=>c.method==='POST').length,5);
 assert.deepEqual(await quote(order(),'00-001'),result);assert.equal(f.calls.length,10);assert.ok(!f.calls.some(c=>/zamow|zalog|kontakt|zapisz|kupon/.test(c.path)));
 const large=await quoteDekorator(order(44),http(44).fetchImpl);assert.ok('quote'in large);if('quote'in large)assert.equal(large.quote.costGrosze,0);
});
test('DekoratorMarket rejects another EAN, coverage, retail unit, gross price, currency, stock or native product ID',()=>{
 const changes=[fixture.card.replace('5905167826942','5905167819364'),fixture.card.replace('6,00','5,50'),fixture.card.replace(' / szt.',' / m2'),fixture.card.replace('content="41.50"','content="42.50"'),fixture.card.replace('41,50 zł','42,50 zł'),fixture.card.replace('content="PLN"','content="EUR"'),fixture.card.replace('Dostępny','Brak'),fixture.card.replace('content="1367"','content="1368"'),fixture.card.replace('step="1"','step="0.5"')];
 changes.forEach((card,i)=>{assert.notEqual(card,fixture.card,'mutation '+i);assert.throws(()=>readDekoratorProduct(card,source),'mutation '+i);});
 assert.throws(()=>readDekoratorProduct(fixture.card,{...source,packageSize:1}),/invalid_basket/);
});
test('DekoratorMarket rejects partial cart, pickup, foreign destination, surcharge and unselected/free placeholders',()=>{
 const changes=[fixture.cart.replace('value="2"','value="1"'),fixture.cart.replaceAll(source.url,'https://dekoratormarket.pl/other.html'),fixture.cart.replace('41,50 zł','42,50 zł'),fixture.cart.replace('83,00 zł','84,00 zł'),fixture.cart.replace('value="PL" selected="selected"','value="DE" selected="selected"'),fixture.cart.replace('checked="checked"',''),fixture.cart.replace('wysylka="wysylka_standard"','wysylka="wysylka_odbior_osobisty"'),fixture.cart.replaceAll('Kurier PODKŁADY I LISTWY','Odbiór osobisty'),fixture.cart.replace('wysylka="platnosc_przelew"','wysylka="platnosc_pobranie"'),fixture.cart.replace('108,00 zł','109,00 zł'),fixture.cart.replace('id="CenaWysylki1">25,00 zł','id="CenaWysylki1">'),fixture.cart.replace('id="CenaWysylki1"></div>','id="CenaWysylki1">1,00 zł</div>')];
 changes.forEach((cart,i)=>{assert.notEqual(cart,fixture.cart,'mutation '+i);assert.throws(()=>confirmDekoratorCart(cart,2,4150),'mutation '+i);});
 const fakeFree=fixture.cart.replaceAll('25,00 zł','0,00 zł').replaceAll('108,00 zł','83,00 zł').replace('id="CenaWysylki1">0,00 zł','id="CenaWysylki1">');assert.throws(()=>confirmDekoratorCart(fakeFree,2,4150),/no_home_delivery/);
 const extra=fixture.cart.replace('</table>','<tr><td><input class="InputPrzeliczKoszyk" id="ilosc_9_1368" value="1" /></td></tr></table>');assert.throws(()=>confirmDekoratorCart(extra,2,4150));
 const belowThreshold=fixture.largeCart.replace('value="44"','value="43"').replaceAll('1 826,00 zł','1 784,50 zł');assert.throws(()=>confirmDekoratorCart(belowThreshold,43,4150),/no_home_delivery/);
});
test('DekoratorMarket stops on stock adjustment, stale catalog price, partial native summaries and unsupported basket',async()=>{
 const stock=http(2,{check:[{komunikat:'Brak wymaganej ilości',ilosc:'1',nazwa:source.name,id_inputa:'1367'}]});await assert.rejects(()=>quoteDekorator(order(),stock.fetchImpl),/insufficient_stock/);assert.equal(stock.calls.length,3);
 const stale=order();stale.materialsGrosze=8200;stale.lines[0].packages[0].unitPriceGrosze=4100;const f=http();await assert.rejects(()=>quoteDekorator(stale,f.fetchImpl),/price_changed/);assert.equal(f.calls.length,1);
 for(const override of [{payment:{...fixture.payment,kupon:'tak'}},{payment:{...fixture.payment,podsumowanie:fixture.payment.podsumowanie.replace('108,00 zł','109,00 zł')}},{ship:{...fixture.ship,podsumowanie:''}},{cart:fixture.cart.replace('value="2"','value="1"')}])await assert.rejects(()=>quoteDekorator(order(),http(2,override).fetchImpl));
 const unsupported=order();unsupported.lines.push(structuredClone(unsupported.lines[0]));await assert.rejects(()=>quoteDekorator(unsupported,f.fetchImpl),/invalid_basket/);
});
test('DekoratorMarket transport accepts only reviewed actions, bounded quantities and storefront tokens',async()=>{
 let calls=0;const fetchImpl=(async()=>{calls++;throw Error('must not call');}) as typeof fetch;
 for(const count of [0,-1,1.2,Number.MAX_SAFE_INTEGER])await assert.rejects(()=>new AnonymousShop('https://dekoratormarket.pl',fetchImpl,AbortSignal.timeout(500)).dekorator('add','a'.repeat(16),count),/invalid_cart_action/);
 for(const [action,token,count]of [['order','a'.repeat(16),2],['constructor','a'.repeat(16),2],['add','bad/url',2],['shipping','a'.repeat(16),2]] as const)await assert.rejects(()=>new AnonymousShop('https://dekoratormarket.pl',fetchImpl,AbortSignal.timeout(500)).dekorator(action as any,token,count),/invalid_cart_action/);
 await assert.rejects(()=>new AnonymousShop('https://other.example',fetchImpl,AbortSignal.timeout(500)).dekorator('add','a'.repeat(16),2),/invalid_cart_action/);assert.equal(calls,0);
});
