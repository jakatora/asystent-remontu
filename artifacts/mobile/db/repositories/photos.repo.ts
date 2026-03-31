import { getDb } from '../client';
import type { ProjectPhotoRow } from '@/types/db';
import type { ProjectPhoto, PhotoType } from '@/types/domain';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';

function fromRow(row: ProjectPhotoRow): ProjectPhoto {
  return {
    id: row.id,
    projectId: row.project_id,
    uri: row.uri,
    photoType: row.photo_type as PhotoType,
    caption: row.caption ?? undefined,
    createdAt: row.created_at,
  };
}

export const photosRepo = {
  async findByProject(projectId: string): Promise<ProjectPhoto[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProjectPhotoRow>(
      'SELECT * FROM project_photos WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    return rows.map(fromRow);
  },

  async findByType(projectId: string, photoType: PhotoType): Promise<ProjectPhoto[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProjectPhotoRow>(
      'SELECT * FROM project_photos WHERE project_id = ? AND photo_type = ? ORDER BY created_at DESC',
      [projectId, photoType]
    );
    return rows.map(fromRow);
  },

  async insert(data: Omit<ProjectPhoto, 'id' | 'createdAt'>): Promise<string> {
    const db = await getDb();
    const id = generateId('photo');
    const now = nowISO();
    await db.runAsync(
      `INSERT INTO project_photos (id, project_id, uri, photo_type, caption, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.projectId, data.uri, data.photoType, data.caption ?? null, now]
    );
    return id;
  },

  async updateCaption(id: string, caption: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE project_photos SET caption = ? WHERE id = ?', [caption, id]);
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM project_photos WHERE id = ?', [id]);
  },

  async deleteByProject(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM project_photos WHERE project_id = ?', [projectId]);
  },

  async countByProject(projectId: string): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM project_photos WHERE project_id = ?',
      [projectId]
    );
    return row?.cnt ?? 0;
  },
};
