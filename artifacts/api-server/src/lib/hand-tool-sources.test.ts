import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HAND_TOOL_SOURCES } from './hand-tool-sources';
import { RETAIL_SOURCES } from './retail-catalog';
import { parseRetailPage } from './retail-pages';

test('reviewed hand tools parse gross piece prices and reject an older or different barcode', () => {
  const expected = ['5905947919611', '5905061980771', '5903518042997'];
  assert.deepEqual(HAND_TOOL_SOURCES.map(source => source.ean), expected);
  for (const source of HAND_TOOL_SOURCES) {
    assert.equal(RETAIL_SOURCES.filter(row => row.id === source.id).length, 1);
    const card = (ean: string, stock = 3) => `<div itemscope itemtype="https://schema.org/Product"><h1 itemprop="name">${source.name}</h1><div itemprop="offers" itemscope itemtype="https://schema.org/Offer"><meta itemprop="price" content="12.30"><meta itemprop="priceCurrency" content="PLN"><div class="priceShow">12,30 zł brutto / SZT</div></div><div><strong>Kod kreskowy:</strong> ${ean}</div><div><strong>Producent:</strong> ${source.brand}</div><div><strong>Dostępne:</strong> ${stock} SZT</div></div>`;
    const offer = parseRetailPage(card(source.ean!), source, new Date('2026-11-04T04:30:00Z'));
    assert.equal(offer.priceGrosze, 1230);
    assert.equal(source.packageSize, 1);
    assert.equal(source.unit, 'szt');
    assert.equal(offer.imageUrl, source.imageUrl);
    assert.throws(() => parseRetailPage(card('5906365349424'), source, new Date()));
    assert.throws(() => parseRetailPage(card(source.ean!, 0), source, new Date()));
  }
});
