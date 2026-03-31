import { z } from 'zod';
import type { MeasurementInput } from '@/types/domain';

// ─── Runtime measurement validation from job definition ─────────────────────

export function buildMeasurementSchema(
  inputs: readonly MeasurementInput[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const input of inputs) {
    let field = z.coerce.number({
      invalid_type_error: `${input.label}: podaj liczbę`,
    });

    if (input.min !== undefined) {
      field = field.min(input.min, `${input.label}: minimum ${input.min} ${input.unit}`);
    }
    if (input.max !== undefined) {
      field = field.max(input.max, `${input.label}: maksimum ${input.max} ${input.unit}`);
    }

    shape[input.id] = input.required === false ? field.optional() : field;
  }

  return z.object(shape);
}
