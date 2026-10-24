import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createRemontService } from '../src/shared-backend';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';

function observations(observedAt = new Date().toISOString()) {
  return RETAIL_SOURCES.map((source, index) => ({ sourceId: source.id, ean: source.ean, name: source.name,
    imageUrl: null, priceGrosze: [11800, 10999, 3548][index], currency: 'PLN' as const, availability: 'in_stock' as const,
    observedAt, sourceUrl: source.url, evidenceSha256: 'a'.repeat(64),
  }));
}

test('shared backend retains real observation dates after a failed refresh', async () => {
  const old = new Date(Date.now() - 86400000).toISOString();
  const service = createRemontService({ initialObservations: observations(old), background: false,
    fetchImpl: async () => new Response('blocked', { status: 403 }),
  });
  await service.refresh();
  const status = service.status();
  assert.equal(status.offers, 3);
  assert.ok(status.sources.every(source => source.checkedAt === old && source.error === 'retailer_http_403'));
  assert.equal(createRemontService({ initialObservations: observations(new Date(Date.now() - 8 * 86400000).toISOString()), background: false }).status().offers, 0);
});

test('shared backend actual HTTP: comparable packs, missing items, validation and health', async () => {
  const service = createRemontService({ initialObservations: observations(), background: false });
  const app = express(); app.use(express.json()); app.use('/api/remont', service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address() as { port: number };
  const root = `http://127.0.0.1:${address.port}/api/remont`;
  const input = { jobs: [{ jobId: 'paint-walls', materials: [
    { material: { id: 'paint', name: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l', unit: 'l', category: 'paint' }, quantity: 8.4 },
    { material: { id: 'primer', name: 'Grunt uniwersalny Knauf 5 l', unit: 'l', category: 'primer' }, quantity: 4 },
    { material: { id: 'unknown', name: 'Taśma malarska', unit: 'szt' }, quantity: 1 },
  ] }] };
  try {
    const response = await fetch(`${root}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
    assert.equal(response.status, 200);
    const estimate = await response.json();
    assert.equal(estimate.storeComparison.optimalBasketGrosze, 25546);
    assert.equal(estimate.storeComparison.cheapestFullStore.store, 'Castorama');
    assert.equal(estimate.storeComparison.cheapestFullStore.totalGrosze, 27148);
    assert.equal(estimate.storeComparison.singleStoreExtraGrosze, 1602);
    assert.ok(estimate.stages[0].lines.some((line: any) => !line.resolved && line.query.normalizedName === 'tasma malarska'));
    assert.equal(estimate.coverage.scope.deliveryIncluded, false);
    input.jobs[0].materials[0].material.unit = 'kg';
    assert.equal((await fetch(`${root}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })).status, 400);
    assert.equal((await fetch(`${root}/health`)).status, 200);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    service.close();
  }
});
