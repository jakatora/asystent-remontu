import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/unimet-delivery.json' with { type: 'json' };
import { quoteUnimet } from '../src/lib/unimet-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(s => s.id === 'unimet-corner-mesh-25m')!;
type Row = (typeof fixture.records)[number];
function basket(count = 25): DeliveredStoreBasket {
  return { store: 'Unimet', materialsGrosze: count * 635, deliveryGrosze: null, deliveryMinimumGrosze: 0,
    totalGrosze: null, source: 'unknown', lines: [{ product: { id: 'remont-' + source.ean, name: source.name }, unit: 'mb',
      packages: [{ offerId: source.id, store: source.store, url: source.url, packageSize: 2.5,
        minimumPackages: 25, count, unitPriceGrosze: 635, lineCostGrosze: count * 635 }] }] };
}
function replay(context: string, mutate?: (response: any, record: Row) => any) {
  const rows = fixture.records.filter(r => r.context === context); let cursor = 0;
  const fetcher: typeof fetch = async (input, init) => {
    const u = new URL(String(input)), row = rows[cursor++]; assert.ok(row);
    assert.equal(u.origin, row.origin); assert.equal(u.pathname + u.search, row.path);
    assert.equal(init?.method ?? 'GET', row.method);
    const body = new URLSearchParams(init?.body ? String(init.body) : '');
    assert.deepEqual([...body].sort(), [...new URLSearchParams(row.body ?? '')].sort());
    assert.equal(new Headers(init?.headers).has('authorization'), false);
    const value = structuredClone(row.response), response = mutate ? mutate(value, row) : value;
    return new Response(typeof response === 'string' ? response : JSON.stringify(response), {
      status: row.status, headers: row.location ? { location: row.location } : {},
    });
  };
  return { fetcher, complete: () => assert.equal(cursor, rows.length) };
}

test('real Unimet oversized-goods carts bind 25 and 26 strips, both submitted postcodes, gross shipping and transfer amount', async () => {
  for (const [count, postcode, total] of [[25, '30-001', 24977], [26, '00-001', 25612]] as const) {
    const server = replay(`quote:${count}:${postcode}`), result = await quoteUnimet(basket(count), postcode, server.fetcher);
    server.complete(); assert.ok('quote' in result);
    assert.equal(result.quote.costGrosze, 9102); assert.equal(result.quote.postalCode, postcode);
    assert.equal(result.quote.destinationScope, 'postal_code'); assert.equal(result.quote.basis, 'retailer_basket_postcode');
    assert.equal(result.quote.carrier, 'GABARYT'); assert.equal(result.quote.payment, 'Przelew tradycyjny');
    assert.equal(basket(count).materialsGrosze + result.quote.costGrosze, total);
    assert.equal(Date.parse(result.quote.expiresAt) - Date.parse(result.quote.checkedAt), 600000);
    assert.ok(!JSON.stringify(result).includes('b'.repeat(32)));
  }
});

test('a changed product, unit, pack, minimum, count, URL or postcode never starts an anonymous cart', async () => {
  let calls = 0; const forbidden: typeof fetch = async () => { calls++; throw Error('unexpected_http'); };
  for (const patch of [{ count: 1 }, { minimumPackages: 1 }, { packageSize: 62.5 }, { offerId: 'unimet-fixall-290ml' }, { url: 'https://example.com/' }]) {
    const b = basket(); Object.assign(b.lines[0].packages[0], patch);
    await assert.rejects(quoteUnimet(b, '30-001', forbidden), /invalid_basket/);
  }
  const b = basket(); b.lines[0].unit = 'szt'; await assert.rejects(quoteUnimet(b, '30-001', forbidden), /invalid_basket/);
  await assert.rejects(quoteUnimet(basket(), '30001', forbidden), /invalid_basket/);
  assert.equal(calls, 0);
});

test('native quantity, gross price, discount and final payable changes invalidate the entire quote', async () => {
  const mutations: Array<(v: any, r: Row) => any> = [
    (v, r) => { if (r.method === 'POST' && r.path === '/koszyk') v.cart.products[0].quantity--; return v; },
    (v, r) => { if (r.method === 'POST' && r.path === '/koszyk') v.cart.products[0].price = '6,34 zł'; return v; },
    (v, r) => { if (r.method === 'POST' && r.path === '/koszyk') v.cart.discounts.push({ name: 'personal' }); return v; },
    (v, r) => r.path === '/koszyk?action=show' ? v.replaceAll('249.77', '249.78') : v,
    (v, r) => typeof v?.html === 'string' && new URLSearchParams(r.body ?? '').get('method') === 'loadPayment'
      ? { ...v, html: v.html.replace('249,77', '250,77') } : v,
  ];
  for (const mutation of mutations) await assert.rejects(quoteUnimet(basket(), '30-001', replay('quote:25:30-001', mutation).fetcher));
});

test('pickup, COD, unavailable carrier and renamed payment cannot replace the reviewed home prepaid quote', async () => {
  for (const mutate of [
    (v: any, r: Row) => v?.html && new URLSearchParams(r.body ?? '').get('method') === 'loadCarriers' ? { ...v, html: v.html.replaceAll('381,', '387,') } : v,
    (v: any, r: Row) => v?.html && new URLSearchParams(r.body ?? '').get('method') === 'loadCarriers' ? { ...v, html: v.html.replace('GABARYT', 'GABARYT - POBRANIE') } : v,
    (v: any, r: Row) => new URLSearchParams(r.body ?? '').get('method') === 'loadCarriers' ? { ...v, hasError: true } : v,
    (v: any, r: Row) => v?.html && new URLSearchParams(r.body ?? '').get('method') === 'loadPayment' ? { ...v, html: v.html.replace('Przelew tradycyjny', 'Pobranie') } : v,
  ]) await assert.rejects(quoteUnimet(basket(), '30-001', replay('quote:25:30-001', mutate).fetcher));
});

test('transport only exposes fixed anonymous cart and quote actions, without customer fields or payment validation', async () => {
  let calls = 0; const denied: typeof fetch = async () => { calls++; throw Error('unexpected_http'); };
  const shop = new AnonymousShop('https://www.unimet.pl', denied, AbortSignal.timeout(1000));
  const token = 'b'.repeat(32);
  await assert.rejects(shop.unimet('add', { token, count: 1 }), /invalid_cart_action/);
  await assert.rejects(shop.unimet('carriers', { token, postalCode: '30001' }), /invalid_cart_action/);
  await assert.rejects(shop.unimet('cart', { token, email: 'unused' } as any), /invalid_cart_action/);
  for (const action of ['saveAddress', 'saveCustomer', 'submitOrder', 'payment', 'validation']) await assert.rejects(shop.unimet(action as any, { token }), /invalid_cart_action/);
  await assert.rejects(shop.text('/module/ps_checkpayment/validation', { token }), /invalid_cart_route/);
  await assert.rejects(shop.text('/module/supercheckout/pl/index.php?fc=module&module=supercheckout&controller=supercheckout', { method: 'saveAddress', token }), /invalid_cart_route/);
  assert.equal(calls, 0);
  assert.ok(fixture.records.every(r => !/\/(?:validation|order|payment-information)(?:\/|$)/.test(r.path)));
});

test('native transport rejects a redirect outside its reviewed routes before sending a second request', async () => {
  let calls = 0;
  const shop = new AnonymousShop('https://www.unimet.pl', async () => { calls++; return new Response(null, { status: 302, headers: { location: 'https://example.com/' } }); }, AbortSignal.timeout(1000));
  await assert.rejects(shop.text(source.url), /invalid_redirect/); assert.equal(calls, 1);
});
