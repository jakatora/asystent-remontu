import type { SerializedProject, SerializedStoreBasket, SerializedStoreComparison } from './pricingApi';

export interface StoreChoices {
  comparison: SerializedStoreComparison;
  stores: string[];
  unresolvedCount: number;
}

export function collectStoreChoices(data: SerializedProject): StoreChoices {
  return {
    comparison: data.storeComparison,
    stores: data.coverage?.stores ?? data.storeComparison.stores.map(store => store.store),
    unresolvedCount: data.stages.flatMap(stage => stage.lines).filter(line => !line.resolved && line.quantity > 0).length,
  };
}

/** Preserve server amounts. Complete baskets precede partial / absent offers;
 * a cheap fragment must never look like the cheapest complete purchase. */
export function rankStoreChoices(choices: StoreChoices, search = ''): SerializedStoreBasket[] {
  const baskets = new Map(choices.comparison.stores.map(row => [row.store, row]));
  const query = search.trim().toLocaleLowerCase('pl-PL');
  return [...new Set([...choices.stores, ...baskets.keys()])].map(store => baskets.get(store) ?? {
    store, totalGrosze: 0, coveredCount: 0, missingCount: choices.comparison.productCount, missingProductIds: [],
  }).filter(row => row.store.toLocaleLowerCase('pl-PL').includes(query))
    .sort((a, b) => b.coveredCount - a.coveredCount || a.totalGrosze - b.totalGrosze || a.store.localeCompare(b.store, 'pl'));
}

export function parsePreferredStore(value: unknown): string | null {
  return typeof value === 'string' && value === value.trim() && value.length > 0 && value.length <= 80 && !/[\u0000-\u001f]/.test(value) ? value : null;
}

/** Protect the selection even when an older or incompatible API is used. */
export function estimateHonoursStore(data: SerializedProject, store: string): boolean {
  const lines = data.stages.flatMap(stage => stage.lines).filter(line => line.resolved);
  return lines.every(line => line.cheapestOffer?.store === store && (line.offers ?? []).every(offer => offer.store === store) && (line.packages ?? []).every(pack => pack.store === store))
    && data.consolidated.lines.every(line => line.cheapestOffer.store === store && (line.packages ?? []).every(pack => pack.store === store))
    && data.storeComparison.stores.every(row => row.store === store)
    && data.storeComparison.optimalByStore.every(row => row.store === store)
    && [data.deliveryComparison?.best, data.deliveryComparison?.lowerBound, ...(data.deliveryComparison?.alternatives ?? [])].every(basket => !basket || basket.stores.every(row => row.store === store));
}

// Only established branch networks may be searched by location. A generic
// online shop name can otherwise resolve to an unrelated local business.
// source: https://www.castorama.pl/find-a-store
// source: https://www.obi.pl/stores
// source: https://mrowka.com.pl/sklepy-psb-mrowka
// source: https://www.bricoman.pl/regulamin-zakupow.html
// source: https://sklep.sewera.pl/miejsca-odbioru
const MAP_BRANCH_NETWORKS = new Set(['Castorama', 'OBI', 'Bricoman', 'Mrówka', 'Sewera']);

export function supportsStoreMapSearch(store: string): boolean {
  return store === 'Folnet' || MAP_BRANCH_NETWORKS.has(store);
}

export function storeLocatorUrl(store: string): string | null {
  return new Map([['Castorama', 'https://www.castorama.pl/find-a-store'], ['OBI', 'https://www.obi.pl/stores'],
    ['Mrówka', 'https://mrowka.com.pl/sklepy-psb-mrowka'], ['Sewera', 'https://sklep.sewera.pl/miejsca-odbioru']]).get(store) ?? null;
}

/** User-initiated map search, not verified branch inventory or distance.
 * source: https://developers.google.com/maps/documentation/urls/get-started
 */
export function storeMapSearchUrl(store: string, location: string): string | null {
  const place = location.trim().replace(/\s+/g, ' ');
  // Folnet's office does not issue goods; online orders are collected here.
  // source: https://folnet.pl/Odbior-osobisty-ccms-pol-30.html
  if (store === 'Folnet') return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Folnet magazyn ul. Stefana Batorego 97 62-081 Batorowo Polska');
  if (!supportsStoreMapSearch(store) || !parsePreferredStore(store) || place.length < 2 || place.length > 80 || /[\u0000-\u001f]/.test(place)) return null;
  const brand = store === 'Mrówka' ? 'PSB Mrówka' : store === 'Sewera' ? 'Sewera Polska Chemia' : store;
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${brand} market budowlany ${place} Polska`);
}
