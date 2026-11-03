import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withBasketExtras } from './basketExtras';
import { ALL_JOBS } from '../content/registry';
import { BASKET_TOOL_PREFIX, basketToolPurchases, collectBasketTools, isBasketToolStorageKey, parseBasketToolChoice } from './basketTools';

test('all current tool keys can be included in a portable backup', () => {
  const tools = collectBasketTools(ALL_JOBS.map(job => ({ jobId: job.id, name: job.name })));
  for (const tool of tools) assert.ok(isBasketToolStorageKey(BASKET_TOOL_PREFIX + tool.key), tool.key);
});

test('the same reviewed brush needed for three works contributes one purchase', () => {
  const tools = collectBasketTools([
    { jobId: 'primer-walls', name: 'Gruntowanie' },
    { jobId: 'repaint-walls', name: 'Malowanie' },
    { jobId: 'wall-repair', name: 'Naprawa' },
  ]);
  const brushes = tools.filter(tool => tool.product?.identity.ean === '5904178020035');
  assert.equal(brushes.length, 1);
  const [brush] = brushes;
  assert.deepEqual(brush.projectNames, ['Gruntowanie', 'Malowanie', 'Naprawa']);
  const purchases = basketToolPurchases(tools, { [brush.key]: 'buy' });
  assert.deepEqual(purchases, [{
    material: { id: 'tool:5904178020035', name: brush.name, ean: '5904178020035', category: 'paint-brush', unit: 'szt' },
    quantity: 1,
  }]);
  const stages = withBasketExtras([], [{ id: 'paper', kind: 'custom', name: 'Papier', unit: 'szt', quantity: 2 }], purchases);
  assert.equal(stages.length, 1);
  assert.equal(stages[0].materials.length, 2);
});

test('owned, rented and unspecified models create no priced demand', () => {
  const tools = collectBasketTools([{ jobId: 'repaint-walls', name: 'Ściany' }]);
  const brush = tools.find(tool => tool.product)!;
  const unreviewed = tools.find(tool => !tool.product)!;
  assert.deepEqual(basketToolPurchases(tools, { [brush.key]: 'owned', [unreviewed.key]: 'buy' }), []);
  assert.deepEqual(basketToolPurchases(tools, { [brush.key]: 'rent' }), []);
  assert.deepEqual(basketToolPurchases(tools, {}), []);
  assert.equal(parseBasketToolChoice(null), undefined);
  assert.equal(parseBasketToolChoice('rent'), 'rent');
  assert.throws(() => parseBasketToolChoice('other'), /invalid_basket_tool_choice/);
});


test('wall painting, repainting and ceiling painting share the applicable reviewed tools', () => {
  const tools = collectBasketTools([
    {jobId:'paint-walls',name:'Nowe ściany'},
    {jobId:'repaint-walls',name:'Odświeżanie'},
    {jobId:'paint-ceiling',name:'Sufit'},
  ]);
  const brush = tools.filter(tool => tool.product?.identity.ean === '5904178020035');
  const roller = tools.filter(tool => tool.product?.identity.ean === '5905061052744');
  assert.deepEqual(brush.map(tool => tool.projectNames), [['Nowe ściany','Odświeżanie','Sufit']]);
  assert.deepEqual(roller.map(tool => tool.projectNames), [['Nowe ściany','Odświeżanie']]);
  const purchases = basketToolPurchases(tools, {[brush[0].key]:'buy',[roller[0].key]:'buy'});
  assert.deepEqual(purchases.map(line => [line.material.ean,line.quantity]), [['5905061052744',1],['5904178020035',1]]);
});
