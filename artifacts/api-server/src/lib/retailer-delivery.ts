import {quoteDekorator} from './dekorator';
import {quoteMlazienka} from './mlazienka';
import {quoteIntegra} from './integra';
import { createHash } from 'node:crypto';
import type { BasketQuoter, DeliveredStoreBasket, DeliveryQuoteResult } from '../../../../lib/pricing-service/src/delivery';
import { RETAIL_SOURCES } from './retail-catalog';
import { AnonymousShop, MAX_RETAIL_PACKAGES, retailerRequestBudget } from './retailer-http';
import { quoteBuduj24, quoteSewera, createCheckoutPageReader } from './retailer-checkouts';
import { shoperProductId, confirmShoperPurchaseUnit } from './retail-pages';
import { quoteCezar } from './cezar-delivery';
import { QuoteQueue } from './quote-queue';
import { quoteTopboden } from './topboden-delivery';
import { quotePrestashop } from './prestashop-delivery';
import { quoteCertusoft } from './certusoft-delivery';
import { quoteModna } from './modna-delivery';
import { quoteFolnet } from './folnet-delivery';
import { quoteKronosfera } from './kronosfera-delivery';
import { quoteSkyshop } from './skyshop-delivery';
import { quoteAbud } from './abud-delivery';
import { quoteIrbud } from './irbud-woo';
import { quotePati } from './pati-woo';
import { quoteBudshop } from './budshop-woo';
import { quoteKowalczyk } from './kowalczyk-magento';
import { quoteIzosystems } from './izosystems-delivery';
import {quoteBmb} from './bmb';
import {quoteKronodom} from './kronodom-delivery';

// Public anonymous storefront APIs, the same paths used by these shop frontends.
// source: https://dcsaascdn.net/js/front-api-1.5.0.min.js
const ORIGINS: Readonly<Record<string, string>> = {
  // source: https://sklep.instato.pl/pl/static/czas-i-koszty-dostawy.html
  // source: https://arenalazienek.pl/pl/p/Polsyfon-umywalkowy-MCALPINE-niski%2C-bialy-WHB1-32/57988
  Instato:'https://sklep.instato.pl','Arena Łazienek':'https://arenalazienek.pl',
  // source: https://plejadatapet.pl/pl/p/Klej-do-tapet-Direct-200g-Metylan/825
  // source: https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101
  'Plejada Tapet': 'https://plejadatapet.pl', 'Świat Się Klei': 'https://swiatsieklei.pl',
  // source: https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P180-50szt/25771
  Matiw: 'https://matiw.pl',
  // source: https://kim24.pl/Kolek-szybki-montaz-kolnierz-6x40-KOELNER
  KIM24: 'https://kim24.pl',
  'Z prądem': 'https://zpradem.pl', 'Elektro-Hurt': 'https://sklep.ehw.com.pl',
  'Rab-Dom': 'https://www.rabdom.pl', Realbud: 'https://realbud.com', Zino: 'https://sklep.zino.pl', Prescot: 'https://www.prescot.com.pl',
  WinBud: 'https://winbud24.pl', 'Dam-Bud': 'https://salonbudowlanydambud.pl', 'Plus-Market': 'https://www.plus-market.pl',
  // source: https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000
  // source: https://ebardo.pl/pl/p/Folia-paroizolacyjna-Conpar-0%2C2mm-2mx50m/86
  eBardo: 'https://ebardo.pl', Mensura: 'https://www.mensura.pl', KELOT: 'https://listwy.sklep.pl', LiderzyCen: 'https://liderzycen.pl', TGS: 'https://tgs.pl',
  // source: https://lobo.pl/dulux-rapidry-farba-do-drewna-metalu-pcv-mat-bialy-1l
  Lobo: 'https://lobo.pl',
};
const TTL = 10 * 60_000;

