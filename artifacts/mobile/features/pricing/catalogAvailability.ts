import {parseCatalogAvailabilitySnapshot, type CatalogAvailabilitySnapshot} from '../../../../lib/pricing-service/src/catalog-availability';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import type {MaterialPriceReference} from '@/types/pricing';
import {normalizeUnit} from './quantity';

export interface CatalogAvailabilityRead {snapshot:CatalogAvailabilitySnapshot;expiresAt:number}

/** One shared, bounded hint cache. No polling, quote requests or persistence. */
export class CatalogAvailabilityCache {
  private cached: CatalogAvailabilityRead | null = null;
  private inFlight: Promise<CatalogAvailabilityRead> | null = null;
  constructor(private load: () => Promise<unknown>, private now = Date.now) {}
  read(force = false): Promise<CatalogAvailabilityRead> {
    if (force) this.cached = null;
    if (this.cached && this.cached.expiresAt > this.now()) return Promise.resolve(this.cached);
    if (this.inFlight) return this.inFlight;
    const startedAt = this.now();
    this.inFlight = this.load().then(value => {
      const snapshot = parseCatalogAvailabilitySnapshot(value);
      this.cached = {snapshot,expiresAt:startedAt + snapshot.maxAgeMs};
      return this.cached;
    }).finally(() => {this.inFlight = null;});
    return this.inFlight;
  }
}

export function isCatalogAvailabilityFresh(read: CatalogAvailabilityRead | null, now = Date.now()): read is CatalogAvailabilityRead {
  return Boolean(read && read.expiresAt > now);
}

/** An EAN alone cannot equate another package size, physical unit or category. */
export function catalogueProductAvailability(ref: MaterialPriceReference, read: CatalogAvailabilityRead | null, now = Date.now()) {
  if (!isCatalogAvailabilityFresh(read,now)) return null;
  const codes = [...new Set(PRODUCT_PHOTOS.filter(p => p.ids.includes(ref.id)).map(p => p.ean).filter(Boolean))];
  if (codes.length > 1) return null;
  const matches = read.snapshot.products.filter(p => (codes.length === 1 ? p.ean === codes[0]
    : p.ean === null && p.merchantIdentity?.name === ref.productLabel && p.merchantIdentity?.url === ref.sourceUrl) && p.category === ref.materialType
    && p.packageSize === ref.packageSize && normalizeUnit(p.unit) === normalizeUnit(ref.packageUnit));
  const stores = [...new Set(matches.flatMap(p => p.stores))];
  return {confirmed:stores.length > 0,stores};
}

/** An expired/error response never hides items or pretends they are unavailable. */
export function filterCatalogueByAvailability(found: readonly MaterialPriceReference[], read: CatalogAvailabilityRead | null, onlyConfirmed: boolean, now = Date.now()): readonly MaterialPriceReference[] {
  return onlyConfirmed && isCatalogAvailabilityFresh(read,now)
    ? found.filter(ref => catalogueProductAvailability(ref,read,now)?.confirmed)
    : found;
}
