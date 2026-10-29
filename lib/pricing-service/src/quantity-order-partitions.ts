import type {BasketQuoter,DeliveredStoreBasket,DeliveryQuote} from './delivery';
import {DELIVERY_LIMITS} from './delivery-limits';

export type QuotedOrder={order:DeliveredStoreBasket;quote:DeliveryQuote};
const MAX_QUANTITY_QUOTES=12,MAX_SEPARATE_ORDERS=8;
export const currentDeliveryQuote=(q:DeliveryQuote,postcode:string)=>Number.isSafeInteger(q.costGrosze)&&q.costGrosze>=0
 &&Date.parse(q.expiresAt)>Date.now()&&Date.parse(q.checkedAt)<=Date.now()&&Date.parse(q.checkedAt)>=Date.now()-600000
 &&Date.parse(q.expiresAt)<=Date.parse(q.checkedAt)+600000&&/^[a-f0-9]{64}$/.test(q.evidenceSha256)
 &&(q.destinationScope==='PL'||q.destinationScope==='postal_code'&&q.postalCode===postcode);
const fee=(parts:QuotedOrder[])=>parts.reduce((n,p)=>n+p.quote.costGrosze,0);
const packageIdentity=(line:DeliveredStoreBasket['lines'][number],pack:DeliveredStoreBasket['lines'][number]['packages'][number])=>JSON.stringify([line.product,line.unit,Object.fromEntries(Object.entries(pack).filter(([key])=>!['count','lineCostGrosze'].includes(key)).sort(([a],[b])=>a.localeCompare(b)))]);

/** Every physical pack appears once across the plan, at the original price.
 * Per-order minima/lots still apply. The complete native order is quoted first
 * so a total stock refusal cannot be bypassed with several smaller carts. */
export function preservesOrderPackages(whole:DeliveredStoreBasket,parts:readonly QuotedOrder[]):boolean{
 const expected=new Map<string,number>(),actual=new Map<string,number>();
 const add=(order:DeliveredStoreBasket,target:Map<string,number>)=>{
  if(order.store!==whole.store||!order.lines.length)return false;let cost=0;
  for(const line of order.lines){if(!line.packages.length)return false;for(const pack of line.packages){
   const multiple=pack.purchaseMultiple??1,min=pack.minimumPackages??1;
   if(pack.store!==order.store||!Number.isSafeInteger(pack.count)||pack.count<min||!Number.isSafeInteger(multiple)||multiple<1||!Number.isSafeInteger(min)||min<1||pack.count%multiple||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<=0||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze||!Number.isSafeInteger(pack.lineCostGrosze))return false;
   const key=packageIdentity(line,pack);target.set(key,(target.get(key)??0)+pack.count);cost+=pack.lineCostGrosze;
  }}return Number.isSafeInteger(cost)&&cost===order.materialsGrosze;
 };
 return add(whole,expected)&&parts.every(p=>!p.quote.orders&&add(p.order,actual))&&expected.size===actual.size&&[...expected].every(([key,count])=>actual.get(key)===count)&&parts.reduce((n,p)=>n+p.order.materialsGrosze,0)===whole.materialsGrosze;
}

/** Bounded actual-cart search for one product sold in one native pack size.
 * Fees are never divided or inferred from a sample. Identical basket shapes
 * may reuse the existing fresh quote cache, while the complete stock demand
 * and every suborder's purchase rules remain unchanged. */