function unavailableReason(store: string): string | undefined {
  const sources = RETAIL_SOURCES.filter(source=>source.store===store);
  if(sources.some(source=>source.pickupOnly))return 'retailer_transport_quote_required';
  if(sources.some(source=>source.marketplaceSeller))return 'retailer_access_required';
  if (sources.length && sources.every(source=>source.format === 'betterial')) return 'retailer_transport_quote_required';
  // This checkout requests customer/address fields before shipping selection.
  // The footer's 16/21 PLN is not a postcode/basket quote.
  // source: https://sklep.tokmet.pl/buyall.php
  if (sources.length && sources.every(source=>source.format === 'qshop')) return 'address_required';
  // The anonymous basket has a provisional shipping amount, but the checkout
  // requires customer/contact details before selecting a destination/carrier.
  // That amount is not a confirmed home-delivery quote for the user's postcode.
  // source: https://marbet24.pl/zamowienie
  if (store === 'Marbet24') return 'customer_details_required';
  if (sources.length && sources.every(source=>source.disabledReason)) return sources[0].disabledReason;
  if (ORIGINS[store] || ['Sewera','Buduj24','Cezar','TopBoden','Eelektryka','HIPPER','Modna Łazienka','Folnet','Kronosfera','Kronodom','Centrum Matbud','ABUD','IRBUD','Pati Art Studio','Budshop24','E-Kowalczyk','Izosystems','BMB Technologie','Integra Bielińscy','mŁazienka','DekoratorMarket'].includes(store)) return undefined;
  return ['Castorama','OBI','Leroy Merlin'].includes(store) ? 'retailer_access_required' : 'integration_unavailable';
}
export function retailerDeliveryCapabilities() {
  return {
    automaticStores:[...new Set([...Object.keys(ORIGINS),'Sewera','Buduj24','Cezar','TopBoden','Eelektryka','HIPPER','Modna Łazienka','Folnet','Kronosfera','Kronodom','Centrum Matbud','ABUD','IRBUD','Pati Art Studio','Budshop24','E-Kowalczyk','Izosystems','BMB Technologie','Integra Bielińscy','mŁazienka','DekoratorMarket'])].filter(store=>RETAIL_SOURCES.some(source=>source.store===store&&!source.disabledReason)),
    country:'PL',quoteTtlSeconds:600,
    postcodeStores:['Sewera','Cezar','ABUD','IRBUD','Pati Art Studio','Budshop24','E-Kowalczyk','Izosystems'],accessRequiredStores:[...new Set(['Castorama','OBI','Leroy Merlin',...RETAIL_SOURCES.filter(source=>source.marketplaceSeller).map(source=>source.store)])],
  };
}
export function knownUnavailableRetailers(): Readonly<Record<string,string>> {
  const result: Record<string,string> = {};
  for (const store of new Set(RETAIL_SOURCES.map(source=>source.store))) {
    const reason = unavailableReason(store);
    if (reason) result[store] = reason;
  }
  return result;
}

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

