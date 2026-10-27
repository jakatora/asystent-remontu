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
import { wallpaperAdhesiveQuantity, WALLPAPER_ROLLS_MODEL } from './wallpaperAdhesive';

const job = getJobById('wallpaper-install')!;
const calculate = (type: number, area = 10, reserve = 10) => calculatorEngine.calculate(job, { wallArea: area, wallpaperAdhesiveType: type, wallpaperAdhesiveReservePercent: reserve });
const glue = (calc: ReturnType<typeof calculate>) => calc.materials.find(line => line.material.id === 'wallpaper-glue')!;
const glueEan = (calc: ReturnType<typeof calculate>) => { const material = glue(calc).material; return 'ean' in material ? material.ean : undefined; };

test('each wallpaper type uses its actual manufacturer pack and dry-powder coverage, with one explicit reserve', () => {
  for (const [type, area, pack, ean] of [[1, 22, 200, '4015000402019'], [2, 18, 200, '4015000402019'], [3, 50, 125, '4015000095266'], [4, 40, 125, '4015000095266'], [5, 30, 125, '4015000095266']] as const) {
    const calc = calculate(type, area, 0), line = glue(calc);
    assert.equal(calc.quantityModel, WALLPAPER_ROLLS_MODEL); assert.equal(line.material.unit, 'g'); assert.equal(line.rawQuantity, pack); assert.equal(line.packs, 1); assert.equal(glueEan(calc), ean);
    const input = toPricingStageInput(calc).materials.find(row => row.material.id === 'wallpaper-glue')!;
    assert.equal(input.quantity, pack); assert.equal(input.material.unit, 'g'); assert.equal(input.material.ean, ean);
    assert.equal(computeRawQuantity(line.material, calc.measurements), pack);
    const ref = getMaterialsForJob(job.id, 'standard', calc.measurements).find(ref => ref.materialType === 'wallpaper-adhesive')!;
    assert.equal(resolveMaterialQuantity(ref, calc)!.quantity, pack);
    const revived: typeof calc = JSON.parse(JSON.stringify(calc)), restored = { ...revived, materials: revived.materials.map(line => line.material.id === 'wallpaper-glue' ? { ...line, rawQuantity: undefined } : line) };
    assert.equal(getRequiredQuantity(glue(restored), restored), pack);
    assert.equal(glue(calculate(type, area, 10)).rawQuantity, Number((pack * 1.1).toFixed(6)));
  }
  assert.equal(glue(calculate(1)).rawQuantity, 100); assert.equal(glue(calculate(1)).quantity, 200);
  const detailed = calculatorEngine.calculateDetailed(job, calculate(1).measurements);
  assert.equal(detailed.quantityModel, WALLPAPER_ROLLS_MODEL); assert.match(detailed.materials.find(m => m.material.id === 'wallpaper-glue')!.explanation.text, /100 g suchego/);
});

test('unknown, fractional and incompatible type or coverage data remain missing instead of a zero-cost glue', () => {
  const invalid: Record<string, number>[] = [{}, { wallpaperAdhesiveType: 0 }, { wallpaperAdhesiveType: 1.5 }, { wallpaperAdhesiveType: 6 }, { wallpaperAdhesiveType: 1, wallArea: 0 }, { wallpaperAdhesiveType: 1, wallpaperAdhesiveReservePercent: 31 }, { wallpaperAdhesiveType: 1, wallArea: NaN }];
  for (const patch of invalid) {
    const m = { wallArea: 10, ...patch }, calc = calculatorEngine.calculate(job, m);
    assert.equal(wallpaperAdhesiveQuantity(m), null); assert.equal(glue(calc).quantityKnown, false);
    const input = toPricingStageInput(calc).materials.find(row => row.material.id === 'wallpaper-glue')!;
    assert.equal(input.material.category, null); assert.equal(input.material.unit, 'pozycja'); assert.match(input.material.name, /ilość do ustalenia/);
    assert.match(calc.warnings.map(w => w.message).join(' '), /Niepełna wycena kleju/);
  }
});

test('historical kg calculations and owned paper glue cannot silently pay for a different gram-labelled nonwoven product', () => {
  const calc = calculate(1), old = { ...structuredClone(calc), quantityModel: undefined, materials: calc.materials.map(line => line.material.id === 'wallpaper-glue' ? { ...line, material: { ...line.material, unit: 'kg' }, quantity: 0.2, rawQuantity: 0.1 } : structuredClone(line)) };
  const saved = JSON.stringify(old), reviewed = upgradeCalculation(old)!;
  assert.equal(JSON.stringify(old), saved); assert.equal(glue(reviewed).quantityKnown, false); assert.deepEqual(upgradeCalculation(reviewed), reviewed);
  const normal = calculate(4), owned = generateShoppingItems('qa', normal).filter(item => item.materialId === 'wallpaper-glue').map(item => ({ ...item, id: 'qa-glue', owned: true }));
  assert.equal(projectShopping(owned, normal)[0].owned, true);
  const changed = projectShopping(owned, calc)[0]; assert.equal(changed.owned, false); assert.equal(changed.needsQuantityConfirmation, true); assert.match(changed.name, /Direct/);
  const same = projectShopping(generateShoppingItems('qa', calc).filter(item => item.materialId === 'wallpaper-glue').map(item => ({ ...item, id: 'same', owned: true })), calc)[0]; assert.equal(same.owned, true);
});

test('the legacy wallpaper job retains its ID and same explicit adhesive choice without changing its other materials', () => {
  const legacy = getJobById('wallpaper')!, calc = calculatorEngine.calculate(legacy, { wallArea: 10, wallpaperAdhesiveType: 4 });
  assert.equal(calc.jobId, 'wallpaper'); assert.equal(glueEan(calc), '4015000095266'); assert.equal(glue(calc).rawQuantity, 34.375);
  assert.equal(calc.materials.find(line => line.material.id === 'primer-wallpaper')!.quantityKnown, true);
  assert.equal(upgradeCalculation(calc)!.materials.find(line => line.material.id === 'primer-wallpaper')!.quantityKnown, true);
});
