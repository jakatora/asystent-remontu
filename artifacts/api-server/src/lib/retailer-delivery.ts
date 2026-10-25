import { createHash } from 'node:crypto';
import type { BasketQuoter, DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop } from './retailer-http';
import { quoteBuduj24, quoteSewera, createCheckoutPageReader } from './retailer-checkouts';
import { shoperProductId } from './retail-pages';
import { quoteCezar } from './cezar-delivery';

// Public anonymous storefront APIs, the same paths used by these shop frontends.
// source: https://dcsaascdn.net/js/front-api-1.5.0.min.js
const ORIGINS: Readonly<Record<string, string>> = {
  'Rab-Dom': 'https://www.rabdom.pl', Realbud: 'https://realbud.com', Zino: 'https://sklep.zino.pl', Prescot: 'https://www.prescot.com.pl',
};
const TTL = 10 * 60_000;

/** Require an explicit PLN amount and agreement between formatted and numeric
 * fields. Missing/NaN/null/negative and fractions of grosze cannot become zero. */
export function confirmedMoney(text: unknown, numeric: unknown): number {
  if (typeof text !== 'string' || typeof numeric !== 'number' || !Number.isFinite(numeric)) throw Error('invalid_money');
  const match = text.replace(/[\s\u00a0]/g, '').match(/^(\d+),(\d{2})zł$/);
  if (!match) throw Error('invalid_money');
  const cents = Number(match[1]) * 100 + Number(match[2]);
  if (!Number.isSafeInteger(cents) || cents < 0 || Math.abs(numeric * 100 - cents) > 0.00001) throw Error('invalid_money');
  return cents;
}

export function selectHomeDelivery(basket: any): { costGrosze: number; carrier: string; payment: string } {
  if (!Array.isArray(basket.countries) || !basket.countries.some((c: any) => c.id === 179 && c.name === 'Polska' && c.selected === true)) throw Error('country_not_confirmed');
  if (!Array.isArray(basket.shippings) || !Array.isArray(basket.payments)) throw Error('invalid_response');
  const options: { costGrosze: number; carrier: string; payment: string }[] = [];
  for (const shipping of basket.shippings) {
    // Explicit home couriers only. Lockers, pickup points, COD and custom freight
    // quotations may expose a tempting zero price but are not home delivery.
    if (shipping.engine !== '' || typeof shipping.title !== 'string' || !/kurier|kurierska|^Transport DPD$/i.test(shipping.title) ||
      /pobran|odbiór|odbior|punkt|automat|pickup|palet|zapytani|indywidualn|kontakt/i.test(`${shipping.title} ${shipping.description ?? ''}`)) continue;
    const country = shipping.countries?.find((c: any) => c.id === 179);
    if (!country) continue;
    let cost: number;
    try { cost = confirmedMoney(country.cost, country.cost_float); if (cost !== confirmedMoney(shipping.cost, shipping.cost_float)) continue; } catch { continue; }
    for (const method of shipping.payments ?? []) {
      const payment = basket.payments.find((p: any) => p.payment_id === method.payment_id);
      if (!payment || !['onlinePayment', 'transfer', 'przelewy24.pl'].includes(payment.name)) continue;
      let surcharge = 0;
      try {
        if (method.additional_cost !== undefined || method.additional_cost_float !== undefined) surcharge += confirmedMoney(method.additional_cost, method.additional_cost_float);
        if (payment.additional_cost !== undefined || payment.additional_cost_float !== undefined) surcharge += confirmedMoney(payment.additional_cost, payment.additional_cost_float);
      } catch { continue; }
      options.push({ costGrosze: cost + surcharge, carrier: shipping.title, payment: payment.title });
    }
  }
  const best = options.sort((a,b) => a.costGrosze - b.costGrosze)[0];
  if (!best) throw Error('no_home_delivery');
  return best;
}

