import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/kowalczyk-magento.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource, confirmShoperPurchaseUnit } from '../src/lib/retail-pages';
import { inspectKowalczykCard, quoteKowalczyk } from '../src/lib/kowalczyk-magento';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const sources = fixture.sources.map(row => RETAIL_SOURCES.find(source => source.id === row.id)!);
const clone = <T,>(value: T): T => structuredClone(value);
const cartId = 'a'.repeat(32);
type RecordRow = (typeof fixture.records)[number];
function replay(context: string, mutate?: (response: any, record: RecordRow) => any) {
  const records = fixture.records.filter(row => row.context === context), calls: RecordRow[] = [];
  let cursor = 0;
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), record = records[cursor++];
    assert.ok(record, 'Every request must have an actual captured response');
    assert.equal(url.origin, record.origin); assert.equal(url.pathname + url.search, record.path);
    assert.equal(init?.method ?? 'GET', record.method);
    const body = init?.body ? (() => { try { return JSON.parse(String(init.body)); } catch { return String(init.body); } })() : null;
    assert.deepEqual(body, record.body);
    const headers = new Headers(init?.headers);
    assert.equal(headers.has('authorization'), false); assert.ok(!headers.get('cookie'));
    calls.push(record);
    const response = mutate ? mutate(clone(record.response), record) : clone(record.response);
    return typeof response === 'string' && !record.path.startsWith('/rest/') ? new Response(response, { status: record.status }) : Response.json(response, { status: record.status });
  };
  return { fetcher, calls, assertComplete: () => assert.equal(cursor, records.length) };
}
const prices = [4333, 2187, 1990, 5630];
function basket(indices = [0, 1]): DeliveredStoreBasket {
  return { store: sources[indices[0]].store, materialsGrosze: indices.reduce((sum, index) => sum + prices[index], 0), deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: indices.map(index => ({ product: { id: 'remont-' + sources[index].ean, name: sources[index].name, imageUrl: null }, unit: 'szt', packages: [{ offerId: sources[index].id, store: sources[index].store, url: sources[index].url, count: 1, packageSize: sources[index].packageSize, unitPriceGrosze: prices[index], lineCostGrosze: prices[index] }] })) };
}

test('four current native offers bind the exact EAN and physical cartons, using gross prices and real photographs', async () => {
  for (const [index, source] of sources.entries()) {
    const server = replay('read:' + source.id), observation = await readRetailSource(source, server.fetcher);
    server.assertComplete(); assert.equal(observation.priceGrosze, prices[index]); assert.equal(observation.ean, source.ean);
    assert.equal(source.packageSize, index === 0 || index === 3 ? 1000 : 200);
    assert.ok(observation.imageUrl?.includes(source.ean)); assert.equal(observation.currency, 'PLN');
    assert.ok(!JSON.stringify(observation).includes(cartId));
  }
});

test('E-Kowalczyk recalculates two whole cartons with native courier16.99 gross for each submitted postcode', async () => {
  for (const [context, postcode] of [['quote:kowalczyk-both', '00-001'], ['quote:kowalczyk-both-80', '80-001']]) {
    const server = replay(context), result = await quoteKowalczyk(basket(), postcode, server.fetcher);
    server.assertComplete(); assert.ok('quote' in result);
    assert.equal(result.quote.costGrosze, 1699); assert.equal(result.quote.postalCode, postcode);
    assert.equal(result.quote.basis, 'retailer_basket_postcode'); assert.equal(result.quote.destinationScope, 'postal_code');
    assert.equal(result.quote.payment, 'Przedpłata (przelew tradycyjny)');
    const destination = server.calls.find(row => row.path.endsWith('/estimate-shipping-methods'))!;
    assert.deepEqual(destination.body, { address: { country_id: 'PL', postcode } });
    const final = server.calls.filter(row => row.path.endsWith('/totals-information')).at(-1)!.response as any;
    assert.equal(final.subtotal_incl_tax, 65.2); assert.equal(final.shipping_incl_tax, 16.99); assert.equal(final.grand_total, 82.19);
    assert.ok(!JSON.stringify(result).includes(cartId));
  }
});

test('new Shoper offers distinguish a national16 or27 tariff from a submitted-postcode quotation', async () => {
  for (const [context, index, cost] of [['quote:kim-fx', 2, 1600], ['quote:zpradem-ws', 3, 2700]] as const) {
    const server = replay(context), result = await createRetailerQuoter(server.fetcher)(basket([index]), '00-001');
    server.assertComplete(); assert.ok('quote' in result); assert.equal(result.quote.costGrosze, cost);
    assert.equal(result.quote.destinationScope, 'PL'); assert.equal(result.quote.postalCode, undefined);
  }
});

