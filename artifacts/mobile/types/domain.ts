// ─── Primitive domain types ───────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ProjectStatus = 'planning' | 'in-progress' | 'completed';
export type WarningLevel = 'info' | 'warning' | 'danger';
export type WarningCondition = 'always' | 'beginner' | 'large-area' | 'high-humidity' | 'large-cracks' | 'validation';
export type FormulaKey = string;

// ─── Category ─────────────────────────────────────────────────────────────────

export interface RenovationCategory {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  readonly jobCount: number;
}

// ─── Measurement input ────────────────────────────────────────────────────────

/**
 * Basic measurement input (backward-compatible).
 * For richer type info use `MeasurementInputDefinition` from types/engine.
 */
export interface MeasurementInput {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly placeholder: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly defaultValue?: number;
  readonly hint?: string;
  readonly required?: boolean;
}

// ─── Material item ────────────────────────────────────────────────────────────

import type { FormulaFn } from './calculator';
import type {
  RoundingRule,
  PackagingInfo,
  VisibilityMode,
  MessLevel,
  SafetyEquipment,
  StepGuide,
  DryingTime,
  CostRule,
  MaterialRequirement,
  ToolRequirement,
  MeasurementInputDefinition,
} from './engine';

/**
 * Basic material definition (backward-compatible).
 * For richer control use `MaterialRequirement` from types/engine.
 */
export interface MaterialItem {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly purchaseUnit?: string;
  readonly formulaKey: FormulaKey;
  /** Inline formula (overrides formulaKey if provided). */
  readonly formula?: FormulaFn;
  readonly pricePerUnit: number;
  readonly wasteFactor?: number;
  readonly roundingRule?: RoundingRule;
  readonly packaging?: PackagingInfo;
  readonly notes?: string;
  readonly brand?: string;
  readonly category?: string;
  readonly optional?: boolean;
}

// ─── Tool item ────────────────────────────────────────────────────────────────

export interface ToolItem {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly required: boolean;
  readonly rentable?: boolean;
  readonly estimatedRentCostPLN?: number;
  readonly estimatedBuyCostPLN?: number;
  readonly notes?: string;
  readonly safetyNote?: string;
}

// ─── Instruction step ─────────────────────────────────────────────────────────

export interface InstructionStep {
  readonly step: number;
  readonly title: string;
  readonly description: string;
  readonly tip?: string;
  readonly warning?: string;
  readonly durationMin: number;
  readonly durationMaxMin?: number;
  readonly requiresTool?: string;
  readonly requiresMaterial?: string;
  /** Mini checklist of things to verify before moving on. */
  readonly checkpoints?: readonly string[];
  readonly surfaceMustBeDry?: boolean;
  readonly removeDustBeforeNext?: boolean;
}

// ─── Warning rule ─────────────────────────────────────────────────────────────

export interface WarningRule {
  readonly condition: WarningCondition;
  readonly message: string;
  readonly level: WarningLevel;
}

// ─── Quality check ────────────────────────────────────────────────────────────

export interface QualityCheck {
  readonly id: string;
  readonly description: string;
  readonly critical?: boolean;
}

// ─── Renovation job ───────────────────────────────────────────────────────────

export interface RenovationJob {
  // ── Identity ──────────────────────────────────────────────────────────────
  readonly id: string;
  /** URL-safe slug, e.g. "malowanie-scian". Defaults to id if not provided. */
  readonly slug?: string;
  readonly categoryId: string;
  readonly subcategory?: string;

  // ── Display ───────────────────────────────────────────────────────────────
  readonly name: string;
  /** Legacy full description (used in existing job files). */
  readonly description: string;
  /** ≤ 100 chars — shown in job list cards. */
  readonly shortDescription?: string;
  /** Plain-language explanation for complete beginners. */
  readonly beginnerFriendlyDescription?: string;
  readonly coverIcon: string;

  // ── Classification ────────────────────────────────────────────────────────
  readonly difficulty: Difficulty;
  readonly riskLevel: RiskLevel;
  /**
   * Controls what the app shows:
   *  safe_diy     — all steps, full guidance
   *  caution      — steps shown with prominent warnings
   *  overview_only — no step guide; recommend professional
   */
  readonly visibilityMode?: VisibilityMode;

  // ── Estimates ─────────────────────────────────────────────────────────────
  /** Approximate duration in working days for a DIY beginner. */
  readonly estimatedDays: number;
  /** How messy this job gets: 1=low, 2=moderate, 3=heavy (dust, debris, fumes). */
  readonly estimatedMessLevel?: MessLevel;

  // ── Warnings & safety ─────────────────────────────────────────────────────
  readonly warningRules: readonly WarningRule[];
  readonly safetyEquipment?: readonly SafetyEquipment[];

  // ── Measurement inputs ────────────────────────────────────────────────────
  /**
   * Measurement inputs — use `MeasurementInputDefinition[]` for rich type info,
   * or `MeasurementInput[]` for backward compat. Both are assignable.
   */
  readonly measurementInputs: readonly (MeasurementInput | MeasurementInputDefinition)[];

