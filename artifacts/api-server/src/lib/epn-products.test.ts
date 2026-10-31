import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixtures from './fixtures/epn-products-wave152.json';
import { RETAIL_SOURCES } from './retail-catalog';
import { parseRetailPage } from './retail-pages';

test('reviewed native EPN cards confirm individual units, exact GTIN and finite stock', () => {
  assert.equal(fixtures.length, 4);
  for (const fixture of fixtures) {
    const source = RETAIL_SOURCES.find(row => row.id === fixture.sourceId)!;
    const observed = parseRetailPage(fixture.html, source, new Date());
    assert.equal(observed.ean, source.ean);
    assert.equal(observed.priceGrosze, fixture.priceGrosze);
    assert.ok(observed.stockPackages! > 0);
    assert.throws(() => parseRetailPage(fixture.html, { ...source, packageSize: 50 }, new Date()), /retailer_unit_not_confirmed/);
    assert.throws(() => parseRetailPage(fixture.html, { ...source, ean: '5901752637337' }, new Date()), /product_ean_not_confirmed/);
  }
});
