import type { CalculationResult, MaterialLineItem } from '@/types/domain';
import { getJobById } from '@/features/content/registry';
import { computeRawQuantity } from './engine';

/** Old JSON snapshots do not retain inline formula functions. Resolve by stable ID. */
export function getRequiredQuantity(line: MaterialLineItem, calc: CalculationResult): number {
  // Historical self-leveling snapshots have rawQuantity=1 because byThickness
  // fell back to the constant formula. Restore demand from their saved measures.
  if (calc.jobId === 'self-leveling' && line.material.id === 'leveling-compound') {
    const definition = getJobById(calc.jobId)?.materials.find(material => material.id === line.material.id);
    if (definition) return Math.max(0, computeRawQuantity(definition, calc.measurements));
  }
  // Historical painting snapshots stored one 20 m² sheet as "1 m²".
  // Preserve the purchased package count while restoring the real base unit.
  if (calc.jobId === 'paint-walls' && line.material.id === 'drop-cloth' && line.material.packaging?.size === 1) return (line.packs ?? line.quantity) * 20;
  // Old tape snapshots use rolls; do not recompute them from new default inputs.
  if (calc.jobId === 'paint-walls' && line.material.id === 'painters-tape' && line.material.unit === 'rolka') return line.rawQuantity ?? line.quantity;
  if (Number.isFinite(line.rawQuantity) && line.rawQuantity! >= 0) return line.rawQuantity!;
  const definition = getJobById(calc.jobId)?.materials.find(material => material.id === line.material.id);
  return definition ? Math.max(0, computeRawQuantity(definition, calc.measurements)) : line.quantity;
}
