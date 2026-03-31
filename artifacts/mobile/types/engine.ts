// ─── Renovation Engine Types ──────────────────────────────────────────────────
// Rich, schema-first types for the core engine layer.
// All new fields are optional so existing job files stay valid.

import type { FormulaFn, MeasurementMap } from './calculator';

// ─── Measurement input definition ────────────────────────────────────────────

/** Semantic type of a measurement field — drives UI widget and formula behaviour. */
export type InputType =
  | 'length'       // single dimension (m)
  | 'area'         // surface area (m²)
  | 'count'        // whole-number quantity (warstwy, drzwi, gniazdka)
  | 'coverage'     // coverage rate, e.g. liters per m²
  | 'packSize'     // package size, e.g. 25 kg bag
  | 'percent'      // waste percentage (0–100)
  | 'select'       // one of a predefined set
  | 'dimension';   // two-axis input (width × height), stored separately

export interface SelectOption {
  readonly label: string;
  readonly value: number;
}

/**
 * Rich measurement input definition.
 * Extends the basic `MeasurementInput` with semantic type, defaults, and select options.
 */
export interface MeasurementInputDefinition {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly inputType: InputType;
  readonly placeholder: string;
  readonly defaultValue?: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly hint?: string;
  readonly required?: boolean;
  /** For 'select' type — the allowed options. */
  readonly options?: readonly SelectOption[];
  /** Formula variable this field feeds into (defaults to `id`). */
  readonly bindKey?: string;
}

// ─── Material requirement ─────────────────────────────────────────────────────

/** How a calculated quantity should be rounded before displaying. */
export type RoundingRule =
  | 'none'      // keep decimal (e.g. 3.4 L of paint)
  | 'ceil'      // round up to whole units
  | 'round'     // normal rounding
  | 'packSize'; // round up to nearest package (requires `packagingSize`)

/** Information about how the material is sold. */
export interface PackagingInfo {
  /** Size of one purchasable package in the material's native unit. e.g. 5 (liters) */
  readonly size: number;
  /** Human-readable label for one package. e.g. "puszka 5 L" */
  readonly label: string;
  /** Unit of the package quantity. e.g. "opakowanie" */
  readonly purchaseUnit: string;
}

/**
 * Rich material requirement — superset of `MaterialItem`.
 * Supports inline formula functions, packaging info, and rounding rules.
 */
export interface MaterialRequirement {
  readonly id: string;
  readonly name: string;
  /** Unit of the raw calculated quantity (e.g. 'litr', 'm²', 'kg'). */
  readonly unit: string;
  /** Override unit for what the user buys (e.g. 'opakowanie'). If omitted, equals `unit`. */
  readonly purchaseUnit?: string;
  /**
   * Formula resolution — use ONE of:
   *   formulaKey  →  look up in FORMULA_REGISTRY
   *   formula     →  inline function (takes precedence)
   */
  readonly formulaKey?: string;
  readonly formula?: FormulaFn;
  /** Waste/safety factor applied after the formula. Default 1.0 (formula already includes waste). */
  readonly wasteFactor?: number;
  /** How to round the final quantity. Default 'ceil' for counted items, 'round' for fluids. */
  readonly roundingRule?: RoundingRule;
  /** Packaging info — if provided, quantity is auto-converted to packs. */
  readonly packaging?: PackagingInfo;
  /** Reference price per purchase unit in PLN. */
  readonly pricePerUnit: number;
  readonly notes?: string;
  readonly brand?: string;
  /** Broad material group for UI grouping (paint / adhesive / profile / etc.). */
  readonly category?: string;
  /** True if this material is optional (e.g. primer on already-primed surfaces). */
  readonly optional?: boolean;
}

// ─── Tool requirement ──────────────────────────────────────────────────────────

