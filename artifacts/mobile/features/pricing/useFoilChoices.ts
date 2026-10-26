import { FOIL_CHOICE_PREFIX, parseFoilChoices } from './foilChoice';
import { useProductChoices } from './useProductChoices';

export function useFoilChoices(projectId: string | undefined, enabled: boolean) {
  return useProductChoices(FOIL_CHOICE_PREFIX, projectId, enabled, parseFoilChoices);
}
