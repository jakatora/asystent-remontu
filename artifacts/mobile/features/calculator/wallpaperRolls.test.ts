import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { getRequiredQuantity } from './requirements';
import { upgradeCalculation, projectShopping } from './upgrades';
import { generateShoppingItems } from './shopping';
import { WALLPAPER_ROLLS_MODEL, WALLPAPER_SUPPLIES_MODEL } from './wallpaperAdhesive';
import { wallpaperRollPanels, wallpaperRollPlan, WALLPAPER_ROLL_REFERENCE } from './wallpaperRolls';

const job = getJobById('wallpaper-install')!;
const measures = { wallArea: 7.5, wallpaperRollChoice: 1, wallpaperHeightM: 2.5, wallpaperWidth1M: 3, wallpaperCutAllowanceCm: 10, wallpaperAdhesiveType: 1, wallpaperProtectionTapeMetres: 20 };
const calculate = (patch: Record<string, number> = {}) => calculatorEngine.calculate(job, { ...measures, ...patch });
const paper = (c: ReturnType<typeof calculate>) => c.materials.find(l => l.material.id === 'wallpaper')!;

test('the exact roll and full-height cuts survive JSON serialization and use one allowance, with matching product and metadata', () => {
  const calc = calculate(), line = paper(calc); assert.equal(calc.quantityModel, WALLPAPER_ROLLS_MODEL); assert.equal(line.material.unit, 'szt'); assert.equal(line.rawQuantity, 1); assert.equal(line.packs, 1);
  assert.equal(wallpaperRollPlan(calc.measurements)!.stripCount, 4); assert.equal(wallpaperRollPlan(calc.measurements)!.totalCutLengthMm, 10400);
  const input = toPricingStageInput(calc).materials.find(l => l.material.id === 'wallpaper')!;
  assert.equal(input.material.ean, '4002790333357'); assert.equal(input.quantity, 1); assert.equal(input.plainWallpaper!.panels[0].heightMm, 2500); assert.equal(input.plainWallpaper!.panels[0].allowanceMm, 100);
  const ref = getMaterialsForJob(job.id, 'standard', calc.measurements).find(r => r.id === WALLPAPER_ROLL_REFERENCE)!; assert.ok(ref); assert.equal(resolveMaterialQuantity(ref, calc)!.quantity, 1);
  const revived = JSON.parse(JSON.stringify(calc)); revived.materials.find((l: any) => l.material.id === 'wallpaper').rawQuantity = undefined;
  assert.equal(getRequiredQuantity(paper(revived), revived), 1);
});

test('each wall gets full-width strips; missing geometry, wrong model and insufficient gross wall area remain unknown', () => {
  const separate = calculate({ wallArea: 1.5, wallpaperWidth1M: 0.3, wallpaperWidth2M: 0.3 });
  assert.equal(wallpaperRollPlan(separate.measurements)!.stripCount, 2);
  const invalid: Record<string, number>[] = [{ wallpaperRollChoice: 0 }, { wallpaperHeightM: 0 }, { wallpaperWidth1M: 0 }, { wallpaperWidth1M: NaN }, { wallArea: 8 }, { wallpaperCutAllowanceCm: 4 }];
  for (const patch of invalid) {
    const calc = calculate(patch); assert.equal(wallpaperRollPanels(calc.measurements), null); assert.equal(paper(calc).quantityKnown, false);
    const input = toPricingStageInput(calc).materials.find(l => l.material.id === 'wallpaper')!; assert.equal(input.material.category, null); assert.equal(input.material.unit, 'pozycja'); assert.equal(input.plainWallpaper, undefined);
  }
  const mismatch = calculate({ wallpaperAdhesiveType: 4 }); assert.equal(mismatch.materials.find(l => l.material.id === 'wallpaper-glue')!.quantityKnown, false);
});

test('historical area allowances and old ownership cannot become rolls of a different product', () => {
  const calc = calculate(), old = { ...structuredClone(calc), quantityModel: WALLPAPER_SUPPLIES_MODEL, materials: calc.materials.map(l => l.material.id === 'wallpaper' ? { ...l, material: { ...l.material, unit: 'm²', name: 'Tapeta (rolki)' }, rawQuantity: 8.625, quantity: 10.66 } : structuredClone(l)) };
  const saved = JSON.stringify(old), reviewed = upgradeCalculation(old)!; assert.equal(JSON.stringify(old), saved); assert.equal(paper(reviewed).quantityKnown, false);
  assert.equal(reviewed.materials.find(l => l.material.id === 'wallpaper-glue')!.quantityKnown, true); assert.equal(reviewed.materials.find(l => l.material.id === 'masking-tape-wallpaper')!.quantityKnown, true);
  const owned = generateShoppingItems('qa', calc).filter(i => i.materialId === 'wallpaper').map(i => ({ ...i, id: 'qa-roll', owned: true }));
  assert.equal(projectShopping(owned, calc)[0].owned, true); assert.equal(projectShopping(owned.map(i => ({ ...i, unit: 'm²' })), calc)[0].owned, false);
  const pending = projectShopping(owned.map(i => ({ ...i, name: 'Different wallpaper' })), calc); assert.equal(pending[0].needsQuantityConfirmation, true); assert.equal(projectShopping(pending, calc)[0].needsQuantityConfirmation, true);
});
