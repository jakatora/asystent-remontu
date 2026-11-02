import { createHash } from 'node:crypto';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';
import { parseRetailPage } from './retail-pages';
import { AnonymousShop, MAX_RETAIL_PACKAGES } from './retailer-http';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';
import { UNIMET_ORIGIN, UNIMET_CORNER_ID } from './unimet-purchase';

const one = (values: string[], reason = 'basket_not_confirmed') => {
  if (values.length !== 1) throw Error(reason); return values[0];
};
const attrs = (node: string) => htmlAttributes(node.match(/^<[^>]+>/)?.[0] ?? '');
const money = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d+(?:[ \u00a0]\d{3})*,\d{2}[ \u00a0]*zł$/.test(value.trim())) throw Error('invalid_money');
  const n = parsePriceToGrosze(value); if (n === null || !Number.isSafeInteger(n) || n < 0) throw Error('invalid_money'); return n;
};
const numericMoney = (text: unknown, value: unknown) => {
  const n = money(text); if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value * 100 - n) > 0.00001) throw Error('invalid_money'); return n;
};
function state(html: string): any {
  const matches = [...html.matchAll(/var prestashop = ([^\r\n]+);/g)];
  if (matches.length !== 1) throw Error('cart_session_not_confirmed');
  const value = JSON.parse(matches[0][1]);
  if (value.shop?.name !== 'Unimet sp z o.o.' || value.currency?.iso_code !== 'PLN' || value.customer?.is_logged !== false) throw Error('cart_session_not_confirmed');
  return value;
}

/** A real anonymous oversized-goods cart; postcode is submitted to loadCarriers.
 * The initial zero is provisional. Confirm selected carrier, quantities, gross
 * final cart and the transfer option's payable amount without placing an order.
 * source: https://www.unimet.pl/modules/supercheckout/views/js/front/front.js
 * source: https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html */
