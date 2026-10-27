// Serwis wyceny etapu i całego remontu — most między kalkulatorem a katalogiem
// cen. Dla każdej pozycji: dopasuj produkt (EAN/GTIN, potem nazwa+kategoria),
// wybierz NAJTAŃSZĄ aktualną ofertę, zaokrąglij ilość w górę do pełnych
// opakowań i policz koszt. Wszystko w GROSZACH (spójnie z price-collector).
//
// Zależności DAO są WSTRZYKIWANE (deps), żeby:
//   1) nie ładować singletona `db` (wymaga DATABASE_URL) przy imporcie,
//   2) testować logikę na atrapach bez realnego Postgresa.

import {
  findByEanOrGtin,
  findByNormalizedNameAndCategory,
  listOffersForProduct,
  type Database,
} from "@workspace/db/repositories";
import type { Product } from "@workspace/db/schema";
import type { PurchaseOffer as ProductOffer } from "./types";
import { parsePriceToGrosze } from "@workspace/price-collector";

import { optimizePackages } from "./package-optimizer";
import { computePackagesNeeded } from './purchase-quantity';
import { ERISMANN_3333_5_EAN, ERISMANN_3333_5_ROLL, planPlainWallpaperPanels, type WallpaperPanel, type WallpaperCutPlan } from './wallpaper-rolls';
export { computePackagesNeeded } from './purchase-quantity';
import type {
  CheapestOffer,
  ConsolidatedLine,
  ConsolidatedShoppingList,
  EstimateItem,
  EstimateLine,
  EstimateOptions,
  ItemQuery,
  OptimalBasketStoreLine,
  PackageVariant,
  ProjectEstimate,
  ResolvedLine,
  StageEstimate,
  StoreBasket,
  StoreComparison,
  UnresolvedReason,
} from "./types";

/** Kontrakt na operacje DAO potrzebne do wyceny (read-only). */
export interface EstimateDeps {
  /** Produkt po EAN/GTIN (EAN pierwszy). null gdy brak dopasowania/kodów. */
  findProductByCode: (
    db: Database,
    code: { ean?: string | null; gtin?: string | null },
  ) => Promise<Product | null>;
  /** Produkt po DOKŁADNEJ nazwie + kategorii. null gdy brak dopasowania. */
  findProductByNameAndCategory: (
    db: Database,
    q: { normalizedName: string; category: string },
  ) => Promise<Product | null>;
  /** Wszystkie aktualne oferty produktu (dowolna kolejność). */
  listOffers: (db: Database, productId: string) => Promise<ProductOffer[]>;
}

const defaultDeps: EstimateDeps = {
  findProductByCode: async (db, code) =>
    (await findByEanOrGtin(db, code)) ?? null,
  findProductByNameAndCategory: async (db, q) =>
    (await findByNormalizedNameAndCategory(db, q.normalizedName, q.category)) ??
    null,
  listOffers: (db, productId) => listOffersForProduct(db, productId),
};

/** Product decision: offers older than 7 days cannot win a current comparison. */
export const MAX_COMPARABLE_OFFER_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function isComparableOffer(offer: ProductOffer, now = Date.now()): boolean {
  if (offer.purchaseMultiple !== undefined && (!Number.isSafeInteger(offer.purchaseMultiple) || offer.purchaseMultiple < 1 || offer.purchaseMultiple > 10_000)) return false;
  if (offer.minimumPackages !== undefined && (!Number.isSafeInteger(offer.minimumPackages) || offer.minimumPackages < 1 || offer.minimumPackages > 10_000)) return false;
  if (offer.maxPackages !== undefined && (!Number.isSafeInteger(offer.maxPackages) || offer.maxPackages < Math.ceil((offer.minimumPackages??1)/(offer.purchaseMultiple??1))*(offer.purchaseMultiple??1) || offer.maxPackages > 1_000_000_000)) return false;
  if(offer.verification){
    const {method,checkedAt,expiresAt}=offer.verification,checked=Date.parse(checkedAt),expires=Date.parse(expiresAt);
    if(method!=='browser'||!Number.isFinite(checked)||!Number.isFinite(expires)||expires!==checked+86400000||expires<=now||checked>now+300000||!(offer.fetchedAt instanceof Date)||checked!==offer.fetchedAt.getTime())return false;
  }
  if (!offer.source || /seed|fixture|mock|demo|reference/i.test(offer.source)) return false;
  const availability = (offer.availability ?? '').replace(/[\s_-]/g, '');
  if (/outofstock|unavailable|niedost[eę]pn|brak|preorder|backorder/i.test(availability)) return false;
  const fetched = offer.fetchedAt instanceof Date ? offer.fetchedAt.getTime() : NaN;
  if (!Number.isFinite(fetched) || fetched > now + 5 * 60 * 1000 || now - fetched > MAX_COMPARABLE_OFFER_AGE_MS) return false;
  const price = parsePriceToGrosze(offer.promoPrice ?? offer.price);
  return price !== null && price > 0;
}

