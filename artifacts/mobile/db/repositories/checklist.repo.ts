import { getDb } from '../client';
import type { ProjectChecklistRow } from '@/types/db';
import type { ChecklistItem } from '@/types/domain';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';

function fromRow(row: ProjectChecklistRow): ChecklistItem {
  return {
    id: row.id,
    projectId: row.project_id,
    stepIndex: row.step_index,
    title: row.title,
    description: row.description ?? undefined,
    completed: row.completed === 1,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
  };
}

export const checklistRepo = {
  async findByProject(projectId: string): Promise<ChecklistItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProjectChecklistRow>(
      'SELECT * FROM project_checklist WHERE project_id = ? ORDER BY step_index ASC',
      [projectId]
    );
    return rows.map(fromRow);
  },

  async insert(data: Omit<ChecklistItem, 'id' | 'createdAt'>): Promise<string> {
    const db = await getDb();
    const id = generateId('chk');
    const now = nowISO();
    await db.runAsync(
      `INSERT INTO project_checklist
         (id, project_id, step_index, title, description, completed, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.projectId,
        data.stepIndex,
        data.title,
        data.description ?? null,
        data.completed ? 1 : 0,
        data.completedAt ?? null,
        now,
      ]
    );
    return id;
  },

  async insertMany(items: Omit<ChecklistItem, 'id' | 'createdAt'>[]): Promise<string[]> {
    const ids: string[] = [];
    for (const item of items) {
      const id = await this.insert(item);
      ids.push(id);
    }
    return ids;
  },

  async toggle(id: string, completed: boolean): Promise<void> {
    const db = await getDb();
    const completedAt = completed ? nowISO() : null;
    await db.runAsync(
      'UPDATE project_checklist SET completed = ?, completed_at = ? WHERE id = ?',
      [completed ? 1 : 0, completedAt, id]
    );
  },

  async deleteByProject(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM project_checklist WHERE project_id = ?', [projectId]);
  },

  async completedCount(projectId: string): Promise<{ completed: number; total: number }> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ total: number; done: number }>(
      `SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as done
       FROM project_checklist WHERE project_id = ?`,
      [projectId]
    );
    return { completed: row?.done ?? 0, total: row?.total ?? 0 };
  },
};
