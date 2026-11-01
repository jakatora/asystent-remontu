import type { DeliveredBasket, DeliveryComparison, DeliveryQuote, DeliverySettings } from '../../../../lib/pricing-service/src/delivery';
import { normalizeDeliveryPostalCode } from './deliveryInput';
import {extraPackageAdditions,type ExtraPackageAddition} from '../../../../lib/pricing-service/src/extra-package-difference';
export type BasketChoice = 'lowest' | 'single_store' | 'fewer_stores' | 'extra_packages';
const money = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
function currentQuote(quote: DeliveryQuote | undefined, postalCode: string, now: number): boolean {
  if (!quote || !money(quote.costGrosze) || !/^https:\/\//.test(quote.sourceUrl ?? '') || !/^[a-f0-9]{64}$/.test(quote.evidenceSha256 ?? '')) return false;
  const checked = Date.parse(quote.checkedAt), expires = Date.parse(quote.expiresAt);
  return Number.isFinite(checked) && checked <= now + 5000 && Number.isFinite(expires) && expires > now && expires > checked && expires - checked <= 600000
    && (quote.destinationScope === 'PL' && ['retailer_basket_national', 'retailer_tariff_national'].includes(quote.basis)
      || quote.destinationScope === 'postal_code' && quote.postalCode === postalCode && quote.basis === 'retailer_basket_postcode');
}
/** Only complete retailer-confirmed amounts can be offered as a payable choice.
 * Keep native cart discounts/rounding and separately quoted orders intact. */
export function confirmedDeliveredBasket(basket: DeliveredBasket | null | undefined, postalCode: string, now = Date.now()): basket is DeliveredBasket {
  if (!basket || !basket.stores.length || !money(basket.materialsGrosze) || !money(basket.deliveryGrosze) || !money(basket.totalGrosze)
    || basket.materialsGrosze + basket.deliveryGrosze !== basket.totalGrosze || new Set(basket.stores.map(s => s.store)).size !== basket.stores.length) return false;
  for (const store of basket.stores) {
    if (!store.store || store.source !== 'retailer' || !money(store.materialsGrosze) || !money(store.deliveryGrosze) || !money(store.totalGrosze)
      || store.materialsGrosze + store.deliveryGrosze !== store.totalGrosze || !currentQuote(store.quote, postalCode, now) || store.quote!.costGrosze !== store.deliveryGrosze || !store.lines.length) return false;
    let packTotal = 0, packCount = 0;
    for (const line of store.lines) {
      if (!line.packages.length) return false;
      for (const pack of line.packages) {
        if (pack.store !== store.store || !pack.offerId || !Number.isSafeInteger(pack.count) || pack.count < 1 || !Number.isFinite(pack.packageSize) || pack.packageSize <= 0
          || !money(pack.lineCostGrosze) || !money(pack.unitPriceGrosze) || pack.verification && (!Number.isFinite(Date.parse(pack.verification.expiresAt)) || Date.parse(pack.verification.expiresAt) <= now)) return false;
        packTotal += pack.lineCostGrosze; packCount += pack.count;
      }
    }
    const rounding = store.quote!.materialsRoundingGrosze ?? 0;
    if (!money(packTotal) || !Number.isSafeInteger(packCount) || !Number.isSafeInteger(rounding) || Math.abs(rounding) > packCount || packTotal + rounding !== store.materialsGrosze) return false;
    if (store.quote!.orders && (!store.quote!.orders.length || store.quote!.orders.some(order => !money(order.materialsGrosze) || !currentQuote(order.quote, postalCode, now))
      || store.quote!.orders.reduce((sum, order) => sum + order.materialsGrosze, 0) !== store.materialsGrosze
      || store.quote!.orders.reduce((sum, order) => sum + order.quote.costGrosze, 0) !== store.deliveryGrosze)) return false;
  }
  return basket.stores.reduce((sum, store) => sum + store.materialsGrosze, 0) === basket.materialsGrosze
    && basket.stores.reduce((sum, store) => sum + store.deliveryGrosze!, 0) === basket.deliveryGrosze
    && basket.stores.reduce((sum, store) => sum + store.totalGrosze!, 0) === basket.totalGrosze;
}
export function basketOrderCount(basket: DeliveredBasket): number { return basket.stores.reduce((n, store) => n + Math.max(1, store.quote?.orders?.length ?? 1), 0); }
export function deliveredBasketKey(basket: DeliveredBasket): string {
  return JSON.stringify([basket.totalGrosze, basket.materialsGrosze, basket.deliveryGrosze, basket.stores.map(store => [store.store, store.totalGrosze, store.quote?.orders?.length ?? 1,
    store.lines.flatMap(line => line.packages.map(pack => [line.product.id, pack.offerId, pack.count, pack.packageSize, pack.lineCostGrosze, pack.cutRoll ?? null])).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))]).sort((a, b) => String(a[0]).localeCompare(String(b[0])))]);
}
export interface ConfirmedBasketOptions { lowest: DeliveredBasket; singleStore: DeliveredBasket | null; extraGrosze: number | null; alreadySingleStore: boolean;
  fewerStores:{basket:DeliveredBasket;extraGrosze:number}|null;
  extraPackages:{basket:DeliveredBasket;savingGrosze:number;additions:ExtraPackageAddition[]}|null }
