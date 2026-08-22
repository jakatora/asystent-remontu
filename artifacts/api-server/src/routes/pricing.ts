// Endpointy wyceny etapu / całego remontu na realnym katalogu cen w Postgresie.
//
// Spina gotowe pakiety: adapter kalkulatora (@workspace/pricing-service) liczy
// wycenę, a połączenie DB (../lib/db) dostarcza realne DAO przez wstrzyknięty
// singleton Drizzle. `deps` (EstimateDeps) można nadpisać w testach, żeby liczyć
// bez Postgresa. DB dotykamy dopiero w handlerze — import routera nie wymaga bazy.
import { Router, type IRouter, type Request, type Response } from "express";
import { sql } from "drizzle-orm";

import type {
  Database,
  PriceHistory,
  PriceStatsGrosze,
  Product,
} from "@workspace/db/repositories";
import {
  priceHistoryRepository,
  productsRepository,
} from "@workspace/db/repositories";
import {
  estimateProjectCostFromCalculation,
  estimateStageCostFromCalculation,
  type EstimateDeps,
  type EstimateOptions,
} from "@workspace/pricing-service";

import { getDb } from "../lib/db";
import {
  projectRequestSchema,
  stageRequestSchema,
} from "../lib/pricing-schema";
import {
  serializePriceHistory,
  serializeProject,
  serializeStage,
} from "../lib/pricing-serialize";

/** Tabele katalogu, których obecność sprawdza healthcheck. */
const TABLES = ["products", "product_offers", "price_history"] as const;

/**
 * DAO warstwy odczytu historii cen — wstrzykiwane, żeby testować endpoint
 * /pricing/history bez Postgresa (domyślnie realne repozytoria z @workspace/db).
 */
export interface HistoryDeps {
  findProductById(db: Database, id: string): Promise<Product | undefined>;
  findProductByCode(
    db: Database,
    code: { ean?: string | null; gtin?: string | null },
  ): Promise<Product | undefined>;
  getPriceStatsForProduct(
    db: Database,
    productId: string,
  ): Promise<PriceStatsGrosze>;
  getPriceHistoryForProduct(
    db: Database,
    productId: string,
  ): Promise<PriceHistory[]>;
}

const defaultHistoryDeps: HistoryDeps = {
  findProductById: (db, id) => productsRepository.findById(db, id),
  findProductByCode: (db, code) =>
    productsRepository.findByEanOrGtin(db, code),
  getPriceStatsForProduct: (db, id) =>
    priceHistoryRepository.getPriceStatsForProduct(db, id),
  getPriceHistoryForProduct: (db, id) =>
    priceHistoryRepository.getPriceHistoryForProduct(db, id),
};

export interface PricingRouterDeps {
  /** Źródło instancji Drizzle. Domyślnie leniwy singleton z ../lib/db. */
  getDb?: () => Database;
  /** Wstrzykiwane DAO wyceny (do testów bez realnej bazy). */
  deps?: EstimateDeps;
  /** Wstrzykiwane DAO historii cen (do testów bez realnej bazy). */
  historyDeps?: HistoryDeps;
}

function badRequest(res: Response, error: string, extra?: unknown): void {
  res.status(400).json({ error, ...(extra !== undefined ? { details: extra } : {}) });
}