export async function quantityOrderPartitions(base:QuotedOrder,atomic:BasketQuoter,postcode:string,limited:()=>void):Promise<QuotedOrder[]>{
 const whole=base.order;if(whole.lines.length!==1||whole.lines[0].packages.length!==1)return[base];
 const pack=whole.lines[0].packages[0],total=pack.count,multiple=pack.purchaseMultiple??1,min=pack.minimumPackages??1;
 if(!currentDeliveryQuote(base.quote,postcode)||base.quote.orders||base.quote.costGrosze===0||total<2||!preservesOrderPackages(whole,[base]))return[base];
 if(total>DELIVERY_LIMITS.packagesPerProduct){limited();return[base];}
 const legal=Array.from({length:Math.floor(total/multiple)},(_,i)=>(i+1)*multiple).filter(n=>n>=min&&n<total);
 if(!legal.length)return[base];
 const candidates:number[]=[],allowed=new Set(legal),seen=new Set<number>();
 const add=(n:number)=>{if(candidates.length<MAX_QUANTITY_QUOTES&&allowed.has(n)&&!seen.has(n)){candidates.push(n);seen.add(n);}};
 const half=Math.floor(total/2/multiple)*multiple;add(half);add(total-half);
 // Balanced baskets first leave a usable plan when the shared I/O deadline
 // prevents checking later shapes. Remaining small and complementary carts
 // cover other real tariff thresholds without assuming monotonic freight.
 for(const n of legal){add(n);add(total-n);if(candidates.length===MAX_QUANTITY_QUOTES)break;}
 if(legal.length>MAX_QUANTITY_QUOTES||Math.floor(total/Math.max(min,multiple))>MAX_SEPARATE_ORDERS)limited();
 const verified=new Map<number,QuotedOrder>();
 for(const n of candidates.slice(0,MAX_QUANTITY_QUOTES)){
  const line={...whole.lines[0],product:{...whole.lines[0].product},packages:[{...pack,count:n,lineCostGrosze:n*pack.unitPriceGrosze}]};
  const order:DeliveredStoreBasket={...whole,lines:[line],materialsGrosze:n*pack.unitPriceGrosze,quote:undefined,deliveryGrosze:null,deliveryMinimumGrosze:0,totalGrosze:null,source:'unknown'};
  try{const outcome=await atomic(order,postcode);if('quote'in outcome&&!outcome.quote.orders&&currentDeliveryQuote(outcome.quote,postcode))verified.set(n,{order,quote:outcome.quote});else limited();}catch{limited();}
 }
 type Plan={cost:number;parts:QuotedOrder[]};const layers:Map<number,Plan>[]=[new Map([[0,{cost:0,parts:[]}]])];
 let best:Plan={cost:base.quote.costGrosze,parts:[base]};
 const largest=(p:Plan)=>Math.max(...p.parts.map(part=>part.order.lines[0].packages[0].count));
 const better=(a:Plan,b:Plan)=>a.cost<b.cost||a.cost===b.cost&&(a.parts.length<b.parts.length||a.parts.length===b.parts.length&&largest(a)<largest(b));
 for(let i=1;i<=MAX_SEPARATE_ORDERS;i++){
  const layer=new Map<number,Plan>();for(const[sum,previous]of layers[i-1])for(const[n,part]of verified){
   if(sum+n>total)continue;const cost=previous.cost+part.quote.costGrosze;if(!Number.isSafeInteger(cost))continue;
   const plan={cost,parts:[...previous.parts,part]},old=layer.get(sum+n);if(!old||better(plan,old))layer.set(sum+n,plan);
  }layers.push(layer);const full=layer.get(total);if(full&&better(full,best))best=full;if(!layer.size)break;
 }
 return best.parts;
}

/** One reviewable, non-nested order list with the earliest evidence expiry.
 * The full-stock check is part of the proof and cannot outlive its timestamp. */
export async function combineOrderQuotes(base:QuotedOrder,parts:QuotedOrder[],postcode:string):Promise<DeliveryQuote>{
 const cost=fee(parts),quotes=[base.quote,...parts.map(p=>p.quote)];
 if(parts.length<2||!Number.isSafeInteger(cost)||cost>=base.quote.costGrosze||quotes.some(q=>!currentDeliveryQuote(q,postcode))||!preservesOrderPackages(base.order,parts))return base.quote;
 const orders=parts.map(p=>({materialsGrosze:p.order.materialsGrosze,lines:p.order.lines,quote:p.quote})),digest=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({wholeOrderEvidence:base.quote.evidenceSha256,orders})));
 const postal=quotes.some(q=>q.destinationScope==='postal_code');
 return{...base.quote,costGrosze:cost,orders,singleOrderCostGrosze:base.quote.costGrosze,
  carrier:[...new Set(parts.map(p=>p.quote.carrier))].join(' + '),payment:[...new Set(parts.map(p=>p.quote.payment))].join(' + '),
  checkedAt:new Date(Math.min(...quotes.map(q=>Date.parse(q.checkedAt)))).toISOString(),expiresAt:new Date(Math.min(...quotes.map(q=>Date.parse(q.expiresAt)))).toISOString(),
  evidenceSha256:Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''),
  destinationScope:postal?'postal_code':'PL',basis:postal?'retailer_basket_postcode':parts.every(p=>p.quote.basis==='retailer_tariff_national')?'retailer_tariff_national':'retailer_basket_national',
  dispatchFrom:parts.every(p=>p.quote.dispatchFrom===parts[0].quote.dispatchFrom)?parts[0].quote.dispatchFrom:undefined,
  ...(postal?{postalCode:postcode}:{postalCode:undefined}),
 };
}
