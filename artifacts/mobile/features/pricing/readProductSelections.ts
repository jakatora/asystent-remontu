import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyLaminateChoices, LAMINATE_CHOICE_PREFIX, parseLaminateChoices } from './laminateChoice';
import { applyFoilChoices, FOIL_CHOICE_PREFIX, parseFoilChoices } from './foilChoice';
import { applyWashbasinChoices, WASHBASIN_CHOICE_PREFIX, parseWashbasinChoices } from './washbasinChoice';
import { applyTileChoices, TILE_CHOICE_PREFIX, parseTileChoices } from './tileChoice';
import type { PricingStageInput } from './pricingApi';

export async function readSelectedStage(projectId: string, original: PricingStageInput): Promise<PricingStageInput> {
  const [panels, foils, basins, tiles] = await Promise.all([
    LAMINATE_CHOICE_PREFIX, FOIL_CHOICE_PREFIX, WASHBASIN_CHOICE_PREFIX, TILE_CHOICE_PREFIX,
  ].map(prefix => AsyncStorage.getItem(prefix + projectId)));
  return applyTileChoices(applyWashbasinChoices(applyFoilChoices(applyLaminateChoices([original], parseLaminateChoices(panels)),
    parseFoilChoices(foils)), parseWashbasinChoices(basins)), parseTileChoices(tiles))[0];
}
