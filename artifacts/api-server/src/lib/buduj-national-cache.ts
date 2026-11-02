import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';
import {RETAIL_SOURCES} from './retail-catalog';
import {MAX_RETAIL_PACKAGES} from './retailer-http';

/** The native cart selects country PL and never submits a postcode. Reuse is
 * limited to the exact reviewed physical basket, price and purchase rules.
 * This identity is not a tariff and cannot create or extend a merchant quote.
 * source: https://buduj24.pl/cart */
export function budujNationalBasketKey(order:DeliveredStoreBasket):string|null {
 if(order.store!=='Buduj24'||!Number.isSafeInteger(order.materialsGrosze)||order.materialsGrosze<1||order.lines.length<1||order.lines.length>20)return null;
 const seen=new Set<string>(),rows:Array<Array<string|number>>=[];let total=0;
 for(const line of order.lines){
  if(line.packages.length<1||line.packages.length>20)return null;
  for(const pack of line.packages){
   const source=RETAIL_SOURCES.find(s=>s.id===pack.offerId&&s.store==='Buduj24'&&s.format==='buduj24'&&!s.disabledReason);
   const unit=(u:string|null|undefined)=>u==='mb'?'m':u??'';
   if(!source||seen.has(source.id)||line.product.id!=='remont-'+source.ean||unit(line.unit)!==unit(source.unit)||pack.store!=='Buduj24'||pack.url!==source.url||pack.packageSize!==source.packageSize||pack.cutRoll!==undefined||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||pack.maxPackages!==undefined&&(!Number.isSafeInteger(pack.maxPackages)||pack.count>pack.maxPackages)||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<1||!Number.isSafeInteger(pack.lineCostGrosze)||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze)return null;
   const minimum=pack.minimumPackages??1,multiple=pack.purchaseMultiple??1;
   if(!Number.isSafeInteger(minimum)||minimum<1||!Number.isSafeInteger(multiple)||multiple<1||pack.count<minimum||pack.count%multiple)return null;
   seen.add(source.id);total+=pack.lineCostGrosze;rows.push([source.id,source.ean,source.url,source.unit,source.packageSize,pack.count,pack.unitPriceGrosze,minimum,multiple]);
  }
 }
 if(!Number.isSafeInteger(total)||total!==order.materialsGrosze)return null;
 return JSON.stringify(['Buduj24','PL',total,rows.sort((a,b)=>String(a[0]).localeCompare(String(b[0])))]);
}
