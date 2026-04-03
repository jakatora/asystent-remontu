export type ContractorPlanId = 'free' | 'starter' | 'pro' | 'featured' | 'enterprise';

export type PlanStatus = 'active' | 'inactive' | 'deprecated';

export interface ContractorPlanDefinition {
  readonly id: ContractorPlanId;
  readonly name: string;
  readonly shortDescription: string;
  readonly monthlyPricePlaceholder: number;
  readonly yearlyPricePlaceholder: number;
  readonly status: PlanStatus;
  readonly displayOrder: number;
  readonly notes: string;
  readonly entitlements: ContractorEntitlementSet;
  readonly highlightFeatures: readonly string[];
  readonly badge?: string;
  readonly color: string;
}

export interface ContractorEntitlementSet {
  readonly canAppearInSearch: boolean;
  readonly canReceiveRequests: boolean;
  readonly maxActiveRequestsPlaceholder: number;
  readonly canBeFeatured: boolean;
  readonly canBePromoted: boolean;
  readonly canUseCityPromotion: boolean;
  readonly canUseCategoryPromotion: boolean;
  readonly canUseStagePromotion: boolean;
  readonly maxProfileGalleryItemsPlaceholder: number;
  readonly maxServiceAreasPlaceholder: number;
  readonly maxSpecialtiesPlaceholder: number;
  readonly canAccessLeadDetailsPlaceholder: boolean;
  readonly canSeeAdvancedStatsPlaceholder: boolean;
  readonly canUsePrioritySupportPlaceholder: boolean;
  readonly maxPromotionSlots: number;
  readonly maxCategorySponsorships: number;
}

export type EntitlementKey = keyof ContractorEntitlementSet;

export const ENTITLEMENT_LABELS: Record<EntitlementKey, string> = {
  canAppearInSearch: 'Widocznosc w wyszukiwarce',
  canReceiveRequests: 'Odbieranie zapytan',
  maxActiveRequestsPlaceholder: 'Maks. aktywnych zapytan',
  canBeFeatured: 'Mozliwosc wyroznenia',
  canBePromoted: 'Mozliwosc promocji',
  canUseCityPromotion: 'Promocja w miescie',
  canUseCategoryPromotion: 'Promocja w kategorii',
  canUseStagePromotion: 'Promocja w etapie budowy',
  maxProfileGalleryItemsPlaceholder: 'Maks. zdjec w galerii',
  maxServiceAreasPlaceholder: 'Maks. obszarow uslug',
  maxSpecialtiesPlaceholder: 'Maks. specjalizacji',
  canAccessLeadDetailsPlaceholder: 'Dostep do szczegolow leadow',
  canSeeAdvancedStatsPlaceholder: 'Zaawansowane statystyki',
  canUsePrioritySupportPlaceholder: 'Priorytetowe wsparcie',
  maxPromotionSlots: 'Maks. slotow promocyjnych',
  maxCategorySponsorships: 'Maks. sponsorowanych kategorii',
};

export const ENTITLEMENT_ICONS: Record<EntitlementKey, string> = {
  canAppearInSearch: 'search',
  canReceiveRequests: 'inbox',
  maxActiveRequestsPlaceholder: 'layers',
  canBeFeatured: 'award',
  canBePromoted: 'star',
  canUseCityPromotion: 'map-pin',
  canUseCategoryPromotion: 'tag',
  canUseStagePromotion: 'tool',
  maxProfileGalleryItemsPlaceholder: 'image',
  maxServiceAreasPlaceholder: 'globe',
  maxSpecialtiesPlaceholder: 'briefcase',
  canAccessLeadDetailsPlaceholder: 'eye',
  canSeeAdvancedStatsPlaceholder: 'bar-chart-2',
  canUsePrioritySupportPlaceholder: 'headphones',
  maxPromotionSlots: 'zap',
  maxCategorySponsorships: 'target',
};

export type AssignmentState =
  | 'active'
  | 'trial'
  | 'grace_period'
  | 'inactive'
  | 'suspended'
  | 'expired'
  | 'pending_activation'
  | 'manually_assigned';

