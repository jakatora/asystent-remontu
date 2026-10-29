import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateMaterials } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { CABINET_JOB } from '@/features/calculator/cabinetPainting';
import { generateShoppingItems } from '@/features/calculator/shopping';
import type { Project, ShoppingItem } from '@/types/domain';
import { cabinetPreparationKits, cabinetCalculationKey, deliveredCabinetPreparation, projectWithCabinetPreparation } from './cabinetPreparationKits';
import { buildRenovationBasket } from './renovationBasket';
import { deliveredKitRecheckAt } from './deliveredKit';
import type { SerializedProject } from './pricingApi';
import fixture from './fixtures/cabinet-preparation-delivered.json';

const measurements = { cabinetSurface: 1, cabinetPaintPack: 3, cabinetArea: 10, cabinetCoats: 2, cabinetCoverage: 12, cabinetReservePercent: 10, cabinetPreparation: 2, cabinetP240Sheets: 4, cabinetSolventBottles: 1 };
const calc = (patch: Record<string, number> = {}) => calculateMaterials(getJobById(CABINET_JOB)!, { ...measurements, ...patch });
const settings = { mode: 'shipping' as const, postalCode: '00-001', allowSeparateOrders: true };
const actual = (name: string) => structuredClone(fixture.cases.find(c => c.name === name)!.data) as unknown as SerializedProject;
const project = (): Project => ({ id: 'c86', name: 'Fronty', roomName: 'Kuchnia', jobId: CABINET_JOB, jobName: 'Fronty', categoryId: 'kitchen-tiles', measurements, calculationResult: calc(), status: 'planning', createdAt: '', updatedAt: '' });

