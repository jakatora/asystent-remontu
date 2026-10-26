import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations/runner';
import { captureError } from '@/lib/sentry';
import { Platform } from 'react-native';
import { queuedDatabase, type DatabaseConnection } from './connection';
import { sharedWebDatabase } from './webShared';

let _db: DatabaseConnection | null = null;
let _initPromise: Promise<DatabaseConnection> | null = null;
let _shared: ReturnType<typeof sharedWebDatabase> | null = null;
const browserSession = globalThis as typeof globalThis & { __remontWebDatabaseV1?: ReturnType<typeof sharedWebDatabase> };

async function openLocalDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('remont_v2.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  return db;
}

export async function getDb(): Promise<DatabaseConnection> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      if (Platform.OS === 'web') {
        // Fast Refresh must not leave a second queued coordinator in this tab.
        _shared ??= browserSession.__remontWebDatabaseV1 ??= sharedWebDatabase(openLocalDatabase);
        await _shared.ready();
        _db = _shared.connection;
      } else _db = queuedDatabase(await openLocalDatabase(), () => {});
      return _db;
    } catch (error) {
      _initPromise = null;
      captureError(error, { context: 'db_init' });
      throw error;
    }
  })();

  return _initPromise;
}

export function subscribeDatabaseChanges(listener: () => void): () => void {
  return _shared?.subscribe(listener) ?? (() => {});
}

export function _resetDbForTest(): void {
  _db = null;
  _initPromise = null;
  _shared?.dispose();
  _shared = null;
  delete browserSession.__remontWebDatabaseV1;
}
