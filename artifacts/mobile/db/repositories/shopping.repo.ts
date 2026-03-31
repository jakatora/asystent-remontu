import { getDb } from '../client';
import type { ShoppingItemRow } from '@/types/db';
import type { ShoppingItem, ShoppingItemType, ShoppingTier } from '@/types/domain';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';

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
    owned: row.owned === 1,
    itemType: (row.item_type as ShoppingItemType) ?? 'material',
    tier: (row.tier as ShoppingTier) ?? 'standard',
    category: row.category ?? undefined,
    customPrice: row.custom_price ?? undefined,
    customQuantity: row.custom_quantity ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export const shoppingRepo = {
  async findByProject(projectId: string): Promise<ShoppingItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ShoppingItemRow>(
      `SELECT * FROM shopping_items
       WHERE project_id = ?
       ORDER BY owned ASC, purchased ASC, item_type ASC, name ASC`,
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
         (id, project_id, material_id, name, quantity, unit, estimated_price,
          purchased, notes, created_at, owned, item_type, tier, category,
          custom_price, custom_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        item.owned ? 1 : 0,
        item.itemType ?? 'material',
        item.tier ?? 'standard',
        item.category ?? null,
        item.customPrice ?? null,
        item.customQuantity ?? null,
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

  async setOwned(id: string, owned: boolean): Promise<void> {
    const db = await getDb();
    if (owned) {
      await db.runAsync(
        'UPDATE shopping_items SET owned = 1, purchased = 0 WHERE id = ?',
        [id]
      );
    } else {
      await db.runAsync(
        'UPDATE shopping_items SET owned = 0 WHERE id = ?',
        [id]
      );
    }
  },

  async updatePrice(id: string, price: number): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE shopping_items SET custom_price = ? WHERE id = ?',
      [price, id]
    );
  },

  async updateQuantity(id: string, quantity: number): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE shopping_items SET custom_quantity = ? WHERE id = ?',
      [quantity, id]
    );
  },

  async setTier(id: string, tier: ShoppingTier): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE shopping_items SET tier = ? WHERE id = ?',
      [tier, id]
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
