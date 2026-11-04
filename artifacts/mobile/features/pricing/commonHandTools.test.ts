import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectBasketTools, basketToolPurchases } from './basketTools';
import { reviewedJobProduct } from './jobProduct';

test('three common hand tools are bought once across nine renovation tasks', () => {
  const projects = ['underlay-install', 'laminate-flooring', 'vinyl-flooring', 'skirting-boards',
    'paint-walls', 'repaint-walls', 'silicone-sealing', 'kitchen-backsplash', 'kitchen-countertop']
    .map(jobId => ({ jobId, name: jobId }));
  const tools = collectBasketTools(projects);
  const expected = [['5905947919611', 4], ['5905061980771', 2], ['5903518042997', 3]] as const;
  const choices: Record<string, 'buy'> = {};
  for (const [ean, count] of expected) {
    const matches = tools.filter(tool => tool.product?.identity.ean === ean);
    assert.equal(matches.length, 1);
    const [tool] = matches;
    assert.equal(tool.projectNames.length, count);
    assert.equal(tool.product?.example, true);
    assert.match(tool.product!.imageUrl!, /^https:\/\/sklep\.sewera\.pl\/photo\//);
    choices[tool.key] = 'buy';
  }
  const purchases = basketToolPurchases(tools, choices);
  assert.equal(purchases.length, 3);
  for (const line of purchases) {
    assert.equal(line.quantity, 1, 'dimensions and wholesale carton sizes are not purchase quantities');
    assert.equal(line.material.unit, 'szt');
  }
  assert.deepEqual(basketToolPurchases(tools, {}), []);
  assert.deepEqual(basketToolPurchases(tools, Object.fromEntries(Object.keys(choices).map(key => [key, 'owned']))), []);
});

test('specific hand tools do not replace combined kits or equipment with different uses', () => {
  for (const item of [
    { id: 'tape-measure', name: 'Miara i ołówek' },
    { id: 'tape-measure', name: 'Dalmierz laserowy' },
    { id: 'caulk-gun', name: 'Pistolet do pianki' },
    { id: 'caulk-gun', name: 'Wyciskacz do mas 600 ml' },
    { id: 'tray', name: 'Kuweta do wałka 50 cm' },
  ]) assert.equal(reviewedJobProduct(item, 'tool'), null);
  assert.equal(reviewedJobProduct({ id: 'tape-measure', name: 'Miara' }, 'material'), null);
});
