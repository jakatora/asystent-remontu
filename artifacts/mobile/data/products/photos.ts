/** Product photographs observed on the linked retail pages on 2026-10-24–25.
 * Match by stable catalogue ID, EAN or exact source URL, never by fuzzy name.
 */
interface ProductPhoto {
  readonly ids: readonly string[];
  readonly ean: string;
  readonly sourceUrl: string;
  readonly imageUrl: string;
}

export const PRODUCT_PHOTOS: readonly ProductPhoto[] = [
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966
  {"ids":["mat-masking-tape-bluedolphin-30mm"],"ean":"5907758515952","sourceUrl":"https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966","imageUrl":"https://sklep.sewera.pl/photo/23077/tasma-malarska-niebieska-30mmx50m.webp"},
  // source: https://sklep.sewera.pl/acryl-putz-st10-start-20kg-p6107
  {"ids":["mat-skim-coat-acrylputz-st10-20kg"],"ean":"5903973104421","sourceUrl":"https://sklep.sewera.pl/acryl-putz-st10-start-20kg-p6107","imageUrl":"https://sklep.sewera.pl/photo/34282/acryl-putz-st10-start-20kg.webp"},
  // source: https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034
  {"ids":["mat-protective-film-bluedolphin-4x5m"],"ean":"5907758504932","sourceUrl":"https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034","imageUrl":"https://sklep.sewera.pl/photo/23165/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin.webp"},
  // source: https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782
  {"ids":["mat-mesh-fiberglass-atlas-150-50m2"],"ean":"5905400196993","sourceUrl":"https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782","imageUrl":"https://sklep.sewera.pl/photo/38995/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas.webp"},
  // source: https://sklep.sewera.pl/soudal-akryl-bialy-280ml-p10680
  {"ids":["mat-acrylic-soudal-white-280ml"],"ean":"5411183157538","sourceUrl":"https://sklep.sewera.pl/soudal-akryl-bialy-280ml-p10680","imageUrl":"https://sklep.sewera.pl/photo/65126/soudal-akryl-bialy-280ml.webp"},
  // source: https://sklep.sewera.pl/tynk-wewnetrzny-cementowo-wapienny-baumit-mpi-25-30kg-p9081
  {"ids":["mat-plaster-cementlime-baumit-mpi25-30kg"],"ean":"5907534261158","sourceUrl":"https://sklep.sewera.pl/tynk-wewnetrzny-cementowo-wapienny-baumit-mpi-25-30kg-p9081","imageUrl":"https://sklep.sewera.pl/photo/250127/tynk-wewnetrzny-cementowo-wapienny-baumit-mpi-25-30kg.webp"},
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101
  {"ids":["mat-plaster-thin-ceresit-ct174-25kg"],"ean":"9000101109733","sourceUrl":"https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101","imageUrl":"https://sklep.sewera.pl/photo/244805/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit.webp"},
  // source: https://realbud.com/Kolek-do-mcowania-izolacji-10-200-mtal-trzpien-50-op
  {"ids":["mat-anchor-facade-koelner-ki200m-10x200"],"ean":"5906675212647","sourceUrl":"https://realbud.com/Kolek-do-mcowania-izolacji-10-200-mtal-trzpien-50-op","imageUrl":"https://realbud.com/environment/cache/images/productGfx_25596_500_500/5393.png"},
  // source: https://sklep.sewera.pl/silikon-uniwersalny-bezbarwny-280ml-soudal-p21290
  {"ids":["mat-silicone-universal-soudal-280ml"],"ean":"5411183157552","sourceUrl":"https://sklep.sewera.pl/silikon-uniwersalny-bezbarwny-280ml-soudal-p21290","imageUrl":"https://sklep.sewera.pl/photo/343695/silikon-uniwersalny-bezbarwny-280ml-soudal.webp"},
  // source: https://sklep.sewera.pl/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16kg-atlas-p9897
  {"ids":["mat-waterproof-membrane-atlas-woder-duo-16kg"],"ean":"5905400195088","sourceUrl":"https://sklep.sewera.pl/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16kg-atlas-p9897","imageUrl":"https://sklep.sewera.pl/photo/193135/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16kg-atlas.webp"},
  // source: https://realbud.com/pl/p/Ceresit-CN-72-NIVEL-FAST%2C-25-kg%2C-zaprawa-samopoziomujaca/75057225
  {"ids":["mat-screed-ceresit-cn72-25kg"],"ean":"5900089272259","sourceUrl":"https://realbud.com/pl/p/Ceresit-CN-72-NIVEL-FAST%2C-25-kg%2C-zaprawa-samopoziomujaca/75057225","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23328_500_500/8cf842d859fb9fe114e5ad53d45a64a2.jpg"},
  // source: https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-15kg-atlas-p6346
  {"ids":["mat-waterproof-membrane-atlas-woder-e-15kg"],"ean":"5905400514506","sourceUrl":"https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-15kg-atlas-p6346","imageUrl":"https://sklep.sewera.pl/photo/186395/folia-w-plynie-szybkoschnaca-woder-e-15kg-atlas.webp"},
  // source: https://sklep.sewera.pl/atlas-fuga-ceramiczna-001-bialy-2kg-p11674
  {"ids":["mat-grout-atlas-001-white-2kg"],"ean":"5905400572254","sourceUrl":"https://sklep.sewera.pl/atlas-fuga-ceramiczna-001-bialy-2kg-p11674","imageUrl":"https://sklep.sewera.pl/photo/257132/atlas-fuga-ceramiczna-001-bialy-2kg.webp"},
  // source: https://sklep.sewera.pl/tasma-uszczelniajaca-cl152-120mm-x-10m-ceresit-p7692
  {"ids":["mat-sealing-tape-ceresit-cl152-10m"],"ean":"5900089115211","sourceUrl":"https://sklep.sewera.pl/tasma-uszczelniajaca-cl152-120mm-x-10m-ceresit-p7692","imageUrl":"https://sklep.sewera.pl/photo/19057/tasma-uszczelniajaca-cl152-120mm-x-10m-ceresit.webp"},
  // source: https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-10cm-welna-szklana-p11975
  {"ids":["mat-mineral-wool-isover-akuplyta-10cm"],"ean":"5901644653155","sourceUrl":"https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-10cm-welna-szklana-p11975","imageUrl":"https://sklep.sewera.pl/photo/190057/isover-welna-mineralna-aku-plyta-037-10cm-welna-szklana.webp"},
  // source: https://sklep.sewera.pl/kolek-szybkiego-montazu-6x40mm-20szt-p10030
  {"ids":["mat-quick-dowels-wkretmet-sm-6x40-20"],"ean":"5907704466031","sourceUrl":"https://sklep.sewera.pl/kolek-szybkiego-montazu-6x40mm-20szt-p10030","imageUrl":"https://sklep.sewera.pl/photo/332585/kolek-szybkiego-montazu-6x40mm-20szt-klimas.webp"},
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-2mm-200szt--p12504
  {"ids":["mat-tile-spacers-hardy-2mm-200"],"ean":"5905061016845","sourceUrl":"https://sklep.sewera.pl/krzyzyki-dystansowe-2mm-200szt--p12504","imageUrl":"https://sklep.sewera.pl/photo/310570/krzyzyki-dystansowe-2mm-200szt-.webp"},
  // source: https://sklep.sewera.pl/wkret-tb-3-5x25mm-samowiercacyfosfatowany-100szt-p9993
  {"ids":["mat-drywall-screws-wkretmet-35x25-100"],"ean":"5907704499015","sourceUrl":"https://sklep.sewera.pl/wkret-tb-3-5x25mm-samowiercacyfosfatowany-100szt-p9993","imageUrl":"https://sklep.sewera.pl/photo/80066/wkret-samowiercacy-do-metalu-tb-3-5x25mm-fosfatowany-100szt-klimas.webp"},
  // source: https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439
  {"ids":["mat-foam-tytan-pro65-750ml"],"ean":"5903518052859","sourceUrl":"https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439","imageUrl":"https://sklep.sewera.pl/photo/257574/pianka-montazowa-pistoletowa-65-750ml-tytan.webp"},
  // source: https://sklep.sewera.pl/dekoral-farba-lateksowa-odporna-na-szorowanie-akrylit-w-plus-5l-p7969
  {"ids":["mat-paint-latex-dekoral-akrylit-w-white-5l"],"ean":"5904000810681","sourceUrl":"https://sklep.sewera.pl/dekoral-farba-lateksowa-odporna-na-szorowanie-akrylit-w-plus-5l-p7969","imageUrl":"https://sklep.sewera.pl/photo/260243/dekoral-farba-lateksowa-odporna-na-szorowanie-akrylit-w-plus-5l.webp"},
  // source: https://sklep.sewera.pl/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg-p9147
  {"ids":["mat-grout-ceresit-ce40-white-2kg"],"ean":"5900089140015","sourceUrl":"https://sklep.sewera.pl/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg-p9147","imageUrl":"https://sklep.sewera.pl/photo/331996/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg.webp"},
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-38mmx50m-p6967
  {"ids":["mat-masking-tape-bluedolphin-38mm"],"ean":"5907758507285","sourceUrl":"https://sklep.sewera.pl/tasma-malarska-niebieska-38mmx50m-p6967","imageUrl":"https://sklep.sewera.pl/photo/23327/tasma-malarska-niebieska-38mmx50m.webp"},
  // source: https://realbud.com/pl/p/Ceresit-CM-11%2C-25-kg%2C-uniwersalny-klej-do-plytek/75057156
  {"ids":["mat-tile-adhesive-ceresit-cm11-25kg"],"ean":"5900089111251","sourceUrl":"https://realbud.com/pl/p/Ceresit-CM-11%2C-25-kg%2C-uniwersalny-klej-do-plytek/75057156","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23258_500_500/46e2bb71554f4ee22711a9cccee46e6b.jpg"},
  // source: https://realbud.com/pl/p/Ceresit-CT-17%2C-10-l%2C-gleboko-penetrujacy-grunt-bezrozpuszczalnikowy/75057217
  {"ids":["mat-primer-deep-ceresit-ct17-10l"],"ean":"5900089617081","sourceUrl":"https://realbud.com/pl/p/Ceresit-CT-17%2C-10-l%2C-gleboko-penetrujacy-grunt-bezrozpuszczalnikowy/75057217","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23320_500_500/4f6162f89165674a20b43a12f287acd2.png"},
  // source: https://sklep.sewera.pl/silikon-sanitarny-bialy-280ml-soudal-p21286
  {"ids":["mat-sanitary-silicone-soudal-280ml"],"ean":"5411183157064","sourceUrl":"https://sklep.sewera.pl/silikon-sanitarny-bialy-280ml-soudal-p21286","imageUrl":"https://sklep.sewera.pl/photo/343671/silikon-sanitarny-bialy-280ml-soudal.webp"},
  // source: https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089
  {"ids":["mat-paint-better-white-10l"],"ean":"5903973205982","sourceUrl":"https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089","imageUrl":"https://sklep.sewera.pl/photo/65072/sniezka-eko-plus-odporna-na-szorowanie-10l.webp"},
  // source: https://sklep.sewera.pl/podkladowa-masa-tynkarska-cerplast-15kg-atlas-p9884
  {"ids":["mat-plaster-primer-atlas-cerplast-15kg"],"ean":"5905400530032","sourceUrl":"https://sklep.sewera.pl/podkladowa-masa-tynkarska-cerplast-15kg-atlas-p9884","imageUrl":"https://sklep.sewera.pl/photo/92128/podkladowa-masa-tynkarska-cerplast-15kg-atlas.webp"},
  // source: https://sklep.sewera.pl/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy-p9795
  {"ids":["mat-screed-atlas-sam200-25kg"],"ean":"5905400279269","sourceUrl":"https://sklep.sewera.pl/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy-p9795","imageUrl":"https://sklep.sewera.pl/photo/92590/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy.webp"},
  // source: https://sklep.sewera.pl/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy-p9811
  {"ids":["mat-screed-atlas-sam100-25kg"],"ean":"5905400279245","sourceUrl":"https://sklep.sewera.pl/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy-p9811","imageUrl":"https://sklep.sewera.pl/photo/92586/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy.webp"},
  // source: https://sklep.sewera.pl/acryl-putz-fs20-finisz-27kg-p6114
  {"ids":["mat-skim-coat-acrylputz-fs20-27kg"],"ean":"5903973104544","sourceUrl":"https://sklep.sewera.pl/acryl-putz-fs20-finisz-27kg-p6114","imageUrl":"https://sklep.sewera.pl/photo/259046/acryl-putz-fs20-finisz-27kg.webp"},
  // source: https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772
  {"ids":["mat-primer-deep-atlas-unigrunt-5kg"],"ean":"5905400520026","sourceUrl":"https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772","imageUrl":"https://sklep.sewera.pl/photo/313998/atlas-uni-grunt-5kg-emulsja-gruntujaca.webp"},
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
