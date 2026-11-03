import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getProductPhoto } from '@/data/products/photos';
import { calculateMaterials } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { getMaterialPhotoPreviews } from './materialPhotoPreviews';

function repaint() {
  return calculateMaterials(getJobById('repaint-walls')!, { wallArea: 10, coats: 2, coveragePerLiter: 8 });
}

test('a generic repainting line gets the reviewed standard product photo', () => {
  const calc = repaint();
  const paint = calc.materials.find(line => line.material.id === 'paint')!;
  assert.equal(getProductPhoto(paint.material), undefined);
  assert.deepEqual(getMaterialPhotoPreviews(calc).get(paint), {
    uri: getProductPhoto({ id: 'mat-paint-latex-sniezka-barwy-natury-white-5l' }),
    name: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l',
  });
});

test('explicit product codes and unknown quantities do not receive example photos', () => {
  const calc = repaint();
  const paint = calc.materials.find(line => line.material.id === 'paint')!;
  for (const variant of [
    { ...paint, material: { ...paint.material, ean: '5903973000235' } },
    { ...paint, quantityKnown: false },
  ]) {
    assert.equal(getMaterialPhotoPreviews({ ...calc, materials: [variant] }).get(variant), undefined);
  }
});
