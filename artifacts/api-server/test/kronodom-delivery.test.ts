import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/kronodom-delivery.json';
import {product,primary} from './fixtures/abstore';
import {confirmKronodomCart,quoteKronodom} from '../src/lib/kronodom-delivery';
import {AnonymousShop} from '../src/lib/retailer-http';
import {createRetailerQuoter,retailerDeliveryCapabilities,knownUnavailableRetailers} from '../src/lib/retailer-delivery';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(s=>s.id==='kronodom-arbiton-secura-thermo-6m2')!;
const card=(p:any=product)=>'<body data-authenticated="false" data-currency="PLN" data-pow="disabled" data-csrf="'+'a'.repeat(64)+'"><script>const productData = '+JSON.stringify(p)+';</script>'+primary+'</body>';
const order=():DeliveredStoreBasket=>({store:'Kronodom',materialsGrosze:12396,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:null},unit:'m2',packages:[{offerId:source.id,store:'Kronodom',url:source.url,packageSize:6,count:2,unitPriceGrosze:6198,lineCostGrosze:12396}]}]});

test('Kronodom cart confirms native m² and the whole courier order, including the larger basket freight threshold',()=>{
 assert.equal(confirmKronodomCart(fixture.cart,2,6198).costGrosze,6900);
 assert.equal(confirmKronodomCart(fixture.cart24,4,6198).costGrosze,24900);
 assert.ok(retailerDeliveryCapabilities().automaticStores.includes('Kronodom'));assert.equal(knownUnavailableRetailers().Kronodom,undefined);
});
test('Kronodom rejects changed EAN, pack quantity, stock, gross amount, delivery, country and hidden payment fees',()=>{
 for(const [index,html]of [fixture.cart.replaceAll('5905167826942','5905167799208'),fixture.cart.replace('value="12"','value="6"'),fixture.cart.replace('data-step="6"','data-step="1"'),fixture.cart.replaceAll('10,33','8,40'),fixture.cart.replaceAll('123,96','100,78'),fixture.cart.replaceAll('Dostępność:','Niedostępność:'),fixture.cart.replaceAll('Dostępne','Brak'),fixture.cart.replace('data-currency="PLN"','data-currency="EUR"'),fixture.cart.replace('data-authenticated="false"','data-authenticated="true"'),fixture.cart.replaceAll('Dostawa kurierem','Odbiór osobisty'),fixture.cart.replaceAll('69,00','0,00'),fixture.cart.replaceAll('192,96','193,96'),fixture.cart.replace('name="delivery_country" value="1"','name="delivery_country" value="2"'),fixture.cart.replace('id="payment_6"','id="payment_7"'),fixture.cart.replace('data-final-gross-value="69"','data-final-gross-value="68"')].entries()){assert.notEqual(html,fixture.cart,'mutation '+index+' must change the native fixture');assert.throws(()=>confirmKronodomCart(html,2,6198),'mutation '+index);}
 assert.throws(()=>confirmKronodomCart(fixture.cart,1,6198));assert.throws(()=>confirmKronodomCart(fixture.cart,2,1033));
 const duplicate=fixture.cart.replace('</table>','<tr id="productTrIdop-999"><td>Unexpected product</td></tr></table>');assert.throws(()=>confirmKronodomCart(duplicate,2,6198));
});
test('Kronodom uses only primary card, pinned anonymous cart addition and cart read; no customer or final order route',async()=>{
 const calls:{path:string;body:string;method:string}[]=[];
 const fetchImpl=async(input:any,init:any)=>{const u=new URL(String(input));assert.equal(u.origin,'https://kronodom.pl');calls.push({path:u.pathname,body:init.body??'',method:init.method});
  if(u.href===source.url)return new Response(card(),{headers:{'set-cookie':'anonymous=fresh; Path=/'}});
  assert.equal(init.headers.Cookie,'anonymous=fresh');
  if(u.pathname==='/offer/ajax/triggerOrderUpdate'){
   assert.equal(init.headers['X-CSRF-Token'],'a'.repeat(64));const f=new URLSearchParams(init.body);assert.equal(f.get('strategy'),'add');assert.equal(f.get('positions[0][qty]'),'12');assert.equal(f.get('positions[0][saleUnitId]'),'1007');assert.equal(f.get('positions[0][ack]'),'false');assert.equal(f.size,10);return Response.json(fixture.added);
  }
  assert.equal(u.pathname,'/cart/');return new Response(fixture.cart);
 };
 const result=await createRetailerQuoter(fetchImpl as typeof fetch)(order(),'00-001');assert.ok('quote'in result);if(!('quote'in result))return;
 assert.equal(result.quote.costGrosze,6900);assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.postalCode,undefined);assert.equal(Date.parse(result.quote.expiresAt)-Date.parse(result.quote.checkedAt),600000);assert.equal(calls.length,3);assert.equal(calls.filter(c=>c.method==='POST').length,1);
});
test('Kronodom stops before adding stale-price or unavailable quantities; partial additions cannot quote a full basket',async()=>{
 let calls=0;const p=structuredClone(product);p.clientSaleUnit.availQnt=6;
 await assert.rejects(()=>quoteKronodom(order(),(async()=>{calls++;return new Response(card(p));}) as typeof fetch),/insufficient_stock/);assert.equal(calls,1);
 const changed=order();changed.lines[0].packages[0].unitPriceGrosze=6192;changed.materialsGrosze=12384;
 await assert.rejects(()=>quoteKronodom(changed,(async()=>new Response(card())) as typeof fetch),/price_changed/);
 const altered=structuredClone(fixture.added);altered.events.find((e:any)=>e.eventName==='OrderRefreshEvent')!.data.determinantQuantities[0].quantity=6;
 await assert.rejects(()=>quoteKronodom(order(),(async(_input:any,init:any)=>init.method==='POST'?Response.json(altered):new Response(card())) as typeof fetch),/basket_not_confirmed/);
});
test('Kronodom transport exposes no general strategy, unsupported origin, invalid count or unreviewed token',async()=>{
 let calls=0;const f=(async()=>{calls++;throw Error('must not call');}) as typeof fetch;
 for(const n of [0,-1,1.5,Number.MAX_SAFE_INTEGER])await assert.rejects(()=>new AnonymousShop('https://kronodom.pl',f,AbortSignal.timeout(500)).kronodomAdd(n,'a'.repeat(64)),/invalid_cart_action/);
 await assert.rejects(()=>new AnonymousShop('https://other.example',f,AbortSignal.timeout(500)).kronodomAdd(2,'a'.repeat(64)),/invalid_cart_action/);await assert.rejects(()=>new AnonymousShop('https://kronodom.pl',f,AbortSignal.timeout(500)).kronodomAdd(2,'bad'),/invalid_cart_action/);assert.equal(calls,0);
});
