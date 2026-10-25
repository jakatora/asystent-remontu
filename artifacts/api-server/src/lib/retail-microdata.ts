/** Narrow readers for reviewed retailer templates. No price is read from a recommendation. */
const TAG = /<\/?([a-z][\w:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const clean = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
const decode = (text: string) => text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const text = (html: string) => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
function attrs(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) result[match[1].toLowerCase()] = decode(match[2] ?? match[3]);
  return result;
}

function elements(html: string, predicate: (attributes: Record<string, string>, tagName: string) => boolean): string[] {
  const result: string[] = [];
  for (const match of html.matchAll(TAG)) {
    if (match[0].startsWith('</') || !predicate(attrs(match[0]), match[1].toLowerCase())) continue;
    if (['meta', 'link', 'img', 'input', 'br'].includes(match[1].toLowerCase()) || /\/>$/.test(match[0])) { result.push(match[0]); continue; }
    let depth = 1;
    for (const next of html.slice(match.index! + match[0].length).matchAll(TAG)) {
      if (next[1].toLowerCase() !== match[1].toLowerCase()) continue;
      depth += next[0].startsWith('</') ? -1 : 1;
      if (depth === 0) { result.push(html.slice(match.index!, match.index! + match[0].length + next.index! + next[0].length)); break; }
    }
  }
  return result;
}
export { elements as htmlElements, attrs as htmlAttributes, text as htmlText, clean as cleanHtml };
function one(values: string[], error: string): string {
  if (values.length !== 1) throw new Error(error);
  return values[0];
}
function property(html: string, key: string): string {
  const value = one(elements(html, a => a.itemprop === key), `microdata_${key}_ambiguous`);
  const a = attrs(value.match(TAG)?.[0] ?? '');
  return a.content ?? a.href ?? a.src ?? text(value);
}
function labelled(html: string, label: string, tag: 'strong' | 'em'): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<${tag}\\b[^>]*>\\s*${escaped}\\s*<\\/${tag}>([\\s\\S]*?)<\\/div>`, 'gi');
  return text(one([...html.matchAll(regex)].map(match => match[1]), 'microdata_identity_ambiguous'));
}

export function readRetailMicrodata(html: string, format: 'sewera' | 'realbud' | 'shoper' | 'buduj24', url: string, retailUnit: 'SZT' | 'OPA' = 'SZT'): Record<string, any> {
  const safe = clean(html);
  const product = one(elements(safe, a => /\/Product$/.test(a.itemtype ?? '')), 'microdata_product_ambiguous');
  const offer = one(elements(product, a => a.itemprop === 'offers' && /\/Offer$/.test(a.itemtype ?? '')), 'microdata_offer_ambiguous');
  const price = property(offer, 'price');
  const currency = property(offer, 'priceCurrency');
  const name = property(product, 'name');
  const images = elements(product, a => a.itemprop === 'image').map(element => {
    const a = attrs(element.match(TAG)?.[0] ?? '');
    return a.content ?? a.src ?? a.href;
  }).filter((value): value is string => Boolean(value));
  const image = images[0] ? new URL(decodeURIComponent(images[0]), url).href : null;
  if (format === 'shoper' || format === 'buduj24') {
    const ean = property(product, 'gtin');
    const gross = format === 'shoper'
      ? text(one(elements(offer, a => a.class?.split(/\s+/).includes('main-price') ?? false), 'retailer_gross_price_not_confirmed'))
      : text(one(elements(offer, a => a.class?.split(/\s+/).includes('product-price-gross') ?? false), 'retailer_gross_price_not_confirmed'));
    const amount = gross.replace(/\s|zł/g, '').replace(',', '.');
    if (Number(amount) !== Number(price)) throw new Error('retailer_gross_price_mismatch');
    const expiry = elements(offer, a => a.itemprop === 'priceValidUntil');
    return { '@type': 'Product', name, gtin13: ean, image,
      offers: { '@type': 'Offer', price, priceCurrency: currency, url,
        availability: property(offer, 'availability'),
        ...(expiry.length ? { priceValidUntil: property(offer, 'priceValidUntil') } : {}),
      },
    };
  }
  if (format === 'sewera') {
    const ean = labelled(product, 'Kod kreskowy:', 'strong');
    const brand = labelled(product, 'Producent:', 'strong');
    const stock = labelled(product, 'Dostępne:', 'strong');
    const stockCount = stock.match(/^([0-9]+)\s+(SZT|OPA)$/i);
    if (!stockCount || stockCount[2].toUpperCase() !== retailUnit) throw new Error('retailer_stock_not_confirmed');
    const gross = text(one(elements(offer, a => a.class === 'priceShow'), 'retailer_gross_price_not_confirmed'));
    const grossMatch = gross.match(/^([\d ,.]+)\s*zł\s*brutto\s*\/\s*(SZT|OPA)$/i);
    const amount = grossMatch?.[2].toUpperCase() === retailUnit ? grossMatch[1].replace(/\s/g, '').replace(',', '.') : undefined;
    if (amount === undefined || Number(amount) !== Number(price)) throw new Error('retailer_gross_price_mismatch');
    const description = elements(product, a => a.itemprop === 'description').length ? property(product, 'description') : '';
    return { '@type': 'Product', name, description, gtin13: ean, brand: { name: brand }, image,
      offers: { '@type': 'Offer', price, priceCurrency: currency, url,
        availability: Number(stockCount[1]) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
    };
  }
  const ean = labelled(product, 'Kod EAN:', 'em');
  // The template puts both net and gross prices in the same offer. Confirm gross explicitly.
  const gross = one(elements(offer, a => a.class?.split(/\s+/).includes('main-price') ?? false).map(text).filter(value => /z VAT/i.test(value)), 'retailer_gross_price_not_confirmed');
  const amount = gross.match(/^([\d ,.]+)\s*zł\s*z VAT$/i)?.[1].replace(/\s/g, '').replace(',', '.');
  if (amount === undefined || Number(amount) !== Number(price)) throw new Error('retailer_gross_price_mismatch');
  return { '@type': 'Product', name, gtin13: ean, image,
    offers: { '@type': 'Offer', price, priceCurrency: currency, url: property(offer, 'url'), availability: property(offer, 'availability') },
  };
}
