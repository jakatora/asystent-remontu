import { createHash } from 'node:crypto';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import type { RetailSource } from './retail-pages';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';

const ORIGIN = 'https://patiartstudio.pl';
// The merchant publishes manufacturer SKUs, but no GTIN. Each SKU is matched
// against the independently verified barcode of the same Cersanit model.
type PatiProduct = { id: number; sku: string; ean: string; name: string; url: string; image: string; brand: string; packageSize: number; unit: string; measurement?: true };
const PRODUCTS: Readonly<Record<string, PatiProduct>> = {
  'pati-cersanit-carina-k98-0068': { id: 1550, sku: 'K98-0068', ean: '5907720651077', name: 'CERSANIT CARINA DESKA DUROPLASTOWA BIAŁA K98-0068', url: ORIGIN + '/produkt/cersanit-deska-carina-zwykla-k98-0068/', image: ORIGIN + '/wp-content/uploads/2021/06/132.jpg', brand: 'Cersanit', packageSize: 1, unit: 'szt' },
  'pati-cersanit-carina-k98-0069': { id: 1549, sku: 'K98-0069', ean: '5907720651084', name: 'CERSANIT CARINA DESKA WOLNOOPADAJĄCA BIAŁA K98-0069', url: ORIGIN + '/produkt/cersanit-deska-carina-wolnoopadajaca-k98-0069/', image: ORIGIN + '/wp-content/uploads/2021/06/130.jpg', brand: 'Cersanit', packageSize: 1, unit: 'szt' },
  'pati-cersanit-carina-k98-0135': { id: 3065, sku: 'K98-0135', ean: '5902115712524', name: 'CERSANIT CARINA DESKA SLIM WOLNOOPADAJĄCA BIAŁA K98-0135', url: ORIGIN + '/produkt/cersanit-deska-carina-slim-wolnoopadajaca-k98-0135/', image: ORIGIN + '/wp-content/uploads/2021/06/1596.jpg', brand: 'Cersanit', packageSize: 1, unit: 'szt' },
  'pati-paradyz-nati-bianco-struktura-25x40': { id: 103591, sku: 'SS&#8211;250X400-1-NATI.BI', ean: '5902610507960', name: 'PARADYŻ NATI BIANCO ŚCIANA STRUKTURA 25&#215;40', url: ORIGIN + '/produkt/paradyz-nati-bianco-sciana-struktura-25x40-ss-250x400-1-nati-bi/', image: ORIGIN + '/wp-content/uploads/2022/09/NATI_-Bianco_sciana_struktura_250x400.jpg', brand: 'Paradyż', packageSize: 1.2, unit: 'm2', measurement: true },
};
const displayName = (value: string) => value.replaceAll('&#215;', '×');
const SHIPPING_ID = 'flexible_shipping_single:7';
const cents = (v: unknown): number => {
  if (typeof v !== 'string' || !/^\d+$/.test(v) || !Number.isSafeInteger(Number(v))) throw Error('invalid_money');
  return Number(v);
};
const pln = (v: any) => {
  if (v?.currency_code !== 'PLN' || v.currency_minor_unit !== 2) throw Error('retailer_currency_not_confirmed');
};
function reviewed(source: RetailSource) {
  const p = PRODUCTS[source.id];
  if (!p || source.store !== 'Pati Art Studio' || source.format !== 'pati-woo' || source.productId !== p.id ||
    source.apiProductCode !== p.sku || source.ean !== p.ean || source.name !== displayName(p.name) || source.url !== p.url ||
    source.imageUrl !== p.image || source.packageSize !== p.packageSize || source.unit !== p.unit || source.brand !== p.brand) throw Error('product_identity_not_confirmed');
  return p;
}

