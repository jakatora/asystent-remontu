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
  private storeCartToken: string | null = null;
  constructor(private origin: string, private fetchImpl: typeof fetch, private signal: AbortSignal, private maxCalls = 30) {}
  async json(path: string, body?: object): Promise<any> {
    return JSON.parse(await this.read(path, body ? JSON.stringify(body) : undefined, true));
  }
  async text(path: string, form?: Record<string, string>): Promise<string> {
    return this.read(path, form ? new URLSearchParams(form).toString() : undefined, false);
  }
  /** Reviewed HIPPER anonymous-cart actions only. The generic action endpoint
   * also places orders, so reject every other action, field and namespace here.
   * source: https://hipper.pl/dist/app.4bb46b097031e5eba47f.js
   */
  async certusoftAction(body: Record<string, any>): Promise<any> {
    const allowedKeys = ['csAppNameSpacesG','appWindowIdent','dataSetIdent','actionIdent','sessionId','row','path','addRequestData','onCFDataFieldIdent'];
    if (this.origin !== 'https://hipper.pl' || Object.keys(body).some(key => !allowedKeys.includes(key)) || typeof body.csAppNameSpacesG !== 'string' || body.csAppNameSpacesG.toLowerCase() !== '800db636-13cf-4b3b-a705-06e7b2a426e9' || !body.row || typeof body.row !== 'object') throw Error('invalid_cart_action');
    const add = body.appWindowIdent === 'csB2BItemCard' && body.dataSetIdent === 'itemCard' && body.actionIdent === 'cartAdd' && !body.onCFDataFieldIdent;
    const select = body.appWindowIdent === 'csB2BCart' && body.dataSetIdent === 'csB2BCartHeader' && body.actionIdent === 'csNGOnCFB2BCartHeader' && ['csB2BPortalsDeliveryMethodsId','csPaymentsTypesId'].includes(body.onCFDataFieldIdent) && body.path === '/koszyk';
    const rowKeys = add ? ['csItemsId','csItemsUnitsId','cUnitPrice','discount','quantityUnits'] : ['csDocsHeadersId','csB2BPortalsDeliveryMethodsId','csPaymentsTypesId'];
    if (!(add || select) || Object.keys(body.row).some(key => !rowKeys.includes(key)) || Object.keys(body.addRequestData ?? {}).some(key => key !== 'appWindowUniqIdent') || body.addRequestData?.appWindowUniqIdent !== body.appWindowIdent || typeof body.sessionId !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.sessionId)) throw Error('invalid_cart_action');
    return JSON.parse(await this.read('/csAPIServer_Hipper/invokeAction', JSON.stringify(body), true, false, true));
  }
  /** WooCommerce anonymous-cart token stays private to this one shop session.
   * Only the reviewed cart/read and add-item routes are allowed, never checkout. */
  async cartJson(path: string, body?: object): Promise<any> {
    if (!['/wp-json/wc/store/v1/cart','/wp-json/wc/store/v1/cart/add-item'].includes(path)) throw Error('invalid_cart_route');
    if (body && !this.storeCartToken) throw Error('cart_session_not_confirmed');
    const raw=await this.read(path,body?JSON.stringify(body):undefined,true,true);
    if (!this.storeCartToken) throw Error('cart_session_not_confirmed');
    return JSON.parse(raw);
  }
  private async read(path: string, payload: string | undefined, json: boolean, storeCart = false, rawJson = false): Promise<string> {
    let url = new URL(path, this.origin), method = payload ? 'POST' : 'GET';
    for (let i = 0; i < 4; i++) {
      if (url.origin !== this.origin) throw Error('invalid_redirect');
      if (++this.calls > this.maxCalls) throw Error('request_limit');
      const cookie = [...this.cookies].map(([k,v]) => `${k}=${v}`).join('; ');
      if (cookie.length > 8192 || this.cookies.size > 64) throw Error('invalid_cookie_size');
      const r = await this.fetchImpl(url, { method, body: payload, signal: this.signal, redirect: 'manual',
        headers: { 'User-Agent': 'AsystentRemontu/1.0', Accept: json ? 'application/json' : 'text/html, application/json', Cookie: cookie,
          ...(storeCart&&this.storeCartToken?{'Cart-Token':this.storeCartToken}:{}),
          ...(payload ? { 'Content-Type': storeCart||rawJson?'application/json':'application/x-www-form-urlencoded' } : {}) } });
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
      if (storeCart) {
        const token=r.headers.get('Cart-Token');
        if (token) {
          if (token.length>4096 || !/^[A-Za-z0-9._~-]+$/.test(token)) { await r.body?.cancel(); throw Error('invalid_cart_session'); }
          this.storeCartToken=token;
        }
      }
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
