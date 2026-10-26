// Typy serwisu wyceny (bridge kalkulator -> katalog cen).
//
// KONWENCJA PIENIĘDZY: wszystkie kwoty są w GROSZACH (integer), spójnie z
// modułem price-collector (patrz @workspace/price-collector normalize.ts).
// Oferty w DAO trzymają ceny jako numeric-string (np. "79.98") — konwersja na
// grosze dzieje się w estimate.ts przez parsePriceToGrosze.

import type { Product, ProductOffer } from "@workspace/db/schema";
import type { StageLaborEstimate } from "./labor";

/** Storefront purchase rules supplement the persisted price row. A lot of ten
 * individually barcoded pieces still has a one-piece packageSize and price. */
export type PurchaseOffer = ProductOffer & {
  /** Order quantity must be a positive multiple of this many packages. */
  purchaseMultiple?: number;
  /** Minimum physical packs when this offer is used; further packs need not
   * form another minimum-size lot. */
  minimumPackages?: number;
  /** Published stock snapshot in physical packs; undefined means unknown,
   * never unlimited confirmed stock. This is not a reservation. */
  maxPackages?: number;
};

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
  offer: PurchaseOffer;
  store: string;
  url: string | null;
  /** Cena efektywna oferty (promo ?? regular) w GROSZACH za jedno opakowanie. */
  unitPriceGrosze: number;
}

/**
 * Jeden kandydat na wielkość opakowania w optymalnym doborze (wejście optymizera).
 * Reprezentuje JEDNĄ wielkość opakowania materiału wraz z jej najtańszą ofertą.
 */
export interface PackageVariant {
  purchaseMultiple?: number;
  minimumPackages?: number;
  maxPackages?: number;
  /** Wielkość pojedynczego opakowania w jednostce materiału (np. 10 = 10 l). > 0. */
  packageSize: number;
  /** Cena jednego opakowania tej wielkości w GROSZACH (najtańsza oferta). */
  unitPriceGrosze: number;
  /** Sklep najtańszej oferty tej wielkości. */
  store: string;
  /** URL oferty (może być null). */
  url: string | null;
  /** ID oferty użytej do wyceny tej wielkości (klucz agregacji w planie). */
  offerId: string;
}

/** Jedna wybrana wielkość opakowania w optymalnej kombinacji zakupu. */
export interface PackagePlanEntry {
  purchaseMultiple?: number;
  minimumPackages?: number;
  maxPackages?: number;
  /** Wielkość pojedynczego opakowania (w jednostce materiału, np. 10 = 10 l). */
  packageSize: number;
  /** Ile sztuk tego opakowania kupić (>= 1). */
  count: number;
  /** Cena jednego opakowania w GROSZACH. */
  unitPriceGrosze: number;
  /** Koszt tej pozycji = count * unitPriceGrosze (GROSZE). */
  lineCostGrosze: number;
  /** Sklep najtańszej oferty tej wielkości. */
  store: string;
  /** URL oferty (może być null). */
  url: string | null;
  /** ID oferty użytej do wyceny tej wielkości. */
  offerId: string;
}

/**
 * Optymalny dobór wielkości opakowań dla jednej pozycji: NAJTAŃSZA kombinacja
 * dostępnych wielkości pokrywająca wymaganą ilość (np. 15 l = 1×10 l + 1×5 l,
 * a nie 2×10 l). Kwoty w GROSZACH. Naddatek = ile kupujemy ponad potrzebę.
 */
export interface PackagePlan {
  /** Wybrane opakowania (posortowane malejąco po wielkości). Puste, gdy ilość <= 0. */
  packages: PackagePlanEntry[];
  /** Łączny koszt kombinacji w GROSZACH = suma lineCostGrosze pozycji. */
  totalGrosze: number;
  /** Wymagana ilość natywna (wejście; 0 gdy podano <= 0). */
  requiredQuantity: number;
  /** Faktycznie pokryta ilość = suma count*packageSize (>= requiredQuantity). */
  coveredQuantity: number;
  /** Naddatek = coveredQuantity - requiredQuantity (>= 0). */
  overage: number;
}

/** Powód, dla którego pozycji nie dało się wycenić. */
export type UnresolvedReason =
  | "no-query" // brak jakiegokolwiek kryterium dopasowania
  | "no-product" // brak produktu w katalogu
  | "no-offer" // produkt jest, ale brak aktualnej oferty z ceną
  | "insufficient-stock"; // znany zapas nie pokrywa potrzeb całego zakupu

