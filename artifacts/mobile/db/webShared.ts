import { DATABASE_METHODS, DATABASE_RUN_RESULT_FORMAT, queuedDatabase, type DatabaseConnection, type DatabaseMethod } from './connection';

// source: https://github.com/expo/expo/issues/36835
// AccessHandlePoolVFS holds exclusive handles for the worker's whole lifetime.
// Keep one real connection; other tabs use RPC instead of opening another VFS.
// source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
// source: https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
export const DATABASE_CHANNEL = 'remont.sqlite.v1:remont_v2.db';
type Channel = Pick<BroadcastChannel, 'postMessage' | 'onmessage' | 'close'>;
export interface SharedDatabaseHost {
  id: string; channel: Channel;
  claim(task: () => Promise<void>, signal: AbortSignal): Promise<unknown>;
  isOwner(id: string): Promise<boolean>;
  timeoutMs?: number;
}
type Message = { version: 1; from: string; to?: string; type: string; id?: string; method?: DatabaseMethod; args?: unknown[]; value?: unknown; error?: string };
type Pending = { owner: string; resolve: (value: any) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> };

export function browserDatabaseHost(): SharedDatabaseHost {
  if (typeof window === 'undefined' || !navigator.locks || typeof BroadcastChannel === 'undefined') throw Error('shared_database_browser_unsupported');
  const id = crypto.randomUUID(), marker = (owner: string) => DATABASE_CHANNEL + ':owner:' + owner;
  return { id, channel: new BroadcastChannel(DATABASE_CHANNEL),
    claim: (task, signal) => navigator.locks.request(DATABASE_CHANNEL, { mode: 'exclusive', signal },
      () => navigator.locks.request(marker(id), { mode: 'exclusive', signal }, task)),
    isOwner: async owner => (await navigator.locks.query()).held?.some(lock => lock.name === marker(owner)) === true };
}

