const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export type ErrorReportingStatus = 'starting' | 'active' | 'disabled' | 'unavailable';
export const initialErrorReportingStatus: ErrorReportingStatus = DSN ? 'starting' : 'disabled';

type SentrySdk = typeof import('@sentry/react-native');
let sentry: SentrySdk | undefined;
let initialization: Promise<ErrorReportingStatus> | undefined;

export async function initSentry(): Promise<ErrorReportingStatus> {
  if (!DSN) return 'disabled';
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
    const client = sdk.getClient();
    if (!client?.getDsn() || client.getOptions().enabled === false) return 'unavailable';
    sentry = sdk;
    return 'active';
  }).catch(() => 'unavailable');
  return initialization;
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  const report = () => {
    const operation = context?.context;
    if (sentry) {
      sentry.captureException(error, typeof operation === 'string' ? { tags: { operation } } : undefined);
    } else {
      console.error('[Error]', error, context);
    }
  };
  if (DSN && !sentry) void initSentry().then(report);
  else report();
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (sentry) {
    sentry.captureMessage(message, level);
  } else {
    console.warn(`[${level.toUpperCase()}]`, message);
  }
}
