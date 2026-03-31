import { z } from 'zod';

// ─── Project status ─────────────────────────────────────────────────────────

export const ProjectStatusSchema = z.enum(['planning', 'in-progress', 'completed']);

// ─── Project create input (from wizard) ────────────────────────────────────

export const CreateProjectSchema = z.object({
  name: z
    .string({ required_error: 'Nazwa projektu jest wymagana' })
    .min(1, 'Wpisz nazwę projektu')
    .max(100, 'Nazwa może mieć maksymalnie 100 znaków')
    .trim(),
  jobId: z.string().min(1, 'Wybierz rodzaj pracy'),
  jobName: z.string().min(1),
  categoryId: z.string().min(1, 'Wybierz kategorię'),
  measurements: z.record(z.string(), z.number().nonnegative()),
  status: ProjectStatusSchema.default('planning'),
  totalBudget: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// ─── Project update input ───────────────────────────────────────────────────

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string().min(1),
  actualCost: z.number().nonnegative().optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// ─── Project record (full, from DB) ────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  jobId: z.string(),
  jobName: z.string(),
  categoryId: z.string(),
  measurements: z.record(z.string(), z.number()),
  calculationResult: z.unknown().optional(),
  status: ProjectStatusSchema,
  totalBudget: z.number().optional(),
  actualCost: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  notes: z.string().optional(),
  syncedAt: z.string().datetime().optional(),
});

export type ProjectData = z.infer<typeof ProjectSchema>;
