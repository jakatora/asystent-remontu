import type { PackagePlan, PackagePlanEntry, PackageVariant } from './types';

/** Shared coverage rule for generation and recombining whole quoted orders. */
export function packagePlanCovers(required:number,packs:readonly PackagePlanEntry[],locked:Readonly<Record<string,number>>={}) {
  const meets=(available:number,quantity:number)=>quantity<=0||available>0&&available+1e-7>=quantity;
  return meets(packs.reduce((n,p)=>n+p.count*p.packageSize,0),required)
    && Object.entries(locked).every(([size,quantity])=>meets(packs.filter(p=>String(p.packageSize)===size).reduce((n,p)=>n+p.count*p.packageSize,0),quantity));
}

export function irreduciblePackagePlan(required:number,packs:readonly PackagePlanEntry[],locked:Readonly<Record<string,number>>={}) {
  if(!packagePlanCovers(required,packs,locked))return false;
  return packs.every((pack,index)=>{
    const step=pack.purchaseMultiple??1;
    const smaller=pack.count-step>=(pack.minimumPackages??1)?{...pack,count:pack.count-step}:null;
    return !packagePlanCovers(required,packs.flatMap((row,n)=>n===index?(smaller?[smaller]:[]):[row]),locked);
  });
}

/** All irreducible combinations within explicit CPU/output bounds. Extra packs
 * bought solely to trigger discounts remain a separate shopping strategy.
 * Locked sizes reserve physical quantity, while their unused contents can cover
 * an automatic requirement for the same reviewed product in another room. */
export function mixedPackagePlans(required: number, variants: readonly PackageVariant[], locked: Readonly<Record<string, number>> = {}, maxPlans = 4096, maxVisits = 100000) {
  const plans: PackagePlan[] = [];
  let visits = 0, limited = false;
  const eligible = variants.filter(v => Number.isFinite(v.packageSize) && v.packageSize > 0 && Number.isSafeInteger(v.unitPriceGrosze) && v.unitPriceGrosze > 0);
  if (!Number.isFinite(required) || required <= 0 || !eligible.length) return { plans, limited };
  const ordered = [...eligible].sort((a,b) => b.packageSize-a.packageSize || a.offerId.localeCompare(b.offerId));
  const visit = (index: number, packs: PackagePlanEntry[], coverage: number) => {
    if (++visits > maxVisits || plans.length >= maxPlans) { limited = true; return; }
    if (index === ordered.length) {
      if (!irreduciblePackagePlan(required,packs,locked)) return;
      const totalGrosze=packs.reduce((n,p)=>n+p.lineCostGrosze,0);
      if (!Number.isSafeInteger(totalGrosze)) return;
      plans.push({packages:packs,totalGrosze,requiredQuantity:required,coveredQuantity:coverage,overage:Math.max(0,coverage-required)});
      return;
    }
    const v=ordered[index], multiple=v.purchaseMultiple??1, minimum=Math.ceil((v.minimumPackages??1)/multiple)*multiple;
    const already=packs.filter(p=>p.packageSize===v.packageSize).reduce((n,p)=>n+p.count*p.packageSize,0);
    const remaining=Math.max(0,required-coverage,(locked[String(v.packageSize)]??0)-already);
    const useful=remaining>0?Math.max(minimum,Math.ceil((remaining-1e-7)/v.packageSize/multiple)*multiple):0;
    const maximum=Math.min(useful, v.maxPackages===undefined?useful:Math.floor(v.maxPackages/multiple)*multiple,10000);
    for (let count=0;count<=maximum;count+=multiple) {
      if (limited) return;
      if (count>0&&count<minimum) continue;
      const entry: PackagePlanEntry={...v,count,lineCostGrosze:count*v.unitPriceGrosze};
      visit(index+1,count?[...packs,entry]:packs,coverage+count*v.packageSize);
    }
  };
  visit(0,[],0);
  plans.sort((a,b)=>a.totalGrosze-b.totalGrosze || a.overage-b.overage);
  return { plans, limited };
}
