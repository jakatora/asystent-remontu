// Optymalny dobór wielkości opakowań dla jednej pozycji materiału.
//
// PROBLEM: mając wymaganą ilość natywną (np. 15 l farby) i listę dostępnych
// WIELKOŚCI opakowań tego samego materiału (np. 10 l i 5 l, każda z najtańszą
// ofertą), dobierz NAJTAŃSZĄ kombinację sztuk pokrywającą ilość — zamiast
// zaokrąglać w górę do jednego rozmiaru (2×10 l = 20 l, naddatek 5 l).
//
// KONWENCJA PIENIĘDZY: wszystkie kwoty w GROSZACH (integer), spójnie z resztą
// serwisu wyceny. Czysta funkcja — bez I/O, w pełni testowalna.
//
// ALGORYTM: programowanie dynamiczne po ilości (siatka przeskalowana do liczb
// całkowitych, bo wielkości bywają ułamkowe jak 2,5 l). dp[q] = najtańszy koszt
// pokrycia CO NAJMNIEJ q jednostek. Kryterium: (1) minimalny koszt, (2) przy
// remisie kosztu — minimalny naddatek (najmniejsza pokryta ilość ponad potrzebę).
// To realizuje regułę „15 l = 10 l + 5 l zamiast 2×10 l" gdy koszty są równe.

import type {
  PackagePlan,
  PackagePlanEntry,
  PackageVariant,
} from "./types";
import { computePackagesNeeded } from './purchase-quantity';

/** Górny limit rozmiaru siatki DP — zabezpieczenie przed patologicznym wejściem. */
const MAX_GRID = 2_000_000;

/**
 * Liczba miejsc po przecinku wartości (cap 4), do wyznaczenia wspólnej skali,
 * która zamienia ułamkowe wielkości opakowań na liczby całkowite siatki DP.
 */
function decimalPlaces(n: number): number {
  if (!Number.isFinite(n) || Number.isInteger(n)) return 0;
  const s = Math.abs(n).toString();
  const dot = s.indexOf(".");
  if (dot < 0) return 0; // np. notacja wykładnicza — traktujemy jak całkowite
  return Math.min(s.length - dot - 1, 4);
}

/** Wspólna skala = 10^maxMiejsc, tak by wszystkie wartości stały się całkowite. */
function resolveScale(values: readonly number[]): number {
  let maxDec = 0;
  for (const v of values) maxDec = Math.max(maxDec, decimalPlaces(v));
  return 10 ** maxDec;
}

/** Zbiera wybór DP w pozycje planu (grupa po wielkości), posortowane malejąco. */
function buildEntries(
  chosen: readonly { variant: PackageVariant; count: number }[],
): { packages: PackagePlanEntry[]; totalGrosze: number; coverage: number } {
  const byKey = new Map<string, PackagePlanEntry>();
  let totalGrosze = 0;
  let coverage = 0;
  for (const { variant: v, count } of chosen) {
    coverage += v.packageSize * count;
    totalGrosze += v.unitPriceGrosze * count;
    const key = v.offerId;
    const existing = byKey.get(key);
    if (existing) {
      existing.count += count;
      existing.lineCostGrosze += v.unitPriceGrosze * count;
    } else {
      byKey.set(key, {
        packageSize: v.packageSize,
        count,
        unitPriceGrosze: v.unitPriceGrosze,
        lineCostGrosze: v.unitPriceGrosze * count,
        ...((v.purchaseMultiple ?? 1) > 1 ? { purchaseMultiple: v.purchaseMultiple } : {}),
        ...((v.minimumPackages ?? 1) > 1 ? { minimumPackages: v.minimumPackages } : {}),
        store: v.store,
        url: v.url,
        offerId: v.offerId,
      });
    }
  }
  const packages = [...byKey.values()].sort(
    (a, b) => b.packageSize - a.packageSize || a.unitPriceGrosze - b.unitPriceGrosze,
  );
  return { packages, totalGrosze, coverage };
}

/** Fallback dla patologicznie dużej siatki: jedna wielkość o najlepszej cenie/jednostkę. */
function fallbackSingleVariant(
  requiredQuantity: number,
  variants: readonly PackageVariant[],
): PackagePlan {
  const cost = (v: PackageVariant) => computePackagesNeeded(requiredQuantity,v.packageSize,v.purchaseMultiple,v.minimumPackages) * v.unitPriceGrosze;
  const best = [...variants].sort(
    (a, b) =>
      cost(a) - cost(b) ||
      a.packageSize - b.packageSize,
  )[0]!;
  const count = computePackagesNeeded(requiredQuantity,best.packageSize,best.purchaseMultiple,best.minimumPackages);
  const { packages, totalGrosze, coverage } = buildEntries([{variant:best,count}]);
  return {
    packages,
    totalGrosze,
    requiredQuantity,
    coveredQuantity: coverage,
    overage: coverage - requiredQuantity,
  };
}

