import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {RETAIL_SOURCES} from './retail-catalog';
import {confirmSkyshopCart,MATBUD_NAME,MATBUD_ORIGIN,MATBUD_PRODUCER,MATBUD_URL,readSkyshopProduct,skyshopEvidenceHash} from './skyshop-product';
import {cleanHtml,htmlAttributes,htmlElements} from './retail-microdata';

export function confirmSkyshopCalculation(value:any,count:number,unitPriceGrosze:number,itemId:string,selected=false){
 const total=count*unitPriceGrosze;
 if(value?.baseCurrency!=='PLN'||value.orderCurrency!=='PLN'||value.isWdt!==false||value.coupon!==null||value.gratisId!==null||![null,0].includes(value.orderPaymentOverhead)||!Array.isArray(value.products)||value.products.length!==1)throw Error('basket_not_confirmed');
 const product=value.products[0];
 if(product.id!==96729||product.name!==MATBUD_NAME||product.producerName!==MATBUD_PRODUCER||product.tax!=='23'||product.hash!==itemId||!Array.isArray(product.options)||product.options.length)throw Error('basket_not_confirmed');
 if(product.amount!==count)throw Error('insufficient_stock');
 if(parsePriceToGrosze(product.price)!==unitPriceGrosze||parsePriceToGrosze(product.priceInOrderCurrency)!==unitPriceGrosze||[value.orderProductsPricesSum,value.orderProductsPricesSumInOrderCurrency,value.orderPriceTotal].some(amount=>parsePriceToGrosze(amount)!==total))throw Error('price_changed');
 if(value.orderPriceShipment!==0)throw Error('no_home_delivery');
 if(selected&&(value.payment?.name!=='Wpłata na konto bankowe'||value.shipment?.name!=='Styropian, DARMOWA DOSTAWA !'))throw Error('no_home_delivery');
 return value;
}

export function confirmSkyshopShipping(html:string,methods:any,count:number,unitPriceGrosze:number,itemId:string){
 const safe=cleanHtml(html),orders=htmlElements(safe,a=>a.class?.split(/\s+/).includes('order')??false);
 if(orders.length!==1)throw Error('basket_not_confirmed');
 const attrs=htmlAttributes(orders[0].match(/^<[^>]+>/)?.[0]??'');
 let initial:any;try{initial=JSON.parse(Buffer.from(attrs['data-calc']??'','base64').toString());}catch{throw Error('basket_not_confirmed');}
 confirmSkyshopCalculation(initial,count,unitPriceGrosze,itemId);
 if(!methods||typeof methods!=='object'||Array.isArray(methods)||methods.user_error)throw Error('no_home_delivery');
 const shipping=methods.s182be0c5c;
 if(shipping?.name!=='Styropian, DARMOWA DOSTAWA !'||shipping.personal!=='no'||shipping.function!=='none'||shipping.pay_delivery!=='no'||shipping.require_address!=='yes'||shipping.price!==0||shipping.price_net!==0||shipping.postal_codes!==null||shipping.cities!==null||shipping.streets!==null||!Array.isArray(shipping.methods)||shipping.methods.length)throw Error('no_home_delivery');
 return shipping;
}

/** Anonymous shipping calculation only. Minimum, inventory, actual purchased
 * count and gross total are confirmed independently; canBuy alone is not proof.
 * The country-wide 50-pack rule is labelled PL, never a postcode-address quote.
 * source: https://centrummatbud.pl/view/new/userContent/bum/script.js?v=699 */
export async function quoteSkyshop(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='Centrum Matbud'||order.lines.length!==1||order.lines[0].packages.length!==1)throw Error('invalid_basket');
 const pack=order.lines[0].packages[0],source=RETAIL_SOURCES.find(row=>row.id===pack.offerId&&row.store===order.store&&row.format==='skyshop');
 if(!source||!Number.isSafeInteger(pack.count)||pack.count<50||pack.count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(pack.unitPriceGrosze)||!Number.isSafeInteger(pack.lineCostGrosze)||pack.packageSize!==3||pack.minimumPackages!==50||(pack.purchaseMultiple??1)!==1||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze||order.materialsGrosze!==pack.lineCostGrosze)throw Error('invalid_basket');
 const client=new AnonymousShop(MATBUD_ORIGIN,fetchImpl,AbortSignal.timeout(20000),20),current=await readSkyshopProduct(source,client);
 if(current.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
 if(current.stock<pack.count)throw Error('insufficient_stock');
 const empty=await client.skyshop('create-cart'),added=await client.skyshop('add',pack.count);
 if(added?.id!==empty.id||added.addedCartItem?.quantity!==pack.count)throw Error('insufficient_stock');
 const cart=confirmSkyshopCart(await client.skyshop('cart'),pack.count,current.priceGrosze);
 if(cart.id!==empty.id)throw Error('basket_not_confirmed');
 const shipping=await client.skyshop('shipping');
 const method=confirmSkyshopShipping(shipping.html,shipping.methods,pack.count,current.priceGrosze,cart.items[0].id);
 const calculation=confirmSkyshopCalculation(await client.skyshop('calculate'),pack.count,current.priceGrosze,cart.items[0].id,true),now=new Date();
 return{quote:{costGrosze:0,carrier:method.name,payment:calculation.payment.name,checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:MATBUD_URL,destinationScope:'PL',basis:'retailer_basket_national',evidenceSha256:skyshopEvidenceHash([...current.evidence,cart,shipping.html,shipping.methods,calculation])}};
}
