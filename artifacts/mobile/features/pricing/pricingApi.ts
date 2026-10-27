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
import { getRequiredQuantity } from '@/features/calculator/requirements';
import { getMaterialsForJob } from './registry';
import { resolveMaterialQuantity } from './quantity';
import { applyDoorSelection, type DoorSelection } from './doorSelection';
import { upgradeCalculation } from '@/features/calculator/upgrades';
import { priceTileSpacer } from './tileSpacers';
import { priceKitchenMaterial } from './kitchenMaterials';
import type { MaterialCategory } from '@/types/pricing';
import type { DeliverySettings, DeliveryComparison } from '../../../../lib/pricing-service/src/delivery';
import type { UnresolvedReason as ServiceUnresolvedReason, PriceVerification } from '../../../../lib/pricing-service/src/types';

// ─── Konfiguracja bazowego URL ────────────────────────────────────────────────
// Osobny publiczny env, żeby dało się wskazać serwer wyceny niezależnie od reszty.
// Domyślnie korzystamy ze wspólnego backendu, w osobnej przestrzeni /api/remont.
const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_PRICING_API_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  'https://backend-production-a43e3.up.railway.app/api/remont';

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
  /**
   * Obmiary etapu (MeasurementMap: m² ścian/podłogi, mb obwodu, szt urządzeń).
   * Opcjonalne — backend używa ich WYŁĄCZNIE do wyceny robocizny (materiały bez
   * zmian). Brak => robocizna nieoszacowana.
   */
  readonly measurements?: Readonly<Record<string, number>>;
}

export interface PricingOptions {
  readonly refreshPrices?: boolean;
  readonly delivery?: DeliverySettings;
  readonly region?: string | null;
  readonly store?: string | null;
}

// ─── Kontrakt ODPOWIEDZI (zgodny z api-server/lib/pricing-serialize.ts) ────────

export type UnresolvedReason =
  | ServiceUnresolvedReason
  | 'not_found'
  | 'no_offer'
  | 'no_price'
  | 'empty_query';