/**
 * Wybiera najtańszą ofertę po cenie EFEKTYWNEJ (promo ?? regular) w groszach.
 * Gdy podano `store` — bierze pod uwagę tylko oferty z tego sklepu. Oferty bez
 * ceny są pomijane. Zwraca null, gdy nie ma żadnej kwalifikującej się oferty.
 * Czysta funkcja — bez I/O, w pełni testowalna.
 */
export function selectCheapestOffer(
  offers: readonly ProductOffer[],
  store?: string | null,
  purchase?: { quantity: number; product: Product },
): CheapestOffer | null {
  let best: CheapestOffer | null = null;
  let bestTotal = Infinity;
  for (const offer of offers) {
    if (!isComparableOffer(offer)) continue;
    if (store && offer.store !== store) continue;
    const unitPriceGrosze = parsePriceToGrosze(offer.promoPrice ?? offer.price);
    if (unitPriceGrosze === null) continue;
    const count = purchase ? computePackagesNeeded(purchase.quantity, resolvePackageSize(offer, purchase.product), offer.purchaseMultiple,offer.minimumPackages) : 1;
    if (purchase && offer.maxPackages !== undefined && count > offer.maxPackages) continue;
    const total = count * unitPriceGrosze;
    if (best === null || total < bestTotal || (total === bestTotal && unitPriceGrosze < best.unitPriceGrosze)) {
      bestTotal = total;
      best = {
        offer,
        store: offer.store,
        url: offer.productUrl,
        unitPriceGrosze,
      };
    }
  }
  return best;
}

/**
 * Wielkość opakowania do zaokrąglania: preferuje `packageSize` OFERTY (konkretny
 * wariant sprzedaży), potem PRODUKTU. Gdy brak/niepoprawna (<= 0) — zwraca 1
 * (traktujemy cenę jako za pojedynczą sztukę). numeric w DAO to string.
 */
