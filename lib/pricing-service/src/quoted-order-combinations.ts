import type {ProductGroup} from './estimate';
import type {PackagePlanEntry} from './types';
import type {DeliveredBasket,DeliveredStoreBasket} from './delivery';
import {irreduciblePackagePlan} from './mixed-package-plans';

const MAX_STATES=100_000,MAX_STEPS=2_000_000,MAX_MEMO_BYTES=2_000_000;
const stable=(value:unknown):string=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(key=>[key,v[key]])):v);
const atom=(line:DeliveredStoreBasket['lines'][number],pack:PackagePlanEntry)=>stable([line.product.id,line.unit,pack.packageSize,pack.cutRoll??null]);
const basketKey=(basket:DeliveredBasket)=>stable(basket.stores.map(order=>[order.store,order.lines.flatMap(line=>line.packages.map(pack=>[atom(line,pack),pack.offerId,pack.count,pack.unitPriceGrosze])).sort()]).sort());
function quantities(orders:readonly DeliveredStoreBasket[]) {
  const result=new Map<string,number>();
  for(const order of orders)for(const line of order.lines)for(const pack of line.packages){
    if(!Number.isSafeInteger(pack.count)||pack.count<1||!Number.isFinite(pack.packageSize)||pack.packageSize<=0)return null;
    const key=atom(line,pack),count=(result.get(key)??0)+pack.count;if(!Number.isSafeInteger(count))return null;result.set(key,count);
  }
  return result;
}

/** Combine exact, already quoted whole-store carts. Never splice a fee from
 * one merchant basket onto different contents or select two carts of the same
 * store. Physical purchases must match a complete original allocation, while
 * the selected offers must still obey stock, lots and locked-size demand.
 * This is a bounded CPU search, with no additional retailer I/O. */
