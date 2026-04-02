import { getDb } from '@/db/client';
import type { ContractorContentReport, ModerationStatus, ModerationActionType, ReportReason } from '@/types/contractor';

function uuid(): string {
  return 'rpt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

const now = () => new Date().toISOString();

const REPORT_SELECT = `SELECT id, contractor_id as contractorId,
  reporter_note as reporterNote, reason,
  moderation_status as moderationStatus,
  moderation_note as moderationNote,
  action_taken as actionTaken,
  created_at as createdAt, updated_at as updatedAt
  FROM contractor_reports`;

export const contractorReportsRepo = {
  async create(contractorId: string, reason: ReportReason, note: string): Promise<string> {
    const db = await getDb();
    const id = uuid();
    const ts = now();
    await db.runAsync(
      `INSERT INTO contractor_reports (id, contractor_id, reporter_note, reason, moderation_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'open', ?, ?)`,
      [id, contractorId, note, reason, ts, ts]
    );
    return id;
  },

  async getByContractor(contractorId: string): Promise<ContractorContentReport[]> {
    const db = await getDb();
    return db.getAllAsync<ContractorContentReport>(
      REPORT_SELECT + ' WHERE contractor_id = ? ORDER BY created_at DESC',
      [contractorId]
    );
  },

  async getByStatus(status: ModerationStatus): Promise<ContractorContentReport[]> {
    const db = await getDb();
    return db.getAllAsync<ContractorContentReport>(
      REPORT_SELECT + ' WHERE moderation_status = ? ORDER BY created_at DESC',
      [status]
    );
  },

  async getAll(): Promise<ContractorContentReport[]> {
    const db = await getDb();
    return db.getAllAsync<ContractorContentReport>(
      REPORT_SELECT + ' ORDER BY created_at DESC'
    );
  },

  async updateStatus(id: string, status: ModerationStatus, note?: string, action?: ModerationActionType): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE contractor_reports SET moderation_status = ?, moderation_note = COALESCE(?, moderation_note), action_taken = COALESCE(?, action_taken), updated_at = ? WHERE id = ?',
      [status, note ?? null, action ?? null, now(), id]
    );
  },

  async getOpenCount(): Promise<number> {
    const db = await getDb();
    const r = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM contractor_reports WHERE moderation_status = ?', ['open']);
    return r?.c ?? 0;
  },

  async getCountByContractor(contractorId: string): Promise<number> {
    const db = await getDb();
    const r = await db.getFirstAsync<{ c: number }>(
      'SELECT COUNT(*) as c FROM contractor_reports WHERE contractor_id = ? AND moderation_status IN (?, ?)',
      [contractorId, 'open', 'under-review']
    );
    return r?.c ?? 0;
  },
};
