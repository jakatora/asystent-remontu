/** The API can provide either delay-seconds or an HTTP-date.
 * source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After
 */
export function retryAfterDeadline(value: string | null, now: number): number {
  const raw = value?.trim() ?? '';
  if (/^\d+$/.test(raw)) {
    const delay = Number(raw) * 1000;
    if (Number.isSafeInteger(delay) && Number.isSafeInteger(now + delay)) return now + delay;
  }
  // Reject Date.parse's permissive interpretation of malformed numeric values.
  if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),/.test(raw)) {
    const date = Date.parse(raw);
    if (Number.isFinite(date)) return Math.max(now, date);
  }
  // The shared API has a 60-second window; absent/unreadable headers fail closed.
  return now + 60_000;
}

export class RequestBackoff {
  private deadline = 0;
  remainingDeadline(now = Date.now()): number | null {
    return this.deadline > now ? this.deadline : null;
  }
  observe(value: string | null, now = Date.now()): number {
    this.deadline = Math.max(this.deadline, retryAfterDeadline(value, now));
    return this.deadline;
  }
}

export class ApiError extends Error {
  readonly name = 'ApiError';
  constructor(readonly status: number, message: string, readonly code: string | null = null, readonly retryAt: number | null = null) {
    super(message);
  }
}

/** One gate for project estimates and product history. Never retries by itself. */
export function createBackoffFetch(fetcher: typeof fetch, now: () => number = Date.now): typeof fetch {
  const backoff = new RequestBackoff();
  return async (input, init) => {
    const deadline = backoff.remainingDeadline(now());
    if (deadline !== null) throw new ApiError(429, 'HTTP 429', null, deadline);
    const response = await fetcher(input, init);
    if (response.status === 429) throw new ApiError(429, 'HTTP 429', null, backoff.observe(response.headers.get('retry-after'), now()));
    return response;
  };
}
