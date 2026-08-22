// Klient HTTP do backendu wyceny (artifacts/api-server, router /pricing/*).
//
// Woła POST /pricing/stage (jeden etap) i POST /pricing/project (cały remont) na
// realnym katalogu cen w Postgresie. Bierze REALNY wynik lokalnego kalkulatora
// (engine.calculate → CalculationResult) i mapuje go na kontrakt wejścia serwera
// (CalculatorStageResult) — ceny/opakowania liczy backend, klient NIC nie zgaduje.
//
// KONWENCJA PIENIĘDZY: wszystkie kwoty przychodzą z API w GROSZACH (integer),
// spójnie z @workspace/pricing-service. Konwersja na PLN jest wyłącznie
// prezentacyjna: grosze/100 z dwoma miejscami — bez mnożenia floatów, bez
// przeliczania kwot po stronie klienta (money-path: kwoty z wartości faktycznych).
//
// Pozycje nierozpoznane (brak produktu/oferty w katalogu) NIE są ukrywane —
// backend zwraca je z `resolved:false`, a UI pokazuje je osobno, żeby suma nie
// wyglądała na kompletną, gdy nią nie jest (money-path: nie chowaj nierozliczonych).

import type { CalculationResult } from '@/types/domain';

// ─── Konfiguracja bazowego URL ────────────────────────────────────────────────
// Osobny publiczny env, żeby dało się wskazać serwer wyceny niezależnie od reszty.
// Pusty = wycena zdalna niedostępna (UI pokazuje stan „skonfiguruj adres API").
const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_PRICING_API_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  '';

/** Bazowy URL bez końcowych slashy (albo null, gdy nie skonfigurowano). */
export const pricingApiBaseUrl: string | null = RAW_BASE_URL
  ? RAW_BASE_URL.replace(/\/+$/, '')
  : null;

/** Czy zdalna wycena jest w ogóle skonfigurowana (jest adres serwera). */
export const isPricingApiConfigured = pricingApiBaseUrl !== null;

// ─── Kontrakt WEJŚCIA (zgodny z api-server/lib/pricing-schema.ts) ─────────────

export interface PricingMaterialInput {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly category?: string | null;
  readonly ean?: string | null;
  readonly gtin?: string | null;
}

export interface PricingMaterialLineInput {
  readonly material: PricingMaterialInput;
  /** Ilość natywna policzona przez silnik (nieujemna). */
  readonly quantity: number;
  /** Opakowania referencyjne z mobile — backend ich NIE używa (liczy z katalogu). */
  readonly packs?: number;
}

export interface PricingStageInput {
  readonly jobId: string;
  readonly materials: readonly PricingMaterialLineInput[];
}

export interface PricingOptions {
  readonly region?: string | null;
  readonly store?: string | null;
}

// ─── Kontrakt ODPOWIEDZI (zgodny z api-server/lib/pricing-serialize.ts) ────────

export type UnresolvedReason =
  | 'not_found'
  | 'no_offer'
  | 'no_price'
  | 'empty_query';

export interface SerializedProduct {
  id: string;
  name: string;
  ean: string | null;
  gtin: string | null;
  category: string | null;
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
  query: {
    ean: string | null;
    gtin: string | null;
    normalizedName: string | null;
    category: string | null;
  };
  /** Koszt pozycji w GROSZACH (0 dla nierozpoznanych). */
  lineCostGrosze: number;
  product?: SerializedProduct;
  cheapestOffer?: SerializedOffer;
  packageSize?: number;
  packagesNeeded?: number;
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

// ─── Błędy klienta ─────────────────────────────────────────────────────────────

/** Rzucane, gdy nie ma skonfigurowanego adresu serwera wyceny. */
export class PricingApiNotConfiguredError extends Error {
  readonly name = 'PricingApiNotConfiguredError';
  constructor() {
    super('Adres serwera wyceny nie jest skonfigurowany (EXPO_PUBLIC_PRICING_API_URL).');
  }
}

/** Rzucane, gdy serwer wyceny odpowie statusem HTTP != 2xx. */
export class ApiError extends Error {
  readonly name = 'ApiError';
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ─── Mapowanie wyniku kalkulatora → wejście API ───────────────────────────────

/** Bezpiecznie czyta opcjonalny kod (ean/gtin) z materiału, jeśli w ogóle istnieje. */
function readOptionalCode(material: object, key: 'ean' | 'gtin'): string | null {
  const value = (material as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

/**
 * Mapuje REALNY `CalculationResult` (engine.calculate) na wejście serwera wyceny.
 * Kopiuje tylko pola kontraktu — nie zmienia formuł, ID jobów ani danych
 * kalkulatora (read-only). `packs` przekazujemy informacyjnie; backend liczy
 * opakowania z katalogu.
 */
export function toPricingStageInput(calc: CalculationResult): PricingStageInput {
  return {
    jobId: calc.jobId,
    materials: calc.materials.map((line) => ({
      material: {
        id: line.material.id,
        name: line.material.name,
        unit: line.material.unit,
        category: line.material.category ?? null,
        ean: readOptionalCode(line.material, 'ean'),
        gtin: readOptionalCode(line.material, 'gtin'),
      },
      quantity: line.quantity,
      ...(line.packs !== undefined ? { packs: line.packs } : {}),
    })),
  };
}

// ─── Wywołania HTTP ────────────────────────────────────────────────────────────

function endpoint(path: string): string {
  if (pricingApiBaseUrl === null) throw new PricingApiNotConfiguredError();
  return `${pricingApiBaseUrl}${path}`;
}

/** POST JSON → parsuje odpowiedź; rzuca ApiError na status != 2xx. */
async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(endpoint(path), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // Serwer wyceny zwraca { error, message } — wyciągamy komunikat, jeśli jest.
    let detail = '';
    try {
      const data = (await response.json()) as { error?: string; message?: string };
      detail = data?.message ?? data?.error ?? '';
    } catch {
      /* body nie-JSON — zostaje sam status */
    }
    throw new ApiError(
      response.status,
      detail ? `HTTP ${response.status}: ${detail}` : `HTTP ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

// Router wyceny jest zamontowany pod /api (artifacts/api-server: app.use("/api", ...)),
// więc pełne ścieżki to /api/pricing/*. Bazowy URL z env = origin serwera.
/** Wycena JEDNEGO etapu. POST /api/pricing/stage. */
export async function estimateStage(
  stage: PricingStageInput,
  options?: PricingOptions,
): Promise<SerializedStage> {
  return postJson<SerializedStage>('/api/pricing/stage', {
    job: stage,
    ...(options ? { options } : {}),
  });
}

/** Wycena CAŁEGO remontu (N etapów). POST /api/pricing/project. */
export async function estimateProject(
  stages: readonly PricingStageInput[],
  options?: PricingOptions,
): Promise<SerializedProject> {
  return postJson<SerializedProject>('/api/pricing/project', {
    jobs: stages,
    ...(options ? { options } : {}),
  });
}

// ─── Prezentacja pieniędzy ──────────────────────────────────────────────────────

/**
 * Grosze (integer) → napis PLN „12.34 PLN". Konwersja czysto prezentacyjna:
 * dzielenie przez 100 i `toFixed(2)` (bez mnożenia floatów). Styl spójny z
 * `shared/lib/currency.ts#formatCurrency`.
 */
export function formatGrosze(grosze: number | null | undefined, currency = 'PLN'): string {
  if (grosze === null || grosze === undefined || !isFinite(grosze)) {
    return `0.00 ${currency}`;
  }
  return `${(grosze / 100).toFixed(2)} ${currency}`;
}
