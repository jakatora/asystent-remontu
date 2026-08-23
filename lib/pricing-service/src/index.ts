// Publiczny punkt wejścia serwisu wyceny (bridge kalkulator -> katalog cen).
export * from "./types";
export {
  estimateStageCost,
  estimateProjectCost,
  consolidateProject,
  compareStores,
  selectCheapestOffer,
  resolvePackageSize,
  computePackagesNeeded,
  buildPackageVariants,
  type EstimateDeps,
} from "./estimate";
export { optimizePackages } from "./package-optimizer";
export {
  estimateStageLabor,
  type Measurements,
  type LaborLine,
  type LaborSource,
  type LaborUnestimatedReason,
  type StageLaborEstimate,
} from "./labor";
export {
  LABOR_RATES,
  JOB_LABOR_MAPPINGS,
  DEFAULT_LABOR_REGION,
  getLaborRateById,
  getLaborRateIdsForJob,
  type LaborRate,
  type LaborUnit,
  type JobLaborMapping,
  type LaborSourceType,
} from "./labor-data";
export {
  estimateStageCostFromCalculation,
  estimateProjectCostFromCalculation,
  toEstimateItem,
  toEstimateItems,
  type CalculatorMaterial,
  type CalculatorMaterialLine,
  type CalculatorStageResult,
  type StageEstimateFromCalculation,
} from "./from-calculator";
