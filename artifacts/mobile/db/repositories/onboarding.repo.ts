import { getDb } from '../client';
import type { OnboardingRow } from '@/types/db';
import { nowISO } from '@/shared/lib/date';

export const onboardingRepo = {
  async isCompleted(): Promise<boolean> {
    const db = await getDb();
    const row = await db.getFirstAsync<OnboardingRow>(
      'SELECT id FROM onboarding_completed LIMIT 1'
    );
    return row !== null;
  },

  async markCompleted(): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR IGNORE INTO onboarding_completed (id, completed_at) VALUES (1, ?)',
      [nowISO()]
    );
  },
};
