import {createHash} from 'node:crypto';
import {groupProjectByProduct} from '../../../../lib/pricing-service/src/estimate';
import {compareDeliveryWithAvailablePart} from '../../../../lib/pricing-service/src/selected-store-delivery';
import {rememberDeliveryAllocation,type PreferredDeliveryPlan} from '../../../../lib/pricing-service/src/preferred-delivery-plan';

const stable=(value:unknown):string=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(key=>[key,v[key]])):v);

/** Per-service, bounded and transient search memory. A hint lives up to two
 * hours independently of quote validity, because it contains no payable data.
 * Reads never extend its lifetime. Restart/eviction simply restores cold search. */
export function createPreferredDeliveryComparison(now=Date.now,maxEntries=64){
  const memory=new Map<string,{savedAt:number;allocation:PreferredDeliveryPlan}>();
  const capacity=Math.min(64,Math.max(0,Math.floor(maxEntries)));
  return async (...args:Parameters<typeof compareDeliveryWithAvailablePart>)=>{
    const [stages,settings,quote,policies,date,unavailable,selectedStore]=args;
    const automatic=settings.mode==='shipping'&&settings.method!=='manual'&&/^\d{2}-\d{3}$/.test(settings.postalCode??'');
    const groups=automatic?groupProjectByProduct(stages).filter(g=>g.totalQuantity>0):[];
    const eligible=automatic&&groups.length>0&&!groups.some(g=>g.cutRoll)&&!stages.some(s=>s.lines.some(l=>!l.resolved&&l.quantity>0));
    const key=eligible?createHash('sha256').update(stable([
      settings.postalCode,settings.allowSeparateOrders!==false,settings.allowExtraPackages===true,selectedStore??null,
      groups.map(g=>[g.product.id,g.unit,g.totalQuantity,g.requiredBySize??null]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))),
    ])).digest('hex'):null;
    const time=now();
    for(const [key,entry]of memory)if(time-entry.savedAt>=2*60*60*1000||entry.savedAt>time)memory.delete(key);
    const previous=key?memory.get(key):undefined;
    if(previous&&key){memory.delete(key);memory.set(key,previous);}
    const result=await compareDeliveryWithAvailablePart(stages,settings,quote,policies,date,unavailable,selectedStore,previous?.allocation);
    // Incomplete/unavailable comparisons never replace a useful allocation.
    if(key&&capacity>0&&result.best&&result.missingProductCount===0&&result.best.totalGrosze!==null&&result.best.stores.every(o=>o.quote&&Date.parse(o.quote.expiresAt)>now())){
      const allocation=rememberDeliveryAllocation(result.best);
      if(allocation){memory.delete(key);memory.set(key,{savedAt:now(),allocation});while(memory.size>capacity)memory.delete(memory.keys().next().value!);}
    }
    return result;
  };
}
