import {parsePriceToGrosze} from '@workspace/price-collector';
import {groupProjectByProduct,isComparableOffer} from './estimate';
import {applyCartPrices,quotedMaterialsGrosze,supportsCartPricing} from './cart-pricing';
import {extraPackageAdditions} from './extra-package-difference';
import {DELIVERY_LIMITS} from './delivery-limits';
import type {StageEstimate} from './types';
import type {BasketQuoter,DeliveredBasket,DeliveredStoreBasket,DeliveryQuote,ExtraPackageOption} from './delivery';

const MAX_EXTRA_QUOTES=8,MAX_EXTRA_LOTS=4;
const current=(quote:DeliveryQuote,postcode:string)=>{
  const checked=Date.parse(quote.checkedAt),expires=Date.parse(quote.expiresAt);
  return Number.isFinite(checked)&&checked<=Date.now()+5000&&expires>Date.now()&&expires>checked&&expires-checked<=600000
    &&Number.isSafeInteger(quote.costGrosze)&&quote.costGrosze>=0&&/^https:\/\//.test(quote.sourceUrl)&&/^[a-f0-9]{64}$/.test(quote.evidenceSha256)
    &&(quote.destinationScope==='PL'&&['retailer_basket_national','retailer_tariff_national'].includes(quote.basis)
      ||quote.destinationScope==='postal_code'&&quote.postalCode===postcode&&quote.basis==='retailer_basket_postcode');
};
/** Probe bounded increments of existing packs, after the core comparison and
 * within its quote budget/deadline. No threshold or shipping amount is guessed.
 * Each trial replaces one merchant's full order with a new native quote. */
export async function findExtraPackageOption(base:DeliveredBasket,stages:readonly StageEstimate[],postcode:string,quoteBasket:BasketQuoter){
  let option:ExtraPackageOption|null=null,confirmed=0;
  const live=(basket:DeliveredBasket)=>basket.stores.every(order=>order.quote&&current(order.quote,postcode));
  if(base.totalGrosze===null||base.deliveryGrosze===null||!live(base))return{option,confirmed,searched:false,baselineExpired:!live(base)};
  const groups=groupProjectByProduct(stages),offers=new Map(groups.flatMap(group=>group.offers.filter(offer=>isComparableOffer(offer)).map(offer=>[offer.id,offer]as const)));
  const trials:{order:DeliveredStoreBasket;increment:number}[]=[];
  for(const previous of base.stores){
    if(!previous.deliveryGrosze)continue;
    const lines=previous.lines.map(line=>({...line,packages:line.packages.map(pack=>{
      const offer=offers.get(pack.offerId),price=offer&&parsePriceToGrosze(offer.promoPrice??offer.price);
      return{...pack,unitPriceGrosze:price??pack.unitPriceGrosze,lineCostGrosze:(price??pack.unitPriceGrosze)*pack.count};
    })}));
    for(const [lineIndex,line]of lines.entries())for(const [packIndex,pack]of line.packages.entries()){
      const offer=offers.get(pack.offerId);if(!offer||pack.cutRoll)continue;
      // Discounted duplicate rows of the same SKU require a separate search.
      if(lines.flatMap(line=>line.packages).filter(row=>row.offerId===pack.offerId).length!==1)continue;
      const multiple=pack.purchaseMultiple??1,max=Math.min(pack.maxPackages??Infinity,offer.maxPackages??Infinity,DELIVERY_LIMITS.packagesPerProduct);
      for(let lots=1;lots<=MAX_EXTRA_LOTS;lots++){
        const extra=lots*multiple,count=pack.count+extra,increment=extra*pack.unitPriceGrosze;
        if(!Number.isSafeInteger(count)||count>max||!Number.isSafeInteger(increment)||increment>=previous.deliveryGrosze)break;
        const changed=lines.map((row,i)=>({...row,packages:row.packages.map((item,j)=>i===lineIndex&&j===packIndex?{...item,count,lineCostGrosze:count*item.unitPriceGrosze}:item)}));
        const materials=changed.reduce((n,row)=>n+row.packages.reduce((sum,item)=>sum+item.lineCostGrosze,0),0);
        if(!Number.isSafeInteger(materials))continue;
        trials.push({increment,order:{...previous,lines:changed,materialsGrosze:materials,quote:undefined,source:'unknown',deliveryGrosze:null,totalGrosze:null,deliveryMinimumGrosze:0}});
      }
    }
  }
  const potential=(trial:typeof trials[number])=>base.stores.find(order=>order.store===trial.order.store)!.deliveryGrosze!-trial.increment;
  trials.sort((a,b)=>potential(b)-potential(a)||a.increment-b.increment||a.order.store.localeCompare(b.order.store));
  const first=new Map<string,typeof trials[number]>();for(const trial of trials)if(!first.has(trial.order.store))first.set(trial.order.store,trial);
  const selected=[...first.values(),...trials.filter(trial=>first.get(trial.order.store)!==trial)].slice(0,MAX_EXTRA_QUOTES);
  for(const trial of selected){
    if(!live(base))break;
    if(option&&!live(option.basket))option=null;
    if(option&&!supportsCartPricing(trial.order.store)){
      const previous=base.stores.find(order=>order.store===trial.order.store)!;
      const rounding=trial.order.lines.reduce((sum,line)=>sum+line.packages.reduce((n,pack)=>n+pack.count,0),0);
      if(base.totalGrosze-previous.totalGrosze!+trial.order.materialsGrosze-rounding>=option.basket.totalGrosze!)continue;
    }
    try{
      const result=await quoteBasket(trial.order,postcode);if(!('quote'in result)||!current(result.quote,postcode))continue;
      const materials=quotedMaterialsGrosze(trial.order,result.quote);if(materials===null||!Number.isSafeInteger(materials+result.quote.costGrosze))continue;
      const updated=applyCartPrices({...trial.order,source:'retailer',quote:result.quote,materialsGrosze:materials,deliveryGrosze:result.quote.costGrosze,deliveryMinimumGrosze:result.quote.costGrosze,totalGrosze:materials+result.quote.costGrosze});
      const stores=base.stores.map(order=>order.store===updated.store?updated:order),materialTotal=stores.reduce((n,order)=>n+order.materialsGrosze,0),delivery=stores.reduce((n,order)=>n+order.deliveryGrosze!,0),total=materialTotal+delivery;
      if(![materialTotal,delivery,total].every(Number.isSafeInteger)||!stores.every(order=>order.quote&&current(order.quote,postcode)))continue;
      const basket={stores,materialsGrosze:materialTotal,deliveryGrosze:delivery,totalGrosze:total,lowerBoundGrosze:total};
      if(!extraPackageAdditions(base,basket))continue;confirmed++;
      if(total<base.totalGrosze&&(option===null||total<option.basket.totalGrosze!))option={basket,savingGrosze:base.totalGrosze-total};
    }catch{/* An unconfirmed extra pack cannot change the original purchase plan. */}
  }
  const baselineExpired=!live(base);
  if(baselineExpired||option&&!live(option.basket))option=null;
  return{option,confirmed,searched:selected.length>0,baselineExpired};
}
