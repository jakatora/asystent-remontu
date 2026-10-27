import { createHash } from 'node:crypto';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { RetailSource } from './retail-pages';
import { isReviewedIrbudSource } from './retail-sku';
import { AnonymousShop, MAX_RETAIL_PACKAGES } from './retailer-http';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';

const ORIGIN='https://irbudsklep.pl';
const cls=(a:Record<string,string>,s:string)=>a.class?.split(/\s+/).includes(s)??false;
const one=(a:string[],reason:string)=>{if(a.length!==1)throw Error(reason);return a[0];};
const attrs=(html:string)=>htmlAttributes(html.match(/^<[^>]+>/)?.[0]??'');
const cents=(s:unknown)=>{if(typeof s!=='string'||!/^\d+$/.test(s)||!Number.isSafeInteger(Number(s)))throw Error('invalid_money');return Number(s);};
const pln=(p:any)=>{if(p?.currency_code!=='PLN'||p.currency_minor_unit!==2)throw Error('retailer_currency_not_confirmed');};

// Merchant item10911 has no published GTIN or manufacturer SKU. Its namespace
// stays separate from the similar Castorama profile; never infer an EAN.
// source: https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/
export function inspectIrbudCard(html:string,source:RetailSource) {
 if(!isReviewedIrbudSource(source))throw Error('retailer_sku_source_not_reviewed');
 const safe=cleanHtml(html),main=one(htmlElements(safe,a=>a.id==='product-10911'),'product_identity_ambiguous');
 const canonical=one(htmlElements(safe,a=>a.rel==='canonical'),'product_identity_not_confirmed');if(attrs(canonical).href!==source.url)throw Error('product_identity_not_confirmed');
 const names=htmlElements(main,a=>cls(a,'product_title')).map(htmlText);if(!names.length||names.some(n=>n!==source.name))throw Error('product_name_mismatch');
 const text=htmlText(main);for(const fact of ['Producent: NORGIPS','Długość: 300 cm','Szerokość: 60 mm','Grubość blachy: 0,6 mm'])if(!text.includes(fact))throw Error('product_variant_mismatch');
 const forms=htmlElements(main,(a,t)=>t==='form'&&cls(a,'cart'));if(!forms.length)throw Error('product_id_not_confirmed');
 for(const form of forms){if(attrs(form).action!==source.url)throw Error('product_id_not_confirmed');const add=attrs(one(htmlElements(form,a=>a.name==='add-to-cart'),'product_id_not_confirmed')),q=attrs(one(htmlElements(form,a=>a.name==='quantity'),'retailer_unit_not_confirmed'));if(add.value!=='10911'||'disabled'in add||q.min!=='1'||q.step!=='1')throw Error('retailer_unit_not_confirmed');}
 const prices=htmlElements(main,(a,t)=>t==='p'&&cls(a,'price')).map(p=>{const sale=htmlElements(p,(_a,t)=>t==='ins'),box=sale.length?one(sale,'ambiguous_online_price'):p;const bdi=one(htmlElements(box,(_a,t)=>t==='bdi'),'retailer_price_not_confirmed');const amount=htmlText(bdi).replace(/&#122;/g,'z').replace(/&#322;/g,'ł').match(/^([\d ,]+)\s*zł$/)?.[1];return amount?parsePriceToGrosze(amount):null;});
 if(!prices.length||prices.some(p=>!p||p!==prices[0]))throw Error('retailer_gross_price_mismatch');return {priceGrosze:prices[0]!};
}

function confirmCart(cart:any,count:number,price:number,selectedShipping?:number,postalCode=''){
 if(!Array.isArray(cart.items)||cart.items.length!==1||cart.items_count!==count||cart.errors?.length||cart.coupons?.length||cart.fees?.length)throw Error('basket_not_confirmed');
 const item=cart.items[0],t=item.totals,all=cart.totals;pln(item.prices);pln(t);pln(all);
 if(item.id!==10911||item.sku!==''||item.quantity!==count||item.name!=='Profil główny sufitowy CD60 3 MB / 0,6'||item.show_backorder_badge===true||item.quantity_limits?.minimum!==1||item.quantity_limits?.multiple_of!==1||item.quantity_limits.maximum<count)throw Error('basket_not_confirmed');
 const total=price*count;if(!Number.isSafeInteger(total)||cents(item.prices.price)!==price||cents(t.line_total)+cents(t.line_total_tax)!==total||cents(t.line_subtotal)+cents(t.line_subtotal_tax)!==total||cents(all.total_items)+cents(all.total_items_tax)!==total)throw Error('price_changed');
 for(const k of ['total_discount','total_discount_tax','total_fees','total_fees_tax'])if(cents(all[k])!==0)throw Error('basket_not_confirmed');
 const shipping=cents(all.total_shipping)+cents(all.total_shipping_tax);if(cents(all.total_price)!==total+shipping||selectedShipping!==undefined&&shipping!==selectedShipping)throw Error('basket_not_confirmed');
 if(cart.shipping_address?.country!=='PL'||cart.shipping_address?.postcode!==postalCode||Object.entries(cart.shipping_address).some(([k,v])=>!['country','postcode'].includes(k)&&v!==''))throw Error('country_not_confirmed');
 return item;
}

export async function prepareIrbudCart(source:RetailSource,count:number,fetchImpl:typeof fetch){
 if(!isReviewedIrbudSource(source)||!Number.isSafeInteger(count)||count<1||count>MAX_RETAIL_PACKAGES)throw Error('invalid_basket');
 const client=new AnonymousShop(ORIGIN,fetchImpl,AbortSignal.timeout(15000),12),raw=await client.text(source.url),card=inspectIrbudCard(raw,source);
 const empty=await client.cartJson('/wp-json/wc/store/v1/cart');if(!Array.isArray(empty.items)||empty.items.length||empty.items_count!==0)throw Error('basket_not_confirmed');
 const cart=await client.cartJson('/wp-json/wc/store/v1/cart/add-item',{id:10911,quantity:count}),item=confirmCart(cart,count,card.priceGrosze);
 const imageUrl=item.images?.[0]?.src;if(typeof imageUrl!=='string'||new URL(imageUrl).origin!==ORIGIN)throw Error('product_image_not_confirmed');
 return {client,cart,priceGrosze:card.priceGrosze,imageUrl,evidence:[raw,cart]};
}

export async function readIrbudProduct(source:RetailSource,fetchImpl:typeof fetch){const p=await prepareIrbudCart(source,1,fetchImpl);return {...p,evidenceSha256:createHash('sha256').update(JSON.stringify(p.evidence)).digest('hex')};}

// Only the shipping selector is used, never checkout/order or a customer form.
// source: https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/
export async function quoteIrbud(order:DeliveredStoreBasket,postalCode:string,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='IRBUD'||!/^\d{2}-\d{3}$/.test(postalCode)||order.lines.length!==1||order.lines[0].packages.length!==1)throw Error('invalid_basket');const pack=order.lines[0].packages[0],source=RETAIL_SOURCES.find(s=>s.id===pack.offerId);if(!source||!isReviewedIrbudSource(source))throw Error('invalid_basket');
 const p=await prepareIrbudCart(source,pack.count,fetchImpl);if(p.priceGrosze!==pack.unitPriceGrosze||pack.count*p.priceGrosze!==order.materialsGrosze)throw Error('price_changed');
 const located=await p.client.cartJson('/wp-json/wc/store/v1/cart/update-customer',{shipping_address:{country:'PL',postcode:postalCode}});confirmCart(located,pack.count,p.priceGrosze,undefined,postalCode);
 const groups=located.shipping_rates;if(!located.has_calculated_shipping||!located.needs_shipping||!Array.isArray(groups)||groups.length!==1||groups[0].package_id!==0||groups[0].destination?.country!=='PL'||groups[0].destination?.postcode!==postalCode||Object.entries(groups[0].destination).some(([k,v])=>!['country','postcode'].includes(k)&&v!==''))throw Error('no_home_delivery');
 if(!located.payment_methods?.includes('bacs'))throw Error('no_prepaid_payment');
 const rates=groups[0].shipping_rates.filter((r:any)=>r.rate_id==='flexible_shipping_single:3'&&r.method_id==='flexible_shipping_single'&&r.name==='Przesyłka kurierska');if(rates.length!==1)throw Error('no_home_delivery');const rate=rates[0];pln(rate);const cost=cents(rate.price)+cents(rate.taxes);if(!Number.isSafeInteger(cost)||cost<=0)throw Error('no_home_delivery');
 const final=await p.client.cartJson('/wp-json/wc/store/v1/cart/select-shipping-rate',{package_id:0,rate_id:rate.rate_id});confirmCart(final,pack.count,p.priceGrosze,cost,postalCode);const chosen=final.shipping_rates?.[0]?.shipping_rates?.filter((r:any)=>r.selected);if(!final.payment_methods?.includes('bacs')||chosen?.length!==1||chosen[0].rate_id!==rate.rate_id||cents(chosen[0].price)+cents(chosen[0].taxes)!==cost)throw Error('basket_not_confirmed');
 if(!final.has_calculated_shipping||final.shipping_rates?.length!==1||final.shipping_rates[0].destination?.country!=='PL'||final.shipping_rates[0].destination?.postcode!==postalCode)throw Error('basket_not_confirmed');
 const now=new Date();return {quote:{costGrosze:cost,carrier:rate.name,payment:'Przelew bankowy',checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:ORIGIN+'/koszyk/',basis:'retailer_basket_postcode',destinationScope:'postal_code',postalCode,evidenceSha256:createHash('sha256').update(JSON.stringify([...p.evidence,located,final])).digest('hex')}};
}
