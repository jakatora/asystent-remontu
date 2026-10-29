import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/pati-carina.json' with { type: 'json' };
import mixed from './fixtures/pati-carina-mixed.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { inspectPatiProduct } from '../src/lib/pati-woo';
import { readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter, retailerDeliveryCapabilities } from '../src/lib/retailer-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(s => s.id === 'pati-cersanit-carina-k98-0135')!;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
function replay(mutate?: (value: any, path: string) => void) {
  const paths: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), path = url.pathname;
    assert.equal(url.origin, 'https://patiartstudio.pl');
    const allowed: Record<string, keyof typeof fixture> = {
      '/wp-json/wc/store/v1/products/3065': 'product',
      '/wp-json/wc/store/v1/cart': 'empty',
      '/wp-json/wc/store/v1/cart/add-item': 'added',
      '/wp-json/wc/store/v1/cart/update-customer': 'located',
      '/wp-json/wc/store/v1/cart/select-shipping-rate': 'selected',
    };
    assert.ok(allowed[path], 'Only reviewed product and anonymous cart routes');
    if (path.endsWith('add-item')) assert.deepEqual(JSON.parse(String(init?.body)), { id: 3065, quantity: 1 });
    if (path.endsWith('update-customer')) assert.deepEqual(JSON.parse(String(init?.body)), { shipping_address: { country: 'PL', postcode: '00-001' } });
    if (path.endsWith('select-shipping-rate')) assert.deepEqual(JSON.parse(String(init?.body)), { package_id: 0, rate_id: 'flexible_shipping_single:7' });
    paths.push(path);
    const value = clone(fixture[allowed[path]]);
    mutate?.(value, path);
    return Response.json(value, { headers: path.includes('/cart') ? { 'Cart-Token': 'isolated-pati-test-session' } : {} });
  };
  return { fetcher, paths };
}
const basket: DeliveredStoreBasket = { store: source.store, materialsGrosze: 27093, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown',
  lines: [{ product: { id: source.ean, name: source.name, imageUrl: source.imageUrl! }, unit: 'szt', packages: [
    { offerId: source.id, count: 1, packageSize: 1, lineCostGrosze: 27093, unitPriceGrosze: 27093, store: source.store, url: source.url },
  ] }],
};

test('Pati exact Carina SLIM offer uses native SKU, image, price and one available piece', async () => {
  const result = await readRetailSource(source, replay().fetcher);
  assert.equal(result.ean, '5902115712524'); assert.equal(result.priceGrosze, 27093);
  assert.equal(result.stockPackages, 1); assert.equal(result.imageUrl, source.imageUrl);
  for (const patch of [{ sku: 'K98-0069' }, { id: 3066 }, { is_on_backorder: true }, { low_stock_remaining: 0 }, { prices: { ...fixture.product.prices, currency_code: 'EUR' } }])
    assert.throws(() => inspectPatiProduct({ ...fixture.product, ...patch }, source));
  assert.throws(() => inspectPatiProduct(fixture.product, { ...source, ean: '5907720651084' }));
});

test('Pati native postcode cart confirms prepaid courier25 and gross total295.93', async () => {
  const { fetcher, paths } = replay();
  const result = await createRetailerQuoter(fetcher)(basket, '00-001');
  assert.ok('quote' in result); assert.equal(result.quote.costGrosze, 2500);
  assert.equal(result.quote.destinationScope, 'postal_code'); assert.equal(result.quote.postalCode, '00-001');
  assert.equal(result.quote.payment, 'Przelew bankowy');
  assert.equal(paths.at(-1), '/wp-json/wc/store/v1/cart/select-shipping-rate');
  assert.ok(retailerDeliveryCapabilities().postcodeStores.includes(source.store));
  assert.ok(retailerDeliveryCapabilities().automaticStores.includes(source.store));
  const changed = await createRetailerQuoter(replay().fetcher)({ ...basket, materialsGrosze: 27092 }, '00-001');
  assert.deepEqual(changed, { reason: 'price_changed' });
  const noCourier = await createRetailerQuoter(replay((v, path) => { if (path.endsWith('update-customer')) v.shipping_rates[0].shipping_rates = v.shipping_rates[0].shipping_rates.filter((r: any) => r.method_id === 'local_pickup'); }).fetcher)(basket, '00-001');
  assert.deepEqual(noCourier, { reason: 'no_home_delivery' });
  const wrongPostcode = await createRetailerQuoter(replay((v, path) => { if (path.endsWith('select-shipping-rate')) v.shipping_rates[0].destination.postcode = '80-001'; }).fetcher)(basket, '00-001');
  assert.deepEqual(wrongPostcode, { reason: 'basket_not_confirmed' });
  const backorder = await createRetailerQuoter(replay((v, path) => { if (path.endsWith('add-item')) v.items[0].show_backorder_badge = true; }).fetcher)(basket, '00-001');
  assert.deepEqual(backorder, { reason: 'basket_not_confirmed' });
});

