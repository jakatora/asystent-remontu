const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const isSentryConfigured = Boolean(DSN);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _Sentry: any = null;

async function loadSentry() {
  if (!DSN || _Sentry) return;
  try {
    // @ts-ignore — optional peer dependency, may not be installed
    _Sentry = await import('@sentry/react-native');
  } catch {
    // Sentry native module not available — graceful fallback
  }
}

export async function initSentry() {
  await loadSentry();
  if (!_Sentry || !DSN) return;
  _Sentry.init({
    dsn: DSN,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.2,
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (_Sentry) {
    _Sentry.captureException(error, { extra: context });
  } else {
    console.error('[Error]', error, context);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (_Sentry) {
    _Sentry.captureMessage(message, level);
  } else {
    console.warn(`[${level.toUpperCase()}]`, message);
  }
}
