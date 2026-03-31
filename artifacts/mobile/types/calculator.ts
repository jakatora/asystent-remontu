import type { RenovationJob, CalculationResult, MaterialLineItem, WarningRule, BudgetEstimate, ShoppingItem } from './domain';

// ─── Formula function contract ─────────────────────────────────────────────

export type MeasurementMap = Readonly<Record<string, number>>;

export type FormulaFn = (measurements: MeasurementMap, wasteFactor: number) => number;

export type FormulaRegistry = Readonly<Record<string, FormulaFn>>;

// ─── Calculator engine interface ────────────────────────────────────────────

export interface CalculatorEngine {
  calculate(job: RenovationJob, measurements: MeasurementMap): CalculationResult;
}

// ─── Shopping list generator interface ─────────────────────────────────────

export interface ShoppingListGenerator {
  fromCalculation(
    projectId: string,
    result: CalculationResult
  ): Omit<ShoppingItem, 'id'>[];
}

// ─── Budget estimator interface ─────────────────────────────────────────────

export interface BudgetEstimator {
  estimate(job: RenovationJob, materialsCost: number): BudgetEstimate;
}

// ─── Warning resolver interface ─────────────────────────────────────────────

export interface WarningResolver {
  resolve(
    rules: readonly WarningRule[],
    context: WarningContext
  ): WarningRule[];
}

export interface WarningContext {
  readonly measurements?: MeasurementMap;
  readonly isLargeArea?: boolean;
  readonly isHighHumidity?: boolean;
  readonly isBeginner?: boolean;
}
