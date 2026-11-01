import {parseCatalogAvailabilitySnapshot, type CatalogAvailabilitySnapshot} from '../../../../lib/pricing-service/src/catalog-availability';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import type {MaterialPriceReference} from '@/types/pricing';
import {normalizeUnit} from './quantity';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {parseCatalogRefreshIdentity,type CatalogRefreshIdentity} from '../../../../lib/pricing-service/src/catalog-refresh';

export interface CatalogAvailabilityRead {snapshot:CatalogAvailabilitySnapshot;expiresAt:number}

/** One shared, bounded hint cache. No polling, quote requests or persistence. */
export class CatalogAvailabilityCache {
  private cached: CatalogAvailabilityRead | null = null;
  private inFlight: Promise<CatalogAvailabilityRead> | null = null;
  private generation=0;
  constructor(private load: () => Promise<unknown>, private now = Date.now) {}
  read(force = false): Promise<CatalogAvailabilityRead> {
    if (force) this.cached = null;
    if (this.cached && this.cached.expiresAt > this.now()) return Promise.resolve(this.cached);
    if (this.inFlight) return this.inFlight;
    const startedAt = this.now();
    const generation=this.generation;
    const pending = this.load().then(value => {
      if(generation!==this.generation)return this.read();
      const snapshot = parseCatalogAvailabilitySnapshot(value);
      this.cached = {snapshot,expiresAt:startedAt + snapshot.maxAgeMs};
      return this.cached;
    }).finally(() => {if(this.inFlight===pending)this.inFlight=null;});
    this.inFlight=pending;return pending;
  }
  invalidate(){this.generation++;this.cached=null;this.inFlight=null;}
}

/** Keep the same exact pack/category rules as the catalogue availability hint. */
export function catalogueRefreshIdentity(ref:MaterialPriceReference):CatalogRefreshIdentity|null{
  const codes=[...new Set(PRODUCT_PHOTOS.filter(p=>p.ids.includes(ref.id)).map(p=>p.ean).filter(Boolean))];
  const category=ref.id==='mat-tile-wall-paradyz-nati-bianco-25x40'&&ref.materialType==='tile'&&codes[0]==='5902610507960'?'wall-tile':ref.materialType;
  const merchant=PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id)&&p.merchantProductIds?.[ref.id]),canonical=MATERIAL_PRICES.find(r=>r.id===ref.id);
  const exact=canonical&&(['productLabel','materialType','packageSize','packageUnit','sourceUrl']as const).every(k=>canonical[k]===ref[k])&&merchant?.sourceUrl===ref.sourceUrl;
  const productId=exact?merchant?.merchantProductIds?.[ref.id]:undefined;
  try{return parseCatalogRefreshIdentity({category,packageSize:ref.packageSize,unit:ref.packageUnit,...(codes.length===1?{ean:codes[0]}:codes.length===0&&productId?{productId}:{})});}catch{return null;}
}

export function isCatalogAvailabilityFresh(read: CatalogAvailabilityRead | null, now = Date.now()): read is CatalogAvailabilityRead {
  return Boolean(read && read.expiresAt > now);
}

/** An EAN alone cannot equate another package size, physical unit or category. */
export function catalogueProductAvailability(ref: MaterialPriceReference, read: CatalogAvailabilityRead | null, now = Date.now()) {
  if (!isCatalogAvailabilityFresh(read,now)) return null;
  const codes = [...new Set(PRODUCT_PHOTOS.filter(p => p.ids.includes(ref.id)).map(p => p.ean).filter(Boolean))];
  if (codes.length > 1) return null;
  // This legacy reference uses "tile"; its exact current retail card uses
  // "wall-tile". Preserve the reference/job category and the same actual GTIN.
  // source: https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/
  // source: https://patiartstudio.pl/produkt/paradyz-nati-bianco-sciana-struktura-25x40-ss-250x400-1-nati-bi/
  const category = ref.id === 'mat-tile-wall-paradyz-nati-bianco-25x40' && ref.materialType === 'tile' && codes[0] === '5902610507960'
    ? 'wall-tile' : ref.materialType;
  const matches = read.snapshot.products.filter(p => (codes.length === 1 ? p.ean === codes[0]
    : p.ean === null && p.merchantIdentity?.name === ref.productLabel && p.merchantIdentity?.url === ref.sourceUrl) && p.category === category
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
