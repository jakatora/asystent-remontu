import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import evidence from './fixtures/budshop-mapegum-wave103.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { inspectBudshopProduct } from '../src/lib/budshop-woo';
import { readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import { createRemontService } from '../src/shared-backend';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const sources = [4808, 7381, 6484, 6240].map(id => RETAIL_SOURCES.find(s => s.productId === id && s.store === 'Budshop24')!);
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
type CaseName = keyof typeof evidence.cases;
function replay(name: CaseName, mutate?: (value: any, path: string) => void) {
  const fixture = evidence.cases[name];
  let adds = 0;
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), path = url.pathname;
    assert.equal(url.origin, 'https://budshop24.pl');
    let value: any;
    if (path.includes('/products/')) value = (evidence.products as Record<string, unknown>)[path.split('/').at(-1)!];
    else if (path.endsWith('/cart/add-item')) {
      const step = fixture.steps[adds++];
      assert.ok(step, 'No more reviewed add-item steps');
      assert.deepEqual(JSON.parse(String(init?.body)), { id: step.id, quantity: 'count' in step ? step.count : 1 });
      value = step.cart;
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
    return Response.json(value, { headers: path.includes('/cart') ? { 'Cart-Token': 'isolated-budshop-wave103' } : {} });
  };
  return { fetcher, calls };
}
function line(id: number, price: number, count = 1): DeliveredStoreBasket['lines'][number] {
  const source = sources.find(s => s.productId === id)!;
  return { product: { id: source.ean, name: source.name, imageUrl: source.imageUrl! }, unit: 'kg', packages: [
    { offerId: source.id, count, packageSize: source.packageSize, lineCostGrosze: price * count,
      unitPriceGrosze: price, store: source.store, url: source.url },
  ] };
}
function basket(lines: DeliveredStoreBasket['lines']): DeliveredStoreBasket {
  return { store: 'Budshop24', materialsGrosze: lines.reduce((sum, entry) => sum + entry.packages[0].lineCostGrosze, 0),
    deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines };
}

test('Mapegum card confirms the exact 10 kg Mapei SKU, EAN, gross price, stock and image', async () => {
  const source = sources[3];
  const result = await readRetailSource(source, replay('solo').fetcher);
  assert.equal(result.ean, '8022452002120');
  assert.equal(result.priceGrosze, 24899);
  assert.equal(result.stockPackages, 3);
  assert.equal(result.imageUrl, source.imageUrl);
  const product = evidence.products['6240'];
  for (const patch of [{ sku: 'BS02038' }, { name: 'MAPEGUM WPS 5kg' },
    { is_in_stock: false }, { images: [{ src: 'https://budshop24.pl/other.jpg' }] }])
    assert.throws(() => inspectBudshopProduct({ ...product, ...patch }, source));
  assert.throws(() => inspectBudshopProduct(product, { ...source, brand: 'Atlas' }));
});

test('Mapegum native home delivery covers solo, mixed and four-product renovation baskets', async () => {
  const scenarios: [CaseName, DeliveredStoreBasket, number, number][] = [
    ['solo', basket([line(6240, 24899)]), 1899, 26798],
    ['cerplast', basket([line(4808, 13900), line(6240, 24899)]), 3798, 42597],
    ['duo', basket([line(7381, 24900), line(6240, 24899)]), 4398, 54197],
    ['woder_e', basket([line(6484, 32500), line(6240, 24899)]), 4398, 61797],
    ['all', basket([line(4808, 13900), line(7381, 24900), line(6484, 32500), line(6240, 24899)]), 8796, 104995],
    ['two', basket([line(6240, 24899, 2)]), 3798, 53596],
  ];
  for (const [name, order, delivery, total] of scenarios) {
    const { fetcher, calls } = replay(name);
    const result = await createRetailerQuoter(fetcher)(order, '00-001');
    assert.ok('quote' in result, `${name}: ${JSON.stringify(result)}`);
    assert.equal(result.quote.costGrosze, delivery, name);
    assert.equal(result.quote.postalCode, '00-001');
    assert.equal(result.quote.basis, 'retailer_basket_postcode');
    assert.equal(order.materialsGrosze + result.quote.costGrosze, total, name);
    assert.equal(calls.filter(path => path.endsWith('/cart/update-customer')).length, 1, name);
    assert.equal(calls.filter(path => path.endsWith('/cart/select-shipping-rate')).length, 1, name);
  }
});

test('Mapegum refuses stale price, changed final total, parcel locker and checkout', async () => {
  const order = basket([line(6240, 24899, 2)]);
  assert.deepEqual(await createRetailerQuoter(replay('two').fetcher)({ ...order, materialsGrosze: 49797 }, '00-001'), { reason: 'price_changed' });
  assert.deepEqual(await createRetailerQuoter(replay('two', (v, path) => {
    if (path.endsWith('/cart/select-shipping-rate')) v.totals.total_price = '53595';
  }).fetcher)(order, '00-001'), { reason: 'basket_not_confirmed' });
  assert.deepEqual(await createRetailerQuoter(replay('two', (v, path) => {
    if (path.endsWith('/cart/update-customer')) v.shipping_rates[0].shipping_rates[0].rate_id = 'easypack_parcel_machines:4';
  }).fetcher)(order, '00-001'), { reason: 'no_home_delivery' });
  const client = new AnonymousShop('https://budshop24.pl', async () => { throw Error('unexpected request'); }, AbortSignal.timeout(1000));
  for (const [path, body] of [
    ['/wp-json/wc/store/v1/cart/add-item', { id: 13665, quantity: 1 }],
    ['/wp-json/wc/store/v1/cart/select-shipping-rate', { package_id: 0, rate_id: 'easypack_parcel_machines:4' }],
    ['/wp-json/wc/store/v1/checkout', {}],
  ] as const) await assert.rejects(client.cartJson(path, body), /invalid_cart_route/);
});

test('project HTTP joins four renovation jobs into a single Budshop delivery quote', async () => {
  const observations = await Promise.all(sources.map((source, index) =>
    readRetailSource(source, replay(index === 0 ? 'cerplast' : index === 1 ? 'duo' : index === 2 ? 'woder_e' : 'solo').fetcher)));
  const service = createRemontService({ initialObservations: observations, background: false,
    basketQuoter: createRetailerQuoter(replay('all').fetcher) });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${(server.address() as { port: number }).port}/pricing/project`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        jobs: sources.map((source, index) => ({ jobId: 'room-' + index,
          materials: [{ material: { id: source.id, name: source.name, ean: source.ean, category: source.category, unit: 'kg' }, quantity: source.packageSize }] })),
        options: { store: 'Budshop24', delivery: { mode: 'shipping', postalCode: '00-001' } },
      }),
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.deliveryComparison.status, 'compared');
    assert.equal(result.deliveryComparison.missingProductCount, 0);
    assert.equal(result.deliveryComparison.best.materialsGrosze, 96199);
    assert.equal(result.deliveryComparison.best.deliveryGrosze, 8796);
    assert.equal(result.deliveryComparison.best.totalGrosze, 104995);
    assert.equal(result.deliveryComparison.best.stores.length, 1);
  } finally {
    service.close();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
