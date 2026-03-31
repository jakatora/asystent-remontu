// ─── Main type barrel ─────────────────────────────────────────────────────────
// Import everything from here — do NOT import directly from sub-files in screens.

export type {
  Difficulty,
  RiskLevel,
  ProjectStatus,
  WarningLevel,
  WarningCondition,
  FormulaKey,
  RenovationCategory,
  MeasurementInput,
  MaterialItem,
  ToolItem,
  InstructionStep,
  WarningRule,
  QualityCheck,
  RenovationJob,
  Project,
  MaterialLineItem,
  CalculationResult,
  ShoppingItem,
  BudgetEstimate,
} from './domain';

export type {
  MeasurementMap,
  FormulaFn,
  FormulaRegistry,
  CalculatorEngine,
  ShoppingListGenerator,
  BudgetEstimator,
  WarningResolver,
  WarningContext,
} from './calculator';

export type {
  ProjectRow,
  ShoppingItemRow,
  OnboardingRow,
  SchemaVersionRow,
} from './db';

export type {
  InputType,
  SelectOption,
  MeasurementInputDefinition,
  RoundingRule,
  PackagingInfo,
  MaterialRequirement,
  ToolRequirement,
  StepPhase,
  StepGuide,
  DryingTime,
  CostRuleType,
  CostRule,
  SafetyEquipment,
  VisibilityMode,
  MessLevel,
  FormulaSpec,
} from './engine';

export type {
  RoomType,
  Room,
  ExperienceLevel,
  PreferredUnit,
  UserPreference,
  SavedCalculation,
} from './user';

export { DEFAULT_USER_PREFERENCES } from './user';

export type {
  MaterialExplanationContext,
  MaterialExplanationFn,
  MaterialExplanation,
  MaterialLineItemDetail,
  CalculationResultDetail,
  JobCalculatorConfig,
} from './calculation';
