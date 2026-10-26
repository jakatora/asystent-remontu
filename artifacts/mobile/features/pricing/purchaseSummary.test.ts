import assert from 'node:assert/strict';
import { test } from 'node:test';
import { purchaseSnapshot, purchaseSummary } from './purchaseSummary';
import type { SerializedProject } from './pricingApi';

const now = Date.parse('2026-10-26T21:00:00Z');
function response(mode: 'shipping' | 'pickup' = 'shipping'): SerializedProject {
  return {
    stages: [{ lines: [{ resolved: true }], unresolvedCount: 0 }],
    consolidated: { consolidatedTotalGrosze: 10000, lines: [{ product: { name: 'Wybrany model' }, packages: [{ count: 1, verification: undefined }] }] },
    deliveryComparison: { mode, postalCode: mode === 'shipping' ? '00-001' : null, status: 'compared', missingProductCount: 0,
      best: { materialsGrosze: 10000, deliveryGrosze: mode === 'shipping' ? 2000 : 0, totalGrosze: mode === 'shipping' ? 12000 : 10000,
        stores: [{ source: mode === 'shipping' ? 'retailer' : 'pickup', quote: mode === 'shipping' ? { expiresAt: new Date(now + 60_000).toISOString() } : undefined }] } },
  } as unknown as SerializedProject;
}

test('purchase summary keeps server materials, delivery and total distinct, with the selected model and retailer', () => {
  const data = response(), before = JSON.stringify(data);
  const summary = purchaseSummary(purchaseSnapshot(data, 'Wybrany sklep', now), now);
  assert.equal(summary.status, 'complete');
  if (summary.status !== 'complete') throw Error('Expected a complete comparison');
  assert.equal(summary.materialsGrosze, 10000); assert.equal(summary.deliveryGrosze, 2000); assert.equal(summary.totalGrosze, 12000);
  assert.equal(summary.selectedStore, 'Wybrany sklep'); assert.deepEqual(summary.products, ['Wybrany model']); assert.equal(summary.postalCode, '00-001');
  assert.equal(JSON.stringify(data), before);
  const pickup = purchaseSummary(purchaseSnapshot(response('pickup'), null, now), now);
  assert.equal(pickup.status, 'complete'); assert.equal('mode' in pickup && pickup.mode, 'pickup');
});

test('missing delivery and partial baskets never acquire a zero fee or a complete total in the summary', () => {
  const unknown = response(); unknown.deliveryComparison!.status = 'needs_delivery_costs'; unknown.deliveryComparison!.best = null;
  const summary = purchaseSummary(purchaseSnapshot(unknown, null, now), now);
  assert.equal(summary.status, 'shipping_unknown'); assert.equal('totalGrosze' in summary && summary.totalGrosze, null);
  const partial = response(); partial.stages[0].unresolvedCount = 1;
  partial.stages[0].lines = [{ resolved: false, quantity: 1, unit: 'szt', query: { ean: null, gtin: null, normalizedName: 'Brakujący', category: null }, lineCostGrosze: 0, reason: 'no-product' }];
  const missing = purchaseSummary(purchaseSnapshot(partial, null, now), now);
  assert.equal(missing.status, 'partial'); assert.equal('missing' in missing && missing.missing, 1); assert.equal('totalGrosze' in missing && missing.totalGrosze, null);
});

test('delivery expiry and manually verified offer expiry invalidate the overview before a copied total can survive them', () => {
  const snapshot = purchaseSnapshot(response(), null, now);
  assert.equal(purchaseSummary(snapshot, now + 60_000).status, 'expired');
  const manual = response('pickup'); manual.consolidated.lines[0].packages![0].verification = { method: 'browser', checkedAt: new Date(now - 1000).toISOString(), expiresAt: new Date(now + 30_000).toISOString() };
  assert.equal(purchaseSummary(purchaseSnapshot(manual, null, now), now + 30_000).status, 'expired');
  assert.equal(purchaseSummary(purchaseSnapshot(response('pickup'), null, now), now + 10 * 60_000).status, 'expired');
  assert.equal(purchaseSummary(purchaseSnapshot(response('pickup'), null, now), now - 1).status, 'expired');
});

test('an inconsistent amount, unknown delivery source or invalid expiry does not become a full payable total', () => {
  for (const total of [11999, NaN, -1, 12000.5]) {
    const data = response(); data.deliveryComparison!.best!.totalGrosze = total;
    assert.notEqual(purchaseSummary(purchaseSnapshot(data, null, now), now).status, 'complete');
  }
  const unknown = response(); unknown.deliveryComparison!.best!.stores[0].source = 'unknown';
  assert.notEqual(purchaseSummary(purchaseSnapshot(unknown, null, now), now).status, 'complete');
  const expiry = response(); expiry.deliveryComparison!.best!.stores[0].quote!.expiresAt = 'invalid';
  assert.equal(purchaseSummary(purchaseSnapshot(expiry, null, now), now).status, 'expired');
  assert.equal(purchaseSummary(null, now).status, 'unavailable');
  assert.equal(purchaseSummary({ kind: 'empty', observedAt: now }, now).status, 'empty');
});