export function recombineQuotedOrders(
  candidates:readonly (readonly DeliveredStoreBasket[])[],orders:readonly DeliveredStoreBasket[],
  groups:readonly ProductGroup[],postalCode:string,existing:readonly DeliveredBasket[],
  now=Date.now(),maxStates=MAX_STATES,
) {
  let states=0,steps=0,limited=false;
  const stateLimit=Math.max(0,Math.min(MAX_STATES,maxStates));
  const validOrder=(order:DeliveredStoreBasket)=>{
    const q=order.quote;
    return order.source==='retailer'&&q&&order.totalGrosze!==null&&order.deliveryGrosze===q.costGrosze
      && [order.materialsGrosze,order.deliveryGrosze,order.totalGrosze].every(n=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0)
      && order.totalGrosze===order.materialsGrosze+order.deliveryGrosze!
      && (q.destinationScope==='PL'||q.postalCode===postalCode)&&Date.parse(q.checkedAt)<=now&&Date.parse(q.expiresAt)>now;
  };
  const rows=orders.filter(validOrder).map(order=>({order,coverage:quantities([order])})).filter((row):row is {order:DeliveredStoreBasket;coverage:Map<string,number>}=>!!row.coverage)
    .sort((a,b)=>a.order.totalGrosze!-b.order.totalGrosze!||a.order.store.localeCompare(b.order.store)||stable([...a.coverage]).localeCompare(stable([...b.coverage])));
  if(!rows.length)return{baskets:[] as DeliveredBasket[],limited,states,steps};
  const stores=[...new Set(rows.map(row=>row.order.store))].sort(),masks=new Map(stores.map((store,index)=>[store,1n<<BigInt(index)]));
  const membership=new Map<string,number[]>();
  groups.forEach((group,index)=>group.offers.forEach(offer=>{const entries=membership.get(offer.id)??[];if(!entries.includes(index))entries.push(index);membership.set(offer.id,entries);}));
  const validPurchases=(selected:readonly DeliveredStoreBasket[])=>{
    const packs=groups.map(()=>new Map<string,PackagePlanEntry>());
    for(const order of selected)for(const line of order.lines)for(const pack of line.packages){
      const matches=(membership.get(pack.offerId)??[]).filter(index=>groups[index].unit===line.unit),index=matches[0];
      if(matches.length!==1)return false;
      const offer=groups[index].offers.find(offer=>offer.id===pack.offerId)!;
      if(offer.store!==order.store)return false;
      const key=stable([pack.offerId,pack.packageSize,pack.cutRoll??null]),previous=packs[index].get(key),count=(previous?.count??0)+pack.count;
      packs[index].set(key,{...pack,count,purchaseMultiple:offer.purchaseMultiple??1,minimumPackages:offer.minimumPackages??1,maxPackages:Math.min(offer.maxPackages??Infinity,pack.maxPackages??Infinity)});
    }
    return groups.every((group,index)=>{
      const actual=[...packs[index].values()];
      if(!actual.length)return group.totalQuantity<=0;
      if(actual.some(pack=>pack.count%(pack.purchaseMultiple??1)!==0||pack.count<(pack.minimumPackages??1)||pack.count>(pack.maxPackages??Infinity)))return false;
      // A cut cart retains the exact dimensions/counts of an original valid
      // cutting plan. Area alone cannot prove that a roll can be removed.
      return group.cutRoll?true:irreduciblePackagePlan(group.totalQuantity,actual,group.requiredBySize);
    });
  };
  const known=existing.filter(b=>b.totalGrosze!==null&&b.stores.every(validOrder)).sort((a,b)=>a.totalGrosze!-b.totalGrosze!||a.stores.length-b.stores.length);
  const targets=new Map<string,Map<string,number>>();
  for(const plan of [...known.slice(0,1).map(b=>b.stores),...candidates]){const target=quantities(plan);if(target)targets.set(stable([...target].sort()),target);}
  let cheapest:DeliveredBasket|undefined,cheaperBound=known[0]?.totalGrosze??Infinity,cheapestStores=known[0]?.stores.length??Infinity;
  let fewer:DeliveredBasket|undefined,fewerBound=Infinity;
  const winners=new Map<string,DeliveredBasket>();
  function search(storeLimit:number,fewerPass:boolean) {
    for(const target of targets.values()){
      if(limited)return;
      const keys=[...target.keys()].sort(),remaining=keys.map(key=>target.get(key)!),indices=new Map(keys.map((key,index)=>[key,index]));
      const eligible=rows.flatMap(row=>{
        const coverage=[...row.coverage].map(([key,count])=>({index:indices.get(key),count}));
        if(coverage.some(p=>p.index===undefined||p.count>(target.get(keys[p.index!])??0)))return[];
        return[{...row,mask:masks.get(row.order.store)!,coverage:coverage as {index:number;count:number}[]}];
      });
      const byKey=keys.map((_key,index)=>eligible.filter(row=>row.coverage.some(p=>p.index===index))),memo=new Map<string,number>();let memoBytes=0;
      const fits=(row:typeof eligible[number])=>{for(const p of row.coverage){if(steps>=MAX_STEPS){limited=true;return false;}steps++;if(p.count>remaining[p.index])return false;}return true;};
      function visit(cost:number,used:bigint,selected:DeliveredStoreBasket[]) {
        if(limited)return;if(states>=stateLimit){limited=true;return;}states++;
        const bound=fewerPass?fewerBound:cheaperBound;if(cost>bound||selected.length>storeLimit)return;
        const open=remaining.flatMap((count,index)=>count?[index]:[]);
        if(!open.length){
          if(!validPurchases(selected))return;
          const materialsGrosze=selected.reduce((n,o)=>n+o.materialsGrosze,0),deliveryGrosze=selected.reduce((n,o)=>n+o.deliveryGrosze!,0);
          if(!Number.isSafeInteger(materialsGrosze)||!Number.isSafeInteger(deliveryGrosze)||!Number.isSafeInteger(materialsGrosze+deliveryGrosze))return;
          const basket:DeliveredBasket={stores:[...selected].sort((a,b)=>a.store.localeCompare(b.store)),materialsGrosze,deliveryGrosze,totalGrosze:cost,lowerBoundGrosze:cost};
          if(fewerPass){if(cost<fewerBound||cost===fewerBound&&selected.length<(fewer?.stores.length??Infinity)){fewer=basket;fewerBound=cost;}}
          else if(cost<cheaperBound||cost===cheaperBound&&selected.length<cheapestStores){cheapest=basket;cheaperBound=cost;cheapestStores=selected.length;}
          return;
        }
        if(selected.length===storeLimit)return;
        const memoKey=used.toString(36)+'|'+open.map(index=>index+':'+remaining[index]).join(',');
        if((memo.get(memoKey)??Infinity)<=cost)return;
        if(memoBytes+memoKey.length*2<MAX_MEMO_BYTES){if(!memo.has(memoKey))memoBytes+=memoKey.length*2;memo.set(memoKey,cost);}
        let choices:typeof eligible=[];
        for(const index of open){const available=byKey[index].filter(row=>(used&row.mask)===0n&&fits(row));if(limited||!available.length)return;if(!choices.length||available.length<choices.length)choices=available;}
        for(const row of choices){const next=cost+row.order.totalGrosze!;if(!Number.isSafeInteger(next)||next>(fewerPass?fewerBound:cheaperBound))continue;for(const p of row.coverage)remaining[p.index]-=p.count;visit(next,used|row.mask,[...selected,row.order]);for(const p of row.coverage)remaining[p.index]+=p.count;if(limited)return;}
      }
      visit(0,0n,[]);
    }
  }
  search(stores.length,false);
  if(cheapest)winners.set(basketKey(cheapest),cheapest);
  const count=cheapest?.stores.length??known[0]?.stores.length??Infinity;
  if(count>1&&!limited){fewerBound=known.filter(b=>b.stores.length<count).reduce((n,b)=>Math.min(n,b.totalGrosze!),Infinity);search(Math.min(stores.length,count-1),true);if(fewer)winners.set(basketKey(fewer),fewer);}
  return{baskets:[...winners.values()],limited,states,steps};
}
