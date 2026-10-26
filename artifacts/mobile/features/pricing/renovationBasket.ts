import type { Project, ShoppingItem } from '@/types/domain';
import type { MaterialCategory } from '@/types/pricing';
import { toPricingStageInput, type PricingStageInput } from './pricingApi';
import { type DoorSelection } from './doorSelection';
import { upgradeCalculation } from '@/features/calculator/upgrades';
import { applyProjectShopping } from './projectShoppingInput';
import { applyLaminateChoices, type LaminateChoice } from './laminateChoice';
import { applyFoilChoices, type FoilChoice } from './foilChoice';
import { applyWashbasinChoices, type WashbasinChoice } from './washbasinChoice';
import { applyTileChoices, type TileChoice } from './tileChoice';

export const MAX_BASKET_PROJECTS = 20;
export const RENOVATION_BASKET_KEY = 'remont.renovation-basket.v1';

/** The user explicitly chooses which works belong to this renovation. */
export function parseBasketSelection(raw: string | null): string[] {
  if (!raw || raw.length > 20_000) return [];
  try {
    const value = JSON.parse(raw);
    return value.version === 1 && Array.isArray(value.projectIds)
      ? [...new Set<string>(value.projectIds.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0 && id.length <= 200))].slice(0, MAX_BASKET_PROJECTS) : [];
  } catch { return []; }
}

export function buildRenovationBasket(
  projects: readonly Project[], selectedIds: readonly string[], tier: MaterialCategory,
  shoppingByProject: Readonly<Record<string, readonly ShoppingItem[]>> = {},
  doorsByProject: Readonly<Record<string, DoorSelection | null>> = {},
  laminatesByProject: Readonly<Record<string, readonly LaminateChoice[]>> = {},
  foilsByProject: Readonly<Record<string, readonly FoilChoice[]>> = {},
  washbasinsByProject: Readonly<Record<string, readonly WashbasinChoice[]>> = {},
  tilesByProject: Readonly<Record<string, readonly TileChoice[]>> = {},
): { stages: PricingStageInput[]; includedProjects: Project[]; excludedMaterials: number; manualItems: number; missingCalculations: number } {
  const ids = new Set(selectedIds);
  const includedProjects = projects.filter(project => ids.has(project.id));
  let excludedMaterials = 0, manualItems = 0, missingCalculations = 0;
  const stages: PricingStageInput[] = [];
  for (const project of includedProjects) {
    const calc = upgradeCalculation(project.calculationResult);
    if (!calc) { missingCalculations++; continue; }
    const stage = toPricingStageInput(calc, tier, doorsByProject[project.id]);
    const items = shoppingByProject[project.id] ?? [];
    const pending = applyProjectShopping(stage, calc, project.id, items);
    excludedMaterials += pending.excludedMaterials;
    manualItems += pending.manualItems;
    stages.push(applyTileChoices(applyWashbasinChoices(applyFoilChoices(applyLaminateChoices([pending.stage], laminatesByProject[project.id] ?? []), foilsByProject[project.id] ?? []), washbasinsByProject[project.id] ?? []), tilesByProject[project.id] ?? [])[0]);
  }
  return { stages, includedProjects, excludedMaterials, manualItems, missingCalculations };
}
