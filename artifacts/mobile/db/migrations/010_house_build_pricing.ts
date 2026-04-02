import type * as SQLite from 'expo-sqlite';

export async function migration_010(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS build_price_references (
      id              TEXT PRIMARY KEY,
      category        TEXT NOT NULL,
      stage_key       TEXT,
      item_key        TEXT NOT NULL,
      label           TEXT NOT NULL,
      unit            TEXT NOT NULL DEFAULT '',
      price_min       REAL NOT NULL DEFAULT 0,
      price_max       REAL NOT NULL DEFAULT 0,
      baseline_price  REAL NOT NULL DEFAULT 0,
      currency        TEXT NOT NULL DEFAULT 'PLN',
      region_code     TEXT NOT NULL DEFAULT 'PL',
      region_label    TEXT NOT NULL DEFAULT '',
      source_name     TEXT NOT NULL DEFAULT '',
      source_type     TEXT NOT NULL DEFAULT '',
      source_url      TEXT NOT NULL DEFAULT '',
      last_updated    TEXT NOT NULL DEFAULT '',
      notes           TEXT NOT NULL DEFAULT '',
      confidence_note TEXT NOT NULL DEFAULT '',
      active          INTEGER NOT NULL DEFAULT 1,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_price_ref_item_key ON build_price_references (item_key);
    CREATE INDEX IF NOT EXISTS idx_price_ref_category ON build_price_references (category);
    CREATE INDEX IF NOT EXISTS idx_price_ref_stage ON build_price_references (stage_key);

    CREATE TABLE IF NOT EXISTS build_price_overrides (
      id                 TEXT PRIMARY KEY,
      project_id         TEXT NOT NULL,
      reference_id       TEXT NOT NULL,
      item_key           TEXT NOT NULL,
      override_min       REAL,
      override_max       REAL,
      override_baseline  REAL,
      label              TEXT NOT NULL DEFAULT '',
      notes              TEXT NOT NULL DEFAULT '',
      created_at         TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_price_override_proj_ref ON build_price_overrides (project_id, reference_id);
    CREATE INDEX IF NOT EXISTS idx_price_override_proj ON build_price_overrides (project_id);
  `);
}
