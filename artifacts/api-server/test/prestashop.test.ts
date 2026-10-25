import assert from 'node:assert/strict';
import { test } from 'node:test';
import { product as card, cart, delivery } from './fixtures/eelektryka';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { readPrestashopProduct } from '../src/lib/prestashop-product';
import { quotePrestashop } from '../src/lib/prestashop-delivery';
import { createRetailerQuoter, retailerDeliveryCapabilities } from '../src/lib/retailer-delivery';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(s => s.id === 'eelektryka-simon-basic-socket-white')!;
const now = new Date('2026-10-25T18:41:40Z');
const order = (): DeliveredStoreBasket => ({ store: source.store, materialsGrosze: 1656, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown',
  lines: [{ product: { id: 'remont-' + source.ean, name: source.name, imageUrl: null }, unit: 'szt', packages: [{ offerId: source.id, store: source.store, url: source.url, packageSize: 1, count: 1, unitPriceGrosze: 1656, lineCostGrosze: 1656 }] }] });

function shop(options: { card?: string; cart?: string; delivery?: string; quote?: object } = {}) {
  const requests: { path: string; method: string }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), method = init?.method ?? 'GET';
    assert.equal(url.origin, 'https://www.eelektryka.com');
    requests.push({ path: url.pathname + url.search, method });
    if (method === 'POST') {
      const fields = new URLSearchParams(String(init?.body));
      if (url.pathname === '/koszyk') {
        assert.deepEqual([...fields.keys()].sort(), ['Submit', 'add', 'id_product', 'id_product_attribute', 'qty', 'token'].sort());
        assert.equal(fields.get('id_product'), '3975'); assert.equal(fields.get('qty'), '1');
        return new Response(options.cart ?? cart);
      }
      assert.equal(url.pathname, '/');
      assert.deepEqual([...fields.keys()].sort(), ['ajax', 'controller', 'id_carrier_real', 'token', 'update_delivery'].sort());
      assert.equal(fields.get('controller'), 'specialorderpayment');
      assert.equal(fields.get('id_carrier_real'), '101');
      assert.equal(fields.get('update_delivery'), '1');
      return new Response(JSON.stringify(options.quote ?? { order_total_delivery: '17,49 zł', order_total_final: '34,05 zł' }));
    }
    if (url.pathname === new URL(source.url).pathname) return new Response(options.card ?? card);
    if (url.searchParams.get('controller') === 'specialorder') return new Response(options.cart ?? cart);
    assert.equal(url.searchParams.get('controller'), 'specialorderpayment');
    return new Response(options.delivery ?? delivery);
  };
  return { fetchImpl, requests };
}

test('PrestaShop reads the primary gross piece price and barcode, excluding cheaper recommendations and net price', () => {
  const observed = parseRetailPage(card, source, now);
  assert.equal(observed.priceGrosze, 1656); assert.equal(observed.ean, '5902787568238');
  assert.equal(observed.observedAt, now.toISOString()); assert.match(observed.imageUrl!, /11095-large_default/);
  assert.equal(readPrestashopProduct(card, source).maxPackages, 14);
});

test('PrestaShop rejects changed identity, pack rules, currency, stock and disagreement between gross data and display', () => {
  for (const [index, changed] of [
    card.replaceAll('5902787568238', '5902787568177'), card.replaceAll('SI427', 'WRONG'),
    card.replace('value="3975"', 'value="3976"'), card.replace('min="1"', 'min="10"'),
    card.replace('step="1"', 'step="10"'), card.replace('max="14"', 'max="0"'),
    card.replace('schema.org/InStock', 'schema.org/OutOfStock'), card.replace('content="PLN"', 'content="EUR"'),
    card.replace('content="16.56"', 'content="13.46"'), card.replace(/(>\s*)brutto(\s*<)/, '$1netto$2'),
    card.replace(source.name, source.name.replace('białe', 'czarne')),
  ].entries()) {
    assert.notEqual(changed, card, 'fixture mutation must change the primary field: ' + index);
    assert.throws(() => parseRetailPage(changed, source, now), undefined, 'primary field: ' + index);
  }
  assert.throws(() => parseRetailPage(card, { ...source, packageSize: 10 }, now), /unit_not_confirmed/);
});

test('PrestaShop obtains the real whole-basket courier price and never submits checkout acceptance, payment or customer data', async () => {
  const api = shop(), result = await quotePrestashop(order(), api.fetchImpl);
  assert.ok('quote' in result); assert.equal(result.quote.costGrosze, 1749); assert.equal(result.quote.carrier, 'Pocztex Kurier');
  assert.equal(result.quote.destinationScope, 'PL'); assert.equal(result.quote.basis, 'retailer_basket_national');
  assert.equal(result.quote.postalCode, undefined); assert.equal(result.quote.payment, 'Przelew tradycyjny');
  assert.notEqual(result.quote.costGrosze, 749, 'the default pickup charge cannot win as home delivery');
  assert.equal(api.requests.length, 5); assert.match(result.quote.evidenceSha256, /^[a-f0-9]{64}$/);
});

test('PrestaShop rejects changed prices, partial baskets, short stock and an unconfirmed selected courier total', async () => {
  await assert.rejects(quotePrestashop(order(), shop({ card: card.replaceAll('16.56', '16.57').replaceAll('16,56', '16,57') }).fetchImpl), /price_changed/);
  const tooMany = order(); tooMany.lines[0].packages[0].count = 15; tooMany.materialsGrosze = 15 * 1656;
  await assert.rejects(quotePrestashop(tooMany, shop().fetchImpl), /insufficient_stock/);
  const wrongTotal = order(); wrongTotal.materialsGrosze++;
  await assert.rejects(quotePrestashop(wrongTotal, shop().fetchImpl), /basket_not_confirmed/);
  for (const wrong of [cart.replace('value="1"', 'value="2"'), cart + cart, cart.replace('16,56 zł', '13,46 zł'), cart.replace('data-id-product="3975"', 'data-id-product="3976"')]) {
    await assert.rejects(quotePrestashop(order(), shop({ cart: wrong }).fetchImpl), /basket_not_confirmed/);
  }
  for (const quote of [{ order_total_delivery: '7,49 zł', order_total_final: '24,05 zł' }, { order_total_delivery: '17,49 zł', order_total_final: '35,05 zł' }, { order_total_delivery: null, order_total_final: '34,05 zł' }]) {
    await assert.rejects(quotePrestashop(order(), shop({ quote }).fetchImpl));
  }
});

test('PrestaShop never substitutes pickup, COD, foreign destination or mismatched numeric money for confirmed delivery', async () => {
  for (const bad of [
    delivery.replaceAll('kurier', 'punkt').replaceAll('Kurier', 'Punkt'),
    delivery.replace('class="prepay holder"', 'class="cash_on_delivery holder"'),
    delivery.replace('value="Poland"', 'value="other"'), delivery.replace('data-price="17.49"', 'data-price="0.00"'),
    delivery.replace('value="bankwire"', 'value="cashondelivery"'),
  ]) await assert.rejects(quotePrestashop(order(), shop({ delivery: bad }).fetchImpl));
});

test('PrestaShop integration appears in automatic capabilities and caches by whole basket and destination', async () => {
  assert.ok(retailerDeliveryCapabilities().automaticStores.includes('Eelektryka'));
  const api = shop(), quote = createRetailerQuoter(api.fetchImpl);
  const first = await quote(order(), '00-001'), again = await quote(order(), '00-001');
  assert.deepEqual(first, again); assert.equal(api.requests.length, 5);
  assert.ok('quote' in await quote(order(), '30-001')); assert.equal(api.requests.length, 10);
});
