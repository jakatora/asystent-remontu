import type {
  ContractorPlanDefinition,
  ContractorPlanAssignment,
  ContractorAccessState,
  ContractorPortalProfile,
  BillingEvent,
  PromotionSlot,
  UsageVsLimit,
  BillingHistoryItem,
  InvoiceHistoryItem,
  ContractorBillingContact,
  WebBillingSession,
  PortalNotificationPrefs,
  ContractorEntitlementSet,
} from './portal-types';

const FREE_ENT: ContractorEntitlementSet = {
  canAppearInSearch: true, canReceiveRequests: true, maxActiveRequestsPlaceholder: 3,
  canBeFeatured: false, canBePromoted: false, canUseCityPromotion: false,
  canUseCategoryPromotion: false, canUseStagePromotion: false,
  maxProfileGalleryItemsPlaceholder: 3, maxServiceAreasPlaceholder: 1,
  maxSpecialtiesPlaceholder: 3, canAccessLeadDetailsPlaceholder: false,
  canSeeAdvancedStatsPlaceholder: false, canUsePrioritySupportPlaceholder: false,
  maxPromotionSlots: 0, maxCategorySponsorships: 0,
};

const STARTER_ENT: ContractorEntitlementSet = {
  ...FREE_ENT, maxActiveRequestsPlaceholder: 10, maxProfileGalleryItemsPlaceholder: 10,
  maxServiceAreasPlaceholder: 2, maxSpecialtiesPlaceholder: 6,
  canAccessLeadDetailsPlaceholder: true,
};

const PRO_ENT: ContractorEntitlementSet = {
  ...STARTER_ENT, maxActiveRequestsPlaceholder: 50, canBePromoted: true,
  canUseCityPromotion: true, canUseCategoryPromotion: true,
  maxProfileGalleryItemsPlaceholder: 30, maxServiceAreasPlaceholder: 5,
  maxSpecialtiesPlaceholder: 12, canSeeAdvancedStatsPlaceholder: true,
  maxPromotionSlots: 2, maxCategorySponsorships: 2,
};

const FEATURED_ENT: ContractorEntitlementSet = {
  ...PRO_ENT, maxActiveRequestsPlaceholder: 100, canBeFeatured: true,
  canUseStagePromotion: true, maxProfileGalleryItemsPlaceholder: 50,
  maxServiceAreasPlaceholder: 10, maxSpecialtiesPlaceholder: 20,
  canUsePrioritySupportPlaceholder: true, maxPromotionSlots: 5, maxCategorySponsorships: 5,
};

const ENTERPRISE_ENT: ContractorEntitlementSet = {
  ...FEATURED_ENT, maxActiveRequestsPlaceholder: 999,
  maxProfileGalleryItemsPlaceholder: 100, maxServiceAreasPlaceholder: 50,
  maxSpecialtiesPlaceholder: 50, maxPromotionSlots: 20, maxCategorySponsorships: 10,
};

export const MOCK_PLANS: ContractorPlanDefinition[] = [
  { id: 'free', name: 'Darmowy', shortDescription: 'Podstawowa widocznosc w wyszukiwarce.', monthlyPricePlaceholder: 0, yearlyPricePlaceholder: 0, status: 'active', displayOrder: 1, notes: '', entitlements: FREE_ENT, highlightFeatures: ['Widocznosc w wyszukiwarce', '3 zapytania', '3 zdjecia'], color: '#94A3B8' },
  { id: 'starter', name: 'Starter', shortDescription: 'Wiecej mozliwosci i dostep do leadow.', monthlyPricePlaceholder: 49, yearlyPricePlaceholder: 470, status: 'active', displayOrder: 2, notes: '', entitlements: STARTER_ENT, highlightFeatures: ['10 zapytan', '10 zdjec', '2 obszary uslug', 'Szczegoly leadow'], badge: 'Starter', color: '#2563EB' },
  { id: 'pro', name: 'Pro', shortDescription: 'Pelna promocja i zaawansowane statystyki.', monthlyPricePlaceholder: 149, yearlyPricePlaceholder: 1430, status: 'active', displayOrder: 3, notes: '', entitlements: PRO_ENT, highlightFeatures: ['Promocja profilu', 'Promocja miejska/kategoria', '50 zapytan', '30 zdjec', 'Statystyki'], badge: 'Pro', color: '#7C3AED' },
  { id: 'featured', name: 'Wyrozniony', shortDescription: 'Maksymalna widocznosc i pelne uprawnienia.', monthlyPricePlaceholder: 299, yearlyPricePlaceholder: 2870, status: 'active', displayOrder: 4, notes: '', entitlements: FEATURED_ENT, highlightFeatures: ['Profil wyrozniany', 'Promocja etapu', '100 zapytan', '50 zdjec', 'Priorytetowe wsparcie'], badge: 'Featured', color: '#D97706' },
  { id: 'enterprise', name: 'Enterprise', shortDescription: 'Indywidualny plan dla duzych firm.', monthlyPricePlaceholder: 0, yearlyPricePlaceholder: 0, status: 'active', displayOrder: 5, notes: 'Cena indywidualna', entitlements: ENTERPRISE_ENT, highlightFeatures: ['Wszystko bez limitow', 'Dedykowany opiekun'], badge: 'Enterprise', color: '#0F172A' },
];

