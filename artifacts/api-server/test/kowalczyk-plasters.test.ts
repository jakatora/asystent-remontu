import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import fixture from './fixtures/kowalczyk-plasters.json' with { type: 'json' };
import { KOWALCZYK_PLASTER_SOURCES as sources } from '../src/lib/kowalczyk-plasters';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { inspectKowalczykCard, quoteKowalczyk } from '../src/lib/kowalczyk-magento';
import { readRetailSource } from '../src/lib/retail-pages';
import { createRemontService } from '../src/shared-backend';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

type RecordRow = (typeof fixture.records)[number];
const prices = fixture.pricesGrosze;

function replay(context: string, mutate?: (response: any, record: RecordRow) => any) {
  const records = fixture.records.filter(row => row.context === context);
  assert.ok(records.length, 'A replay must have actual captured responses');
  let cursor = 0;
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), record = records[cursor++];
    assert.ok(record, 'Every request must match a captured response');
    assert.equal(url.origin, record.origin);
    assert.equal(url.pathname + url.search, record.path);
    assert.equal(init?.method ?? 'GET', record.method);
    assert.deepEqual(init?.body ? JSON.parse(String(init.body)) : null, record.body);
    assert.equal(new Headers(init?.headers).has('authorization'), false);
    assert.ok(!new Headers(init?.headers).get('cookie'));
    const value = structuredClone(record.response);
    const response = mutate ? mutate(value, record) : value;
    return !record.path.startsWith('/rest/')
      ? new Response(String(response), { status: record.status })
      : Response.json(response, { status: record.status });
  };
  return { fetcher, complete: () => assert.equal(cursor, records.length) };
}

function basket(counts = [1, 1, 1]): DeliveredStoreBasket {
  return {
    store: 'E-Kowalczyk', materialsGrosze: counts.reduce((sum, n, i) => sum + n * prices[i], 0),
    deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown',
    lines: sources.flatMap((source, i) => counts[i] ? [{
      product: { id: 'remont-' + source.ean, name: source.name, imageUrl: source.imageUrl },
      unit: source.unit,
      packages: [{ offerId: source.id, store: source.store, url: source.url, packageSize: source.packageSize,
        count: counts[i], unitPriceGrosze: prices[i], lineCostGrosze: counts[i] * prices[i] }],
    }] : []),
  };
}

test('small plaster bags and Betokontakt have exact factory identities, sealed packs, native gross prices and photographs', async () => {
  assert.deepEqual(sources.map(s => [s.ean, s.packageSize, s.unit]), [
    ['5901793354729', 5, 'kg'], ['5901793351162', 10, 'kg'], ['4006379051014', 5, 'kg'],
  ]);
  for (const [i, source] of sources.entries()) {
    assert.deepEqual(RETAIL_SOURCES.find(s => s.id === source.id), source);
    const server = replay('read:' + source.id), observation = await readRetailSource(source, server.fetcher);
    server.complete();
    assert.equal(observation.priceGrosze, prices[i]);
    assert.equal(observation.ean, source.ean);
    assert.equal(observation.currency, 'PLN');
    assert.equal(observation.availability, 'in_stock');
    assert.equal(observation.imageUrl, source.imageUrl);
    assert.ok(!JSON.stringify(observation).includes('a'.repeat(32)));
  }
});

test('native quotes preserve exact bag counts, shared primer and postcode without multiplying delivery by products', async () => {
  for (const [context, counts, postcode, gross] of [
    ['small5', [1, 0, 0], '30-001', 3034],
    ['two10', [0, 2, 0], '00-001', 6009],
    ['full3', [1, 1, 1], '30-001', 11777],
    ['plaster-primer', [0, 2, 1], '30-001', 12597],
    // The actual cart accepted three small bags; a displayed stock count is not a quantity limit.
    ['stock', [3, 0, 0], '30-001', 5704],
  ] as const) {
    const server = replay('quote:' + context), order = basket([...counts]);
    const result = await quoteKowalczyk(order, postcode, server.fetcher);
    server.complete(); assert.ok('quote' in result);
    assert.equal(result.quote.costGrosze, 1699);
    assert.equal(order.materialsGrosze + result.quote.costGrosze, gross);
    assert.equal(result.quote.postalCode, postcode);
    assert.equal(result.quote.destinationScope, 'postal_code');
    assert.equal(result.quote.basis, 'retailer_basket_postcode');
    assert.equal(Date.parse(result.quote.expiresAt) - Date.parse(result.quote.checkedAt), 600000);
  }
});

test('a heavier actual cart with only pickup and transport valuation has no confirmed home delivery', async () => {
  const server = replay('quote:heavy');
  await assert.rejects(quoteKowalczyk(basket([0, 3, 1]), '30-001', server.fetcher), /no_home_delivery/);
  server.complete();
  const methods = fixture.records.find(r => r.context === 'quote:heavy' && r.path.endsWith('/estimate-shipping-methods'))!.response;
  assert.ok(Array.isArray(methods));
  assert.ok(methods.some((r: any) => r.carrier_code === 'kurier' && r.price_incl_tax === 0));
});

