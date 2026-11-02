import { createRecoverablePreferenceStorage, type PreferenceStorage } from '../storage/recoverablePreferenceStorage';
import { CEILING_PAINT_CHOICE_PREFIX, parseCeilingPaintChoices, type CeilingPaintChoice } from './ceilingPaintChoice';
const codec = (raw: string | null) => ({ version: 1 as const, choices: parseCeilingPaintChoices(raw) });
const storage = createRecoverablePreferenceStorage(CEILING_PAINT_CHOICE_PREFIX, codec, { version: 1 as const, choices: [] }, id => Boolean(id) && id.length <= 200, 'invalid_ceiling_paint_project');
export const ceilingPaintStorage = {
  read: async (s: PreferenceStorage, id: string) => (await storage.read(s, id)).choices,
  write: async (s: PreferenceStorage, id: string, choices: readonly CeilingPaintChoice[]) => (await storage.write(s, id, { version: 1, choices: [...choices] })).choices,
  recover: async (s: PreferenceStorage, id: string) => { const result = await storage.recover(s, id); return { value: result.value.choices, reset: result.reset }; },
};
export const readCeilingPaintChoices = ceilingPaintStorage.read;
export const waitForCeilingPaintWrites = storage.wait;
