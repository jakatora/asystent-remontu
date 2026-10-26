import { groupProjectByProduct, isComparableOffer, computePackagesNeeded, buildPackageVariants } from './estimate';
import { optimizePackages } from './package-optimizer';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { StageEstimate, PackagePlanEntry } from './types';
import { compareDeliveredBaskets, type BasketQuoter, type DeliveredStoreBasket, type DeliveredBasket, type DeliveryComparison, type DeliverySettings, type StoreDeliveryPolicy } from './delivery';
import { DELIVERY_LIMITS } from './delivery-limits';

const MAX_CANDIDATES = 4096, MAX_STORE_BASKETS = 80, MAX_PROPOSED = 256;
const signature = (order: DeliveredStoreBasket) => order.lines.flatMap(line => line.packages.map(pack => `${pack.offerId}:${pack.count}:${pack.unitPriceGrosze}`)).sort().join('|');
const removable = (pack:PackagePlanEntry) => pack.count-(pack.purchaseMultiple??1)>=(pack.minimumPackages??1) ? (pack.purchaseMultiple??1) : pack.count;

/** Enumerate all distributions of the required packs, including splitting the
 * same EAN between shops. Quote every distinct whole-store order once. Variable
 * shipping/weight/free thresholds cannot use the fixed-fee subset algorithm.
 * Additional, unneeded packs and mixed pack sizes are deliberately outside this
 * bounded comparison. Large baskets use a separately labelled selection of
 * complete orders, never presented as an exhaustive search. */
