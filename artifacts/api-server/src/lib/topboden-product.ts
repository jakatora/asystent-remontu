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
  // These EANs identify sealed accessory packs, unlike the metre-priced
  // skirting. One native opk. buys two identical corners/connectors or one
  // left+right set. Native stock is a count of packs, not individual pieces.
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/naroznik-wew-indo-bialy-polysk-1-arbiton
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/zakonczenie-l-p-indo-bialy-polysk-1-arbiton
  const accessoryPacks:Record<string,[string,string,number,string]>={
    'topboden-indo-inside-gloss-2':['5905167726037','9d18849b-1174-4fb0-a0ef-f78e5ee3e03f',2,'szt'],
    'topboden-indo-outside-gloss-2':['5905167726198','6d0e4dc7-6cc8-4f8a-bd57-4d5f7f634c62',2,'szt'],
    'topboden-indo-connector-gloss-2':['5905167725870','46e7fec7-9ef8-4fb3-95c5-29c0b52b7f32',2,'szt'],
    'topboden-indo-endcaps-gloss-pair':['5905167726358','7e8bcf6a-8e26-4f27-9785-8bb7d087ba48',1,'kpl'],
  };
  const accessory=accessoryPacks[source.id];
  if(accessory&&(source.ean!==accessory[0]||source.productUuid!==accessory[1]||source.packageSize!==accessory[2]||source.unit!==accessory[3]||source.apiPurchaseUnit!=='opk.'||multiple!==1))throw Error('product_package_not_confirmed');
  // source: https://arbiton.com/pl/klej-montazowy-strongman-300ml
  const glue=source.id==='topboden-strongman-300ml';
  if(glue&&(source.ean!=='5905167788264'||source.productUuid!=='9cc774ed-c24b-4f3b-a863-a935a86383f4'||source.packageSize!==300||source.unit!=='ml'||source.apiPurchaseUnit!=='szt.'||multiple!==1))throw Error('product_package_not_confirmed');
  if(units&&Number.isSafeInteger(units.multiple)&&Number.isSafeInteger(units.minOrderQuantity)&&(units.multiple!==multiple||units.minOrderQuantity!==multiple))throw Error('purchase_rules_changed');
  const nativeUnit=accessory?'opk.':glue?'szt.':source.unit,nativeOrderUnit=accessory?'opk.':'szt.',nativePackSize=accessory||glue?1:source.packageSize;
  if(!Number.isSafeInteger(multiple)||multiple<1||multiple>10000||!units||units.orderUnit!==nativeOrderUnit||units.priceListUnit!==nativeUnit||units.basicUnit!==nativeUnit||!Number.isFinite(units.numerator)||!Number.isFinite(units.denominator)||units.denominator<=0||units.numerator/units.denominator!==nativePackSize||units.multiple!==multiple||units.minOrderQuantity!==multiple)throw Error('retailer_unit_not_confirmed');
  if(!Number.isSafeInteger(count)||count<multiple||count%multiple||count>10000)throw Error('purchase_multiple_required');
  if(product.available===false)throw Error('retailer_out_of_stock');
  if(product.available!==true||!Number.isFinite(product.baseUnitStock))throw Error('retailer_stock_not_confirmed');
  if(product.baseUnitStock<count*nativePackSize)throw Error(count===multiple?'retailer_out_of_stock':'insufficient_stock');
  const price=product.price;
  // The reviewed Strongman card explicitly separates the ordinary add-to-cart
  // price from an optional EXTRA20 code. Import only that ordinary price;
  // a coupon, gift, changed discount or already-discounted price is not inferred.
  // source: https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml
  const regularStrongman=glue&&product.promotionCode?.code==='EXTRA20'&&product.promotionCode?.discount==='20'
    &&product.promotionCode?.freeProductsMessage===null&&price?.isDiscount===false&&price.discountValue===0
    &&['discountNetPrice','discountGrossPrice','discountPackageNetPrice','discountPackageGrossPrice'].every(key=>price[key]===null)
    &&price.grossPrice===price.packageGrossPrice;
  if(!price||typeof price.isDiscount!=='boolean'||product.promotionCode&&!regularStrongman)throw Error('conditional_price_not_supported');
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
  // Accessory cards use the SEO title in JSON-LD, not the catalogue name.
  // Both primary records already bind the reviewed UUID/EAN/pack. Tie this
  // differently named price record to their exact SEO title, brand and photo.
  const reviewedNativePack=source.apiPurchaseUnit==='opk.'||source.id==='topboden-strongman-300ml';
  const accessoryIdentity=reviewedNativePack&&records.length===1
    &&typeof product.metaTitle==='string'&&product.metaTitle.length>0&&card.metaTitle===product.metaTitle
    &&records[0].name===product.metaTitle&&records[0].brand===source.brand
    &&typeof records[0].image==='string'&&records[0].image.includes(source.ean);
  if(records.length!==1||!(reviewedNativePack?accessoryIdentity:records[0].name?.startsWith(product.name)))throw Error('product_identity_not_confirmed');
  const offer=records[0].offers;
  if(offer?.priceCurrency!=='PLN'||parsePriceToGrosze(offer.price)!==confirmed.priceGrosze||!/\/InStock$/.test(String(offer.availability)))throw Error('retailer_gross_price_not_confirmed');
  return {...confirmed,product,validUntil:offer.priceValidUntil??null,evidenceSha256:createHash('sha256').update(JSON.stringify([product,html])).digest('hex')};
}
