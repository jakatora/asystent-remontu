import type { DeliveryComparison, DeliveredBasket } from '../../../../lib/pricing-service/src/delivery';

/** A complete allocation of material packs, with explicitly unfinished delivery.
 * Never promote it to the payable total or the cheapest-delivered recommendation. */
export function pendingDeliveryPlan(comparison: DeliveryComparison, current: boolean, now = Date.now()): DeliveredBasket | null {
  const plan = comparison.lowerBound;
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
