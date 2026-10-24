/** Product photographs observed on the linked retail pages on 2026-10-24.
 * Match by stable catalogue ID, EAN or exact source URL, never by fuzzy name.
 */
interface ProductPhoto {
  readonly ids: readonly string[];
  readonly ean: string;
  readonly sourceUrl: string;
  readonly imageUrl: string;
}

export const PRODUCT_PHOTOS: readonly ProductPhoto[] = [
  {
    ids: [], ean: '5903973153214',
    // source: https://www.leroymerlin.pl/produkty/farba-magnat-ceramic-bialy-5-l-45615171.html
    sourceUrl: 'https://www.leroymerlin.pl/produkty/farba-magnat-ceramic-bialy-5-l-45615171.html',
    imageUrl: 'https://media.adeo.com/media/5071689/media.png?fit=bounds&format=jpg&height=125&quality=60&width=125',
  },
  {
    ids: ['mat-universal-primer-5l'], ean: '5901793357737',
    // source: https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd
    sourceUrl: 'https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/grunt-uniwersalny-knauf-5-l~5901793357737_03c_CP?%24MOB_PREV%24=&%24height=600&%24width=600',
  },
  {
    ids: ['mat-paint-latex-sniezka-barwy-natury-white-5l'], ean: '5903973139188',
    // source: https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd
    sourceUrl: 'https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/farba-sniezka-barwy-natury-biala-5-l~5903973139188_01h_PL_CP?%24MOB_PREV%24=&%24height=600&%24width=600',
  },
  {
    ids: ['mat-paint-latex-dulux-easycare-white-9l'], ean: '5904078198759',
    // source: https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd
    sourceUrl: 'https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l~5904078198759_01c_PL_CP?%24MOB_PREV%24=&%24height=600&%24width=600',
  },
  {
    ids: ['mat-skim-coat-standard-18kg'], ean: '5905400542509',
    // source: https://www.castorama.pl/gotowa-gladz-polimerowa-atlas-gta-18-kg/5905400542509_CAPL.prd
    sourceUrl: 'https://www.castorama.pl/gotowa-gladz-polimerowa-atlas-gta-18-kg/5905400542509_CAPL.prd',
    imageUrl: 'https://media2.castorama.pl/is/image/CastoramaPL/gotowa-gladz-polimerowa-atlas-gta-18-kg~5905400542509_02c_PL_CP?%24MOB_PREV%24=&%24height=600&%24width=600',
  },
];

export function getProductPhoto(product: {
  id?: string; ean?: string | null; imageUrl?: string | null; sourceUrl?: string;
  shopPrices?: readonly { url: string }[];
}): string | undefined {
  if (product.imageUrl?.startsWith('https://')) return product.imageUrl;
  const urls = [product.sourceUrl, ...product.shopPrices?.map(price => price.url) ?? []];
  return PRODUCT_PHOTOS.find(photo =>
    (product.id && photo.ids.includes(product.id)) ||
    (product.ean && photo.ean === product.ean) || urls.includes(photo.sourceUrl),
  )?.imageUrl;
}