/** Wyceniona pozycja (produkt dopasowany, oferta z ceną). */
export interface ResolvedLine {
  resolved: true;
  query: ItemQuery;
  quantity: number;
  unit: string | null;
  product: Product;
  cheapestOffer: CheapestOffer;
  /**
   * WSZYSTKIE aktualne oferty dopasowanego produktu (nie tylko najtańsza).
   * Zachowane, by policzyć koszt całości per sklep (patrz StoreComparison) bez
   * ponownego odpytywania katalogu. Oferty są deterministyczne dla produktu.
   */
  offers: readonly PurchaseOffer[];
  /** Wielkość opakowania użyta do zaokrąglenia (>= 1). */
  packageSize: number;
  /** Liczba pełnych opakowań (zaokrąglenie w górę). */
  packagesNeeded: number;
  /** Koszt pozycji = packagesNeeded * unitPriceGrosze (GROSZE). */
  lineCost: number;
  /**
   * Optymalny dobór wielkości opakowań dla `quantity`: najtańsza kombinacja
   * dostępnych wielkości tego materiału (patrz PackagePlan). Dodatkowa informacja
   * OBOK `lineCost` — gdy materiał ma kilka wielkości opakowań, `packagePlan`
   * może być tańszy niż pojedynczy rozmiar × sufit. Przy jednej wielkości plan
   * degeneruje się do N×rozmiar i `totalGrosze` === `lineCost`.
   */
  packagePlan: PackagePlan;
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
  /**
   * Suma kosztów rozpoznanych MATERIAŁÓW etapu w GROSZACH. Pole HISTORYCZNE —
   * znaczenie NIEZMIENIONE (materiały), żeby nie łamać konsumentów ani inwariantów
   * konsolidacji. Pełny koszt (materiały + robocizna) jest w
   * `stageTotalWithLaborGrosze`.
   */
  stageTotalGrosze: number;
  // ── ADDYTYWNE: rozbicie na materiały + robociznę (money-path additive) ──
  // Wypełniane, gdy wycena zna jobId i obmiary (adapter from-calculator).
  // Nieobecne => konsument traktuje robociznę jak 0 (stageTotalGrosze == materiały).
  /** Alias jawny na koszt materiałów (= `stageTotalGrosze`), w GROSZACH. */
  materialsTotalGrosze?: number;
  /** Koszt robocizny etapu (suma pozycji OSZACOWANYCH), w GROSZACH. */
  laborTotalGrosze?: number;
  /** Pełny koszt etapu = materiały + robocizna, w GROSZACH. */
  stageTotalWithLaborGrosze?: number;
  /** Rozbicie robocizny (pozycje, źródła, nieoszacowane). */
  labor?: StageLaborEstimate;
}

/**
 * Skonsolidowana pozycja zakupowa całego remontu: JEDEN produkt zebrany ze
 * WSZYSTKICH etapów (kup raz, licz opakowania łącznie). Ilości natywne z każdego
 * etapu są zsumowane PRZED zaokrągleniem do opakowań, więc `packagesNeeded`
 * liczy się raz na zsumowanej ilości — stąd oszczędność względem sumy per-etap.
 */
export interface ConsolidatedLine {
  /** Exact purchase plan, including mixed package sizes and stores. */
  packagePlan?: PackagePlan;
  product: Product;
  cheapestOffer: CheapestOffer;
  /** Łączna ilość natywna zsumowana ze wszystkich etapów (przed zaokrągleniem). */
  totalQuantity: number;
  /** Jednostka ilości (pierwsza niepusta spośród pozycji tego produktu). */
  unit: string | null;
  /** Wielkość opakowania użyta do zaokrąglenia (>= 1); ta sama dla produktu. */
  packageSize: number;
  /** Liczba pełnych opakowań policzona RAZ na zsumowanej ilości (w górę). */
  packagesNeeded: number;
  /** Koszt skonsolidowany = packagesNeeded * unitPriceGrosze (GROSZE). */
  lineCostGrosze: number;
  /** Suma kosztów per-etap tego produktu (osobne zaokrąglenia w każdym etapie). */
  perStageCostGrosze: number;
  /** Oszczędność względem sumy per-etap = perStageCostGrosze - lineCostGrosze (>= 0). */
  savingsGrosze: number;
}

/**
 * Skonsolidowana lista zakupowa całego remontu + łączna oszczędność wynikająca z
 * jednorazowego zaokrąglenia do opakowań (zamiast osobno w każdym etapie).
 */
export interface ConsolidatedShoppingList {
  /** Produkty zebrane ze wszystkich etapów (kolejność = pierwsze wystąpienie). */
  lines: ConsolidatedLine[];
  /** Suma po konsolidacji (zaokrąglenie do opakowań RAZ na produkt), w GROSZACH. */
  consolidatedTotalGrosze: number;
  /** Suma bez konsolidacji (zaokrąglenia per-etap) = suma rozpoznanych pozycji, w GROSZACH. */
  perStageTotalGrosze: number;
  /** Łączna oszczędność = perStageTotalGrosze - consolidatedTotalGrosze (>= 0). */
  savingsGrosze: number;
}

