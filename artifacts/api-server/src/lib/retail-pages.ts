import { createHash } from 'node:crypto';
import { normalizeProductName } from '@workspace/db/repositories';
import { parsePriceToGrosze } from '@workspace/price-collector';
import { readRetailMicrodata, htmlText } from './retail-microdata';
import { AnonymousShop } from './retailer-http';
import { confirmShopifyProduct } from './shopify-product';
import { confirmRetailIdentity } from './retail-identity';
import { readWooProduct } from './woocommerce-product';
import { readTokmetProduct } from './qshop-product';
import { readTopbodenProduct } from './topboden-product';
import { readPrestashopProduct } from './prestashop-product';
import { readAbstoreProduct } from './abstore-product';
import { readCertusoftProduct } from './certusoft-product';
import { readModnaProduct } from './modna-product';
import { readBetterialProduct } from './betterial-product';
import { inspectFolnetProduct } from './folnet-product';
import { inspectKronosferaProduct } from './kronosfera-product';
import { readSkyshopProduct, confirmSkyshopBasket, reviewedSkyshopSource, skyshopEvidenceHash, MATBUD_ORIGIN } from './skyshop-product';
import type { PriceVerification } from '../../../../lib/pricing-service/src/types';
import { confirmRetailSkuProduct, isReviewedSkuSource, type RetailSkuIdentity } from './retail-sku';

export interface RetailSource {
  id: string;
  ean: string;
  /** Empty ean is accepted only with an individually reviewed merchant SKU. */
  skuIdentity?: RetailSkuIdentity;
  /** Reviewed fulfilment branch for a merchant SKU. The whole cart must still
   * confirm current stock, prices and delivery from this same branch. */
  dispatchDepartment?: { id: string; name: string };
  name: string;
  category: string;
  brand: string;
  /** This reviewed product does not declare a brand; never invent one. */
  unbranded?: boolean;
  /** Operator may import a current, visibly reviewed browser card. Not an
   * automatic refresh and not accepted from public API request input. */
  browserReviewAllowed?: boolean;
  /** Actual merchant on the marketplace, distinct from its platform's own
   * basket, delivery tariff and physical stores. */
  marketplaceSeller?: {name:string;id:number};
  /** Independently reviewed manufacturer for a store-labelled Shoper product.
   * The exact placeholder is pinned; a changed producer needs a new review. */
  brandReference?: { url: string; retailerValue: string; retailerId: number };
  packageSize: number;
  /** Reviewed order lot; the EAN and price still describe one physical pack. */
  purchaseMultiple?: number;
  /** Smallest accepted pack count; distinct from further order increments. */
  minimumPackages?: number;
  /** The retailer requires arranging a pickup; do not rank it as confirmed collection. */
  pickupRequiresConfirmation?: boolean;
  /** This product's sales channel does not offer self collection. */
  pickupUnavailable?: boolean;
  /** Price confirmed for collection at one named branch. It must not become a
   * nationwide home-delivery offer without a separate branch transport quote. */
  pickupOnly?: boolean;
  unit: string;
  store: string;
  url: string;
  format?: 'jsonld' | 'sewera' | 'realbud' | 'shoper' | 'buduj24' | 'shoper-api' | 'unimet' | 'shopify-api' | 'idosell' | 'fixero' | 'rodimax' | 'woocommerce' | 'topboden-api' | 'prestashop' | 'abstore' | 'certusoft' | 'modna' | 'betterial' | 'folnet' | 'kronosfera' | 'skyshop' | 'qshop';
  /** Reviewed photograph for this exact EAN; may use another public product card. */
  imageUrl?: string;
  variant?: readonly string[];
  /** Reviewed Shoper product identifier, also for stores with custom URLs. */
  productId?: number;
  retailerSku?: string;
  /** Reviewed native retailer unit ID; distinct from the physical pack size. */
  retailerUnitId?: number;
  productUuid?: string;
  variantId?: number;
  apiPurchaseUnit?: string;
  /** One purchase unit is a piece or a sealed package, never an inferred m². */
  retailUnit?: 'SZT' | 'OPA';
  /** Exact package contents explicitly stated in this product's description. */
  packageDescription?: string;
  /** A reviewed page is not a purchasable offer until its checkout works. */
  disabledReason?: 'retailer_checkout_unconfirmed';
}

