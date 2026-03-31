/**
 * Backward-compatibility barrel.
 * Categories are now auto-derived from the job registry.
 * Screens continue to import from '@/data/categories'.
 */
export { CATEGORIES } from '@/features/content/registry';
export type { RenovationCategory } from '@/types/domain';
