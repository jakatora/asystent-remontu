import { parsePriceToGrosze } from '@workspace/price-collector';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';
import type { RetailSource } from './retail-pages';

const hasClass = (attributes: Record<string,string>, name: string) => attributes.class?.split(/\s+/).includes(name) ?? false;
const one = (values: string[], reason: string) => { if (values.length !== 1) throw Error(reason); return values[0]; };
const attr = (element: string, name: string) => htmlAttributes(element.match(/^<[^>]+>/)?.[0] ?? '')[name];

/** This shop publishes its manufacturer's SKU, not a barcode. The reviewed
 * manufacturer table explicitly maps LK100F24-9002 -> LK100F, white MDF,
 * 2400 x 14 x 100 mm. The independent EAN reference describes that exact model.
 * This is a documented identity crosswalk, never a barcode read from this shop.
 * source: https://kronosfera.pl/storage/file/core_files/2025/8/28/b4e17905d0344c0061ea8e07ee80bb72/KRONOSTEP_2025_22072025_PL_EN_web.pdf (printed p.77)
 * source: https://www.obi.pl/p/7240922/kronospan-listwa-przypodlogowa-biala-lk100f-frez
 */
export function inspectKronosferaProduct(html: string, source: RetailSource) {
  if (source.format !== 'kronosfera' || source.store !== 'Kronosfera' || source.productId !== 2068 ||
    source.retailerSku !== 'LK100F24-9002' || source.ean !== '5907555424969' || source.packageSize !== 2.4 || source.unit !== 'mb' ||
    source.url !== 'https://kronosfera.pl/k/listwa-przypodlogowa-lk100f24-9002,2068') throw Error('product_identity_not_confirmed');
  const products: Record<string,any>[] = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let value: any; try { value=JSON.parse(match[1]); } catch { continue; }
    if (value?.['@type'] === 'Product') products.push(value);
  }
  if (products.length !== 1) throw Error('product_identity_not_confirmed');
  const product=products[0], offer=product.offers;
  if (product.sku !== source.retailerSku || product.name !== source.name || product.brand !== 'KronoOriginal' ||
    ['gtin','gtin8','gtin12','gtin13','gtin14'].some(key=>product[key]!==undefined&&product[key]!==source.ean)) throw Error('product_identity_not_confirmed');
  if (!offer || Array.isArray(offer) || offer['@type'] !== 'Offer' || offer.priceCurrency !== 'PLN' ||
    !/^https?:\/\/schema.org\/InStock$/.test(offer.availability) || new URL(offer.url,source.url).href !== source.url) throw Error('retailer_out_of_stock');
  const safe=cleanHtml(html);
  if(htmlText(one(htmlElements(safe,(_a,tag)=>tag==='h1'),'product_identity_not_confirmed'))!==source.name)throw Error('product_identity_not_confirmed');
  const main=one(htmlElements(safe,a=>a.id==='product'),'product_identity_not_confirmed');
  const form=one(htmlElements(main,(a,tag)=>tag==='form'&&a.id==='customizable'),'product_form_not_confirmed');
  if (attr(form,'action') !== 'https://kronosfera.pl/ajax/store/product/purchase/1/pl/2068' || attr(form,'method') !== 'POST') throw Error('product_form_not_confirmed');
  const converter=one(htmlElements(form,(_a,tag)=>tag==='price-converter'),'retailer_unit_not_confirmed');
  for (const [key,value] of Object.entries({'main-unit-type':'szt','unit-value':'1.00000','units-in-outer':'1',min:'1',step:'1'})) if (attr(converter,key)!==value) throw Error('retailer_unit_not_confirmed');
  const visible=htmlText(one(htmlElements(form,a=>hasClass(a,'product-buy-config__price-value')),'retailer_gross_price_not_confirmed'));
  const unit=htmlText(one(htmlElements(form,a=>hasClass(a,'product-buy-config__price-currency')),'retailer_unit_not_confirmed'));
  const amount=parsePriceToGrosze(visible);
  if (unit!=='zł za sztukę' || !amount || amount!==parsePriceToGrosze(offer.price) || amount!==parsePriceToGrosze(attr(converter,'price-pack')??'')) throw Error('retailer_gross_price_mismatch');
  const params=new Map(htmlElements(main,a=>hasClass(a,'product-params__item')).map(row=>[
    htmlText(one(htmlElements(row,a=>hasClass(a,'product-params__name')),'product_variant_mismatch')),
    htmlText(one(htmlElements(row,a=>hasClass(a,'product-params__value')),'product_variant_mismatch')),
  ]));
  for (const [key,value] of Object.entries({'Kolor listwy':'biały','Długość listwy (mm)':'2400','Wysokość listwy (mm)':'100','Grubość listwy (mm)':'14'})) if(params.get(key)!==value)throw Error('product_variant_mismatch');
  if (!/Produkt z oferty Kronospan KO Sp\. z\.o\.o\./.test(htmlText(form))) throw Error('product_manufacturer_not_confirmed');
  const token=attr(one(htmlElements(form,a=>a.name==='_token'),'anonymous_form_not_confirmed'),'value');
  if (!token || !/^[A-Za-z0-9]{40}$/.test(token)) throw Error('anonymous_form_not_confirmed');
  return { amount, token, product: {...product,gtin13:source.ean,offers:{...offer,url:source.url}} };
}
