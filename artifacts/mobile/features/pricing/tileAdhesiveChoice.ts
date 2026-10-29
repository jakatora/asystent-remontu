import { createProductChoiceGroup, type ProductChoice } from './productChoice';
import type { PricingStageInput } from './pricingApi';

export const TILE_ADHESIVE_CHOICE_PREFIX = 'remont.tile-adhesive-choice.v1:';
// Both references describe ATLAS PLUS, but identify different retail packs.
// Preserve the already calculated kg; never merge their EANs or offer prices.
// source: https://www.atlas.com.pl/produkt/atlas-plus/
// source: https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd
// source: https://sklep.sewera.pl/atlas-plus-podwojna-moc-klej-do-plytek-25kg-p8893
const group = createProductChoiceGroup([
  'mat-tile-adhesive-buildfix-25kg',
  'mat-tile-adhesive-atlas-plus-standard-25kg',
], 'adhesive', 'kg');

export const TILE_ADHESIVE_PRODUCTS = group.products;
export type TileAdhesiveChoice = ProductChoice;
export const parseTileAdhesiveChoices = group.parse;
export const tileAdhesiveReference = group.reference;
export const tileAdhesiveRequirements = (stages: readonly PricingStageInput[]) =>
  group.requirements(stages.filter(stage => stage.jobId === 'floor-tiles'));

export function applyTileAdhesiveChoices(stages: readonly PricingStageInput[], choices: readonly TileAdhesiveChoice[]): PricingStageInput[] {
  const validated = group.parse(JSON.stringify({ version: 1, choices }));
  return stages.map(stage => stage.jobId === 'floor-tiles' ? group.apply([stage], validated)[0] : stage);
}
