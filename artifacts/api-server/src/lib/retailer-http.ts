import { DELIVERY_LIMITS } from '../../../../lib/pricing-service/src/delivery-limits';
export const MAX_RETAIL_PACKAGES = DELIVERY_LIMITS.packagesPerProduct;
export function retailerRequestBudget(productCount: number): number {
  if (!Number.isSafeInteger(productCount) || productCount < 1 || productCount > DELIVERY_LIMITS.products) throw Error('invalid_basket');
  // Main product + add per line, checkout and up to five shipping methods;
  // redirects remain bounded independently by read().
  return Math.min(1000,(productCount*2+10)*4);
}

/** An isolated anonymous basket, restricted to one reviewed origin. Never uses
 * client cookies, submits customer details, agrees to terms or places orders. */
export class AnonymousShop {
  private cookies = new Map<string, string>();
  private calls = 0;
  constructor(private origin: string, private fetchImpl: typeof fetch, private signal: AbortSignal, private maxCalls = 30) {}
  async json(path: string, body?: object): Promise<any> {
    return JSON.parse(await this.read(path, body ? JSON.stringify(body) : undefined, true));
  }
  async text(path: string, form?: Record<string, string>): Promise<string> {
    return this.read(path, form ? new URLSearchParams(form).toString() : undefined, false);
  }
  private async read(path: string, payload: string | undefined, json: boolean): Promise<string> {
    let url = new URL(path, this.origin), method = payload ? 'POST' : 'GET';
    for (let i = 0; i < 4; i++) {
      if (url.origin !== this.origin) throw Error('invalid_redirect');
      if (++this.calls > this.maxCalls) throw Error('request_limit');
      const cookie = [...this.cookies].map(([k,v]) => `${k}=${v}`).join('; ');
      if (cookie.length > 8192 || this.cookies.size > 64) throw Error('invalid_cookie_size');
      const r = await this.fetchImpl(url, { method, body: payload, signal: this.signal, redirect: 'manual',
        headers: { 'User-Agent': 'AsystentRemontu/1.0', Accept: json ? 'application/json' : 'text/html, application/json', Cookie: cookie,
          ...(payload ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) } });
      for (const entry of r.headers.getSetCookie()) {
        const pair = entry.split(';')[0], eq = pair.indexOf('=');
        if (eq > 0) this.cookies.set(pair.slice(0,eq), pair.slice(eq+1));
      }
      if ([301,302,303,307,308].includes(r.status)) {
        const target = r.headers.get('location'); await r.body?.cancel();
        if (!target) throw Error('invalid_redirect'); url = new URL(target, url);
        if ([301,302,303].includes(r.status)) { method = 'GET'; payload = undefined; } continue;
      }
      if (!r.ok) { await r.body?.cancel(); throw Error('retailer_unavailable'); }
      if (json && !r.headers.get('content-type')?.includes('json')) { await r.body?.cancel(); throw Error('invalid_response'); }
      const reader = r.body?.getReader(); if (!reader) throw Error('invalid_response');
      const chunks: Uint8Array[] = []; let size = 0;
      try {
        while (true) { const { done, value } = await reader.read(); if (done) break;
          size += value.byteLength; if (size > 1_000_000) throw Error('response_too_large'); chunks.push(value); }
      } finally { await reader.cancel().catch(() => {}); }
      return Buffer.concat(chunks).toString('utf8');
    }
    throw Error('invalid_redirect');
  }
}