export const ASSIGNMENT_STATE_LABELS: Record<AssignmentState, string> = {
  active: 'Aktywny',
  trial: 'Okres probny',
  grace_period: 'Okres prolongaty',
  inactive: 'Nieaktywny',
  suspended: 'Zawieszony',
  expired: 'Wygasl',
  pending_activation: 'Oczekuje na aktywacje',
  manually_assigned: 'Przypisany recznie',
};

export const ASSIGNMENT_STATE_COLORS: Record<AssignmentState, string> = {
  active: '#16A34A',
  trial: '#2563EB',
  grace_period: '#D97706',
  inactive: '#94A3B8',
  suspended: '#DC2626',
  expired: '#6B7280',
  pending_activation: '#0891B2',
  manually_assigned: '#7C3AED',
};

export interface ContractorPlanAssignment {
  readonly id: string;
  readonly contractorId: string;
  readonly planId: ContractorPlanId;
  readonly state: AssignmentState;
  readonly startDate: string;
  readonly endDate?: string;
  readonly trialEndDate?: string;
  readonly assignedBy: 'system' | 'admin' | 'self';
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ContractorEntitlementSnapshot {
  readonly contractorId: string;
  readonly planId: ContractorPlanId;
  readonly entitlements: ContractorEntitlementSet;
  readonly overrides?: Partial<ContractorEntitlementSet>;
  readonly resolvedAt: string;
}

export interface ContractorAccessState {
  readonly contractorId: string;
  readonly currentPlanId: ContractorPlanId;
  readonly assignmentState: AssignmentState;
  readonly entitlements: ContractorEntitlementSet;
  readonly isFullyActive: boolean;
  readonly canUseVisibilityFeatures: boolean;
  readonly canUsePaidFeatures: boolean;
  readonly suspensionReason?: string;
  readonly nextRenewalDate?: string;
}

export type AccessGrantReason =
  | 'plan_purchase'
  | 'admin_manual_assignment'
  | 'trial_activation'
  | 'promotion_grant'
  | 'system_migration'
  | 'support_override';

export type BillingProviderType =
  | 'app_store_billing_placeholder'
  | 'google_play_billing_placeholder'
  | 'web_billing_placeholder'
  | 'admin_manual_assignment';

export interface BillingPlanDefinition {
  readonly planId: ContractorPlanId;
  readonly providerType: BillingProviderType;
  readonly externalProductId?: string;
  readonly monthlyPricePlaceholder: number;
  readonly yearlyPricePlaceholder: number;
  readonly currency: string;
  readonly isAvailable: boolean;
}

export type BillingEventType =
  | 'plan_activated'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'plan_renewed'
  | 'plan_cancelled'
  | 'plan_expired'
  | 'plan_suspended'
  | 'trial_started'
  | 'trial_ended'
  | 'payment_received_placeholder'
  | 'payment_failed_placeholder'
  | 'refund_placeholder'
  | 'manual_assignment'
  | 'manual_revocation';

export interface BillingEvent {
  readonly id: string;
  readonly contractorId: string;
  readonly eventType: BillingEventType;
  readonly planId: ContractorPlanId;
  readonly providerType: BillingProviderType;
  readonly amount?: number;
  readonly currency?: string;
  readonly notes?: string;
  readonly metadata?: string;
  readonly createdAt: string;
}

export interface BillingRecordPlaceholder {
  readonly id: string;
  readonly contractorId: string;
  readonly planId: ContractorPlanId;
  readonly providerType: BillingProviderType;
  readonly status: 'pending' | 'completed' | 'failed' | 'refunded';
  readonly amount: number;
  readonly currency: string;
  readonly externalTransactionId?: string;
  readonly createdAt: string;
}

export interface BillingPortalLinkPlaceholder {
  readonly url: string;
  readonly providerType: BillingProviderType;
  readonly expiresAt?: string;
}

export interface InvoiceRecordPlaceholder {
  readonly id: string;
  readonly contractorId: string;
  readonly invoiceNumber: string;
  readonly amount: number;
  readonly currency: string;
  readonly issuedAt: string;
  readonly paidAt?: string;
}

export interface PaymentMethodPlaceholder {
  readonly id: string;
  readonly contractorId: string;
  readonly type: 'card' | 'bank_transfer' | 'app_store' | 'google_play';
  readonly last4?: string;
  readonly isDefault: boolean;
}

export type UsageCounterKey =
  | 'promoted_slots_used'
  | 'categories_sponsored'
  | 'lead_unlocks_placeholder'
  | 'visible_service_areas'
  | 'gallery_images'
  | 'open_request_responses_placeholder';

export const USAGE_COUNTER_LABELS: Record<UsageCounterKey, string> = {
  promoted_slots_used: 'Uzyte sloty promocyjne',
  categories_sponsored: 'Sponsorowane kategorie',
  lead_unlocks_placeholder: 'Odblokowane leady',
  visible_service_areas: 'Widoczne obszary uslug',
  gallery_images: 'Zdjecia w galerii',
  open_request_responses_placeholder: 'Otwarte odpowiedzi',
};

export interface ContractorUsageCounter {
  readonly id: string;
  readonly contractorId: string;
  readonly counterKey: UsageCounterKey;
  readonly currentValue: number;
  readonly limitValue: number;
  readonly updatedAt: string;
}

export interface UsageVsLimit {
  readonly key: UsageCounterKey;
  readonly label: string;
  readonly current: number;
  readonly limit: number;
  readonly percentage: number;
  readonly isAtLimit: boolean;
  readonly isOverLimit: boolean;
}

export type PromotionSlotScope = 'city' | 'category' | 'stage' | 'featured-global';

export interface PromotionSlot {
  readonly id: string;
  readonly contractorId: string;
  readonly scope: PromotionSlotScope;
  readonly scopeValue?: string;
  readonly label: string;
  readonly priority: number;
  readonly isActive: boolean;
  readonly startDate: string;
  readonly endDate?: string;
  readonly planId?: ContractorPlanId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const PROMOTION_SLOT_SCOPE_LABELS: Record<PromotionSlotScope, string> = {
  city: 'Slot miejski',
  category: 'Slot kategorii',
  stage: 'Slot etapu budowy',
  'featured-global': 'Slot wyrozniony globalnie',
};

export interface MonetizationFeatureFlags {
  readonly enableContractorPlans: boolean;
  readonly enableFeaturedProfiles: boolean;
  readonly enablePromotedProfiles: boolean;
  readonly enableCityPromotion: boolean;
  readonly enableCategoryPromotion: boolean;
  readonly enableStagePromotion: boolean;
  readonly enableLeadUnlockPlaceholder: boolean;
  readonly enablePlanBasedLimits: boolean;
  readonly enableBillingPortalPlaceholder: boolean;
}

export const DEFAULT_MONETIZATION_FLAGS: MonetizationFeatureFlags = {
  enableContractorPlans: true,
  enableFeaturedProfiles: true,
  enablePromotedProfiles: true,
  enableCityPromotion: false,
  enableCategoryPromotion: false,
  enableStagePromotion: false,
  enableLeadUnlockPlaceholder: false,
  enablePlanBasedLimits: true,
  enableBillingPortalPlaceholder: false,
};

export const PLAN_LABELS: Record<ContractorPlanId, string> = {
  free: 'Darmowy',
  starter: 'Starter',
  pro: 'Pro',
  featured: 'Wyrozniony',
  enterprise: 'Enterprise',
};

export const PLAN_COLORS: Record<ContractorPlanId, string> = {
  free: '#94A3B8',
  starter: '#2563EB',
  pro: '#7C3AED',
  featured: '#D97706',
  enterprise: '#0F172A',
};

export const PLAN_ICONS: Record<ContractorPlanId, string> = {
  free: 'user',
  starter: 'zap',
  pro: 'star',
  featured: 'award',
  enterprise: 'shield',
};

export interface PlanComparisonColumn {
  readonly planId: ContractorPlanId;
  readonly name: string;
  readonly price: string;
  readonly isRecommended: boolean;
  readonly features: readonly PlanComparisonFeature[];
}

export interface PlanComparisonFeature {
  readonly label: string;
  readonly value: string | boolean | number;
  readonly icon?: string;
}

export interface PlanImportExportData {
  readonly version: string;
  readonly exportedAt: string;
  readonly plans: readonly ContractorPlanDefinition[];
  readonly promotionSlots: readonly PromotionSlot[];
  readonly assignments: readonly ContractorPlanAssignment[];
}

export interface ImportValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly planCount: number;
  readonly slotCount: number;
  readonly assignmentCount: number;
  readonly duplicates: readonly string[];
}
