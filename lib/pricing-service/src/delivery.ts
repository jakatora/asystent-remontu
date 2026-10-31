import {optimizeGroupPackages} from './estimate';
import { buildPackageVariants, groupProjectByProduct, isComparableOffer, computePackagesNeeded } from './estimate';
import { optimizePackages } from './package-optimizer';
import type { PackagePlan, PackagePlanEntry, StageEstimate } from './types';
import { DELIVERY_LIMITS } from './delivery-limits';

export interface DeliverySettings {
  mode: 'shipping' | 'pickup';
  method?: 'automatic' | 'manual';
  /** Destination supplied by the app user, never the app owner's address. */
  postalCode?: string;
  /** Opt-in from clients that can display the required separate orders. */
  allowSeparateOrders?: boolean;
  /** A user-entered, fixed fee for ONE whole order from a store, in grosze. */
  costsGrosze?: Record<string, number>;
}
export interface StoreDeliveryPolicy {
  store: string;
  sourceUrl: string | null;
  checkedAt: string | null;
  /** A lower bound, never an exact shipping quote. Null means unknown. */
  minimumGrosze: number | null;
  freeFromGrosze?: number;
}
export interface DeliveredProduct {
  id: string; name: string; imageUrl: string | null;
}
export interface DeliveredStoreBasket {
  store: string;
  materialsGrosze: number;
  deliveryGrosze: number | null;
  deliveryMinimumGrosze: number;
  totalGrosze: number | null;
  source: 'entered' | 'pickup' | 'unknown' | 'retailer';
  quote?: DeliveryQuote;
  lines: { product: DeliveredProduct; unit: string | null; packages: PackagePlanEntry[] }[];
}
export interface DeliveredBasket {
  materialsGrosze: number;
  deliveryGrosze: number | null;
  totalGrosze: number | null;
  lowerBoundGrosze: number;
  stores: DeliveredStoreBasket[];
}
export interface DeliveryQuote {
  /** Exact difference between rounded pack prices and the merchant's verified
   * m² line totals. Included in materials, never hidden in the freight fee. */
  materialsRoundingGrosze?: number;
  /** A cheaper plan requires these separately checked merchant orders.
   * A product may appear in more than one order. Per-offer pack counts sum to
   * the original basket, with unchanged prices, pack sizes and purchase rules. */
  orders?: { materialsGrosze: number; lines: DeliveredStoreBasket['lines']; quote: Omit<DeliveryQuote, 'orders' | 'singleOrderCostGrosze'> }[];
  ordersReason?: 'separate_dispatch';
  singleOrderCostGrosze?: number;
  costGrosze: number;
  carrier: string;
  payment: string;
  checkedAt: string;
  expiresAt: string;
  sourceUrl: string;
  destinationScope: 'PL' | 'postal_code';
  postalCode?: string;
  dispatchFrom?: string;
  /** Distinguish national tariffs from quotes requested for this postcode. */
  basis: 'retailer_basket_national' | 'retailer_basket_postcode' | 'retailer_tariff_national';
  evidenceSha256: string;
}
/** Native checkout stock evidence, valid only for this dispatch/postcode and
 * current quote. It must never overwrite national or pickup availability. */
