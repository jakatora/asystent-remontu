import { createProductChoiceGroup } from './productChoice';

export const FLUSH_BOX_CHOICE_PREFIX = 'remont.flush-box-choice.v1:';
export const FLUSH_BOX_TEN = 'mat-flush-box-elektroplast-pk60-10';
export const FLUSH_BOX_SINGLE = 'mat-epn-pk60-pro-0285-01';
// Exact PRO 0285-01/0285-01L, deep with screws. LUX and spacer rings excluded.
// Different GTINs are preserved; the user explicitly selects a selling format.
// source: https://www.elektro-plast.com.pl/download/EPN_CENNIK_2024_05.02.2024.pdf (p6)
// source: https://hipper.pl/puszka-podtynkowa-laczeniowa-60-mm-pro-z-wkretami-elektro-plast-956340504
const group = createProductChoiceGroup([FLUSH_BOX_TEN, FLUSH_BOX_SINGLE], 'flush-box', 'szt');
export const FLUSH_BOX_PRODUCTS = group.products;
export const parseFlushBoxChoices = (raw: string | null) => {
  const choices = group.parse(raw);
  if (choices.some(c => c.from !== FLUSH_BOX_TEN || c.to !== FLUSH_BOX_SINGLE)) throw Error('invalid_flush_box_choices');
  return choices;
};
export const applyFlushBoxChoices = (stages: Parameters<typeof group.apply>[0], choices: Parameters<typeof group.apply>[1]) =>
  group.apply(stages, parseFlushBoxChoices(JSON.stringify({ version: 1, choices })));
export const flushBoxRequirements = (stages: Parameters<typeof group.requirements>[0]) => group.requirements(stages).filter(ref => ref.id === FLUSH_BOX_TEN);
