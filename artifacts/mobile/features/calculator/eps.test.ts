import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { getJobById } from '@/features/content/registry';
import { epsRequirement, projectEpsShopping, upgradeEpsCalculation, EPS_K20_EAN } from './eps';
import { parseMeasurements } from '@/shared/lib/measurements';
import { generateShoppingItems } from './shopping';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { buildRenovationBasket } from '@/features/pricing/renovationBasket';
import { getProductPhoto } from '@/data/products/photos';
import { buildShareText } from '@/components/project/helpers';
import type { Project, ShoppingItem } from '@/types/domain';

const job = getJobById('eps-insulation-bso')!;
const calc = (wallArea = 30, other: Record<string, number> = {}) => calculatorEngine.calculate(job, { wallArea, ...other });
const project = (id: string, result = calc()): Project => ({ id, name: id, jobId: job.id, jobName: job.name, categoryId: job.categoryId, measurements: result.measurements, calculationResult: result, status: 'planning', createdAt: '', updatedAt: '' });
const oldItem = (change: Partial<ShoppingItem> = {}): ShoppingItem => ({ id: 'old', projectId: 'a', materialId: 'glue-k20', name: 'Klej do styropianu', unit: 'kg', quantity: 1, estimatedPrice: 2.2, owned: true, purchased: false, itemType: 'material', tier: 'standard', createdAt: '', ...change });

test('real EPS calculator scales board and two distinct adhesives with surface area and explicit reserves', () => {
  const result = calc();
  assert.equal(result.materials.find(line => line.material.id === 'eps-board-15cm')!.quantity, 33);
  assert.equal(result.materials.find(line => line.material.id === 'glue-k20')!.quantity, 165);
  assert.equal(result.materials.find(line => line.material.id === 'glue-k50')!.quantity, 115.5);
  assert.equal(result.materials.find(line => line.material.id === 'mesh-145')!.quantity, 34.5);
  assert.equal(result.totalCost, 2406.75);
  assert.equal(result.quantityIssues?.length, 4);
  assert.equal(calc(60).materials.find(line => line.material.id === 'glue-k20')!.quantity, 330);
  assert.equal(epsRequirement('glue-k20', { wallArea: 30.01 }), 165.055);
  assert.equal(epsRequirement('glue-k20', { wallArea: 30, wastePercent: 0, epsAdhesiveRate: 4 }), 120);
});

test('blank design fields remain unknown, while an explicitly entered zero is retained and no litre/kg conversion is invented', () => {
  const parsed = parseMeasurements(job, { wallArea: '30', epsAnchorCount: '0', epsPrimerLitres: '9,5', epsRenderKg: '82,5', epsProfilesLength: '20' });
  assert.equal(parsed.errors.length, 0);
  const result = calculatorEngine.calculate(job, parsed.values);
  assert.equal(result.quantityIssues?.length, 0);
  assert.equal(result.materials.find(line => line.material.id === 'anchors-eps')!.quantity, 0);
  assert.equal(result.materials.find(line => line.material.id === 'primer-ct16')!.quantity, 9.5);
  assert.equal(result.materials.find(line => line.material.id === 'primer-ct16')!.material.unit, 'litr');
  assert.equal(parseMeasurements(job, { wallArea: '30', epsAnchorCount: '1,5' }).errors[0].id, 'epsAnchorCount');
  assert.equal(epsRequirement('anchors-eps', { wallArea: 30, epsAnchorCount: 1.5 }), null);
  for (const invalid of [-1, 51, NaN, Infinity]) assert.equal(epsRequirement('glue-k20', { wallArea: 30, wastePercent: invalid }), null);
});

test('old one-unit JSON calculations are repaired without mutating snapshots or other renovation jobs', () => {
  const old = JSON.parse(JSON.stringify(calc())); old.quantityModel = undefined;
  old.materials.find((line: any) => line.material.id === 'anchors-eps').material.notes = 'Min. 4 szt/m²';
  for (const line of old.materials) { line.rawQuantity = 1; line.quantity = 1; line.cost = line.material.pricePerUnit; }
  old.totalCost = 95.9;
  const copy = structuredClone(old), updated = upgradeEpsCalculation(old)!;
  assert.deepEqual(old, copy); assert.equal(updated.totalCost, 2406.75);
  assert.equal(updated.materials.find(line => line.material.id === 'glue-k20')!.rawQuantity, 165);
  assert.match(updated.materials.find(line => line.material.id === 'anchors-eps')!.material.notes!, /według projektu/);
  const paint = calculatorEngine.calculate(getJobById('paint-walls')!, { wallArea: 40 });
  assert.equal(upgradeEpsCalculation(paint), paint);
});

