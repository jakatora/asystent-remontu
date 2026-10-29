import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createRemontService } from '../src/shared-backend';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';

test('whole renovation HTTP quotes all 100 repeated works and rejects oversized requests explicitly', async () => {
  const source = RETAIL_SOURCES.find(row => row.id === 'sewera-sniezka-5l')!;
  const service = createRemontService({ background: false,
    initialObservations: [{ sourceId: source.id, ean: source.ean, name: source.name, imageUrl: 'https://example.org/product.jpg',
      priceGrosze: 1000, currency: 'PLN', availability: 'in_stock', observedAt: new Date().toISOString(), sourceUrl: source.url, evidenceSha256: 'a'.repeat(64) }],
    basketQuoter: async (_order, postalCode) => ({ quote: { costGrosze: 2000, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), sourceUrl: 'https://sklep.sewera.pl/zamowienie', destinationScope: 'postal_code', postalCode, basis: 'retailer_basket_postcode', evidenceSha256: 'b'.repeat(64) } }),
  });
  const app = express(); app.use(express.json({ limit: '1mb' })); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const { port } = server.address() as { port: number };
  const paint = { material: { id: 'paint', name: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l', category: 'paint', unit: 'l' }, quantity: 0.05 };
  const jobs = Array.from({ length: 100 }, () => ({ jobId: 'paint-walls', materials: [paint] }));
  const post = (input: unknown) => fetch(`http://127.0.0.1:${port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: input, options: { delivery: { mode: 'shipping', postalCode: '00-001' } } }) });
  try {
    const result = await (await post(jobs)).json();
    assert.equal(result.stages.length, 100);
    assert.equal(result.deliveryComparison.status, 'compared');
    assert.equal(result.deliveryComparison.missingProductCount, 0);
    assert.equal(result.deliveryComparison.best.materialsGrosze, 1000);
    assert.equal(result.deliveryComparison.best.deliveryGrosze, 2000);
    const withExtras = await post([...jobs, { jobId: 'additional-materials', materials: [paint] }]);
    assert.equal(withExtras.status, 200);
    const extraResult = await withExtras.json();
    assert.equal(extraResult.stages.length, 101);
    assert.equal(extraResult.deliveryComparison.best.materialsGrosze, 2000);
    const overJobs = await post([...jobs, jobs[0], jobs[0]]);
    assert.equal(overJobs.status, 400);
    assert.equal((await overJobs.json()).error, 'basket_limit_exceeded');
    const overLines = await post(jobs.map(job => ({ ...job, materials: Array(11).fill(paint) })));
    assert.equal(overLines.status, 400);
    assert.equal((await overLines.json()).error, 'basket_limit_exceeded');
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
