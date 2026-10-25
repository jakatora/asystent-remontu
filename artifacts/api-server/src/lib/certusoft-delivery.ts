import { createHash } from 'node:crypto';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { parsePriceToGrosze } from '@workspace/price-collector';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { parseRetailPage } from './retail-pages';
import { readCertusoftProduct, readCertusoftState } from './certusoft-product';
import { cleanHtml, htmlElements, htmlText } from './retail-microdata';

const origin = 'https://hipper.pl';
const money = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw Error('invalid_money');
  const cents = Math.round(value * 100);
  if (!Number.isSafeInteger(cents) || Math.abs(value * 100 - cents) > 0.00001) throw Error('invalid_money');
  return cents;
};
type Expected = { count: number; price: number; unitId: number; name: string; path: string };

function confirmedCart(raw: string, expected: Map<number, Expected>, subtotal: number) {
  const state = readCertusoftState(raw), cart = state.csAppWindowsUtils?.csAppWindows?.csB2BCart, ds = cart?.dataSets;
  const positions = ds?.csB2BCartPositions?.rows, headers = ds?.csB2BCartHeader?.rows;
  if (!expected.size || !Array.isArray(positions) || positions.length !== expected.size || !Array.isArray(headers) || headers.length !== 1) throw Error('basket_not_confirmed');
  const seen = new Set<number>(); let sum = 0;
  for (const row of positions) {
    const wanted = expected.get(row.csItemsId);
    if (!wanted || seen.has(row.csItemsId) || row.csItemsUnitsId !== wanted.unitId || row.quantityUnits !== wanted.count || row.unit !== 'szt' || row.itemDesc !== wanted.name || row.menuPath !== wanted.path || row.isStock !== 1 || row.discount !== 0 || money(row.cUnitPrice) !== wanted.price || money(row.cUnitPriceADis) !== wanted.price || money(row.cGAmount) !== wanted.price * wanted.count) throw Error('basket_not_confirmed');
    seen.add(row.csItemsId); sum += wanted.price * wanted.count;
  }
  const header = headers[0];
  if (sum !== subtotal || money(header.cGAmount) !== subtotal || header.sumDiscountValue !== 0 || !Number.isSafeInteger(header.csDocsHeadersId)) throw Error('basket_not_confirmed');
  // This reader never needs or submits customer details or agreements.
  if (header.isRegulationsAccepted !== 0 || header.isProcessingPersonalDataAccepted !== 0 || header.doRegisterAccount !== 0) throw Error('invalid_cart_session');
  return { state, cart, ds, header };
}

/** Same public actions as the storefront: add items and change only carrier /
 * payment selections. Never invoke nextStep, anonymousUsrCartSave or order.
 * source: https://hipper.pl/dist/4.39092321009f53d589f7.js
 * source: https://hipper.pl/czas-koszty-dostawy
 */
