import { createHash } from 'node:crypto';
import type { DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import type { RetailSource } from './retail-pages';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';

const ORIGIN = 'https://budshop24.pl';
const PRODUCTS = [{
  sourceId: 'budshop-atlas-cerplast-15kg', id: 4808, sku: 'BS00215', ean: '5905400530032',
  name: 'ATLAS Cerplast podkładowa masa tynkarska 15kg (baza biała)',
  apiName: 'ATLAS Cerplast podkładowa masa tynkarska 15kg (baza biała)',
  cartName: 'ATLAS Cerplast podkładowa masa tynkarska 15kg (baza biała)',
  category: 'primer', packageSize: 15,
  url: ORIGIN + '/produkt/cerplast-podkladowa-masa-tynkarska-15kg-baza-biala-atlas/',
  image: ORIGIN + '/wp-content/uploads/2025/08/da2d66e8959c2ed6b638d0231c3e78cb.jpg',
}, {
  sourceId: 'budshop-atlas-woder-duo-16kg', id: 7381, sku: 'BS00293', ean: '5905400195088',
  name: 'ATLAS WODER DUO 16kg - hydroizolacja dwuskładnikowa elastyczna',
  apiName: 'ATLAS WODER DUO 16kg &#8211; hydroizolacja dwuskładnikowa elastyczna',
  cartName: 'ATLAS WODER DUO 16kg &#8211; hydroizolacja dwuskładnikowa elastyczna',
  category: 'waterproofing', packageSize: 16,
  url: ORIGIN + '/produkt/atlas-woder-duo-16kg-hydroizolacja-dwuskladnikowa/',
  image: ORIGIN + '/wp-content/uploads/2025/08/2044418.jpg',
}] as const;
const COURIERS = {
  'wsds_simple_dimensional:3:medium_parcel_dhl': { name: 'DHL – Średnia Paczka', label: 'DHL – Średnia Paczka' },
  'wsds_simple_dimensional:3:large_parcel_dhl': { name: 'DHL – Duża Paczka', label: 'DHL – Duża Paczka' },
  'wsds_simple_dimensional:3:multi_medium_parcel_large_parcel': { name: 'Paczki/Worki: Średnia Paczka + Duża Paczka', label: 'Paczki/Worki: Średnia Paczka + Duża Paczka' },
} as const;
const cents = (value: unknown): number => {
  if (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw Error('invalid_money');
  return Number(value);
};
const pln = (value: any) => {
  if (value?.currency_code !== 'PLN' || value.currency_minor_unit !== 2) throw Error('retailer_currency_not_confirmed');
};
function reviewed(source: RetailSource) {
  const product = PRODUCTS.find(p => p.sourceId === source.id);
  if (!product || source.store !== 'Budshop24' || source.format !== 'budshop-woo' ||
    source.productId !== product.id || source.apiProductCode !== product.sku || source.ean !== product.ean ||
    source.name !== product.name || source.url !== product.url || source.imageUrl !== product.image ||
    source.brand !== 'Atlas' || source.category !== product.category || source.packageSize !== product.packageSize || source.unit !== 'kg')
    throw Error('product_identity_not_confirmed');
  return product;
}

// The merchant publishes its own SKU. Its Budshop24 seller listing associates
// this exact white 15 kg variant with EAN 5905400530032; E-Kowalczyk and
// Ekobud independently publish the same EAN for the white 15 kg bucket.
// source: https://budshop24.pl/produkt/cerplast-podkladowa-masa-tynkarska-15kg-baza-biala-atlas/
// source: https://allegro.pl/produkt/atlas-podkladowa-masa-tynkarska-cerplast-15-kg-819f3488-d980-4f3c-9643-2b523e4e8ba1
// source: https://ekobudsklep.pl/Tynki/3323-srodek-gruntujacy-podklad-tynkarski-cerplast-15kg-atlas-5905400530032.html
// Woder Duo's 16 kg variant and EAN are independently published by PSB.
// source: https://budshop24.pl/produkt/atlas-woder-duo-16kg-hydroizolacja-dwuskladnikowa/
// source: https://www.grupapsb.com.pl/produkt/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16-kg-atlas-5905400195088.html
export function inspectBudshopProduct(product: any, source: RetailSource) {
  const expected = reviewed(source);
  if (product?.id !== expected.id || product.sku !== expected.sku || product.name !== expected.apiName ||
    product.permalink !== expected.url || product.type !== 'simple' || product.has_options !== false ||
    product.is_purchasable !== true || product.is_in_stock !== true || product.is_on_backorder !== false ||
    product.stock_availability?.class !== 'in-stock' || product.images?.[0]?.src !== expected.image)
    throw Error('product_unavailable');
  pln(product.prices);
  const priceGrosze = cents(product.prices.price);
  if (priceGrosze <= 0) throw Error('invalid_money');
  const lowStock = product.low_stock_remaining;
  if (lowStock != null && (!Number.isSafeInteger(lowStock) || lowStock < 1)) throw Error('product_unavailable');
  const visibleStock = String(product.stock_availability.text ?? '').match(/^(\d+) w magazynie$/);
  const stockPackages = lowStock ?? (visibleStock ? Number(visibleStock[1]) : undefined);
  if (stockPackages !== undefined && (!Number.isSafeInteger(stockPackages) || stockPackages < 1)) throw Error('product_unavailable');
  return { name: expected.name, priceGrosze, imageUrl: expected.image, stockPackages };
}

type CartPack = { product: (typeof PRODUCTS)[number]; count: number; price: number };
function confirmCart(cart: any, packs: CartPack[], postalCode: string, shipping?: number) {
  if (!Array.isArray(cart?.items) || cart.items.length !== packs.length ||
    cart.items_count !== packs.reduce((n, pack) => n + pack.count, 0) ||
    cart.errors?.length || cart.coupons?.length || cart.fees?.length) throw Error('basket_not_confirmed');
  const expected = new Map(packs.map(pack => [pack.product.id, pack]));
  let materials = 0;
  for (const item of cart.items) {
    const pack = expected.get(item.id);
    if (!pack) throw Error('basket_not_confirmed');
    expected.delete(item.id);
    pln(item.prices); pln(item.totals);
    if (item.sku !== pack.product.sku || item.name !== pack.product.cartName || item.quantity !== pack.count ||
      item.show_backorder_badge === true || item.quantity_limits?.minimum !== 1 ||
      item.quantity_limits?.multiple_of !== 1 || item.quantity_limits?.maximum < pack.count) throw Error('basket_not_confirmed');
    const line = pack.price * pack.count;
    if (!Number.isSafeInteger(line) || cents(item.prices.price) !== pack.price ||
      cents(item.totals.line_total) + cents(item.totals.line_total_tax) !== line ||
      cents(item.totals.line_subtotal) + cents(item.totals.line_subtotal_tax) !== line) throw Error('price_changed');
    materials += line;
  }
  if (expected.size || !Number.isSafeInteger(materials)) throw Error('basket_not_confirmed');
  pln(cart.totals);
  if (cents(cart.totals.total_items) + cents(cart.totals.total_items_tax) !== materials) throw Error('price_changed');
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

async function prepare(entries: { source: RetailSource; count: number }[], fetchImpl: typeof fetch) {
  if (!entries.length || entries.length > PRODUCTS.length || new Set(entries.map(entry => entry.source.id)).size !== entries.length ||
    entries.some(entry => !Number.isSafeInteger(entry.count) || entry.count < 1 || entry.count > MAX_RETAIL_PACKAGES)) throw Error('invalid_basket');
  const client = new AnonymousShop(ORIGIN, fetchImpl, AbortSignal.timeout(18_000), retailerRequestBudget(entries.length));
  const empty = await client.cartJson('/wp-json/wc/store/v1/cart');
  if (!Array.isArray(empty.items) || empty.items.length || empty.items_count !== 0) throw Error('basket_not_confirmed');
  const packs: CartPack[] = [], evidence: unknown[] = [];
  let card: ReturnType<typeof inspectBudshopProduct> | undefined;
  for (const entry of entries) {
    const expected = reviewed(entry.source);
    const product = await client.json('/wp-json/wc/store/v1/products/' + expected.id);
    card = inspectBudshopProduct(product, entry.source);
    if (card.stockPackages !== undefined && entry.count > card.stockPackages) throw Error('insufficient_stock');
    packs.push({ product: expected, count: entry.count, price: card.priceGrosze });
    const added = await client.cartJson('/wp-json/wc/store/v1/cart/add-item', { id: expected.id, quantity: entry.count });
    confirmCart(added, packs, '');
    evidence.push(product, added);
  }
  return { client, card: card!, packs, evidence };
}

export async function readBudshopProduct(source: RetailSource, fetchImpl: typeof fetch) {
  reviewed(source);
  const result = await prepare([{ source, count: 1 }], fetchImpl);
  return { ...result.card, evidenceSha256: createHash('sha256').update(JSON.stringify(result.evidence)).digest('hex') };
}

// Only an anonymous cart, country, postcode and courier are submitted.
// source: https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/
export async function quoteBudshop(order: DeliveredStoreBasket, postalCode: string, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  if (order.store !== 'Budshop24' || !/^\d{2}-\d{3}$/.test(postalCode) || !order.lines.length ||
    order.lines.some(line => line.packages.length !== 1 || line.unit !== 'kg')) throw Error('invalid_basket');
  const entries = order.lines.map(line => {
    const pack = line.packages[0];
    const source = RETAIL_SOURCES.find(s => s.id === pack.offerId && s.store === 'Budshop24');
    if (!source) throw Error('invalid_basket');
    return { source, count: pack.count };
  });
  const result = await prepare(entries, fetchImpl);
  const materials = result.packs.reduce((sum, pack) => sum + pack.price * pack.count, 0);
  if (!Number.isSafeInteger(materials) || order.materialsGrosze !== materials ||
    order.lines.some((line, index) => line.packages[0].unitPriceGrosze !== result.packs[index].price ||
      line.packages[0].lineCostGrosze !== result.packs[index].price * result.packs[index].count)) throw Error('price_changed');
  const located = confirmCart(await result.client.cartJson('/wp-json/wc/store/v1/cart/update-customer',
    { shipping_address: { country: 'PL', postcode: postalCode } }), result.packs, postalCode);
  if (!located.has_calculated_shipping || !located.needs_shipping ||
    !located.payment_methods?.includes('p24-online-payments')) throw Error('no_home_delivery');
  const groups = located.shipping_rates;
  if (!Array.isArray(groups) || groups.length !== 1 || groups[0].package_id !== 0 ||
    groups[0].destination?.country !== 'PL' || groups[0].destination?.postcode !== postalCode ||
    Object.entries(groups[0].destination).some(([key, value]) => !['country','postcode'].includes(key) && value !== ''))
    throw Error('no_home_delivery');
  const ids = new Set(result.packs.map(pack => pack.product.id));
  const courierId = ids.size === 2 ? 'wsds_simple_dimensional:3:multi_medium_parcel_large_parcel' :
    ids.has(4808) ? 'wsds_simple_dimensional:3:medium_parcel_dhl' : 'wsds_simple_dimensional:3:large_parcel_dhl';
  const courier = COURIERS[courierId];
  const couriers = groups[0].shipping_rates?.filter((rate: any) =>
    rate.rate_id === courierId && rate.method_id === 'wsds_simple_dimensional' && rate.name === courier.name);
  if (couriers?.length !== 1) throw Error('no_home_delivery');
  const rate = couriers[0]; pln(rate);
  const cost = cents(rate.price) + cents(rate.taxes);
  if (cost <= 0) throw Error('no_home_delivery');
  const final = confirmCart(await result.client.cartJson('/wp-json/wc/store/v1/cart/select-shipping-rate',
    { package_id: 0, rate_id: courierId }), result.packs, postalCode, cost);
  const selected = final.shipping_rates?.[0]?.shipping_rates?.filter((r: any) => r.selected);
  if (!final.has_calculated_shipping || !final.payment_methods?.includes('p24-online-payments') ||
    final.shipping_rates?.length !== 1 || final.shipping_rates[0].destination?.postcode !== postalCode ||
    selected?.length !== 1 || selected[0].rate_id !== courierId ||
    cents(selected[0].price) + cents(selected[0].taxes) !== cost) throw Error('basket_not_confirmed');
  const now = new Date();
  return { quote: { costGrosze: cost, carrier: courier.label, payment: 'Przelewy24',
    checkedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 600_000).toISOString(),
    sourceUrl: ORIGIN + '/koszyk/', basis: 'retailer_basket_postcode', destinationScope: 'postal_code',
    postalCode, evidenceSha256: createHash('sha256').update(JSON.stringify([...result.evidence, located, final])).digest('hex') } };
}
