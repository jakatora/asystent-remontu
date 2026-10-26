import type { CalculationResult, ShoppingItem } from '@/types/domain';
import type { PricingStageInput } from './pricingApi';
import { EPS_JOB_ID } from '@/features/calculator/eps';
import { SINK_JOB_ID } from '@/features/calculator/sink';
import { doorOriginMaterialId } from './doorSelection';
import { normalizeUnit } from './quantity';
import { additionalMaterial } from './basketExtras';
import { upgradeCalculation } from '@/features/calculator/upgrades';

export function requiresCurrentShoppingQuantity(jobId: string): boolean {
  return [EPS_JOB_ID, SINK_JOB_ID].includes(jobId);
}

export function shoppingQuantityAction(jobId: string, item: ShoppingItem): { allowed: boolean; confirmQuantity?: number } {
  if (!requiresCurrentShoppingQuantity(jobId) || item.itemType !== 'material') return { allowed: true };
  if (item.quantityKnown === false || item.requiredQuantity !== undefined && item.customQuantity !== undefined
      && Math.abs(item.customQuantity - item.requiredQuantity) > 1e-8) return { allowed: false };
  return { allowed: true, ...(item.needsQuantityConfirmation && item.requiredQuantity !== undefined ? { confirmQuantity: item.requiredQuantity } : {}) };
}

/** One pending-material scope for project quotes and the whole renovation.
 * Ownership is a whole-line declaration; duplicate/conflicting rows cannot
 * silently remove a requirement. Source shopping rows are never modified. */
export function applyProjectShopping(stage: PricingStageInput, calc: CalculationResult, projectId: string, items: readonly ShoppingItem[]) {
  calc = upgradeCalculation(calc)!;
  let excludedMaterials = 0;
  const materialIds = new Set(calc.materials.map(line => line.material.id));
  const manual = items.filter(item => item.projectId === projectId && item.itemType !== 'tool' && !item.owned && !item.purchased && !materialIds.has(item.materialId));
  const materials = stage.materials.filter(line => {
    const matching = items.filter(item => item.projectId === projectId && item.itemType !== 'tool' && item.materialId === doorOriginMaterialId(line.material.id));
    const requirement = calc.materials.find(item => item.material.id === line.material.id);
    const covers = (item: ShoppingItem) => (item.owned || item.purchased) && (!requiresCurrentShoppingQuantity(calc.jobId) ||
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
  return { stage: { ...stage, materials }, excludedMaterials, manualItems: manual.length };
}