async function quoteShoper(order: DeliveredStoreBasket, fetchImpl: typeof fetch): Promise<DeliveryQuoteResult> {
  const origin = ORIGINS[order.store];
  if (!origin) return { reason: order.store === 'Sewera' ? 'branch_and_address_required' : 'integration_unavailable' };
  const client = new AnonymousShop(origin, fetchImpl, AbortSignal.timeout(12_000));
  const expected = new Map<number, { count: number; price: number }>();
  for (const line of order.lines) for (const pack of line.packages) {
    const source = RETAIL_SOURCES.find(s => s.id === pack.offerId && s.store === order.store);
    if (!source || new URL(source.url).origin !== origin || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > 60) throw Error('invalid_basket');
    const id = shoperProductId(source);
    const product = await client.json(`/webapi/front/pl_PL/products/PLN/${id}`);
    if (String(product.ean) !== source.ean || String(product.id) !== id || !product.can_buy || !Number.isSafeInteger(product.stockId)) throw Error('product_unavailable');
    const price = confirmedMoney(product.price?.gross?.final, product.price?.gross?.final_float);
    if (price !== pack.unitPriceGrosze) throw Error('price_changed');
    if (expected.has(product.stockId)) throw Error('invalid_basket');
    expected.set(product.stockId, { count: pack.count, price });
    await client.json('/webapi/front/pl_PL/basket/PLN/', { stock_id: product.stockId, quantity: pack.count });
  }
  const basket = await client.json('/webapi/front/pl_PL/basket/PLN/');
  if (!Array.isArray(basket.products) || basket.products.length !== expected.size || basket._flash_messenger?.error?.length) throw Error('basket_not_confirmed');
  let total = 0;
  for (const p of basket.products) {
    const wanted = expected.get(p.stock_id);
    if (!wanted || p.quantity !== wanted.count || confirmedMoney(p.price, p.price_float) !== wanted.price ||
      confirmedMoney(p.sum, p.sum_float) !== wanted.count * wanted.price) throw Error('basket_not_confirmed');
    expected.delete(p.stock_id); total += wanted.count * wanted.price;
  }
  if (expected.size || total !== order.materialsGrosze || confirmedMoney(basket.basket?.sum_products, basket.basket?.sum_products_float) !== total) throw Error('basket_not_confirmed');
  const shipping = selectHomeDelivery(basket), checkedAt = new Date();
  // Quote returned for Poland, not claimed to be postcode-specific. No fictitious
  // name/contact/address is ever submitted to a retailer to unlock checkout.
  const evidence = { products: basket.products.map((p: any) => ({ stock: p.stock_id, count: p.quantity, price: p.price_float })), shippings: basket.shippings, payments: basket.payments, countries: basket.countries };
  return { quote: { ...shipping, checkedAt: checkedAt.toISOString(), expiresAt: new Date(checkedAt.getTime() + TTL).toISOString(),
    sourceUrl: `${origin}/pl/basket`, basis: 'retailer_basket_national', destinationScope: 'PL',
    evidenceSha256: createHash('sha256').update(JSON.stringify(evidence)).digest('hex') } };
}

/** Per-service cache: destination + complete basket + price, never browser
 * cookies or personal details. Cap memory, coalesce duplicate work and reject
 * excess concurrency instead of creating an unbounded external-request queue. */
export function createRetailerQuoter(fetchImpl: typeof fetch = fetch): BasketQuoter {
  const pages=createCheckoutPageReader();
  const cache = new Map<string, { until: number; result: Promise<DeliveryQuoteResult> }>();
  let active = 0;
  return async (order, postalCode) => {
    if (!/^\d{2}-\d{3}$/.test(postalCode)) return { reason: 'invalid_postal_code' };
    if (!ORIGINS[order.store] && !['Sewera','Buduj24','Cezar'].includes(order.store)) return { reason: ['Castorama','OBI'].includes(order.store) ? 'retailer_access_required' : 'integration_unavailable' };
    const key = JSON.stringify([postalCode, order.store, order.materialsGrosze, order.lines.flatMap(l => l.packages.map(p => [p.offerId,p.count,p.unitPriceGrosze])).sort()]);
    const cached = cache.get(key); if (cached && cached.until > Date.now()) return cached.result;
    if (active >= 3) return { reason: 'quote_busy' };
    if (cache.size >= 256) cache.delete(cache.keys().next().value!);
    active++;
    const pending = (order.store === 'Sewera' ? quoteSewera(order, postalCode, fetchImpl, pages) : order.store === 'Buduj24' ? quoteBuduj24(order, fetchImpl) : order.store === 'Cezar' ? quoteCezar(order, postalCode, fetchImpl) : quoteShoper(order, fetchImpl))
      .catch((error: unknown): DeliveryQuoteResult => ({ reason: error instanceof Error && error.message === 'retailer_out_of_stock' ? 'product_unavailable' : error instanceof Error && ['price_changed','product_unavailable','insufficient_stock','basket_not_confirmed','no_home_delivery','address_required'].includes(error.message) ? error.message : 'quote_unavailable' })).finally(() => { active--; });
    cache.set(key, { until: Date.now() + TTL, result: pending });
    const result = await pending;
    if ('reason' in result && cache.get(key)?.result === pending) cache.set(key, { until: Date.now() + 30_000, result: Promise.resolve(result) });
    return result;
  };
}
