import { z } from 'zod';

// ─── Measurement input definition ─────────────────────────────────────────────

export const InputTypeSchema = z.enum([
  'length', 'area', 'count', 'coverage', 'packSize', 'percent', 'select', 'dimension',
]);

export const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const MeasurementInputDefinitionSchema = z.object({
  id:           z.string(),
  label:        z.string(),
  unit:         z.string(),
  inputType:    InputTypeSchema,
  placeholder:  z.string(),
  defaultValue: z.number().optional(),
  min:          z.number().optional(),
  max:          z.number().optional(),
  step:         z.number().optional(),
  hint:         z.string().optional(),
  required:     z.boolean().optional(),
  options:      z.array(SelectOptionSchema).optional(),
  bindKey:      z.string().optional(),
});

// ─── Rounding / packaging ─────────────────────────────────────────────────────

export const RoundingRuleSchema = z.enum(['none', 'ceil', 'round', 'packSize']);

export const PackagingInfoSchema = z.object({
  size:         z.number().positive(),
  label:        z.string(),
  purchaseUnit: z.string(),
});

// ─── Step guide ───────────────────────────────────────────────────────────────

export const StepPhaseSchema = z.enum([
  'preparation', 'work', 'drying', 'cleanup', 'quality-check',
]);

export const StepGuideSchema = z.object({
  step:              z.number().int().positive(),
  phase:             StepPhaseSchema,
  title:             z.string(),
  description:       z.string(),
  tip:               z.string().optional(),
  warning:           z.string().optional(),
  durationMin:       z.number().nonnegative(),
  durationMaxMin:    z.number().nonnegative().optional(),
  requiresTool:      z.string().optional(),
  requiresMaterial:  z.string().optional(),
  checkpoints:       z.array(z.string()).optional(),
});

// ─── Drying time ─────────────────────────────────────────────────────────────

export const DryingTimeSchema = z.object({
  afterStep:   z.number().int().nonnegative(),
  description: z.string(),
  minHours:    z.number().nonnegative(),
  maxHours:    z.number().nonnegative(),
  conditions:  z.string().optional(),
});

// ─── Cost rule ────────────────────────────────────────────────────────────────

export const CostRuleTypeSchema = z.enum([
  'fixed', 'per_sqm', 'per_linear_m', 'per_item', 'labor_estimate',
]);

export const CostRuleSchema = z.object({
  description:    z.string(),
  type:           CostRuleTypeSchema,
  amountMin:      z.number().nonnegative(),
  amountMax:      z.number().nonnegative(),
  unit:           z.string().optional(),
  notes:          z.string().optional(),
  isMaterialCost: z.boolean().optional(),
});

// ─── Safety equipment ─────────────────────────────────────────────────────────

export const SafetyEquipmentSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  icon:     z.string(),
  required: z.boolean(),
  notes:    z.string().optional(),
});

// ─── Visibility mode ─────────────────────────────────────────────────────────

export const VisibilityModeSchema = z.enum(['safe_diy', 'caution', 'overview_only']);

// ─── Material requirement ─────────────────────────────────────────────────────

export const MaterialRequirementSchema = z.object({
  id:           z.string(),
  name:         z.string(),
  unit:         z.string(),
  purchaseUnit: z.string().optional(),
  formulaKey:   z.string().optional(),
  wasteFactor:  z.number().positive().optional(),
  roundingRule: RoundingRuleSchema.optional(),
  packaging:    PackagingInfoSchema.optional(),
  pricePerUnit: z.number().nonnegative(),
  notes:        z.string().optional(),
  brand:        z.string().optional(),
  category:     z.string().optional(),
  optional:     z.boolean().optional(),
});

// ─── Tool requirement ─────────────────────────────────────────────────────────

export const ToolRequirementSchema = z.object({
  id:                    z.string(),
  name:                  z.string(),
  icon:                  z.string(),
  required:              z.boolean(),
  rentable:              z.boolean().optional(),
  estimatedRentCostPLN:  z.number().nonnegative().optional(),
  estimatedBuyCostPLN:   z.number().nonnegative().optional(),
  notes:                 z.string().optional(),
  safetyNote:            z.string().optional(),
});

// ─── User preference ─────────────────────────────────────────────────────────

export const ExperienceLevelSchema = z.enum(['beginner', 'intermediate', 'experienced']);

export const UserPreferenceSchema = z.object({
  id:                   z.string(),
  experienceLevel:      ExperienceLevelSchema,
  showBeginnersHints:   z.boolean(),
  showWarningsExpanded: z.boolean(),
  defaultWastePct:      z.number().min(0).max(50),
  preferredUnit:        z.literal('metric'),
  currency:             z.literal('PLN'),
  bookmarkedJobIds:     z.array(z.string()),
  includeLabor:         z.boolean(),
  createdAt:            z.string(),
  updatedAt:            z.string(),
});

// ─── Saved calculation ────────────────────────────────────────────────────────

export const SavedCalculationSchema = z.object({
  id:                 z.string(),
  projectId:          z.string(),
  jobId:              z.string(),
  label:              z.string(),
  measurements:       z.record(z.number()),
  totalMaterialsCost: z.number().nonnegative(),
  totalBudgetMin:     z.number().nonnegative(),
  totalBudgetMax:     z.number().nonnegative(),
  currency:           z.literal('PLN'),
  materialCount:      z.number().int().nonnegative(),
  createdAt:          z.string(),
});

// ─── Room ─────────────────────────────────────────────────────────────────────

export const RoomTypeSchema = z.enum([
  'bedroom', 'living-room', 'kitchen', 'bathroom', 'toilet',
  'hallway', 'balcony', 'garage', 'other',
]);

export const RoomSchema = z.object({
  id:             z.string(),
  projectId:      z.string(),
  name:           z.string().min(1).max(60),
  type:           RoomTypeSchema,
  lengthM:        z.number().positive(),
  widthM:         z.number().positive(),
  heightM:        z.number().positive().optional(),
  floorAreaM2:    z.number().positive().optional(),
  wallAreaM2:     z.number().positive().optional(),
  ceilingAreaM2:  z.number().positive().optional(),
  windowCount:    z.number().int().nonnegative().optional(),
  doorCount:      z.number().int().nonnegative().optional(),
  notes:          z.string().optional(),
  createdAt:      z.string(),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type MaterialRequirementInput = z.infer<typeof MaterialRequirementSchema>;
export type ToolRequirementInput     = z.infer<typeof ToolRequirementSchema>;
export type UserPreferenceInput      = z.infer<typeof UserPreferenceSchema>;
export type SavedCalculationInput    = z.infer<typeof SavedCalculationSchema>;
export type RoomInput                = z.infer<typeof RoomSchema>;
