import type { SerializedStage } from './pricingApi';

/** The catalogue may contain many more shops and older reads than this project.
 * Describe only priced offers attached to its resolved material lines. */
export function projectOfferCoverage(stages: SerializedStage[], selectedStore?: string | null) {
  const stores = new Set<string>();
  let earliest = Infinity;
  let latest = -Infinity;
  for (const stage of stages) for (const line of stage.lines) {
    if (!line.resolved) continue;
    for (const offer of line.offers ?? []) {
      if (selectedStore && offer.store !== selectedStore) continue;
      if (typeof offer.priceGrosze !== 'number' || !Number.isSafeInteger(offer.priceGrosze) || offer.priceGrosze <= 0) continue;
      stores.add(offer.store);
      const checkedAt = offer.fetchedAt ? Date.parse(offer.fetchedAt) : NaN;
      if (Number.isFinite(checkedAt)) {
        earliest = Math.min(earliest, checkedAt);
        latest = Math.max(latest, checkedAt);
      }
    }
  }
  return {
    storeCount: stores.size,
    firstCheckedAt: Number.isFinite(earliest) ? new Date(earliest).toISOString() : null,
    lastCheckedAt: Number.isFinite(latest) ? new Date(latest).toISOString() : null,
  };
}
