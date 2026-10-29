import { TILE_ADHESIVE_CHOICE_PREFIX, parseTileAdhesiveChoices } from './tileAdhesiveChoice';
import { useProductChoices } from './useProductChoices';

export function useTileAdhesiveChoices(projectId: string | undefined, enabled: boolean) {
  return useProductChoices(TILE_ADHESIVE_CHOICE_PREFIX, projectId, enabled, parseTileAdhesiveChoices);
}
