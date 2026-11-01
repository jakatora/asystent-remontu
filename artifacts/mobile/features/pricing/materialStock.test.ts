import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyMaterialStock, materialStockRequirements, parseMaterialStock, parseMaterialStockQuantity, type MaterialStockEntry } from './materialStock';
import { readMaterialStock, writeMaterialStock } from './materialStockStorage';
import { calculatorEngine } from '../calculator/engine';
import { getJobById } from '../content/registry';
import { toPricingStageInput, type PricingStageInput } from './pricingApi';
import { applyProjectShopping, applyShoppingContexts } from './projectShoppingInput';
import { generateShoppingItems } from '../calculator/shopping';
import { buildRenovationBasket } from './renovationBasket';
import type { Project } from '../../types/domain';

const calc = (system = 4) => calculatorEngine.calculate(getJobById('wall-plastering')!, { wallArea: 4, plasterThickness: 10, plasterSystem: system, plasterReservePercent: 10, plasterPrimerChoice: 2, plasterMeshArea: 0, plasterCornerCount: 0 });
const stage = () => toPricingStageInput(calc());
const entry = (quantity = 30): MaterialStockEntry => { const { requiredQuantity, ...identity } = materialStockRequirements([stage()])[0]; return { ...identity, quantity }; };
const project = (id: string): Project => ({ id, name: id, jobId: 'wall-plastering', jobName: 'Tynkowanie', categoryId: 'plaster', measurements: calc().measurements, calculationResult: calc(), status: 'planning', createdAt: '', updatedAt: '' });

