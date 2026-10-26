import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { createRemontService } from '../src/shared-backend';
import { RETAIL_SOURCES, RETAIL_NAME_ALIASES } from '../src/lib/retail-catalog';
import { PRODUCT_PHOTOS } from '../../mobile/data/products/photos';
import { MATERIAL_PRICES } from '../../mobile/data/prices/materials';

test('whole renovation HTTP combines repeated jobs before pack rounding and charges delivery once per store', async () => {
  const sources = RETAIL_SOURCES.filter(source => ['sewera-sniezka-5l', 'sewera-atlas-unigrunt-5kg'].includes(source.id));
  const service = createRemontService({ background: false,
    initialObservations: sources.map(source => ({ sourceId: source.id, ean: source.ean, name: source.name, imageUrl: 'https://example.org/product.jpg',
      priceGrosze: source.category === 'paint' ? 1000 : 500, currency: 'PLN', availability: 'in_stock', observedAt: new Date().toISOString(), sourceUrl: source.url, evidenceSha256: 'a'.repeat(64) })),
    basketQuoter: async (order, postalCode) => {
      assert.equal(order.store, 'Sewera');
      return { quote: { costGrosze: 2000, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), sourceUrl: 'https://sklep.sewera.pl/zamowienie', destinationScope: 'postal_code', postalCode, basis: 'retailer_basket_postcode', evidenceSha256: 'b'.repeat(64) } };
    },
  });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const { port } = server.address() as { port: number };
  const paint = { material: { id: 'paint', name: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l', category: 'paint', unit: 'l' }, quantity: 2.5 };
  const primer = { material: { id: 'primer', name: 'Grunt głęboko penetrujący Atlas Uni-Grunt 5 kg', category: 'primer', unit: 'kg' }, quantity: 1.5 };
  const body = { jobs: [{ jobId: 'paint-walls', materials: [paint] }, { jobId: 'paint-walls', materials: [paint, primer] }], options: { delivery: { mode: 'shipping', postalCode: '00-001' } } };
  try {
    const post = () => fetch(`http://127.0.0.1:${port}/pricing/project`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const response = await post(); assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.stages.length, 2);
    assert.equal(result.consolidated.lines.find((line: any) => line.product.ean === '5903973139188').packagesNeeded, 1);
    assert.equal(result.consolidated.savingsGrosze, 1000);
    assert.equal(result.deliveryComparison.best.materialsGrosze, 1500);
    assert.equal(result.deliveryComparison.best.deliveryGrosze, 2000);
    assert.equal(result.deliveryComparison.best.totalGrosze, 3500);
    assert.equal(result.deliveryComparison.best.stores.length, 1);
    assert.equal(result.deliveryComparison.best.stores[0].lines.length, 2);
    body.jobs[1].materials.push({ material: { id: 'unknown', name: 'Brakujący materiał', category: 'other', unit: 'kg' }, quantity: 1 });
    const partial = await (await post()).json();
    assert.equal(partial.deliveryComparison.status, 'partial'); assert.equal(partial.deliveryComparison.best, null);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});

test('every newly priced product has a precise calculator alias and a matching photograph', () => {
  for (const source of RETAIL_SOURCES.slice(14)) {
    assert.ok(Object.values(RETAIL_NAME_ALIASES).includes(source.ean));
    const photo = PRODUCT_PHOTOS.find(photo => photo.ean === source.ean);
    const identityUrl = photo?.identitySourceUrl ?? photo?.sourceUrl;
    // A verified product card may supply the photograph before that shop has
    // a confirmed offer. The exact barcode remains mandatory in either case.
    // A manufacturer's pack illustration has its own source URL, while an
    // explicit retail identity still binds it to the exact reviewed barcode.
    assert.ok(RETAIL_SOURCES.some(candidate => candidate.ean === source.ean && candidate.url === identityUrl)
      || new RegExp(`(?:^|[^0-9])${source.ean}(?:[^0-9]|$)`).test(identityUrl ?? ''), source.id);
    assert.ok(photo?.ids.length);
    assert.ok(photo?.imageUrl.startsWith('https://'));
  }
});

test('every priced reference also has a photograph in offline reference and shopping cards', () => {
  for (const reference of MATERIAL_PRICES) {
    const ean = RETAIL_NAME_ALIASES[reference.productLabel];
    if (!ean) continue;
    const photo = PRODUCT_PHOTOS.find(photo => photo.ean === ean && photo.ids.includes(reference.id));
    assert.ok(photo?.imageUrl.startsWith('https://'), reference.id);
  }
});
