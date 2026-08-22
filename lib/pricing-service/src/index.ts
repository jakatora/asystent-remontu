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
  type EstimateDeps,
} from "./estimate";
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
