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
  estimateStageCostFromCalculation,
  estimateProjectCostFromCalculation,
  toEstimateItem,
  toEstimateItems,
  type CalculatorMaterial,
  type CalculatorMaterialLine,
  type CalculatorStageResult,
  type StageEstimateFromCalculation,
} from "./from-calculator";
