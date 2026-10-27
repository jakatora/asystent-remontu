import { createHash } from 'node:crypto';
import { parsePriceToGrosze } from '@workspace/price-collector';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import type { RetailSource } from './retail-pages';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { cleanHtml, htmlAttributes, htmlElements, htmlText } from './retail-microdata';

const ORIGIN = 'https://sklep-kowalczyk.pl';
const reviews = [
  // source: https://sklep-kowalczyk.pl/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html
  { id: 35759, ean: '5906675303024', size: 1000, name: 'KOELNER Wkręt samowiercący fosfatowy TEX 3,5x9,5mm 1000 szt (WS-3595)', path: '/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html', photo: '/5/9/5906675303024.png' },
  // source: https://sklep-kowalczyk.pl/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html
  { id: 35762, ean: '5906675107622', size: 200, name: 'KOELNER Kołek szybkiego montażu 6x40 z kołnierzem 200szt/op. (FX-06K040)', path: '/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html', photo: '/5/9/5906675107622.jpg' },
] as const;
const attrs = (node: string) => htmlAttributes(node.match(/^<[^>]+>/)?.[0] ?? '');
const one = <T,>(values: T[], reason: string): T => { if (values.length !== 1) throw Error(reason); return values[0]; };
const amount = (value: unknown): number => { if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw Error('invalid_money'); const n = parsePriceToGrosze(value); if (n === null || !Number.isSafeInteger(n) || Math.abs(value * 100 - n) > 0.00001) throw Error('invalid_money'); return n; };
const sameName = (a: string, b: string) => a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim();

export function reviewedKowalczykSource(source: RetailSource) {
  const review = reviews.find(row => row.id === source.productId);
  if (!review || source.store !== 'E-Kowalczyk' || source.format !== 'kowalczyk-magento' || source.ean !== review.ean || source.retailerSku !== review.ean || source.packageSize !== review.size || source.unit !== 'szt' || source.brand !== 'Koelner' || source.name !== review.name || source.url !== ORIGIN + review.path) throw Error('product_identity_not_confirmed');
  return review;
}

export function inspectKowalczykCard(raw: string, source: RetailSource) {
  const review = reviewedKowalczykSource(source), html = cleanHtml(raw);
  const canonical = htmlElements(html, a => a.rel === 'canonical');
  if (!canonical.length || canonical.some(node => attrs(node).href !== source.url)) throw Error('product_identity_not_confirmed');
  const h1 = htmlText(one(htmlElements(html, (a, tag) => tag === 'h1' && a['data-ui-id'] === 'page-title-wrapper'), 'product_name_mismatch'));
  if (!sameName(h1, review.name)) throw Error('product_name_mismatch');
  const form = one(htmlElements(html, (a, tag) => tag === 'form' && a.id === 'product_addtocart_form'), 'product_id_not_confirmed'), a = attrs(form);
  const action = new URL(a.action ?? '', ORIGIN);
  if (a['data-sku'] !== review.ean || action.origin !== ORIGIN || !action.pathname.endsWith('/product/' + review.id + '/')) throw Error('product_identity_not_confirmed');
  const scriptPrice = one([...raw.matchAll(/initialFinalPrice:\s*(\d+(?:\.\d{1,2})?)\s*,/g)].map(m => Number(m[1])), 'product_price_ambiguous');
  const priceGrosze = amount(scriptPrice); if (!priceGrosze) throw Error('invalid_money');
  if (!raw.includes('product-price-' + review.id)) throw Error('product_id_not_confirmed');
  const photos = [...raw.matchAll(/(?:"full"|"img")\s*:\s*"([^"\n]+)"/g)].map(m => m[1].replaceAll('\\/', '/')).filter(url => { try { const p = new URL(url); return p.origin === ORIGIN && p.pathname.includes('/catalog/product/') && p.pathname.endsWith(review.photo); } catch { return false; } });
  if (!photos.length) throw Error('product_image_not_confirmed');
  return { priceGrosze, imageUrl: photos[0] };
}

