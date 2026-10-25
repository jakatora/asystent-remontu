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
  assert.ok(health.offers >= 4); assert.equal(health.products, 4);
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
  console.log(JSON.stringify({ health: 'ok', authWithoutToken: 401, realProductOffers: health.offers,
    materialsComparedGrosze: data.storeComparison.optimalBasketGrosze, differenceGrosze: data.storeComparison.singleStoreExtraGrosze,
    missingLines: 0, note: 'Actual observed source pages; delivery excluded.' }));
} finally { await new Promise(resolve => server.close(resolve)); }
