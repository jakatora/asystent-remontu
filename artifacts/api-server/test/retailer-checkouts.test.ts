import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readSeweraPayment,confirmSeweraBasket,confirmBudujBasket,decodeBudujDetails,checkoutMoney,createCheckoutPageReader,quoteSewera,seweraHomeDeliveryMethods} from '../src/lib/retailer-checkouts';
import type {AnonymousShop} from '../src/lib/retailer-http';
import {RETAIL_SOURCES} from '../src/lib/retail-catalog';
import type {DeliveredStoreBasket} from '../../../lib/pricing-service/src/delivery';
const payment=(price:string,blocked=false)=>`<div class="radio radio-line"><input name="platnosc" data-name="Płatność online" onclick="$('#koszt_dostawy').val('${price}');"><div class="dictionary-icon-additional"><strong>${price} zł</strong></div></div>${blocked?'<input type="hidden" id="block_order" value="1">':''}`;
test('product reads can be coalesced across isolated carts; changed prices get a new reading',async()=>{
  let calls=0;const client={text:async()=>{calls++;await new Promise(r=>setTimeout(r,1));return 'public product';}} as unknown as AnonymousShop;
  const read=createCheckoutPageReader();await Promise.all([read('https://sklep.sewera.pl/product',1000,client),read('https://sklep.sewera.pl/product',1000,client)]);
  assert.equal(calls,1);await read('https://sklep.sewera.pl/product',1100,client);assert.equal(calls,2);
});

test('branch-dependent stock cards never share the cache across dispatch departments',async()=>{
  let calls=0;const client={text:async()=>String(++calls)} as unknown as AnonymousShop;
  const read=createCheckoutPageReader(),url='https://sklep.sewera.pl/product';
  assert.equal(await read(url,1406,client,'sewera:1'),'1');
  assert.equal(await read(url,1406,client,'sewera:3'),'2');
  assert.equal(await read(url,1406,client,'sewera:1'),'1');
  assert.equal(await read(url,1406,client,'sewera:3'),'2');
  assert.equal(calls,2);
});

test('Sewera identifies two verified dispatch branches before touching a cart',async()=>{
  const sources=RETAIL_SOURCES.filter(source=>['sewera-dulux-9l','sewera-atlas-gta-18kg'].includes(source.id));
  const order:DeliveredStoreBasket={store:'Sewera',materialsGrosze:34579,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',
    lines:sources.map((source,i)=>({product:{id:source.id,name:source.name,imageUrl:null},unit:source.unit,
      packages:[{offerId:source.id,store:'Sewera',url:source.url,packageSize:source.packageSize,count:1,unitPriceGrosze:i===0?27989:6590,lineCostGrosze:i===0?27989:6590}]}))};
  let calls=0;
  const result=await quoteSewera(order,'00-001',async()=>{calls++;throw Error('unexpected network call');});
  assert.deepEqual(result,{reason:'requires_separate_dispatch'});assert.equal(calls,0);
});

