import assert from 'node:assert/strict';
import {test} from 'node:test';
import fixture from './fixtures/mlazienka.json' with {type:'json'};
import {AnonymousShop} from '../src/lib/retailer-http';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import {parseRetailPage,readRetailSource} from '../src/lib/retail-pages';
import {confirmMlazienkaCard,confirmMlazienkaCart,quoteMlazienka} from '../src/lib/mlazienka';
import {createRetailerQuoter,retailerDeliveryCapabilities,knownUnavailableRetailers} from '../src/lib/retailer-delivery';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';

const source=RETAIL_SOURCES.find(s=>s.id==='mlazienka-cersanit-ovida-50')!;
const order=():DeliveredStoreBasket=>({store:source.store,materialsGrosze:25700,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[{product:{id:'remont-'+source.ean,name:source.name,imageUrl:null},unit:'szt',packages:[{offerId:source.id,store:source.store,url:source.url,packageSize:1,count:1,unitPriceGrosze:25700,lineCostGrosze:25700}]}]});
function http(overrides:{card?:string;cart?:string;updated?:any;policy?:string}={}){
 const calls:{path:string;method:string;form:URLSearchParams}[]=[];
 const fetchImpl=(async(input:any,init:any)=>{
  const url=new URL(input),form=new URLSearchParams(init.body);assert.equal(url.origin,'https://www.mlazienka.pl');
  calls.push({path:url.pathname,method:init.method,form});
  if(url.href===source.url){assert.equal(init.method,'GET');return new Response(overrides.card??fixture.card);}
  if(url.pathname==='/koszyk,dodaj.html'){
   assert.equal(init.method,'POST');assert.deepEqual(Object.fromEntries(form),{product_id:'785642',subcategory_id:'81',form:'1',quantity:'1'});return new Response('');
  }
  if(url.pathname==='/koszyk,zapiszV2.html'){
   assert.equal(init.method,'POST');assert.deepEqual(Object.fromEntries(form),{'items[785642]':'1',shipment:'1',payment:'15','selected-payment':'15',section:'summary'});return Response.json(overrides.updated??fixture.updated);
  }
  assert.equal(init.method,'GET');assert.equal(init.body,undefined);
  if(url.pathname==='/koszyk.html')return new Response(overrides.cart??fixture.cart);
  assert.equal(url.pathname,'/koszty-dostawy');return new Response(overrides.policy??fixture.policy);
 }) as typeof fetch;
 return{calls,fetchImpl};
}
test('mŁazienka exact basin: duplicate primary identity, real gross price, photograph and native stock agree',async()=>{
 const p=confirmMlazienkaCard(fixture.card,source);assert.equal(p.ean,'5901771226987');assert.equal(p.priceGrosze,25700);assert.match(p.imageUrl!,/k36031_6f13aa54/);
 assert.deepEqual(confirmMlazienkaCart(fixture.cart,1,25700,true),{stock:4,costGrosze:0});
 const f=http(),observed=await readRetailSource(source,f.fetchImpl);assert.equal(observed.stockPackages,4);assert.equal(observed.priceGrosze,25700);assert.equal(f.calls.length,3);
 assert.throws(()=>parseRetailPage(fixture.card,source,new Date()),/retailer_basket_required/);
 assert.ok(retailerDeliveryCapabilities().automaticStores.includes('mŁazienka'));assert.equal(knownUnavailableRetailers()['mŁazienka'],undefined);assert.ok(!retailerDeliveryCapabilities().postcodeStores.includes('mŁazienka'));
});
test('mŁazienka verifies actual selected courier, ordinary prepayment and both complete gross summaries, then caches',async()=>{
 const f=http(),quote=createRetailerQuoter(f.fetchImpl),result=await quote(order(),'00-001');assert.ok('quote'in result);if(!('quote'in result))return;
 assert.equal(result.quote.costGrosze,0);assert.equal(result.quote.payment,'Przelew zwykły');assert.equal(result.quote.destinationScope,'PL');assert.equal(result.quote.basis,'retailer_basket_national');assert.equal(result.quote.postalCode,undefined);assert.equal(Date.parse(result.quote.expiresAt)-Date.parse(result.quote.checkedAt),600000);assert.match(result.quote.evidenceSha256!,/^[a-f0-9]{64}$/);
 assert.equal(f.calls.length,6);assert.equal(f.calls.filter(c=>c.method==='POST').length,2);assert.deepEqual(await quote(order(),'00-001'),result);assert.equal(f.calls.length,6);
 assert.ok(!f.calls.some(c=>/kasa|zamow|kontakt|eplatnosci/i.test(c.path)));assert.deepEqual(await quote(order(),'invalid'),{reason:'invalid_postal_code'});
});
test('mŁazienka rejects conflicting EAN/SKU, duplicate price, visible gross price, stock and changed product form',()=>{
 const mutations=[fixture.card.replace('5901771226987','5907720650025'),fixture.card.replace('K36031','K36030'),fixture.card.replace('257.00','258.00'),fixture.card.replace('data-price="257"','data-price="258"'),fixture.card.replace('w magazynie','na zamówienie'),fixture.card.replace('value="785642"','value="785644"'),fixture.card.replace('/koszyk,dodaj.html','/koszyk,kasa.html')];
 mutations.forEach((card,i)=>{assert.notEqual(card,fixture.card);assert.throws(()=>confirmMlazienkaCard(card,source),'mutation '+i);});
});
test('mŁazienka never uses changed quantity, another product, unselected zero, pickup or optional fee as free home delivery',()=>{
 const mutations=[fixture.cart.replace('data-total-items="1"','data-total-items="2"'),fixture.cart.replace('name="items[785642]"','name="items[785644]"'),fixture.cart.replace('value="1" data-product_id="785642"','value="2" data-product_id="785642"'),fixture.cart.replaceAll(source.url,'https://www.mlazienka.pl/other.html'),fixture.cart.replace('data-price="257"','data-price="258"'),fixture.cart.replace('checked="true"',''),fixture.cart.replace('id="input-KUR"','id="input-POO"'),fixture.cart.replace('Kurier</span>','Odbiór osobisty</span>'),fixture.cart.replace('Przelew zwykły','Przy odbiorze'),fixture.cart.replace('&quot;PZ&quot;:{&quot;cost&quot;:0}','&quot;PZ&quot;:{&quot;cost&quot;:1}'),fixture.cart.replace('name="sms" value="1"','name="sms" value="1" checked="true"'),fixture.cart.replace('id="ship-value" class="ui-price" value="0"','id="ship-value" class="ui-price"'),fixture.cart.replace('Gratis!','-'),fixture.cart.replace('data-value="257"','data-value="258"'),fixture.cart.replace('data-current-quantity="1"','data-current-quantity="2"'),fixture.cart.replace('4 sztuki!','0 sztuki!')];
 mutations.forEach((cart,i)=>{assert.notEqual(cart,fixture.cart,'mutation '+i);assert.throws(()=>confirmMlazienkaCart(cart,1,25700,true),'mutation '+i);});
 assert.throws(()=>confirmMlazienkaCart(fixture.shortage,5,25700,true),/insufficient_stock/);
});
test('mŁazienka stops on stale price, incomplete AJAX confirmation or missing policy; cannot quote an invented free basket',async()=>{
 const changed=order();changed.materialsGrosze=25600;changed.lines[0].packages[0].unitPriceGrosze=25600;
 const f=http();await assert.rejects(()=>quoteMlazienka(changed,f.fetchImpl),/price_changed/);assert.equal(f.calls.length,3);
 for(const overrides of [{updated:{...fixture.updated,cart_quantity:2}},{updated:{...fixture.updated,summary:fixture.updated.summary.replace('data-value="257"','data-value="258"')}},{policy:fixture.policy.replace('Produkty średnie','Produkty inne')}])await assert.rejects(()=>quoteMlazienka(order(),http(overrides).fetchImpl));
 const partial=order();partial.lines.push(structuredClone(partial.lines[0]));await assert.rejects(()=>quoteMlazienka(partial,f.fetchImpl),/invalid_basket/);
});
test('mŁazienka transport exposes only bounded pinned additions and shipping/payment selection',async()=>{
 let calls=0;const f=(async()=>{calls++;throw Error('must not call');}) as typeof fetch;
 for(const n of [0,-1,1.5,100,Number.MAX_SAFE_INTEGER])await assert.rejects(()=>new AnonymousShop('https://www.mlazienka.pl',f,AbortSignal.timeout(500)).mlazienka('add',n),/invalid_cart_action/);
 await assert.rejects(()=>new AnonymousShop('https://other.example',f,AbortSignal.timeout(500)).mlazienka('add',1),/invalid_cart_action/);
 await assert.rejects(()=>new AnonymousShop('https://www.mlazienka.pl',f,AbortSignal.timeout(500)).mlazienka('checkout' as any,1),/invalid_cart_action/);assert.equal(calls,0);
});
