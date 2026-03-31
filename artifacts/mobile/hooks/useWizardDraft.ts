import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Draft state ──────────────────────────────────────────────────────────────

export type WizardCondition   = 'poor' | 'fair' | 'good';
export type WizardDesired     = 'refresh' | 'standard' | 'complete';
export type WizardBudget      = 'economy' | 'standard' | 'premium';
export type WizardDiyMode     = 'diy' | 'compare' | 'hire';

export interface WizardDraft {
  categoryId:    string | null;
  room:          string | null;
  jobId:         string | null;
  condition:     WizardCondition | null;
  desiredResult: WizardDesired | null;
  budgetLevel:   WizardBudget | null;
  diyMode:       WizardDiyMode | null;
  measurements:  Record<string, string>;
  projectName:   string;
  /** Last modified ISO timestamp */
  savedAt:       string | null;
}

const DRAFT_KEY = 'wizard_draft_v2';

const EMPTY: WizardDraft = {
  categoryId:    null,
  room:          null,
  jobId:         null,
  condition:     null,
  desiredResult: null,
  budgetLevel:   null,
  diyMode:       null,
  measurements:  {},
  projectName:   '',
  savedAt:       null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWizardDraft() {
  const [draft, setDraftState] = useState<WizardDraft>(EMPTY);
  const [loaded, setLoaded]   = useState(false);

  // Load on mount
  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as WizardDraft;
            setDraftState(parsed);
          } catch {
            // ignore corrupt draft
          }
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  // Persist on change (after initial load)
  const setDraft = useCallback((updater: (prev: WizardDraft) => WizardDraft) => {
    setDraftState((prev) => {
      const next = updater(prev);
      const withTs: WizardDraft = { ...next, savedAt: new Date().toISOString() };
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(withTs)).catch(() => {});
      return withTs;
    });
  }, []);

  const clearDraft = useCallback(() => {
    setDraftState(EMPTY);
    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
  }, []);

  const patchDraft = useCallback(
    (patch: Partial<WizardDraft>) => setDraft((prev) => ({ ...prev, ...patch })),
    [setDraft]
  );

  const hasDraft = loaded && (
    draft.categoryId !== null ||
    draft.jobId !== null ||
    draft.measurements && Object.keys(draft.measurements).length > 0
  );

  return { draft, patchDraft, setDraft, clearDraft, loaded, hasDraft };
}
