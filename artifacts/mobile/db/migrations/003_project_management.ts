import type * as SQLite from 'expo-sqlite';

async function columnExists(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string
): Promise<boolean> {
  const rows = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`
  );
  return rows.some((r) => r.name === column);
}

export const migration_003: (db: SQLite.SQLiteDatabase) => Promise<void> = async (db) => {
  const columns: Array<[string, string]> = [
    ['room_name', 'TEXT'],
    ['room_width', 'REAL'],
    ['room_length', 'REAL'],
    ['room_height', 'REAL'],
  ];

  for (const [col, type] of columns) {
    if (!(await columnExists(db, 'projects', col))) {
      await db.execAsync(`ALTER TABLE projects ADD COLUMN ${col} ${type}`);
    }
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS project_photos (
      id          TEXT PRIMARY KEY,
      project_id  TEXT NOT NULL,
      uri         TEXT NOT NULL,
      photo_type  TEXT NOT NULL DEFAULT 'during',
      caption     TEXT,
      created_at  TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_photos_project
      ON project_photos (project_id, photo_type);

    CREATE TABLE IF NOT EXISTS project_checklist (
      id           TEXT PRIMARY KEY,
      project_id   TEXT NOT NULL,
      step_index   INTEGER NOT NULL,
      title        TEXT NOT NULL,
      description  TEXT,
      completed    INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at   TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_checklist_project
      ON project_checklist (project_id, step_index ASC);

    CREATE TABLE IF NOT EXISTS project_activities (
      id           TEXT PRIMARY KEY,
      project_id   TEXT NOT NULL,
      action_type  TEXT NOT NULL,
      description  TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_activities_project
      ON project_activities (project_id, created_at DESC);
  `);
};
