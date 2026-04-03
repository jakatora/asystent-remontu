export type ContractorPlanId = 'free' | 'starter' | 'pro' | 'featured' | 'enterprise';
export type PlanStatus = 'active' | 'inactive' | 'deprecated';

export type AssignmentState =
  | 'active' | 'trial' | 'grace_period' | 'inactive'
  | 'suspended' | 'expired' | 'pending_activation' | 'manually_assigned';

export type BillingProviderType =
  | 'app_store_billing_placeholder' | 'google_play_billing_placeholder'
  | 'web_billing_placeholder' | 'admin_manual_assignment';

export type BillingEventType =
  | 'plan_activated' | 'plan_upgraded' | 'plan_downgraded' | 'plan_renewed'
  | 'plan_cancelled' | 'plan_expired' | 'plan_suspended' | 'trial_started'
  | 'trial_ended' | 'payment_received_placeholder' | 'payment_failed_placeholder'
  | 'refund_placeholder' | 'manual_assignment' | 'manual_revocation';

export type PromotionSlotScope = 'city' | 'category' | 'stage' | 'featured-global';

export type AccessGrantReason =
  | 'plan_purchase' | 'admin_manual_assignment' | 'trial_activation'
  | 'promotion_grant' | 'system_migration' | 'support_override';

export interface ContractorEntitlementSet {
  canAppearInSearch: boolean;
  canReceiveRequests: boolean;
  maxActiveRequestsPlaceholder: number;
  canBeFeatured: boolean;
  canBePromoted: boolean;
  canUseCityPromotion: boolean;
  canUseCategoryPromotion: boolean;
  canUseStagePromotion: boolean;
  maxProfileGalleryItemsPlaceholder: number;
  maxServiceAreasPlaceholder: number;
  maxSpecialtiesPlaceholder: number;
  canAccessLeadDetailsPlaceholder: boolean;
  canSeeAdvancedStatsPlaceholder: boolean;
  canUsePrioritySupportPlaceholder: boolean;
  maxPromotionSlots: number;
  maxCategorySponsorships: number;
}

export interface ContractorPlanDefinition {
  id: ContractorPlanId;
  name: string;
  shortDescription: string;
  monthlyPricePlaceholder: number;
  yearlyPricePlaceholder: number;
  status: PlanStatus;
  displayOrder: number;
  notes: string;
  entitlements: ContractorEntitlementSet;
  highlightFeatures: string[];
  badge?: string;
  color: string;
}

export interface ContractorPlanAssignment {
  id: string;
  contractorId: string;
  planId: ContractorPlanId;
  state: AssignmentState;
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  assignedBy: 'system' | 'admin' | 'self';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorAccessState {
  contractorId: string;
  currentPlanId: ContractorPlanId;
  assignmentState: AssignmentState;
  entitlements: ContractorEntitlementSet;
  isFullyActive: boolean;
  canUseVisibilityFeatures: boolean;
  canUsePaidFeatures: boolean;
  suspensionReason?: string;
  nextRenewalDate?: string;
}

export interface BillingEvent {
  id: string;
  contractorId: string;
  eventType: BillingEventType;
  planId: ContractorPlanId;
  providerType: BillingProviderType;
  amount?: number;
  currency?: string;
  notes?: string;
  createdAt: string;
}

export interface PromotionSlot {
  id: string;
  contractorId: string;
  scope: PromotionSlotScope;
  scopeValue?: string;
  label: string;
  priority: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  planId?: ContractorPlanId;
}

export interface UsageVsLimit {
  key: string;
  label: string;
  current: number;
  limit: number;
  percentage: number;
  isAtLimit: boolean;
}

export interface ContractorPortalProfile {
  id: string;
  displayName: string;
  companyName?: string;
  email: string;
  phone?: string;
  city: string;
  description: string;
  specialties: { categoryId: string; categoryName: string }[];
  serviceAreas: { city: string; radiusKm?: number; regions?: string[] };
  galleryCount: number;
  verificationStatus: string;
  isPromoted: boolean;
  isFeatured: boolean;
  profileCompleteness: number;
  materialsIncluded: boolean;
  availableSoon: boolean;
  houseBuildSuitability: boolean;
}

export interface WebBillingSession {
  id: string;
  contractorId: string;
  planId: ContractorPlanId;
  billingPeriod: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  isTestMode: boolean;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  planId: ContractorPlanId;
}

export interface InvoiceHistoryItem {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: 'issued' | 'paid' | 'overdue';
  downloadUrl?: string;
}

export interface ContractorBillingContact {
  name: string;
  email: string;
  nip?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export type PortalAuthState =
  | 'authenticated' | 'unauthenticated' | 'suspended' | 'inactive' | 'pending_activation';

export interface PortalNotificationPrefs {
  emailNewRequests: boolean;
  emailBillingAlerts: boolean;
  emailPromotionUpdates: boolean;
  emailWeeklyDigest: boolean;
}

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

export const PROMOTION_SCOPE_LABELS: Record<PromotionSlotScope, string> = {
  city: 'Promocja w miescie',
  category: 'Promocja w kategorii',
  stage: 'Promocja w etapie budowy',
  'featured-global': 'Wyrozniony globalnie',
};

export const USAGE_LABELS: Record<string, string> = {
  promoted_slots_used: 'Sloty promocyjne',
  categories_sponsored: 'Sponsorowane kategorie',
  lead_unlocks_placeholder: 'Odblokowane leady',
  visible_service_areas: 'Obszary uslug',
  gallery_images: 'Zdjecia w galerii',
  open_request_responses_placeholder: 'Otwarte odpowiedzi',
};

export const ENTITLEMENT_LABELS: Record<keyof ContractorEntitlementSet, string> = {
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
