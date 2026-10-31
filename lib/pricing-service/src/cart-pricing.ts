import type {CartMaterialPricing,DeliveredStoreBasket,DeliveryQuote} from './delivery';

/** Only the reviewed ABUD checkout currently proves conditional material
 * discounts. It is not a discount entered by the client or a generic tariff. */
export const supportsCartPricing=(store:string)=>store==='ABUD';
const positive=(n:number)=>Number.isSafeInteger(n)&&n>0;
export function validatedCartPricing(order:DeliveredStoreBasket,quote:DeliveryQuote):CartMaterialPricing|null {
 const pricing=quote.cartPricing;
 const checked=Date.parse(quote.checkedAt),expires=Date.parse(quote.expiresAt);
 if(!pricing||!supportsCartPricing(order.store)||quote.sourceUrl!=='https://www.abud.pl/basketedit.php'
  ||quote.basis!=='retailer_basket_postcode'||quote.destinationScope!=='postal_code'||quote.materialsRoundingGrosze!==undefined
  ||!/^\d{2}-\d{3}$/.test(quote.postalCode??'')||!Number.isFinite(checked)||!Number.isFinite(expires)||expires<=checked||expires-checked>600000||!/^[a-f0-9]{64}$/.test(quote.evidenceSha256)
  ||pricing.currency!=='PLN'||!positive(pricing.baseMaterialsGrosze)||!positive(pricing.materialsGrosze)||!positive(pricing.discountGrosze)
  ||pricing.baseMaterialsGrosze!==order.materialsGrosze||pricing.materialsGrosze+pricing.discountGrosze!==pricing.baseMaterialsGrosze
  ||!Array.isArray(pricing.lines)||!pricing.lines.length||pricing.lines.length>800)return null;
 const expected=new Map<string,{count:number;price:number;identity:string}>();let base=0,total=0;
 const identity=(line:DeliveredStoreBasket['lines'][number],pack:DeliveredStoreBasket['lines'][number]['packages'][number])=>JSON.stringify([line.product,line.unit,pack.store,pack.url,pack.packageSize,pack.purchaseMultiple??1,pack.minimumPackages??1]);
 for(const line of order.lines)for(const pack of line.packages){
  if(expected.has(pack.offerId)||pack.store!==order.store||!positive(pack.count)||!positive(pack.unitPriceGrosze)
   ||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze||pack.cutRoll)return null;
  expected.set(pack.offerId,{count:pack.count,price:pack.unitPriceGrosze,identity:identity(line,pack)});base+=pack.lineCostGrosze;
 }
 if(!Number.isSafeInteger(base)||base!==pricing.baseMaterialsGrosze)return null;
 const counts=new Map<string,number>();
 for(const line of pricing.lines){
  const pack=expected.get(line?.offerId);
  if(!pack||line.baseUnitPriceGrosze!==pack.price||!positive(line.count)||!positive(line.unitPriceGrosze)
   ||line.unitPriceGrosze>pack.price||line.lineCostGrosze!==line.count*line.unitPriceGrosze||!positive(line.lineCostGrosze))return null;
  counts.set(line.offerId,(counts.get(line.offerId)??0)+line.count);total+=line.lineCostGrosze;
 }
 if(!Number.isSafeInteger(total)||total!==pricing.materialsGrosze||counts.size!==expected.size
  ||[...expected].some(([id,pack])=>counts.get(id)!==pack.count))return null;
 // A single native cart has one unit price per offer. Repeated entries are
 // possible only in independently verified separate orders below.
 if(!quote.orders&&pricing.lines.length!==expected.size)return null;
 if(quote.orders){
  if(!Array.isArray(quote.orders)||quote.orders.length<2||quote.orders.length>8)return null;
  let fees=0,materials=0;const childPrices:CartMaterialPricing['lines']=[];
  for(const part of quote.orders){
   if(!part||!part.quote||'orders'in part.quote&&part.quote.orders!==undefined||part.quote.sourceUrl!==quote.sourceUrl||part.quote.postalCode!==quote.postalCode
    ||part.quote?.basis!==quote.basis||part.quote?.destinationScope!==quote.destinationScope||!Array.isArray(part.lines))return null;
   for(const line of part.lines)for(const pack of line.packages){const parent=expected.get(pack.offerId);if(!parent||parent.identity!==identity(line,pack)||parent.price!==pack.unitPriceGrosze)return null;}
   const base=part.lines.reduce((sum,l)=>sum+l.packages.reduce((n,p)=>n+p.lineCostGrosze,0),0),child={...order,lines:part.lines,materialsGrosze:base,quote:undefined};
   const actual=quotedMaterialsGrosze(child,part.quote);
   if(actual===null||actual!==part.materialsGrosze||!Number.isSafeInteger(part.quote.costGrosze)||part.quote.costGrosze<0)return null;
   const checked=Date.parse(part.quote.checkedAt),expires=Date.parse(part.quote.expiresAt);
   if(!Number.isFinite(checked)||!Number.isFinite(expires)||expires<=checked||expires-checked>600000||Date.parse(quote.expiresAt)>expires||Date.parse(quote.checkedAt)>checked)return null;
   materials+=actual;fees+=part.quote.costGrosze;
   childPrices.push(...(part.quote.cartPricing?.lines??part.lines.flatMap(l=>l.packages.map(p=>({offerId:p.offerId,count:p.count,baseUnitPriceGrosze:p.unitPriceGrosze,unitPriceGrosze:p.unitPriceGrosze,lineCostGrosze:p.lineCostGrosze})))));
  }
  const key=(p:CartMaterialPricing['lines'][number])=>JSON.stringify([p.offerId,p.count,p.baseUnitPriceGrosze,p.unitPriceGrosze,p.lineCostGrosze]);
  if(!Number.isSafeInteger(fees)||fees!==quote.costGrosze||materials!==pricing.materialsGrosze||JSON.stringify(childPrices.map(key).sort())!==JSON.stringify(pricing.lines.map(key).sort()))return null;
 }
 return pricing;
}

