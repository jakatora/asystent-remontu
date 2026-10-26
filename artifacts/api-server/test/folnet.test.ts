import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import { folnetPage, folnetPaid, folnetFree, folnetDigital } from './fixtures/folnet';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage, readRetailSource } from '../src/lib/retail-pages';
import { quoteFolnet, selectFolnetHomeRate } from '../src/lib/folnet-delivery';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import { getProductPhoto } from '../../mobile/data/products/photos';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(row => row.id === 'folnet-soudal-low-expansion-winter-750ml')!;
const read = (html = folnetPage) => parseRetailPage(html, source, new Date('2026-10-26T00:00:00Z'));
function order(count = 1): DeliveredStoreBasket {
  return { store: 'Folnet', materialsGrosze: count * 3930, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [{ product: { id: 'remont-' + source.ean, name: source.name, imageUrl: null }, unit: 'ml', packages: [{ offerId: source.id, store: 'Folnet', url: source.url, packageSize: 750, count, unitPriceGrosze: 3930, lineCostGrosze: 3930 * count }] }] };
}
function native(page = folnetPage, shipping?: object) {
  const calls: string[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = new URL(String(input)); assert.equal(url.origin, 'https://folnet.pl');
    calls.push(url.pathname);
    if (url.pathname === new URL(source.url).pathname) {
      assert.ok(!init?.method || init.method === 'GET');
      assert.equal((init?.headers as any)?.Cookie ?? '', '', 'fresh anonymous session');
      return new Response(page, { headers: { 'content-type': 'text/html', 'set-cookie': 'anonymous=isolated; Path=/; Secure' } });
    }
    assert.equal(url.pathname, '/ajax/get-deliveries.php', 'never creates a cart, order or customer');
    assert.equal(url.searchParams.get('mode'), 'productAndBasket');
    const quantity = url.searchParams.get('products[8372][uniw][quantity]');
    assert.deepEqual([...url.searchParams.keys()], ['mode', 'products[8372][uniw][quantity]']);
    assert.equal(init?.method, 'POST'); assert.equal(String(init.body), 'getAjax=true');
    assert.equal((init.headers as any).Cookie, 'anonymous=isolated');
    return new Response(JSON.stringify(shipping ?? (Number(quantity) >= 8 ? folnetFree : folnetPaid)), { headers: { 'content-type': 'application/json' } });
  };
  return { fetchImpl, calls };
}