test('API input binds only the exact K20 barcode and keeps all eight requirements, including unknown quantities', () => {
  const stage = toPricingStageInput(calc());
  assert.equal(stage.materials.length, 8);
  const k20 = stage.materials.find(line => line.material.id === 'glue-k20')!;
  assert.equal(k20.material.ean, EPS_K20_EAN); assert.equal(k20.material.unit, 'kg'); assert.equal(k20.quantity, 165);
  assert.equal(stage.materials.filter(line => line.material.name.endsWith('ilość do ustalenia')).length, 4);
  assert.ok(!stage.materials.find(line => line.material.id === 'glue-k50')!.material.ean);
  assert.match(getProductPhoto(calc().materials.find(line => line.material.id === 'glue-k20')!.material)!, /betterial/);
});

test('detailed EPS output uses the same quantities, missing-data states and calculations as ordinary output', () => {
  const basic = calc(), detailed = calculatorEngine.calculateDetailed(job, { wallArea: 30 });
  assert.equal(detailed.totalCost, basic.totalCost);
  assert.deepEqual(detailed.materials.map(line => [line.rawQuantity, line.quantityKnown]), basic.materials.map(line => [line.rawQuantity, line.quantityKnown]));
  assert.deepEqual(detailed.materials.map(line => line.material), basic.materials.map(line => line.material));
  assert.equal(detailed.quantityIssues?.length, 4);
  assert.match(detailed.materials.find(line => line.material.id === 'profiles-start')!.explanation.text, /Podaj ilość/);
});

test('shopping retains unknown items and custom rows, and old ownership cannot cover a larger requirement', () => {
  const generated = generateShoppingItems('a', calc());
  assert.equal(generated.length, 8);
  const raw = [oldItem(), oldItem({ id: 'manual', materialId: 'custom-extra', customPrice: 77, customQuantity: 12, notes: 'Moje dane' })];
  const copy = structuredClone(raw), viewed = projectEpsShopping(raw, calc());
  assert.deepEqual(raw, copy);
  assert.equal(viewed[0].quantity, 165); assert.equal(viewed[0].owned, false); assert.equal(viewed[0].needsQuantityConfirmation, true);
  assert.deepEqual(viewed[1], raw[1]);
  const covered = projectEpsShopping([oldItem({ customQuantity: 165 })], calc())[0];
  assert.equal(covered.owned, true); assert.equal(covered.needsQuantityConfirmation, false);
  assert.equal(projectEpsShopping([oldItem({ customQuantity: 165 })], calc(60))[0].owned, false);
});

test('whole renovation consolidates raw EPS demand and validates ownership against the correct work and quantity', () => {
  const projects = [project('a'), project('b')];
  const pending = buildRenovationBasket(projects, ['a', 'b'], 'standard', { a: [oldItem()] });
  assert.equal(pending.excludedMaterials, 0);
  assert.equal(pending.stages.flatMap(stage => stage.materials).filter(line => line.material.ean === EPS_K20_EAN).reduce((total, line) => total + line.quantity, 0), 330);
  const covered = buildRenovationBasket(projects, ['a', 'b'], 'standard', { a: [oldItem({ customQuantity: 165 })] });
  assert.equal(covered.excludedMaterials, 1);
  assert.equal(covered.stages[1].materials.find(line => line.material.ean === EPS_K20_EAN)!.quantity, 165);
  const unknownOwned = buildRenovationBasket([project('a')], ['a'], 'standard', { a: [oldItem({ materialId: 'anchors-eps', quantity: 0, unit: 'szt' })] });
  assert.ok(unknownOwned.stages[0].materials.some(line => line.material.id === 'anchors-eps'));
});

test('shared shopping text labels the incomplete estimate and does not advertise unknown quantities as free', () => {
  const items = projectEpsShopping(generateShoppingItems('a', calc()).map((item, index) => ({ ...item, id: String(index) })), calc());
  const text = buildShareText('EPS', items, [], 2406.75, 0, 0, key => key);
  assert.match(text, /upgrade.partial.title/);
  assert.match(text, /Grunt podkładowy pod tynk — \? litr — —/);
  assert.ok(!text.includes('Grunt podkładowy pod tynk — 0.0'));
});
