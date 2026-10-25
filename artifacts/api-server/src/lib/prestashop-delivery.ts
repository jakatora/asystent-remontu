import { createHash } from 'node:crypto';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { parseRetailPage } from './retail-pages';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';
import { classElements, exactlyOne, prestashopMoney, readPrestashopProduct } from './prestashop-product';

const origin = 'https://www.eelektryka.com';
const attrs = (node: string) => htmlAttributes(node.match(/^<[^>]+>/)?.[0] ?? '');
const input = (html: string, name: string) => attrs(exactlyOne(htmlElements(html, (a, tag) => tag === 'input' && a.name === name), 'basket_not_confirmed'));

/** Uses the actual anonymous basket, not the teaser/default pickup charge.
 * source: https://www.eelektryka.com/index.php?controller=specialorderpayment
 * source: https://eelektryka.com/themes/eelektryka/cache/v_692_b95fd807ca3ad063bc5b929835ff8b13.js (assignDelivery)
 */
export async function quotePrestashop(order: DeliveredStoreBasket, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  const client = new AnonymousShop(origin, fetchImpl, AbortSignal.timeout(12_000), retailerRequestBudget(order.lines.reduce((n, line) => n + line.packages.length, 0)));
  const expected = new Map<string, { count: number; price: number; sku: string }>();
  for (const line of order.lines) for (const pack of line.packages) {
    const source = RETAIL_SOURCES.find(s => s.id === pack.offerId && s.store === order.store && s.format === 'prestashop');
    if (!source || order.store !== 'Eelektryka' || new URL(source.url).origin !== origin || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > MAX_RETAIL_PACKAGES || !Number.isSafeInteger(pack.unitPriceGrosze * pack.count)) throw Error('invalid_basket');
    const page = await client.text(new URL(source.url).pathname), product = readPrestashopProduct(page, source);
    const observation = parseRetailPage(page, source, new Date());
    if (observation.priceGrosze !== pack.unitPriceGrosze) throw Error('price_changed');
    if (pack.count > product.maxPackages) throw Error('insufficient_stock');
    const id = String(source.productId);
    if (expected.has(id)) throw Error('invalid_basket');
    expected.set(id, { count: pack.count, price: product.priceGrosze, sku: source.retailerSku! });
    await client.text(product.addPath, { ...product.addFields, qty: String(pack.count) });
  }
  const cartRaw = await client.text('/index.php?controller=specialorder'), cart = cleanHtml(cartRaw);
  const rows = htmlElements(cart, a => a['data-id-product'] !== undefined);
  if (!expected.size || rows.length !== expected.size) throw Error('basket_not_confirmed');
  const verified: { id: string; count: number; price: number }[] = [];
  let subtotal = 0;
  for (const row of rows) {
    const a = attrs(row), id = a['data-id-product'], wanted = expected.get(id);
    if (!wanted || a['data-id-product-attribute'] !== '0' || input(row, `product_qt[${id}][0]`).value !== String(wanted.count)) throw Error('basket_not_confirmed');
    const unit = prestashopMoney(htmlText(exactlyOne(classElements(row, 'price_unit'), 'basket_not_confirmed')));
    const total = prestashopMoney(htmlText(exactlyOne(classElements(row, 'total_price'), 'basket_not_confirmed')));
    const stock = htmlText(exactlyOne(htmlElements(row, a => a.id === `span_me_1_${id}`), 'basket_not_confirmed'));
    const stockCount = stock.match(/^Kod produktu: (\S+) Dostępna ilość \(szacowana\): (\d+)$/);
    if (!stockCount || stockCount[1] !== wanted.sku || Number(stockCount[2]) < wanted.count || unit !== wanted.price || total !== unit * wanted.count) throw Error('basket_not_confirmed');
    subtotal += total; verified.push({ id, count: wanted.count, price: unit }); expected.delete(id);
  }
  const summary = exactlyOne(classElements(cart, 'final_summary'), 'basket_not_confirmed');
  const materialCell = exactlyOne(classElements(summary, 'total_without_delivery').filter(node => classElements(node, 'amount').length), 'basket_not_confirmed');
  if (expected.size || subtotal !== order.materialsGrosze || prestashopMoney(htmlText(exactlyOne(classElements(materialCell, 'amount'), 'basket_not_confirmed'))) !== subtotal) throw Error('basket_not_confirmed');
  const checkoutRaw = await client.text('/index.php?controller=specialorderpayment'), checkout = cleanHtml(checkoutRaw);
  const form = exactlyOne(htmlElements(checkout, (a, tag) => tag === 'form' && a.id === 'cart_form'), 'basket_not_confirmed');
  const country = exactlyOne(htmlElements(form, (a, tag) => tag === 'select' && a.name === 'individual[country]'), 'country_not_confirmed');
  const countries = htmlElements(country, (_a, tag) => tag === 'option');
  if (!countries.length || attrs(countries[0]).value !== 'Poland' || htmlText(countries[0]) !== 'Polska' || countries.slice(1).some(node => /\bselected\b/i.test(node.match(/^<[^>]+>/)?.[0] ?? ''))) throw Error('country_not_confirmed');
  const prepaid = exactlyOne(classElements(form, 'prepay'), 'no_home_delivery');
  const methods = classElements(prepaid, 'payment_option').flatMap(node => {
    const carrier = htmlText(exactlyOne(classElements(node, 'delivery-title'), 'no_home_delivery'));
    if (!/kurier/i.test(carrier) || /pobran|punkt|automat|paczkomat|odbiór|odbior|indywidual|zapytani/i.test(carrier)) return [];
    const priceNode = exactlyOne(classElements(node, 'price'), 'invalid_money');
    const price = prestashopMoney(htmlText(priceNode)), numeric = attrs(priceNode)['data-price'];
    if (!/^\d+\.\d{2}$/.test(numeric ?? '') || Math.abs(Number(numeric) * 100 - price) > 0.00001) throw Error('invalid_money');
    const id = input(node, 'id_carrier_real').value;
    if (!/^\d+$/.test(id ?? '')) throw Error('no_home_delivery');
    return [{ carrier, costGrosze: price, id }];
  }).sort((a, b) => a.costGrosze - b.costGrosze);
  const best = methods[0];
  if (!best || htmlElements(form, a => a.name === 'payMethod' && a.value === 'bankwire').length !== 1) throw Error('no_home_delivery');
  const token = input(checkout, 'token').value;
  if (!/^[a-f0-9]{32}$/i.test(token ?? '')) throw Error('cart_session_not_confirmed');
  // This frontend action changes only the anonymous cart carrier. No address,
  // acceptance checkbox, payment submission, or order-creation field is sent.
  const raw = await client.text('/', { controller: 'specialorderpayment', ajax: '1', id_carrier_real: best.id, update_delivery: '1', token });
  const selected = JSON.parse(raw);
  if (prestashopMoney(selected.order_total_delivery) !== best.costGrosze || prestashopMoney(selected.order_total_final) !== subtotal + best.costGrosze) throw Error('basket_not_confirmed');
  const now = new Date();
  return { quote: { costGrosze: best.costGrosze, carrier: best.carrier, payment: 'Przelew tradycyjny', checkedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 600_000).toISOString(),
    sourceUrl: origin + '/index.php?controller=specialorderpayment', basis: 'retailer_basket_national', destinationScope: 'PL',
    evidenceSha256: createHash('sha256').update(JSON.stringify({ products: verified, country: 'Poland', carrier: best.id, selected })).digest('hex') } };
}