export function confirmedBasketOptions(comparison: DeliveryComparison | undefined, settings: DeliverySettings, selectedStore?: string | null, now = Date.now()): ConfirmedBasketOptions | null {
  const postalCode = normalizeDeliveryPostalCode(settings.postalCode ?? '');
  if (!comparison || settings.mode !== 'shipping' || comparison.mode !== 'shipping' || comparison.method !== 'automatic' || comparison.postalCode !== postalCode
    || !/^\d{2}-\d{3}$/.test(postalCode ?? '') || (settings.allowSeparateOrders ?? true) !== (comparison.allowSeparateOrders ?? false)
    || comparison.missingProductCount !== 0 || !['compared', 'needs_delivery_costs'].includes(comparison.status) || !confirmedDeliveredBasket(comparison.best, postalCode!, now)) return null;
  const lowest = comparison.best;
  const proposed=comparison.extraPackageOption;
  const additions=proposed&&comparison.allowExtraPackages===true&&settings.allowExtraPackages!==false&&money(proposed.savingGrosze)&&proposed.savingGrosze>0
    &&confirmedDeliveredBasket(proposed.basket,postalCode!,now)&&proposed.basket.totalGrosze! < lowest.totalGrosze!
    &&lowest.totalGrosze! - proposed.basket.totalGrosze! === proposed.savingGrosze?extraPackageAdditions(lowest,proposed.basket):null;
  const extraPackages=proposed&&additions?{...proposed,additions}:null;
  if(selectedStore&&(!extraPackages||lowest.stores.length!==1||lowest.stores[0].store!==selectedStore))return null;
  if (lowest.stores.length === 1) return { lowest, singleStore: lowest, extraGrosze: 0, alreadySingleStore: true,extraPackages,fewerStores:null };
  // Older APIs may expose a one-store choice in their sorted alternatives.
  const candidate = comparison.cheapestSingleStore === undefined ? comparison.alternatives.find(b => b.stores.length === 1) : comparison.cheapestSingleStore;
  const singleStore = candidate?.stores.length === 1 && confirmedDeliveredBasket(candidate, postalCode!, now) && candidate.totalGrosze! >= lowest.totalGrosze! ? candidate : null;
  const fewerCandidate = comparison.cheapestFewerStores === undefined
    ? [...comparison.alternatives].filter(b=>b.stores.length>1&&b.stores.length<lowest.stores.length&&confirmedDeliveredBasket(b,postalCode!,now)).sort((a,b)=>a.totalGrosze!-b.totalGrosze!||a.stores.length-b.stores.length)[0]
    : comparison.cheapestFewerStores;
  const fewerStores = fewerCandidate && fewerCandidate.stores.length>1 && fewerCandidate.stores.length<lowest.stores.length
    && confirmedDeliveredBasket(fewerCandidate,postalCode!,now) && fewerCandidate.totalGrosze!>=lowest.totalGrosze!
    && (!singleStore || fewerCandidate.totalGrosze!<singleStore.totalGrosze!)
    ? {basket:fewerCandidate,extraGrosze:fewerCandidate.totalGrosze!-lowest.totalGrosze!}:null;
  return { lowest, singleStore, extraGrosze: singleStore ? singleStore.totalGrosze! - lowest.totalGrosze! : null, alreadySingleStore: false,extraPackages,fewerStores };
}
export function basketForChoice(comparison: DeliveryComparison | undefined, choice: BasketChoice, now = Date.now()): DeliveredBasket | null {
  if (choice === 'lowest') return comparison?.best ?? null;
  if (!comparison) return null;
  const options=confirmedBasketOptions(comparison, { mode: comparison.mode, postalCode: comparison.postalCode ?? undefined, allowSeparateOrders: comparison.allowSeparateOrders }, undefined, now);
  return choice==='single_store'?options?.singleStore??null:choice==='fewer_stores'?options?.fewerStores?.basket??null:choice==='extra_packages'?options?.extraPackages?.basket??null:null;
}