export function selectHomeDelivery(basket: any, store?: string): { costGrosze: number; carrier: string; payment: string } {
  if (!Array.isArray(basket.countries) || !basket.countries.some((c: any) => c.id === 179 && c.name === 'Polska' && c.selected === true)) throw Error('country_not_confirmed');
  if (!Array.isArray(basket.shippings) || !Array.isArray(basket.payments)) throw Error('invalid_response');
  const options: { costGrosze: number; carrier: string; payment: string }[] = [];
  for (const shipping of basket.shippings) {
    // Explicit home couriers only. Lockers, pickup points, COD and custom freight
    // quotations may expose a tempting zero price but are not home delivery.
    // Reviewed ShoperShipment response contains both lockers and couriers.
    // Keep the home-courier title and pickup/COD exclusions for this engine.
    // source: https://salonbudowlanydambud.pl/pl/p/MAPEI-NAROZNIK-USZCZELNIAJACY-WEWNETRZNY-MAPEBAND-W/768
    // Lobo's InPost Shoper engine serves both home couriers and lockers. Its
    // courier description mentions pallets only to exclude carrying service.
    // Keep these exceptions scoped to the reviewed Lobo cart.
    // source: https://lobo.pl/dulux-rapidry-farba-do-drewna-metalu-pcv-mat-bialy-1l
    if (!(['','ShoperShipment'].includes(shipping.engine) || (store === 'Lobo' && shipping.engine === 'inpost')) || typeof shipping.title !== 'string' || !/kurier|kurierska|^Transport DPD$/i.test(shipping.title) ||
      (store === 'Lobo'
        ? /pobran|odbiór|odbior|punkt|automat|pickup|palet|zapytani|indywidualn|kontakt/i.test(shipping.title) || /pobran|odbiór|odbior|punkt|automat|pickup|zapytani|indywidualn|kontakt/i.test(String(shipping.description ?? ''))
        : /pobran|odbiór|odbior|punkt|automat|pickup|palet|zapytani|indywidualn|kontakt/i.test(`${shipping.title} ${shipping.description ?? ''}`))) continue;
    const country = shipping.countries?.find((c: any) => c.id === 179);
    if (!country) continue;
    let cost: number;
    try { cost = confirmedMoney(country.cost, country.cost_float); if (cost !== confirmedMoney(shipping.cost, shipping.cost_float)) continue; } catch { continue; }
    for (const method of shipping.payments ?? []) {
      const payment = basket.payments.find((p: any) => p.payment_id === method.payment_id);
      if (!payment || !['onlinePayment', 'transfer', 'przelewy24.pl', 'shoperP24'].includes(payment.name)) continue;
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
  const client = new AnonymousShop(origin, fetchImpl, AbortSignal.timeout(12_000),retailerRequestBudget(order.lines.reduce((n,line)=>n+line.packages.length,0)));
  const expected = new Map<number, { count: number; price: number; unitName?: string }>();
  for (const line of order.lines) for (const pack of line.packages) {
    const source = RETAIL_SOURCES.find(s => s.id === pack.offerId && s.store === order.store);
    if (!source || new URL(source.url).origin !== origin || !Number.isSafeInteger(pack.count) || pack.count < 1 || pack.count > MAX_RETAIL_PACKAGES || !Number.isSafeInteger(pack.unitPriceGrosze*pack.count)) throw Error('invalid_basket');
    const id = shoperProductId(source);
    const product = await client.json(`/webapi/front/pl_PL/products/PLN/${id}`);
    confirmShoperPurchaseUnit(product,source);
    if (String(product.ean) !== source.ean || String(product.id) !== id || !product.can_buy || !Number.isSafeInteger(product.stockId)) throw Error('product_unavailable');
    const price = confirmedMoney(product.price?.gross?.final, product.price?.gross?.final_float);
    if (price !== pack.unitPriceGrosze) throw Error('price_changed');
    if (expected.has(product.stockId)) throw Error('invalid_basket');
    expected.set(product.stockId, { count: pack.count, price, unitName:source.apiPurchaseUnit });
    await client.json('/webapi/front/pl_PL/basket/PLN/', { stock_id: product.stockId, quantity: pack.count });
  }
  const basket = await client.json('/webapi/front/pl_PL/basket/PLN/');
  if (!Array.isArray(basket.products) || basket.products.length !== expected.size || basket._flash_messenger?.error?.length) throw Error('basket_not_confirmed');
  let total = 0;
  for (const p of basket.products) {
    const wanted = expected.get(p.stock_id);
    if (!wanted || p.quantity !== wanted.count || wanted.unitName && (p.unit?.name !== wanted.unitName || p.unit?.floating_point !== false) || confirmedMoney(p.price, p.price_float) !== wanted.price ||
      confirmedMoney(p.sum, p.sum_float) !== wanted.count * wanted.price) throw Error('basket_not_confirmed');
    expected.delete(p.stock_id); total += wanted.count * wanted.price;
  }
  if (expected.size || total !== order.materialsGrosze || confirmedMoney(basket.basket?.sum_products, basket.basket?.sum_products_float) !== total) throw Error('basket_not_confirmed');
  const shipping = selectHomeDelivery(basket,order.store), checkedAt = new Date();
  // Quote returned for Poland, not claimed to be postcode-specific. No fictitious
  // name/contact/address is ever submitted to a retailer to unlock checkout.
  const evidence = { products: basket.products.map((p: any) => ({ stock: p.stock_id, count: p.quantity, price: p.price_float })), shippings: basket.shippings, payments: basket.payments, countries: basket.countries };
  return { quote: { ...shipping, checkedAt: checkedAt.toISOString(), expiresAt: new Date(checkedAt.getTime() + TTL).toISOString(),
    sourceUrl: `${origin}/pl/basket`, basis: 'retailer_basket_national', destinationScope: 'PL',
    evidenceSha256: createHash('sha256').update(JSON.stringify(evidence)).digest('hex') } };
}

export type CachedBasketQuoter = BasketQuoter & { cached?: (order: DeliveredStoreBasket, postalCode: string) => DeliveryQuoteResult | null };

/** After the request's native I/O deadline, only an already confirmed and
 * unexpired complete-basket quote may contribute to the comparison. */
export function quoteBeforeDeadline(quoter: CachedBasketQuoter, order: DeliveredStoreBasket, postalCode: string, deadline: number, now = Date.now()): Promise<DeliveryQuoteResult> {
  if (now < deadline) return quoter(order, postalCode);
  return Promise.resolve(quoter.cached?.(order, postalCode) ?? { reason: 'quote_timeout' });
}

/** Per-service cache: destination + complete basket + price, never browser
 * cookies or personal details. Cap memory, coalesce duplicate work and reject
 * excess load with a bounded FIFO queue shared by all requests. */
export function createRetailerQuoter(fetchImpl: typeof fetch = fetch): CachedBasketQuoter {
  const pages=createCheckoutPageReader();
  const cache = new Map<string, { until: number; result: Promise<DeliveryQuoteResult>; confirmed?: DeliveryQuoteResult }>();
  const queue = new QuoteQueue();
  const keyFor = (order: DeliveredStoreBasket, postalCode: string) => JSON.stringify([postalCode, order.store, order.materialsGrosze, order.lines.flatMap(l => l.packages.map(p => [p.offerId,p.count,p.unitPriceGrosze])).sort()]);
  const cached = (order: DeliveredStoreBasket, postalCode: string): DeliveryQuoteResult | null => {
    if (!/^\d{2}-\d{3}$/.test(postalCode)) return null;
    const row = cache.get(keyFor(order, postalCode)), now = Date.now();
    return row && row.until > now && row.confirmed && 'quote' in row.confirmed && Date.parse(row.confirmed.quote.expiresAt) > now
      ? row.confirmed : null;
  };
  const quote: BasketQuoter = async (order, postalCode) => {
    if (!/^\d{2}-\d{3}$/.test(postalCode)) return { reason: 'invalid_postal_code' };
    const unsupported = unavailableReason(order.store);
    if (unsupported) return { reason: unsupported };
    const key = keyFor(order, postalCode);
    const cached = cache.get(key); if (cached && cached.until > Date.now()) return cached.result;
    if (cache.size >= 256) cache.delete(cache.keys().next().value!);
    const pending = (async (): Promise<DeliveryQuoteResult> => {
      const release = await queue.acquire();
      if (!release) return { reason:'quote_busy' };
      try {
        if(order.store==='DekoratorMarket')return await quoteDekorator(order,fetchImpl);
        if(order.store==='mŁazienka')return await quoteMlazienka(order,fetchImpl);
        if(order.store==='Integra Bielińscy')return await quoteIntegra(order,fetchImpl);
        if(order.store==='Kronodom')return await quoteKronodom(order,fetchImpl);
        if(order.store==='BMB Technologie')return await quoteBmb(order,fetchImpl);
        if(order.store==='Izosystems')return await quoteIzosystems(order,postalCode,fetchImpl);
        if(order.store==='E-Kowalczyk')return await quoteKowalczyk(order,postalCode,fetchImpl);
        if(order.store==='IRBUD')return await quoteIrbud(order,postalCode,fetchImpl);
        if(order.store==='Pati Art Studio')return await quotePati(order,postalCode,fetchImpl);
        if(order.store==='Budshop24')return await quoteBudshop(order,postalCode,fetchImpl);
        if(order.store==='Centrum Matbud')return await quoteSkyshop(order,fetchImpl);
        if(order.store==='ABUD')return await quoteAbud(order,postalCode,fetchImpl);
        return await (order.store === 'Kronosfera' ? quoteKronosfera(order,fetchImpl) : order.store === 'Folnet' ? quoteFolnet(order,fetchImpl) : order.store === 'Modna Łazienka' ? quoteModna(order,fetchImpl) : order.store === 'HIPPER' ? quoteCertusoft(order,fetchImpl) : order.store === 'Eelektryka' ? quotePrestashop(order,fetchImpl) : order.store === 'TopBoden' ? quoteTopboden(order,fetchImpl) : order.store === 'Sewera' ? quoteSewera(order, postalCode, fetchImpl, pages) : order.store === 'Buduj24' ? quoteBuduj24(order, fetchImpl) : order.store === 'Cezar' ? quoteCezar(order, postalCode, fetchImpl) : quoteShoper(order, fetchImpl));
      } catch (error: unknown) {
        return { reason: error instanceof Error && error.message === 'retailer_out_of_stock' ? 'product_unavailable' : error instanceof Error && ['price_changed','product_unavailable','insufficient_stock','basket_not_confirmed','no_home_delivery','address_required','purchase_rules_changed'].includes(error.message) ? error.message : 'quote_unavailable' };
      } finally { release(); }
    })();
    cache.set(key, { until: Date.now() + TTL, result: pending });
    const result = await pending;
    if (cache.get(key)?.result === pending) {
      if ('quote' in result) {
        // Leave enough time for the other merchant calls before returning a
        // cached quotation. The original native expiry is never extended.
        cache.set(key, { until: Math.min(Date.now() + TTL, Date.parse(result.quote.expiresAt)) - 60_000, result: Promise.resolve(result), confirmed: result });
      } else if (result.reason === 'quote_busy') cache.delete(key);
      else cache.set(key, { until: Date.now() + 30_000, result: Promise.resolve(result) });
    }
    return result;
  };
  return Object.assign(quote, { cached });
}
