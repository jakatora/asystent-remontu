import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import fixture from './fixtures/wallpaper-adhesives.json' with { type: 'json' };
import seed from '../../../deploy/shared-backend/verified-offers.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource, type RetailObservation } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import { calculatorEngine } from '../../mobile/features/calculator/engine';
import { getJobById } from '../../mobile/features/content/registry';
import { toPricingStageInput } from '../../mobile/features/pricing/pricingApi';
import type { BasketQuoter, DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const sources = fixture.sources.map(row => RETAIL_SOURCES.find(s => s.id === row.id)!);
const prices = [3190, 2000, 2494, 1698];
type Capture = (typeof fixture.records)[number];
function replay(context: string, mutate?: (value: any, row: Capture) => void) {
  const rows = fixture.records.filter(r => r.context === context); let cursor = 0;
  const fetcher: typeof fetch = async (input, init) => {
    const u = new URL(String(input)), row = rows[cursor++]; assert.ok(row, 'Only recorded public read and cart paths');
    assert.equal(u.origin, row.origin); assert.equal(u.pathname + u.search, row.path); assert.equal(init?.method ?? 'GET', row.method);
    assert.deepEqual(init?.body ? JSON.parse(String(init.body)) : null, row.body); assert.equal(new Headers(init?.headers).has('authorization'), false);
    const data = structuredClone(row.response); mutate?.(data, row); return Response.json(data, { status: row.status });
  };
  return { fetcher, done: () => assert.equal(cursor, rows.length) };
}
const basket = (indices: number[]): DeliveredStoreBasket => ({ store: sources[indices[0]].store, materialsGrosze: indices.reduce((n, i) => n + prices[i], 0), deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: indices.map(i => ({ product: { id: 'remont-' + sources[i].ean, name: sources[i].name, imageUrl: null }, unit: 'g', packages: [{ offerId: sources[i].id, store: sources[i].store, url: sources[i].url, count: 1, packageSize: sources[i].packageSize, unitPriceGrosze: prices[i], lineCostGrosze: prices[i] }] })) });

test('four real Shoper offers bind two distinct dry-powder packs and gross prices, with exact product photographs', async () => {
  for (const [i, source] of sources.entries()) {
    const server = replay('read:' + source.id), result = await readRetailSource(source, server.fetcher); server.done();
    assert.equal(result.priceGrosze, prices[i]); assert.equal(result.ean, source.ean); assert.equal(source.unit, 'g'); assert.ok(result.imageUrl);
    const product = fixture.records.find(r => r.context === 'read:' + source.id)!.response as any;
    assert.notEqual(result.priceGrosze, Math.round(product.price.net.final_float * 100));
    for (const patch of [{ packageSize: 1 }, { unit: 'kg' }, { apiPurchaseUnit: 'g' }]) await assert.rejects(readRetailSource({ ...source, ...patch }, replay('read:' + source.id).fetcher));
    for (const mutate of [(v: any) => v.name += ' Control', (v: any) => v.ean = '4015000415415', (v: any) => v.code = 'different', (v: any) => v.unit.floating_point = true, (v: any) => v.price.gross.final_float++]) await assert.rejects(readRetailSource(source, replay('read:' + source.id, mutate).fetcher));
  }
});

test('actual complete mixed carts confirm19.00 or21.90 national courier charges, with no customer submission or pickup substitution', async () => {
  for (const [context, indices, cost] of [['quote:plejada-both', [0, 1], 2190], ['quote:swiat-both', [2, 3], 1900]] as const) {
    const server = replay(context), result = await createRetailerQuoter(server.fetcher)(basket([...indices]), '00-001'); server.done();
    assert.ok('quote' in result); assert.equal(result.quote.costGrosze, cost); assert.equal(result.quote.destinationScope, 'PL'); assert.equal(result.quote.postalCode, undefined);
  }
  const mutations: [((v: any) => void), string][] = [
    [(v: any) => v.products[0].quantity++, 'basket_not_confirmed'], [(v: any) => v.products[0].price_float--, 'quote_unavailable'],
    [(v: any) => v.basket.sum_products_float++, 'quote_unavailable'], [(v: any) => v.products[0].unit.name = 'g', 'basket_not_confirmed'],
  ];
  for (const [mutate, reason] of mutations) {
    const server = replay('quote:swiat-both', (v, r) => { if (r.method === 'GET' && r.path.includes('/basket/')) mutate(v); });
    assert.deepEqual(await createRetailerQuoter(server.fetcher)(basket([2, 3]), '00-001'), { reason }); server.done();
  }
});

test('real HTTP sums raw grams across four rooms before buying one pack per adhesive, with actual whole-store cart quoting', async () => {
  const observations: RetailObservation[] = [];
  for (const source of sources) observations.push(await readRetailSource(source, replay('read:' + source.id).fetcher));
  const native: BasketQuoter = async (order, postcode) => {
    const prefix = order.store === 'Świat Się Klei' ? 'swiat' : 'plejada';
    const eans = new Set(order.lines.map(l => l.product.id));
    const suffix = eans.size === 2 ? 'both' : eans.has('remont-4015000402019') ? 'direct' : 'normal';
    const server = replay('quote:' + prefix + '-' + suffix), result = await createRetailerQuoter(server.fetcher)(order, postcode); server.done(); return result;
  };
  const service = createRemontService({ initialObservations: [...seed as RetailObservation[], ...observations], basketQuoter: native, background: false });
  const app = express(); app.use(express.json()); app.use(service.router); const server = app.listen(0, '127.0.0.1'); await new Promise<void>(r => server.once('listening', r));
  const job = getJobById('wallpaper-install')!;
  const calculate = (type: number, area: number) => toPricingStageInput(calculatorEngine.calculate(job, { wallArea: area, wallpaperAdhesiveType: type, wallpaperAdhesiveReservePercent: 10 }));
  const post = async (jobs: ReturnType<typeof calculate>[]) => { const r = await fetch(`http://127.0.0.1:${(server.address() as any).port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs, options: { delivery: { mode: 'shipping', postalCode: '00-001' } } }) }); assert.equal(r.status, 200); return r.json(); };
  try {
    const jobs = [[1, 10], [1, 10], [4, 15], [4, 15]].map(([type, area]) => { const input = calculate(type, area); return { ...input, materials: input.materials.filter(m => m.material.id === 'wallpaper-glue') }; });
    const result = await post(jobs), best = result.deliveryComparison.best;
    assert.equal(result.consolidated.lines.length, 2); assert.equal(best.materialsGrosze, 4192); assert.equal(best.deliveryGrosze, 1900); assert.equal(best.totalGrosze, 6092); assert.equal(best.stores.length, 1);
    assert.deepEqual(result.consolidated.lines.map((l: any) => [l.totalQuantity, l.packagesNeeded]).sort((a: number[], b: number[]) => a[0] - b[0]), [[103.125, 1], [200, 1]]);
    const incomplete = await post([calculate(1, 10)]); assert.ok(incomplete.deliveryComparison.missingProductCount > 0); assert.equal(incomplete.deliveryComparison.best, null);
    assert.ok(incomplete.stages[0].lines.some((l: any) => l.resolved && l.product.ean === '4015000402019'));
    assert.ok(incomplete.stages[0].lines.some((l: any) => !l.resolved && l.query.normalizedName.includes('tapeta')));
  } finally { service.close(); await new Promise<void>(r => server.close(() => r())); }
});

test('HTTP sums measured wallpaper tape before whole50m rolls and keeps a confirmed retailer selection', async () => {
  let calls = 0;
  const quote: BasketQuoter = async basket => {
    calls++;
    assert.equal(basket.store, 'Rab-Dom'); assert.equal(basket.lines.length, 1);
    assert.equal(basket.lines[0].product.id, 'remont-5907758515952');
    assert.equal(basket.lines[0].packages[0].count, 1); assert.equal(basket.materialsGrosze, 1199);
    // Captured national cart charge; this test exercises the quantity pipeline.
    // The corresponding actual native HTTP result is recorded in wave61 proof.
    return { quote: { costGrosze: 1050, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 600000).toISOString(), sourceUrl: 'https://www.rabdom.pl/pl/basket', basis: 'retailer_basket_national', destinationScope: 'PL', evidenceSha256: 'a'.repeat(64) } };
  };
  const service = createRemontService({ initialObservations: seed as RetailObservation[], basketQuoter: quote, background: false });
  const app = express(); app.use(express.json()); app.use(service.router); const server = app.listen(0, '127.0.0.1'); await new Promise<void>(r => server.once('listening', r));
  try {
    const job = getJobById('wallpaper-install')!;
    const jobs = [20, 20].map(length => {
      const stage = toPricingStageInput(calculatorEngine.calculate(job, { wallArea: 10, wallpaperAdhesiveType: 1, wallpaperProtectionTapeMetres: length }));
      return { ...stage, materials: stage.materials.filter(m => m.material.id === 'masking-tape-wallpaper') };
    });
    const response = await fetch(`http://127.0.0.1:${(server.address() as any).port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs, options: { store: 'Rab-Dom', delivery: { mode: 'shipping', postalCode: '00-001', allowSeparateOrders: false } } }) });
    assert.equal(response.status, 200); const result = await response.json();
    assert.equal(result.consolidated.lines.length, 1); assert.equal(result.consolidated.lines[0].totalQuantity, 40); assert.equal(result.consolidated.lines[0].packagesNeeded, 1);
    assert.equal(result.deliveryComparison.best.totalGrosze, 2249); assert.equal(calls, 1);
  } finally { service.close(); await new Promise<void>(r => server.close(() => r())); }
});
