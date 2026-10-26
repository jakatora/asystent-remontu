import type { SQLiteDatabase, SQLiteBindParams } from 'expo-sqlite';

export type DatabaseCommand = { sql: string; params?: SQLiteBindParams };
export type DatabaseConnection = Pick<SQLiteDatabase, 'execAsync' | 'runAsync' | 'getAllAsync' | 'getFirstAsync'> & {
  runBatchAsync(commands: readonly DatabaseCommand[]): Promise<void>;
};
export const DATABASE_METHODS = ['execAsync', 'runAsync', 'getAllAsync', 'getFirstAsync', 'runBatchAsync'] as const;
export type DatabaseMethod = typeof DATABASE_METHODS[number];

// source: https://www.sqlite.org/lang_transaction.html
/** One queue for local and remote callers; a batch owns the connection until
 * commit/rollback. Migrations run on the raw connection before it is shared. */
export function queuedDatabase(raw: Pick<SQLiteDatabase, 'execAsync' | 'runAsync' | 'getAllAsync' | 'getFirstAsync'>, changed: () => void): DatabaseConnection {
  let tail: Promise<unknown> = Promise.resolve();
  let fault: Error | null = null;
  const enqueue = <T>(task: () => Promise<T>) => {
    const result = tail.then(() => { if (fault) throw fault; return task(); }); tail = result.catch(() => {}); return result;
  };
  const check = (sql: unknown) => {
    if (typeof sql !== 'string' || !sql.trim() || sql.length > 1_000_000) throw Error('invalid_database_query');
    if (/(?:^|;)\s*(?:BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)\b/i.test(sql)) throw Error('use_database_batch');
  };
  const connection = Object.fromEntries(DATABASE_METHODS.filter(method => method !== 'runBatchAsync').map(method => [method, (...args: unknown[]) => enqueue(async () => {
    check(args[0]);
    const result = await (raw[method] as (...values: unknown[]) => Promise<unknown>).apply(raw, args);
    if (method === 'runAsync' || method === 'execAsync') changed();
    return result;
  })])) as DatabaseConnection;
  connection.runBatchAsync = commands => enqueue(async () => {
    if (!Array.isArray(commands) || commands.length > 20_000) throw Error('invalid_database_batch');
    commands.forEach(command => check(command.sql));
    await raw.execAsync('BEGIN TRANSACTION;');
    try {
      for (const command of commands) await raw.runAsync(command.sql, command.params ?? []);
      await raw.execAsync('COMMIT;');
    } catch (error) {
      try { await raw.execAsync('ROLLBACK;'); }
      catch { fault = Error('database_reload_required'); throw fault; }
      throw error;
    }
    changed();
  });
  return connection;
}
