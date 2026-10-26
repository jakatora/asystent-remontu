import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { queuedDatabase, type DatabaseConnection } from '../../db/connection';
import { sharedWebDatabase, type SharedDatabaseHost } from '../../db/webShared';

function sqlite() {
  const db = new DatabaseSync(':memory:');
  const values = (args: any[]) => Array.isArray(args[1]) ? args[1] : args.slice(1);
  const raw = {
    execAsync: async (sql: string) => { db.exec(sql); },
    runAsync: async (...args: any[]) => { const result = db.prepare(args[0]).run(...values(args)); return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) }; },
    getAllAsync: async (...args: any[]) => db.prepare(args[0]).all(...values(args)).map(row => ({ ...row })),
    getFirstAsync: async (...args: any[]) => { const row = db.prepare(args[0]).get(...values(args)); return row ? { ...row } : null; },
  } as Parameters<typeof queuedDatabase>[0];
  return { db, raw };
}

class Tabs {
  private channels = new Map<string, any>();
  private queue: { id: string; task: () => Promise<void>; signal: AbortSignal }[] = [];
  private owner: string | null = null;
  private clients = new Map<string, ReturnType<typeof sharedWebDatabase>>();
  duplicateRequests = false;
  dropResults = false;
  writesSent = 0;
  add(t: TestContext, id: string, open: () => Promise<Parameters<typeof queuedDatabase>[0]>, timeoutMs = 1000) {
    const channel: any = { onmessage: null, close: () => this.channels.delete(id), postMessage: (value: any) => {
      if (value.type === 'request' && value.method === 'runAsync') this.writesSent++;
      if (this.dropResults && value.type === 'result') return;
      const copies = this.duplicateRequests && value.type === 'request' ? 2 : 1;
      for (let n = 0; n < copies; n++) for (const [target, receiver] of this.channels) if (target !== id) {
        const message = structuredClone(value);
        queueMicrotask(() => { if (this.channels.has(target)) receiver.onmessage?.({ data: message }); });
      }
    } };
    this.channels.set(id, channel);
    const host: SharedDatabaseHost = { id, channel, timeoutMs, isOwner: async owner => this.owner === owner, claim: (task, signal) => {
      this.queue.push({ id, task, signal }); this.advance(); return new Promise(() => {});
    } };
    const client = sharedWebDatabase(open, host); this.clients.set(id, client); t.after(() => this.destroy(id)); return client;
  }
  private advance() {
    if (this.owner) return;
    const next = this.queue.shift(); if (!next) return;
    if (next.signal.aborted) { this.advance(); return; }
    this.owner = next.id; queueMicrotask(() => { void next.task(); });
  }
  destroy(id: string) {
    this.clients.get(id)?.dispose(); this.clients.delete(id); this.channels.delete(id);
    if (this.owner === id) { this.owner = null; this.advance(); }
  }
  late(from: string, type: string) {
    for (const receiver of this.channels.values()) receiver.onmessage?.({ data: { version: 1, from, type } });
  }
}

test('real SQLite batch rollback preserves existing rows and a later queued read remains healthy', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); let changes = 0;
  db.exec('CREATE TABLE items(id TEXT PRIMARY KEY, value TEXT); INSERT INTO items VALUES(\'saved\',\'before\')');
  const connection = queuedDatabase(raw, () => changes++);
  await assert.rejects(connection.runBatchAsync([{ sql: 'DELETE FROM items' }, { sql: 'INSERT INTO items VALUES(?,?)', params: ['same', 'a'] }, { sql: 'INSERT INTO items VALUES(?,?)', params: ['same', 'b'] }]));
  assert.deepEqual(await connection.getAllAsync('SELECT * FROM items'), [{ id: 'saved', value: 'before' }]); assert.equal(changes, 0);
});

test('other callers cannot observe or interleave a partly restored SQLite snapshot', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); db.exec('CREATE TABLE items(value TEXT); INSERT INTO items VALUES(\'old\')');
  const connection = queuedDatabase(raw, () => {});
  const batch = connection.runBatchAsync([{ sql: 'DELETE FROM items' }, { sql: 'INSERT INTO items VALUES(?)', params: ['new'] }]);
  const concurrent = connection.getAllAsync('SELECT * FROM items');
  await batch; assert.deepEqual(await concurrent, [{ value: 'new' }]);
  await assert.rejects(connection.execAsync('BEGIN TRANSACTION'), /use_database_batch/);
  assert.deepEqual(await connection.getFirstAsync('SELECT value FROM items'), { value: 'new' });
});

test('if rollback itself fails the connection cannot expose a partial transaction as a successful later read', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); db.exec('CREATE TABLE items(id TEXT); INSERT INTO items VALUES(\'saved\')');
  const connection = queuedDatabase({ ...raw, execAsync: async sql => {
    if (sql === 'ROLLBACK;') throw Error('disk_io_error');
    await raw.execAsync(sql);
  } }, () => {});
  await assert.rejects(connection.runBatchAsync([{ sql: 'DELETE FROM items' }, { sql: 'INSERT INTO missing VALUES(1)' }]), /database_reload_required/);
  await assert.rejects(connection.getAllAsync('SELECT * FROM items'), /database_reload_required/);
  await assert.rejects(connection.runAsync('INSERT INTO items VALUES(?)', ['unsafe']), /database_reload_required/);
});

