/** Search hints only. A confirmed product price is never a delivery quote. */
export interface CatalogAvailabilityProduct {
  ean: string;
  category: string;
  packageSize: number;
  unit: string;
  stores: string[];
  lastCheckedAt: string;
}

export interface CatalogAvailabilitySnapshot {
  version: 1;
  complete: true;
  channel: 'online';
  currency: 'PLN';
  deliveryIncluded: false;
  generatedAt: string;
  maxAgeMs: number;
  products: CatalogAvailabilityProduct[];
}

/** Reject partial or malformed responses: absence only means no confirmed
 * offer when a complete snapshot has been accepted. No historical price fallback.
 */
export function parseCatalogAvailabilitySnapshot(value: unknown): CatalogAvailabilitySnapshot {
  const data = value as CatalogAvailabilitySnapshot;
  if (!data || data.version !== 1 || data.complete !== true || data.channel !== 'online' || data.currency !== 'PLN' || data.deliveryIncluded !== false
    || typeof data.generatedAt !== 'string' || !Number.isFinite(Date.parse(data.generatedAt))
    || !Number.isSafeInteger(data.maxAgeMs) || data.maxAgeMs < 0 || data.maxAgeMs > 30_000
    || !Array.isArray(data.products) || data.products.length > 5_000) throw Error('invalid_catalog_availability');
  const seen = new Set<string>();
  const text = (s: unknown): s is string => typeof s === 'string' && s.trim() === s && s.length > 0 && s.length <= 100 && !/[\u0000-\u001f]/.test(s);
  for (const p of data.products) {
    if (!p || typeof p.ean !== 'string' || !/^\d{13}$/.test(p.ean) || !text(p.category) || !text(p.unit)
      || !Number.isFinite(p.packageSize) || p.packageSize <= 0 || p.packageSize > 1_000_000
      || !Array.isArray(p.stores) || !p.stores.length || p.stores.length > 100 || !p.stores.every(text) || new Set(p.stores).size !== p.stores.length
      || typeof p.lastCheckedAt !== 'string' || !Number.isFinite(Date.parse(p.lastCheckedAt)) || Date.parse(p.lastCheckedAt) > Date.parse(data.generatedAt) + 300_000) throw Error('invalid_catalog_availability');
    const key = JSON.stringify([p.ean,p.category,p.packageSize,p.unit]);
    if (seen.has(key)) throw Error('invalid_catalog_availability');
    seen.add(key);
  }
  return data;
}
