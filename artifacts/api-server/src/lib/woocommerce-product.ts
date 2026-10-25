import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {AnonymousShop} from './retailer-http';
import {cleanHtml,htmlAttributes,htmlElements,htmlText} from './retail-microdata';
import type {RetailSource} from './retail-pages';

const cls=(a:Record<string,string>,name:string)=>a.class?.split(/\s+/).includes(name)??false;
const one=(values:string[],reason:string)=>{if(values.length!==1)throw Error(reason);return values[0];};
const attrs=(value:string)=>htmlAttributes(value.match(/^<[^>]+>/)?.[0]??'');
const cents=(value:unknown)=>{if(typeof value!=='string'||!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))throw Error('invalid_money');return Number(value);};
const currency=(value:any)=>{if(value?.currency_code!=='PLN'||value.currency_minor_unit!==2)throw Error('retailer_currency_not_confirmed');};

/** Primary product fields bind the barcode to this form and SKU; related
 * products cannot supply an EAN, amount or stock indication. */
export function inspectWooProductCard(html:string,source:RetailSource) {
  if(!Number.isSafeInteger(source.productId)||source.productId!<1)throw Error('product_id_not_confirmed');
  const main=one(htmlElements(cleanHtml(html),a=>a.id===`product-${source.productId}`),'product_id_not_confirmed');
  const meta=one(htmlElements(main,a=>cls(a,'product_meta')),'product_code_not_confirmed');
  const barcode=htmlText(one(htmlElements(meta,a=>cls(a,'hwp-gtin')),'product_code_not_confirmed')).match(/^EAN:\s*(\d{13})$/)?.[1];
  if(barcode!==source.ean)throw Error('product_ean_not_confirmed');
  const sku=htmlText(one(htmlElements(meta,a=>cls(a,'sku')),'product_code_not_confirmed'));
  if(!sku||sku.length>100)throw Error('product_code_not_confirmed');
  const form=one(htmlElements(main,(a,tag)=>tag==='form'&&cls(a,'cart')),'product_id_not_confirmed');
  const add=one(htmlElements(form,a=>a.name==='add-to-cart'),'product_id_not_confirmed');
  if(attrs(add).value!==String(source.productId)||/\sdisabled(?:\s|=|>)/i.test(add))throw Error('product_id_not_confirmed');
  const quantity=attrs(one(htmlElements(form,a=>a.name==='quantity'),'retailer_unit_not_confirmed'));
  if(quantity.step!=='1'||quantity.min!=='1')throw Error('retailer_unit_not_confirmed');
  const stock=one(htmlElements(main,a=>cls(a,'stock')),'retailer_stock_not_confirmed');
  if(cls(attrs(stock),'out-of-stock'))throw Error('retailer_out_of_stock');
  if(!cls(attrs(stock),'in-stock'))throw Error('retailer_stock_not_confirmed');
  const scope=one(htmlElements(main,a=>a['data-widget_type']==='riode_sproduct_price.default'),'retailer_price_not_confirmed');
  const price=htmlText(one(htmlElements(scope,a=>cls(a,'price')),'retailer_price_not_confirmed').replace(/&#(?:122|x7a);/gi,'z').replace(/&#(?:322|x142);/gi,'ł')).match(/^([\d ,]+)\s*zł$/)?.[1];
  const priceGrosze=price?parsePriceToGrosze(price):null;
  if(!priceGrosze)throw Error('retailer_price_not_confirmed');
  const name=htmlText(one(htmlElements(main,a=>cls(a,'product_title')),'product_name_not_confirmed'));
  return {sku,name,priceGrosze};
}

// source: https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/
// source: https://domat24.pl/produkt/plyta-gipsowa-gkbi-12-5-12002600-zielona/
export async function readWooProduct(source:RetailSource,fetchImpl:typeof fetch) {
  const client=new AnonymousShop(new URL(source.url).origin,fetchImpl,AbortSignal.timeout(12_000));
  const raw=await client.text(source.url),card=inspectWooProductCard(raw,source);
  const empty=await client.cartJson('/wp-json/wc/store/v1/cart');
  if(!Array.isArray(empty.items)||empty.items.length||empty.items_count!==0)throw Error('basket_not_confirmed');
  const cart=await client.cartJson('/wp-json/wc/store/v1/cart/add-item',{id:source.productId,quantity:1});
  if(!Array.isArray(cart.items)||cart.items.length!==1||cart.items_count!==1||cart.errors?.length)throw Error('basket_not_confirmed');
  const item=cart.items[0];currency(item.prices);currency(item.totals);currency(cart.totals);
  if(cart.shipping_address?.country!=='PL')throw Error('country_not_confirmed');
  if(item.id!==source.productId||item.quantity!==1||item.sku!==card.sku||item.name!==card.name||item.show_backorder_badge===true)throw Error('basket_not_confirmed');
  const totals=item.totals,amount=cents(totals.line_total)+cents(totals.line_total_tax);
  if(amount!==card.priceGrosze||cents(item.prices.price)!==amount||cents(totals.line_subtotal)+cents(totals.line_subtotal_tax)!==amount)throw Error('retailer_gross_price_mismatch');
  const all=cart.totals;
  if(cents(all.total_items)+cents(all.total_items_tax)!==amount||cents(all.total_discount)!==0||cents(all.total_discount_tax)!==0||cents(all.total_fees)!==0||cents(all.total_fees_tax)!==0||cart.coupons?.length||cart.fees?.length)throw Error('basket_not_confirmed');
  const imageUrl=item.images?.[0]?.src;
  if(typeof imageUrl!=='string'||!imageUrl.startsWith('https://'))throw Error('product_photo_not_confirmed');
  // A zero transport placeholder (e.g. Domat HDS) never becomes a shipping
  // quote. Only the product's confirmed gross amount leaves this reader.
  return {name:card.name,priceGrosze:amount,imageUrl,evidenceSha256:createHash('sha256').update(JSON.stringify([raw,cart])).digest('hex')};
}