test('Folnet binds winter foam barcode, native SKU, 750 ml can and actual gross price', async () => {
  const api = native(), result = await readRetailSource(source, api.fetchImpl);
  assert.equal(result.priceGrosze, 3930); assert.equal(result.ean, '5411183048522');
  assert.match(result.imageUrl!, /^https:\/\/folnet.pl\//); assert.equal(api.calls.length, 1);
  assert.equal(source.packageSize, 750); assert.equal(source.unit, 'ml');
  const backup = getProductPhoto({ id: 'remont-' + source.ean, imageUrl: null });
  assert.ok(backup?.includes(source.ean)); assert.match(backup!, /media2.castorama.pl/);
  assert.equal(getProductPhoto({ id: 'remont-' + source.ean, imageUrl: result.imageUrl }), backup);
  assert.equal(getProductPhoto({ id: 'unknown-product', imageUrl: null }), undefined);
});

test('a wrong can, summer barcode, net price, conditional discount or country invalidates the Folnet offer', () => {
  for (const [before, after] of [
    ['"code_producer":"5411183048522"', '"code_producer":"5411183006881"'],
    ['"code_extern":"SOU.112583"', '"code_extern":"SOU.105157"'],
    ['"unit":"szt."', '"unit":"ml"'],
    ['"unit_sellby":"1"', '"unit_sellby":"2"'],
    ['"sum":"17"', '"sum":"0"'],
    ['"basket_enable":"y"', '"basket_enable":"n"'],
    ['"rebate_code_active":"n"', '"rebate_code_active":"y"'],
    ['"order_quantity_range":{}', '"order_quantity_range":{"2":35}'],
    ['"value":"39.30"', '"value":"31.95"'],
    ['750 ml', '500 ml'],
    ['brutto', 'netto'],
    ['country=1143020003', 'country=other'],
    ['id="projector_product_hidden" type="hidden" name="product" value="8372"', 'id="projector_product_hidden" type="hidden" name="product" value="8373"'],
  ]) {
    assert.ok(folnetPage.includes(before), before);
    assert.throws(() => read(folnetPage.replace(before, after)), before);
  }
});

test('Folnet chooses a home courier, excludes the cheaper locker and respects actual free shipping', async () => {
  for (const [count, delivery, total] of [[1, 1399, 5329], [2, 1399, 9259], [8, 0, 31440]]) {
    const api = native(), result = await quoteFolnet(order(count), api.fetchImpl);
    assert.ok('quote' in result); assert.equal(result.quote.costGrosze, delivery);
    assert.equal(order(count).materialsGrosze + result.quote.costGrosze, total);
    assert.equal(result.quote.carrier, 'Kurier GLS'); assert.equal(result.quote.payment, 'Przedpłata');
    assert.equal(result.quote.basis, 'retailer_basket_national'); assert.equal(result.quote.destinationScope, 'PL');
    assert.equal(result.quote.postalCode, undefined); assert.equal(api.calls.length, 2);
  }
});

test('digital zero, missing carrier cost, extra services and an unearned free threshold never become free delivery', () => {
  assert.throws(() => selectFolnetHomeRate(folnetDigital, 3930), /no_home_delivery/);
  assert.throws(() => selectFolnetHomeRate(folnetFree, 3930), /no_home_delivery/);
  const rate = folnetPaid.prepaid.find(row => row.id === '85-1')!;
  for (const changed of [
    { ...rate, cost: undefined }, { ...rate, cost: '0.00', cost_formatted: '0,00 zł', limitfree: '0.00', limitfree_formatted: '0,00 zł' },
    { ...rate, cost_formatted: '11,37 zł' }, { ...rate, additional_services_cost: {} },
    { ...rate, additional_services_cost: { '3': { gross: '10.00' } } },
    { ...rate, minworthreached: 'false' }, { ...rate, pickuppoint: 'y' },
  ]) assert.throws(() => selectFolnetHomeRate({ prepaid: [changed], dvp: [] }, 3930), /no_home_delivery/);
});

test('Folnet stops on changed gross price, insufficient stock, dirty basket and wrong total before requesting delivery', async () => {
  const wrongPrice = order(); wrongPrice.lines[0].packages[0].unitPriceGrosze++;
  const wrongTotal = order(); wrongTotal.materialsGrosze--;
  for (const [basket, page, reason] of [
    [wrongPrice, folnetPage, /price_changed/], [wrongTotal, folnetPage, /basket_not_confirmed/],
    [order(18), folnetPage, /product_unavailable/], [order(), folnetPage.replace('empty_bsket', 'filled_basket'), /basket_not_confirmed/],
  ] as const) {
    const api = native(page); await assert.rejects(quoteFolnet(basket, api.fetchImpl), reason); assert.equal(api.calls.length, 1);
  }
});

test('actual HTTP combines two jobs into one can, ranks the full delivered cost and retains pickup choice', async () => {
  const api = native(), service = createRemontService({ initialObservations: [{ ...read(), observedAt: new Date().toISOString() }], background: false, basketQuoter: createRetailerQuoter(api.fetchImpl) });
  const app = express(); app.use(express.json()); app.use(service.router);
  const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const root = 'http://127.0.0.1:' + (server.address() as { port: number }).port;
    const post = async (quantities: number[], mode = 'shipping', postalCode = '00-001') => {
      const body = { jobs: quantities.map((quantity, i) => ({ jobId: 'room-' + i, materials: [{ material: { id: 'foam', name: source.name, ean: source.ean, unit: 'ml', category: source.category }, quantity }] })), options: { store: 'Folnet', delivery: { mode, postalCode } } };
      const response = await fetch(root + '/pricing/project', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal(response.status, 200); return response.json();
    };
    for (const [quantities, packs, total] of [[[375, 375], 1, 5329], [[1500], 2, 9259], [[6000], 8, 31440]] as const) {
      const result = await post([...quantities]);
      assert.equal(result.consolidated.lines[0].packages[0].count, packs);
      assert.equal(result.deliveryComparison.best.totalGrosze, total);
      assert.equal(result.deliveryComparison.best.stores[0].store, 'Folnet');
    }
    assert.equal((await post([750], 'shipping', '80-001')).deliveryComparison.best.totalGrosze, 5329);
    const pickup = await post([750], 'pickup'); assert.equal(pickup.consolidated.consolidatedTotalGrosze, 3930);
    assert.equal(pickup.stages[0].lines[0].resolved, true);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); service.close(); }
});
