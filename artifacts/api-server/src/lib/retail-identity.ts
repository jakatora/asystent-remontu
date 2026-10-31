import { parsePriceToGrosze } from '@workspace/price-collector';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';
import type { RetailSource } from './retail-pages';

function only(values: string[], reason: string): string {
  if (values.length !== 1) throw Error(reason);
  return values[0];
}
function attribute(element: string, name: string): string | undefined {
  return htmlAttributes(element.match(/^<[^>]+>/)?.[0] ?? '')[name];
}

/** These reviewed templates expose the barcode in the main specification,
 * separately from Product JSON-LD. Never borrow a code from recommendations. */
export function confirmRetailIdentity(html: string, product: Record<string, any>, source: RetailSource): Record<string, any> {
  const safe = cleanHtml(html);
  if (source.format !== 'rodimax' && (!Number.isSafeInteger(source.productId) || source.productId! < 1)) throw Error('product_id_not_confirmed');
  let code: string, price: string, brand = product.brand, image = product.image;
  if (source.format === 'rodimax') {
    // source: https://rodimax.pl/P%C5%82yta-gipsowa-zwyk%C5%82a-Norgips-1200-x-2600-x-12%2C5-mm-3%2C12-m2.html
    code = htmlText(only(htmlElements(safe,a=>a.id==='sku'),'product_code_not_confirmed'));
    if (product.gtin13 !== code) throw Error('product_ean_not_confirmed');
    const gross = htmlText(only(htmlElements(safe,a=>a.id==='cena'),'retailer_gross_price_not_confirmed'));
    const match = gross.match(/^([\d ,.]+)\s*zł\s+brutto\s*\(\s*Z VAT 23%\s*\)$/i);
    if (!match) throw Error('retailer_gross_price_not_confirmed');
    price = match[1];
    const figure = only(htmlElements(safe,a=>a.id==='zdj'),'product_photo_not_confirmed');
    const photo = only(htmlElements(figure,(_a,tag)=>tag==='img'),'product_photo_not_confirmed');
    if (attribute(photo,'alt') !== product.name || !attribute(photo,'src')) throw Error('product_photo_not_confirmed');
    image = new URL(attribute(photo,'src')!,source.url).href;
  } else if (source.format === 'idosell') {
    // source: https://www.abud.pl/product-pol-6204-Tasma-teflonowa-12mm-x-10m-x-0-075mm-Tycner.html
    const form = only(htmlElements(safe, (a,tag) => tag === 'form' && a['data-product_id'] === String(source.productId)), 'product_id_not_confirmed');
    // Current ChemiaDoParkietu25 uses native form-associated inputs outside
    // the form element. Only the unique named form may own those inputs.
    // source: https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html
    const formId=attribute(form,'id');
    if(!formId||htmlElements(safe,a=>a.id===formId).length!==1)throw Error('product_id_not_confirmed');
    const hidden=only(htmlElements(safe,a=>a.id==='projector_product_hidden'),'product_id_not_confirmed');
    const owner=attribute(hidden,'form');
    if(owner!==undefined?owner!==formId:!form.includes(hidden))throw Error('product_id_not_confirmed');
    if (attribute(hidden,'value') !== String(source.productId)) throw Error('product_id_not_confirmed');
    const dictionary = only(htmlElements(safe,a=>a['data-producer_code']==='true'), 'product_code_not_confirmed');
    code = htmlText(only(htmlElements(dictionary,a=>a.class?.split(/\s+/).includes('dictionary__producer_code')??false),'product_code_not_confirmed'));
    price = htmlText(only(htmlElements(form,a=>a.id==='projector_price_value'),'retailer_gross_price_not_confirmed'));
    const tax = htmlText(only(htmlElements(form,a=>a.class==='price_vat'),'retailer_gross_price_not_confirmed'));
    const unit = htmlText(only(htmlElements(form,a=>a.id==='projector_price_unit'),'retailer_unit_not_confirmed'));
    const quantity = only(htmlElements(form,a=>a.id==='projector_number'),'retailer_unit_not_confirmed');
    if (tax !== 'brutto' || unit !== source.apiPurchaseUnit || attribute(quantity,'data-sellby') !== '1' || attribute(quantity,'step') !== '1') throw Error('retailer_unit_or_gross_not_confirmed');
    const offers = [product.offers].flat();
    if (offers.length !== 1 || offers[0]?.eligibleQuantity?.value !== '1' || offers[0]?.eligibleQuantity?.unitCode !== unit) throw Error('retailer_unit_not_confirmed');
  } else if (source.format === 'fixero') {
    // source: https://fixero.com/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-59g264-59g265-10-szt-55h746.html
    const form = only(htmlElements(safe,a=>a.id==='product_addtocart_form'),'product_id_not_confirmed');
    const hidden = only(htmlElements(form,a=>a.name==='product'),'product_id_not_confirmed');
    if (attribute(hidden,'value') !== String(source.productId)) throw Error('product_id_not_confirmed');
    const table = only(htmlElements(safe,(a,tag)=>tag==='table'&&(a.class?.split(/\s+/).includes('additional-attributes')??false)),'product_code_not_confirmed');
    code = htmlText(only(htmlElements(table,a=>a['data-th']==='EAN'),'product_code_not_confirmed'));
    const offer = only(htmlElements(safe,a=>a.class==='final-price'&&a.itemprop==='offers'),'retailer_price_not_confirmed');
    price = htmlText(only(htmlElements(offer,a=>a.id===`product-price-${source.productId}`),'retailer_price_not_confirmed'));
    const logo = only(htmlElements(safe,a=>a.class==='product-brand-image'),'product_brand_not_confirmed');
    brand = attribute(logo,'alt');
  } else throw Error('unsupported_identity_template');
  if (code !== source.ean || !/^\d{13}$/.test(code)) throw Error('product_ean_not_confirmed');
  const offers = [product.offers].flat();
  const visible = parsePriceToGrosze(price.replace(/\s*zł\s*$/,''));
  if (visible === null || visible <= 0 || offers.length !== 1 || parsePriceToGrosze(offers[0]?.price) !== visible) throw Error('retailer_gross_price_mismatch');
  return { ...product, gtin13:code, brand, image };
}
