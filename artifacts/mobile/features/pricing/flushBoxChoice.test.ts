import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyFlushBoxChoices, FLUSH_BOX_TEN, FLUSH_BOX_SINGLE, flushBoxRequirements, parseFlushBoxChoices } from './flushBoxChoice';
import { extraMaterial } from './basketExtras';
import type { PricingStageInput } from './pricingApi';

const choice = { from: FLUSH_BOX_TEN, to: FLUSH_BOX_SINGLE };
const oldLine = (quantity: number) => ({ ...extraMaterial({ id: 'boxes-' + quantity, kind: 'catalogue', referenceId: FLUSH_BOX_TEN, quantity }), packs: Math.ceil(quantity / 10) });
const save = (choices: unknown[]) => JSON.stringify({ version: 1, choices });

test('only an explicit packaging choice changes a ten-pack request into exact individually sold PRO boxes', () => {
  const input: PricingStageInput[] = [{ jobId: 'additional-materials', materials: [oldLine(11)] }], before = JSON.stringify(input);
  assert.equal(flushBoxRequirements(input)[0].id, FLUSH_BOX_TEN);
  assert.deepEqual(applyFlushBoxChoices(input, []), input);
  const line = applyFlushBoxChoices(input, [choice])[0].materials[0];
  assert.equal(line.material.ean, '5901752632141');
  assert.equal(line.material.unit, 'szt');
  assert.equal(line.material.id, input[0].materials[0].material.id);
  assert.equal(line.quantity, 11, 'Raw piece demand is neither divided nor multiplied by ten');
  assert.equal(line.packs, undefined, 'Old rounded ten-packs cannot follow the changed selling format');
  assert.equal(JSON.stringify(input), before);
});
test('independent works and extras retain counts; LUX boxes and spacer rings are never changed', () => {
  const other = ['mat-epn-pk60-lux-0206-51', 'mat-epn-spacer-60x12-screws', 'mat-epn-spacer-60x24-screws'].map((referenceId, i) => extraMaterial({ id: 'other-' + i, kind: 'catalogue', referenceId, quantity: i + 1 }));
  const stages: PricingStageInput[] = [{ jobId: 'a', materials: [oldLine(3)] }, { jobId: 'b', materials: [oldLine(8), ...other] }];
  const selected = applyFlushBoxChoices(stages, [choice]);
  assert.equal(selected.flatMap(s => s.materials).filter(l => l.material.ean === '5901752632141').reduce((n, l) => n + l.quantity, 0), 11);
  assert.deepEqual(selected[1].materials.slice(1), other);
  assert.deepEqual(stages.map(s => s.jobId), selected.map(s => s.jobId));
  assert.deepEqual(flushBoxRequirements([{ jobId: 'single', materials: [extraMaterial({ id: 'already-single', kind: 'catalogue', referenceId: FLUSH_BOX_SINGLE, quantity: 4 })] }]), []);
});
test('corrupt choices, another model and conflicting product identities fail closed', () => {
  assert.deepEqual(parseFlushBoxChoices(save([choice])), [choice]);
  for (const c of [[choice, choice], [{ from: FLUSH_BOX_SINGLE, to: FLUSH_BOX_TEN }], [{ from: FLUSH_BOX_TEN, to: 'mat-epn-pk60-lux-0206-51' }], [{ from: FLUSH_BOX_TEN, to: 'mat-epn-spacer-60x12-screws' }]]) assert.throws(() => parseFlushBoxChoices(save(c)));
  assert.throws(() => parseFlushBoxChoices('broken'));
  const input: PricingStageInput[] = [{ jobId: 'extra', materials: [{ ...oldLine(11), material: { ...oldLine(11).material, gtin: '5901752632141' } }] }];
  assert.deepEqual(flushBoxRequirements(input), []);
  assert.deepEqual(applyFlushBoxChoices(input, [choice]), input, 'Conflicting codes cannot be relabelled');
});