export function sharedWebDatabase(open: () => Promise<Parameters<typeof queuedDatabase>[0]>, host: SharedDatabaseHost = browserDatabaseHost()) {
  const { id, channel } = host, timeoutMs = host.timeoutMs ?? 20_000;
  const abort = new AbortController(), pending = new Map<string, Pending>(), listeners = new Set<() => void>();
  const readyWaiters = new Set<{ resolve: () => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  const handled = new Map<string, Promise<{ value?: unknown; error?: string }>>();
  const completed: string[] = [];
  let executing = 0;
  let owner: string | null = null, local: DatabaseConnection | null = null, starting = false, failed: string | null = null, closed = false, sequence = 0;
  let announcementSequence = 0, appliedAnnouncement = 0;
  const send = (message: Omit<Message, 'version' | 'from'>) => { if (!closed) channel.postMessage({ version: 1, from: id, ...message }); };
  const notify = () => {
    for (const listener of listeners) { try { listener(); } catch (error) { console.error('[Database] change listener:', error); } }
  };
  const failPending = (reason: string) => {
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(Error(reason)); }
    pending.clear();
  };
  const settleReady = () => {
    for (const waiter of readyWaiters) { clearTimeout(waiter.timer); failed ? waiter.reject(Error(failed)) : waiter.resolve(); }
    readyWaiters.clear();
  };
  const setOwner = (next: string) => {
    if (owner && owner !== next) failPending('database_connection_changed_check_saved_changes');
    owner = next;
  };
  const ready = (): Promise<void> => {
    if (closed) return Promise.reject(Error('database_connection_closed'));
    if (failed) return Promise.reject(Error(failed));
    if (owner && !starting) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject, timer: setTimeout(() => { readyWaiters.delete(waiter); reject(Error('database_connection_timeout')); }, timeoutMs) };
      readyWaiters.add(waiter); send({ type: 'hello' });
    });
  };
  const execute = (method: DatabaseMethod, args: unknown[]) => {
    if (!local) return Promise.reject(Error('database_not_ready'));
    return (local[method] as (...values: unknown[]) => Promise<unknown>)(...args);
  };
  const invoke = async (method: DatabaseMethod, args: unknown[]) => {
    await ready();
    if (local && owner === id) return execute(method, args);
    if (pending.size >= 128) throw Error('database_busy');
    const requestId = id + ':' + ++sequence, target = owner!;
    // A lost reply may follow a committed write. Never resend SQL automatically.
    return new Promise((resolve, reject) => {
      pending.set(requestId, { owner: target, resolve, reject, timer: setTimeout(() => {
        pending.delete(requestId); reject(Error('database_request_timeout_check_saved_changes'));
      }, timeoutMs) });
      try { send({ type: 'request', to: target, id: requestId, method, args }); }
      catch (error) { const request = pending.get(requestId); if (request) clearTimeout(request.timer); pending.delete(requestId); reject(error); }
    });
  };
  const connection = Object.fromEntries(DATABASE_METHODS.map(method => [method, (...args: unknown[]) => invoke(method, args)])) as DatabaseConnection;

  channel.onmessage = event => {
    const message = event.data as Message;
    if (closed || !message || message.version !== 1 || typeof message.from !== 'string' || message.from === id || message.to && message.to !== id) return;
    if (message.type === 'hello' && local && owner === id) send({ type: 'ready', to: message.from });
    else if (message.type === 'hello' && failed && owner === id) send({ type: 'failed', to: message.from, error: failed });
    else if (['starting', 'ready', 'failed'].includes(message.type)) {
      const announcement = ++announcementSequence;
      // Broadcasts can arrive after their sender's tab has closed. Confirm the
      // current lease in Web Locks, and never let a slower old check undo a new
      // verified owner. Invalid late messages do not suppress a valid result.
      void host.isOwner(message.from).then(valid => {
        if (!valid || closed || announcement < appliedAnnouncement) return;
        appliedAnnouncement = announcement; setOwner(message.from);
        starting = message.type === 'starting'; failed = message.type === 'failed' ? message.error ?? 'database_open_failed' : null;
        if (failed) failPending(failed);
        if (!starting) { settleReady(); if (!failed) notify(); }
      }).catch(() => {});
    }
    else if (message.type === 'changed' && message.from === owner) notify();
    else if (message.type === 'result' && message.id) {
      const request = pending.get(message.id);
      if (!request || request.owner !== message.from) return;
      clearTimeout(request.timer); pending.delete(message.id);
      message.error ? request.reject(Error(message.error)) : request.resolve(message.value);
    } else if (message.type === 'request' && local && owner === id && typeof message.id === 'string' && message.id.startsWith(message.from + ':') &&
      DATABASE_METHODS.includes(message.method as DatabaseMethod) && Array.isArray(message.args)) {
      const key = message.from + '/' + message.id;
      let task = handled.get(key);
      if (!task) {
        if (executing >= 128) { send({ type: 'result', to: message.from, id: message.id, error: 'database_busy' }); return; }
        executing++;
        task = execute(message.method!, message.args).then(value => ({ value }), error => ({ error: error instanceof Error ? error.message : 'database_query_failed' }));
        handled.set(key, task);
        void task.then(() => {
          executing--; completed.push(key);
          if (completed.length > 256) handled.delete(completed.shift()!);
        });
      }
      void task.then(result => send({ type: 'result', to: message.from, id: message.id, ...result }));
    }
  };

  // Do not release ownership while a live worker still owns its OPFS handles.
  // The browser releases this lock on tab destruction; a waiting tab then opens
  // a fresh connection and announces itself. No VFS/layout/schema migration.
  void host.claim(async () => {
    if (closed) return;
    setOwner(id); starting = true; failed = null; send({ type: 'starting' });
    try {
      const raw = await open();
      local = queuedDatabase(raw, () => { notify(); send({ type: 'changed' }); });
      console.info('[Database] Shared browser connection ready');
      starting = false; settleReady(); send({ type: 'ready' });
    } catch (error) {
      starting = false; failed = error instanceof Error ? error.message : 'database_open_failed'; settleReady(); send({ type: 'failed', error: failed });
    }
    await new Promise<void>(() => {});
  }, abort.signal).catch(error => { if (!closed) { failed = error instanceof Error ? error.message : 'database_lock_failed'; settleReady(); } });
  send({ type: 'hello' });
  return { connection, ready, runResultFormat:DATABASE_RUN_RESULT_FORMAT, subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispose: () => { closed = true; abort.abort(); channel.close(); failPending('database_connection_closed'); failed = 'database_connection_closed'; settleReady(); listeners.clear(); } };
}
