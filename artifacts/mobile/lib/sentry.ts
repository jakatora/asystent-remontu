const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const isSentryConfigured = Boolean(DSN);

type SentrySdk = typeof import('@sentry/react-native');
let sentry: SentrySdk | undefined;
let initialization: Promise<void> | undefined;

export async function initSentry(): Promise<void> {
  if (!DSN) return;
  const dsn = DSN;
  initialization ??= import('@sentry/react-native').then(sdk => {
    sdk.init({
      dsn,
      environment: __DEV__ ? 'development' : 'production',
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeBreadcrumb: () => null,
      beforeSend(event) {
        delete event.user;
        delete event.request;
        return event;
      },
    });
    sentry = sdk;
  }).catch(error => {
    initialization = undefined;
    throw error;
  });
  await initialization;
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  const operation = context?.context;
  if (sentry) {
    sentry.captureException(error, typeof operation === 'string' ? { tags: { operation } } : undefined);
  } else {
    console.error('[Error]', error, context);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (sentry) {
    sentry.captureMessage(message, level);
  } else {
    console.warn(`[${level.toUpperCase()}]`, message);
  }
}
