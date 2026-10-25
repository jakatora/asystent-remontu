import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readSeweraPayment,confirmSeweraBasket,confirmBudujBasket,decodeBudujDetails,checkoutMoney,createCheckoutPageReader} from '../src/lib/retailer-checkouts';
import type {AnonymousShop} from '../src/lib/retailer-http';
const payment=(price:string,blocked=false)=>`<div class="radio radio-line"><input name="platnosc" data-name="Płatność online" onclick="$('#koszt_dostawy').val('${price}');"><div class="dictionary-icon-additional"><strong>${price} zł</strong></div></div>${blocked?'<input type="hidden" id="block_order" value="1">':''}`;
test('product reads can be coalesced across isolated carts; changed prices get a new reading',async()=>{
  let calls=0;const client={text:async()=>{calls++;await new Promise(r=>setTimeout(r,1));return 'public product';}} as unknown as AnonymousShop;
  const read=createCheckoutPageReader();await Promise.all([read('https://sklep.sewera.pl/product',1000,client),read('https://sklep.sewera.pl/product',1000,client)]);
  assert.equal(calls,1);await read('https://sklep.sewera.pl/product',1100,client);assert.equal(calls,2);
});
test('Sewera explicit unavailable zero cannot become free shipping; visible and submitted gross prices agree',()=>{
  assert.equal(readSeweraPayment(payment('0',true)),null);
  assert.equal(readSeweraPayment(payment('0'))!.costGrosze,0);
  assert.equal(readSeweraPayment(payment('23,90'))!.costGrosze,2390);
  assert.throws(()=>readSeweraPayment(payment('23,90').replace('<strong>23,90','<strong>19,90')),/invalid_money/);
  assert.equal(readSeweraPayment(payment('23,90').replace('Płatność online','Za pobraniem')),null);
  assert.throws(()=>checkoutMoney('od 19,90 zł')); assert.throws(()=>checkoutMoney('19,90 netto'));
});
test('Sewera cart verifies actual quantity, SKU, gross price, total and dispatch branch',()=>{
  const row=`<tr><td><input wybierz="123"><a href="https://sklep.sewera.pl/test">Farba</a><input name="amount" value="2"><table><tr><td>Cena brutto:</td><td>10,00 zł</td></tr><tr><td>Wartość:</td><td>20,00 zł</td></tr></table></td></tr>`;
  const html=`Twój sklep to Katowice<table class="table basket-product"><tbody>${row}</tbody><tfoot><div class="basket_sum">Razem do zapłaty: 20,00 zł</div></tfoot></table>`;
  const expected=[{url:'https://sklep.sewera.pl/test',pid:'123',count:2,price:1000}];
  confirmSeweraBasket(html,expected,2000);
  assert.throws(()=>confirmSeweraBasket(html.replace('Farba</a>','Farba</a> W magazynie znajdują się jedynie 1 SZT!'),expected,2000),/insufficient_stock/);
  confirmSeweraBasket(html.replace('Farba</a>','Farba</a> W magazynie znajdują się jedynie 2 SZT!'),expected,2000);
  for(const changed of [html.replace('value="2"','value="1"'),html.replace('wybierz="123"','wybierz="321"'),html.replace('Katowice','Gliwice'),html.replace('10,00 zł','8,13 zł')]) assert.throws(()=>confirmSeweraBasket(changed,expected,2000));
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
