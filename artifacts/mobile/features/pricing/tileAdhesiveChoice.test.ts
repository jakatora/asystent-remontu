import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { applyTileChoices, type TileChoice } from './tileChoice';
import { applyTileAdhesiveChoices, tileAdhesiveRequirements, parseTileAdhesiveChoices, TILE_ADHESIVE_PRODUCTS } from './tileAdhesiveChoice';
import { toPricingStageInput } from './pricingApi';
import { buildRenovationBasket } from './renovationBasket';
import type { Project, ShoppingItem } from '@/types/domain';

const original = 'mat-tile-adhesive-buildfix-25kg', standard = 'mat-tile-adhesive-atlas-plus-standard-25kg';
const adhesive = { from: original, to: standard };
const tile: TileChoice = { from: 'mat-gres-paradyz-petro-grey-60x60', to: 'mat-gres-rekt-paradyz-u117-light-beige-60x60', use: 'floor' };
const calc = () => calculatorEngine.calculate(getJobById('floor-tiles')!, { floorArea: 10, tileWidthCm: 30, tileHeightCm: 30, wastePercent: 15, groutWidthMm: 3 });
const stage = () => applyTileChoices([toPricingStageInput(calc())], [tile])[0];

test('an explicit adhesive pack choice retains47.3rawkg, stable materialID and measured tile geometry', () => {
  const input = stage(), before = JSON.stringify(input), changed = applyTileAdhesiveChoices([input], [adhesive])[0];
  const from = input.materials.find(line => line.material.id === 'tile-adhesive')!;
  const to = changed.materials.find(line => line.material.id === 'tile-adhesive')!;
  assert.equal(from.material.ean, '5905400658866'); assert.equal(to.material.ean, '5905400488579');
  assert.equal(to.quantity, 47.3); assert.equal(to.material.unit, 'kg'); assert.equal(to.packs, undefined);
  assert.deepEqual(changed.measurements, input.measurements);
  assert.deepEqual(changed.materials.filter(line => line.material.id !== 'tile-adhesive'), input.materials.filter(line => line.material.id !== 'tile-adhesive'));
  assert.equal(JSON.stringify(input), before); assert.equal(TILE_ADHESIVE_PRODUCTS.length, 2);
});

test('adhesive selection rejects unknown or duplicate choices and does not substitute kitchen, walls or default Ceresit', () => {
  assert.deepEqual(parseTileAdhesiveChoices(null), []);
  assert.deepEqual(parseTileAdhesiveChoices(JSON.stringify({ version: 1, choices: [adhesive] })), [adhesive]);
  for (const choices of [[adhesive, adhesive], [{ from: original, to: 'mat-tile-adhesive-ceresit-cm11-25kg' }], [{ from: original, to: original }]])
    assert.throws(() => parseTileAdhesiveChoices(JSON.stringify({ version: 1, choices })));
  const input = stage();
  for (const jobId of ['kitchen-backsplash', 'wall-tiles-bathroom', 'basket-extra']) {
    const other = { ...input, jobId }; assert.deepEqual(tileAdhesiveRequirements([other]), []);
    assert.deepEqual(applyTileAdhesiveChoices([other], [adhesive]), [other]);
  }
  const defaultFloor = toPricingStageInput(calc());
  assert.deepEqual(tileAdhesiveRequirements([defaultFloor]), []);
  assert.deepEqual(applyTileAdhesiveChoices([defaultFloor], [adhesive]), [defaultFloor]);
});

test('shared renovation preserves per-project adhesive choices and does not merge different barcodes', () => {
  const project = (id: string): Project => ({ id, name: id, jobId: 'floor-tiles', jobName: 'Tiles', categoryId: 'floor-tiles', measurements: calc().measurements, calculationResult: calc(), status: 'planning', createdAt: '', updatedAt: '' });
  const a = project('a'), b = project('b'), before = JSON.stringify([a, b]);
  const result = buildRenovationBasket([a, b], ['a', 'b'], 'standard', {}, {}, {}, {}, {}, { a: [tile], b: [tile] }, { a: [adhesive] });
  assert.deepEqual(result.stages.map(stage => stage.materials.find(line => line.material.id === 'tile-adhesive')!.material.ean), ['5905400488579', '5905400658866']);
  assert.ok(result.stages.every(stage => stage.materials.find(line => line.material.id === 'tile-adhesive')!.quantity === 47.3));
  assert.equal(JSON.stringify([a, b]), before);
});

test('an owned promotional pack cannot hide the new standard pack after an explicit product change', () => {
  const c = calc(), project: Project = { id: 'a', name: 'a', jobId: c.jobId, jobName: 'Tiles', categoryId: 'floor-tiles', measurements: c.measurements, calculationResult: c, status: 'planning', createdAt: '', updatedAt: '' };
  const owned = { id: 'old', projectId: 'a', materialId: 'tile-adhesive', name: TILE_ADHESIVE_PRODUCTS.find(p => p.id === original)!.productLabel, quantity: 50, unit: 'kg', owned: true, purchased: false, itemType: 'material' } as ShoppingItem;
  const result = buildRenovationBasket([project], ['a'], 'standard', { a: [owned] }, {}, {}, {}, {}, { a: [tile] }, { a: [adhesive] });
  assert.equal(result.excludedMaterials, 0);
  assert.equal(result.stages[0].materials.find(line => line.material.id === 'tile-adhesive')!.material.ean, '5905400488579');
});
