import { createHash } from 'node:crypto';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import type { RetailSource } from './retail-pages';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';

const ORIGIN = 'https://budshop24.pl';
const PRODUCT = {
  sourceId: 'budshop-atlas-cerplast-15kg', id: 4808, sku: 'BS00215', ean: '5905400530032',
  name: 'ATLAS Cerplast podkładowa masa tynkarska 15kg (baza biała)',
  url: ORIGIN + '/produkt/cerplast-podkladowa-masa-tynkarska-15kg-baza-biala-atlas/',
  image: ORIGIN + '/wp-content/uploads/2025/08/da2d66e8959c2ed6b638d0231c3e78cb.jpg',
} as const;
const COURIER_ID = 'wsds_simple_dimensional:3:medium_parcel_dhl';
const cents = (value: unknown): number => {
  if (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw Error('invalid_money');
  return Number(value);
};
const pln = (value: any) => {
  if (value?.currency_code !== 'PLN' || value.currency_minor_unit !== 2) throw Error('retailer_currency_not_confirmed');
};
function reviewed(source: RetailSource) {
  if (source.id !== PRODUCT.sourceId || source.store !== 'Budshop24' || source.format !== 'budshop-woo' ||
    source.productId !== PRODUCT.id || source.apiProductCode !== PRODUCT.sku || source.ean !== PRODUCT.ean ||
    source.name !== PRODUCT.name || source.url !== PRODUCT.url || source.imageUrl !== PRODUCT.image ||
    source.brand !== 'Atlas' || source.category !== 'primer' || source.packageSize !== 15 || source.unit !== 'kg')
    throw Error('product_identity_not_confirmed');
}

// The merchant publishes its own SKU. Its Budshop24 seller listing associates
// this exact white 15 kg variant with EAN 5905400530032; E-Kowalczyk and
// Ekobud independently publish the same EAN for the white 15 kg bucket.
// source: https://budshop24.pl/produkt/cerplast-podkladowa-masa-tynkarska-15kg-baza-biala-atlas/
// source: https://allegro.pl/produkt/atlas-podkladowa-masa-tynkarska-cerplast-15-kg-819f3488-d980-4f3c-9643-2b523e4e8ba1
// source: https://ekobudsklep.pl/Tynki/3323-srodek-gruntujacy-podklad-tynkarski-cerplast-15kg-atlas-5905400530032.html
export function inspectBudshopProduct(product: any, source: RetailSource) {
  reviewed(source);
  if (product?.id !== PRODUCT.id || product.sku !== PRODUCT.sku || product.name !== PRODUCT.name ||
    product.permalink !== PRODUCT.url || product.type !== 'simple' || product.has_options !== false ||
    product.is_purchasable !== true || product.is_in_stock !== true || product.is_on_backorder !== false ||
    product.stock_availability?.class !== 'in-stock' || product.images?.[0]?.src !== PRODUCT.image)
    throw Error('product_unavailable');
  pln(product.prices);
  const priceGrosze = cents(product.prices.price);
  if (priceGrosze <= 0) throw Error('invalid_money');
  const stockPackages = product.low_stock_remaining;
  if (stockPackages !== null && (!Number.isSafeInteger(stockPackages) || stockPackages < 1)) throw Error('product_unavailable');
  return { name: PRODUCT.name, priceGrosze, imageUrl: PRODUCT.image, stockPackages: stockPackages ?? undefined };
}

function confirmCart(cart: any, count: number, price: number, postalCode: string, shipping?: number) {
  if (!Array.isArray(cart?.items) || cart.items.length !== 1 || cart.items_count !== count ||
    cart.errors?.length || cart.coupons?.length || cart.fees?.length) throw Error('basket_not_confirmed');
  const item = cart.items[0];
  pln(item.prices); pln(item.totals); pln(cart.totals);
  if (item.id !== PRODUCT.id || item.sku !== PRODUCT.sku || item.name !== PRODUCT.name || item.quantity !== count ||
    item.show_backorder_badge === true || item.quantity_limits?.minimum !== 1 ||
    item.quantity_limits?.multiple_of !== 1 || item.quantity_limits?.maximum < count) throw Error('basket_not_confirmed');
  const materials = price * count;
  if (!Number.isSafeInteger(materials) || cents(item.prices.price) !== price ||
    cents(item.totals.line_total) + cents(item.totals.line_total_tax) !== materials ||
    cents(item.totals.line_subtotal) + cents(item.totals.line_subtotal_tax) !== materials ||
    cents(cart.totals.total_items) + cents(cart.totals.total_items_tax) !== materials) throw Error('price_changed');
  for (const key of ['total_discount','total_discount_tax','total_fees','total_fees_tax'])
    if (cents(cart.totals[key]) !== 0) throw Error('basket_not_confirmed');
  const cost = cents(cart.totals.total_shipping) + cents(cart.totals.total_shipping_tax);
  if (cents(cart.totals.total_price) !== materials + cost || (shipping !== undefined && cost !== shipping))
    throw Error('basket_not_confirmed');
  if (cart.shipping_address?.country !== 'PL' || cart.shipping_address.postcode !== postalCode ||
    Object.entries(cart.shipping_address).some(([key, value]) => !['country','postcode'].includes(key) && value !== ''))
    throw Error('country_not_confirmed');
  return cart;
}

async function prepare(count: number, fetchImpl: typeof fetch) {
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_RETAIL_PACKAGES) throw Error('invalid_basket');
  const client = new AnonymousShop(ORIGIN, fetchImpl, AbortSignal.timeout(18_000), retailerRequestBudget(1));
  const empty = await client.cartJson('/wp-json/wc/store/v1/cart');
  if (!Array.isArray(empty.items) || empty.items.length || empty.items_count !== 0) throw Error('basket_not_confirmed');
  const source = RETAIL_SOURCES.find(s => s.id === PRODUCT.sourceId);
  if (!source) throw Error('product_identity_not_confirmed');
  const product = await client.json('/wp-json/wc/store/v1/products/' + PRODUCT.id);
  const card = inspectBudshopProduct(product, source);
  if (card.stockPackages !== undefined && count > card.stockPackages) throw Error('insufficient_stock');
  const added = await client.cartJson('/wp-json/wc/store/v1/cart/add-item', { id: PRODUCT.id, quantity: count });
  confirmCart(added, count, card.priceGrosze, '');
  return { client, card, evidence: [product, added] };
}

