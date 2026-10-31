import type {RetailSource} from './retail-pages';
import type {DeliveredStoreBasket} from '../../../../lib/pricing-service/src/delivery';
import {parsePriceToGrosze} from '@workspace/price-collector';

export const KNAUF_PLASTER_SOURCES: readonly RetailSource[] = [
  // source: https://realbud.com/Tynk-maszynowy-gipsowy-Knauf-MP75L-30-kg
  // source: https://knauf.com/pl-PL/p/produkt/knauf-mp-75-l-10257_0120
  {"id":"realbud-knauf-mp75l-30kg","ean":"5902367206451","name":"Tynk maszynowy gipsowy Knauf MP 75 L lekki, op. 30 kg","brand":"Knauf","category":"plaster","packageSize":30,"unit":"kg","store":"Realbud","format":"shoper-api","productId":6599,"retailerSku":"49221","apiProductCode":"49221","apiPurchaseUnit":"szt.","url":"https://realbud.com/Tynk-maszynowy-gipsowy-Knauf-MP75L-30-kg","imageUrl":"https://realbud.com/environment/cache/images/productGfx_25647_500_500/49221.png","pickupRequiresConfirmation":true,"purchaseMultiple":40},
  // source: https://realbud.com/Tynk-gipsowy-reczny-Knauf-GOLDBAND-30-kg
  // source: https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120
  {"id":"realbud-knauf-goldband-30kg","ean":"5902367206475","name":"Tynk gipsowy ręczny Knauf GOLDBAND, op. 30 kg","brand":"Knauf","category":"plaster","packageSize":30,"unit":"kg","store":"Realbud","format":"shoper-api","productId":6645,"retailerSku":"10956","apiProductCode":"10956","apiPurchaseUnit":"szt.","url":"https://realbud.com/Tynk-gipsowy-reczny-Knauf-GOLDBAND-30-kg","imageUrl":"https://realbud.com/environment/cache/images/productGfx_25652_500_500/10956.png","pickupRequiresConfirmation":true},
  // source: https://realbud.com/Tynk-gipsowy-reczny-KNAUF-ROTBAND-30-kg
  // source: https://knauf.com/api/download-center/v1/assets/58b479fa-d45b-45f4-8c3e-dc92d4b237dd?country=pl&download=true
  {"id":"realbud-knauf-rotband-30kg","ean":"5903240904075","name":"Tynk gipsowy wys. przyczepności Knauf Rotband 30kg","brand":"Knauf","category":"plaster","packageSize":30,"unit":"kg","store":"Realbud","format":"shoper-api","productId":6773,"retailerSku":"8493","apiProductCode":"8493","apiPurchaseUnit":"szt.","url":"https://realbud.com/Tynk-gipsowy-reczny-KNAUF-ROTBAND-30-kg","imageUrl":"https://realbud.com/environment/cache/images/productGfx_25649_500_500/8493.png","pickupRequiresConfirmation":true},
  // source: https://www.plus-market.pl/pl/p/Tynk-maszynowy-gipsowy-Knauf-MP-75-L-30-kg-lekki/15716
  // source: https://knauf.com/pl-PL/p/produkt/knauf-mp-75-l-10257_0120
  {"id":"plus-knauf-mp75l-30kg","ean":"5902367206451","name":"Tynk maszynowy gipsowy Knauf MP 75 L 30 kg lekki","brand":"Knauf","category":"plaster","packageSize":30,"unit":"kg","store":"Plus-Market","format":"shoper-api","productId":15716,"retailerSku":"5902367206451","apiPurchaseUnit":"szt.","url":"https://www.plus-market.pl/pl/p/Tynk-maszynowy-gipsowy-Knauf-MP-75-L-30-kg-lekki/15716","imageUrl":"https://www.plus-market.pl/environment/cache/images/productGfx_39104_500_500/Tynk-maszynowy-MP75-30-kg-KNAUF.webp","pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/Knauf-GOLDBAND-Reczny-tynk-gipsowy-30kg/2022
  // source: https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120
  {"id":"rabdom-knauf-goldband-30kg","ean":"5902367206475","name":"Knauf GOLDBAND Ręczny tynk gipsowy 30kg","brand":"Knauf","category":"plaster","packageSize":30,"unit":"kg","store":"Rab-Dom","format":"shoper-api","productId":2022,"retailerSku":"0172","apiPurchaseUnit":"szt.","url":"https://www.rabdom.pl/pl/p/Knauf-GOLDBAND-Reczny-tynk-gipsowy-30kg/2022","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_5c8eda237bf003434d3020de193f3662_500_500.webp","pickupRequiresConfirmation":true,"apiProductCode":"0172"},
];

/** These exact native pieces are 30 kg bags. Realbud MP75L requires 40 bags;
 * the other reviewed stores/products sell individual bags. */
export function confirmKnaufPlasterPurchase(item:Record<string,any>,source:RetailSource):boolean {
  const reviewed=KNAUF_PLASTER_SOURCES.find(row=>row.id===source.id);
  if(!reviewed)return false;
  const keys=['ean','name','brand','category','packageSize','unit','store','format','productId','retailerSku','apiProductCode','apiPurchaseUnit','url'] as const;
  if(keys.some(key=>source[key]!==reviewed[key])||(source.purchaseMultiple??1)!==(reviewed.purchaseMultiple??1)||(source.minimumPackages??1)!==1
    ||item.id!==reviewed.productId||item.ean!==reviewed.ean||item.code!==reviewed.retailerSku||item.name!==reviewed.name||item.url!==reviewed.url
    ||item.unit?.name!=='szt.'||item.unit.floating_point!==false||item.weight?.weight_float!==30||item.weight.weight!=='30 kg'
    ||item.package!==(reviewed.purchaseMultiple===40?'40':'0'))throw Error('product_package_not_confirmed');
  const producerId=source.store==='Realbud'?13:source.store==='Rab-Dom'?83:undefined;
  if(producerId!==undefined?(item.producer?.id!==producerId||item.producer?.name!=='Knauf')
    :item.producer!==undefined&&item.producer?.name!=='Knauf')throw Error('product_brand_not_confirmed');
  return true;
}

function money(text:unknown,numeric:unknown):number {
  if(typeof text!=='string'||!/^\s*[\d\s,.]+\s*zł$/.test(text))throw Error('basket_not_confirmed');
  const parsed=typeof text==='string'?parsePriceToGrosze(text.replace(/\s*zł$/,'')):null;
  if(parsed===null||!Number.isSafeInteger(parsed)||parsed<0||typeof numeric!=='number'||!Number.isFinite(numeric)||Math.abs(numeric*100-parsed)>0.00001)throw Error('basket_not_confirmed');
  return parsed;
}

/** The named free method is offered only for this complete native pallet cart.
 * A general zero, collection or "transport on request" never qualifies.
 * source: https://realbud.com/Tynk-maszynowy-gipsowy-Knauf-MP75L-30-kg
 * source: https://realbud.com/koszty-transportu (promotions apply in Poland)
 */
export function selectRealbudMp75lDelivery(basket:any,order:DeliveredStoreBasket) {
  if(order.store!=='Realbud'||order.lines.length!==1||order.lines[0].packages.length!==1||order.lines[0].packages[0].offerId!=='realbud-knauf-mp75l-30kg')return null;
  const pack=order.lines[0].packages[0],source=KNAUF_PLASTER_SOURCES.find(row=>row.id==='realbud-knauf-mp75l-30kg')!;
  if(pack.packageSize!==30||!Number.isSafeInteger(pack.count)||pack.count<40||pack.count%40!==0||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<=0
    ||!Number.isSafeInteger(pack.lineCostGrosze)||!Number.isSafeInteger(order.materialsGrosze)||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze||order.materialsGrosze!==pack.lineCostGrosze||!Array.isArray(basket.products)||basket.products.length!==1)throw Error('basket_not_confirmed');
  const row=basket.products[0];
  if(!row||row.product_id!==source.productId||row.name!==source.name||row.url!==source.url||row.quantity!==pack.count||row.unit?.name!=='szt.'||row.unit.floating_point!==false
    ||money(row.price,row.price_float)!==pack.unitPriceGrosze||money(row.sum,row.sum_float)!==order.materialsGrosze
    ||money(basket.basket?.sum_products,basket.basket?.sum_products_float)!==order.materialsGrosze)throw Error('basket_not_confirmed');
  const selected=basket.countries?.filter((c:any)=>c.selected===true);
  if(selected?.length!==1||selected[0].id!==179||selected[0].name!=='Polska')throw Error('country_not_confirmed');
  const rates=basket.shippings?.filter((s:any)=>s.shipping_id===89);
  if(rates?.length!==1)return null;
  const rate=rates[0],country=rate.countries?.filter((c:any)=>c.id===179);
  if(rate.title!=='Darmowa dostawa'||rate.engine!==''||rate.description!==''||rate.selected!==true||country?.length!==1
    ||money(rate.cost,rate.cost_float)!==0||money(country[0].cost,country[0].cost_float)!==0
    ||String(basket.free_shipping?.shipping_id)!=='89')throw Error('no_home_delivery');
  const payments=basket.payments?.filter((p:any)=>p.payment_id===3&&p.selected===true&&p.name==='onlinePayment'&&p.title==='Autopay');
  const methods=rate.payments?.filter((p:any)=>p.payment_id===3);
  if(payments?.length!==1||methods?.length!==1)throw Error('no_home_delivery');
  for(const p of [payments[0],methods[0]])if((p.additional_cost!==undefined||p.additional_cost_float!==undefined)&&money(p.additional_cost,p.additional_cost_float)!==0)throw Error('no_home_delivery');
  if(money(basket.basket.sum,basket.basket.sum_float)!==order.materialsGrosze)throw Error('basket_not_confirmed');
  return {costGrosze:0,carrier:rate.title as string,payment:payments[0].title as string};
}