  // ── Materials & tools ─────────────────────────────────────────────────────
  /**
   * Use `MaterialRequirement[]` for new jobs (supports inline formulas, packaging,
   * rounding). `MaterialItem[]` accepted for backward compat.
   */
  readonly materials: readonly (MaterialItem | MaterialRequirement)[];

  /**
   * Use `ToolRequirement[]` for new jobs. `ToolItem[]` accepted for backward compat.
   */
  readonly tools: readonly (ToolItem | ToolRequirement)[];

  // ── Steps ─────────────────────────────────────────────────────────────────
  /** Legacy step list (existing job files). New jobs should use workSteps + preparationSteps. */
  readonly instructions: readonly InstructionStep[];
  /** Rich preparation steps (new). */
  readonly preparationSteps?: readonly StepGuide[];
  /** Rich main work steps (new). */
  readonly workSteps?: readonly StepGuide[];
  /** Cleanup instructions after work is done. */
  readonly cleanupSteps?: readonly string[];
  /** Drying/waiting times between steps. */
  readonly dryingTimes?: readonly DryingTime[];

  // ── Quality ───────────────────────────────────────────────────────────────
  readonly commonMistakes: readonly string[];
  readonly qualityChecklist: readonly QualityCheck[];

  // ── Cost ──────────────────────────────────────────────────────────────────
  /** Supplemental cost rules (labor rates, rental costs, etc.). */
  readonly costRules?: readonly CostRule[];

  // ── Professional ──────────────────────────────────────────────────────────
  readonly hireProfessionalRecommended: boolean;
  readonly hireProfessionalReason?: string;

  // ── Content extensions ───────────────────────────────────────────────────
  readonly manufacturerPriorityNote?: string;
  readonly productDependentRules?: readonly string[];
  readonly adhesiveApplicationMode?: string;
  readonly expansionGapNote?: string;
  readonly surfaceMustBeDryNote?: string;
  readonly removeDustBeforeFinishNote?: string;

  // ── Metadata ──────────────────────────────────────────────────────────────
  readonly tags?: readonly string[];
  readonly deprecated?: boolean;
  readonly deprecatedReason?: string;
  readonly supersededBy?: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export type PhotoType = 'before' | 'during' | 'after';
export type ActivityAction = 'created' | 'status_changed' | 'checklist_completed' | 'photo_added' | 'shopping_generated' | 'note_updated' | 'edited';

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly jobId: string;
  readonly jobName: string;
  readonly categoryId: string;
  readonly measurements: Record<string, number>;
  readonly calculationResult?: CalculationResult;
  readonly status: ProjectStatus;
  readonly totalBudget?: number;
  readonly actualCost?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly notes?: string;
  readonly syncedAt?: string;
  readonly roomName?: string;
  readonly roomWidth?: number;
  readonly roomLength?: number;
  readonly roomHeight?: number;
}

export interface ProjectPhoto {
  readonly id: string;
  readonly projectId: string;
  readonly uri: string;
  readonly photoType: PhotoType;
  readonly caption?: string;
  readonly createdAt: string;
}

export interface ChecklistItem {
  readonly id: string;
  readonly projectId: string;
  readonly stepIndex: number;
  readonly title: string;
  readonly description?: string;
  readonly completed: boolean;
  readonly completedAt?: string;
  readonly createdAt: string;
}

export interface ProjectActivity {
  readonly id: string;
  readonly projectId: string;
  readonly actionType: ActivityAction;
  readonly description: string;
  readonly createdAt: string;
}

// ─── Calculation ──────────────────────────────────────────────────────────────

export interface MaterialLineItem {
  readonly material: MaterialItem | MaterialRequirement;
  readonly quantity: number;
  /** Quantity converted to purchase units (packages), if packaging is defined. */
  readonly packs?: number;
  readonly cost: number;
}

export interface CalculationResult {
  readonly jobId: string;
  readonly measurements: Record<string, number>;
  readonly materials: readonly MaterialLineItem[];
  readonly totalCost: number;
  readonly totalDays: number;
  readonly warnings: readonly WarningRule[];
}

export type ShoppingItemType = 'material' | 'tool';
export type ShoppingTier = 'economy' | 'standard' | 'premium';

export interface ShoppingItem {
  readonly id: string;
  readonly projectId: string;
  readonly materialId: string;
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly packs?: number;
  readonly purchaseUnit?: string;
  readonly estimatedPrice: number;
  readonly purchased: boolean;
  readonly owned: boolean;
  readonly itemType: ShoppingItemType;
  readonly tier: ShoppingTier;
  readonly category?: string;
  readonly customPrice?: number;
  readonly customQuantity?: number;
  readonly notes?: string;
  readonly createdAt: string;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetEstimate {
  readonly materialsMin: number;
  readonly materialsMax: number;
  readonly laborMin: number;
  readonly laborMax: number;
  readonly totalMin: number;
  readonly totalMax: number;
  readonly currency: 'PLN';
}
