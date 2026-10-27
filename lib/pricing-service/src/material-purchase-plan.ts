import { buildPackageVariants, groupProjectByProduct, isComparableOffer } from './estimate';
import { optimizePackages } from './package-optimizer';
import type { DeliveredStoreBasket } from './delivery';
import { DELIVERY_LIMITS } from './delivery-limits';

/** One allocation based on material prices, before delivery can be compared.
 * It never certifies a cheapest delivered basket or treats missing fees as free.
 * Quantities, merchant purchase rules and finite stocks use the same optimiser
 * as the actual comparison, after consolidating products across all rooms. */
export function materialPurchasePlan(groups: ReturnType<typeof groupProjectByProduct>, now: Date): DeliveredStoreBasket[] | null {
  if (!groups.length || groups.length > DELIVERY_LIMITS.products) return null;
  const orders = new Map<string, DeliveredStoreBasket>();
  for (const group of groups) {
    const offers = group.offers.filter(offer => isComparableOffer(offer, now.getTime()));
    const plan = optimizePackages(group.totalQuantity, buildPackageVariants(offers, group.product));
    if (!plan || !Number.isSafeInteger(plan.totalGrosze)) return null;
    for (const pack of plan.packages) {
      if (!Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > DELIVERY_LIMITS.packagesPerProduct) return null;
      let order = orders.get(pack.store);
      if (!order) {
        order = { store: pack.store, materialsGrosze: 0, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [] };
        orders.set(pack.store, order);
      }
      order.materialsGrosze += pack.lineCostGrosze;
      if (!Number.isSafeInteger(order.materialsGrosze)) return null;
      order.lines.push({ product: { id: group.product.id, name: group.product.name, imageUrl: group.product.imageUrl }, unit: group.unit, packages: [pack] });
    }
  }
  if (orders.size > DELIVERY_LIMITS.stores) return null;
  // A product may need several offers in the same store (different pack sizes).
  for (const order of orders.values()) {
    const lines = new Map<string, DeliveredStoreBasket['lines'][number]>();
    for (const line of order.lines) {
      const existing = lines.get(line.product.id);
      if (existing) existing.packages.push(...line.packages);
      else lines.set(line.product.id, line);
    }
    order.lines = [...lines.values()];
  }
  return [...orders.values()].sort((a, b) => a.store.localeCompare(b.store));
}
