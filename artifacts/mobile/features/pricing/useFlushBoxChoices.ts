import { FLUSH_BOX_CHOICE_PREFIX, parseFlushBoxChoices } from './flushBoxChoice';
import { useProductChoices } from './useProductChoices';

export function useFlushBoxChoices(projectId: string | undefined, enabled: boolean) {
  return useProductChoices(FLUSH_BOX_CHOICE_PREFIX, projectId, enabled, parseFlushBoxChoices);
}
