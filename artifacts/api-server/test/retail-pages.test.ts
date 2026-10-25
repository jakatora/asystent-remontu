import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRetailPage, readRetailSource, shoperProductId } from '../src/lib/retail-pages';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';

const source = RETAIL_SOURCES[0];
const now = new Date('2026-10-24T20:00:00Z');
const product = () => ({ '@type': 'Product', name: source.name, gtin13: source.ean,
  offers: { '@type': 'Offer', price: '118.00', priceCurrency: 'PLN', availability: 'https://schema.org/InStock' },
});
const html = (value: unknown) => `<script type="application/ld+json">${JSON.stringify(value)}</script>`;

test('retail page: explicit EAN, PLN price, variant and actual read timestamp', () => {
  const result = parseRetailPage(html(product()), source, now);
  assert.equal(result.priceGrosze, 11800);
  assert.equal(result.observedAt, now.toISOString());
  assert.equal(result.ean, source.ean);
  assert.match(result.evidenceSha256, /^[a-f0-9]{64}$/);
});

test('retail page rejects another EAN, wrong package, currency and availability', () => {
  assert.throws(() => parseRetailPage(html({ ...product(), gtin13: '5903973005797' }), source, now));
  assert.throws(() => parseRetailPage(html({ ...product(), name: source.name.replace('5 l', '10 l') }), source, now));
  assert.throws(() => parseRetailPage(html({ ...product(), offers: { ...product().offers, priceCurrency: 'EUR' } }), source, now));
  assert.throws(() => parseRetailPage(html({ ...product(), offers: { ...product().offers, availability: 'https://schema.org/OutOfStock' } }), source, now));
  assert.throws(() => parseRetailPage(html({ ...product(), offers: { ...product().offers, availableDeliveryMethod: 'https://schema.org/OnSitePickup' } }), source, now));
});

test('retail page rejects aggregate prices, recommendations and ambiguous online prices', () => {
  assert.throws(() => parseRetailPage(html({ ...product(), offers: { '@type': 'AggregateOffer', lowPrice: '1', priceCurrency: 'PLN' } }), source, now));
  assert.throws(() => parseRetailPage('<span>Promocja 1 zł</span>', source, now));
  assert.throws(() => parseRetailPage(html({ ...product(), offers: [product().offers, { ...product().offers, price: '99' }] }), source, now));
});

test('retail fetch stops on a blocked page and never invents a replacement', async () => {
  let calls = 0;
  await assert.rejects(readRetailSource(source, (async () => { calls++; return new Response('blocked', { status: 403 }); }) as typeof fetch), /retailer_http_403/);
  assert.equal(calls, 1);
});

test('Shoper custom URLs use a reviewed ID and reject a different response identity or malformed gross amount', async () => {
  const custom = { ...source, format: 'shoper-api' as const, productId: 123, url: 'https://realbud.com/niestandardowy-adres' };
  assert.equal(shoperProductId(custom), '123');
  assert.throws(() => shoperProductId({ ...custom, productId: -1 }), /invalid_product_id/);
  assert.throws(() => shoperProductId({ ...custom, url: 'https://realbud.com/pl/p/test/124' }), /invalid_product_id/);
  const item = { id: 123, name: source.name, ean: source.ean, can_buy: true, url: custom.url, price: { gross: { final: '118,00 zł', final_float: 118 } } };
  const fetchItem = (value: unknown) => (async (url: unknown) => {
    assert.equal(String(url), 'https://realbud.com/webapi/front/pl_PL/products/PLN/123');
    return new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  assert.equal((await readRetailSource(custom, fetchItem(item))).priceGrosze, 11800);
  await assert.rejects(readRetailSource(custom, fetchItem({ ...item, id: 124 })), /product_id_not_confirmed/);
  await assert.rejects(readRetailSource(custom, fetchItem({ ...item, price: { gross: { final: '118,00 zł', final_float: 95.93 } } })), /gross_price_mismatch/);
});
