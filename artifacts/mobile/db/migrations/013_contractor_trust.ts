import type * as SQLite from 'expo-sqlite';

export async function migration_013(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contractor_reviews (
      id                TEXT PRIMARY KEY,
      contractor_id     TEXT NOT NULL,
      rating            INTEGER NOT NULL,
      title             TEXT,
      comment           TEXT,
      author_name       TEXT,
      reviewer_type     TEXT NOT NULL DEFAULT 'anonymous',
      request_id        TEXT,
      moderation_status TEXT NOT NULL DEFAULT 'pending',
      is_visible        INTEGER NOT NULL DEFAULT 1,
      is_flagged        INTEGER NOT NULL DEFAULT 0,
      flag_reason       TEXT,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contractor_reports (
      id                TEXT PRIMARY KEY,
      contractor_id     TEXT NOT NULL,
      reporter_note     TEXT NOT NULL DEFAULT '',
      reason            TEXT NOT NULL,
      moderation_status TEXT NOT NULL DEFAULT 'open',
      moderation_note   TEXT,
      action_taken      TEXT,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contractor_blocks (
      id              TEXT PRIMARY KEY,
      contractor_id   TEXT NOT NULL UNIQUE,
      reason          TEXT,
      created_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contractor_promotions (
      id              TEXT PRIMARY KEY,
      contractor_id   TEXT NOT NULL,
      scope           TEXT NOT NULL,
      scope_value     TEXT,
      label           TEXT NOT NULL DEFAULT '',
      is_active       INTEGER NOT NULL DEFAULT 1,
      start_date      TEXT NOT NULL,
      end_date        TEXT,
      priority        INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cr_contractor ON contractor_reviews(contractor_id);
    CREATE INDEX IF NOT EXISTS idx_cr_moderation ON contractor_reviews(moderation_status);
    CREATE INDEX IF NOT EXISTS idx_crp_contractor ON contractor_reports(contractor_id);
    CREATE INDEX IF NOT EXISTS idx_crp_status ON contractor_reports(moderation_status);
    CREATE INDEX IF NOT EXISTS idx_cp_contractor ON contractor_promotions(contractor_id);
    CREATE INDEX IF NOT EXISTS idx_cp_active ON contractor_promotions(is_active);
  `);
}