export async function compareAutomaticDelivery(
  stages: readonly StageEstimate[], settings: DeliverySettings, quoteBasket: BasketQuoter,
  policies: readonly StoreDeliveryPolicy[] = [], now = new Date(),
  knownUnavailableStores: Readonly<Record<string,string>> = {},
): Promise<DeliveryComparison> {
  if (settings.mode === 'pickup' || settings.method === 'manual') return compareDeliveredBaskets(stages, settings, policies, now);
  let groups = groupProjectByProduct(stages).filter(group => group.totalQuantity > 0);
  const stores = [...new Set(groups.flatMap(g => g.offers.filter(o => isComparableOffer(o, now.getTime())).map(o => o.store)))].sort();
  const result: DeliveryComparison = { method: 'automatic', comparisonScope: 'quoted_baskets', mode: 'shipping', postalCode: settings.postalCode ?? null,
    status: 'empty', productCount: groups.length, missingProductCount: stages.flatMap(s => s.lines).filter(l => !l.resolved && l.quantity > 0).length+groups.filter(g=>!optimizePackages(g.totalQuantity,buildPackageVariants(g.offers,g.product))).length,
    best: null, lowerBound: null, alternatives: [], missingDeliveryStores: stores, policies: policies.filter(p => stores.includes(p.store)), unavailableStores: [] };
  if (result.missingProductCount) { result.status = 'partial'; return result; }
  if (!groups.length) return result;
  if (!settings.postalCode || !/^\d{2}-\d{3}$/.test(settings.postalCode)) { result.status = 'needs_postal_code'; return result; }
  result.unavailableStores = stores.filter(store => knownUnavailableStores[store]).map(store => ({ store, reason: knownUnavailableStores[store] }));
  groups = groups.map(group => ({ ...group, offers: group.offers.filter(offer => !knownUnavailableStores[offer.store]) }));
  if (groups.some(group => !group.offers.length || !optimizePackages(group.totalQuantity,buildPackageVariants(group.offers,group.product)))) { result.status = 'needs_delivery_costs'; return result; }
  const tooLarge = () => { result.status = 'limit_exceeded'; return result; };
  const activeStores = [...new Set(groups.flatMap(group=>group.offers.filter(offer=>isComparableOffer(offer,now.getTime())).map(offer=>offer.store)))].sort();
  if (groups.length > DELIVERY_LIMITS.products || activeStores.length > DELIVERY_LIMITS.stores) return tooLarge();
  if (groups.length > 20 || activeStores.length > 10) return compareSelectedBaskets(groups, activeStores, result, settings, quoteBasket, now);
  const choices: PackagePlanEntry[][][] = [];
  let candidateCount = 1;
  for (const group of groups) {
    const offers = group.offers.filter(o => isComparableOffer(o, now.getTime()));
    const sizes = offers.map(o => Number(o.packageSize ?? group.product.packageSize));
    if (!sizes.length || sizes.some(size => !Number.isFinite(size) || size <= 0 || size !== sizes[0])) return tooLarge();
    const count = computePackagesNeeded(group.totalQuantity, sizes[0]);
    if (!Number.isSafeInteger(count) || count > DELIVERY_LIMITS.packagesPerProduct) return tooLarge();
    if (count > 60) return compareSelectedBaskets(groups, activeStores, result, settings, quoteBasket, now);
    const variants: PackagePlanEntry[][] = [];
    const visit = (index: number, remaining: number, packs: PackagePlanEntry[]) => {
      if (variants.length > MAX_CANDIDATES) return;
      if (index === offers.length) {
        if (remaining===0) {
          const coverage=packs.reduce((sum,pack)=>sum+pack.count,0);
          // Forced lot overage is allowed. An extra removable lot is a separate
          // discount-shopping strategy, outside the advertised comparison.
          if (!packs.some(pack=>coverage-removable(pack)>=count)) variants.push(packs);
        }
        return;
      }
      const offer = offers[index], price = parsePriceToGrosze(offer.promoPrice ?? offer.price);
      if (price === null || !Number.isSafeInteger(price) || price <= 0) return;
      const multiple=offer.purchaseMultiple??1,minimum=offer.minimumPackages??1;
      const useful=remaining>0?Math.max(Math.ceil(remaining/multiple),Math.ceil(minimum/multiple))*multiple:0;
      const max=Math.min(useful,offer.maxPackages===undefined?useful:Math.floor(offer.maxPackages/multiple)*multiple);
      if (max>DELIVERY_LIMITS.packagesPerProduct) return;
      for (let n = index === offers.length - 1 ? max : 0; n <= max; n+=multiple) {
        if(n>0&&n<minimum)continue;
        visit(index + 1, Math.max(0,remaining - n), n ? [...packs, { offerId: offer.id, store: offer.store, url: offer.productUrl, packageSize: sizes[0], count: n, unitPriceGrosze: price, lineCostGrosze: n * price, ...(multiple>1?{purchaseMultiple:multiple}:{}),...(minimum>1?{minimumPackages:minimum}:{}),...(offer.maxPackages!==undefined?{maxPackages:offer.maxPackages}:{}),...(offer.verification?{verification:offer.verification}:{}) }] : packs);
      }
    };
    visit(0, count, []);
    candidateCount *= variants.length;
    if (!variants.length) return tooLarge();
    if (candidateCount > MAX_CANDIDATES) return compareSelectedBaskets(groups, activeStores, result, settings, quoteBasket, now);
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
  if (unique.size > MAX_STORE_BASKETS) return compareSelectedBaskets(groups, activeStores, result, settings, quoteBasket, now);
  return quoteAndRank(candidates, unique, result, settings, quoteBasket, now);
}

/** For large renovations compare a bounded selection of complete orders.
 * Store subsets seed allocations, expanded with alternate sellers and selected
 * pack splits. Complete single-store alternatives have priority. This is not
 * exhaustive optimization and MUST be labelled as a limited comparison. */
async function compareSelectedBaskets(
  groups: ReturnType<typeof groupProjectByProduct>, stores: string[], result: DeliveryComparison,
  settings: DeliverySettings, quoteBasket: BasketQuoter, now: Date,
): Promise<DeliveryComparison> {
  const options = groups.map(group => {
    const offers = group.offers.filter(offer => isComparableOffer(offer, now.getTime()));
    const sizes = offers.map(offer => Number(offer.packageSize ?? group.product.packageSize));
    if (!sizes.length || sizes.some(size => !Number.isFinite(size) || size <= 0 || size !== sizes[0])) return null;
    return offers.flatMap(offer => {
      const count=computePackagesNeeded(group.totalQuantity,sizes[0],offer.purchaseMultiple,offer.minimumPackages);
      if (!Number.isSafeInteger(count)||count<1||count>DELIVERY_LIMITS.packagesPerProduct||offer.maxPackages!==undefined&&count>offer.maxPackages) return [];
      const price = parsePriceToGrosze(offer.promoPrice ?? offer.price);
      return price === null || price <= 0 || !Number.isSafeInteger(price * count) ? [] : [{ offerId: offer.id, store: offer.store, url: offer.productUrl, packageSize: sizes[0], count, unitPriceGrosze: price, lineCostGrosze: count * price, ...(offer.purchaseMultiple?{purchaseMultiple:offer.purchaseMultiple}:{}),...(offer.minimumPackages?{minimumPackages:offer.minimumPackages}:{}),...(offer.maxPackages!==undefined?{maxPackages:offer.maxPackages}:{}),...(offer.verification?{verification:offer.verification}:{}) }];
    });
  });
  if (options.some(option => !option)) { result.status = 'limit_exceeded'; return result; }
  const proposed = new Map<string, DeliveredStoreBasket[]>();
  const wholePlans = new Set<string>();
  const basePlans = new Map<string, PackagePlanEntry[]>();
  function addPlan(selected: PackagePlanEntry[], split?: { index: number; packs: PackagePlanEntry[] }) {
    addGroupedPlan(selected.map((pack,index)=>split?.index===index?split.packs:[pack]),!split);
  }
  function addGroupedPlan(selected:PackagePlanEntry[][],whole:boolean){
    if (proposed.size >= MAX_PROPOSED) return;
    const orders = new Map<string, DeliveredStoreBasket>();
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      for (const pack of selected[i]) {
      if(pack.count>(pack.maxPackages??Infinity)||pack.count>DELIVERY_LIMITS.packagesPerProduct)return;
      let order = orders.get(pack.store);
      if (!order) { order = { store: pack.store, materialsGrosze: 0, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [] }; orders.set(pack.store, order); }
      order.materialsGrosze += pack.lineCostGrosze;
      let line=order.lines.find(line=>line.product.id===group.product.id);
      if(!line){line={product:{id:group.product.id,name:group.product.name,imageUrl:group.product.imageUrl},unit:group.unit,packages:[]};order.lines.push(line);}line.packages.push(pack);
      }
    }
    const actual = [...orders.values()].sort((a,b) => a.store.localeCompare(b.store));
    const key = actual.map(signature).join(';');
    proposed.set(key, actual);
    if (whole) wholePlans.add(key);
  }
  // A complete large order may require finite stocks from several shops even
  // when none can supply the whole product alone. Keep that valid allocation.
  const materialPlans=groups.map(g=>optimizePackages(g.totalQuantity,buildPackageVariants(g.offers,g.product)));
  if(materialPlans.every(Boolean))addGroupedPlan(materialPlans.map(plan=>plan!.packages),materialPlans.every(plan=>plan!.packages.length===1));
  const orderedOptions = options.map(option=>option!.sort((a,b)=>a.lineCostGrosze-b.lineCostGrosze || a.offerId.localeCompare(b.offerId)));
  function addBase(selected: (PackagePlanEntry | undefined)[]) {
    if (selected.some(pack=>!pack)) return;
    const complete = selected as PackagePlanEntry[];
    basePlans.set(complete.map(pack=>pack.offerId).join('|'),complete);
    addPlan(complete);
  }
  // Keep complete single-store baskets and one complete material-price plan
  // before exploring subsets. For many shops, try each preferred supplier
  // with the cheapest available fallback for items it does not carry.
  for (const store of stores) addBase(orderedOptions.map(option=>option.find(pack=>pack.store===store)));
  addBase(orderedOptions.map(option=>option[0]));
  for (const store of stores) addBase(orderedOptions.map(option=>option.find(pack=>pack.store===store)??option[0]));
  const subsets: Set<string>[] = [];
  if (stores.length <= 10) {
    for (let subset=1;subset<2**stores.length;subset++) subsets.push(new Set(stores.filter((_store,index)=>subset & 2**index)));
  } else {
    // Pair seeds are quadratic, never 2^n or a 32-bit mask that loses shops.
    for (let first=0;first<stores.length;first++) for (let second=first+1;second<stores.length;second++) subsets.push(new Set([stores[first],stores[second]]));
  }
  for (const allowed of subsets) {
    const selected = orderedOptions.map(option=>option.find(pack=>allowed.has(pack.store)));
    if (selected.some(pack=>!pack)) continue;
    addBase(selected);
  }
  // A mandatory store may have the cheapest unit price but insufficient stock
  // for a different product. Include alternative sellers even if they never
  // win a greedy store-subset allocation. All plans still cover the whole need.
  const seeds = [...basePlans.values()].sort((a,b) => a.reduce((sum,p) => sum+p.lineCostGrosze,0)-b.reduce((sum,p) => sum+p.lineCostGrosze,0)).slice(0,24);
  expandPlans: for (const seed of seeds) for (let index = 0; index < options.length; index++) for (const alternative of options[index]!) {
    if (proposed.size >= MAX_PROPOSED) break expandPlans;
    if (alternative.offerId === seed[index].offerId) continue;
    const changed = [...seed]; changed[index] = alternative; addPlan(changed);
    if (alternative.store !== seed[index].store && seed[index].count > 1) {
      const count = seed[index].count;
      const multiple=seed[index].purchaseMultiple??1;
      const minimum=Math.ceil((seed[index].minimumPackages??1)/multiple)*multiple;
      for (const firstCount of new Set([minimum, Math.floor(count / 2 / multiple)*multiple, count - multiple])) {
        if (firstCount<(seed[index].minimumPackages??1)||firstCount%multiple) continue;
        const remaining=groups[index].totalQuantity-firstCount*seed[index].packageSize;
        if (!(remaining>0)) continue;
        const secondCount=computePackagesNeeded(remaining,alternative.packageSize,alternative.purchaseMultiple,alternative.minimumPackages);
        if (secondCount>DELIVERY_LIMITS.packagesPerProduct) continue;
        const needed=computePackagesNeeded(groups[index].totalQuantity,seed[index].packageSize),coverage=firstCount+secondCount;
        if (coverage-removable({...seed[index],count:firstCount})>=needed||coverage-removable({...alternative,count:secondCount})>=needed) continue;
        const first = { ...seed[index], count: firstCount, lineCostGrosze: firstCount * seed[index].unitPriceGrosze };
        const second = { ...alternative, count: secondCount, lineCostGrosze: secondCount*alternative.unitPriceGrosze };
        addPlan(seed, { index, packs: [first,second] });
      }
    }
  }
  const sum = (orders: DeliveredStoreBasket[]) => orders.reduce((total, order) => total + order.materialsGrosze, 0);
  const ordered = [...proposed.values()].sort((a,b) => Number(b.length === 1) - Number(a.length === 1) || sum(a) - sum(b));
  // Keep complete single-seller-per-product allocations as well as split
  // orders. Cheap material splits alone must not crowd out a slightly dearer
  // complete allocation with much cheaper transport.
  const single = ordered.filter(orders=>orders.length===1);
  const wholeOptions = ordered.filter(orders => orders.length>1 && wholePlans.has(orders.map(signature).join(';')));
  const fewerOrders = [...wholeOptions].sort((a,b)=>a.length-b.length || sum(a)-sum(b));
  const cheaperMaterials = [...wholeOptions].sort((a,b)=>sum(a)-sum(b));
  const diverse = new Map<string,DeliveredStoreBasket[]>();
  for (const plan of [...fewerOrders.slice(0,8),...cheaperMaterials.slice(0,8),...fewerOrders,...cheaperMaterials]) {
    diverse.set(plan.map(signature).join(';'),plan);
    if (diverse.size>=16) break;
  }
  const whole = [...diverse.values()];
  const splits = ordered.filter(orders => !wholePlans.has(orders.map(signature).join(';'))).slice(0,8);
  const selectedOrders = [...single,...whole,...splits];
  const unique = new Map<string, DeliveredStoreBasket>(), candidates: DeliveredStoreBasket[][] = [];
  for (const orders of selectedOrders) {
    const additional = orders.filter(order => !unique.has(signature(order))).length;
    if (unique.size + additional > MAX_STORE_BASKETS) continue;
    candidates.push(orders); orders.forEach(order => unique.set(signature(order), order));
    if (candidates.length >= MAX_STORE_BASKETS) break;
  }
  result.searchLimited = true;
  if (!candidates.length) { result.status = 'limit_exceeded'; return result; }
  return quoteAndRank(candidates, unique, result, settings, quoteBasket, now);
}

