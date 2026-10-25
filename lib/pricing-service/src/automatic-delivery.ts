import { groupProjectByProduct, isComparableOffer } from './estimate';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { StageEstimate, PackagePlanEntry } from './types';
import { compareDeliveredBaskets, type BasketQuoter, type DeliveredStoreBasket, type DeliveredBasket, type DeliveryComparison, type DeliverySettings, type StoreDeliveryPolicy } from './delivery';

const MAX_CANDIDATES = 4096, MAX_STORE_BASKETS = 80;
const signature = (order: DeliveredStoreBasket) => order.lines.flatMap(line => line.packages.map(pack => `${pack.offerId}:${pack.count}:${pack.unitPriceGrosze}`)).sort().join('|');

/** Enumerate all distributions of the required packs, including splitting the
 * same EAN between shops. Quote every distinct whole-store order once. Variable
 * shipping/weight/free thresholds cannot use the fixed-fee subset algorithm.
 * Additional, unneeded packs and mixed pack sizes are deliberately outside this
 * bounded comparison. Never label a truncated search as cheapest. */
export async function compareAutomaticDelivery(
  stages: readonly StageEstimate[], settings: DeliverySettings, quoteBasket: BasketQuoter,
  policies: readonly StoreDeliveryPolicy[] = [], now = new Date(),
): Promise<DeliveryComparison> {
  if (settings.mode === 'pickup' || settings.method === 'manual') return compareDeliveredBaskets(stages, settings, policies, now);
  const groups = groupProjectByProduct(stages).filter(group => group.totalQuantity > 0);
  const stores = [...new Set(groups.flatMap(g => g.offers.filter(o => isComparableOffer(o, now.getTime())).map(o => o.store)))].sort();
  const result: DeliveryComparison = { method: 'automatic', comparisonScope: 'quoted_baskets', mode: 'shipping', postalCode: settings.postalCode ?? null,
    status: 'empty', productCount: groups.length, missingProductCount: stages.flatMap(s => s.lines).filter(l => !l.resolved && l.quantity > 0).length,
    best: null, lowerBound: null, alternatives: [], missingDeliveryStores: stores, policies: policies.filter(p => stores.includes(p.store)), unavailableStores: [] };
  if (result.missingProductCount) { result.status = 'partial'; return result; }
  if (!groups.length) return result;
  if (!settings.postalCode || !/^\d{2}-\d{3}$/.test(settings.postalCode)) { result.status = 'needs_postal_code'; return result; }
  const tooLarge = () => { result.status = 'limit_exceeded'; return result; };
  if (groups.length > 20 || stores.length > 10) return tooLarge();
  const choices: PackagePlanEntry[][][] = [];
  let candidateCount = 1;
  for (const group of groups) {
    const offers = group.offers.filter(o => isComparableOffer(o, now.getTime()));
    const sizes = offers.map(o => Number(o.packageSize ?? group.product.packageSize));
    if (!sizes.length || sizes.some(size => !Number.isFinite(size) || size <= 0 || size !== sizes[0])) return tooLarge();
    const count = Math.ceil(group.totalQuantity / sizes[0]);
    if (!Number.isSafeInteger(count) || count > 60) return tooLarge();
    const variants: PackagePlanEntry[][] = [];
    const visit = (index: number, remaining: number, packs: PackagePlanEntry[]) => {
      if (variants.length > MAX_CANDIDATES) return;
      if (index === offers.length) { if (remaining === 0) variants.push(packs); return; }
      const offer = offers[index], price = parsePriceToGrosze(offer.promoPrice ?? offer.price);
      if (price === null || !Number.isSafeInteger(price) || price <= 0) return;
      for (let n = index === offers.length - 1 ? remaining : 0; n <= remaining; n++) {
        visit(index + 1, remaining - n, n ? [...packs, { offerId: offer.id, store: offer.store, url: offer.productUrl, packageSize: sizes[0], count: n, unitPriceGrosze: price, lineCostGrosze: n * price }] : packs);
      }
    };
    visit(0, count, []);
    candidateCount *= variants.length;
    if (!variants.length || candidateCount > MAX_CANDIDATES) return tooLarge();
    choices.push(variants);
  }
  const candidates: DeliveredStoreBasket[][] = [], unique = new Map<string, DeliveredStoreBasket>();
  function enumerate(index: number, selected: PackagePlanEntry[][]) {
    if (index < groups.length) { for (const option of choices[index]) enumerate(index + 1, [...selected, option]); return; }
    const orders = new Map<string, DeliveredStoreBasket>();
    for (let i = 0; i < groups.length; i++) for (const pack of selected[i]) {
      const group = groups[i];
      let order = orders.get(pack.store);
      if (!order) { order = { store: pack.store, materialsGrosze: 0, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [] }; orders.set(pack.store, order); }
      order.materialsGrosze += pack.lineCostGrosze;
      let line = order.lines.find(l => l.product.id === group.product.id);
      if (!line) { line = { product: { id: group.product.id, name: group.product.name, imageUrl: group.product.imageUrl }, unit: group.unit, packages: [] }; order.lines.push(line); }
      line.packages.push(pack);
    }
    const actual = [...orders.values()].sort((a,b) => a.store.localeCompare(b.store));
    for (const order of actual) unique.set(signature(order), order);
    candidates.push(actual);
  }
  enumerate(0, []);
  if (unique.size > MAX_STORE_BASKETS) return tooLarge();
  const failures = new Map<string, string>();
  // Quote a representative order from every store first. Full store baskets
  // get priority because their eligible couriers/thresholds can differ from
  // individual items. This also protects useful results under the I/O deadline.
  const ordered=[...unique.entries()].sort((a,b)=>b[1].lines.length-a[1].lines.length || b[1].materialsGrosze-a[1].materialsGrosze);
  const first=new Map<string,string>();
  for (const [key,order] of ordered) if (!first.has(order.store)) first.set(order.store,key);
  const priority=new Set(first.values());
  const keys=[...priority,...ordered.map(([key])=>key).filter(key=>!priority.has(key))];
  // Bounded I/O even when a list generates many possible store orders.
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(3, keys.length) }, async () => {
    while (cursor < keys.length) {
      const key = keys[cursor++], order = unique.get(key)!;
      try {
        const outcome = await quoteBasket(order, settings.postalCode!);
        if ('quote' in outcome && Number.isSafeInteger(outcome.quote.costGrosze) && outcome.quote.costGrosze >= 0 &&
          (outcome.quote.destinationScope==='PL' || outcome.quote.postalCode===settings.postalCode) &&
          Date.parse(outcome.quote.expiresAt) > now.getTime() && Date.parse(outcome.quote.checkedAt) <= Date.now()) {
          order.deliveryGrosze = outcome.quote.costGrosze; order.quote = outcome.quote;
          order.deliveryMinimumGrosze = outcome.quote.costGrosze;
          order.totalGrosze = order.materialsGrosze + outcome.quote.costGrosze; order.source = 'retailer';
        } else failures.set(order.store, 'reason' in outcome ? outcome.reason : 'invalid_quote');
      } catch { failures.set(order.store, 'quote_unavailable'); }
    }
  }));
  const baskets: DeliveredBasket[] = candidates.map(orders => {
    const actual = orders.map(o => unique.get(signature(o))!);
    const materialsGrosze = actual.reduce((sum, o) => sum + o.materialsGrosze, 0);
    const deliveryGrosze = actual.every(o => o.deliveryGrosze !== null) ? actual.reduce((sum, o) => sum + o.deliveryGrosze!, 0) : null;
    return { stores: actual, materialsGrosze, deliveryGrosze, totalGrosze: deliveryGrosze === null ? null : materialsGrosze + deliveryGrosze,
      lowerBoundGrosze: materialsGrosze + actual.reduce((sum, o) => sum + (o.deliveryGrosze ?? 0), 0) };
  }).filter(b => [b.materialsGrosze, b.lowerBoundGrosze, b.totalGrosze ?? 0].every(Number.isSafeInteger));
  const known = baskets.filter(b => b.totalGrosze !== null).sort((a,b) => a.totalGrosze! - b.totalGrosze! || a.stores.length - b.stores.length);
  result.best = known[0] ?? null; result.alternatives = known.slice(1,4);
  result.lowerBound = baskets.sort((a,b) => a.lowerBoundGrosze - b.lowerBoundGrosze)[0] ?? null;
  const quotedStores=new Set([...unique.values()].filter(o=>o.quote).map(o=>o.store));
  result.missingDeliveryStores = [...failures.keys()].filter(store=>!quotedStores.has(store)).sort();
  result.partiallyQuotedStores = [...failures.keys()].filter(store=>quotedStores.has(store)).sort();
  result.unavailableStores = [...failures].map(([store, reason]) => ({ store, reason, ...(quotedStores.has(store)?{partial:true}:{}) }));
  result.status = result.best && !failures.size ? 'compared' : 'needs_delivery_costs';
  return result;
}
