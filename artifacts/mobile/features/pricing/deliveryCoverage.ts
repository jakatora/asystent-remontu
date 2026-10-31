import type {DeliveryComparison} from '../../../../lib/pricing-service/src/delivery';

/** A complete payable basket does not prove that unquoted alternatives cost
 * more. Keep this separate from missing products and the bounded search scope. */
export function unconfirmedDeliveryCoverage(comparison:DeliveryComparison,current:boolean,selectedStore?:string|null):{stores:string[];rateLimitedStores:string[]}|null{
 if(!current||comparison.mode!=='shipping'||!/^\d{2}-\d{3}$/.test(comparison.postalCode??'')||!comparison.best||comparison.missingProductCount!==0||!['compared','needs_delivery_costs'].includes(comparison.status))return null;
 const relevant=(store:string)=>!selectedStore||store===selectedStore;
 const stores=[...new Set([
  ...(comparison.unavailableStores??[]).map(item=>item.store),
  ...(comparison.partiallyQuotedStores??[]),
  ...(comparison.missingDeliveryStores??[]),
 ].filter(store=>store.length>0&&relevant(store)))];
 const unnamed=comparison.status==='needs_delivery_costs'&&!selectedStore;
 if(!stores.length&&!unnamed)return null;
 const rateLimitedStores=[...new Set((comparison.unavailableStores??[]).filter(item=>item.reason==='retailer_rate_limited'&&relevant(item.store)).map(item=>item.store))];
 return{stores,rateLimitedStores};
}

export function deliveryRateLimitMessage(language:string):string{
 return language==='pl'?'Sklep chwilowo ogranicza automatyczne wyceny. Spróbuj później lub sprawdź dostawę bezpośrednio w sklepie.':'The store is temporarily limiting automatic quotes. Try later or check delivery directly with the store.';
}
