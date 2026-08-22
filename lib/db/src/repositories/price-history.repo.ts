import { and, asc, eq } from "drizzle-orm";

import type { Database } from "./types";
import {
  insertPriceHistorySchema,
  priceHistoryTable,
  type PriceHistory,
} from "../schema/price-history";
import {
  computePriceStats,
  computeProductPriceStatsGrosze,
  effectivePriceGrosze,
  type PriceStats,
  type PriceStatsGrosze,
} from "./helpers";
import { getCheapestOffer } from "./product-offers.repo";

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

/**
 * Historia cen produktu — WSZYSTKIE sklepy albo (gdy podano `store`) tylko jeden.
 * Chronologicznie (najstarsze najpierw). Warstwa ODCZYTU nad append-only logiem:
 * nic nie modyfikuje, zwraca surowe punkty do wykresu/statystyk.
 */
export async function getPriceHistoryForProduct(
  db: Database,
  productId: string,
  store?: string,
): Promise<PriceHistory[]> {
  const condition = store
    ? and(
        eq(priceHistoryTable.productId, productId),
        eq(priceHistoryTable.store, store),
      )
    : eq(priceHistoryTable.productId, productId);

  return db
    .select()
    .from(priceHistoryTable)
    .where(condition)
    .orderBy(asc(priceHistoryTable.fetchedAt));
}

/**
 * Statystyki cen produktu w GROSZACH (kontrakt warstwy odczytu /pricing/history):
 * najniższa/średnia historyczna, aktualna najtańsza oferta, różnica względem
 * dołka, % zmiana vs poprzedni pomiar oraz flaga prawdziwej promocji. Bierze
 * historię ze WSZYSTKICH sklepów i bieżącą najtańszą ofertę z katalogu — nic nie
 * zmyśla, wszystko z realnych rekordów.
 */
export async function getPriceStatsForProduct(
  db: Database,
  productId: string,
): Promise<PriceStatsGrosze> {
  const rows = await getPriceHistoryForProduct(db, productId);
  const cheapest = await getCheapestOffer(db, productId);
  const current = cheapest ? effectivePriceGrosze(cheapest) : null;
  return computeProductPriceStatsGrosze(rows, current);
}

export const priceHistoryRepository = {
  appendPrice,
  getHistory,
  getPriceStats,
  getPriceHistoryForProduct,
  getPriceStatsForProduct,
};
