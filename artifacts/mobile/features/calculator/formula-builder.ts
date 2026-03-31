import type { FormulaFn, MeasurementMap } from '@/types/calculator';
import type { FormulaSpec } from '@/types/engine';

// ─── Shared measurement helpers ────────────────────────────────────────────────

export function resolveArea(m: MeasurementMap): number {
  return m.wallArea ?? m.floorArea ?? m.ceilingArea ?? m.area ?? 0;
}

export function resolveCoats(m: MeasurementMap): number {
  return m.coats ?? m.layers ?? 2;
}

export function resolvePerimeter(m: MeasurementMap): number {
  return m.perimeter ?? m.linearMeters ?? Math.sqrt(resolveArea(m)) * 4;
}

/** Tile area in m² from m.tileWidthCm × m.tileHeightCm (fallback 30×30 cm). */
export function resolveTileAreaM2(m: MeasurementMap): number {
  const w = m.tileWidthCm ?? 30;
  const h = m.tileHeightCm ?? 30;
  return (w / 100) * (h / 100);
}

/** Waste multiplier from m.wastePercent (0–100) or fallback. */
export function resolveWastePct(m: MeasurementMap, fallbackPct: number): number {
  return m.wastePercent != null ? 1 + m.wastePercent / 100 : 1 + fallbackPct / 100;
}

/** Coverage rate: litres per m² from m.coveragePerLiter (defaults to given value). */
export function resolveCoveragePerLiter(m: MeasurementMap, defaultCoverage: number): number {
  return m.coveragePerLiter ?? defaultCoverage;
}

