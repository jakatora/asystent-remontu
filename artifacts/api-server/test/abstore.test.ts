import assert from 'node:assert/strict';
import { test } from 'node:test';
import { product, primary } from './fixtures/abstore';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage, readRetailSource } from '../src/lib/retail-pages';
import { createRemontService } from '../src/shared-backend';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { MATERIAL_PRICES } from '../../mobile/data/prices/materials';
import express from 'express';

const source = RETAIL_SOURCES.find(s => s.id === 'kronodom-arbiton-secura-thermo-6m2')!;
const now = new Date('2026-10-25T19:11:03Z');
const html = (value: any = product, visible = primary) => `<script>const productData = ${JSON.stringify(value)};</script>${visible}`;

test('ABStore prices a whole physical pack from the primary EAN and exact native purchase increment', () => {
  const observed = parseRetailPage(html(), source, now);
  assert.equal(observed.ean, '5905167826942'); assert.equal(observed.priceGrosze, 6198);
  assert.notEqual(observed.priceGrosze, 1033, 'unit price is not a pack price');
  assert.notEqual(observed.priceGrosze, 5040, 'net amount cannot price the pack');
  assert.match(observed.imageUrl!, /^https:\/\/a\.assecobs\.com\//);
});

test('ABStore rejects wrong primary identity, currency, VAT mode, conditional offers, stock and changed purchase rules', () => {
  const mutations: ((p: any) => void)[] = [
    p => p.id++, p => p.positionOfferId++, p => p.indexCatalogue = 'other',
    p => p.schemaOrg.jsonld = p.schemaOrg.jsonld.replace('5905167826942', '5905167826943'),
    p => p.canBeSold = false, p => p.stockState = 'OUT_OF_STOCK', p => p.clientSaleUnit.availQnt = 5,
    p => p.clientSaleUnit.minQnt = '12', p => p.clientSaleUnit.stepQnt = '12',
    p => p.clientSaleUnit.unit = 'szt', p => p.referenceUnit.qty = 6,
    p => p.clientSaleUnit.priceForUnit.currency = 'EUR', p => p.clientSaleUnit.priceForUnit.finalGrossValue = 8.4,
    p => p.invertedVat = true, p => p.hidePriceForAnon = true, p => p.personalOffer = true,
    p => p.offerDTO.setOfProducts = true, p => p.offerDTO.anyInvalidCondition = true,
  ];
  for (const mutate of mutations) {
    const changed = JSON.parse(JSON.stringify(product)); mutate(changed);
    assert.notDeepEqual(changed, product); assert.throws(() => parseRetailPage(html(changed), source, now));
  }
  assert.throws(() => parseRetailPage(html(product, primary.replace('data-min="6"', 'data-min="12"')), source, now), /purchase_rules_changed/);
  assert.throws(() => parseRetailPage(html(product, primary.replace('10,33', '8,40')), source, now), /gross_price_mismatch/);
  assert.throws(() => parseRetailPage(html(), { ...source, packageSize: 1 }, now), /purchase_rules_changed/);
  assert.throws(() => parseRetailPage(html(), { ...source, packageSize: 2.5 }, now), /unit_not_confirmed/);
});

test('ABStore live reader uses public GET only; a cart transport placeholder cannot become an automatic quote', async () => {
  let calls = 0;
  const observed = await readRetailSource(source, async (input, init) => {
    calls++; assert.equal(String(input), source.url); assert.equal(init?.body, undefined);
    assert.equal(init?.method, undefined); return new Response(html(), { headers: { 'content-type': 'text/html' } });
  });
  assert.equal(observed.priceGrosze, 6198); assert.equal(calls, 1);
  const result = await createRetailerQuoter(async () => { throw Error('unsupported cart must not be called'); })({ store: 'Kronodom', materialsGrosze: 6198, lines: [], deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown' }, '00-001');
  assert.deepEqual(result, { reason: 'integration_unavailable' });
});

test('ABStore whole-renovation HTTP consolidates two rooms before rounding to the six-square-metre pack', async () => {
  const observed = parseRetailPage(html(), source, new Date());
  const service = createRemontService({ initialObservations: [observed], background: false });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  const ref = MATERIAL_PRICES.find(row => row.id === 'mat-underlay-arbiton-xps-aquastop-6m2')!;
  const material = (quantity: number) => ({ material: { id: ref.id, name: ref.productLabel, category: ref.materialType, unit: ref.packageUnit }, quantity });
  try {
    async function request(quantityA: number, quantityB: number, mode = 'pickup') {
      const address = server.address() as { port: number };
      const response = await fetch(`http://127.0.0.1:${address.port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: [{ jobId: 'room-a', materials: [material(quantityA)] }, { jobId: 'room-b', materials: [material(quantityB)] }], options: { delivery: { mode, postalCode: '00-001' } } }) });
      assert.equal(response.status, 200); return response.json();
    }
    const exact = await request(3, 3);
    assert.equal(exact.deliveryComparison.best.totalGrosze, 6198); assert.equal(exact.deliveryComparison.best.stores[0].lines[0].packages[0].count, 1);
    const rounded = await request(3, 4); assert.equal(rounded.deliveryComparison.best.totalGrosze, 12396);
    const shipping = await request(3, 3, 'shipping'); assert.equal(shipping.deliveryComparison.best, null);
    assert.equal(shipping.deliveryComparison.unavailableStores[0].reason, 'integration_unavailable');
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