test('failed Sewera prefetch waits for active reads and stops starting new ones before releasing its quote',async()=>{
  const sources=RETAIL_SOURCES.filter(source=>source.store==='Sewera'&&!source.dispatchDepartment).slice(0,4);
  assert.equal(sources.length,4);
  const order:DeliveredStoreBasket={store:'Sewera',materialsGrosze:4000,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',
    lines:sources.map(source=>({product:{id:source.id,name:source.id,imageUrl:null},unit:null,
      packages:[{offerId:source.id,store:'Sewera',url:source.url,packageSize:source.packageSize,count:1,unitPriceGrosze:1000,lineCostGrosze:1000}]}))};
  let reads=0,calls=0,settled=false;
  const finishReads:(()=>void)[]=[];
  const failure=Error('price_changed');
  const pending=quoteSewera(order,'00-001',async()=>{calls++;return new Response('1');},async()=>{
    reads++;
    if(reads===1)throw failure;
    await new Promise<void>(resolve=>finishReads.push(resolve));
    return '';
  });
  const result=pending.then(()=>{settled=true;return null;},error=>{settled=true;return error;});
  // Allow the department response and all three initial workers to start.
  for(let turn=0;turn<3;turn++)await new Promise<void>(resolve=>setImmediate(resolve));
  assert.equal(reads,3);
  assert.equal(settled,false);
  assert.equal(calls,1);
  finishReads.forEach(resolve=>resolve());
  assert.equal(await result,failure);
  assert.equal(reads,3);
  assert.equal(calls,1); // A failed product read must not mutate a cart.
});
test('Sewera explicit unavailable zero cannot become free shipping; visible and submitted gross prices agree',()=>{
  assert.equal(readSeweraPayment(payment('0',true)),null);
  assert.equal(readSeweraPayment(payment('0'))!.costGrosze,0);
  assert.equal(readSeweraPayment(payment('23,90'))!.costGrosze,2390);
  assert.throws(()=>readSeweraPayment(payment('23,90').replace('<strong>23,90','<strong>19,90')),/invalid_money/);
  assert.equal(readSeweraPayment(payment('23,90').replace('Płatność online','Za pobraniem')),null);
  assert.throws(()=>checkoutMoney('od 19,90 zł')); assert.throws(()=>checkoutMoney('19,90 netto'));
});

test('actual named pallet carriers can quote heavy baskets; pickup, individual transport and disabled methods cannot',()=>{
  const method=(name:string,id:string,collection='0',extra='')=>`<input name="dostawa" data-name="${name}" value="${id}" data-personal-collection="${collection}" ${extra}>`;
  const html=method('DHL - Paleta do 200 kg','5')+method('Raben - Paleta do 200kg','129')+method('Kurier InPost do 5kg','10')
    +method('Odbiór osobisty','8','1')+method('Transport Sewera do 50km','12','3')+method('DHL - Paleta do 200 kg wycena indywidualna','13')
    +method('Nieznany - Paleta do 200 kg','14')+method('Kurier DHL','15','0','disabled')+method('Kurier odbiór osobisty','16')+method('DHL - Paleta do 200 kg','17','1');
  assert.deepEqual(seweraHomeDeliveryMethods(html).map(row=>row.value),['5','129','10']);
});
test('Sewera cart verifies actual quantity, SKU, gross price, total and dispatch branch',()=>{
  const row=`<tr><td><input wybierz="123"><a href="https://sklep.sewera.pl/test">Farba</a><input name="amount" value="2"><table><tr><td>Cena brutto:</td><td>10,00 zł</td></tr><tr><td>Wartość:</td><td>20,00 zł</td></tr></table></td></tr>`;
  const html=`Twój sklep to Katowice<table class="table basket-product"><tbody>${row}</tbody><tfoot><div class="basket_sum">Razem do zapłaty: 20,00 zł</div></tfoot></table>`;
  const expected=[{url:'https://sklep.sewera.pl/test',pid:'123',count:2,price:1000}];
  confirmSeweraBasket(html,expected,2000);
  confirmSeweraBasket(html.replace('Katowice','Gliwice'),expected,2000,'Gliwice');
  for(const branch of ['Gliwice2','Gliwice-stary','Katowice'])assert.throws(()=>confirmSeweraBasket(html.replace('Katowice',branch),expected,2000,'Gliwice'),/basket_not_confirmed/);
  assert.throws(()=>confirmSeweraBasket(html.replace('Katowice','GliwiceX'),expected,2000,'Gliwice.'),/basket_not_confirmed/);
  assert.throws(()=>confirmSeweraBasket(html.replace('Farba</a>','Farba</a> W magazynie znajdują się jedynie 1 SZT!'),expected,2000),/insufficient_stock/);
  confirmSeweraBasket(html.replace('Farba</a>','Farba</a> W magazynie znajdują się jedynie 2 SZT!'),expected,2000);
  const packageExpected = expected.map(row => ({ ...row, retailUnit: 'OPA' as const }));
  confirmSeweraBasket(html.replace('Farba</a>','Farba</a> W magazynie znajdują się jedynie 2 OPA!'),packageExpected,2000);
  assert.throws(()=>confirmSeweraBasket(html.replace('Farba</a>','Farba</a> W magazynie znajdują się jedynie 1 OPA!'),packageExpected,2000),/insufficient_stock/);
  for(const changed of [html.replace('value="2"','value="1"'),html.replace('wybierz="123"','wybierz="321"'),html.replace('Katowice','Gliwice'),html.replace('10,00 zł','8,13 zł')]) assert.throws(()=>confirmSeweraBasket(changed,expected,2000));
});
test('native stock shortage is bound to a fully verified SKU, units, gross lines and full basket total',()=>{
  const row=(pid:string,name:string,price:string,sum:string,stock='')=>`<tr><td><input wybierz="${pid}"><a href="https://sklep.sewera.pl/${pid}">${name}</a> ${stock}<input name="amount" value="4"><table><tr><td>Cena brutto:</td><td>${price} zł</td></tr><tr><td>Wartość:</td><td>${sum} zł</td></tr></table></td></tr>`;
  const html=`Twój sklep to Katowice<table class="basket-product"><tbody>${row('123','Farba','98,50','394,00','W magazynie znajdują się jedynie 2 SZT!')}${row('456','Biały klej','96,36','385,44')}</tbody><tfoot><div class="basket_sum">Razem do zapłaty: 779,44 zł</div></tfoot></table>`;
  const expected=[{url:'https://sklep.sewera.pl/123',pid:'123',count:4,price:9850},{url:'https://sklep.sewera.pl/456',pid:'456',count:4,price:9636}];
  assert.throws(()=>confirmSeweraBasket(html,expected,77944),error=>{
    assert.equal((error as Error).message,'insufficient_stock');assert.deepEqual((error as any).shortages,[{url:expected[0].url,count:4,price:9850,maxPackages:2}]);return true;
  });
  for(const changed of [html.replace('wybierz="123"','wybierz="999"'),html.replace('98,50 zł','98,49 zł'),html.replace('385,44 zł','385,43 zł'),html.replace('779,44 zł','779,43 zł'),html.replace('2 SZT','2 OPA'),html.replace('2 SZT','1,5 SZT')])assert.throws(()=>confirmSeweraBasket(changed,expected,77944),/basket_not_confirmed/);
});