/** A retailer minimum applies once per offer, not once per added pack. Each
 * group permits either zero packs or its minimum followed by ordinary lots.
 * Two recurrences (start the group / extend it) avoid enumerating every count. */
function optimizeWithMinimums(
  requiredQuantity: number,
  variants: readonly PackageVariant[],
  target: number,
  scale: number,
): PackagePlan {
  if (variants.length * (target + 1) > MAX_GRID) return fallbackSingleVariant(requiredQuantity, variants);
  let costs = new Float64Array(target + 1).fill(Infinity);
  let coverages = new Float64Array(target + 1).fill(Infinity);
  costs[0] = coverages[0] = 0;
  const choices: Uint32Array[] = [];
  const grids: number[] = [];
  for (const variant of variants) {
    const multiple = variant.purchaseMultiple ?? 1;
    const minimum = Math.ceil((variant.minimumPackages ?? 1) / multiple) * multiple;
    const grid = Math.max(1, Math.round(variant.packageSize * multiple * scale));
    const minimumGrid = grid * (minimum / multiple);
    const stepCost = variant.unitPriceGrosze * multiple;
    const minimumCost = variant.unitPriceGrosze * minimum;
    const usedCosts = new Float64Array(target + 1);
    const usedCoverages = new Float64Array(target + 1);
    const usedCounts = new Uint32Array(target + 1);
    const nextCosts = new Float64Array(target + 1);
    const nextCoverages = new Float64Array(target + 1);
    const counts = new Uint32Array(target + 1);
    for (let q = 0; q <= target; q++) {
      const beforeMinimum = Math.max(0, q - minimumGrid);
      let cost = costs[beforeMinimum] + minimumCost;
      let coverage = coverages[beforeMinimum] + minimumGrid;
      let count = minimum;
      if (q > 0) {
        const beforeStep = Math.max(0, q - grid);
        const extendedCost = usedCosts[beforeStep] + stepCost;
        const extendedCoverage = usedCoverages[beforeStep] + grid;
        if (extendedCost < cost || (extendedCost === cost && extendedCoverage < coverage)) {
          cost = extendedCost;
          coverage = extendedCoverage;
          count = usedCounts[beforeStep] + multiple;
        }
      }
      usedCosts[q] = cost;
      usedCoverages[q] = coverage;
      usedCounts[q] = count;
      const use = cost < costs[q] || (cost === costs[q] && coverage < coverages[q]);
      nextCosts[q] = use ? cost : costs[q];
      nextCoverages[q] = use ? coverage : coverages[q];
      counts[q] = use ? count : 0;
    }
    costs = nextCosts;
    coverages = nextCoverages;
    choices.push(counts);
    grids.push(grid);
  }
  const chosen: { variant: PackageVariant; count: number }[] = [];
  let q = target;
  for (let index = variants.length - 1; index >= 0; index--) {
    const count = choices[index][q];
    if (!count) continue;
    const variant = variants[index];
    chosen.push({variant,count});
    q = Math.max(0, q - grids[index] * (count / (variant.purchaseMultiple ?? 1)));
  }
  const { packages, totalGrosze, coverage } = buildEntries(chosen);
  return {packages,totalGrosze,requiredQuantity,coveredQuantity:coverage,overage:coverage-requiredQuantity};
}

/**
 * Dobiera najtańszą kombinację wielkości opakowań pokrywającą `requiredQuantity`.
 *
 * @returns Plan zakupu (wybrane opakowania + łączny koszt + naddatek) albo:
 *  - pusty plan (koszt 0), gdy `requiredQuantity <= 0`,
 *  - `null`, gdy nie ma ŻADNEJ użytecznej wielkości opakowania (nie da się liczyć).
 *
 * Gwarancja: gdy wśród wariantów jest wielkość użyta w wycenie „naiwnej"
 * (pojedynczy rozmiar × sufit), zwrócony koszt jest <= tej wyceny (kombinacja
 * jest zawsze co najmniej tak dobra jak jeden rozmiar).
 */