// source: https://patiartstudio.pl/produkt/cersanit-deska-carina-zwykla-k98-0068/
// source: https://patiartstudio.pl/produkt/cersanit-deska-carina-wolnoopadajaca-k98-0069/
// source: https://patiartstudio.pl/produkt/cersanit-deska-carina-slim-wolnoopadajaca-k98-0135/
export function inspectPatiProduct(product: any, source: RetailSource) {
  const p = reviewed(source);
  if (product?.id !== p.id || product.sku !== p.sku || product.name !== p.name || product.permalink !== p.url ||
    product.type !== 'simple' || product.has_options !== false || product.is_purchasable !== true || product.is_in_stock !== true ||
    product.is_on_backorder !== false || product.stock_availability?.class !== 'in-stock') throw Error('product_unavailable');
  pln(product.prices);
  const priceGrosze = cents(product.prices.price);
  if (priceGrosze <= 0) throw Error('invalid_money');
  const imageUrl = product.images?.[0]?.src;
  if (imageUrl !== p.image) throw Error('product_photo_not_confirmed');
  const stockPackages = product.low_stock_remaining;
  if (stockPackages !== null && (!Number.isSafeInteger(stockPackages) || stockPackages < 1)) throw Error('product_unavailable');
  if (p.measurement) {
    const text = product.stock_availability?.text;
    const stock = typeof text === 'string' && /^(\d+(?:\.\d{1,2})?) m² na stanie \(dozwolone zamówienia oczekujące\)$/.exec(text);
    const nativeStock = product.extensions?.gtm4wp?.item?.stocklevel;
    if (!stock || typeof nativeStock !== 'number' || Number(stock[1]) !== nativeStock) throw Error('product_unavailable');
    const packs = Math.floor((nativeStock + 1e-9) / p.packageSize);
    if (packs < 1) throw Error('product_unavailable');
    return { name: displayName(p.name), priceGrosze, imageUrl, stockPackages: packs };
  }
  return { name: p.name, priceGrosze, imageUrl, stockPackages: stockPackages ?? undefined };
}

type Expected = Map<number, { sku: string; name: string; count: number; price: number; measurement?: true }>;
function confirmCart(cart: any, expected: Expected, postalCode: string, shipping?: number) {
  const count = [...expected.values()].reduce((n, p) => n + (p.measurement ? 1 : p.count), 0);
  if (!Array.isArray(cart.items) || cart.items.length !== expected.size || cart.items_count !== count || cart.errors?.length || cart.coupons?.length || cart.fees?.length) throw Error('basket_not_confirmed');
  pln(cart.totals);
  const seen = new Set<number>();
  let materials = 0;
  for (const item of cart.items) {
    const wanted = expected.get(item.id);
    if (!wanted || seen.has(item.id)) throw Error('basket_not_confirmed');
    seen.add(item.id); pln(item.prices); pln(item.totals);
    if (item.sku !== wanted.sku || item.name !== wanted.name || item.quantity !== wanted.count || item.show_backorder_badge === true ||
      item.quantity_limits?.minimum !== 1 || item.quantity_limits?.multiple_of !== 1 || item.quantity_limits?.maximum < wanted.count) throw Error('basket_not_confirmed');
    const line = wanted.price * wanted.count;
    if (!Number.isSafeInteger(line) || cents(item.prices.price) !== wanted.price ||
      cents(item.totals.line_total) + cents(item.totals.line_total_tax) !== line ||
      cents(item.totals.line_subtotal) + cents(item.totals.line_subtotal_tax) !== line) throw Error('price_changed');
    materials += line;
  }
  if (!Number.isSafeInteger(materials) || cents(cart.totals.total_items) + cents(cart.totals.total_items_tax) !== materials) throw Error('price_changed');
  for (const key of ['total_discount','total_discount_tax','total_fees','total_fees_tax']) if (cents(cart.totals[key]) !== 0) throw Error('basket_not_confirmed');
  const cost = cents(cart.totals.total_shipping) + cents(cart.totals.total_shipping_tax);
  if (cents(cart.totals.total_price) !== materials + cost || (shipping !== undefined && cost !== shipping)) throw Error('basket_not_confirmed');
  if (cart.shipping_address?.country !== 'PL' || cart.shipping_address.postcode !== postalCode ||
    Object.entries(cart.shipping_address).some(([key, value]) => !['country','postcode'].includes(key) && value !== '')) throw Error('country_not_confirmed');
  return cart;
}

async function prepare(packs: { source: RetailSource; count: number }[], fetchImpl: typeof fetch) {
  if (!packs.length || packs.some(p => !Number.isSafeInteger(p.count) || p.count < 1 || p.count > MAX_RETAIL_PACKAGES)) throw Error('invalid_basket');
  const client = new AnonymousShop(ORIGIN, fetchImpl, AbortSignal.timeout(18_000), retailerRequestBudget(packs.length));
  const empty = await client.cartJson('/wp-json/wc/store/v1/cart');
  if (!Array.isArray(empty.items) || empty.items.length || empty.items_count !== 0) throw Error('basket_not_confirmed');
  const expected: Expected = new Map(), evidence: any[] = [];
  const cards: { sourceId: string; name: string; priceGrosze: number; imageUrl: string; stockPackages?: number }[] = [];
  // The classic area form starts a cookie-backed Woo session. Add it first so
  // later ordinary Store API products share that session and one delivery fee.
  for (const pack of [...packs].sort((a,b) => Number(Boolean(reviewed(b.source).measurement)) - Number(Boolean(reviewed(a.source).measurement)))) {
    const p = reviewed(pack.source);
    if (expected.has(p.id)) throw Error('invalid_basket');
    const product = await client.json('/wp-json/wc/store/v1/products/' + p.id);
    const card = inspectPatiProduct(product, pack.source);
    if (card.stockPackages !== undefined && pack.count > card.stockPackages) throw Error('insufficient_stock');
    expected.set(p.id, { sku: p.sku, name: p.name, count: pack.count, price: card.priceGrosze, ...(p.measurement ? { measurement: true } : {}) });
    const added = p.measurement
      ? (await client.patiTileAdd(pack.count), await client.cartJson('/wp-json/wc/store/v1/cart'))
      : await client.cartJson('/wp-json/wc/store/v1/cart/add-item', { id: p.id, quantity: pack.count });
    confirmCart(added, expected, '');
    cards.push({ sourceId: pack.source.id, ...card }); evidence.push(product, added);
  }
  return { client, expected, cards, evidence };
}

