import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import fixture from './fixtures/ebardo-foil.json' with { type: 'json' };
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { readRetailSource } from '../src/lib/retail-pages';
import { createRetailerQuoter } from '../src/lib/retailer-delivery';
import { createRemontService } from '../src/shared-backend';
import type { BasketQuoter, DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

test('eBardo binds each 100m² roll to its native whole-piece price, SKU, EAN and dimensions', async () => {
  for (const row of fixture.products) {
    const source = RETAIL_SOURCES.find(s => s.id === row.sourceId)!;
    const read = (product: any) => readRetailSource(source, async () => Response.json(product));
    const observed = await read(row.product);
    assert.equal(observed.priceGrosze, source.productId === 86 ? 16000 : 10500);
    assert.equal(observed.ean, source.ean); assert.equal(source.packageSize, 100);
    assert.notEqual(observed.priceGrosze, Math.round(row.product.price.net.final_float * 100));
    for (const mutate of [(p: any) => p.ean = '0000000000000', (p: any) => p.code = 'unknown', (p: any) => p.unit.name = 'm²', (p: any) => p.unit.floating_point = true, (p: any) => p.name = p.name.replace('2mx50m', '2mx25m'), (p: any) => p.price.gross.final_float++]) {
      const bad = clone(row.product); mutate(bad); await assert.rejects(read(bad));
    }
  }
});

test('eBardo verifies the complete roll and actual prepaid GLS rate without a net price or COD surcharge', async () => {
  const row = fixture.products[0], source = RETAIL_SOURCES.find(s => s.id === row.sourceId)!;
  const order: DeliveredStoreBasket = { store: 'eBardo', materialsGrosze: 16000, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [{ product: { id: source.ean, name: source.name, imageUrl: null }, unit: 'm2', packages: [{ offerId: source.id, store: source.store, url: source.url, packageSize: 100, count: 1, unitPriceGrosze: 16000, lineCostGrosze: 16000 }] }] };
  const posts: unknown[] = [];
  const get = (cart: any = row.cart, product: any = row.product): typeof fetch => async (input, init) => {
    const url = new URL(String(input)); assert.equal(url.origin, 'https://ebardo.pl');
    if (url.pathname === '/webapi/front/pl_PL/products/PLN/86') return Response.json(product);
    assert.equal(url.pathname, '/webapi/front/pl_PL/basket/PLN/');
    if (init?.method === 'POST') { const payload = JSON.parse(String(init.body)); assert.deepEqual(payload, { stock_id: 86, quantity: 1 }); posts.push(payload); return Response.json({}); }
    return Response.json(cart);
  };
  const result = await createRetailerQuoter(get())(order, '00-001'); assert.ok('quote' in result);
  assert.equal(result.quote.costGrosze, 2500); assert.equal(result.quote.destinationScope, 'PL'); assert.match(result.quote.carrier, /GLS/); assert.equal(posts.length, 1);
  const bad = clone(row.cart); bad.products[0].quantity = 2;
  assert.deepEqual(await createRetailerQuoter(get(bad))(order, '00-001'), { reason: 'basket_not_confirmed' });
  const changed = clone(row.product); changed.price.gross.final_float = 161; changed.price.gross.final = '161,00 zł'; posts.length = 0;
  assert.deepEqual(await createRetailerQuoter(get(row.cart, changed))(order, '00-001'), { reason: 'price_changed' }); assert.equal(posts.length, 0);
});

test('actual HTTP can choose a dearer offer with confirmed delivery when the cheapest product store cannot quote', async () => {
  const row = fixture.products[0], source = RETAIL_SOURCES.find(s => s.id === row.sourceId)!, folnet = RETAIL_SOURCES.find(s => s.id === 'folnet-conpar-100m2')!;
  const observed = await readRetailSource(source, async () => Response.json(row.product));
  const basketQuoter: BasketQuoter = async order => order.store === 'Folnet' ? { reason: 'quote_unavailable' } : { quote: { costGrosze: 2500, carrier: 'Kurier GLS', payment: 'Przelew', checkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 600000).toISOString(), sourceUrl: 'https://ebardo.pl/pl/basket', basis: 'retailer_basket_national', destinationScope: 'PL', evidenceSha256: 'a'.repeat(64) } };
  const service = createRemontService({ initialObservations: [observed, { ...observed, sourceId: folnet.id, sourceUrl: folnet.url, priceGrosze: 11950 }], background: false, basketQuoter });
  const app = express(); app.use(express.json()); app.use(service.router); const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const response = await fetch('http://127.0.0.1:' + (server.address() as { port: number }).port + '/pricing/project', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobs: [1,2].map(id => ({ jobId: 'room-' + id, materials: [{ material: { id: 'foil', name: source.name, ean: source.ean, category: source.category, unit: 'm2' }, quantity: 11 }] })), options: { delivery: { mode: 'shipping', postalCode: '00-001' } } }) });
    assert.equal(response.status, 200); const result = await response.json();
    assert.equal(result.consolidated.lines[0].totalQuantity, 22); assert.equal(result.consolidated.lines[0].packagesNeeded, 1);
    assert.equal(result.deliveryComparison.best.materialsGrosze, 16000); assert.equal(result.deliveryComparison.best.deliveryGrosze, 2500); assert.equal(result.deliveryComparison.best.totalGrosze, 18500); assert.equal(result.deliveryComparison.best.stores[0].store, 'eBardo');
  } finally { service.close(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
