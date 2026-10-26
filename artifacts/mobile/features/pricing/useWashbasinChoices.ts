import { WASHBASIN_CHOICE_PREFIX, parseWashbasinChoices } from './washbasinChoice';
import { useProductChoices } from './useProductChoices';

export function useWashbasinChoices(projectId: string | undefined, enabled: boolean) {
  return useProductChoices(WASHBASIN_CHOICE_PREFIX, projectId, enabled, parseWashbasinChoices);
}
