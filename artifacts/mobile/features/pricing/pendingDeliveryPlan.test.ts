import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pendingDeliveryPlan, deliveryRefreshDelay } from './pendingDeliveryPlan';
import type { DeliveryComparison } from '../../../../lib/pricing-service/src/delivery';

const now = Date.parse('2026-10-27T12:00:00Z');
function comparison(): DeliveryComparison {
  const pack = { offerId: 'pack', store: 'A', count: 1, packageSize: 20, unitPriceGrosze: 10000, lineCostGrosze: 10000, url: null };
  return { mode: 'shipping', method: 'automatic', postalCode: '00-001', status: 'needs_delivery_costs', productCount: 2, missingProductCount: 0, best: null, alternatives: [], missingDeliveryStores: ['B'], policies: [],
    lowerBound: { materialsGrosze: 20000, deliveryGrosze: null, totalGrosze: null, lowerBoundGrosze: 22000, stores: [
      { store: 'A', materialsGrosze: 10000, deliveryGrosze: 2000, deliveryMinimumGrosze: 2000, totalGrosze: 12000, source: 'retailer', quote: { costGrosze: 2000, carrier: 'Kurier', payment: 'Przelew', checkedAt: new Date(now).toISOString(), expiresAt: new Date(now + 600000).toISOString(), sourceUrl: 'https://example.org/cart', destinationScope: 'postal_code', postalCode: '00-001', basis: 'retailer_basket_postcode', evidenceSha256: 'a'.repeat(64) }, lines: [{ product: { id: 'p1', name: 'P1', imageUrl: null }, unit: 'kg', packages: [pack] }] },
      { store: 'B', materialsGrosze: 10000, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [{ product: { id: 'p2', name: 'P2', imageUrl: null }, unit: 'kg', packages: [{ ...pack, offerId: 'other', store: 'B' }] }] },
    ] } };
}
test('pending plan exposes all products and separate store material totals without a full payable amount', () => {
  const value = comparison(), before = JSON.stringify(value), plan = pendingDeliveryPlan(value, true, now);
  assert.ok(plan); assert.equal(plan.stores.length, 2); assert.equal(plan.stores[1].materialsGrosze, 10000); assert.equal(plan.stores[1].totalGrosze, null); assert.equal(plan.totalGrosze, null); assert.equal(JSON.stringify(value), before);
});
test('the UI cannot retain a pending plan for another postcode, an expired delivery, incomplete products or a confirmed winner', () => {
  assert.equal(pendingDeliveryPlan(comparison(), false, now), null);
  const expired = comparison(); assert.equal(pendingDeliveryPlan(expired, true, now + 600000), null);
  const wrong = comparison(); wrong.postalCode = '80-001'; assert.equal(pendingDeliveryPlan(wrong, true, now), null);
  const partial = comparison(); partial.missingProductCount = 1; assert.equal(pendingDeliveryPlan(partial, true, now), null);
  const missing = comparison(); missing.productCount = 3; assert.equal(pendingDeliveryPlan(missing, true, now), null);
  const confirmed = comparison(); confirmed.best = confirmed.lowerBound; assert.equal(pendingDeliveryPlan(confirmed, true, now), null);
});
test('unknown store fees cannot be presented as zero, nor can stale store totals replace current material costs', () => {
  const value = comparison(); value.lowerBound!.stores[1].deliveryGrosze = 0;
  assert.equal(pendingDeliveryPlan(value, true, now), null);
  const badSum = comparison(); badSum.lowerBound!.materialsGrosze = 19999; assert.equal(pendingDeliveryPlan(badSum, true, now), null);
});

test('the display follows the better-confirmed selected plan rather than a cheaper bound that assumes more unknown fees', () => {
  const value = comparison(); value.purchasePlan = structuredClone(value.lowerBound!);
  value.lowerBound!.stores[0].deliveryGrosze = null; value.lowerBound!.stores[0].totalGrosze = null; delete value.lowerBound!.stores[0].quote; value.lowerBound!.stores[0].source = 'unknown';
  const plan = pendingDeliveryPlan(value, true, now); assert.equal(plan, value.purchasePlan); assert.equal(plan!.stores[0].deliveryGrosze, 2000);
});

test('expiry still schedules a bounded refresh when stale returned quotes prevent rendering the plan', () => {
  const value = comparison(); value.purchasePlan = structuredClone(value.lowerBound!);
  assert.equal(deliveryRefreshDelay(value, true, now), 600100);
  assert.equal(pendingDeliveryPlan(value, true, now + 600200), null);
  assert.equal(deliveryRefreshDelay(value, true, now + 600200), 5000);
  assert.equal(deliveryRefreshDelay(value, false, now + 600200), null);
  value.mode = 'pickup'; assert.equal(deliveryRefreshDelay(value, true, now), null);
  value.mode = 'shipping'; for (const store of value.purchasePlan!.stores) delete store.quote;
  assert.equal(deliveryRefreshDelay(value, true, now), null);
});
