/**
 * Backward-compatibility barrel.
 * DB logic now lives in db/ (repositories, client, migrations).
 * AppContext imports directly from there; this file is kept for any
 * external code that still imports from '@/storage/database'.
 */
export { getDb as getDatabase } from '@/db/client';
export { projectsRepo, shoppingRepo, onboardingRepo } from '@/db/index';
