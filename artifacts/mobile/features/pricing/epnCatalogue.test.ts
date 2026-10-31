import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS, getProductPhoto } from '@/data/products/photos';
import { extraMaterial, searchBasketExtraReferences, withBasketExtras } from './basketExtras';

test('EPN singles and spacers retain their exact SKU, piece demand and different functions', () => {
  const rows = [['pk60-pro-0285-01', '5901752632141', 'flush-box'], ['spacer-60x12-screws', '5901752638945', 'electrical-box-spacer'], ['spacer-60x24-screws', '5901752638952', 'electrical-box-spacer'], ['pk60-lux-0206-51', '5907569154098', 'flush-box']];
  const extras = rows.map(([suffix, ean, category], i) => {
    const found = searchBasketExtraReferences(ean);
    assert.equal(found.length, 1);
    const ref = found[0];
    assert.equal(ref.id, 'mat-epn-' + suffix);
    assert.equal(ref.materialType, category);
    assert.equal(ref.packageSize, 1, 'Factory cartons of 50/60 are not the retailer sale unit');
    assert.equal(ref.packageUnit, 'szt');
    assert.ok(getProductPhoto(ref)?.startsWith('https://hipper.pl/api/attachment/'));
    return { id: 'epn-test-' + i, kind: 'catalogue' as const, referenceId: ref.id, quantity: i + 2 };
  });
  const stage = withBasketExtras([], extras)[0];
  stage.materials.forEach((line, i) => {
    assert.equal(line.material.ean, rows[i][1]);
    assert.equal(line.quantity, i + 2);
    assert.equal(extraMaterial(extras[i]).quantity, i + 2);
    assert.equal(line.material.unit, 'szt');
  });
  const old = MATERIAL_PRICES.find(r => r.id === 'mat-flush-box-elektroplast-pk60-10')!;
  assert.equal(old.packageSize, 10);
  assert.equal(PRODUCT_PHOTOS.find(p => p.ids.includes(old.id))?.ean, '5901752637337', 'The unavailable ten-pack is not relabelled as singles');
});
