import { useMemo } from 'react';
import { calculatorEngine } from '@/features/calculator/engine';
import { budgetEstimator } from '@/features/calculator/budget';
import { resolveWarnings } from '@/features/warnings/resolver';
import type { RenovationJob, CalculationResult, BudgetEstimate } from '@/types/domain';
import type { MeasurementMap, WarningContext } from '@/types/calculator';

// ─── Calculate materials + cost for a job + measurements ─────────────────────

export function useCalculation(
  job: RenovationJob | null | undefined,
  measurements: MeasurementMap
): CalculationResult | null {
  return useMemo(() => {
    if (!job) return null;
    return calculatorEngine.calculate(job, measurements);
  }, [job, measurements]);
}

// ─── Derive budget estimate from calculation result ───────────────────────────

export function useBudgetEstimate(
  job: RenovationJob | null | undefined,
  result: CalculationResult | null | undefined
): BudgetEstimate | null {
  return useMemo(() => {
    if (!job || !result) return null;
    return budgetEstimator.estimate(job, result.totalCost);
  }, [job, result]);
}

// ─── Resolve warnings for a job given context ────────────────────────────────

export function useResolvedWarnings(
  job: RenovationJob | null | undefined,
  context: WarningContext = {}
) {
  return useMemo(() => {
    if (!job) return [];
    return resolveWarnings(job.warningRules, context);
  }, [job, context]);
}

// ─── One-shot: calculate + budget + warnings ─────────────────────────────────

export function useFullEstimate(
  job: RenovationJob | null | undefined,
  measurements: MeasurementMap,
  warningContext: WarningContext = {}
) {
  const calculation = useCalculation(job, measurements);
  const budget      = useBudgetEstimate(job, calculation);
  const warnings    = useResolvedWarnings(job, warningContext);

  return { calculation, budget, warnings };
}
