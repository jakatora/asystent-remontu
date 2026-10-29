import type { PackagePlan, PackagePlanEntry, PackageVariant } from './types';

/** All irreducible combinations within explicit CPU/output bounds. Extra packs
 * bought solely to trigger discounts remain a separate shopping strategy.
 * Locked sizes reserve physical quantity, while their unused contents can cover
 * an automatic requirement for the same reviewed paint in another room. */
export function mixedPackagePlans(required: number, variants: readonly PackageVariant[], locked: Readonly<Record<string, number>> = {}, maxPlans = 4096, maxVisits = 100000) {
  const plans: PackagePlan[] = [];
  let visits = 0, limited = false;
  const eligible = variants.filter(v => Number.isFinite(v.packageSize) && v.packageSize > 0 && Number.isSafeInteger(v.unitPriceGrosze) && v.unitPriceGrosze > 0);
  if (!Number.isFinite(required) || required <= 0 || !eligible.length) return { plans, limited };
  const ordered = [...eligible].sort((a,b) => b.packageSize-a.packageSize || a.offerId.localeCompare(b.offerId));
  const covers = (packs: readonly PackagePlanEntry[]) => packs.reduce((n,p)=>n+p.count*p.packageSize,0)+1e-7 >= required
    && Object.entries(locked).every(([size,quantity])=>packs.filter(p=>String(p.packageSize)===size).reduce((n,p)=>n+p.count*p.packageSize,0)+1e-7>=quantity);
  const visit = (index: number, packs: PackagePlanEntry[], coverage: number) => {
    if (++visits > maxVisits || plans.length >= maxPlans) { limited = true; return; }
    if (index === ordered.length) {
      if (!covers(packs)) return;
      for (let i=0;i<packs.length;i++) {
        const pack=packs[i], step=pack.purchaseMultiple??1;
        const smaller=pack.count-step >= (pack.minimumPackages??1) ? {...pack,count:pack.count-step} : null;
        const changed=packs.flatMap((row,n)=>n===i?(smaller?[smaller]:[]):[row]);
        if (covers(changed)) return;
      }
      const totalGrosze=packs.reduce((n,p)=>n+p.lineCostGrosze,0);
      if (!Number.isSafeInteger(totalGrosze)) return;
      plans.push({packages:packs,totalGrosze,requiredQuantity:required,coveredQuantity:coverage,overage:Math.max(0,coverage-required)});
      return;
    }
    const v=ordered[index], multiple=v.purchaseMultiple??1, minimum=Math.ceil((v.minimumPackages??1)/multiple)*multiple;
    const already=packs.filter(p=>p.packageSize===v.packageSize).reduce((n,p)=>n+p.count*p.packageSize,0);
    const remaining=Math.max(0,required-coverage,(locked[String(v.packageSize)]??0)-already);
    const useful=remaining>1e-7?Math.max(minimum,Math.ceil((remaining-1e-7)/v.packageSize/multiple)*multiple):0;
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
