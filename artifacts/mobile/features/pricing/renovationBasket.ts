import type { Project, ShoppingItem } from '@/types/domain';
import type { MaterialCategory } from '@/types/pricing';
import { toPricingStageInput, type PricingStageInput } from './pricingApi';
import { type DoorSelection } from './doorSelection';
import { upgradeCalculation } from '@/features/calculator/upgrades';
import { applyProjectShopping, withManualShopping } from './projectShoppingInput';
import { applyLaminateChoices, type LaminateChoice } from './laminateChoice';
import { applyFoilChoices, type FoilChoice } from './foilChoice';
import { applyWashbasinChoices, type WashbasinChoice } from './washbasinChoice';
import { applyTileChoices, type TileChoice } from './tileChoice';
import { applyTileAdhesiveChoices, type TileAdhesiveChoice } from './tileAdhesiveChoice';
import type { ShoppingStageContext } from './selectedShopping';
import { DELIVERY_LIMITS } from '../../../../lib/pricing-service/src/delivery-limits';

export const MAX_BASKET_PROJECTS = DELIVERY_LIMITS.jobs - 1;
export const RENOVATION_BASKET_KEY = 'remont.renovation-basket.v1';

/** Bulk selection only includes works that can already contribute to a quote. */
export function measuredBasketProjectIds(projects: readonly Pick<Project, 'id' | 'calculationResult'>[]): string[] {
  return projects.filter(project => Boolean(project.calculationResult)).slice(0, MAX_BASKET_PROJECTS).map(project => project.id);
}

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
  tileAdhesivesByProject: Readonly<Record<string, readonly TileAdhesiveChoice[]>> = {},
): { stages: PricingStageInput[]; selectionStages: PricingStageInput[]; shoppingContexts: ShoppingStageContext[]; includedProjects: Project[]; excludedMaterials: number; manualItems: number; missingCalculations: number; measurementReviews: { projectId: string; projectName: string; materials: string[] }[] } {
  const ids = new Set(selectedIds);
  const includedProjects = projects.filter(project => ids.has(project.id));
  let excludedMaterials = 0, manualItems = 0, missingCalculations = 0;
  const stages: PricingStageInput[] = [];
  const selectionStages: PricingStageInput[] = [], shoppingContexts: ShoppingStageContext[] = [];
  const measurementReviews: { projectId: string; projectName: string; materials: string[] }[] = [];
  for (const project of includedProjects) {
    const calc = upgradeCalculation(project.calculationResult);
    if (!calc) { missingCalculations++; continue; }
    const items = shoppingByProject[project.id] ?? [];
    const stage = withManualShopping(toPricingStageInput(calc, tier, doorsByProject[project.id]), calc, project.id, items);
    const chosen = applyTileAdhesiveChoices(applyTileChoices(applyWashbasinChoices(applyFoilChoices(applyLaminateChoices([stage], laminatesByProject[project.id] ?? []), foilsByProject[project.id] ?? []), washbasinsByProject[project.id] ?? []), tilesByProject[project.id] ?? []), tileAdhesivesByProject[project.id] ?? [], tilesByProject[project.id] ?? [])[0];
    const pending = applyProjectShopping(chosen, calc, project.id, items, stage);
    selectionStages.push(chosen);
    shoppingContexts.push({ projectId: project.id, calc, original: stage, items });
    const unknown = calc.materials.filter(line => line.quantityKnown === false && pending.stage.materials.some(row => row.material.id === line.material.id));
    if (unknown.length) measurementReviews.push({ projectId: project.id, projectName: project.name, materials: [...new Set(unknown.map(line => line.material.name))] });
    excludedMaterials += pending.excludedMaterials;
    manualItems += pending.manualItems;
    stages.push(pending.stage);
  }
  return { stages, selectionStages, shoppingContexts, includedProjects, excludedMaterials, manualItems, missingCalculations, measurementReviews };
}
