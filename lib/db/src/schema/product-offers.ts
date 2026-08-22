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

// Aktualna oferta cenowa produktu w danym sklepie (nadpisywana przy odświeżeniu).
// Historia zmian trafia do price_history (append-only).
export const productOffersTable = pgTable(
  "product_offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    store: text("store").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }),
    promoPrice: numeric("promo_price", { precision: 10, scale: 2 }),
    regularPrice: numeric("regular_price", { precision: 10, scale: 2 }),
    unit: text("unit"),
    packageSize: numeric("package_size"),
    pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 4 }),
    productUrl: text("product_url"),
    availability: text("availability"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    source: text("source"),
  },
  (table) => [
    index("product_offers_product_id_idx").on(table.productId),
    index("product_offers_store_idx").on(table.store),
  ],
);

export const insertProductOfferSchema = createInsertSchema(
  productOffersTable,
).omit({
  id: true,
  fetchedAt: true,
});
export type InsertProductOffer = z.infer<typeof insertProductOfferSchema>;
export type ProductOffer = typeof productOffersTable.$inferSelect;
