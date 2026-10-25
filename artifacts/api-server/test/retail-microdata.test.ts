import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage, retailPriceIsValid, type RetailSource } from '../src/lib/retail-pages';
import { createRemontService } from '../src/shared-backend';

const source = RETAIL_SOURCES.find(source => source.id === 'sewera-sniezka-5l')!;
const observedAt = new Date('2026-10-25T09:30:00Z');
function microdata(source: RetailSource, price = '98.50', stock = '7') {
  return `<div itemscope itemtype="http://schema.org/Product">
    <h1 itemprop="name">${source.name}</h1><img itemprop="image" src="https://sklep.sewera.pl/photo/test.webp">
    <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
      <meta itemprop="priceCurrency" content="PLN"><meta itemprop="price" content="${price}">
      <span class="priceShowNet">1,00 zł netto / SZT</span><span class="priceShow">${price.replace('.', ',')} zł <small>brutto</small> / SZT</span>
    </div>
    <div><strong>Kod kreskowy:</strong>${source.ean}</div><div><strong>Producent:</strong>${source.brand}</div>
    <div><strong>Dostępne:</strong>${stock} &nbsp;SZT</div></div>`;
}

test('Sewera reads the reviewed product scope and confirms gross price against visible gross label', () => {
  const result = parseRetailPage(microdata(source), source, observedAt);
  assert.equal(result.priceGrosze, 9850); assert.equal(result.ean, source.ean);
  assert.equal(result.observedAt, observedAt.toISOString());
  const film = RETAIL_SOURCES.find(source => source.id === 'sewera-film-20m2')!;
  assert.equal(parseRetailPage(microdata(film, '8.45'), film, observedAt).priceGrosze, 845);
  const tape = RETAIL_SOURCES.find(source => source.id === 'sewera-tape-30mm')!;
  assert.equal(parseRetailPage(microdata(tape, '14.72'), tape, observedAt).priceGrosze, 1472);
});

test('a cheap recommendation, net price or barcode outside the product cannot become the main offer', () => {
  assert.throws(() => parseRetailPage(microdata(source).replace('98,50 zł', '1,00 zł'), source, observedAt), /gross_price_mismatch/);
  assert.throws(() => parseRetailPage(microdata(source).replace('brutto', 'netto'), source, observedAt));
  assert.throws(() => parseRetailPage(microdata(source).replace(source.ean, '0000000000000') + `<div>${source.ean}</div>`, source, observedAt));
  assert.throws(() => parseRetailPage(microdata(source) + microdata(source, '1.00'), source, observedAt), /product_ambiguous/);
  assert.throws(() => parseRetailPage(microdata(source).replace('5l', '10l'), source, observedAt), /variant_mismatch/);
  assert.throws(() => parseRetailPage(microdata(source).replace('>7 &nbsp;SZT', '>zapytaj o dostępność'), source, observedAt), /stock_not_confirmed/);
  assert.throws(() => parseRetailPage(microdata(source, '98.50', '0'), source, observedAt), /out_of_stock/);
});

test('offer expiry uses the Polish calendar for date-only deadlines', () => {
  assert.equal(retailPriceIsValid('2026-10-25', new Date('2026-10-25T22:30:00Z')), true);
  assert.equal(retailPriceIsValid('2026-10-25', new Date('2026-10-25T23:30:00Z')), false);
  assert.equal(retailPriceIsValid('2026-02-30', new Date('2026-02-20T00:00:00Z')), false);
  assert.equal(retailPriceIsValid('2026-10-25T10:00:00Z', new Date('2026-10-25T10:01:00Z')), false);
});

test('confirmed unavailability survives cache reload and a successful new read restores the offer', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'remont-price-cache-'));
  const cachePath = join(dir, 'prices.json');
  const initial = parseRetailPage(microdata(source), source, new Date(Date.now() - 60_000));
  let available = false;
  const fetchImpl: typeof fetch = async url => String(url) === source.url
    ? new Response(microdata(source, '98.50', available ? '7' : '0'), { headers: { 'content-type': 'text/html' } })
    : new Response('blocked', { status: 403 });
  const service = createRemontService({ initialObservations: [initial], cachePath, fetchImpl, background: false });
  try {
    assert.equal(service.status().offers, 1);
    await service.refresh(); assert.equal(service.status().offers, 0);
    assert.equal(JSON.parse(readFileSync(cachePath, 'utf8')).version, 2);
    const restored = createRemontService({ initialObservations: [initial], cachePath, fetchImpl, background: false });
    assert.equal(restored.status().offers, 0);
    available = true; await restored.refresh(); assert.equal(restored.status().offers, 1);
    restored.close();
  } finally { service.close(); unlinkSync(cachePath); rmdirSync(dir); }
});
