// Kontrakt adaptera sklepu (PriceSource) oraz znormalizowane kształty danych,
// na których operuje cały moduł price-collector.
//
// KONWENCJA PIENIĘDZY: wszystkie kwoty w znormalizowanych obiektach są w
// GROSZACH (integer), żeby uniknąć błędów zmiennoprzecinkowych. Konwersja na
// tekstowy numeric (np. "79.98") dla DAO dzieje się dopiero na granicy zapisu
// (orchestrator). `pricePerUnit` to wyjątek — jest to WYLICZONA stawka
// (grosze / jednostkę), więc może być ułamkiem grosza.

/** Kategoria produktu widziana przez sklep — mapowana 1:1 na katalog. */
export interface NormalizedProduct {
  /** EAN-13/8 z feedu sklepu; null gdy sklep go nie podaje. */
  ean: string | null;
  /** GTIN (gdy sklep rozróżnia od EAN); zwykle null. */
  gtin: string | null;
  manufacturer: string | null;
  brand: string | null;
  /** Nazwa handlowa po trim/normalizacji whitespace (nigdy pusta). */
  name: string;
  category: string | null;
  /** Wielkość opakowania (liczba), np. 10 dla "10 l". */
  packageSize: number | null;
  /** Jednostka opakowania, np. "l", "kg", "szt". */
  packageUnit: string | null;
  imageUrl: string | null;
  productUrl: string | null;
}

/** Oferta cenowa produktu w danym sklepie (kwoty w groszach). */
export interface NormalizedOffer {
  // --- identyfikacja produktu (do dopasowania w katalogu) ---
  ean: string | null;
  gtin: string | null;
  manufacturer: string | null;
  name: string;
  packageSize: number | null;
  packageUnit: string | null;
  // --- ceny (grosze, integer) ---
  /** Cena widoczna/sprzedażowa w groszach; null gdy brak. */
  price: number | null;
  /** Cena promocyjna w groszach; null gdy brak promocji. */
  promoPrice: number | null;
  /** Cena regularna (sprzed promocji) w groszach; null gdy brak. */
  regularPrice: number | null;
  /** Wyliczona stawka: grosze za jednostkę opakowania (może być ułamkiem). */
  pricePerUnit: number | null;
  /** Jednostka do której odnosi się pricePerUnit (np. "l"). */
  unit: string | null;
  availability: string | null;
  /** Kod waluty ISO-4217, np. "PLN". */
  currency: string;
  /** URL strony produktu w sklepie. */
  url: string | null;
  /** Slug źródła/sklepu (np. "leroy-merlin"). */
  source: string;
}

/**
 * Kontrakt adaptera pojedynczego sklepu. Każdy sklep = jedna implementacja.
 * `fetchProducts`/`fetchOffers` zwracają JUŻ znormalizowane obiekty — całą
 * brudną robotę (parsowanie cen, jednostek, trim nazw) robi implementacja,
 * najczęściej dziedzicząc po BasePriceSource.
 */
export interface PriceSource {
  /** Stabilny slug sklepu, używany jako `store`/`source` w DAO. */
  readonly slug: string;
  /** Czytelna nazwa sklepu (do logów/UI). */
  readonly displayName: string;
  /** Pełny katalog produktów widziany przez sklep. */
  fetchProducts(): Promise<NormalizedProduct[]>;
  /** Aktualne oferty cenowe (mogą zawierać produkty spoza fetchProducts). */
  fetchOffers(): Promise<NormalizedOffer[]>;
}
