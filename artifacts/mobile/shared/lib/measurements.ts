import type { RenovationJob } from '@/types/domain';
import { parseDecimal } from './number';

export function parseMeasurements(job: RenovationJob, raw: Readonly<Record<string, string | undefined>>) {
  const values: Record<string, number> = {};
  const errors: { label: string; id: string; min?: number; max?: number }[] = [];
  for (const input of job.measurementInputs) {
    const text = raw[input.id]?.trim() ?? '';
    if (!text && input.defaultValue === undefined && input.required === false) continue;
    const value = text ? parseDecimal(text) : input.defaultValue;
    if (value === undefined || !Number.isFinite(value) ||
      (input.min !== undefined ? value < input.min : value <= 0) ||
      (input.max !== undefined && value > input.max) ||
      ('inputType' in input && input.inputType === 'count' && !Number.isInteger(value))) {
      errors.push({ label: input.label, id: input.id, min: input.min, max: input.max });
    } else values[input.id] = value;
  }
  return { values, errors };
}
