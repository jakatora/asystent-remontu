import type * as SQLite from 'expo-sqlite';

export async function migration_007(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS build_timeline_stages (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      stage_key         TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'not-started',
      custom_name       TEXT,
      sort_order        INTEGER NOT NULL DEFAULT 0,
      estimated_weeks   INTEGER,
      planned_start     TEXT,
      planned_end       TEXT,
      actual_start      TEXT,
      actual_end        TEXT,
      management_mode   TEXT NOT NULL DEFAULT 'self',
      notes             TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_budget_items (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      stage_key         TEXT NOT NULL,
      category          TEXT NOT NULL DEFAULT 'custom',
      label             TEXT NOT NULL,
      amount_low        REAL,
      amount_high       REAL,
      user_override     REAL,
      notes             TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_budget_notes (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      stage_key         TEXT NOT NULL,
      text              TEXT NOT NULL,
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_milestones (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      key               TEXT NOT NULL,
      label             TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'pending',
      planned_date      TEXT,
      completed_date    TEXT,
      notes             TEXT NOT NULL DEFAULT '',
      sort_order        INTEGER NOT NULL DEFAULT 0,
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_timeline_notes (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      stage_key         TEXT NOT NULL,
      note_type         TEXT NOT NULL DEFAULT 'custom',
      text              TEXT NOT NULL,
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_professional_plans (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      stage_key         TEXT NOT NULL,
      role              TEXT NOT NULL,
      need_state        TEXT NOT NULL DEFAULT 'not-decided',
      contractor_name   TEXT,
      notes             TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_energy_strategy (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL UNIQUE,
      heating_concept   TEXT NOT NULL DEFAULT '',
      ventilation_concept TEXT NOT NULL DEFAULT '',
      insulation_notes  TEXT NOT NULL DEFAULT '',
      window_standard   TEXT NOT NULL DEFAULT '',
      is_decided        INTEGER NOT NULL DEFAULT 0,
      updated_at        TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_timeline_stages_unique ON build_timeline_stages(project_id, stage_key);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_milestones_unique ON build_milestones(project_id, key);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_plans_unique ON build_professional_plans(project_id, stage_key, role);

    CREATE INDEX IF NOT EXISTS idx_timeline_stages_project ON build_timeline_stages(project_id);
    CREATE INDEX IF NOT EXISTS idx_budget_items_project ON build_budget_items(project_id);
    CREATE INDEX IF NOT EXISTS idx_budget_items_stage ON build_budget_items(project_id, stage_key);
    CREATE INDEX IF NOT EXISTS idx_budget_notes_project ON build_budget_notes(project_id);
    CREATE INDEX IF NOT EXISTS idx_milestones_project ON build_milestones(project_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_notes_project ON build_timeline_notes(project_id);
    CREATE INDEX IF NOT EXISTS idx_professional_plans_project ON build_professional_plans(project_id);
  `);
}
