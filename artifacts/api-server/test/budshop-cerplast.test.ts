import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/budshop-cerplast.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { inspectBudshopProduct } from '../src/lib/budshop-woo';
import { readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter, retailerDeliveryCapabilities } from '../src/lib/retailer-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(s => s.id === 'budshop-atlas-cerplast-15kg')!;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
function replay(mutate?: (value: any, path: string) => void) {
  const paths: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), path = url.pathname;
    assert.equal(url.origin, 'https://budshop24.pl');
    const allowed: Record<string, keyof typeof fixture> = {
      '/wp-json/wc/store/v1/products/4808': 'product',
      '/wp-json/wc/store/v1/cart': 'empty',
      '/wp-json/wc/store/v1/cart/add-item': 'added',
      '/wp-json/wc/store/v1/cart/update-customer': 'located',
      '/wp-json/wc/store/v1/cart/select-shipping-rate': 'selected',
    };
    assert.ok(allowed[path], 'Only reviewed product and anonymous cart routes');
    if (path.endsWith('add-item')) assert.deepEqual(JSON.parse(String(init?.body)), { id: 4808, quantity: 1 });
    if (path.endsWith('update-customer')) assert.deepEqual(JSON.parse(String(init?.body)), { shipping_address: { country: 'PL', postcode: '00-001' } });
    if (path.endsWith('select-shipping-rate')) assert.deepEqual(JSON.parse(String(init?.body)), { package_id: 0, rate_id: 'wsds_simple_dimensional:3:medium_parcel_dhl' });
    paths.push(path);
    const value = clone(fixture[allowed[path]]);
    mutate?.(value, path);
    return Response.json(value, { headers: path.includes('/cart') ? { 'Cart-Token': 'isolated-budshop-test-session' } : {} });
  };
  return { fetcher, paths };
}
const basket: DeliveredStoreBasket = { store: source.store, materialsGrosze: 13900, deliveryGrosze: null,
  deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [{
    product: { id: source.ean, name: source.name, imageUrl: source.imageUrl! }, unit: 'kg', packages: [
      { offerId: source.id, count: 1, packageSize: 15, lineCostGrosze: 13900, unitPriceGrosze: 13900, store: source.store, url: source.url },
    ],
  }],
};

test('Budshop Cerplast card confirms exact variant, photo, price and stock', async () => {
  const result = await readRetailSource(source, replay().fetcher);
  assert.equal(result.ean, '5905400530032');
  assert.equal(result.priceGrosze, 13900);
  assert.equal(result.stockPackages, 1);
  assert.equal(result.imageUrl, source.imageUrl);
  for (const patch of [{ id: 4809 }, { sku: 'BS00214' }, { is_on_backorder: true },
    { low_stock_remaining: 0 }, { prices: { ...fixture.product.prices, currency_code: 'EUR' } },
    { images: [{ src: 'https://budshop24.pl/other.jpg' }] }])
    assert.throws(() => inspectBudshopProduct({ ...fixture.product, ...patch }, source));
  assert.throws(() => inspectBudshopProduct(fixture.product, { ...source, ean: '5905400530033' }));
});

test('Budshop anonymous basket quotes one DHL courier for postcode and gross total', async () => {
  const { fetcher, paths } = replay();
  const result = await createRetailerQuoter(fetcher)(basket, '00-001');
  assert.ok('quote' in result);
  assert.equal(result.quote.costGrosze, 1899);
  assert.equal(result.quote.destinationScope, 'postal_code');
  assert.equal(result.quote.postalCode, '00-001');
  assert.equal(basket.materialsGrosze + result.quote.costGrosze, 15799);
  assert.equal(paths.at(-1), '/wp-json/wc/store/v1/cart/select-shipping-rate');
  assert.ok(retailerDeliveryCapabilities().postcodeStores.includes(source.store));
  assert.ok(retailerDeliveryCapabilities().automaticStores.includes(source.store));
  assert.deepEqual(await createRetailerQuoter(replay().fetcher)({ ...basket, materialsGrosze: 13901 }, '00-001'), { reason: 'price_changed' });
  assert.deepEqual(await createRetailerQuoter(replay((v, path) => {
    if (path.endsWith('update-customer')) v.shipping_rates[0].shipping_rates = v.shipping_rates[0].shipping_rates.filter((r: any) => r.method_id !== 'wsds_simple_dimensional');
  }).fetcher)(basket, '00-001'), { reason: 'no_home_delivery' });
  assert.deepEqual(await createRetailerQuoter(replay((v, path) => {
    if (path.endsWith('select-shipping-rate')) v.shipping_rates[0].destination.postcode = '80-001';
  }).fetcher)(basket, '00-001'), { reason: 'basket_not_confirmed' });
  assert.deepEqual(await createRetailerQuoter(replay((v, path) => {
    if (path.endsWith('add-item')) v.items[0].totals.line_total = '13800';
  }).fetcher)(basket, '00-001'), { reason: 'price_changed' });
});

test('Budshop stock limit and anonymous route allowlist prevent unverified checkout', async () => {
  const two = structuredClone(basket); two.materialsGrosze *= 2; two.lines[0].packages[0].count = 2;
  two.lines[0].packages[0].lineCostGrosze *= 2;
  assert.deepEqual(await createRetailerQuoter(replay().fetcher)(two, '00-001'), { reason: 'insufficient_stock' });
  const client = new AnonymousShop('https://budshop24.pl', async () => { throw Error('unexpected request'); }, AbortSignal.timeout(1000));
  for (const [path, body] of [
    ['/wp-json/wc/store/v1/checkout', {}],
    ['/wp-json/wc/store/v1/cart/add-item', { id: 4809, quantity: 1 }],
    ['/wp-json/wc/store/v1/cart/update-customer', { shipping_address: { country: 'PL', postcode: '00-001', email: 'no@example.invalid' } }],
    ['/wp-json/wc/store/v1/cart/select-shipping-rate', { package_id: 0, rate_id: 'local_pickup:1' }],
  ] as const) await assert.rejects(client.cartJson(path, body), /invalid_cart_route/);
});
