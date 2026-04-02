import type * as SQLite from 'expo-sqlite';
import { migration_001 } from './001_initial';
import { migration_002 } from './002_shopping_extended';
import { migration_003 } from './003_project_management';
import { migration_004 } from './004_pricing';
import { migration_005 } from './005_contractor';
import { migration_006 } from './006_house_build';
import { migration_007 } from './007_timeline_budget';
import { migration_008 } from './008_investor_docs';
import { migration_009 } from './009_utility_plans';
import { migration_010 } from './010_house_build_pricing';
import { migration_011 } from './011_house_build_content_admin';

const MIGRATIONS: Array<{
  version: number;
  run: (db: SQLite.SQLiteDatabase) => Promise<void>;
}> = [
  { version: 1, run: migration_001 },
  { version: 2, run: migration_002 },
  { version: 3, run: migration_003 },
  { version: 4, run: migration_004 },
  { version: 5, run: migration_005 },
  { version: 6, run: migration_006 },
  { version: 7, run: migration_007 },
  { version: 8, run: migration_008 },
  { version: 9, run: migration_009 },
  { version: 10, run: migration_010 },
  { version: 11, run: migration_011 },
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
