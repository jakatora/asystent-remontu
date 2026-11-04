import type { RetailSource } from './retail-pages';

// Each offer is one tool, not the manufacturer's wholesale carton or its size.
export const HAND_TOOL_SOURCES: readonly RetailSource[] = [
  // source: https://sklep.sewera.pl/miara-zwijana-5m-x-19mm-gumowana-stalco-p20547
  // source: https://stalco.pl/media/katalogi/KATALOG_STALCO_2026_PL.pdf
  {
    id: 'sewera-stalco-s010124205-tape-measure', ean: '5905947919611',
    name: 'Miara zwijana 5m x 19mm gumowana Stalco', brand: 'Stalco', category: 'tape-measure',
    packageSize: 1, unit: 'szt', retailUnit: 'SZT', store: 'Sewera', format: 'sewera',
    variant: ['5m', '19mm'], pickupRequiresConfirmation: true,
    url: 'https://sklep.sewera.pl/miara-zwijana-5m-x-19mm-gumowana-stalco-p20547',
    imageUrl: 'https://sklep.sewera.pl/photo/292162/miara-zwijana-5m-x-19mm-gumowana-stalco.webp',
  },
  // source: https://sklep.sewera.pl/kuweta-malarska-37x34-cm-hardy-p6310
  // source: https://hardy.pl/product/resource?prid=909
  {
    id: 'sewera-hardy-0146-323734k-tray', ean: '5905061980771',
    name: 'Kuweta malarska 37x34 cm Hardy', brand: 'Hardy', category: 'paint-tray',
    packageSize: 1, unit: 'szt', retailUnit: 'SZT', store: 'Sewera', format: 'sewera',
    variant: ['37x34'], pickupRequiresConfirmation: true,
    url: 'https://sklep.sewera.pl/kuweta-malarska-37x34-cm-hardy-p6310',
    imageUrl: 'https://sklep.sewera.pl/photo/308205/kuweta-malarska-37x34-cm-hardy.webp',
  },
  // source: https://sklep.sewera.pl/wyciskacz-do-kartuszy-szkieletowy-310ml-tytan-p18099
  // source: https://tytan.com/pl/produkt/akcesoria/wyciskacz-mechaniczny-szkieletowy-do-kartuszy/
  {
    id: 'sewera-tytan-10003240-caulk-gun', ean: '5903518042997',
    name: 'Wyciskacz do kartuszy szkieletowy 310ml Tytan', brand: 'Tytan', category: 'caulk-gun',
    packageSize: 1, unit: 'szt', retailUnit: 'SZT', store: 'Sewera', format: 'sewera',
    variant: ['310ml'], pickupRequiresConfirmation: true,
    url: 'https://sklep.sewera.pl/wyciskacz-do-kartuszy-szkieletowy-310ml-tytan-p18099',
    imageUrl: 'https://sklep.sewera.pl/photo/256251/wyciskacz-do-kartuszy-szkieletowy-310ml-tytan.webp',
  },
];