test('one allocated30kg bag reduces35.2kg raw demand to5.2kg before pack and shipping optimization, without changing source records', () => {
  const source = stage(), entries = [entry()], before = JSON.stringify({ source, entries });
  const result = applyMaterialStock(source, entries);
  assert.equal(result.stage.materials[0].quantity, 5.2); assert.equal(result.stage.materials[0].packs, undefined);
  assert.equal(result.adjustments[0].coveredQuantity, 30); assert.equal(result.adjustments[0].remainingQuantity, 5.2);
  assert.equal(JSON.stringify({ source, entries }), before);
  assert.equal(applyMaterialStock(source, [entry(60)]).stage.materials.length, 0);
  assert.equal(materialStockRequirements([source])[0].requiredQuantity, 35.2);
});
test('another EAN, recipe row or physical unit cannot borrow stock; restoring the original product restores its saved allocation', () => {
  const entries = [entry()], goldband = toPricingStageInput(calc(5));
  assert.deepEqual(applyMaterialStock(goldband, entries).stage, goldband);
  for (const different of [{ materialId: 'another' }, { ean: '5902367206475' }, { unit: 'l' as const }]) assert.equal(applyMaterialStock(stage(), [{ ...entry(), ...different }]).stage.materials[0].quantity, 35.2);
  assert.equal(applyMaterialStock(stage(), entries).stage.materials[0].quantity, 5.2);
  const owned = generateShoppingItems('a', calc()).map(row => ({ ...row, id: 'owned:' + row.materialId, owned: true }));
  const pending = applyProjectShopping(stage(), calc(), 'a', owned, stage(), entries);
  assert.equal(pending.stage.materials.length, 0); assert.equal(pending.stockAdjustments.length, 0); assert.equal(pending.excludedMaterials, 1);
});
test('two rooms use only their own allocated quantity; direct and shared pending-input projections agree exactly', () => {
  const result = buildRenovationBasket([project('a'), project('b')], ['a', 'b'], 'standard', {}, {}, {}, {}, {}, {}, {}, { a: [entry()] });
  assert.deepEqual(result.stages.map(s => s.materials[0].quantity), [5.2, 35.2]);
  assert.ok(Math.abs(result.stages.flatMap(s => s.materials).reduce((sum, row) => sum + row.quantity, 0) - 40.4) < 0.00000001);
  assert.deepEqual(applyShoppingContexts(result.selectionStages, result.shoppingContexts).stages, result.stages);
  assert.equal(applyShoppingContexts(result.selectionStages, result.shoppingContexts).stockAdjustments.length, 1);
});
test('repeated rows consume one allocation once; positive fractional remainder is never rounded into a covered whole requirement', () => {
  const source = stage(), duplicate: PricingStageInput = { ...source, materials: [...source.materials, ...source.materials] };
  const result = applyMaterialStock(duplicate, [entry(40)]);
  assert.equal(result.stage.materials.length, 1); assert.equal(result.stage.materials[0].quantity, 30.4);
  const tiny = { ...source, materials: [{ ...source.materials[0], quantity: 1.000000001 }] };
  assert.equal(applyMaterialStock(tiny, [entry(1)]).stage.materials[0].quantity, 0.00000001);
});
test('nominal area and linear offcuts cannot subtract from geometry-based plans; only eligible exact product units are offered', () => {
  const row = stage().materials[0];
  for (const unit of ['m2', 'm²', 'mb', 'm', 'pozycja']) assert.equal(materialStockRequirements([{ jobId: 'x', materials: [{ ...row, material: { ...row.material, unit } }] }]).length, 0);
  assert.equal(materialStockRequirements([{ jobId: 'x', materials: [{ ...row, cutRoll: {} as never }] }]).length, 0);
  assert.equal(materialStockRequirements([{ jobId: 'x', materials: [{ ...row, material: { ...row.material, ean: null } }] }]).length, 0);
  assert.equal(parseMaterialStockQuantity('1,5', 'kg'), 1.5); assert.equal(parseMaterialStockQuantity('0', 'kg'), 0);
  for (const text of ['', '-1', 'NaN', 'Infinity', '100001', '1e3', '0.000000001']) assert.equal(parseMaterialStockQuantity(text, 'kg'), null);
  assert.equal(parseMaterialStockQuantity('1,5', 'szt'), null); assert.equal(parseMaterialStockQuantity('2', 'szt'), 2);
});
test('damaged, duplicate and money-bearing stock records fail closed rather than becoming an empty allocation', () => {
  assert.deepEqual(parseMaterialStock(null), []);
  const save = (entries: unknown, version = 1) => JSON.stringify({ version, entries });
  for (const raw of ['{', save([entry()], 2), save([entry(), entry()]), save([{ ...entry(), quantity: -1 }]), save([{ ...entry(), quantity: 0.000000001 }]), save([{ ...entry(), ean: 5902367206451 }]), save([{ ...entry(), price: 0 }]), save([{ ...entry(), name: 'A\nB' }])]) assert.throws(() => parseMaterialStock(raw));
  assert.deepEqual(parseMaterialStock(save([entry()])), [entry()]);
});
test('navigation waits for the in-flight durable stock save instead of reading a previous empty allocation', async () => {
  const values = new Map<string, string>(); let finish!: () => void;
  const gate = new Promise<void>(resolve => { finish = resolve; });
  const storage = { getItem: async (key: string) => values.get(key) ?? null, setItem: async (key: string, value: string) => { await gate; values.set(key, value); } };
  const write = writeMaterialStock(storage, 'a', [entry()]); let completed = false;
  const read = readMaterialStock(storage, 'a').then(result => { completed = true; return result; });
  await Promise.resolve(); assert.equal(completed, false); finish(); await write;
  assert.deepEqual(await read, [entry()]); assert.deepEqual(await readMaterialStock(storage, 'b'), []);
});
test('failed writes reject dependent reads, preserve the previous save and permit a later successful retry', async () => {
  let saved = JSON.stringify({ version: 1, entries: [entry(10)] }), fail = true;
  const storage = { getItem: async () => saved, setItem: async (_key: string, value: string) => { if (fail) throw Error('disk_full'); saved = value; } };
  const writing = writeMaterialStock(storage, 'a', [entry(30)]), reading = readMaterialStock(storage, 'a');
  await assert.rejects(writing, /disk_full/); await assert.rejects(reading, /disk_full/);
  assert.deepEqual(await readMaterialStock(storage, 'a'), [entry(10)]);
  fail = false; await writeMaterialStock(storage, 'a', [entry(30)]); assert.deepEqual(await readMaterialStock(storage, 'a'), [entry(30)]);
  await assert.rejects(writeMaterialStock(storage, 'renovation-basket', [entry()]), /invalid_material_stock_project/);
});
