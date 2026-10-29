import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { parseMeasurements } from '@/shared/lib/measurements';
import { upgradeCalculation, projectShopping } from './upgrades';
import { generateShoppingItems } from './shopping';
import { applyProjectShopping } from '@/features/pricing/projectShoppingInput';
import { CABINET_JOB, CABINET_MODEL, cabinetQuantity, cabinetInputVisible } from './cabinetPainting';
import type { ShoppingItem } from '@/types/domain';

const job = getJobById(CABINET_JOB)!;
const m = { doorCount: 12, cabinetSurface: 1, cabinetPaintPack: 2, cabinetArea: 10, cabinetCoats: 2, cabinetCoverage: 12, cabinetReservePercent: 10, cabinetP240Sheets: 4, cabinetPreparation: 2, cabinetSolventBottles: 1 };
const calc = (patch: Record<string, number> = {}) => calculatorEngine.calculate(job, { ...m, ...patch });
test('cabinet paint uses measured sides, coats and one reserve; solvents and P240 are independent counts', () => {
  const c = calc(); assert.equal(c.quantityModel, CABINET_MODEL);
  assert.deepEqual(c.materials.map(l => l.rawQuantity), [0, 1833.33333333, 4, 500]);
  assert.deepEqual(c.materials.map(l => l.packs), [undefined, 1, 4, 1]);
  assert.equal(c.totalCost, 193.13); assert.equal(calc({ doorCount: 99 }).materials[1].rawQuantity, c.materials[1].rawQuantity);
  assert.equal(calc({ cabinetArea: 20 }).materials[1].packs, 2);
  assert.equal(calc({ cabinetCoats: 3 }).materials[1].rawQuantity, 2750);
  assert.equal(calc({ cabinetReservePercent: 0 }).materials[3].rawQuantity, 500);
});
test('pack choice is exact and every price tier preserves the EAN, ml and whole cans', () => {
  for (const [choice, ean, packs] of [[1, '3153895149044', 3], [2, '3153895149228', 1]] as const) {
    const c = calc({ cabinetPaintPack: choice });
    assert.equal(c.materials[1].packs, packs);
    for (const tier of ['economy', 'standard', 'better'] as const) {
      const stage = toPricingStageInput(c, tier); assert.equal(stage.materials.length, 3);
      assert.equal(stage.materials[0].material.ean, ean); assert.equal(stage.materials[0].material.unit, 'ml');
      assert.equal(stage.materials[0].quantity, 1833.33333333);
    }
    const ref = getMaterialsForJob(CABINET_JOB, 'standard', c.measurements)[0];
    assert.equal(resolveMaterialQuantity(ref, c)?.quantity, 1833.33333333);
    assert.equal(resolveMaterialQuantity({ ...ref, packageSize: 1000 }, c), null);
  }
});
test('only explicitly reviewed stable substrates omit primer; laminate and owned supplies omit extra purchases', () => {
  const c = calc({ cabinetSurface: 2, cabinetP240Sheets: NaN, cabinetPreparation: 1, cabinetSolventBottles: NaN });
  assert.deepEqual(c.materials.map(l => l.rawQuantity), [0, 1833.33333333, 0, 0]); assert.ok(c.materials.every(l => l.quantityKnown));
  assert.equal(toPricingStageInput(c).materials.length, 1);
  for (const cabinetSurface of [0, -1, 3, NaN]) assert.ok(calc({ cabinetSurface }).materials.every(l => l.quantityKnown === false));
});
test('unknown preparation, surface, real area and invalid counts never become a free complete basket', () => {
  for (const patch of [{ cabinetPreparation: 0 }, { cabinetPaintPack: 0 }, { cabinetArea: NaN }, { cabinetArea: 0 }, { cabinetCoats: 1 }, { cabinetCoats: 2.5 }, { cabinetCoverage: 13 }, { cabinetP240Sheets: 0 }, { cabinetP240Sheets: 1.5 }, { cabinetSolventBottles: 0 }, { cabinetReservePercent: -1 }] as Record<string, number>[]) {
    const c = calc(patch); assert.ok(toPricingStageInput(c).materials.some(l => l.material.unit === 'pozycja'), JSON.stringify(patch));
  }
  assert.equal(cabinetQuantity('cabinet-paint', { doorCount: 12, cabinetPaintPack: 2, cabinetSurface: 1 }), null);
});
test('old cabinet recipes, edited identities and missing required lines require renewed review without mutating snapshots', () => {
  const c = calc(), before = JSON.stringify(c), old = { ...c, quantityModel: undefined };
  assert.ok(upgradeCalculation(old)!.materials.every(l => l.quantityKnown === false)); assert.equal(JSON.stringify(c), before);
  const changed = { ...c, materials: c.materials.map(l => l.material.id === 'cabinet-paint' ? { ...l, material: { ...l.material, ean: '3153895149044' } } : l) };
  assert.equal(toPricingStageInput(changed).materials[0].material.unit, 'pozycja');
  const missing = { ...c, materials: c.materials.filter(l => l.material.id !== 'degreaser-cabinet') };
  assert.ok(toPricingStageInput(missing).materials.some(l => l.material.id === 'degreaser-cabinet' && l.material.unit === 'pozycja'));
});
test('old owned materials cannot hide a changed paint pack, but matching supplies are retained', () => {
  const c = calc(), items = generateShoppingItems('c83', c).map((row, n) => ({ ...row, id: String(n), owned: true, purchased: true })) as ShoppingItem[];
  assert.equal(applyProjectShopping(toPricingStageInput(c), c, 'c83', items).stage.materials.length, 0);
  const changed = calc({ cabinetPaintPack: 1 }), review = projectShopping(items, changed);
  assert.equal(review.find(i => i.materialId === 'cabinet-paint')?.owned, false);
  assert.equal(review.find(i => i.materialId === 'degreaser-cabinet')?.owned, true);
  assert.equal(applyProjectShopping(toPricingStageInput(changed), changed, 'c83', items).stage.materials.length, 1);
  assert.ok(projectShopping(items, { ...c, quantityModel: undefined }).every(i => !i.owned && !i.purchased));
});
test('normal and detailed cabinet calculations agree, preserve all four legacy IDs and skip irrelevant fields', () => {
  const c = calc(), d = calculatorEngine.calculateDetailed(job, m);
  assert.deepEqual(c.materials.map(l => [l.rawQuantity, l.quantity, l.cost]), d.materials.map(l => [l.rawQuantity, l.quantity, l.cost]));
  assert.ok(job.materials.every(l => !('formula' in l))); assert.deepEqual(job.materials.map(l => l.id), ['cabinet-primer', 'cabinet-paint', 'sandpaper-cabinet', 'degreaser-cabinet']);
  assert.equal(cabinetInputVisible(CABINET_JOB, 'cabinetP240Sheets', { cabinetSurface: 2 }), false);
  const raw = Object.fromEntries(Object.entries({ ...m, cabinetSurface: 2, cabinetPreparation: 1 }).map(([k, v]) => [k, String(v)]));
  assert.equal(parseMeasurements(job, { ...raw, cabinetP240Sheets: 'bad', cabinetSolventBottles: 'bad' }).errors.length, 0);
  assert.ok(parseMeasurements(job, { ...raw, cabinetCoats: '1' }).errors.some(e => e.id === 'cabinetCoats'));
});
