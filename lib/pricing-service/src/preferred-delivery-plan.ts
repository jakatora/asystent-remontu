import {buildPackageVariants,isComparableOffer,type ProductGroup} from './estimate';
import {irreduciblePackagePlan} from './mixed-package-plans';
import {DELIVERY_LIMITS} from './delivery-limits';
import type {DeliveredBasket,DeliveredStoreBasket} from './delivery';
import type {PackagePlanEntry} from './types';

/** Search intent only. No previous prices, freight, discounts or evidence. */
export type PreferredDeliveryPlan = readonly {
  store:string;
  packs:readonly {offerId:string;productId:string;unit:string|null;packageSize:number;count:number}[];
}[];

export function rememberDeliveryAllocation(basket:DeliveredBasket):PreferredDeliveryPlan|null {
  if(!basket.stores.length||basket.stores.length>DELIVERY_LIMITS.stores)return null;
  const plan=basket.stores.map(order=>({store:order.store,packs:order.lines.flatMap(line=>line.packages.map(pack=>({
    offerId:pack.offerId,productId:line.product.id,unit:line.unit,packageSize:pack.packageSize,count:pack.count,
  })))}));
  // A cut requires its full dimensional plan, not an area-only hint.
  if(basket.stores.some(order=>order.lines.some(line=>line.packages.some(pack=>pack.cutRoll)))||plan.reduce((n,o)=>n+o.packs.length,0)>1000)return null;
  return plan;
}

/** Rebind the entire previous allocation to current offers, then quote it as
 * a new candidate. Any missing product, different size, locked-size deficit,
 * stale observation or current stock/lot rejection discards the whole hint. */
export function rebuildDeliveryAllocation(
  plan:PreferredDeliveryPlan,groups:readonly ProductGroup[],now:Date,blocked:ReadonlySet<string>=new Set(),
):DeliveredStoreBasket[]|null {
  if(!groups.length||groups.some(group=>group.cutRoll)||!plan.length||plan.length>DELIVERY_LIMITS.stores)return null;
  if(plan.reduce((n,o)=>n+o.packs.length,0)>1000||new Set(plan.map(o=>o.store)).size!==plan.length)return null;
  const purchased=groups.map(()=>[] as PackagePlanEntry[]),seen=new Set<string>(),orders:DeliveredStoreBasket[]=[];
  for(const intent of plan){
    if(!intent.packs.length||blocked.has(intent.store))return null;
    const order:DeliveredStoreBasket={store:intent.store,materialsGrosze:0,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown',lines:[]};
    for(const pack of intent.packs){
      if(seen.has(pack.offerId)||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>DELIVERY_LIMITS.packagesPerProduct)return null;
      seen.add(pack.offerId);
      const matches=groups.flatMap((group,index)=>group.offers.filter(o=>o.id===pack.offerId&&o.store===intent.store&&isComparableOffer(o,now.getTime())).map(offer=>({group,index,offer})));
      if(matches.length!==1)return null;
      const {group,index,offer}=matches[0],variant=buildPackageVariants([offer],group.product)[0];
      if(!variant||variant.packageSize!==pack.packageSize||(variant.product??group.product).id!==pack.productId||group.unit!==pack.unit||
        pack.count%(variant.purchaseMultiple??1)!==0||pack.count<(variant.minimumPackages??1)||pack.count>(variant.maxPackages??Infinity))return null;
      const actual:PackagePlanEntry={...variant,count:pack.count,lineCostGrosze:variant.unitPriceGrosze*pack.count};
      if(!Number.isSafeInteger(actual.lineCostGrosze)||actual.unitPriceGrosze<=0)return null;
      purchased[index].push(actual);
      let line=order.lines.find(line=>line.product.id===pack.productId);
      if(!line){line={product:variant.product??group.product,unit:group.unit,packages:[]};order.lines.push(line);}
      line.packages.push(actual);order.materialsGrosze+=actual.lineCostGrosze;
    }
    if(!Number.isSafeInteger(order.materialsGrosze))return null;
    orders.push(order);
  }
  if(groups.some((group,index)=>!irreduciblePackagePlan(group.totalQuantity,purchased[index],group.requiredBySize)))return null;
  return orders.sort((a,b)=>a.store.localeCompare(b.store));
}
