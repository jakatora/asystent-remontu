import { useMemo } from 'react';
import {
  ALL_JOBS,
  CATEGORIES,
  getJobById,
  getJobsByCategory,
  searchJobs,
} from '@/features/content/registry';
import type { RenovationJob, RenovationCategory } from '@/types/domain';

// ─── All content (synchronous — static data) ─────────────────────────────────

export function useAllJobs(): readonly RenovationJob[] {
  return ALL_JOBS;
}

export function useAllCategories(): readonly RenovationCategory[] {
  return CATEGORIES;
}

export function useJob(id: string | undefined): RenovationJob | undefined {
  return useMemo(() => (id ? getJobById(id) : undefined), [id]);
}

export function useJobsByCategory(categoryId: string | undefined): RenovationJob[] {
  return useMemo(
    () => (categoryId ? getJobsByCategory(categoryId) : []),
    [categoryId]
  );
}

export function useCategory(id: string | undefined): RenovationCategory | undefined {
  return useMemo(
    () => (id ? CATEGORIES.find((c) => c.id === id) : undefined),
    [id]
  );
}

export function useJobSearch(query: string): RenovationJob[] {
  return useMemo(
    () => (query.trim().length > 0 ? searchJobs(query.trim()) : []),
    [query]
  );
}