export function createPricingRouter(opts: PricingRouterDeps = {}): IRouter {
  const resolveDb = opts.getDb ?? getDb;
  const historyDeps = opts.historyDeps ?? defaultHistoryDeps;
  const router: IRouter = Router();

  // Wycena JEDNEGO etapu: body { job: CalculatorStageResult, options? }.
  router.post("/pricing/stage", async (req: Request, res: Response) => {
    const parsed = stageRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      badRequest(res, "invalid_request", parsed.error.issues);
      return;
    }
    try {
      const db = resolveDb();
      const stage = await estimateStageCostFromCalculation(
        db,
        parsed.data.job,
        (parsed.data.options ?? {}) as EstimateOptions,
        opts.deps,
      );
      res.json(serializeStage(stage));
    } catch (err) {
      req.log?.error?.({ err }, "pricing/stage failed");
      res
        .status(500)
        .json({ error: "estimate_failed", message: (err as Error)?.message });
    }
  });

  // Wycena CAŁEGO remontu — wspólny handler dla POST (body) i GET (?payload=).
  async function handleProject(
    payload: unknown,
    req: Request,
    res: Response,
  ): Promise<void> {
    const parsed = projectRequestSchema.safeParse(payload);
    if (!parsed.success) {
      badRequest(res, "invalid_request", parsed.error.issues);
      return;
    }
    try {
      const db = resolveDb();
      const project = await estimateProjectCostFromCalculation(
        db,
        parsed.data.jobs,
        (parsed.data.options ?? {}) as EstimateOptions,
        opts.deps,
      );
      res.json(serializeProject(project));
    } catch (err) {
      req.log?.error?.({ err }, "pricing/project failed");
      res
        .status(500)
        .json({ error: "estimate_failed", message: (err as Error)?.message });
    }
  }

  router.post("/pricing/project", (req, res) =>
    handleProject(req.body, req, res),
  );

  // GET dla całego remontu: payload jako URL-encoded JSON {jobs, options} w ?payload=.
  // (GET z ciałem jest nieinteroperacyjny, więc przenosimy payload do query.)
  router.get("/pricing/project", (req, res) => {
    const raw = req.query.payload;
    if (typeof raw !== "string") {
      badRequest(
        res,
        "missing_payload",
        "GET /pricing/project wymaga ?payload=<url-encoded JSON {jobs, options}>",
      );
      return;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      badRequest(res, "invalid_payload_json");
      return;
    }
    void handleProject(payload, req, res);
  });

  // Odczyt historii cen JEDNEGO produktu: ?productId=... albo ?ean=/?gtin=...
  // Zwraca produkt + statystyki w groszach (najniższa/średnia/aktualna, zmiana,
  // flaga prawdziwej promocji) + chronologiczną listę punktów. Read-only.
  router.get("/pricing/history", async (req: Request, res: Response) => {
    const productId = typeof req.query.productId === "string" ? req.query.productId : "";
    const ean = typeof req.query.ean === "string" ? req.query.ean : null;
    const gtin = typeof req.query.gtin === "string" ? req.query.gtin : null;

    if (!productId && !ean && !gtin) {
      badRequest(
        res,
        "missing_identifier",
        "wymagany ?productId= albo ?ean=/?gtin=",
      );
      return;
    }

    try {
      const db = resolveDb();
      const product = productId
        ? await historyDeps.findProductById(db, productId)
        : await historyDeps.findProductByCode(db, { ean, gtin });

      if (!product) {
        res.status(404).json({ error: "product_not_found" });
        return;
      }

      const [stats, history] = await Promise.all([
        historyDeps.getPriceStatsForProduct(db, product.id),
        historyDeps.getPriceHistoryForProduct(db, product.id),
      ]);

      res.json(serializePriceHistory(product, stats, history));
    } catch (err) {
      req.log?.error?.({ err }, "pricing/history failed");
      res
        .status(500)
        .json({ error: "history_failed", message: (err as Error)?.message });
    }
  });

  // Healthcheck: potwierdza dostępność bazy i obecność tabel katalogu.
  router.get("/pricing/health", async (req: Request, res: Response) => {
    try {
      const db = resolveDb();
      const tables: Array<{ table: string; exists: boolean }> = [];
      let allOk = true;
      for (const table of TABLES) {
        const result = await db.execute(
          sql`select to_regclass(${`public.${table}`}) as reg`,
        );
        const reg = (result.rows[0] as { reg: string | null } | undefined)?.reg;
        const exists = reg != null;
        if (!exists) allOk = false;
        tables.push({ table, exists });
      }
      res.status(allOk ? 200 : 503).json({
        status: allOk ? "ok" : "degraded",
        database: "reachable",
        tables,
      });
    } catch (err) {
      req.log?.error?.({ err }, "pricing/health failed");
      res.status(503).json({
        status: "error",
        database: "unreachable",
        message: (err as Error)?.message,
      });
    }
  });

  return router;
}

export default createPricingRouter();
