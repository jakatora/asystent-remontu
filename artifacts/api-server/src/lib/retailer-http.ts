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
  private magentoCartId: string | null = null;
  constructor(private origin: string, private fetchImpl: typeof fetch, private signal: AbortSignal, private maxCalls = 30, private encoding: 'utf-8' | 'iso-8859-2' = 'utf-8') {
    if (encoding !== 'utf-8' && origin !== 'https://sklep.tokmet.pl') throw Error('unsupported_retailer_encoding');
  }
  async json(path: string, body?: object): Promise<any> {
    return JSON.parse(await this.read(path, body ? JSON.stringify(body) : undefined, true));
  }
  async text(path: string, form?: Record<string, string>): Promise<string> {
    return this.read(path, form ? new URLSearchParams(form).toString() : undefined, false);
  }
  /** One reviewed anonymous product addition. The store calls this an order
   * update, but the frontend uses it to add to the unsubmitted shopping cart.
   * No generic strategy, customer data, agreement or order submission exposed.
   * source: https://kronodom.pl/abs/1793195254635/js/8301.js
   */
  async kronodomAdd(packCount:number,csrf:string):Promise<any>{
    if(this.origin!=='https://kronodom.pl'||!Number.isSafeInteger(packCount)||packCount<1||packCount>MAX_RETAIL_PACKAGES||!Number.isSafeInteger(packCount*6)||!/^[a-f0-9]{64}$/.test(csrf))throw Error('invalid_cart_action');
    const form:Record<string,string>={strategy:'add'};
    for(const [key,value]of Object.entries({productId:'423',offerPositionId:'423',offerId:'1',saleUnitId:'1007',qty:String(packCount*6),determinant:'op-423',ack:'false',fastCart:'false',_id:'p423-op423'}))form['positions[0]['+key+']']=value;
    // This reviewed endpoint returns JSON with a text/html content type.
    return JSON.parse(await this.read('/offer/ajax/triggerOrderUpdate',new URLSearchParams(form).toString(),false,false,false,csrf));
  }
  /** Only the reviewed anonymous product addition and postcode/carrier quote.
   * This module also places orders: never accept its generic method or form.
   * source: https://izosystems.pl/themes/warehouse/assets/cache/bottom-d7c313566.js
   */
  async izosystems(action:'add'|'carriers'|'carrier'|'cart'|'payments',args:{token:string;productId?:number;count?:number;postalCode?:string;addressId?:string}):Promise<any> {
    if(this.origin!=='https://izosystems.pl'||!args||!/^[a-f\d]{32}$/i.test(args.token)||Object.keys(args).some(k=>!['token','productId','count','postalCode','addressId'].includes(k)))throw Error('invalid_cart_action');
    if(action==='add'){
      if(args.productId!==1783||!Number.isSafeInteger(args.count)||args.count!<1||args.count!>MAX_RETAIL_PACKAGES||Object.keys(args).length!==3)throw Error('invalid_cart_action');
      return JSON.parse(await this.read('/koszyk-zakupow',new URLSearchParams({token:args.token,id_product:'1783',id_customization:'0',qty:String(args.count),add:'1',action:'update',ajax:'1'}).toString(),false));
    }
    let form:Record<string,string>={ajax:'true',token:args.token};
    if(action==='carriers'){
      if(!/^\d{2}-\d{3}$/.test(args.postalCode??'')||Object.keys(args).length!==2)throw Error('invalid_cart_action');
      form={...form,id_country:'14',id_state:'0',postcode:args.postalCode!,vat_number:'',id_address_delivery:'',method:'loadCarriers'};
    }else if(action==='carrier'){
      if(!/^\d{1,12}$/.test(args.addressId??'')||Object.keys(args).length!==2)throw Error('invalid_cart_action');
      form={...form,delivery_available:'true',['delivery_option['+args.addressId+']']:'992,',method:'updateCarrier'};
    }else if(action==='cart'||action==='payments'){
      if(Object.keys(args).length!==1)throw Error('invalid_cart_action');
      form=action==='cart'?{...form,method:'loadCart',shippingId:'992,',id_country:'14',id_address_delivery:''}:{...form,method:'loadPayment'};
    }else throw Error('invalid_cart_action');
    return JSON.parse(await this.read('/module/supercheckout/supercheckout',new URLSearchParams(form).toString(),false));
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
      // Exact additional cartons reviewed on the primary ABUD cards; a native
      // count of one is one 1000-screw / 200-fixing carton, never one screw.
      // source: https://www.abud.pl/product-pol-1456-Wkrety-do-blachy-KOELNER-FS-3525-1000szt.html
      // source: https://www.abud.pl/product-pol-63463-Wkret-samowiercacy-3-5x9-5mm-1000-szt.html
      // source: https://www.abud.pl/product-pol-1452-Kolek-szybki-montaz-kolnierz-6x40-KOELNER-200-szt.html
      if (![6204,64835,17848,63790,1456,63463,1452,5708,7965,1121].includes(args.productId ?? 0) || !Number.isSafeInteger(args.count) || args.count! < 1 || args.count! > MAX_RETAIL_PACKAGES || args.postalCode !== undefined) throw Error('invalid_cart_action');
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
   * Reviewed cart reads/additions, IRBUD/Pati/Budshop country+postcode and courier selection
   * only. Contact/address lines, checkout and order routes remain forbidden. */
  async cartJson(path: string, body?: object): Promise<any> {
    const courierId=this.origin==='https://irbudsklep.pl'?'flexible_shipping_single:3':this.origin==='https://patiartstudio.pl'?'flexible_shipping_single:7':null;
    const budshopCouriers=['wsds_simple_dimensional:3:medium_parcel_dhl','wsds_simple_dimensional:3:large_parcel_dhl','wsds_simple_dimensional:3:multi_medium_parcel_large_parcel','wsds_simple_dimensional:3:multi_large_parcel_large_parcel','wsds_simple_dimensional:3:multi_medium_parcel_large_parcel_large_parcel','wsds_simple_dimensional:3:multi_medium_parcel_medium_parcel','wsds_simple_dimensional:3:multi_medium_parcel_medium_parcel_large_parcel_large_parcel'];
    if (this.origin==='https://budshop24.pl'&&path==='/wp-json/wc/store/v1/cart/add-item'&&(!body||Object.keys(body).sort().join(',')!=='id,quantity'||![4808,7381,6484,6240].includes((body as any).id)||!Number.isSafeInteger((body as any).quantity)||(body as any).quantity<1||(body as any).quantity>MAX_RETAIL_PACKAGES))throw Error('invalid_cart_route');
    const shipping=path==='/wp-json/wc/store/v1/cart/select-shipping-rate'&&body&&Object.keys(body).sort().join(',')==='package_id,rate_id'&&(body as any).package_id===0&&((courierId&&((body as any).rate_id===courierId))||(this.origin==='https://budshop24.pl'&&budshopCouriers.includes((body as any).rate_id)));
    const address=(body as any)?.shipping_address;
    const destination=path==='/wp-json/wc/store/v1/cart/update-customer'&&(courierId||this.origin==='https://budshop24.pl')&&body&&Object.keys(body).join(',')==='shipping_address'
      &&address&&typeof address==='object'&&Object.keys(address).sort().join(',')==='country,postcode'&&address.country==='PL'&&typeof address.postcode==='string'&&/^\d{2}-\d{3}$/.test(address.postcode);
    if (!['/wp-json/wc/store/v1/cart','/wp-json/wc/store/v1/cart/add-item'].includes(path)&&!shipping&&!destination) throw Error('invalid_cart_route');
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
  /** Reviewed E-Kowalczyk anonymous quotation routes only. No address book,
   * contact details, shipping-information, payment-information or order route.
   * source: https://developer.adobe.com/commerce/webapi/rest/use-rest/anonymous-api-security
   * source: https://developer.adobe.com/commerce/webapi/rest/tutorials/orders/order-prepare-checkout
   */
  async magento(action: 'create' | 'add' | 'items' | 'totals' | 'payments' | 'estimate' | 'calculate' | 'select-prepayment' | 'prepayment', args: { sku?: string; count?: number; postalCode?: string } = {}): Promise<any> {
    if (this.origin !== 'https://sklep-kowalczyk.pl' || Object.keys(args).some(key => !['sku','count','postalCode'].includes(key))) throw Error('invalid_cart_action');
    let path = '/rest/V1/guest-carts', body: object | undefined, method: 'PUT' | undefined;
    if (action === 'create') {
      if (this.magentoCartId || Object.keys(args).length) throw Error('invalid_cart_action');
      const id = JSON.parse(await this.read(path, '{}', true, false, true, undefined, false, undefined, true));
      if (typeof id !== 'string' || !/^[A-Za-z0-9]{32}$/.test(id)) throw Error('invalid_cart_session');
      this.magentoCartId = id; return true;
    }
    if (!this.magentoCartId) throw Error('invalid_cart_session');
    path += '/' + this.magentoCartId;
    if (action === 'add') {
      // Reviewed SKUs are whole cartons or one sealed 15 kg primer bucket.
      // source: https://sklep-kowalczyk.pl/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html
      // source: https://sklep-kowalczyk.pl/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html
      // source: https://sklep-kowalczyk.pl/atlas-cerplast-podklad-grunt-pod-tynk-op-15kg-cp-00-15-52413.html
      if (!['5906675303024','5906675107622','5905400530032'].includes(args.sku ?? '') || !Number.isSafeInteger(args.count) || args.count! < 1 || args.count! > MAX_RETAIL_PACKAGES || args.postalCode !== undefined || Object.keys(args).length !== 2) throw Error('invalid_cart_action');
      path += '/items'; body = { cartItem: { sku: args.sku, qty: args.count, quote_id: this.magentoCartId } };
    } else if (action === 'estimate' || action === 'calculate') {
      if (!/^\d{2}-\d{3}$/.test(args.postalCode ?? '') || Object.keys(args).length !== 1) throw Error('invalid_cart_action');
      const address = { country_id: 'PL', postcode: args.postalCode };
      path += action === 'estimate' ? '/estimate-shipping-methods' : '/totals-information';
      body = action === 'estimate' ? { address } : { addressInformation: { address, shipping_carrier_code: 'inpostcourier', shipping_method_code: 'standard' } };
    } else {
      if (Object.keys(args).length) throw Error('invalid_cart_action');
      const routes = { items: '/items', totals: '/totals', payments: '/payment-methods', prepayment: '/selected-payment-method', 'select-prepayment': '/selected-payment-method' };
      if (!(action in routes)) throw Error('invalid_cart_action');
      path += routes[action as keyof typeof routes];
      if (action === 'select-prepayment') { body = { method: { method: 'checkmo' } }; method = 'PUT'; }
    }
    const data = JSON.parse(await this.read(path, body ? JSON.stringify(body) : undefined, true, false, true, undefined, false, method, true));
    if (data && typeof data.message === 'string') {
      if (/requested qty is not available|not enough items for sale|requested quantity is not available/i.test(data.message)) throw Error('insufficient_stock');
      if (/product.*(?:not available|out of stock)/i.test(data.message)) throw Error('product_unavailable');
      throw Error('retailer_unavailable');
    }
    return data;
  }
  private async read(path: string, payload: string | undefined, json: boolean, storeCart = false, rawJson = false, modnaCsrf?: string, forcePost=false, overrideMethod?: 'PUT', magentoErrors=false): Promise<string> {
    let url = new URL(path, this.origin), method = overrideMethod ?? (payload || forcePost ? 'POST' : 'GET');
    for (let i = 0; i < 4; i++) {
      if (url.origin !== this.origin) throw Error('invalid_redirect');
      if (++this.calls > this.maxCalls) throw Error('request_limit');
      const cookie = [...this.cookies].map(([k,v]) => `${k}=${v}`).join('; ');
      if (cookie.length > 8192 || this.cookies.size > 64) throw Error('invalid_cookie_size');
      // This storefront returns an empty body for the combined HTML/JSON Accept
      // value. Request HTML explicitly while keeping the honest agent identity.
      // source: https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html
      // source: https://integra-bielinscy.pl/uchwyty/1614-uchwyt-meblowy-nyxa-c-128-l-138-czarny-mat-5902801422652.html
      const htmlOnly = ['https://izosystems.pl', 'https://integra-bielinscy.pl'].includes(this.origin);
      const r = await this.fetchImpl(url, { method, body: payload, signal: this.signal, redirect: 'manual',
        headers: { 'User-Agent': 'AsystentRemontu/1.0', Accept: json ? 'application/json' : htmlOnly ? 'text/html' : 'text/html, application/json', Cookie: cookie,
          ...(this.origin==='https://izosystems.pl'?{'Accept-Language':'pl-PL'}:{}),
          ...(storeCart&&this.storeCartToken?{'Cart-Token':this.storeCartToken}:{}),
          ...(modnaCsrf ? {'X-CSRF-Token':modnaCsrf,'X-Requested-With':'XMLHttpRequest',Origin:this.origin,Referer:this.origin+'/'} : {}),
          ...(payload || forcePost ? { 'Content-Type': storeCart||rawJson?'application/json':'application/x-www-form-urlencoded' } : {}) } });
      for (const entry of r.headers.getSetCookie()) {
        const pair = entry.split(';')[0], eq = pair.indexOf('=');
        if (eq > 0) this.cookies.set(pair.slice(0,eq), pair.slice(eq+1));
      }
      if ([301,302,303,307,308].includes(r.status)) {
        if (magentoErrors) { await r.body?.cancel(); throw Error('invalid_cart_redirect'); }
        const target = r.headers.get('location'); await r.body?.cancel();
        if (!target) throw Error('invalid_redirect'); url = new URL(target, url);
        if ([301,302,303].includes(r.status)) { method = 'GET'; payload = undefined; } continue;
      }
      if (!r.ok && !(magentoErrors && this.origin === 'https://sklep-kowalczyk.pl' && r.status === 400)) { await r.body?.cancel(); throw Error('retailer_unavailable'); }
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
      // This reviewed public product embeds its related-product catalogue in
      // both API and HTML (~1.3MB). Keep the ordinary 1MB bound everywhere
      // else, including other products, POSTs and redirects to another path.
      // source: https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml
      const largeStrongman=method==='GET'&&!url.search&&(
        url.origin==='https://api.topboden.pl'&&url.pathname==='/api/product/by-uuid/9cc774ed-c24b-4f3b-a863-a935a86383f4'
        ||url.origin==='https://topboden.pl'&&url.pathname==='/listwy-przypodlogowe/klej-montazowy-strongman-300ml');
      const responseLimit=largeStrongman?2_000_000:1_000_000;
      try {
        while (true) { const { done, value } = await reader.read(); if (done) break;
          size += value.byteLength; if (size > responseLimit) throw Error('response_too_large'); chunks.push(value); }
      } finally { await reader.cancel().catch(() => {}); }
      const bytes = Buffer.concat(chunks);
      return this.encoding === 'iso-8859-2' ? new TextDecoder('iso-8859-2').decode(bytes) : bytes.toString('utf8');
    }
    throw Error('invalid_redirect');
  }
}
