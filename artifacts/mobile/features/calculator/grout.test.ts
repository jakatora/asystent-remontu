import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groutMassKg } from './grout';
import { calculatorEngine } from './engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';

test('manufacturer geometry uses metres consistently and responds to size, depth and joint width', () => {
  assert.equal(groutMassKg(10, 30, 30, 9, 3, 1650), 2.97);
  assert.equal(groutMassKg(10, 60, 60, 9, 3, 1650), 1.485);
  assert.equal(groutMassKg(10, 30, 30, 9, 6, 1650), 5.94);
  assert.equal(groutMassKg(10, 30, 30, 6, 3, 1650), 1.98);
  assert.equal(groutMassKg(10, 30, 30, 9, 3, 1650, 1.1), 3.267);
  assert.equal(groutMassKg(0, 30, 30, 9, 3, 1650), 0);
});

test('invalid grout geometry cannot turn into a plausible free or fallback material', () => {
  for (const value of [0, -1, NaN, Infinity]) assert.throws(() => groutMassKg(10, value, 30, 9, 3, 1650));
  assert.throws(() => groutMassKg(-1, 30, 30, 9, 3, 1650));
});

test('the calculator and price input keep unrounded grout demand and repair old saved raw quantities without changing saved measurements', () => {
  const result = calculatorEngine.calculate(getJobById('floor-tiles')!, { floorArea: 10, tileWidthCm: 30, tileHeightCm: 30, groutWidthMm: 3 });
  assert.equal(result.materials.find(row => row.material.id === 'grout')!.rawQuantity, 3.267);
  const saved = JSON.parse(JSON.stringify(result)); saved.materials.find((row: any) => row.material.id === 'grout').rawQuantity = 5.5;
  const before = JSON.stringify(saved);
  assert.equal(toPricingStageInput(saved).materials.find(row => row.material.id === 'grout')!.quantity, 3.267);
  assert.equal(JSON.stringify(saved), before);
});
