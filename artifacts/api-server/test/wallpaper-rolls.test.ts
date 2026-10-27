import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import fixture from './fixtures/wallpaper-rolls.json' with { type: 'json' };
import seed from '../../../deploy/shared-backend/verified-offers.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource, type RetailObservation } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import { calculatorEngine } from '../../mobile/features/calculator/engine';
import { getJobById } from '../../mobile/features/content/registry';
import { toPricingStageInput } from '../../mobile/features/pricing/pricingApi';

const source = RETAIL_SOURCES.find(s => s.id === fixture.source.id)!;
function replay(context: string, mutate?: (value: any, record: (typeof fixture.records)[number]) => void) {
  const rows = fixture.records.filter(r => r.context === context); let cursor = 0;
  const fetcher: typeof fetch = async (input, init) => { const u = new URL(String(input)), row = rows[cursor++]; assert.ok(row); assert.equal(u.origin, row.origin); assert.equal(u.pathname + u.search, row.path); assert.equal(init?.method ?? 'GET', row.method); assert.deepEqual(init?.body ? JSON.parse(String(init.body)) : null, row.body); const value = structuredClone(row.response); mutate?.(value, row); return Response.json(value, { status: row.status }); };
  return { fetcher, done: () => assert.equal(cursor, rows.length) };
}

test('native roll offer binds one25m roll, exactEAN/width/SKU and227.90gross, never18.75m² or net price', async () => {
  const server = replay('read:' + source.id), observation = await readRetailSource(source, server.fetcher); server.done();
  assert.equal(observation.priceGrosze, 22790); assert.equal(observation.ean, '4002790333357'); assert.ok(observation.imageUrl);
  for (const patch of [{ packageSize: 18.75 }, { unit: 'm2' }, { apiPurchaseUnit: 'm²' }, { retailerSku: 'ER 3333-6' }]) await assert.rejects(readRetailSource({ ...source, ...patch }, replay('read:' + source.id).fetcher));
  for (const mutate of [(v: any) => v.ean = '4002790333364', (v: any) => v.unit.floating_point = true, (v: any) => v.description = v.description.replaceAll('25.00m * 0.75m', '25.00m * 1.06m'), (v: any) => v.price.gross.final_float++]) await assert.rejects(readRetailSource(source, replay('read:' + source.id, mutate).fetcher));
});

test('actual ExpressHTTP combines physical strips across two walls into one native retailer roll/cart quote', async () => {
  const native = replay('quote:roll'); let calls = 0;
  const quoter = createRetailerQuoter(native.fetcher);
  const service = createRemontService({ initialObservations: seed as RetailObservation[], background: false, basketQuoter: async (basket, postcode) => { calls++; assert.equal(basket.lines[0].packages[0].count, 1); return quoter(basket, postcode); } });
  const app = express(); app.use(express.json()); app.use(service.router); const server = app.listen(0, '127.0.0.1'); await new Promise<void>(r => server.once('listening', r));
  const job = getJobById('wallpaper-install')!;
  const full = toPricingStageInput(calculatorEngine.calculate(job, { wallArea: 7.5, wallpaperRollChoice: 1, wallpaperHeightM: 2.5, wallpaperWidth1M: 3, wallpaperCutAllowanceCm: 10, wallpaperAdhesiveType: 1, wallpaperProtectionTapeMetres: 20 }));
  const onlyRoll = { ...full, materials: full.materials.filter(l => l.material.id === 'wallpaper') };
  const post = async (jobs: typeof onlyRoll[], shipping = false) => { const response = await fetch(`http://127.0.0.1:${(server.address() as any).port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs, options: { delivery: { mode: 'shipping', ...(shipping ? { postalCode: '00-001' } : {}), allowSeparateOrders: false } } }) }); assert.equal(response.status, 200); return response.json(); };
  try {
    const result = await post([onlyRoll, structuredClone(onlyRoll)], true), line = result.consolidated.lines[0];
    assert.equal(line.packagesNeeded, 1); assert.equal(line.totalQuantity, 1); assert.equal(line.perStageCostGrosze, 45580); assert.equal(line.lineCostGrosze, 22790); assert.equal(line.savingsGrosze, 22790);
    assert.equal(line.wallpaperCutPlan.stripCount, 8); assert.equal(line.wallpaperCutPlan.rollsNeeded, 1); assert.equal(line.wallpaperCutPlan.optimal, true);
    assert.equal(result.deliveryComparison.best.materialsGrosze, 22790); assert.equal(result.deliveryComparison.best.totalGrosze, 24980); assert.equal(calls, 1); native.done();
    const complete = await post([full]); assert.equal(complete.deliveryComparison.missingProductCount, 0); assert.equal(complete.stages[0].lines.filter((l: any) => l.resolved).length, 4);
    const manual = { ...onlyRoll, materials: onlyRoll.materials.map(l => ({ ...l, plainWallpaper: undefined, quantity: 1 })) };
    assert.equal((await post([onlyRoll, onlyRoll, manual])).consolidated.lines[0].totalQuantity, 2);
    const changed = { ...onlyRoll, materials: onlyRoll.materials.map(l => ({ ...l, quantity: 3 })) };
    assert.equal((await post([changed, changed])).consolidated.lines[0].totalQuantity, 6);
  } finally { service.close(); await new Promise<void>(r => server.close(() => r())); }
});
