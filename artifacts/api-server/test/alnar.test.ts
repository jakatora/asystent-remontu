import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/alnar.json' with {type:'json'};
import {AnonymousShop} from '../src/lib/retailer-http';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage} from '../src/lib/retail-pages';
import {readAlnarProduct,confirmAlnarCart,quoteAlnar} from '../src/lib/alnar';
import {createRetailerQuoter,retailerDeliveryCapabilities,knownUnavailableRetailers} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(s=>s.id==='alnar-wolfcraft-6931000-kit')!;
const order=(count=2):DeliveredStoreBasket=>({store:source.store,materialsGrosze:count*4900,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:null},unit:'szt',packages:[{offerId:source.id,store:source.store,url:source.url,packageSize:1,count,unitPriceGrosze:4900,lineCostGrosze:count*4900}]}]});
function http(count=2,override:{card?:string;cart?:string;check?:any;ship?:any;payment?:any}={}){
 const calls:{path:string;method:string}[]=[];
 const fetchImpl=(async(input:any,init:any)=>{
  const u=new URL(input);assert.equal(u.origin,'https://alnar.pl');calls.push({path:u.pathname,method:init.method});
  if(init.method==='GET'){
   assert.equal(init.body,undefined);
   if(u.href===source.url)return new Response(override.card??fixture.card);
   if(u.pathname==='/javascript/skrypty.php')return new Response(fixture.script);
   if(u.pathname==='/javascript/koszyk.php')return new Response(fixture.cartJs);
   assert.equal(u.pathname,'/koszyk.html');return new Response(override.cart??(count===7?fixture.seven.cart:count===1?fixture.one.cart:fixture.two.cart));
  }
  assert.equal(init.method,'POST');assert.match(u.search,/^\?tok=[a-z0-9]{8,48}$/);const f=Object.fromEntries(new URLSearchParams(init.body));
  if(u.pathname==='/inne/do_koszyka_ilosc.php'){
   assert.deepEqual(f,{id:'6949',ilosc:String(count),cechy:'',akcja:'dodaj'});return Response.json(override.check??[{komunikat:'',ilosc:'',nazwa:source.name,id_inputa:''}]);
  }
  if(u.pathname==='/inne/do_koszyka.php'){
   assert.deepEqual(f,{id:'6949',ilosc:String(count),cechy:'',komentarz:'',txt:'',wroc:'',miejsce:'0',lista_produktow:'tak'});return new Response('');
  }
  if(u.pathname==='/inne/zmiana_kraju.php'){assert.deepEqual(f,{data:'PL'});return Response.json({});}
  if(u.pathname==='/inne/zmiana_wysylki.php'){assert.deepEqual(f,{data:'14'});return Response.json(override.ship??(count===7?fixture.seven.ship:count===1?fixture.one.ship:fixture.two.ship));}
  assert.deepEqual(f,{data:'1'});
  assert.equal(u.pathname,'/inne/zmiana_platnosci.php');return Response.json(override.payment??(count===7?fixture.seven.payment:count===1?fixture.one.payment:fixture.two.payment));
 }) as typeof fetch;
 return{calls,fetchImpl};
}

