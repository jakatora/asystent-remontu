import type {
  PricedBudgetEstimate,
  LaborLineItem,
  MaterialLineItemPriced,
  PriceOverride,
  MaterialCategory,
  QualityTier,
} from '@/types/pricing';
import type { CalculationResult, RenovationJob } from '@/types/domain';
import { getLaborForJob, getMaterialsForJob } from './registry';
import { getRegionOrBaseline } from '@/data/prices/regions';
import { roundMoney } from '@/shared/lib/currency';

interface PricingInput {
  job: RenovationJob;
  calc: CalculationResult;
  regionCode: string;
  qualityTier: QualityTier;
  overrides: PriceOverride[];
}

export function computePricedBudget(input: PricingInput): PricedBudgetEstimate {
  const { job, calc, regionCode, qualityTier, overrides } = input;
  const region = getRegionOrBaseline(regionCode);
  const effectiveTier: MaterialCategory = qualityTier === 'custom' ? 'standard' : qualityTier;

  const overrideMap = new Map<string, number>();
  for (const ov of overrides) {
    overrideMap.set(`${ov.targetType}:${ov.targetId}`, ov.overridePrice);
  }

  const laborRefs = getLaborForJob(job.id, regionCode);
  const primaryArea = getPrimaryArea(calc);

  const laborDetails: LaborLineItem[] = laborRefs.map((ref) => {
    const overrideKey = `labor:${ref.id}`;
    const hasOverride = overrideMap.has(overrideKey);
    const overridePrice = overrideMap.get(overrideKey);

    const area = primaryArea;
    const costMin = roundMoney(hasOverride ? overridePrice! * area : ref.laborPriceMin * area);
    const costMax = roundMoney(hasOverride ? overridePrice! * area : ref.laborPriceMax * area);
    const costBaseline = roundMoney(hasOverride ? overridePrice! * area : ref.laborPriceBaseline * area);

    return {
      laborRef: ref,
      area,
      costMin,
      costMax,
      costBaseline,
      overridePrice: hasOverride ? overridePrice : undefined,
    };
  });

  const materialRefs = getMaterialsForJob(job.id, effectiveTier);
  const materialDetails: MaterialLineItemPriced[] = materialRefs.map((ref) => {
    const overrideKey = `material:${ref.id}`;
    const hasOverride = overrideMap.has(overrideKey);
    const effectivePrice = hasOverride ? overrideMap.get(overrideKey)! : ref.pricePerPackage;

    const quantity = getQuantityForMaterial(ref, calc, primaryArea);
    const packagesNeeded = ref.packageSize > 0
      ? Math.ceil(quantity / ref.packageSize)
      : Math.ceil(quantity);
    const totalCost = roundMoney(packagesNeeded * effectivePrice);

    return {
      materialRef: ref,
      quantity,
      packagesNeeded,
      totalCost,
      overridePrice: hasOverride ? overrideMap.get(overrideKey) : undefined,
    };
  });

  const toolsSubtotal = roundMoney(
    job.tools
      .filter((t) => t.required)
      .reduce((sum, t) => sum + (t.estimatedBuyCostPLN ?? 0), 0)
  );

  const materialsSubtotal = roundMoney(materialDetails.reduce((s, m) => s + m.totalCost, 0));
  const laborSubtotalMin = roundMoney(laborDetails.reduce((s, l) => s + l.costMin, 0));
  const laborSubtotalMax = roundMoney(laborDetails.reduce((s, l) => s + l.costMax, 0));

  const latestDate = getLatestDate(laborRefs, materialRefs);

  return {
    materialsSubtotal,
    laborSubtotalMin,
    laborSubtotalMax,
    toolsSubtotal,
    totalEstimateMin: roundMoney(materialsSubtotal + laborSubtotalMin + toolsSubtotal),
    totalEstimateMax: roundMoney(materialsSubtotal + laborSubtotalMax + toolsSubtotal),
    laborDetails,
    materialDetails,
    regionCode: region.code,
    regionLabel: region.label,
    qualityTier,
    lastUpdated: latestDate,
    currency: 'PLN',
  };
}

function getPrimaryArea(calc: CalculationResult): number {
  const m = calc.measurements;
  if (m.wallArea) return m.wallArea;
  if (m.floorArea) return m.floorArea;
  if (m.ceilingArea) return m.ceilingArea;
  if (m.area) return m.area;
  if (m.width && m.length) return m.width * m.length;
  if (m.width && m.height) return m.width * m.height;
  if (m.linearMeters) return m.linearMeters;
  if (m.perimeter) return m.perimeter;
  return Object.values(m).find((v) => typeof v === 'number' && v > 0) ?? 1;
}

function getQuantityForMaterial(
  ref: { packageUnit: string; pricePerM2?: number; pricePerMb?: number },
  calc: CalculationResult,
  primaryArea: number
): number {
  const unit = ref.packageUnit.toLowerCase();
  if (unit === 'm2' || ref.pricePerM2) return primaryArea;
  if (unit === 'mb' || ref.pricePerMb) {
    return calc.measurements.perimeter ?? calc.measurements.linearMeters ?? primaryArea;
  }
  return primaryArea;
}

function getLatestDate(
  laborRefs: { lastUpdated: string }[],
  materialRefs: { lastUpdated: string }[]
): string {
  let latest = '2026-04-01';
  for (const r of [...laborRefs, ...materialRefs]) {
    if (r.lastUpdated > latest) latest = r.lastUpdated;
  }
  return latest;
}
