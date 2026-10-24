import { Router, type Request, type Response } from 'express';
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Database, Product, ProductOffer } from '@workspace/db/repositories';
import { normalizeProductName } from '@workspace/db/repositories';
import { estimateProjectCostFromCalculation, type EstimateDeps } from '@workspace/pricing-service';
import { isComparableOffer } from '../../../lib/pricing-service/src/estimate';
import { projectRequestSchema } from './lib/pricing-schema';
import { serializeProject } from './lib/pricing-serialize';
import { RETAIL_SOURCES, RETAIL_NAME_ALIASES } from './lib/retail-catalog';
import { parseRetailPage, readRetailSource, type RetailObservation } from './lib/retail-pages';

const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const normalUnit = (value: string) => ({ litr: 'l', litry: 'l', 'm²': 'm2', 'szt.': 'szt' }[value] ?? value);

export interface SharedPricingOptions {
  initialObservations?: readonly RetailObservation[];
  cachePath?: string;
  fetchImpl?: typeof fetch;
  background?: boolean;
}

/** Uses the existing pricing engine and HTTP serializer with an isolated cache.
 * It neither opens the other apps' databases nor invokes paid AI. */
export function createRemontService(options: SharedPricingOptions = {}) {
  const observations = new Map<string, RetailObservation>();
  const errors = new Map<string, string>();
  let running = false;
  let lastAttemptAt: string | null = null;
  const accept = (observation: RetailObservation) => {
    const source = RETAIL_SOURCES.find(source => source.id === observation.sourceId);
    if (!source || observation.ean !== source.ean || observation.sourceUrl !== source.url ||
      observation.currency !== 'PLN' || observation.availability !== 'in_stock' ||
      !Number.isSafeInteger(observation.priceGrosze) || observation.priceGrosze <= 0 ||
      !/^[a-f0-9]{64}$/.test(observation.evidenceSha256) || !Number.isFinite(Date.parse(observation.observedAt))) return;
    const previous = observations.get(source.id);
    if (!previous || Date.parse(previous.observedAt) < Date.parse(observation.observedAt)) observations.set(source.id, observation);
  };
  options.initialObservations?.forEach(accept);
  if (options.cachePath && existsSync(options.cachePath)) {
    try {
      const cache = JSON.parse(readFileSync(options.cachePath, 'utf8'));
      if (Array.isArray(cache)) cache.forEach(accept);
    } catch { errors.set('cache', 'cache_read_failed'); }
  }

  function catalog() {
    const products: Product[] = [];
    const offers: ProductOffer[] = [];
    for (const source of RETAIL_SOURCES) {
      const observation = observations.get(source.id);
      if (!observation) continue;
      const productId = `remont-${source.ean}`;
      if (!products.some(product => product.id === productId)) products.push({
        id: productId, name: source.name, normalizedName: normalizeProductName(source.name),
        ean: source.ean, gtin: null, manufacturer: source.brand, brand: source.brand,
        category: source.category, subcategory: null, variant: null,
        packageSize: String(source.packageSize), packageUnit: source.unit, technicalParameters: null,
        imageUrl: observation.imageUrl, productUrl: source.url,
        createdAt: new Date(observation.observedAt), updatedAt: new Date(observation.observedAt),
      });
      offers.push({
        id: source.id, productId, store: source.store,
        price: (observation.priceGrosze / 100).toFixed(2), promoPrice: null, regularPrice: null,
        unit: source.unit, packageSize: String(source.packageSize),
        pricePerUnit: (observation.priceGrosze / 100 / source.packageSize).toFixed(4),
        productUrl: source.url, availability: observation.availability,
        fetchedAt: new Date(observation.observedAt), source: 'retailer-page-jsonld',
      });
    }
    const aliases = Object.entries(RETAIL_NAME_ALIASES).map(([name, ean]) => [normalizeProductName(name), ean]);
    const deps: EstimateDeps = {
      findProductByCode: async (_db, code) => products.find(product => product.ean === (code.ean ?? code.gtin)) ?? null,
      findProductByNameAndCategory: async (_db, query) => {
        const alias = aliases.find(([name]) => name === query.normalizedName)?.[1];
        return products.find(product => product.category === query.category &&
          (product.normalizedName === query.normalizedName || product.ean === alias)) ?? null;
      },
      listOffers: async (_db, id) => offers.filter(offer => offer.productId === id),
    };
    return { products, offers, deps };
  }

  async function refresh() {
    if (running) return;
    running = true;
    lastAttemptAt = new Date().toISOString();
    try {
      for (const source of RETAIL_SOURCES) {
        try {
          accept(await readRetailSource(source, options.fetchImpl));
          errors.delete(source.id);
        } catch (error) {
          // Keep the original observation timestamp. A failed read is not a new price.
          errors.set(source.id, error instanceof Error ? error.message : 'retailer_read_failed');
        }
      }
      if (options.cachePath) {
        try {
          mkdirSync(dirname(options.cachePath), { recursive: true });
          writeFileSync(`${options.cachePath}.tmp`, JSON.stringify([...observations.values()]));
          renameSync(`${options.cachePath}.tmp`, options.cachePath);
          errors.delete('cache');
        } catch { errors.set('cache', 'cache_write_failed'); }
      }
    } finally { running = false; }
  }

  function status() {
    const { offers } = catalog();
    const eligible = offers.filter(offer => isComparableOffer(offer));
    return {
      status: eligible.length > 0 ? 'ok' : 'no-current-offers',
      offers: eligible.length, products: new Set(eligible.map(offer => offer.productId)).size,
      stores: [...new Set(eligible.map(offer => offer.store))], running, lastAttemptAt,
      scope: { channel: 'online', currency: 'PLN', deliveryIncluded: false, locationAdjusted: false },
      sources: RETAIL_SOURCES.map(source => ({
        id: source.id, store: source.store, checkedAt: observations.get(source.id)?.observedAt ?? null,
        error: errors.get(source.id) ?? null,
      })),
    };
  }

  const router = Router();
  router.get('/health', (_req, res) => { res.json(status()); });
  router.get('/pricing/health', (_req, res) => { res.json(status()); });
  async function handleEstimate(req: Request, res: Response) {
    const stageOnly = req.path.endsWith('/stage');
    const parsed = projectRequestSchema.safeParse(stageOnly ? { jobs: [req.body?.job], options: req.body?.options } : req.body);
    if (!parsed.success || parsed.data.jobs.length > 20 || parsed.data.jobs.some(job => job.materials.length > 100 || job.materials.some(line => line.quantity > 100_000))) {
      res.status(400).json({ error: 'invalid_request' }); return;
    }
    for (const job of parsed.data.jobs) for (const line of job.materials) {
      const ean = line.material.ean ?? RETAIL_NAME_ALIASES[line.material.name];
      const source = RETAIL_SOURCES.find(source => source.ean === ean);
      if (source && normalUnit(line.material.unit) !== source.unit) {
        res.status(400).json({ error: 'incompatible_product_unit' }); return;
      }
    }
    try {
      const estimate = await estimateProjectCostFromCalculation({} as Database, parsed.data.jobs, parsed.data.options ?? {}, catalog().deps);
      res.setHeader('Cache-Control', 'no-store');
      const serialized = serializeProject(estimate);
      res.json(stageOnly ? serialized.stages[0] : { ...serialized, coverage: status() });
    } catch {
      res.status(503).json({ error: 'pricing_unavailable' });
    }
  }
  router.post('/pricing/project', handleEstimate);
  router.post('/pricing/stage', handleEstimate);
  router.get('/pricing/history', (_req, res) => { res.status(404).json({ error: 'verified_history_unavailable' }); });
  const timer = options.background === false ? undefined : setInterval(() => { void refresh(); }, REFRESH_INTERVAL_MS);
  timer?.unref();
  if (options.background !== false) void refresh();
  return { router, refresh, status, close: () => { if (timer) clearInterval(timer); } };
}

export { RETAIL_SOURCES, parseRetailPage };
