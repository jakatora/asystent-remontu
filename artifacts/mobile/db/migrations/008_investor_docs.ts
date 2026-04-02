import type * as SQLite from 'expo-sqlite';

export async function migration_008(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS build_official_forms (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      form_key          TEXT NOT NULL,
      title             TEXT NOT NULL,
      explanation       TEXT NOT NULL DEFAULT '',
      process_phase     TEXT NOT NULL DEFAULT '',
      applicability     TEXT NOT NULL DEFAULT 'unknown',
      status            TEXT NOT NULL DEFAULT 'not-started',
      planned_date      TEXT,
      completed_date    TEXT,
      notes             TEXT NOT NULL DEFAULT '',
      official_link     TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_investor_docs (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      doc_group         TEXT NOT NULL DEFAULT 'personal-notes',
      title             TEXT NOT NULL,
      description       TEXT NOT NULL DEFAULT '',
      status            TEXT NOT NULL DEFAULT 'missing',
      stage_key         TEXT,
      file_ref          TEXT,
      notes             TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_decisions (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      title             TEXT NOT NULL,
      category          TEXT NOT NULL DEFAULT 'other',
      stage_key         TEXT,
      status            TEXT NOT NULL DEFAULT 'open',
      options_considered TEXT NOT NULL DEFAULT '',
      selected_option   TEXT NOT NULL DEFAULT '',
      reasoning         TEXT NOT NULL DEFAULT '',
      decision_date     TEXT,
      follow_up_questions TEXT NOT NULL DEFAULT '',
      warning_note      TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_questions (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      question_text     TEXT NOT NULL,
      stage_key         TEXT,
      target_role       TEXT NOT NULL DEFAULT '',
      priority          TEXT NOT NULL DEFAULT 'normal',
      is_answered       INTEGER NOT NULL DEFAULT 0,
      answer_text       TEXT NOT NULL DEFAULT '',
      follow_up_needed  INTEGER NOT NULL DEFAULT 0,
      linked_decision_id TEXT,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_completion_items (
      id                TEXT PRIMARY KEY,
      project_id        TEXT NOT NULL,
      item_key          TEXT NOT NULL,
      title             TEXT NOT NULL,
      applicability     TEXT NOT NULL DEFAULT 'unknown',
      status            TEXT NOT NULL DEFAULT 'missing',
      notes             TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_official_forms_unique ON build_official_forms(project_id, form_key);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_completion_items_unique ON build_completion_items(project_id, item_key);
    CREATE INDEX IF NOT EXISTS idx_official_forms_project ON build_official_forms(project_id);
    CREATE INDEX IF NOT EXISTS idx_investor_docs_project ON build_investor_docs(project_id);
    CREATE INDEX IF NOT EXISTS idx_decisions_project ON build_decisions(project_id);
    CREATE INDEX IF NOT EXISTS idx_questions_project ON build_questions(project_id);
    CREATE INDEX IF NOT EXISTS idx_completion_items_project ON build_completion_items(project_id);
  `);
}
