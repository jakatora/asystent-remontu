import type { SerializedProject } from './pricingApi';
import type { DeliverySettings } from '../../../../lib/pricing-service/src/delivery';

/** A freshly received server timestamp can be a few milliseconds ahead of the
 * device clock. Keep the strict validity guard and re-render when local time
 * actually reaches it; never make a future or expired quote selectable early. */
export function deliveredKitRecheckAt(data: SerializedProject, now = Date.now()): number | null {
  const times = (data.deliveryComparison?.best?.stores ?? []).map(s => Date.parse(s.quote?.checkedAt ?? ''))
    .filter(t => Number.isFinite(t) && t > now && t - now <= 5000);
  return times.length ? Math.max(...times) + 10 : null;
}

/** Prices from the actual complete delivered basket. A partial/material-only,
 * expired or wrong-postcode result never becomes a selectable priced kit. */
export function deliveredKit(data: SerializedProject, settings: DeliverySettings, now = Date.now()) {
  const comparison = data.deliveryComparison, best = comparison?.best;
  if (settings.mode !== 'shipping' || !/^\d{2}-\d{3}$/.test(settings.postalCode ?? '') || comparison?.mode !== 'shipping' || comparison.postalCode !== settings.postalCode || comparison.allowSeparateOrders !== (settings.allowSeparateOrders ?? true) || comparison.missingProductCount || !best || !Array.isArray(best.stores) || !best.stores.length) return null;
  if (!Array.isArray(data.stages) || !data.stages.length || data.stages.some(stage => !Array.isArray(stage?.lines) || stage.lines.some(line => !line || !Number.isFinite(line.quantity) || line.quantity < 0 || line.quantity > 0 && !line.resolved))) return null;
  const amounts = [best.materialsGrosze, best.deliveryGrosze, best.totalGrosze];
  if (!amounts.every(n => Number.isSafeInteger(n) && n! >= 0) || best.totalGrosze !== best.materialsGrosze + best.deliveryGrosze!) return null;
  if (best.stores.some(store => {
    const q = store.quote;
    return store.source !== 'retailer' || !q || !Number.isSafeInteger(store.materialsGrosze) || store.materialsGrosze < 0 || !Number.isSafeInteger(store.deliveryGrosze) || store.deliveryGrosze! < 0 || store.deliveryGrosze !== q.costGrosze || store.totalGrosze !== store.materialsGrosze + store.deliveryGrosze!
      || !Number.isFinite(Date.parse(q.checkedAt)) || Date.parse(q.checkedAt) > now || !Number.isFinite(Date.parse(q.expiresAt)) || Date.parse(q.expiresAt) <= now
      || q.orders !== undefined && (!Array.isArray(q.orders) || q.orders.length < 2)
      || !(q.destinationScope === 'PL' || q.destinationScope === 'postal_code' && q.postalCode === settings.postalCode);
  })) return null;
  if (best.stores.reduce((n, store) => n + store.materialsGrosze, 0) !== best.materialsGrosze || best.stores.reduce((n, store) => n + store.deliveryGrosze!, 0) !== best.deliveryGrosze) return null;
  return { materialsGrosze: best.materialsGrosze, deliveryGrosze: best.deliveryGrosze!, totalGrosze: best.totalGrosze!,
    stores: best.stores.map(store => store.store), orders: best.stores.reduce((n, store) => n + (store.quote!.orders?.length ?? 1), 0),
    expiresAt: Math.min(...best.stores.map(store => Date.parse(store.quote!.expiresAt))),
    scopeLimited: comparison.searchLimited === true || (comparison.unavailableStores?.length ?? 0) > 0 };
}
