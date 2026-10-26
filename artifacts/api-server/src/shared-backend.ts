import { Router, type Request, type Response } from 'express';
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Database, Product } from '@workspace/db/repositories';
import type { PurchaseOffer as ProductOffer } from '../../../lib/pricing-service/src/types';
import { normalizeProductName } from '@workspace/db/repositories';
import { estimateProjectCostFromCalculation, type EstimateDeps } from '@workspace/pricing-service';
import { isComparableOffer } from '../../../lib/pricing-service/src/estimate';
import { projectRequestSchema } from './lib/pricing-schema';
import { serializeProject } from './lib/pricing-serialize';
import { RETAIL_SOURCES, RETAIL_NAME_ALIASES } from './lib/retail-catalog';
import type { BasketQuoter } from '../../../lib/pricing-service/src/delivery';
import { compareAutomaticDelivery } from '../../../lib/pricing-service/src/automatic-delivery';
import { DELIVERY_LIMITS } from '../../../lib/pricing-service/src/delivery-limits';
import { createRetailerQuoter, knownUnavailableRetailers, retailerDeliveryCapabilities } from './lib/retailer-delivery';
import { STORE_DELIVERY_POLICIES } from './lib/store-delivery';
import { isCastoramaBrowserSource } from './lib/castorama-browser-observation';
import { isBricomarcheBrowserSource } from './lib/bricomarche-browser-observation';
import { parseRetailPage, readRetailSource, retailPriceIsValid, type RetailObservation } from './lib/retail-pages';

const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const normalUnit = (value: string) => ({ litr: 'l', litry: 'l', 'm²': 'm2', 'szt.': 'szt' }[value] ?? value);

export interface SharedPricingOptions {
  initialObservations?: readonly RetailObservation[];
  cachePath?: string;
  fetchImpl?: typeof fetch;
  background?: boolean;
  basketQuoter?: BasketQuoter;
}

/** Uses the existing pricing engine and HTTP serializer with an isolated cache.
 * It neither opens the other apps' databases nor invokes paid AI. */
