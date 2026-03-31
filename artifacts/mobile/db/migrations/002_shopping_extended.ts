import type * as SQLite from 'expo-sqlite';

export const migration_002: (db: SQLite.SQLiteDatabase) => Promise<void> = async (db) => {
  await db.execAsync(`
    ALTER TABLE shopping_items ADD COLUMN owned INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE shopping_items ADD COLUMN item_type TEXT NOT NULL DEFAULT 'material';
    ALTER TABLE shopping_items ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard';
    ALTER TABLE shopping_items ADD COLUMN category TEXT;
    ALTER TABLE shopping_items ADD COLUMN custom_price REAL;
    ALTER TABLE shopping_items ADD COLUMN custom_quantity REAL;
  `);
};