test('two preparation previews preserve the real paint demand, sheet and bottle counts without changing the saved calculation', () => {
  const c = calc(), before = JSON.stringify(c);
  for (const tier of ['economy', 'standard', 'better'] as const) {
    const kits = cabinetPreparationKits(c, 'c86', [], tier);
    assert.equal(kits.length, 2);
    assert.deepEqual(kits.map(k => k.product.id), ['mat-extraction-solvent-anser-500ml', 'mat-extraction-solvent-chem-rozlew-500ml']);
    for (const k of kits) {
      assert.equal(k.calculation.measurements.cabinetArea, 10);
      assert.deepEqual(k.stages[0].materials.map(l => l.quantity), [1833.33333333, 4, 500]);
      assert.equal(k.stages[0].materials[0].material.packageFamily, 'v33-easy-kitchen-white-satin-v1');
    }
  }
  assert.equal(JSON.stringify(c), before);
  const two = cabinetPreparationKits(calc({ cabinetSolventBottles: 2, cabinetPaintPack: 1 }), 'c86');
  assert.ok(two.every(k => k.stages[0].materials[0].material.ean === '3153895149044' && k.stages[0].materials[2].quantity === 1000));
});
test('unknown preparation, owned-only supplies, invalid bottle count, old model and unsupported fronts cannot produce assumed full kits', () => {
  for (const patch of [{ cabinetPreparation: 0 }, { cabinetPreparation: 1 }, { cabinetPreparation: 4 }, { cabinetSolventBottles: 0 }, { cabinetSolventBottles: 1.5 }, { cabinetSurface: 0 }, { cabinetArea: NaN }, { cabinetPaintPack: 0 }] as Record<string, number>[]) assert.deepEqual(cabinetPreparationKits(calc(patch), 'c86'), [], JSON.stringify(patch));
  assert.deepEqual(cabinetPreparationKits({ ...calc(), quantityModel: undefined }, 'c86'), []);
  assert.deepEqual(cabinetPreparationKits(undefined, 'c86'), []);
});
test('previews respect owned exact products, reinclude the other brand and retain manual shopping requirements', () => {
  const c = calc(), items = generateShoppingItems('c86', c).map((i, n) => ({ ...i, id: String(n), owned: true, purchased: false })) as ShoppingItem[];
  const before = JSON.stringify(items), kits = cabinetPreparationKits(c, 'c86', items);
  assert.equal(kits[0].stages[0].materials.length, 0);
  assert.equal(kits[1].stages[0].materials.length, 1);
  assert.equal(kits[1].stages[0].materials[0].material.ean, '5906681230253');
  assert.equal(JSON.stringify(items), before);
  const manual = { id: 'extra', projectId: 'c86', materialId: 'manual-extra', name: 'Taśma do kupienia', quantity: 7, unit: 'mb', itemType: 'material', owned: false, purchased: false } as ShoppingItem;
  const withExtra = cabinetPreparationKits(c, 'c86', [...items, manual]);
  assert.ok(withExtra.every(k => k.stages[0].materials.some(l => l.material.id === 'manual:extra' && l.quantity === 7)));
});
test('one explicit saved brand updates both project measurements and renovation basket without losing other project data', () => {
  const p = project(), before = JSON.stringify(p), kit = cabinetPreparationKits(p.calculationResult, p.id)[1];
  const selected = projectWithCabinetPreparation(p, kit)!;
  assert.equal(JSON.stringify(p), before); assert.equal(selected.name, p.name); assert.equal(selected.roomName, p.roomName);
  assert.equal(selected.measurements.cabinetPreparation, 3); assert.equal(selected.calculationResult!.measurements.cabinetPreparation, 3);
  assert.equal(selected.measurements.cabinetArea, 10);
  const saved = JSON.parse(JSON.stringify(selected)) as Project;
  const basket = buildRenovationBasket([saved], [saved.id], 'standard');
  assert.equal(basket.stages[0].materials.find(l => l.material.id === 'degreaser-cabinet')!.material.ean, '5906681230253');
  assert.equal(projectWithCabinetPreparation({ ...p, id: 'another' }, kit), null);
  assert.equal(projectWithCabinetPreparation({ ...p, calculationResult: calc({ cabinetArea: 15 }) }, kit), null);
  assert.equal(projectWithCabinetPreparation({ ...p, calculationResult: calc({ cabinetSolventBottles: 2 }) }, kit), null);
  assert.equal(projectWithCabinetPreparation(p, { ...kit, preparation: 99 as never }), null);
  assert.equal(cabinetCalculationKey(calc()), cabinetCalculationKey({ ...calc(), measurements: Object.fromEntries(Object.entries(measurements).reverse()) }));
});
test('actual delivered previews retain full material/shipping amounts and the108.09PLN difference rather than unit-price savings', () => {
  const kits = cabinetPreparationKits(calc(), 'c86');
  const old = deliveredCabinetPreparation(kits[0], actual('tenFullAnser'), settings, null, fixture.verificationTime)!;
  const next = deliveredCabinetPreparation(kits[1], actual('tenFullChem'), settings, null, fixture.verificationTime)!;
  assert.equal(old.totalGrosze, 32863); assert.equal(next.totalGrosze, 22054);
  assert.equal(next.materialsGrosze, 19014); assert.equal(next.deliveryGrosze, 3040); assert.equal(old.totalGrosze - next.totalGrosze, 10809);
  assert.equal(next.orders, 2); assert.deepEqual(next.stores, ['Rab-Dom', 'Sewera']);
});
test('a valid quote for the other brand or demand, wrong postcode/store/order policy, expired quote and omitted manual line cannot be selected', () => {
  const kit = cabinetPreparationKits(calc(), 'c86')[1], now = fixture.verificationTime;
  assert.equal(deliveredCabinetPreparation(kit, actual('tenFullAnser'), settings, null, now), null);
  assert.equal(deliveredCabinetPreparation(cabinetPreparationKits(calc({ cabinetArea: 20 }), 'c86')[1], actual('tenFullChem'), settings, null, now), null);
  for (const changed of [{ ...settings, postalCode: '42-209' }, { ...settings, allowSeparateOrders: false }, { mode: 'pickup' as const }]) assert.equal(deliveredCabinetPreparation(kit, actual('tenFullChem'), changed, null, now), null);
  assert.equal(deliveredCabinetPreparation(kit, actual('tenFullChem'), settings, 'Rab-Dom', now), null);
  const expired = actual('tenFullChem'); expired.deliveryComparison!.best!.stores[0].quote!.expiresAt = new Date(now).toISOString();
  assert.equal(deliveredCabinetPreparation(kit, expired, settings, null, now), null);
  const extra = { id: 'unknown', projectId: 'c86', materialId: 'additional', name: 'Dodatkowy produkt', quantity: 1, unit: 'szt', itemType: 'material', owned: false, purchased: false } as ShoppingItem;
  assert.equal(deliveredCabinetPreparation(cabinetPreparationKits(calc(), 'c86', [extra])[1], actual('tenFullChem'), settings, null, now), null);
  const partial = actual('tenFullChem'); partial.stages[0].lines[2].resolved = false;
  assert.equal(deliveredCabinetPreparation(kit, partial, settings, null, now), null);
});

test('a fresh quote ahead of the device clock is rechecked at its actual time while validity remains strict', () => {
  const kit = cabinetPreparationKits(calc(), 'c86')[1], now = fixture.verificationTime, data = actual('tenFullChem');
  data.deliveryComparison!.best!.stores[0].quote!.checkedAt = new Date(now + 30).toISOString();
  assert.equal(deliveredCabinetPreparation(kit, data, settings, null, now), null);
  assert.equal(deliveredKitRecheckAt(data, now), now + 40);
  assert.equal(deliveredCabinetPreparation(kit, data, settings, null, now + 40)?.totalGrosze, 22054);
  assert.equal(deliveredKitRecheckAt(data, now + 40), null);
  data.deliveryComparison!.best!.stores[0].quote!.checkedAt = new Date(now + 60000).toISOString();
  assert.equal(deliveredKitRecheckAt(data, now), null);
  assert.equal(deliveredCabinetPreparation(kit, data, settings, null, now), null);
});
