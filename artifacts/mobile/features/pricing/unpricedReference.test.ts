import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeProductName } from '../../../../lib/db/src/repositories/helpers';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import type { SerializedLine } from './pricingApi';
import { unpricedReference } from './unpricedReference';

const ref = MATERIAL_PRICES.find(ref => ref.id === 'mat-plaster-gypsum-machine-knauf-mp75-25kg')!;
const line = (): SerializedLine => ({ resolved: false, quantity: 125, unit: 'kg', lineCostGrosze: 0, reason: 'not_found', query: { ean: null, gtin: null, normalizedName: normalizeProductName(ref.productLabel), category: ref.materialType } });

test('an unpriced item keeps the exact known product, image and primary shop link without inventing a price', () => {
  const input = line(), original = JSON.stringify(input), result = unpricedReference(input)!;
  assert.equal(result.id, ref.id); assert.equal(result.name, ref.productLabel); assert.equal(result.ean, '5902367206352');
  assert.equal(result.url, ref.sourceUrl); assert.equal(result.store, 'Castorama'); assert.match(result.imageUrl!, /5902367206352/);
  assert.equal(result.packageSize, 25); assert.equal(result.packageUnit, 'kg');
  assert.ok(!('price' in result) && !('priceGrosze' in result) && !('availability' in result) && !('totalGrosze' in result));
  assert.equal(JSON.stringify(input), original);
});

test('a barcode is exact; a conflicting code, pack size in the name, wrong category or unit cannot link a different product', () => {
  const coded = line(); coded.query.ean = '5902367206352'; coded.query.normalizedName = 'Knauf MP 75';
  assert.equal(unpricedReference(coded)?.id, ref.id);
  for (const mutate of [
    (item: SerializedLine) => item.query.ean = '5902367206369', // MP 75 L, not the base plaster
    (item: SerializedLine) => item.query.gtin = '5902367206369',
    (item: SerializedLine) => item.query.category = 'paint',
    (item: SerializedLine) => item.unit = 'l',
  ]) { const item = line(); mutate(item); assert.equal(unpricedReference(item), null); }
  const differentPack = line(); differentPack.query.normalizedName = normalizeProductName(ref.productLabel.replace('25 kg', '20 kg'));
  assert.equal(unpricedReference(differentPack), null);
  const conflicting = line(); conflicting.query.ean = '5902367206352'; conflicting.query.gtin = '5902367206369'; assert.equal(unpricedReference(conflicting), null);
  const generic = line(); generic.query.normalizedName = 'tynk gipsowy'; assert.equal(unpricedReference(generic), null);
  const unknown = line(); unknown.query.category = null; assert.equal(unpricedReference(unknown), null);
  assert.equal(unpricedReference({ ...line(), resolved: true }), null);
});

test('every catalogue reference can provide an exact primary link without changing basket completeness', () => {
  // Covers every reference, including those that already have active offers but
  // may have no price in the user's selected store. No approximate name search.
  for (const ref of MATERIAL_PRICES) {
    const photo = PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id));
    const item: SerializedLine = { resolved: false, quantity: ref.packageSize, unit: ref.packageUnit, lineCostGrosze: 0, reason: 'no_offer', query: { ean: photo?.ean ?? null, gtin: null, normalizedName: normalizeProductName(ref.productLabel), category: ref.materialType } };
    const found = unpricedReference(item);
    assert.equal(found?.id, ref.id, ref.id);
    assert.equal(item.resolved, false); assert.equal(item.lineCostGrosze, 0); assert.ok(found?.url.startsWith('https://'));
  }
});