export function resolvePackageSize(
  offer: ProductOffer,
  product: Product,
): number {
  const raw = offer.packageSize ?? product.packageSize;
  const n = raw === null || raw === undefined ? NaN : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Grupuje oferty po wielkości opakowania, wielokrotności i minimum zakupu.
 * Tańsza sztuka kupowana po dziesięć nie zastępuje oferty sprzedaży pojedynczo.
 * W każdej takiej grupie bierze najtańszą cenę promo ?? regular. Filtr `store`
 * uwzględnia tylko oferty z tego sklepu (spójnie z selectCheapestOffer).
 *
 * To realizacja „wariantów tego samego materiału" oparta na danych, które już
 * mamy na pozycji (oferty produktu) — bez dodatkowego zapytania do katalogu. Gdy
 * oferty mają jedną wielkość, wychodzi jeden wariant (optymizer = N×rozmiar).
 * Czysta funkcja — bez I/O.
 */
export function buildPackageVariants(
  offers: readonly ProductOffer[],
  product: Product,
  store?: string | null,
): PackageVariant[] {
  // Klucz obejmuje także partię zakupu; cena nadal dotyczy jednej sztuki.
  const bySize = new Map<string, PackageVariant>();
  for (const offer of offers) {
    if (!isComparableOffer(offer)) continue;
    if (store && offer.store !== store) continue;
    const unitPriceGrosze = parsePriceToGrosze(offer.promoPrice ?? offer.price);
    if (unitPriceGrosze === null) continue;
    const packageSize = resolvePackageSize(offer, product);
    const purchaseMultiple = offer.purchaseMultiple ?? 1;
    const minimumPackages = offer.minimumPackages ?? 1;
    // Finite stocks from different shops add up. Keeping only the cheapest
    // same-size offer would discard the stock needed to finish a split order.
    const key = offer.maxPackages === undefined ? `${packageSize}:${purchaseMultiple}:${minimumPackages}` : `stock:${offer.id}`;
    const existing = bySize.get(key);
    if (existing === undefined || unitPriceGrosze < existing.unitPriceGrosze) {
      bySize.set(key, {
        packageSize,
        ...(purchaseMultiple > 1 ? { purchaseMultiple } : {}),
        ...(minimumPackages > 1 ? { minimumPackages } : {}),
        ...(offer.maxPackages !== undefined ? {maxPackages:offer.maxPackages} : {}),
        ...(offer.verification ? {verification:offer.verification} : {}),
        unitPriceGrosze,
        store: offer.store,
        url: offer.productUrl,
        offerId: offer.id,
      });
    }
  }
  return [...bySize.values()];
}

/** Wybiera produkt: NAJPIERW EAN/GTIN, potem nazwa+kategoria (obie wymagane). */
async function resolveProduct(
  db: Database,
  deps: EstimateDeps,
  query: ItemQuery,
): Promise<{ product: Product | null; hadCriteria: boolean }> {
  const ean = query.ean?.trim() || null;
  const gtin = query.gtin?.trim() || null;
  const name = query.normalizedName?.trim() || null;
  const category = query.category?.trim() || null;

  const hadCriteria = Boolean(ean || gtin || (name && category));
  if (!hadCriteria) return { product: null, hadCriteria: false };

  if (ean || gtin) {
    const byCode = await deps.findProductByCode(db, { ean, gtin });
    if (byCode) return { product: byCode, hadCriteria };
  }
  // Dopasowanie po nazwie WYŁĄCZNIE razem z kategorią (nigdy po samej nazwie).
  if (name && category) {
    const byName = await deps.findProductByNameAndCategory(db, {
      normalizedName: name,
      category,
    });
    if (byName) return { product: byName, hadCriteria };
  }
  return { product: null, hadCriteria };
}

async function estimateLine(
  db: Database,
  deps: EstimateDeps,
  item: EstimateItem,
  options: EstimateOptions,
): Promise<EstimateLine> {
  const unit = item.unit ?? null;
  const base = { query: item.query, quantity: item.quantity, unit };

  const { product, hadCriteria } = await resolveProduct(db, deps, item.query);
  if (!product) {
    const reason: UnresolvedReason = hadCriteria ? "no-product" : "no-query";
    return { resolved: false, ...base, reason, lineCost: 0 };
  }

  // A user's store choice applies to every downstream plan, including project
  // consolidation and delivery. Retaining other stores here let those plans
  // silently undo the choice after the individual stage had respected it.
  const offers = (await deps.listOffers(db, product.id)).filter(offer =>
    isComparableOffer(offer) && (!options.store || offer.store === options.store));
  if (!offers.length) {
    return { resolved: false, ...base, reason: "no-offer", lineCost: 0 };
  }
  const variants = buildPackageVariants(offers, product, options.store);
  const packagePlan = optimizePackages(item.quantity, variants);
  if (!packagePlan) return {resolved:false,...base,reason:offers.some(o=>o.maxPackages!==undefined)?'insufficient-stock':'no-offer',lineCost:0};
  const wholeOffer=selectCheapestOffer(offers,options.store,{quantity:item.quantity,product});
  // The detailed package plan also supports a split when no single shop can
  // supply everything. Its total is the baseline in that case.
  const cheapestOffer=wholeOffer??selectCheapestOffer(offers,options.store)!;

  const packageSize = resolvePackageSize(cheapestOffer.offer, product);
  const packagesNeeded = wholeOffer ? computePackagesNeeded(item.quantity, packageSize, cheapestOffer.offer.purchaseMultiple,cheapestOffer.offer.minimumPackages) : packagePlan.packages.reduce((sum,entry)=>sum+entry.count,0);
  const lineCost = wholeOffer ? packagesNeeded * cheapestOffer.unitPriceGrosze : packagePlan.totalGrosze;

  return {
    resolved: true,
    ...base,
    product,
    cheapestOffer,
    offers,
    packageSize,
    packagesNeeded,
    lineCost,
    packagePlan,
  };
}

/**
 * Wycena JEDNEGO etapu remontu. Dla każdej pozycji dopasowuje produkt, wybiera
 * najtańszą aktualną ofertę i liczy koszt z uwzględnieniem opakowań. Pozycje
 * nierozpoznane trafiają do `unresolved[]` i NIE wchodzą do sumy etapu.
 */
export async function estimateStageCost(
  db: Database,
  items: readonly EstimateItem[],
  options: EstimateOptions = {},
  deps: EstimateDeps = defaultDeps,
): Promise<StageEstimate> {
  const lines: EstimateLine[] = [];
  for (const item of items) {
    lines.push(await estimateLine(db, deps, item, options));
  }

  const reconciled = reconcileStock([{lines,unresolved:[],stageTotalGrosze:0}])[0];
  const unresolved = reconciled.lines.filter(
    (l): l is Extract<EstimateLine, { resolved: false }> => !l.resolved,
  );
  const stageTotalGrosze = reconciled.lines.reduce((sum, l) => sum + l.lineCost, 0);

  return { lines:reconciled.lines, unresolved, stageTotalGrosze };
}

/**
 * Konsolidacja materiałów w całym remoncie („kup raz, licz opakowania łącznie").
 * Grupuje rozpoznane pozycje WSZYSTKICH etapów po produkcie (ten sam `product.id`
 * = ten sam produkt, niezależnie czy trafiony po EAN czy nazwie+kategorii),
 * SUMUJE ilości natywne i DOPIERO na zsumowanej ilości liczy opakowania i koszt.
 *
 * Czysta funkcja — bez I/O. Najtańsza oferta i wielkość opakowania są dla danego
 * produktu deterministyczne (te same oferty + ta sama opcja `store` w każdym
 * etapie), więc bierzemy je z pierwszej rozpoznanej pozycji produktu — nie ma
 * potrzeby ponownego odpytywania katalogu.
 *
 * Zaokrąglenie w górę raz na zsumowanej ilości jest zawsze <= sumie zaokrągleń
 * per-etap (ceil(a+b) <= ceil(a)+ceil(b)), więc `savingsGrosze` >= 0.
 */
/**
 * Grupa rozpoznanych pozycji JEDNEGO produktu zebranych ze wszystkich etapów.
 * Wspólna baza dla konsolidacji (consolidateProject) i porównania sklepów
 * (compareStores) — grupowanie po `product.id` liczymy raz i tak samo.
 */
interface ProductGroup {
  wallpaperCutPlan?: WallpaperCutPlan;
  product: ResolvedLine["product"];
  /** Najtańsza oferta produktu (bez filtra sklepu) — koszyk optymalny. */
  cheapestOffer: CheapestOffer;
  /** Wszystkie oferty produktu (do liczenia kosztu per sklep). */
  offers: readonly ProductOffer[];
  /** Wielkość opakowania najtańszej oferty (do zaokrąglenia koszyka optymalnego). */
  packageSize: number;
  unit: string | null;
  totalQuantity: number;
  perStageCostGrosze: number;
}

/**
 * Grupuje rozpoznane pozycje WSZYSTKICH etapów po `product.id`, sumując ilości
 * natywne. Oferty/najtańsza oferta/wielkość opakowania są deterministyczne dla
 * produktu, więc bierzemy je z pierwszej rozpoznanej pozycji. Kolejność wyniku =
 * pierwsze wystąpienie produktu. Czysta funkcja — bez I/O.
 */
export function groupProjectByProduct(
  stages: readonly StageEstimate[],
): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();
  const cuts = new Map<string, { panels: WallpaperPanel[]; quantity: number }>();
  for (const [stageIndex, stage] of stages.entries()) {
    for (const line of stage.lines) {
      if (!line.resolved) continue;
      const key = line.product.id;
      if (line.plainWallpaper && line.product.ean === ERISMANN_3333_5_EAN && line.unit === 'szt' && line.packageSize === 1) {
        const entry = cuts.get(key) ?? { panels: [], quantity: 0 };
        entry.quantity += line.quantity;
        entry.panels.push(...line.plainWallpaper.panels.map(panel => ({ ...panel, id: `${stageIndex}:${panel.id}` })));
        cuts.set(key, entry);
      }
      const existing = groups.get(key);
      if (existing) {
        existing.totalQuantity += line.quantity;
        existing.perStageCostGrosze += line.lineCost;
        if (existing.unit === null && line.unit !== null) existing.unit = line.unit;
      } else {
        groups.set(key, {
          product: line.product,
          cheapestOffer: line.cheapestOffer,
          offers: line.offers,
          packageSize: line.packageSize,
          unit: line.unit,
          totalQuantity: line.quantity,
          perStageCostGrosze: line.lineCost,
        });
      }
    }
  }
  return [...groups.values()].map(group => {
    const request = cuts.get(group.product.id), plan = request && planPlainWallpaperPanels(request.panels, ERISMANN_3333_5_ROLL);
    if (plan && plan.rollsNeeded <= request!.quantity) group = { ...group, totalQuantity: group.totalQuantity - request!.quantity + plan.rollsNeeded, wallpaperCutPlan: plan };
    const cheapest = selectCheapestOffer(group.offers, undefined, { quantity: group.totalQuantity, product: group.product });
    return cheapest ? { ...group, cheapestOffer: cheapest, packageSize: resolvePackageSize(cheapest.offer, group.product) } : group;
  });
}

