import type {
  ContractorPlanDefinition,
  ContractorPlanId,
  ContractorEntitlementSet,
  ContractorPlanAssignment,
  ContractorAccessState,
  ContractorUsageCounter,
  UsageVsLimit,
  UsageCounterKey,
  AssignmentState,
  EntitlementKey,
  MonetizationFeatureFlags,
  PlanComparisonColumn,
  PlanComparisonFeature,
} from '@/types/contractor-plans';
import { USAGE_COUNTER_LABELS, DEFAULT_MONETIZATION_FLAGS, ENTITLEMENT_LABELS } from '@/types/contractor-plans';
import { SEED_PLANS } from './plan-seed-data';

const FALLBACK_FREE_ENTITLEMENTS: ContractorEntitlementSet = SEED_PLANS[0].entitlements;

export function resolveAccessState(
  assignment: ContractorPlanAssignment | null,
  plan: ContractorPlanDefinition | null,
  overrides?: Partial<ContractorEntitlementSet>,
): ContractorAccessState {
  const planId = assignment?.planId ?? 'free';
  const state = assignment?.state ?? 'active';
  const entitlements = plan?.entitlements ?? FALLBACK_FREE_ENTITLEMENTS;

  const resolved: ContractorEntitlementSet = overrides
    ? { ...entitlements, ...overrides }
    : entitlements;

  const isFullyActive = state === 'active' || state === 'manually_assigned';
  const isTrialOrGrace = state === 'trial' || state === 'grace_period';
  const isSuspendedOrExpired = state === 'suspended' || state === 'expired' || state === 'inactive';

  return {
    contractorId: assignment?.contractorId ?? '',
    currentPlanId: planId,
    assignmentState: state,
    entitlements: resolved,
    isFullyActive,
    canUseVisibilityFeatures: isFullyActive || isTrialOrGrace,
    canUsePaidFeatures: isFullyActive && planId !== 'free',
    suspensionReason: isSuspendedOrExpired ? `Plan w stanie: ${state}` : undefined,
    nextRenewalDate: assignment?.endDate,
  };
}

export function checkEntitlement(
  access: ContractorAccessState,
  key: EntitlementKey,
  flags: MonetizationFeatureFlags = DEFAULT_MONETIZATION_FLAGS,
): boolean {
  if (!flags.enableContractorPlans) return true;
  if (!access.canUseVisibilityFeatures && key !== 'canAppearInSearch') return false;

  const value = access.entitlements[key];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}

export function checkNumericEntitlement(
  access: ContractorAccessState,
  key: EntitlementKey,
  currentUsage: number,
  flags: MonetizationFeatureFlags = DEFAULT_MONETIZATION_FLAGS,
): { allowed: boolean; limit: number; current: number; remaining: number } {
  if (!flags.enablePlanBasedLimits) return { allowed: true, limit: 999, current: currentUsage, remaining: 999 };
  const limit = access.entitlements[key] as number;
  return {
    allowed: currentUsage < limit,
    limit,
    current: currentUsage,
    remaining: Math.max(0, limit - currentUsage),
  };
}

export function computeUsageVsLimits(
  counters: ContractorUsageCounter[],
): UsageVsLimit[] {
  return counters.map((c) => {
    const percentage = c.limitValue > 0 ? Math.round((c.currentValue / c.limitValue) * 100) : 0;
    return {
      key: c.counterKey,
      label: USAGE_COUNTER_LABELS[c.counterKey] ?? c.counterKey,
      current: c.currentValue,
      limit: c.limitValue,
      percentage: Math.min(percentage, 100),
      isAtLimit: c.currentValue >= c.limitValue && c.limitValue > 0,
      isOverLimit: c.currentValue > c.limitValue && c.limitValue > 0,
    };
  });
}

