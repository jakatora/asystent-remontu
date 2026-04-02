import type * as SQLite from 'expo-sqlite';

export async function migration_012(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS hb_stage_contractor_needs (
      id             TEXT PRIMARY KEY,
      project_id     TEXT NOT NULL,
      stage_key      TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'needed',
      request_id     TEXT,
      selected_contractor_id   TEXT,
      selected_contractor_name TEXT,
      notes          TEXT NOT NULL DEFAULT '',
      updated_at     TEXT NOT NULL,
      created_at     TEXT NOT NULL,
      UNIQUE(project_id, stage_key)
    );

    CREATE TABLE IF NOT EXISTS hb_stage_contractor_shortlist (
      id              TEXT PRIMARY KEY,
      project_id      TEXT NOT NULL,
      stage_key       TEXT NOT NULL,
      contractor_id   TEXT NOT NULL,
      contractor_name TEXT NOT NULL,
      note            TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL,
      UNIQUE(project_id, stage_key, contractor_id)
    );

    CREATE INDEX IF NOT EXISTS idx_hb_scn_project ON hb_stage_contractor_needs(project_id);
    CREATE INDEX IF NOT EXISTS idx_hb_scs_project ON hb_stage_contractor_shortlist(project_id);
    CREATE INDEX IF NOT EXISTS idx_hb_scs_stage ON hb_stage_contractor_shortlist(project_id, stage_key);
  `);
}
