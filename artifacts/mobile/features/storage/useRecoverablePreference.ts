import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PreferenceStorage } from './recoverablePreferenceStorage';
interface Persistence<T> {
  read(storage: PreferenceStorage, id: string): Promise<T>;
  write(storage: PreferenceStorage, id: string, value: T): Promise<T>;
  recover(storage: PreferenceStorage, id: string): Promise<{ value: T; reset: boolean }>;
}
export function useRecoverablePreference<T>(key: string, enabled: boolean, storage: Persistence<T>, empty: T) {
  const scope = useRef({ key, enabled });
  if (scope.current.key !== key || scope.current.enabled !== enabled) scope.current = { key, enabled };
  const pending = useRef<object | null>(null);
  const [state, setState] = useState<{ key: string; value: T }>({ key: '', value: empty });
  const [failedKey, setFailedKey] = useState<string | null>(null), [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false), [recovering, setRecovering] = useState(false), [recoveryFailed, setRecoveryFailed] = useState(false), [recovered, setRecovered] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setFailedKey(null); setSaveFailed(false); setSaving(false); setRecovering(false); setRecoveryFailed(false); setRecovered(false); setState({ key: '', value: empty });
    void storage.read(AsyncStorage, key).then(value => { if (active) setState({ key, value }); }).catch(() => { if (active) setFailedKey(key); });
    return () => { active = false; };
  }, [key, enabled, retry, storage, empty]);
  useEffect(() => () => { scope.current = { key: '', enabled: false }; }, []);
  const readFailed = enabled && failedKey === key, ready = !enabled || state.key === key && !readFailed;
  const value = enabled && state.key === key ? state.value : empty;
  const onChange = useCallback(async (next: T) => {
    if (!enabled || !ready || pending.current || saving) return false;
    if (JSON.stringify(next) === JSON.stringify(value)) return true;
    const operation = {}, currentScope = scope.current; pending.current = operation; setSaving(true); setSaveFailed(false); setRecovered(false);
    try { const saved = await storage.write(AsyncStorage, key, next); if (scope.current === currentScope) setState({ key, value: saved }); return true; }
    catch { if (scope.current === currentScope) setSaveFailed(true); return false; }
    finally { if (pending.current === operation) pending.current = null; if (scope.current === currentScope) setSaving(false); }
  }, [enabled, ready, saving, key, value, storage]);
  const onRecover = useCallback(async () => {
    if (!enabled || !readFailed || pending.current) return false;
    const operation = {}, currentScope = scope.current; pending.current = operation; setRecovering(true); setRecoveryFailed(false);
    try {
      const result = await storage.recover(AsyncStorage, key);
      if (scope.current === currentScope) { setState({ key, value: result.value }); setFailedKey(null); setRecovered(result.reset); }
      return true;
    } catch { if (scope.current === currentScope) setRecoveryFailed(true); return false; }
    finally { if (pending.current === operation) pending.current = null; if (scope.current === currentScope) setRecovering(false); }
  }, [enabled, readFailed, key, storage]);
  return { value, ready, readFailed, saveFailed, saving, onChange, recoveryKey: key, recovering, recoveryFailed, recovered, onRecover, onRetry: () => { if (!pending.current) setRetry(n => n + 1); } };
}
