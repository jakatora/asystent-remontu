import { getProductPhoto } from '@/data/products/photos';
import type { CalculationResult, MaterialLineItem } from '@/types/domain';
import { resolveMaterialQuantity } from './quantity';
import { getMaterialsForJob } from './registry';

export function getMaterialPhotoPreviews(calc: CalculationResult) {
  const candidates = new Map<MaterialLineItem, { uri: string; name: string } | null>();
  for (const reference of getMaterialsForJob(calc.jobId, 'standard', calc.measurements)) {
    let match: ReturnType<typeof resolveMaterialQuantity>;
    try {
      match = resolveMaterialQuantity(reference, calc);
    } catch {
      // Old snapshots can lack measurements needed to recompute raw quantities.
      // The optional photo must not prevent the saved materials from rendering.
      continue;
    }
    if (!match || match.quantity <= 0) continue;
    const { source } = match;
    if (
      ('ean' in source.material && source.material.ean) ||
      ('gtin' in source.material && source.material.gtin) ||
      ('packageFamily' in source.material && source.material.packageFamily)
    ) continue;

    const uri = getProductPhoto(reference);
    candidates.set(source, !candidates.has(source) && uri ? { uri, name: reference.productLabel } : null);
  }
  return candidates;
}
