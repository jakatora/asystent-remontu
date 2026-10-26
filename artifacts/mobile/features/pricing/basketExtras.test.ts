import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { additionalMaterial, extraMaterial, parseBasketExtras, parseExtraQuantity, withBasketExtras, type BasketExtra } from './basketExtras';

test('additional demand accepts Polish decimal notation without interpreting money, zero or invalid quantities', () => {
  assert.equal(parseExtraQuantity(' 2,5 '), 2.5); assert.equal(parseExtraQuantity('0.000001'), 0.000001); assert.equal(parseExtraQuantity('100000'), 100000);
  for (const raw of ['', '0', '-1', 'NaN', 'Infinity', '1e2', '1,0000001', '100001', '2 kg', '1.2.3']) assert.equal(parseExtraQuantity(raw), null, raw);
});

test('saved extras preserve demand and reject missing references, duplicate IDs and damaged records without dropping lines', () => {
  const catalogue: BasketExtra = { id: 'one', kind: 'catalogue', referenceId: MATERIAL_PRICES[0].id, quantity: 2.5 };
  const custom: BasketExtra = { id: 'two', kind: 'custom', name: 'Dodatkowy materiał', unit: 'kg', quantity: 12 };
  const saved = (items: unknown[], version = 1) => JSON.stringify({ version, items });
  assert.deepEqual(parseBasketExtras(null), []); assert.deepEqual(parseBasketExtras(saved([catalogue, custom])), [catalogue, custom]);
  for (const raw of ['{', saved([catalogue], 2), saved([catalogue, catalogue]), saved([{ ...catalogue, referenceId: 'deleted' }]),
    saved([{ ...custom, quantity: 0 }]), saved([{ ...custom, name: 'bad\nname' }]), saved([{ ...custom, unit: 'unknown' }]), saved([{ ...custom, quantity: '12' }]), saved(new Array(51).fill(custom))]) assert.throws(() => parseBasketExtras(raw));
});

test('every catalogue extra has the exact identity and physical demand, never an old reference price or a guessed substitute', () => {
  for (const ref of MATERIAL_PRICES) {
    const item: BasketExtra = { id: ref.id, kind: 'catalogue', referenceId: ref.id, quantity: ref.packageSize / 2 };
    const line = extraMaterial(item), photo = PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id));
    assert.equal(line.quantity, item.quantity); assert.equal(line.material.name, ref.productLabel); assert.equal(line.material.unit, ref.packageUnit);
    assert.equal(line.material.ean, photo?.ean); assert.equal(line.material.category, ref.materialType);
    assert.deepEqual(Object.keys(line).sort(), ['material', 'quantity']); assert.ok(!('price' in line.material));
  }
});

test('extras form a separate requirement stage, retain fractions for shared pack rounding and keep unknown custom items visible', () => {
  const ref = MATERIAL_PRICES.find(ref => ref.id === 'mat-foam-soudal-low-expansion-750ml') ?? MATERIAL_PRICES.find(ref => /Soudal Low Expansion/.test(ref.productLabel))!;
  const stages = [{ jobId: 'existing', materials: [{ material: { id: 'base', name: 'Original', unit: 'ml' }, quantity: 375 }] }];
  const extras: BasketExtra[] = [{ id: 'a', kind: 'catalogue', referenceId: ref.id, quantity: 375 }, { id: 'b', kind: 'custom', name: 'Materiał bez oferty', quantity: 1.2, unit: 'm2' }];
  const before = JSON.stringify({ stages, extras }), all = withBasketExtras(stages, extras);
  assert.equal(all.length, 2); assert.equal(all[1].jobId, 'additional-materials'); assert.equal(all[1].materials[0].quantity, 375);
  assert.deepEqual(all[1].materials[1], { material: { id: 'extra:b', name: 'Materiał bez oferty', unit: 'm2', category: null }, quantity: 1.2 });
  assert.equal(JSON.stringify({ stages, extras }), before); assert.deepEqual(withBasketExtras(stages, []), stages);
});

test('a manually named known product gets an exact barcode; a generic name, another pack or different unit remains unresolved', () => {
  const ref = MATERIAL_PRICES.find(ref => /Soudal Low Expansion/.test(ref.productLabel))!;
  const line = additionalMaterial('manual:one', ref.productLabel, 'ml', 750);
  assert.equal(line.material.ean, '5411183048522'); assert.equal(line.material.category, 'foam'); assert.equal(line.quantity, 750);
  for (const [name, unit] of [[ref.productLabel, 'l'], [ref.productLabel.replace('750', '500'), 'ml'], ['pianka Soudal', 'ml'], [`${ref.productLabel} — ilość do ustalenia`, 'pozycja']]) {
    const unmatched = additionalMaterial('manual:one', name, unit, 1);
    assert.equal(unmatched.material.ean, undefined); assert.equal(unmatched.material.category, null);
  }
});
