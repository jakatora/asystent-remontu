import { parsePriceToGrosze } from '@workspace/price-collector';
import type { RetailSource } from './retail-pages';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';
import { exactlyOne, prestashopMoney } from './prestashop-product';

const opening = (element: string) => element.match(/^<[^>]+>/)?.[0] ?? '';

/** The selected combination supplies the barcode and pack, not a search result
 * or another combination of the same product. Only read this public page.
 * source: https://betterial.pl/kleje-do-styropianu/8679-atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.html
 */
export function readBetterialProduct(html: string, source: RetailSource): Record<string, any> {
  const safe = cleanHtml(html);
  const details = exactlyOne(htmlElements(safe, a => a.class?.split(/\s+/).includes('js-product-details') ?? false), 'product_identity_ambiguous');
  const item = JSON.parse(htmlAttributes(opening(details))['data-product']);
  if (!Number.isSafeInteger(source.productId) || !Number.isSafeInteger(source.variantId) ||
      item.id !== source.productId || item.id_product !== source.productId || item.id_product_attribute !== source.variantId) throw Error('product_id_not_confirmed');
  const attributes = Object.entries(item.attributes ?? {});
  if (attributes.length !== 1) throw Error('product_variant_mismatch');
  const [groupId, attribute] = attributes[0] as [string, Record<string, any>];
  const packName = `${source.packageSize} ${source.unit}`;
  if (!source.retailerSku || attribute.ean13 !== source.ean || attribute.reference !== source.retailerSku ||
      attribute.group !== 'opakowanie' || attribute.name !== packName) throw Error('product_identity_mismatch');
  if (item.unity !== 'opakowanie' || item.unit_price_ratio !== 1 || item.nopackprice !== null || item.pack !== 0 || item.is_customizable !== false) throw Error('retailer_unit_not_confirmed');
  const form = exactlyOne(htmlElements(safe, a => a.id === 'add-to-cart-or-refresh'), 'product_form_ambiguous');
  const formAttrs = htmlAttributes(opening(form));
  const action = new URL(formAttrs.action, source.url);
  if (action.origin !== new URL(source.url).origin || action.pathname !== '/koszyk' || action.search || formAttrs.method !== 'post') throw Error('invalid_cart_route');
  const input = (name: string) => htmlAttributes(opening(exactlyOne(htmlElements(form, (a, tag) => tag === 'input' && a.name === name), 'product_form_ambiguous')));
  if (input('id_product').value !== String(source.productId) || input('id_customization').value !== '0') throw Error('product_id_not_confirmed');
  const select = exactlyOne(htmlElements(form, (a, tag) => tag === 'select' && a.name === `group[${groupId}]`), 'product_variant_mismatch');
  const selected = exactlyOne(htmlElements(select, (a, tag) => tag === 'option' && a.selected !== undefined), 'product_variant_mismatch');
  if (htmlAttributes(opening(selected)).value !== String(attribute.id_attribute) || htmlText(selected) !== packName) throw Error('product_variant_mismatch');
  const multiple = source.purchaseMultiple ?? 1;
  const marker = htmlAttributes(opening(exactlyOne(htmlElements(form, a => a['data-xplo-order-multiple'] !== undefined), 'purchase_rules_changed')));
  if (item.minimal_quantity !== multiple || input('qty').min !== String(multiple) || marker['data-xplo-order-multiple'] !== String(multiple) ||
      marker['data-xplo-product-id'] !== String(source.productId) || marker['data-xplo-product-attribute-id'] !== String(source.variantId)) throw Error('purchase_rules_changed');
  const button = exactlyOne(htmlElements(form, (a, tag) => tag === 'button' && a['data-button-action'] === 'add-to-cart'), 'product_form_ambiguous');
  if (item.active !== '1' || item.available_for_order !== '1' || item.availability !== 'in_stock' || item.allow_oosp !== 0 || /\bdisabled\b/i.test(opening(button))) throw Error('retailer_out_of_stock');
  const name = htmlText(exactlyOne(htmlElements(safe, (_a, tag) => tag === 'h1'), 'product_name_ambiguous'));
  if (name !== source.name || item.name !== name || item.manufacturer_name !== source.brand) throw Error('product_name_mismatch');
  const products = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap(match => { try { const value = JSON.parse(match[1]); return Array.isArray(value) ? value : [value]; } catch { return []; } })
    .filter(value => value?.['@type'] === 'Product');
  if (products.length !== 1) throw Error('product_identity_ambiguous');
  const product = products[0], offer = product.offers;
  if (product.name !== name || product.url !== source.url || product.brand?.name !== source.brand || offer?.['@type'] !== 'Offer' ||
      offer.url !== source.url || offer.priceCurrency !== 'PLN') throw Error('product_identity_mismatch');
  const priceGrosze = prestashopMoney(item.price);
  const priceNodes = htmlElements(safe, a => a.class?.split(/\s+/).includes('product__price') ?? false);
  if (priceNodes.length !== 1 || prestashopMoney(htmlText(priceNodes[0]).replace(/^Cena:\s*/, '')) !== priceGrosze ||
      parsePriceToGrosze(offer.price) !== priceGrosze || parsePriceToGrosze(item.price_amount) !== priceGrosze ||
      prestashopMoney(item.unit_price) !== priceGrosze || !priceGrosze) throw Error('retailer_gross_price_mismatch');
  const grossLabels = htmlElements(safe, a => a.class?.split(/\s+/).includes('product__tax-label') ?? false).map(htmlText);
  if (grossLabels.length !== 1 || grossLabels[0] !== 'Brutto') throw Error('retailer_gross_price_not_confirmed');
  if (offer.availability !== 'https://schema.org/InStock') throw Error('retailer_out_of_stock');
  const image = Array.isArray(product.image) && product.image.length === 1 ? product.image[0] : null;
  if (typeof image !== 'string' || !image.startsWith(action.origin + '/')) throw Error('product_image_not_confirmed');
  return { ...product, gtin13: attribute.ean13, description: `${htmlText(item.description ?? '')} ${packName}`, image };
}