export async function readBudshopProduct(source: RetailSource, fetchImpl: typeof fetch) {
  reviewed(source);
  const result = await prepare(1, fetchImpl);
  return { ...result.card, evidenceSha256: createHash('sha256').update(JSON.stringify(result.evidence)).digest('hex') };
}

// Only an anonymous cart, country, postcode and courier are submitted.
// source: https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/
export async function quoteBudshop(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  if (order.store !== 'Budshop24' || !/^\d{2}-\d{3}$/.test(postalCode) || order.lines.length !== 1 ||
    order.lines[0].packages.length !== 1 || order.lines[0].packages[0].offerId !== PRODUCT.sourceId) throw Error('invalid_basket');
  const pack = order.lines[0].packages[0];
  const result = await prepare(pack.count, fetchImpl);
  if (pack.unitPriceGrosze !== result.card.priceGrosze ||
    order.materialsGrosze !== pack.count * result.card.priceGrosze) throw Error('price_changed');
  const located = confirmCart(await result.client.cartJson('/wp-json/wc/store/v1/cart/update-customer',
    { shipping_address: { country: 'PL', postcode: postalCode } }), pack.count, result.card.priceGrosze, postalCode);
  if (!located.has_calculated_shipping || !located.needs_shipping ||
    !located.payment_methods?.includes('p24-online-payments')) throw Error('no_home_delivery');
  const groups = located.shipping_rates;
  if (!Array.isArray(groups) || groups.length !== 1 || groups[0].package_id !== 0 ||
    groups[0].destination?.country !== 'PL' || groups[0].destination?.postcode !== postalCode ||
    Object.entries(groups[0].destination).some(([key, value]) => !['country','postcode'].includes(key) && value !== ''))
    throw Error('no_home_delivery');
  const couriers = groups[0].shipping_rates?.filter((rate: any) =>
    rate.rate_id === COURIER_ID && rate.method_id === 'wsds_simple_dimensional' && rate.name === 'DHL – Średnia Paczka');
  if (couriers?.length !== 1) throw Error('no_home_delivery');
  const rate = couriers[0]; pln(rate);
  const cost = cents(rate.price) + cents(rate.taxes);
  if (cost <= 0) throw Error('no_home_delivery');
  const final = confirmCart(await result.client.cartJson('/wp-json/wc/store/v1/cart/select-shipping-rate',
    { package_id: 0, rate_id: COURIER_ID }), pack.count, result.card.priceGrosze, postalCode, cost);
  const selected = final.shipping_rates?.[0]?.shipping_rates?.filter((r: any) => r.selected);
  if (!final.has_calculated_shipping || !final.payment_methods?.includes('p24-online-payments') ||
    final.shipping_rates?.length !== 1 || final.shipping_rates[0].destination?.postcode !== postalCode ||
    selected?.length !== 1 || selected[0].rate_id !== COURIER_ID ||
    cents(selected[0].price) + cents(selected[0].taxes) !== cost) throw Error('basket_not_confirmed');
  const now = new Date();
  return { quote: { costGrosze: cost, carrier: 'DHL – Średnia Paczka', payment: 'Przelewy24',
    checkedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 600_000).toISOString(),
    sourceUrl: ORIGIN + '/koszyk/', basis: 'retailer_basket_postcode', destinationScope: 'postal_code',
    postalCode, evidenceSha256: createHash('sha256').update(JSON.stringify([...result.evidence, located, final])).digest('hex') } };
}
