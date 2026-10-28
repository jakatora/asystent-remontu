import {compareAutomaticDelivery} from './automatic-delivery';
import {groupProjectByProduct,buildPackageVariants,isComparableOffer} from './estimate';
import {optimizePackages} from './package-optimizer';
import type {StageEstimate,ItemQuery} from './types';
import type {BasketQuoter,DeliverySettings,StoreDeliveryPolicy,DeliveryComparison} from './delivery';

/** Quote only whole product requirements which this chosen store can fulfil.
 * The complete renovation remains partial, with no full-basket winner. Do not
 * quietly shop elsewhere, drop a room or reduce a product to the stock limit. */
export async function compareDeliveryWithAvailablePart(
 stages:readonly StageEstimate[],settings:DeliverySettings,quoteBasket:BasketQuoter,
 policies:readonly StoreDeliveryPolicy[]=[],now=new Date(),
 knownUnavailableStores:Readonly<Record<string,string>>={},selectedStore?:string,
):Promise<DeliveryComparison>{
 const comparison=await compareAutomaticDelivery(stages,settings,quoteBasket,policies,now,knownUnavailableStores);
 if(!selectedStore||comparison.status!=='partial'||comparison.best||settings.mode!=='shipping'||settings.method==='manual'||!/^\d{2}-\d{3}$/.test(settings.postalCode??''))return comparison;
 const selected=stages.map(stage=>({...stage,lines:stage.lines.map(line=>line.resolved?{...line,offers:line.offers.filter(o=>o.store===selectedStore&&isComparableOffer(o,now.getTime()))}:line)}));
 const unresolved=selected.flatMap(s=>s.lines).filter(l=>!l.resolved&&l.quantity>0);
 const groups=groupProjectByProduct(selected).filter(group=>group.totalQuantity>0);
 const matches=(a:ItemQuery,b:ItemQuery)=>Boolean(a.ean&&[b.ean,b.gtin].includes(a.ean)||a.gtin&&[b.ean,b.gtin].includes(a.gtin)||a.normalizedName&&a.category&&a.normalizedName===b.normalizedName&&a.category===b.category);
 const accepted=new Set(groups.filter(group=>{
  const identities:ItemQuery[]=[{ean:group.product.ean,gtin:group.product.gtin,normalizedName:group.product.normalizedName,category:group.product.category},...selected.flatMap(s=>s.lines).flatMap(l=>l.resolved&&l.product.id===group.product.id?[l.query]:[])];
  if(unresolved.some(line=>identities.some(id=>matches(line.query,id))))return false;
  return Boolean(optimizePackages(group.totalQuantity,buildPackageVariants(group.offers,group.product)));
 }).map(group=>group.product.id));
 if(!accepted.size)return comparison;
 const subset=selected.map(stage=>({...stage,lines:stage.lines.filter(line=>line.resolved&&accepted.has(line.product.id)),unresolved:[]}));
 const part=await compareAutomaticDelivery(subset,settings,quoteBasket,policies,now,knownUnavailableStores);
 const basket=part.best&&part.best.stores.length===1&&part.best.stores[0].store===selectedStore?part.best:null;
 return{...comparison,...(part.stockLimits?.length?{stockLimits:part.stockLimits}:{}),availablePart:{store:selectedStore,productCount:accepted.size,basket,...(!basket?{unavailableReason:part.stockLimits?.length?'insufficient_stock':part.unavailableStores?.find(s=>s.store===selectedStore)?.reason??'quote_unavailable'}:{})}};
}