export interface SerializedProduct {
  imageUrl?: string | null;
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

/**
 * Pojedyncza oferta produktu w konkretnym sklepie — do porównania cen per produkt
 * (Sklep A/B/C + najtańszy). Wszystkie kwoty w GROSZACH. Zgodny z
 * api-server/lib/pricing-serialize.ts#SerializedProductOffer.
 */
export interface SerializedProductOffer {
  purchaseMultiple?: number;
  minimumPackages?: number;
  maxPackages?: number;
  verification?: PriceVerification;
  packageSize?: string | null;
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
  /** Moment pobrania ceny (ISO 8601 UTC) z rekordu oferty; null gdy brak. */
  fetchedAt: string | null;
  /** Źródło danych oferty (np. "Leroy Merlin — feed"); null gdy brak. */
  source: string | null;
}

/**
 * Jedna wybrana wielkość opakowania w optymalnym doborze zakupu (np. „2× 10 l").
 * Kwoty w GROSZACH. Zgodny z api-server/lib/pricing-serialize.ts#SerializedPackage.
 */
export interface SerializedPackage {
  purchaseMultiple?: number;
  minimumPackages?: number;
  maxPackages?: number;
  verification?: PriceVerification;
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
  /**
   * Wszystkie oferty produktu, POSORTOWANE od najtańszej (pierwsza = najtańsza).
   * Oferty bez ceny (priceGrosze === null) na końcu. Obecne dla resolved: true.
   */
  offers?: SerializedProductOffer[];
  packageSize?: number;
  packagesNeeded?: number;
  /**
   * Optymalny dobór wielkości opakowań: najtańsza KOMBINACJA rozmiarów (np.
   * 2× 10 l + 1× 5 l) zamiast jednego rozmiaru × sufit. Obecne dla resolved: true.
   */
  packages?: SerializedPackage[];
  /** Łączny koszt optymalnej kombinacji opakowań w GROSZACH. */
  packagesTotalGrosze?: number;
  /** Oszczędność vs wycena naiwna = lineCostGrosze - packagesTotalGrosze (>= 0), GROSZE. */
  packagesSavingsGrosze?: number;
  /** Naddatek kombinacji = pokryta ilość - wymagana (w jednostkach materiału). */
  packagesOverage?: number;
  reason?: UnresolvedReason;
}

/**
 * Jedna pozycja ROBOCIZNY etapu (m²/mb/szt × stawka). Kwoty w GROSZACH. Zgodny z
 * api-server/lib/pricing-serialize.ts#SerializedLaborLine. Pozycje nieoszacowane
 * mają `lineCostGrosze: 0` i NIE wchodzą do `laborTotalGrosze`.
 */
export interface SerializedLaborLine {
  laborId: string;
  renovationJobId: string;
  regionCode: string;
  laborUnit: string;
  quantity: number;
  unitPriceGrosze: number;
  lineCostGrosze: number;
  estimated: boolean;
  reason?: string;
  regionFallback?: boolean;
  source: { name: string; type: string; url?: string; lastUpdated: string };
  notes?: string;
}

/** Rozbicie robocizny etapu. Zgodny z api-server#SerializedStageLabor. */
export interface SerializedStageLabor {
  jobId: string;
  regionCode: string;
  lines: SerializedLaborLine[];
  /** Suma pozycji OSZACOWANYCH, w GROSZACH. */
  laborTotalGrosze: number;
  unestimatedCount: number;
}

export interface SerializedStage {
  jobId?: string;
  lines: SerializedLine[];
  /** Ile pozycji nie udało się wycenić. */
  unresolvedCount: number;
  /** Suma kosztów rozpoznanych MATERIAŁÓW etapu, w GROSZACH. */
  stageTotalGrosze: number;
  // ── ADDYTYWNE: rozbicie na materiały + robociznę (obecne, gdy backend policzył) ──
  /** Koszt materiałów etapu (= `stageTotalGrosze`), w GROSZACH. */
  materialsTotalGrosze?: number;
  /** Koszt robocizny etapu (suma pozycji oszacowanych), w GROSZACH. */
  laborTotalGrosze?: number;
  /** Pełny koszt etapu = materiały + robocizna, w GROSZACH. */
  stageTotalWithLaborGrosze?: number;
  /** Szczegóły robocizny (pozycje, źródła, nieoszacowane). */
  labor?: SerializedStageLabor;
}

/** Skonsolidowana pozycja zakupowa całego remontu (jeden produkt ze wszystkich etapów). */
export interface SerializedConsolidatedLine {
  packages?: SerializedPackage[];
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
  /** Oszczędność vs suma per-etap, w GROSZACH. */
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

/** Koszt kupienia całej listy zakupowej w JEDNYM sklepie (z niepokrytymi). */
export interface SerializedStoreBasket {
  store: string;
  /** Suma kosztów pozycji, które sklep pokrywa, w GROSZACH. */
  totalGrosze: number;
  /** Ile skonsolidowanych produktów sklep pokrywa. */
  coveredCount: number;
  /** Ile produktów sklep NIE pokrywa (brak oferty). */
  missingCount: number;
  /** ID produktów niepokrytych (puste przy pełnym pokryciu). */
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
  /** Liczba skonsolidowanych produktów do kupienia. */
  productCount: number;
  /** Koszyk optymalny = suma najtańszych ofert per produkt, w GROSZACH. */
  optimalBasketGrosze: number;
  /** Rozbicie koszyka optymalnego po sklepach. */
  optimalByStore: SerializedOptimalStoreLine[];
  /** Koszt całości per sklep, rosnąco po totalGrosze. */
  stores: SerializedStoreBasket[];
  /** Najtańszy sklep pokrywający WSZYSTKO, albo null. */
  cheapestFullStore: SerializedStoreBasket | null;
  /** Ile więcej niż koszyk optymalny kosztuje najtańszy pełny sklep (GROSZE), albo null. */
  singleStoreExtraGrosze: number | null;
}

export interface SerializedProject {
  priceRefresh?: { status: 'updated' | 'recent'; checkedAt: string | null; confirmedOfferIds: string[]; failedOfferIds: string[]; retryAfterSeconds: number };
  deliveryComparison?: DeliveryComparison;
  coverage?: {
    pickupConfirmationStores?: string[];
    pickupUnavailableStores?: string[];
    pickupOnlyStores?: string[];
    offers: number;
    products: number;
    stores: string[];
    sources: { id: string; store: string; checkedAt: string | null; error: string | null; active?: boolean }[];
    scope: { channel: string; currency: string; deliveryIncluded: boolean; locationAdjusted: boolean };
  };
  stages: SerializedStage[];
  /** Suma MATERIAŁÓW wszystkich etapów, w GROSZACH. */
  projectTotalGrosze: number;
  // ── ADDYTYWNE: rozbicie całego remontu na materiały + robociznę ──
  /** Koszt materiałów całego remontu (= `projectTotalGrosze`), w GROSZACH. */
  materialsTotalGrosze?: number;
  /** Suma robocizny wszystkich etapów (pozycje oszacowane), w GROSZACH. */
  laborTotalGrosze?: number;
  /** Pełny koszt remontu = materiały + robocizna, w GROSZACH. */
  projectTotalWithLaborGrosze?: number;
  /** Skonsolidowana lista zakupowa całego remontu (kup raz, licz opakowania łącznie). */
  consolidated: SerializedConsolidatedList;
  /** Porównanie sklepów: koszt całości per sklep + koszyk optymalny + najtańszy sklep. */
  storeComparison: SerializedStoreComparison;
}

// ─── Kontrakt HISTORII CEN (GET /pricing/history) ─────────────────────────────
// Warstwa odczytu nad price_history: statystyki (grosze) + punkty historyczne.

export interface SerializedPriceStats {
  /** Liczba historycznych punktów z ceną. */
  count: number;
  /** Najniższa cena historyczna (grosze) albo null. */
  lowest: number | null;
  /** Średnia cena historyczna (grosze) albo null. */
  average: number | null;
  /** Aktualna najtańsza cena (grosze) albo null. */
  current: number | null;
  /** Różnica current − lowest (grosze). Ujemna = poniżej dołka. */
  changeVsLowest: number | null;
  /** % zmiana ostatniego pomiaru vs poprzedni (dodatnia = drożej). */
  changePct: number | null;
  /** Czy `current` to prawdziwa promocja (istotnie < średniej historycznej). */
  isRealPromo: boolean;
}

export interface SerializedHistoryPoint {
  store: string;
  source: string | null;
  /** ISO 8601 (UTC). */
  fetchedAt: string;
  priceGrosze: number | null;
  promoPriceGrosze: number | null;
  effectiveGrosze: number | null;
}

export interface PriceHistoryResponse {
  product: SerializedProduct;
  stats: SerializedPriceStats;
  history: SerializedHistoryPoint[];
}

/** Identyfikacja produktu do zapytania o historię — jeden z kluczy wystarczy. */
export interface PriceHistoryQuery {
  productId?: string | null;
  ean?: string | null;
  gtin?: string | null;
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
export function toPricingStageInput(calc: CalculationResult, tier: MaterialCategory = 'standard', doorSelection?: DoorSelection | null): PricingStageInput {
  calc = upgradeCalculation(calc) ?? calc;
  const references = getMaterialsForJob(calc.jobId, tier, calc.measurements);
  return applyDoorSelection({
    jobId: calc.jobId,
    materials: calc.materials.filter(line => line.quantityKnown === false || getRequiredQuantity(line, calc) > 0).map((line) => {
      if (line.quantityKnown === false) return { material: { id: line.material.id, name: `${line.material.name} — ilość do ustalenia`, unit: 'pozycja', category: null }, quantity: 1 };
      const matches = references.filter(ref => resolveMaterialQuantity(ref, calc)?.source.material.id === line.material.id);
      const reference = matches.length === 1 ? matches[0] : undefined;
      return priceKitchenMaterial(priceTileSpacer({
        material: {
          id: line.material.id,
          name: reference?.productLabel ?? line.material.name,
          unit: reference?.packageUnit ?? line.material.unit,
          category: reference?.materialType ?? line.material.category ?? null,
          ean: readOptionalCode(line.material, 'ean'),
          gtin: readOptionalCode(line.material, 'gtin'),
        },
        quantity: reference ? resolveMaterialQuantity(reference, calc)!.quantity : getRequiredQuantity(line, calc),
        ...(line.packs !== undefined ? { packs: line.packs } : {}),
      }, calc.jobId, calc.measurements), calc.jobId);
    }),
    // Obmiary przekazujemy bez zmian — backend liczy z nich robociznę (m²/mb/szt).
    ...(calc.measurements ? { measurements: calc.measurements } : {}),
  }, calc, doorSelection);
}

// ─── Wywołania HTTP ────────────────────────────────────────────────────────────

function endpoint(path: string): string {
  if (pricingApiBaseUrl === null) throw new PricingApiNotConfiguredError();
  // Preserve legacy standalone servers configured by origin in EXPO_PUBLIC_*.
  const route = pricingApiBaseUrl.endsWith('/api/remont') ? path.replace(/^\/api\/pricing/, '/pricing') : path;
  return `${pricingApiBaseUrl}${route}`;
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
  // This client renders the required separate-order breakdown. Older clients
  // do not send this opt-in and retain one merchant order per store.
  const requestOptions = options?.delivery?.mode === 'shipping' ? { ...options, delivery: { ...options.delivery, allowSeparateOrders: options.delivery.allowSeparateOrders ?? true } } : options;
  return postJson<SerializedProject>('/api/pricing/project', {
    jobs: stages,
    ...(requestOptions ? { options: requestOptions } : {}),
  });
}

/**
 * GET historii/statystyk cen JEDNEGO produktu. GET /api/pricing/history.
 * Zwraca `null`, gdy produkt nie ma jeszcze wpisów w katalogu/historii (404) —
 * to normalny przypadek, UI po prostu nie pokazuje wskaźnika. Inne błędy (5xx,
 * brak sieci) propaguje, żeby nie maskować awarii.
 */
export async function fetchPriceHistory(
  query: PriceHistoryQuery,
): Promise<PriceHistoryResponse | null> {
  const params = new URLSearchParams();
  if (query.productId) params.set('productId', query.productId);
  else if (query.ean) params.set('ean', query.ean);
  else if (query.gtin) params.set('gtin', query.gtin);
  if ([...params.keys()].length === 0) return null; // brak identyfikatora — nic nie pytamy

  const response = await fetch(endpoint(`/api/pricing/history?${params.toString()}`), {
    method: 'GET',
    headers: { accept: 'application/json' },
  });

  if (response.status === 404) return null; // brak historii dla produktu — nie błąd

  if (!response.ok) {
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

  return (await response.json()) as PriceHistoryResponse;
}

// ─── Prezentacja pieniędzy ──────────────────────────────────────────────────────

/** Display integer grosze in the user's notation. An unknown amount must never
 * look like a free product or delivery. This does not change price arithmetic. */
export function formatGrosze(grosze: number | null | undefined, currency = 'PLN', locale='pl-PL'): string {
  if (typeof grosze!=='number'||!Number.isSafeInteger(grosze)) return '—';
  return new Intl.NumberFormat(locale,{style:'currency',currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(grosze/100);
}
