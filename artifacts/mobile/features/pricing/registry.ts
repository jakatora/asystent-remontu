import type { LaborPriceReference, MaterialPriceReference, MaterialCategory } from '@/types/pricing';
import { LABOR_PRICES, MATERIAL_PRICES, getLaborIdsForJob, getMaterialIdsForJob } from '@/data/prices';
import { BASELINE_REGION } from '@/data/prices/regions';
import { tileSpacerReferences } from './tileSpacers';

const LABOR_BY_ID = new Map<string, LaborPriceReference>(
  LABOR_PRICES.map((l) => [l.id, l])
);

const MATERIAL_BY_ID = new Map<string, MaterialPriceReference>(
  MATERIAL_PRICES.map((m) => [m.id, m])
);

const MATERIAL_BY_TYPE = new Map<string, MaterialPriceReference[]>();
for (const m of MATERIAL_PRICES) {
  const list = MATERIAL_BY_TYPE.get(m.materialType) ?? [];
  list.push(m);
  MATERIAL_BY_TYPE.set(m.materialType, list);
}

export function getLaborPrice(id: string): LaborPriceReference | undefined {
  return LABOR_BY_ID.get(id);
}

export function getMaterialPrice(id: string): MaterialPriceReference | undefined {
  return MATERIAL_BY_ID.get(id);
}

export function getMaterialsByType(type: string): MaterialPriceReference[] {
  return MATERIAL_BY_TYPE.get(type) ?? [];
}

export function getMaterialsByCategory(category: MaterialCategory): MaterialPriceReference[] {
  return MATERIAL_PRICES.filter((m) => m.category === category);
}

export function getLaborForJob(jobId: string, regionCode?: string): LaborPriceReference[] {
  const ids = getLaborIdsForJob(jobId);
  const dopasowane: LaborPriceReference[] = [];
  const bazowe: LaborPriceReference[] = [];
  for (const id of ids) {
    const ref = LABOR_BY_ID.get(id);
    if (!ref) continue;
    if (!regionCode || ref.regionCode === regionCode) dopasowane.push(ref);
    if (ref.regionCode === BASELINE_REGION.code) bazowe.push(ref);
  }
  // FAIL-OPEN NA REGION: mamy skompletowany zestaw stawek tylko dla regionu bazowego.
  // Filtr po dokladnym `regionCode` oddawal dla Warszawy PUSTA LISTE, przez co wycena
  // po cichu pokazywala same materialy - czyli kwote bez najdrozszej czesci remontu.
  // Regionalna roznice nakladamy mnoznikiem (`RegionProfile.laborMultiplier`) w silniku.
  return dopasowane.length > 0 ? dopasowane : bazowe;
}

export function getMaterialsForJob(jobId: string, tier: MaterialCategory, measurements?: Readonly<Record<string, number>>): MaterialPriceReference[] {
  const ids = getMaterialIdsForJob(jobId, tier);
  const results: MaterialPriceReference[] = [];
  for (const id of ids) {
    const ref = MATERIAL_BY_ID.get(id);
    if (ref) results.push(ref);
  }
  // A different price tier must not omit the required basin drain or explicit
  // extra hoses. Same exact references; quantities still come from calculator.
  // source: https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/
  if (jobId === 'sink-installation') {
    for (const id of ['mat-basin-trap-mcalpine-whb1-32', 'mat-hose-braided-invena-3-8-30']) {
      const ref = MATERIAL_BY_ID.get(id);
      if (ref && !results.some(row => row.id === id)) results.push(ref);
    }
  }
  return measurements ? tileSpacerReferences(results, jobId, measurements) : results;
}

export function hasLaborData(jobId: string): boolean {
  return getLaborIdsForJob(jobId).length > 0;
}

export function hasMaterialData(jobId: string): boolean {
  return getMaterialIdsForJob(jobId, 'standard').length > 0;
}

export function getLatestUpdateDate(): string {
  let latest = '';
  for (const l of LABOR_PRICES) {
    if (l.lastUpdated > latest) latest = l.lastUpdated;
  }
  for (const m of MATERIAL_PRICES) {
    if (m.lastUpdated > latest) latest = m.lastUpdated;
  }
  return latest;
}
