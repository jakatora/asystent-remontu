export type ContractorType = 'individual' | 'company';

export type VerificationStatus =
  | 'unverified'
  | 'phone-verified'
  | 'email-verified'
  | 'basic-verified'
  | 'business-verified'
  | 'featured'
  | 'promoted'
  | 'suspended';

export type ListingTier = 'free' | 'basic' | 'premium' | 'promoted';
export type RequestStatus = 'draft' | 'sent' | 'viewed' | 'replied' | 'accepted' | 'declined' | 'expired';
export type BudgetRange = 'low' | 'medium' | 'high' | 'any';
export type JobScale = 'small' | 'medium' | 'large';
export type OfferMode = 'single' | 'multiple';

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  'unverified': 'Niezweryfikowany',
  'phone-verified': 'Telefon zweryfikowany',
  'email-verified': 'E-mail zweryfikowany',
  'basic-verified': 'Podstawowa weryfikacja',
  'business-verified': 'Firma zweryfikowana',
  'featured': 'Wyrozniany',
  'promoted': 'Promowany',
  'suspended': 'Zawieszony',
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  'unverified': '#94A3B8',
  'phone-verified': '#0891B2',
  'email-verified': '#2563EB',
  'basic-verified': '#059669',
  'business-verified': '#16A34A',
  'featured': '#D97706',
  'promoted': '#7C3AED',
  'suspended': '#DC2626',
};

export interface VerificationBadgeInfo {
  readonly status: VerificationStatus;
  readonly label: string;
  readonly color: string;
  readonly icon: string;
  readonly explanation: string;
  readonly trustLevel: number;
}

export const VERIFICATION_BADGES: Record<VerificationStatus, VerificationBadgeInfo> = {
  'unverified': {
    status: 'unverified', label: 'Niezweryfikowany', color: '#94A3B8',
    icon: 'help-circle', explanation: 'Profil nie przeszedl zadnej weryfikacji.', trustLevel: 0,
  },
  'phone-verified': {
    status: 'phone-verified', label: 'Telefon zweryfikowany', color: '#0891B2',
    icon: 'phone', explanation: 'Numer telefonu zostal potwierdzony.', trustLevel: 1,
  },
  'email-verified': {
    status: 'email-verified', label: 'E-mail zweryfikowany', color: '#2563EB',
    icon: 'mail', explanation: 'Adres e-mail zostal potwierdzony.', trustLevel: 1,
  },
  'basic-verified': {
    status: 'basic-verified', label: 'Weryfikacja podstawowa', color: '#059669',
    icon: 'check', explanation: 'Tożsamosc i podstawowe dane zostaly zweryfikowane.', trustLevel: 2,
  },
  'business-verified': {
    status: 'business-verified', label: 'Firma zweryfikowana', color: '#16A34A',
    icon: 'check-circle', explanation: 'Dane firmy, NIP i rejestracja zostaly potwierdzone.', trustLevel: 3,
  },
  'featured': {
    status: 'featured', label: 'Wyrozniany', color: '#D97706',
    icon: 'award', explanation: 'Profil wyrozniany przez zespol moderacji.', trustLevel: 4,
  },
  'promoted': {
    status: 'promoted', label: 'Promowany', color: '#7C3AED',
    icon: 'star', explanation: 'Profil promowany — widocznosc zwiekszona przez platna usluge.', trustLevel: 3,
  },
  'suspended': {
    status: 'suspended', label: 'Zawieszony', color: '#DC2626',
    icon: 'alert-circle', explanation: 'Profil zawieszony z powodu naruszen regulaminu.', trustLevel: -1,
  },
};

export interface ContractorSpecialty {
  readonly categoryId: string;
  readonly categoryName: string;
}

export interface ServiceArea {
  readonly city: string;
  readonly postalCode?: string;
  readonly radiusKm?: number;
  readonly regions?: string[];
}

export interface ContractorProfile {
  readonly id: string;
  readonly type: ContractorType;
  readonly displayName: string;
  readonly companyName?: string;
  readonly email: string;
  readonly phone?: string;
  readonly city: string;
  readonly serviceArea: ServiceArea;
  readonly specialties: ContractorSpecialty[];
  /**
   * Per-job specializations (Faza 5+). Optional — when present, FindProTab matches
   * contractors against the renovation job's id; otherwise it falls back to category-level
   * matching via `specialties[*].categoryId`.
   */
  readonly specializedJobIds?: readonly string[];
  readonly shortDescription: string;
  readonly longDescription?: string;
  readonly yearsExperience?: number;
  readonly galleryUrls?: string[];
  readonly avatarUrl?: string;
  readonly website?: string;
  readonly socialLinks?: Record<string, string>;
  readonly taxId?: string;
  readonly businessRegistration?: string;
  readonly verificationStatus: VerificationStatus;
  readonly listingTier: ListingTier;
  readonly isPromoted: boolean;
  readonly materialsIncluded: boolean;
  readonly jobScales: JobScale[];
  readonly responseTimeHours?: number;
  readonly availableSoon: boolean;
  readonly rating?: number;
  readonly reviewCount: number;
  readonly verifiedReviewCount?: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  readonly acceptsSmallJobs?: boolean;
  readonly acceptsMediumJobs?: boolean;
  readonly acceptsLargeJobs?: boolean;
  readonly suitableForHouseBuildStages?: readonly string[];
  readonly currentLeadCapacity?: 'available' | 'busy' | 'full' | 'unknown';
  readonly typicalProjectType?: string;
  readonly materialsIncludedPossible?: boolean;
}

