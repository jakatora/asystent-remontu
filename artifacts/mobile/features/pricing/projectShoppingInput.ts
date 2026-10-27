import { isGypsumJob, reviewGypsumShopping } from '@/features/calculator/gypsumBoard';
import { isFrameJob, reviewFrameShopping } from '@/features/calculator/framePainting';
import { isWallFinishingJob, reviewFinishingShopping } from '@/features/calculator/wallFinishing';
import type { CalculationResult, ShoppingItem } from '@/types/domain';
import type { PricingStageInput } from './pricingApi';
import { EPS_JOB_ID } from '@/features/calculator/eps';
import { SINK_JOB_ID } from '@/features/calculator/sink';
import { doorOriginMaterialId } from './doorSelection';
import { normalizeUnit } from './quantity';
import { additionalMaterial } from './basketExtras';
import { upgradeCalculation } from '@/features/calculator/upgrades';
import { substratePrimerSpecification, reviewSubstrateShopping } from '@/features/calculator/substratePrimer';
import { getRequiredQuantity } from '@/features/calculator/requirements';
import { isSanitaryJob, reviewSanitaryShopping } from '@/features/calculator/sanitarySealant';
import { LAMINATE_JOB, reviewLaminateShopping } from '@/features/calculator/laminateSupplies';
import { restoreSelectionBasis, reviewSelectedShopping } from './selectedShopping';
import type { ShoppingStageContext } from './selectedShopping';

export function requiresCurrentShoppingQuantity(jobId: string): boolean {
  return [EPS_JOB_ID, SINK_JOB_ID, LAMINATE_JOB].includes(jobId) || Boolean(substratePrimerSpecification(jobId)) || isSanitaryJob(jobId) || isWallFinishingJob(jobId) || isFrameJob(jobId) || isGypsumJob(jobId);
}

export function shoppingQuantityAction(jobId: string, item: ShoppingItem): { allowed: boolean; confirmQuantity?: number } {
  if (item.itemType === 'material' && item.selectedRequirement) {
    if (item.quantityKnown === false || !Number.isFinite(item.requiredQuantity)) return { allowed: false };
    return { allowed: true, ...(item.needsQuantityConfirmation ? { confirmQuantity: Math.max(item.requiredQuantity!, item.customQuantity ?? 0) } : {}) };
  }
  if (!requiresCurrentShoppingQuantity(jobId) || item.itemType !== 'material') return { allowed: true };
  if (item.quantityKnown === false || item.requiredQuantity !== undefined && item.customQuantity !== undefined
      && (jobId===LAMINATE_JOB||substratePrimerSpecification(jobId)||isSanitaryJob(jobId)||isWallFinishingJob(jobId)||isFrameJob(jobId)||isGypsumJob(jobId) ? !Number.isFinite(item.customQuantity) || item.customQuantity + 1e-8 < item.requiredQuantity : Math.abs(item.customQuantity - item.requiredQuantity) > 1e-8)) return { allowed: false };
  return { allowed: true, ...(item.needsQuantityConfirmation && item.requiredQuantity !== undefined ? { confirmQuantity: item.requiredQuantity } : {}) };
}

/** Manual requirements must be present before the product chooser runs. */
export function withManualShopping(stage: PricingStageInput, calc: CalculationResult, projectId: string, items: readonly ShoppingItem[]): PricingStageInput {
  const materialIds = new Set(calc.materials.map(line => line.material.id));
  const materials = [...stage.materials];
  for (const item of items.filter(item => item.projectId === projectId && item.itemType !== 'tool' && !item.owned && !item.purchased && !materialIds.has(item.materialId))) {
    const id = `manual:${item.id}`;
    if (materials.some(line => line.material.id === id)) continue;
    const quantity = item.customQuantity ?? item.quantity;
    const unit = typeof item.unit === 'string' ? normalizeUnit(item.unit) : '';
    const known = item.quantityKnown !== false && Number.isFinite(quantity) && quantity > 0 && Boolean(unit);
    materials.push(additionalMaterial(id, known ? item.name : `${item.name} — ilość do ustalenia`, known ? unit : 'pozycja', known ? quantity : 1));
  }
  return { ...stage, materials };
}

/** Index-aligned contexts keep identical job IDs in different rooms isolated.
 * Stages without a context (basket extras) remain ordinary requirements. */
export function applyShoppingContexts(stages: readonly PricingStageInput[], contexts: readonly (ShoppingStageContext | undefined)[]) {
  const results = stages.map((stage, index) => {
    const context = contexts[index];
    return context ? applyProjectShopping(stage, context.calc, context.projectId, context.items, context.original) : { stage, excludedMaterials: 0 };
  });
  return { stages: results.map(result => result.stage), excluded: results.reduce((sum, result) => sum + result.excludedMaterials, 0) };
}

/** One pending-material scope for project quotes and the whole renovation.
 * Ownership is a whole-line declaration; duplicate/conflicting rows cannot
 * silently remove a requirement. Source shopping rows are never modified. */
export function applyProjectShopping(stage: PricingStageInput, calc: CalculationResult, projectId: string, items: readonly ShoppingItem[], original: PricingStageInput = stage) {
  calc = upgradeCalculation(calc)!;
  items = restoreSelectionBasis(items);
  const sources = items;
  items = reviewFrameShopping(reviewFinishingShopping(reviewSanitaryShopping(reviewSubstrateShopping(items, calc),calc),calc),calc);
  items = reviewGypsumShopping(items,calc);
  items = reviewLaminateShopping(items,calc);
  items = reviewSelectedShopping(items, original, stage, sources);
  let excludedMaterials = 0;
  const materialIds = new Set(calc.materials.map(line => line.material.id));
  const manual = items.filter(item => item.projectId === projectId && item.itemType !== 'tool' && !item.owned && !item.purchased && !materialIds.has(item.materialId));
  const materials = stage.materials.filter(line => {
    const matching = items.filter(item => item.projectId === projectId && item.itemType !== 'tool' && item.materialId === doorOriginMaterialId(line.material.id));
    const requirement = calc.materials.find(item => item.material.id === line.material.id);
    const substrate = calc.jobId===LAMINATE_JOB||Boolean(substratePrimerSpecification(calc.jobId))||isSanitaryJob(calc.jobId)||isWallFinishingJob(calc.jobId)||isFrameJob(calc.jobId)||isGypsumJob(calc.jobId);
    const required = requirement ? substrate ? getRequiredQuantity(requirement,calc) : requirement.quantity : NaN;
    const covers = (item: ShoppingItem) => item.selectedRequirement
      ? (item.owned || item.purchased) && item.quantityKnown !== false && !item.needsQuantityConfirmation
      : (item.owned || item.purchased) && (!requiresCurrentShoppingQuantity(calc.jobId) ||
      requirement?.quantityKnown !== false && !item.needsQuantityConfirmation && Number.isFinite(item.customQuantity ?? item.quantity)
      && (substrate ? (item.customQuantity ?? item.quantity) + 1e-8 >= required : Math.abs((item.customQuantity ?? item.quantity) - required) < 1e-8) && item.unit === requirement?.material.unit);
    if (matching.length > 0 && matching.every(covers)) { excludedMaterials++; return false; }
    return true;
  });
  return { stage: withManualShopping({ ...stage, materials }, calc, projectId, items), excludedMaterials, manualItems: manual.length };
}
