import type {PurchaseOffer} from '../../../../lib/pricing-service/src/types';
import {isComparableOffer, MAX_COMPARABLE_OFFER_AGE_MS} from '../../../../lib/pricing-service/src/estimate';
import type {CatalogAvailabilityProduct, CatalogAvailabilitySnapshot} from '../../../../lib/pricing-service/src/catalog-availability';
import type {RetailSource, RetailObservation} from './retail-pages';
import {retailComparableEan} from './retail-sku';

/** Uses the exact same admitted, current offers as the basket engine. Reading
 * this endpoint does not contact merchants or change any saved project.
 */
export function catalogAvailability(sources: readonly RetailSource[], offers: readonly PurchaseOffer[], observations: ReadonlyMap<string,RetailObservation>, now = Date.now()): CatalogAvailabilitySnapshot {
  const products = new Map<string,CatalogAvailabilityProduct>();
  let expiresAt = now + 30_000;
  for (const offer of offers) {
    const source = sources.find(s => s.id === offer.id), observed = observations.get(offer.id);
    if (!source || source.disabledReason || source.pickupOnly || !observed || !isComparableOffer(offer,now)) continue;
    const ean = retailComparableEan(source);
    if (!/^\d{13}$/.test(ean)) continue;
    const key = JSON.stringify([ean,source.category,source.packageSize,source.unit]);
    let product = products.get(key);
    if (!product) {
      product = {ean,category:source.category,packageSize:source.packageSize,unit:source.unit,stores:[],lastCheckedAt:observed.observedAt};
      products.set(key,product);
    }
    if (!product.stores.includes(source.store)) product.stores.push(source.store);
    if (Date.parse(observed.observedAt) > Date.parse(product.lastCheckedAt)) product.lastCheckedAt = observed.observedAt;
    expiresAt = Math.min(expiresAt,offer.fetchedAt!.getTime() + MAX_COMPARABLE_OFFER_AGE_MS,
      observed.validUntil ? Date.parse(observed.validUntil) : Infinity,
      offer.verification ? Date.parse(offer.verification.expiresAt) : Infinity);
  }
  return {version:1,complete:true,channel:'online',currency:'PLN',deliveryIncluded:false,generatedAt:new Date(now).toISOString(),maxAgeMs:Math.max(0,Math.floor(expiresAt-now)),products:[...products.values()]};
}
