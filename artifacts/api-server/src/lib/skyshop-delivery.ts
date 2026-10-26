import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {RETAIL_SOURCES} from './retail-catalog';
import {confirmSkyshopBasket,MATBUD_ORIGIN,MATBUD_PRODUCER,readSkyshopProduct,reviewedSkyshopSource,skyshopEvidenceHash,skyshopReview,type SkyshopExpectedLine} from './skyshop-product';
import {cleanHtml,htmlAttributes,htmlElements} from './retail-microdata';

export function confirmSkyshopCalculation(value:any,count:number,unitPriceGrosze:number,itemId:string,selected=false){
 return confirmSkyshopBasketCalculation(value,[{productId:96729,count,unitPriceGrosze,itemId}],selected);
}
export function confirmSkyshopBasketCalculation(value:any,expected:readonly SkyshopExpectedLine[],selected=false){
 if(!expected.length||expected.length>2||new Set(expected.map(row=>row.productId)).size!==expected.length)throw Error('invalid_basket');
 if(value?.baseCurrency!=='PLN'||value.orderCurrency!=='PLN'||value.isWdt!==false||value.coupon!==null||value.gratisId!==null||![null,0].includes(value.orderPaymentOverhead)||!Array.isArray(value.products)||value.products.length!==expected.length)throw Error('basket_not_confirmed');
 let total=0;const seen=new Set<number>();
 for(const product of value.products){
  const line=expected.find(row=>row.productId===product?.id);
  if(!line||seen.has(line.productId))throw Error('basket_not_confirmed');seen.add(line.productId);
  const review=skyshopReview(line.productId);
  if(!Number.isSafeInteger(line.count)||line.count<50*review.nativePerPack||line.count%review.nativePerPack||!Number.isSafeInteger(line.unitPriceGrosze)||line.unitPriceGrosze<1||!Number.isSafeInteger(line.count*line.unitPriceGrosze)||!line.itemId)throw Error('invalid_basket');
  if(product.name!==review.name||product.producerName!==MATBUD_PRODUCER||product.tax!=='23'||product.hash!==line.itemId||!Array.isArray(product.options)||product.options.length)throw Error('basket_not_confirmed');
  if(product.amount!==line.count)throw Error('insufficient_stock');
  if(parsePriceToGrosze(product.price)!==line.unitPriceGrosze||parsePriceToGrosze(product.priceInOrderCurrency)!==line.unitPriceGrosze)throw Error('price_changed');
  total+=line.count*line.unitPriceGrosze;
 }
 if(!Number.isSafeInteger(total)||[value.orderProductsPricesSum,value.orderProductsPricesSumInOrderCurrency,value.orderPriceTotal].some(amount=>parsePriceToGrosze(amount)!==total))throw Error('price_changed');
 if(value.orderPriceShipment!==0)throw Error('no_home_delivery');
 if(selected&&(value.payment?.name!=='Wpłata na konto bankowe'||value.shipment?.name!=='Styropian, DARMOWA DOSTAWA !'))throw Error('no_home_delivery');
 return value;
}

export function confirmSkyshopShipping(html:string,methods:any,count:number,unitPriceGrosze:number,itemId:string){
 return confirmSkyshopBasketShipping(html,methods,[{productId:96729,count,unitPriceGrosze,itemId}]);
}
export function confirmSkyshopBasketShipping(html:string,methods:any,expected:readonly SkyshopExpectedLine[]){
 const safe=cleanHtml(html),orders=htmlElements(safe,a=>a.class?.split(/\s+/).includes('order')??false);
 if(orders.length!==1)throw Error('basket_not_confirmed');
 const attrs=htmlAttributes(orders[0].match(/^<[^>]+>/)?.[0]??'');
 let initial:any;try{initial=JSON.parse(Buffer.from(attrs['data-calc']??'','base64').toString());}catch{throw Error('basket_not_confirmed');}
 confirmSkyshopBasketCalculation(initial,expected);
 if(!methods||typeof methods!=='object'||Array.isArray(methods)||methods.user_error)throw Error('no_home_delivery');
 const shipping=methods.s182be0c5c;
 if(shipping?.name!=='Styropian, DARMOWA DOSTAWA !'||shipping.personal!=='no'||shipping.function!=='none'||shipping.pay_delivery!=='no'||shipping.require_address!=='yes'||shipping.price!==0||shipping.price_net!==0||shipping.postal_codes!==null||shipping.cities!==null||shipping.streets!==null||!Array.isArray(shipping.methods)||shipping.methods.length)throw Error('no_home_delivery');
 return shipping;
}

/** Confirm one complete fresh anonymous cart, including mixed native OP/M2
 * lines. Pack counts and native quantities are deliberately distinct. No
 * customer/order submission. PL national minimum-logistics delivery, not an
 * invented full-address quotation.
 * source: https://centrummatbud.pl/view/new/userContent/bum/script.js?v=699 */
export async function quoteSkyshop(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 const packs=order.lines.flatMap(line=>line.packages);
 if(order.store!=='Centrum Matbud'||!packs.length||packs.length>2||new Set(packs.map(pack=>pack.offerId)).size!==packs.length)throw Error('invalid_basket');
 const wanted=packs.map(pack=>{
  const source=RETAIL_SOURCES.find(row=>row.id===pack.offerId&&row.store===order.store&&row.format==='skyshop');
  if(!source)throw Error('invalid_basket');const review=reviewedSkyshopSource(source);
  if(!Number.isSafeInteger(pack.count)||pack.count<50||pack.count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<1||!Number.isSafeInteger(pack.lineCostGrosze)||pack.packageSize!==review.area||pack.minimumPackages!==50||(pack.purchaseMultiple??1)!==1||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze)throw Error('invalid_basket');
  return{source,review,pack};
 });
 if(wanted.reduce((sum,row)=>sum+row.pack.lineCostGrosze,0)!==order.materialsGrosze)throw Error('invalid_basket');
 const client=new AnonymousShop(MATBUD_ORIGIN,fetchImpl,AbortSignal.timeout(20000),32),expected:SkyshopExpectedLine[]=[],evidence:unknown[]=[];
 for(const {source,review,pack}of wanted){
  const current=await readSkyshopProduct(source,client);
  if(current.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
  if(current.stock<pack.count)throw Error('insufficient_stock');
  expected.push({productId:review.id,count:pack.count*review.nativePerPack,unitPriceGrosze:current.nativePriceGrosze});evidence.push(...current.evidence);
 }
 const empty=await client.skyshop('create-cart');
 for(const line of expected){const added=await client.skyshop('add',line.count,line.productId);if(added?.id!==empty.id||added.addedCartItem?.quantity!==line.count)throw Error('insufficient_stock');}
 const cart=confirmSkyshopBasket(await client.skyshop('cart'),expected);
 if(cart.id!==empty.id)throw Error('basket_not_confirmed');
 for(const line of expected)line.itemId=cart.items.find((item:any)=>item.product.id===line.productId).id;
 const shipping=await client.skyshop('shipping'),method=confirmSkyshopBasketShipping(shipping.html,shipping.methods,expected);
 const calculation=confirmSkyshopBasketCalculation(await client.skyshop('calculate'),expected,true),now=new Date();
 return{quote:{costGrosze:0,carrier:method.name,payment:calculation.payment.name,checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:wanted.length===1?wanted[0].source.url:MATBUD_ORIGIN+'/order',destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:skyshopEvidenceHash([...evidence,cart,shipping.html,shipping.methods,calculation])}};
}
