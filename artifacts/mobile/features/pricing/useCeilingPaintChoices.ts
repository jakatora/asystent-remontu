import { useRecoverablePreference } from '../storage/useRecoverablePreference';
import { ceilingPaintStorage } from './ceilingPaintStorage';
import { NO_CEILING_PAINT_CHOICES, type CeilingPaintChoice } from './ceilingPaintChoice';
export function useCeilingPaintChoices(projectId: string | undefined, enabled: boolean) {
  const state = useRecoverablePreference<readonly CeilingPaintChoice[]>(projectId ?? 'preview', enabled, ceilingPaintStorage, NO_CEILING_PAINT_CHOICES);
  return { ...state, choices: state.value };
}
