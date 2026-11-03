import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { queuedDatabase } from '../../db/connection';
import { migration_005 } from '../../db/migrations/005_contractor';
import { migration_006 } from '../../db/migrations/006_house_build';
import { migration_007 } from '../../db/migrations/007_timeline_budget';
import { migration_008 } from '../../db/migrations/008_investor_docs';
import { migration_009 } from '../../db/migrations/009_utility_plans';
import { migration_010 } from '../../db/migrations/010_house_build_pricing';
import { migration_012 } from '../../db/migrations/012_house_build_contractors';
import { HOUSE_BACKUP_TABLES } from './houseBuildBackupSchema';
import { importHouseBuildBackup, parseHouseBuildBackup, readHouseBuildBackup } from './houseBuildBackup';

async function fixture(t: TestContext) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  const raw = {
    execAsync: async (sql: string) => sqlite.exec(sql),
    runAsync: async (sql: string, params: SQLInputValue[] = []) => {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    getAllAsync: async (sql: string) => sqlite.prepare(sql).all(),
    getFirstAsync: async (sql: string) => sqlite.prepare(sql).get() ?? null,
  };
  for (const migration of [migration_005, migration_006, migration_007, migration_008, migration_009, migration_010, migration_012]) {
    await migration(raw as unknown as Parameters<typeof migration_006>[0]);
  }
  return { sqlite, db: queuedDatabase(raw as unknown as Parameters<typeof queuedDatabase>[0], () => {}) };
}

function seed(sqlite: DatabaseSync) {
  for (const table of Object.keys(HOUSE_BACKUP_TABLES)) {
    const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all();
    const fields = columns.filter(column => column.pk || (column.notnull && column.dflt_value === null) || column.name === 'request_id');
    const values = fields.map(({ name, type }) => {
      if (name === 'id') return table === 'house_build_projects' ? 'house' : table;
      if (name === 'project_id') return 'house';
      if (name === 'request_id') return 'contractor_requests';
      return type === 'TEXT' ? 'Dane budowy' : 123;
    });
    sqlite.prepare(`INSERT INTO ${table} (${fields.map(column => column.name).join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`).run(...values);
  }
  sqlite.exec("INSERT INTO build_budget_notes VALUES ('deleted-project-note','deleted','planning','Orphan', '2026-11-03'); INSERT INTO contractor_requests (id,work_description,city,created_at,updated_at) VALUES ('other-request','Other project','Kraków','2026-11-03','2026-11-03');");
}

test('house-building projects and all related record types survive a SQLite round trip', async t => {
  const source = await fixture(t), target = await fixture(t);
  seed(source.sqlite);
  const backup = await readHouseBuildBackup(source.db);
  assert.ok(Object.values(backup.tables).every(rows => rows.length === 1));
  assert.equal(backup.tables.contractor_requests[0].id, 'contractor_requests');
  assert.equal(await importHouseBuildBackup(parseHouseBuildBackup(JSON.stringify(backup)), target.db), 1);
  assert.deepEqual((await readHouseBuildBackup(target.db)).tables, backup.tables);
});

test('duplicate projects and collisions in related rows preserve the entire destination', async t => {
  const source = await fixture(t), target = await fixture(t);
  seed(source.sqlite);
  const backup = await readHouseBuildBackup(source.db);
  target.sqlite.exec("INSERT INTO build_budget_notes VALUES ('build_budget_notes','other','planning','Keep', '2026-11-03')");
  await assert.rejects(importHouseBuildBackup(backup, target.db), /UNIQUE constraint/);
  assert.equal(target.sqlite.prepare('SELECT COUNT(*) AS n FROM house_build_projects').get()?.n, 0);
  assert.equal(target.sqlite.prepare('SELECT text FROM build_budget_notes').get()?.text, 'Keep');
  assert.equal(target.sqlite.prepare('SELECT COUNT(*) AS n FROM contractor_requests').get()?.n, 0);
  await assert.rejects(importHouseBuildBackup(backup, source.db), /backup_project_conflict/);
});

test('foreign rows, invalid contexts and injected columns reject the archive', async t => {
  const { sqlite, db } = await fixture(t);
  seed(sqlite);
  const backup = await readHouseBuildBackup(db);
  const changed = structuredClone(backup);
  changed.tables.build_budget_items[0].project_id = 'foreign';
  assert.throws(() => parseHouseBuildBackup(JSON.stringify(changed)), /invalid_house_build_backup/);
  changed.tables.build_budget_items[0].project_id = 'house';
  changed.tables.house_build_projects[0].land_context = 'null';
  assert.throws(() => parseHouseBuildBackup(JSON.stringify(changed)), /invalid_house_build_backup/);
  changed.tables.house_build_projects[0].land_context = '{}';
  changed.tables.house_build_projects[0].injected = 'value';
  assert.throws(() => parseHouseBuildBackup(JSON.stringify(changed)), /invalid_house_build_backup/);
});
