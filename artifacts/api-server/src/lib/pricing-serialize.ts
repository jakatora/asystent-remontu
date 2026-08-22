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
    product: {
      id: line.product.id,
      name: line.product.name,
      ean: line.product.ean,
      gtin: line.product.gtin,
      category: line.product.category,
      packageSize: line.product.packageSize,
      packageUnit: line.product.packageUnit,
    },
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
