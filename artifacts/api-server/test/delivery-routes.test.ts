import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { createRemontService } from '../src/shared-backend';

test('actual delivery HTTP contract: entered fees, unknown fees, validation and new products', async () => {
  const initialObservations = RETAIL_SOURCES.map((source, index) => ({ sourceId: source.id, ean: source.ean, name: source.name,
    imageUrl: null, priceGrosze: 1000 + index * 100, currency: 'PLN' as const, availability: 'in_stock' as const,
    observedAt: new Date().toISOString(), sourceUrl: source.url, evidenceSha256: 'a'.repeat(64) }));
  const service = createRemontService({ initialObservations, background: false, fetchImpl: async () => new Response('', { status: 503 }) });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const jobs = [{ jobId: 'painting', materials: [
    { material: { id: 'paint', name: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l', unit: 'l', category: 'paint' }, quantity: 8.5 },
    { material: { id: 'primer', name: 'Grunt uniwersalny Knauf 5 l', unit: 'l', category: 'primer' }, quantity: 4.1 },
  ] }];
  const post = (options: unknown, input = jobs) => fetch(base + '/pricing/project', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: input, options }) });
  try {
    const unknown = await (await post({ delivery: { mode: 'shipping' } })).json();
    assert.equal(unknown.deliveryComparison.best, null); assert.equal(unknown.deliveryComparison.status, 'needs_postal_code');
    const priced = await (await post({ delivery: { mode: 'shipping', method: 'manual', costsGrosze: { Castorama: 1990, OBI: 2000, Sewera: 2500, Realbud: 3000, Zino: 2000 } } })).json();
    assert.equal(priced.deliveryComparison.status, 'compared');
    const destination = await (await post({ delivery: { mode: 'shipping', method: 'manual', postalCode: '00-001', costsGrosze: { Castorama: 0 } } })).json();
    assert.equal(destination.deliveryComparison.postalCode, '00-001');
    // Another user/request cannot inherit the previous customer's shipping fees.
    assert.equal((await (await post({ delivery: { mode: 'shipping', postalCode: '30-001' } })).json()).deliveryComparison.best, null);
    assert.equal((await post({ delivery: { mode: 'shipping', postalCode: 'bad-code' } })).status, 400);
    const best = priced.deliveryComparison.best;
    assert.equal(best.totalGrosze, best.materialsGrosze + best.deliveryGrosze);
    assert.equal(best.stores[0].lines.length, 2); assert.equal(best.stores.length, 1);
    for (const fee of [-1, 1.1, 10_000_001, '19,90']) assert.equal((await post({ delivery: { mode: 'shipping', costsGrosze: { Castorama: fee } } })).status, 400);
    const extraJobs = [{ jobId: 'products', materials: [
      { material: { id: 'dulux', name: 'Farba lateksowa Dulux EasyCare Nieskazitelna Biel 9 l', unit: 'l', category: 'paint' }, quantity: 8.5 },
      { material: { id: 'atlas', name: 'Gotowa gładź polimerowa Atlas GTA 18 kg', unit: 'kg', category: 'skim-coat' }, quantity: 20 },
      { material: { id: 'start', name: 'Gładź gipsowa startowa Acryl-Putz ST10 START 20 kg', unit: 'kg', category: 'skim-coat' }, quantity: 20 },
    ] }];
    const expanded = await (await post({ delivery: { mode: 'pickup' } }, extraJobs)).json();
    assert.equal(expanded.stages[0].unresolvedCount, 0); assert.equal(expanded.deliveryComparison.productCount, 3);
    assert.equal(expanded.deliveryComparison.best.deliveryGrosze, 0);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