type Wanted = { source: RetailSource; count: number; priceGrosze: number; itemId?: number };
export function confirmKowalczykItems(items: any, expected: Wanted[]) {
  if (!Array.isArray(items) || items.length !== expected.length) throw Error('basket_not_confirmed');
  const seen = new Set<string>();
  for (const item of items) {
    const line = expected.find(row => row.source.ean === item?.sku);
    if (!line || seen.has(item.sku) || item.product_type !== 'simple' || !sameName(String(item.name), line.source.name) || !Number.isSafeInteger(item.item_id) || item.item_id < 1 || line.itemId !== undefined && item.item_id !== line.itemId) throw Error('basket_not_confirmed');
    if (item.qty !== line.count) throw Error('insufficient_stock');
    line.itemId = item.item_id; seen.add(item.sku);
  }
}

export function confirmKowalczykTotals(t: any, expected: Wanted[], shippingGrosze = 0) {
  if (t?.base_currency_code !== 'PLN' || t.quote_currency_code !== 'PLN' || !Array.isArray(t.items) || t.items.length !== expected.length || t.items_qty !== expected.reduce((n, row) => n + row.count, 0) || ![undefined, ''].includes(t.coupon_code)) throw Error('basket_not_confirmed');
  for (const key of ['discount_amount','base_discount_amount','shipping_discount_amount','base_shipping_discount_amount']) if (amount(t[key]) !== 0) throw Error('price_changed');
  let gross = 0, net = 0, tax = 0; const seen = new Set<number>();
  for (const item of t.items) {
    const line = expected.find(row => row.itemId === item?.item_id);
    if (!line || seen.has(item.item_id) || !sameName(String(item.name), line.source.name) || item.qty !== line.count || item.options !== '[]' || item.tax_percent !== 23 || ![null, 0].includes(item.weee_tax_applied_amount)) throw Error('basket_not_confirmed');
    for (const key of ['discount_amount','base_discount_amount','discount_percent']) if (amount(item[key]) !== 0) throw Error('price_changed');
    const total = line.count * line.priceGrosze;
    if (!Number.isSafeInteger(total) || amount(item.price_incl_tax) !== line.priceGrosze || amount(item.base_price_incl_tax) !== line.priceGrosze || amount(item.row_total_incl_tax) !== total || amount(item.base_row_total_incl_tax) !== total || amount(item.row_total) + amount(item.tax_amount) !== total || amount(item.base_row_total) + amount(item.base_tax_amount) !== total) throw Error('price_changed');
    gross += total; net += amount(item.row_total); tax += amount(item.tax_amount); seen.add(item.item_id);
  }
  if (amount(t.subtotal_incl_tax) !== gross || t.base_subtotal_incl_tax !== undefined && amount(t.base_subtotal_incl_tax) !== gross || amount(t.subtotal) !== net || amount(t.base_subtotal) !== net || amount(t.subtotal_with_discount) !== net || amount(t.base_subtotal_with_discount) !== net || amount(t.shipping_incl_tax) !== shippingGrosze || amount(t.base_shipping_incl_tax) !== shippingGrosze || amount(t.shipping_amount) + amount(t.shipping_tax_amount) !== shippingGrosze || amount(t.base_shipping_amount) + amount(t.base_shipping_tax_amount) !== shippingGrosze || amount(t.tax_amount) !== tax + amount(t.shipping_tax_amount) || amount(t.base_tax_amount) !== tax + amount(t.base_shipping_tax_amount) || amount(t.grand_total) !== gross + shippingGrosze || amount(t.base_grand_total) !== gross + shippingGrosze) throw Error('basket_not_confirmed');
  if (!Array.isArray(t.total_segments) || t.total_segments.some((row: any) => !['subtotal','shipping','tax','grand_total'].includes(row.code))) throw Error('basket_not_confirmed');
  return gross;
}

async function prepare(wanted: Wanted[], fetchImpl: typeof fetch) {
  if (!wanted.length || wanted.length > 2 || new Set(wanted.map(row => row.source.ean)).size !== wanted.length) throw Error('invalid_basket');
  const client = new AnonymousShop(ORIGIN, fetchImpl, AbortSignal.timeout(20000), retailerRequestBudget(wanted.length));
  const evidence: unknown[] = [], images = new Map<string, string>();
  for (const row of wanted) {
    reviewedKowalczykSource(row.source);
    if (!Number.isSafeInteger(row.count) || row.count < 1 || row.count > MAX_RETAIL_PACKAGES) throw Error('invalid_basket');
    const html = await client.text(row.source.url), card = inspectKowalczykCard(html, row.source);
    if (row.priceGrosze && row.priceGrosze !== card.priceGrosze) throw Error('price_changed');
    row.priceGrosze = card.priceGrosze; images.set(row.source.id, card.imageUrl); evidence.push(html);
  }
  await client.magento('create');
  const empty = await client.magento('items'); if (!Array.isArray(empty) || empty.length) throw Error('basket_not_confirmed');
  for (const row of wanted) { const added = await client.magento('add', { sku: row.source.ean, count: row.count }); confirmKowalczykItems([added], [row]); }
  const items = await client.magento('items'); confirmKowalczykItems(items, wanted);
  const totals = await client.magento('totals'); confirmKowalczykTotals(totals, wanted); evidence.push(items, totals);
  return { client, evidence, wanted, images };
}

