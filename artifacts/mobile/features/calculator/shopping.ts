import type { CalculationResult, ShoppingItem, RenovationJob } from '@/types/domain';
import type { ShoppingListGenerator } from '@/types/calculator';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';
import { roundMoney } from '@/shared/lib/currency';

class RenovationShoppingListGenerator implements ShoppingListGenerator {
  fromCalculation(
    projectId: string,
    result: CalculationResult
  ): Omit<ShoppingItem, 'id'>[] {
    return result.materials
      .filter((m) => m.quantity > 0)
      .map((m) => ({
        projectId,
        materialId: m.material.id,
        name: m.material.name,
        quantity: m.quantity,
        unit: m.material.unit,
        estimatedPrice: roundMoney(m.cost),
        purchased: false,
        owned: false,
        itemType: 'material' as const,
        tier: 'standard' as const,
        category: m.material.category,
        notes: m.material.notes,
        createdAt: nowISO(),
      }));
  }
}

export const shoppingListGenerator: ShoppingListGenerator =
  new RenovationShoppingListGenerator();

export function generateShoppingItems(
  projectId: string,
  result: CalculationResult
): Omit<ShoppingItem, 'id'>[] {
  return shoppingListGenerator.fromCalculation(projectId, result);
}

export function generateToolShoppingItems(
  projectId: string,
  job: RenovationJob
): Omit<ShoppingItem, 'id'>[] {
  return job.tools
    .filter((t) => t.required)
    .map((t) => ({
      projectId,
      materialId: t.id,
      name: t.name,
      quantity: 1,
      unit: 'szt.',
      estimatedPrice: roundMoney(t.estimatedBuyCostPLN ?? 0),
      purchased: false,
      owned: false,
      itemType: 'tool' as const,
      tier: 'standard' as const,
      category: 'narzędzia',
      notes: t.notes,
      createdAt: nowISO(),
    }));
}

export function generateAllShoppingItems(
  projectId: string,
  result: CalculationResult,
  job: RenovationJob
): Omit<ShoppingItem, 'id'>[] {
  const materials = generateShoppingItems(projectId, result);
  const tools = generateToolShoppingItems(projectId, job);

  const seen = new Set<string>();
  const deduped: Omit<ShoppingItem, 'id'>[] = [];

  for (const item of [...materials, ...tools]) {
    const key = `${item.materialId}-${item.itemType}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return deduped;
}
