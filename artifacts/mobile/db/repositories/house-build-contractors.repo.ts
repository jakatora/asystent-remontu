import { getDb } from '@/db/client';
import type {
  ContractorNeedStatus,
  StageContractorNeed,
  StageContractorShortlistEntry,
} from '@/types/house-build';

function uuid(): string {
  return 'hbc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

const now = () => new Date().toISOString();

const NEED_SELECT = `SELECT id, project_id as projectId, stage_key as stageKey,
  status, request_id as requestId,
  selected_contractor_id as selectedContractorId,
  selected_contractor_name as selectedContractorName,
  notes, updated_at as updatedAt, created_at as createdAt
  FROM hb_stage_contractor_needs`;

const SHORTLIST_SELECT = `SELECT id, project_id as projectId, stage_key as stageKey,
  contractor_id as contractorId, contractor_name as contractorName,
  note, created_at as createdAt
  FROM hb_stage_contractor_shortlist`;

export const houseBuildContractorsRepo = {
  async getNeed(projectId: string, stageKey: string): Promise<StageContractorNeed | null> {
    const db = await getDb();
    return db.getFirstAsync<StageContractorNeed>(
      NEED_SELECT + ' WHERE project_id = ? AND stage_key = ?',
      [projectId, stageKey]
    );
  },

  async getAllNeeds(projectId: string): Promise<StageContractorNeed[]> {
    const db = await getDb();
    return db.getAllAsync<StageContractorNeed>(
      NEED_SELECT + ' WHERE project_id = ? ORDER BY stage_key',
      [projectId]
    );
  },

  async upsertNeed(
    projectId: string,
    stageKey: string,
    updates: Partial<Pick<StageContractorNeed, 'status' | 'requestId' | 'selectedContractorId' | 'selectedContractorName' | 'notes'>>
  ): Promise<void> {
    const db = await getDb();
    const ts = now();
    const id = uuid();
    await db.runAsync(
      `INSERT INTO hb_stage_contractor_needs
       (id, project_id, stage_key, status, request_id, selected_contractor_id, selected_contractor_name, notes, updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(project_id, stage_key) DO UPDATE SET
         status = COALESCE(?, hb_stage_contractor_needs.status),
         request_id = COALESCE(?, hb_stage_contractor_needs.request_id),
         selected_contractor_id = COALESCE(?, hb_stage_contractor_needs.selected_contractor_id),
         selected_contractor_name = COALESCE(?, hb_stage_contractor_needs.selected_contractor_name),
         notes = COALESCE(?, hb_stage_contractor_needs.notes),
         updated_at = ?`,
      [
        id, projectId, stageKey,
        updates.status ?? 'needed',
        updates.requestId ?? null,
        updates.selectedContractorId ?? null,
        updates.selectedContractorName ?? null,
        updates.notes ?? '',
        ts, ts,
        updates.status ?? null,
        updates.requestId ?? null,
        updates.selectedContractorId ?? null,
        updates.selectedContractorName ?? null,
        updates.notes ?? null,
        ts,
      ]
    );
  },

  async updateNeedStatus(projectId: string, stageKey: string, status: ContractorNeedStatus): Promise<void> {
    await this.upsertNeed(projectId, stageKey, { status });
  },

  async getShortlist(projectId: string, stageKey: string): Promise<StageContractorShortlistEntry[]> {
    const db = await getDb();
    return db.getAllAsync<StageContractorShortlistEntry>(
      SHORTLIST_SELECT + ' WHERE project_id = ? AND stage_key = ? ORDER BY created_at DESC',
      [projectId, stageKey]
    );
  },

  async getAllShortlists(projectId: string): Promise<StageContractorShortlistEntry[]> {
    const db = await getDb();
    return db.getAllAsync<StageContractorShortlistEntry>(
      SHORTLIST_SELECT + ' WHERE project_id = ? ORDER BY stage_key, created_at DESC',
      [projectId]
    );
  },

  async addToShortlist(
    projectId: string,
    stageKey: string,
    contractorId: string,
    contractorName: string,
    note: string
  ): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR IGNORE INTO hb_stage_contractor_shortlist
       (id, project_id, stage_key, contractor_id, contractor_name, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), projectId, stageKey, contractorId, contractorName, note, now()]
    );
  },

  async updateShortlistNote(id: string, note: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE hb_stage_contractor_shortlist SET note = ? WHERE id = ?', [note, id]);
  },

  async removeFromShortlist(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM hb_stage_contractor_shortlist WHERE id = ?', [id]);
  },

  async getShortlistCountByStage(projectId: string): Promise<Record<string, number>> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ stageKey: string; c: number }>(
      'SELECT stage_key as stageKey, COUNT(*) as c FROM hb_stage_contractor_shortlist WHERE project_id = ? GROUP BY stage_key',
      [projectId]
    );
    const result: Record<string, number> = {};
    for (const r of rows) result[r.stageKey] = r.c;
    return result;
  },

  async deleteAllForProject(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM hb_stage_contractor_needs WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM hb_stage_contractor_shortlist WHERE project_id = ?', [projectId]);
  },
};
