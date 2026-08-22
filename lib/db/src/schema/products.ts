import {
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Katalog produktów remontowych (materiały/narzędzia) zbierany z polskich sklepów.
// EAN/GTIN są nullable, ale unikalne gdy ustawione (Postgres traktuje NULL jako
// odrębne, więc unikalny indeks dopuszcza wiele rekordów bez kodu).
export const productsTable = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ean: text("ean"),
    gtin: text("gtin"),
    manufacturer: text("manufacturer"),
    brand: text("brand"),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    category: text("category"),
    subcategory: text("subcategory"),
    variant: text("variant"),
    packageSize: numeric("package_size"),
    packageUnit: text("package_unit"),
    technicalParameters: jsonb("technical_parameters"),
    imageUrl: text("image_url"),
    productUrl: text("product_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("products_ean_unique").on(table.ean),
    uniqueIndex("products_gtin_unique").on(table.gtin),
    index("products_normalized_name_idx").on(table.normalizedName),
    index("products_category_idx").on(table.category),
  ],
);

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