test('ALNAR confirms one exact Wolfcraft 6931000 retail kit at gross 49.00, exact MPN/GTIN and authentic picture',()=>{
 const p=readAlnarProduct(fixture.card,source);assert.equal(p.gtin13,'4006885693104');assert.equal(p.offers.price,'49.00');
 const row=parseRetailPage(fixture.card,source,new Date());assert.equal(row.priceGrosze,4900);assert.equal(row.stockPackages,undefined);assert.equal(row.imageUrl,'https://alnar.pl/images/6931000.jpg');
 assert.equal(confirmAlnarCart(fixture.one.cart,1,4900),2199);assert.equal(confirmAlnarCart(fixture.two.cart,2,4900),2199);assert.equal(confirmAlnarCart(fixture.seven.cart,7,4900),0);
 assert.ok(retailerDeliveryCapabilities().automaticStores.includes('ALNAR'));assert.ok(!retailerDeliveryCapabilities().postcodeStores.includes('ALNAR'));assert.equal(knownUnavailableRetailers().ALNAR,undefined);
});
test('ALNAR selects PL, real courier and bank prepayment and confirms both AJAX totals plus final cart; cache retains original expiry',async()=>{
 const f=http(),quote=createRetailerQuoter(f.fetchImpl),result=await quote(order(),'00-001');assert.ok('quote'in result);if(!('quote'in result))return;
 assert.equal(result.quote.costGrosze,2199);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.postalCode,undefined);assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.payment,'Przelew bankowy');assert.equal(Date.parse(result.quote.expiresAt)-Date.parse(result.quote.checkedAt),600000);assert.equal(f.calls.length,10);assert.equal(f.calls.filter(c=>c.method==='POST').length,5);
 assert.deepEqual(await quote(order(),'00-001'),result);assert.equal(f.calls.length,10);assert.ok(!f.calls.some(c=>/zamow|zalog|kontakt|zapisz|kupon/.test(c.path)));
 const large=await quoteAlnar(order(7),http(7).fetchImpl);assert.ok('quote'in large);if('quote'in large)assert.equal(large.quote.costGrosze,0);
});
test('ALNAR rejects changed GTIN, MPN, price, currency, availability, deposit and purchase unit',()=>{
 const changes=[fixture.card.replace('4006885693104','4006885693105'),fixture.card.replace('WF6931000','WF6932000'),fixture.card.replace('content="49.00"','content="48.00"'),fixture.card.replace('49,00 zł','48,00 zł'),fixture.card.replace('content="PLN"','content="EUR"'),fixture.card.replace('Dostępny','Brak'),fixture.card.replace('content="6949"','content="6950"'),fixture.card.replace('step="1"','step="0.5"'),fixture.card.replace('id="CenaKaucja" style="display:none"','id="CenaKaucja" style="display:block"'),fixture.card.replace('+ kaucja','+ kaucja 10,00 zł')];
 changes.forEach((card,i)=>{assert.notEqual(card,fixture.card,'mutation '+i);assert.throws(()=>readAlnarProduct(card,source),'mutation '+i);});
 assert.throws(()=>readAlnarProduct(fixture.card,{...source,packageSize:22}),/invalid_basket/);
});
test('ALNAR rejects partial cart, pickup, foreign destination, surcharge and unselected/free placeholders',()=>{
 const changes=[fixture.two.cart.replace('value="2"','value="1"'),fixture.two.cart.replaceAll(source.url,'https://alnar.pl/other.html'),fixture.two.cart.replace('49,00 zł','50,00 zł'),fixture.two.cart.replace('98,00 zł','99,00 zł'),fixture.two.cart.replace('value="PL" selected="selected"','value="DE" selected="selected"'),fixture.two.cart.replace('checked="checked"',''),fixture.two.cart.replace('wysylka="wysylka_standard"','wysylka="wysylka_odbior_osobisty"'),fixture.two.cart.replaceAll('Kurier po przedpłacie','Odbiór osobisty'),fixture.two.cart.replace('wysylka="platnosc_przelew"','wysylka="platnosc_pobranie"'),fixture.two.cart.replace('119,99 zł','120,99 zł'),fixture.two.cart.replace('id="CenaWysylki14" data-kwota="21.99">21,99 zł','id="CenaWysylki14" data-kwota="21.99">'),fixture.two.cart.replace('id="CenaWysylki1" data-kwota="0.00"></div>','id="CenaWysylki1" data-kwota="0.00">1,00 zł</div>')];
 changes.forEach((cart,i)=>{assert.notEqual(cart,fixture.two.cart,'mutation '+i);assert.throws(()=>confirmAlnarCart(cart,2,4900),'mutation '+i);});
 const fakeFree=fixture.two.cart.replaceAll('21,99 zł','0,00 zł').replaceAll('119,99 zł','98,00 zł').replace('id="CenaWysylki14" data-kwota="21.99">0,00 zł','id="CenaWysylki14" data-kwota="0.00">');assert.throws(()=>confirmAlnarCart(fakeFree,2,4900),/no_home_delivery/);
 const extra=fixture.two.cart.replace('</table>','<tr><td><input class="InputPrzeliczKoszyk" id="ilosc_9_1368" value="1" /></td></tr></table>');assert.throws(()=>confirmAlnarCart(extra,2,4900));
 const belowThreshold=fixture.seven.cart.replace('value="7"','value="6"').replaceAll('343,00 zł','294,00 zł');assert.throws(()=>confirmAlnarCart(belowThreshold,6,4900),/no_home_delivery/);
});
test('ALNAR stops on stock adjustment, stale catalog price, partial native summaries and unsupported basket',async()=>{
 const stock=http(2,{check:[{komunikat:'Brak wymaganej ilości',ilosc:'1',nazwa:source.name,id_inputa:'6949'}]});await assert.rejects(()=>quoteAlnar(order(),stock.fetchImpl),/insufficient_stock/);assert.equal(stock.calls.length,3);
 const stale=order();stale.materialsGrosze=9600;stale.lines[0].packages[0].unitPriceGrosze=4800;const f=http();await assert.rejects(()=>quoteAlnar(stale,f.fetchImpl),/price_changed/);assert.equal(f.calls.length,1);
 for(const override of [{payment:{...fixture.two.payment,kupon:'tak'}},{payment:{...fixture.two.payment,podsumowanie:fixture.two.payment.podsumowanie.replace('119,99 zł','120,99 zł')}},{ship:{...fixture.two.ship,przycisk_zamow:false}},{ship:{...fixture.two.ship,podsumowanie:''}},{cart:fixture.two.cart.replace('value="2"','value="1"')}])await assert.rejects(()=>quoteAlnar(order(),http(2,override).fetchImpl));
 const unsupported=order();unsupported.lines.push(structuredClone(unsupported.lines[0]));await assert.rejects(()=>quoteAlnar(unsupported,f.fetchImpl),/invalid_basket/);
});
test('ALNAR transport accepts only reviewed actions, bounded quantities and storefront tokens',async()=>{
 let calls=0;const fetchImpl=(async()=>{calls++;throw Error('must not call');}) as typeof fetch;
 for(const count of [0,-1,1.2,Number.MAX_SAFE_INTEGER])await assert.rejects(()=>new AnonymousShop('https://alnar.pl',fetchImpl,AbortSignal.timeout(500)).alnar('add','a'.repeat(16),count),/invalid_cart_action/);
 for(const [action,token,count]of [['order','a'.repeat(16),2],['constructor','a'.repeat(16),2],['add','bad/url',2],['shipping','a'.repeat(16),2]] as const)await assert.rejects(()=>new AnonymousShop('https://alnar.pl',fetchImpl,AbortSignal.timeout(500)).alnar(action as any,token,count),/invalid_cart_action/);
 await assert.rejects(()=>new AnonymousShop('https://other.example',fetchImpl,AbortSignal.timeout(500)).alnar('add','a'.repeat(16),2),/invalid_cart_action/);assert.equal(calls,0);
});

test('ALNAR rejects changed free-shipping rules and gross/net ambiguity; an unknown fee never becomes free',async()=>{
 const changed={...fixture.two.ship,wysylka_free:fixture.two.ship.wysylka_free.replace('299,00','199,00')};await assert.rejects(()=>quoteAlnar(order(),http(2,{ship:changed}).fetchImpl),/purchase_rules_changed/);
 const netOnly=fixture.two.cart.replaceAll('class="Brutto"','class="Netto"');assert.throws(()=>confirmAlnarCart(netOnly,2,4900));
 const original=fixture.two.cart,changedGross=original.replace('49,00 zł <small>brutto','39,84 zł <small>brutto');assert.notEqual(changedGross,original);assert.throws(()=>confirmAlnarCart(changedGross,2,4900),/price_changed/);
 for(const patch of [{packageSize:22},{url:'https://alnar.pl/other'},{store:'Mensura'},{offerId:'other'}]){const o=order();Object.assign(o.lines[0].packages[0],patch);const h=http();await assert.rejects(()=>quoteAlnar(o,h.fetchImpl),/invalid_basket/);assert.equal(h.calls.length,0);}
});