export async function readPatiProduct(source: RetailSource, fetchImpl: typeof fetch) {
  const p = await prepare([{ source, count: 1 }], fetchImpl);
  return { ...p.cards[0], evidenceSha256: createHash('sha256').update(JSON.stringify(p.evidence)).digest('hex') };
}

// Only anonymous cart actions and postcode are submitted; no customer or order.
// source: https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/
export async function quotePati(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  if (order.store !== 'Pati Art Studio' || !/^\d{2}-\d{3}$/.test(postalCode)) throw Error('invalid_basket');
  const packs = order.lines.flatMap(line => line.packages.map(pack => {
    const source = RETAIL_SOURCES.find(s => s.id === pack.offerId);
    if (!source || source.store !== order.store) throw Error('invalid_basket');
    return { source, count: pack.count, unitPriceGrosze: pack.unitPriceGrosze };
  }));
  const p = await prepare(packs, fetchImpl);
  const materials = packs.reduce((total, pack) => total + pack.count * p.cards.find(card => card.sourceId === pack.source.id)!.priceGrosze, 0);
  if (!Number.isSafeInteger(materials) || materials !== order.materialsGrosze || packs.some(pack => pack.unitPriceGrosze !== p.cards.find(card => card.sourceId === pack.source.id)!.priceGrosze)) throw Error('price_changed');
  const located = confirmCart(await p.client.cartJson('/wp-json/wc/store/v1/cart/update-customer', { shipping_address: { country: 'PL', postcode: postalCode } }), p.expected, postalCode);
  if (!located.has_calculated_shipping || !located.needs_shipping || !located.payment_methods?.includes('bacs')) throw Error('no_home_delivery');
  const groups = located.shipping_rates;
  if (!Array.isArray(groups) || groups.length !== 1 || groups[0].package_id !== 0 || groups[0].destination?.country !== 'PL' || groups[0].destination?.postcode !== postalCode ||
    Object.entries(groups[0].destination).some(([key, value]) => !['country','postcode'].includes(key) && value !== '')) throw Error('no_home_delivery');
  const couriers = groups[0].shipping_rates?.filter((rate: any) => rate.rate_id === SHIPPING_ID && rate.method_id === 'flexible_shipping_single' && rate.name === 'Kurier');
  if (couriers?.length !== 1) throw Error('no_home_delivery');
  const rate = couriers[0]; pln(rate);
  const cost = cents(rate.price) + cents(rate.taxes);
  if (cost <= 0) throw Error('no_home_delivery');
  const final = confirmCart(await p.client.cartJson('/wp-json/wc/store/v1/cart/select-shipping-rate', { package_id: 0, rate_id: SHIPPING_ID }), p.expected, postalCode, cost);
  const selected = final.shipping_rates?.[0]?.shipping_rates?.filter((r: any) => r.selected);
  if (!final.has_calculated_shipping || !final.payment_methods?.includes('bacs') || final.shipping_rates?.length !== 1 ||
    final.shipping_rates[0].destination?.postcode !== postalCode || selected?.length !== 1 || selected[0].rate_id !== SHIPPING_ID ||
    cents(selected[0].price) + cents(selected[0].taxes) !== cost) throw Error('basket_not_confirmed');
  const now = new Date();
  return { quote: { costGrosze: cost, carrier: 'Kurier', payment: 'Przelew bankowy', checkedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 600_000).toISOString(), sourceUrl: ORIGIN + '/koszyk/', basis: 'retailer_basket_postcode',
    destinationScope: 'postal_code', postalCode, evidenceSha256: createHash('sha256').update(JSON.stringify([...p.evidence, located, final])).digest('hex') } };
}
