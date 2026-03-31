import type { RenovationJob, BudgetEstimate } from '@/types/domain';
import type { BudgetEstimator } from '@/types/calculator';
import { roundMoney } from '@/shared/lib/currency';

// Labor cost multipliers by difficulty (relative to materials cost)
const LABOR_MULTIPLIER: Record<string, { min: number; max: number }> = {
  easy:   { min: 0.5, max: 1.0 },
  medium: { min: 1.0, max: 2.0 },
  hard:   { min: 2.0, max: 4.0 },
};

// Price variance factor (materials can vary ±20%)
const PRICE_VARIANCE = 0.2;

class RenovationBudgetEstimator implements BudgetEstimator {
  estimate(job: RenovationJob, materialsCost: number): BudgetEstimate {
    const laborMult = LABOR_MULTIPLIER[job.difficulty] ?? LABOR_MULTIPLIER.medium;

    const materialsMin = roundMoney(materialsCost * (1 - PRICE_VARIANCE));
    const materialsMax = roundMoney(materialsCost * (1 + PRICE_VARIANCE));
    const laborMin = roundMoney(materialsCost * laborMult.min);
    const laborMax = roundMoney(materialsCost * laborMult.max);

    return {
      materialsMin,
      materialsMax,
      laborMin,
      laborMax,
      totalMin: roundMoney(materialsMin + laborMin),
      totalMax: roundMoney(materialsMax + laborMax),
      currency: 'PLN',
    };
  }
}

export const budgetEstimator: BudgetEstimator = new RenovationBudgetEstimator();

export function estimateBudget(job: RenovationJob, materialsCost: number): BudgetEstimate {
  return budgetEstimator.estimate(job, materialsCost);
}