export async function quoteCertusoft(order: DeliveredStoreBasket, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  const client = new AnonymousShop(origin, fetchImpl, AbortSignal.timeout(15_000), retailerRequestBudget(order.lines.reduce((n, line) => n + line.packages.length, 0)));
  const expected = new Map<number, Expected>();
  for (const line of order.lines) for (const pack of line.packages) {
    const source = RETAIL_SOURCES.find(s => s.id === pack.offerId && s.store === order.store && s.format === 'certusoft');
    if (!source || order.store !== 'HIPPER' || new URL(source.url).origin !== origin || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > MAX_RETAIL_PACKAGES || !Number.isSafeInteger(pack.unitPriceGrosze * pack.count)) throw Error('invalid_basket');
    const path = new URL(source.url).pathname, raw = await client.text(path), product = readCertusoftProduct(raw, source);
    if (parseRetailPage(raw, source, new Date()).priceGrosze !== pack.unitPriceGrosze) throw Error('price_changed');
    if (product.maxPackages < pack.count) throw Error('insufficient_stock');
    if (expected.has(source.productId!)) throw Error('invalid_basket');
    expected.set(source.productId!, { count: pack.count, price: product.priceGrosze, unitId: source.retailerUnitId!, name: product.product.name, path });
    const response = await client.certusoftAction({ csAppNameSpacesG: product.state.csAppWindowsUtils.csAppWindows.csB2BItemCard.csAppNameSpacesG, appWindowIdent: 'csB2BItemCard', dataSetIdent: 'itemCard', actionIdent: 'cartAdd', sessionId: product.state.csAppWindowsUtils.sessionId,
      row: { csItemsId: source.productId, csItemsUnitsId: source.retailerUnitId, cUnitPrice: product.priceGrosze / 100, discount: 0, quantityUnits: pack.count }, path, addRequestData: { appWindowUniqIdent: 'csB2BItemCard' } });
    if (response.errors?.length || response.data?.errors?.length || !Array.isArray(response.commands)) throw Error('basket_not_confirmed');
  }
  const initial = confirmedCart(await client.text('/koszyk'), expected, order.materialsGrosze);
  const methods = initial.ds.deliveryMethods?.rows, payments = initial.ds.paymentMethods?.rows;
  if (!Array.isArray(methods) || !Array.isArray(payments)) throw Error('no_home_delivery');
  const payment = payments.find((p: any) => p.csPaymentsTypesId === initial.header.csPaymentsTypesId && p.isAvailable === 1 && p.priceListType === 0 && /PayU|Przelew/i.test(p.paymentTypeTranslatedDesc) && !/pobran/i.test(p.paymentTypeTranslatedDesc) && (p.cUnitPrice === null || p.cUnitPrice === 0));
  if (!payment) throw Error('no_prepaid_payment');
  const carriers = methods.flatMap((m: any) => {
    if (m.isAvailable !== 1 || m.isCollectionInPerson !== 0 || !Number.isSafeInteger(m.csB2BPortalsDeliveryMethodsId) || typeof m.deliveryMethod !== 'string' || !/kurier/i.test(m.deliveryMethod) || /pobran|punkt|paczkomat|automat|odbiór|odbior|indywidual|zapytani/i.test(m.deliveryMethod) || m.currencyIdent !== 'zł') return [];
    const cost = money(m.cUnitPrice), threshold = money(m.freeDeliveryFrom);
    return [{ id: m.csB2BPortalsDeliveryMethodsId, carrier: m.deliveryMethod, cost: order.materialsGrosze >= threshold ? 0 : cost }];
  }).sort((a: any, b: any) => a.cost - b.cost);
  const best = carriers[0]; if (!best) throw Error('no_home_delivery');
  const response = await client.certusoftAction({ csAppNameSpacesG: initial.cart.csAppNameSpacesG, appWindowIdent: 'csB2BCart', dataSetIdent: 'csB2BCartHeader', actionIdent: 'csNGOnCFB2BCartHeader', onCFDataFieldIdent: 'csB2BPortalsDeliveryMethodsId', sessionId: initial.state.csAppWindowsUtils.sessionId,
    row: { csDocsHeadersId: initial.header.csDocsHeadersId, csB2BPortalsDeliveryMethodsId: best.id, csPaymentsTypesId: payment.csPaymentsTypesId }, path: '/koszyk', addRequestData: { appWindowUniqIdent: 'csB2BCart' } });
  if (response.errors?.length || response.data?.errors?.length || !Array.isArray(response.commands)) throw Error('basket_not_confirmed');
  const finalRaw = await client.text('/koszyk'), final = confirmedCart(finalRaw, expected, order.materialsGrosze), h = final.header;
  if (h.csB2BPortalsDeliveryMethodsId !== best.id || h.csPaymentsTypesId !== payment.csPaymentsTypesId || money(h.deliveryMethodsCUnitPrice) !== best.cost || money(h.paymentsTypesCUnitPrice) !== 0 || h.isReceptionPoint !== 0) throw Error('basket_not_confirmed');
  const summaries = htmlElements(cleanHtml(finalRaw), a => a.class?.split(/\s+/).includes('c-sum-in') ?? false);
  if (summaries.length !== 1) throw Error('basket_not_confirmed');
  const values = htmlText(summaries[0]).match(/^Wartość produktów: ([\d\s,.]+) zł Sposób płatności: ([\d\s,.]+) zł Sposób dostawy: ([\d\s,.]+) zł Razem do zapłaty: ([\d\s,.]+) zł Do zapłaty po rabacie: ([\d\s,.]+) zł$/);
  const total = order.materialsGrosze + best.cost;
  if (!values || !Number.isSafeInteger(total) || values.slice(1).some((v, i) => parsePriceToGrosze(v.trim()) !== [order.materialsGrosze, 0, best.cost, total, total][i])) throw Error('basket_not_confirmed');
  const now = new Date();
  return { quote: { costGrosze: best.cost, carrier: best.carrier, payment: payment.paymentTypeTranslatedDesc, checkedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 600_000).toISOString(), sourceUrl: origin + '/koszyk', basis: 'retailer_basket_national', destinationScope: 'PL',
    evidenceSha256: createHash('sha256').update(JSON.stringify({ products: [...expected], carrier: best.id, cost: best.cost, payment: payment.csPaymentsTypesId, total })).digest('hex') } };
}
