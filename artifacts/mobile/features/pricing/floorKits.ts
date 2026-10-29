import { applyTileChoices, parseTileChoices, tileReference, TILE_PRODUCTS, type TileChoice, type FloorKitAdhesive } from './tileChoice';
import { applyShoppingContexts } from './projectShoppingInput';
import type { ShoppingStageContext } from './selectedShopping';
import type { PricingStageInput, SerializedProject } from './pricingApi';
import type { DeliverySettings } from '../../../../lib/pricing-service/src/delivery';
import type { ProductChoice } from './productChoice';

export const FLOOR_KIT_ADHESIVE: FloorKitAdhesive = 'mat-tile-adhesive-atlas-plus-standard-25kg';
// Reviewed indoor kits share this format and manufacturer consumption row.
// Other models remain available in the individual product selectors.
// source: https://www.paradyz.com/pl/produkty/p39069-u117-light-grey-gres-szkl-rekt-mat-598x598-g1
// source: https://www.paradyz.com/pl/produkty/p39162-u117-light-beige-gres-szkl-rekt-mat-598x598-g1
// source: https://www.atlas.com.pl/produkt/atlas-plus/
const reviewed = ['mat-gres-rekt-paradyz-u117-light-grey-60x60', 'mat-gres-rekt-paradyz-u117-light-beige-60x60'];

export function floorKitCandidates(stages: readonly PricingStageInput[], choices: readonly TileChoice[], contexts: readonly ShoppingStageContext[] = []) {
  if (stages.length !== 1 || stages[0].jobId !== 'floor-tiles') return [];
  const primary = stages[0].materials.find(line => line.material.id === 'tiles' && line.quantity > 0);
  const from = primary && tileReference(primary.material);
  if (!from?.uses.includes('floor')) return [];
  return TILE_PRODUCTS.filter(product => reviewed.includes(product.id)).map(product => {
    const next = parseTileChoices(JSON.stringify({ version: 1, choices: [
      ...choices.filter(choice => !(choice.from === from.id && choice.use === 'floor')),
      { from: from.id, to: product.id, use: 'floor', floorAdhesive: FLOOR_KIT_ADHESIVE },
    ] }));
    const selected = applyTileChoices(stages, next);
    return { id: product.id, product, choices: next, stages: applyShoppingContexts(selected, contexts).stages };
  });
}
export type FloorKitCandidate = ReturnType<typeof floorKitCandidates>[number];

/** Prices from the actual complete delivered basket. A partial/material-only,
 * expired or wrong-postcode result never becomes a selectable priced kit. */
export function deliveredFloorKit(data: SerializedProject, settings: DeliverySettings, now = Date.now()) {
  const comparison = data.deliveryComparison, best = comparison?.best;
  if (settings.mode !== 'shipping' || !/^\d{2}-\d{3}$/.test(settings.postalCode ?? '') || comparison?.mode !== 'shipping' || comparison.postalCode !== settings.postalCode || comparison.allowSeparateOrders !== (settings.allowSeparateOrders ?? true) || comparison.missingProductCount || !best || !Array.isArray(best.stores) || !best.stores.length) return null;
  if (!Array.isArray(data.stages) || !data.stages.length || data.stages.some(stage => !Array.isArray(stage?.lines) || stage.lines.some(line => !line || !Number.isFinite(line.quantity) || line.quantity < 0 || line.quantity > 0 && !line.resolved))) return null;
  const amounts = [best.materialsGrosze, best.deliveryGrosze, best.totalGrosze];
  if (!amounts.every(n => Number.isSafeInteger(n) && n! >= 0) || best.totalGrosze !== best.materialsGrosze + best.deliveryGrosze!) return null;
  if (best.stores.some(store => {
    const q = store.quote;
    return store.source !== 'retailer' || !q || !Number.isSafeInteger(store.materialsGrosze) || store.materialsGrosze < 0 || !Number.isSafeInteger(store.deliveryGrosze) || store.deliveryGrosze! < 0 || store.deliveryGrosze !== q.costGrosze || store.totalGrosze !== store.materialsGrosze + store.deliveryGrosze!
      || !Number.isFinite(Date.parse(q.checkedAt)) || Date.parse(q.checkedAt) > now || !Number.isFinite(Date.parse(q.expiresAt)) || Date.parse(q.expiresAt) <= now
      || q.orders !== undefined && (!Array.isArray(q.orders) || q.orders.length < 2)
      || !(q.destinationScope === 'PL' || q.destinationScope === 'postal_code' && q.postalCode === settings.postalCode);
  })) return null;
  if (best.stores.reduce((n, store) => n + store.materialsGrosze, 0) !== best.materialsGrosze || best.stores.reduce((n, store) => n + store.deliveryGrosze!, 0) !== best.deliveryGrosze) return null;
  return { materialsGrosze: best.materialsGrosze, deliveryGrosze: best.deliveryGrosze!, totalGrosze: best.totalGrosze!,
    stores: best.stores.map(store => store.store), orders: best.stores.reduce((n, store) => n + (store.quote!.orders?.length ?? 1), 0),
    expiresAt: Math.min(...best.stores.map(store => Date.parse(store.quote!.expiresAt))),
    scopeLimited: comparison.searchLimited === true || (comparison.unavailableStores?.length ?? 0) > 0 };
}

export function preserveFloorKitAdhesive(next: readonly TileChoice[], previous: readonly TileChoice[]): TileChoice[] {
  return next.map(choice => {
    const old = previous.find(row => row.use === 'floor' && row.from === choice.from && row.floorAdhesive);
    return choice.use === 'floor' && old ? { ...choice, floorAdhesive: old.floorAdhesive } : choice;
  });
}

export function updateFloorKitAdhesive(tiles: readonly TileChoice[], packs: readonly ProductChoice[]): TileChoice[] {
  return parseTileChoices(JSON.stringify({ version: 1, choices: tiles.map(choice => choice.floorAdhesive
    ? { ...choice, floorAdhesive: packs.find(pack => pack.from === choice.floorAdhesive)?.to ?? choice.floorAdhesive }
    : choice) }));
}