export interface RetailObservation {
  sourceId: string;
  ean: string;
  name: string;
  imageUrl: string | null;
  priceGrosze: number;
  currency: 'PLN';
  availability: 'in_stock';
  /** Explicit published available quantity, converted to physical packs. */
  stockPackages?: number;
  verification?: PriceVerification;
  observedAt: string;
  sourceUrl: string;
  evidenceSha256: string;
  validUntil?: string | null;
}

function objects(value: unknown): Record<string, any>[] {
  if (Array.isArray(value)) return value.flatMap(objects);
  if (!value || typeof value !== 'object') return [];
  const item = value as Record<string, any>;
  return [item, ...objects(item['@graph'])];
}

/** Read explicit Product + Offer JSON-LD, never a price from search snippets. */
export function parseRetailPage(html: string, source: RetailSource, observedAt: Date): RetailObservation {
  if (source.disabledReason) throw Error(source.disabledReason);
  if ((!source.ean || source.skuIdentity) && !isReviewedSkuSource(source)) throw Error('retailer_sku_source_not_reviewed');
  const products: Record<string, any>[] = [];
  let stockPackages: number | undefined;
  if (source.skuIdentity) products.push(confirmRetailSkuProduct(html, readRetailMicrodata(html, 'sewera', source.url, source.retailUnit), source));
  else if (source.format === 'kronosfera') products.push(inspectKronosferaProduct(html, source).product);
  else if (source.format === 'folnet') {
    const reviewed = inspectFolnetProduct(html, source);
    products.push(reviewed.product); stockPackages = reviewed.stock;
  }
  else if (source.format === 'betterial') products.push(readBetterialProduct(html, source));
  else if (source.format === 'prestashop') products.push(readPrestashopProduct(html, source).product);
  else if (source.format === 'abstore') products.push(readAbstoreProduct(html, source));
  else if (source.format === 'certusoft') products.push(readCertusoftProduct(html, source).product);
  else if (source.format === 'modna') products.push(readModnaProduct(html, source).product);
  else if (source.format && !['jsonld','shoper-api','shopify-api','idosell','fixero','rodimax'].includes(source.format)) products.push(readRetailMicrodata(html, source.format as 'sewera' | 'realbud' | 'shoper' | 'buduj24' | 'unimet', source.url, source.retailUnit));
  for (const script of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { products.push(...objects(JSON.parse(script[1])).filter(item => [item['@type']].flat().includes('Product'))); } catch { /* Other JSON-LD must not supply a price. */ }
  }
  if (source.format === 'idosell' || source.format === 'fixero' || source.format === 'rodimax') {
    if (products.length !== 1) throw Error('product_identity_ambiguous');
    products[0] = confirmRetailIdentity(html, products[0], source);
  }
  const product = source.skuIdentity ? products.find(item => item.sku === source.skuIdentity!.manufacturerSku && !item.gtin13 && !item.gtin)
    : products.find(item => String(item.gtin13 ?? item.gtin ?? '') === source.ean);
  if (!product) throw new Error('product_ean_not_confirmed');
  const name = String(product.name ?? '');
  const normalize = (value: string) => normalizeProductName(value.replace(/(\d|mm|cm|m)\s*[x×/]\s*(?=\d)/gi, '$1 x ').replace(/(\d)([a-zA-Z])/g, '$1 $2'));
  const normalized = normalize(name);
  const packagePattern = new RegExp(`(?:^| )${String(source.packageSize).replace('.', ' ')} (?:${source.unit === 'l' ? 'l|litrow|litry' : source.unit})(?: |$)`);
  const explicitBrand = typeof product.brand === 'string' ? product.brand : product.brand?.name;
  // Some reviewed Product records identify the manufacturer rather than Brand.
  // A conflicting explicit brand must not be overwritten by this fallback.
  const brand = normalizeProductName(explicitBrand || (typeof product.manufacturer === 'string' ? product.manufacturer : product.manufacturer?.name) || '');
  const variantMatches = source.variant?.every(value => new RegExp(`(?:^| )${normalize(value)}(?: |$)`).test(normalized));
  if (source.packageDescription && !normalize(String(product.description ?? '')).includes(normalize(source.packageDescription))) throw new Error('product_package_not_confirmed');
  const sourceBrand=normalizeProductName(source.brand);
  const unbranded=source.unbranded===true&&source.id==='castorama-paint-economy-10l'&&source.store==='Castorama'&&source.ean==='3663602567240'&&source.name==='Farba biała mat 10 l'&&sourceBrand==='';
  if(!sourceBrand&&!unbranded)throw Error('product_brand_not_confirmed');
  if ((unbranded ? Boolean(brand) : !(normalized.includes(sourceBrand) || brand.includes(sourceBrand))) || !(source.variant ? variantMatches : packagePattern.test(normalized))) throw new Error('product_variant_mismatch');
  // The configured exact product name also protects against a wrong EAN on a retailer page.
  if (!normalize(source.name).split(' ').filter(token => token.length > 3).every(token => normalized.includes(token))) throw new Error('product_name_mismatch');
  const allOffers = objects(product.offers);
  if (allOffers.some(offer => /\/OutOfStock$|\/Discontinued$/.test(String(offer.availability))) && !allOffers.some(offer => /\/InStock$/.test(String(offer.availability)))) throw new Error('retailer_out_of_stock');
  const eligibleOffers = allOffers.filter(offer => {
    if (![offer['@type']].flat().includes('Offer')) return false;
    if (offer.priceCurrency !== 'PLN' || !/\/InStock$/.test(String(offer.availability))) return false;
    if (/OnSitePickup$/.test(String(offer.availableDeliveryMethod))) return false;
    if (offer.priceValidUntil && !retailPriceIsValid(offer.priceValidUntil, observedAt)) return false;
    try { if (new URL(offer.url ?? source.url).hostname !== new URL(source.url).hostname) return false; } catch { return false; }
    return true;
  });
  const prices = eligibleOffers.map(offer => parsePriceToGrosze(offer.price)).filter((price): price is number => price !== null && price > 0 && Number.isSafeInteger(price));
  if(source.marketplaceSeller&&eligibleOffers.some(offer=>offer.seller?.name!==source.marketplaceSeller!.name))throw Error('retailer_seller_not_confirmed');
  if (prices.length === 0) throw new Error('no_confirmed_online_pln_offer');
  // Conflicting online prices are ambiguous; do not pick a tempting minimum.
  if (new Set(prices).size !== 1) throw new Error('ambiguous_online_price');
  const firstImage = [source.imageUrl ?? product.image ?? eligibleOffers.find(offer => offer.image)?.image].flat()[0];
  const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
  return {
    sourceId: source.id, ean: source.ean, name,
    ...(stockPackages === undefined ? {} : { stockPackages }),
    imageUrl: typeof imageUrl === 'string' && imageUrl.startsWith('https://') ? imageUrl.replace(/&amp;/g, '&') : null,
    priceGrosze: prices[0], currency: 'PLN', availability: 'in_stock',
    observedAt: observedAt.toISOString(), sourceUrl: source.url,
    evidenceSha256: createHash('sha256').update(html).digest('hex'),
    validUntil: eligibleOffers.map(offer => offer.priceValidUntil).filter((value): value is string => typeof value === 'string').sort()[0] ?? null,
  };
}

