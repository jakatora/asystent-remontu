import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/kowalczyk-cerplast.json' with { type: 'json' };
import previousFixture from './fixtures/kowalczyk-magento.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource } from '../src/lib/retail-pages';
import { inspectKowalczykCard, quoteKowalczyk } from '../src/lib/kowalczyk-magento';
import { createRemontService } from '../src/shared-backend';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';
import express from 'express';

const ids = ['kowalczyk-atlas-cerplast-15kg', 'kowalczyk-koelner-ws3595-1000', 'kowalczyk-koelner-fx06k040-200'];
const sources = ids.map(id => {
  const source = RETAIL_SOURCES.find(row => row.id === id);
  assert.ok(source);
  return source;
});
const prices = [14097, 4333, 2187];
type RecordRow = (typeof fixture.records)[number];

function replay(context: string, mutate?: (response: any, record: RecordRow) => any, captured: readonly RecordRow[] = fixture.records) {
  const records = captured.filter(row => row.context === context);
  let cursor = 0;
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const record = records[cursor++];
    assert.ok(record, 'Every request needs a captured retailer response');
    assert.equal(url.origin, record.origin);
    assert.equal(url.pathname + url.search, record.path);
    assert.equal(init?.method ?? 'GET', record.method);
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    assert.deepEqual(body, record.body);
    const headers = new Headers(init?.headers);
    assert.equal(headers.has('authorization'), false);
    assert.ok(!headers.get('cookie'));
    const response = mutate ? mutate(structuredClone(record.response), record) : structuredClone(record.response);
    return typeof response === 'string' && !record.path.startsWith('/rest/')
      ? new Response(response, { status: record.status })
      : Response.json(response, { status: record.status });
  };
  return { fetcher, assertComplete: () => assert.equal(cursor, records.length) };
}

function basket(): DeliveredStoreBasket {
  return {
    store: 'E-Kowalczyk', materialsGrosze: prices.reduce((sum, price) => sum + price, 0),
    deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown',
    lines: sources.map((source, index) => ({
      product: { id: 'remont-' + source.ean, name: source.name, imageUrl: source.imageUrl },
      unit: source.unit,
      packages: [{ offerId: source.id, store: source.store, url: source.url, packageSize: source.packageSize, count: 1, unitPriceGrosze: prices[index], lineCostGrosze: prices[index] }],
    })),
  };
}

test('Cerplast 15 kg is the exact reviewed EAN, gross price and retailer photograph', async () => {
  const server = replay('read:cerplast');
  const observation = await readRetailSource(sources[0], server.fetcher);
  server.assertComplete();
  assert.equal(observation.ean, '5905400530032');
  assert.equal(observation.priceGrosze, fixture.priceGrosze);
  assert.equal(observation.currency, 'PLN');
  assert.ok(observation.imageUrl?.includes('/5/9/5905400530032.png'));
  assert.equal(sources[0].packageSize, 15);
  assert.equal(sources[0].unit, 'kg');
  assert.ok(!JSON.stringify(observation).includes('a'.repeat(32)));
});

test('project HTTP ranks the three-product Cerplast and fixings basket with one native delivery charge', async () => {
  const observations = [
    await readRetailSource(sources[0], replay('read:cerplast').fetcher),
    await readRetailSource(sources[1], replay('read:kowalczyk-koelner-ws3595-1000', undefined, previousFixture.records).fetcher),
    await readRetailSource(sources[2], replay('read:kowalczyk-koelner-fx06k040-200', undefined, previousFixture.records).fetcher),
  ];
  let quoted = 0;
  const service = createRemontService({ initialObservations: observations, background: false, basketQuoter: async (order, postcode) => {
    quoted++;
    const server = replay('quote:cerplast-three');
    const result = await quoteKowalczyk(order, postcode, server.fetcher);
    server.assertComplete();
    return result;
  } });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const port = (server.address() as { port: number }).port;
    const response = await fetch(`http://127.0.0.1:${port}/pricing/project`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jobs: [{ jobId: 'whole-renovation', materials: sources.map(source => ({ material: { id: source.id, name: source.name, ean: source.ean, category: source.category, unit: source.unit }, quantity: source.packageSize })) }],
        options: { delivery: { mode: 'shipping', postalCode: '00-001' } },
      }),
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.deliveryComparison.missingProductCount, 0);
    assert.equal(result.deliveryComparison.best?.materialsGrosze, 20617);
    assert.equal(result.deliveryComparison.best?.deliveryGrosze, 1699);
    assert.equal(result.deliveryComparison.best?.totalGrosze, 22316);
    assert.equal(result.deliveryComparison.best?.stores?.length, 1);
    assert.equal(result.deliveryComparison.best?.stores?.[0]?.store, 'E-Kowalczyk');
    assert.equal(quoted, 1);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    service.close();
  }
});

test('the native guest cart quotes all three exact products and gross courier delivery for the posted postcode', async () => {
  const server = replay('quote:cerplast-three');
  const result = await quoteKowalczyk(basket(), '00-001', server.fetcher);
  server.assertComplete();
  assert.ok('quote' in result);
  assert.equal(basket().materialsGrosze, 20617);
  assert.equal(result.quote.costGrosze, fixture.deliveryGrosze);
  assert.equal(basket().materialsGrosze + result.quote.costGrosze, 22316);
  assert.equal(result.quote.postalCode, '00-001');
  assert.equal(result.quote.destinationScope, 'postal_code');
  assert.equal(result.quote.basis, 'retailer_basket_postcode');
  assert.ok(!JSON.stringify(result).includes('a'.repeat(32)));
  assert.ok(fixture.records.every(row => !row.path.includes('/order') && !row.path.includes('/payment-information')));
});

test('Cerplast identity, full-cart price and destination changes invalidate the quote', async () => {
  const card = fixture.records.find(row => row.context === 'read:cerplast' && row.path === new URL(sources[0].url).pathname)?.response;
  assert.equal(typeof card, 'string');
  assert.equal(inspectKowalczykCard(card as string, sources[0]).priceGrosze, 14097);
  for (const patch of [{ ean: '5905400530033' }, { packageSize: 1 }, { unit: 'szt' }, { brand: 'Other' }, { category: 'paint' }, { productId: 33739 }]) {
    assert.throws(() => inspectKowalczykCard(card as string, { ...sources[0], ...patch }));
  }
  const changedBasket = basket();
  changedBasket.lines[0].packages[0].count = 2;
  await assert.rejects(quoteKowalczyk(changedBasket, '00-001', replay('quote:cerplast-three').fetcher), /invalid_basket/);
  const changedPrice = replay('quote:cerplast-three', (value, row) => {
    if (row.path.endsWith('/totals') && row.context === 'quote:cerplast-three') value.items[0].price_incl_tax -= 0.01;
    return value;
  });
  await assert.rejects(quoteKowalczyk(basket(), '00-001', changedPrice.fetcher));
  const missingCourier = replay('quote:cerplast-three', (value, row) => row.path.endsWith('/estimate-shipping-methods') ? value.filter((method: any) => method.carrier_code !== 'inpostcourier') : value);
  await assert.rejects(quoteKowalczyk(basket(), '00-001', missingCourier.fetcher), /no_home_delivery/);
  await assert.rejects(quoteKowalczyk(basket(), '00001', replay('quote:cerplast-three').fetcher), /invalid_basket/);
});
