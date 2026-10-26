import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NO_PRODUCT_CHOICES, type ProductChoice } from './productChoice';

export function useProductChoices<T extends ProductChoice>(prefix: string, projectId: string | undefined, enabled: boolean, parse: (raw: string | null) => T[]) {
  const key = prefix + (projectId ?? 'preview');
  const [saved, setSaved] = useState<{ key: string; choices: readonly T[] }>({ key: '', choices: NO_PRODUCT_CHOICES });
  const [readFailed, setReadFailed] = useState(false), [saveFailed, setSaveFailed] = useState(false), [retry, setRetry] = useState(0);
  const writes = useRef(Promise.resolve());
  const currentKey = useRef(key); currentKey.current = key;
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setReadFailed(false); setSaveFailed(false);
    setSaved(value => ({ ...value, key: '' }));
    void writes.current.then(() => AsyncStorage.getItem(key)).then(raw => {
      const choices = parse(raw);
      if (active) setSaved({ key, choices });
    }).catch(() => { if (active) setReadFailed(true); });
    return () => { active = false; };
  }, [key, enabled, retry, parse]);
  const ready = !enabled || saved.key === key && !readFailed;
  const choices = enabled && saved.key === key ? saved.choices : NO_PRODUCT_CHOICES;
  const onChange = useCallback((next: readonly T[]) => {
    if (!enabled || !ready || currentKey.current !== key) return;
    const serialized = JSON.stringify({ version: 1, choices: next });
    const validated = parse(serialized);
    setSaved({ key, choices: validated }); setSaveFailed(false);
    writes.current = writes.current.catch(() => {}).then(() => AsyncStorage.setItem(key, serialized))
      .catch(() => { if (currentKey.current === key) setSaveFailed(true); });
  }, [enabled, ready, key, parse]);
  return { enabled, ready, choices, readFailed: enabled && readFailed, saveFailed: enabled && saveFailed, onChange, onRetry: () => setRetry(value => value + 1) };
}
