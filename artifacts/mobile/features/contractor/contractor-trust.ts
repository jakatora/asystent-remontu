import type {
  ContractorProfile,
  ProfileCompletenessScore,
  ContractorQualityScore,
  RankingWeights,
  ProfileHealthIssue,
  ProfileHealthReport,
  ContractorFeatureFlags,
  VerificationStatus,
  OrganicVsPromotedResults,
  ContractorSearchFilters,
} from '@/types/contractor';
import { DEFAULT_RANKING_WEIGHTS, DEFAULT_FEATURE_FLAGS, VERIFICATION_BADGES } from '@/types/contractor';

export function computeProfileCompleteness(c: ContractorProfile): ProfileCompletenessScore {
  const missing: string[] = [];
  let total = 0;
  const maxScore = 100;

  const hasDescription = !!(c.shortDescription && c.shortDescription.length > 20);
  if (hasDescription) total += 15; else missing.push('Opis profilu');

  const hasSpecialties = c.specialties.length > 0;
  if (hasSpecialties) total += 15; else missing.push('Specjalizacje');

  const hasServiceArea = !!(c.serviceArea && c.serviceArea.city);
  if (hasServiceArea) total += 10; else missing.push('Zasieg uslug');

  const hasContactInfo = !!(c.email || c.phone);
  if (hasContactInfo) total += 10; else missing.push('Dane kontaktowe');

  const hasGallery = !!(c.galleryUrls && c.galleryUrls.length > 0);
  if (hasGallery) total += 10; else missing.push('Galeria zdjec');

  const badge = VERIFICATION_BADGES[c.verificationStatus];
  const verificationLevel = Math.max(0, badge.trustLevel);
  total += Math.min(verificationLevel * 5, 20);
  if (verificationLevel === 0) missing.push('Weryfikacja');

  const reviewCountScore = Math.min(c.reviewCount * 2, 10);
  total += reviewCountScore;
  if (c.reviewCount === 0) missing.push('Opinie');

  const responseReadinessScore = c.responseTimeHours && c.responseTimeHours <= 24 ? 10 : c.responseTimeHours && c.responseTimeHours <= 72 ? 5 : 0;
  total += responseReadinessScore;
  if (!c.responseTimeHours) missing.push('Czas odpowiedzi');

  return {
    total: Math.min(total, maxScore),
    maxScore,
    percentage: Math.round((Math.min(total, maxScore) / maxScore) * 100),
    missing,
    details: {
      hasDescription,
      hasSpecialties,
      hasServiceArea,
      hasContactInfo,
      hasGallery,
      verificationLevel,
      reviewCountScore,
      responseReadinessScore,
    },
  };
}

