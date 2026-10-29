import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/sewera-atlas-plus-standard.json';
import { RETAIL_SOURCES, RETAIL_NAME_ALIASES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { PRODUCT_PHOTOS } from '../../mobile/data/products/photos';

const source = RETAIL_SOURCES.find(source => source.id === 'sewera-atlas-plus-standard-25kg')!;

test('standard Atlas Plus has its own exact25kg EAN, gross bag price and product photograph', () => {
  const observation = parseRetailPage(fixture.html, source, new Date(fixture.capturedAt));
  assert.equal(observation.ean, '5905400488579');
  assert.equal(observation.priceGrosze, 6397);
  assert.equal(source.packageSize, 25); assert.equal(source.unit, 'kg'); assert.equal(source.retailUnit, 'SZT');
  assert.equal(source.pickupRequiresConfirmation, true);
  const photo = PRODUCT_PHOTOS.find(photo => photo.ean === observation.ean)!;
  assert.equal(photo.imageUrl, observation.imageUrl); assert.equal(photo.sourceUrl, source.url);
  assert.ok(Object.values(RETAIL_NAME_ALIASES).includes(observation.ean));
  assert.notEqual(source.ean, RETAIL_SOURCES.find(source => source.id === 'castorama-atlas-plus-promo-25kg')!.ean);
});

test('standard Atlas Plus cannot borrow a promotional barcode or become20kg from the25kg primary card', () => {
  assert.throws(() => parseRetailPage(fixture.html.replaceAll('5905400488579', '5905400658866'), source, new Date()));
  assert.throws(() => parseRetailPage(fixture.html, { ...source, packageSize: 20 }, new Date()));
  assert.throws(() => parseRetailPage(fixture.html.replaceAll('25kg', '20kg'), source, new Date()));
});
