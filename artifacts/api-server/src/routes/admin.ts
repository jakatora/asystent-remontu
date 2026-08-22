// Endpoint administracyjny do ręcznego uruchomienia zbierania cen na realnym
// katalogu (POST /admin/collect). To operacja ZAPISUJĄCA do bazy (oferty +
// historia cen), więc jest chroniona tokenem: bez ADMIN_TOKEN endpoint jest
// wyłączony (403), a przy błędnym/braku nagłówka `x-admin-token` -> 401.
//
// Cała logika zbierania jest wstrzykiwana (deps), żeby testować bez Postgresa
// i bez sieci. DB dotykamy dopiero w handlerze — import routera nie wymaga bazy.
import { Router, type IRouter, type Request, type Response } from "express";

import type { Database } from "@workspace/db/repositories";
import {
  createSourcesFromEnv,
  resolveSourceSlugs,
  runCollectionForSources,
  type CollectionResult,
  type PriceSource,
} from "@workspace/price-collector";

import { getDb } from "../lib/db";
import {
  getSchedulerStatus as defaultGetSchedulerStatus,
  type SchedulerStatus,
} from "../scheduler";

export interface AdminRouterDeps {
  /** Token wymagany w nagłówku `x-admin-token`. Brak/pusty => endpoint wyłączony. */
  adminToken?: string;
  /** Źródło instancji Drizzle. Domyślnie leniwy singleton z ../lib/db. */
  getDb?: () => Database;
  /** Budowa adapterów wg ENV (domyślnie z price-collector). */
  buildSources?: (slugs: string[]) => Promise<PriceSource[]>;
  /** Runner zbierania (domyślnie z price-collector). */
  runCollection?: (
    sources: readonly PriceSource[],
    db: Database,
  ) => Promise<CollectionResult[]>;
  /** Rozwiązanie listy slugów (domyślnie z ENV). Zwraca też nieznane slugi. */
  resolveSlugs?: (requested?: string[]) => { slugs: string[]; unknown: string[] };
  /** Status cyklicznego schedulera (domyślnie z ../scheduler). */
  getSchedulerStatus?: () => SchedulerStatus | null;
}

/** Domyślne rozwiązanie slugów: body.sources (jeśli podane) albo ENV. */
function defaultResolveSlugs(requested?: string[]): {
  slugs: string[];
  unknown: string[];
} {
  if (requested && requested.length > 0) {
    // Ograniczamy do znanych — nieznane trafiają do `unknown` (jak w ENV wariancie).
    const all = resolveSourceSlugs({ PRICE_COLLECTOR_SOURCES: undefined }).slugs;
    const known = new Set(all);
    const slugs: string[] = [];
    const unknown: string[] = [];
    for (const s of requested) {
      if (known.has(s)) slugs.push(s);
      else unknown.push(s);
    }
    return { slugs, unknown };
  }
  return resolveSourceSlugs(process.env);
}

export function createAdminRouter(opts: AdminRouterDeps = {}): IRouter {
  const adminToken = opts.adminToken ?? process.env.ADMIN_TOKEN;
  const resolveDb = opts.getDb ?? getDb;
  const buildSources =
    opts.buildSources ?? ((slugs: string[]) => createSourcesFromEnv(slugs, process.env));
  const runCollection = opts.runCollection ?? runCollectionForSources;
  const resolveSlugs = opts.resolveSlugs ?? defaultResolveSlugs;
  const getSchedulerStatus = opts.getSchedulerStatus ?? defaultGetSchedulerStatus;

  const router: IRouter = Router();

  // Status cyklicznego schedulera — read-only, bez tokenu (same znaczniki czasu
  // i liczby ofert, bez sekretów). Gdy scheduler wyłączony -> enabled:false.
  router.get("/admin/collect/status", (_req: Request, res: Response) => {
    const scheduler = getSchedulerStatus();
    res.json({
      scheduler:
        scheduler ?? {
          enabled: false,
          intervalMs: 0,
          running: false,
          runs: 0,
          lastRunAt: null,
          lastFinishedAt: null,
          nextRunAt: null,
          lastDurationMs: null,
          lastTotals: null,
          lastError: null,
        },
    });
  });

  router.post("/admin/collect", async (req: Request, res: Response) => {
    // Bez skonfigurowanego tokenu operacja zapisu jest niedostępna (bezpieczny domyślny).
    if (!adminToken) {
      res
        .status(403)
        .json({ error: "admin_disabled", message: "ADMIN_TOKEN nie jest ustawiony" });
      return;
    }
    const provided = req.header("x-admin-token");
    if (provided !== adminToken) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    // Opcjonalny wybór źródeł: body { sources?: string[] }.
    const requested = Array.isArray((req.body as { sources?: unknown })?.sources)
      ? ((req.body as { sources: unknown[] }).sources.filter(
          (s): s is string => typeof s === "string",
        ))
      : undefined;

    const { slugs, unknown } = resolveSlugs(requested);
    if (slugs.length === 0) {
      res
        .status(400)
        .json({ error: "no_sources", message: "brak znanych źródeł do zebrania", unknown });
      return;
    }

    try {
      const sources = await buildSources(slugs);
      const db = resolveDb();
      const results = await runCollection(sources, db);
      const totals = results.reduce(
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
      res.json({ status: "ok", unknown, totals, results });
    } catch (err) {
      req.log?.error?.({ err }, "admin/collect failed");
      res
        .status(500)
        .json({ error: "collect_failed", message: (err as Error)?.message });
    }
  });

  return router;
}

export default createAdminRouter();
