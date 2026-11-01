import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type MaterialStockEntry } from './materialStock';
import { readMaterialStock, writeMaterialStock } from './materialStockStorage';
const EMPTY: readonly MaterialStockEntry[] = [];
export function useMaterialStock(projectId: string | undefined, enabled: boolean) {
  const key = projectId ?? '', current = useRef(key); current.current = key;
  const [state, setState] = useState<{ key: string; entries: readonly MaterialStockEntry[] }>({ key: '', entries: EMPTY });
  const [readFailed, setReadFailed] = useState(false), [saveFailed, setSaveFailed] = useState(false), [saving, setSaving] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true; setReadFailed(false); setSaveFailed(false); setSaving(false); setState({ key: '', entries: EMPTY });
    void readMaterialStock(AsyncStorage, key).then(entries => { if (active) setState({ key, entries }); }).catch(() => { if (active) setReadFailed(true); });
    return () => { active = false; if (current.current === key) current.current = ''; };
  }, [key, enabled, retry]);
  const ready = !enabled || state.key === key && !readFailed;
  const entries = enabled && state.key === key ? state.entries : EMPTY;
  const onChange = useCallback(async (next: readonly MaterialStockEntry[]) => {
    if (!enabled || !ready || saving || current.current !== key) return false;
    if (JSON.stringify(next) === JSON.stringify(entries)) return true;
    setSaving(true); setSaveFailed(false);
    try {
      const saved = await writeMaterialStock(AsyncStorage, key, next);
      if (current.current === key) setState({ key, entries: saved });
      return true;
    } catch { if (current.current === key) setSaveFailed(true); return false; }
    finally { if (current.current === key) setSaving(false); }
  }, [enabled, ready, saving, key, entries]);
  return { entries, ready, readFailed: enabled && readFailed, saveFailed, saving, onChange, onRetry: () => setRetry(n => n + 1) };
}
