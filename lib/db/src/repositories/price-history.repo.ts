import { and, asc, eq } from "drizzle-orm";

import type { Database } from "./types";
import {
  insertPriceHistorySchema,
  priceHistoryTable,
  type PriceHistory,
} from "../schema/price-history";
import { computePriceStats, type PriceStats } from "./helpers";

/**
 * Dopisuje odczyt ceny. APPEND-ONLY: tabela nigdy nie jest aktualizowana ani
 * czyszczona — każdy odczyt to nowy, niezmienny rekord.
 */
export async function appendPrice(
  db: Database,
  input: unknown,
): Promise<PriceHistory> {
  const parsed = insertPriceHistorySchema.parse(input);
  const inserted = await db
    .insert(priceHistoryTable)
    .values(parsed)
    .returning();
  return inserted[0]!;
}

/**
 * Pełna historia cen produktu w danym sklepie, chronologicznie (najstarsze
 * najpierw) — gotowa do wykresu trendu.
 */
export async function getHistory(
  db: Database,
  productId: string,
  store: string,
): Promise<PriceHistory[]> {
  return db
    .select()
    .from(priceHistoryTable)
    .where(
      and(
        eq(priceHistoryTable.productId, productId),
        eq(priceHistoryTable.store, store),
      ),
    )
    .orderBy(asc(priceHistoryTable.fetchedAt));
}

/** Statystyki cen (min, avg, ostatnia zmiana) produktu w sklepie. */
export async function getPriceStats(
  db: Database,
  productId: string,
  store: string,
): Promise<PriceStats> {
  const rows = await getHistory(db, productId, store);
  return computePriceStats(rows);
}

export const priceHistoryRepository = {
  appendPrice,
  getHistory,
  getPriceStats,
};
