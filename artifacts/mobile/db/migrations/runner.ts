import type * as SQLite from 'expo-sqlite';
import { migration_001 } from './001_initial';

// ─── Migration registry ──────────────────────────────────────────────────────
// To add a migration: append { version, run } here.

const MIGRATIONS: Array<{
  version: number;
  run: (db: SQLite.SQLiteDatabase) => Promise<void>;
}> = [
  { version: 1, run: migration_001 },
];

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Ensure version tracking table exists before anything else
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_versions (
      version    INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  for (const migration of MIGRATIONS) {
    const existing = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_versions WHERE version = ?',
      [migration.version]
    );

    if (!existing) {
      await migration.run(db);
      await db.runAsync(
        'INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)',
        [migration.version, new Date().toISOString()]
      );
    }
  }
}
