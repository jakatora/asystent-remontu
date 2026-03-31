// ─── Enhanced Calculation Types ───────────────────────────────────────────────
// Superset of CalculationResult with per-material explanations, assumptions,
// purchase quantities, and waste breakdowns.
// These are designed for display in results screens and are persistable.

import type { MaterialItem, MaterialLineItem, CalculationResult, WarningRule } from './domain';
import type { MaterialRequirement } from './engine';
import type { MeasurementMap } from './calculator';

// ─── Per-material explanation ─────────────────────────────────────────────────

/** Context passed to material explanation generators. */
export interface MaterialExplanationContext {
  /** The material definition. */
  readonly material: MaterialItem | MaterialRequirement;
  /** Raw quantity before rounding (after waste factor applied). */
  readonly rawQuantity: number;
  /** Rounded quantity (native unit, e.g. litres, kg, m²). */
  readonly quantity: number;
  /** Number of packs/bags/tubes to buy (if packaging defined). */
  readonly packs?: number;
  /** Quantity in purchase units. */
  readonly purchaseQuantity: number;
  /** Label for the purchase unit. */
  readonly purchaseUnit: string;
  /** Waste factor used. */
  readonly wasteFactor: number;
  /** All user-supplied measurement values. */
  readonly measurements: MeasurementMap;
}

/** Generates a Polish-language explanation for one material calculation. */
export type MaterialExplanationFn = (ctx: MaterialExplanationContext) => MaterialExplanation;

export interface MaterialExplanation {
  /**
   * One-line formula narrative in Polish.
   * E.g. "40 m² × 2 warstwy ÷ 10 m²/L × 1,05 (odpad 5%) = 8,4 L → 10 L (2 puszki po 5 L)"
   */
  readonly text: string;
  /**
   * List of assumptions used, shown as bullet points.
   * E.g. ["Wydajność farby: 10 m²/litr", "Liczba warstw: 2", "Odpad: 5%"]
   */
  readonly assumptions: readonly string[];
}

// ─── Enhanced material line item ──────────────────────────────────────────────

export interface MaterialLineItemDetail extends MaterialLineItem {
  /** Raw quantity before rounding — shows exact math result. */
  readonly rawQuantity: number;
  /** Waste reserve amount (rawQuantity - netQuantity). */
  readonly wasteQuantity: number;
  /** What the user actually buys (packs × pack size, or rounded quantity). */
  readonly purchaseQuantity: number;
  /** Unit of the purchase quantity (e.g. "puszka", "worek", "m²"). */
  readonly purchaseUnit: string;
  /** Auto-generated Polish explanation of how this quantity was derived. */
  readonly explanation: MaterialExplanation;
}

// ─── Enhanced calculation result ──────────────────────────────────────────────

/**
 * Full calculation result with per-material explanations and purchase breakdown.
 * Persistable — safe to store in SQLite as JSON.
 */
export interface CalculationResultDetail extends Omit<CalculationResult, 'materials'> {
  readonly materials: readonly MaterialLineItemDetail[];
  /** Short Polish summary, e.g. "Pokój 40 m²: 2 puszki farby, 1 pojemnik gruntu" */
  readonly summaryText: string;
  /** ISO timestamp when this calculation was made. */
  readonly calculatedAt: string;
  /** Schema version for future migrations. */
  readonly schemaVersion: 1;
}

// ─── Job calculator config ────────────────────────────────────────────────────

/**
 * Per-job calculator configuration.
 * Registered once per job file; looked up by jobId at calculation time.
 */
export interface JobCalculatorConfig {
  readonly jobId: string;
  /**
   * Short description of what this calculator computes.
   * Shown as a header on the calculator screen.
   */
  readonly calculatorDescription?: string;
  /**
   * Human-readable labels for the default assumption values.
   * Key: measurement input id or formula constant identifier.
   * Value: Polish-language assumption label.
   * Example: { coveragePerLiter: 'Wydajność farby', coats: 'Liczba warstw' }
   */
  readonly defaultAssumptions?: Readonly<Record<string, string>>;
  /**
   * Override explanation generators for specific materials (by material.id).
   * If absent, the engine uses its auto-generated explanation.
   */
  readonly materialExplanationOverrides?: Readonly<Record<string, MaterialExplanationFn>>;
  /**
   * Optional validator called before calculation — returns Polish error messages.
   */
  readonly validate?: (measurements: MeasurementMap) => readonly string[];
}
