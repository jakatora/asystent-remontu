import { eq, ilike, isNull } from "drizzle-orm";

import type { Database } from "./types";
import {
  insertProductSchema,
  productsTable,
  type Product,
} from "../schema/products";
import { normalizeProductName, resolveUpsertKey } from "./helpers";

// Wejście upsertu — normalized_name jest wyliczane z name, więc opcjonalne.
const upsertProductInput = insertProductSchema.partial({ normalizedName: true });

async function findByColumn(
  db: Database,
  field: "ean" | "gtin",
  value: string,
): Promise<Product | undefined> {
  const col = field === "ean" ? productsTable.ean : productsTable.gtin;
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(col, value))
    .limit(1);
  return rows[0];
}

/**
 * Wstawia lub aktualizuje produkt, dopasowując po kodzie: NAJPIERW EAN, potem
 * GTIN. NIGDY nie łączy po samej nazwie — gdy brak obu kodów, zawsze powstaje
 * nowy rekord. `normalized_name` liczone jest z `name`, żeby wyszukiwanie było
 * spójne.
 */
export async function upsertByEanOrGtin(
  db: Database,
  input: unknown,
): Promise<Product> {
  const parsed = upsertProductInput.parse(input);
  const normalizedName =
    parsed.normalizedName ?? normalizeProductName(parsed.name);
  const values = { ...parsed, normalizedName };

  const key = resolveUpsertKey(parsed);
  if (key) {
    const existing = await findByColumn(db, key.field, key.value);
    if (existing) {
      const updated = await db
        .update(productsTable)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(productsTable.id, existing.id))
        .returning();
      return updated[0]!;
    }
  }

  const inserted = await db.insert(productsTable).values(values).returning();
  return inserted[0]!;
}

export async function findById(
  db: Database,
  id: string,
): Promise<Product | undefined> {
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  return rows[0];
}

/** Produkty w kategorii; gdy `category` jest null, zwraca bez kategorii. */
export async function findByCategory(
  db: Database,
  category: string | null,
): Promise<Product[]> {
  return db
    .select()
    .from(productsTable)
    .where(
      category === null
        ? isNull(productsTable.category)
        : eq(productsTable.category, category),
    )
    .orderBy(productsTable.name);
}

/**
 * Wyszukuje po znormalizowanej nazwie (substring, case-insensitive). Zapytanie
 * jest normalizowane tą samą funkcją co zapis, więc np. "Farba Śnieżka" i
 * "farba sniezka" trafiają w te same rekordy.
 */
export async function searchByNormalizedName(
  db: Database,
  query: string,
): Promise<Product[]> {
  const normalized = normalizeProductName(query);
  if (!normalized) return [];
  return db
    .select()
    .from(productsTable)
    .where(ilike(productsTable.normalizedName, `%${normalized}%`))
    .orderBy(productsTable.normalizedName);
}

export const productsRepository = {
  upsertByEanOrGtin,
  findById,
  findByCategory,
  searchByNormalizedName,
};