export const MOCK_PROFILE: ContractorPortalProfile = {
  id: 'c-001', displayName: 'Marek Kowalski', companyName: 'Kowalski Remonty Sp. z o.o.',
  email: 'marek@kowalski-remonty.pl', phone: '+48 600 123 456', city: 'Warszawa',
  description: 'Profesjonalne uslugi remontowe z 15-letnim doswiadczeniem. Specjalizujemy sie w remontach mieszkan, lazienek i kuchni.',
  specialties: [
    { categoryId: 'paint', categoryName: 'Malowanie' },
    { categoryId: 'tile', categoryName: 'Plytki i glazura' },
    { categoryId: 'bathroom', categoryName: 'Lazienki' },
  ],
  serviceAreas: { city: 'Warszawa', radiusKm: 30, regions: ['mazowieckie'] },
  galleryCount: 8, verificationStatus: 'document-verified', isPromoted: true,
  isFeatured: false, profileCompleteness: 78, materialsIncluded: true,
  availableSoon: true, houseBuildSuitability: true,
};

export const MOCK_ASSIGNMENT: ContractorPlanAssignment = {
  id: 'pa-001', contractorId: 'c-001', planId: 'pro', state: 'active',
  startDate: '2025-01-15T00:00:00Z', endDate: '2026-01-15T00:00:00Z',
  assignedBy: 'self', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
};

export const MOCK_ACCESS: ContractorAccessState = {
  contractorId: 'c-001', currentPlanId: 'pro', assignmentState: 'active',
  entitlements: PRO_ENT, isFullyActive: true, canUseVisibilityFeatures: true,
  canUsePaidFeatures: true, nextRenewalDate: '2026-01-15T00:00:00Z',
};

export const MOCK_USAGE: UsageVsLimit[] = [
  { key: 'promoted_slots_used', label: 'Sloty promocyjne', current: 1, limit: 2, percentage: 50, isAtLimit: false },
  { key: 'categories_sponsored', label: 'Sponsorowane kategorie', current: 1, limit: 2, percentage: 50, isAtLimit: false },
  { key: 'visible_service_areas', label: 'Obszary uslug', current: 2, limit: 5, percentage: 40, isAtLimit: false },
  { key: 'gallery_images', label: 'Zdjecia w galerii', current: 8, limit: 30, percentage: 27, isAtLimit: false },
  { key: 'open_request_responses_placeholder', label: 'Otwarte odpowiedzi', current: 12, limit: 50, percentage: 24, isAtLimit: false },
];

export const MOCK_PROMOTIONS: PromotionSlot[] = [
  { id: 'ps-001', contractorId: 'c-001', scope: 'city', scopeValue: 'Warszawa', label: 'Promowany w Warszawie', priority: 1, isActive: true, startDate: '2025-03-01T00:00:00Z', endDate: '2025-09-01T00:00:00Z', planId: 'pro' },
  { id: 'ps-002', contractorId: 'c-001', scope: 'category', scopeValue: 'Lazienki', label: 'Sponsorowany w kategorii Lazienki', priority: 1, isActive: true, startDate: '2025-04-01T00:00:00Z', planId: 'pro' },
];

export const MOCK_BILLING_EVENTS: BillingEvent[] = [
  { id: 'be-001', contractorId: 'c-001', eventType: 'plan_activated', planId: 'pro', providerType: 'web_billing_placeholder', amount: 149, currency: 'PLN', notes: 'Aktywacja planu Pro', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'be-002', contractorId: 'c-001', eventType: 'plan_renewed', planId: 'pro', providerType: 'web_billing_placeholder', amount: 149, currency: 'PLN', createdAt: '2025-02-15T10:00:00Z' },
  { id: 'be-003', contractorId: 'c-001', eventType: 'payment_received_placeholder', planId: 'pro', providerType: 'web_billing_placeholder', amount: 149, currency: 'PLN', createdAt: '2025-03-15T10:00:00Z' },
];

export const MOCK_BILLING_HISTORY: BillingHistoryItem[] = [
  { id: 'bh-001', date: '2025-03-15', description: 'Plan Pro - odnowienie miesieczne', amount: 149, currency: 'PLN', status: 'paid', planId: 'pro' },
  { id: 'bh-002', date: '2025-02-15', description: 'Plan Pro - odnowienie miesieczne', amount: 149, currency: 'PLN', status: 'paid', planId: 'pro' },
  { id: 'bh-003', date: '2025-01-15', description: 'Plan Pro - pierwsza platnosc', amount: 149, currency: 'PLN', status: 'paid', planId: 'pro' },
];

export const MOCK_INVOICES: InvoiceHistoryItem[] = [
  { id: 'inv-001', invoiceNumber: 'FV/2025/03/001', date: '2025-03-15', amount: 149, currency: 'PLN', status: 'paid' },
  { id: 'inv-002', invoiceNumber: 'FV/2025/02/001', date: '2025-02-15', amount: 149, currency: 'PLN', status: 'paid' },
  { id: 'inv-003', invoiceNumber: 'FV/2025/01/001', date: '2025-01-15', amount: 149, currency: 'PLN', status: 'paid' },
];

export const MOCK_BILLING_CONTACT: ContractorBillingContact = {
  name: 'Kowalski Remonty Sp. z o.o.', email: 'faktury@kowalski-remonty.pl',
  nip: '1234567890', address: 'ul. Remontowa 15', city: 'Warszawa', postalCode: '00-001',
};

export const MOCK_NOTIFICATION_PREFS: PortalNotificationPrefs = {
  emailNewRequests: true, emailBillingAlerts: true,
  emailPromotionUpdates: false, emailWeeklyDigest: true,
};
