/** Inert copies of damaged local settings. These records never enter pricing. */
export const PREFERENCE_RECOVERY_PREFIX = 'remont.preference-recovery.v1:';
export const RECOVERABLE_PREFERENCE_PREFIXES = [
  'remont.material-stock.v1:', 'remont.primer-package-choice.v1:', 'remont.mapegum-package-choice.v1:',
] as const;
export const RECOVERY_BACKUP_PREFIXES = RECOVERABLE_PREFERENCE_PREFIXES.map(prefix => PREFERENCE_RECOVERY_PREFIX + prefix);
export const RECOVERY_GLOBAL_KEYS = RECOVERY_BACKUP_PREFIXES.slice(1).map(prefix => prefix + 'renovation-basket');
export interface PreferenceRecoveryRecord { savedAt: string; raw: string }
export interface PreferenceRecoveryArchive { version: 1; records: PreferenceRecoveryRecord[] }
export function recoveryArchiveKey(sourceKey: string): string {
  const prefix = RECOVERABLE_PREFERENCE_PREFIXES.find(prefix => sourceKey.startsWith(prefix));
  const id = prefix ? sourceKey.slice(prefix.length) : '';
  if (!prefix || !id || id.length > 200 || prefix === RECOVERABLE_PREFERENCE_PREFIXES[0] && id === 'renovation-basket') throw Error('invalid_recovery_key');
  return PREFERENCE_RECOVERY_PREFIX + sourceKey;
}
export function parsePreferenceRecovery(raw: string | null): PreferenceRecoveryArchive {
  if (raw === null) return { version: 1, records: [] };
  if (raw.length > 1_000_000) throw Error('invalid_preference_recovery');
  const value = JSON.parse(raw);
  if (!value || Object.keys(value).sort().join(',') !== 'records,version' || value.version !== 1 || !Array.isArray(value.records) || value.records.length > 20) throw Error('invalid_preference_recovery');
  for (const row of value.records) {
    if (!row || Object.keys(row).sort().join(',') !== 'raw,savedAt' || typeof row.raw !== 'string' || typeof row.savedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.savedAt) || !Number.isFinite(Date.parse(row.savedAt))) throw Error('invalid_preference_recovery');
  }
  return value;
}
