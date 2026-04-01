import type * as SQLite from 'expo-sqlite';

export async function migration_004(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS price_overrides (
      id           TEXT PRIMARY KEY,
      project_id   TEXT NOT NULL,
      target_type  TEXT NOT NULL,
      target_id    TEXT NOT NULL,
      override_price REAL NOT NULL,
      notes        TEXT,
      created_at   TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_price_overrides_project
      ON price_overrides(project_id);

    CREATE TABLE IF NOT EXISTS project_price_snapshots (
      id                  TEXT PRIMARY KEY,
      project_id          TEXT NOT NULL UNIQUE,
      region_code         TEXT NOT NULL,
      quality_tier        TEXT NOT NULL DEFAULT 'standard',
      labor_estimate_min  REAL NOT NULL DEFAULT 0,
      labor_estimate_max  REAL NOT NULL DEFAULT 0,
      material_estimate   REAL NOT NULL DEFAULT 0,
      tools_estimate      REAL NOT NULL DEFAULT 0,
      total_estimate_min  REAL NOT NULL DEFAULT 0,
      total_estimate_max  REAL NOT NULL DEFAULT 0,
      currency            TEXT NOT NULL DEFAULT 'PLN',
      snapshot_date       TEXT NOT NULL,
      created_at          TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_price_snapshots_project
      ON project_price_snapshots(project_id);
  `);
}
