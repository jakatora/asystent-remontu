import { parsePriceToGrosze } from '@workspace/price-collector';
import type { RetailSource } from './retail-pages';
import { cleanHtml, htmlAttributes as attrs, htmlElements as elements, htmlText as text } from './retail-microdata';

export const MODNA_ORIGIN = 'https://modnalazienka.pl';
export const modnaOne = (values: string[], error = 'product_identity_ambiguous') => { if (values.length !== 1) throw Error(error); return values[0]; };
export const modnaAttrs = (node: string) => attrs(node.match(/^<[^>]+>/)?.[0] ?? '');
export const modnaById = (html: string, id: string, tag?: string) => modnaOne(elements(html, (a,t) => a.id === id && (!tag || t === tag)));
export function modnaMoney(value: string): number {
  const match = value.replace(/\s/g,'').match(/^(\d+(?:[.,]\d{1,2})?)(?:zł)?$/);
  const result = match ? parsePriceToGrosze(match[1].replace(',','.')) : null;
  if (!Number.isSafeInteger(result) || result === null || result <= 0) throw Error('invalid_money');
  return result;
}

/** Reviewed physical tile packs. Read the pack price explicitly; the main
 * advertised price is per m². Do not execute the storefront's JS object.
 * source: https://modnalazienka.pl/u117-grey-gres-szkl-rekt-mat-598x598-34158
 */
export function readModnaProduct(html: string, source: RetailSource) {
  if (new URL(source.url).origin !== MODNA_ORIGIN || source.format !== 'modna' || !Number.isSafeInteger(source.productId) || source.unit !== 'm2' || source.apiPurchaseUnit !== 'm2' || (source.purchaseMultiple ?? 1) !== 1) throw Error('retailer_unit_not_confirmed');
  const size = Math.round(source.packageSize * 100);
  if (size <= 0 || !Number.isSafeInteger(size) || Math.abs(source.packageSize * 100 - size) > 0.000001) throw Error('retailer_unit_not_confirmed');
  const safe = cleanHtml(html), primary = modnaById(safe,'product_data'), buy = modnaById(safe,'add_product_cart'), id = String(source.productId);
  const canonical = modnaOne(elements(safe,(a,t)=>t==='link' && a.rel==='canonical'));
  if (modnaAttrs(canonical).href !== source.url) throw Error('product_identity_not_confirmed');
  const name = text(modnaById(primary,'product_name_'+id,'h1')), ean = modnaById(primary,'product_ean_'+id);
  if(name!==source.name)throw Error('product_identity_not_confirmed');
  if (modnaAttrs(ean).value !== source.ean || text(ean) !== 'EAN: '+source.ean) throw Error('product_ean_not_confirmed');
  const records = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>JSON.parse(m[1])).filter(p=>p['@type']==='Product');
  if (records.length !== 1 || records[0].mpn !== id || records[0].name.trim() !== name || records[0].brand?.name !== source.brand) throw Error('product_identity_not_confirmed');
  const schema = records[0];
  const literal = modnaOne([...html.matchAll(/\bvar product_json = (\{[^\n;]+\});/g)].map(m=>m[1]));
  const number = (key: string) => Number(modnaOne([...literal.matchAll(new RegExp("'"+key+"': (\\d+(?:\\.\\d+)?)(?=,|})",'g'))].map(m=>m[1])));
  if (number('id') !== source.productId || number('minimum') !== 1 || number('minimum_packages') !== 1 || number('minimum_meters') !== source.packageSize || number('quantity') !== source.packageSize || number('unit') !== source.packageSize || number('pieces') !== 4 || number('square_meter') !== 1) throw Error('purchase_rules_changed');
  const stock = text(primary).match(/Stan magazynowy: (\d+) paczek \[([\d,]+) m 2 \]/);
  const maxPackages = Number(stock?.[1]);
  if (!stock || !Number.isSafeInteger(maxPackages) || maxPackages < 1 || Math.round(Number(stock[2].replace(',','.'))*100) !== maxPackages*size || !text(primary).includes('Dostępność: gotowe do wysyłki')) throw Error('retailer_out_of_stock');
  if (!text(primary).includes(`Min. zamówienie: 1 paczka [${String(source.packageSize).replace('.',',')} m 2 ]`) || !text(primary).includes('Jednostka sprzedaży: paczka W paczce: 4 szt.')) throw Error('product_package_not_confirmed');
  const input = (field: string) => modnaAttrs(modnaById(buy,field,'input'));
  const packs = input('cart_quantity_'+id), meters = input('cart_quantity_real_unit_'+id);
  if (input('product_id').value !== id || input('product_manufacturer_'+id).value !== source.brand || Number(input('product_minimum_'+id).value) !== 1 || packs.name !== 'pack' || packs.step !== '1' || packs.value !== '1' || Number(packs.min) !== source.packageSize || meters.name !== 'meters' || Number(meters.value) !== source.packageSize || Number(meters.step) !== source.packageSize || Number(meters.minimum) !== source.packageSize) throw Error('purchase_rules_changed');
  const button = modnaById(buy,'add_to_basket','button');
  if (modnaAttrs(button).onclick !== `addToCart(${id})` || /\bdisabled\b/i.test(button.match(/^<[^>]+>/)?.[0] ?? '') || text(button) !== 'Dodaj do koszyka') throw Error('retailer_out_of_stock');
  const priceGrosze = modnaMoney(text(modnaById(modnaById(buy,'price_net'),'product_price_'+id,'span')));
  const unitPrice = text(modnaById(buy,'product_price','p')).replace(/\s/g,'').match(/^([\d,]+)zł\/m2$/);
  if (!unitPrice || modnaMoney(unitPrice[1]) !== parsePriceToGrosze(String(number('price'))) || number('real_price') !== number('price') || Math.round(modnaMoney(unitPrice[1])*size/100) !== priceGrosze || parsePriceToGrosze(input('product_price_'+id).value) !== priceGrosze || parsePriceToGrosze(schema.offers?.price) !== priceGrosze || schema.offers?.priceCurrency !== 'PLN') throw Error('retailer_gross_price_mismatch');
  if (!/^https?:\/\/schema.org\/InStock$/.test(schema.offers?.availability ?? '')) throw Error('retailer_out_of_stock');
  const photo = modnaOne(elements(safe,(a,t)=>t==='img' && a.class?.split(/\s+/).includes('thumbnail_image') === true));
  const image = new URL(modnaAttrs(photo).src), structuredImage = new URL(schema.image);
  const stem = (url: URL) => url.pathname.replace('/images/thumbnails/','/images/').replace(/\.(jpg|png|webp)$/,'').replace(/\/{2,}/g,'/');
  if (image.origin !== MODNA_ORIGIN || structuredImage.origin !== image.origin || stem(image) !== stem(structuredImage)) throw Error('product_image_not_confirmed');
  const token = modnaAttrs(modnaById(safe,'csrf_token','input')).value;
  if (!/^[A-Za-z0-9._-]{32,256}$/.test(token ?? '')) throw Error('cart_session_not_confirmed');
  return { priceGrosze, squareMeterPriceGrosze:modnaMoney(unitPrice[1]), maxPackages, token, name, imageUrl:image.href,
    product:{'@type':'Product',name,gtin13:source.ean,brand:source.brand,image:image.href,offers:{'@type':'Offer',price:(priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}} };
}
