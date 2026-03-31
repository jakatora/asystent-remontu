import type { CalculationResult, ShoppingItem } from '@/types/domain';
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
        notes: m.material.notes,
        createdAt: nowISO(),
      }));
  }
}

export const shoppingListGenerator: ShoppingListGenerator =
  new RenovationShoppingListGenerator();

// ─── Public API ─────────────────────────────────────────────────────────────

export function generateShoppingItems(
  projectId: string,
  result: CalculationResult
): Omit<ShoppingItem, 'id'>[] {
  return shoppingListGenerator.fromCalculation(projectId, result);
}
