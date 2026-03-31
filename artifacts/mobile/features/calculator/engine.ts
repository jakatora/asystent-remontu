import type { RenovationJob, CalculationResult, MaterialLineItem, WarningRule } from '@/types/domain';
import type { CalculatorEngine, MeasurementMap } from '@/types/calculator';
import { resolveFormula } from './formulas';
import { resolveWarnings } from '../warnings/resolver';
import { roundMoney } from '@/shared/lib/currency';

const DEFAULT_WASTE_FACTOR = 1.1;

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
      const formula = resolveFormula(material.formulaKey);
      const wasteFactor = material.wasteFactor ?? DEFAULT_WASTE_FACTOR;
      const rawQuantity = formula(measurements, wasteFactor);
      const quantity = Math.max(0, rawQuantity);
      const cost = roundMoney(quantity * material.pricePerUnit);

      return { material, quantity, cost };
    });
  }
}

// Singleton — one engine instance for the whole app
export const calculatorEngine: CalculatorEngine = new RenovationCalculatorEngine();

// ─── Public API (backward-compatible) ──────────────────────────────────────

export function calculateMaterials(
  job: RenovationJob,
  measurements: MeasurementMap
): CalculationResult {
  return calculatorEngine.calculate(job, measurements);
}
