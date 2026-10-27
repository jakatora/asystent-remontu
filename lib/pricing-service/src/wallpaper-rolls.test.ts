import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planPlainWallpaperCuts, planPlainWallpaperPanels } from './wallpaper-rolls';

const spec = { widthMm: 750, lengthMm: 25000 };
test('whole-width strips include trimming and reuse the same physical roll across two walls', () => {
  const a = { id: 'salon', widthMm: 3000, heightMm: 2500, allowanceMm: 100 }, b = { ...a, id: 'sypialnia' };
  const single = planPlainWallpaperPanels([a], spec)!, combined = planPlainWallpaperPanels([a, b], spec)!;
  assert.equal(single.rollsNeeded, 1); assert.equal(combined.rollsNeeded, 1); assert.equal(combined.stripCount, 8);
  assert.equal(combined.totalCutLengthMm, 20800); assert.equal(combined.totalUnusedLengthMm, 4200); assert.equal(combined.optimal, true);
  assert.deepEqual({ ...combined.stripsByPanel }, { salon: 4, sypialnia: 4 });
  assert.equal(planPlainWallpaperPanels([{ ...a, widthMm: 3001 }], spec)!.stripCount, 5);
});

test('area-only rounding cannot replace full-height strip capacity at the roll boundary', () => {
  const plan = planPlainWallpaperPanels([{ id: 'tall', widthMm: 5250, heightMm: 6900, allowanceMm: 100 }], spec)!;
  assert.equal(plan.stripCount, 7); assert.equal(plan.totalCutLengthMm, 49000); assert.equal(plan.rollsNeeded, 3);
  assert.deepEqual(plan.rolls.map(roll => roll.strips.length), [3, 3, 1]); assert.equal(plan.optimal, true);
  assert.ok(plan.rolls.every(roll => roll.usedMm <= 25000 && roll.usedMm + roll.remainingMm === 25000));
});

test('mixed heights can beat greedy packing, with a real two-roll cut list and an exact proof', () => {
  const lengths = [15000, 12500, 7500, 5000, 5000, 5000];
  const plan = planPlainWallpaperCuts(lengths.map((lengthMm, i) => ({ id: String(i), lengthMm, count: 1 })), 25000)!;
  assert.equal(plan.rollsNeeded, 2); assert.equal(plan.optimal, true); assert.equal(plan.searchLimited, false);
  assert.deepEqual(plan.rolls.map(roll => roll.usedMm), [25000, 25000]);
  assert.deepEqual(plan.rolls.flatMap(roll => roll.strips.map(strip => strip.lengthMm)).sort((a, b) => a - b), lengths.slice().sort((a, b) => a - b));
});

test('invalid and oversized cuts are unknown; bounded difficult inputs retain a feasible plan without claiming a minimum', () => {
  for (const bad of [NaN, Infinity, 0, -1, 25001, 1.1]) assert.equal(planPlainWallpaperCuts([{ id: 'x', lengthMm: bad, count: 1 }], 25000), null);
  assert.equal(planPlainWallpaperCuts([{ id: 'x', lengthMm: 1000, count: 2001 }], 25000), null);
  assert.equal(planPlainWallpaperPanels([{ id: 'x', widthMm: 0, heightMm: 2500, allowanceMm: 100 }], spec), null);
  const groups = Array.from({ length: 12 }, (_, i) => ({ id: String(i), lengthMm: 7001 + i, count: 20 }));
  const plan = planPlainWallpaperCuts(groups, 25000)!;
  assert.equal(plan.optimal, false); assert.equal(plan.searchLimited, true); assert.equal(plan.stripCount, 240);
  assert.ok(plan.rolls.every(roll => roll.usedMm <= 25000));
  assert.equal(plan.rolls.reduce((n, roll) => n + roll.strips.length, 0), 240);
});