/**
 * Koszt kupienia CAŁEJ skonsolidowanej listy zakupowej w JEDNYM sklepie.
 * Materiały, których dany sklep nie ma (brak oferty z ceną), są liczone jako
 * niepokryte (`missingCount`) i NIE wchodzą do `totalGrosze` — dzięki temu
 * suma nigdy nie udaje kompletnej, gdy sklep nie ma wszystkiego.
 */
export interface StoreBasket {
  /** Nazwa sklepu (klucz `product_offers.store`). */
  store: string;
  /** Suma kosztów pozycji, które ten sklep POKRYWA, w GROSZACH. */
  totalGrosze: number;
  /** Ile skonsolidowanych produktów sklep pokrywa (ma ofertę z ceną). */
  coveredCount: number;
  /** Ile produktów sklep NIE pokrywa (brak oferty z ceną). */
  missingCount: number;
  /** ID produktów niepokrytych w tym sklepie (puste przy pełnym pokryciu). */
  missingProductIds: string[];
}

/**
 * Fragment koszyka optymalnego pochodzący z jednego sklepu: suma tych pozycji,
 * dla których najtańsza oferta produktu jest właśnie w tym sklepie.
 */
export interface OptimalBasketStoreLine {
  store: string;
  /** Suma najtańszych pozycji pochodzących z tego sklepu, w GROSZACH. */
  totalGrosze: number;
  /** Ile produktów kupujemy w tym sklepie w koszyku optymalnym. */
  itemCount: number;
}

/**
 * Porównanie sklepów dla skonsolidowanej listy całego remontu:
 *  - `stores`: ile kosztuje kupno WSZYSTKIEGO w każdym sklepie z osobna,
 *  - `optimalBasketGrosze`/`optimalByStore`: koszyk optymalny = suma najtańszych
 *    ofert per produkt (== `ConsolidatedShoppingList.consolidatedTotalGrosze`)
 *    z rozbiciem, z którego sklepu pochodzi każda pozycja,
 *  - `cheapestFullStore` + `singleStoreExtraGrosze`: najtańszy sklep mający
 *    WSZYSTKO i ile więcej kosztuje kupno w nim zamiast rozbicia na sklepy.
 * Wszystkie kwoty w GROSZACH (integer). Czysta agregacja bez I/O.
 */
export interface StoreComparison {
  /** Liczba skonsolidowanych produktów do kupienia (baza pokrycia). */
  productCount: number;
  /** Koszyk optymalny = suma najtańszych ofert per produkt, w GROSZACH. */
  optimalBasketGrosze: number;
  /** Rozbicie koszyka optymalnego po sklepach (skąd najtańsza pozycja). */
  optimalByStore: OptimalBasketStoreLine[];
  /** Koszt całości per sklep, POSORTOWANE rosnąco po `totalGrosze`. */
  stores: StoreBasket[];
  /**
   * Najtańszy sklep pokrywający WSZYSTKIE produkty (missingCount === 0), albo
   * null, gdy żaden pojedynczy sklep nie ma kompletu.
   */
  cheapestFullStore: StoreBasket | null;
  /**
   * Ile WIĘCEJ kosztuje kupno wszystkiego w najtańszym pełnym sklepie zamiast
   * koszyka optymalnego = cheapestFullStore.totalGrosze - optimalBasketGrosze.
   * null gdy brak sklepu z pełnym pokryciem. Może być teoretycznie ujemne przy
   * różnych wielkościach opakowań, więc konsument decyduje o prezentacji.
   */
  singleStoreExtraGrosze: number | null;
}

/** Wynik wyceny całego remontu (suma etapów). */
export interface ProjectEstimate {
  stages: StageEstimate[];
  /**
   * Suma `stageTotalGrosze` (MATERIAŁÓW) wszystkich etapów w GROSZACH. Pole
   * HISTORYCZNE — znaczenie NIEZMIENIONE (materiały). Pełny koszt (materiały +
   * robocizna) jest w `projectTotalWithLaborGrosze`.
   */
  projectTotalGrosze: number;
  // ── ADDYTYWNE: rozbicie całego remontu na materiały + robociznę ──
  /** Alias jawny na koszt materiałów całego remontu (= `projectTotalGrosze`). */
  materialsTotalGrosze?: number;
  /** Suma robocizny wszystkich etapów (pozycje oszacowane), w GROSZACH. */
  laborTotalGrosze?: number;
  /** Pełny koszt remontu = materiały + robocizna, w GROSZACH. */
  projectTotalWithLaborGrosze?: number;
  /**
   * Skonsolidowana lista zakupowa całego remontu (kup raz, licz opakowania
   * łącznie). `perStageTotalGrosze` === `projectTotalGrosze` (te same pozycje,
   * inne zaokrąglenie), a `savingsGrosze` to różnica na korzyść kupującego.
   */
  consolidated: ConsolidatedShoppingList;
  /**
   * Porównanie sklepów: koszt całości per sklep + koszyk optymalny (najtańsze
   * per produkt) + najtańszy sklep na całość i różnica vs rozbicie.
   */
  storeComparison: StoreComparison;
}