export function retailPriceIsValid(validUntil: unknown, now: Date): boolean {
  if (typeof validUntil !== 'string' || !Number.isFinite(Date.parse(validUntil))) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) return new Date(validUntil).toISOString().slice(0, 10) === validUntil && new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(now) <= validUntil;
  return Date.parse(validUntil) >= now.getTime();
}

export async function readRetailSource(source: RetailSource, fetchImpl: typeof fetch = fetch): Promise<RetailObservation> {
  if (source.disabledReason) throw Error(source.disabledReason);
  if(source.format==='qshop'){
    const current=await readTokmetProduct(source,fetchImpl);
    return {...parseRetailPage(`<script type="application/ld+json">${JSON.stringify(current.product)}</script>`,{...source,format:'jsonld'},new Date()),stockPackages:current.stock,evidenceSha256:current.evidenceSha256};
  }
  if(source.format==='skyshop'){
    const review=reviewedSkyshopSource(source),nativeCount=source.minimumPackages!*review.nativePerPack;
    const client=new AnonymousShop(MATBUD_ORIGIN,fetchImpl,AbortSignal.timeout(15000),12),current=await readSkyshopProduct(source,client);
    const empty=await client.skyshop('create-cart'),added=await client.skyshop('add',nativeCount,review.id);
    if(added?.id!==empty.id||added.addedCartItem?.quantity!==nativeCount)throw Error('insufficient_stock');
    const cart=confirmSkyshopBasket(await client.skyshop('cart'),[{productId:review.id,count:nativeCount,unitPriceGrosze:current.nativePriceGrosze}]);
    if(cart.id!==empty.id)throw Error('basket_not_confirmed');
    const html=`<script type="application/ld+json">${JSON.stringify(current.product)}</script>`;
    return{...parseRetailPage(html,{...source,format:'jsonld'},new Date()),stockPackages:current.stock,evidenceSha256:skyshopEvidenceHash([...current.evidence,cart])};
  }
  if (source.format==='topboden-api') {
    const product=await readTopbodenProduct(source,fetchImpl);
    const html=`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:product.name,gtin13:source.ean,brand:source.brand,image:product.imageUrl,offers:{'@type':'Offer',price:(product.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url,priceValidUntil:product.validUntil}})}</script>`;
    return {...parseRetailPage(html,{...source,format:'jsonld'},new Date()),evidenceSha256:product.evidenceSha256};
  }
  if (source.format==='woocommerce') {
    const product=await readWooProduct(source,fetchImpl);
    // Manufacturer and package are reviewed against the exact primary barcode.
    const html=`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:product.name,gtin13:source.ean,brand:source.brand,image:product.imageUrl,offers:{'@type':'Offer',price:(product.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}})}</script>`;
    return {...parseRetailPage(html,{...source,format:'jsonld'},new Date()),evidenceSha256:product.evidenceSha256};
  }
  if (source.format === 'shopify-api') {
    const client = new AnonymousShop(new URL(source.url).origin, fetchImpl, AbortSignal.timeout(8000));
    const raw = await client.text(new URL(source.url).pathname + '.js');
    const item = confirmShopifyProduct(JSON.parse(raw), source);
    const cart = JSON.parse(await client.text('/cart.js'));
    if (cart.currency !== 'PLN') throw Error('retailer_currency_not_confirmed');
    const html = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Product', name: item.name, gtin13: source.ean, image: item.imageUrl,
      offers: { '@type': 'Offer', price: (item.priceGrosze / 100).toFixed(2), priceCurrency: 'PLN', url: source.url, availability: 'https://schema.org/InStock' } })}</script>`;
    return { ...parseRetailPage(html, source, new Date()), evidenceSha256: createHash('sha256').update(JSON.stringify([raw,cart.currency])).digest('hex') };
  }
  const api = source.format === 'shoper-api';
  const requestUrl = api ? `${new URL(source.url).origin}/webapi/front/pl_PL/products/PLN/${shoperProductId(source)}` : source.url;
  const response = await fetchImpl(requestUrl, {
    signal: AbortSignal.timeout(['idosell','fixero'].includes(source.format ?? '') ? 12000 : 8000), redirect: 'error',
    headers: { 'User-Agent': 'AsystentRemontu/1.0', Accept: 'text/html', 'Accept-Language': 'pl-PL' },
  });
  if (!response.ok) throw new Error(`retailer_http_${response.status}`);
  if (!response.headers.get('content-type')?.includes(api ? 'json' : 'text/html')) throw new Error('retailer_invalid_content_type');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('retailer_empty_body');
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 3_000_000) throw new Error('retailer_page_too_large');
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (api) {
    const item = JSON.parse(raw);
    if (String(item.id) !== shoperProductId(source)) throw new Error('product_id_not_confirmed');
    confirmShoperPurchaseUnit(item,source);
    if (!item.can_buy) throw new Error('retailer_out_of_stock');
    const gross = item.price?.gross;
    const formatted = String(gross?.final ?? '').replace(/[\s\u00a0]/g, '').match(/^(\d+),(\d{2})zł$/);
    if (!formatted || typeof gross.final_float !== 'number' || Math.abs((Number(formatted[1]) * 100 + Number(formatted[2])) - gross.final_float * 100) > 0.00001) throw new Error('retailer_gross_price_mismatch');
    const html = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Product', name: item.name, gtin13: item.ean, brand: source.brandReference ? source.brand : item.producer?.name, image: source.imageUrl, description:item.description,
      offers: { '@type': 'Offer', price: gross.final_float, priceCurrency: 'PLN', url: item.url, availability: 'https://schema.org/InStock' } })}</script>`;
    const observation = parseRetailPage(html, source, new Date());
    return { ...observation, evidenceSha256: createHash('sha256').update(raw).digest('hex') };
  }
  // These complex purchase units are currently confirmed from the visible
  // browser card (full pack price + coverage, or whole-piece length). A bare
  // JSON-LD HTTP response must not relabel an unconfirmed per-m²/metre price.
  if(source.pickupOnly&&source.browserReviewAllowed)throw Error('browser_location_review_required');
  if(source.browserReviewAllowed&&new URL(source.url).origin==='https://www.castorama.pl'&&['m2','m'].includes(source.unit))throw Error('browser_package_review_required');
  return parseRetailPage(raw, source, new Date());
}