export interface DeliveryStockLimit {
  offerId: string; store: string; productId: string; productName: string;
  maxPackages: number; requestedPackages: number; unitPriceGrosze: number;
  postalCode: string; dispatchFrom: string;
  checkedAt: string; expiresAt: string; sourceUrl: string; evidenceSha256: string;
}
export type DeliveryQuoteResult = { quote: DeliveryQuote } | {
  reason: string; stockLimits?: DeliveryStockLimit[];
  /** Retailer-verified groups of exact offers that require separate branch carts. */
  dispatchGroups?: { dispatchFrom: string; offerIds: string[] }[];
  /** These offers can join a branch cart only after its native stock check. */
  flexibleDispatchOfferIds?: string[];
};
export interface BasketQuoteContext {
  /** An alternate branch's stock does not cap an offer available elsewhere. */
  ignoreStockOfferIds?: readonly string[];
}
export type BasketQuoter = (basket: DeliveredStoreBasket, postalCode: string, context?: BasketQuoteContext) => Promise<DeliveryQuoteResult>;
export interface DeliveryComparison {
  allowSeparateOrders?: boolean;
  mode: DeliverySettings['mode'];
  postalCode: string | null;
  status: 'compared' | 'needs_delivery_costs' | 'needs_postal_code' | 'partial' | 'empty' | 'limit_exceeded';
  method?: 'automatic' | 'manual';
  comparisonScope?: 'quoted_baskets';
  /** A bounded selection of complete baskets, not exhaustive pack splits. */
  searchLimited?: boolean;
  comparedBasketCount?: number;
  unavailableStores?: { store: string; reason: string; partial?:boolean }[];
  partiallyQuotedStores?: string[];
  stockLimits?: DeliveryStockLimit[];
  productCount: number;
  missingProductCount: number;
  /** Only an explicitly selected store may quote the available part of an
   * incomplete renovation. It never becomes best/lowerBound/alternatives. */
  availablePart?: {
    store: string;
    productCount: number;
    basket: DeliveredBasket | null;
    unavailableReason?: string;
  };
  best: DeliveredBasket | null;
  lowerBound: DeliveredBasket | null;
  /** A bounded, unfinished purchase plan: fewest stores without delivery
   * confirmation, then lowest material + confirmed-delivery cost. No winner. */
  purchasePlan?: DeliveredBasket | null;
  purchasePlanBasis?: 'fewest_unquoted_stores';
  alternatives: DeliveredBasket[];
  missingDeliveryStores: string[];
  policies: StoreDeliveryPolicy[];
}

/** Exact enumeration for fixed per-order fees. Every product is consolidated
 * before pack rounding. A store is charged once, and only if actually used.
 * Unknown delivery NEVER silently becomes zero in a payable total.
 * Variable/weight/threshold tariffs need a fresh basket quote entered by the user. */
