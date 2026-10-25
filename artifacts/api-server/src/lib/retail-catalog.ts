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
  {
    id: 'sewera-sniezka-5l', ean: '5903973139188', name: 'Barwy Natury 173 majowa konwalia 5l',
    category: 'paint', brand: 'Śnieżka', packageSize: 5, unit: 'l', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/barwy-natury-173-majowa-konwalia-5l-p7136
    url: 'https://sklep.sewera.pl/barwy-natury-173-majowa-konwalia-5l-p7136',
  },
  {
    id: 'sewera-tape-30mm', ean: '5907758515952', name: 'Taśma malarska niebieska 30mmx50m',
    category: 'masking-tape', brand: 'Blue Dolphin', packageSize: 50, unit: 'mb', store: 'Sewera', format: 'sewera', variant: ['30mmx50m'],
    // source: https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966
    url: 'https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966',
  },
  {
    id: 'sewera-film-20m2', ean: '5907758504932', name: 'Folia malarska gruba 4x5m CF_EP20_04932 Blue Dolphin',
    category: 'protective-film', brand: 'Blue Dolphin', packageSize: 20, unit: 'm2', store: 'Sewera', format: 'sewera', variant: ['4x5m'],
    // source: https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034
    url: 'https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034',
  },
  {
    id: 'realbud-knauf-5l', ean: '5901793357737', name: 'Grunt KNAUF Universalgrund 5 L Środek głęboko gruntujący',
    category: 'primer', brand: 'Knauf', packageSize: 5, unit: 'l', store: 'Realbud', format: 'realbud',
    // source: https://realbud.com/pl/p/Grunt-KNAUF-Universalgrund-5-L-Srodek-gleboko-gruntujacy/75056675
    url: 'https://realbud.com/pl/p/Grunt-KNAUF-Universalgrund-5-L-Srodek-gleboko-gruntujacy/75056675',
  },
];

// Stable calculator catalogue labels, not fuzzy matches against store search results.
export const RETAIL_NAME_ALIASES: Readonly<Record<string, string>> = {
  'Farba lateksowa Śnieżka Barwy Natury biała 5 l': '5903973139188',
  'Grunt uniwersalny Knauf 5 l': '5901793357737',
  'Taśma malarska Blue Dolphin niebieska 30 mm x 50 m': '5907758515952',
  'Folia malarska gruba Blue Dolphin 4 x 5 m': '5907758504932',
};
