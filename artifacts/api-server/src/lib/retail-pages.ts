import { createHash } from 'node:crypto';
import { normalizeProductName } from '@workspace/db/repositories';
import { parsePriceToGrosze } from '@workspace/price-collector';

export interface RetailSource {
  id: string;
  ean: string;
  name: string;
  category: string;
  brand: string;
  packageSize: number;
  unit: string;
  store: string;
  url: string;
}

export interface RetailObservation {
  sourceId: string;
  ean: string;
  name: string;
  imageUrl: string | null;
  priceGrosze: number;
  currency: 'PLN';
  availability: 'in_stock';
  observedAt: string;
  sourceUrl: string;
  evidenceSha256: string;
}

function objects(value: unknown): Record<string, any>[] {
  if (Array.isArray(value)) return value.flatMap(objects);
  if (!value || typeof value !== 'object') return [];
  const item = value as Record<string, any>;
  return [item, ...objects(item['@graph'])];
}

/** Read explicit Product + Offer JSON-LD, never a price from search snippets. */
export function parseRetailPage(html: string, source: RetailSource, observedAt: Date): RetailObservation {
  const products: Record<string, any>[] = [];
  for (const script of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { products.push(...objects(JSON.parse(script[1])).filter(item => [item['@type']].flat().includes('Product'))); } catch { /* Other JSON-LD must not supply a price. */ }
  }
  const product = products.find(item => String(item.gtin13 ?? item.gtin ?? '') === source.ean);
  if (!product) throw new Error('product_ean_not_confirmed');
  const name = String(product.name ?? '');
  const normalized = normalizeProductName(name);
  const packagePattern = new RegExp(`(?:^| )${String(source.packageSize).replace('.', ' ')} (?:${source.unit === 'l' ? 'l|litrow|litry' : source.unit})(?: |$)`);
  if (!normalized.includes(normalizeProductName(source.brand)) || !packagePattern.test(normalized)) throw new Error('product_variant_mismatch');
  // The configured exact product name also protects against a wrong EAN on a retailer page.
  if (!normalizeProductName(source.name).split(' ').filter(token => token.length > 3).every(token => normalized.includes(token))) throw new Error('product_name_mismatch');
  const prices = objects(product.offers).filter(offer => {
    if (![offer['@type']].flat().includes('Offer')) return false;
    if (offer.priceCurrency !== 'PLN' || !/\/InStock$/.test(String(offer.availability))) return false;
    if (/OnSitePickup$/.test(String(offer.availableDeliveryMethod))) return false;
    try { if (new URL(offer.url ?? source.url).hostname !== new URL(source.url).hostname) return false; } catch { return false; }
    return true;
  }).map(offer => parsePriceToGrosze(offer.price)).filter((price): price is number => price !== null && price > 0 && Number.isSafeInteger(price));
  if (prices.length === 0) throw new Error('no_confirmed_online_pln_offer');
  // Conflicting online prices are ambiguous; do not pick a tempting minimum.
  if (new Set(prices).size !== 1) throw new Error('ambiguous_online_price');
  const firstImage = [product.image].flat()[0];
  const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
  return {
    sourceId: source.id, ean: source.ean, name,
    imageUrl: typeof imageUrl === 'string' && imageUrl.startsWith('https://') ? imageUrl.replace(/&amp;/g, '&') : null,
    priceGrosze: prices[0], currency: 'PLN', availability: 'in_stock',
    observedAt: observedAt.toISOString(), sourceUrl: source.url,
    evidenceSha256: createHash('sha256').update(html).digest('hex'),
  };
}

export async function readRetailSource(source: RetailSource, fetchImpl: typeof fetch = fetch): Promise<RetailObservation> {
  const response = await fetchImpl(source.url, {
    signal: AbortSignal.timeout(8000), redirect: 'error',
    headers: { 'User-Agent': 'AsystentRemontu/1.0', Accept: 'text/html', 'Accept-Language': 'pl-PL' },
  });
  if (!response.ok) throw new Error(`retailer_http_${response.status}`);
  if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('retailer_invalid_content_type');
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
  return parseRetailPage(Buffer.concat(chunks).toString('utf8'), source, new Date());
}
