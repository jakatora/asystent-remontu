import type * as SQLite from 'expo-sqlite';

export async function migration_011(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS hb_admin_content_items (
      id            TEXT PRIMARY KEY,
      content_type  TEXT NOT NULL,
      content_key   TEXT NOT NULL,
      title         TEXT NOT NULL DEFAULT '',
      summary       TEXT NOT NULL DEFAULT '',
      body          TEXT NOT NULL DEFAULT '',
      stage_id      TEXT NOT NULL DEFAULT '',
      category      TEXT NOT NULL DEFAULT '',
      target_role   TEXT NOT NULL DEFAULT '',
      severity      TEXT NOT NULL DEFAULT '',
      source_id     TEXT NOT NULL DEFAULT '',
      source_text   TEXT NOT NULL DEFAULT '',
      active        INTEGER NOT NULL DEFAULT 1,
      last_reviewed TEXT NOT NULL DEFAULT '',
      last_updated  TEXT NOT NULL DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT '',
      notes         TEXT NOT NULL DEFAULT '',
      UNIQUE(content_type, content_key)
    );

    CREATE TABLE IF NOT EXISTS hb_admin_source_registry (
      id                TEXT PRIMARY KEY,
      source_name       TEXT NOT NULL DEFAULT '',
      source_type       TEXT NOT NULL DEFAULT 'other',
      source_url        TEXT NOT NULL DEFAULT '',
      region_relevance  TEXT NOT NULL DEFAULT '',
      reliability_level TEXT NOT NULL DEFAULT 'medium',
      notes             TEXT NOT NULL DEFAULT '',
      last_checked      TEXT NOT NULL DEFAULT '',
      active            INTEGER NOT NULL DEFAULT 1,
      created_at        TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS hb_admin_trust_disclaimers (
      id              TEXT PRIMARY KEY,
      disclaimer_key  TEXT NOT NULL UNIQUE,
      text            TEXT NOT NULL DEFAULT '',
      category        TEXT NOT NULL DEFAULT '',
      active          INTEGER NOT NULL DEFAULT 1,
      last_updated    TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS hb_admin_content_snapshots (
      id              TEXT PRIMARY KEY,
      label           TEXT NOT NULL DEFAULT '',
      notes           TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT '',
      snapshot_data   TEXT NOT NULL DEFAULT '{}',
      stage_count     INTEGER NOT NULL DEFAULT 0,
      formal_count    INTEGER NOT NULL DEFAULT 0,
      utilities_count INTEGER NOT NULL DEFAULT 0,
      decision_count  INTEGER NOT NULL DEFAULT 0,
      question_count  INTEGER NOT NULL DEFAULT 0,
      warning_count   INTEGER NOT NULL DEFAULT 0,
      active          INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_admin_content_type ON hb_admin_content_items(content_type);
    CREATE INDEX IF NOT EXISTS idx_admin_content_stage ON hb_admin_content_items(stage_id);
    CREATE INDEX IF NOT EXISTS idx_admin_content_active ON hb_admin_content_items(active);
    CREATE INDEX IF NOT EXISTS idx_admin_source_active ON hb_admin_source_registry(active);
    CREATE INDEX IF NOT EXISTS idx_admin_snapshot_active ON hb_admin_content_snapshots(active);
  `);
}
