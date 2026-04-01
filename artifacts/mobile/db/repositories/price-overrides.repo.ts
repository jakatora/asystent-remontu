import { getDb } from '../client';
import type { PriceOverrideRow } from '@/types/db';
import type { PriceOverride } from '@/types/pricing';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';

function fromRow(row: PriceOverrideRow): PriceOverride {
  return {
    id: row.id,
    projectId: row.project_id,
    targetType: row.target_type as PriceOverride['targetType'],
    targetId: row.target_id,
    overridePrice: row.override_price,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export const priceOverridesRepo = {
  async findByProject(projectId: string): Promise<PriceOverride[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<PriceOverrideRow>(
      'SELECT * FROM price_overrides WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    return rows.map(fromRow);
  },

  async upsert(
    projectId: string,
    targetType: PriceOverride['targetType'],
    targetId: string,
    overridePrice: number,
    notes?: string
  ): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<PriceOverrideRow>(
      'SELECT * FROM price_overrides WHERE project_id = ? AND target_type = ? AND target_id = ?',
      [projectId, targetType, targetId]
    );

    if (existing) {
      await db.runAsync(
        'UPDATE price_overrides SET override_price = ?, notes = ? WHERE id = ?',
        [overridePrice, notes ?? null, existing.id]
      );
      return existing.id;
    }

    const id = generateId('pov');
    await db.runAsync(
      `INSERT INTO price_overrides (id, project_id, target_type, target_id, override_price, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, targetType, targetId, overridePrice, notes ?? null, nowISO()]
    );
    return id;
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM price_overrides WHERE id = ?', [id]);
  },

  async removeByTarget(projectId: string, targetType: PriceOverride['targetType'], targetId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'DELETE FROM price_overrides WHERE project_id = ? AND target_type = ? AND target_id = ?',
      [projectId, targetType, targetId]
    );
  },

  async clearProject(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM price_overrides WHERE project_id = ?', [projectId]);
  },
};
