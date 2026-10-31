import { parsePriceToGrosze } from '@workspace/price-collector';
import type { RetailSource } from './retail-pages';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';
import {isReviewedAksCableSource} from './aks-cables';

const only = (values: string[], reason: string) => {
  if (values.length !== 1) throw Error(reason);
  return values[0];
};
const byClass = (html: string, name: string) => htmlElements(html, a => a.class?.split(/\s+/).includes(name) ?? false);
const attrs = (node: string) => htmlAttributes(node.match(/^<[^>]+>/)?.[0] ?? '');
const nameText = (value: string) => value.trim().replace(/\s+/g,' ');

/** Read the public SSR JSON as data. Never execute the retailer's script.
 * source: https://hipper.pl/klamka-do-drzwi-wewnetrznych-lucy-zlota-r-schaffner-3069808860
 */
export function readCertusoftState(html: string): Record<string, any> {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const script = only(scripts.filter(s => /^\s*window\.__INITIAL_STATE__=/.test(s)), 'retailer_state_ambiguous');
  const literal = script.match(/^\s*window\.__INITIAL_STATE__=(\{[\s\S]*\});\(function\(\)\{var s;/)?.[1];
  if (!literal) throw Error('retailer_state_not_confirmed');
  return JSON.parse(literal);
}

/** Reviewed HIPPER primary card. Prices are gross consumer prices; cart totals
 * are independently checked by the delivery adapter before recommending them.
 * source: https://hipper.pl/regulamin
 */
export function readCertusoftProduct(html: string, source: RetailSource) {
  const url = new URL(source.url);
  if (url.origin !== 'https://hipper.pl' || !Number.isSafeInteger(source.productId) || !Number.isSafeInteger(source.retailerUnitId)) throw Error('product_id_not_confirmed');
  // One native "szt" is this exact 25m roll, not one metre or a 40-roll carton.
  // source: https://hipper.pl/tasma-flizelinowa-z-wlokna-szklanego-50-mm-norgips-2682507570
  // source: https://norgips.pl/produkty/tasma-fizelinowa-150.html
  const reviewedRoll = source.id === 'hipper-norgips-fleece-50x25' && source.ean === '5907651699926'
    && source.brand === 'Norgips' && source.productId === 2682507570 && source.retailerUnitId === 2682507597
    && source.url === 'https://hipper.pl/tasma-flizelinowa-z-wlokna-szklanego-50-mm-norgips-2682507570'
    && source.unit === 'm' && source.packageSize === 25;
  // One native piece is exactly this500ml concentrate bottle, not500bottles.
  // source: https://hipper.pl/metylan-plyn-do-usuwania-tapet-0-5-l-956213124
  // source: https://datasheets.tdx.henkel.com/METYLAN-Remover-pl_PL.pdf
  const reviewedBottle = source.id === 'hipper-metylan-remover-500ml' && source.ean === '9000100222969'
    && source.brand === 'Metylan' && source.productId === 956213124 && source.retailerUnitId === 956370273
    && source.url === 'https://hipper.pl/metylan-plyn-do-usuwania-tapet-0-5-l-956213124'
    && source.unit === 'ml' && source.packageSize === 500;
  // source: https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325
  // source: https://norgips.pl/produkty/lacznik-krzyzowy-72.html
  const reviewedCarton = source.id === 'hipper-norgips-cross-100' && source.ean === '5907651696468'
    && source.brand === 'Norgips' && source.productId === 3071669325 && source.retailerUnitId === 3072059634
    && source.url === 'https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325'
    && source.unit === 'szt' && source.packageSize === 100
    && source.variant?.join('|') === 'krzyżowy|60|145|100';
  const singlePiece = source.unit === 'szt' && source.packageSize === 1 && source.id !== 'hipper-norgips-cross-100' && !source.id.startsWith('hipper-aks-');
  // One native piece is this exact 25m roll declared under GTIN5904617578721.
  // source: https://hipper.pl/przewod-elektroenergetyczny-ydyp-3-x-2-5-mm2-450-750-v-25-m-aks-zielonka-956340429
  // source: https://media.adeo.com/media/4774947/media.pdf
  const reviewedCable = source.id==='hipper-aks-ydyp-3x25-25m'&&isReviewedAksCableSource(source);
  if ((!singlePiece && !reviewedRoll && !reviewedBottle && !reviewedCarton && !reviewedCable) || source.apiPurchaseUnit !== 'szt' || (source.purchaseMultiple ?? 1) !== 1) throw Error('retailer_unit_not_confirmed');
  const state = readCertusoftState(html), card = state.csAppWindowsUtils?.csAppWindows?.csB2BItemCard;
  const rows = card?.dataSets?.itemCard?.rows;
  if (!Array.isArray(rows) || rows.length !== 1) throw Error('product_identity_ambiguous');
  const row = rows[0], schema = JSON.parse(row.structuredData ?? 'null');
  if (row.EAN !== source.ean || schema?.sku !== source.ean || schema.mpn !== String(source.productId) || row.csItemsId !== source.productId || row.csItemsUnitsId !== source.retailerUnitId) throw Error('product_ean_not_confirmed');
  if (typeof row.itemName !== 'string' || typeof schema.name !== 'string' || nameText(row.itemName) !== nameText(schema.name) || schema.brand?.name !== source.brand || '/' + row.appWindowIdentRoute !== url.pathname) throw Error('product_identity_not_confirmed');
  if (row.stockUnit !== 'szt' || row.quantityUnits !== 1 || row.isNegative !== 0) throw Error('purchase_rules_changed');
  const maxPackages = row.qStockAv;
  if (!Number.isSafeInteger(maxPackages) || maxPackages < 1 || schema.offers?.availability !== 'InStock') throw Error('retailer_out_of_stock');
  const priceGrosze = parsePriceToGrosze(row.cUnitPriceADis);
  if (row.discount !== 0 || schema.offers?.priceCurrency !== 'PLN' || !priceGrosze || parsePriceToGrosze(row.cUnitPrice) !== priceGrosze || parsePriceToGrosze(schema.offers.price) !== priceGrosze) throw Error('retailer_gross_price_mismatch');
  const primary = only(htmlElements(cleanHtml(html), (a, tag) => tag === 'section' && a.id === 'item'), 'product_identity_ambiguous');
  const name = htmlText(only(htmlElements(primary, (_a, tag) => tag === 'h1'), 'product_name_ambiguous'));
  const ean = htmlText(only(byClass(primary, 'c-ean'), 'product_identity_ambiguous'));
  if (nameText(name) !== nameText(row.itemName) || ean !== `(Kod produktu: ${source.ean})`) throw Error('product_identity_not_confirmed');
  const price = htmlText(only(byClass(only(byClass(primary, 'c-prc'), 'product_price_ambiguous'), 'c-upad'), 'product_price_ambiguous'));
  if (!/^\d[\d\s]*,\d{2} zł$/.test(price) || parsePriceToGrosze(price.replace(/ zł$/, '')) !== priceGrosze) throw Error('retailer_gross_price_mismatch');
  const stock = htmlText(only(byClass(primary, 'c-itm-s'), 'retailer_stock_not_confirmed'));
  if (stock !== `W magazynie ${maxPackages} szt`) throw Error('retailer_stock_not_confirmed');
  const quantity = attrs(only(htmlElements(primary, (a, tag) => tag === 'input' && a.type === 'quantity'), 'product_form_ambiguous'));
  const button = attrs(only(byClass(primary, 'cartAdd'), 'product_form_ambiguous'));
  if (quantity.value !== '1' || !quantity.class?.split(/\s+/).includes('c-ft-integer') || 'disabled' in button) throw Error('purchase_rules_changed');
  const images = schema.image;
  if (!Array.isArray(images) || typeof images[0] !== 'string' || new URL(images[0]).origin !== url.origin || !new URL(images[0]).pathname.startsWith('/api/attachment/get/')) throw Error('product_image_not_confirmed');
  return { state, maxPackages, priceGrosze,
    product: { '@type': 'Product', name, brand: source.brand, gtin13: source.ean, image: new URL(images[0]).href, description: row.itemDesc,
      offers: { '@type': 'Offer', price: (priceGrosze / 100).toFixed(2), priceCurrency: 'PLN', availability: 'https://schema.org/InStock', url: source.url } } };
}
