// Wycena ROBOCIZNY etapu: dla każdej pozycji robocizny joba liczy
// laborLineGrosze = round(stawka_bazowa_grosze × ilość), gdzie ilość pochodzi z
// obmiarów wyniku engine.calculate (m² ścian/podłogi, mb obwodu, szt urządzeń).
//
// KONWENCJA PIENIĘDZY: wszystko w GROSZACH (integer). Czysta funkcja — bez I/O.
//
// FALLBACK (money-path: „nie zeruj sumy"): gdy dla pozycji brakuje stawki (brak
// id / brak stawki w regionie bez fallbacku) ALBO nie da się ustalić ilości z
// obmiarów, pozycja jest oznaczana jako NIEOSZACOWANA (`estimated: false`,
// `lineCostGrosze: 0`) i NIE wchodzi do `laborTotalGrosze`, ale reszta pozycji
// liczy się normalnie. Region domyślny = 'lodzkie' (jedyny zaseedowany); żądanie
// innego regionu spada na stawkę 'lodzkie' (flaga `regionFallback`).
//
// ROZDZIELENIE OBMIARU wg jednostki stawki mirroruje logikę mobile
// features/pricing/engine.ts (getPrimaryArea / getQuantityForMaterial):
//   - m2  -> pole powierzchni (wallArea ?? floorArea ?? ceilingArea ?? area ...)
//   - mb  -> perimeter ?? linearMeters
//   - szt -> licznik urządzeń (count ?? faucetCount ?? socketCount) ?? 1

import {
  DEFAULT_LABOR_REGION,
  getLaborRateById,
  getLaborRateIdsForJob,
  type LaborRate,
  type LaborUnit,
} from "./labor-data";
import type { EstimateOptions } from "./types";

/** Obmiary z wyniku kalkulatora (MeasurementMap z mobile: Record<string, number>). */
export type Measurements = Readonly<Record<string, number>>;

/** Powód, dla którego pozycji robocizny nie dało się oszacować. */
export type LaborUnestimatedReason =
  | "no-rate" // brak stawki o tym id
  | "no-region-rate" // stawka istnieje, ale nie dla regionu i brak fallbacku
  | "no-quantity"; // brak obmiaru pasującego do jednostki stawki (m²/mb/szt)

/** Atrybucja źródła stawki (przepisywana 1:1 do wyniku). */
export interface LaborSource {
  readonly name: string;
  readonly type: string;
  readonly url?: string;
  readonly lastUpdated: string;
}

/** Jedna wyceniona (lub oznaczona jako nieoszacowana) pozycja robocizny etapu. */
export interface LaborLine {
  readonly laborId: string;
  readonly renovationJobId: string;
  /** Region użytej stawki (po ewentualnym fallbacku). */
  readonly regionCode: string;
  readonly laborUnit: LaborUnit;
  /** Ilość z obmiarów użyta do wyceny (m²/mb/szt); 0 gdy nieoszacowana. */
  readonly quantity: number;
  /** Stawka bazowa w GROSZACH za jednostkę. */
  readonly unitPriceGrosze: number;
  /** Koszt pozycji = round(unitPriceGrosze × quantity), 0 gdy nieoszacowana. */
  readonly lineCostGrosze: number;
  /** true = policzona; false = nieoszacowana (nie wchodzi do sumy). */
  readonly estimated: boolean;
  /** Powód, gdy `estimated === false`. */
  readonly reason?: LaborUnestimatedReason;
  /** true, gdy użyto stawki 'lodzkie' mimo żądania innego regionu. */
  readonly regionFallback?: boolean;
  readonly source: LaborSource;
  readonly notes?: string;
}

/** Wynik wyceny robocizny jednego etapu. */
export interface StageLaborEstimate {
  readonly jobId: string;
  /** Region żądany (po zastosowaniu domyślnego 'lodzkie'). */
  readonly regionCode: string;
  readonly lines: LaborLine[];
  /** Suma kosztów POZYCJI OSZACOWANYCH w GROSZACH (nieoszacowane = 0). */
  readonly laborTotalGrosze: number;
  /** Ile pozycji robocizny nie dało się oszacować. */
  readonly unestimatedCount: number;
}

/**
 * Powierzchnia wiodąca etapu z obmiarów. Mirror mobile engine.getPrimaryArea, ale
 * gdy nic sensownego nie ma — zwraca 0 (pozycja stanie się „nieoszacowana"),
 * zamiast zgadywać 1.
 */
