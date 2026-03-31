/**
 * Backward-compatibility barrel.
 * Job registry now lives in features/content/registry.ts.
 * Screens continue to import from '@/data/jobs'.
 */
export { ALL_JOBS, getJobById, getJobsByCategory, searchJobs } from '@/features/content/registry';
export type { RenovationJob } from '@/types/domain';
