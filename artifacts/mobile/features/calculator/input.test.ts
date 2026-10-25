import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDecimal } from '@/shared/lib/number';
import { parseMeasurements } from '@/shared/lib/measurements';
import { paintJob } from '@/data/jobs/paint';

test('Polish and English decimal input retains the fractional part', () => {
  for (const [input, expected] of [['2,5', 2.5], ['0,8', 0.8], ['2.5', 2.5], [' 0,8 ', 0.8], ['1 234,50', 1234.5], ['.5', 0.5], ['0', 0], ['-2,5', -2.5]] as const) {
    assert.equal(parseDecimal(input), expected, input);
  }
});

test('Invalid or partially numeric input is rejected instead of truncated', () => {
  for (const input of ['', ' ', '2m', '2,5,1', '1.2.3', 'Infinity', 'NaN', '2 5', '1e3', '1,234.5']) {
    assert.ok(Number.isNaN(parseDecimal(input)), input);
  }
});

test('measurement forms use decimal commas and retain defaults for cleared optional inputs', () => {
  const { values, errors } = parseMeasurements(paintJob, { wallArea: '40,5', coats: '', coveragePerLiter: '' });
  assert.deepEqual(errors, []);
  assert.deepEqual(values, { wallArea: 40.5, coats: 2, coveragePerLiter: 10, tapeRolls: 1, protectiveFilmPacks: 1 });
});

test('invalid values do not silently become defaults or exceed job constraints', () => {
  for (const input of [{ wallArea: '501' }, { wallArea: '40', coats: '4' }, { wallArea: '40', coats: '1,5' }, { wallArea: '40', coveragePerLiter: 'oops' }, { wallArea: '40', tapeRolls: '1,5' }, { wallArea: '40', protectiveFilmPacks: '-1' }, { wallArea: '0,8' }]) {
    assert.ok(parseMeasurements(paintJob, input).errors.length > 0, JSON.stringify(input));
  }
});
