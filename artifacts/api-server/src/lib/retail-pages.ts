import {readDekoratorProduct} from './dekorator';
import {readIntegraProduct} from './integra';
import {readMlazienkaProduct} from './mlazienka';
import { createHash } from 'node:crypto';
import { normalizeProductName } from '@workspace/db/repositories';
import { parsePriceToGrosze } from '@workspace/price-collector';
import { readRetailMicrodata, htmlText } from './retail-microdata';
import { AnonymousShop } from './retailer-http';
import { confirmShopifyProduct } from './shopify-product';
import { confirmRetailIdentity } from './retail-identity';
import { readWooProduct } from './woocommerce-product';
import { readIrbudProduct } from './irbud-woo';
import { readPatiProduct } from './pati-woo';
import { readBudshopProduct } from './budshop-woo';
import { readKowalczykProduct } from './kowalczyk-magento';
import { readTokmetProduct } from './qshop-product';
import { readTopbodenProduct } from './topboden-product';
import { readPrestashopProduct } from './prestashop-product';
import { readIzosystemsProduct } from './izosystems-product';
import { readKrasnyStock } from './krasny-stock';
import {readBmbCart} from './bmb';
import { readAbstoreProduct } from './abstore-product';
import { readCertusoftProduct } from './certusoft-product';
import { readModnaProduct } from './modna-product';
import { readBetterialProduct } from './betterial-product';
import { inspectFolnetProduct } from './folnet-product';
import { inspectKronosferaProduct } from './kronosfera-product';
import { readSkyshopProduct, confirmSkyshopBasket, reviewedSkyshopSource, skyshopEvidenceHash, MATBUD_ORIGIN } from './skyshop-product';
import type { PriceVerification } from '../../../../lib/pricing-service/src/types';
import { confirmRetailSkuProduct, isReviewedSkuSource, retailSkuCode, type RetailSkuIdentity } from './retail-sku';

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
  format?: 'jsonld' | 'sewera' | 'realbud' | 'shoper' | 'buduj24' | 'shoper-api' | 'unimet' | 'shopify-api' | 'idosell' | 'fixero' | 'rodimax' | 'woocommerce' | 'topboden-api' | 'prestashop' | 'abstore' | 'certusoft' | 'modna' | 'betterial' | 'folnet' | 'kronosfera' | 'skyshop' | 'qshop' | 'irbud-woo' | 'pati-woo' | 'budshop-woo' | 'kowalczyk-magento' | 'izosystems' | 'krasny' | 'bmb' | 'integra' | 'mlazienka' | 'dekorator';
  /** Reviewed photograph for this exact EAN; may use another public product card. */
  imageUrl?: string;
  variant?: readonly string[];
  /** Reviewed Shoper product identifier, also for stores with custom URLs. */
  productId?: number;
  /** Exact manufacturer code exposed by the native Shoper product API. */
  apiProductCode?: string;
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
  if(source.format==='bmb'||source.format==='integra'||source.format==='mlazienka')throw Error('retailer_basket_required');
  if ((!source.ean || source.skuIdentity) && !isReviewedSkuSource(source)) throw Error('retailer_sku_source_not_reviewed');
  const products: Record<string, any>[] = [];
  let stockPackages: number | undefined;
  if(source.format==='krasny')stockPackages=readKrasnyStock(html,source);
  if (source.skuIdentity && source.format!=='irbud-woo') products.push(confirmRetailSkuProduct(html, readRetailMicrodata(html, 'sewera', source.url, source.retailUnit), source));
  else if(source.format==='dekorator')products.push(readDekoratorProduct(html,source));
  else if (source.format === 'kronosfera') products.push(inspectKronosferaProduct(html, source).product);
  else if (source.format === 'folnet') {
    const reviewed = inspectFolnetProduct(html, source);
    products.push(reviewed.product); stockPackages = reviewed.stock;
  }
  else if (source.format === 'betterial') products.push(readBetterialProduct(html, source));
  else if (source.format === 'prestashop') products.push(readPrestashopProduct(html, source).product);
  else if(source.format==='izosystems'){const reviewed=readIzosystemsProduct(html,source);products.push(reviewed.product);stockPackages=reviewed.maxPackages;}
  else if (source.format === 'abstore') products.push(readAbstoreProduct(html, source));
  else if (source.format === 'certusoft') {
    const reviewed=readCertusoftProduct(html, source);
    products.push(reviewed.product); stockPackages=reviewed.maxPackages;
  }
  else if (source.format === 'modna') products.push(readModnaProduct(html, source).product);
  else if (source.format && !['jsonld','shoper-api','shopify-api','idosell','fixero','rodimax','irbud-woo','krasny'].includes(source.format)) products.push(readRetailMicrodata(html, source.format as 'sewera' | 'realbud' | 'shoper' | 'buduj24' | 'unimet', source.url, source.retailUnit));
  for (const script of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { products.push(...objects(JSON.parse(script[1])).filter(item => [item['@type']].flat().includes('Product'))); } catch { /* Other JSON-LD must not supply a price. */ }
  }
  if (source.format === 'idosell' || source.format === 'fixero' || source.format === 'rodimax') {
    if (products.length !== 1) throw Error('product_identity_ambiguous');
    products[0] = confirmRetailIdentity(html, products[0], source);
  }
  const product = source.skuIdentity ? products.find(item => item.sku === retailSkuCode(source) && !item.gtin13 && !item.gtin)
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
  if (source.packageDescription && !normalize(htmlText(String(product.description ?? ''))).includes(normalize(source.packageDescription))) throw new Error('product_package_not_confirmed');
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
  if(source.format==='mlazienka')return readMlazienkaProduct(source,fetchImpl);
  if(source.format==='integra'){
    const p=await readIntegraProduct(source,fetchImpl);
    const html=`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:source.name,gtin13:source.ean,brand:source.brand,image:p.imageUrl,offers:{'@type':'Offer',price:(p.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}})}</script>`;
    return{...parseRetailPage(html,{...source,format:'jsonld'},new Date()),stockPackages:p.stock,evidenceSha256:p.evidenceSha256};
  }
  if(source.format==='bmb'){
    const current=await readBmbCart(source,1,fetchImpl),p=current.product;
    const html=`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:p.name,gtin13:source.ean,brand:source.brand,image:p.imageUrl,offers:{'@type':'Offer',price:(p.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}})}</script>`;
    return{...parseRetailPage(html,{...source,format:'jsonld'},new Date()),stockPackages:p.stock,evidenceSha256:current.evidenceSha256};
  }
  if (source.store==='Leroy Merlin'&&source.browserReviewAllowed) throw Error('browser_refresh_required');
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
  if(source.format==='kowalczyk-magento'){
    const p=await readKowalczykProduct(source,fetchImpl);
    const html=`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:source.name,gtin13:source.ean,brand:source.brand,image:p.imageUrl,offers:{'@type':'Offer',price:(p.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}})}</script>`;
    return {...parseRetailPage(html,{...source,format:'jsonld'},new Date()),evidenceSha256:p.evidenceSha256};
  }
  if(source.format==='irbud-woo'){
    const p=await readIrbudProduct(source,fetchImpl);
    const html=`<script type="application/ld+json">${JSON.stringify({'@type':'Product',sku:retailSkuCode(source),name:source.name,brand:source.brand,image:p.imageUrl,offers:{'@type':'Offer',price:(p.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}})}</script>`;
    return {...parseRetailPage(html,source,new Date()),evidenceSha256:p.evidenceSha256};
  }
  if(source.format==='pati-woo'){
    const p=await readPatiProduct(source,fetchImpl);
    const html=`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:p.name,gtin13:source.ean,brand:source.brand,image:p.imageUrl,offers:{'@type':'Offer',price:(p.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}})}</script>`;
    return {...parseRetailPage(html,{...source,format:'jsonld'},new Date()),stockPackages:p.stockPackages,evidenceSha256:p.evidenceSha256};
  }
  if(source.format==='budshop-woo'){
    const p=await readBudshopProduct(source,fetchImpl);
    const html=`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:p.name,gtin13:source.ean,brand:source.brand,image:p.imageUrl,offers:{'@type':'Offer',price:(p.priceGrosze/100).toFixed(2),priceCurrency:'PLN',availability:'https://schema.org/InStock',url:source.url}})}</script>`;
    return {...parseRetailPage(html,{...source,format:'jsonld'},new Date()),stockPackages:p.stockPackages,evidenceSha256:p.evidenceSha256};
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
    if (source.apiProductCode && item.code !== source.apiProductCode) throw new Error('product_code_not_confirmed');
    if (source.apiProductCode && normalizeProductName(item.producer?.name ?? '') !== normalizeProductName(source.brand)) throw new Error('product_brand_not_confirmed');
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
  // One native piece is this liquid 500 ml bottle, not the separate spray or 5 l can.
  // source: https://www.rabdom.pl/pl/p/Chem-Rozlew-Benzyna-ekstrakcyjna-rozcienczalnik-0%2C5L/316
  if (source.id === 'rabdom-chem-rozlew-extraction-solvent-500ml' && (source.ean !== '5906681230253'
    || source.packageSize !== 500 || source.unit !== 'ml' || source.productId !== 316
    || source.retailerSku !== '0175' || source.apiPurchaseUnit !== 'szt.' || item.ean !== '5906681230253'
    || normalizeProductName(item.name ?? '') !== normalizeProductName(source.name))) throw Error('product_package_not_confirmed');
  // One native piece is a whole reviewed can; no per-ml or tinted-base price.
  // source: https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-0%2C75L/7607
  // source: https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-2L/7613
  const cabinetPacks: Record<string, readonly [string, number, number, string]> = {
    'rabdom-v33-easy-kitchen-white-750ml': ['3153895149044', 750, 7607, '30668'],
    'rabdom-v33-easy-kitchen-white-2000ml': ['3153895149228', 2000, 7613, '23708'],
  };
  const cabinet = cabinetPacks[source.id];
  if (cabinet && (source.ean !== cabinet[0] || source.packageSize !== cabinet[1] || source.unit !== 'ml' || source.productId !== cabinet[2]
    || source.retailerSku !== cabinet[3] || source.apiPurchaseUnit !== 'szt.' || item.ean !== cabinet[0]
    || normalizeProductName(item.name ?? '') !== normalizeProductName(source.name))) throw Error('product_package_not_confirmed');
  // Matiw's native "szt." is one sealed 50-sheet pack. Sewera sells the same
  // grades as individual sheets while showing the manufacturer's pack EAN.
  // source: https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P80-50szt/25767
  // source: https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P100-50szt/25768
  // source: https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P120-50szt/25769
  // source: https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P150-50szt/25770
  // source: https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P180-50szt/25771
  // source: https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P220-50szt/25772
  // source: https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P240-50szt/25773
  const paperPacks: Record<string, readonly [string, number, string, string]> = {
    'matiw-klingspor-pl28c-p40-50': ['5907560018009', 25766, '000564', 'P40'],
    'matiw-klingspor-pl28c-p60-50': ['5907560018016', 25777, '000611', 'P60'],
    'matiw-klingspor-pl28c-p80-50': ['5907560017637', 25767, '000615', 'P80'],
    'matiw-klingspor-pl28c-p100-50': ['5907560023546', 25768, '000618', 'P100'],
    'matiw-klingspor-pl28c-p120-50': ['5907560017644', 25769, '000620', 'P120'],
    'matiw-klingspor-pl28c-p150-50': ['5907560023553', 25770, '000621', 'P150'],
    'matiw-klingspor-pl28c-p180-50': ['5907560023560', 25771, '000622', 'P180'],
    'matiw-klingspor-pl28c-p220-50': ['5907560027483', 25772, '000632', 'P220'],
    'matiw-klingspor-pl28c-p240-50': ['5907560039820', 25773, '000634', 'P240'],
  };
  const paper = paperPacks[source.id];
  if (paper && (source.ean !== paper[0] || source.productId !== paper[1] || source.apiProductCode !== paper[2]
    || source.retailerSku !== paper[2] || source.packageSize !== 50 || source.unit !== 'szt' || source.apiPurchaseUnit !== 'szt.'
    || item.ean !== paper[0] || item.code !== paper[2] || item.producer?.name !== 'Klingspor'
    || normalizeProductName(item.name ?? '') !== normalizeProductName(source.name)
    || !normalizeProductName(htmlText(String(item.description ?? ''))).includes(normalizeProductName(`${paper[3]} 50szt`)))) throw Error('product_package_not_confirmed');
  // Exact native pieces contain the reviewed kilograms, litres or whole roll.
  // The 300 mm floor collar is one piece; the existing 120 mm wall pack is two.
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-uszczelniajacy-300-x-300mm%2C-podlogowy/3091
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-5l-KONCENTRAT-GRUNTUJACY-GRUNT/10969
  const hydroPacks: Record<string, readonly [string, number, string, number, string]> = {
    'winbud-mapegum-wps-5kg': ['8022452002113', 5, 'kg', 131, '002113'],
    'winbud-mapegum-wps-10kg': ['8022452002120', 10, 'kg', 419, '002120'],
    'winbud-mapegum-wps-20kg': ['8022452242502', 20, 'kg', 3543, '8022452242502'],
    'winbud-mapeband-w-10m': ['8022452113932', 10, 'm', 3088, '8022452113932'],
    'winbud-mapeband-w-floor-300': ['8022452113895', 1, 'szt', 3091, '8022452113895'],
    'rabdom-primer-g-pro-1l': ['8022452241123', 1, 'l', 10970, '37969'],
    'rabdom-primer-g-pro-5l': ['8022452241130', 5, 'l', 10969, '37970'],
  };
  // source: https://knauf.com/pl-PL/p/produkt/knauf-betokontakt-10251_0120
  // source: https://knauf.com/pl-PL/p/produkt/knauf-profix-10681_0120
  // One native piece is a whole5kg bucket or1m×50m roll, never one kg/metre.
  const plasterPacks:Record<string,readonly [string,number,string,number,string]>={
    // source: https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390
    'liderzycen-knauf-goldband-25kg':['5902367206383',25,'kg',55390,'ctma_5902367206383'],
    'realbud-knauf-betokontakt-5kg':['4006379051014',5,'kg',74052350,'9341'],
    'realbud-knauf-profix-50m2':['5902367201067',50,'m2',75057500,'11723'],
  };
  const plaster=plasterPacks[source.id];
  if(plaster&&(source.ean!==plaster[0]||source.packageSize!==plaster[1]||source.unit!==plaster[2]||source.productId!==plaster[3]||source.retailerSku!==plaster[4]||source.apiPurchaseUnit!=='szt.'||item.ean!==plaster[0]||normalizeProductName(item.name??'')!==normalizeProductName(source.name)))throw Error('product_package_not_confirmed');
  const hydro = hydroPacks[source.id];
  if (hydro && (source.ean !== hydro[0] || source.packageSize !== hydro[1] || source.unit !== hydro[2]
    || source.productId !== hydro[3] || source.retailerSku !== hydro[4] || source.apiPurchaseUnit !== 'szt.'
    || item.ean !== hydro[0] || normalizeProductName(item.name ?? '') !== normalizeProductName(source.name))) throw Error('product_package_not_confirmed');
  // One native piece is the whole25m roll, not its18.75m² nominal area.
  // source: https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972
  if (source.id === 'plejada-erismann-rollover-3333-5' && (source.ean !== '4002790333357' || source.packageSize !== 1 || source.unit !== 'szt' || source.apiPurchaseUnit !== 'szt.' || source.productId !== 23972 || source.retailerSku !== 'ER 3333-5')) throw Error('product_package_not_confirmed');
  // Native one-piece prices describe the entire dry-powder pack, not a gram
  // or a litre of mixed paste. Bind the exact reviewed manufacturer variant.
  // source: https://plejadatapet.pl/pl/p/Klej-do-tapet-Direct-200g-Metylan/825
  // source: https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101
  const gluePacks: Record<string, [string, number]> = {
    'plejada-metylan-direct-200g': ['4015000402019', 200], 'swiat-metylan-direct-200g': ['4015000402019', 200],
    'plejada-metylan-normal-125g': ['4015000095266', 125], 'swiat-metylan-normal-125g': ['4015000095266', 125],
  };
  const glue = gluePacks[source.id];
  if (glue && (source.ean !== glue[0] || source.packageSize !== glue[1] || source.unit !== 'g' || source.apiPurchaseUnit !== 'szt.'
    || String(item.ean) !== glue[0] || normalizeProductName(item.name ?? '') !== normalizeProductName(source.name))) throw Error('product_package_not_confirmed');
  // This EAN identifies the manufacturer's100-piece carton. EHW also explicitly
  // describes a cardboard package, while Zpradem names100szt in its primary card.
  // source: https://rawlplug.com/global/en/p/r-gs-06040
  if (['ehw-rawlplug-gs-100','zpradem-rawlplug-gs-100'].includes(source.id)
      && (source.ean!=='5906675169347'||source.packageSize!==100||source.unit!=='szt'||source.apiPurchaseUnit!=='szt.')) throw Error('product_package_not_confirmed');
  // Reviewed native purchase units bind one Shoper piece/package to the whole
  // manufacturer's carton, not to a single screw or fixing.
  // source: https://kim24.pl/Kolek-szybki-montaz-kolnierz-6x40-KOELNER
  // source: https://zpradem.pl/wkret-fosfatowany-samowiercacy-35x95-ws-3595-1000szt/798230
  if (source.id === 'kim-koelner-fx06k040-200' && (source.ean !== '5906675107622' || source.packageSize !== 200 || source.unit !== 'szt' || source.apiPurchaseUnit !== 'op.' || source.productId !== 13330 || source.retailerSku !== 'MTZKKW06K040')) throw Error('product_package_not_confirmed');
  if (source.id === 'zpradem-koelner-ws3595-1000' && (source.ean !== '5906675303024' || source.packageSize !== 1000 || source.unit !== 'szt' || source.apiPurchaseUnit !== 'szt.' || source.productId !== 798230 || source.retailerSku !== '0004-00010-06761')) throw Error('product_package_not_confirmed');
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
