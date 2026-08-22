// Czysta logika biznesowa repozytoriów — bez dostępu do DB, w pełni testowalna.
// Repozytoria (products/product-offers/price-history) budują na niej zapytania.

/**
 * Normalizuje nazwę produktu do porównań/wyszukiwania: lowercase, usunięcie
 * polskich znaków diakrytycznych i redukcja wszystkiego poza [a-z0-9] do
 * pojedynczych spacji. Ta sama funkcja liczy `normalized_name` przy zapisie
 * ORAZ normalizuje zapytanie w searchByNormalizedName — dzięki temu dopasowanie
 * jest spójne.
 */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // znaki łączące (a-ogonek -> a, itd.)
    .replace(/ł/g, "l") // "l z kreską" nie jest rozkładane przez NFD
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Wybór klucza deduplikacji produktu. Priorytet: najpierw EAN, potem GTIN.
 * NIGDY po samej nazwie — brak kodu ⇒ traktujemy jako nowy produkt.
 */
export function resolveUpsertKey(input: {
  ean?: string | null;
  gtin?: string | null;
}): { field: "ean" | "gtin"; value: string } | null {
  const ean = input.ean?.trim();
  if (ean) return { field: "ean", value: ean };
  const gtin = input.gtin?.trim();
  if (gtin) return { field: "gtin", value: gtin };
  return null;
}

/** Minimalny kształt oferty potrzebny do liczenia ceny efektywnej. */
export interface PricedOffer {
  price: string | null;
  promoPrice: string | null;
}

/**
 * Cena efektywna oferty = cena promocyjna, a gdy jej brak — cena regularna.
 * Zwraca liczbę lub null (gdy oferta nie ma żadnej ceny). Kolumny numeric
 * Drizzle zwraca jako string, więc parsujemy tutaj.
 */
export function effectivePrice(offer: PricedOffer): number | null {
  const raw = offer.promoPrice ?? offer.price;
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Sortuje oferty rosnąco po cenie efektywnej (oferty bez ceny na koniec) i
 * oznacza najtańsze (`isCheapest`). Przy remisie oznaczone są wszystkie oferty
 * o cenie równej minimum. Nie mutuje wejścia.
 */
export function sortOffersWithCheapest<T extends PricedOffer>(
  offers: readonly T[],
): Array<T & { isCheapest: boolean; effectivePrice: number | null }> {
  const withPrice = offers.map((o) => ({
    offer: o,
    effectivePrice: effectivePrice(o),
  }));

  withPrice.sort((a, b) => {
    if (a.effectivePrice === null && b.effectivePrice === null) return 0;
    if (a.effectivePrice === null) return 1; // null na koniec
    if (b.effectivePrice === null) return -1;
    return a.effectivePrice - b.effectivePrice;
  });

  const min = withPrice.reduce<number | null>((acc, cur) => {
    if (cur.effectivePrice === null) return acc;
    return acc === null ? cur.effectivePrice : Math.min(acc, cur.effectivePrice);
  }, null);

  return withPrice.map(({ offer, effectivePrice: ep }) => ({
    ...offer,
    effectivePrice: ep,
    isCheapest: min !== null && ep === min,
  }));
}

/** Zwraca najtańszą ofertę (pierwszą po sortowaniu) albo null. */
export function pickCheapestOffer<T extends PricedOffer>(
  offers: readonly T[],
): T | null {
  const sorted = sortOffersWithCheapest(offers);
  const first = sorted[0];
  if (!first || first.effectivePrice === null) return null;
  // Zwracamy oryginalny obiekt bez pól pomocniczych.
  const { isCheapest: _c, effectivePrice: _e, ...rest } = first;
  return rest as unknown as T;
}

/** Rekord historii ceny potrzebny do statystyk. */
export interface PriceHistoryPoint {
  price: string | null;
  promoPrice: string | null;
  fetchedAt: Date;
}

export interface PriceStats {
  count: number;
  min: number | null;
  avg: number | null;
  latest: number | null;
  /**
   * Moment ostatniej ZMIANY ceny (nie ostatniego odczytu). Rekord liczy się
   * jako zmiana, gdy jego cena efektywna różni się od poprzedniego (w kolejności
   * czasowej) rekordu z ceną. Pierwszy rekord z ceną też jest zmianą (ustalenie).
   */
  lastChangeAt: Date | null;
}

/**
 * Liczy statystyki cen z rekordów historii (min, avg, ostatnia zmiana).
 * Ignoruje rekordy bez ceny. Nie zakłada kolejności wejścia — sortuje sam.
 */
export function computePriceStats(
  rows: readonly PriceHistoryPoint[],
): PriceStats {
  const points = rows
    .map((r) => ({ value: effectivePrice(r), at: r.fetchedAt }))
    .filter((p): p is { value: number; at: Date } => p.value !== null)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  if (points.length === 0) {
    return { count: 0, min: null, avg: null, latest: null, lastChangeAt: null };
  }

  const min = points.reduce((m, p) => Math.min(m, p.value), points[0]!.value);
  const sum = points.reduce((s, p) => s + p.value, 0);
  const avg = Math.round((sum / points.length) * 100) / 100;
  const latest = points[points.length - 1]!.value;

  let prev: number | null = null;
  let lastChangeAt: Date | null = null;
  for (const p of points) {
    if (prev === null || p.value !== prev) {
      lastChangeAt = p.at;
    }
    prev = p.value;
  }

  return { count: points.length, min, avg, latest, lastChangeAt };
}
