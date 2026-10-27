import { MATERIAL_PRICES } from '@/data/prices/materials';
import type { CalculationResult, ShoppingItem } from '@/types/domain';
import type { PricingStageInput } from './pricingApi';
import { normalizeUnit } from './quantity';

export interface ShoppingStageContext {
  projectId: string;
  calc: CalculationResult;
  original: PricingStageInput;
  items: readonly ShoppingItem[];
}

const nameKey = (name: string) => typeof name === 'string' ? name.trim().normalize('NFC').toLocaleLowerCase('pl') : '';
const catalogueNames = new Set(MATERIAL_PRICES.map(ref => nameKey(ref.productLabel)));
export function selectedShoppingReference(item: ShoppingItem) {
  if (!item.selectedRequirement) return undefined;
  const matches = MATERIAL_PRICES.filter(ref => nameKey(ref.productLabel) === nameKey(item.name)
    && normalizeUnit(ref.packageUnit) === normalizeUnit(item.unit) && ref.materialType === item.category);
  return matches.length === 1 ? matches[0] : undefined;
}
const sameProduct = (a: PricingStageInput['materials'][number], b: PricingStageInput['materials'][number]) => {
  const codes = (line: typeof a) => line.material.ean || line.material.gtin;
  return normalizeUnit(a.material.unit) === normalizeUnit(b.material.unit)
    && a.material.category === b.material.category
    && (codes(a) && codes(b) ? codes(a) === codes(b) : nameKey(a.material.name) === nameKey(b.material.name));
};

export const restoreSelectionBasis = (items: readonly ShoppingItem[]): ShoppingItem[] => items.map(item => item.selectionBasis
  ? { ...item, ...item.selectionBasis, selectionBasis: undefined, selectedRequirement: undefined, selectedProductChanged: undefined }
  : item);

/** Read-only projection. A saved declaration belongs to its product and raw
 * quantity, never just a stable recipe ID. Keep its basis for later switches
 * and restoration; no SQLite rows are changed by browsing product choices. */
export function reviewSelectedShopping(
  items: readonly ShoppingItem[], original: PricingStageInput, selected: PricingStageInput,
  sources: readonly ShoppingItem[] = items,
): ShoppingItem[] {
  return restoreSelectionBasis(items).map(item => {
    if (item.itemType !== 'material') return item;
    const source = sources.find(row => row.id === item.id) ?? item;
    const basis = source.selectionBasis ?? {
      name: source.name, unit: source.unit, quantity: source.quantity, customQuantity: source.customQuantity,
      customPrice: source.customPrice, estimatedPrice: source.estimatedPrice, owned: source.owned, purchased: source.purchased,
      quantityKnown: item.quantityKnown, requiredQuantity: item.requiredQuantity, needsQuantityConfirmation: item.needsQuantityConfirmation,
    };
    const previous = original.materials.find(line => line.material.id === item.materialId);
    const target = selected.materials.find(line => line.material.id === item.materialId);
    // Door set components deliberately have different IDs and retain their
    // explicit whole-set ownership semantics.
    if (!previous || !target) return item;
    const identityChanged = !sameProduct(previous, target);
    const quantityChanged = Math.abs(previous.quantity - target.quantity) > 1e-8;
    const savedDifferentProduct = catalogueNames.has(nameKey(basis.name))
      && nameKey(basis.name) !== nameKey(target.material.name);
    const panelArea = original.jobId === 'laminate-flooring' && item.materialId === 'laminate-panels';
    if (!identityChanged && !quantityChanged && !savedDifferentProduct && !panelArea) return item;
    const matches = nameKey(basis.name) === nameKey(target.material.name)
      && typeof basis.unit === 'string' && normalizeUnit(basis.unit) === normalizeUnit(target.material.unit);
    const known = target.material.unit !== 'pozycja' && Number.isFinite(target.quantity) && target.quantity > 0;
    const available = basis.customQuantity ?? basis.quantity;
    const covers = known && matches && Number.isFinite(available) && available + 1e-8 >= target.quantity;
    return {
      ...item, selectionBasis: basis, selectedRequirement: true,
      selectedProductChanged: !matches,
      name: target.material.name, unit: target.material.unit, quantity: target.quantity,
      category: target.material.category ?? undefined, packs: undefined, purchaseUnit: undefined,
      customQuantity: matches ? basis.customQuantity : undefined,
      estimatedPrice: matches ? basis.estimatedPrice : 0, customPrice: matches ? basis.customPrice : undefined,
      quantityKnown: known, requiredQuantity: target.quantity, needsQuantityConfirmation: !covers,
      owned: covers && basis.owned, purchased: covers && basis.purchased,
    };
  });
}