async function quoteAndRank(
  candidates: DeliveredStoreBasket[][], unique: Map<string, DeliveredStoreBasket>, result: DeliveryComparison,
  settings: DeliverySettings, quoteBasket: BasketQuoter, now: Date,
): Promise<DeliveryComparison> {
  const failures = new Map<string, string>((result.unavailableStores ?? []).map(item => [item.store,item.reason]));
  // Quote a representative order from every store first. Full store baskets
  // get priority because their eligible couriers/thresholds can differ from
  // individual items. This also protects useful results under the I/O deadline.
  const ordered=[...unique.entries()].sort((a,b)=>b[1].lines.length-a[1].lines.length || b[1].materialsGrosze-a[1].materialsGrosze);
  const first=new Map<string,string>();
  for (const [key,order] of ordered) if (!first.has(order.store)) first.set(order.store,key);
  // Finish several complete purchase plans early. Quoting unrelated broad
  // orders first can exhaust the deadline without confirming even one set.
  const priority=new Set(candidates.slice(0,3).flatMap(orders=>orders.map(signature)));
  for (const key of first.values()) priority.add(key);
  const smallest = new Map<string,string>();
  for (const [key,order] of [...ordered].reverse()) if (!smallest.has(order.store)) smallest.set(order.store,key);
  for (const key of smallest.values()) priority.add(key);
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
  result.comparedBasketCount = known.length;
  result.best = known[0] ?? null; result.alternatives = known.slice(1,4);
  result.lowerBound = baskets.sort((a,b) => a.lowerBoundGrosze - b.lowerBoundGrosze)[0] ?? null;
  const quotedStores=new Set([...unique.values()].filter(o=>o.quote).map(o=>o.store));
  result.missingDeliveryStores = [...failures.keys()].filter(store=>!quotedStores.has(store)).sort();
  result.partiallyQuotedStores = [...failures.keys()].filter(store=>quotedStores.has(store)).sort();
  result.unavailableStores = [...failures].map(([store, reason]) => ({ store, reason, ...(quotedStores.has(store)?{partial:true}:{}) }));
  result.status = result.best && !failures.size ? 'compared' : 'needs_delivery_costs';
  return result;
}
