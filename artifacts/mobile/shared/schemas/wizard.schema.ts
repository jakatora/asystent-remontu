import { z } from 'zod';

// ─── Wizard step 1: project name ───────────────────────────────────────────

export const WizardNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Wpisz nazwę projektu')
    .max(100, 'Maksymalnie 100 znaków')
    .trim(),
});

export type WizardNameData = z.infer<typeof WizardNameSchema>;

// ─── Wizard step 2: category ────────────────────────────────────────────────

export const WizardCategorySchema = z.object({
  categoryId: z.string().min(1, 'Wybierz kategorię'),
});

export type WizardCategoryData = z.infer<typeof WizardCategorySchema>;

// ─── Wizard step 3: job ──────────────────────────────────────────────────────

export const WizardJobSchema = z.object({
  jobId: z.string().min(1, 'Wybierz rodzaj pracy'),
});

export type WizardJobData = z.infer<typeof WizardJobSchema>;

// ─── Wizard step 4: measurements ────────────────────────────────────────────

export const WizardMeasurementsSchema = z.object({
  measurements: z
    .record(z.string(), z.coerce.number().nonnegative('Wartość musi być nieujemna'))
    .refine(
      (m) => Object.values(m).every((v) => isFinite(v)),
      'Wszystkie wartości muszą być liczbami'
    ),
});

export type WizardMeasurementsData = z.infer<typeof WizardMeasurementsSchema>;

// ─── Full wizard data ────────────────────────────────────────────────────────

export const WizardSchema = WizardNameSchema
  .merge(WizardCategorySchema)
  .merge(WizardJobSchema)
  .merge(WizardMeasurementsSchema);

export type WizardData = z.infer<typeof WizardSchema>;