export function compareDeliveredBaskets(
  stages: readonly StageEstimate[],
  settings: DeliverySettings = { mode: 'shipping' },
  policies: readonly StoreDeliveryPolicy[] = [],
  now = new Date(),
): DeliveryComparison {
  const groups = groupProjectByProduct(stages).filter(group => group.totalQuantity > 0);
  const missingProductCount = stages.flatMap(stage => stage.lines).filter(line => !line.resolved && line.quantity > 0).length + groups.filter(group=>!optimizeGroupPackages(group)).length;
  const names = [...new Set(groups.flatMap(group => group.offers.filter(offer => isComparableOffer(offer, now.getTime())).map(offer => offer.store)))].sort();
  const currentPolicies = names.map(store => {
    const policy = policies.find(policy => policy.store === store);
    const time = policy?.checkedAt ? Date.parse(policy.checkedAt) : NaN;
    const current = Number.isFinite(time) && now.getTime() - time <= 7 * 86400000 && time <= now.getTime();
    return { store, sourceUrl: policy?.sourceUrl ?? null, checkedAt: policy?.checkedAt ?? null,
      minimumGrosze: current ? policy?.minimumGrosze ?? null : null,
      ...(current && policy?.freeFromGrosze ? { freeFromGrosze: policy.freeFromGrosze } : {}),
    };
  });
  const knownFee = (store: string): number | null => {
    if (settings.mode === 'pickup') return 0;
    const value = Object.hasOwn(settings.costsGrosze ?? {}, store) ? settings.costsGrosze![store] : undefined;
    return Number.isSafeInteger(value) && value! >= 0 && value! <= 10_000_000 ? value! : null;
  };
  const result: DeliveryComparison = { mode: settings.mode, postalCode: settings.mode === 'shipping' ? settings.postalCode ?? null : null, status: 'empty', productCount: groups.length,
    missingProductCount, best: null, lowerBound: null, alternatives: [],
    missingDeliveryStores: names.filter(store => knownFee(store) === null), policies: currentPolicies,
  };
  if (missingProductCount) { result.status = 'partial'; return result; }
  if (!groups.length) return result;
  // Pickup has no per-store fee: the optimum is the sum of independent
  // per-product package plans across all shops, with no subset enumeration.
  if (settings.mode === 'pickup' ? names.length > DELIVERY_LIMITS.stores || groups.length > DELIVERY_LIMITS.products : names.length > 10 || groups.length > 50) { result.status = 'limit_exceeded'; return result; }
  const candidates = new Map<string, DeliveredBasket>();
  const cached = groups.map(() => new Map<string, PackagePlan | null>());
  const selectedSets = settings.mode === 'pickup' ? [names] : Array.from({length:2**names.length-1},(_,index)=>names.filter((_store,bit)=>(index+1) & 2**bit));
  for (const selected of selectedSets) {
    const orders = new Map<string, DeliveredStoreBasket>();
    let valid = true;
    for (let index = 0; index < groups.length; index++) {
      const group = groups[index];
      const offers = group.offers.filter(offer => selected.includes(offer.store));
      const key = offers.map(offer => offer.id).sort().join('|');
      if (!cached[index].has(key)) {
        const variants = buildPackageVariants(offers, group.product);
        let plan: PackagePlan | null;
        // Current exact-EAN catalogue uses one pack size. Avoid a large DP grid
        // for large quantities when simple integer pack rounding is sufficient.
        if (variants.length === 1 && !group.requiredBySize && variants[0].maxPackages === undefined) {
          const variant = variants[0], count = computePackagesNeeded(group.totalQuantity, variant.packageSize, variant.purchaseMultiple,variant.minimumPackages);
          const total = count * variant.unitPriceGrosze;
          plan = { requiredQuantity: group.totalQuantity, coveredQuantity: count * variant.packageSize,
            overage: count * variant.packageSize - group.totalQuantity, totalGrosze: total,
            packages: [{ ...variant, count, lineCostGrosze: total }],
          };
        } else plan = optimizeGroupPackages(group,offers);
        cached[index].set(key, plan);
      }
      const plan = cached[index].get(key);
      if (!plan || !Number.isSafeInteger(plan.totalGrosze)) { valid = false; break; }
      for (const entry of plan.packages) {
        let order = orders.get(entry.store);
        if (!order) {
          order = { store: entry.store, materialsGrosze: 0, deliveryGrosze: knownFee(entry.store),
            deliveryMinimumGrosze: 0, totalGrosze: null,
            source: settings.mode === 'pickup' ? 'pickup' : knownFee(entry.store) === null ? 'unknown' : 'entered', lines: [] };
          orders.set(entry.store, order);
        }
        order.materialsGrosze += entry.lineCostGrosze;
        let line = order.lines.find(line => line.product.id === (entry.product?.id??group.product.id));
        if (!line) { line = { product: entry.product ?? { id: group.product.id, name: group.product.name, imageUrl: group.product.imageUrl }, unit: group.unit, packages: [] }; order.lines.push(line); }
        line.packages.push(entry);
      }
    }
    if (!valid) continue;
    const stores = [...orders.values()].sort((a, b) => a.store.localeCompare(b.store));
    for (const order of stores) {
      // Published "from" rates can have free-delivery exceptions. Use zero only
      // as a mathematical lower bound for UNKNOWN fees, never as an amount due.
      // This also avoids falsely certifying a winner near a free-delivery threshold.
      order.deliveryMinimumGrosze = order.deliveryGrosze ?? 0;
      order.totalGrosze = order.deliveryGrosze === null ? null : order.materialsGrosze + order.deliveryGrosze;
    }
    const materialsGrosze = stores.reduce((sum, store) => sum + store.materialsGrosze, 0);
    const deliveryGrosze = stores.every(store => store.deliveryGrosze !== null) ? stores.reduce((sum, store) => sum + store.deliveryGrosze!, 0) : null;
    const lowerBoundGrosze = materialsGrosze + stores.reduce((sum, store) => sum + store.deliveryMinimumGrosze, 0);
    if (![materialsGrosze, lowerBoundGrosze, materialsGrosze + (deliveryGrosze ?? 0)].every(Number.isSafeInteger)) continue;
    const basket = { materialsGrosze, deliveryGrosze, lowerBoundGrosze, totalGrosze: deliveryGrosze === null ? null : materialsGrosze + deliveryGrosze, stores };
    const signature = stores.flatMap(store => store.lines.flatMap(line => line.packages.map(pack => `${pack.offerId}:${pack.count}`))).sort().join('|');
    candidates.set(signature, basket);
  }
  const baskets = [...candidates.values()];
  const known = baskets.filter(basket => basket.totalGrosze !== null).sort((a, b) => a.totalGrosze! - b.totalGrosze! || a.stores.length - b.stores.length);
  result.best = known[0] ?? null;
  result.alternatives = known.slice(1, 4);
  result.lowerBound = baskets.sort((a, b) => a.lowerBoundGrosze - b.lowerBoundGrosze || a.stores.length - b.stores.length)[0] ?? null;
  result.status = result.best && (!result.lowerBound || result.best.totalGrosze! <= result.lowerBound.lowerBoundGrosze) ? 'compared' : 'needs_delivery_costs';
  return result;
}