/** Null is an invalid monetary proof; it must not fall back to catalogue sums. */
export function quotedMaterialsGrosze(order:DeliveredStoreBasket,quote:DeliveryQuote):number|null {
 if(quote.cartPricing!==undefined)return validatedCartPricing(order,quote)?.materialsGrosze??null;
 const rounding=quote.materialsRoundingGrosze??0,packs=order.lines.reduce((sum,l)=>sum+l.packages.reduce((n,p)=>n+p.count,0),0);
 const total=order.materialsGrosze+rounding;
 return Number.isSafeInteger(rounding)&&Math.abs(rounding)<=packs&&positive(total)?total:null;
}

export function quotedOrderTotal(order:DeliveredStoreBasket,quote:DeliveryQuote):number|null {
 const materials=quotedMaterialsGrosze(order,quote);
 const total=materials===null?null:materials+quote.costGrosze;
 return total!==null&&Number.isSafeInteger(quote.costGrosze)&&quote.costGrosze>=0&&Number.isSafeInteger(total)?total:null;
}

/** Compose the native material prices of independently checked suborders.
 * Inputs remain catalogue-priced so their identities and cache keys stay fixed. */
export function combineCartPricing(order:DeliveredStoreBasket,parts:readonly {order:DeliveredStoreBasket;quote:DeliveryQuote}[]):CartMaterialPricing|undefined {
 if(!parts.some(p=>p.quote.cartPricing))return undefined;
 const lines:CartMaterialPricing['lines']=[];
 for(const part of parts){
  if(quotedMaterialsGrosze(part.order,part.quote)===null)throw Error('invalid_cart_pricing');
  lines.push(...(part.quote.cartPricing?.lines??part.order.lines.flatMap(l=>l.packages.map(p=>({offerId:p.offerId,count:p.count,baseUnitPriceGrosze:p.unitPriceGrosze,unitPriceGrosze:p.unitPriceGrosze,lineCostGrosze:p.lineCostGrosze})))));
 }
 const materialsGrosze=lines.reduce((n,p)=>n+p.lineCostGrosze,0);
 return{currency:'PLN',baseMaterialsGrosze:order.materialsGrosze,materialsGrosze,discountGrosze:order.materialsGrosze-materialsGrosze,lines};
}

/** Resolve prices only in the serialized purchase result, after ranking.
 * Never mutate catalogue packs used in candidate signatures or price history. */
export function applyCartPrices(order:DeliveredStoreBasket):DeliveredStoreBasket {
 const pricing=order.quote?.cartPricing;
 if(!pricing)return order;
 const lines=order.lines.map(line=>({...line,packages:line.packages.flatMap(pack=>pricing.lines.filter(p=>p.offerId===pack.offerId).map(p=>({...pack,count:p.count,unitPriceGrosze:p.unitPriceGrosze,lineCostGrosze:p.lineCostGrosze})))}));
 const quote={...order.quote!};
 if(quote.orders)quote.orders=quote.orders.map(part=>{
  const base=part.lines.reduce((sum,l)=>sum+l.packages.reduce((n,p)=>n+p.lineCostGrosze,0),0);
  const priced=applyCartPrices({...order,lines:part.lines,materialsGrosze:base,quote:part.quote,totalGrosze:part.materialsGrosze+part.quote.costGrosze});
  return{...part,lines:priced.lines};
 });
 return{...order,lines,quote};
}
