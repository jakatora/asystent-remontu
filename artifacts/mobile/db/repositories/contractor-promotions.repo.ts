import { getDb } from '@/db/client';
import type { ContractorPromotion, PromotionScope } from '@/types/contractor';

function uuid(): string {
  return 'prm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

const now = () => new Date().toISOString();

const PROMO_SELECT = `SELECT id, contractor_id as contractorId, scope,
  scope_value as scopeValue, label, is_active as isActive,
  start_date as startDate, end_date as endDate, priority,
  created_at as createdAt
  FROM contractor_promotions`;

export const contractorPromotionsRepo = {
  async create(promo: Omit<ContractorPromotion, 'id' | 'createdAt'>): Promise<string> {
    const db = await getDb();
    const id = uuid();
    await db.runAsync(
      `INSERT INTO contractor_promotions (id, contractor_id, scope, scope_value, label, is_active, start_date, end_date, priority, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, promo.contractorId, promo.scope, promo.scopeValue ?? null, promo.label,
       promo.isActive ? 1 : 0, promo.startDate, promo.endDate ?? null, promo.priority, now()]
    );
    return id;
  },

  async getByContractor(contractorId: string): Promise<ContractorPromotion[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(PROMO_SELECT + ' WHERE contractor_id = ? ORDER BY priority DESC', [contractorId]);
    return rows.map((r: any) => ({ ...r, isActive: !!r.isActive }));
  },

  async getActive(): Promise<ContractorPromotion[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(PROMO_SELECT + ' WHERE is_active = 1 ORDER BY priority DESC');
    return rows.map((r: any) => ({ ...r, isActive: !!r.isActive }));
  },

  async getActiveByScope(scope: PromotionScope, scopeValue?: string): Promise<ContractorPromotion[]> {
    const db = await getDb();
    let query = PROMO_SELECT + ' WHERE is_active = 1 AND scope = ?';
    const params: any[] = [scope];
    if (scopeValue) {
      query += ' AND scope_value = ?';
      params.push(scopeValue);
    }
    query += ' ORDER BY priority DESC';
    const rows = await db.getAllAsync<any>(query, params);
    return rows.map((r: any) => ({ ...r, isActive: !!r.isActive }));
  },

  async deactivate(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE contractor_promotions SET is_active = 0 WHERE id = ?', [id]);
  },

  async getActiveCount(): Promise<number> {
    const db = await getDb();
    const r = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM contractor_promotions WHERE is_active = 1');
    return r?.c ?? 0;
  },

  async deleteByContractor(contractorId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM contractor_promotions WHERE contractor_id = ?', [contractorId]);
  },
};
