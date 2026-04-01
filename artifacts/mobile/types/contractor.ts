export type ContractorType = 'individual' | 'company';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type ListingTier = 'free' | 'basic' | 'premium' | 'promoted';
export type RequestStatus = 'draft' | 'sent' | 'viewed' | 'replied' | 'accepted' | 'declined' | 'expired';
export type BudgetRange = 'low' | 'medium' | 'high' | 'any';
export type JobScale = 'small' | 'medium' | 'large';
export type OfferMode = 'single' | 'multiple';

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
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ContractorReview {
  readonly id: string;
  readonly contractorId: string;
  readonly rating: number;
  readonly comment?: string;
  readonly authorName?: string;
  readonly createdAt: string;
}

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
}

export type ContractorSortOption =
  | 'best-match'
  | 'nearest'
  | 'verified-first'
  | 'newest'
  | 'promoted'
  | 'rating';

export interface ContractorRegistration {
  readonly type: ContractorType;
  readonly displayName: string;
  readonly companyName?: string;
  readonly email: string;
  readonly phone?: string;
  readonly city: string;
  readonly serviceArea: ServiceArea;
  readonly specialties: ContractorSpecialty[];
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
  low: 'Budżetowo (do 5 000 zł)',
  medium: 'Średnia półka (5 000 – 20 000 zł)',
  high: 'Bez limitu (powyżej 20 000 zł)',
  any: 'Dowolny budżet',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'Szkic',
  sent: 'Wysłano',
  viewed: 'Przeczytano',
  replied: 'Odpowiedź',
  accepted: 'Zaakceptowano',
  declined: 'Odrzucono',
  expired: 'Wygasło',
};

export const LISTING_TIER_LABELS: Record<ListingTier, string> = {
  free: 'Bezpłatny',
  basic: 'Podstawowy',
  premium: 'Premium',
  promoted: 'Promowany',
};