export type ReviewModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'hidden';
export type ReviewerType = 'anonymous' | 'registered' | 'verified-request' | 'verified-job';

export interface ContractorReview {
  readonly id: string;
  readonly contractorId: string;
  readonly rating: number;
  readonly title?: string;
  readonly comment?: string;
  readonly authorName?: string;
  readonly reviewerType: ReviewerType;
  readonly requestId?: string;
  readonly moderationStatus: ReviewModerationStatus;
  readonly isVisible: boolean;
  readonly isFlagged: boolean;
  readonly flagReason?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface ContractorReviewSummary {
  readonly contractorId: string;
  readonly averageRating: number;
  readonly totalCount: number;
  readonly verifiedCount: number;
  readonly distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  readonly recentReviews: readonly ContractorReview[];
  readonly hiddenCount: number;
  readonly flaggedCount: number;
}

export const REVIEWER_TYPE_LABELS: Record<ReviewerType, string> = {
  'anonymous': 'Anonimowa',
  'registered': 'Zarejestrowany uzytkownik',
  'verified-request': 'Zweryfikowane zapytanie',
  'verified-job': 'Zweryfikowane zlecenie',
};

export interface ContractorRequest {
  readonly id: string;
  readonly categoryId?: string;
  readonly categoryName?: string;
  readonly jobId?: string;
  readonly jobName?: string;
  readonly roomDescription?: string;
  readonly workDescription: string;
  readonly city: string;
  readonly postalCode?: string;
  readonly preferredDate?: string;
  readonly budgetRange: BudgetRange;
  readonly offerMode: OfferMode;
  readonly photoRefs?: string[];
  readonly notes?: string;
  readonly selectedContractorIds: string[];
  readonly status: RequestStatus;
  readonly estimatedMatchCount?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sentAt?: string;
}

export interface SavedContractor {
  readonly id: string;
  readonly contractorId: string;
  readonly savedAt: string;
}

export interface ContractorSearchFilters {
  readonly categoryId?: string;
  readonly city?: string;
  readonly verifiedOnly?: boolean;
  readonly availableSoon?: boolean;
  readonly budgetRange?: BudgetRange;
  readonly minRating?: number;
  readonly showPromoted?: boolean;
  readonly jobScale?: JobScale;
  readonly excludeBlocked?: boolean;
  readonly houseBuildStageKey?: string;
}

export type ContractorSortOption =
  | 'best-match'
  | 'nearest'
  | 'verified-first'
  | 'newest'
  | 'promoted'
  | 'rating'
  | 'quality-score';

export interface ContractorRegistration {
  readonly type: ContractorType;
  readonly displayName: string;
  readonly companyName?: string;
  readonly email: string;
  readonly phone?: string;
  readonly city: string;
  readonly serviceArea: ServiceArea;
  readonly specialties: ContractorSpecialty[];
  /** Per-job specializations (Faza 5+). Mirrors ContractorProfile.specializedJobIds. */
  readonly specializedJobIds?: readonly string[];
  readonly shortDescription: string;
  readonly longDescription?: string;
  readonly taxId?: string;
  readonly businessRegistration?: string;
  readonly website?: string;
  readonly socialLinks?: Record<string, string>;
  readonly materialsIncluded: boolean;
  readonly jobScales: JobScale[];
}

export interface ContractorPaymentConfig {
  readonly enabled: boolean;
  readonly listingTiers: {
    readonly free: { readonly maxVisibility: number; readonly leadAccess: boolean };
    readonly basic: { readonly maxVisibility: number; readonly leadAccess: boolean; readonly monthlyPricePLN: number };
    readonly premium: { readonly maxVisibility: number; readonly leadAccess: boolean; readonly monthlyPricePLN: number };
    readonly promoted: { readonly maxVisibility: number; readonly leadAccess: boolean; readonly monthlyPricePLN: number; readonly boostFactor: number };
  };
}

export const DEFAULT_PAYMENT_CONFIG: ContractorPaymentConfig = {
  enabled: false,
  listingTiers: {
    free: { maxVisibility: 10, leadAccess: false },
    basic: { maxVisibility: 50, leadAccess: true, monthlyPricePLN: 49 },
    premium: { maxVisibility: 200, leadAccess: true, monthlyPricePLN: 149 },
    promoted: { maxVisibility: 999, leadAccess: true, monthlyPricePLN: 299, boostFactor: 2.0 },
  },
};

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  low: 'Budzetowo (do 5 000 zl)',
  medium: 'Srednia polka (5 000 - 20 000 zl)',
  high: 'Bez limitu (powyzej 20 000 zl)',
  any: 'Dowolny budzet',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'Szkic',
  sent: 'Wyslano',
  viewed: 'Przeczytano',
  replied: 'Odpowiedz',
  accepted: 'Zaakceptowano',
  declined: 'Odrzucono',
  expired: 'Wygaslo',
};

