import { createProductChoiceGroup, type ProductChoice } from './productChoice';
import type { PricingStageInput } from './pricingApi';

export const CEILING_PAINT_CHOICE_PREFIX = 'remont.ceiling-paint-choice.v1:';
export const CEILING_PAINT_TARGET = 'mat-paint-better-white-10l';
// An explicit choice of a different paint, never an EAN alias or an automatic
// substitution. EKO Plus is a white matt paint for interior walls and ceilings.
// source: https://www.sniezka.pl/produkt/sniezka-eko-plus
// source: https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089
const originalIds = ['mat-paint-economy-white-10l', 'mat-paint-standard-white-10l'];
const group = createProductChoiceGroup([...originalIds, CEILING_PAINT_TARGET], 'paint', 'l');
export const CEILING_PAINT_PRODUCTS = group.products;
export type CeilingPaintChoice = ProductChoice;
export const NO_CEILING_PAINT_CHOICES: readonly CeilingPaintChoice[] = [];
export function parseCeilingPaintChoices(raw: string | null): CeilingPaintChoice[] {
  const choices = group.parse(raw);
  if (choices.some(choice => !originalIds.includes(choice.from) || choice.to !== CEILING_PAINT_TARGET)) throw Error('invalid_ceiling_paint_choice');
  return choices;
}
const ceilingStages = (stages: readonly PricingStageInput[]) => stages.filter(stage => stage.jobId === 'paint-ceiling').map(stage => ({ ...stage, materials: stage.materials.filter(line => line.material.id === 'ceiling-paint') }));
export const ceilingPaintRequirements = (stages: readonly PricingStageInput[]) => group.requirements(ceilingStages(stages)).filter(ref => originalIds.includes(ref.id));
export function applyCeilingPaintChoices(stages: readonly PricingStageInput[], choices: readonly CeilingPaintChoice[]): PricingStageInput[] {
  const validated = parseCeilingPaintChoices(JSON.stringify({ version: 1, choices }));
  return stages.map(stage => stage.jobId !== 'paint-ceiling' ? stage : { ...stage, materials: stage.materials.map(line => line.material.id !== 'ceiling-paint' ? line : group.apply([{ ...stage, materials: [line] }], validated)[0].materials[0]) });
}