test('Magento identity rejects changed primary names, product forms, carton sizes and conflicting canonicals', () => {
  for (const source of sources.slice(0, 2)) {
    const card = fixture.records.find(row => row.context === 'read:' + source.id && row.path === new URL(source.url).pathname)!.response as string;
    assert.equal(inspectKowalczykCard(card, source).priceGrosze, prices[sources.indexOf(source)]);
    for (const patch of [{ ean: '5906675303025' }, { packageSize: 1 }, { productId: source.productId! + 1 }, { retailerSku: 'other' }, { brand: 'other' }]) assert.throws(() => inspectKowalczykCard(card, { ...source, ...patch }));
    for (const [from, to] of [[source.ean, '5906675303025'], ['page-title-wrapper', 'related-product-title'], ['product_addtocart_form', 'related_product_form']]) {
      const changed = card.replaceAll(from, to); assert.notEqual(changed, card); assert.throws(() => inspectKowalczykCard(changed, source));
    }
    assert.throws(() => inspectKowalczykCard(card + '<link rel="canonical" href="https://sklep-kowalczyk.pl/other.html">', source));
    assert.throws(() => inspectKowalczykCard(card + '<script>var related={initialFinalPrice: 0.01,};</script>', source), /price_ambiguous/);
  }
});

test('native item, price, VAT, currency, fee, coupon and payment changes cannot produce a confirmed payable quote', async () => {
  const mutations: Array<(v: any, r: RecordRow) => void> = [
    (v, r) => { if (r.method === 'POST' && r.path.endsWith('/items')) v.sku = 'other'; },
    (v, r) => { if (r.method === 'POST' && r.path.endsWith('/items')) v.qty = 2; },
    (v, r) => { if (r.path.endsWith('/totals')) v.items[0].price_incl_tax -= 0.01; },
    (v, r) => { if (r.path.endsWith('/totals')) v.items[0].tax_amount = 0; },
    (v, r) => { if (r.path.endsWith('/totals')) v.quote_currency_code = 'EUR'; },
    (v, r) => { if (r.path.endsWith('/totals')) v.coupon_code = 'AUTO'; },
    (v, r) => { if (r.path.endsWith('/totals')) v.total_segments.push({ code: 'extra_fee', value: 1 }); },
    (v, r) => { if (r.path.endsWith('/totals')) v.items[0].options = '[{"label":"Other pack"}]'; },
    (v, r) => { if (r.path.endsWith('/totals-information')) v.shipping_incl_tax = 0; },
    (v, r) => { if (r.path.endsWith('/totals-information')) v.grand_total -= 1; },
    (v, r) => { if (r.path.endsWith('/totals-information')) v.total_segments.find((s: any) => s.code === 'shipping').title = 'Odbiór osobisty'; },
    (v, r) => { if (r.method === 'GET' && r.path.endsWith('/selected-payment-method')) v.method = 'cashondelivery'; },
  ];
  for (const mutation of mutations) {
    const server = replay('quote:kowalczyk-both', (v, r) => { mutation(v, r); return v; });
    await assert.rejects(quoteKowalczyk(basket(), '00-001', server.fetcher));
  }
  const onlyOtherMethods = replay('quote:kowalczyk-both', (v, r) => r.path.endsWith('/estimate-shipping-methods') ? v.filter((m: any) => m.carrier_code !== 'inpostcourier' || m.method_code !== 'standard') : v);
  await assert.rejects(quoteKowalczyk(basket(), '00-001', onlyOtherMethods.fetcher), /no_home_delivery/);
});

test('new Shoper native sales units cannot silently change200 or1000 fixings into single pieces', () => {
  for (const source of sources.slice(2)) {
    const product = fixture.records.find(row => row.context === 'read:' + source.id && typeof row.response === 'object')!.response as any;
    confirmShoperPurchaseUnit(product, source);
    assert.throws(() => confirmShoperPurchaseUnit(product, { ...source, packageSize: 1 }), /package_not_confirmed/);
    const changed = clone(product); changed.unit.floating_point = true;
    assert.throws(() => confirmShoperPurchaseUnit(changed, source));
  }
});

test('Magento transport allows only isolated reviewed guest-cart actions and blocks redirects into order routes', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return Response.json(cartId); };
  const client = new AnonymousShop('https://sklep-kowalczyk.pl', fetcher, AbortSignal.timeout(1000));
  await client.magento('create'); assert.equal(calls, 1);
  for (const [action, args] of [
    ['create', {}], ['add', { sku: 'other', count: 1 }], ['add', { sku: sources[0].ean, count: 0.5 }],
    ['estimate', { postalCode: '00001' }], ['estimate', { postalCode: '00-001', email: 'not-sent@example.invalid' }],
    ['calculate', { postalCode: '00-001', street: 'not-sent' }], ['payment-information', {}], ['order', {}],
  ] as const) await assert.rejects(client.magento(action as any, args as any), /invalid_cart_action/);
  const foreign = new AnonymousShop('https://example.invalid', fetcher, AbortSignal.timeout(1000));
  await assert.rejects(foreign.magento('create'), /invalid_cart_action/); assert.equal(calls, 1);
  let redirectedCalls = 0;
  const redirected = new AnonymousShop('https://sklep-kowalczyk.pl', async () => { redirectedCalls++; return new Response('', { status: 307, headers: { location: '/rest/V1/guest-carts/' + cartId + '/order' } }); }, AbortSignal.timeout(1000));
  await assert.rejects(redirected.magento('create'), /invalid_cart_redirect/); assert.equal(redirectedCalls, 1);
  const stock = new AnonymousShop('https://sklep-kowalczyk.pl', async () => ++calls === 2 ? Response.json(cartId) : Response.json({ message: 'The requested qty is not available' }, { status: 400 }), AbortSignal.timeout(1000));
  await stock.magento('create'); await assert.rejects(stock.magento('add', { sku: sources[0].ean, count: 2 }), /insufficient_stock/);
});
