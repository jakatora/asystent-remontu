import type { RetailSource } from './retail-pages';

/** Only exact, reviewed product pages. Client input can never add a fetch URL. */
export const RETAIL_SOURCES: readonly RetailSource[] = [
  {
    id: 'castorama-sniezka-5l', ean: '5903973139188', name: 'Farba Śnieżka Barwy Natury biała 5 l',
    category: 'paint', brand: 'Śnieżka', packageSize: 5, unit: 'l', store: 'Castorama',
    // source: https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd
    url: 'https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd',
  },
  {
    id: 'obi-sniezka-5l', ean: '5903973139188', name: 'Farba Śnieżka Barwy Natury biała 5 l',
    category: 'paint', brand: 'Śnieżka', packageSize: 5, unit: 'l', store: 'OBI',
    // source: https://www.obi.pl/p/6314371/farba-sniezka-barwy-natury-biala-5-l
    url: 'https://www.obi.pl/p/6314371/farba-sniezka-barwy-natury-biala-5-l',
  },
  {
    id: 'castorama-knauf-5l', ean: '5901793357737', name: 'Grunt uniwersalny Knauf 5 l',
    category: 'primer', brand: 'Knauf', packageSize: 5, unit: 'l', store: 'Castorama',
    // source: https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd
    url: 'https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd',
  },
];

// Stable calculator catalogue labels, not fuzzy matches against store search results.
export const RETAIL_NAME_ALIASES: Readonly<Record<string, string>> = {
  'Farba lateksowa Śnieżka Barwy Natury biała 5 l': '5903973139188',
  'Grunt uniwersalny Knauf 5 l': '5901793357737',
};