test('three tabs open one real SQLite connection and share typed reads, writes and change notifications', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); db.exec('CREATE TABLE materials(name TEXT, amount INTEGER, image BLOB)');
  const tabs = new Tabs(); let opens = 0, changes = 0;
  const open = async () => { opens++; return raw; };
  const a = tabs.add(t, 'a', open), b = tabs.add(t, 'b', open), c = tabs.add(t, 'c', open);
  await Promise.all([a.ready(), b.ready(), c.ready()]); b.subscribe(() => changes++);
  const result = await c.connection.runAsync('INSERT INTO materials VALUES(?,?,?)', ['Folia', 98, new Uint8Array([1, 2, 3])]);
  assert.equal(result.changes, 1); assert.equal(opens, 1);
  const rows = await b.connection.getAllAsync<{ name: string; amount: number; image: Uint8Array }>('SELECT * FROM materials');
  assert.equal(rows[0].name, 'Folia'); assert.equal(rows[0].amount, 98); assert.deepEqual(rows[0].image, new Uint8Array([1, 2, 3])); assert.ok(changes > 0);
  assert.equal(await a.connection.getFirstAsync('SELECT * FROM materials WHERE name=?', ['missing']), null);
});

test('duplicate transport requests cannot apply a SQLite mutation twice', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); db.exec('CREATE TABLE counter(value INTEGER); INSERT INTO counter VALUES(0)');
  const tabs = new Tabs(); tabs.duplicateRequests = true;
  const a = tabs.add(t, 'a', async () => raw), b = tabs.add(t, 'b', async () => raw);
  await Promise.all([a.ready(), b.ready()]); await b.connection.runAsync('UPDATE counter SET value=value+1');
  assert.deepEqual(await a.connection.getFirstAsync('SELECT value FROM counter'), { value: 1 });
});

test('a lost reply reports uncertain save and never replays a write', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); db.exec('CREATE TABLE counter(value INTEGER); INSERT INTO counter VALUES(0)');
  const tabs = new Tabs(), a = tabs.add(t, 'a', async () => raw), b = tabs.add(t, 'b', async () => raw, 40);
  await Promise.all([a.ready(), b.ready()]); tabs.dropResults = true;
  await assert.rejects(b.connection.runAsync('UPDATE counter SET value=value+1'), /timeout_check_saved_changes/);
  assert.equal(tabs.writesSent, 1); assert.deepEqual(db.prepare('SELECT value FROM counter').get()?.value, 1);
});

test('after the owner tab closes a waiting tab opens the database and existing client references keep working', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); db.exec('CREATE TABLE projects(name TEXT); INSERT INTO projects VALUES(\'saved\')');
  const tabs = new Tabs(); let opens = 0;
  const open = async () => { opens++; return raw; };
  const a = tabs.add(t, 'a', open), b = tabs.add(t, 'b', open), c = tabs.add(t, 'c', open);
  await Promise.all([a.ready(), b.ready(), c.ready()]); tabs.destroy('a');
  // Let the simulated browser release the old owner's lock and announce the
  // new connection, without replacing the persisted database or RPC clients.
  await new Promise<void>(resolve => setImmediate(resolve));
  await c.connection.runAsync('INSERT INTO projects VALUES(?)', ['after close']);
  assert.equal(opens, 2); assert.deepEqual(await b.connection.getAllAsync('SELECT name FROM projects'), [{ name: 'saved' }, { name: 'after close' }]);
});

test('remote batches are atomic and failed statements propagate without poisoning the request queue', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); db.exec('CREATE TABLE items(id TEXT PRIMARY KEY); INSERT INTO items VALUES(\'saved\')');
  const tabs = new Tabs(), a = tabs.add(t, 'a', async () => raw), b = tabs.add(t, 'b', async () => raw);
  await Promise.all([a.ready(), b.ready()]);
  await assert.rejects(b.connection.runBatchAsync([{ sql: 'DELETE FROM items' }, { sql: 'INSERT INTO nonexistent VALUES(?)', params: ['bad'] }]));
  assert.deepEqual(await a.connection.getAllAsync('SELECT id FROM items'), [{ id: 'saved' }]);
  await b.connection.runBatchAsync([{ sql: 'INSERT INTO items VALUES(?)', params: ['new'] }]);
  assert.equal((await b.connection.getAllAsync('SELECT * FROM items')).length, 2);
});

test('database opening failures reach all waiting tabs instead of appearing as an empty project database', async t => {
  const tabs = new Tabs(), open = async (): Promise<DatabaseConnection> => { throw Error('disk_unavailable'); };
  const a = tabs.add(t, 'a', open), b = tabs.add(t, 'b', open);
  await Promise.all([assert.rejects(a.ready(), /disk_unavailable/), assert.rejects(b.ready(), /disk_unavailable/)]);
  await assert.rejects(b.connection.getAllAsync('SELECT * FROM projects'), /disk_unavailable/);
});

test('a late ready, starting or failure broadcast from a closed owner cannot redirect live tabs to a dead connection', async t => {
  const { db, raw } = sqlite(); t.after(() => db.close()); db.exec('CREATE TABLE items(value TEXT); INSERT INTO items VALUES(\'saved\')');
  const tabs = new Tabs(), a = tabs.add(t, 'a', async () => raw), b = tabs.add(t, 'b', async () => raw), c = tabs.add(t, 'c', async () => raw);
  await Promise.all([a.ready(), b.ready(), c.ready()]); tabs.destroy('a');
  await new Promise<void>(resolve => setImmediate(resolve));
  tabs.late('a', 'ready'); tabs.late('a', 'starting'); tabs.late('a', 'failed');
  await new Promise<void>(resolve => setImmediate(resolve));
  assert.deepEqual(await c.connection.getFirstAsync('SELECT value FROM items'), { value: 'saved' });
});
