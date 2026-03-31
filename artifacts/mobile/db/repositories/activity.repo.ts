import { getDb } from '../client';
import type { ProjectActivityRow } from '@/types/db';
import type { ProjectActivity, ActivityAction } from '@/types/domain';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';

function fromRow(row: ProjectActivityRow): ProjectActivity {
  return {
    id: row.id,
    projectId: row.project_id,
    actionType: row.action_type as ActivityAction,
    description: row.description,
    createdAt: row.created_at,
  };
}

export const activityRepo = {
  async findByProject(projectId: string, limit = 20): Promise<ProjectActivity[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProjectActivityRow>(
      'SELECT * FROM project_activities WHERE project_id = ? ORDER BY created_at DESC LIMIT ?',
      [projectId, limit]
    );
    return rows.map(fromRow);
  },

  async findRecent(limit = 10): Promise<ProjectActivity[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProjectActivityRow>(
      'SELECT * FROM project_activities ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows.map(fromRow);
  },

  async insert(data: { projectId: string; actionType: ActivityAction; description: string }): Promise<string> {
    const db = await getDb();
    const id = generateId('act');
    const now = nowISO();
    await db.runAsync(
      `INSERT INTO project_activities (id, project_id, action_type, description, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.projectId, data.actionType, data.description, now]
    );
    return id;
  },

  async deleteByProject(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM project_activities WHERE project_id = ?', [projectId]);
  },
};
