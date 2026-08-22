// Typy serwisu wyceny (bridge kalkulator -> katalog cen).
//
// KONWENCJA PIENIĘDZY: wszystkie kwoty są w GROSZACH (integer), spójnie z
// modułem price-collector (patrz @workspace/price-collector normalize.ts).
// Oferty w DAO trzymają ceny jako numeric-string (np. "79.98") — konwersja na
// grosze dzieje się w estimate.ts przez parsePriceToGrosze.

import type { Product, ProductOffer } from "@workspace/db/schema";

/** Zapytanie o pojedynczy materiał/narzędzie wyliczone przez kalkulator. */
export interface ItemQuery {
  /** EAN-13/8 produktu. Priorytet dopasowania #1. */
  ean?: string | null;
  /** GTIN (gdy sklep rozróżnia od EAN). Priorytet dopasowania #2. */
  gtin?: string | null;
  /** Znormalizowana nazwa. Używana tylko RAZEM z `category`. */
  normalizedName?: string | null;
  /** Kategoria katalogu. Wymagana do dopasowania po nazwie. */
  category?: string | null;
}

/** Pozycja z kalkulatora: co i ile trzeba kupić. */
export interface EstimateItem {
  query: ItemQuery;
  /** Potrzebna ilość w jednostkach `unit` (np. 25 litrów farby). */
  quantity: number;
  /** Jednostka ilości (informacyjnie); np. "l", "kg", "szt". */
  unit?: string | null;
}

/** Opcje wyceny etapu. */
export interface EstimateOptions {
  /**
   * Region cenowy. UWAGA: katalog ofert nie ma jeszcze wymiaru regionu
   * (product_offers nie ma kolumny region), więc pole jest ZAREZERWOWANE i
   * obecnie NIE filtruje ofert. Zostawione w API, by nie łamać konsumentów przy
   * dodaniu regionów w przyszłości.
   */
  region?: string | null;
  /** Gdy podany — wybieramy najtańszą ofertę TYLKO z tego sklepu (`store`). */
  store?: string | null;
}

/** Najtańsza aktualna oferta produktu wraz ze sklepem i URL. */
export interface CheapestOffer {
  offer: ProductOffer;
  store: string;
  url: string | null;
  /** Cena efektywna oferty (promo ?? regular) w GROSZACH za jedno opakowanie. */
  unitPriceGrosze: number;
}

/** Powód, dla którego pozycji nie dało się wycenić. */
export type UnresolvedReason =
  | "no-query" // brak jakiegokolwiek kryterium dopasowania
  | "no-product" // brak produktu w katalogu
  | "no-offer"; // produkt jest, ale brak aktualnej oferty z ceną

/** Wyceniona pozycja (produkt dopasowany, oferta z ceną). */
export interface ResolvedLine {
  resolved: true;
  query: ItemQuery;
  quantity: number;
  unit: string | null;
  product: Product;
  cheapestOffer: CheapestOffer;
  /** Wielkość opakowania użyta do zaokrąglenia (>= 1). */
  packageSize: number;
  /** Liczba pełnych opakowań (zaokrąglenie w górę). */
  packagesNeeded: number;
  /** Koszt pozycji = packagesNeeded * unitPriceGrosze (GROSZE). */
  lineCost: number;
}

/** Pozycja nierozpoznana (brak produktu/oferty). lineCost zawsze 0. */
export interface UnresolvedLine {
  resolved: false;
  query: ItemQuery;
  quantity: number;
  unit: string | null;
  reason: UnresolvedReason;
  lineCost: 0;
}

export type EstimateLine = ResolvedLine | UnresolvedLine;

/** Wynik wyceny jednego etapu remontu. */
export interface StageEstimate {
  /** Wszystkie pozycje (rozpoznane i nie), z flagą `resolved`. */
  lines: EstimateLine[];
  /** Osobno pozycje nierozpoznane (podzbiór `lines`). */
  unresolved: UnresolvedLine[];
  /** Suma kosztów rozpoznanych pozycji etapu w GROSZACH. */
  stageTotalGrosze: number;
}

/** Wynik wyceny całego remontu (suma etapów). */
export interface ProjectEstimate {
  stages: StageEstimate[];
  /** Suma `stageTotalGrosze` wszystkich etapów w GROSZACH. */
  projectTotalGrosze: number;
}
