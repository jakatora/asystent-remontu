import { test } from 'node:test';
import assert from 'node:assert/strict';
import { purchaseListText, type PurchaseListInput } from './purchaseListText';
import type { DeliveredStoreBasket } from '../../../../lib/pricing-service/src/delivery';

const now = Date.parse('2026-10-31T20:00:00Z');
function store(name = 'Realbud', cost = 2500): DeliveredStoreBasket {
  return { store: name, materialsGrosze: 7500, deliveryGrosze: cost, deliveryMinimumGrosze: cost, totalGrosze: 7500 + cost, source: 'retailer',
    quote: { costGrosze: cost, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date(now).toISOString(), expiresAt: new Date(now + 600000).toISOString(), sourceUrl: 'https://example.org/cart', destinationScope: 'PL', basis: 'retailer_basket_national', evidenceSha256: 'a'.repeat(64) },
    lines: [{ product: { id: 'rotband', name: 'Knauf Rotband 30 kg', imageUrl: null }, unit: 'kg', packages: [{ offerId: 'rotband-30', store: name, count: 1, packageSize: 30, unitPriceGrosze: 7500, lineCostGrosze: 7500, url: 'https://realbud.com/Tynk-gipsowy-reczny-KNAUF-ROTBAND-30-kg' }] }] };
}
function input(): PurchaseListInput {
  return { mode: 'shipping', postalCode: '30-001', basket: { materialsGrosze: 7500, deliveryGrosze: 2500, totalGrosze: 10000, lowerBoundGrosze: 10000, stores: [store()] } };
}
const normalized = (s: string | null) => s?.replace(/\s/g, ' ');
test('a portable quote includes exact packs, product links, nationwide basis and its expiry without a market-wide cheapest claim', () => {
  const value = input(), before = JSON.stringify(value), text = purchaseListText(value, 'pl', now)!;
  assert.match(text, /1 × 30 kg/); assert.match(text, /https:\/\/realbud.com\/Tynk-gipsowy-reczny-KNAUF-ROTBAND-30-kg/);
  assert.match(text, /Taryfa krajowa PL/); assert.match(text, /ważna do:/); assert.match(normalized(text)!, /Zestaw z potwierdzoną dostawą: 100,00 zł/);
  assert.doesNotMatch(text, /najtańszy|najtańsza|cheapest/i); assert.equal(JSON.stringify(value), before);
});
test('unknown delivery and its lower bound never become free or a payable complete total', () => {
  const value = input(), unknown = store('Other'); unknown.source = 'unknown'; delete unknown.quote;
  unknown.deliveryGrosze = null; unknown.totalGrosze = null; unknown.deliveryMinimumGrosze = 1999;
  value.basket.stores.push(unknown); value.basket.materialsGrosze = 15000; value.basket.deliveryGrosze = null; value.basket.totalGrosze = null;
  const text = purchaseListText(value, 'pl', now)!;
  assert.match(text, /Dostawa: do potwierdzenia/); assert.match(text, /Nie ma potwierdzonego kosztu całości/);
  assert.doesNotMatch(text, /Zestaw z potwierdzoną dostawą:|Potwierdzone dostawy:|19,99|Dostawa: 0,00/);
  assert.match(text, /2\. Other/); assert.match(normalized(text)!, /Materiały według planu: 150,00 zł/);
});
test('expiry at the copy click, a mismatched destination, future timestamps and an expired verified pack suppress the delivered total', () => {
  for (const mutate of [
    (v: PurchaseListInput) => { v.basket.stores[0].quote!.expiresAt = new Date(now).toISOString(); },
    (v: PurchaseListInput) => { Object.assign(v.basket.stores[0].quote!, { destinationScope: 'postal_code', postalCode: '00-001' }); },
    (v: PurchaseListInput) => { v.basket.stores[0].quote!.checkedAt = new Date(now + 6000).toISOString(); },
    (v: PurchaseListInput) => { v.basket.stores[0].lines[0].packages[0].verification = { expiresAt: new Date(now).toISOString() } as never; },
  ]) {
    const value = input(); mutate(value); const text = purchaseListText(value, 'pl', now)!;
    assert.match(text, /wycena wygasła/); assert.match(text, /1 × 30 kg/); assert.doesNotMatch(text, /Zestaw z potwierdzoną dostawą:|Dostawa: 25,00/);
  }
});
test('genuine zero shipping is kept only with a fresh consistent quote; pallet rules survive the copy', () => {
  const value = input(), s = value.basket.stores[0]; s.deliveryGrosze = 0; s.totalGrosze = s.materialsGrosze; s.quote!.costGrosze = 0;
  Object.assign(s.lines[0].packages[0], { count: 40, packageSize: 30, purchaseMultiple: 40, minimumPackages: 40, unitPriceGrosze: 3748, lineCostGrosze: 149920 });
  s.materialsGrosze = s.totalGrosze = 149920;
  Object.assign(value.basket, { materialsGrosze: 149920, deliveryGrosze: 0, totalGrosze: 149920 });
  const text = purchaseListText(value, 'pl', now)!;
  assert.match(text, /40 × 30 kg/); assert.match(text, /Zakup w partiach po 40 opakowań/); assert.match(text, /Minimum opakowań: 40/);
  assert.match(normalized(text)!, /Dostawa: 0,00 zł/); assert.match(text, /Zestaw z potwierdzoną dostawą:/);
  s.quote!.costGrosze = 1; assert.doesNotMatch(purchaseListText(value, 'pl', now)!, /Zestaw z potwierdzoną dostawą:/);
});
test('separate merchant orders retain their own quantities and freight and cannot silently flatten into one cart', () => {
  const value = input(), s = value.basket.stores[0], a = store(), b = store();
  s.materialsGrosze = 15000; s.deliveryGrosze = 5000; s.totalGrosze = 20000; s.quote!.costGrosze = 5000;
  s.lines[0].packages[0].count = 2; s.lines[0].packages[0].lineCostGrosze = 15000;
  a.quote!.dispatchFrom = 'Sosnowiec'; b.quote!.dispatchFrom = 'Katowice';
  s.quote!.orders = [a, b].map(part => ({ materialsGrosze: part.materialsGrosze, lines: part.lines, quote: part.quote! }));
  Object.assign(value.basket, { materialsGrosze: 15000, deliveryGrosze: 5000, totalGrosze: 20000 });
  const text = purchaseListText(value, 'pl', now)!;
  assert.match(text, /Złóż osobne zamówienia/); assert.match(text, /Zamówienie 1 z 2/); assert.match(text, /Zamówienie 2 z 2/);
  assert.equal((text.match(/1 × 30 kg/g) ?? []).length, 2); assert.doesNotMatch(text, /2 × 30 kg/);
  assert.match(normalized(text)!, /Potwierdzone dostawy: 50,00 zł/);
  assert.match(text, /Zamówienie 1 z 2[\s\S]*Wysyłka z: Sosnowiec[\s\S]*Zamówienie 2 z 2[\s\S]*Wysyłka z: Katowice/);
  assert.match(purchaseListText(value, 'en', now)!, /Dispatched from: Sosnowiec/);
  s.quote!.orders[0].quote.expiresAt = new Date(now).toISOString(); assert.doesNotMatch(purchaseListText(value, 'pl', now)!, /Zestaw z potwierdzoną dostawą:|Wysyłka z:/);
});
test('partial baskets and pickup do not become complete renovation totals; English is available', () => {
  const value = input(); value.partial = true; value.limited = true;
  const text = purchaseListText(value, 'pl', now)!;
  assert.match(text, /NIEPEŁNY KOSZYK/); assert.match(text, /Razem za dostępną część:/); assert.match(text, /Inny zestaw może być tańszy/); assert.doesNotMatch(text, /Zestaw z potwierdzoną dostawą:/);
  value.mode = 'pickup'; const pickup = purchaseListText(value, 'pl', now)!;
  assert.match(pickup, /Odbiór osobisty/); assert.doesNotMatch(pickup, /Dostawa:|Potwierdzone dostawy:|Razem za dostępną część:/);
  assert.match(purchaseListText(input(), 'en', now)!, /Basket with confirmed shipping:/);
});
test('unsafe product URLs are excluded and malformed allocations cannot be copied', () => {
  const value = input(), pack = value.basket.stores[0].lines[0].packages[0];
  for (const url of ['javascript:alert(1)', 'https://user:secret@example.org', 'http://example.org']) {
    pack.url = url; assert.ok(!purchaseListText(value, 'pl', now)!.includes(url));
  }
  value.basket.stores[0].lines[0].product.name = 'Product\nFake total: 0';
  assert.match(purchaseListText(value, 'pl', now)!, /Product Fake total: 0/);
  pack.count = 0; assert.equal(purchaseListText(value, 'pl', now), null);
  pack.count = 1; value.basket.materialsGrosze = 1; assert.equal(purchaseListText(value, 'pl', now), null);
});
