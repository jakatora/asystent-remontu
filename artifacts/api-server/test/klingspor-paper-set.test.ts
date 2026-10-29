import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { createRemontService } from '../src/shared-backend';

test('P180 and P220 keep separate EANs and share one confirmed Sewera delivery', async () => {
  const ids = ['sewera-klingspor-pl28c-p180-sheet', 'sewera-klingspor-pl28c-p220-sheet'];
  const sources = ids.map(id => RETAIL_SOURCES.find(source => source.id === id));
  assert.ok(sources.every(Boolean));
  assert.deepEqual(sources.map(source => source!.ean), ['5907560023560', '5907560027483']);
  assert.ok(sources.every(source => source!.packageSize === 1 && source!.unit === 'szt' && source!.retailUnit === 'SZT'));
  const prices = [154, 167];
  let quotes = 0;
  const service = createRemontService({ background: false,
    initialObservations: sources.map((source, index) => ({ sourceId: source!.id, ean: source!.ean, name: source!.name, imageUrl: source!.imageUrl!, priceGrosze: prices[index], currency: 'PLN', availability: 'in_stock', observedAt: new Date().toISOString(), sourceUrl: source!.url, evidenceSha256: 'a'.repeat(64) })),
    basketQuoter: async (order, postalCode) => {
      quotes++;
      assert.equal(order.store, 'Sewera'); assert.equal(postalCode, '00-001');
      assert.deepEqual(order.lines.flatMap(line => line.packages.map(item => item.offerId)).sort(), [...ids].sort());
      return { quote: { costGrosze: 1990, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), sourceUrl: sources[0]!.url,
        basis: 'retailer_basket_postcode', destinationScope: 'postal_code', postalCode, evidenceSha256: 'b'.repeat(64) } };
    },
  });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const port = (server.address() as { port: number }).port;
    const materials = sources.map((source, index) => ({ material: { id: `paper-${index}`, name: source!.name, ean: source!.ean, category: source!.category, unit: 'szt' }, quantity: 1 }));
    const response = await fetch(`http://127.0.0.1:${port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: [{ jobId: 'abrasive-set', materials }], options: { store: 'Sewera', delivery: { mode: 'shipping', postalCode: '00-001' } } }) });
    assert.equal(response.status, 200);
    const data = await response.json(), comparison = data.deliveryComparison;
    assert.equal(comparison.status, 'compared', JSON.stringify(comparison)); assert.equal(comparison.missingProductCount, 0);
    assert.equal(comparison.best.materialsGrosze, 321); assert.equal(comparison.best.deliveryGrosze, 1990); assert.equal(comparison.best.totalGrosze, 2311);
    assert.equal(comparison.best.stores.length, 1); assert.equal(comparison.best.stores[0].lines.length, 2); assert.equal(quotes, 1);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
