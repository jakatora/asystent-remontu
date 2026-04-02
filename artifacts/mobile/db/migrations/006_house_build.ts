import type * as SQLite from 'expo-sqlite';

export async function migration_006(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS house_build_projects (
      id                     TEXT PRIMARY KEY,
      name                   TEXT NOT NULL,
      status                 TEXT NOT NULL DEFAULT 'planning',
      land_context           TEXT NOT NULL DEFAULT '{}',
      planning_context       TEXT NOT NULL DEFAULT '{}',
      current_stage_id       TEXT,
      notes                  TEXT NOT NULL DEFAULT '',
      created_at             TEXT NOT NULL,
      updated_at             TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_checklist_items (
      id                     TEXT PRIMARY KEY,
      project_id             TEXT NOT NULL,
      stage_key              TEXT NOT NULL,
      title                  TEXT NOT NULL,
      description            TEXT,
      completed              INTEGER NOT NULL DEFAULT 0,
      completed_at           TEXT,
      priority               TEXT NOT NULL DEFAULT 'normal',
      requires_professional  INTEGER NOT NULL DEFAULT 0,
      warning_category       TEXT,
      created_at             TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_documents (
      id                     TEXT PRIMARY KEY,
      project_id             TEXT NOT NULL,
      stage_key              TEXT NOT NULL,
      name                   TEXT NOT NULL,
      description            TEXT NOT NULL DEFAULT '',
      status                 TEXT NOT NULL DEFAULT 'missing',
      is_required            INTEGER NOT NULL DEFAULT 1,
      obtained_at            TEXT,
      created_at             TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_utilities (
      id                     TEXT PRIMARY KEY,
      project_id             TEXT NOT NULL,
      utility_type           TEXT NOT NULL,
      provider_name          TEXT NOT NULL DEFAULT '',
      status                 TEXT NOT NULL DEFAULT 'not-started',
      application_date       TEXT,
      connection_date        TEXT,
      notes                  TEXT NOT NULL DEFAULT '',
      created_at             TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_build_checklist_project ON build_checklist_items(project_id);
    CREATE INDEX IF NOT EXISTS idx_build_checklist_stage ON build_checklist_items(stage_key);
    CREATE INDEX IF NOT EXISTS idx_build_documents_project ON build_documents(project_id);
    CREATE INDEX IF NOT EXISTS idx_build_utilities_project ON build_utilities(project_id);
  `);
}
