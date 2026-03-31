// ─── Primitive domain types ────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ProjectStatus = 'planning' | 'in-progress' | 'completed';
export type WarningLevel = 'info' | 'warning' | 'danger';
export type WarningCondition = 'always' | 'beginner' | 'large-area' | 'high-humidity' | string;
export type FormulaKey = string;

// ─── Category ──────────────────────────────────────────────────────────────

export interface RenovationCategory {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  readonly jobCount: number;
}

// ─── Measurement input ─────────────────────────────────────────────────────

export interface MeasurementInput {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly placeholder: string;
  readonly min?: number;
  readonly max?: number;
  readonly hint?: string;
  readonly required?: boolean;
}

// ─── Material ──────────────────────────────────────────────────────────────

export interface MaterialItem {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly formulaKey: FormulaKey;
  readonly pricePerUnit: number;
  readonly wasteFactor?: number;
  readonly notes?: string;
  readonly brand?: string;
  readonly category?: string;
}

// ─── Tool ──────────────────────────────────────────────────────────────────

export interface ToolItem {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly required: boolean;
  readonly rentable?: boolean;
  readonly notes?: string;
}

// ─── Instruction step ──────────────────────────────────────────────────────

export interface InstructionStep {
  readonly step: number;
  readonly title: string;
  readonly description: string;
  readonly tip?: string;
  readonly warning?: string;
  readonly durationMin: number;
  readonly requiresTool?: string;
}

// ─── Warning rule ──────────────────────────────────────────────────────────

export interface WarningRule {
  readonly condition: WarningCondition;
  readonly message: string;
  readonly level: WarningLevel;
}

// ─── Quality check ─────────────────────────────────────────────────────────

export interface QualityCheck {
  readonly id: string;
  readonly description: string;
  readonly critical?: boolean;
}

// ─── Renovation job ────────────────────────────────────────────────────────

export interface RenovationJob {
  readonly id: string;
  readonly categoryId: string;
  readonly name: string;
  readonly description: string;
  readonly difficulty: Difficulty;
  readonly riskLevel: RiskLevel;
  readonly estimatedDays: number;
  readonly coverIcon: string;
  readonly warningRules: readonly WarningRule[];
  readonly measurementInputs: readonly MeasurementInput[];
  readonly materials: readonly MaterialItem[];
  readonly tools: readonly ToolItem[];
  readonly instructions: readonly InstructionStep[];
  readonly commonMistakes: readonly string[];
  readonly qualityChecklist: readonly QualityCheck[];
  readonly hireProfessionalRecommended: boolean;
  readonly hireProfessionalReason?: string;
  readonly tags?: readonly string[];
}

// ─── Project ───────────────────────────────────────────────────────────────

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
}

// ─── Calculation ───────────────────────────────────────────────────────────

export interface MaterialLineItem {
  readonly material: MaterialItem;
  readonly quantity: number;
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

// ─── Shopping ──────────────────────────────────────────────────────────────

export interface ShoppingItem {
  readonly id: string;
  readonly projectId: string;
  readonly materialId: string;
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly estimatedPrice: number;
  readonly purchased: boolean;
  readonly notes?: string;
  readonly createdAt: string;
}

// ─── Budget ────────────────────────────────────────────────────────────────

export interface BudgetEstimate {
  readonly materialsMin: number;
  readonly materialsMax: number;
  readonly laborMin: number;
  readonly laborMax: number;
  readonly totalMin: number;
  readonly totalMax: number;
  readonly currency: 'PLN';
}
