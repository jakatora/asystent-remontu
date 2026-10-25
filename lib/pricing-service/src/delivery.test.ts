import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Product, ProductOffer, Database } from '@workspace/db/repositories';
import { estimateStageCost, type EstimateDeps } from './estimate';
import { compareDeliveredBaskets } from './delivery';

async function stage(matrix: Record<string, Record<string, number>>, quantities: Record<string, number> = {}) {
  const products = Object.keys(matrix).map(id => ({ id, name: id, ean: id, packageSize: '5', imageUrl: null }) as Product);
  const offers = Object.entries(matrix).flatMap(([productId, stores]) => Object.entries(stores).map(([store, price]) => ({
    id: `${productId}-${store}`, productId, store, price: (price / 100).toFixed(2), promoPrice: null,
    packageSize: '5', unit: 'l', productUrl: `https://example.com/${productId}-${store}`,
    source: 'observed-store-page', fetchedAt: new Date(), availability: 'in_stock',
  }) as ProductOffer));
  const deps: EstimateDeps = { findProductByCode: async (_, code) => products.find(p => p.ean === code.ean) ?? null,
    findProductByNameAndCategory: async () => null, listOffers: async (_, id) => offers.filter(offer => offer.productId === id) };
  return estimateStageCost({} as Database, products.map(p => ({ query: { ean: p.ean! }, quantity: quantities[p.id] ?? 5, unit: 'l' })), {}, deps);
}

test('shipping can make a higher product price cheaper for the whole complete basket', async () => {
  const input = await stage({ paint: { A: 10000, B: 10500 }, primer: { A: 5000, B: 4000 } });
  const result = compareDeliveredBaskets([input], { mode: 'shipping', costsGrosze: { A: 2000, B: 2000 } });
  assert.equal(result.status, 'compared'); assert.equal(result.best?.totalGrosze, 16500);
  assert.equal(result.best?.materialsGrosze, 14500); assert.equal(result.best?.deliveryGrosze, 2000);
  assert.deepEqual(result.best?.stores.map(order => order.store), ['B']);
  assert.equal(result.best?.stores[0].lines.length, 2);
});

test('one shipping fee per actually used store, with consolidation before rounding', async () => {
  const first = await stage({ paint: { A: 1000, B: 900 } }, { paint: 2 });
  const result = compareDeliveredBaskets([first, first], { mode: 'shipping', costsGrosze: { A: 0, B: 1000, Unused: 9000 } });
  assert.equal(result.productCount, 1); assert.equal(result.best?.totalGrosze, 1000);
  assert.equal(result.best?.stores[0].lines[0].packages[0].count, 1);
  assert.deepEqual(result.best?.stores.map(order => order.store), ['A']);
});

test('an unknown fee is neither free nor a final total; published from rates cannot certify a winner', async () => {
  const input = await stage({ paint: { A: 1000, B: 900 } });
  const policies = [{ store: 'B', sourceUrl: 'https://example.com/shipping', checkedAt: new Date().toISOString(), minimumGrosze: 9999, freeFromGrosze: 5000 }];
  const missing = compareDeliveredBaskets([input], { mode: 'shipping' }, policies);
  assert.equal(missing.best, null); assert.equal(missing.status, 'needs_delivery_costs');
  assert.equal(missing.lowerBound?.totalGrosze, null); assert.equal(missing.lowerBound?.deliveryGrosze, null);
  const some = compareDeliveredBaskets([input], { mode: 'shipping', costsGrosze: { A: 0 } }, policies);
  assert.equal(some.best?.totalGrosze, 1000); assert.equal(some.status, 'needs_delivery_costs');
  assert.equal(some.lowerBound?.lowerBoundGrosze, 900);
});

test('pickup explicitly excludes travel; missing products can never form a winning full basket', async () => {
  const input = await stage({ paint: { A: 1000, B: 900 } });
  const pickup = compareDeliveredBaskets([input], { mode: 'pickup' });
  assert.equal(pickup.status, 'compared'); assert.equal(pickup.best?.totalGrosze, 900); assert.equal(pickup.best?.deliveryGrosze, 0);
  input.lines.push({ resolved: false, query: { ean: 'missing' }, quantity: 1, unit: 'l', reason: 'no-product', lineCost: 0 });
  const partial = compareDeliveredBaskets([input], { mode: 'pickup' });
  assert.equal(partial.status, 'partial'); assert.equal(partial.best, null); assert.equal(partial.missingProductCount, 1);
});

test('fixed-fee optimum matches an independent exhaustive item assignment oracle', async () => {
  for (let sample = 0; sample < 12; sample++) {
    const matrix = Object.fromEntries(['paint', 'primer', 'tape'].map((id, p) => [id, Object.fromEntries(['A', 'B', 'C'].map((store, s) => [store, 100 + ((sample * 29 + p * 71 + s * 53) % 200)]))]));
    const fees = { A: 60 + sample, B: 30 + sample * 2, C: 90 };
    let expected = Infinity;
    for (const a of ['A', 'B', 'C']) for (const b of ['A', 'B', 'C']) for (const c of ['A', 'B', 'C']) {
      const materialCost = matrix.paint[a] + matrix.primer[b] + matrix.tape[c];
      const shipping = [...new Set([a, b, c])].reduce((sum, store) => sum + fees[store as keyof typeof fees], 0);
      expected = Math.min(expected, materialCost + shipping);
    }
    const input = await stage(matrix);
    assert.equal(compareDeliveredBaskets([input], { mode: 'shipping', costsGrosze: fees }).best?.totalGrosze, expected);
  }
});

test('large single-size quantities avoid a grid, invalid and negative fees remain unknown', async () => {
  const input = await stage({ paint: { A: 1000 } }, { paint: 100_000 });
  assert.equal(compareDeliveredBaskets([input], { mode: 'shipping', costsGrosze: { A: -1 } }).best, null);
  assert.equal(compareDeliveredBaskets([input], { mode: 'pickup' }).best?.totalGrosze, 20_000_000);
});

test('mixed package sizes across stores retain the exact shipping-aware purchase plan', async () => {
  const input = await stage({ paint: { A: 4000, B: 7000 } }, { paint: 15 });
  const line = input.lines[0]; assert.ok(line.resolved);
  line.offers = line.offers.map(offer => offer.store === 'B' ? { ...offer, packageSize: '10' } : offer);
  const result = compareDeliveredBaskets([input], { mode: 'shipping', costsGrosze: { A: 1000, B: 500 } });
  assert.equal(result.best?.totalGrosze, 12500);
  assert.deepEqual(result.best?.stores.flatMap(store => store.lines.flatMap(line => line.packages.map(pack => pack.packageSize))).sort((a, b) => a - b), [5, 10]);
});

test('an unsupported search size does not silently truncate stores and declare a cheapest basket', async () => {
  const input = await stage({ paint: Object.fromEntries(Array.from({ length: 11 }, (_, index) => ['Store' + index, 1000])) });
  const result = compareDeliveredBaskets([input], { mode: 'pickup' });
  assert.equal(result.status, 'limit_exceeded'); assert.equal(result.best, null);
});
