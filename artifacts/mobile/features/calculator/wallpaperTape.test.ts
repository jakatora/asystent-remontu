import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine, computeRawQuantity } from './engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { getRequiredQuantity } from './requirements';
import { upgradeCalculation, projectShopping } from './upgrades';
import { generateShoppingItems } from './shopping';
import { WALLPAPER_ADHESIVE_MODEL, WALLPAPER_ROLLS_MODEL } from './wallpaperAdhesive';
import { wallpaperTapeQuantity, WALLPAPER_TAPE_ID, WALLPAPER_TAPE_REFERENCE, WALLPAPER_TAPE_EAN } from './wallpaperTape';

const job = getJobById('wallpaper-install')!;
const calculate = (length?: number, area = 10) => calculatorEngine.calculate(job, { wallArea: area, wallpaperAdhesiveType: 1, ...(length === undefined ? {} : { wallpaperProtectionTapeMetres: length }) });
const tape = (calc: ReturnType<typeof calculate>) => calc.materials.find(line => line.material.id === WALLPAPER_TAPE_ID)!;

test('wallpaper protection tape uses measured metres and the exact50m product, never the wall-area roll formula', () => {
  for (const length of [0.1, 20, 50, 50.1, 1000]) {
    const calc = calculate(length), line = tape(calc);
    assert.equal(calc.quantityModel, WALLPAPER_ROLLS_MODEL); assert.equal(line.rawQuantity, length); assert.equal(line.packs, Math.ceil(length / 50)); assert.equal(line.quantityKnown, true); assert.equal(line.material.unit, 'mb');
    assert.equal('shopPrices' in line.material ? line.material.shopPrices : undefined, undefined);
    assert.equal(tape(calculate(length, 100)).rawQuantity, length);
    assert.equal(computeRawQuantity(line.material, calc.measurements), length);
    const input = toPricingStageInput(calc).materials.find(m => m.material.id === WALLPAPER_TAPE_ID)!;
    assert.equal(input.quantity, length); assert.equal(input.material.ean, WALLPAPER_TAPE_EAN); assert.equal(input.material.unit, 'mb');
    const ref = getMaterialsForJob(job.id, 'standard', calc.measurements).find(ref => ref.id === WALLPAPER_TAPE_REFERENCE)!;
    assert.ok(ref); assert.equal(resolveMaterialQuantity(ref, calc)!.quantity, length);
    const saved = JSON.parse(JSON.stringify(calc)); saved.materials.find((l: any) => l.material.id === WALLPAPER_TAPE_ID).rawQuantity = undefined;
    assert.equal(getRequiredQuantity(tape(saved), saved), length);
  }
  assert.equal(calculatorEngine.calculateDetailed(job, calculate(20).measurements).materials.find(m => m.material.id === WALLPAPER_TAPE_ID)!.rawQuantity, 20);
});

test('missing and invalid lengths stay incomplete; explicit zero removes the unneeded purchase instead of buying default rolls', () => {
  for (const length of [undefined, -1, NaN, Infinity, 1001]) {
    const calc = calculate(length); assert.equal(wallpaperTapeQuantity(calc.measurements), null); assert.equal(tape(calc).quantityKnown, false);
    const input = toPricingStageInput(calc).materials.find(m => m.material.id === WALLPAPER_TAPE_ID)!;
    assert.equal(input.material.category, null); assert.equal(input.material.unit, 'pozycja'); assert.match(input.material.name, /ilość do ustalenia/);
    assert.match(calc.warnings.map(w => w.message).join(' '), /Niepełna wycena taśmy/);
  }
  const zero = calculate(0); assert.equal(tape(zero).quantityKnown, true); assert.equal(tape(zero).cost, 0);
  assert.ok(!toPricingStageInput(zero).materials.some(m => m.material.id === WALLPAPER_TAPE_ID));
});

test('old roll ownership cannot cover new metres; valid prior glue and primer stay valid and historical JSON remains untouched', () => {
  const current = calculate(20), old = { ...structuredClone(current), quantityModel: WALLPAPER_ADHESIVE_MODEL, materials: current.materials.map(line => line.material.id === WALLPAPER_TAPE_ID ? { ...line, material: { ...line.material, unit: 'rolka' }, quantity: 3, rawQuantity: 3 } : structuredClone(line)) };
  const snapshot = JSON.stringify(old), reviewed = upgradeCalculation(old)!;
  assert.equal(JSON.stringify(old), snapshot); assert.equal(tape(reviewed).quantityKnown, false); assert.deepEqual(upgradeCalculation(reviewed), reviewed);
  assert.equal(reviewed.materials.find(l => l.material.id === 'wallpaper-glue')!.quantityKnown, true);
  assert.equal(reviewed.materials.find(l => l.material.id === 'primer-wallpaper')!.quantityKnown, true);
  const owned = generateShoppingItems('qa', current).filter(item => item.materialId === WALLPAPER_TAPE_ID).map(item => ({ ...item, id: 'qa-tape', owned: true }));
  assert.equal(projectShopping(owned, current)[0].owned, true);
  assert.equal(projectShopping(owned, calculate(60))[0].owned, false);
  assert.equal(projectShopping(owned.map(item => ({ ...item, unit: 'rolka' })), current)[0].needsQuantityConfirmation, true);
  assert.equal(projectShopping(projectShopping(owned.map(item => ({ ...item, unit: 'rolka' })), current), current)[0].needsQuantityConfirmation, true);
  const glue = generateShoppingItems('qa', current).filter(item => item.materialId === 'wallpaper-glue').map(item => ({ ...item, id: 'qa-glue', unit: 'kg', owned: true }));
  assert.equal(projectShopping(glue, current)[0].owned, false); assert.equal(projectShopping(glue, current)[0].needsQuantityConfirmation, true);
  assert.equal(projectShopping(owned, old)[0].owned, false);
  assert.deepEqual(projectShopping(owned, calculate(0)), []);
});
