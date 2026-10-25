import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Product, ProductOffer } from '@workspace/db/schema';
import type { Database } from '@workspace/db/repositories';
import { estimateProjectCostFromCalculation } from './from-calculator';
import { compareAutomaticDelivery } from './automatic-delivery';
import type { EstimateDeps } from './estimate';

const product = { id: 'paint', packageSize: '5', packageUnit: 'l', name: 'Paint' } as Product;
const offer = (id: string, store: string, price: string, size: string): ProductOffer => ({ id, productId: 'paint', store, price, promoPrice: null, packageSize: size, unit: 'l', productUrl: `https://example.com/${id}`, source: store + ' — feed', fetchedAt: new Date(), availability: 'in_stock' } as ProductOffer);
const offers = [offer('a5', 'A', '40', '5'), offer('b10', 'B', '70', '10')];
const deps: EstimateDeps = { findProductByCode: async (_db, code) => code.ean === 'known' ? product : null, findProductByNameAndCategory: async () => null, listOffers: async () => offers };
const rooms = [1,2].map(n => ({ jobId: 'room-' + n, materials: [{ material: { id: 'paint', name: 'Paint', unit: 'l', ean: 'known' }, quantity: 6 }] }));

test('selected store remains selected after combining rooms, package rounding and delivery', async () => {
  const selected = await estimateProjectCostFromCalculation({} as Database, rooms, { store: 'A' }, deps);
  assert.equal(selected.projectTotalGrosze, 16000);
  assert.equal(selected.consolidated.consolidatedTotalGrosze, 12000);
  assert.deepEqual(selected.storeComparison.stores.map(s => s.store), ['A']);
  assert.ok(selected.stages.every(s => s.lines.every(l => l.resolved && l.offers.every(o => o.store === 'A'))));
  const comparison = await compareAutomaticDelivery(selected.stages, { mode: 'shipping', postalCode: '00-001' }, async basket => {
    assert.equal(basket.store, 'A'); assert.equal(basket.materialsGrosze, 12000);
    return { quote: { costGrosze: 1000, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now()+600000).toISOString(), sourceUrl: 'https://example.com/cart', destinationScope: 'PL', basis: 'retailer_basket_national', evidenceSha256: 'test' } };
  });
  assert.equal(comparison.best?.totalGrosze, 13000);
  assert.deepEqual(comparison.best?.stores.map(s => s.store), ['A']);
  const unrestricted = await estimateProjectCostFromCalculation({} as Database, rooms, {}, deps);
  assert.equal(unrestricted.consolidated.consolidatedTotalGrosze, 11000);
});

test('missing products stay visible when a store cannot supply the requested basket', async () => {
  const jobs = [...rooms, { jobId: 'missing', materials: [{ material: { id: 'unknown', name: 'Unknown product', unit: 'szt', ean: 'unknown' }, quantity: 1 }] }];
  const selected = await estimateProjectCostFromCalculation({} as Database, jobs, { store: 'A' }, deps);
  assert.equal(selected.stages.flatMap(s => s.lines).length, 3);
  assert.equal(selected.stages[2].lines[0].resolved, false);
  const delivery = await compareAutomaticDelivery(selected.stages, { mode: 'pickup' }, async () => { throw Error('must not quote an incomplete basket'); });
  assert.equal(delivery.best, null); assert.equal(delivery.missingProductCount, 1);
  const absent = await estimateProjectCostFromCalculation({} as Database, rooms, { store: 'Not offered' }, deps);
  assert.ok(absent.stages.every(s => s.lines.every(l => !l.resolved)));
});
