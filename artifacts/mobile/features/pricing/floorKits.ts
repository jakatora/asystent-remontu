import { applyTileChoices, parseTileChoices, tileReference, TILE_PRODUCTS, type TileChoice, type FloorKitAdhesive } from './tileChoice';
import { applyShoppingContexts } from './projectShoppingInput';
import type { ShoppingStageContext } from './selectedShopping';
import type { PricingStageInput } from './pricingApi';
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

export { deliveredKit as deliveredFloorKit } from './deliveredKit';

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
