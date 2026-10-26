import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/abud-fischer-wst140k-2.json';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';

test('real ABUD fixing blister uses its exact barcode, gross pack price and native op. unit', () => {
  const source = RETAIL_SOURCES.find(row => row.id === 'abud-fischer-wst140k-2')!;
  assert.equal(source.ean, '8590369454948'); assert.equal(source.packageSize, 2);
  const read = (html: string) => parseRetailPage(html, source, new Date(fixture.capturedAt));
  const observation = read(fixture.html);
  assert.equal(observation.priceGrosze, 2450); assert.equal(observation.ean, source.ean); assert.ok(observation.imageUrl);
  assert.throws(() => read(fixture.html.replaceAll('8590369454948', '4006209806609')), /ean_not_confirmed/);
  assert.throws(() => read(fixture.html.replaceAll('op.', 'szt.')), /unit_or_gross_not_confirmed/);
  assert.throws(() => read(fixture.html.replace('24,50 zł', '12,25 zł')), /gross_price_mismatch/);
  assert.throws(() => read(fixture.html.replace('2 sztuki', '1 sztuka')), /variant_mismatch|name_mismatch/);
});
