import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import snapshot from './fixtures/atlantic-new-browser.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { observeCastoramaBrowser, type BrowserProductSnapshot } from '../src/lib/castorama-browser-observation';
import { createRemontService } from '../src/shared-backend';

const source = RETAIL_SOURCES.find(row => row.id === 'castorama-cersanit-atlantic-new-50')!;
const observed = () => observeCastoramaBrowser(snapshot as BrowserProductSnapshot, source, new Date(snapshot.capturedAt));

test('the actual Atlantic card confirms one basin at 158 PLN, its exact barcode and photo, without turning branch stock into national stock', () => {
  const row = observed();
  assert.equal(row.ean, '5901771226987'); assert.equal(row.priceGrosze, 15800); assert.match(row.imageUrl!, /5901771226987/);
  assert.equal(row.observedAt, snapshot.capturedAt); assert.equal(row.stockPackages, undefined);
  assert.equal(row.verification?.expiresAt, new Date(Date.parse(snapshot.capturedAt) + 86400000).toISOString());
  for (const change of [{ ean: '5907720650025' }, { packageSize: 2 }, { brand: 'Inna' }, { name: 'Umywalka Cersanit Atlantic 60 cm' }]) assert.throws(() => observeCastoramaBrowser(snapshot as BrowserProductSnapshot, { ...source, ...change }, new Date(snapshot.capturedAt)));
  assert.throws(() => observeCastoramaBrowser(snapshot as BrowserProductSnapshot, source, new Date(Date.parse(snapshot.capturedAt) + 86400000)), /not_current/);
});

test('real HTTP charges the exact number of new basins and leaves the old SKU and unquoted delivery unresolved', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse(snapshot.capturedAt) });
  const service = createRemontService({ initialObservations: [observed()], background: false });
  const api = express(); api.use(express.json()); api.use(service.router);
  const server = api.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  const request = async (ean: string, mode: 'shipping' | 'pickup' = 'shipping') => {
    const response = await fetch('http://127.0.0.1:' + (server.address() as { port: number }).port + '/pricing/project', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: [{ jobId: 'sink-installation', materials: [{ material: { id: 'washbasin', name: 'Umywalka', category: 'washbasin', unit: 'szt', ean }, quantity: 2 }] }], options: { store: 'Castorama', delivery: { mode, postalCode: '00-001' } } }) });
    assert.equal(response.status, 200); return response.json();
  };
  try {
    const old = await request('5907720650025'); assert.equal(old.stages[0].lines[0].resolved, false);
    const current = await request('5901771226987'); assert.equal(current.consolidated.consolidatedTotalGrosze, 31600);
    assert.equal(current.consolidated.lines[0].packages[0].count, 2); assert.equal(current.deliveryComparison.best, null);
    const pickup = await request('5901771226987', 'pickup'); assert.equal(pickup.deliveryComparison.best.totalGrosze, 31600);
    assert.equal(pickup.consolidated.lines[0].product.ean, '5901771226987');
  } finally { service.close(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
