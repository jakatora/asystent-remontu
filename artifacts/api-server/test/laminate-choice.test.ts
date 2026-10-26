import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createRemontService } from '../src/shared-backend';
import type { RetailObservation } from '../src/lib/retail-pages';
import { applyLaminateChoices, LAMINATE_PRODUCTS } from '../../mobile/features/pricing/laminateChoice';
import observations from '../../../deploy/shared-backend/verified-offers.json' with { type: 'json' };

test('real HTTP reprices explicitly chosen flooring using shared raw area, physical packs and the chosen SKU only', async () => {
  const niasa = observations.find(row => row.sourceId === 'liderzy-classen-niasa-1973m2')!;
  const service = createRemontService({ initialObservations: [niasa] as RetailObservation[], background: false });
  const api = express(); api.use(express.json()); api.use(service.router);
  const server = api.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as { port: number }).port;
  const toledo = LAMINATE_PRODUCTS.find(ref => ref.id.includes('toledo'))!;
  const chosen = LAMINATE_PRODUCTS.find(ref => ref.id.includes('niasa'))!;
  const original = [1.1, 1.1].map((quantity, index) => ({ jobId: 'room-' + index, materials: [{ material: { id: 'panels', name: toledo.productLabel, category: 'laminate', unit: 'm2', ean: '5907555422774' }, quantity }] }));
  const request = async (jobs: typeof original) => {
    const response = await fetch(base + '/pricing/project', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs, options: { delivery: { mode: 'pickup' } } }) });
    assert.equal(response.status, 200); return response.json();
  };
  try {
    const before = await request(original);
    assert.equal(before.stages[0].lines[0].resolved, false); assert.equal(before.deliveryComparison.best, null);
    const selected = applyLaminateChoices(original, [{ from: toledo.id, to: chosen.id }]);
    const result = await request(selected as typeof original);
    assert.ok(result.stages.every((stage: any) => stage.lines[0].resolved && stage.lines[0].product.ean === '4003992571974'));
    assert.equal(result.consolidated.lines[0].totalQuantity, 2.2);
    assert.equal(result.consolidated.lines[0].packages[0].count, 2);
    assert.equal(result.consolidated.lines[0].packages[0].packageSize, 1.973);
    assert.equal(result.deliveryComparison.best.totalGrosze, 22484);
    assert.equal(result.consolidated.lines[0].packages[0].store, 'LiderzyCen');
    const restored = await request(applyLaminateChoices(original, []) as typeof original);
    assert.equal(restored.stages[0].lines[0].resolved, false); assert.equal(restored.deliveryComparison.best, null);
  } finally { service.close(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
