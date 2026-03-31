import type * as SQLite from 'expo-sqlite';

export const migration_001: (db: SQLite.SQLiteDatabase) => Promise<void> = async (db) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_versions (
      version    INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS onboarding_completed (
      id           INTEGER PRIMARY KEY,
      completed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id                 TEXT PRIMARY KEY,
      name               TEXT NOT NULL,
      job_id             TEXT NOT NULL,
      job_name           TEXT NOT NULL,
      category_id        TEXT NOT NULL,
      measurements       TEXT NOT NULL DEFAULT '{}',
      calculation_result TEXT,
      status             TEXT NOT NULL DEFAULT 'planning',
      total_budget       REAL,
      actual_cost        REAL,
      notes              TEXT,
      created_at         TEXT NOT NULL,
      updated_at         TEXT NOT NULL,
      synced_at          TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_projects_status
      ON projects (status);

    CREATE INDEX IF NOT EXISTS idx_projects_updated
      ON projects (updated_at DESC);

    CREATE TABLE IF NOT EXISTS shopping_items (
      id              TEXT PRIMARY KEY,
      project_id      TEXT NOT NULL,
      material_id     TEXT NOT NULL,
      name            TEXT NOT NULL,
      quantity        REAL NOT NULL,
      unit            TEXT NOT NULL,
      estimated_price REAL NOT NULL,
      purchased       INTEGER NOT NULL DEFAULT 0,
      notes           TEXT,
      created_at      TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_shopping_project
      ON shopping_items (project_id, purchased ASC, name ASC);
  `);
};
