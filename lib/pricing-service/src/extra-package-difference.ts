import type {DeliveredBasket,DeliveredProduct} from './delivery';
import type {PackagePlanEntry} from './types';

export interface ExtraPackageAddition {
  store:string;product:DeliveredProduct;unit:string|null;packageSize:number;
  baselinePackages:number;proposedPackages:number;extraPackages:number;
}
/** A surplus option adds whole packs of one existing SKU. It cannot substitute
 * another product, reduce a room's demand, or change an unrelated store order. */
export function extraPackageAdditions(base:DeliveredBasket,proposed:DeliveredBasket):ExtraPackageAddition[]|null{
  if(!base?.stores?.length||base.stores.length!==proposed?.stores?.length)return null;
  const additions:ExtraPackageAddition[]=[];
  for(const previous of base.stores){
    const orders=proposed.stores.filter(order=>order.store===previous.store);if(orders.length!==1)return null;
    const next=orders[0];
    const index=(order:typeof previous)=>{
      const entries=new Map<string,{pack:PackagePlanEntry;product:DeliveredProduct;unit:string|null;count:number;cost:number}>();
      for(const line of order.lines)for(const pack of line.packages){
        if(!Number.isSafeInteger(pack.count)||pack.count<1||!Number.isFinite(pack.packageSize)||pack.packageSize<=0||pack.store!==order.store)return null;
        const key=JSON.stringify([line.product.id,line.unit,pack.offerId,pack.packageSize,pack.url,pack.cutRoll??null]);
        const entry=entries.get(key);if(entry){entry.count+=pack.count;entry.cost+=pack.lineCostGrosze;}
        else entries.set(key,{pack,product:line.product,unit:line.unit,count:pack.count,cost:pack.lineCostGrosze});
      }
      return entries;
    };
    const before=index(previous),after=index(next);if(!before?.size||!after||before.size!==after.size)return null;
    let changed=false;
    for(const [key,entry]of before){
      const candidate=after.get(key);if(!candidate||candidate.count<entry.count)return null;
      if(candidate.count===entry.count)continue;
      const multiple=entry.pack.purchaseMultiple??1,minimum=entry.pack.minimumPackages??1;
      if(entry.pack.cutRoll||!Number.isSafeInteger(candidate.count)||!Number.isSafeInteger(multiple)||multiple<1||candidate.count%multiple||candidate.count<minimum
        ||candidate.count>Math.min(entry.pack.maxPackages??Infinity,candidate.pack.maxPackages??Infinity))return null;
      additions.push({store:previous.store,product:entry.product,unit:entry.unit,packageSize:entry.pack.packageSize,
        baselinePackages:entry.count,proposedPackages:candidate.count,extraPackages:candidate.count-entry.count});changed=true;
    }
    if(!changed&&(previous.materialsGrosze!==next.materialsGrosze||previous.deliveryGrosze!==next.deliveryGrosze||previous.totalGrosze!==next.totalGrosze
      ||[...before].some(([key,entry])=>after.get(key)!.cost!==entry.cost)))return null;
  }
  return additions.length===1?additions:null;
}
