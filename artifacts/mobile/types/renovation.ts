export type Difficulty = 'easy' | 'medium' | 'hard';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CategoryId =
  | 'paint'
  | 'primer'
  | 'wall-repair'
  | 'skim-coat'
  | 'wallpaper'
  | 'laminate'
  | 'vinyl'
  | 'floor-tiles'
  | 'waterproofing'
  | 'silicone'
  | 'skirting'
  | 'doors'
  | 'plumbing'
  | 'electrical'
  | 'high-risk';

export interface MeasurementInput {
  id: string;
  label: string;
  unit: string;
  placeholder: string;
  min?: number;
  max?: number;
  hint?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  formulaKey: string;
  pricePerUnit: number;
  notes?: string;
  brand?: string;
}

export interface ToolItem {
  id: string;
  name: string;
  icon: string;
  required: boolean;
  rentable?: boolean;
  notes?: string;
}

export interface InstructionStep {
  step: number;
  title: string;
  description: string;
  tip?: string;
  warning?: string;
  durationMin: number;
}

export interface WarningRule {
  condition: string;
  message: string;
  level: 'info' | 'warning' | 'danger';
}

export interface QualityCheck {
  id: string;
  description: string;
}

export interface RenovationJob {
  id: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  difficulty: Difficulty;
  riskLevel: RiskLevel;
  estimatedDays: number;
  coverIcon: string;
  warningRules: WarningRule[];
  measurementInputs: MeasurementInput[];
  materials: MaterialItem[];
  tools: ToolItem[];
  instructions: InstructionStep[];
  commonMistakes: string[];
  qualityChecklist: QualityCheck[];
  hireProfessionalRecommended: boolean;
  hireProfessionalReason?: string;
}

export interface RenovationCategory {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  color: string;
  jobCount: number;
}

export interface CalculationResult {
  jobId: string;
  measurements: Record<string, number>;
  materials: Array<{
    material: MaterialItem;
    quantity: number;
    cost: number;
  }>;
  totalCost: number;
  totalDays: number;
  warnings: WarningRule[];
}

export interface ShoppingItem {
  id: string;
  projectId: string;
  materialId: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  purchased: boolean;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  jobId: string;
  jobName: string;
  categoryId: CategoryId;
  measurements: Record<string, number>;
  calculationResult?: CalculationResult;
  status: 'planning' | 'in-progress' | 'completed';
  totalBudget?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}
