import { parsePreferenceRecovery, recoveryArchiveKey } from './preferenceRecovery';
export interface PreferenceStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> }
export function createRecoverablePreferenceStorage<T>(prefix: string, parse: (raw: string | null) => T, empty: T, validId: (id: string) => boolean, invalidProject: string) {
  const writes = new WeakMap<PreferenceStorage, Map<string, Promise<unknown>>>();
  const check = (id: string) => { if (!validId(id)) throw Error(invalidProject); };
  async function wait(storage: PreferenceStorage, id: string) { await writes.get(storage)?.get(id); }
  async function read(storage: PreferenceStorage, id: string) { await wait(storage, id); return parse(await storage.getItem(prefix + id)); }
  function enqueue<R>(storage: PreferenceStorage, id: string, task: () => Promise<R>): Promise<R> {
    check(id);
    const queue = writes.get(storage) ?? new Map<string, Promise<unknown>>(); writes.set(storage, queue);
    const pending = (queue.get(id) ?? Promise.resolve()).catch(() => {}).then(task); queue.set(id, pending);
    return pending.finally(() => { if (queue.get(id) === pending) queue.delete(id); });
  }
  async function write(storage: PreferenceStorage, id: string, value: T) {
    check(id);
    const raw = JSON.stringify(value), validated = parse(raw);
    return enqueue(storage, id, async () => { await storage.setItem(prefix + id, raw); return validated; });
  }
  async function recover(storage: PreferenceStorage, id: string): Promise<{ value: T; reset: boolean }> {
    return enqueue(storage, id, async () => {
      const key = prefix + id, raw = await storage.getItem(key);
      // A transient read error or an already repaired setting needs no reset.
      try { return { value: parse(raw), reset: false }; } catch { /* Preserve the exact invalid value before replacing it. */ }
      if (raw === null) throw Error('preference_recovery_unconfirmed');
      const archiveKey = recoveryArchiveKey(key), previous = await storage.getItem(archiveKey), archive = parsePreferenceRecovery(previous);
      if (!archive.records.some(record => record.raw === raw)) archive.records.push({ savedAt: new Date().toISOString(), raw });
      const archiveRaw = JSON.stringify(archive); parsePreferenceRecovery(archiveRaw);
      await storage.setItem(archiveKey, archiveRaw);
      if (await storage.getItem(archiveKey) !== archiveRaw) throw Error('preference_archive_unconfirmed');
      if (await storage.getItem(key) !== raw) throw Error('preference_changed_during_recovery');
      const replacement = JSON.stringify(empty), validated = parse(replacement);
      await storage.setItem(key, replacement);
      if (await storage.getItem(key) !== replacement) throw Error('preference_recovery_unconfirmed');
      return { value: validated, reset: true };
    });
  }
  return { wait, read, write, recover };
}
