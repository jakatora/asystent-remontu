import type { Project, ShoppingItem } from '@/types/domain';
import type { MaterialCategory } from '@/types/pricing';
import { toPricingStageInput, type PricingStageInput } from './pricingApi';
import { doorOriginMaterialId, type DoorSelection } from './doorSelection';
import { EPS_JOB_ID, upgradeEpsCalculation } from '@/features/calculator/eps';
import { normalizeUnit } from './quantity';
import { additionalMaterial } from './basketExtras';

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
): { stages: PricingStageInput[]; includedProjects: Project[]; excludedMaterials: number; manualItems: number; missingCalculations: number } {
  const ids = new Set(selectedIds);
  const includedProjects = projects.filter(project => ids.has(project.id));
  let excludedMaterials = 0, manualItems = 0, missingCalculations = 0;
  const stages: PricingStageInput[] = [];
  for (const project of includedProjects) {
    const calc = upgradeEpsCalculation(project.calculationResult);
    if (!calc) { missingCalculations++; continue; }
    const stage = toPricingStageInput(calc, tier, doorsByProject[project.id]);
    const items = shoppingByProject[project.id] ?? [];
    const materialIds = new Set(calc.materials.map(line => line.material.id));
    const manual = items.filter(item => item.projectId === project.id && item.itemType !== 'tool' && !item.owned && !item.purchased && !materialIds.has(item.materialId));
    manualItems += manual.length;
    const materials = stage.materials.filter(line => {
      const matching = items.filter(item => item.projectId === project.id && item.itemType !== 'tool' && item.materialId === doorOriginMaterialId(line.material.id));
      // A boolean in Shopping means the entire material line is covered.
      // Conflicting duplicate rows cannot silently remove required materials.
      const requirement = calc.materials.find(item => item.material.id === line.material.id);
      const covers = (item: ShoppingItem) => (item.owned || item.purchased) && (calc.jobId !== EPS_JOB_ID ||
        requirement?.quantityKnown !== false && !item.needsQuantityConfirmation && Math.abs((item.customQuantity ?? item.quantity) - (requirement?.quantity ?? NaN)) < 1e-8 && item.unit === requirement?.material.unit);
      if (matching.length > 0 && matching.every(covers)) { excludedMaterials++; return false; }
      return true;
    });
    for (const item of manual) {
      const quantity = item.customQuantity ?? item.quantity;
      const unit = typeof item.unit === 'string' ? normalizeUnit(item.unit) : '';
      const known = item.quantityKnown !== false && Number.isFinite(quantity) && quantity > 0 && Boolean(unit);
      materials.push(additionalMaterial(`manual:${item.id}`, known ? item.name : `${item.name} — ilość do ustalenia`, known ? unit : 'pozycja', known ? quantity : 1));
    }
    stages.push({ ...stage, materials });
  }
  return { stages, includedProjects, excludedMaterials, manualItems, missingCalculations };
}