test('Pati one remaining piece cannot be quoted as two, and unsafe cart routes are blocked', async () => {
  const two = structuredClone(basket); two.materialsGrosze *= 2; two.lines[0].packages[0].count = 2; two.lines[0].packages[0].lineCostGrosze *= 2;
  const result = await createRetailerQuoter(replay().fetcher)(two, '00-001');
  assert.deepEqual(result, { reason: 'insufficient_stock' });
  const client = new AnonymousShop('https://patiartstudio.pl', async () => { throw Error('unexpected request'); }, AbortSignal.timeout(1000));
  for (const [path, body] of [
    ['/wp-json/wc/store/v1/checkout', {}],
    ['/wp-json/wc/store/v1/cart/update-customer', { shipping_address: { country: 'PL', postcode: '00-001', email: 'no@example.invalid' } }],
    ['/wp-json/wc/store/v1/cart/select-shipping-rate', { package_id: 0, rate_id: 'local_pickup:21' }],
    ['/wp-json/wc/store/v1/cart/select-shipping-rate', { package_id: 0, rate_id: 'flexible_shipping_single:8' }],
  ] as const) await assert.rejects(client.cartJson(path, body), /invalid_cart_route/);
});

test('Pati combines all three distinct Carina models into one postcode courier charge', async () => {
  const ids = [1550, 1549, 3065], prices = [17920, 26597, 27093];
  const sources = ids.map(id => RETAIL_SOURCES.find(s => s.store === 'Pati Art Studio' && s.productId === id)!);
  for (let i = 0; i < ids.length; i++) {
    const card = inspectPatiProduct(mixed.products[i], sources[i]);
    assert.equal(card.priceGrosze, prices[i]); assert.equal(card.imageUrl, sources[i].imageUrl);
  }
  assert.equal(inspectPatiProduct(mixed.products[0], sources[0]).stockPackages, 2);
  assert.equal(inspectPatiProduct(mixed.products[1], sources[1]).stockPackages, undefined);
  let added = 0;
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), path = url.pathname;
    assert.equal(url.origin, 'https://patiartstudio.pl');
    let value: any;
    if (path === '/wp-json/wc/store/v1/cart') value = mixed.empty;
    else if (path.startsWith('/wp-json/wc/store/v1/products/')) value = mixed.products[ids.indexOf(Number(path.split('/').at(-1)))];
    else if (path.endsWith('add-item')) {
      assert.deepEqual(JSON.parse(String(init?.body)), { id: ids[added], quantity: 1 });
      value = mixed.added[added++];
    } else if (path.endsWith('update-customer')) value = mixed.located;
    else if (path.endsWith('select-shipping-rate')) value = mixed.selected;
    else assert.fail('Unreviewed retailer route: ' + path);
    assert.ok(value); return Response.json(clone(value), { headers: { 'Cart-Token': 'isolated-pati-mixed-session' } });
  };
  const order: DeliveredStoreBasket = { ...basket, materialsGrosze: 71610,
    lines: sources.map((s, i) => ({ product: { id: s.ean, name: s.name, imageUrl: s.imageUrl! }, unit: 'szt', packages: [
      { offerId: s.id, count: 1, packageSize: 1, lineCostGrosze: prices[i], unitPriceGrosze: prices[i], store: s.store, url: s.url },
    ] })),
  };
  const result = await createRetailerQuoter(fetcher)(order, '00-001');
  assert.ok('quote' in result); assert.equal(result.quote.costGrosze, 2500); assert.equal(added, 3);
  assert.equal(prices.reduce((a, b) => a + b, 0) + result.quote.costGrosze, 74110);
});
