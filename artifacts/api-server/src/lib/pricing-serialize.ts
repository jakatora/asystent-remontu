// Serializacja wyniku wyceny do stabilnego JSON-a HTTP.
//
// KONWENCJA PIENIĘDZY: wszystkie kwoty w GROSZACH (integer), spójnie z
// @workspace/pricing-service. Pola kosztowe mają sufiks `Grosze`, żeby nie było
// wątpliwości co do jednostki. Serializer NIC nie przelicza ani nie zaokrągla —
// tylko wybiera pola i przepisuje liczby całkowite z serwisu wyceny 1:1.
//
// Pozycje nierozpoznane (brak produktu/oferty) NIE są ukrywane — trafiają do
// odpowiedzi z `resolved:false` i `reason`, żeby klient widział, czego nie
// dało się wycenić (a nie tylko zaniżoną sumę).
import type {
  ConsolidatedLine,
  ConsolidatedShoppingList,
  EstimateLine,
  ItemQuery,
  ProjectEstimate,
  StageEstimate,
  StageEstimateFromCalculation,
  StoreComparison,
  UnresolvedReason,
} from "@workspace/pricing-service";
import {
  effectivePriceGrosze,
  priceToGrosze,
  type PriceHistory,
  type PriceStatsGrosze,
  type Product,
  type ProductOffer,
} from "@workspace/db/repositories";

export interface SerializedProduct {
  id: string;
  name: string;
  ean: string | null;
  gtin: string | null;
  category: string | null;
  /** numeric z bazy jest stringiem (albo null). */
  packageSize: string | null;
  packageUnit: string | null;
}

export interface SerializedOffer {
  offerId: string;
  store: string;
  url: string | null;
  /** Cena efektywna (promo ?? regular) za jedno opakowanie, w GROSZACH. */
  unitPriceGrosze: number;
}

/**
 * Pojedyncza oferta produktu w konkretnym sklepie — do porównania cen per produkt
 * na ekranie wyceny (Sklep A/B/C + najtańszy). Wszystkie kwoty w GROSZACH.
 * Serializer NIC nie liczy poza konwersją numeric(string PLN) -> grosze
 * (priceToGrosze); nie decyduje o „najtańszej" (to robi kolejność listy).
 */
export interface SerializedProductOffer {
  offerId: string;
  store: string;
  url: string | null;
  /** Cena aktualna (efektywna: promo ?? price) za opakowanie, w GROSZACH; null gdy brak. */
  priceGrosze: number | null;
  /** Cena regularna („była", przekreślana przy promocji), w GROSZACH; null gdy brak. */
  regularPriceGrosze: number | null;
  /** Cena za jednostkę odniesienia (zł/l, zł/szt) w GROSZACH; null gdy brak. */
  pricePerUnitGrosze: number | null;
  /** Jednostka opakowania/odniesienia (np. "l", "szt"); null gdy brak. */
  unit: string | null;
  /** Dostępność — surowy tekst ze sklepu (np. "in_stock"); null gdy brak. */
  availability: string | null;
}

export interface SerializedLine {
  resolved: boolean;
  quantity: number;
  unit: string | null;
  /** Kryteria dopasowania (traceability: co próbowaliśmy dopasować). */
  query: ItemQuery;
  /** Koszt pozycji w GROSZACH (0 dla nierozpoznanych). */
  lineCostGrosze: number;
  // --- tylko dla resolved: true ---
  product?: SerializedProduct;
  cheapestOffer?: SerializedOffer;
  /**
   * WSZYSTKIE oferty dopasowanego produktu, POSORTOWANE od najtańszej (pierwsza =
   * najtańsza, spójna z `cheapestOffer`). Do porównania cen per produkt w UI.
   * Oferty bez ceny (priceGrosze === null) trafiają na koniec (nie da się ich
   * porównać, ale pokazują sklep/dostępność). Obecne tylko dla resolved: true.
   */
  offers?: SerializedProductOffer[];
  /** Wielkość opakowania użyta do zaokrąglenia w górę. */
  packageSize?: number;
  /** Liczba pełnych opakowań do kupienia. */
  packagesNeeded?: number;
  // --- tylko dla resolved: false ---
  reason?: UnresolvedReason;
}

