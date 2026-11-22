import type { CalculationResult } from '@/types/domain';
import type { MaterialCategory, QualityTier } from '@/types/pricing';

export function projectQualityTier(calc: CalculationResult | undefined, fallback: QualityTier = 'standard'): MaterialCategory {
  const tier = calc?.pricingQualityTier;
  if(tier==='custom')return 'standard';
  return tier === 'economy' || tier === 'standard' || tier === 'better' ? tier : fallback === 'custom' ? 'standard' : fallback;
}

export function wizardQualityTier(budget: string | null): MaterialCategory {
  return budget === 'premium' ? 'better' : budget === 'economy' ? 'economy' : 'standard';
}
