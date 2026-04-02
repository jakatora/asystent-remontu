import { getDb } from '@/db/client';
import type { ContractorBlock } from '@/types/contractor';

function uuid(): string {
  return 'blk-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

const now = () => new Date().toISOString();

export const contractorBlocksRepo = {
  async block(contractorId: string, reason?: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR IGNORE INTO contractor_blocks (id, contractor_id, reason, created_at) VALUES (?, ?, ?, ?)',
      [uuid(), contractorId, reason ?? null, now()]
    );
  },

  async unblock(contractorId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM contractor_blocks WHERE contractor_id = ?', [contractorId]);
  },

  async isBlocked(contractorId: string): Promise<boolean> {
    const db = await getDb();
    const r = await db.getFirstAsync<{ c: number }>(
      'SELECT COUNT(*) as c FROM contractor_blocks WHERE contractor_id = ?',
      [contractorId]
    );
    return (r?.c ?? 0) > 0;
  },

  async getAll(): Promise<ContractorBlock[]> {
    const db = await getDb();
    return db.getAllAsync<ContractorBlock>(
      'SELECT id, contractor_id as contractorId, reason, created_at as createdAt FROM contractor_blocks ORDER BY created_at DESC'
    );
  },

  async getBlockedIds(): Promise<string[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ contractorId: string }>(
      'SELECT contractor_id as contractorId FROM contractor_blocks'
    );
    return rows.map((r) => r.contractorId);
  },
};
