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
  assert.equal(health.offers, 3);
  const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const response = await fetch(`${base}/api/remont/pricing/project`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input),
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.storeComparison.optimalBasketGrosze, 25546);
  assert.equal(data.storeComparison.singleStoreExtraGrosze, 1602);
  assert.equal(data.stages[0].lines.filter(line => !line.resolved).length, 2);
  assert.equal(data.stages[0].lines.filter(line => line.resolved).length, 2);
  console.log(JSON.stringify({ health: 'ok', authWithoutToken: 401, realProductOffers: health.offers,
    materialsComparedGrosze: data.storeComparison.optimalBasketGrosze, differenceGrosze: data.storeComparison.singleStoreExtraGrosze,
    missingLines: 2, note: 'Actual observed source pages; delivery excluded.' }));
} finally { await new Promise(resolve => server.close(resolve)); }
