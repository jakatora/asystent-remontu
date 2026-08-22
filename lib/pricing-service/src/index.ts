// Publiczny punkt wejścia serwisu wyceny (bridge kalkulator -> katalog cen).
export * from "./types";
export {
  estimateStageCost,
  estimateProjectCost,
  selectCheapestOffer,
  resolvePackageSize,
  computePackagesNeeded,
  type EstimateDeps,
} from "./estimate";
