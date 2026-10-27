import { buildPackageVariants, groupProjectByProduct, isComparableOffer } from './estimate';
import { optimizePackages } from './package-optimizer';
import type { DeliveredStoreBasket } from './delivery';
import { DELIVERY_LIMITS } from './delivery-limits';

/** One allocation based on material prices, before delivery can be compared.
 * It never certifies a cheapest delivered basket or treats missing fees as free.
 * Quantities, merchant purchase rules and finite stocks use the same optimiser
 * as the actual comparison, after consolidating products across all rooms. */
export function materialPurchasePlan(groups: ReturnType<typeof groupProjectByProduct>, now: Date, preferredStore?: string): DeliveredStoreBasket[] | null {
  if (!groups.length || groups.length > DELIVERY_LIMITS.products) return null;
  const orders = new Map<string, DeliveredStoreBasket>();
  for (const group of groups) {
    const offers = group.offers.filter(offer => isComparableOffer(offer, now.getTime()));
    const preferred = preferredStore ? offers.filter(offer => offer.store === preferredStore) : [];
    const plan = (preferred.length ? optimizePackages(group.totalQuantity, buildPackageVariants(preferred, group.product)) : null)
      ?? optimizePackages(group.totalQuantity, buildPackageVariants(offers, group.product));
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

/** Bounded alternatives allow a slightly dearer carton in a shared merchant
 * order to avoid a second delivery. Each candidate still covers every product.
 * This is a selection of material allocations, not exhaustive delivered search. */
export function materialPurchasePlans(groups: ReturnType<typeof groupProjectByProduct>, now: Date): DeliveredStoreBasket[][] {
  const base = materialPurchasePlan(groups, now); if (!base) return [];
  const coverage = new Map<string, number>();
  for (const group of groups) for (const store of new Set(group.offers.filter(offer => isComparableOffer(offer, now.getTime())).map(offer => offer.store))) coverage.set(store, (coverage.get(store) ?? 0) + 1);
  const preferred = [...coverage].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12).map(([store]) => store);
  const key = (orders: DeliveredStoreBasket[]) => orders.flatMap(order => order.lines.flatMap(line => line.packages.map(pack => `${pack.offerId}:${pack.count}`))).sort().join('|');
  const plans = new Map<string, DeliveredStoreBasket[]>([[key(base), base]]);
  for (const store of preferred) { const plan = materialPurchasePlan(groups, now, store); if (plan) plans.set(key(plan), plan); }
  return [...plans.values()];
}