export interface ToolRequirement {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly required: boolean;
  readonly rentable?: boolean;
  /** Approximate daily rental cost in PLN. */
  readonly estimatedRentCostPLN?: number;
  /** Approximate retail purchase price in PLN. */
  readonly estimatedBuyCostPLN?: number;
  readonly notes?: string;
  /** Short safety note for this specific tool. */
  readonly safetyNote?: string;
}

// ─── Step guide ───────────────────────────────────────────────────────────────

/** Phase a step belongs to — enables filtering (show only prep steps, etc.). */
export type StepPhase =
  | 'preparation'   // surface prep, masking, mixing
  | 'work'          // main renovation work
  | 'drying'        // waiting / curing
  | 'cleanup'       // post-work cleanup
  | 'quality-check'; // inspection

/**
 * Rich step guide — superset of `InstructionStep`.
 * Adds phase, duration range, material/tool references, and per-step checkpoints.
 */
export interface StepGuide {
  readonly step: number;
  readonly phase: StepPhase;
  readonly title: string;
  readonly description: string;
  readonly tip?: string;
  readonly warning?: string;
  /** Minimum expected duration in minutes. */
  readonly durationMin: number;
  /** Maximum expected duration in minutes (for a range display). */
  readonly durationMaxMin?: number;
  /** ID of the primary tool needed for this step. */
  readonly requiresTool?: string;
  /** ID of the primary material used in this step. */
  readonly requiresMaterial?: string;
  /** Mini-checklist items to verify before moving to the next step. */
  readonly checkpoints?: readonly string[];
}

// ─── Drying / waiting time ────────────────────────────────────────────────────

export interface DryingTime {
  /** The step number after which this wait applies. */
  readonly afterStep: number;
  /** Description (e.g. "Farba — pierwsza warstwa"). */
  readonly description: string;
  readonly minHours: number;
  readonly maxHours: number;
  /** Conditions affecting the time (e.g. "20°C, wilgotność 50%"). */
  readonly conditions?: string;
}

// ─── Cost rules ──────────────────────────────────────────────────────────────

export type CostRuleType =
  | 'fixed'           // fixed one-off cost (e.g. tool rental)
  | 'per_sqm'         // cost per m²
  | 'per_linear_m'    // cost per linear meter
  | 'per_item'        // cost per item
  | 'labor_estimate'; // labor rate estimate

export interface CostRule {
  readonly description: string;
  readonly type: CostRuleType;
  readonly amountMin: number;
  readonly amountMax: number;
  readonly unit?: string;
  readonly notes?: string;
  /** Whether this is a materials cost (vs labor). Default false = labor. */
  readonly isMaterialCost?: boolean;
}

// ─── Safety equipment ─────────────────────────────────────────────────────────

export interface SafetyEquipment {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly required: boolean;
  readonly notes?: string;
}

// ─── Visibility mode ─────────────────────────────────────────────────────────

/**
 * Controls how a job is presented to the user.
 *  safe_diy     — fully documented, safe for beginners, all steps shown
 *  caution      — doable but requires care; prominent warnings; steps shown
 *  overview_only — show info + cost estimate only; CTA points to hire professional
 */
export type VisibilityMode = 'safe_diy' | 'caution' | 'overview_only';

/** How messy the renovation gets. 1=minimal, 2=moderate, 3=heavy. */
export type MessLevel = 1 | 2 | 3;

// ─── Formula spec ─────────────────────────────────────────────────────────────

/**
 * Declarative formula spec — used by the formula builder as an alternative to
 * inline functions. Allows serialization and future remote config.
 */
export type FormulaSpec =
  | { type: 'coverage';    litersPerSqm: number }
  | { type: 'kgPerSqm';   kgPerSqm: number; coatFactor?: boolean }
  | { type: 'kgPerPack';  kgPerSqm: number; kgPerPack: number }
  | { type: 'tilePieces'; defaultWastePct?: number }
  | { type: 'linear';     key?: keyof MeasurementMap; factor?: number }
  | { type: 'fixed';      value: number }
  | { type: 'perItem';    key: string; fallback?: number };