export function consolidateProject(
  stages: readonly StageEstimate[],
): ConsolidatedShoppingList {
  const groups = groupProjectByProduct(stages);

  const lines: ConsolidatedLine[] = [];
  for (const g of groups) {
    const packagePlan = optimizePackages(g.totalQuantity, buildPackageVariants(g.offers, g.product));
    if (!packagePlan) continue;
    const packagesNeeded = packagePlan?.packages.reduce((sum, entry) => sum + entry.count, 0) ?? computePackagesNeeded(g.totalQuantity, g.packageSize);
    const lineCostGrosze = packagePlan?.totalGrosze ?? packagesNeeded * g.cheapestOffer.unitPriceGrosze;
    lines.push({
      ...(g.wallpaperCutPlan ? { wallpaperCutPlan: g.wallpaperCutPlan } : {}),
      ...(packagePlan ? { packagePlan } : {}),
      product: g.product,
      cheapestOffer: g.cheapestOffer,
      totalQuantity: g.totalQuantity,
      unit: g.unit,
      packageSize: g.packageSize,
      packagesNeeded,
      lineCostGrosze,
      perStageCostGrosze: g.perStageCostGrosze,
      savingsGrosze: g.perStageCostGrosze - lineCostGrosze,
    });
  }

  const consolidatedTotalGrosze = lines.reduce((s, l) => s + l.lineCostGrosze, 0);
  const perStageTotalGrosze = lines.reduce((s, l) => s + l.perStageCostGrosze, 0);
  return {
    lines,
    consolidatedTotalGrosze,
    perStageTotalGrosze,
    savingsGrosze: perStageTotalGrosze - consolidatedTotalGrosze,
  };
}