export const LISTING_TIER_LABELS: Record<ListingTier, string> = {
  free: 'Bezplatny',
  basic: 'Podstawowy',
  premium: 'Premium',
  promoted: 'Promowany',
};

export interface ProfileCompletenessScore {
  readonly total: number;
  readonly maxScore: number;
  readonly percentage: number;
  readonly missing: readonly string[];
  readonly details: {
    readonly hasDescription: boolean;
    readonly hasSpecialties: boolean;
    readonly hasServiceArea: boolean;
    readonly hasContactInfo: boolean;
    readonly hasGallery: boolean;
    readonly verificationLevel: number;
    readonly reviewCountScore: number;
    readonly responseReadinessScore: number;
  };
}

export interface ContractorQualityScore {
  readonly contractorId: string;
  readonly totalScore: number;
  readonly maxScore: number;
  readonly breakdown: {
    readonly specialtyMatch: number;
    readonly serviceAreaMatch: number;
    readonly verificationScore: number;
    readonly completenessScore: number;
    readonly reviewScore: number;
    readonly activityScore: number;
    readonly houseBuildSuitability: number;
    readonly responseReadiness: number;
  };
}

export interface RankingWeights {
  readonly specialtyMatch: number;
  readonly serviceAreaMatch: number;
  readonly verification: number;
  readonly completeness: number;
  readonly reviewScore: number;
  readonly recentActivity: number;
  readonly houseBuildSuitability: number;
  readonly responseReadiness: number;
  readonly promotedSlotCount: number;
  readonly featuredSlotCount: number;
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  specialtyMatch: 25,
  serviceAreaMatch: 20,
  verification: 15,
  completeness: 10,
  reviewScore: 15,
  recentActivity: 5,
  houseBuildSuitability: 5,
  responseReadiness: 5,
  promotedSlotCount: 3,
  featuredSlotCount: 2,
};

export interface ContractorFeatureFlags {
  readonly enablePromotedListings: boolean;
  readonly enableFeaturedProfiles: boolean;
  readonly enableSponsoredCategories: boolean;
  readonly enableCitySponsorSlots: boolean;
  readonly enableContractorPlans: boolean;
  readonly enablePlanBasedLimits: boolean;
  readonly enableBillingPortalPlaceholder: boolean;
  readonly enableLeadUnlockPlaceholder: boolean;
  readonly enableCityPromotion: boolean;
  readonly enableCategoryPromotion: boolean;
  readonly enableStagePromotion: boolean;
}

export const DEFAULT_FEATURE_FLAGS: ContractorFeatureFlags = {
  enablePromotedListings: true,
  enableFeaturedProfiles: true,
  enableSponsoredCategories: false,
  enableCitySponsorSlots: false,
  enableContractorPlans: true,
  enablePlanBasedLimits: true,
  enableBillingPortalPlaceholder: false,
  enableLeadUnlockPlaceholder: false,
  enableCityPromotion: false,
  enableCategoryPromotion: false,
  enableStagePromotion: false,
};

export type ReportReason =
  | 'fake-profile'
  | 'misleading-info'
  | 'spam'
  | 'abusive-messages'
  | 'inappropriate-images'
  | 'suspicious-review'
  | 'duplicate-business'
  | 'scam-fraud';

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  'fake-profile': 'Falszywy profil',
  'misleading-info': 'Mylace informacje o firmie',
  'spam': 'Spam',
  'abusive-messages': 'Obraźliwe wiadomosci',
  'inappropriate-images': 'Nieodpowiednie zdjecia',
  'suspicious-review': 'Podejrzana opinia',
  'duplicate-business': 'Zduplikowany profil firmy',
  'scam-fraud': 'Oszustwo / wyludzenie',
};

