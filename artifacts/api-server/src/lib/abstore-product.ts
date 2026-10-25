import { parsePriceToGrosze } from '@workspace/price-collector';
import type { RetailSource } from './retail-pages';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';

const one = (values: string[], reason: string) => {
  if (values.length !== 1) throw Error(reason);
  return values[0];
};
const opening = (node: string) => htmlAttributes(node.match(/^<[^>]+>/)?.[0] ?? '');
const byClass = (html: string, name: string) => htmlElements(html, a => a.class?.split(/\s+/).includes(name) ?? false);

/** Reviewed WAPRO/ABStore card. The store sells native square metres in fixed
 * increments of one physical pack. Cross-check its public productData against
 * the visible primary card before turning a unit price into a pack price.
 * source: https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka
 */
export function readAbstoreProduct(html: string, source: RetailSource): Record<string, any> {
  if (new URL(source.url).origin !== 'https://kronodom.pl') throw Error('invalid_retailer_origin');
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  const raw = one(scripts.filter(script => /^\s*const productData = /.test(script)), 'product_identity_ambiguous');
  const literal = raw.match(/^\s*const productData = ([\s\S]*);\s*$/)?.[1];
  if (!literal) throw Error('product_identity_not_confirmed');
  const data = JSON.parse(literal), schema = JSON.parse(data.schemaOrg?.jsonld ?? 'null');
  if (!Number.isSafeInteger(source.productId) || data.id !== source.productId || data.positionOfferId !== source.productId || data.indexCatalogue !== source.ean || schema?.mpn !== source.ean || schema.sku !== source.ean) throw Error('product_ean_not_confirmed');
  if (data.name !== schema.name || data.h1 !== data.name || schema.manufacturer?.name !== source.brand || new URL(schema.offers?.url).href !== source.url) throw Error('product_identity_not_confirmed');
  if (data.stockState !== 'IN_STOCK' || data.canBeSold !== true || data.availability?.productAvailable !== true) throw Error('retailer_out_of_stock');
  if (data.hideProductPrice !== false || data.hidePriceForAnon !== false || data.hideCart !== false || data.invertedVat !== false || data.personalOffer !== false || data.offerDTO?.available !== true || data.offerDTO.addToCartDisabled !== false || data.offerDTO.anyInvalidCondition !== false || data.offerDTO.setOfProducts !== false) throw Error('conditional_price_not_supported');
  const unit = data.clientSaleUnit, reference = data.referenceUnit;
  // This reviewed template currently covers integral-m² packs only. Never use
  // floating point multiplication to guess the price of a fractional pack.
  if (source.unit !== 'm2' || source.apiPurchaseUnit !== 'm2' || !Number.isSafeInteger(source.packageSize) || source.packageSize < 1 || (source.purchaseMultiple ?? 1) !== 1) throw Error('retailer_unit_not_confirmed');
  if (Number(unit?.minQnt) !== source.packageSize || Number(unit?.stepQnt) !== source.packageSize) throw Error('purchase_rules_changed');
  if (unit?.unit !== 'm2' || unit.atomic !== true || unit.canBeSold !== true || reference?.qty !== 1 || reference.unit !== 'm2' || unit.unitId !== reference.unitId || unit.baseUnitRate !== 1 || unit.id !== source.productId) throw Error('retailer_unit_not_confirmed');
  if (!Number.isFinite(unit.availQnt) || unit.availQnt < source.packageSize) throw Error('retailer_out_of_stock');
  const price = unit.priceForUnit, gross = typeof price?.finalGross === 'string' ? price.finalGross.replace(/[\s\u00a0]/g, '').match(/^(\d+),(\d{2})zł$/) : null;
  const unitGrosze = gross ? Number(gross[1]) * 100 + Number(gross[2]) : NaN;
  if (price?.currency !== 'PLN' || price.currencyValue !== 'PLN' || schema.offers.priceCurrency !== 'PLN' || !Number.isSafeInteger(unitGrosze) || unitGrosze <= 0 || parsePriceToGrosze(price.finalGrossValue) !== unitGrosze || parsePriceToGrosze(data.price?.finalGrossValue) !== unitGrosze || parsePriceToGrosze(schema.offers.price) !== unitGrosze) throw Error('retailer_gross_price_mismatch');
  const safe = cleanHtml(html), primary = one(htmlElements(safe, a => a.id === 'product-details-div'), 'product_identity_ambiguous');
  const name = htmlText(one(htmlElements(primary, (_a, tag) => tag === 'h1'), 'product_name_ambiguous'));
  if (name !== data.name || !htmlText(primary).includes(`Indeks katalogowy: ${source.ean}`)) throw Error('product_identity_not_confirmed');
  const input = opening(one(htmlElements(primary, (a, tag) => tag === 'input' && a.class?.split(/\s+/).includes('touch-spin')), 'product_form_ambiguous'));
  const button = opening(one(htmlElements(primary, (a, tag) => tag === 'button' && a['data-module'] === 'cart/cartButton'), 'product_form_ambiguous'));
  if (input['data-product-id'] !== String(source.productId) || input['data-offer-pos-id'] !== String(source.productId) || input['data-unitid'] !== String(unit.unitId) || input['data-unitsc'] !== 'm2' || button['data-product-id'] !== String(source.productId) || button['data-sale-unit-id'] !== String(unit.unitId) || button['data-unitsc'] !== 'm2') throw Error('product_form_ambiguous');
  if (Number(input['data-step']) !== source.packageSize || Number(input['data-min']) !== source.packageSize || Number(button['data-qty']) !== source.packageSize) throw Error('purchase_rules_changed');
  const visible = htmlText(one(byClass(one(byClass(primary, 'abs-product-header-price'), 'product_price_ambiguous'), 'abs-item-price-final'), 'product_price_ambiguous'));
  const match = visible.match(/^([\d\s,.]+)\s*zł\s*brutto\s*\/\s*m2$/);
  if (!match || parsePriceToGrosze(match[1].trim().replace(',', '.')) !== unitGrosze) throw Error('retailer_gross_price_mismatch');
  if (schema.offers.availability !== 'InStock') throw Error('retailer_out_of_stock');
  const packGrosze = unitGrosze * source.packageSize;
  if (!Number.isSafeInteger(packGrosze)) throw Error('invalid_money');
  const image = Array.isArray(schema.image) ? schema.image[0] : null;
  if (typeof image !== 'string' || new URL(image).origin !== 'https://a.assecobs.com') throw Error('product_image_not_confirmed');
  return { '@type': 'Product', name, gtin13: source.ean, brand: source.brand, image,
    description: schema.description,
    offers: { '@type': 'Offer', price: (packGrosze / 100).toFixed(2), priceCurrency: 'PLN', availability: 'https://schema.org/InStock', priceValidUntil: schema.offers.priceValidUntil, url: source.url } };
}
