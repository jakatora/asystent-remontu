// Wbudowany, cykliczny harmonogram Price Collectora.
//
// Co ustalony interwał (ENV `COLLECT_INTERVAL_MS`) sam wywołuje TEN SAM kod co
// CLI `collect` i POST /admin/collect — `runCollectionForSources` nad realnym
// Postgresem. Każdy przebieg przechodzi przez upsertOffer -> price_history, więc
// warstwa odczytu (najniższa/średnia/zmiana) zyskuje realne punkty w czasie.
//
// Zasady:
//   - domyślnie WYŁĄCZONY — bez `COLLECT_INTERVAL_MS` (dodatnia liczba ms)
//     scheduler się nie uruchamia (bezpieczny domyślny),
//   - NIE blokuje startu serwera — planuje `setInterval` i (opcjonalnie) odpala
//     pierwszy przebieg fire-and-forget,
//   - NAKŁADKOWY LOCK — jeśli poprzedni przebieg jeszcze trwa, kolejne tyknięcie
//     jest pomijane (dwa przebiegi się nie zazębią),
//   - loguje każdy przebieg (start / koniec / ile ofert / błędy) i utrzymuje
//     status (lastRunAt / nextRunAt / totals) widoczny w GET /admin/collect/status.
//
// Wszystkie zależności (DB, budowa źródeł, runner, zegar, setInterval) są
// wstrzykiwane, żeby testować bez Postgresa, bez sieci i deterministycznie.
import type { Database } from "@workspace/db/repositories";
import {
  createSourcesFromEnv,
  resolveSourceSlugs,
  runCollectionForSources,
  type CollectionResult,
  type PriceSource,
} from "@workspace/price-collector";

import { logger as defaultLogger } from "./lib/logger";

/** Sumaryczne liczby jednego przebiegu (agregat po wszystkich źródłach). */
export interface CollectionTotals {
  offersProcessed: number;
  offersUpserted: number;
  productsCreated: number;
  productsMatched: number;
  errors: number;
}

/** Migawka stanu schedulera — serializowalna, zwracana przez status endpoint. */
export interface SchedulerStatus {
  enabled: boolean;
  /** Interwał w ms (0 gdy wyłączony). */
  intervalMs: number;
  /** Czy przebieg TRWA właśnie teraz (nakładkowy lock). */
  running: boolean;
  /** Liczba zakończonych przebiegów (udanych i nieudanych). */
  runs: number;
  /** ISO startu ostatniego przebiegu. */
  lastRunAt: string | null;
  /** ISO zakończenia ostatniego przebiegu. */
  lastFinishedAt: string | null;
  /** ISO planowanego kolejnego tyknięcia. */
  nextRunAt: string | null;
  /** Czas trwania ostatniego przebiegu w ms. */
  lastDurationMs: number | null;
  /** Sumy ostatniego udanego przebiegu. */
  lastTotals: CollectionTotals | null;
  /** Komunikat błędu ostatniego przebiegu (null gdy OK). */
  lastError: string | null;
}

/** Konfiguracja odczytana z ENV. */
export interface SchedulerConfig {
  enabled: boolean;
  intervalMs: number;
  runOnStart: boolean;
}

/**
 * Ustala konfigurację schedulera z ENV:
 *   COLLECT_INTERVAL_MS   - dodatnia liczba ms; brak/0/nie-liczba => WYŁĄCZONY,
 *   COLLECT_RUN_ON_START  - "true"/"1" => odpal pierwszy przebieg od razu.
 */
export function resolveSchedulerConfigFromEnv(
  env: Record<string, string | undefined>,
): SchedulerConfig {
  const raw = env["COLLECT_INTERVAL_MS"];
  const intervalMs = raw != null && raw.trim() !== "" ? Number(raw) : Number.NaN;
  const enabled = Number.isFinite(intervalMs) && intervalMs > 0;
  const runOnStart =
    env["COLLECT_RUN_ON_START"] === "true" || env["COLLECT_RUN_ON_START"] === "1";
  return { enabled, intervalMs: enabled ? intervalMs : 0, runOnStart };
}

/** Minimalny interfejs loggera (kompatybilny z pino), wstrzykiwalny w testach. */
export interface SchedulerLogger {
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
  error(obj: object, msg?: string): void;
}

/** Uchwyt timera — kompatybilny z globalnym `setInterval` (Node zwraca Timeout). */
export interface IntervalHandle {
  unref?: () => void;
}

export interface SchedulerDeps {
  /** Instancja Drizzle (realny Postgres w bootstrapie serwera). */
  db: Database;
  /** Interwał w ms (musi być > 0). */
  intervalMs: number;
  /** Czy odpalić pierwszy przebieg natychmiast po starcie (domyślnie false). */
  runOnStart?: boolean;
  logger?: SchedulerLogger;
  /** Zegar (do deterministycznych testów). Domyślnie `Date.now`. */
  now?: () => number;
  /** Budowa adapterów wg slugów (domyślnie z ENV przez price-collector). */
  buildSources?: (slugs: string[]) => Promise<PriceSource[]>;
  /** Runner zbierania (domyślnie z price-collector). */
  runCollection?: (
    sources: readonly PriceSource[],
    db: Database,
  ) => Promise<CollectionResult[]>;
  /** Rozwiązanie listy slugów (domyślnie z ENV). */
  resolveSlugs?: () => { slugs: string[]; unknown: string[] };
  /** Wstrzykiwany `setInterval` (do testów). Domyślnie globalny. */
  setIntervalFn?: (callback: () => void, ms: number) => IntervalHandle;
  /** Wstrzykiwany `clearInterval` (do testów). Domyślnie globalny. */
  clearIntervalFn?: (handle: IntervalHandle) => void;
}

