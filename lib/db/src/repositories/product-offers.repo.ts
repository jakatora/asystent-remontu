import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "./types";
import {
  insertProductOfferSchema,
  productOffersTable,
  type ProductOffer,
} from "../schema/product-offers";
import { priceHistoryTable } from "../schema/price-history";
import { pickCheapestOffer, sortOffersWithCheapest } from "./helpers";

export type OfferWithCheapest = ProductOffer & {
  isCheapest: boolean;
  effectivePrice: number | null;
};

// Klucz oferty = produkt + sklep + URL. URL bywa null, więc dopasowujemy przez
// isNull, a nie eq (eq(col, null) w SQL nigdy nie jest prawdą).
function offerMatch(input: {
  productId: string;
  store: string;
  productUrl: string | null | undefined;
}) {
  return and(
    eq(productOffersTable.productId, input.productId),
    eq(productOffersTable.store, input.store),
    input.productUrl == null
      ? isNull(productOffersTable.productUrl)
      : eq(productOffersTable.productUrl, input.productUrl),
  );
}

function priceChanged(existing: ProductOffer | undefined, next: ProductOffer) {
  if (!existing) return true; // nowa oferta = pierwszy odczyt ceny
  return (
    existing.price !== next.price || existing.promoPrice !== next.promoPrice
  );
}

/**
 * Wstawia lub aktualizuje ofertę po parze (produkt + sklep + URL). Każda ZMIANA
 * ceny (nowa oferta lub zmiana price/promoPrice) automatycznie dopisuje rekord
 * do price_history (append-only). Wszystko w jednej transakcji.
 */
export async function upsertOffer(
  db: Database,
  input: unknown,
): Promise<ProductOffer> {
  const parsed = insertProductOfferSchema.parse(input);

  return db.transaction(async (tx) => {
    const existingRows = await tx
      .select()
      .from(productOffersTable)
      .where(
        offerMatch({
          productId: parsed.productId,
          store: parsed.store,
          productUrl: parsed.productUrl ?? null,
        }),
      )
      .limit(1);
    const existing = existingRows[0];

    let offer: ProductOffer;
    if (existing) {
      const updated = await tx
        .update(productOffersTable)
        .set({ ...parsed, fetchedAt: new Date() })
        .where(eq(productOffersTable.id, existing.id))
        .returning();
      offer = updated[0]!;
    } else {
      const inserted = await tx
        .insert(productOffersTable)
        .values(parsed)
        .returning();
      offer = inserted[0]!;
    }

    if (priceChanged(existing, offer)) {
      await tx.insert(priceHistoryTable).values({
        productId: offer.productId,
        store: offer.store,
        price: offer.price,
        promoPrice: offer.promoPrice,
        unit: offer.unit,
        source: offer.source,
      });
    }

    return offer;
  });
}

/**
 * Oferty danego produktu, posortowane rosnąco po cenie efektywnej, z flagą
 * `isCheapest` na najtańszej (oferty bez ceny na końcu).
 */
export async function listOffersForProduct(
  db: Database,
  productId: string,
): Promise<OfferWithCheapest[]> {
  const rows = await db
    .select()
    .from(productOffersTable)
    .where(eq(productOffersTable.productId, productId));
  return sortOffersWithCheapest(rows);
}

/** Najtańsza oferta produktu (po cenie efektywnej) albo null. */
export async function getCheapestOffer(
  db: Database,
  productId: string,
): Promise<ProductOffer | null> {
  const rows = await db
    .select()
    .from(productOffersTable)
    .where(eq(productOffersTable.productId, productId));
  return pickCheapestOffer(rows);
}

export const productOffersRepository = {
  upsertOffer,
  listOffersForProduct,
  getCheapestOffer,
};
