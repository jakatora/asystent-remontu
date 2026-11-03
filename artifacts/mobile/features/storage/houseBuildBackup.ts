import { z } from 'zod';
import type { DatabaseCommand, DatabaseConnection } from '../../db/connection';
import { HOUSE_BACKUP_TABLES } from './houseBuildBackupSchema';
import { canonical, checkBackupSize, type BackupRow } from './projectBackup';

type HouseTable = keyof typeof HOUSE_BACKUP_TABLES;
type HouseRows = Record<HouseTable, BackupRow[]>;
const tables = Object.keys(HOUSE_BACKUP_TABLES) as HouseTable[];
const columns = Object.fromEntries(
  tables.map(table => [table, Object.keys(HOUSE_BACKUP_TABLES[table].shape)]),
) as Record<HouseTable, string[]>;

export const HOUSE_BACKUP_FORMAT = 'asystent-remontu-house-build';

export interface HouseBuildBackup {
  format: typeof HOUSE_BACKUP_FORMAT;
  version: 1;
  createdAt: string;
  tables: HouseRows;
}

const envelope = z.object({
  format: z.literal(HOUSE_BACKUP_FORMAT),
  version: z.literal(1),
  createdAt: z.string().max(50).refine(value => Number.isFinite(Date.parse(value))),
  tables: z.object(Object.fromEntries(
    tables.map(table => [table, z.array(HOUSE_BACKUP_TABLES[table]).max(10_000)]),
  )).strict(),
}).strict();

export function parseHouseBuildBackup(raw: string): HouseBuildBackup {
  checkBackupSize(raw);
  let backup: HouseBuildBackup;
  try {
    backup = envelope.parse(JSON.parse(raw)) as unknown as HouseBuildBackup;
  } catch {
    throw Error('invalid_house_build_backup');
  }
  const projects = new Set(backup.tables.house_build_projects.map(row => row.id));
  const requests = new Set(backup.tables.hb_stage_contractor_needs.map(row => row.request_id));
  const requestIds = new Set(backup.tables.contractor_requests.map(row => row.id));
  if (projects.size > 1000) throw Error('invalid_house_build_backup');
  let rowCount = 0;
  for (const table of tables) {
    const rows = backup.tables[table];
    rowCount += rows.length;
    if (new Set(rows.map(row => row.id)).size !== rows.length) throw Error('invalid_house_build_backup');
    if (table === 'contractor_requests') {
      if (rows.some(row => !requests.has(row.id))) throw Error('invalid_house_build_backup');
    } else if (table !== 'house_build_projects' && rows.some(row => !projects.has(row.project_id))) {
      throw Error('invalid_house_build_backup');
    }
  }
  if (rowCount > 10_000 || [...requests].some(id => id !== null && !requestIds.has(id))) {
    throw Error('invalid_house_build_backup');
  }
  return backup;
}

// One SQLite statement gives a consistent view of the projects and their rows.
// source: https://www.sqlite.org/isolation.html
const snapshotSql = tables.map(table => {
  const fields = columns[table].map(column => `'${column}', t."${column}"`).join(', ');
  const source = table === 'house_build_projects'
    ? 'house_build_projects t'
    : table === 'contractor_requests'
      ? 'contractor_requests t WHERE EXISTS (SELECT 1 FROM hb_stage_contractor_needs n JOIN house_build_projects p ON p.id = n.project_id WHERE n.request_id = t.id)'
      : `"${table}" t JOIN house_build_projects p ON p.id = t.project_id`;
  return `SELECT '${table}' AS name, json_object(${fields}) AS body FROM ${source}`;
}).join(' UNION ALL ');

async function readRows(db: DatabaseConnection): Promise<HouseRows> {
  const result = Object.fromEntries(tables.map(table => [table, []])) as unknown as HouseRows;
  for (const row of await db.getAllAsync<{ name: HouseTable; body: string }>(snapshotSql)) {
    result[row.name].push(JSON.parse(row.body));
  }
  return result;
}

export async function readHouseBuildBackup(db: DatabaseConnection): Promise<HouseBuildBackup> {
  const rows = await readRows(db);
  const requestIds = new Set(rows.contractor_requests.map(row => row.id));
  // An old stage may still reference a draft the user has already deleted.
  rows.hb_stage_contractor_needs = rows.hb_stage_contractor_needs.map(row =>
    requestIds.has(row.request_id) ? row : { ...row, request_id: null },
  );
  return parseHouseBuildBackup(JSON.stringify({
    format: HOUSE_BACKUP_FORMAT, version: 1, createdAt: new Date().toISOString(), tables: rows,
  }));
}

export async function importHouseBuildBackup(backup: HouseBuildBackup, db: DatabaseConnection): Promise<number> {
  const validated = parseHouseBuildBackup(JSON.stringify(backup));
  const projects = validated.tables.house_build_projects;
  if (!projects.length) throw Error('backup_empty');

  const existing = new Set((await db.getAllAsync<{ id: string }>('SELECT id FROM house_build_projects')).map(row => row.id));
  if (projects.some(row => existing.has(String(row.id)))) throw Error('backup_project_conflict');
  const commands: DatabaseCommand[] = tables.flatMap(table => {
    const fields = columns[table];
    return validated.tables[table].map(row => ({
      sql: `INSERT INTO "${table}" (${fields.map(field => `"${field}"`).join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      params: fields.map(field => row[field]),
    }));
  });
  let writeError: unknown;
  try {
    await db.runBatchAsync(commands);
  } catch (error) {
    writeError = error;
  }

  let persisted: HouseRows;
  try {
    persisted = await readRows(db);
  } catch {
    throw Error('backup_import_unconfirmed');
  }
  const verified = tables.every(table => {
    const rows = new Map(persisted[table].map(row => [row.id, canonical(row)]));
    return validated.tables[table].every(row => rows.get(row.id) === canonical(row));
  });
  if (verified) return projects.length;
  if (writeError && !persisted.house_build_projects.some(row => projects.some(project => project.id === row.id))) {
    throw writeError;
  }
  throw Error('backup_import_unconfirmed');
}