export function optimizePackages(
  requiredQuantity: number,
  variants: readonly PackageVariant[],
): PackagePlan | null {
  if (!(requiredQuantity > 0)) {
    return {
      packages: [],
      totalGrosze: 0,
      requiredQuantity: 0,
      coveredQuantity: 0,
      overage: 0,
    };
  }

  const usable = variants.filter(
    (v) =>
      v.packageSize > 0 &&
      Number.isFinite(v.packageSize) &&
      Number.isFinite(v.unitPriceGrosze) &&
      Number.isSafeInteger(v.unitPriceGrosze) && v.unitPriceGrosze >= 0 &&
      Number.isSafeInteger(v.purchaseMultiple ?? 1) && (v.purchaseMultiple ?? 1) >= 1 && (v.purchaseMultiple ?? 1) <= 10_000 &&
      Number.isSafeInteger(v.minimumPackages ?? 1) && (v.minimumPackages ?? 1) >= 1 && (v.minimumPackages ?? 1) <= 10_000 &&
      Number.isSafeInteger(v.unitPriceGrosze * Math.max(v.purchaseMultiple ?? 1, Math.ceil((v.minimumPackages ?? 1) / (v.purchaseMultiple ?? 1)) * (v.purchaseMultiple ?? 1))),
  );
  if (usable.length === 0) return null;
  if (usable.length === 1) return fallbackSingleVariant(requiredQuantity, usable);

  const scale = resolveScale([requiredQuantity, ...usable.map((v) => v.packageSize * (v.purchaseMultiple ?? 1))]);
  // Cel = wymagana ilość w jednostkach siatki, zaokrąglona w górę (musimy pokryć
  // CO NAJMNIEJ tyle). Mała tolerancja na błąd floatów przed sufitem.
  const target = Math.max(1, Math.ceil(requiredQuantity * scale - 1e-9));
  if (target > MAX_GRID) return fallbackSingleVariant(requiredQuantity, usable);
  if (usable.some(v => (v.minimumPackages ?? 1) > 1)) return optimizeWithMinimums(requiredQuantity, usable, target, scale);

  const items = usable.map((v) => ({
    variant: v,
    grid: Math.max(1, Math.round(v.packageSize * (v.purchaseMultiple ?? 1) * scale)),
  }));

  // dp[q] = { cost, coverage, choice, prev } — najtańsze pokrycie co najmniej q.
  // Porównanie leksykograficzne: koszt rosnąco, potem coverage rosnąco (mniejszy
  // naddatek). coverage w jednostkach siatki.
  type Cell = { cost: number; coverage: number; choice: number; prev: number };
  const dp: (Cell | null)[] = new Array(target + 1).fill(null);
  dp[0] = { cost: 0, coverage: 0, choice: -1, prev: 0 };

  for (let q = 1; q <= target; q++) {
    let best: Cell | null = null;
    for (let i = 0; i < items.length; i++) {
      const g = items[i]!.grid;
      const prev = q - g <= 0 ? 0 : q - g;
      const base = dp[prev];
      if (!base) continue;
      const cost = base.cost + items[i]!.variant.unitPriceGrosze * (items[i]!.variant.purchaseMultiple ?? 1);
      const coverage = base.coverage + g;
      if (
        best === null ||
        cost < best.cost ||
        (cost === best.cost && coverage < best.coverage)
      ) {
        best = { cost, coverage, choice: i, prev };
      }
    }
    dp[q] = best;
  }

  const end = dp[target];
  if (!end) return fallbackSingleVariant(requiredQuantity, usable);

  // Rekonstrukcja wyboru z dp: idziemy od target po `prev` zbierając warianty.
  const chosen: { variant: PackageVariant; count: number }[] = [];
  let q = target;
  // Zabezpieczenie przed pętlą (nie powinno wystąpić przy poprawnym dp).
  let guard = target + items.length + 1;
  while (q > 0 && guard-- > 0) {
    const cell = dp[q];
    if (!cell || cell.choice < 0) break;
    const variant = items[cell.choice]!.variant;
    chosen.push({variant,count:variant.purchaseMultiple??1});
    q = cell.prev;
  }

  // buildEntries sumuje pokrycie w jednostkach NATYWNYCH (nie w siatce).
  const { packages, totalGrosze, coverage } = buildEntries(chosen);
  return {
    packages,
    totalGrosze,
    requiredQuantity,
    coveredQuantity: coverage,
    overage: coverage - requiredQuantity,
  };
}
