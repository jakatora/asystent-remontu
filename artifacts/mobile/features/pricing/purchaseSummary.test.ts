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
        stores: [{ store: 'Wybrany sklep', materialsGrosze: 10000, deliveryGrosze: mode === 'shipping' ? 2000 : 0, totalGrosze: mode === 'shipping' ? 12000 : 10000,
          lines: [{product:{name:'Wybrany model'}}], source: mode === 'shipping' ? 'retailer' : 'pickup', quote: mode === 'shipping' ? {
            costGrosze: 2000, checkedAt: new Date(now).toISOString(), expiresAt: new Date(now + 60_000).toISOString(),
            destinationScope: 'postal_code', postalCode: '00-001',
          } : undefined }] } },
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

test('the overview uses the selected pending plan material cost and expires its native delivery evidence', () => {
  const data = response(), comparison = data.deliveryComparison!;
  comparison.status = 'needs_delivery_costs'; comparison.best = null; comparison.productCount = 2;
  comparison.purchasePlan = { materialsGrosze: 15000, deliveryGrosze: null, totalGrosze: null, lowerBoundGrosze: 17000, stores: [
    { store: 'A', materialsGrosze: 10000, deliveryGrosze: 2000, deliveryMinimumGrosze: 2000, totalGrosze: 12000, source: 'retailer', quote: { costGrosze: 2000, checkedAt: new Date(now).toISOString(), expiresAt: new Date(now + 60000).toISOString(), destinationScope: 'PL' }, lines: [{ product: { id: 'p1', name: 'P1', imageUrl: null }, unit: 'szt', packages: [] }] },
    { store: 'B', materialsGrosze: 5000, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [{ product: { id: 'p2', name: 'P2', imageUrl: null }, unit: 'szt', packages: [] }] },
  ] } as unknown as NonNullable<typeof comparison.purchasePlan>;
  const snapshot = purchaseSnapshot(data, null, now), summary = purchaseSummary(snapshot, now);
  assert.equal(summary.status, 'shipping_unknown'); assert.equal('materialsGrosze' in summary && summary.materialsGrosze, 15000); assert.equal('totalGrosze' in summary && summary.totalGrosze, null);
  assert.equal(purchaseSummary(snapshot, now + 60000).status, 'expired');
});

test('a verified whole basket remains visible when competing delivery combinations are unavailable', () => {
  const data = response();
  data.deliveryComparison!.status = 'needs_delivery_costs';
  data.deliveryComparison!.unavailableStores = [{store:'Castorama',reason:'retailer_access_required'}];
  const summary = purchaseSummary(purchaseSnapshot(data, null, now), now);
  assert.equal(summary.status, 'complete');
  assert.equal('totalGrosze' in summary && summary.totalGrosze, 12000);
  assert.equal('deliveryGrosze' in summary && summary.deliveryGrosze, 2000);
  assert.equal('limited' in summary && summary.limited, true);
  const absent = {...data,deliveryComparison:{...data.deliveryComparison!,best:null}};
  assert.equal(purchaseSummary(purchaseSnapshot(absent,null,now),now).status,'shipping_unknown');
  const partial = {...data,deliveryComparison:{...data.deliveryComparison!,missingProductCount:1}};
  assert.equal(purchaseSummary(purchaseSnapshot(partial,null,now),now).status,'partial');
  data.deliveryComparison!.best!.stores[0].source='unknown';
  assert.equal(purchaseSummary(purchaseSnapshot(data,null,now),now).status,'shipping_unknown');
});

test('overview lists verified store totals and products for a split purchase', () => {
  const data = response(), comparison = data.deliveryComparison!;
  comparison.status = 'needs_delivery_costs';
  comparison.unavailableStores = [{store:'Inny sklep',reason:'retailer_access_required'}];
  comparison.best!.stores = [
    {store:'Lobo', materialsGrosze:6000, deliveryGrosze:1000, totalGrosze:7000, source:'retailer',
      quote:{costGrosze:1000,checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+60_000).toISOString(),destinationScope:'PL'}, lines:[{product:{name:'Farba'}}]},
    {store:'Sewera', materialsGrosze:4000, deliveryGrosze:1000, totalGrosze:5000, source:'retailer',
      quote:{costGrosze:1000,checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+60_000).toISOString(),destinationScope:'postal_code',postalCode:'00-001',orders:[{},{}]}, lines:[{product:{name:'Gładź'}}]},
  ] as unknown as NonNullable<typeof comparison.best>['stores'];
  const summary = purchaseSummary(purchaseSnapshot(data, null, now), now);
  assert.equal(summary.status, 'complete');
  assert.equal(summary.limited, true);
  assert.deepEqual(summary.storeSteps, [
    {store:'Lobo',totalGrosze:7000,deliveryGrosze:1000,orderCount:1,products:['Farba']},
    {store:'Sewera',totalGrosze:5000,deliveryGrosze:1000,orderCount:2,products:['Gładź']},
  ]);
  comparison.best!.stores[1].totalGrosze = 4999;
  const inconsistent = purchaseSummary(purchaseSnapshot(data,null,now),now);
  assert.equal(inconsistent.status, 'shipping_unknown');
  assert.deepEqual(inconsistent.storeSteps, []);
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

test('overview rejects delivery quotes for another postcode, a different fee or invalid time window', () => {
  const mutations: Array<(data: SerializedProject) => void> = [
    data => { data.deliveryComparison!.best!.stores[0].quote!.postalCode = '42-200'; },
    data => { data.deliveryComparison!.best!.stores[0].quote!.destinationScope = 'postal_code'; data.deliveryComparison!.postalCode = '42-200'; },
    data => { data.deliveryComparison!.best!.stores[0].quote!.costGrosze = 1999; },
    data => { data.deliveryComparison!.best!.stores[0].quote!.checkedAt = new Date(now + 5001).toISOString(); },
    data => { data.deliveryComparison!.best!.stores[0].quote!.checkedAt = 'invalid'; },
    data => { data.deliveryComparison!.best!.stores[0].quote!.expiresAt = new Date(now + 600001).toISOString(); },
  ];
  for (const mutate of mutations) {
    const data = response(); mutate(data);
    const summary = purchaseSummary(purchaseSnapshot(data, null, now), now);
    assert.equal(summary.status, 'shipping_unknown');
    assert.equal('totalGrosze' in summary && summary.totalGrosze, null);
    assert.deepEqual('storeSteps' in summary && summary.storeSteps, []);
  }
});
