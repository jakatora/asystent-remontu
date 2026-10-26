import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import fixture from './fixtures/conpar.json' with { type: 'json' };
import { folnetPaid } from './fixtures/folnet';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { inspectFolnetProduct } from '../src/lib/folnet-product';
import { quoteFolnet } from '../src/lib/folnet-delivery';
import { createRemontService } from '../src/shared-backend';
import { applyFoilChoices, FOIL_PRODUCTS } from '../../mobile/features/pricing/foilChoice';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(row => row.id === 'folnet-conpar-100m2')!;
const observe = () => parseRetailPage(fixture.html, source, new Date());
const order = (count = 1): DeliveredStoreBasket => ({ store: 'Folnet', materialsGrosze: count * 11950, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [{ product: { id: 'remont-' + source.ean, name: source.name, imageUrl: null }, unit: 'm2', packages: [{ offerId: source.id, store: 'Folnet', url: source.url, packageSize: 100, count, unitPriceGrosze: 11950, lineCostGrosze: count * 11950 }] }] });

test('native Folnet data identifies a whole Conpar roll, barcode, tolerances, gross amount and stock measured in rolls', () => {
  const result = observe(); assert.equal(result.ean, '5902096430103'); assert.equal(result.priceGrosze, 11950);
  assert.equal(result.stockPackages, 124); assert.equal(source.packageSize, 100); assert.equal(source.unit, 'm2');
  assert.equal(inspectFolnetProduct(fixture.html, source).stock, 124);
});

test('a changed Conpar barcode, area, thickness, unit or net/conditional price cannot be priced as the reviewed 100m² roll', () => {
  for (const [from, to] of [
    ['"code_producer":"5902096430103"', '"code_producer":"5059340141428"'], ['"code_extern":"12-021"', '"code_extern":"12-022"'],
    ['"unit":"rolka"', '"unit":"m2"'], ['"unit_sellby":"1"', '"unit_sellby":"100"'], ['"unit_precision":"0"', '"unit_precision":"2"'],
    ['2 m x 50 m', '2 m x 25 m'], ['0,2 mm ± 30%', '0,2 mm ± 50%'],
    ['"sum":"124"', '"sum":"0"'], ['"value":"119.50"', '"value":"97.15"'], ['"rebate_code_active":"n"', '"rebate_code_active":"y"'],
  ]) { assert.ok(fixture.html.includes(from), from); assert.throws(() => parseRetailPage(fixture.html.replace(from, to), source, new Date()), from); }
  for (const change of [{ packageSize: 20 }, { unit: 'mb' }, { productId: 8372 }, { id: 'unreviewed' }]) assert.throws(() => inspectFolnetProduct(fixture.html, { ...source, ...change }));
});

test('the delivery adapter sends native roll counts, rejects over-stock demand and never uses the page shipping banner as a quote', async () => {
  let requests = 0;
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = new URL(String(input)); assert.equal(url.origin, 'https://folnet.pl');
    if (url.pathname === new URL(source.url).pathname) return new Response(fixture.html, { headers: { 'content-type': 'text/html' } });
    requests++; assert.equal(url.pathname, '/ajax/get-deliveries.php'); assert.equal(init?.method, 'POST');
    assert.equal(url.searchParams.get('products[10288][uniw][quantity]'), '2');
    assert.equal(url.searchParams.has('products[10288][uniw][quantity]'), true);
    // Recorded carrier response exercises parsing; this fixture does not prove
    // today's Conpar transport tariff. A separate live quote is required.
    return new Response(JSON.stringify(folnetPaid), { headers: { 'content-type': 'application/json' } });
  };
  const result = await quoteFolnet(order(2), fetchImpl); assert.ok(result.quote); assert.equal(requests, 1);
  await assert.rejects(quoteFolnet(order(125), fetchImpl), /product_unavailable/); assert.equal(requests, 1);
  await assert.rejects(quoteFolnet(order(), async input => new URL(String(input)).pathname === new URL(source.url).pathname
    ? new Response(fixture.html, { headers: { 'content-type': 'text/html' } })
    : new Response(JSON.stringify({ prepaid: [], dvp: [] }), { headers: { 'content-type': 'application/json' } })), /no_home_delivery/);
});

test('real HTTP consolidates an explicit foil choice once, respects roll stock and leaves unconfirmed transport unresolved', async () => {
  let quotes = 0;
  const service = createRemontService({ initialObservations: [observe()], background: false, basketQuoter: async () => { quotes++; return { reason: 'retailer_timeout' }; } });
  const api = express(); api.use(express.json()); api.use(service.router); const server = api.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  const diall = FOIL_PRODUCTS.find(ref => ref.id.includes('diall'))!, conpar = FOIL_PRODUCTS.find(ref => ref.id.includes('conpar'))!;
  const original = [10.5, 14.5].map((quantity, i) => ({ jobId: 'room-' + i, materials: [{ material: { id: 'foil', name: diall.productLabel, category: 'vapor-barrier', unit: 'm2', ean: '5059340141428' }, quantity }] }));
  const request = async (jobs: unknown, mode = 'shipping') => { const response = await fetch('http://127.0.0.1:' + (server.address() as { port: number }).port + '/pricing/project', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs, options: { delivery: { mode, postalCode: '00-001' } } }) }); assert.equal(response.status, 200); return response.json(); };
  try {
    const before = await request(original); assert.equal(before.stages[0].lines[0].resolved, false);
    const chosen = applyFoilChoices(original, [{ from: diall.id, to: conpar.id }]);
    const result = await request(chosen); assert.equal(result.consolidated.lines[0].totalQuantity, 25);
    assert.equal(result.consolidated.lines[0].packages[0].count, 1); assert.equal(result.consolidated.lines[0].packageSize, 100);
    assert.equal(result.consolidated.consolidatedTotalGrosze, 11950); assert.equal(result.deliveryComparison.best, null);
    assert.ok(quotes > 0, 'the real HTTP path must invoke the supplied transport adapter');
    const pickup = await request(chosen, 'pickup'); assert.equal(pickup.deliveryComparison.best.totalGrosze, 11950);
    const huge = await request([{ jobId: 'large', materials: [{ ...chosen[0].materials[0], quantity: 12500 }] }]);
    assert.equal(huge.deliveryComparison.best, null);
  } finally { service.close(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
