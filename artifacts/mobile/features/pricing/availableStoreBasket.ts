import type {DeliveryComparison,DeliveredBasket} from '../../../../lib/pricing-service/src/delivery';
const money=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;

/** A valid quoted subset stays separate from the whole-renovation total.
 * Reject a stale destination/store, expired quote and inconsistent gross sums. */
export function availableStoreBasket(comparison:DeliveryComparison,current:boolean,selectedStore?:string|null,now=Date.now()):DeliveredBasket|null{
 const part=comparison.availablePart,basket=part?.basket;
 if(!current||!selectedStore||comparison.mode!=='shipping'||comparison.method!=='automatic'||comparison.status!=='partial'||comparison.missingProductCount<1||comparison.best||!/^\d{2}-\d{3}$/.test(comparison.postalCode??'')||!part||part.store!==selectedStore||!Number.isSafeInteger(part.productCount)||part.productCount<1||!basket||basket.stores.length!==1)return null;
 const store=basket.stores[0],quote=store.quote,products=new Set(store.lines.map(l=>l.product.id));
 if(store.store!==selectedStore||store.source!=='retailer'||!quote||products.size!==part.productCount||store.lines.length!==part.productCount||!store.lines.length||!money(basket.materialsGrosze)||!money(basket.deliveryGrosze)||!money(basket.totalGrosze)||!money(store.materialsGrosze)||!money(store.deliveryGrosze)||!money(store.totalGrosze)||!money(quote.costGrosze))return null;
 const checked=Date.parse(quote.checkedAt),expires=Date.parse(quote.expiresAt);
 // Client/server clocks can differ by milliseconds when a fresh quote arrives.
 // Permit at most5seconds of future skew; never extend the actual10minute TTL.
 if(!Number.isFinite(checked)||checked>now+5000||!Number.isFinite(expires)||expires<=now||expires<=checked||expires-checked>600000||!['PL','postal_code'].includes(quote.destinationScope)||quote.destinationScope==='postal_code'&&quote.postalCode!==comparison.postalCode||!quote.sourceUrl.startsWith('https://'))return null;
 if(basket.materialsGrosze!==store.materialsGrosze||basket.deliveryGrosze!==store.deliveryGrosze||basket.totalGrosze!==store.totalGrosze||quote.costGrosze!==store.deliveryGrosze||basket.materialsGrosze+basket.deliveryGrosze!==basket.totalGrosze)return null;
 let materials=0;
 for(const line of store.lines){if(!line.packages.length)return null;for(const pack of line.packages){if(pack.store!==selectedStore||!Number.isSafeInteger(pack.count)||pack.count<1||!money(pack.unitPriceGrosze)||!money(pack.lineCostGrosze)||pack.count*pack.unitPriceGrosze!==pack.lineCostGrosze)return null;materials+=pack.lineCostGrosze;}}
 return money(materials)&&materials===basket.materialsGrosze?basket:null;
}
