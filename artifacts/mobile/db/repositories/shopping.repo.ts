import { getDb } from '../client';
import type { ShoppingItemRow } from '@/types/db';
import type { ShoppingItem } from '@/types/domain';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';

// ─── Serialization ───────────────────────────────────────────────────────────

function fromRow(row: ShoppingItemRow): ShoppingItem {
  return {
    id: row.id,
    projectId: row.project_id,
    materialId: row.material_id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    estimatedPrice: row.estimated_price,
    purchased: row.purchased === 1,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

// ─── Repository ─────────────────────────────────────────────────────────────

export const shoppingRepo = {
  async findByProject(projectId: string): Promise<ShoppingItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ShoppingItemRow>(
      `SELECT * FROM shopping_items
       WHERE project_id = ?
       ORDER BY purchased ASC, name ASC`,
      [projectId]
    );
    return rows.map(fromRow);
  },

  async insert(item: Omit<ShoppingItem, 'id'>): Promise<string> {
    const db = await getDb();
    const id = generateId('shop');
    const createdAt = item.createdAt || nowISO();

    await db.runAsync(
      `INSERT INTO shopping_items
         (id, project_id, material_id, name, quantity, unit, estimated_price, purchased, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.projectId,
        item.materialId,
        item.name,
        item.quantity,
        item.unit,
        item.estimatedPrice,
        item.purchased ? 1 : 0,
        item.notes ?? null,
        createdAt,
      ]
    );
    return id;
  },

  async insertMany(items: Omit<ShoppingItem, 'id'>[]): Promise<string[]> {
    const ids: string[] = [];
    for (const item of items) {
      const id = await this.insert(item);
      ids.push(id);
    }
    return ids;
  },

  async toggle(id: string, purchased: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE shopping_items SET purchased = ? WHERE id = ?',
      [purchased ? 1 : 0, id]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM shopping_items WHERE id = ?', [id]);
  },

  async deleteByProject(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM shopping_items WHERE project_id = ?', [projectId]);
  },
};