export interface SerializedStage {
  jobId?: string;
  lines: SerializedLine[];
  /** Ile pozycji nie udało się wycenić. */
  unresolvedCount: number;
  /** Suma kosztów rozpoznanych pozycji etapu, w GROSZACH. */
  stageTotalGrosze: number;
}

/** Skonsolidowana pozycja zakupowa całego remontu (jeden produkt ze wszystkich etapów). */
export interface SerializedConsolidatedLine {
  product: SerializedProduct;
  cheapestOffer: SerializedOffer;
  /** Łączna ilość natywna zsumowana ze wszystkich etapów (przed zaokrągleniem). */
  totalQuantity: number;
  unit: string | null;
  /** Wielkość opakowania użyta do zaokrąglenia w górę. */
  packageSize: number;
  /** Liczba pełnych opakowań policzona RAZ na zsumowanej ilości. */
  packagesNeeded: number;
  /** Koszt skonsolidowany, w GROSZACH. */
  lineCostGrosze: number;
  /** Suma kosztów per-etap tego produktu (osobne zaokrąglenia), w GROSZACH. */
  perStageCostGrosze: number;
  /** Oszczędność vs suma per-etap = perStageCostGrosze - lineCostGrosze, w GROSZACH. */
  savingsGrosze: number;
}

/** Skonsolidowana lista zakupowa całego remontu + łączna oszczędność. */
export interface SerializedConsolidatedList {
  lines: SerializedConsolidatedLine[];
  /** Suma po konsolidacji (zaokrąglenie do opakowań raz na produkt), w GROSZACH. */
  consolidatedTotalGrosze: number;
  /** Suma bez konsolidacji (zaokrąglenia per-etap) = projectTotalGrosze, w GROSZACH. */
  perStageTotalGrosze: number;
  /** Łączna oszczędność = perStageTotalGrosze - consolidatedTotalGrosze, w GROSZACH. */
  savingsGrosze: number;
}

/** Koszt kupienia całej listy w jednym sklepie (z niepokrytymi pozycjami). */
export interface SerializedStoreBasket {
  store: string;
  /** Suma kosztów pozycji, które sklep pokrywa, w GROSZACH. */
  totalGrosze: number;
  coveredCount: number;
  missingCount: number;
  /** ID produktów niepokrytych w tym sklepie (puste przy pełnym pokryciu). */
  missingProductIds: string[];
}

/** Fragment koszyka optymalnego pochodzący z jednego sklepu. */
export interface SerializedOptimalStoreLine {
  store: string;
  /** Suma najtańszych pozycji z tego sklepu, w GROSZACH. */
  totalGrosze: number;
  itemCount: number;
}

/** Porównanie sklepów: koszt całości per sklep vs koszyk optymalny. */
export interface SerializedStoreComparison {
  productCount: number;
  /** Koszyk optymalny = suma najtańszych ofert per produkt, w GROSZACH. */
  optimalBasketGrosze: number;
  optimalByStore: SerializedOptimalStoreLine[];
  /** Koszt całości per sklep, rosnąco po totalGrosze. */
  stores: SerializedStoreBasket[];
  /** Najtańszy sklep z pełnym pokryciem, albo null. */
  cheapestFullStore: SerializedStoreBasket | null;
  /** Ile więcej niż koszyk optymalny kosztuje najtańszy pełny sklep (GROSZE), albo null. */
  singleStoreExtraGrosze: number | null;
}

export interface SerializedProject {
  stages: SerializedStage[];
  /** Suma wszystkich etapów, w GROSZACH. */
  projectTotalGrosze: number;
  /** Skonsolidowana lista zakupowa całego remontu (kup raz, licz opakowania łącznie). */
  consolidated: SerializedConsolidatedList;
  /** Porównanie sklepów: koszt całości per sklep + koszyk optymalny + najtańszy sklep. */
  storeComparison: SerializedStoreComparison;
}

/** Wspólna serializacja produktu do stabilnego kształtu HTTP (id + kody + opakowanie). */
function serializeProduct(product: {
  id: string;
  name: string;
  ean: string | null;
  gtin: string | null;
  category: string | null;
  packageSize: string | null;
  packageUnit: string | null;
}): SerializedProduct {
  return {
    id: product.id,
    name: product.name,
    ean: product.ean,
    gtin: product.gtin,
    category: product.category,
    packageSize: product.packageSize,
    packageUnit: product.packageUnit,
  };
}

