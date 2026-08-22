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

/**
 * Pola produktu, które wolno UZUPEŁNIĆ danymi z feedu, gdy oferta dopnie się do
 * istniejącego rekordu po parze (nazwa + kategoria) — typowo materiał z katalogu
 * referencyjnego zaseedowany BEZ kodu. Świadomie NIE zawiera name/category/
 * normalizedName ani cen — te pochodzą z katalogu/oferty i nie są tu ruszane.
 */
export const ENRICHABLE_PRODUCT_FIELDS = [
  "ean",
  "gtin",
  "brand",
  "manufacturer",
  "imageUrl",
  "productUrl",
  "packageSize",
  "packageUnit",
] as const;

export type EnrichableProductField = (typeof ENRICHABLE_PRODUCT_FIELDS)[number];

/** Wartość „pusta" do celów wzbogacania: null/undefined lub sam biały znak. */
function isEmptyEnrichValue(v: unknown): boolean {
  return (
    v === null ||
    v === undefined ||
    (typeof v === "string" && v.trim() === "")
  );
}

/**
 * Buduje patch WZBOGACAJĄCY: bierze z `incoming` tylko te pola (spośród
 * `fields`), które w `existing` są puste, a w feedzie mają wartość. NIGDY nie
 * nadpisuje istniejących wartości. Zwraca `{}`, gdy nie ma czego dodać — dzięki
 * temu dopasowanie po nazwie+kategorii uzupełnia brakujący EAN/zdjęcie/URL, ale
 * nie kasuje danych już zebranych.
 */
export function buildEnrichmentPatch(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  fields: readonly string[] = ENRICHABLE_PRODUCT_FIELDS,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const f of fields) {
    if (isEmptyEnrichValue(existing[f]) && !isEmptyEnrichValue(incoming[f])) {
      patch[f] = incoming[f];
    }
  }
  return patch;
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

// ─── Statystyki cen w GROSZACH (kontrakt warstwy odczytu /pricing/history) ──────
//
// Odrębne od computePriceStats (PLN, float) — money-path wymaga liczb całkowitych
// w groszach. NIC nie zmyślamy: wszystko liczone z realnych rekordów price_history
// (ceny historyczne) oraz bieżącej najtańszej oferty (`current`), przekazywanej z
// DAO. Kolumny numeric Drizzle zwraca jako string, więc parsujemy do groszy tutaj.

/**
 * Cena PLN (string/number z numeric) → GROSZE (integer). Null gdy brak wartości
 * lub kwota nie jest skończoną, nieujemną liczbą. Ta sama semantyka co
 * `parsePriceToGrosze` w price-collector, ale bez zależności odwrotnej (db nie
 * może zależeć od price-collector — cykl).
 */
export function priceToGrosze(
  raw: string | number | null | undefined,
): number | null {
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Cena efektywna oferty (promo ?? regular) w GROSZACH, albo null. */
export function effectivePriceGrosze(offer: PricedOffer): number | null {
  return priceToGrosze(offer.promoPrice ?? offer.price);
}

/**
 * Aktualna cena jest „prawdziwą promocją" tylko, gdy jest ISTOTNIE niższa od
 * średniej historycznej (co najmniej o REAL_PROMO_MARGIN). Odróżnia realną
 * obniżkę od sztucznej (przekreślona cena, która nigdy realnie nie obowiązywała
 * — wtedy średnia historyczna ≈ cena „promocyjna", więc próg nie jest spełniony).
 */
export const REAL_PROMO_MARGIN = 0.05; // 5% poniżej średniej

export interface PriceStatsGrosze {
  /** Liczba historycznych punktów z ceną. */
  count: number;
  /** Najniższa cena historyczna (grosze) albo null. */
  lowest: number | null;
  /** Średnia cena historyczna (grosze, zaokrąglona do pełnego grosza) albo null. */
  average: number | null;
  /** Aktualna najtańsza cena (grosze): z bieżącej oferty, w razie braku — ostatni pomiar. */
  current: number | null;
  /** Różnica current − lowest (grosze). Ujemna = poniżej historycznego dołka. Null gdy brak danych. */
  changeVsLowest: number | null;
  /**
   * Procentowa zmiana OSTATNIEGO pomiaru względem poprzedniego (dwa najświeższe
   * punkty historii: latest vs previous). Dodatnia = podrożało, ujemna = staniało.
   * Liczona wyłącznie z historii (niezależnie od bieżącej oferty). Null gdy < 2
   * punktów albo poprzednia cena = 0. Zaokrąglona do 2 miejsc.
   */
  changePct: number | null;
  /** Czy `current` to prawdziwa promocja (istotnie < średniej historycznej). */
  isRealPromo: boolean;
}

/**
 * Liczy statystyki cen w GROSZACH z rekordów historii i bieżącej ceny.
 * `currentGrosze` = aktualna najtańsza oferta (z DAO ofert); gdy null, jako
 * bieżącą przyjmujemy ostatni pomiar z historii. Ignoruje rekordy bez ceny i
 * sortuje wejście sam (nie zakłada kolejności).
 */
export function computeProductPriceStatsGrosze(
  rows: readonly PriceHistoryPoint[],
  currentGrosze: number | null,
): PriceStatsGrosze {
  const points = rows
    .map((r) => ({ value: effectivePriceGrosze(r), at: r.fetchedAt }))
    .filter((p): p is { value: number; at: Date } => p.value !== null)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  if (points.length === 0) {
    return {
      count: 0,
      lowest: null,
      average: null,
      current: currentGrosze,
      changeVsLowest: null,
      changePct: null,
      isRealPromo: false,
    };
  }

  const values = points.map((p) => p.value);
  const lowest = values.reduce((m, v) => Math.min(m, v), values[0]!);
  const average = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  const latest = values[values.length - 1]!;
  const previous = values.length >= 2 ? values[values.length - 2]! : null;

  // Bieżąca cena: preferuj realną najtańszą ofertę; w razie braku — ostatni pomiar.
  const current = currentGrosze ?? latest;

  const changeVsLowest = current - lowest;
  // Zmiana OSTATNIEGO ruchu ceny w historii (latest vs poprzedni pomiar).
  const changePct =
    previous !== null && previous !== 0
      ? Math.round(((latest - previous) / previous) * 10000) / 100
      : null;
  const isRealPromo = current <= Math.round(average * (1 - REAL_PROMO_MARGIN));

  return {
    count: points.length,
    lowest,
    average,
    current,
    changeVsLowest,
    changePct,
    isRealPromo,
  };
}
