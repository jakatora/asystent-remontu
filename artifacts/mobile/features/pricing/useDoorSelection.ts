import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalculationResult } from '@/types/domain';
import { DOOR_SELECTION_PREFIX, parseDoorSelection, type DoorSelection } from './doorSelection';

export function useDoorSelection(projectId: string | undefined, calc: CalculationResult | undefined) {
  const enabled = Boolean(projectId && calc?.jobId === 'interior-doors');
  const key = DOOR_SELECTION_PREFIX + projectId;
  const scope = enabled ? JSON.stringify([key, calc?.measurements]) : '';
  const [state, setState] = useState<{ scope: string; selection: DoorSelection | null }>({ scope: '', selection: null });
  const [readFailed, setReadFailed] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const writes = useRef(Promise.resolve());
  const currentScope = useRef(scope); currentScope.current = scope;
  useEffect(() => {
    if (!enabled || !calc) return;
    let active = true;
    setReadFailed(false); setSaveFailed(false);
    void writes.current.catch(() => {}).then(() => AsyncStorage.getItem(key)).then(raw => {
      if (active) setState({ scope, selection: parseDoorSelection(raw, calc) });
    }).catch(() => { if (active) { setReadFailed(true); setState({ scope, selection: null }); } });
    return () => { active = false; };
  }, [enabled, key, scope, calc]);
  const onChange = useCallback((selection: DoorSelection) => {
    if (!enabled || !calc || !parseDoorSelection(JSON.stringify(selection), calc)) return;
    setState({ scope, selection }); setReadFailed(false); setSaveFailed(false);
    writes.current = writes.current.catch(() => {}).then(() => AsyncStorage.setItem(key, JSON.stringify(selection))).catch(() => { if (currentScope.current === scope) setSaveFailed(true); });
  }, [enabled, key, scope, calc]);
  return { enabled, ready: !enabled || state.scope === scope, selection: state.scope === scope ? state.selection : null, readFailed, saveFailed, onChange };
}
