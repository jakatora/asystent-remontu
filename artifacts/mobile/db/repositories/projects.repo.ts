import { getDb } from '../client';
import type { ProjectRow } from '@/types/db';
import type { Project, CalculationResult } from '@/types/domain';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';

// ─── Serialization ───────────────────────────────────────────────────────────

function toRow(project: Project): readonly [
  string, string, string, string, string,
  string, string | null, string,
  number | null, number | null, string | null,
  string, string, string | null
] {
  return [
    project.id,
    project.name,
    project.jobId,
    project.jobName,
    project.categoryId,
    JSON.stringify(project.measurements),
    project.calculationResult ? JSON.stringify(project.calculationResult) : null,
    project.status,
    project.totalBudget ?? null,
    project.actualCost ?? null,
    project.notes ?? null,
    project.createdAt,
    project.updatedAt,
    project.syncedAt ?? null,
  ] as const;
}

function fromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    jobId: row.job_id,
    jobName: row.job_name,
    categoryId: row.category_id,
    measurements: JSON.parse(row.measurements) as Record<string, number>,
    calculationResult: row.calculation_result
      ? (JSON.parse(row.calculation_result) as CalculationResult)
      : undefined,
    status: row.status as Project['status'],
    totalBudget: row.total_budget ?? undefined,
    actualCost: row.actual_cost ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at ?? undefined,
  };
}

// ─── Repository ─────────────────────────────────────────────────────────────

export const projectsRepo = {
  async findAll(): Promise<Project[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProjectRow>(
      'SELECT * FROM projects ORDER BY updated_at DESC'
    );
    return rows.map(fromRow);
  },

  async findById(id: string): Promise<Project | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<ProjectRow>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    return row ? fromRow(row) : null;
  },

  async upsert(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const id = generateId('proj');
    const now = nowISO();
    const project: Project = { ...data, id, createdAt: now, updatedAt: now };

    await db.runAsync(
      `INSERT INTO projects
         (id, name, job_id, job_name, category_id, measurements, calculation_result,
          status, total_budget, actual_cost, notes, created_at, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      toRow(project) as unknown as SQLiteValue[]
    );
    return id;
  },

  async update(project: Project): Promise<void> {
    const db = await getDb();
    const updated: Project = { ...project, updatedAt: nowISO() };

    await db.runAsync(
      `INSERT OR REPLACE INTO projects
         (id, name, job_id, job_name, category_id, measurements, calculation_result,
          status, total_budget, actual_cost, notes, created_at, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      toRow(updated) as unknown as SQLiteValue[]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
  },

  async markSynced(id: string, syncedAt: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE projects SET synced_at = ? WHERE id = ?',
      [syncedAt, id]
    );
  },
};

// Internal type alias to satisfy expo-sqlite's parameter type
type SQLiteValue = string | number | null | boolean | Uint8Array;