export type ModerationStatus = 'open' | 'under-review' | 'action-taken' | 'dismissed' | 'escalated';

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  'open': 'Otwarty',
  'under-review': 'W trakcie przeglądu',
  'action-taken': 'Podjeto działanie',
  'dismissed': 'Odrzucony',
  'escalated': 'Eskalowany',
};

export type ModerationActionType =
  | 'warning-issued'
  | 'profile-suspended'
  | 'profile-removed'
  | 'review-hidden'
  | 'review-removed'
  | 'content-edited'
  | 'verification-revoked'
  | 'no-action';

export interface ContractorContentReport {
  readonly id: string;
  readonly contractorId: string;
  readonly reporterNote: string;
  readonly reason: ReportReason;
  readonly moderationStatus: ModerationStatus;
  readonly moderationNote?: string;
  readonly actionTaken?: ModerationActionType;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ContractorModerationRecord {
  readonly id: string;
  readonly contractorId: string;
  readonly action: ModerationActionType;
  readonly reason: string;
  readonly performedBy: string;
  readonly createdAt: string;
}

export type ContractorAccountState = 'active' | 'suspended' | 'under-review' | 'removed' | 'pending-verification';

export const ACCOUNT_STATE_LABELS: Record<ContractorAccountState, string> = {
  'active': 'Aktywny',
  'suspended': 'Zawieszony',
  'under-review': 'W trakcie przeglądu',
  'removed': 'Usuniety',
  'pending-verification': 'Oczekuje na weryfikacje',
};

export type ContractorSafetyFlag = 'none' | 'caution' | 'warning' | 'danger';

export const SAFETY_FLAG_LABELS: Record<ContractorSafetyFlag, string> = {
  'none': 'Brak ostrzezen',
  'caution': 'Uwaga',
  'warning': 'Ostrzezenie',
  'danger': 'Zagrozenie',
};

export interface ContractorBlock {
  readonly id: string;
  readonly contractorId: string;
  readonly reason?: string;
  readonly createdAt: string;
}

export type PromotionScope = 'city' | 'category' | 'stage-specialty' | 'featured' | 'sponsored-stage';

export interface ContractorPromotion {
  readonly id: string;
  readonly contractorId: string;
  readonly scope: PromotionScope;
  readonly scopeValue?: string;
  readonly label: string;
  readonly isActive: boolean;
  readonly startDate: string;
  readonly endDate?: string;
  readonly priority: number;
  readonly createdAt: string;
}

export const PROMOTION_SCOPE_LABELS: Record<PromotionScope, string> = {
  'city': 'Promowany w miescie',
  'category': 'Promowany w kategorii',
  'stage-specialty': 'Promowany w specjalizacji etapu',
  'featured': 'Profil wyrozniany',
  'sponsored-stage': 'Sponsorowana rekomendacja etapu',
};

export type ProfileHealthIssueType =
  | 'missing-specialties'
  | 'missing-service-area'
  | 'missing-description'
  | 'missing-verification'
  | 'unresolved-reports'
  | 'duplicate-suspect'
  | 'too-incomplete-to-rank'
  | 'missing-contact'
  | 'missing-gallery';

export interface ProfileHealthIssue {
  readonly type: ProfileHealthIssueType;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
}

export interface ProfileHealthReport {
  readonly contractorId: string;
  readonly issues: readonly ProfileHealthIssue[];
  readonly isRankable: boolean;
  readonly completeness: ProfileCompletenessScore;
}

export interface ContractorAdminBoardSection {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly count: number;
}

export interface OrganicVsPromotedResults {
  readonly organic: readonly ContractorProfile[];
  readonly promoted: readonly ContractorProfile[];
  readonly featured: readonly ContractorProfile[];
}

export interface ContractorTrustInfo {
  readonly supportEmail: string;
  readonly supportUrl: string;
  readonly reportingNote: string;
  readonly moderationNote: string;
  readonly promotedExplanation: string;
  readonly verificationExplanation: string;
}

export const CONTRACTOR_TRUST_INFO: ContractorTrustInfo = {
  supportEmail: 'pomoc@asystentremontu.pl',
  supportUrl: 'https://asystentremontu.pl/pomoc',
  reportingNote: 'Jesli zauwazyłes problem z profilem wykonawcy, mozesz go zgłosic. Kazde zgłoszenie jest weryfikowane przez nasz zespol.',
  moderationNote: 'Nasz zespol moderacji sprawdza zgłoszenia w ciagu 48 godzin roboczych.',
  promotedExplanation: 'Wykonawcy promowani korzystaja z platnej uslugi zwiekszajacej widocznosc. Nie wplywa to na ocene jakosci ani ranking organiczny.',
  verificationExplanation: 'Weryfikacja potwierdza tożsamosc i dane firmy. Nie stanowi rekomendacji ani gwarancji jakosci uslug.',
};
