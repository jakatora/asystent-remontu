import type * as SQLite from 'expo-sqlite';

export async function migration_005(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contractor_requests (
      id                    TEXT PRIMARY KEY,
      category_id           TEXT,
      category_name         TEXT,
      job_id                TEXT,
      job_name              TEXT,
      room_description      TEXT,
      work_description      TEXT NOT NULL,
      city                  TEXT NOT NULL,
      postal_code           TEXT,
      preferred_date        TEXT,
      budget_range          TEXT NOT NULL DEFAULT 'any',
      offer_mode            TEXT NOT NULL DEFAULT 'single',
      photo_refs            TEXT,
      notes                 TEXT,
      selected_contractor_ids TEXT,
      status                TEXT NOT NULL DEFAULT 'draft',
      estimated_match_count INTEGER,
      created_at            TEXT NOT NULL,
      updated_at            TEXT NOT NULL,
      sent_at               TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_contractors (
      id             TEXT PRIMARY KEY,
      contractor_id  TEXT NOT NULL UNIQUE,
      saved_at       TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contractor_requests_status ON contractor_requests(status);
    CREATE INDEX IF NOT EXISTS idx_saved_contractors_contractor ON saved_contractors(contractor_id);
  `);
}