/**
 * Porównanie sklepów dla skonsolidowanej listy zakupowej całego remontu.
 *
 * Dla KAŻDEGO sklepu występującego w ofertach liczy koszt kupienia u niego całej
 * listy: per produkt bierze jego NAJTAŃSZĄ ofertę W TYM sklepie, zaokrągla
 * zsumowaną ilość w górę do opakowania tego sklepu i sumuje. Produkty bez oferty
 * w danym sklepie są niepokryte (`missingCount`) i NIE wchodzą do sumy.
 *
 * Koszyk optymalny = suma najtańszych ofert per produkt (globalnie, bez filtra
 * sklepu) — liczony tą samą metodą co `consolidateProject`, więc równy
 * `consolidatedTotalGrosze`. `optimalByStore` pokazuje, z którego sklepu pochodzi
 * każda najtańsza pozycja.
 *
 * Czysta funkcja — bez I/O (oferty są już na rozpoznanych pozycjach etapów).
 * Wszystko w GROSZACH (integer).
 */
export function compareStores(
  stages: readonly StageEstimate[],
): StoreComparison {
  const groups = groupProjectByProduct(stages);

  // --- Koszyk optymalny (najtańsze per produkt, spójny z konsolidacją) --------
  let optimalBasketGrosze = 0;
  const optimalByStoreMap = new Map<string, OptimalBasketStoreLine>();
  for (const g of groups) {
    const plan = optimizePackages(g.totalQuantity, buildPackageVariants(g.offers, g.product));
    if (!plan) continue;
    optimalBasketGrosze += plan.totalGrosze;
    const countedStores = new Set<string>();
    for (const entry of plan.packages) {
      const store = entry.store;
      const acc = optimalByStoreMap.get(store);
      const itemCount = countedStores.has(store) ? 0 : 1;
      countedStores.add(store);
      if (acc) {
        acc.totalGrosze += entry.lineCostGrosze;
        acc.itemCount += itemCount;
      } else {
        optimalByStoreMap.set(store, { store, totalGrosze: entry.lineCostGrosze, itemCount });
      }
    }
  }
  const optimalByStore = [...optimalByStoreMap.values()].sort(
    (a, b) => a.totalGrosze - b.totalGrosze || a.store.localeCompare(b.store),
  );

  // --- Zbiór wszystkich sklepów występujących w ofertach ----------------------
  const storeNames = new Set<string>();
  for (const g of groups) {
    for (const offer of g.offers) storeNames.add(offer.store);
  }

  // --- Koszt CAŁEJ listy per sklep --------------------------------------------
  const stores: StoreBasket[] = [];
  for (const store of storeNames) {
    let totalGrosze = 0;
    let coveredCount = 0;
    const missingProductIds: string[] = [];
    for (const g of groups) {
      const plan = optimizePackages(g.totalQuantity, buildPackageVariants(g.offers, g.product, store));
      if (!plan) {
        missingProductIds.push(g.product.id);
        continue;
      }
      totalGrosze += plan.totalGrosze;
      coveredCount += 1;
    }
    stores.push({
      store,
      totalGrosze,
      coveredCount,
      missingCount: missingProductIds.length,
      missingProductIds,
    });
  }
  // Sortowanie rosnąco po sumie; remis: więcej pokrytych wyżej, potem nazwa.
  stores.sort(
    (a, b) =>
      a.totalGrosze - b.totalGrosze ||
      b.coveredCount - a.coveredCount ||
      a.store.localeCompare(b.store),
  );

  // Najtańszy sklep z PEŁNYM pokryciem (lista jest już posortowana rosnąco).
  const cheapestFullStore =
    stores.find((s) => s.missingCount === 0 && groups.length > 0) ?? null;
  const singleStoreExtraGrosze = cheapestFullStore
    ? cheapestFullStore.totalGrosze - optimalBasketGrosze
    : null;

  return {
    productCount: groups.length,
    optimalBasketGrosze,
    optimalByStore,
    stores,
    cheapestFullStore,
    singleStoreExtraGrosze,
  };
}

