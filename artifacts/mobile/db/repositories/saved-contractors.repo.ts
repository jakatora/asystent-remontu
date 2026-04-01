import type { SavedContractor } from '@/types/contractor';
import { getDb } from '@/db/client';

function generateId(): string {
  return 'sav-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

interface SavedRow {
  id: string;
  contractor_id: string;
  saved_at: string;
}

function fromRow(row: SavedRow): SavedContractor {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    savedAt: row.saved_at,
  };
}

export const savedContractorsRepo = {
  async findAll(): Promise<SavedContractor[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<SavedRow>('SELECT * FROM saved_contractors ORDER BY saved_at DESC');
    return rows.map(fromRow);
  },

  async isSaved(contractorId: string): Promise<boolean> {
    const db = await getDb();
    const row = await db.getFirstAsync<SavedRow>('SELECT * FROM saved_contractors WHERE contractor_id = ?', [contractorId]);
    return !!row;
  },

  async save(contractorId: string): Promise<string> {
    const db = await getDb();
    const id = generateId();
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT OR IGNORE INTO saved_contractors (id, contractor_id, saved_at) VALUES (?, ?, ?)',
      [id, contractorId, now],
    );
    return id;
  },

  async remove(contractorId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM saved_contractors WHERE contractor_id = ?', [contractorId]);
  },
};
