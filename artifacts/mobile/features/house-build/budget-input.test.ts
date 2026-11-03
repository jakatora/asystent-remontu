import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseBudgetRange, parseReferenceOverride } from './budget-input';

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

test('reference overrides preserve cents and validate against the retained reference bound', () => {
  assert.deepEqual(parseReferenceOverride('15,50', '16,51', 10, 20), { error: null, overrideMin: 15.5, overrideMax: 16.51, overrideBaseline: 16.01 });
  assert.deepEqual(parseReferenceOverride('', '12,50', 10, 20), { error: null, overrideMin: null, overrideMax: 12.5, overrideBaseline: null });
  assert.deepEqual(parseReferenceOverride('', '9,50', 10, 20), { error: 'order' });
  assert.deepEqual(parseReferenceOverride('20,01', '', 10, 20), { error: 'order' });
});
