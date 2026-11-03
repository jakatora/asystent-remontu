import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getProductPhoto } from '@/data/products/photos';

const castoramaId = 'mat-plaster-gypsum-machine-knauf-mp75-25kg';
const castoramaUrl = 'https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd';

test('the selected EAN takes precedence over a stale ID and shop link', () => {
  const expected = getProductPhoto({ id: 'mat-plaster-knauf-mp75-25kg-55085' });
  assert.ok(expected);
  assert.notEqual(expected, getProductPhoto({ id: castoramaId }));
  assert.equal(getProductPhoto({ id: castoramaId, ean: '5901793355085', sourceUrl: castoramaUrl }), expected);
  assert.equal(getProductPhoto({ id: castoramaId, ean: '0000000000000', sourceUrl: castoramaUrl }), undefined);
});

test('a reviewed merchant SKU resolves its image without a shop link', () => {
  const expected = getProductPhoto({ id: 'mat-profile-cd60-irbud-3m' });
  assert.ok(expected);
  assert.equal(getProductPhoto({ id: 'remont-sku-irbud-10911', sourceUrl: castoramaUrl }), expected);
});
