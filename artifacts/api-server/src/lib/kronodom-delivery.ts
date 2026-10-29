import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {RETAIL_SOURCES} from './retail-catalog';
import {readAbstoreProduct} from './abstore-product';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';

const origin='https://kronodom.pl',sourceId='kronodom-arbiton-secura-thermo-6m2';
const one=(nodes:string[],reason='basket_not_confirmed')=>{if(nodes.length!==1)throw Error(reason);return nodes[0];};
const attrs=(node:string)=>htmlAttributes(node.match(/^<[^>]+>/)?.[0]??'');
const cls=(a:Record<string,string>,name:string)=>a.class?.split(/\s+/).includes(name)??false;
const element=(html:string,id:string)=>one(htmlElements(html,a=>a.id===id));
const has=(node:string,key:string)=>new RegExp('\\s'+key+'(?:\\s|=|>)').test(node.match(/^<[^>]+>/)?.[0]??'');
const amount=(html:string)=>{
 const node=one(htmlElements(html,a=>cls(a,'abs-item-price-amount'))),text=htmlText(node),match=text.match(/^([\d\s]+),(\d{2}) zł(?: brutto)?$/);
 if(!match)throw Error('basket_not_confirmed');const value=Number(match[1].replace(/\s/g,''))*100+Number(match[2]);
 if(!Number.isSafeInteger(value)||value<0)throw Error('basket_not_confirmed');
 const numeric=attrs(node)['data-final-gross-value'];if(numeric!==undefined&&parsePriceToGrosze(numeric)!==value)throw Error('basket_not_confirmed');return value;
};

/** Reviewed first cart step: exact EAN, native m² and whole gross totals.
 * Pickup's tempting zero is never used as a home-delivery quotation.
 * source: https://kronodom.pl/order/checkout/cart
 */
export function confirmKronodomCart(raw:string,count:number,packPrice:number):{costGrosze:number;carrier:string;payment:string}{
 if(!Number.isSafeInteger(count)||count<1||count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(packPrice)||packPrice<=0||packPrice%6)throw Error('invalid_basket');
 const html=cleanHtml(raw),body=htmlAttributes(html.match(/<body\b[^>]*>/i)?.[0]??'');
 if(body['data-currency']!=='PLN'||body['data-authenticated']!=='false')throw Error('basket_not_confirmed');
 const cart=element(html,'cart-box-content'),rows=htmlElements(cart,(a,tag)=>tag==='tr'&&/^productTrIdop-/.test(a.id??''));
 const row=one(rows);if(attrs(row).id!=='productTrIdop-423'||!htmlText(row).includes('Indeks katalogowy: 5905167826942'))throw Error('basket_not_confirmed');
 const source=RETAIL_SOURCES.find(s=>s.id===sourceId)!;
 const link=one(htmlElements(row,(_a,tag)=>tag==='a').filter(node=>attrs(node).href&&!attrs(node).href.startsWith('#')));
 if(new URL(attrs(link).href,origin).href!==source.url||htmlText(link)!==source.name)throw Error('basket_not_confirmed');
 const input=attrs(one(htmlElements(row,(a,tag)=>tag==='input'&&cls(a,'touch-spin'))));
 if(input['data-product-id']!=='423'||input['data-offer-pos-id']!=='423'||input['data-offer-id']!=='1'||input['data-unitid']!=='1007'||input['data-unitsc']!=='m2'||input['data-determinant']!=='op-423'||Number(input.value)!==count*6||Number(input['data-initval'])!==count*6||Number(input['data-step'])!==6||Number(input['data-min'])!==6)throw Error('basket_not_confirmed');
 const qty=one(htmlElements(row,a=>cls(a,'abs-col-quantity')));if(!/Dostępność: Dostępne/.test(htmlText(qty)))throw Error('product_unavailable');
 const unitPrice=amount(one(htmlElements(row,a=>cls(a,'abs-col-price'))));
 if(unitPrice*6!==packPrice||amount(element(row,'productTotalPriceIdop-423'))!==packPrice*count)throw Error('price_changed');
 const country=attrs(one(htmlElements(cart,(a,t)=>t==='input'&&a.name==='delivery_country')));if(country.value!=='1')throw Error('no_home_delivery');
 const selected=(name:string)=>{
  const checked=one(htmlElements(cart,(a,t)=>t==='input'&&a.type==='radio'&&a.name===name).filter(n=>has(n,'checked')),'no_home_delivery'),a=attrs(checked);
  if(has(checked,'disabled')||a['data-paid-after-send']!=='false'||a['data-automat-available']!=='false')throw Error('no_home_delivery');
  return {a,label:one(htmlElements(cart,(l,t)=>t==='label'&&l.for===a.id),'no_home_delivery')};
 };
 const shipping=selected('delivery_method');if(shipping.a.value!=='1003'||shipping.a.id!=='delivery_1003')throw Error('no_home_delivery');
 const cost=amount(shipping.label);if(htmlText(shipping.label).replace(/[\d\s,.]+ zł$/,'').trim()!=='Dostawa kurierem')throw Error('no_home_delivery');
 const payment=selected('payment_method'),paymentName=htmlText(payment.label);
 if(!(['3','6'].includes(payment.a.value))||(payment.a.value==='3'?paymentName!=='płatność przelewem tradycyjnym':paymentName!=='płatność przelewem online, BLIK, płatność odroczona, raty'))throw Error('no_home_delivery');
 const summary=one(htmlElements(cart,a=>cls(a,'summary-panel'))),prices=htmlElements(summary,a=>cls(a,'abs-item-price-amount'));
 if(prices.length!==3||amount(prices[0])!==count*packPrice||amount(element(summary,'payment-delivery-total-price'))!==cost||amount(element(summary,'order-total-price'))!==count*packPrice+cost)throw Error('basket_not_confirmed');
 // Free delivery must be supported by the current cart and the public policy;
 // never treat a missing amount or a small-order zero as a courier charge.
 if(cost===0&&count*packPrice<=299900)throw Error('no_home_delivery');
 return{costGrosze:cost,carrier:'Dostawa kurierem',payment:paymentName};
}

