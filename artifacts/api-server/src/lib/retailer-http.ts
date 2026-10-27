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
  private skyshopCartId: string | null = null;
  constructor(private origin: string, private fetchImpl: typeof fetch, private signal: AbortSignal, private maxCalls = 30, private encoding: 'utf-8' | 'iso-8859-2' = 'utf-8') {
    if (encoding !== 'utf-8' && origin !== 'https://sklep.tokmet.pl') throw Error('unsupported_retailer_encoding');
  }
  async json(path: string, body?: object): Promise<any> {
    return JSON.parse(await this.read(path, body ? JSON.stringify(body) : undefined, true));
  }
  async text(path: string, form?: Record<string, string>): Promise<string> {
    return this.read(path, form ? new URLSearchParams(form).toString() : undefined, false);
  }
  /** Only ABUD's public postcode check, anonymous add and basket-rate query.
   * The client-new endpoint is restricted to its postcode-only check; no
   * registration/customer submission, payment or order action is exposed.
   * source: https://www.abud.pl/gfx/pol/shop.js.gzip?r=1792053849
   */
  async abud(action: 'destination' | 'add' | 'shipping', args: {postalCode?: string; productId?: number; count?: number} = {}): Promise<any> {
    if (this.origin !== 'https://www.abud.pl' || Object.keys(args).some(key => !['postalCode','productId','count'].includes(key))) throw Error('invalid_cart_action');
    if (action === 'destination') {
      if (!/^\d{2}-\d{3}$/.test(args.postalCode ?? '') || args.productId !== undefined || args.count !== undefined) throw Error('invalid_cart_action');
      return JSON.parse(await this.read('/ajax/client-new.php?checkDeliveryZipcode=true&region_id=1143020003&zipcode='+args.postalCode,undefined,false));
    }
    if (action === 'add') {
      if (![6204,64835,17848,63790].includes(args.productId ?? 0) || !Number.isSafeInteger(args.count) || args.count! < 1 || args.count! > MAX_RETAIL_PACKAGES || args.postalCode !== undefined) throw Error('invalid_cart_action');
      return JSON.parse(await this.read('/basketchange.php',new URLSearchParams({getAjax:'true',mode:'1',product:String(args.productId),size:'onesize',number:String(args.count)}).toString(),false));
    }
    if (action !== 'shipping' || Object.keys(args).length) throw Error('invalid_cart_action');
    const query = 'query { shipping(ShippingInput: { mode: basket }) { shipping { courier { id name icon } prepaid cost { value formatted } deliveryTime { weekDay } } } }';
    return JSON.parse(await this.read('/graphql/v1/',JSON.stringify({query}),true,false,true));
  }
  /** Only this storefront's anonymous quantity update, never its order form.
   * source: https://modnalazienka.pl/static_files/js/update_cart.js?x=1792224600
   */
  async modnaCart(productId: number, quantityM2: string, csrfToken: string): Promise<string> {
    if (this.origin !== 'https://modnalazienka.pl' || !Number.isSafeInteger(productId) || productId < 1 || !/^\d+\.\d{2}$/.test(quantityM2) || Number(quantityM2) <= 0 || Number(quantityM2) > MAX_RETAIL_PACKAGES * 100 || !/^[A-Za-z0-9._-]{32,256}$/.test(csrfToken)) throw Error('invalid_cart_action');
    const id = String(productId);
    return this.read('/cart_edit',new URLSearchParams({ update_cart:'',product_id:id,['cart_quantity_real_unit_'+id]:quantityM2,['product_single_set_'+id]:'true' }).toString(),false,false,false,csrfToken);
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
  /** Reviewed Sky-Shop operations for two pinned Matbud products. Cart IDs are
   * obtained from this fresh session, never supplied by the app or browser.
   * The order json=1 routes calculate shipping; no final order/customer route.
   * source: https://centrummatbud.pl/view/new/userContent/bum/script.js?v=699 */
  async skyshop(action: 'product'|'parameters'|'create-cart'|'add'|'cart'|'shipping'|'calculate', count?: number, productId=96729): Promise<any> {
    if(this.origin!=='https://centrummatbud.pl')throw Error('invalid_cart_action');
    if(![96729,131345].includes(productId))throw Error('invalid_cart_action');
    const nativePerPack=productId===131345?2:1;
    const prefix='/proxy_public_api?endpoint=/sky2/api-public';
    if(action==='product'||action==='parameters'){
      if(count!==undefined)throw Error('invalid_cart_action');
      return JSON.parse(await this.read(prefix+'/products/'+productId+(action==='parameters'?'/choosable-parameters?':''),undefined,true));
    }
    if(action==='create-cart'){
      if(count!==undefined||this.skyshopCartId)throw Error('invalid_cart_action');
      const cart=JSON.parse(await this.read(prefix+'/carts/latest',undefined,true));
      if(!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(cart?.id??'')||!Array.isArray(cart.items)||cart.items.length)throw Error('basket_not_confirmed');
      this.skyshopCartId=cart.id;this.cookies.set('sky2_cart_id',cart.id);return cart;
    }
    if(!this.skyshopCartId)throw Error('cart_session_not_confirmed');
    if(action==='add'){
      if(count===undefined||!Number.isSafeInteger(count)||count<50*nativePerPack||count>MAX_RETAIL_PACKAGES*nativePerPack||count%nativePerPack)throw Error('invalid_cart_action');
      return JSON.parse(await this.read(prefix+'/carts/'+this.skyshopCartId+'/items',JSON.stringify({productId,quantity:count,parameters:[]}),true,false,true));
    }
    if(count!==undefined)throw Error('invalid_cart_action');
    if(action==='cart')return JSON.parse(await this.read(prefix+'/carts/'+this.skyshopCartId,undefined,true));
    if(action==='shipping'){
      // Native /cart synchronises the modern anonymous cart with its shipping
      // calculator. Skipping it yields an empty legacy order, not a free quote.
      await this.read('/cart',undefined,false);
      const html=await this.read('/order',undefined,false);
      const methods=JSON.parse(await this.read('/order/?json=1&pay_id=5&c=PL&sel=&wdt=0','',true,false,false,undefined,true));
      return {html,methods};
    }
    if(action==='calculate')return JSON.parse(await this.read('/order/?json=1&recalculate=1&c=PL&pay_id=5&shipment=s182be0c5c&wdt=0&gratis=',undefined,true));
    throw Error('invalid_cart_action');
  }
  private async read(path: string, payload: string | undefined, json: boolean, storeCart = false, rawJson = false, modnaCsrf?: string, forcePost=false): Promise<string> {
    let url = new URL(path, this.origin), method = payload || forcePost ? 'POST' : 'GET';
    for (let i = 0; i < 4; i++) {
      if (url.origin !== this.origin) throw Error('invalid_redirect');
      if (++this.calls > this.maxCalls) throw Error('request_limit');
      const cookie = [...this.cookies].map(([k,v]) => `${k}=${v}`).join('; ');
      if (cookie.length > 8192 || this.cookies.size > 64) throw Error('invalid_cookie_size');
      const r = await this.fetchImpl(url, { method, body: payload, signal: this.signal, redirect: 'manual',
        headers: { 'User-Agent': 'AsystentRemontu/1.0', Accept: json ? 'application/json' : 'text/html, application/json', Cookie: cookie,
          ...(storeCart&&this.storeCartToken?{'Cart-Token':this.storeCartToken}:{}),
          ...(modnaCsrf ? {'X-CSRF-Token':modnaCsrf,'X-Requested-With':'XMLHttpRequest',Origin:this.origin,Referer:this.origin+'/'} : {}),
          ...(payload || forcePost ? { 'Content-Type': storeCart||rawJson?'application/json':'application/x-www-form-urlencoded' } : {}) } });
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
      const bytes = Buffer.concat(chunks);
      return this.encoding === 'iso-8859-2' ? new TextDecoder('iso-8859-2').decode(bytes) : bytes.toString('utf8');
    }
    throw Error('invalid_redirect');
  }
}
