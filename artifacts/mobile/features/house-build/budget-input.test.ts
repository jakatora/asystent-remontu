import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseBudgetRange } from './budget-input';

test('building budget keeps decimal amounts and optional bounds', () => {
  assert.deepEqual(parseBudgetRange('1 200,50', '1400.75'), { error: null, amountLow: 1200.50, amountHigh: 1400.75 });
  assert.deepEqual(parseBudgetRange('', '0'), { error: null, amountLow: null, amountHigh: 0 });
  assert.deepEqual(parseBudgetRange('', ''), { error: null, amountLow: null, amountHigh: null });
});

test('building budget rejects reversed ranges and ambiguous amounts', () => {
  assert.deepEqual(parseBudgetRange('1200,50', '1200,49'), { error: 'order' });
  for (const invalid of ['-1', '1,001', '10 zł', 'Infinity', '2 5']) {
    assert.deepEqual(parseBudgetRange('', invalid), { error: 'amount' });
  }
});
