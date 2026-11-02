import {createHash} from 'node:crypto';
import type {RetailSource} from './retail-pages';
import type {DeliveredStoreBasket,DeliveryQuoteResult} from '../../../../lib/pricing-service/src/delivery';
import {AnonymousShop,MAX_RETAIL_PACKAGES} from './retailer-http';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';
import {FUGI_SOURCES,confirmFugiSource} from './fugi-sources';
const ORIGIN='https://fugi.pl';
const one=(values:string[],reason='basket_not_confirmed')=>{if(values.length!==1)throw Error(reason);return values[0];};
const attrs=(node:string)=>htmlAttributes(node.match(/^<[^>]+>/)?.[0]??'');
const cls=(a:Record<string,string>,key:string)=>a.class?.split(/\s+/).includes(key)??false;
const cents=(s:unknown)=>{if(typeof s!=='string'||!/^\d+$/.test(s)||!Number.isSafeInteger(Number(s)))throw Error('invalid_money');return Number(s);};
const pln=(p:any)=>{if(p?.currency_code!=='PLN'||p.currency_minor_unit!==2)throw Error('retailer_currency_not_confirmed');};
const gross=(t:any)=>{pln(t);return cents(t.line_total)+cents(t.line_total_tax);};
const COURIERS:Readonly<Record<string,string>>={'flexible_shipping_single:15':'Kurier GLS &#8211; przedpłata','flexible_shipping_single:22':'Kurier Inpost &#8211; przedpłata'};

/** Related-product recommendations live within product-ID too. Only the
 * primary summary may bind the SKU, GTIN, price and buy form. */
