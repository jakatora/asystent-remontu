import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { productsTable } from "./products";

// Append-only log cen — każdy odczyt ceny to nowy rekord, nigdy nadpisywany.
// Pozwala odtworzyć trend/historię cen produktu w sklepie.
export const priceHistoryTable = pgTable(
  "price_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    store: text("store").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }),
    promoPrice: numeric("promo_price", { precision: 10, scale: 2 }),
    unit: text("unit"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    source: text("source"),
  },
  (table) => [
    index("price_history_product_id_idx").on(table.productId),
    index("price_history_product_fetched_idx").on(
      table.productId,
      table.fetchedAt,
    ),
  ],
);

export const insertPriceHistorySchema = createInsertSchema(
  priceHistoryTable,
).omit({
  id: true,
});
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistoryTable.$inferSelect;
