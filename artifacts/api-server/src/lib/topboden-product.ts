import {createHash} from 'node:crypto';
import {parsePriceToGrosze} from '@workspace/price-collector';
import {AnonymousShop} from './retailer-http';
import type {RetailSource} from './retail-pages';

export const TOPBODEN_API='https://api.topboden.pl';

/** The barcode describes one piece. The published order lot is separate from
 * that physical package and must not be silently converted to a new EAN. */
export function confirmTopbodenProduct(product:any,source:RetailSource,count=source.purchaseMultiple??1) {
  if(!source.productUuid||!/^[a-f0-9-]{36}$/.test(source.productUuid)||product?.uuid!==source.productUuid||product.ean!==source.ean||product.data?.logisticData?.ean!==source.ean)throw Error('product_ean_not_confirmed');
  if(product.brand?.name!==source.brand||typeof product.name!=='string')throw Error('product_brand_not_confirmed');
  const units=product.units,multiple=source.purchaseMultiple??1;
  if(units&&Number.isSafeInteger(units.multiple)&&Number.isSafeInteger(units.minOrderQuantity)&&(units.multiple!==multiple||units.minOrderQuantity!==multiple))throw Error('purchase_rules_changed');
  if(!Number.isSafeInteger(multiple)||multiple<1||multiple>10000||!units||units.orderUnit!=='szt.'||units.priceListUnit!==source.unit||units.basicUnit!==source.unit||!Number.isFinite(units.numerator)||!Number.isFinite(units.denominator)||units.denominator<=0||units.numerator/units.denominator!==source.packageSize||units.multiple!==multiple||units.minOrderQuantity!==multiple)throw Error('retailer_unit_not_confirmed');
  if(!Number.isSafeInteger(count)||count<multiple||count%multiple||count>10000)throw Error('purchase_multiple_required');
  if(product.available===false)throw Error('retailer_out_of_stock');
  if(product.available!==true||!Number.isFinite(product.baseUnitStock))throw Error('retailer_stock_not_confirmed');
  if(product.baseUnitStock<count*source.packageSize)throw Error(count===multiple?'retailer_out_of_stock':'insufficient_stock');
  const price=product.price;
  if(!price||typeof price.isDiscount!=='boolean'||product.promotionCode)throw Error('conditional_price_not_supported');
  const priceGrosze=price.isDiscount?price.discountPackageGrossPrice:price.packageGrossPrice;
  if(!Number.isSafeInteger(priceGrosze)||priceGrosze<=0)throw Error('retailer_gross_price_not_confirmed');
  const photo=product.images?.find((image:any)=>image.category==='Packshot')??product.images?.[0];
  const path=photo?.resized?.gallery?.webp;
  if(typeof path!=='string'||!path.includes(source.ean))throw Error('product_photo_not_confirmed');
  // The public API returns relative media paths; the actual storefront serves
  // these at topboden.pl, not the API origin (which returns 404 for photos).
  const imageUrl=new URL(path,'https://topboden.pl');
  if(imageUrl.origin!=='https://topboden.pl')throw Error('product_photo_not_confirmed');
  return {name:product.name,priceGrosze,imageUrl:imageUrl.href};
}

// source: https://topboden.pl/listwy-przypodlogowe/listwa-przypodlogowa-arbiton-indo-bialy-polysk-1
// Public storefront calls /api/product/by-uuid; the main card confirms PLN and
// the gross piece price. It is not the rounded price per metre.
export async function readTopbodenProduct(source:RetailSource,fetchImpl:typeof fetch,count=source.purchaseMultiple??1,signal=AbortSignal.timeout(12_000)) {
  if(new URL(source.url).origin!=='https://topboden.pl')throw Error('invalid_retailer_origin');
  const api=new AnonymousShop(TOPBODEN_API,fetchImpl,signal),page=new AnonymousShop('https://topboden.pl',fetchImpl,signal);
  const product=await api.json('/api/product/by-uuid/'+source.productUuid);
  const confirmed=confirmTopbodenProduct(product,source,count);
  const html=await page.text(source.url);
  const next=html.match(/<script\b[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if(!next)throw Error('product_identity_not_confirmed');
  const card=JSON.parse(next).props?.pageProps?.categoryAllData;
  const primary=confirmTopbodenProduct(card,source,count);
  if(card.name!==product.name||primary.priceGrosze!==confirmed.priceGrosze)throw Error('price_changed');
  const records=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match=>{try{return [JSON.parse(match[1])].flat();}catch{return[];}}).filter(item=>item?.['@type']==='Product');
  if(records.length!==1||!records[0].name?.startsWith(product.name))throw Error('product_identity_not_confirmed');
  const offer=records[0].offers;
  if(offer?.priceCurrency!=='PLN'||parsePriceToGrosze(offer.price)!==confirmed.priceGrosze||!/\/InStock$/.test(String(offer.availability)))throw Error('retailer_gross_price_not_confirmed');
  return {...confirmed,product,validUntil:offer.priceValidUntil??null,evidenceSha256:createHash('sha256').update(JSON.stringify([product,html])).digest('hex')};
}
