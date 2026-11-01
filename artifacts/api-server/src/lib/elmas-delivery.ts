import {createHash} from 'node:crypto';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {ELMAS_ORIGIN,ELMAS_TAPE,ELMAS_HOME_CARRIER} from './elmas-source';
import {readElmasProduct,readElmasNativeCard} from './elmas-product';

const amount=(value:unknown)=>{if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw Error('basket_not_confirmed');const n=parsePriceToGrosze(String(value));if(n===null||!Number.isSafeInteger(n)||n<0||n>2_000_000_000||Math.abs(value*100-n)>1e-7)throw Error('basket_not_confirmed');return n;};
const home=(data:any)=>{
  if(!Array.isArray(data?.deliveryOptions)||!Array.isArray(data.paymentOptions))throw Error('no_home_delivery');
  const rows=data.deliveryOptions.filter((d:any)=>d.id===ELMAS_HOME_CARRIER&&d.type==='inpost_courier'&&d.name==='InPost Kurier'&&!d.mapType&&!d.mapCod&&!d.disabled&&d.paymentType?.p24===true);
  if(rows.length!==1||!data.paymentOptions.some((p:any)=>p.key==='p24'&&p.type==='p24'&&p.disabled===false&&p.error===''))throw Error('no_home_delivery');
  return{row:rows[0],cost:amount(rows[0].price?.brutto)};
};
/** The card's free-shipping label and the default 40 PLN locker are not home
 * delivery. Select and recheck the native courier for this complete PL basket.
 * source: https://sklep-elmas.pl/order/form */
export async function quoteElmas(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
  if(order.store!=='Elmas'||order.lines.length!==1||order.lines[0].unit!=='m'||order.lines[0].product.id!=='remont-'+ELMAS_TAPE.ean||order.lines[0].packages.length!==1)throw Error('invalid_basket');
  const pack=order.lines[0].packages[0];if(pack.offerId!==ELMAS_TAPE.id||pack.store!=='Elmas'||pack.url!==ELMAS_TAPE.url||pack.packageSize!==30||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<1||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze||!Number.isSafeInteger(order.materialsGrosze)||order.materialsGrosze!==pack.count*pack.unitPriceGrosze)throw Error('invalid_basket');
  const client=new AnonymousShop(ELMAS_ORIGIN,fetchImpl,AbortSignal.timeout(20000),8),raw=await client.text(ELMAS_TAPE.url),card=readElmasProduct(raw,ELMAS_TAPE),api=await client.json('/api/public/p/'+ELMAS_TAPE.retailerSku+'?lang=pl&id=1'),current=readElmasNativeCard(api,ELMAS_TAPE);
  if(card.priceGrosze!==pack.unitPriceGrosze||current.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
  if(current.maxPackages<pack.count)throw Error('insufficient_stock');
  const args={count:pack.count,priceGrosze:current.priceGrosze,nettoGrosze:current.nettoGrosze,stock:current.maxPackages},initial=await client.elmasShipping(args);
  if(!Array.isArray(initial.options?.countries)||!initial.options.countries.some((c:any)=>c.value==='pl'&&c.text==='Polska')||initial.discountCode!==undefined||initial.giftCard!==undefined)throw Error('no_home_delivery');
  const first=home(initial),defaultCost=amount(initial.selectedDelivery?.price),selected=await client.elmasShipping({...args,selected:true,previousTotalGrosze:order.materialsGrosze+defaultCost}),last=home(selected);
  if(last.cost!==first.cost||selected.selectedDelivery?.id!==ELMAS_HOME_CARRIER||selected.selectedDelivery?.name!=='InPost Kurier'||amount(selected.selectedDelivery?.price)!==last.cost||selected.selectedDelivery?.mapType||selected.discountCode!==undefined||selected.giftCard!==undefined)throw Error('basket_not_confirmed');
  const now=new Date();return{quote:{costGrosze:last.cost,carrier:'InPost Kurier',payment:'Przelewy24',checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:ELMAS_ORIGIN+'/order/form',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:createHash('sha256').update(raw+JSON.stringify({country:'PL',store:order.store,materialsGrosze:order.materialsGrosze,packages:order.lines[0].packages,api,initial,selected})).digest('hex')}};
}
