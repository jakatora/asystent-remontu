import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Run in the prepared existing backend checkout. No keys, payments or paid AI.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'remont-local-smoke-secret-only';
process.env.DATABASE_PATH = './data/remont-shared-smoke.db';
const { createApp } = await import('./src/app.js');
const server = createApp().listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  assert.equal((await fetch(`${base}/health`)).status, 200);
  assert.equal((await fetch(`${base}/auth/me`)).status, 401);
  const health = await (await fetch(`${base}/api/remont/health`)).json();
  assert.equal(health.offers, 13); assert.equal(health.products, 7);
  const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const response = await fetch(`${base}/api/remont/pricing/project`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input),
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(Number.isSafeInteger(data.storeComparison.optimalBasketGrosze) && data.storeComparison.optimalBasketGrosze > 0);
  assert.equal(data.stages[0].lines.filter(line => !line.resolved).length, 0);
  assert.equal(data.stages[0].lines.filter(line => line.resolved).length, 4);
  assert.equal(data.consolidated.consolidatedTotalGrosze, data.storeComparison.optimalBasketGrosze);
  assert.equal(data.deliveryComparison.status, 'needs_delivery_costs');
  assert.equal(data.deliveryComparison.best, null);
  // Controlled USER-ENTERED delivery fees, not a claim about checkout tariffs.
  input.options = { delivery: { mode: 'shipping', postalCode: '00-001', costsGrosze: { Castorama: 2000, OBI: 2000, Sewera: 1990, Realbud: 3000, 'Rab-Dom': 1799, Buduj24: 1500 } } };
  const deliveredResponse = await fetch(`${base}/api/remont/pricing/project`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input),
  });
  assert.equal(deliveredResponse.status, 200);
  const delivered = (await deliveredResponse.json()).deliveryComparison;
  assert.equal(delivered.status, 'compared');
  assert.equal(delivered.postalCode, '00-001');
  assert.equal(delivered.best.totalGrosze, delivered.best.materialsGrosze + delivered.best.deliveryGrosze);
  assert.equal(delivered.best.totalGrosze, 29555);
  console.log(JSON.stringify({ health: 'ok', authWithoutToken: 401, realProductOffers: health.offers,
    materialsComparedGrosze: data.storeComparison.optimalBasketGrosze, differenceGrosze: data.storeComparison.singleStoreExtraGrosze,
    missingLines: 0, deliveredWithControlledFeesGrosze: delivered.best.totalGrosze,
    note: 'Observed product prices; explicitly controlled delivery fees for verification.' }));
} finally { await new Promise(resolve => server.close(resolve)); }
