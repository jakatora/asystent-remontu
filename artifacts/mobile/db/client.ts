import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations/runner';
import { captureError } from '@/lib/sentry';

let _db: SQLite.SQLiteDatabase | null = null;
let _initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync('remont_v2.db');
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await runMigrations(db);
      _db = db;
      return db;
    } catch (error) {
      _initPromise = null;
      captureError(error, { context: 'db_init' });
      throw error;
    }
  })();

  return _initPromise;
}

export function _resetDbForTest(): void {
  _db = null;
  _initPromise = null;
}