function primaryArea(m: Measurements): number {
  if (m.wallArea) return m.wallArea;
  if (m.floorArea) return m.floorArea;
  if (m.ceilingArea) return m.ceilingArea;
  if (m.area) return m.area;
  if (m.width && m.length) return m.width * m.length;
  if (m.width && m.height) return m.width * m.height;
  if (m.linearMeters) return m.linearMeters;
  if (m.perimeter) return m.perimeter;
  return 0;
}

/** Ilość dla jednostki robocizny z obmiarów (0 gdy brak pasującego obmiaru). */
function resolveLaborQuantity(unit: LaborUnit, m: Measurements): number {
  switch (unit) {
    case "m2":
      return primaryArea(m);
    case "mb":
      return m.perimeter ?? m.linearMeters ?? 0;
    case "szt":
      // Liczba urządzeń, jeśli podana; inaczej 1 (etap dotyczy jednej sztuki).
      return m.count ?? m.faucetCount ?? m.socketCount ?? 1;
    default:
      return 0;
  }
}

function toSource(rate: LaborRate): LaborSource {
  return {
    name: rate.sourceName,
    type: rate.sourceType,
    ...(rate.sourceUrl !== undefined ? { url: rate.sourceUrl } : {}),
    lastUpdated: rate.lastUpdated,
  };
}

/** Nieoszacowana pozycja robocizny (nie wchodzi do sumy). */
function unestimated(
  laborId: string,
  reason: LaborUnestimatedReason,
  rate: LaborRate | undefined,
): LaborLine {
  return {
    laborId,
    renovationJobId: rate?.renovationJobId ?? "",
    regionCode: rate?.regionCode ?? "",
    laborUnit: rate?.laborUnit ?? "m2",
    quantity: 0,
    unitPriceGrosze: rate?.priceBaselineGrosze ?? 0,
    lineCostGrosze: 0,
    estimated: false,
    reason,
    source: rate
      ? toSource(rate)
      : { name: "unknown", type: "market_reference", lastUpdated: "" },
    ...(rate?.notes !== undefined ? { notes: rate.notes } : {}),
  };
}

/**
 * Wycena robocizny etapu dla danego joba i obmiarów. Region domyślnie 'lodzkie'.
 * Zwraca listę pozycji (oszacowanych i nie) oraz sumę pozycji oszacowanych.
 */
export function estimateStageLabor(
  jobId: string,
  measurements: Measurements,
  options: EstimateOptions = {},
): StageLaborEstimate {
  const requestedRegion = options.region?.trim() || DEFAULT_LABOR_REGION;
  const laborIds = getLaborRateIdsForJob(jobId);

  const lines: LaborLine[] = [];
  for (const laborId of laborIds) {
    const rate = getLaborRateById(laborId);
    if (!rate) {
      lines.push(unestimated(laborId, "no-rate", undefined));
      continue;
    }

    // Region: dane mają tylko 'lodzkie'. Zgodność => brak fallbacku; inny region
    // => używamy stawki 'lodzkie' jako fallbacku (flaga), sumy NIE zerujemy.
    const regionFallback = rate.regionCode !== requestedRegion;

    const quantity = resolveLaborQuantity(rate.laborUnit, measurements);
    if (!(quantity > 0)) {
      lines.push({
        ...unestimated(laborId, "no-quantity", rate),
        ...(regionFallback ? { regionFallback } : {}),
      });
      continue;
    }

    const lineCostGrosze = Math.round(rate.priceBaselineGrosze * quantity);
    lines.push({
      laborId,
      renovationJobId: rate.renovationJobId,
      regionCode: rate.regionCode,
      laborUnit: rate.laborUnit,
      quantity,
      unitPriceGrosze: rate.priceBaselineGrosze,
      lineCostGrosze,
      estimated: true,
      ...(regionFallback ? { regionFallback } : {}),
      source: toSource(rate),
      ...(rate.notes !== undefined ? { notes: rate.notes } : {}),
    });
  }

  const laborTotalGrosze = lines.reduce(
    (sum, l) => sum + (l.estimated ? l.lineCostGrosze : 0),
    0,
  );
  const unestimatedCount = lines.filter((l) => !l.estimated).length;

  return {
    jobId,
    regionCode: requestedRegion,
    lines,
    laborTotalGrosze,
    unestimatedCount,
  };
}
