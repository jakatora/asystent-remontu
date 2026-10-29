import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import mixed from './fixtures/budshop-two-products.json' with { type: 'json' };
import solo from './fixtures/budshop-woder-only.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { inspectBudshopProduct } from '../src/lib/budshop-woo';
import { readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import { createRemontService } from '../src/shared-backend';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(s => s.id === 'budshop-atlas-woder-duo-16kg')!;
const cerplast = RETAIL_SOURCES.find(s => s.id === 'budshop-atlas-cerplast-15kg')!;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
function replay(fixture: typeof mixed | typeof solo, mutate?: (value: any, path: string) => void) {
  let adds = 0;
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), path = url.pathname;
    assert.equal(url.origin, 'https://budshop24.pl');
    let value: any;
    if (path.endsWith('/products/4808')) value = fixture.products[0];
    else if (path.endsWith('/products/7381')) value = fixture.products[1];
    else if (path.endsWith('/cart/add-item')) {
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body, adds === 0 && fixture.one ? { id: 4808, quantity: 1 } : { id: 7381, quantity: 1 });
      value = adds++ === 0 && fixture.one ? fixture.one : fixture.two;
    } else if (path.endsWith('/cart/update-customer')) {
      assert.deepEqual(JSON.parse(String(init?.body)), { shipping_address: { country: 'PL', postcode: '00-001' } });
      value = fixture.located;
    } else if (path.endsWith('/cart/select-shipping-rate')) {
      const rateId = fixture.selected.shipping_rates[0].shipping_rates.find(r => r.selected)!.rate_id;
      assert.deepEqual(JSON.parse(String(init?.body)), { package_id: 0, rate_id: rateId });
      value = fixture.selected;
    } else if (path.endsWith('/cart')) value = { items: [], items_count: 0 };
    else assert.fail('Unreviewed route: ' + path);
    calls.push(path);
    value = clone(value);
    mutate?.(value, path);
    return Response.json(value, { headers: path.includes('/cart') ? { 'Cart-Token': 'isolated-budshop-wave101' } : {} });
  };
  return { fetcher, calls };
}
const line = (item: typeof source, price: number): DeliveredStoreBasket['lines'][number] => ({
  product: { id: item.ean, name: item.name, imageUrl: item.imageUrl! }, unit: 'kg', packages: [
    { offerId: item.id, count: 1, packageSize: item.packageSize, lineCostGrosze: price, unitPriceGrosze: price, store: item.store, url: item.url },
  ],
});
const basket = (lines: DeliveredStoreBasket['lines'], price: number): DeliveredStoreBasket => ({
  store: 'Budshop24', materialsGrosze: price, deliveryGrosze: null, deliveryMinimumGrosze: 0,
  totalGrosze: null, source: 'unknown', lines,
});

test('Woder Duo card ties the exact 16 kg Atlas variant, EAN and photo to the shop SKU', async () => {
  const result = await readRetailSource(source, replay(solo).fetcher);
  assert.equal(result.ean, '5905400195088');
  assert.equal(result.priceGrosze, 24900);
  assert.equal(result.stockPackages, 3);
  assert.equal(result.imageUrl, source.imageUrl);
  for (const patch of [{ sku: 'BS00294' }, { name: 'ATLAS WODER DUO 32kg' },
    { is_in_stock: false }, { images: [{ src: 'https://budshop24.pl/other.jpg' }] }])
    assert.throws(() => inspectBudshopProduct({ ...solo.products[1], ...patch }, source));
  assert.throws(() => inspectBudshopProduct(solo.products[1], { ...source, packageSize: 32 }));
});

test('Woder Duo alone has a native postcode DHL quote and a confirmed gross total', async () => {
  const order = basket([line(source, 24900)], 24900);
  const result = await createRetailerQuoter(replay(solo).fetcher)(order, '00-001');
  assert.ok('quote' in result);
  assert.equal(result.quote.costGrosze, 2499);
  assert.equal(result.quote.destinationScope, 'postal_code');
  assert.equal(order.materialsGrosze + result.quote.costGrosze, 27399);
});

test('Cerplast and Woder Duo share one postcode shipping quote for the entire basket', async () => {
  const order = basket([line(cerplast, 13900), line(source, 24900)], 38800);
  const { fetcher, calls } = replay(mixed);
  const result = await createRetailerQuoter(fetcher)(order, '00-001');
  assert.ok('quote' in result);
  assert.equal(result.quote.costGrosze, 4398);
  assert.equal(result.quote.carrier, 'Paczki/Worki: Średnia Paczka + Duża Paczka');
  assert.equal(result.quote.postalCode, '00-001');
  assert.equal(order.materialsGrosze + result.quote.costGrosze, 43198);
  assert.equal(calls.filter(path => path.endsWith('/cart/update-customer')).length, 1);
  assert.deepEqual(await createRetailerQuoter(replay(mixed).fetcher)({ ...order, materialsGrosze: 38799 }, '00-001'), { reason: 'price_changed' });
  assert.deepEqual(await createRetailerQuoter(replay(mixed, (v, path) => {
    if (path.endsWith('/cart/update-customer')) v.totals.total_shipping = '0';
  }).fetcher)(order, '00-001'), { reason: 'basket_not_confirmed' });
  assert.deepEqual(await createRetailerQuoter(replay(mixed, (v, path) => {
    if (path.endsWith('/cart/select-shipping-rate')) v.totals.total_price = '43000';
  }).fetcher)(order, '00-001'), { reason: 'basket_not_confirmed' });
});

test('Budshop route restriction still blocks unreviewed products and checkout', async () => {
  const client = new AnonymousShop('https://budshop24.pl', async () => { throw Error('unexpected request'); }, AbortSignal.timeout(1000));
  for (const [path, body] of [
    ['/wp-json/wc/store/v1/cart/add-item', { id: 6419, quantity: 1 }],
    ['/wp-json/wc/store/v1/cart/select-shipping-rate', { package_id: 0, rate_id: 'local_pickup:1' }],
    ['/wp-json/wc/store/v1/checkout', {}],
  ] as const) await assert.rejects(client.cartJson(path, body), /invalid_cart_route/);
});

test('project HTTP combines two renovation jobs into one Budshop order with one postcode delivery', async () => {
  const observations = [await readRetailSource(cerplast, replay(mixed).fetcher),
    await readRetailSource(source, replay(solo).fetcher)];
  const service = createRemontService({ initialObservations: observations, background: false,
    basketQuoter: createRetailerQuoter(replay(mixed).fetcher) });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${(server.address() as { port: number }).port}/pricing/project`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        jobs: [cerplast, source].map((item, index) => ({ jobId: 'room-' + index,
          materials: [{ material: { id: item.id, name: item.name, ean: item.ean, category: item.category, unit: 'kg' }, quantity: item.packageSize }] })),
        options: { store: 'Budshop24', delivery: { mode: 'shipping', postalCode: '00-001' } },
      }),
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.deliveryComparison.status, 'compared');
    assert.equal(result.deliveryComparison.missingProductCount, 0);
    assert.equal(result.deliveryComparison.best.materialsGrosze, 38800);
    assert.equal(result.deliveryComparison.best.deliveryGrosze, 4398);
    assert.equal(result.deliveryComparison.best.totalGrosze, 43198);
    assert.equal(result.deliveryComparison.best.stores.length, 1);
  } finally {
    service.close();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