/** Serializuje jedną ofertę produktu do porównania cen (kwoty numeric -> grosze). */
function serializeProductOffer(offer: ProductOffer): SerializedProductOffer {
  return {
    offerId: offer.id,
    store: offer.store,
    url: offer.productUrl,
    // Cena aktualna = efektywna (promo ?? price), spójnie z selectCheapestOffer.
    priceGrosze: priceToGrosze(offer.promoPrice ?? offer.price),
    regularPriceGrosze: priceToGrosze(offer.regularPrice),
    pricePerUnitGrosze: priceToGrosze(offer.pricePerUnit),
    unit: offer.unit,
    availability: offer.availability,
  };
}

/**
 * Serializuje i SORTUJE oferty produktu rosnąco po cenie aktualnej (najtańsza
 * pierwsza). Oferty bez ceny (priceGrosze === null) idą na koniec — nie da się
 * ich porównać, ale zostają, by pokazać sklep/dostępność. Stabilnie: przy równej
 * cenie zachowujemy kolejność wejściową (deterministyczne oferty produktu).
 */
function serializeOffers(
  offers: readonly ProductOffer[],
): SerializedProductOffer[] {
  return offers
    .map(serializeProductOffer)
    .sort((a, b) => {
      if (a.priceGrosze === null && b.priceGrosze === null) return 0;
      if (a.priceGrosze === null) return 1;
      if (b.priceGrosze === null) return -1;
      return a.priceGrosze - b.priceGrosze;
    });
}

function serializeLine(line: EstimateLine): SerializedLine {
  const base = {
    quantity: line.quantity,
    unit: line.unit,
    query: line.query,
  };

  if (!line.resolved) {
    return {
      resolved: false,
      ...base,
      reason: line.reason,
      lineCostGrosze: 0,
    };
  }

  return {
    resolved: true,
    ...base,
    lineCostGrosze: line.lineCost,
    product: serializeProduct(line.product),
    cheapestOffer: {
      offerId: line.cheapestOffer.offer.id,
      store: line.cheapestOffer.store,
      url: line.cheapestOffer.url,
      unitPriceGrosze: line.cheapestOffer.unitPriceGrosze,
    },
    offers: serializeOffers(line.offers),
    packageSize: line.packageSize,
    packagesNeeded: line.packagesNeeded,
  };
}

/** Serializuje wycenę jednego etapu (jobId dołączany, gdy pochodzi z kalkulatora). */
export function serializeStage(
  stage: StageEstimate & { jobId?: string },
): SerializedStage {
  return {
    ...(stage.jobId !== undefined ? { jobId: stage.jobId } : {}),
    lines: stage.lines.map(serializeLine),
    unresolvedCount: stage.unresolved.length,
    stageTotalGrosze: stage.stageTotalGrosze,
  };
}

function serializeConsolidatedLine(
  line: ConsolidatedLine,
): SerializedConsolidatedLine {
  return {
    product: serializeProduct(line.product),
    cheapestOffer: {
      offerId: line.cheapestOffer.offer.id,
      store: line.cheapestOffer.store,
      url: line.cheapestOffer.url,
      unitPriceGrosze: line.cheapestOffer.unitPriceGrosze,
    },
    totalQuantity: line.totalQuantity,
    unit: line.unit,
    packageSize: line.packageSize,
    packagesNeeded: line.packagesNeeded,
    lineCostGrosze: line.lineCostGrosze,
    perStageCostGrosze: line.perStageCostGrosze,
    savingsGrosze: line.savingsGrosze,
  };
}

/** Serializuje skonsolidowaną listę zakupową całego remontu (kwoty 1:1 w groszach). */
function serializeConsolidated(
  consolidated: ConsolidatedShoppingList,
): SerializedConsolidatedList {
  return {
    lines: consolidated.lines.map(serializeConsolidatedLine),
    consolidatedTotalGrosze: consolidated.consolidatedTotalGrosze,
    perStageTotalGrosze: consolidated.perStageTotalGrosze,
    savingsGrosze: consolidated.savingsGrosze,
  };
}

