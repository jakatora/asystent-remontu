import { TILE_CHOICE_PREFIX, parseTileChoices } from './tileChoice';
import { useProductChoices } from './useProductChoices';

export function useTileChoices(projectId: string | undefined, enabled: boolean) {
  return useProductChoices(TILE_CHOICE_PREFIX, projectId, enabled, parseTileChoices);
}
