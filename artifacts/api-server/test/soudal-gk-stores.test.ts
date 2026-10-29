import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createRemontService } from '../src/shared-backend';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';

test('Soudal G-K basket ranks complete delivered totals and shares one Sewera delivery with universal acrylic', async () => {
  const prices: Record<string, number> = {
    'lobo-acrylic-soudal-gk-white-280ml': 1199,
    'sewera-acrylic-soudal-gk-white-280ml': 1294,
    'realbud-acrylic-soudal-gk-white-280ml': 1501,
    'sewera-acrylic-soudal-white-280ml': 990,
    'realbud-acrylic-soudal-white-280ml': 1599,
  };
  const sources = RETAIL_SOURCES.filter(source => source.id in prices);
  assert.equal(sources.length, Object.keys(prices).length);
  assert.ok(sources.filter(source => source.ean === '5411183157248').every(source => source.imageUrl?.startsWith('https://')));
  const service = createRemontService({ background: false,
    initialObservations: sources.map(source => ({ sourceId: source.id, ean: source.ean, name: source.name, imageUrl: source.imageUrl!,
      priceGrosze: prices[source.id], currency: 'PLN', availability: 'in_stock', observedAt: new Date().toISOString(), sourceUrl: source.url, evidenceSha256: 'a'.repeat(64) })),
    basketQuoter: async (order, postalCode) => {
      const costGrosze = { Lobo: 2090, Sewera: 1990, Realbud: 2500 }[order.store];
      assert.ok(costGrosze !== undefined);
      return { quote: { costGrosze, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(),
        sourceUrl: sources.find(source => source.store === order.store)!.url, basis: order.store === 'Sewera' ? 'retailer_basket_postcode' : 'retailer_basket_national',
        destinationScope: order.store === 'Sewera' ? 'postal_code' : 'PL', ...(order.store === 'Sewera' ? { postalCode } : {}), evidenceSha256: 'b'.repeat(64) } };
    },
  });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const { port } = server.address() as { port: number };
  const gk = { material: { id: 'mat-acrylic-soudal-gk-white-280ml', name: 'Akryl Soudal biały do płyt G-K 280 ml', ean: '5411183157248', category: 'acrylic', unit: 'ml' }, quantity: 280 };
  const universal = { material: { id: 'mat-acrylic-soudal-white-280ml', name: 'Akryl uniwersalny Soudal biały 280 ml (malowalny)', ean: '5411183157538', category: 'acrylic', unit: 'ml' }, quantity: 280 };
  const post = (materials: unknown[]) => fetch(`http://127.0.0.1:${port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: [{ jobId: 'drywall-finishing', materials }], options: { delivery: { mode: 'shipping', postalCode: '00-001' } } }) });
  try {
    const one = await (await post([gk])).json();
    assert.equal(one.deliveryComparison.status, 'compared');
    assert.equal(one.deliveryComparison.missingProductCount, 0);
    assert.equal(one.deliveryComparison.best.stores[0].store, 'Sewera');
    assert.equal(one.deliveryComparison.best.totalGrosze, 3284);
    const both = await (await post([gk, universal])).json();
    assert.equal(both.deliveryComparison.status, 'compared');
    assert.equal(both.deliveryComparison.best.stores.length, 1);
    assert.equal(both.deliveryComparison.best.stores[0].store, 'Sewera');
    assert.equal(both.deliveryComparison.best.stores[0].lines.length, 2);
    assert.equal(both.deliveryComparison.best.materialsGrosze, 2284);
    assert.equal(both.deliveryComparison.best.deliveryGrosze, 1990);
    assert.equal(both.deliveryComparison.best.totalGrosze, 4274);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
