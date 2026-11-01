import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapegumPackageStorage } from '../pricing/mapegumPackageStorage';
import { MAPEGUM_PACKAGE_CHOICE_PREFIX, MAPEGUM_PACKAGE_PRODUCTS } from '../pricing/mapegumPackageChoice';
import { PRIMER_PACKAGE_CHOICE_PREFIX } from '../pricing/primerPackageChoice';
import { MATERIAL_STOCK_PREFIX } from '../pricing/materialStock';
import { recoverMaterialStock, readMaterialStock } from '../pricing/materialStockStorage';
import { parsePreferenceRecovery, recoveryArchiveKey } from './preferenceRecovery';
const key = MAPEGUM_PACKAGE_CHOICE_PREFIX + 'room', broken = '{broken\n', choice = { from: MAPEGUM_PACKAGE_PRODUCTS[0].id, to: 'automatic' as const };
function fixture() {
  const values = new Map([[key, broken]]), writes: string[] = [];
  const storage = { getItem: async (k: string) => values.get(k) ?? null, setItem: async (k: string, v: string) => { writes.push(k); values.set(k, v); } };
  return { values, writes, storage };
}
test('recovery preserves the exact damaged family record before resetting only that setting', async () => {
  const f = fixture(), other = PRIMER_PACKAGE_CHOICE_PREFIX + 'room'; f.values.set(other, 'other-family'); f.values.set(MAPEGUM_PACKAGE_CHOICE_PREFIX + 'other-room', 'other-room');
  assert.deepEqual(await mapegumPackageStorage.recover(f.storage, 'room'), { value: [], reset: true });
  assert.equal(parsePreferenceRecovery(f.values.get(recoveryArchiveKey(key))!).records[0].raw, broken);
  assert.deepEqual(await mapegumPackageStorage.read(f.storage, 'room'), []); assert.equal(f.values.get(other), 'other-family');
  assert.equal(f.values.get(MAPEGUM_PACKAGE_CHOICE_PREFIX + 'other-room'), 'other-room'); assert.deepEqual(f.writes, [recoveryArchiveKey(key), key]);
});
test('valid or missing settings are read back without archiving or resetting', async () => {
  for (const raw of [null, JSON.stringify({ version: 1, choices: [choice] })]) {
    const f = fixture(); if (raw === null) f.values.delete(key); else f.values.set(key, raw);
    assert.deepEqual(await mapegumPackageStorage.recover(f.storage, 'room'), { value: raw === null ? [] : [choice], reset: false }); assert.deepEqual(f.writes, []);
  }
});
test('a transient source read failure cannot initiate any reset or archive write', async () => {
  const f = fixture(); await assert.rejects(mapegumPackageStorage.recover({ ...f.storage, getItem: async () => { throw Error('unavailable'); } }, 'room'), /unavailable/); assert.deepEqual(f.writes, []); assert.equal(f.values.get(key), broken);
});
test('failed or silently ignored archive writes retain the damaged source and block recovery', async () => {
  for (const silent of [false, true]) {
    const f = fixture(); await assert.rejects(mapegumPackageStorage.recover({ ...f.storage, setItem: async () => { if (!silent) throw Error('quota'); } }, 'room'));
    assert.equal(f.values.get(key), broken); assert.equal(f.values.has(recoveryArchiveKey(key)), false);
  }
});
test('an unreadable previous archive is never replaced to make recovery pass', async () => {
  const f = fixture(); f.values.set(recoveryArchiveKey(key), 'older damaged archive');
  await assert.rejects(mapegumPackageStorage.recover(f.storage, 'room')); assert.deepEqual(f.writes, []); assert.equal(f.values.get(key), broken);
});
test('failed source replacement preserves the archive and a retry deduplicates the original record', async () => {
  const f = fixture(); let fail = true; const s = { ...f.storage, setItem: async (k: string, v: string) => { if (k === key && fail) throw Error('quota'); await f.storage.setItem(k, v); } };
  await assert.rejects(mapegumPackageStorage.recover(s, 'room'), /quota/); assert.equal(f.values.get(key), broken);
  fail = false; await mapegumPackageStorage.recover(s, 'room'); assert.equal(parsePreferenceRecovery(f.values.get(recoveryArchiveKey(key))!).records.length, 1);
});
test('a source write that reports success without storing is not reported as recovered', async () => {
  const f = fixture(); await assert.rejects(mapegumPackageStorage.recover({ ...f.storage, setItem: async (k: string, v: string) => { if (k !== key) await f.storage.setItem(k, v); } }, 'room'), /preference_recovery_unconfirmed/); assert.equal(f.values.get(key), broken);
});
test('a source changed while archiving is preserved instead of overwritten by a reset', async () => {
  const f = fixture(), repaired = JSON.stringify({ version: 1, choices: [choice] });
  await assert.rejects(mapegumPackageStorage.recover({ ...f.storage, setItem: async (k: string, v: string) => { await f.storage.setItem(k, v); if (k === recoveryArchiveKey(key)) f.values.set(key, repaired); } }, 'room'), /preference_changed_during_recovery/);
  assert.equal(f.values.get(key), repaired); assert.equal(parsePreferenceRecovery(f.values.get(recoveryArchiveKey(key))!).records[0].raw, broken);
});
test('navigation waits for recovery and a queued user choice wins after recovery', async () => {
  const f = fixture(); let finish!: () => void, began!: () => void; const gate = new Promise<void>(r => { finish = r; }), started = new Promise<void>(r => { began = r; });
  const s = { ...f.storage, setItem: async (k: string, v: string) => { if (k === recoveryArchiveKey(key)) { began(); await gate; } await f.storage.setItem(k, v); } };
  const recovery = mapegumPackageStorage.recover(s, 'room'); await started; let readDone = false; const read = mapegumPackageStorage.read(s, 'room').then(v => { readDone = true; return v; });
  const change = mapegumPackageStorage.write(s, 'room', [choice]); await new Promise(r => setImmediate(r)); assert.equal(readDone, false); finish(); await recovery; await read; await change; assert.deepEqual(await mapegumPackageStorage.read(s, 'room'), [choice]);
});
test('a queued durable choice is read rather than reset when recovery reaches the queue', async () => {
  const f = fixture(); const write = mapegumPackageStorage.write(f.storage, 'room', [choice]), recover = mapegumPackageStorage.recover(f.storage, 'room');
  await write; assert.deepEqual(await recover, { value: [choice], reset: false }); assert.equal(f.values.has(recoveryArchiveKey(key)), false);
});
test('archive capacity failure never truncates previous records or resets the source', async () => {
  const f = fixture(), archive = JSON.stringify({ version: 1, records: Array.from({ length: 20 }, (_, i) => ({ savedAt: '2026-11-01T00:00:00Z', raw: 'previous-' + i })) }); f.values.set(recoveryArchiveKey(key), archive);
  await assert.rejects(mapegumPackageStorage.recover(f.storage, 'room')); assert.equal(f.values.get(recoveryArchiveKey(key)), archive); assert.equal(f.values.get(key), broken); assert.deepEqual(f.writes, []);
});
test('stock recovery archives invalid quantities without applying them to purchasing', async () => {
  const f = fixture(), stockKey = MATERIAL_STOCK_PREFIX + 'room', raw = JSON.stringify({ version: 1, entries: [{ price: 0, quantity: -1 }] }); f.values.set(stockKey, raw);
  await assert.rejects(readMaterialStock(f.storage, 'room')); assert.deepEqual(await recoverMaterialStock(f.storage, 'room'), { value: [], reset: true });
  assert.deepEqual(await readMaterialStock(f.storage, 'room'), []); assert.equal(parsePreferenceRecovery(f.values.get(recoveryArchiveKey(stockKey))!).records[0].raw, raw); assert.equal(f.values.get(key), broken);
  await assert.rejects(recoverMaterialStock(f.storage, 'renovation-basket'), /invalid_material_stock_project/);
});
