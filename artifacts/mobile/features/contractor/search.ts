import type {
  ContractorProfile,
  ContractorSearchFilters,
  ContractorSortOption,
} from '@/types/contractor';

export function filterContractors(
  contractors: readonly ContractorProfile[],
  filters: ContractorSearchFilters,
): ContractorProfile[] {
  return contractors.filter((c) => {
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
    if (filters.verifiedOnly && c.verificationStatus !== 'verified') return false;
    if (filters.availableSoon && !c.availableSoon) return false;
    if (filters.minRating && (c.rating ?? 0) < filters.minRating) return false;
    if (filters.showPromoted === false && c.isPromoted) return false;
    if (filters.jobScale && !c.jobScales.includes(filters.jobScale)) return false;
    return true;
  });
}

export function sortContractors(
  contractors: ContractorProfile[],
  sort: ContractorSortOption,
): ContractorProfile[] {
  const copy = [...contractors];

  switch (sort) {
    case 'promoted':
      return copy.sort((a, b) => {
        if (a.isPromoted !== b.isPromoted) return a.isPromoted ? -1 : 1;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
    case 'rating':
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'verified-first':
      return copy.sort((a, b) => {
        const av = a.verificationStatus === 'verified' ? 0 : 1;
        const bv = b.verificationStatus === 'verified' ? 0 : 1;
        if (av !== bv) return av - bv;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
    case 'newest':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'nearest':
      return copy.sort((a, b) => (a.serviceArea.radiusKm ?? 999) - (b.serviceArea.radiusKm ?? 999));
    case 'best-match':
    default:
      return copy.sort((a, b) => {
        let scoreA = (a.rating ?? 0) * 10 + a.reviewCount;
        let scoreB = (b.rating ?? 0) * 10 + b.reviewCount;
        if (a.verificationStatus === 'verified') scoreA += 20;
        if (b.verificationStatus === 'verified') scoreB += 20;
        if (a.availableSoon) scoreA += 10;
        if (b.availableSoon) scoreB += 10;
        if (a.isPromoted) scoreA += 15;
        if (b.isPromoted) scoreB += 15;
        return scoreB - scoreA;
      });
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
    if (categoryId && !c.specialties.some((s) => s.categoryId === categoryId)) return false;
    if (city) {
      const q = city.toLowerCase();
      if (!c.city.toLowerCase().includes(q) &&
          !c.serviceArea.city.toLowerCase().includes(q)) return false;
    }
    return true;
  }).length;
}
