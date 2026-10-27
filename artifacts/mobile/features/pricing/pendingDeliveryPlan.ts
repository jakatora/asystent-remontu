import type { DeliveryComparison, DeliveredBasket } from '../../../../lib/pricing-service/src/delivery';

/** Refresh from the returned quotation, even if its expiry already prevents
 * rendering a payable total or a pending plan. Bound retries for older APIs. */
export function deliveryRefreshDelay(comparison: DeliveryComparison, current: boolean, now = Date.now()): number | null {
  if (!current || comparison.mode !== 'shipping') return null;
  const basket = comparison.best ?? comparison.purchasePlan ?? comparison.lowerBound;
  const expiries = basket?.stores.flatMap(store => store.quote ? [Date.parse(store.quote.expiresAt)] : []).filter(Number.isFinite) ?? [];
  if (!expiries.length) return null;
  const delay = Math.min(...expiries) - now + 100;
  return delay <= 0 ? 5000 : delay;
}

/** A complete allocation of material packs, with explicitly unfinished delivery.
 * Never promote it to the payable total or the cheapest-delivered recommendation. */
export function pendingDeliveryPlan(comparison: DeliveryComparison, current: boolean, now = Date.now()): DeliveredBasket | null {
  const plan = comparison.purchasePlan ?? comparison.lowerBound;
  if (!current || comparison.mode !== 'shipping' || comparison.status !== 'needs_delivery_costs' || comparison.best || comparison.missingProductCount !== 0
    || !/^\d{2}-\d{3}$/.test(comparison.postalCode ?? '') || !plan || plan.totalGrosze !== null || plan.deliveryGrosze !== null || !plan.stores.length) return null;
  const products = new Set(plan.stores.flatMap(store => store.lines.map(line => line.product.id)));
  if (products.size !== comparison.productCount || !Number.isSafeInteger(plan.materialsGrosze) || plan.materialsGrosze < 0
    || plan.stores.reduce((sum, store) => sum + store.materialsGrosze, 0) !== plan.materialsGrosze) return null;
  for (const store of plan.stores) {
    if (store.deliveryGrosze === null) { if (store.totalGrosze !== null || store.quote) return null; continue; }
    const quote = store.quote;
    if (store.source !== 'retailer' || !quote || !Number.isSafeInteger(store.deliveryGrosze) || store.deliveryGrosze < 0 || quote.costGrosze !== store.deliveryGrosze
      || store.totalGrosze !== store.materialsGrosze + store.deliveryGrosze || Date.parse(quote.expiresAt) <= now || !Number.isFinite(Date.parse(quote.expiresAt))
      || quote.destinationScope === 'postal_code' && quote.postalCode !== comparison.postalCode) return null;
  }
  return plan;
}
