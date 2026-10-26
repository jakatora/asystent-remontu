import { parsePriceToGrosze } from '@workspace/price-collector';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';
import type { RetailSource } from './retail-pages';

const one = (values: string[], reason: string) => { if (values.length !== 1) throw Error(reason); return values[0]; };
const attrs = (node: string) => htmlAttributes(node.match(/^<[^>]+>/)?.[0] ?? '');
const byId = (html: string, id: string) => one(htmlElements(html, a => a.id === id), 'product_identity_not_confirmed');
const gross = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d+\.\d{2}$/.test(value)) throw Error('retailer_gross_price_mismatch');
  const price = parsePriceToGrosze(value); if (price === null || price < 0) throw Error('retailer_gross_price_mismatch'); return price;
};

/** Legacy IdoSell form: the native size holds the barcode while JSON-LD holds
 * the manufacturer's part number. No script is evaluated.
 * source: https://folnet.pl/pl/products/chemia-tasmy-mocowania/chemia-budowlana-soudal/pianki-pistoletowe/pianka-pistoletowa-soudafoam-low-expansion-10-8372.html
 */
export function inspectFolnetProduct(html: string, source: RetailSource) {
  if (new URL(source.url).origin !== 'https://folnet.pl' || !Number.isSafeInteger(source.productId) || !source.retailerSku) throw Error('invalid_retailer_origin');
  // A roll is a different native purchase unit from a foam can. Pin the
  // reviewed barcode, dimensions and retailer identity before converting m².
  // source: https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html
  const conpar = source.id === 'folnet-conpar-100m2' && source.ean === '5902096430103' && source.productId === 10288 && source.retailerSku === '12-021' && source.brand === 'Conkret' && source.category === 'vapor-barrier' && source.unit === 'm2' && source.packageSize === 100 && source.url === 'https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html';
  const foam = source.id === 'folnet-soudal-low-expansion-winter-750ml' && source.ean === '5411183048522' && source.productId === 8372 && source.retailerSku === '112583' && source.brand === 'Soudal' && source.unit === 'ml' && source.packageSize === 750;
  if (!conpar && !foam) throw Error('unreviewed_folnet_product');
  const nativeUnit = conpar ? 'rolka' : 'szt.';
  const literals = [...html.matchAll(/\bvar\s+product_data\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/gi)];
  if (literals.length !== 1) throw Error('product_identity_ambiguous');
  const data = JSON.parse(literals[0][1]), size = data.sizes?.onesize;
  if (Object.keys(data.sizes ?? {}).join(',') !== 'onesize' || size?.type !== 'onesize' || size.name !== 'uniw' || size.code_producer !== source.ean || size.code_extern !== (conpar ? source.retailerSku : `SOU.${source.retailerSku}`)) throw Error('product_ean_not_confirmed');
  if (data.product_type !== 'product_item' || data.currency !== 'zł' || data.unit !== nativeUnit || data.unit_sellby !== '1' || data.unit_precision !== '0') throw Error('retailer_unit_not_confirmed');
  if (size.availability?.status !== 'enable' || size.availability.visible !== 'y' || !/^\d+$/.test(size.availability.sum) || !Number.isSafeInteger(Number(size.availability.sum)) || Number(size.availability.sum) < 1) throw Error('retailer_out_of_stock');
  for (const price of [data.base_price, size.price]) if (price?.basket_enable !== 'y' || price.rebate_code_active !== 'n' || price.priceformula_error !== 'false' || price.vat !== '23') throw Error('conditional_price_not_supported');
  const amount = gross(size.price.value);
  if (Object.keys(data.order_quantity_range ?? {}).length) throw Error('purchase_rules_changed');
  if (amount <= 0 || gross(data.base_price.value) !== amount || gross(data.base_price.price_unit_sellby) !== amount) throw Error('retailer_gross_price_mismatch');
  const safe = cleanHtml(html), form = byId(safe, 'projector_form');
  if (attrs(form).action !== '/basketchange.php' || attrs(form).method !== 'post' || attrs(form)['data-product_id'] !== String(source.productId) || attrs(byId(form, 'projector_product_hidden')).value !== String(source.productId) || attrs(byId(form, 'projector_size_hidden')).value !== 'onesize' || attrs(byId(form, 'projector_mode_hidden')).value !== '1') throw Error('product_id_not_confirmed');
  if (htmlText(byId(form, 'projector_code')) !== `Symbol: ${source.retailerSku}` || htmlText(byId(form, 'projector_price_unit')) !== nativeUnit || htmlText(byId(form, 'projector_price_format')) !== 'brutto') throw Error('retailer_unit_or_gross_not_confirmed');
  if (parsePriceToGrosze(htmlText(byId(form, 'projector_price_value')).replace(/\s*zł$/, '')) !== amount) throw Error('retailer_gross_price_mismatch');
  const name = htmlText(one(htmlElements(form, (_a, tag) => tag === 'h1'), 'product_name_not_confirmed'));
  const records = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m => { try { return [JSON.parse(m[1])].flat(); } catch { return []; } }).filter(p => p?.['@type'] === 'Product');
  if (records.length !== 1) throw Error('product_identity_ambiguous');
  const product = records[0], offers = [product.offers].flat();
  const brand = htmlText(one(htmlElements(form, a => a.class === 'brand'), 'product_brand_not_confirmed'));
  if (product.name !== name || product.brand !== source.brand || brand !== product.brand || product.productID !== `mpn:${source.retailerSku}` || offers.length !== 1) throw Error('product_identity_not_confirmed');
  const url = new URL(offers[0]?.url, source.url);
  if (url.origin !== 'https://folnet.pl' || url.pathname !== new URL(source.url).pathname || url.searchParams.get('selected_size') !== 'onesize' || offers[0]?.priceCurrency !== 'PLN' || offers[0]?.availability !== 'http://schema.org/InStock' || gross(offers[0]?.price) !== amount) throw Error('retailer_gross_price_mismatch');
  const dictionary = one(htmlElements(safe, a => a.class === 'n54117_dictionary'), 'product_package_not_confirmed');
  const pack = htmlText(one(htmlElements(dictionary, (_a, tag) => tag === 'tr').filter(row => htmlText(row).startsWith('Wymiar :')), 'product_package_not_confirmed'));
  if (pack !== (conpar ? 'Wymiar : 2 m x 50 m' : 'Wymiar : 750 ml')) throw Error('product_package_not_confirmed');
  if (conpar) {
    const thickness = htmlText(one(htmlElements(dictionary, (_a, tag) => tag === 'tr').filter(row => htmlText(row).startsWith('Grubość :')), 'product_package_not_confirmed'));
    if (thickness !== 'Grubość : 0,2 mm ± 30%') throw Error('product_package_not_confirmed');
  }
  if (typeof product.image !== 'string' || new URL(product.image).origin !== 'https://folnet.pl') throw Error('product_photo_not_confirmed');
  const polish = htmlElements(safe, (a, tag) => tag === 'a' && a.class === 'checked' && a.href === '/settings.php?curr=PLN&lang=pol&country=1143020003');
  if (polish.length !== 1) throw Error('country_not_confirmed');
  return { product: { ...product, gtin13: source.ean, description: htmlText(dictionary), offers: { ...offers[0], url: url.href } }, amount, stock: Number(size.availability.sum) };
}
