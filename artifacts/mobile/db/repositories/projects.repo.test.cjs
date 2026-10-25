// Run with: node --test db/repositories/projects.repo.test.cjs (from mobile).
// Execute the real repository and migrations against SQLite with foreign keys on.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadSource(file, dependencies = {}) {
  const output = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', output)(request => {
    if (!(request in dependencies)) throw new Error(`Unexpected runtime dependency: ${request}`);
    return dependencies[request];
  }, mod, mod.exports);
  return mod.exports;
}

test('editing a project preserves shopping, photos, checklist, activities, custom prices and price snapshots', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  const db = {
    execAsync: async sql => sqlite.exec(sql),
    runAsync: async (sql, values = []) => sqlite.prepare(sql).run(...values),
    getAllAsync: async (sql, values = []) => sqlite.prepare(sql).all(...values),
    getFirstAsync: async (sql, values = []) => sqlite.prepare(sql).get(...values),
  };
  try {
    for (const [file, fn] of [['001_initial', 'migration_001'], ['002_shopping_extended', 'migration_002'], ['003_project_management', 'migration_003'], ['004_pricing', 'migration_004']]) {
      await loadSource(path.join(__dirname, '../migrations', file + '.ts'))[fn](db);
    }
    const { projectsRepo } = loadSource(path.join(__dirname, 'projects.repo.ts'), {
      '../client': { getDb: async () => db },
      '@/shared/lib/id': { generateId: () => 'project-test' },
      '@/shared/lib/date': { nowISO: () => '2026-10-26T00:00:00.000Z' },
    });
    const id = await projectsRepo.upsert({ name: 'EPS', jobId: 'eps-insulation-bso', jobName: 'Ocieplenie', categoryId: 'insulation', measurements: { wallArea: 30 }, status: 'planning' });
    sqlite.exec(`
      INSERT INTO shopping_items (id, project_id, material_id, name, quantity, unit, estimated_price, purchased, owned, custom_price, custom_quantity, created_at)
      VALUES ('shopping', 'project-test', 'glue-k20', 'K20', 165, 'kg', 363, 0, 1, 350, 165, '2026-10-26');
      INSERT INTO project_photos (id, project_id, uri, created_at) VALUES ('photo', 'project-test', 'file:///test.jpg', '2026-10-26');
      INSERT INTO project_checklist (id, project_id, step_index, title, completed, created_at) VALUES ('checklist', 'project-test', 0, 'Przygotowanie', 1, '2026-10-26');
      INSERT INTO project_activities VALUES ('activity', 'project-test', 'created', 'Historia', '2026-10-26');
      INSERT INTO price_overrides VALUES ('price', 'project-test', 'material', 'glue-k20', 350, 'Cena użytkownika', '2026-10-26');
      INSERT INTO project_price_snapshots (id, project_id, region_code, snapshot_date, created_at) VALUES ('snapshot', 'project-test', 'PL', '2026-10-26', '2026-10-26');
    `);
    const tables = ['shopping_items', 'project_photos', 'project_checklist', 'project_activities', 'price_overrides', 'project_price_snapshots'];
    const before = Object.fromEntries(tables.map(table => [table, sqlite.prepare(`SELECT * FROM ${table}`).all()]));
    const old = await projectsRepo.findById(id);
    await projectsRepo.update({ ...old, name: 'EPS 60', measurements: { wallArea: 60 }, notes: 'Nowy obmiar' });
    const updated = await projectsRepo.findById(id);
    assert.equal(updated.name, 'EPS 60');
    assert.equal(updated.measurements.wallArea, 60);
    assert.equal(updated.createdAt, old.createdAt);
    assert.equal(updated.notes, 'Nowy obmiar');
    for (const table of tables) assert.deepEqual(sqlite.prepare(`SELECT * FROM ${table}`).all(), before[table], `${table} must survive project editing`);
    assert.deepEqual(sqlite.prepare('PRAGMA foreign_key_check').all(), []);
    // Genuine project deletion must still cascade: preservation isn't achieved by disabling foreign keys.
    await projectsRepo.delete(id);
    for (const table of tables) assert.equal(sqlite.prepare(`SELECT count(*) AS count FROM ${table}`).get().count, 0);
  } finally {
    sqlite.close();
  }
});
