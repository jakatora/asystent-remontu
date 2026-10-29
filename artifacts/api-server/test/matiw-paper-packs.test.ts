import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { confirmShoperPurchaseUnit } from '../src/lib/retail-pages';
import { createRemontService } from '../src/shared-backend';

test('Matiw sells one 50-sheet pack per native piece, never one sheet', () => {
  for (const [id, code, ean, grit, productId] of [
    ['matiw-klingspor-pl28c-p180-50', '000622', '5907560023560', 'P180', 25771],
    ['matiw-klingspor-pl28c-p220-50', '000632', '5907560027483', 'P220', 25772],
  ] as const) {
    const source = RETAIL_SOURCES.find(item => item.id === id)!;
    assert.equal(source.packageSize, 50);
    const item = { id: productId, code, ean, name: source.name, producer: { name: 'Klingspor' }, unit: { name: 'szt.', floating_point: false }, description: `Arkusz PL28C ${grit} 50szt` };
    assert.doesNotThrow(() => confirmShoperPurchaseUnit(item, source));
    assert.throws(() => confirmShoperPurchaseUnit(item, { ...source, packageSize: 1 }), /product_package_not_confirmed/);
    assert.throws(() => confirmShoperPurchaseUnit({ ...item, description: `Arkusz PL28C ${grit} 1szt` }, source), /product_package_not_confirmed/);
  }
});

test('whole basket chooses Sewera sheets for one each and Matiw cartons for 50 each, with one delivery per store', async () => {
  const ids = ['sewera-klingspor-pl28c-p180-sheet', 'sewera-klingspor-pl28c-p220-sheet', 'matiw-klingspor-pl28c-p180-50', 'matiw-klingspor-pl28c-p220-50'];
  const prices: Record<string, number> = Object.fromEntries(ids.map((id, index) => [id, [154, 167, 3600, 3600][index]]));
  const sources = ids.map(id => RETAIL_SOURCES.find(source => source.id === id)!);
  assert.ok(sources.every(Boolean));
  const service = createRemontService({ background: false,
    initialObservations: sources.map(source => ({ sourceId: source.id, ean: source.ean, name: source.name, imageUrl: source.imageUrl!, priceGrosze: prices[source.id], currency: 'PLN', availability: 'in_stock', observedAt: new Date().toISOString(), sourceUrl: source.url, evidenceSha256: 'a'.repeat(64) })),
    basketQuoter: async (order, postalCode) => {
      assert.equal(postalCode, '00-001');
      assert.ok(order.lines.every(line => line.packages.every(pack => pack.packageSize === (order.store === 'Matiw' ? 50 : 1))));
      return { quote: { costGrosze: order.store === 'Matiw' ? 1900 : 1990, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), sourceUrl: sources.find(source => source.store === order.store)!.url, basis: order.store === 'Matiw' ? 'retailer_basket_national' : 'retailer_basket_postcode', destinationScope: order.store === 'Matiw' ? 'PL' : 'postal_code', ...(order.store === 'Sewera' ? { postalCode } : {}), evidenceSha256: 'b'.repeat(64) } };
    },
  });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const port = (server.address() as { port: number }).port;
    for (const [quantity, store, materialsGrosze, deliveryGrosze, totalGrosze] of [[1, 'Sewera', 321, 1990, 2311], [50, 'Matiw', 7200, 1900, 9100]] as const) {
      const materials = sources.filter(source => source.store === 'Sewera').map(source => ({ material: { id: `paper-${source.ean}`, name: source.name, ean: source.ean, category: source.category, unit: 'szt' }, quantity }));
      const response = await fetch(`http://127.0.0.1:${port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: [{ jobId: 'abrasive-set', materials }], options: { delivery: { mode: 'shipping', postalCode: '00-001' } } }) });
      assert.equal(response.status, 200);
      const comparison = (await response.json()).deliveryComparison;
      assert.equal(comparison.status, 'compared', JSON.stringify(comparison)); assert.equal(comparison.missingProductCount, 0);
      assert.equal(comparison.best.materialsGrosze, materialsGrosze); assert.equal(comparison.best.deliveryGrosze, deliveryGrosze); assert.equal(comparison.best.totalGrosze, totalGrosze);
      assert.equal(comparison.best.stores.length, 1); assert.equal(comparison.best.stores[0].store, store);
      assert.equal(comparison.best.stores[0].lines.length, 2);
      assert.ok(comparison.best.stores[0].lines.every((line: any) => line.packages[0].packageSize === (store === 'Matiw' ? 50 : 1)));
    }
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