export function buildPlanComparison(
  plans: ContractorPlanDefinition[],
  currentPlanId?: ContractorPlanId,
): PlanComparisonColumn[] {
  return plans.filter((p) => p.status === 'active').map((plan) => {
    const features: PlanComparisonFeature[] = [
      { label: 'Widocznosc w wyszukiwarce', value: plan.entitlements.canAppearInSearch, icon: 'search' },
      { label: 'Maks. zapytan', value: plan.entitlements.maxActiveRequestsPlaceholder, icon: 'layers' },
      { label: 'Zdjecia w galerii', value: plan.entitlements.maxProfileGalleryItemsPlaceholder, icon: 'image' },
      { label: 'Specjalizacje', value: plan.entitlements.maxSpecialtiesPlaceholder, icon: 'briefcase' },
      { label: 'Obszary uslug', value: plan.entitlements.maxServiceAreasPlaceholder, icon: 'globe' },
      { label: 'Mozliwosc promocji', value: plan.entitlements.canBePromoted, icon: 'star' },
      { label: 'Promocja w miescie', value: plan.entitlements.canUseCityPromotion, icon: 'map-pin' },
      { label: 'Wyroznienie', value: plan.entitlements.canBeFeatured, icon: 'award' },
      { label: 'Szczegoly leadow', value: plan.entitlements.canAccessLeadDetailsPlaceholder, icon: 'eye' },
      { label: 'Statystyki', value: plan.entitlements.canSeeAdvancedStatsPlaceholder, icon: 'bar-chart-2' },
      { label: 'Priorytetowe wsparcie', value: plan.entitlements.canUsePrioritySupportPlaceholder, icon: 'headphones' },
    ];

    const priceLabel = plan.monthlyPricePlaceholder === 0
      ? 'Za darmo'
      : `${plan.monthlyPricePlaceholder} zl/mies.`;

    return {
      planId: plan.id,
      name: plan.name,
      price: priceLabel,
      isRecommended: plan.id === 'pro',
      features,
    };
  });
}

export function getUnavailableEntitlements(
  access: ContractorAccessState,
  flags: MonetizationFeatureFlags = DEFAULT_MONETIZATION_FLAGS,
): { key: EntitlementKey; label: string }[] {
  if (!flags.enableContractorPlans) return [];

  const result: { key: EntitlementKey; label: string }[] = [];
  const entries = Object.entries(access.entitlements) as [EntitlementKey, boolean | number][];

  for (const [key, value] of entries) {
    if (typeof value === 'boolean' && !value) {
      result.push({ key, label: ENTITLEMENT_LABELS[key] });
    }
  }
  return result;
}

export function canContractorUsePromotion(
  access: ContractorAccessState,
  scope: 'city' | 'category' | 'stage',
  flags: MonetizationFeatureFlags = DEFAULT_MONETIZATION_FLAGS,
): boolean {
  if (!flags.enableContractorPlans) return true;
  if (!access.canUsePaidFeatures) return false;

  switch (scope) {
    case 'city':
      return access.entitlements.canUseCityPromotion && flags.enableCityPromotion;
    case 'category':
      return access.entitlements.canUseCategoryPromotion && flags.enableCategoryPromotion;
    case 'stage':
      return access.entitlements.canUseStagePromotion && flags.enableStagePromotion;
    default:
      return false;
  }
}

export function isAssignmentActive(state: AssignmentState): boolean {
  return state === 'active' || state === 'trial' || state === 'grace_period' || state === 'manually_assigned';
}

export function getUpgradeSuggestion(currentPlanId: ContractorPlanId): ContractorPlanId | null {
  switch (currentPlanId) {
    case 'free': return 'starter';
    case 'starter': return 'pro';
    case 'pro': return 'featured';
    case 'featured': return 'enterprise';
    default: return null;
  }
}

export function initializeUsageCounters(
  entitlements: ContractorEntitlementSet,
): { key: UsageCounterKey; limit: number }[] {
  return [
    { key: 'promoted_slots_used', limit: entitlements.maxPromotionSlots },
    { key: 'categories_sponsored', limit: entitlements.maxCategorySponsorships },
    { key: 'lead_unlocks_placeholder', limit: entitlements.maxActiveRequestsPlaceholder },
    { key: 'visible_service_areas', limit: entitlements.maxServiceAreasPlaceholder },
    { key: 'gallery_images', limit: entitlements.maxProfileGalleryItemsPlaceholder },
    { key: 'open_request_responses_placeholder', limit: entitlements.maxActiveRequestsPlaceholder },
  ];
}
