import type { BasketQuoter, DeliveredStoreBasket, DeliveryQuoteResult } from './delivery';
import { currentDeliveryQuote, combineRequiredSeparateOrders, type QuotedOrder } from './quantity-order-partitions';

type DispatchFailure = Extract<DeliveryQuoteResult, {reason:string}>;
type DispatchGroup = {dispatchFrom:string;offerIds:string[]};
const MAX_PLANS=32;

/** Fixed branch offers stay in their reviewed branch. Flexible offers may join
 * any listed branch only after a complete native cart confirms that allocation. */
export async function quoteRequiredDispatch(order:DeliveredStoreBasket,base:DispatchFailure,atomic:BasketQuoter,postcode:string,limited:()=>void):Promise<DeliveryQuoteResult>{
 const unavailable:DeliveryQuoteResult={reason:'requires_separate_dispatch'};
 const lines=new Map(order.lines.map(line=>[line.packages[0].offerId,line]));
 const flexible=base.flexibleDispatchOfferIds??[],flexibleSet=new Set(flexible);
 const legacy=!base.dispatchGroups&&order.lines.length===2&&!flexible.length;
 const groups=base.dispatchGroups??(legacy?order.lines.map(line=>({dispatchFrom:'',offerIds:[line.packages[0].offerId]})):[]);
 if(lines.size!==order.lines.length||groups.length<2||groups.length>8||flexibleSet.size!==flexible.length||flexible.some(id=>!lines.has(id)))return unavailable;
 if(!legacy&&(groups.some(group=>!group.dispatchFrom)||new Set(groups.map(group=>group.dispatchFrom)).size!==groups.length))return unavailable;
 const used=new Set<string>();
 for(const group of groups){
  if(!group.offerIds.length&&!flexible.length)return unavailable;
  for(const id of group.offerIds){
   if(!lines.has(id)||used.has(id)||flexibleSet.has(id))return unavailable;
   used.add(id);
  }
 }
 if(used.size+flexible.length!==lines.size)return unavailable;
 const plans:DispatchGroup[][]=[];
 if(!flexible.length)plans.push(groups);
 else {
  const defaultBranch=groups.findIndex(group=>group.dispatchFrom==='Katowice');
  if(defaultBranch<0)return unavailable;
  limited(); // Other branches and further quantity splits are not exhaustive.
  const seen=new Set<string>();
  const add=(assignment:number[])=>{
   const key=assignment.join(',');if(seen.has(key)||plans.length>=MAX_PLANS)return;
   seen.add(key);
   const plan=groups.map(group=>({...group,offerIds:[...group.offerIds]}));
   flexible.forEach((id,index)=>plan[assignment[index]].offerIds.push(id));
   plans.push(plan.filter(group=>group.offerIds.length));
  };
  // Useful complete plans come first within the shared quote deadline.
  add(flexible.map(()=>defaultBranch));
  for(let branch=0;branch<groups.length;branch++)add(flexible.map(()=>branch));
  add(flexible.map((_,index)=>index%groups.length));
  let combinations=1;
  for(const _ of flexible)combinations=Math.min(MAX_PLANS+1,combinations*groups.length);
  for(let code=0;code<Math.min(combinations,MAX_PLANS);code++){
   let remaining=code;
   add(flexible.map(()=>{const branch=remaining%groups.length;remaining=Math.floor(remaining/groups.length);return branch;}));
  }
 }
 if(groups.some(group=>group.offerIds.length>1)||order.lines.some(line=>line.packages[0].count>1))limited();
 const cache=new Map<string,Promise<DeliveryQuoteResult>>();
 let best:Extract<DeliveryQuoteResult,{quote:unknown}>|undefined;
 for(const plan of plans){
  const parts:QuotedOrder[]=[];
  for(const group of plan){
   const selected=group.offerIds.map(id=>lines.get(id)!);
   const part:DeliveredStoreBasket={...order,lines:selected,materialsGrosze:selected.reduce((sum,line)=>sum+line.packages[0].lineCostGrosze,0),quote:undefined,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown'};
   const key=JSON.stringify([group.dispatchFrom,[...group.offerIds].sort()]);
   try{
    let pending=cache.get(key);
    if(!pending){pending=atomic(part,postcode,{ignoreStockOfferIds:flexible});cache.set(key,pending);}
    const outcome=await pending;
    if(!('quote'in outcome)||!currentDeliveryQuote(outcome.quote,postcode)||group.dispatchFrom&&outcome.quote.dispatchFrom!==group.dispatchFrom)break;
    parts.push({order:part,quote:outcome.quote});
   }catch{break;}
  }
  if(parts.length!==plan.length)continue;
  const combined=await combineRequiredSeparateOrders(order,parts,postcode);
  if(combined&&(!best||combined.costGrosze<best.quote.costGrosze||combined.costGrosze===best.quote.costGrosze&&combined.orders!.length<best.quote.orders!.length))best={quote:combined};
 }
 return best&&currentDeliveryQuote(best.quote,postcode)?best:unavailable;
}