/** Bind the price of one native piece to the reviewed physical package, rather
 * than silently treating an advertised m² price as a whole box.
 * source: https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535
 */
export function confirmShoperPurchaseUnit(item: Record<string, any>, source: RetailSource): void {
  if (String(item.id) !== shoperProductId(source)) throw Error('product_id_not_confirmed');
  if (source.apiPurchaseUnit && (item.unit?.name !== source.apiPurchaseUnit || item.unit?.floating_point !== false)) throw Error('retailer_unit_not_confirmed');
  if (source.retailerSku && item.code !== source.retailerSku) throw Error('product_identity_not_confirmed');
  if (source.packageDescription && !normalizeProductName(htmlText(String(item.description ?? ''))).includes(normalizeProductName(source.packageDescription))) throw Error('product_package_not_confirmed');
  if (source.brandReference) {
    const reference = source.brandReference;
    let url: URL;
    try { url = new URL(reference.url); } catch { throw Error('product_brand_not_confirmed'); }
    if (source.format !== 'shoper-api' || !source.brand.trim() || !source.retailerSku || !source.apiPurchaseUnit || !source.variant?.length ||
      url.protocol !== 'https:' || url.username || url.password || url.hostname === new URL(source.url).hostname ||
      normalizeProductName(reference.retailerValue) !== normalizeProductName(source.store) ||
      !Number.isSafeInteger(reference.retailerId) || reference.retailerId < 1 ||
      item.ean !== source.ean || item.name !== source.name || item.producer?.name !== reference.retailerValue || item.producer?.id !== reference.retailerId) throw Error('product_brand_not_confirmed');
  }
}

export function shoperProductId(source: RetailSource): string {
  const fromUrl = source.url.match(/\/(\d+)$/)?.[1];
  if (source.productId !== undefined && (!Number.isSafeInteger(source.productId) || source.productId < 1 || (fromUrl && fromUrl !== String(source.productId)))) throw Error('invalid_product_id');
  const id = source.productId === undefined ? fromUrl : String(source.productId);
  if (!id) throw Error('invalid_product_id');
  return id;
}