/**
 * Sumuje już wyliczone etapy do wyceny całego remontu. Czysta agregacja — nie
 * odpytuje DB (etapy policz wcześniej przez estimateStageCost). Dokłada trzy
 * warstwy: koszt per-etap (`projectTotalGrosze`), skonsolidowaną listę zakupową
 * (`consolidated`) ORAZ porównanie sklepów (`storeComparison`).
 */
export function estimateProjectCost(
  stages: readonly StageEstimate[],
): ProjectEstimate {
  stages = reconcileStock(stages);
  const projectTotalGrosze = stages.reduce(
    (sum, s) => sum + s.stageTotalGrosze,
    0,
  );
  // Robocizna: suma pól per-etap (0 dla etapów bez rozbicia robocizny). Pola są
  // ADDYTYWNE — `projectTotalGrosze` (materiały) pozostaje bez zmian.
  const laborTotalGrosze = stages.reduce(
    (sum, s) => sum + (s.laborTotalGrosze ?? 0),
    0,
  );
  return {
    stages: [...stages],
    projectTotalGrosze,
    materialsTotalGrosze: projectTotalGrosze,
    laborTotalGrosze,
    projectTotalWithLaborGrosze: projectTotalGrosze + laborTotalGrosze,
    consolidated: consolidateProject(stages),
    storeComparison: compareStores(stages),
  };
}

/** A shelf stock belongs to the complete purchase, not independently to every
 * stage/room. Withdraw all affected stage prices when their shared demand
 * cannot be covered; otherwise a partial project could look fully priced. */
export function reconcileStock(stages:readonly StageEstimate[]):StageEstimate[]{
  const missing=new Set(groupProjectByProduct(stages).filter(g=>g.offers.some(o=>o.maxPackages!==undefined)&&!optimizePackages(g.totalQuantity,buildPackageVariants(g.offers,g.product))).map(g=>g.product.id));
  if(!missing.size)return [...stages];
  return stages.map(stage=>{
    const lines:EstimateLine[]=stage.lines.map(line=>line.resolved&&missing.has(line.product.id)?{resolved:false,query:line.query,quantity:line.quantity,unit:line.unit,reason:'insufficient-stock',lineCost:0}:line);
    const stageTotalGrosze=lines.reduce((sum,line)=>sum+line.lineCost,0);
    return{...stage,lines,unresolved:lines.filter((l):l is Extract<EstimateLine,{resolved:false}>=>!l.resolved),stageTotalGrosze,
      ...('materialsTotalGrosze' in stage?{materialsTotalGrosze:stageTotalGrosze}:{}),
      ...('stageTotalWithLaborGrosze' in stage?{stageTotalWithLaborGrosze:stageTotalGrosze+(stage.laborTotalGrosze??0)}:{})};
  });
}
