import assert from 'node:assert/strict';
import { test } from 'node:test';
import { displayProductName } from './productDisplay';

test('basket shows the exact reviewed model instead of an awkward merchant title', () => {
  const slim = displayProductName({ id: 'remont-5902115712524', name: 'Cersanit Carina deska wc slim antybakteryjna,wolnoopadająca,łatwe wypinanie,duroplastowa' });
  assert.equal(slim, 'Cersanit Carina SLIM K98-0135 — deska wolnoopadająca 35,7 × 44,8 cm');
  assert.notEqual(displayProductName({ id: 'remont-5907720651077', name: 'Carina' }), slim);
  assert.equal(displayProductName({ id: 'remont-sku-irbud-10911', name: 'Profil CD60' }), 'Profil CD60');
  assert.equal(displayProductName({ id: 'remont-0000000000000', name: 'Nieznany model' }), 'Nieznany model');
});