/** Panel pack coverage m² per pack from m.panelPackCoverageM2. */
export function resolvePanelPackCoverage(m: MeasurementMap, defaultCoverage: number): number {
  return m.panelPackCoverageM2 ?? defaultCoverage;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Formula builder ─────────────────────────────────────────────────────────
// Factory functions that return a FormulaFn.
// Use these in job data files when the standard registry key isn't precise enough.

export const formulaBuilder = {
  /**
   * Coverage formula: (area × coats) / coveragePerLiter × waste.
   * If m.coveragePerLiter is provided by the user, it overrides the default.
   *
   * @param defaultCoveragePerLiter  m² per litre (e.g. 10)
   */
  coverage(defaultCoveragePerLiter: number): FormulaFn {
    return (m, waste) => {
      const cov = resolveCoveragePerLiter(m, defaultCoveragePerLiter);
      return round1((resolveArea(m) * resolveCoats(m)) / cov * waste);
    };
  },

  /**
   * kg-per-m² formula: area × kgPerSqm [× coats if coatFactor] × waste.
   *
   * @param kgPerSqm      Material consumption in kg per m² per coat
   * @param coatFactor    Whether to multiply by number of coats (default false)
   */
  kgPerSqm(kgPerSqm: number, coatFactor = false): FormulaFn {
    return (m, waste) => {
      const base = resolveArea(m) * kgPerSqm * (coatFactor ? resolveCoats(m) : 1);
      return round1(base * waste);
    };
  },

  /**
   * Pack formula: ceil((area × kgPerSqm × waste) / kgPerPack).
   * Returns number of full packages to buy.
   *
   * @param kgPerSqm   kg needed per m²
   * @param kgPerPack  kg per bag/pack
   */
  packs(kgPerSqm: number, kgPerPack: number): FormulaFn {
    return (m, waste) => {
      const total = resolveArea(m) * kgPerSqm * waste;
      return Math.ceil(total / kgPerPack);
    };
  },

  /**
   * Tile pieces formula.
   * Uses m.tileWidthCm + m.tileHeightCm if provided; falls back to defaults.
   * Waste comes from m.wastePercent if set, otherwise from defaultWastePct.
   *
   * @param defaultWastePct  % of tile waste (e.g. 15 for 15%)
   */
  tilePieces(defaultWastePct = 15): FormulaFn {
    return (m, _waste) => {
      const tileM2 = resolveTileAreaM2(m);
      const wasteMultiplier = resolveWastePct(m, defaultWastePct);
      return Math.ceil((resolveArea(m) * wasteMultiplier) / tileM2);
    };
  },

  /**
   * Panel packs formula.
   * Uses m.panelPackCoverageM2 if provided; otherwise uses default.
   * Returns number of packs needed.
   *
   * @param defaultPackCoverageM2  m² per pack (e.g. 2.196 for common laminate)
   */
  panelPacks(defaultPackCoverageM2: number): FormulaFn {
    return (m, waste) => {
      const coverage = resolvePanelPackCoverage(m, defaultPackCoverageM2);
      return Math.ceil((resolveArea(m) * waste) / coverage);
    };
  },

  /**
   * Linear formula: (m[key] ?? perimeter) × factor × waste.
   *
   * @param key     Measurement key to use for length (default 'perimeter')
   * @param factor  Multiplier (default 1)
   */
  linear(key: keyof MeasurementMap = 'perimeter', factor = 1): FormulaFn {
    return (m, waste) => {
      const lm = (m[key] as number | undefined) ?? resolvePerimeter(m);
      return round1(lm * factor * waste);
    };
  },

  /**
   * Fixed quantity — always returns the same number regardless of measurements.
   */
  fixed(quantity: number): FormulaFn {
    return () => quantity;
  },

  /**
   * Per-item formula — returns Math.max(fallback, m[key]).
   *
   * @param key       Measurement key containing item count
   * @param fallback  Minimum value (default 1)
   */
  perItem(key: string, fallback = 1): FormulaFn {
    return (m) => Math.max(fallback, (m[key] as number | undefined) ?? fallback);
  },

  /**
   * Grout formula — uses m.groutWidthMm and tile size to calculate kg.
   * Based on: grout_kg/m² = groutWidth × (tileW + tileH) / (tileW × tileH) × depth × density
   * Simplified approximation: use standard chart values.
   *
   * @param defaultKgPerSqm  Fallback kg/m² if inputs not provided
   */
  grout(defaultKgPerSqm = 0.5): FormulaFn {
    return (m, waste) => {
      const tileW = m.tileWidthCm ?? 30;
      const tileH = m.tileHeightCm ?? 30;
      const groutMm = m.groutWidthMm ?? 3;
      const depth = 9; // mm tile thickness approx
      const density = 1.7; // g/cm³
      const kgPerM2 =
        ((tileW + tileH) / (tileW * tileH)) * groutMm * depth * density * 0.001;
      const computed = kgPerM2 > 0 ? kgPerM2 : defaultKgPerSqm;
      return round1(resolveArea(m) * computed * waste);
    };
  },

  /**
   * Silicone tubes formula — 1 tube covers ~sealingMeters lm.
   *
   * @param lmPerTube  Linear meters sealed per tube (default 8)
   * @param key        Measurement key for linear meters (default 'linearMeters')
   */
  siliconeTubes(lmPerTube = 8, key: keyof MeasurementMap = 'linearMeters'): FormulaFn {
    return (m) => {
      const lm = (m[key] as number | undefined) ?? resolvePerimeter(m);
      return Math.ceil(lm / lmPerTube);
    };
  },
};

// ─── Spec resolver ─────────────────────────────────────────────────────────────
// Converts a declarative FormulaSpec into a FormulaFn.

export function resolveSpec(spec: FormulaSpec): FormulaFn {
  switch (spec.type) {
    case 'coverage':
      return formulaBuilder.coverage(spec.litersPerSqm);
    case 'kgPerSqm':
      return formulaBuilder.kgPerSqm(spec.kgPerSqm, spec.coatFactor);
    case 'kgPerPack':
      return formulaBuilder.packs(spec.kgPerSqm, spec.kgPerPack);
    case 'tilePieces':
      return formulaBuilder.tilePieces(spec.defaultWastePct);
    case 'linear':
      return formulaBuilder.linear(
        (spec.key as keyof MeasurementMap) ?? 'perimeter',
        spec.factor
      );
    case 'fixed':
      return formulaBuilder.fixed(spec.value);
    case 'perItem':
      return formulaBuilder.perItem(spec.key, spec.fallback);
  }
}
