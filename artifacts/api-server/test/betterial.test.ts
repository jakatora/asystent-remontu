import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { betterialPage } from './fixtures/betterial';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage, readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';

const source = RETAIL_SOURCES.find(source => source.id === 'betterial-atlas-stopter-k20-25kg')!;
const now = new Date('2026-10-25T22:30:00Z');
const read = (page = betterialPage) => parseRetailPage(page, source, now);

test('Betterial binds the gross pack price to the selected 25 kg barcode and native order lot', () => {
  const observation = read();
  assert.equal(observation.priceGrosze, 5255);
  assert.equal(observation.ean, '5905400160253');
  assert.equal(observation.validUntil, '2026-11-09');
  assert.match(observation.imageUrl!, /52078-product_main_2x/);
  assert.equal(source.packageSize, 25);
  assert.equal(source.purchaseMultiple, 42);
});

test('Betterial never accepts a different combination, barcode, SKU, package or unit conversion', () => {
  for (const [before, after] of [
    ['&quot;ean13&quot;:&quot;5905400160253&quot;', '&quot;ean13&quot;:&quot;5905400160254&quot;'],
    ['&quot;reference&quot;:&quot;8679-86310&quot;', '&quot;reference&quot;:&quot;other&quot;'],
    ['&quot;id_product_attribute&quot;:3816', '&quot;id_product_attribute&quot;:3817'],
    ['&quot;unit_price_ratio&quot;:1', '&quot;unit_price_ratio&quot;:25'],
    ['&quot;name&quot;:&quot;25 kg&quot;', '&quot;name&quot;:&quot;20 kg&quot;'],
  ]) {
    assert.ok(betterialPage.includes(before), before);
    assert.throws(() => read(betterialPage.replace(before, after)));
  }
});

test('Betterial changed lot size, missing stock and conflicting gross prices invalidate the offer', () => {
  for (const [before, after, reason] of [
    ['data-xplo-order-multiple="42"', 'data-xplo-order-multiple="1"', /purchase_rules_changed/],
    ['&quot;minimal_quantity&quot;:42', '&quot;minimal_quantity&quot;:1', /purchase_rules_changed/],
    ['&quot;availability&quot;:&quot;in_stock&quot;', '&quot;availability&quot;:&quot;out_of_stock&quot;', /retailer_out_of_stock/],
    ['"price":"52.55"', '"price":"42.72"', /gross_price_mismatch/],
    ['Brutto', 'Netto', /gross_price_not_confirmed/],
  ] as const) {
    assert.ok(betterialPage.includes(before), before);
    assert.throws(() => read(betterialPage.replace(before, after)), reason);
  }
});

test('Betterial reads only the product page; a transport quote is explicitly unavailable without creating another basket', async () => {
  let calls = 0;
  const observation = await readRetailSource(source, async (url, options) => {
    calls++; assert.equal(String(url), source.url); assert.ok(!options?.method || options.method === 'GET');
    return new Response(betterialPage, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  });
  assert.equal(observation.priceGrosze, 5255); assert.equal(calls, 1);
  const result = await createRetailerQuoter(async () => { throw Error('Must not submit an unconfirmed checkout'); })({ store: 'Betterial', materialsGrosze: 220710, lines: [], deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown' }, '00-001');
  assert.deepEqual(result, { reason: 'retailer_transport_quote_required' });
});

test('actual HTTP consolidates Betterial lots, preserves unknown shipping, and excludes unarranged pickup', async () => {
  const service = createRemontService({ initialObservations: [{ ...read(), observedAt: new Date().toISOString() }], background: false });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const root = 'http://127.0.0.1:' + (server.address() as { port: number }).port;
    const post = async (quantities: number[], mode = 'shipping') => {
      const body = { jobs: quantities.map((quantity, index) => ({ jobId: 'room-' + index, materials: [{ material: { id: 'k20', name: source.name, ean: source.ean, unit: source.unit, category: source.category }, quantity }] })), options: { store: 'Betterial', delivery: { mode, postalCode: '00-001' } } };
      const response = await fetch(root + '/pricing/project', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal(response.status, 200); return response.json();
    };
    for (const quantities of [[1], [300, 700], [1050]]) {
      const result = await post(quantities);
      assert.equal(result.consolidated.consolidatedTotalGrosze, 220710);
      assert.equal(result.consolidated.lines[0].packages[0].count, 42);
      assert.equal(result.deliveryComparison.best, null);
      assert.ok(result.deliveryComparison.unavailableStores.some((store: any) => store.store === 'Betterial' && store.reason === 'retailer_transport_quote_required'));
      assert.ok(result.coverage.pickupConfirmationStores.includes('Betterial'));
    }
    assert.equal((await post([1051])).consolidated.consolidatedTotalGrosze, 441420);
    const pickup = await post([25], 'pickup');
    assert.equal(pickup.stages[0].lines[0].resolved, false);
    assert.equal(pickup.stages[0].lines[0].reason, 'no-offer');
    assert.equal(pickup.deliveryComparison.best, null);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
