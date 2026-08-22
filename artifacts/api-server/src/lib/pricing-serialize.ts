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
  EstimateLine,
  ItemQuery,
  ProjectEstimate,
  StageEstimate,
  StageEstimateFromCalculation,
  UnresolvedReason,
} from "@workspace/pricing-service";
import {
  effectivePriceGrosze,
  priceToGrosze,
  type PriceHistory,
  type PriceStatsGrosze,
  type Product,
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

export interface SerializedProject {
  stages: SerializedStage[];
  /** Suma wszystkich etapów, w GROSZACH. */
  projectTotalGrosze: number;
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

/** Serializuje wycenę całego remontu (suma etapów). */
export function serializeProject(
  project: ProjectEstimate & { stages: StageEstimateFromCalculation[] },
): SerializedProject {
  return {
    stages: project.stages.map(serializeStage),
    projectTotalGrosze: project.projectTotalGrosze,
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
