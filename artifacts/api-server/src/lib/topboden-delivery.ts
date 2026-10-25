import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {RETAIL_SOURCES} from './retail-catalog';
import {AnonymousShop,MAX_RETAIL_PACKAGES,retailerRequestBudget} from './retailer-http';
import {readTopbodenProduct,TOPBODEN_API} from './topboden-product';

// source: https://topboden.pl/dostawa-i-platnosc
// source: https://api.topboden.pl/api/delivery
// The store publishes a national category tariff: charge the highest category
// in the complete order once, with its current free-shipping threshold.
export async function quoteTopboden(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult> {
  const signal=AbortSignal.timeout(12_000),client=new AnonymousShop(TOPBODEN_API,fetchImpl,signal,retailerRequestBudget(order.lines.length));
  const proofs:any[]=[],categories:string[][]=[],seen=new Set<string>();let materials=0;
  for(const line of order.lines)for(const pack of line.packages){
    const source=RETAIL_SOURCES.find(source=>source.id===pack.offerId&&source.store==='TopBoden'&&source.format==='topboden-api');
    if(!source||seen.has(pack.offerId)||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||pack.packageSize!==source.packageSize||line.unit!==source.unit||pack.url!==source.url||!Number.isSafeInteger(pack.lineCostGrosze)||pack.lineCostGrosze!==pack.unitPriceGrosze*pack.count)throw Error('invalid_basket');
    seen.add(pack.offerId);
    const current=await readTopbodenProduct(source,fetchImpl,pack.count,signal);
    if(current.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
    const product=current.product;
    if(typeof product.category?.uuid!=='string'||typeof product.category.parentUuid!=='string'||typeof product.isSlab!=='boolean'||typeof product.isTile!=='boolean')throw Error('delivery_category_not_confirmed');
    const keys=[product.category.uuid,product.category.parentUuid];
    if(product.isSlab)keys.push('4ee25b28-2305-4f9d-a1a0-c452489d6564');
    if(product.isTile)keys.push('36708ff4-b0e6-4f02-a2ff-27ff3edf0cbf');
    categories.push(keys);materials+=pack.lineCostGrosze;proofs.push({id:source.id,ean:source.ean,count:pack.count,price:current.priceGrosze,evidence:current.evidenceSha256});
  }
  if(!seen.size||!Number.isSafeInteger(materials)||materials!==order.materialsGrosze)throw Error('basket_not_confirmed');
  const data=await client.json('/api/delivery');
  const rates=Array.isArray(data)?data.filter(rate=>rate.isSample===false&&rate.type==='COURIER'&&rate.name==='Kurier'):[];
  if(rates.length!==1)throw Error('no_home_delivery');
  const rate=rates[0],matrix={...rate.prices?.categories,...rate.prices?.formats};
  if(!Number.isFinite(rate.minOrderValue)||rate.minOrderValue<=0||!Number.isSafeInteger(rate.minOrderValue*100))throw Error('delivery_threshold_not_confirmed');
  const prices=categories.map(keys=>{
    const applicable=keys.filter(key=>Object.hasOwn(matrix,key)).map(key=>parsePriceToGrosze(matrix[key]));
    if(!applicable.length||applicable.some(value=>value===null||value<=0))throw Error('delivery_category_not_confirmed');
    return Math.max(...applicable as number[]);
  });
  const costGrosze=materials>=Math.round(rate.minOrderValue*100)?0:Math.max(...prices),checkedAt=new Date();
  return {quote:{costGrosze,carrier:'Kurier',payment:'Przelew tradycyjny',checkedAt:checkedAt.toISOString(),expiresAt:new Date(checkedAt.getTime()+600_000).toISOString(),sourceUrl:'https://topboden.pl/dostawa-i-platnosc',destinationScope:'PL',basis:'retailer_tariff_national',evidenceSha256:createHash('sha256').update(JSON.stringify({products:proofs,tariff:data,materials,country:'PL',costGrosze})).digest('hex')}};
}