export function inspectFugiCard(raw:string,source:RetailSource){
 confirmFugiSource(source);const main=one(htmlElements(cleanHtml(raw),a=>a.id==='product-'+source.productId),'product_identity_not_confirmed');
 const summary=one(htmlElements(main,a=>cls(a,'summary')&&cls(a,'entry-summary')),'product_identity_not_confirmed');
 if(htmlText(one(htmlElements(summary,a=>cls(a,'product_title'))))!==source.name)throw Error('product_identity_not_confirmed');
 const meta=one(htmlElements(summary,a=>cls(a,'product_meta')),'product_identity_not_confirmed');
 if(htmlText(one(htmlElements(meta,a=>cls(a,'sku'))))!==source.retailerSku)throw Error('product_identity_not_confirmed');
 const ean=htmlText(meta).match(/(?:^|\s)GTIN:\s*(\d{13})(?:\s|$)/)?.[1];if(ean!==source.ean)throw Error('product_ean_not_confirmed');
 const price=htmlText(one(htmlElements(summary,a=>cls(a,'price'))).replace(/&#(?:122|x7a);/gi,'z').replace(/&#(?:322|x142);/gi,'ł'));
 const m=price.match(/^(\d+)\.(\d{2}) zł z VAT$/);if(!m)throw Error('retailer_gross_price_mismatch');
 const amount=Number(m[1])*100+Number(m[2]);if(!Number.isSafeInteger(amount)||amount<1)throw Error('invalid_money');
 const stock=one(htmlElements(summary,a=>cls(a,'stock')),'retailer_stock_not_confirmed');if(!cls(attrs(stock),'in-stock')||cls(attrs(stock),'out-of-stock'))throw Error('retailer_out_of_stock');
 const form=one(htmlElements(summary,(a,t)=>t==='form'&&cls(a,'cart'))),add=one(htmlElements(form,a=>a.name==='add-to-cart'));
 if(attrs(add).value!==String(source.productId)||/\sdisabled(?:\s|=|>)/i.test(add))throw Error('purchase_rules_changed');
 const quantity=attrs(one(htmlElements(form,a=>a.name==='quantity')));if(quantity.min!=='1'||quantity.step!=='1'||quantity.value!=='1')throw Error('purchase_rules_changed');
 return{priceGrosze:amount};
}
export function confirmFugiProduct(product:any,source:RetailSource,cardPrice:number){
 confirmFugiSource(source);
 if(product?.id!==source.productId||product.name!==source.name||product.sku!==source.retailerSku||product.permalink!==source.url||product.type!=='simple'||product.variation!==undefined&&product.variation!==''||product.has_options!==false)throw Error('product_identity_not_confirmed');
 if(product.is_in_stock!==true||product.is_purchasable!==true||product.is_on_backorder===true)throw Error('retailer_out_of_stock');
 pln(product.prices);const amount=cents(product.prices.price);if(amount!==cardPrice||cents(product.prices.regular_price)!==amount||cents(product.prices.sale_price)!==amount||product.on_sale===true)throw Error('price_changed');
 const limits=product.add_to_cart;if(limits?.minimum!==1||limits.multiple_of!==1||!Number.isSafeInteger(limits.maximum)||limits.maximum<1)throw Error('purchase_rules_changed');
 if(product.images?.[0]?.src!==source.imageUrl||new URL(source.imageUrl!).origin!==ORIGIN)throw Error('product_image_not_confirmed');
 return{priceGrosze:amount,maxPackages:Math.min(limits.maximum,MAX_RETAIL_PACKAGES),imageUrl:source.imageUrl!};
}
async function productWithClient(source:RetailSource,client:AnonymousShop){
 const raw=await client.text(source.url),card=inspectFugiCard(raw,source),product=await client.json('/wp-json/wc/store/v1/products/'+source.productId),p=confirmFugiProduct(product,source,card.priceGrosze);
 return{...p,raw,api:product,product:{'@type':'Product',name:source.name,brand:source.brand,gtin13:source.ean,description:product.description,image:p.imageUrl,offers:{'@type':'Offer',price:(p.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}}};
}
export async function readFugiProduct(source:RetailSource,fetchImpl:typeof fetch){
 confirmFugiSource(source);const p=await productWithClient(source,new AnonymousShop(ORIGIN,fetchImpl,AbortSignal.timeout(15000),4));
 // The maximum purchase quantity is checked again in each real cart; do not
 // publish it as a numeric warehouse stock assertion.
 return{...p,evidenceSha256:createHash('sha256').update(p.raw+JSON.stringify(p.api)).digest('hex')};
}
interface Wanted {source:RetailSource;count:number;price:number}
function destination(value:any,postcode:string){
 if(!value||value.country!=='PL'||value.postcode!==postcode||Object.entries(value).some(([k,v])=>!['country','postcode'].includes(k)&&v!==''))throw Error('country_not_confirmed');
}
export function confirmFugiCart(cart:any,wanted:readonly Wanted[],postcode?:string,selectedCost?:number){
 if(!Array.isArray(cart?.items)||cart.items.length!==wanted.length||cart.items_count!==wanted.reduce((n,p)=>n+p.count,0)||cart.errors?.length||cart.fees?.length||cart.coupons?.length)throw Error('basket_not_confirmed');
 const seen=new Set<number>();let materials=0;
 for(const item of cart.items){const w=wanted.find(w=>w.source.productId===item.id);if(!w||seen.has(item.id)||item.name!==w.source.name||item.sku!==w.source.retailerSku||item.quantity!==w.count||item.show_backorder_badge===true||item.variation?.length)throw Error('basket_not_confirmed');seen.add(item.id);
  pln(item.prices);if(cents(item.prices.price)!==w.price||cents(item.prices.regular_price)!==w.price||cents(item.prices.sale_price)!==w.price||gross(item.totals)!==w.count*w.price||cents(item.totals.line_subtotal)+cents(item.totals.line_subtotal_tax)!==w.count*w.price)throw Error('price_changed');
  const limits=item.quantity_limits;if(limits?.minimum!==1||limits.multiple_of!==1||limits.editable!==true||!Number.isSafeInteger(limits.maximum)||limits.maximum<w.count)throw Error('insufficient_stock');materials+=w.count*w.price;
 }
 const totals=cart.totals;pln(totals);if(cents(totals.total_items)+cents(totals.total_items_tax)!==materials)throw Error('basket_not_confirmed');
 for(const key of ['total_discount','total_discount_tax','total_fees','total_fees_tax'])if(cents(totals[key])!==0)throw Error('basket_not_confirmed');
 const shipping=cents(totals.total_shipping)+cents(totals.total_shipping_tax);if(cents(totals.total_price)!==materials+shipping||selectedCost!==undefined&&shipping!==selectedCost)throw Error('basket_not_confirmed');
 if(postcode)destination(cart.shipping_address,postcode);if(!cart.payment_methods?.includes('bacs'))throw Error('no_prepaid_payment');return{materials,shipping};
}
function rates(cart:any,postcode:string){
 if(cart.has_calculated_shipping!==true||cart.needs_shipping!==true||!Array.isArray(cart.shipping_rates)||cart.shipping_rates.length!==1||cart.shipping_rates[0].package_id!==0)throw Error('no_home_delivery');
 const group=cart.shipping_rates[0];destination(group.destination,postcode);
 if(!Array.isArray(group.shipping_rates))throw Error('no_home_delivery');
 return group.shipping_rates.filter((r:any)=>Object.hasOwn(COURIERS,r.rate_id)&&r.method_id==='flexible_shipping_single'&&r.name===COURIERS[r.rate_id]).map((r:any)=>{pln(r);const cost=cents(r.price)+cents(r.taxes);if(cost<=0)throw Error('no_home_delivery');return{...r,cost};});
}
/** Real whole-cart gross totals and selected prepaid home courier. The shop's
 * published PL-wide weight tariff is not represented as a personalised price.
 * source: https://fugi.pl/dostawa-i-platnosc/
 * source: https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/ */
export async function quoteFugi(order:DeliveredStoreBasket,postalCode:string,fetchImpl:typeof fetch):Promise<DeliveryQuoteResult>{
 if(order.store!=='FUGI.PL'||!/^\d{2}-\d{3}$/.test(postalCode)||!order.lines.length||order.lines.length>FUGI_SOURCES.length)throw Error('invalid_basket');
 const wanted:Wanted[]=[],seen=new Set<string>();for(const line of order.lines){if(line.packages.length!==1)throw Error('invalid_basket');const pack=line.packages[0],source=FUGI_SOURCES.find(s=>s.id===pack.offerId);
  if(!source||seen.has(source.id)||line.product.id!=='remont-'+source.ean||line.unit!==source.unit||pack.store!==source.store||pack.url!==source.url||pack.packageSize!==source.packageSize||!Number.isSafeInteger(pack.count)||pack.count<1||pack.count>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(pack.unitPriceGrosze)||pack.unitPriceGrosze<1||pack.lineCostGrosze!==pack.count*pack.unitPriceGrosze)throw Error('invalid_basket');seen.add(source.id);wanted.push({source,count:pack.count,price:pack.unitPriceGrosze});
 }
 const materials=wanted.reduce((n,w)=>n+w.count*w.price,0);if(!Number.isSafeInteger(materials)||materials!==order.materialsGrosze)throw Error('invalid_basket');
 const client=new AnonymousShop(ORIGIN,fetchImpl,AbortSignal.timeout(20000),24),evidence:any[]=[];
 for(const w of wanted){const p=await productWithClient(w.source,client);if(p.priceGrosze!==w.price)throw Error('price_changed');if(p.maxPackages<w.count)throw Error('insufficient_stock');evidence.push(p.raw,p.api);}
 const empty=await client.cartJson('/wp-json/wc/store/v1/cart');if(!Array.isArray(empty.items)||empty.items.length||empty.items_count!==0)throw Error('basket_not_confirmed');
 let cart;for(let i=0;i<wanted.length;i++){const w=wanted[i];cart=await client.cartJson('/wp-json/wc/store/v1/cart/add-item',{id:w.source.productId,quantity:w.count});confirmFugiCart(cart,wanted.slice(0,i+1));}
 const located=await client.cartJson('/wp-json/wc/store/v1/cart/update-customer',{shipping_address:{country:'PL',postcode:postalCode}});confirmFugiCart(located,wanted,postalCode);const options=rates(located,postalCode).sort((a:any,b:any)=>a.cost-b.cost);if(!options.length)throw Error('no_home_delivery');const rate=options[0];
 const selected=await client.cartJson('/wp-json/wc/store/v1/cart/select-shipping-rate',{package_id:0,rate_id:rate.rate_id});confirmFugiCart(selected,wanted,postalCode,rate.cost);
 const final=await client.cartJson('/wp-json/wc/store/v1/cart');confirmFugiCart(final,wanted,postalCode,rate.cost);for(const state of [selected,final]){const chosen=rates(state,postalCode).filter((r:any)=>r.selected);if(chosen.length!==1||chosen[0].rate_id!==rate.rate_id||chosen[0].cost!==rate.cost)throw Error('basket_not_confirmed');}
 const now=new Date();return{quote:{costGrosze:rate.cost,carrier:rate.name.replace('&#8211;','–'),payment:'Przelew bankowy',checkedAt:now.toISOString(),expiresAt:new Date(now.getTime()+600000).toISOString(),sourceUrl:ORIGIN+'/koszyk/',basis:'retailer_basket_national',destinationScope:'PL',evidenceSha256:createHash('sha256').update(JSON.stringify([...evidence,located,selected,final])).digest('hex')}};
}