export async function readKowalczykProduct(source: RetailSource, fetchImpl: typeof fetch) {
  const p = await prepare([{ source, count: 1, priceGrosze: 0 }], fetchImpl);
  return { priceGrosze: p.wanted[0].priceGrosze, imageUrl: p.images.get(source.id)!, evidenceSha256: createHash('sha256').update(JSON.stringify(p.evidence)).digest('hex') };
}

/** Native guest quote for the posted country/postcode and exact full cart.
 * totals-information recalculates a quotation; it does not place an order.
 * source: https://raw.githubusercontent.com/magento/magento2/2.4-develop/app/code/Magento/Checkout/Model/TotalsInformationManagement.php
 */
export async function quoteKowalczyk(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  if (order.store !== 'E-Kowalczyk' || !/^\d{2}-\d{3}$/.test(postalCode)) throw Error('invalid_basket');
  const wanted = order.lines.flatMap(line => line.packages.map(pack => {
    const source = RETAIL_SOURCES.find(row => row.id === pack.offerId);
    if (!source || pack.store !== order.store || pack.url !== source.url || pack.packageSize !== source.packageSize || pack.lineCostGrosze !== pack.count * pack.unitPriceGrosze) throw Error('invalid_basket');
    return { source, count: pack.count, priceGrosze: pack.unitPriceGrosze };
  }));
  if (wanted.reduce((n, row) => n + row.count * row.priceGrosze, 0) !== order.materialsGrosze) throw Error('invalid_basket');
  const p = await prepare(wanted, fetchImpl);
  const payments = await p.client.magento('payments');
  if (!Array.isArray(payments) || payments.filter(row => row.code === 'checkmo' && row.title === 'Przedpłata (przelew tradycyjny)').length !== 1) throw Error('no_prepaid_payment');
  const paymentTitle = payments.find(row => row.code === 'checkmo').title as string;
  const methods = await p.client.magento('estimate', { postalCode });
  if (!Array.isArray(methods)) throw Error('no_home_delivery');
  const method = one(methods.filter(row => row.carrier_code === 'inpostcourier' && row.method_code === 'standard' && row.carrier_title === 'InPost Kurier' && row.method_title === 'Kurier' && row.available === true && row.error_message === ''), 'no_home_delivery');
  const cost = amount(method.price_incl_tax); if (amount(method.price_excl_tax) > cost) throw Error('invalid_money');
  const initial = await p.client.magento('calculate', { postalCode }); confirmKowalczykTotals(initial, wanted, cost);
  const selected = await p.client.magento('select-prepayment');
  if (!(selected === true || typeof selected === 'string' && /^\d+$/.test(selected))) throw Error('basket_not_confirmed');
  const payment = await p.client.magento('prepayment'); if (payment?.method !== 'checkmo') throw Error('no_prepaid_payment');
  const final = await p.client.magento('calculate', { postalCode }); confirmKowalczykTotals(final, wanted, cost);
  const ship = one<{ title: string }>(final.total_segments.filter((row: any) => row.code === 'shipping'), 'basket_not_confirmed');
  if (ship.title !== 'Wysyłka i obsługa (InPost Kurier - Kurier)') throw Error('basket_not_confirmed');
  const now = new Date(); return { quote: { costGrosze: cost, carrier: 'InPost Kurier', payment: paymentTitle, checkedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 600000).toISOString(), sourceUrl: ORIGIN + '/checkout/cart/', basis: 'retailer_basket_postcode', destinationScope: 'postal_code', postalCode, evidenceSha256: createHash('sha256').update(JSON.stringify([...p.evidence, { postalCode, methods, payment, initial, final }])).digest('hex') } };
}
