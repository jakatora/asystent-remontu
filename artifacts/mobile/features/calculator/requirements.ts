import type { CalculationResult, MaterialLineItem } from '@/types/domain';
import { getJobById } from '@/features/content/registry';
import { computeRawQuantity } from './engine';

/** Old JSON snapshots do not retain inline formula functions. Resolve by stable ID. */
export function getRequiredQuantity(line: MaterialLineItem, calc: CalculationResult): number {
  if (Number.isFinite(line.rawQuantity) && line.rawQuantity! >= 0) return line.rawQuantity!;
  const definition = getJobById(calc.jobId)?.materials.find(material => material.id === line.material.id);
  return definition ? Math.max(0, computeRawQuantity(definition, calc.measurements)) : line.quantity;
}