test('Buduj24 decodes literal fragments only, verifies quantities and ignores crossed-out reference prices',()=>{
  const summary=`<div id="cart-summary"><div class="label">Suma koszyka:</div><div class="value">22,70 zł</div><div class="label">Koszt dostawy:</div><div class="value">15,00 zł</div><div class="label">Łącznie do zapłaty</div><div class="value">37,70 zł</div><div>Kwota zawiera podatek VAT</div></div>`;
  const fragment=`<div id="cart-details"><div>Kurier</div></div>`;
  const encoded=`<script>doNotRunThis();$('#cart-details').replaceWith(decodeURIComponent('${encodeURIComponent(fragment)}'));$('#cart-summary').replaceWith(decodeURIComponent('${encodeURIComponent(summary)}'));</script>`;
  assert.equal(decodeBudujDetails(encoded),fragment+'\n'+summary);
  assert.throws(()=>decodeBudujDetails(encoded.replace("'#cart-summary'","'#other'")));
  const html=`<div id="cart-products"><div class="cart-product headers"></div><div class="cart-product"><a href="/produkt/test">Taśma</a><input name="count" value="2"><div class="item price"><div class="price-old">15,00 zł</div>11,35 zł</div><div class="item price">22,70 zł</div></div><div class="cart-product summary"></div></div>${summary}`;
  const expected=[{url:'https://buduj24.pl/produkt/test',count:2,price:1135}];
  confirmBudujBasket(html,expected,2270);
  assert.throws(()=>confirmBudujBasket(html.replace('value="2"','value="1"'),expected,2270));
  assert.throws(()=>confirmBudujBasket(html.replace('37,70 zł','36,70 zł'),expected,2270));
});
