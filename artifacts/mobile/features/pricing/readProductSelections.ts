import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyLaminateChoices, LAMINATE_CHOICE_PREFIX, parseLaminateChoices } from './laminateChoice';
import { applyFoilChoices, FOIL_CHOICE_PREFIX, parseFoilChoices } from './foilChoice';
import { applyWashbasinChoices, WASHBASIN_CHOICE_PREFIX, parseWashbasinChoices } from './washbasinChoice';
import { applyTileChoices, TILE_CHOICE_PREFIX, parseTileChoices } from './tileChoice';
import { applyTileAdhesiveChoices, TILE_ADHESIVE_CHOICE_PREFIX, parseTileAdhesiveChoices } from './tileAdhesiveChoice';
import type { PricingStageInput } from './pricingApi';

export async function readSelectedStage(projectId: string, original: PricingStageInput): Promise<PricingStageInput> {
  const [panels, foils, basins, tiles, adhesives] = await Promise.all([
    LAMINATE_CHOICE_PREFIX, FOIL_CHOICE_PREFIX, WASHBASIN_CHOICE_PREFIX, TILE_CHOICE_PREFIX, TILE_ADHESIVE_CHOICE_PREFIX,
  ].map(prefix => AsyncStorage.getItem(prefix + projectId)));
  const tileChoices = parseTileChoices(tiles);
  return applyTileAdhesiveChoices(applyTileChoices(applyWashbasinChoices(applyFoilChoices(applyLaminateChoices([original], parseLaminateChoices(panels)),
    parseFoilChoices(foils)), parseWashbasinChoices(basins)), tileChoices), parseTileAdhesiveChoices(adhesives), tileChoices)[0];
}
