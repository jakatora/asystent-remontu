import assert from 'node:assert/strict';
import { test } from 'node:test';
import { estimateStageCost } from './estimate';
import { compareAutomaticDelivery } from './automatic-delivery';
import type { BasketQuoter } from './delivery';
import type { Database, Product, ProductOffer } from '@workspace/db/repositories';

async function stage(id: string, quantity: number, size: number, store: string, price: string, maxPackages?: number) {
  const product = { id, name: id, category: 'material', packageSize: String(size), packageUnit: 'szt', imageUrl: null } as Product;
  const offers = [{ id: `${store}:${id}`, productId: id, store, price, promoPrice: null, packageSize: String(size), source: 'observed-store-page', availability: 'in_stock', fetchedAt: new Date(), productUrl: null, ...(maxPackages === undefined ? {} : { maxPackages }) }] as ProductOffer[];
  return estimateStageCost({} as Database, [{ query: { ean: '5906675169347' }, quantity, unit: 'szt' }], {}, {
    findProductByCode: async () => product, findProductByNameAndCategory: async () => product, listOffers: async () => offers,
  });
}
const settings = { mode: 'shipping' as const, postalCode: '00-001' };
const blocked = { Marbet24: 'customer_details_required' };
const courier: BasketQuoter = async () => ({ quote: { costGrosze: 2100, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 600000).toISOString(), sourceUrl: 'https://example.org/cart', destinationScope: 'postal_code', postalCode: '00-001', basis: 'retailer_basket_postcode', evidenceSha256: 'b'.repeat(64) } });

test('a mandatory unquoted merchant keeps the entire material plan and confirms other deliveries, never a payable whole total', async () => {
  const anchor = await stage('anchors', 29, 100, 'A', '49.54', 1);
  const paste = await stage('paste', 3.3, 20, 'Marbet24', '96.28');
  const inputs = [anchor, structuredClone(anchor), paste], before = JSON.stringify(inputs), calls: string[] = [];
  const result = await compareAutomaticDelivery(inputs, settings, async order => { calls.push(order.store); return courier(order, '00-001'); }, [], new Date(), blocked);
  assert.equal(JSON.stringify(inputs), before);
  assert.deepEqual(calls, ['A']);
  assert.equal(result.status, 'needs_delivery_costs'); assert.equal(result.best, null); assert.equal(result.productCount, 2);
  const plan = result.lowerBound!; assert.ok(plan); assert.equal(plan.materialsGrosze, 14582); assert.equal(plan.deliveryGrosze, null); assert.equal(plan.totalGrosze, null); assert.equal(plan.lowerBoundGrosze, 16682);
  const first = plan.stores.find(order => order.store === 'A')!; assert.equal(first.lines[0].packages[0].count, 1); assert.equal(first.deliveryGrosze, 2100); assert.equal(first.totalGrosze, 7054);
  const missing = plan.stores.find(order => order.store === 'Marbet24')!; assert.equal(missing.deliveryGrosze, null); assert.equal(missing.totalGrosze, null); assert.equal(missing.quote, undefined);
  assert.deepEqual(result.unavailableStores, [{ store: 'Marbet24', reason: 'customer_details_required' }]);
});

test('native price, stock or purchase-rule rejection removes an invalid material allocation', async () => {
  const inputs = [await stage('anchors', 58, 100, 'A', '49.54'), await stage('paste', 3.3, 20, 'Marbet24', '96.28')];
  for (const reason of ['price_changed', 'product_unavailable', 'insufficient_stock', 'purchase_rules_changed']) {
    const result = await compareAutomaticDelivery(inputs, settings, async () => ({ reason }), [], new Date(), blocked);
    assert.equal(result.best, null); assert.equal(result.lowerBound, null, reason);
    assert.ok(result.unavailableStores?.some(store => store.store === 'A' && store.reason === reason));
  }
});

test('unknown delivery fees remain unknown even when no merchant can be quoted', async () => {
  const result = await compareAutomaticDelivery([await stage('paste', 3.3, 20, 'Marbet24', '96.28')], settings, async () => { throw Error('Must not contact a known unsupported checkout'); }, [], new Date(), blocked);
  assert.equal(result.best, null); assert.equal(result.lowerBound!.deliveryGrosze, null); assert.equal(result.lowerBound!.totalGrosze, null); assert.equal(result.lowerBound!.stores[0].source, 'unknown');
});

test('missing postcode, unresolved products and insufficient catalogue stock do not expose a complete material plan', async () => {
  const paste = await stage('paste', 3.3, 20, 'Marbet24', '96.28'); let calls = 0;
  const quote: BasketQuoter = async () => { calls++; throw Error('Unexpected request'); };
  assert.equal((await compareAutomaticDelivery([paste], { mode: 'shipping' }, quote, [], new Date(), blocked)).lowerBound, null);
  const insufficient = await stage('anchors', 101, 100, 'A', '49.54', 1);
  const result = await compareAutomaticDelivery([insufficient, paste], settings, quote, [], new Date(), blocked);
  assert.equal(result.status, 'partial'); assert.equal(result.lowerBound, null); assert.equal(calls, 0);
});

test('material-only fallback never issues more than one query per distinct supported store basket', async () => {
  const inputs = [await stage('anchors', 29, 100, 'A', '49.54'), await stage('screws', 25, 200, 'A', '10.00'), await stage('paste', 3.3, 20, 'Marbet24', '96.28')];
  let calls = 0;
  const result = await compareAutomaticDelivery(inputs, settings, async order => { calls++; assert.equal(order.lines.length, 2); return courier(order, '00-001'); }, [], new Date(), blocked);
  assert.equal(calls, 1); assert.equal(result.lowerBound!.stores.find(store => store.store === 'A')!.deliveryGrosze, 2100);
});
