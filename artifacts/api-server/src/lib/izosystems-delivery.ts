import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {RETAIL_SOURCES} from './retail-catalog';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {cleanHtml,htmlElements,htmlText} from './retail-microdata';
import {classElements} from './prestashop-product';
import {IZOSYSTEMS_ORIGIN,readIzosystemsProduct,readIzosystemsState,izoAttrs,izoOne,izoMoney} from './izosystems-product';

const money=(text:unknown,n:number)=>n===0&&text==='Za darmo!'?0:izoMoney(text,n);
const value=(html:string,id:string)=>htmlText(izoOne(htmlElements(html,a=>a.id===id),'basket_not_confirmed'));

/** Native loadCarriers takes only country+postcode for a fresh guest basket.
 * A zero in the initial cart is provisional: select the reviewed home courier
 * and bind its price to the refreshed cart and zero-fee bank-transfer option.
 * No address/customer/terms/order/payment submission method is exposed.
 * source: https://izosystems.pl/themes/warehouse/assets/cache/bottom-d7c313566.js
 * source: https://izosystems.pl/pl/content/1-owd-ogolne-warunki-dostaw
 */
export async function quoteIzosystems(order:DeliveredStoreBasket,postalCode:string,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult> {
 if(order.store!=='Izosystems'||!/^\d{2}-\d{3}$/.test(postalCode)||order.lines.length!==1||order.lines[0].packages.length!==1)throw Error('invalid_basket');
 const pack=order.lines[0].packages[0],source=RETAIL_SOURCES.find(s=>s.id===pack.offerId&&s.store===order.store&&s.format==='izosystems');
 if(!source||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||pack.unitPriceGrosze*pack.count!==order.materialsGrosze)throw Error('invalid_basket');
 const client=new AnonymousShop(IZOSYSTEMS_ORIGIN,fetchImpl,AbortSignal.timeout(45_000),24);
 const page=await client.text(source.url),product=readIzosystemsProduct(page,source);
 if(product.priceGrosze!==pack.unitPriceGrosze)throw Error('price_changed');
 if(product.maxPackages<pack.count)throw Error('insufficient_stock');
 const expected=order.materialsGrosze;
 const confirmCart=(cart:any)=>{
  if(!cart||!Array.isArray(cart.products)||cart.products.length!==1||cart.products_count!==pack.count||!Array.isArray(cart.discounts)||cart.discounts.length||!Array.isArray(cart.vouchers?.added)||cart.vouchers.added.length||cart.subtotals?.discounts!==null)throw Error('basket_not_confirmed');
  const p=cart.products[0];
  if(String(p.id)!=='1783'||String(p.id_product)!=='1783'||String(p.id_product_attribute)!=='0'||p.reference!=='135633'||p.ean13!==source.ean||p.name!==product.name||p.quantity!==pack.count||izoMoney(p.price,p.price_amount)!==pack.unitPriceGrosze||izoMoney(p.total,expected/100)!==expected||izoMoney(cart.subtotals.products.value,cart.subtotals.products.amount)!==expected)throw Error('basket_not_confirmed');
 };
 const added=await client.izosystems('add',{token:product.token,productId:1783,count:pack.count});
 if(added.success!==true||String(added.id_product)!=='1783'||String(added.id_product_attribute)!=='0'||added.errors)throw Error('basket_not_confirmed');confirmCart(added.cart);
 const checkout=await client.text('/zamowienie'),state=readIzosystemsState(checkout);confirmCart(state.cart);
 const form=izoOne(htmlElements(cleanHtml(checkout),(a,t)=>t==='form'&&a.id==='velsof_supercheckout_form'),'basket_not_confirmed');
 if(izoAttrs(form).action!==IZOSYSTEMS_ORIGIN+'/module/supercheckout/supercheckout')throw Error('invalid_cart_route');
 const countries=izoOne(htmlElements(form,(a,t)=>t==='select'&&a.name==='shipping_address[id_country]'),'country_not_confirmed');
 const poland=izoOne(htmlElements(countries,(_a,t)=>t==='option').filter(n=>htmlText(n)==='Polska'),'country_not_confirmed');
 if(izoAttrs(poland).value!=='14')throw Error('country_not_confirmed');
 const token=state.static_token;
 const carriers=await client.izosystems('carriers',{token,postalCode});
 if(carriers.hasError!==false||carriers.shipping_error?.length||typeof carriers.html!=='string')throw Error('no_home_delivery');
 const row=izoOne(htmlElements(cleanHtml(carriers.html),(_a,t)=>t==='li').filter(n=>htmlElements(n,(a,t)=>t==='input'&&a.value==='992,').length===1),'no_home_delivery');
 const option=izoAttrs(izoOne(htmlElements(row,(a,t)=>t==='input'&&a.value==='992,'),'no_home_delivery')),addressId=option.name?.match(/^delivery_option\[(\d{1,12})\]$/)?.[1];
 if(!addressId||option.type!=='radio'||!option.class?.split(/\s+/).includes('supercheckout_shipping_option'))throw Error('no_home_delivery');
 const label=izoOne(htmlElements(row,(a,t)=>t==='label'&&a.for===option.id),'no_home_delivery'),price=izoOne(classElements(label,'shippingPrice'),'no_home_delivery'),labelText=htmlText(label.replace(price,''));
 if(labelText!=='DHL, GLS')throw Error('no_home_delivery');
 const priceText=htmlText(price).replace(/ brutto$/,''),costGrosze=priceText==='Za darmo!'?0:parsePriceToGrosze(priceText);
 if(costGrosze===null||costGrosze<0||!Number.isSafeInteger(costGrosze))throw Error('invalid_money');
 const selected=await client.izosystems('carrier',{token,addressId});if(selected.hasError!==false||selected.errors?.length)throw Error('basket_not_confirmed');
 const confirmed=await client.izosystems('cart',{token}),payments=await client.izosystems('payments',{token});
 if(confirmed.redirect!==false||typeof confirmed.html!=='string'||typeof payments.html!=='string')throw Error('basket_not_confirmed');
 const final=readIzosystemsState(await client.text('/koszyk-zakupow?action=show')).cart;confirmCart(final);
 const shipping=money(final.subtotals.shipping.value,final.subtotals.shipping.amount),total=izoMoney(final.totals.total_including_tax.value,final.totals.total_including_tax.amount);
 if(shipping!==costGrosze||total!==expected+costGrosze||izoMoney(final.totals.total.value,final.totals.total.amount)!==total)throw Error('basket_not_confirmed');
 const summary=cleanHtml(confirmed.html),rows=htmlElements(summary,a=>Boolean(a.id?.startsWith('product_')));
 if(rows.length!==1||izoAttrs(rows[0]).id!==`product_1783_0_${addressId}_0`||izoAttrs(izoOne(htmlElements(rows[0],(a,t)=>t==='input'&&a.class?.split(/\s+/).includes('quantitybox')),'basket_not_confirmed')).value!==String(pack.count))throw Error('basket_not_confirmed');
 if(izoMoney(value(summary,'supercehckout_total_products_value'),expected/100)!==expected||money(value(summary,'supercehckout_total_shipping_value'),costGrosze/100)!==costGrosze||izoMoney(value(summary,'total_price'),total/100)!==total)throw Error('basket_not_confirmed');
 const paymentHtml=cleanHtml(payments.html),wire=izoAttrs(izoOne(htmlElements(paymentHtml,(a,t)=>t==='input'&&a['data-module-name']==='ps_wirepayment'),'no_home_delivery'));
 if(wire.name!=='payment-option'||wire.value!=='payment-option-1')throw Error('no_home_delivery');
 const inputValue=(name:string)=>izoAttrs(izoOne(htmlElements(paymentHtml,(a,t)=>t==='input'&&a.name===name),'basket_not_confirmed')).value;
 if(inputValue('kb_payment_fee_payment-option-1')!=='zł0'||inputValue('kb_payment_fee_status_payment-option-1')!=='0'||inputValue('kb_payment_fee_applicable_payment-option-1')!=='0'||inputValue('kb_payment_fee_currency')!=='zł'||Number(inputValue('kb_payment_fee_total_payment-option-1'))*100!==total)throw Error('basket_not_confirmed');
 const now=new Date();return{quote:{costGrosze,carrier:'DHL, GLS',payment:'Przelew bankowy',checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:IZOSYSTEMS_ORIGIN+'/zamowienie',basis:'retailer_basket_postcode',destinationScope:'postal_code',postalCode,evidenceSha256:createHash('sha256').update(JSON.stringify({product:product.name,ean:source.ean,count:pack.count,price:product.priceGrosze,country:'PL',postalCode,addressId,carrier:'992',shipping,total,cart:confirmed.html,fees:0})).digest('hex')}};
}