export interface SchedulerHandle {
  /** Zatrzymuje harmonogram (czyści timer). */
  stop(): void;
  /** Bieżąca migawka statusu. */
  getStatus(): SchedulerStatus;
  /** Ręcznie wymusza jeden przebieg (respektuje nakładkowy lock). */
  triggerNow(): Promise<void>;
}

// --- Współdzielony status procesu (czytany przez GET /admin/collect/status) ---
let currentStatus: SchedulerStatus | null = null;

/** Zwraca kopię aktualnego statusu schedulera (albo null, gdy nie wystartował). */
export function getSchedulerStatus(): SchedulerStatus | null {
  return currentStatus ? { ...currentStatus } : null;
}

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

function sumTotals(results: readonly CollectionResult[]): CollectionTotals {
  return results.reduce<CollectionTotals>(
    (acc, r) => ({
      offersProcessed: acc.offersProcessed + r.offersProcessed,
      offersUpserted: acc.offersUpserted + r.offersUpserted,
      productsCreated: acc.productsCreated + r.productsCreated,
      productsMatched: acc.productsMatched + r.productsMatched,
      errors: acc.errors + r.errors.length,
    }),
    {
      offersProcessed: 0,
      offersUpserted: 0,
      productsCreated: 0,
      productsMatched: 0,
      errors: 0,
    },
  );
}

/**
 * Uruchamia cykliczny scheduler Price Collectora. NIE blokuje — zwraca uchwyt.
 * Wywoływać TYLKO gdy scheduler jest włączony (patrz `resolveSchedulerConfigFromEnv`).
 */
export function startPriceCollectorScheduler(
  deps: SchedulerDeps,
): SchedulerHandle {
  const {
    db,
    intervalMs,
    runOnStart = false,
    logger = defaultLogger,
    now = () => Date.now(),
    buildSources = (slugs: string[]) => createSourcesFromEnv(slugs, process.env),
    runCollection = runCollectionForSources,
    resolveSlugs = () => resolveSourceSlugs(process.env),
    setIntervalFn = (cb, ms) => {
      const h = setInterval(cb, ms);
      // Nie trzymaj procesu przy życiu tylko dla timera (czysty shutdown/testy).
      h.unref?.();
      return h;
    },
    clearIntervalFn = (h) => clearInterval(h as unknown as NodeJS.Timeout),
  } = deps;

  if (!(intervalMs > 0)) {
    throw new Error(
      `startPriceCollectorScheduler: intervalMs musi być > 0 (otrzymano ${intervalMs})`,
    );
  }

  const status: SchedulerStatus = {
    enabled: true,
    intervalMs,
    running: false,
    runs: 0,
    lastRunAt: null,
    lastFinishedAt: null,
    nextRunAt: toIso(now() + intervalMs),
    lastDurationMs: null,
    lastTotals: null,
    lastError: null,
  };
  currentStatus = status;

  let running = false;

  async function tick(): Promise<void> {
    // Nakładkowy lock — nie pozwól, by dwa przebiegi się zazębiły.
    if (running) {
      logger.warn(
        { lastRunAt: status.lastRunAt },
        "[scheduler] pomijam przebieg — poprzedni jeszcze trwa",
      );
      return;
    }
    running = true;
    status.running = true;
    const startedAt = now();
    status.lastRunAt = toIso(startedAt);
    logger.info({ intervalMs }, "[scheduler] start przebiegu zbierania cen");

    try {
      const { slugs, unknown } = resolveSlugs();
      if (unknown.length > 0) {
        logger.warn(
          { unknown },
          "[scheduler] pominięto nieznane źródła",
        );
      }
      if (slugs.length === 0) {
        status.lastError = "brak znanych źródeł (sprawdź PRICE_COLLECTOR_SOURCES)";
        logger.warn({}, `[scheduler] ${status.lastError}`);
        return;
      }

      const sources = await buildSources(slugs);
      const results = await runCollection(sources, db);
      const totals = sumTotals(results);
      status.lastTotals = totals;
      status.lastError = null;
      logger.info(
        { slugs, ...totals },
        `[scheduler] przebieg zakończony: zapisano ${totals.offersUpserted} ofert, błędów ${totals.errors}`,
      );
    } catch (err) {
      status.lastError = (err as Error)?.message ?? String(err);
      logger.error({ err }, "[scheduler] przebieg nieudany");
    } finally {
      const finishedAt = now();
      running = false;
      status.running = false;
      status.runs += 1;
      status.lastFinishedAt = toIso(finishedAt);
      status.lastDurationMs = finishedAt - startedAt;
      status.nextRunAt = toIso(finishedAt + intervalMs);
    }
  }

  const handle = setIntervalFn(() => {
    void tick();
  }, intervalMs);

  if (runOnStart) {
    // Fire-and-forget — nie blokujemy startu serwera.
    void tick();
  }

  return {
    stop() {
      clearIntervalFn(handle);
      status.nextRunAt = null;
    },
    getStatus() {
      return { ...status };
    },
    triggerNow() {
      return tick();
    },
  };
}
