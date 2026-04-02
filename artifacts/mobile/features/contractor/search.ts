import type {
  ContractorProfile,
  ContractorSearchFilters,
  ContractorSortOption,
} from '@/types/contractor';
import { isContractorVerified, computeQualityScore, separateOrganicAndPromoted } from './contractor-trust';

export function filterContractors(
  contractors: readonly ContractorProfile[],
  filters: ContractorSearchFilters,
): ContractorProfile[] {
  return contractors.filter((c) => {
    if (c.verificationStatus === 'suspended') return false;
    if (filters.categoryId) {
      const match = c.specialties.some((s) => s.categoryId === filters.categoryId);
      if (!match) return false;
    }
    if (filters.city) {
      const q = filters.city.toLowerCase();
      if (!c.city.toLowerCase().includes(q) &&
          !c.serviceArea.city.toLowerCase().includes(q) &&
          !(c.serviceArea.regions ?? []).some((r) => r.toLowerCase().includes(q))) {
        return false;
      }
    }
    if (filters.verifiedOnly && !isContractorVerified(c.verificationStatus)) return false;
    if (filters.availableSoon && !c.availableSoon) return false;
    if (filters.minRating && (c.rating ?? 0) < filters.minRating) return false;
    if (filters.showPromoted === false && c.isPromoted) return false;
    if (filters.jobScale && !c.jobScales.includes(filters.jobScale)) return false;
    if (filters.houseBuildStageKey) {
      if (!c.suitableForHouseBuildStages || !c.suitableForHouseBuildStages.includes(filters.houseBuildStageKey)) return false;
    }
    return true;
  });
}

export function sortContractors(
  contractors: ContractorProfile[],
  sort: ContractorSortOption,
  context?: { categoryId?: string; city?: string; stageKey?: string },
): ContractorProfile[] {
  const copy = [...contractors];

  switch (sort) {
    case 'quality-score': {
      const scored = copy.map((c) => ({
        contractor: c,
        score: computeQualityScore(c, context),
      }));
      scored.sort((a, b) => b.score.totalScore - a.score.totalScore);
      return scored.map((s) => s.contractor);
    }
    case 'promoted':
      return copy.sort((a, b) => {
        if (a.isPromoted !== b.isPromoted) return a.isPromoted ? -1 : 1;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
    case 'rating':
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'verified-first':
      return copy.sort((a, b) => {
        const av = isContractorVerified(a.verificationStatus) ? 0 : 1;
        const bv = isContractorVerified(b.verificationStatus) ? 0 : 1;
        if (av !== bv) return av - bv;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
    case 'newest':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'nearest':
      return copy.sort((a, b) => (a.serviceArea.radiusKm ?? 999) - (b.serviceArea.radiusKm ?? 999));
    case 'best-match':
    default: {
      const scored = copy.map((c) => ({
        contractor: c,
        score: computeQualityScore(c, context),
      }));
      scored.sort((a, b) => {
        if (a.contractor.isPromoted !== b.contractor.isPromoted) {
          return a.contractor.isPromoted ? -1 : 1;
        }
        return b.score.totalScore - a.score.totalScore;
      });
      return scored.map((s) => s.contractor);
    }
  }
}

export function searchContractorsByText(
  contractors: readonly ContractorProfile[],
  query: string,
): ContractorProfile[] {
  if (!query.trim()) return [...contractors];
  const q = query.toLowerCase();
  return contractors.filter(
    (c) =>
      c.displayName.toLowerCase().includes(q) ||
      c.shortDescription.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.specialties.some((s) => s.categoryName.toLowerCase().includes(q)),
  );
}

export function countMatchingContractors(
  contractors: readonly ContractorProfile[],
  categoryId?: string,
  city?: string,
): number {
  return contractors.filter((c) => {
    if (c.verificationStatus === 'suspended') return false;
    if (categoryId && !c.specialties.some((s) => s.categoryId === categoryId)) return false;
    if (city) {
      const q = city.toLowerCase();
      if (!c.city.toLowerCase().includes(q) &&
          !c.serviceArea.city.toLowerCase().includes(q)) return false;
    }
    return true;
  }).length;
}

export function filterAndSeparateResults(
  contractors: readonly ContractorProfile[],
  filters: ContractorSearchFilters,
  sort: ContractorSortOption,
  searchQuery: string,
  blockedIds?: Set<string>,
) {
  let result = searchContractorsByText(contractors, searchQuery);
  result = filterContractors(result, filters);

  if (blockedIds && blockedIds.size > 0 && filters.excludeBlocked !== false) {
    result = result.filter((c) => !blockedIds.has(c.id));
  }

  const separated = separateOrganicAndPromoted(result);
  const context = {
    categoryId: filters.categoryId,
    city: filters.city,
    stageKey: filters.houseBuildStageKey,
  };

  return {
    promoted: sortContractors([...separated.promoted], sort, context),
    featured: sortContractors([...separated.featured], sort, context),
    organic: sortContractors([...separated.organic], sort, context),
    totalCount: result.length,
  };
}