/**
 * Serializuje porównanie sklepów. Struktura jest już czysto liczbowa (grosze) —
 * serializer przepisuje pola 1:1, nic nie licząc ani nie zaokrąglając.
 */
function serializeStoreComparison(
  cmp: StoreComparison,
): SerializedStoreComparison {
  return {
    productCount: cmp.productCount,
    optimalBasketGrosze: cmp.optimalBasketGrosze,
    optimalByStore: cmp.optimalByStore.map((s) => ({
      store: s.store,
      totalGrosze: s.totalGrosze,
      itemCount: s.itemCount,
    })),
    stores: cmp.stores.map((s) => ({
      store: s.store,
      totalGrosze: s.totalGrosze,
      coveredCount: s.coveredCount,
      missingCount: s.missingCount,
      missingProductIds: [...s.missingProductIds],
    })),
    cheapestFullStore: cmp.cheapestFullStore
      ? {
          store: cmp.cheapestFullStore.store,
          totalGrosze: cmp.cheapestFullStore.totalGrosze,
          coveredCount: cmp.cheapestFullStore.coveredCount,
          missingCount: cmp.cheapestFullStore.missingCount,
          missingProductIds: [...cmp.cheapestFullStore.missingProductIds],
        }
      : null,
    singleStoreExtraGrosze: cmp.singleStoreExtraGrosze,
  };
}

/** Serializuje wycenę całego remontu (suma etapów + skonsolidowana lista zakupowa). */
export function serializeProject(
  project: ProjectEstimate & { stages: StageEstimateFromCalculation[] },
): SerializedProject {
  return {
    stages: project.stages.map(serializeStage),
    projectTotalGrosze: project.projectTotalGrosze,
    consolidated: serializeConsolidated(project.consolidated),
    storeComparison: serializeStoreComparison(project.storeComparison),
  };
}

// ─── Historia cen (warstwa ODCZYTU: GET /pricing/history) ──────────────────────
//
// Wszystkie kwoty w GROSZACH, spójnie z resztą wyceny. Serializer NIE liczy
// statystyk — bierze gotowy PriceStatsGrosze z DAO (liczone po stronie SQL/agregacji)
// i przepisuje 1:1. Punkty historii dostają cenę efektywną w groszach do wykresu.

/** Statystyki cen produktu w GROSZACH (kontrakt HTTP = PriceStatsGrosze z DAO). */
export type SerializedPriceStats = PriceStatsGrosze;

export interface SerializedHistoryPoint {
  store: string;
  source: string | null;
  /** ISO 8601 (UTC) — moment odczytu ceny. */
  fetchedAt: string;
  /** Cena regularna w GROSZACH (null gdy brak). */
  priceGrosze: number | null;
  /** Cena promocyjna w GROSZACH (null gdy brak). */
  promoPriceGrosze: number | null;
  /** Cena efektywna (promo ?? regular) w GROSZACH (null gdy brak). */
  effectiveGrosze: number | null;
}

export interface SerializedPriceHistory {
  product: SerializedProduct;
  stats: SerializedPriceStats;
  /** Punkty historii chronologicznie (najstarsze najpierw). */
  history: SerializedHistoryPoint[];
}

function serializeHistoryPoint(row: PriceHistory): SerializedHistoryPoint {
  return {
    store: row.store,
    source: row.source,
    fetchedAt: row.fetchedAt.toISOString(),
    priceGrosze: priceToGrosze(row.price),
    promoPriceGrosze: priceToGrosze(row.promoPrice),
    effectiveGrosze: effectivePriceGrosze(row),
  };
}

/**
 * Serializuje odczyt historii cen produktu: produkt + statystyki (grosze) +
 * chronologiczna lista punktów. Kwoty przepisywane 1:1 z DAO/heleprów — bez
 * ponownego liczenia po stronie HTTP.
 */
export function serializePriceHistory(
  product: Product,
  stats: PriceStatsGrosze,
  history: readonly PriceHistory[],
): SerializedPriceHistory {
  return {
    product: serializeProduct(product),
    stats,
    history: history.map(serializeHistoryPoint),
  };
}