test('each reviewed bag rejects changed barcode, size, brand, category, native product identity and photo', () => {
  for (const source of sources) {
    const html = fixture.records.find(r => r.context === 'read:' + source.id && !r.path.startsWith('/rest/'))!.response;
    assert.equal(typeof html, 'string');
    for (const patch of [{ ean: '5901793354728' }, { retailerSku: 'other' }, { packageSize: 1 },
      { unit: 'szt' }, { brand: 'Other' }, { category: 'paint' }, { productId: source.productId! + 1 },
      { url: source.url + '?other=1' }, { name: source.name + ' other' }]) {
      assert.throws(() => inspectKowalczykCard(html as string, { ...source, ...patch }));
    }
    assert.throws(() => inspectKowalczykCard((html as string).replaceAll(source.ean!, '0000000000000'), source));
    assert.throws(() => inspectKowalczykCard((html as string).replaceAll('catalog', 'other'), source));
  }
});

test('changed gross price, partial quantities, discounts, fees and final shipping invalidate the basket', async () => {
  const mutations: Array<(value: any, row: RecordRow) => any> = [
    (v, r) => { if (r.path.endsWith('/items') && r.method === 'POST') v.qty = 0; return v; },
    (v, r) => { if (r.path.endsWith('/totals')) v.items[0].price_incl_tax += 0.01; return v; },
    (v, r) => { if (r.path.endsWith('/totals')) v.coupon_code = 'PERSONAL'; return v; },
    (v, r) => { if (r.path.endsWith('/totals-information')) v.grand_total += 0.01; return v; },
    (v, r) => { if (r.path.endsWith('/totals-information')) v.total_segments.push({ code: 'fee', value: 1 }); return v; },
    (v, r) => { if (r.path.endsWith('/totals-information')) v.total_segments.find((s: any) => s.code === 'shipping').title = 'Wycena'; return v; },
    (v, r) => r.path.endsWith('/estimate-shipping-methods') ? v.filter((s: any) => s.carrier_code !== 'inpostcourier') : v,
    (v, r) => r.path.endsWith('/payment-methods') ? v.filter((s: any) => s.code !== 'checkmo') : v,
  ];
  for (const mutate of mutations) await assert.rejects(quoteKowalczyk(basket(), '30-001', replay('quote:full3', mutate).fetcher));
});

test('unreviewed pack changes and malformed destinations are rejected before merchant HTTP', async () => {
  let calls = 0;
  const forbidden: typeof fetch = async () => { calls++; throw Error('unexpected_http'); };
  await assert.rejects(quoteKowalczyk(basket(), '30001', forbidden), /invalid_basket/);
  for (const patch of [{ packageSize: 25 }, { url: 'https://example.com/' }, { count: 2 }, { offerId: 'unreviewed' }]) {
    const order = basket(); Object.assign(order.lines[0].packages[0], patch);
    await assert.rejects(quoteKowalczyk(order, '30-001', forbidden), /invalid_basket/);
  }
  assert.equal(calls, 0);
  assert.ok(fixture.records.every(r => !/\/(?:order|shipping-information|payment-information)(?:\/|$)/.test(r.path)));
});

test('project HTTP aggregates the three actual products and one postcode-specific native delivery', async () => {
  const observations = await Promise.all(sources.map(s => readRetailSource(s, replay('read:' + s.id).fetcher)));
  let calls = 0;
  const service = createRemontService({ initialObservations: observations, background: false,
    basketQuoter: async (order, postcode) => {
      calls++; const server = replay('quote:full3');
      const result = await quoteKowalczyk(order, postcode, server.fetcher); server.complete(); return result;
    },
  });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const port = (server.address() as { port: number }).port;
    const response = await fetch(`http://127.0.0.1:${port}/pricing/project`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jobs: [{ jobId: 'whole-renovation', materials: sources.map(s => ({
        material: { id: s.id, name: s.name, ean: s.ean, category: s.category, unit: s.unit }, quantity: s.packageSize,
      })) }], options: { delivery: { mode: 'shipping', postalCode: '30-001' } } }),
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.deliveryComparison.missingProductCount, 0);
    assert.equal(result.deliveryComparison.best?.materialsGrosze, 10078);
    assert.equal(result.deliveryComparison.best?.deliveryGrosze, 1699);
    assert.equal(result.deliveryComparison.best?.totalGrosze, 11777);
    assert.equal(result.deliveryComparison.best?.stores?.length, 1);
    assert.equal(result.deliveryComparison.best?.stores?.[0]?.store, 'E-Kowalczyk');
    assert.equal(calls, 1);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve())); service.close();
  }
});
