import type * as SQLite from 'expo-sqlite';

export async function migration_009(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS build_utility_plans (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      utility_type      TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'not-planned',
      provider_name     TEXT NOT NULL DEFAULT '',
      connection_power  TEXT NOT NULL DEFAULT '',
      gas_purpose       TEXT NOT NULL DEFAULT 'not-planned',
      temporary_supply  INTEGER NOT NULL DEFAULT 0,
      alternative_needed INTEGER NOT NULL DEFAULT 0,
      application_date  TEXT,
      conditions_date   TEXT,
      connection_date   TEXT,
      notes             TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_utility_checklist (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      utility_type      TEXT NOT NULL,
      item_key          TEXT NOT NULL,
      title             TEXT NOT NULL,
      completed         INTEGER NOT NULL DEFAULT 0,
      notes             TEXT NOT NULL DEFAULT '',
      sort_order        INTEGER NOT NULL DEFAULT 0,
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_utility_alternatives (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      utility_type      TEXT NOT NULL,
      title             TEXT NOT NULL,
      description       TEXT NOT NULL DEFAULT '',
      status            TEXT NOT NULL DEFAULT 'missing',
      notes             TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_utility_plans_unique ON build_utility_plans(project_id, utility_type);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_utility_checklist_unique ON build_utility_checklist(project_id, utility_type, item_key);
    CREATE INDEX IF NOT EXISTS idx_utility_plans_project ON build_utility_plans(project_id);
    CREATE INDEX IF NOT EXISTS idx_utility_checklist_project ON build_utility_checklist(project_id);
    CREATE INDEX IF NOT EXISTS idx_utility_alternatives_project ON build_utility_alternatives(project_id);
  `);
}
