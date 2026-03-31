import type { RenovationJob, CalculationResult, MaterialLineItem, MaterialItem } from '@/types/domain';
import type { MaterialRequirement } from '@/types/engine';
import type { CalculatorEngine, MeasurementMap } from '@/types/calculator';
import { resolveFormula } from './formulas';
import { resolveWarnings } from '../warnings/resolver';
import { roundMoney } from '@/shared/lib/currency';

const DEFAULT_WASTE_FACTOR = 1.1;

// ─── Material resolution helpers ───────────────────────────────────────────────

function isRichMaterial(m: MaterialItem | MaterialRequirement): m is MaterialRequirement {
  return 'formula' in m && typeof (m as MaterialRequirement).formula === 'function';
}

function applyRounding(
  quantity: number,
  material: MaterialItem | MaterialRequirement
): { quantity: number; packs: number | undefined } {
  const rule = material.roundingRule ?? 'ceil';
  const packaging = material.packaging;

  if (packaging) {
    // Convert to pack count — always rounds up
    const packs = Math.ceil(quantity / packaging.size);
    return { quantity: packs * packaging.size, packs };
  }

  switch (rule) {
    case 'none':
      return { quantity, packs: undefined };
    case 'round':
      return { quantity: Math.round(quantity * 10) / 10, packs: undefined };
    case 'ceil':
    default:
      return { quantity: Math.ceil(quantity * 10) / 10, packs: undefined };
  }
}

function resolveMaterialQuantity(
  material: MaterialItem | MaterialRequirement,
  measurements: MeasurementMap
): { quantity: number; packs: number | undefined } {
  const wasteFactor = material.wasteFactor ?? DEFAULT_WASTE_FACTOR;

  let rawQty: number;

  if (isRichMaterial(material) && material.formula) {
    // Priority 1: inline formula function
    rawQty = material.formula(measurements, wasteFactor);
  } else {
    // Priority 2: formula registry key
    const key = (material as MaterialItem).formulaKey ?? '';
    const formulaFn = resolveFormula(key);
    rawQty = formulaFn(measurements, wasteFactor);
  }

  const safeQty = Math.max(0, rawQty);
  return applyRounding(safeQty, material);
}

// ─── Engine ────────────────────────────────────────────────────────────────────

class RenovationCalculatorEngine implements CalculatorEngine {
  calculate(job: RenovationJob, measurements: MeasurementMap): CalculationResult {
    const materials = this.calculateMaterials(job, measurements);
    const totalCost = roundMoney(
      materials.reduce((sum, m) => sum + m.cost, 0)
    );
    const warnings = resolveWarnings(job.warningRules, { measurements });

    return {
      jobId: job.id,
      measurements,
      materials,
      totalCost,
      totalDays: job.estimatedDays,
      warnings,
    };
  }

  private calculateMaterials(
    job: RenovationJob,
    measurements: MeasurementMap
  ): MaterialLineItem[] {
    return job.materials.map((material) => {
      const { quantity, packs } = resolveMaterialQuantity(material, measurements);

      // Cost is based on packs if packaging is defined (you pay per pack)
      const billableQty = packs !== undefined ? packs : quantity;
      const cost = roundMoney(billableQty * material.pricePerUnit);

      return { material, quantity, packs, cost };
    });
  }
}

// ─── Singleton + public API ────────────────────────────────────────────────────

export const calculatorEngine: CalculatorEngine = new RenovationCalculatorEngine();

export function calculateMaterials(
  job: RenovationJob,
  measurements: MeasurementMap
): CalculationResult {
  return calculatorEngine.calculate(job, measurements);
}