export async function quoteKronodom(order:DeliveredStoreBasket,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='Kronodom'||order.lines.length!==1||order.lines[0].packages.length!==1||order.lines[0].unit!=='m2')throw Error('invalid_basket');
 const pack=order.lines[0].packages[0],source=RETAIL_SOURCES.find(s=>s.id===pack.offerId&&s.store==='Kronodom'&&s.format==='abstore');
 if(!source||source.id!==sourceId||pack.packageSize!==6||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<=0||order.materialsGrosze!==pack.count*pack.unitPriceGrosze)throw Error('invalid_basket');
 const client=new AnonymousShop(origin,fetchImpl,AbortSignal.timeout(20000),10),primary=await client.text(source.url),product=readAbstoreProduct(primary,source);
 if(parsePriceToGrosze(product.offers.price)!==pack.unitPriceGrosze)throw Error('price_changed');
 const data=JSON.parse(one([...primary.matchAll(/<script\b[^>]*>\s*const productData = ([\s\S]*?);\s*<\/script>/g)].map(m=>m[1])));
 if(data.clientSaleUnit.availQnt<pack.count*6)throw Error('insufficient_stock');
 const body=htmlAttributes(primary.match(/<body\b[^>]*>/)?.[0]??''),csrf=body['data-csrf'];
 if(body['data-authenticated']!=='false'||body['data-currency']!=='PLN'||body['data-pow']!=='disabled'||!/^[a-f0-9]{64}$/.test(csrf??''))throw Error('basket_not_confirmed');
 const added=await client.kronodomAdd(pack.count,csrf);
 const refreshed=Array.isArray(added.events)?added.events.filter((e:any)=>e.eventName==='OrderRefreshEvent'):[];
 const logistic=Array.isArray(added.events)?added.events.filter((e:any)=>e.eventName==='postUpdateOrder'):[];
 if(added.code!=='200'||!Array.isArray(added.modals)||added.modals.length||refreshed.length!==1||logistic.length!==1||logistic[0].data?.resultOrder?.logisticDTO?.validAll!==true||logistic[0].data.resultOrder.logisticDTO.errorLogId!==null)throw Error('basket_not_confirmed');
 const quantities=refreshed[0].data?.determinantQuantities;
 if(!Array.isArray(quantities)||quantities.length!==1||quantities[0].determinant!=='op-423'||quantities[0].quantity!==pack.count*6||quantities[0].shortcut!=='m2')throw Error('basket_not_confirmed');
 const cart=await client.text('/cart/'),selected=confirmKronodomCart(cart,pack.count,pack.unitPriceGrosze);let policy='';
 if(selected.costGrosze===0){policy=htmlText(cleanHtml(await client.text('/opcje-i-koszty-dostawy')));if(!/powyżej 2999 zł - Darmowa wysyłka/.test(policy))throw Error('no_home_delivery');}
 const now=new Date();return{quote:{...selected,checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:origin+'/order/checkout/cart',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:createHash('sha256').update(cart+policy).digest('hex')}};
}
