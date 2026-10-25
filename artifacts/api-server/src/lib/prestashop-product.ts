import { parsePriceToGrosze } from '@workspace/price-collector';
import type { RetailSource } from './retail-pages';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';

const opening = (element: string) => element.match(/^<[^>]+>/)?.[0] ?? '';
export function exactlyOne(elements: string[], reason: string): string {
  if (elements.length !== 1) throw Error(reason);
  return elements[0];
}
export function classElements(html: string, name: string): string[] {
  return htmlElements(html, a => a.class?.split(/\s+/).includes(name) ?? false);
}
export function prestashopMoney(value: string): number {
  const match = value.replace(/[\s\u00a0]/g, '').match(/^(\d+),(\d{2})zł$/);
  const cents = match ? Number(match[1]) * 100 + Number(match[2]) : NaN;
  if (!Number.isSafeInteger(cents) || cents < 0) throw Error('invalid_money');
  return cents;
}

/** Reviewed Eelektryka product template. Recommendations share the Product
 * scope, so only the primary h1, barcode fields and buy_block may supply data.
 * source: https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111-5902787568238.html
 */
export function readPrestashopProduct(html: string, source: RetailSource) {
  const safe = cleanHtml(html);
  const product = exactlyOne(htmlElements(safe, a => /\/Product$/.test(a.itemtype ?? '')), 'product_identity_ambiguous');
  const byId = (id: string) => exactlyOne(htmlElements(product, a => a.id === id), 'product_identity_ambiguous');
  const identityValue = (id: string) => {
    const field = exactlyOne(htmlElements(byId(id), a => a.itemprop === 'sku'), 'product_identity_ambiguous');
    const attrs = htmlAttributes(opening(field));
    if (attrs.content !== htmlText(field)) throw Error('product_identity_mismatch');
    return attrs.content;
  };
  if (identityValue('product_ean') !== source.ean || !source.retailerSku || identityValue('product_reference') !== source.retailerSku) throw Error('product_identity_mismatch');
  if (source.packageSize !== 1 || source.unit !== 'szt') throw Error('retailer_unit_not_confirmed');
  const name = htmlText(exactlyOne(htmlElements(product, (a, tag) => tag === 'h1' && a.itemprop === 'name'), 'product_name_ambiguous'));
  const brand = htmlAttributes(opening(exactlyOne(htmlElements(product, (a, tag) => tag === 'meta' && a.itemprop === 'brand'), 'product_brand_ambiguous'))).content;
  const form = byId('buy_block'), formAttrs = htmlAttributes(opening(form));
  const action = new URL(formAttrs.action, source.url);
  if (action.origin !== new URL(source.url).origin || action.pathname !== '/koszyk' || action.search || formAttrs.method?.toLowerCase() !== 'post') throw Error('invalid_cart_route');
  const input = (name: string) => htmlAttributes(opening(exactlyOne(htmlElements(form, (a, tag) => tag === 'input' && a.name === name), 'product_form_ambiguous')));
  if (!Number.isSafeInteger(source.productId) || source.productId! < 1 || input('id_product').value !== String(source.productId) || !['', '0'].includes(input('id_product_attribute').value)) throw Error('product_id_not_confirmed');
  if (input('add').value !== '1') throw Error('invalid_cart_route');
  const quantity = input('qty'), maxPackages = Number(quantity.max);
  if (quantity.min !== '1' || quantity.step !== '1') throw Error('purchase_rules_changed');
  if (!/^\d+$/.test(quantity.max ?? '') || !Number.isSafeInteger(maxPackages) || maxPackages < 1) throw Error('retailer_out_of_stock');
  const button = exactlyOne(htmlElements(form, (a, tag) => tag === 'button' && a.type === 'submit' && a.name === 'Submit'), 'product_form_ambiguous');
  if (/\bdisabled\b/i.test(opening(button))) throw Error('retailer_out_of_stock');
  const offer = exactlyOne(htmlElements(form, a => a.itemprop === 'offers' && /\/Offer$/.test(a.itemtype ?? '')), 'product_offer_ambiguous');
  const availability = htmlAttributes(opening(exactlyOne(htmlElements(offer, a => a.itemprop === 'availability'), 'product_stock_ambiguous'))).href;
  if (!/^https?:\/\/schema.org\/InStock$/.test(availability)) throw Error('retailer_out_of_stock');
  const priceNode = exactlyOne(htmlElements(offer, a => a.id === 'our_price_display' && a.itemprop === 'price'), 'product_price_ambiguous');
  const priceGrosze = prestashopMoney(htmlText(priceNode));
  if (!priceGrosze || parsePriceToGrosze(htmlAttributes(opening(priceNode)).content) !== priceGrosze) throw Error('retailer_gross_price_mismatch');
  const taxLabels = classElements(offer, 'tax-label').map(htmlText);
  if (taxLabels.filter(label => label === 'brutto').length !== 1) throw Error('retailer_gross_price_not_confirmed');
  const currency = htmlAttributes(opening(exactlyOne(htmlElements(offer, a => a.itemprop === 'priceCurrency'), 'product_currency_ambiguous'))).content;
  if (currency !== 'PLN') throw Error('retailer_currency_not_confirmed');
  const image = htmlAttributes(opening(byId('bigpic')));
  if (image.itemprop !== 'image' || image.alt !== name) throw Error('product_image_not_confirmed');
  const imageUrl = new URL(image.src, source.url);
  if (imageUrl.protocol !== 'https:' || imageUrl.origin !== action.origin) throw Error('product_image_not_confirmed');
  const token = input('token').value;
  if (!/^[a-f0-9]{32}$/i.test(token ?? '')) throw Error('cart_session_not_confirmed');
  return {
    product: { '@type': 'Product', name, brand, gtin13: source.ean, image: imageUrl.href,
      offers: { '@type': 'Offer', price: (priceGrosze / 100).toFixed(2), priceCurrency: currency, availability, url: source.url } },
    priceGrosze, maxPackages, addPath: action.pathname,
    // Only anonymous product-add fields. Never serialize a checkout form.
    addFields: { token, id_product: String(source.productId), add: '1', id_product_attribute: '0', Submit: 'Dodaj do koszyka' },
  };
}