export function computeQualityScore(
  c: ContractorProfile,
  context?: { categoryId?: string; city?: string; stageKey?: string },
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): ContractorQualityScore {
  const maxScore = 100;

  let specialtyMatch = 0;
  if (context?.categoryId && c.specialties.some((s) => s.categoryId === context.categoryId)) {
    specialtyMatch = weights.specialtyMatch;
  } else if (!context?.categoryId) {
    specialtyMatch = weights.specialtyMatch * 0.5;
  }

  let serviceAreaMatch = 0;
  if (context?.city && c.city.toLowerCase() === context.city.toLowerCase()) {
    serviceAreaMatch = weights.serviceAreaMatch;
  } else if (context?.city && c.serviceArea.regions?.some((r) => r.toLowerCase().includes(context.city!.toLowerCase()))) {
    serviceAreaMatch = weights.serviceAreaMatch * 0.7;
  } else if (!context?.city) {
    serviceAreaMatch = weights.serviceAreaMatch * 0.5;
  }

  const badge = VERIFICATION_BADGES[c.verificationStatus];
  const verificationScore = (Math.max(0, badge.trustLevel) / 4) * weights.verification;

  const completeness = computeProfileCompleteness(c);
  const completenessScore = (completeness.percentage / 100) * weights.completeness;

  const reviewScore = c.rating ? ((c.rating / 5) * weights.reviewScore) * Math.min(c.reviewCount / 5, 1) : 0;

  const daysSinceUpdate = (Date.now() - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  const activityScore = daysSinceUpdate < 30 ? weights.recentActivity : daysSinceUpdate < 90 ? weights.recentActivity * 0.5 : 0;

  let houseBuildSuitability = 0;
  if (context?.stageKey && c.suitableForHouseBuildStages?.includes(context.stageKey)) {
    houseBuildSuitability = weights.houseBuildSuitability;
  } else if (!context?.stageKey) {
    houseBuildSuitability = weights.houseBuildSuitability * 0.3;
  }

  const responseReadiness = c.responseTimeHours
    ? c.responseTimeHours <= 24 ? weights.responseReadiness
      : c.responseTimeHours <= 72 ? weights.responseReadiness * 0.5
      : 0
    : weights.responseReadiness * 0.2;

  const totalScore = Math.min(
    specialtyMatch + serviceAreaMatch + verificationScore + completenessScore +
    reviewScore + activityScore + houseBuildSuitability + responseReadiness,
    maxScore
  );

  return {
    contractorId: c.id,
    totalScore: Math.round(totalScore * 10) / 10,
    maxScore,
    breakdown: {
      specialtyMatch: Math.round(specialtyMatch * 10) / 10,
      serviceAreaMatch: Math.round(serviceAreaMatch * 10) / 10,
      verificationScore: Math.round(verificationScore * 10) / 10,
      completenessScore: Math.round(completenessScore * 10) / 10,
      reviewScore: Math.round(reviewScore * 10) / 10,
      activityScore: Math.round(activityScore * 10) / 10,
      houseBuildSuitability: Math.round(houseBuildSuitability * 10) / 10,
      responseReadiness: Math.round(responseReadiness * 10) / 10,
    },
  };
}

export function separateOrganicAndPromoted(
  contractors: readonly ContractorProfile[],
  flags: ContractorFeatureFlags = DEFAULT_FEATURE_FLAGS
): OrganicVsPromotedResults {
  const promoted: ContractorProfile[] = [];
  const featured: ContractorProfile[] = [];
  const organic: ContractorProfile[] = [];

  for (const c of contractors) {
    if (c.verificationStatus === 'suspended') continue;
    if (flags.enablePromotedListings && c.isPromoted) {
      promoted.push(c);
    } else if (flags.enableFeaturedProfiles && c.verificationStatus === 'featured') {
      featured.push(c);
    } else {
      organic.push(c);
    }
  }

  return { organic, promoted, featured };
}

export function rankContractorsByQuality(
  contractors: readonly ContractorProfile[],
  context?: { categoryId?: string; city?: string; stageKey?: string },
  weights?: RankingWeights
): ContractorProfile[] {
  const scored = contractors.map((c) => ({
    contractor: c,
    score: computeQualityScore(c, context, weights),
  }));
  scored.sort((a, b) => b.score.totalScore - a.score.totalScore);
  return scored.map((s) => s.contractor);
}

export function checkProfileHealth(
  c: ContractorProfile,
  reportCount?: number
): ProfileHealthReport {
  const issues: ProfileHealthIssue[] = [];
  const completeness = computeProfileCompleteness(c);

  if (c.specialties.length === 0) {
    issues.push({ type: 'missing-specialties', severity: 'error', message: 'Profil nie ma wybranych specjalizacji.' });
  }
  if (!c.serviceArea || !c.serviceArea.city) {
    issues.push({ type: 'missing-service-area', severity: 'error', message: 'Brak zdefiniowanego zasiegu uslug.' });
  }
  if (!c.shortDescription || c.shortDescription.length < 20) {
    issues.push({ type: 'missing-description', severity: 'warning', message: 'Opis profilu jest zbyt krotki lub pusty.' });
  }
  if (c.verificationStatus === 'unverified') {
    issues.push({ type: 'missing-verification', severity: 'warning', message: 'Profil nie przeszedl zadnej weryfikacji.' });
  }
  if (!c.email && !c.phone) {
    issues.push({ type: 'missing-contact', severity: 'error', message: 'Brak danych kontaktowych.' });
  }
  if (!c.galleryUrls || c.galleryUrls.length === 0) {
    issues.push({ type: 'missing-gallery', severity: 'info', message: 'Brak zdjec w galerii.' });
  }
  if (reportCount && reportCount > 0) {
    issues.push({ type: 'unresolved-reports', severity: 'warning', message: `Profil ma ${reportCount} nierozwiazanych zgloszenie(n).` });
  }

  const isRankable = completeness.percentage >= 40 &&
    c.specialties.length > 0 &&
    !!(c.serviceArea && c.serviceArea.city) &&
    c.verificationStatus !== 'suspended';

  if (!isRankable) {
    issues.push({ type: 'too-incomplete-to-rank', severity: 'error', message: 'Profil jest zbyt niekompletny, aby pojawic sie w wynikach.' });
  }

  return { contractorId: c.id, issues, isRankable, completeness };
}

export function getVerificationTrustLevel(status: VerificationStatus): number {
  return Math.max(0, VERIFICATION_BADGES[status].trustLevel);
}

export function isContractorVerified(status: VerificationStatus): boolean {
  return getVerificationTrustLevel(status) >= 2;
}

export function getCompletionHint(c: ContractorProfile): string | null {
  const comp = computeProfileCompleteness(c);
  if (comp.percentage >= 80) return null;
  if (comp.missing.length === 0) return null;
  return `Uzupelnij: ${comp.missing.slice(0, 2).join(', ')}`;
}