export async function quoteUnimet(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  if (order.store !== 'Unimet' || !/^\d{2}-\d{3}$/.test(postalCode) || order.lines.length !== 1 || order.lines[0].packages.length !== 1) throw Error('invalid_basket');
  const line = order.lines[0], pack = line.packages[0], source = RETAIL_SOURCES.find(s => s.id === UNIMET_CORNER_ID);
  if (!source || line.product.id !== 'remont-' + source.ean || line.unit !== source.unit || pack.offerId !== source.id
    || pack.store !== source.store || pack.url !== source.url || pack.packageSize !== source.packageSize
    || pack.minimumPackages !== 25 || (pack.purchaseMultiple ?? 1) !== 1
    || !Number.isSafeInteger(pack.count) || pack.count < 25 || pack.count > MAX_RETAIL_PACKAGES
    || !Number.isSafeInteger(pack.unitPriceGrosze) || pack.unitPriceGrosze < 1
    || !Number.isSafeInteger(pack.lineCostGrosze) || pack.lineCostGrosze !== pack.count * pack.unitPriceGrosze || order.materialsGrosze !== pack.lineCostGrosze) throw Error('invalid_basket');
  const client = new AnonymousShop(UNIMET_ORIGIN, fetchImpl, AbortSignal.timeout(45000), 24);
  const page = await client.text(source.url), observation = parseRetailPage(page, source, new Date());
  if (observation.priceGrosze !== pack.unitPriceGrosze) throw Error('price_changed');
  const first = state(page);
  if (!Array.isArray(first.cart?.products) || first.cart.products.length || first.cart.products_count !== 0) throw Error('basket_not_confirmed');
  const form = one(htmlElements(cleanHtml(page), (a, t) => t === 'form' && a.id === 'add-to-cart-or-refresh'));
  const token = attrs(one(htmlElements(form, (a, t) => t === 'input' && a.name === 'token'))).value;
  const expected = order.materialsGrosze;
  const confirmCart = (cart: any) => {
    if (!Array.isArray(cart?.products) || cart.products.length !== 1 || cart.products_count !== pack.count
      || !Array.isArray(cart.discounts) || cart.discounts.length || !Array.isArray(cart.vouchers?.added) || cart.vouchers.added.length || cart.subtotals?.discounts !== null) throw Error('basket_not_confirmed');
    const p = cart.products[0];
    if (String(p.id) !== '262771' || String(p.id_product) !== '262771' || String(p.id_product_attribute) !== '0'
      || p.reference !== 'G-NA 250+SIA' || p.ean13 !== source.ean || p.name.trim() !== source.name || p.quantity !== pack.count
      || String(p.minimal_quantity) !== '25' || money(p.price) !== pack.unitPriceGrosze || money(p.price_amount) !== pack.unitPriceGrosze
      || money(p.total) !== expected || numericMoney(cart.subtotals.products.value, cart.subtotals.products.amount) !== expected) throw Error('basket_not_confirmed');
  };
  const added = await client.unimet('add', { token, count: pack.count });
  if (added.success !== true || added.errors !== '' || String(added.id_product) !== '262771' || String(added.id_product_attribute) !== '0') throw Error('basket_not_confirmed');
  confirmCart(added.cart);
  const checkout = await client.text('/zam%C3%B3wienie'), current = state(checkout); confirmCart(current.cart);
  const countries = one(htmlElements(cleanHtml(checkout), (a, t) => t === 'select' && a.name === 'shipping_address[id_country]'));
  const poland = one(htmlElements(countries, (_a, t) => t === 'option').filter(n => htmlText(n) === 'Polska'));
  if (attrs(poland).value !== '14') throw Error('country_not_confirmed');
  const nativeToken = current.static_token;
  const carriers = await client.unimet('carriers', { token: nativeToken, postalCode });
  if (carriers.hasError !== false || carriers.shipping_error?.length || typeof carriers.html !== 'string') throw Error('no_home_delivery');
  const safe = cleanHtml(carriers.html), inputs = htmlElements(safe, (a, t) => t === 'input' && a.class?.split(/\s+/).includes('supercheckout_shipping_option'));
  if (inputs.length !== 3) throw Error('no_home_delivery');
  const option = attrs(one(inputs.filter(n => attrs(n).value === '381,'), 'no_home_delivery'));
  const addressId = option.name?.match(/^delivery_option\[(\d{1,12})\]$/)?.[1];
  if (!addressId || option.type !== 'radio') throw Error('no_home_delivery');
  const label = one(htmlElements(safe, (a, t) => t === 'label' && a.for === option.id), 'no_home_delivery');
  const price = one(htmlElements(label, a => Boolean(a.class?.split(/\s+/).includes('shippingPrice'))), 'no_home_delivery');
  if (htmlText(label.replace(price, '')) !== 'GABARYT') throw Error('no_home_delivery');
  const cost = money(htmlText(price).replace(/ brutto$/, ''));
  const selected = await client.unimet('carrier', { token: nativeToken, addressId });
  if (selected.hasError !== false || selected.errors?.length) throw Error('basket_not_confirmed');
  const summary = await client.unimet('cart', { token: nativeToken }), payments = await client.unimet('payments', { token: nativeToken });
  if (summary.redirect !== false || typeof summary.html !== 'string' || typeof payments.html !== 'string') throw Error('basket_not_confirmed');
  const final = state(await client.text('/koszyk?action=show')).cart; confirmCart(final);
  if (numericMoney(final.subtotals.shipping.value, final.subtotals.shipping.amount) !== cost
    || numericMoney(final.totals.total.value, final.totals.total.amount) !== expected + cost
    || numericMoney(final.totals.total_including_tax.value, final.totals.total_including_tax.amount) !== expected + cost) throw Error('basket_not_confirmed');
  const html = cleanHtml(summary.html), value = (id: string) => htmlText(one(htmlElements(html, a => a.id === id)));
  if (money(value('supercehckout_total_products_value')) !== expected || money(value('supercehckout_total_shipping_value')) !== cost
    || money(value('total_price')) !== expected + cost) throw Error('basket_not_confirmed');
  const quantity = attrs(one(htmlElements(html, (a, t) => t === 'input' && a.class?.split(/\s+/).includes('quantitybox'))));
  if (quantity.name !== `quantity_262771_0_${addressId}_0` || quantity.value !== String(pack.count)) throw Error('basket_not_confirmed');
  const payment = cleanHtml(payments.html), bank = attrs(one(htmlElements(payment, (a, t) => t === 'input' && a['data-module-name'] === 'ps_checkpayment')));
  const bankLabel = one(htmlElements(payment, (a, t) => t === 'label' && a.for === bank.id));
  if (bank.name !== 'payment_method' || bank.value !== 'payment-option-1' || htmlText(bankLabel) !== 'Przelew tradycyjny') throw Error('no_prepaid_payment');
  const information = one(htmlElements(payment, a => a.id === 'payment-option-1-additional-information'));
  const payable = one(htmlElements(information, (_a, t) => t === 'dd').filter(n => /\(brutto\)$/.test(htmlText(n))));
  if (money(htmlText(payable).replace(/ \(brutto\)$/, '')) !== expected + cost) throw Error('basket_not_confirmed');
  const now = new Date();
  return { quote: { costGrosze: cost, carrier: 'GABARYT', payment: 'Przelew tradycyjny', checkedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 600000).toISOString(), sourceUrl: UNIMET_ORIGIN + '/koszyk?action=show',
    basis: 'retailer_basket_postcode', destinationScope: 'postal_code', postalCode,
    evidenceSha256: createHash('sha256').update(JSON.stringify({ ean: source.ean, count: pack.count, price: pack.unitPriceGrosze, postalCode, carriers, selected, summary, total: expected + cost })).digest('hex'),
  } };
}