export function createRemontService(options: SharedPricingOptions = {}) {
  const quoteBasket = options.basketQuoter ?? createRetailerQuoter(options.fetchImpl);
  const observations = new Map<string, RetailObservation>();
  const errors = new Map<string, string>();
  const withdrawnAt = new Map<string, string>();
  let running = false;
  let refreshPromise: Promise<void> | null = null;
  let refreshedAt = 0;
  let refreshResult = { confirmedOfferIds: [] as string[], failedOfferIds: [] as string[] };
  let lastAttemptAt: string | null = null;
  const accept = (observation: RetailObservation) => {
    if (!observation || typeof observation !== 'object') return;
    const source = RETAIL_SOURCES.find(source => source.id === observation.sourceId);
    if (!source || source.disabledReason || observation.ean !== source.ean || observation.sourceUrl !== source.url ||
      observation.currency !== 'PLN' || observation.availability !== 'in_stock' ||
      !Number.isSafeInteger(observation.priceGrosze) || observation.priceGrosze <= 0 ||
      observation.stockPackages !== undefined && (!Number.isSafeInteger(observation.stockPackages) || observation.stockPackages < 0 || observation.stockPackages > 1_000_000_000) ||
      !/^[a-f0-9]{64}$/.test(observation.evidenceSha256) || !Number.isFinite(Date.parse(observation.observedAt))) return;
    const previous = observations.get(source.id);
    // Complex Castorama purchase units have no automatic full-pack proof yet.
    // Removing provenance from a saved row must not bypass its 24h expiry.
    if((isBricomarcheBrowserSource(source)||isCastoramaBrowserSource(source)&&['m2','m'].includes(source.unit))&&!observation.verification)return;
    if(observation.verification!==undefined){
      const v=observation.verification;
      if(!v||v.method!=='browser'||!(isCastoramaBrowserSource(source)||isBricomarcheBrowserSource(source))||observation.stockPackages!==undefined||v.checkedAt!==observation.observedAt||Date.parse(v.expiresAt)!==Date.parse(v.checkedAt)+86400000)return;
    }
    if (!previous || Date.parse(previous.observedAt) < Date.parse(observation.observedAt)) observations.set(source.id, observation);
    if (Date.parse(observation.observedAt) >= Date.parse(withdrawnAt.get(source.id) ?? '')) withdrawnAt.delete(source.id);
  };
  options.initialObservations?.forEach(accept);
  if (options.cachePath && existsSync(options.cachePath)) {
    try {
      const cache = JSON.parse(readFileSync(options.cachePath, 'utf8'));
      if (Array.isArray(cache)) cache.forEach(accept);
      else if (cache?.version === 2 && Array.isArray(cache.observations)) {
        cache.observations.forEach(accept);
        for (const [id, date] of Object.entries(cache.withdrawnAt ?? {})) {
          if (typeof date === 'string' && Number.isFinite(Date.parse(date)) && RETAIL_SOURCES.some(source => source.id === id)) withdrawnAt.set(id, date);
        }
      }
    } catch { errors.set('cache', 'cache_read_failed'); }
  }

  function catalog(pickup = false) {
    const products: Product[] = [];
    const offers: ProductOffer[] = [];
    for (const source of RETAIL_SOURCES) {
      const observation = observations.get(source.id);
      if (!observation) continue;
      if (withdrawnAt.has(source.id) && Date.parse(withdrawnAt.get(source.id)!) >= Date.parse(observation.observedAt)) continue;
      if (observation.validUntil && !retailPriceIsValid(observation.validUntil, new Date())) continue;
      const productId = `remont-${source.ean}`;
      if (!products.some(product => product.id === productId)) products.push({
        id: productId, name: source.name, normalizedName: normalizeProductName(source.name),
        ean: source.ean, gtin: null, manufacturer: source.brand || null, brand: source.brand || null,
        category: source.category, subcategory: null, variant: null,
        packageSize: String(source.packageSize), packageUnit: source.unit, technicalParameters: null,
        imageUrl: observation.imageUrl, productUrl: source.url,
        createdAt: new Date(observation.observedAt), updatedAt: new Date(observation.observedAt),
      });
      offers.push({
        id: source.id, productId, store: source.store,
        price: (observation.priceGrosze / 100).toFixed(2), promoPrice: null, regularPrice: null,
        unit: source.unit, packageSize: String(source.packageSize),
        ...(source.purchaseMultiple ? {purchaseMultiple:source.purchaseMultiple} : {}),
        ...(source.minimumPackages ? {minimumPackages:source.minimumPackages} : {}),
        ...(observation.stockPackages !== undefined ? {maxPackages:observation.stockPackages} : {}),
        ...(observation.verification ? {verification:observation.verification} : {}),
        pricePerUnit: (observation.priceGrosze / 100 / source.packageSize).toFixed(4),
        productUrl: source.url, availability: observation.availability,
        fetchedAt: new Date(observation.observedAt), source: observation.verification ? 'retailer-page-browser-snapshot' : source.format && source.format !== 'jsonld' ? 'retailer-page-microdata' : 'retailer-page-jsonld',
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
      listOffers: async (_db, id) => offers.filter(offer => {
        const source=RETAIL_SOURCES.find(source=>source.id===offer.id);
        return offer.productId===id&&(pickup?![source?.pickupRequiresConfirmation,source?.pickupUnavailable].some(Boolean):!source?.pickupOnly);
      }),
    };
    return { products, offers, deps };
  }

  function refresh(): Promise<void> {
    if (refreshPromise) return refreshPromise;
    running = true;
    lastAttemptAt = new Date().toISOString();
    const confirmedOfferIds: string[] = [], failedOfferIds: string[] = [];
    refreshPromise = (async () => {
    try {
      let cursor = 0;
      await Promise.all(Array.from({ length: 3 }, async () => { while (cursor < RETAIL_SOURCES.length) {
        const source = RETAIL_SOURCES[cursor++];
        try {
          accept(await readRetailSource(source, options.fetchImpl));
          errors.delete(source.id);
          confirmedOfferIds.push(source.id);
        } catch (error) {
          failedOfferIds.push(source.id);
          // Keep the original observation timestamp. A failed read is not a new price.
          const message = error instanceof Error ? error.message : 'retailer_read_failed';
          errors.set(source.id, message);
          // A confirmed withdrawal must also survive a restart, even with old bootstrap observations.
          if (message === 'retailer_out_of_stock'||message==='purchase_rules_changed') withdrawnAt.set(source.id, new Date().toISOString());
        }
      } }));
      if (options.cachePath) {
        try {
          mkdirSync(dirname(options.cachePath), { recursive: true });
          writeFileSync(`${options.cachePath}.tmp`, JSON.stringify({ version: 2, observations: [...observations.values()], withdrawnAt: Object.fromEntries(withdrawnAt) }));
          renameSync(`${options.cachePath}.tmp`, options.cachePath);
          errors.delete('cache');
        } catch { errors.set('cache', 'cache_write_failed'); }
      }
    } finally { running = false; refreshedAt = Date.now(); refreshResult = { confirmedOfferIds, failedOfferIds }; refreshPromise = null; }
    })();
    return refreshPromise;
  }

  function status() {
    const { offers } = catalog();
    const eligible = offers.filter(offer => isComparableOffer(offer));
    return {
      status: eligible.length > 0 ? 'ok' : 'no-current-offers',
      offers: eligible.length, products: new Set(eligible.map(offer => offer.productId)).size,
      browserVerifiedOffers:eligible.filter(offer=>offer.verification?.method==='browser').length,
      stores: [...new Set(eligible.map(offer => offer.store))], running, lastAttemptAt,
      pickupConfirmationStores: [...new Set(RETAIL_SOURCES.filter(source => source.pickupRequiresConfirmation).map(source => source.store))],
      pickupUnavailableStores: [...new Set(RETAIL_SOURCES.filter(source => source.pickupUnavailable).map(source => source.store))],
      pickupOnlyStores:[...new Set(RETAIL_SOURCES.filter(source=>source.pickupOnly).map(source=>source.store))],
      scope: { channel: 'online', currency: 'PLN', deliveryIncluded: false, locationAdjusted: false },
      delivery: retailerDeliveryCapabilities(),
      sources: RETAIL_SOURCES.map(source => ({
        id: source.id, store: source.store, checkedAt: observations.get(source.id)?.observedAt ?? null,
        active: eligible.some(offer => offer.id === source.id),
        error: source.disabledReason ?? errors.get(source.id) ?? null,
        ...(observations.get(source.id)?.stockPackages !== undefined ? {stockPackages:observations.get(source.id)!.stockPackages} : {}),
        ...(observations.get(source.id)?.verification ? {verification:observations.get(source.id)!.verification} : {}),
      })),
    };
  }

  const router = Router();
  router.get('/health', (_req, res) => { res.json(status()); });
  router.get('/pricing/health', (_req, res) => { res.json(status()); });
  async function handleEstimate(req: Request, res: Response) {
    const stageOnly = req.path.endsWith('/stage');
    const parsed = projectRequestSchema.safeParse(stageOnly ? { jobs: [req.body?.job], options: req.body?.options } : req.body);
    if (!parsed.success || parsed.data.jobs.length > 20 || parsed.data.jobs.some(job => job.materials.length > DELIVERY_LIMITS.products || job.materials.some(line => line.quantity > 100_000))) {
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
      let priceRefresh;
      if (parsed.data.options?.refreshPrices) {
        const recent = !running && Date.now() - refreshedAt < 60_000;
        if (!recent) await refresh();
        priceRefresh = { status: recent ? 'recent' : 'updated', checkedAt:lastAttemptAt, ...refreshResult,
          retryAfterSeconds:Math.max(0,Math.ceil((refreshedAt+60_000-Date.now())/1000)) };
      }
      const estimate = await estimateProjectCostFromCalculation({} as Database, parsed.data.jobs, parsed.data.options ?? {}, catalog(parsed.data.options?.delivery?.mode === 'pickup').deps);
      res.setHeader('Cache-Control', 'no-store');
      const serialized = serializeProject(estimate);
      const deadline = Date.now() + 20_000;
      const deliveryComparison = stageOnly ? undefined : await compareAutomaticDelivery(estimate.stages, parsed.data.options?.delivery ?? { mode: 'shipping' },
        (order, postalCode) => Date.now() < deadline || ['Castorama','OBI'].includes(order.store) ? quoteBasket(order, postalCode) : Promise.resolve({ reason: 'quote_timeout' }), STORE_DELIVERY_POLICIES, new Date(),
        knownUnavailableRetailers());
      res.json(stageOnly ? serialized.stages[0] : { ...serialized, coverage: status(), priceRefresh,
        deliveryComparison,
      });
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
