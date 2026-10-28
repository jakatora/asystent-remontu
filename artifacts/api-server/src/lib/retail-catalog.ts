import type { RetailSource } from './retail-pages';

/** Only exact, reviewed product pages. Client input can never add a fetch URL. */
export const RETAIL_SOURCES: readonly RetailSource[] = [
  {
    id: 'castorama-sniezka-5l', ean: '5903973139188', name: 'Farba Śnieżka Barwy Natury biała 5 l',
    category: 'paint', brand: 'Śnieżka', packageSize: 5, unit: 'l', store: 'Castorama', pickupRequiresConfirmation: true,
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
    category: 'primer', brand: 'Knauf', packageSize: 5, unit: 'l', store: 'Castorama', pickupRequiresConfirmation: true,
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
  {
    id: 'rabdom-tape-30mm', ean: '5907758515952', name: 'BLUE DOLPHIN Taśma malarska papierowa do wnętrz i na zewnątrz 30mm x 50m niebieska',
    category: 'masking-tape', brand: 'Blue Dolphin', packageSize: 50, unit: 'mb', store: 'Rab-Dom', format: 'shoper', variant: ['30mmx50m'],
    // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-30mm-x-50m-niebieska/2526
    url: 'https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-30mm-x-50m-niebieska/2526',
  },
  {
    id: 'rabdom-film-20m2', ean: '5907758504932', name: 'Folia ochronna malarska Blue Dolphin GRUBA 4m x 5m',
    category: 'protective-film', brand: 'Blue Dolphin', packageSize: 20, unit: 'm2', store: 'Rab-Dom', format: 'shoper', variant: ['4mx5m'],
    // source: https://www.rabdom.pl/pl/p/Folia-ochronna-malarska-Blue-Dolphin-GRUBA-4m-x-5m/3751
    url: 'https://www.rabdom.pl/pl/p/Folia-ochronna-malarska-Blue-Dolphin-GRUBA-4m-x-5m/3751',
  },
  {
    id: 'buduj24-tape-30mm', ean: '5907758515952', name: 'BLUE DOLPHIN Taśma malarska 30MM X 50M NIEBIESKA MASKUJĄCA do odcinania 1 SZTUKA',
    category: 'masking-tape', brand: 'Blue Dolphin', packageSize: 50, unit: 'mb', store: 'Buduj24', format: 'buduj24', variant: ['30mmx50m'],
    // source: https://buduj24.pl/produkt/10647,blue-dolphin-tasma-malarska-30mm-x-50m-niebieska-maskujaca-do-odcinania-1-sztuka
    url: 'https://buduj24.pl/produkt/10647,blue-dolphin-tasma-malarska-30mm-x-50m-niebieska-maskujaca-do-odcinania-1-sztuka',
  },
  {
    id: 'sewera-dulux-9l', ean: '5904078198759', name: 'Farba wewnętrzna biała Easycare nieskazitelna biel 9l mat Dulux',
    category: 'paint', brand: 'Dulux', packageSize: 9, unit: 'l', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/farba-wewnetrzna-biala-easycare-nieskazitelna-biel-9l-mat-dulux-p21385
    url: 'https://sklep.sewera.pl/farba-wewnetrzna-biala-easycare-nieskazitelna-biel-9l-mat-dulux-p21385',
  },
  {
    id: 'sewera-atlas-gta-18kg', ean: '5905400542509', name: 'Atlas GTA gotowa gładź polimerowa 18kg',
    category: 'skim-coat', brand: 'Atlas', packageSize: 18, unit: 'kg', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/atlas-gta-gotowa-gladz-polimerowa-18kg-p6321
    url: 'https://sklep.sewera.pl/atlas-gta-gotowa-gladz-polimerowa-18kg-p6321',
  },
  {
    id: 'sewera-acrylputz-st10-20kg', ean: '5903973104421', name: 'Acryl Putz ST10 Start 20kg',
    category: 'skim-coat', brand: 'Śnieżka', packageSize: 20, unit: 'kg', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/acryl-putz-st10-start-20kg-p6107
    url: 'https://sklep.sewera.pl/acryl-putz-st10-start-20kg-p6107',
  },
  {
    id: 'zino-sniezka-5l', ean: '5903973139188', name: 'Barwy Natury 173 Biały 5l',
    category: 'paint', brand: 'Śnieżka', packageSize: 5, unit: 'l', store: 'Zino', format: 'shoper-api',
    // source: https://sklep.zino.pl/pl/p/Barwy-Natury-173-Bialy-5l/2842
    url: 'https://sklep.zino.pl/pl/p/Barwy-Natury-173-Bialy-5l/2842',
    imageUrl: 'https://sklep.zino.pl/userdata/public/gfx/7713/173-biala-majowa-konwalia.png',
  },
  {
    id: 'sewera-atlas-unigrunt-5kg', ean: '5905400520026', name: 'Atlas Uni-Grunt 5kg emulsja gruntująca',
    category: 'primer', brand: 'Atlas', packageSize: 5, unit: 'kg', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772
    // source: https://www.abud.pl/product-pol-1121-Preparat-gruntujacy-Atlas-Uni-Grunt-5kg.html
    url: 'https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772',
  },
  {
    id: 'sewera-acrylputz-fs20-27kg', ean: '5903973104544', name: 'Acryl Putz FS20 Finisz 27kg',
    category: 'skim-coat', brand: 'Śnieżka', packageSize: 27, unit: 'kg', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/acryl-putz-fs20-finisz-27kg-p6114
    // source: https://mrowka.com.pl/produkt/gladz-szpachlowa-finisz-fs20-27-kg-acryl-putz-5903973104544.html
    url: 'https://sklep.sewera.pl/acryl-putz-fs20-finisz-27kg-p6114',
  },
  {
    id: 'sewera-atlas-sam100-25kg', ean: '5905400279245', name: 'Atlas SAM 100 25kg szybkowiążący samopoziomujący podkład podłogowy',
    category: 'screed', brand: 'Atlas', packageSize: 25, unit: 'kg', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy-p9811
    // source: https://www.bricomarche.pl/szybkowiazacy-samopoziomujacy-podklad-podlogowy-sam-100-25-kg-atlas
    url: 'https://sklep.sewera.pl/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy-p9811',
  },
  {
    id: 'sewera-atlas-sam200-25kg', ean: '5905400279269', name: 'Atlas SAM 200 25kg samopoziomujący podkład podłogowy',
    category: 'screed', brand: 'Atlas', packageSize: 25, unit: 'kg', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy-p9795
    // source: https://b2c.makchemia.pl/wylewki-samopoziomujace/5233-atlas-sam-200-25kg-2560mm-folia-5905400279269.html
    url: 'https://sklep.sewera.pl/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy-p9795',
  },
  {
    id: 'sewera-atlas-cerplast-15kg', ean: '5905400530032', name: 'Podkładowa masa tynkarska Cerplast 15kg Atlas',
    category: 'primer', brand: 'Atlas', packageSize: 15, unit: 'kg', store: 'Sewera', format: 'sewera',
    // source: https://sklep.sewera.pl/podkladowa-masa-tynkarska-cerplast-15kg-atlas-p9884
    // source: https://ekobudsklep.pl/Tynki/3323-srodek-gruntujacy-podklad-tynkarski-cerplast-15kg-atlas-5905400530032.html
    url: 'https://sklep.sewera.pl/podkladowa-masa-tynkarska-cerplast-15kg-atlas-p9884',
  },
  // source: https://www.rabdom.pl/pl/p/SNIEZKA-LATEKS-EKO-PLUS-ODPORNA-NA-SZOROWANIE-10L/4177
  // source: https://www.castorama.pl/farba-lateksowa-sniezka-eko-plus-biala-10-l/5903973205982_CAPL.prd
  {
    "id": "rabdom-paint-better-white-10l",
    "ean": "5903973205982",
    "name": "ŚNIEŻKA LATEKS EKO PLUS ODPORNA NA SZOROWANIE 10L",
    "category": "paint",
    "brand": "Śnieżka",
    "packageSize": 10,
    "unit": "l",
    "store": "Rab-Dom",
    "format": "shoper-api",
    "url": "https://www.rabdom.pl/pl/p/SNIEZKA-LATEKS-EKO-PLUS-ODPORNA-NA-SZOROWANIE-10L/4177",
    "productId": 4177,
    "imageUrl": "https://www.rabdom.pl/environment/cache/images/productGfx_5715_500_500/Przechwytywanie1.webp"
  },
  // source: https://realbud.com/pl/p/Soudal-Silikon-Sanitarny-BIALY-280ml/75056920
  // source: https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd
  {
    "id": "realbud-sanitary-silicone-soudal-280ml",
    "ean": "5411183157064",
    "name": "Soudal Silikon Sanitarny BIAŁY 280ml",
    "category": "silicone",
    "brand": "Soudal",
    "packageSize": 280,
    "unit": "ml",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/pl/p/Soudal-Silikon-Sanitarny-BIALY-280ml/75056920",
    "productId": 75056920,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_23107_500_500/079e148af619f564eb64a47d4acf3d02.jpg"
  },
  // source: https://www.rabdom.pl/pl/p/SOUDAL-Silikon-sanitarny-280ml-BIALY/725
  // source: https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd
  {
    "id": "rabdom-sanitary-silicone-soudal-280ml",
    "ean": "5411183157064",
    "name": "SOUDAL Silikon sanitarny 280ml  BIAŁY",
    "category": "silicone",
    "brand": "Soudal",
    "packageSize": 280,
    "unit": "ml",
    "store": "Rab-Dom",
    "format": "shoper-api",
    "url": "https://www.rabdom.pl/pl/p/SOUDAL-Silikon-sanitarny-280ml-BIALY/725",
    "productId": 725,
    "imageUrl": "https://www.rabdom.pl/environment/cache/images/productGfx_36041_500_500/sanitbial.webp"
  },
  // source: https://realbud.com/pl/p/Ceresit-CT-17%2C-10-l%2C-gleboko-penetrujacy-grunt-bezrozpuszczalnikowy/75057217
  // source: https://www.bricoman.pl/grunt-gleboko-penetrujacy-ceresit-ct17-10l-20914943.html
  {
    "id": "realbud-primer-deep-ceresit-ct17-10l",
    "ean": "5900089617081",
    "name": "Ceresit CT 17, 10 l, głęboko penetrujący grunt bezrozpuszczalnikowy",
    "category": "primer",
    "brand": "Ceresit",
    "packageSize": 10,
    "unit": "l",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/pl/p/Ceresit-CT-17%2C-10-l%2C-gleboko-penetrujacy-grunt-bezrozpuszczalnikowy/75057217",
    "productId": 75057217,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_23320_500_500/4f6162f89165674a20b43a12f287acd2.png"
  },
  // source: https://www.rabdom.pl/pl/p/CERESIT-CT-17-Grunt-gleboko-penetrujacy-10L/9787
  // source: https://www.bricoman.pl/grunt-gleboko-penetrujacy-ceresit-ct17-10l-20914943.html
  {
    "id": "rabdom-primer-deep-ceresit-ct17-10l",
    "ean": "5900089617081",
    "name": "CERESIT CT 17 Grunt głęboko penetrujący 10L",
    "category": "primer",
    "brand": "Ceresit",
    "packageSize": 10,
    "unit": "l",
    "store": "Rab-Dom",
    "format": "shoper-api",
    "url": "https://www.rabdom.pl/pl/p/CERESIT-CT-17-Grunt-gleboko-penetrujacy-10L/9787",
    "productId": 9787,
    "imageUrl": "https://www.rabdom.pl/environment/cache/images/productGfx_17372_500_500/ceresit-tiling-CT17-5l-30lat-fundacja.webp"
  },
  // source: https://realbud.com/pl/p/Ceresit-CM-11%2C-25-kg%2C-uniwersalny-klej-do-plytek/75057156
  // source: https://mrowka.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html
  {
    "id": "realbud-tile-adhesive-ceresit-cm11-25kg",
    "ean": "5900089111251",
    "name": "Ceresit CM 11, 25 kg, uniwersalny klej do płytek",
    "category": "adhesive",
    "brand": "Ceresit",
    "packageSize": 25,
    "unit": "kg",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/pl/p/Ceresit-CM-11%2C-25-kg%2C-uniwersalny-klej-do-plytek/75057156",
    "productId": 75057156,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_23258_500_500/46e2bb71554f4ee22711a9cccee46e6b.jpg"
  },
  // source: https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089
  // source: https://www.castorama.pl/farba-lateksowa-sniezka-eko-plus-biala-10-l/5903973205982_CAPL.prd
  {
    "id": "sewera-paint-better-white-10l",
    "ean": "5903973205982",
    "name": "Śnieżka EKO Plus odporna na szorowanie 10l",
    "category": "paint",
    "brand": "Śnieżka",
    "packageSize": 10,
    "unit": "l",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089"
  },
  // source: https://sklep.sewera.pl/silikon-sanitarny-bialy-280ml-soudal-p21286
  // source: https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd
  {
    "id": "sewera-sanitary-silicone-soudal-280ml",
    "ean": "5411183157064",
    "name": "Silikon sanitarny biały 280ml Soudal",
    "category": "silicone",
    "brand": "Soudal",
    "packageSize": 280,
    "unit": "ml",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/silikon-sanitarny-bialy-280ml-soudal-p21286"
  },
  // source: https://realbud.com/Tasma-malarska-8-cm-x-50-m
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd
  {
    "id": "realbud-masking-tape-bluedolphin-38mm",
    "ean": "5907758507285",
    "name": "Taśma malarska 38mmx50 m BLUE DOLPHIN",
    "category": "masking-tape",
    "brand": "Blue Dolphin",
    "packageSize": 50,
    "unit": "mb",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/Tasma-malarska-8-cm-x-50-m",
    "productId": 7738,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_9990_500_500/46c45b830d4616de5c8a31113eac72b8.jpg",
    "variant": [
      "38mmx50m"
    ]
  },
  // source: https://sklep.zino.pl/pl/p/Blue-dolphin-Tasma-malarska-profesjonalna-38mm50m/1533
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd
  {
    "id": "zino-masking-tape-bluedolphin-38mm",
    "ean": "5907758507285",
    "name": "Blue dolphin Taśma malarska profesjonalna 38mm/50m",
    "category": "masking-tape",
    "brand": "Blue Dolphin",
    "packageSize": 50,
    "unit": "mb",
    "store": "Zino",
    "format": "shoper-api",
    "url": "https://sklep.zino.pl/pl/p/Blue-dolphin-Tasma-malarska-profesjonalna-38mm50m/1533",
    "productId": 1533,
    "imageUrl": "https://sklep.zino.pl/environment/cache/images/productGfx_4976_500_500/malarska-niebieska.jpg",
    "variant": [
      "38mmx50m"
    ]
  },
  // source: https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-papierowa-malarska-do-wnetrz-i-na-zewnatrz-38mm-x-50m-niebieska/549
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd
  {
    "id": "rabdom-masking-tape-bluedolphin-38mm",
    "ean": "5907758507285",
    "name": "BLUE DOLPHIN Taśma papierowa malarska do wnętrz i na zewnątrz 38mm x 50m niebieska",
    "category": "masking-tape",
    "brand": "Blue Dolphin",
    "packageSize": 50,
    "unit": "mb",
    "store": "Rab-Dom",
    "format": "shoper-api",
    "url": "https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-papierowa-malarska-do-wnetrz-i-na-zewnatrz-38mm-x-50m-niebieska/549",
    "productId": 549,
    "imageUrl": "https://www.rabdom.pl/environment/cache/images/productGfx_58891_500_500/Blue-Dolphin-tasma-malarska-papierowa-niebieska-38-mm-na-50-metrow..webp",
    "variant": [
      "38mmx50m"
    ]
  },
  // source: https://sklep.sewera.pl/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg-p9147
  // source: https://www.castorama.pl/fuga-elastyczna-ceresit-ce-40-aquastatic-biala-2-kg-id-3973.html
  {
    "id": "sewera-grout-ceresit-ce40-white-2kg",
    "ean": "5900089140015",
    "name": "Ceresit fuga CE40 01 wodoodporna elastyczna 2kg",
    "category": "grout",
    "brand": "Ceresit",
    "packageSize": 2,
    "unit": "kg",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg-p9147"
  },
  // source: https://sklep.zino.pl/pl/p/Akrylit-W-plus-snieznobiala-5l-Dekoral/2071
  // source: https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502
  {
    "id": "zino-paint-latex-dekoral-akrylit-w-white-5l",
    "ean": "5904000810681",
    "name": "Akrylit W plus śnieżnobiała 5l Dekoral",
    "category": "paint",
    "brand": "Dekoral",
    "packageSize": 5,
    "unit": "l",
    "store": "Zino",
    "format": "shoper-api",
    "url": "https://sklep.zino.pl/pl/p/Akrylit-W-plus-snieznobiala-5l-Dekoral/2071",
    "productId": 2071,
    "imageUrl": "https://sklep.zino.pl/environment/cache/images/productGfx_6006_500_500/DEKORAL_AKRYLIT_W_5L.png"
  },
  // source: https://www.rabdom.pl/pl/p/-DEKORAL-AKRYLIT-W-Lateksowa-farba-do-wnetrz-bialy-mat-5L/535
  // source: https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502
  {
    "id": "rabdom-paint-latex-dekoral-akrylit-w-white-5l",
    "ean": "5904000810681",
    "name": "DEKORAL AKRYLIT W Lateksowa farba do wnętrz biały mat 5L",
    "category": "paint",
    "brand": "Dekoral",
    "packageSize": 5,
    "unit": "l",
    "store": "Rab-Dom",
    "format": "shoper-api",
    "url": "https://www.rabdom.pl/pl/p/-DEKORAL-AKRYLIT-W-Lateksowa-farba-do-wnetrz-bialy-mat-5L/535",
    "productId": 535,
    "imageUrl": "https://www.rabdom.pl/environment/cache/images/productGfx_57960_500_500/Opakowanie-bialej-farby-lateksowej-do-malowania-wnetrz-marki-Dekoral%2C-pojemnosc-5-litrow..webp"
  },
  // source: https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439
  // source: https://mrowka.com.pl/produkt/piana-pistoletowa-65-750-ml-tytan-professional-5903518052859.html
  {
    "id": "sewera-foam-tytan-pro65-750ml",
    "ean": "5903518052859",
    "name": "Pianka montażowa pistoletowa 65 750ml Tytan",
    "category": "foam",
    "brand": "Tytan",
    "packageSize": 750,
    "unit": "ml",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439"
  },
  // source: https://sklep.sewera.pl/dekoral-farba-lateksowa-odporna-na-szorowanie-akrylit-w-plus-5l-p7969
  // source: https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502
  {
    "id": "sewera-paint-latex-dekoral-akrylit-w-white-5l",
    "ean": "5904000810681",
    "name": "DEKORAL FARBA LATEKSOWA ODPORNA NA SZOROWANIE AKRYLIT W PLUS 5L",
    "category": "paint",
    "brand": "Dekoral",
    "packageSize": 5,
    "unit": "l",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/dekoral-farba-lateksowa-odporna-na-szorowanie-akrylit-w-plus-5l-p7969"
  },
  // source: https://sklep.sewera.pl/tasma-malarska-niebieska-38mmx50m-p6967
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd
  {
    "id": "sewera-masking-tape-bluedolphin-38mm",
    "ean": "5907758507285",
    "name": "Taśma malarska niebieska 38mmx50m",
    "category": "masking-tape",
    "brand": "Blue Dolphin",
    "packageSize": 50,
    "unit": "mb",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/tasma-malarska-niebieska-38mmx50m-p6967",
    "variant": [
      "38mmx50m"
    ]
  },
  // source: https://sklep.sewera.pl/wkret-tb-3-5x25mm-samowiercacyfosfatowany-100szt-p9993
  // source: https://mrowka.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html
  {
    "id": "sewera-drywall-screws-wkretmet-35x25-100",
    "ean": "5907704499015",
    "name": "Wkręt samowiercący do metalu TB 3,5x25mm fosfatowany 100szt. Klimas",
    "category": "screws",
    "brand": "Wkręt-Met",
    "packageSize": 100,
    "unit": "szt",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/wkret-tb-3-5x25mm-samowiercacyfosfatowany-100szt-p9993",
    "retailUnit": "OPA",
    "variant": [
      "3,5x25mm",
      "100szt"
    ]
  },
  // source: https://sklep.zino.pl/pl/p/Krzyzyki-dystansowe-Hardy-2mm-200szt./2263
  // source: https://mrowka.com.pl/produkt/krzyzyki-dystansowe-2-mm-200-szt-hardy-5905061016845.html
  {
    "id": "zino-tile-spacers-hardy-2mm-200",
    "ean": "5905061016845",
    "name": "Krzyżyki dystansowe Hardy 2mm 200szt.",
    "category": "tile-spacer",
    "brand": "Hardy",
    "packageSize": 200,
    "unit": "szt",
    "store": "Zino",
    "format": "shoper-api",
    "url": "https://sklep.zino.pl/pl/p/Krzyzyki-dystansowe-Hardy-2mm-200szt./2263",
    "productId": 2263,
    "imageUrl": "https://sklep.zino.pl/environment/cache/images/productGfx_6403_500_500/2040-660020-1.png"
  },
  // source: https://sklep.sewera.pl/kolek-szybkiego-montazu-6x40mm-20szt-p10030
  // source: https://mrowka.com.pl/produkt/kolki-szybkiego-montazu-6x40-blister-wkret-met-5907704466031.html
  {
    "id": "sewera-quick-dowels-wkretmet-sm-6x40-20",
    "ean": "5907704466031",
    "name": "Kołek szybkiego montażu 6x40mm 20szt. Klimas",
    "category": "dowels",
    "brand": "Wkręt-Met",
    "packageSize": 20,
    "unit": "szt",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/kolek-szybkiego-montazu-6x40mm-20szt-p10030",
    "retailUnit": "OPA",
    "variant": [
      "6x40mm",
      "20szt"
    ]
  },
  // source: https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-10cm-welna-szklana-p11975
  // source: https://www.bricoman.pl/isover-aku-plyta-welna-mineralna-szklana-10-cm-7-2-m2-877954.html
  {
    "id": "sewera-mineral-wool-isover-akuplyta-10cm",
    "ean": "5901644653155",
    "name": "Isover wełna mineralna Aku-Płyta 037 10cm wełna szklana",
    "category": "mineral-wool",
    "brand": "Isover",
    "packageSize": 7.2,
    "unit": "m2",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-10cm-welna-szklana-p11975",
    "retailUnit": "OPA",
    "variant": [
      "10cm"
    ],
    "packageDescription": "7,20m2"
  },
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-2mm-200szt--p12504
  // source: https://mrowka.com.pl/produkt/krzyzyki-dystansowe-2-mm-200-szt-hardy-5905061016845.html
  {
    "id": "sewera-tile-spacers-hardy-2mm-200",
    "ean": "5905061016845",
    "name": "Krzyżyki dystansowe 2mm 200szt.",
    "category": "tile-spacer",
    "brand": "KAEM",
    "packageSize": 200,
    "unit": "szt",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/krzyzyki-dystansowe-2mm-200szt--p12504",
    "retailUnit": "OPA"
  },
  // source: https://realbud.com/pl/p/Ceresit-CL-152%2C-10-m%2C-tasma-uszczelniajaca/75057200
  // source: https://www.castorama.pl/tasma-uszczelniajaca-ceresit-cl-152-10-m/5900089115211_CAPL.prd
  {
    "id": "realbud-sealing-tape-ceresit-cl152-10m",
    "ean": "5900089115211",
    "name": "Ceresit CL 152, 10 m, taśma uszczelniająca",
    "category": "sealing-tape",
    "brand": "Ceresit",
    "packageSize": 10,
    "unit": "m",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/pl/p/Ceresit-CL-152%2C-10-m%2C-tasma-uszczelniajaca/75057200",
    "productId": 75057200,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_23303_500_500/0a3c56073810b860a6e905a6528fc426.jpg"
  },
  // source: https://sklep.sewera.pl/atlas-fuga-ceramiczna-001-bialy-2kg-p11674
  // source: https://www.castorama.pl/fuga-ceramiczna-atlas-001-biala-2-kg/5905400572254_CAPL.prd
  {
    "id": "sewera-grout-atlas-001-white-2kg",
    "ean": "5905400572254",
    "name": "Atlas Fuga ceramiczna 001 biały 2kg",
    "category": "grout",
    "brand": "Atlas",
    "packageSize": 2,
    "unit": "kg",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/atlas-fuga-ceramiczna-001-bialy-2kg-p11674"
  },
  // source: https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-15kg-atlas-p6346
  // source: https://mrowka.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html
  {
    "id": "sewera-waterproof-membrane-atlas-woder-e-15kg",
    "ean": "5905400514506",
    "name": "Folia w płynie szybkoschnąca Woder E 15kg Atlas",
    "category": "waterproofing",
    "brand": "Atlas",
    "packageSize": 15,
    "unit": "kg",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/folia-w-plynie-szybkoschnaca-woder-e-15kg-atlas-p6346"
  },
  // source: https://realbud.com/pl/p/Ceresit-CN-72-NIVEL-FAST%2C-25-kg%2C-zaprawa-samopoziomujaca/75057225
  // source: https://sklep-kowalczyk.pl/ceresit-cn-72-zaprawa-samopoziomujaca-25-kg-219136.html
  {
    "id": "realbud-screed-ceresit-cn72-25kg",
    "ean": "5900089272259",
    "name": "Ceresit CN 72 NIVEL FAST, 25 kg, zaprawa samopoziomująca",
    "category": "screed",
    "brand": "Ceresit",
    "packageSize": 25,
    "unit": "kg",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/pl/p/Ceresit-CN-72-NIVEL-FAST%2C-25-kg%2C-zaprawa-samopoziomujaca/75057225",
    "productId": 75057225,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_23328_500_500/8cf842d859fb9fe114e5ad53d45a64a2.jpg"
  },
  // source: https://sklep.sewera.pl/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16kg-atlas-p9897
  // source: https://www.castorama.pl/hydroizolacja-atlas-woder-duo-16-kg/5905400195088_CAPL.prd
  {
    "id": "sewera-waterproof-membrane-atlas-woder-duo-16kg",
    "ean": "5905400195088",
    "name": "Hydroizolacja dwuskładnikowa elastyczna Woder Duo 16kg Atlas",
    "category": "waterproofing",
    "brand": "Atlas",
    "packageSize": 16,
    "unit": "kg",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16kg-atlas-p9897"
  },
  // source: https://realbud.com/pl/p/Silikon-uniwersalny-Soudal-bezbarwny-280-ml/75056923
  // source: https://www.castorama.pl/silikon-uniwersalny-soudal-280-ml-bezbarwny/5411183157552_CAPL.prd
  {
    "id": "realbud-silicone-universal-soudal-280ml",
    "ean": "5411183157552",
    "name": "Silikon uniwersalny Soudal bezbarwny 280 ml",
    "category": "silicone",
    "brand": "Soudal",
    "packageSize": 280,
    "unit": "ml",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/pl/p/Silikon-uniwersalny-Soudal-bezbarwny-280-ml/75056923",
    "productId": 75056923,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_23110_500_500/1229be0a0c33588eea99883b4a31b707.jpg"
  },
  // source: https://sklep.sewera.pl/tasma-uszczelniajaca-cl152-120mm-x-10m-ceresit-p7692
  // source: https://www.castorama.pl/tasma-uszczelniajaca-ceresit-cl-152-10-m/5900089115211_CAPL.prd
  {
    "id": "sewera-sealing-tape-ceresit-cl152-10m",
    "ean": "5900089115211",
    "name": "Taśma uszczelniająca CL152 120mm x 10m Ceresit",
    "category": "sealing-tape",
    "brand": "Ceresit",
    "packageSize": 10,
    "unit": "m",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/tasma-uszczelniajaca-cl152-120mm-x-10m-ceresit-p7692"
  },
  // source: https://realbud.com/Kolek-do-mcowania-izolacji-10-200-mtal-trzpien-50-op
  // source: https://www.castorama.pl/kolek-do-mocowania-izolacji-koelner-metal-10-x-200-mm/5906675212647_CAPL.prd
  {
    "id": "realbud-anchor-facade-koelner-ki200m-10x200",
    "ean": "5906675212647",
    "name": "Kołki do styropianu 20 cm Metalowy Trzpień 250 szt",
    "category": "anchor",
    "brand": "Rawlplug",
    "packageSize": 250,
    "unit": "szt",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/Kolek-do-mcowania-izolacji-10-200-mtal-trzpien-50-op",
    "productId": 6186,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_25596_500_500/5393.png"
  },
  // source: https://realbud.com/pl/p/Ceresit-CT-174%2C-tynk-silikatowo-silikonowy-%2C-Baranek-1%2C5mm%2C-25-kg/75057633
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101
  {
    "id": "realbud-plaster-thin-ceresit-ct174-25kg",
    "ean": "9000101109733",
    "name": "Ceresit CT 174, tynk silikatowo- silikonowy , Baranek 1,5mm, 25 kg",
    "category": "thin-coat-plaster",
    "brand": "Ceresit",
    "packageSize": 25,
    "unit": "kg",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/pl/p/Ceresit-CT-174%2C-tynk-silikatowo-silikonowy-%2C-Baranek-1%2C5mm%2C-25-kg/75057633",
    "productId": 75057633,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_23769_500_500/5d9b2d09f6af0304fde060d90029cde0.png"
  },
  // source: https://sklep.sewera.pl/tynk-wewnetrzny-cementowo-wapienny-baumit-mpi-25-30kg-p9081
  // source: https://mrowka.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html
  {
    "id": "sewera-plaster-cementlime-baumit-mpi25-30kg",
    "ean": "5907534261158",
    "name": "Tynk wewnętrzny cementowo-wapienny Baumit MPI 25 30kg",
    "category": "plaster",
    "brand": "Baumit",
    "packageSize": 30,
    "unit": "kg",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/tynk-wewnetrzny-cementowo-wapienny-baumit-mpi-25-30kg-p9081"
  },
  // source: https://sklep.sewera.pl/silikon-uniwersalny-bezbarwny-280ml-soudal-p21290
  // source: https://www.castorama.pl/silikon-uniwersalny-soudal-280-ml-bezbarwny/5411183157552_CAPL.prd
  {
    "id": "sewera-silicone-universal-soudal-280ml",
    "ean": "5411183157552",
    "name": "Silikon uniwersalny bezbarwny 280ml Soudal",
    "category": "silicone",
    "brand": "Soudal",
    "packageSize": 280,
    "unit": "ml",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/silikon-uniwersalny-bezbarwny-280ml-soudal-p21290"
  },
  // source: https://sklep.zino.pl/pl/p/CT-174-Tynk-silikatowo-silikonowy-Baza-BIALA-1%2C5mm-25kg/934
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101
  {
    "id": "zino-plaster-thin-ceresit-ct174-25kg",
    "ean": "9000101109733",
    "name": "CT 174 Tynk silikatowo-silikonowy Baza BIAŁA 1,5mm 25kg",
    "category": "thin-coat-plaster",
    "brand": "Ceresit",
    "packageSize": 25,
    "unit": "kg",
    "store": "Zino",
    "format": "shoper-api",
    "url": "https://sklep.zino.pl/pl/p/CT-174-Tynk-silikatowo-silikonowy-Baza-BIALA-1%2C5mm-25kg/934",
    "productId": 934,
    "imageUrl": "https://sklep.zino.pl/environment/cache/images/productGfx_3522_500_500/CT-174.jpg"
  },
  // source: https://realbud.com/pl/p/Akryl-uniwersalny-Soudal-bialy-280-ml/75056897
  // source: https://www.castorama.pl/akryl-soudal-280-ml-bialy/5411183157538_CAPL.prd
  {
    "id": "realbud-acrylic-soudal-white-280ml",
    "ean": "5411183157538",
    "name": "Akryl uniwersalny Soudal biały 280 ml",
    "category": "acrylic",
    "brand": "Soudal",
    "packageSize": 280,
    "unit": "ml",
    "store": "Realbud",
    "format": "shoper-api",
    "url": "https://realbud.com/pl/p/Akryl-uniwersalny-Soudal-bialy-280-ml/75056897",
    "productId": 75056897,
    "imageUrl": "https://realbud.com/environment/cache/images/productGfx_23084_500_500/26118bf480c7744c75f0fe2b5b9732da.jpg"
  },
  // source: https://www.rabdom.pl/pl/p/SOUDAL-Akryl-uniwersalny-280ml-Bialy/460
  // source: https://www.castorama.pl/akryl-soudal-280-ml-bialy/5411183157538_CAPL.prd
  {
    "id": "rabdom-acrylic-soudal-white-280ml",
    "ean": "5411183157538",
    "name": "SOUDAL Akryl uniwersalny 280ml Biały",
    "category": "acrylic",
    "brand": "Soudal",
    "packageSize": 280,
    "unit": "ml",
    "store": "Rab-Dom",
    "format": "shoper-api",
    "url": "https://www.rabdom.pl/pl/p/SOUDAL-Akryl-uniwersalny-280ml-Bialy/460",
    "productId": 460,
    "imageUrl": "https://www.rabdom.pl/environment/cache/images/productGfx_35996_500_500/akrylbialy.webp"
  },
  // source: https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782
  // source: https://www.castorama.pl/siatka-z-wlokna-szklanego-atlas-150/5905400196993_CAPL.prd
  {
    "id": "sewera-mesh-fiberglass-atlas-150-50m2",
    "ean": "5905400196993",
    "name": "Siatka z włókna szklanego 150 g/m2 rolka 50m2 Atlas",
    "category": "mesh",
    "brand": "Atlas",
    "packageSize": 50,
    "unit": "m2",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782"
  },
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101
  {
    "id": "sewera-plaster-thin-ceresit-ct174-25kg",
    "ean": "9000101109733",
    "name": "Tynk silikatowo silikonowy 1,5mm baranek CT174 baza biała 25kg Ceresit",
    "category": "thin-coat-plaster",
    "brand": "Ceresit",
    "packageSize": 25,
    "unit": "kg",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101"
  },
  // source: https://sklep.sewera.pl/soudal-akryl-bialy-280ml-p10680
  // source: https://www.castorama.pl/akryl-soudal-280-ml-bialy/5411183157538_CAPL.prd
  {
    "id": "sewera-acrylic-soudal-white-280ml",
    "ean": "5411183157538",
    "name": "Soudal akryl biały 280ml",
    "category": "acrylic",
    "brand": "Soudal",
    "packageSize": 280,
    "unit": "ml",
    "store": "Sewera",
    "format": "sewera",
    "url": "https://sklep.sewera.pl/soudal-akryl-bialy-280ml-p10680"
  },
  // source: https://www.unimet.pl/uszczelniacze-58/259045-uszczelniacz-hybrydowy-fix-all-high-tack-bialy-290ml-5411183045620.html
  {
    "id": "unimet-fixall-290ml",
    "ean": "5411183045620",
    "name": "USZCZELNIACZ HYBRYDOWY FIX ALL HIGH TACK BIAŁY 290ML",
    "brand": "Soudal",
    "category": "mounting-adhesive",
    "packageSize": 290,
    "unit": "ml",
    "store": "Unimet",
    "format": "unimet",
    "url": "https://www.unimet.pl/uszczelniacze-58/259045-uszczelniacz-hybrydowy-fix-all-high-tack-bialy-290ml-5411183045620.html"
  },
  // source: https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html
  {
    "id": "unimet-wc-mounting-set",
    "ean": "5901095514395",
    "name": "ZESTAW PRZYŁĄCZENIOWO-MOCUJĄCY WC",
    "brand": "UN",
    "category": "mounting-set",
    "packageSize": 1,
    "unit": "szt",
    "variant": [
      "WC"
    ],
    "store": "Unimet",
    "format": "unimet",
    "url": "https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html"
  },
  // source: https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html
  {
    "id": "bestbudowa-soudal-inside-90mm",
    "ean": "5411183151178",
    "name": "Taśma okienna wewnętrzna SOUDAL SWS BASIC PLUS 90 Inside 90mmx30m",
    "brand": "Soudal",
    "category": "window-tape",
    "packageSize": 30,
    "unit": "m",
    "variant": [
      "90mmx30m"
    ],
    "store": "BestBudowa",
    "format": "jsonld",
    "url": "https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html"
  },
  // source: https://www.prescot.com.pl/pl/p/ZLACZKA-WAGO-221-413-3X4mm-LINKADRUT-NO-WA/11528
  {
    "id": "prescot-wago-221413",
    "ean": "4050821808442",
    "name": "ZŁĄCZKA WAGO 221-413 3X4mm LINKA/DRUT NO WA",
    "brand": "WAGO",
    "category": "wire-connector",
    "packageSize": 1,
    "unit": "szt",
    "variant": [
      "221-413"
    ],
    "productId": 11528,
    "apiPurchaseUnit": "szt.",
    "store": "Prescot",
    "format": "shoper-api",
    "url": "https://www.prescot.com.pl/pl/p/ZLACZKA-WAGO-221-413-3X4mm-LINKADRUT-NO-WA/11528",
    "imageUrl": "https://www.prescot.com.pl/environment/cache/images/productGfx_45208_500_500/221-413.jpg"
  },
  // source: https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m
  {
    "id": "cezar-tile-trim-8mm-25m",
    "ean": "5904584853500",
    "name": "Profil do glazury aluminiowy narożny 8mm Cezar Tytan Szczotkowany mat 2,50m",
    "brand": "Cezar",
    "category": "tile-trim",
    "packageSize": 2.5,
    "unit": "mb",
    "variant": [
      "8mm",
      "2,50m"
    ],
    "productId": 10292567572821,
    "variantId": 52009135210837,
    "store": "Cezar",
    "format": "shopify-api",
    "url": "https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m"
  },
  // source: https://rodimax.pl/P%C5%82yta-gipsowa-zwyk%C5%82a-Norgips-1200-x-2600-x-12%2C5-mm-3%2C12-m2.html
  // source: https://rodimax.pl/ (service unavailable notice); cart action in /js/main.min.js only opens a demo popup, checked 2026-10-25.
  {"id":"rodimax-board-gkb","ean":"5907651690442","name":"Płyta gipsowa zwykła Norgips 1200 x 2600 x 12,5 mm 3,12 m2","category":"gypsum-board","packageSize":3.12,"unit":"m2","store":"Rodimax","url":"https://rodimax.pl/P%C5%82yta-gipsowa-zwyk%C5%82a-Norgips-1200-x-2600-x-12%2C5-mm-3%2C12-m2.html","brand":"Norgips","format":"rodimax","disabledReason":"retailer_checkout_unconfirmed"},
  // source: https://rodimax.pl/Podk%C5%82ad-pod-panele-Arbiton-XPS-Smart-Aquastop-Thermo-1%2C6-mm-6-m2.html
  {"id":"rodimax-arbiton-aquastop-6m2","ean":"5905167826942","name":"Podkład pod panele Arbiton XPS Smart Aquastop Thermo 1,6 mm 6 m2","category":"underlay","packageSize":6,"unit":"m2","store":"Rodimax","url":"https://rodimax.pl/Podk%C5%82ad-pod-panele-Arbiton-XPS-Smart-Aquastop-Thermo-1%2C6-mm-6-m2.html","brand":"Arbiton","format":"rodimax","disabledReason":"retailer_checkout_unconfirmed"},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-naroznik-wewnetrzny/3089
  {"id":"winbud-mapei-corner-internal","ean":"8022452113802","name":"Mapei Mapeband W - narożnik wewnętrzny","category":"sealing-corner","packageSize":1,"unit":"szt","store":"WinBud","url":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-naroznik-wewnetrzny/3089","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_2b7ab43567ae0046ace4d10d419a36f5_500_500.jpg","brand":"Mapei","format":"shoper-api","productId":3089,"apiPurchaseUnit":"szt.","variant":["wewnętrzny"]},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-naroznik-zewnetrzny/3090
  {"id":"winbud-mapei-corner-external","ean":"8022452113789","name":"Mapei Mapeband W - narożnik zewnętrzny","category":"sealing-corner","packageSize":1,"unit":"szt","store":"WinBud","url":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-naroznik-zewnetrzny/3090","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_21ecda93953e59915e1391c9a417afc1_500_500.jpg","brand":"Mapei","format":"shoper-api","productId":3090,"apiPurchaseUnit":"szt.","variant":["zewnętrzny"]},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-120-x120mm%2C-scienny/3092
  {"id":"winbud-mapei-cuff-2","ean":"8022452113925","name":"Mapei Mapeband W - mankiet 120 x120mm, ścienny","category":"sealing-cuff","packageSize":2,"unit":"szt","store":"WinBud","url":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-120-x120mm%2C-scienny/3092","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_ff01451250ec0b1f56f25dda8bf32eca_500_500.jpg","brand":"Mapei","format":"shoper","productId":3092,"variant":["120x120mm"],"packageDescription":"2 sztuki w opakowaniu"},
  // source: https://salonbudowlanydambud.pl/pl/p/MAPEI-NAROZNIK-USZCZELNIAJACY-WEWNETRZNY-MAPEBAND-W/768
  {"id":"dambud-mapei-corner-internal","ean":"8022452113802","name":"MAPEI NAROŻNIK USZCZELNIAJĄCY WEWNĘTRZNY MAPEBAND W","category":"sealing-corner","packageSize":1,"unit":"szt","store":"Dam-Bud","url":"https://salonbudowlanydambud.pl/pl/p/MAPEI-NAROZNIK-USZCZELNIAJACY-WEWNETRZNY-MAPEBAND-W/768","imageUrl":"https://salonbudowlanydambud.pl/environment/cache/images/productGfx_2307_500_500/MAPEBAND-W-NAR-WEW.jpg","brand":"Mapei","format":"shoper-api","productId":768,"apiPurchaseUnit":"szt.","variant":["wewnętrzny"]},
  // source: https://salonbudowlanydambud.pl/pl/p/MAPEI-NAROZNIK-USZCZELNIAJACY-ZEWNETRZNY-MAPEBAND-W/769
  {"id":"dambud-mapei-corner-external","ean":"8022452113789","name":"MAPEI NAROŻNIK USZCZELNIAJĄCY ZEWNĘTRZNY MAPEBAND W","category":"sealing-corner","packageSize":1,"unit":"szt","store":"Dam-Bud","url":"https://salonbudowlanydambud.pl/pl/p/MAPEI-NAROZNIK-USZCZELNIAJACY-ZEWNETRZNY-MAPEBAND-W/769","imageUrl":"https://salonbudowlanydambud.pl/environment/cache/images/productGfx_2310_500_500/MAPEBAND-W-NAR-ZEWNETRZNY.jpg","brand":"Mapei","format":"shoper-api","productId":769,"apiPurchaseUnit":"szt.","variant":["zewnętrzny"]},
  // source: https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990
  {"id":"plusmarket-pex-pipe-16x2","ean":"5901095517976","name":"Rura pex/al/pex/ 16 mmx2 - 1mb","category":"pipe","packageSize":1,"unit":"mb","store":"Plus-Market","url":"https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990","imageUrl":"https://www.plus-market.pl/environment/cache/images/productGfx_19878_500_500/2024-09-27_16h57_16.webp","brand":"PLUS-MARKET","format":"shoper-api","productId":12990,"apiPurchaseUnit":"mb","variant":["16mmx2","1mb"]},
  // source: https://www.blu.com.pl/syfony-i-polsyfony-do-umywalek/29748-mcalpine-whb1-32-5036484088390.html
  {"id":"blu-mcalpine-whb132","ean":"5036484088390","name":"McAlpine WHB1-32","category":"trap","packageSize":1,"unit":"szt","store":"BLU","url":"https://www.blu.com.pl/syfony-i-polsyfony-do-umywalek/29748-mcalpine-whb1-32-5036484088390.html","imageUrl":"https://cdn.blu.com.pl/large_default/5036484088390_383553_McAlpine_WHB1-32_MR-SY-WHB132_Zdjecie_produktu.jpg?ver=1742976674_1744096667_1742976689_1747816989_1747816981_1742976708_1743066628__1765797618","brand":"McAlpine","format":"jsonld","variant":["WHB1-32"]},
  // source: https://www.elektryknet.pl/produkt/simon-basic-lacznik-jednobiegunowy-bialy-bmw101-11
  {"id":"elektryknet-simon-bmw1","ean":"5902787568177","name":"Simon Basic Łącznik jednobiegunowy biały BMW1.01/11","category":"switch","packageSize":1,"unit":"szt","store":"ElektrykNet","url":"https://www.elektryknet.pl/produkt/simon-basic-lacznik-jednobiegunowy-bialy-bmw101-11","imageUrl":"https://www.elektryknet.pl/static/thumbnail/product/facebook/60955.webp","brand":"Kontakt Simon","format":"jsonld","variant":["BMW1.01/11","biały"]},
  // source: https://www.abud.pl/product-pol-6204-Tasma-teflonowa-12mm-x-10m-x-0-075mm-Tycner.html
  {"id":"abud-teflon-12x10","ean":"5900950618100","name":"Taśma teflonowa 12mm x 10m x 0.075mm Tycner","category":"sealing-tape","packageSize":1,"unit":"szt","store":"ABUD","url":"https://www.abud.pl/product-pol-6204-Tasma-teflonowa-12mm-x-10m-x-0-075mm-Tycner.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/mu/q7rvc0igoa6f/Photos/q96euhr0ml7hr0/ShowWebp_tasma-teflonowa-12-mm-x-10-m-x-0-075-mm-tycner_1.webp","brand":"Tycner","format":"idosell","productId":6204,"apiPurchaseUnit":"szt.","variant":["12mm","10m","0.075mm"]},
  // source: https://www.abud.pl/product-pol-64835-Kolanko-zaciskowe-PEX-16x16mm-Tycner.html
  {"id":"abud-pex-elbow-16x16","ean":"5901095521003","name":"Kolanko zaciskowe PEX 16x16mm Tycner","category":"fitting","packageSize":1,"unit":"szt","store":"ABUD","url":"https://www.abud.pl/product-pol-64835-Kolanko-zaciskowe-PEX-16x16mm-Tycner.html","imageUrl":"https://mrowka.com.pl/files/InfoverProduct/vu/t7atm0ht029g/Photos/cumrci10no4fac/ShowWebp_kolanko-zaciskowe-pex-16x16-mm-tycner_1.webp","brand":"Tycner","format":"idosell","productId":64835,"apiPurchaseUnit":"szt.","variant":["16x16mm"]},
  // source: https://fixero.com/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-59g264-59g265-10-szt-55h746.html
  {"id":"fixero-graphite-mesh-10","ean":"5902062502735","name":"Siatka ścierna na rzep, 225 mm, K180, do szlifierki 59G260, 59G264, 59G265, 10 szt. 55H746","category":"abrasive","packageSize":10,"unit":"szt","store":"Fixero","url":"https://fixero.com/siatka-scierna-na-rzep-225-mm-k180-do-szlifierki-59g260-59g264-59g265-10-szt-55h746.html","imageUrl":"https://fixero.com/media/catalog/product/cache/6517c62f5899ad6aa0ba23ceb3eeff97/1/5/1596484200_55H746__BGH_TGL_U90.jpg","brand":"Graphite","format":"fixero","productId":1956,"variant":["225mm","K180","10szt","55H746"]},
  // source: https://listwy.sklep.pl/pl/p/Klips-montazowy-z-podkladka-dystansowa-do-montazu-listew-1opak25szt-MASTER-LINE-CEZAR/687
  {"id":"kelot-clips-25","ean":"5907684672217","name":"Klips montażowy z podkładką dystansową do montażu listew 1opak=25szt  MASTER LINE CEZAR","category":"skirting-clip","packageSize":25,"unit":"szt","store":"KELOT","url":"https://listwy.sklep.pl/pl/p/Klips-montazowy-z-podkladka-dystansowa-do-montazu-listew-1opak25szt-MASTER-LINE-CEZAR/687","imageUrl":"https://listwy.sklep.pl/environment/cache/images/productGfx_3487_500_500/klips-do-montowania-listew-przypodlogowych.jpg","brand":"Cezar","format":"shoper-api","productId":687,"apiPurchaseUnit":"szt.","variant":["25szt"]},
  // source: https://liderzycen.pl/pl/p/Kliny-montazowe-Floorpol-30-x-150-mm-10-szt./31651
  {"id":"liderzy-wedges-10","ean":"5907508719289","name":"Kliny montażowe Floorpol 30 x 150 mm 10 szt.","category":"mounting-wedge","packageSize":10,"unit":"szt","store":"LiderzyCen","url":"https://liderzycen.pl/pl/p/Kliny-montazowe-Floorpol-30-x-150-mm-10-szt./31651","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_52309_500_500/8fc1fd3c8fa7d0b098f9b17c9b091da3.jpg","brand":"Floorpol","format":"shoper-api","productId":31651,"apiPurchaseUnit":"szt.","variant":["30x150mm","10szt"]},
  // source: https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44
  {"id":"tgs-ferro-stillo","ean":"5902194929837","name":"Ferro Stillo bateria umywalkowa stojąca chrom","category":"faucet","packageSize":1,"unit":"szt","store":"TGS","url":"https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44","imageUrl":"https://tgs.pl/environment/cache/images/productGfx_56358_500_500/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom.jpg","brand":"Ferro","format":"shoper-api","productId":44,"apiPurchaseUnit":"szt.","variant":["Stillo","chrom"]},
  // source: https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m
  {"id":"cezar-threshold-40mm-1m","ean":"5904584845215","name":"Profil progowy aluminiowy owalny szeroki 40mm Cezar Srebrny Mat 1m","category":"threshold","packageSize":1,"unit":"szt","store":"Cezar","url":"https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m","imageUrl":"https://cezar.eu/cdn/shop/files/c505b58a71683c0e135cf53f166408a7.webp?v=1769675117","brand":"Cezar","format":"shopify-api","productId":10292397769045,"variantId":52008642773333,"variant":["40mm","srebrny","1m"]},
  // source: https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html
  {"id":"unimet-corner-mesh-25m","ean":"5900308102411","name":"NAROŻNIK ALUMINIOWY Z SIATKĄ 70*70 - 250CM","category":"plaster-corner","packageSize":2.5,"unit":"mb","store":"Unimet","url":"https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html","imageUrl":"https://www.unimet.pl/2006367-large_default/naroznik-aluminiowy-z-siatka-7070-250cm.webp","brand":"Budmat","format":"unimet","variant":["250cm"]},
  // source: https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383
  {"id":"krasny-goldband-25kg","ean":"5902367206383","name":"GIPS GOLDBAND 25 Gips tynkarski GOLDBAND 25kg","category":"plaster","packageSize":25,"unit":"kg","store":"Krasny","url":"https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383","imageUrl":"https://static.krasny.pl/59/02/36/72/06/38/3/0/SMALL_100.webp?hash=d61d71b4ff1c4592683b9ceecda29fca","brand":"Knauf","format":"krasny","pickupRequiresConfirmation":true},
  // source: https://domat24.pl/produkt/plyta-gipsowa-gkbi-12-5-12002600-zielona/
  {"id":"domat-board-gkbi","ean":"5907651691616","name":"Płyta gipsowa GKBI 12.5 1200*2600 ZIELONA","brand":"Norgips","category":"gypsum-board","packageSize":3.12,"unit":"m2","store":"Domat","url":"https://domat24.pl/produkt/plyta-gipsowa-gkbi-12-5-12002600-zielona/","format":"woocommerce","productId":29071,"variant":["GKBI","12.5","1200","2600"]},
  // source: https://domat24.pl/produkt/plyta-gipsowa-gkb-12-5-12002600-biala/
  {"id":"domat-board-gkb","ean":"5907651690442","name":"Płyta gipsowa GKB 12.5 1200*2600 BIAŁA","brand":"Norgips","category":"gypsum-board","packageSize":3.12,"unit":"m2","store":"Domat","url":"https://domat24.pl/produkt/plyta-gipsowa-gkb-12-5-12002600-biala/","format":"woocommerce","productId":29078,"variant":["GKB","12.5","1200","2600"]},
  // source: https://topboden.pl/listwy-przypodlogowe/listwa-przypodlogowa-arbiton-indo-bialy-polysk-1
  {"category":"skirting","packageSize":2.5,"unit":"mb","id":"topboden-indo-gloss-25m","ean":"5905167725719","name":"Listwa przypodłogowa PCV Arbiton INDO - biały połysk 01","brand":"Arbiton","store":"TopBoden","url":"https://topboden.pl/listwy-przypodlogowe/listwa-przypodlogowa-arbiton-indo-bialy-polysk-1","format":"topboden-api","productUuid":"e07740c0-6045-4fb7-8b2e-5fcedd998ee2","purchaseMultiple":10,"variant":["INDO","biały","połysk","01"]},
  // source: https://www.bricoman.pl/produkty/klej-do-wykladzin-soudal-26a-5kg-20484681.html
  {"category":"adhesive","packageSize":5,"unit":"kg","id":"bricoman-soudal-26a-5kg","ean":"5411183028395","brand":"Soudal","store":"Bricoman","format":"jsonld","variant":["26A","5kg"],"name":"Klej do wykładzin Soudal 26A 5kg","url":"https://www.bricoman.pl/produkty/klej-do-wykladzin-soudal-26a-5kg-20484681.html"},
  // source: https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html
  {"category":"adhesive","packageSize":5,"unit":"kg","id":"chemiadoparkietu-soudal-26a-5kg","ean":"5411183028395","name":"Soudal 26A klej do wykładzin PCV winylu linoleum dywanowych 5 kg","brand":"Soudal","store":"ChemiaDoParkietu25","url":"https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html","format":"idosell","productId":25914,"apiPurchaseUnit":"szt.","variant":["26A","5kg"],"imageUrl":"https://media.adeo.com/media/5600934/media.jpg"},
  // source: https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111-5902787568238.html
  {"id":"eelektryka-simon-basic-socket-white","ean":"5902787568238","name":"SIMON BASIC Gniazdo pojedyncze z/u i przesłonami do ramki białe BMGZ1z.01/11","category":"socket","brand":"Simon","packageSize":1,"unit":"szt","store":"Eelektryka","format":"prestashop","productId":3975,"retailerSku":"SI427","variant":["BMGZ1z.01/11","białe"],"url":"https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111-5902787568238.html"},
  // source: https://northbud.pl/ferro-bateria-prysznicowa-ferro-one-bez-prysznica-chrom-bfo7-p70291
  {"id":"northbud-ferro-one-bfo7","ean":"5902194954525","name":"FERRO Bateria prysznicowa Ferro One bez prysznica chrom BFO7","category":"faucet","brand":"Ferro","packageSize":1,"unit":"szt","store":"Northbud","format":"jsonld","variant":["BFO7","chrom"],"url":"https://northbud.pl/ferro-bateria-prysznicowa-ferro-one-bez-prysznica-chrom-bfo7-p70291"},
  // source: https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka
  {"id":"kronodom-arbiton-secura-thermo-6m2","ean":"5905167826942","name":"Podkład pod panele ARBITON SECURA THERMO AQUASTOP SMART 1,6mm (1opk.=6m2) czerwona harmonijka","category":"underlay","brand":"Arbiton","packageSize":6,"unit":"m2","store":"Kronodom","format":"abstore","productId":423,"apiPurchaseUnit":"m2","variant":["Secura","Thermo","Aquastop","Smart","1,6mm","6m2"],"url":"https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka"},
  // source: https://hipper.pl/klamka-do-drzwi-wewnetrznych-lucy-zlota-r-schaffner-3069808860
  {"id":"hipper-schaffner-lucy-gold","ean":"5907467760698","name":"Klamka do drzwi wewnętrznych Lucy złota R Schaffner","category":"door-handle","brand":"Schaffner","packageSize":1,"unit":"szt","store":"HIPPER","format":"certusoft","productId":3069808860,"retailerUnitId":3069809346,"apiPurchaseUnit":"szt","variant":["Lucy","złota","Schaffner"],"url":"https://hipper.pl/klamka-do-drzwi-wewnetrznych-lucy-zlota-r-schaffner-3069808860"},
  // source: https://modnalazienka.pl/u117-grey-gres-szkl-rekt-mat-598x598-34158
  {"id":"modna-paradyz-u117-grey-143m2","ean":"5904584158261","name":"U117 GREY GRES SZKL. REKT. MAT. 59,8X59,8","category":"tile","brand":"Paradyż","packageSize":1.43,"unit":"m2","store":"Modna Łazienka","format":"modna","productId":34158,"apiPurchaseUnit":"m2","variant":["U117","GREY","REKT","MAT","59,8X59,8"],"url":"https://modnalazienka.pl/u117-grey-gres-szkl-rekt-mat-598x598-34158"},
  // source: https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535
  {"id":"liderzy-classen-niasa-1973m2","ean":"4003992571974","name":"Panele podłogowe laminowane wodoodporne Classen Dąb Niasa AC5 1,973 m2","category":"laminate","brand":"Classen","packageSize":1.973,"unit":"m2","store":"LiderzyCen","format":"shoper-api","productId":31535,"retailerSku":"ctma_4003992571974","apiPurchaseUnit":"szt.","packageDescription":"Ilość m2 w opakowaniu: 1,973 m2","variant":["Dąb","Niasa","AC5","1,973 m2"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_52181_500_500/54fce513642c640c65a2c6dfb09f14a0.jpg","url":"https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535"},
  // source: https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472
  {"id":"liderzy-oakland-ac4-251m2","ean":"5063022887917","name":"Panele laminowane Oakland wodoodporne AC4 2,51 m2","category":"laminate","brand":"kronospan","packageSize":2.51,"unit":"m2","store":"LiderzyCen","format":"shoper-api","productId":185472,"retailerSku":"ctma_5063022887917","apiPurchaseUnit":"szt.","variant":["Oakland","AC4","2,51 m2"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_385924_500_500/0fc09fb9f3eda5be184e7dac0f2f6e76.jpg","url":"https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472"},
  // source: https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-laminowane-Volden-XPS-Smart-3-mm-10-m2/31327
  {"id":"liderzy-volden-xps-smart-10m2","ean":"5063022038289","name":"Podkład podłogowy pod panele laminowane Volden XPS Smart 3 mm 10 m2","category":"underlay","brand":"Volden","packageSize":10,"unit":"m2","store":"LiderzyCen","format":"shoper-api","productId":31327,"retailerSku":"ctma_5063022038289","apiPurchaseUnit":"szt.","variant":["XPS","Smart","3 mm","10 m2"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_51942_500_500/e236d745fb2303be7b2fb68575842e4a.jpg","url":"https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-laminowane-Volden-XPS-Smart-3-mm-10-m2/31327"},
  // source: https://liderzycen.pl/pl/p/Gres-mrozoodporny-szkliwiony-Guigliano-GoodHome-18%2C5-x-59%2C8-cm-beige-1-m2/31407
  {"id":"liderzy-goodhome-guigliano-1m2","ean":"3663602870821","name":"Gres mrozoodporny szkliwiony Guigliano GoodHome 18,5 x 59,8 cm beige 1 m2","category":"tile","brand":"GoodHome","packageSize":1,"unit":"m2","store":"LiderzyCen","format":"shoper-api","productId":31407,"retailerSku":"ctma_3663602870821","apiPurchaseUnit":"szt.","packageDescription":"Ilość m2 w opakowaniu: 1 m2","variant":["Guigliano","18,5 x 59,8","beige","1 m2"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_52024_500_500/d715e779aa0887d53ec108d0e9616438.jpg","url":"https://liderzycen.pl/pl/p/Gres-mrozoodporny-szkliwiony-Guigliano-GoodHome-18%2C5-x-59%2C8-cm-beige-1-m2/31407"},
  // source: https://liderzycen.pl/pl/p/Zawor-katowy-z-filtrem-Ferro-12-x-38/49055
  {"id":"liderzy-ferro-angle-valve-z270e","ean":"5901095614033","name":"Zawór kątowy z filtrem Ferro 1/2\" x 3/8\"","category":"valve","brand":"Ferro","packageSize":1,"unit":"szt","store":"LiderzyCen","format":"shoper-api","productId":49055,"retailerSku":"ctma_5901095614033","apiPurchaseUnit":"szt.","packageDescription":"Kolor producenta: chrom","variant":["z filtrem","1/2","3/8"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_70333_500_500/1831d737608977a2a1b38c23f5417c16.jpg","url":"https://liderzycen.pl/pl/p/Zawor-katowy-z-filtrem-Ferro-12-x-38/49055"},
  // source: https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474
  {"id":"liderzy-goodhome-marvo-2235m2","ean":"5063022676757","name":"Panele podłogowe winylowe GoodHome SPC Marvo 2,235 m2","category":"vinyl-panel","brand":"GoodHome","packageSize":2.235,"unit":"m2","store":"LiderzyCen","format":"shoper-api","productId":185474,"retailerSku":"ctma_5063022676757","apiPurchaseUnit":"szt.","variant":["SPC","Marvo","2,235 m2"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_385938_500_500/fc6886e524d877060a0d12ba4742f75e.jpg","url":"https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474"},
  // source: https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd
  // source: https://liderzycen.pl/pl/p/Kotwa-montazowa-do-oscieznic-10-x-182-mm/21842
  {"id":"liderzy-frame-anchor-10x182","ean":"5905458019787","name":"Kotwa montażowa do ościeżnic 10 x 182 mm","category":"anchor","brand":"Kingfisher International Products B.V.","brandReference":{"url":"https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd","retailerValue":"liderzycen","retailerId":50},"packageSize":1,"unit":"szt","store":"LiderzyCen","format":"shoper-api","productId":21842,"retailerSku":"ctma_5905458019787","apiPurchaseUnit":"szt.","variant":["10 x 182 mm"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_42043_500_500/141eb368955c6aeb6e1e7b6e42ac9af7.jpg","url":"https://liderzycen.pl/pl/p/Kotwa-montazowa-do-oscieznic-10-x-182-mm/21842"},
  // source: https://www.grupapsb.com.pl/produkt/zawias-wkrecany-regulowany-3d-14-mm-ocynkowany-metro-5906711270471.html
  // source: https://liderzycen.pl/pl/p/Zawias-regulowany-3D-14-mm-ocynkowany/22128
  {"id":"liderzy-metro-hinge-3d-14mm","ean":"5906711270471","name":"Zawias regulowany 3D 14 mm ocynkowany","category":"door-hinge","brand":"Metro","brandReference":{"url":"https://www.grupapsb.com.pl/produkt/zawias-wkrecany-regulowany-3d-14-mm-ocynkowany-metro-5906711270471.html","retailerValue":"liderzycen","retailerId":50},"packageSize":1,"unit":"szt","store":"LiderzyCen","format":"shoper-api","productId":22128,"retailerSku":"ctma_5906711270471","apiPurchaseUnit":"szt.","variant":["3D","14 mm","ocynkowany"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_42329_500_500/19ba2fb309a7adcf2859ffa72b746764.jpg","url":"https://liderzycen.pl/pl/p/Zawias-regulowany-3D-14-mm-ocynkowany/22128","packageDescription":"Nr referencyjny: ZAW-0091-0"},
  // source: https://www.castorama.pl/drzwi-pokojowe-credis-80-lewe-biale/5900378219590_CAPL.prd
  // source: https://liderzycen.pl/pl/p/Drzwi-pokojowe-Credis-80-lewe-biale/30489
  {"id":"liderzy-erkado-credis-80-left-white","ean":"5900378219590","name":"Drzwi pokojowe Credis 80 lewe białe","category":"door-leaf","brand":"Erkado","brandReference":{"url":"https://www.castorama.pl/drzwi-pokojowe-credis-80-lewe-biale/5900378219590_CAPL.prd","retailerValue":"liderzycen","retailerId":50},"packageSize":1,"unit":"szt","store":"LiderzyCen","format":"shoper-api","productId":30489,"retailerSku":"ctma_5900378219590","apiPurchaseUnit":"szt.","variant":["Credis","80","lewe","białe"],"imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_50898_500_500/a79eaa09c570422baee6412157b93d28.jpg","url":"https://liderzycen.pl/pl/p/Drzwi-pokojowe-Credis-80-lewe-biale/30489","packageDescription":"przeszklenia o mlecznym wykończeniu"},
  // source: https://betterial.pl/kleje-do-styropianu/8679-atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.html
  // source: https://betterial.pl/content/4-transport
  { id: 'betterial-atlas-stopter-k20-25kg', ean: '5905400160253', name: 'Atlas - zaprawa klejąca do styropianu Stopter K-20', category: 'adhesive-eps', brand: 'Atlas', packageSize: 25, unit: 'kg', store: 'Betterial', format: 'betterial', productId: 8679, variantId: 3816, retailerSku: '8679-86310', purchaseMultiple: 42, pickupRequiresConfirmation: true, variant: ['Stopter', 'K-20'], url: 'https://betterial.pl/kleje-do-styropianu/8679-atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.html' },
  // source: https://folnet.pl/pl/products/chemia-tasmy-mocowania/chemia-budowlana-soudal/pianki-pistoletowe/pianka-pistoletowa-soudafoam-low-expansion-10-8372.html
  { id: 'folnet-soudal-low-expansion-winter-750ml', ean: '5411183048522', name: 'Pianka pistoletowa Soudafoam Low Expansion -10', brand: 'Soudal', category: 'foam', packageSize: 750, unit: 'ml', store: 'Folnet', format: 'folnet', productId: 8372, retailerSku: '112583', variant: ['Low Expansion', '10'], url: 'https://folnet.pl/pl/products/chemia-tasmy-mocowania/chemia-budowlana-soudal/pianki-pistoletowe/pianka-pistoletowa-soudafoam-low-expansion-10-8372.html' },
  // Manufacturer SKU crosswalk, not a barcode published by this storefront.
  // source: https://kronosfera.pl/storage/file/core_files/2025/8/28/b4e17905d0344c0061ea8e07ee80bb72/KRONOSTEP_2025_22072025_PL_EN_web.pdf
  // source: https://www.obi.pl/p/7240922/kronospan-listwa-przypodlogowa-biala-lk100f-frez
  // source: https://kronosfera.pl/k/listwa-przypodlogowa-lk100f24-9002,2068
  // No self collection for flooring and accessories.
  // source: https://kronosfera.pl/dostawa
  { id:'kronosfera-skirting-lk100f-240',ean:'5907555424969',name:'Listwa przypodłogowa LK100F24 9002',
    category:'skirting',brand:'KronoOriginal',packageSize:2.4,unit:'mb',store:'Kronosfera',format:'kronosfera',
    productId:2068,retailerSku:'LK100F24-9002',pickupUnavailable:true,variant:['LK100F24','9002'],
    url:'https://kronosfera.pl/k/listwa-przypodlogowa-lk100f24-9002,2068' },
  // Reviewed manufacturer EAN and physical-pack crosswalk; the shop publishes SKU, not GTIN.
  // source: https://yetico.com/wp-content/uploads/2026/01/ecommerce_regulamin-programu-motywacyjnego_jubileuszowa-ekstraklasa-yetico_aktualizacja.pdf
  // source: https://yetico.com/wp-content/uploads/2022/06/karta_tech_gamma_fasada_pl.pdf
  // source: https://centrummatbud.pl/Styropian-elewacyjny-10-cm-Yetico-Gamma-Fasada-044-3m2-op-p96729
  // Dispatch is on order; the anonymous pickup method does not confirm a local pickup date or branch inventory.
  {id:'matbud-yetico-gamma-fasada-044-10cm',ean:'5902578301976',name:'Styropian elewacyjny 10 cm Yetico Gamma Fasada 044 3m2/op',category:'insulation',brand:'Yetico',packageSize:3,unit:'m2',store:'Centrum Matbud',format:'skyshop',productId:96729,retailerSku:'FASADA 044 10CM',minimumPackages:50,pickupRequiresConfirmation:true,variant:['Gamma','Fasada','044','10 cm'],url:'https://centrummatbud.pl/Styropian-elewacyjny-10-cm-Yetico-Gamma-Fasada-044-3m2-op-p96729'},
  // Manufacturer crosswalk p.34 row752; smooth 4-board/0.3m3/2m2 pack.
  // Native M2 price is multiplied by2 only after verifying tick2/box2 and the actual cart.
  // source: https://yetico.com/wp-content/uploads/2026/01/ecommerce_regulamin-programu-motywacyjnego_jubileuszowa-ekstraklasa-yetico_aktualizacja.pdf
  // source: https://yetico.com/wp-content/uploads/2022/09/karta_tech_gamma_passive_fasada.pdf
  // source: https://centrummatbud.pl/Styropian-grafitowy-15cm-Yetico-Gama-Passive-Fasada-033-p131345
  {id:'matbud-yetico-gamma-passive-033-15cm',ean:'5902578307268',name:'Styropian grafitowy 15cm Yetico Gama Passive Fasada 033',category:'insulation',brand:'Yetico',packageSize:2,unit:'m2',store:'Centrum Matbud',format:'skyshop',productId:131345,retailerSku:'FASADA 033 15CM',minimumPackages:50,pickupRequiresConfirmation:true,variant:['Gama','Passive','Fasada','033','15 cm'],url:'https://centrummatbud.pl/Styropian-grafitowy-15cm-Yetico-Gama-Passive-Fasada-033-p131345'},
  // Reviewed SKU crosswalk: the shop publishes WS-20-030-G, not an EAN.
  // source: https://invena.pl/produkt/wezyk-do-bat-w-opl-stal-3-8-dl-konc-30cm-3559
  // source: https://www.csmegastore.se/i/5469388/invena-anslutningsslang-f%C3%B6r-kranar-l%C3%A5ng-%C3%A4nde-3-8-x-m10-ws-20-030
  // source: https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i
  {id:'tokmet-invena-ws20-030',ean:'5907798716258',name:'WĘŻYK DO BATERII STOJĄCEJ 3/8" x M10*1 L - 30 CM DŁUGA KOŃCÓWKA',category:'hose',brand:'Invena',packageSize:1,unit:'szt',store:'TOK-MET',format:'qshop',productId:2806,retailerSku:'WS-20-030-G',variant:['3/8','M10','30 cm','długa'],url:'https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i'},
  // These exact public cards have a current, explicitly labelled browser read.
  // HTTP refresh still runs; a failure never extends a browser verification.
  // source: https://www.castorama.pl/farba-biala-mat-10-l/3663602567240_CAPL.prd
  {id:'castorama-paint-economy-10l',ean:'3663602567240',name:'Farba biała mat 10 l',category:'paint',brand:'',unbranded:true,packageSize:10,unit:'l',store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/farba-biala-mat-10-l/3663602567240_CAPL.prd'},
  // source: https://www.castorama.pl/farba-goodhome-sciany-i-sufit-bialy-mat-10-l/5059340271620_CAPL.prd
  {id:'castorama-paint-goodhome-10l',ean:'5059340271620',name:'Farba GoodHome Ściany i Sufit biały mat 10 l',category:'paint',brand:'GoodHome',packageSize:10,unit:'l',store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/farba-goodhome-sciany-i-sufit-bialy-mat-10-l/5059340271620_CAPL.prd'},
  // source: https://www.castorama.pl/gladz-pod-walek-gw180-20-kg/5907418038791_CAPL.prd
  {id:'castorama-kreisel-gw180-20kg',ean:'5907418038791',name:'Gładź pod wałek Kreisel GW180 gotowa polimerowa 20 kg',category:'skim-coat',brand:'Kreisel',packageSize:20,unit:'kg',store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/gladz-pod-walek-gw180-20-kg/5907418038791_CAPL.prd'},
  // source: https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd
  {id:'castorama-norgips-cd60-3m',ean:'5907651698899',name:'Profil sufitowy Norgips CD60 0,6 mm 3 mb',category:'profile',brand:'Norgips',packageSize:3,unit:'mb',variant:['CD60','0,6 mm','3 mb'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd'},
  // Exact 25kg promotion EAN, not the ordinary 20kg bag.
  // source: https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd
  {id:'castorama-atlas-plus-promo-25kg',ean:'5905400658866',name:'Klej wysokoelastyczny Atlas Plus odkształcalny 25 kg',category:'adhesive',brand:'Atlas',packageSize:25,unit:'kg',store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd'},
  // One complete WC with seat, not a litre-priced item.
  // source: https://www.castorama.pl/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca/5902115720833_CAPL.prd
  {id:'castorama-cersanit-seno',ean:'5902115720833',name:'Kompakt WC Cersanit Seno bezkołnierzowy 3/5 l z deską wolnoopadającą',category:'toilet',brand:'Cersanit',packageSize:1,unit:'szt',variant:['Seno','3/5 l'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca/5902115720833_CAPL.prd'},
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd
  {id:'castorama-aks-ydyp-3x15-100m',ean:'5904617573771',name:'Przewód AKS Zielonka YDYp 3 x 1,5 mm2 450/750 V 100 mb',category:'wire',brand:'AKS Zielonka',packageSize:100,unit:'mb',variant:['3 x 1,5 mm2','450/750 V','100 mb'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd'},
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd
  {id:'castorama-aks-ydyp-3x25-100m',ean:'5904617573764',name:'Przewód AKS Zielonka YDYp 3 x 2,5 mm2 450/750 V 100 mb',category:'wire',brand:'AKS Zielonka',packageSize:100,unit:'mb',variant:['3 x 2,5 mm2','450/750 V','100 mb'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd'},
  // The barcode and gross price identify one sealed ten-piece pack.
  // source: https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd
  {id:'castorama-elektroplast-pk60-10',ean:'5901752637337',name:'Puszka podtynkowa Elektro-Plast 60 głęboka łączeniowa z wkrętem 10 szt.',category:'flush-box',brand:'Elektro-Plast',packageSize:10,unit:'szt',store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd'},
  // The plain MP75 25kg barcode; not MP75L or a 20kg/30kg pack.
  // source: https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd
  {id:'castorama-knauf-mp75-25kg',ean:'5902367206352',name:'Tynk maszynowy Knauf MP 75 25 kg',category:'plaster',brand:'Knauf',packageSize:25,unit:'kg',variant:['Tynk maszynowy Knauf MP 75 25 kg'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd'},
  // Explicit right 70cm leaf; it must not replace the user's left/80cm choice.
  // source: https://www.castorama.pl/drzwi-z-podcieciem-opp-klasyk-70-prawe-biale/5063022524034_CAPL.prd
  {id:'castorama-opp-klasyk-70-right',ean:'5063022524034',name:'Drzwi z podcięciem OPP Klasyk 70 prawe białe',category:'door-leaf',brand:'OPP',packageSize:1,unit:'szt',variant:['Drzwi z podcięciem OPP Klasyk 70 prawe białe'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/drzwi-z-podcieciem-opp-klasyk-70-prawe-biale/5063022524034_CAPL.prd'},
  // One base, not an invented complete frame or its separate trim pieces.
  // source: https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd
  {id:'castorama-perfectdoor-base-80-100-right',ean:'5902659279118',name:'Baza ościeżnicy regulowana PerfectDoor 80-100 mm prawa dąb sonoma',category:'door-frame',brand:'PerfectDoor',packageSize:1,unit:'szt',variant:['Baza ościeżnicy regulowana PerfectDoor 80-100 mm prawa dąb sonoma'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd'},
  // Whole-pack prices independently visible beside the per-m² adverts.
  // source: https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2/5059340969756_CAPL.prd
  {id:'castorama-goodhome-arilla-25m2',ean:'5059340969756',name:'Panele podłogowe winylowe GoodHome SPC Arilla Dark Grey 2,5 m2',category:'vinyl-panel',brand:'GoodHome',packageSize:2.5,unit:'m2',variant:['SPC','Arilla','Dark Grey','2,5 m2'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2/5059340969756_CAPL.prd'},
  // source: https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-ragga-ele-marble-1-3-m2/5059340802435_CAPL.prd
  {id:'castorama-goodhome-ragga-13m2',ean:'5059340802435',name:'Panele podłogowe winylowe GoodHome Ragga Ele Marble 1,3 m2',category:'vinyl-panel',brand:'GoodHome',packageSize:1.3,unit:'m2',variant:['Ragga','Ele Marble','1,3 m2'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-ragga-ele-marble-1-3-m2/5059340802435_CAPL.prd'},
  // source: https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd
  {id:'castorama-fola-50mb',ean:'5906725207227',name:'Taśma brzegowa Fola 5 mm x 10 cm x 50 mb 5 m2',category:'expansion-tape',brand:'Fola',packageSize:50,unit:'mb',variant:['5 mm','10 cm','50 mb'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd'},
  // 178 PLN buys the entire 216cm piece; 82.41 PLN/m is not its purchase price.
  // source: https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd
  {id:'castorama-form-30x216',ean:'5906725219640',name:'Parapet wewnętrzny PCV Form 30 x 216 cm biały',category:'windowsill',brand:'Form',packageSize:2.16,unit:'m',variant:['30 x 216 cm','biały'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd'},
  // Actual marketplace merchant: this does not belong to Castorama's own basket
  // or physical pickup network. One sealed 6m² pack, not a multi-pack bundle.
  // source: https://www.castorama.pl/departments/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-/5061092900925_CAPL.prd
  {id:'castorama-marketplace-corksystem-lvt-6m2',ean:'5061092900925',name:'Podkład podłogowy Corksystem LVT 1.5 mm pod panele winylowe 6 m2 1 op.',category:'underlay',brand:'Corksystem',packageSize:6,unit:'m2',variant:['LVT','1.5 mm','6 m2','1 op.'],store:'Corksystem (Castorama)',marketplaceSeller:{name:'Corksystem',id:2601},pickupUnavailable:true,browserReviewAllowed:true,url:'https://www.castorama.pl/departments/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-/5061092900925_CAPL.prd'},
  // One three-metre piece, not its per-metre advert or the wholesale pack of192.
  // source: https://www.castorama.pl/profil-sufitowy-budmat-ud27-3-m/5907738940163_CAPL.prd
  {id:'castorama-budmat-ud27-3m',ean:'5907738940163',name:'Profil sufitowy Budmat UD27 3 m',category:'profile',brand:'Budmat',packageSize:3,unit:'mb',variant:['UD27','3 m'],store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,url:'https://www.castorama.pl/profil-sufitowy-budmat-ud27-3-m/5907738940163_CAPL.prd'},
  // Current branch-specific collection price. Other branches need their own proof.
  // source: https://www.bricomarche.pl/ksztaltownik-sufitowy-ud30-300-cm-srebrny
  {id:'bricomarche-poznan-budmat-ud27-3m',ean:'5907738940163',name:'Kształtownik sufitowy UD30 300 cm srebrny',category:'profile',brand:'Budmat',packageSize:3,unit:'mb',variant:['UD30','300 cm','srebrny'],store:'Bricomarché Poznań (Al. Solidarności)',pickupOnly:true,browserReviewAllowed:true,url:'https://www.bricomarche.pl/ksztaltownik-sufitowy-ud30-300-cm-srebrny'},
  // source: https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html
  {id:'folnet-conpar-100m2',ean:'5902096430103',name:'Folia paroizolacyjna żółta Conpar 0,20 mm',category:'vapor-barrier',brand:'Conkret',packageSize:100,unit:'m2',store:'Folnet',format:'folnet',productId:10288,retailerSku:'12-021',variant:['Conpar','0,20 mm'],url:'https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html'},
  // Separate current model, not an alias for discontinued EAN 5903917782364.
  // source: https://www.castorama.pl/drzwi-pelne-opp-archi-80-lewe-biale/5063022524263_CAPL.prd
  {id:'castorama-opp-archi-full-80-left',ean:'5063022524263',name:'Drzwi pełne OPP Archi 80 lewe białe',category:'door-leaf',brand:'OPP',packageSize:1,unit:'szt',store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,variant:['Archi','80','lewe','białe'],url:'https://www.castorama.pl/drzwi-pelne-opp-archi-80-lewe-biale/5063022524263_CAPL.prd'},
  // Same EAN as manufacturer Ovida K36-031; never alias the old Facile SKU.
  // source: https://www.castorama.pl/umywalka-cersanit-atlantic-new-50-cm/5901771226987_CAPL.prd
  // source: https://www.cersanit.com.pl/lazienka/umywalka-wiszaca-ovida-50,3252.html
  {id:'castorama-cersanit-atlantic-new-50',ean:'5901771226987',name:'Umywalka Cersanit Atlantic New 50 cm',category:'washbasin',brand:'Cersanit',packageSize:1,unit:'szt',store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,variant:['Atlantic','New','50'],url:'https://www.castorama.pl/umywalka-cersanit-atlantic-new-50-cm/5901771226987_CAPL.prd'},
  // source: https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd
  {id:'castorama-tamara-white-15m2',ean:'5907518303911',name:'Glazura Tamara 25 x 40 cm white 1,5 m2',category:'tile',brand:'Ceramika Color',packageSize:1.5,unit:'m2',store:'Castorama',pickupRequiresConfirmation:true,browserReviewAllowed:true,variant:['Tamara','25 x 40','white','1,5 m2'],url:'https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd'},
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505
  // source: https://mrowka.com.pl/produkt/krzyzyki-dystansowe-3-mm-150-szt-hardy-5905061016869.html
  {id:'sewera-tile-spacers-hardy-3mm-150',ean:'5905061016869',name:'Krzyżyki dystansowe 3mm 150szt.',category:'tile-spacer',brand:'KAEM',packageSize:150,unit:'szt',store:'Sewera',format:'sewera',retailUnit:'OPA',variant:['3mm','150szt'],url:'https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505'},
  // source: https://sklep.sewera.pl/krzyzyki-dystansowe-4mm-100szt--p12506
  // source: https://www.bricomarche.pl/krzyzyki-dystansowe-do-glazury-4-mm-biale-woreczek-100-sztuk-hardy
  {id:'sewera-tile-spacers-hardy-4mm-100',ean:'5905061016876',name:'Krzyżyki dystansowe 4mm 100szt.',category:'tile-spacer',brand:'KAEM',packageSize:100,unit:'szt',store:'Sewera',format:'sewera',retailUnit:'OPA',variant:['4mm','100szt'],url:'https://sklep.sewera.pl/krzyzyki-dystansowe-4mm-100szt--p12506'},
  // source: https://www.abud.pl/product-pol-17848-Mocowanie-umywalki-WST-10x140-Fischer-2-sztuki.html
  // source: https://www.fischerdanmark.dk/da/produkter/sanitetsbefaestigelse/keramiske-handvaske-urinaler-og-sanitaere-installationer/fastgorelse-af-vask-wst/45494-wst-140-k-nv
  {id:'abud-fischer-wst140k-2',ean:'8590369454948',name:'Mocowanie umywalki WST 10x140 Fischer 2 sztuki',category:'basin-fixings',brand:'Fischer',packageSize:2,unit:'szt',store:'ABUD',format:'idosell',productId:17848,apiPurchaseUnit:'op.',variant:['WST','10x140','2sztuki'],url:'https://www.abud.pl/product-pol-17848-Mocowanie-umywalki-WST-10x140-Fischer-2-sztuki.html'},
  // source: https://www.rabdom.pl/pl/p/Mapei-Kerapoxy-Easy-Design-Uniwersalna-fuga-epoksydowa-3kg-Bialy-100/14527
  {"id":"rabdom-kerapoxy-easy-design-100-3kg","ean":"8022452132940","name":"Mapei Kerapoxy Easy Design - Uniwersalna fuga epoksydowa 3kg Biały 100","category":"epoxy-grout","brand":"Mapei","packageSize":3,"unit":"kg","store":"Rab-Dom","format":"shoper-api","productId":14527,"retailerSku":"3771","apiPurchaseUnit":"szt.","variant":["Kerapoxy","Easy Design","3kg","Biały","100"],"url":"https://www.rabdom.pl/pl/p/Mapei-Kerapoxy-Easy-Design-Uniwersalna-fuga-epoksydowa-3kg-Bialy-100/14527","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_35202_500_500/Opakowanie-fugi-Mapei-o-gramaturze-3-kg..webp"},
  // source: https://winbud24.pl/pl/p/Mapei-Kerapoxy-Easy-Design-100-3kg-biala-fuga-epoksydowa/3748
  {"id":"winbud-kerapoxy-easy-design-100-3kg","ean":"8022452132940","name":"Mapei Kerapoxy Easy Design 100 3kg biała - fuga epoksydowa","category":"epoxy-grout","brand":"Mapei","packageSize":3,"unit":"kg","store":"WinBud","format":"shoper-api","productId":3748,"retailerSku":"8022452132940","apiPurchaseUnit":"szt.","variant":["Kerapoxy","Easy Design","100","3kg","biała"],"url":"https://winbud24.pl/pl/p/Mapei-Kerapoxy-Easy-Design-100-3kg-biala-fuga-epoksydowa/3748","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_10732_500_500/Mapei-Kerapoxy-Easy-Design-100-3kg-biala---fuga-epoksydowa.jpg"},
  // source: https://sklep.sewera.pl/atlas-plus-klej-do-plytek-bialy-25kg-p8896
  {"id":"sewera-atlas-plus-white-25kg","ean":"5905400313390","name":"Atlas Plus klej do płytek biały 25kg","category":"white-tile-adhesive","brand":"Atlas","packageSize":25,"unit":"kg","store":"Sewera","format":"sewera","variant":["Atlas Plus","biały","25kg"],"retailUnit":"SZT","url":"https://sklep.sewera.pl/atlas-plus-klej-do-plytek-bialy-25kg-p8896","imageUrl":"https://sklep.sewera.pl/photo/38873/atlas-plus-klej-do-plytek-bialy-25kg.webp"},
  // source: https://www.rabdom.pl/pl/p/Sniezka-Grunt-biala-farba-podkladowa-5l/97
  {"id":"rabdom-sniezka-undercoat-5l","ean":"5903973000235","name":"Śnieżka Grunt - biała farba podkładowa 5l","category":"paint-undercoat","brand":"Śnieżka","packageSize":5,"unit":"l","store":"Rab-Dom","format":"shoper-api","productId":97,"retailerSku":"0109","apiPurchaseUnit":"szt.","variant":["Śnieżka","Grunt","biała","5l"],"url":"https://www.rabdom.pl/pl/p/Sniezka-Grunt-biala-farba-podkladowa-5l/97","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_10843_500_500/SNIEZKA.webp"},
  // source: https://sklep.sewera.pl/sniezka-grunt-5l-p6153
  {"id":"sewera-sniezka-undercoat-5l","ean":"5903973000235","name":"Śnieżka grunt 5l","category":"paint-undercoat","brand":"Śnieżka","packageSize":5,"unit":"l","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["Śnieżka","grunt","5l"],"url":"https://sklep.sewera.pl/sniezka-grunt-5l-p6153","imageUrl":"https://sklep.sewera.pl/photo/72152/sniezka-grunt-5l.webp"},

  // source: https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282
  {"id":"sewera-packcenter-edge-tape-50m","ean":"","name":"Taśma dylatacyjna 5mm x 10cm x 50m","category":"expansion-tape","brand":"Pack-Center","packageSize":50,"unit":"mb","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["5mm","10cm","50m"],"url":"https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282","skuIdentity":{"catalogKey":"sewera-465325","manufacturerSku":"TB-FB00202","merchantProductId":"465325","pageBarcode":"465325"},"imageUrl":"https://sklep.sewera.pl/photo/364366/tasma-dylatacyjna-5mm-x-10cm-x-50m.webp","dispatchDepartment":{"id":"3","name":"Gliwice"}},

  // source: https://sklep.sewera.pl/srodek-do-usuwania-silikonu-silicone-remover-100ml-soudal-p21277
  {"id":"sewera-soudal-silicone-remover-100ml","ean":"5411183041899","name":"Środek do usuwania silikonu Silicone Remover 100ml Soudal","category":"silicone-remover","brand":"Soudal","packageSize":100,"unit":"ml","store":"Sewera","format":"sewera","url":"https://sklep.sewera.pl/srodek-do-usuwania-silikonu-silicone-remover-100ml-soudal-p21277","imageUrl":"https://sklep.sewera.pl/photo/343512/srodek-do-usuwania-silikonu-silicone-remover-100ml-soudal.webp"},
  // source: https://www.rabdom.pl/pl/p/SOUDAL-SRODEK-DO-USUWANIA-SILIKONU-100ml/12481
  {"id":"rabdom-soudal-silicone-remover-100ml","ean":"5411183041899","name":"SOUDAL ŚRODEK DO USUWANIA SILIKONU 100ml","category":"silicone-remover","brand":"Soudal","packageSize":100,"unit":"ml","store":"Rab-Dom","format":"shoper-api","productId":12481,"url":"https://www.rabdom.pl/pl/p/SOUDAL-SRODEK-DO-USUWANIA-SILIKONU-100ml/12481","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_24083_500_500/full_srodek-do-usuwania-silikonu-1366719941.webp"},
  // source: https://realbud.com/pl/p/SOUDAL-SILIKON-SANITARNY-KUCHNIA-LAZIENKA-PLESN-STOP-BIALY-280ml/75056922
  {"id":"realbud-soudal-sanitary-stop-white-280ml","ean":"5411183200326","name":"SOUDAL SILIKON SANITARNY KUCHNIA ŁAZIENKA PLEŚŃ STOP BIAŁY 280ml","category":"silicone","brand":"Soudal","packageSize":280,"unit":"ml","store":"Realbud","format":"shoper-api","productId":75056922,"url":"https://realbud.com/pl/p/SOUDAL-SILIKON-SANITARNY-KUCHNIA-LAZIENKA-PLESN-STOP-BIALY-280ml/75056922","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23109_500_500/5daa6a798ad6adc9e8224e3b5a646bb7.jpg"},

  // source: https://sklep.sewera.pl/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg-p13308
  {"id":"sewera-acrylputz-st10-5kg","ean":"5903973104414","brand":"ŚNIEŻKA","packageSize":5,"unit":"kg","category":"skim-coat","name":"Acryl Putz ST10 Start gładź szpachlowa sypka 5kg","url":"https://sklep.sewera.pl/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg-p13308","format":"sewera","store":"Sewera","retailUnit":"SZT","imageUrl":"https://sklep.sewera.pl/photo/34284/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg.webp"},
  // source: https://sklep.sewera.pl/papier-scierny-gr-120-arkusz-230x280mm-p6899
  {"id":"sewera-klingspor-pl28c-p120-sheet","ean":"5907560017644","brand":"Klingspor","packageSize":1,"unit":"szt","category":"hand-abrasive-120","name":"Papier ścierny gr.120 arkusz 230x280mm","url":"https://sklep.sewera.pl/papier-scierny-gr-120-arkusz-230x280mm-p6899","format":"sewera","store":"Sewera","retailUnit":"SZT","imageUrl":"https://sklep.sewera.pl/photo/56971/papier-scierny-gr-120-arkusz-230x280mm.webp","variant":["120","230x280mm"],"packageDescription":"PL 28 C"},
  // source: https://sklep.sewera.pl/papier-scierny-gr-150-arkusz-230x280mm-p6900
  {"id":"sewera-klingspor-pl28c-p150-sheet","ean":"5907560023553","brand":"Klingspor","packageSize":1,"unit":"szt","category":"hand-abrasive-150","name":"Papier ścierny gr.150 arkusz 230x280mm","url":"https://sklep.sewera.pl/papier-scierny-gr-150-arkusz-230x280mm-p6900","format":"sewera","store":"Sewera","retailUnit":"SZT","imageUrl":"https://sklep.sewera.pl/photo/56973/papier-scierny-gr-150-arkusz-230x280mm.webp","variant":["150","230x280mm"],"packageDescription":"PL 28 C"},
  // source: https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903
  {"id":"sewera-klingspor-pl28c-p240-sheet","ean":"5907560039820","brand":"Klingspor","packageSize":1,"unit":"szt","category":"hand-abrasive-240","name":"Papier ścierny gr.240 arkusz 230x280mm","url":"https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903","format":"sewera","store":"Sewera","retailUnit":"SZT","imageUrl":"https://sklep.sewera.pl/photo/56979/papier-scierny-gr-240-arkusz-230x280mm.webp","variant":["240","230x280mm"],"packageDescription":"PL 28 C"},
  // source: https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044
  {"id":"sewera-bluedolphin-fsh-48mm-20m","ean":"5907758504369","brand":"Blue Dolphin","packageSize":20,"unit":"m","category":"joint-tape","name":"Taśma spoinowa z włókna szklanego 48mm x 20m Blue Dolphin","url":"https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044","format":"sewera","store":"Sewera","retailUnit":"SZT","imageUrl":"https://sklep.sewera.pl/photo/355803/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin.webp","variant":["48mm","20m"]},
  // source: https://www.rabdom.pl/pl/p/SNIEZKA-ACRYL-PUTZ-ST10-Gladz-szpachlowa-START-FINISZ-5kg/1882
  {"id":"rabdom-acrylputz-st10-5kg","ean":"5903973104414","brand":"Śnieżka","packageSize":5,"unit":"kg","category":"skim-coat","name":"ŚNIEŻKA ACRYL PUTZ ST10 Gładź szpachlowa START FINISZ 5kg","url":"https://www.rabdom.pl/pl/p/SNIEZKA-ACRYL-PUTZ-ST10-Gladz-szpachlowa-START-FINISZ-5kg/1882","format":"shoper-api","productId":1882,"store":"Rab-Dom","imageUrl":"https://sklep.sewera.pl/photo/34284/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg.webp"},

  // source: https://realbud.com/Bandaz-z-wlokna-szklanego-8-cm-x-20-m
  {"id":"realbud-bluedolphin-fsh-48mm-20m","ean":"5907758504369","name":"Bandaż z włókna szklanego 48mm x 20 m BLUE DOLPHIN","brand":"Blue Dolphin","category":"joint-tape","packageSize":20,"unit":"m","store":"Realbud","format":"shoper-api","productId":7826,"variant":["48mm","20 m"],"url":"https://realbud.com/Bandaz-z-wlokna-szklanego-8-cm-x-20-m","imageUrl":"https://sklep.sewera.pl/photo/355803/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin.webp"},

  // source: https://sklep.sewera.pl/benzyna-ekstrakcyjna-0-5l-anser-p13691
  {"id":"sewera-anser-extraction-solvent-500ml","ean":"5903231606117","name":"Benzyna ekstrakcyjna 0,5l Anser","brand":"Anser","category":"extraction-solvent","packageSize":500,"unit":"ml","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["ekstrakcyjna","0,5l"],"url":"https://sklep.sewera.pl/benzyna-ekstrakcyjna-0-5l-anser-p13691","imageUrl":"https://sklep.sewera.pl/photo/233476/benzyna-ekstrakcyjna-0-5l-anser.webp"},
  // source: https://www.rabdom.pl/pl/p/Sniezka-Eko-Supermal-Emalia-Akrylowa-0%2C8l-Bialy-Mat-A500/13990
  {"id":"rabdom-supermal-acrylic-white-matt-800ml","ean":"5903973147756","name":"Śnieżka Eko Supermal Emalia Akrylowa 0,8l Biały Mat A500","brand":"Śnieżka","category":"frame-paint","packageSize":800,"unit":"ml","store":"Rab-Dom","format":"shoper-api","productId":13990,"variant":["biały","mat","0,8l"],"url":"https://www.rabdom.pl/pl/p/Sniezka-Eko-Supermal-Emalia-Akrylowa-0%2C8l-Bialy-Mat-A500/13990","imageUrl":"https://sklep.sewera.pl/photo/186957/sniezka-supermal-emalia-akrylowa-bialy-mat-0-8l.webp"},
  // source: https://sklep.sewera.pl/sniezka-supermal-emalia-akrylowa-bialy-mat-0-8l-p6121
  {"id":"sewera-supermal-acrylic-white-matt-800ml","ean":"5903973147756","name":"Śnieżka Supermal Emalia akrylowa biały mat 0,8l","brand":"Śnieżka","category":"frame-paint","packageSize":800,"unit":"ml","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["biały","mat","0,8l"],"url":"https://sklep.sewera.pl/sniezka-supermal-emalia-akrylowa-bialy-mat-0-8l-p6121","imageUrl":"https://sklep.sewera.pl/photo/186957/sniezka-supermal-emalia-akrylowa-bialy-mat-0-8l.webp"},
  // source: https://sklep.sewera.pl/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l-p13608
  {"id":"sewera-supermal-acrylic-white-semigloss-800ml","ean":"5903973232131","name":"Supermal Emalia akrylowa biały a300 półpołysk 0,8l","brand":"Śnieżka","category":"frame-paint","packageSize":800,"unit":"ml","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["biały","półpołysk","0,8l"],"url":"https://sklep.sewera.pl/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l-p13608","imageUrl":"https://sklep.sewera.pl/photo/186834/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l.webp"},
  // source: https://sklep.sewera.pl/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka-p17330
  {"id":"sewera-urekor-d-white-800ml","ean":"5903973231684","name":"Grunt do drewna Urekor D biały 0,8l Śnieżka","brand":"Śnieżka","category":"frame-primer","packageSize":800,"unit":"ml","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["Urekor D","biały","0,8l"],"url":"https://sklep.sewera.pl/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka-p17330","imageUrl":"https://sklep.sewera.pl/photo/46745/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka.webp"},
  // source: https://sklep.sewera.pl/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka-p11955
  {"id":"sewera-urekor-s-white-800ml","ean":"5903973228790","name":"Urekor S Podkład antykorozyjny biały 0,8 l Śnieżka","brand":"Śnieżka","category":"frame-primer","packageSize":800,"unit":"ml","store":"Sewera","format":"sewera","retailUnit":"SZT","variant":["Urekor S","biały","0,8l"],"url":"https://sklep.sewera.pl/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka-p11955","imageUrl":"https://sklep.sewera.pl/photo/191092/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka.webp"},
  // source: https://www.abud.pl/product-pol-63790-Dulux-do-drewna-i-metalu-RAPIDRY-Bialy-1L-matowa.html
  {"id":"abud-dulux-rapidry-white-matt-1l","ean":"5904078222379","name":"Dulux do drewna i metalu RAPIDRY Biały 1L matowa","brand":"Dulux","category":"frame-paint","packageSize":1000,"unit":"ml","store":"ABUD","format":"idosell","productId":63790,"apiPurchaseUnit":"op.","variant":["biały","1l","matowa"],"url":"https://www.abud.pl/product-pol-63790-Dulux-do-drewna-i-metalu-RAPIDRY-Bialy-1L-matowa.html","imageUrl":"https://www.abud.pl/hpeciai/bd8e25d4eb247560173865d66d538564/pol_pl_Dulux-do-drewna-i-metalu-RAPIDRY-Bialy-1L-matowa-63790_1.webp"},


  // source: https://marbet24.pl/gladzie/1288-norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg-5907651699056.html
  {"id":"marbet-norgips-startfinish-20kg","ean":"5907651699056","name":"NORGIPS Gotowa dwufunkcyjna masa szpachlowa Start & Finish (20 kg)","brand":"Norgips","category":"drywall-joint-compound","packageSize":20,"unit":"kg","store":"Marbet24","format":"jsonld","variant":["Start","Finish","20"],"url":"https://marbet24.pl/gladzie/1288-norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg-5907651699056.html","imageUrl":"https://marbet24.pl/6085-home_default/norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg.jpg","pickupRequiresConfirmation":true},
  // source: https://marbet24.pl/gladzie/1363-norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg-5907651693818.html
  {"id":"marbet-norgips-start-25kg","ean":"5907651693818","name":"NORGIPS Gips szpachlowy do spoinowania połączeń płyt gipsowo-kartonowych Start (25 kg)","brand":"Norgips","category":"drywall-joint-compound-powder","packageSize":25,"unit":"kg","store":"Marbet24","format":"jsonld","variant":["Start","25"],"url":"https://marbet24.pl/gladzie/1363-norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg-5907651693818.html","imageUrl":"https://marbet24.pl/1363-home_default/norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg.jpg","pickupRequiresConfirmation":true},
  // source: https://marbet24.pl/plyty-karton-gips/1555-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2600-mm-5907651690442.html
  {"id":"marbet-norgips-board-gkb-2600","ean":"5907651690442","name":"NORGIPS Płyta gipsowo-kartonowa standardowa – do wnętrz o normalnej wilgotności S GKB 12,5 mm typ A (1200 x 2600 mm)","brand":"Norgips","category":"gypsum-board","packageSize":3.12,"unit":"m2","store":"Marbet24","format":"jsonld","variant":["GKB","12,5","1200","2600"],"url":"https://marbet24.pl/plyty-karton-gips/1555-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2600-mm-5907651690442.html","imageUrl":"https://marbet24.pl/1555-home_default/norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2600-mm.jpg","pickupRequiresConfirmation":true},
  // source: https://marbet24.pl/plyty-karton-gips/1126-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm-5907651690879.html
  {"id":"marbet-norgips-board-gkb-2000","ean":"5907651690879","name":"NORGIPS Płyta gipsowo-kartonowa standardowa – do wnętrz o normalnej wilgotności S GKB 12,5 mm typ A (1200 x 2000 mm)","brand":"Norgips","category":"gypsum-board","packageSize":2.4,"unit":"m2","store":"Marbet24","format":"jsonld","variant":["GKB","12,5","1200","2000"],"url":"https://marbet24.pl/plyty-karton-gips/1126-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm-5907651690879.html","imageUrl":"https://marbet24.pl/1126-home_default/norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm.jpg","pickupRequiresConfirmation":true},
  // source: https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana-p11977
  {"id":"sewera-isover-aku-plyta-50mm","ean":"5901644653131","name":"Isover wełna mineralna Aku-Płyta 037 5cm wełna szklana","brand":"Isover","category":"partition-wool-50mm","packageSize":14.4,"unit":"m2","store":"Sewera","format":"sewera","retailUnit":"OPA","variant":["5cm"],"packageDescription":"14,4m2","url":"https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana-p11977","imageUrl":"https://sklep.sewera.pl/photo/190047/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana.webp"},


  // source: https://www.leroymerlin.pl/produkty/tasma-papierowa-50mm-75-mb-norgips-43912694.html
  {"id":"leroy-norgips-paper-50x75","ean":"5907651699933","name":"Taśma papierowa 50mm 75 mb NORGIPS","brand":"Norgips","category":"drywall-accessory","packageSize":75,"unit":"m","store":"Leroy Merlin","url":"https://www.leroymerlin.pl/produkty/tasma-papierowa-50mm-75-mb-norgips-43912694.html","retailerSku":"43912694","browserReviewAllowed":true,"pickupRequiresConfirmation":true,"imageUrl":"https://media.adeo.com/media/2629682/media.jpg","variant":["Norgips"]},
  // source: https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-50-mm-30-mb-norgips-43912722.html
  {"id":"leroy-norgips-acoustic-50x30","ean":"5907651698004","name":"Taśma uszczelniająca akustyczna 50 mm/30 mb NORGIPS","brand":"Norgips","category":"drywall-accessory","packageSize":30,"unit":"m","store":"Leroy Merlin","url":"https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-50-mm-30-mb-norgips-43912722.html","retailerSku":"43912722","browserReviewAllowed":true,"pickupRequiresConfirmation":true,"imageUrl":"https://media.adeo.com/media/2631597/media.jpg","variant":["Norgips"]},
  // source: https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-30-mm-30-mb-norgips-44420222.html
  {"id":"leroy-norgips-acoustic-30x30","ean":"5907651698851","name":"Taśma uszczelniająca akustyczna 30 mm/30 mb NORGIPS","brand":"Norgips","category":"drywall-accessory","packageSize":30,"unit":"m","store":"Leroy Merlin","url":"https://www.leroymerlin.pl/produkty/tasma-uszczelniajaca-akustyczna-30-mm-30-mb-norgips-44420222.html","retailerSku":"44420222","browserReviewAllowed":true,"pickupRequiresConfirmation":true,"imageUrl":"https://media.adeo.com/media/2629693/media.jpg","variant":["Norgips"]},
  // source: https://www.leroymerlin.pl/produkty/profil-scienny-cw50-3-m-b-super-norgips-44604350.html
  {"id":"leroy-norgips-cw50-06-3m","ean":"5907651698912","name":"Profil ścienny CW50 3 m.b. Super Norgips","brand":"Norgips","category":"drywall-accessory","packageSize":3,"unit":"mb","store":"Leroy Merlin","url":"https://www.leroymerlin.pl/produkty/profil-scienny-cw50-3-m-b-super-norgips-44604350.html","retailerSku":"44604350","browserReviewAllowed":true,"pickupRequiresConfirmation":true,"imageUrl":"https://media.adeo.com/media/3186925/media.png","variant":["Norgips"]},
  // source: https://www.leroymerlin.pl/produkty/profil-scienny-uw50-3-m-b-super-norgips-45191853.html
  {"id":"leroy-norgips-uw50-06-3m","ean":"5907651698547","name":"Profil ścienny UW50 3 m.b. Super Norgips","brand":"Norgips","category":"drywall-accessory","packageSize":3,"unit":"mb","store":"Leroy Merlin","url":"https://www.leroymerlin.pl/produkty/profil-scienny-uw50-3-m-b-super-norgips-45191853.html","retailerSku":"45191853","browserReviewAllowed":true,"pickupRequiresConfirmation":true,"imageUrl":"https://media.adeo.com/media/3191881/media.png","variant":["Norgips"]},
  // source: https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html
  {"id":"leroy-norgips-ud30-06-3m","ean":"5907651698905","name":"Profil sufitowy UD30 3 m.b. Super Norgips","brand":"Norgips","category":"drywall-accessory","packageSize":3,"unit":"mb","store":"Leroy Merlin","url":"https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html","retailerSku":"44604343","browserReviewAllowed":true,"pickupRequiresConfirmation":true,"imageUrl":"https://media.adeo.com/media/3196086/media.png","variant":["Norgips"]},
  // SUPER C3 is a different manufacturer GTIN; do not rewrite the old C2 observation.
  // source: https://norgips.pl/produkty/profil-ud-30-super-o-gr-blachy-06-mm-c3-26.html
  // source: https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html
  {id:'leroy-norgips-ud30-super-c3-3m',ean:'5907651691197',name:'Profil sufitowy UD30 3 m.b. Super Norgips',brand:'Norgips',category:'drywall-accessory',packageSize:3,unit:'mb',store:'Leroy Merlin',url:'https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html',retailerSku:'44604343',browserReviewAllowed:true,pickupRequiresConfirmation:true,imageUrl:'https://media.adeo.com/media/3196086/media.png',variant:['Norgips','SUPER']},
  // source: https://www.leroymerlin.pl/produkty/wieszak-plaski-es-60-75-mm-norgips-43912435.html
  {"id":"leroy-norgips-es6075","ean":"5907651699650","name":"Wieszak płaski ES 60/75 mm NORGIPS","brand":"Norgips","category":"drywall-accessory","packageSize":1,"unit":"szt","store":"Leroy Merlin","url":"https://www.leroymerlin.pl/produkty/wieszak-plaski-es-60-75-mm-norgips-43912435.html","retailerSku":"43912435","browserReviewAllowed":true,"pickupRequiresConfirmation":true,"imageUrl":"https://media.adeo.com/media/2629673/media.jpg","variant":["Norgips"]},
  // source: https://www.leroymerlin.pl/produkty/plyta-gipsowa-gkb-typ-a-2600-x-1200-x-12-5-mm-norgips-41661683.html
  {"id":"leroy-norgips-board-gkb-2600","ean":"5907651690442","name":"Płyta gipsowa GKB TYP A 2600 x 1200 x 12.5 mm Norgips","brand":"Norgips","category":"gypsum-board","packageSize":3.12,"unit":"m2","store":"Leroy Merlin","url":"https://www.leroymerlin.pl/produkty/plyta-gipsowa-gkb-typ-a-2600-x-1200-x-12-5-mm-norgips-41661683.html","retailerSku":"41661683","browserReviewAllowed":true,"pickupRequiresConfirmation":true,"imageUrl":"https://media.adeo.com/media/4754081/media.png","variant":["Norgips"]},
  // source: https://hipper.pl/tasma-flizelinowa-z-wlokna-szklanego-50-mm-norgips-2682507570
  {"id":"hipper-norgips-fleece-50x25","ean":"5907651699926","name":"Taśma flizelinowa z włókna szklanego 50 mm Norgips","brand":"Norgips","category":"drywall-accessory","packageSize":25,"unit":"m","store":"HIPPER","format":"certusoft","productId":2682507570,"retailerUnitId":2682507597,"apiPurchaseUnit":"szt","variant":["50mm"],"url":"https://hipper.pl/tasma-flizelinowa-z-wlokna-szklanego-50-mm-norgips-2682507570","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|1403C532-C046-4095-BC51-32C96B8A2610|1/Ta%C5%9Bma%20flizelinowa%20z%20w%C5%82%C3%B3kna%20szklanego%2050%20mm%20Norgips.webp"},
  // source: https://hipper.pl/lacznik-wzdluzny-60-x-110-mm-1-szt-norgips-2682631077
  {"id":"hipper-norgips-longitudinal-cd60","ean":"5907651699674","name":"Łącznik wzdłużny 60 x 110 mm 1 szt. Norgips","brand":"Norgips","category":"drywall-accessory","packageSize":1,"unit":"szt","store":"HIPPER","format":"certusoft","productId":2682631077,"retailerUnitId":2682631104,"apiPurchaseUnit":"szt","variant":["wzdłużny","60","110"],"url":"https://hipper.pl/lacznik-wzdluzny-60-x-110-mm-1-szt-norgips-2682631077","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|D09C4503-BAF4-43AE-A75D-C7A89B98C9B0|1/%C5%81%C4%85cznik%20wzd%C5%82u%C5%BCny%20%2060%20x%20110%20mm%201%20szt.%20Norgips.webp"},
  // source: https://buduj24.pl/produkt/14398,koelner-wkret-fs-z-drobnym-gwintem-do-mocowania-plyt-gk-do-blach-3-5x25mm-1000szt-opak
  {"id":"buduj24-koelner-fs3525-1000","ean":"5906675305127","name":"KOELNER Wkręt FS z drobnym gwintem do mocowania płyt GK, do blach 3,5x25MM 1000szt./opak","category":"drywall-accessory","brand":"Koelner","packageSize":1000,"unit":"szt","store":"Buduj24","format":"buduj24","productId":14398,"url":"https://buduj24.pl/produkt/14398,koelner-wkret-fs-z-drobnym-gwintem-do-mocowania-plyt-gk-do-blach-3-5x25mm-1000szt-opak","variant":["3,5x25MM","1000szt"],"packageDescription":"Ilość sztuk w opakowaniu: 1000szt.","imageUrl":"https://buduj24.pl/files/_product/14398/5906675305127_1.webp","pickupRequiresConfirmation":true},
  // source: https://www.abud.pl/product-pol-63463-Wkret-samowiercacy-3-5x9-5mm-1000-szt.html
  {"id":"abud-koelner-ws3595-1000","ean":"5906675303024","name":"Wkręt samowiercący 3,5x9,5mm 1000 szt","category":"drywall-accessory","brand":"Koelner","packageSize":1000,"unit":"szt","store":"ABUD","format":"idosell","productId":63463,"apiPurchaseUnit":"op.","url":"https://www.abud.pl/product-pol-63463-Wkret-samowiercacy-3-5x9-5mm-1000-szt.html","variant":["3,5x9,5mm","1000szt"],"imageUrl":"https://www.abud.pl/hpeciai/c13753752e4f9725fd61b84075871cd7/pol_pl_Wkret-samowiercacy-3-5x9-5mm-1000-szt-63463_1.webp","pickupRequiresConfirmation":true},
  // source: https://www.abud.pl/product-pol-1456-Wkrety-do-blachy-KOELNER-FS-3525-1000szt.html
  {"id":"abud-koelner-fs3525-1000","ean":"5906675305127","name":"Wkręty do blachy KOELNER FS-3525 (1000szt.)","category":"drywall-accessory","brand":"Koelner","packageSize":1000,"unit":"szt","store":"ABUD","format":"idosell","productId":1456,"apiPurchaseUnit":"op.","url":"https://www.abud.pl/product-pol-1456-Wkrety-do-blachy-KOELNER-FS-3525-1000szt.html","variant":["FS-3525","1000szt"],"imageUrl":"https://www.abud.pl/hpeciai/f598fd825346cdd294a6ccccd65f764b/pol_pl_Wkrety-do-blachy-KOELNER-FS-3525-1000szt-1456_1.webp","pickupRequiresConfirmation":true},
  // source: https://www.abud.pl/product-pol-1452-Kolek-szybki-montaz-kolnierz-6x40-KOELNER-200-szt.html
  {"id":"abud-koelner-fx06k040-200","ean":"5906675107622","name":"Kołek szybki montaż kołnierz 6x40 KOELNER 200 szt","category":"drywall-accessory","brand":"Koelner","packageSize":200,"unit":"szt","store":"ABUD","format":"idosell","productId":1452,"apiPurchaseUnit":"op.","url":"https://www.abud.pl/product-pol-1452-Kolek-szybki-montaz-kolnierz-6x40-KOELNER-200-szt.html","variant":["6x40","200szt"],"imageUrl":"https://www.abud.pl/hpeciai/a6c8238c098e65717875db7b7bcedfc1/pol_pl_Kolek-szybki-montaz-kolnierz-6x40-KOELNER-200-szt-1452_2.webp","pickupRequiresConfirmation":true},
  // source: https://www.abud.pl/product-pol-5708-Plyn-do-usuwania-tapet-500ml-Metylan.html
  {"id":"abud-metylan-remover-500ml","ean":"9000100222969","name":"Płyn do usuwania tapet 500ml Metylan","brand":"Metylan","category":"wallpaper-remover","packageSize":500,"unit":"ml","store":"ABUD","format":"idosell","productId":5708,"apiPurchaseUnit":"szt.","url":"https://www.abud.pl/product-pol-5708-Plyn-do-usuwania-tapet-500ml-Metylan.html","imageUrl":"https://www.abud.pl/hpeciai/da34e4afb4b30103e7a6affb323594aa/pol_pl_Plyn-do-usuwania-tapet-500ml-Metylan-5708_1.webp","pickupRequiresConfirmation":true},
  // source: https://www.abud.pl/product-pol-7965-Gladz-szpachlowa-Acryl-Putz-ST10-20kg.html
  {"id":"abud-acrylputz-st10-20kg","ean":"5903973104421","name":"Gładź szpachlowa Acryl-Putz ST10 20kg","brand":"Śnieżka","category":"skim-coat","packageSize":20,"unit":"kg","store":"ABUD","format":"idosell","productId":7965,"apiPurchaseUnit":"op.","url":"https://www.abud.pl/product-pol-7965-Gladz-szpachlowa-Acryl-Putz-ST10-20kg.html","imageUrl":"https://www.abud.pl/hpeciai/32d66f04ca7d073b4e7dae3199508b6e/pol_pl_Gladz-szpachlowa-Acryl-Putz-ST10-20kg-7965_1.webp","pickupRequiresConfirmation":true},
  // source: https://www.abud.pl/product-pol-1121-Preparat-gruntujacy-Atlas-Uni-Grunt-5kg.html
  {"id":"abud-atlas-unigrunt-5kg","ean":"5905400520026","name":"Preparat gruntujący Atlas Uni-Grunt (5kg)","brand":"Atlas","category":"primer","packageSize":5,"unit":"kg","store":"ABUD","format":"idosell","productId":1121,"apiPurchaseUnit":"op.","url":"https://www.abud.pl/product-pol-1121-Preparat-gruntujacy-Atlas-Uni-Grunt-5kg.html","imageUrl":"https://www.abud.pl/hpeciai/8f79c1dfa0096ee78b71ee8dc46b4ccd/pol_pl_Preparat-gruntujacy-Atlas-Uni-Grunt-5kg-1121_1.webp","pickupRequiresConfirmation":true},
  // source: https://hipper.pl/metylan-plyn-do-usuwania-tapet-0-5-l-956213124
  {"id":"hipper-metylan-remover-500ml","ean":"9000100222969","name":"Metylan Płyn do usuwania tapet 0,5 l","brand":"Metylan","category":"wallpaper-remover","packageSize":500,"unit":"ml","store":"HIPPER","format":"certusoft","productId":956213124,"retailerUnitId":956370273,"apiPurchaseUnit":"szt","variant":["0,5 l"],"url":"https://hipper.pl/metylan-plyn-do-usuwania-tapet-0-5-l-956213124","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos|PhotoMed|2948D411-51EF-432E-69FC-B6D536F816EC|2/Metylan%20P%C5%82yn%20do%20usuwania%20tapet%200,5%20l.webp","pickupRequiresConfirmation":true},
  // source: https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000
  {"id":"mensura-wolfcraft-6931000-kit","ean":"4006885693104","name":"WOLFCRAFT Zestaw do układania paneli podłogowych 22 el. 6931000","brand":"Wolfcraft","category":"laminate-installation-kit","packageSize":1,"unit":"szt","store":"Mensura","format":"shoper-api","productId":17167,"retailerSku":"WF6931000","apiPurchaseUnit":"szt","variant":["6931000"],"packageDescription":"20 x kliny dylatacyjne","url":"https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000","imageUrl":"https://www.mensura.pl/environment/cache/images/productGfx_102546_0_0/Zestaw-do-ukladania-paneli-22el.-Wolfcraft-6931000.jpg","pickupRequiresConfirmation":true},
  // source: https://liderzycen.pl/pl/p/Tasma-aluminiowa-do-laczenia-podkladow-Arbiton-Izo-Floor-Tape-25-m/31334
  {"id":"liderzy-arbiton-izo-floor-tape-25m","ean":"5905167698778","name":"Taśma aluminiowa do łączenia podkładów Arbiton Izo Floor Tape 25 m","brand":"Arbiton","category":"underlay-joint-tape","packageSize":25,"unit":"m","store":"LiderzyCen","format":"shoper-api","productId":31334,"retailerSku":"ctma_5905167698778","apiPurchaseUnit":"szt.","variant":["25 m"],"packageDescription":"Wymiary produktu: dł. 25 m","url":"https://liderzycen.pl/pl/p/Tasma-aluminiowa-do-laczenia-podkladow-Arbiton-Izo-Floor-Tape-25-m/31334","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_51949_500_500/7eb856643e33613605516b295006cacd.jpg","pickupRequiresConfirmation":true},
  // source: https://ebardo.pl/pl/p/Folia-paroizolacyjna-Conpar-0%2C2mm-2mx50m/86
  {"id":"ebardo-conpar-100m2","ean":"5902096430103","name":"Folia paroizolacyjna Conpar 0,2mm 2mx50m","retailerSku":"FPAR-02C","brand":"Conkret","category":"vapor-barrier","packageSize":100,"unit":"m2","store":"eBardo","format":"shoper-api","productId":86,"apiPurchaseUnit":"szt.","variant":["2mx50m"],"url":"https://ebardo.pl/pl/p/Folia-paroizolacyjna-Conpar-0%2C2mm-2mx50m/86","imageUrl":"https://ebardo.pl/environment/cache/images/productGfx_2143_500_500/Folia-paroizolacyjna-Conpar-0%2C2mm-2mx50m.jpg","pickupRequiresConfirmation":true},
  // source: https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534
  {"id":"ebardo-ecovil-p-100m2","ean":"5902096431131","name":"Folia paroizolacyjna Ecovil 0,2mm 2mx50m 100m2","retailerSku":"11-01","brand":"Conkret","category":"vapor-barrier","packageSize":100,"unit":"m2","store":"eBardo","format":"shoper-api","productId":534,"apiPurchaseUnit":"szt.","variant":["2mx50m"],"url":"https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534","imageUrl":"https://ebardo.pl/environment/cache/images/productGfx_2142_500_500/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2.jpg","pickupRequiresConfirmation":true},
  // source: https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325
  {"id":"hipper-norgips-cross-100","ean":"5907651696468","name":"Łącznik krzyżowy 60 x 145 mm 100 szt. Norgips","brand":"Norgips","category":"drywall-accessory","packageSize":100,"unit":"szt","store":"HIPPER","format":"certusoft","productId":3071669325,"retailerUnitId":3072059634,"apiPurchaseUnit":"szt","variant":["krzyżowy","60","145","100"],"url":"https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325","imageUrl":"https://hipper.pl/api/attachment/get/C3095A86-0FCB-46FF-A52A-63855FB53DDB/ImageIdent/csPhotos%7CPhotoMed%7C9794D2D8-F401-4DEA-BF8D-D0FF361306EE%7C1/%C5%81%C4%85cznik%20krzy%C5%BCowy%2060%20x%20145%20mm%20100%20szt.%20Norgips.webp"},
  // source: https://ebardo.pl/pl/p/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm/138
  {"id":"ebardo-budmat-cross-100","ean":"5901323043369","name":"Łącznik krzyżowy GK do profil CD60 100szt BUDMAT 0,8mm","brand":"Budmat","category":"drywall-accessory","packageSize":100,"unit":"szt","store":"eBardo","format":"shoper-api","productId":138,"retailerSku":"68-02","apiPurchaseUnit":"szt.","variant":["CD60","100szt","0,8mm"],"url":"https://ebardo.pl/pl/p/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm/138","imageUrl":"https://ebardo.pl/environment/cache/images/productGfx_2897_500_500/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm.jpg","pickupRequiresConfirmation":true},
  // source: https://sklep.ehw.com.pl/osprzet-laczeniowy/rawlplug-r-gs-06040-kotwa-do-sufitow-podwieszanych-6x40-mm
  {"id":"ehw-rawlplug-gs-100","ean":"5906675169347","name":"RAWLPLUG R-GS-06040 Kotwa do sufitów podwieszanych 6x40 mm","brand":"Rawlplug","category":"ceiling-anchor","packageSize":100,"unit":"szt","store":"Elektro-Hurt","format":"shoper-api","productId":6807,"retailerSku":"RAWLPLUG-304145","apiPurchaseUnit":"szt.","variant":["R-GS-06040","6x40"],"packageDescription":"Rodzaj opakowania: opakowanie kartonowe","url":"https://sklep.ehw.com.pl/osprzet-laczeniowy/rawlplug-r-gs-06040-kotwa-do-sufitow-podwieszanych-6x40-mm","imageUrl":"https://sklep.ehw.com.pl/environment/cache/images/productGfx_21763_500_500/858bd3358fa32304143b7a47e27c63b67c2f8593_0904f920e7ad3435db4d6ef5dd9e21e4a1468024_2a57cf4d4f4f771f6aaa3b51711fe54a3e05a012_GS_product__p.webp","pickupRequiresConfirmation":true},
  // source: https://zpradem.pl/kotwa-do-sufitow-podwieszanych-6x40mm-r-gs-06040-100szt/836377
  {"id":"zpradem-rawlplug-gs-100","ean":"5906675169347","name":"Kotwa do sufitów podwieszanych 6x40mm R-GS-06040 /100szt./","brand":"Rawlplug","category":"ceiling-anchor","packageSize":100,"unit":"szt","store":"Z prądem","format":"shoper-api","productId":836377,"retailerSku":"0001-00012-27895","apiPurchaseUnit":"szt.","variant":["R-GS-06040","100szt","6x40mm"],"url":"https://zpradem.pl/kotwa-do-sufitow-podwieszanych-6x40mm-r-gs-06040-100szt/836377","pickupRequiresConfirmation":true,"imageUrl":"https://sklep.ehw.com.pl/environment/cache/images/productGfx_21763_500_500/858bd3358fa32304143b7a47e27c63b67c2f8593_0904f920e7ad3435db4d6ef5dd9e21e4a1468024_2a57cf4d4f4f771f6aaa3b51711fe54a3e05a012_GS_product__p.webp"},
  // source: https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/
  {"id":"irbud-norgips-cd60-06-3m","ean":"","name":"Profil główny sufitowy CD60 3 MB / 0,6","brand":"Norgips","category":"profile","packageSize":3,"unit":"mb","store":"IRBUD","format":"irbud-woo","productId":10911,"skuIdentity":{"kind":"merchant-only","catalogKey":"irbud-10911","merchantProductId":"10911"},"variant":["CD60","3","0,6"],"url":"https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/","imageUrl":"https://irbudsklep.pl/wp-content/uploads/2023/11/Zrzut-ekranu-2025-09-05-114945.png","pickupRequiresConfirmation":true},
  // source: https://sklep-kowalczyk.pl/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html
  {"id":"kowalczyk-koelner-ws3595-1000","ean":"5906675303024","name":"KOELNER Wkręt samowiercący fosfatowy TEX 3,5x9,5mm 1000 szt (WS-3595)","brand":"Koelner","category":"drywall-accessory","packageSize":1000,"unit":"szt","store":"E-Kowalczyk","format":"kowalczyk-magento","productId":35759,"retailerSku":"5906675303024","url":"https://sklep-kowalczyk.pl/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html","imageUrl":"https://sklep-kowalczyk.pl/media/catalog/product/cache/d24a34bded6d2df740ef66d66d2112c9/5/9/5906675303024.png","pickupRequiresConfirmation":true},
  // source: https://sklep-kowalczyk.pl/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html
  {"id":"kowalczyk-koelner-fx06k040-200","ean":"5906675107622","name":"KOELNER Kołek szybkiego montażu 6x40 z kołnierzem 200szt/op. (FX-06K040)","brand":"Koelner","category":"drywall-accessory","packageSize":200,"unit":"szt","store":"E-Kowalczyk","format":"kowalczyk-magento","productId":35762,"retailerSku":"5906675107622","url":"https://sklep-kowalczyk.pl/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html","imageUrl":"https://sklep-kowalczyk.pl/media/catalog/product/cache/d24a34bded6d2df740ef66d66d2112c9/5/9/5906675107622.jpg","pickupRequiresConfirmation":true},
  // source: https://kim24.pl/Kolek-szybki-montaz-kolnierz-6x40-KOELNER
  {"id":"kim-koelner-fx06k040-200","ean":"5906675107622","name":"Kołek szybki montaż kołnierz 6x40 KOELNER 200 szt. FX-06K040","brand":"Koelner","category":"drywall-accessory","packageSize":200,"unit":"szt","store":"KIM24","format":"shoper-api","productId":13330,"retailerSku":"MTZKKW06K040","apiPurchaseUnit":"op.","variant":["6x40","200 szt","FX-06K040"],"url":"https://kim24.pl/Kolek-szybki-montaz-kolnierz-6x40-KOELNER","pickupRequiresConfirmation":true,"imageUrl":"https://sklep-kowalczyk.pl/media/catalog/product/cache/d24a34bded6d2df740ef66d66d2112c9/5/9/5906675107622.jpg"},
  // source: https://zpradem.pl/wkret-fosfatowany-samowiercacy-35x95-ws-3595-1000szt/798230
  {"id":"zpradem-koelner-ws3595-1000","ean":"5906675303024","name":"Wkręt fosfatowany samowiercący 3,5x9,5 WS-3595 1000szt","brand":"Koelner","category":"drywall-accessory","packageSize":1000,"unit":"szt","store":"Z prądem","format":"shoper-api","productId":798230,"retailerSku":"0004-00010-06761","apiPurchaseUnit":"szt.","variant":["WS-3595","1000szt","3,5x9,5"],"url":"https://zpradem.pl/wkret-fosfatowany-samowiercacy-35x95-ws-3595-1000szt/798230","imageUrl":"https://sklep-kowalczyk.pl/media/catalog/product/cache/d24a34bded6d2df740ef66d66d2112c9/5/9/5906675303024.png","pickupRequiresConfirmation":true},
  // source: https://plejadatapet.pl/pl/p/Klej-do-tapet-Direct-200g-Metylan/825
  {"id":"plejada-metylan-direct-200g","ean":"4015000402019","name":"Klej do tapet Direct 200g Metylan","brand":"Metylan","category":"wallpaper-adhesive","packageSize":200,"unit":"g","store":"Plejada Tapet","url":"https://plejadatapet.pl/pl/p/Klej-do-tapet-Direct-200g-Metylan/825","format":"shoper-api","productId":825,"retailerSku":"MT DIR200","apiPurchaseUnit":"szt.","variant":["direct","200g"],"imageUrl":"https://plejadatapet.pl/environment/cache/images/productGfx_36488_500_500/Klej-do-tapet-na-flizelinie-Direct-200g-Metylan-Henkel.jpg","pickupRequiresConfirmation":true},
  // source: https://plejadatapet.pl/pl/p/Klej-do-tapet-Normal-125g-Metylan/824
  {"id":"plejada-metylan-normal-125g","ean":"4015000095266","name":"Klej do tapet Normal 125g Metylan","brand":"Metylan","category":"wallpaper-adhesive","packageSize":125,"unit":"g","store":"Plejada Tapet","url":"https://plejadatapet.pl/pl/p/Klej-do-tapet-Normal-125g-Metylan/824","format":"shoper-api","productId":824,"retailerSku":"MT NOR125","apiPurchaseUnit":"szt.","variant":["normal","125g"],"imageUrl":"https://plejadatapet.pl/environment/cache/images/productGfx_36489_500_500/Klej-do-tapet-papierowych-Normal-125g-Metylan-Henkel.jpg","pickupRequiresConfirmation":true},
  // source: https://swiatsieklei.pl/pl/p/METYLAN-Direct-200g-klej-do-tapet-24119/104
  {"id":"swiat-metylan-direct-200g","ean":"4015000402019","name":"METYLAN Direct 200g klej do tapet 24119","brand":"Metylan","category":"wallpaper-adhesive","packageSize":200,"unit":"g","store":"Świat Się Klei","url":"https://swiatsieklei.pl/pl/p/METYLAN-Direct-200g-klej-do-tapet-24119/104","format":"shoper-api","productId":104,"retailerSku":"N-29","apiPurchaseUnit":"szt.","variant":["direct","200g"],"imageUrl":"https://swiatsieklei.pl/environment/cache/images/productGfx_8cf3f0b127670f2cfdd5620ec59b3e3e_500_500.webp","pickupRequiresConfirmation":true},
  // source: https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101
  {"id":"swiat-metylan-normal-125g","ean":"4015000095266","name":"METYLAN Normal 125g klej do tapet 24122","brand":"Metylan","category":"wallpaper-adhesive","packageSize":125,"unit":"g","store":"Świat Się Klei","url":"https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101","format":"shoper-api","productId":101,"retailerSku":"N-26","apiPurchaseUnit":"szt.","variant":["normal","125g"],"imageUrl":"https://swiatsieklei.pl/environment/cache/images/productGfx_a44f7b5fc0ca152dba8e53e1ccae43fa_500_500.webp","pickupRequiresConfirmation":true},
  // source: https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972
  // source: https://www.erismann.de/en/collection/rollover-27
  {"id":"plejada-erismann-rollover-3333-5","ean":"4002790333357","name":"Gładka tapeta flizelinowa 150g/m2 25m * 0,75m 3333-5 Erismann RollOver","brand":"Erismann","category":"wallpaper","packageSize":1,"unit":"szt","store":"Plejada Tapet","url":"https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972","format":"shoper-api","productId":23972,"retailerSku":"ER 3333-5","apiPurchaseUnit":"szt.","variant":["3333-5","rollover"],"packageDescription":"25.00m * 0.75m","imageUrl":"https://plejadatapet.pl/environment/cache/images/productGfx_92091_500_500/Gladka-tapeta-flizelinowa-150gm2-25m--0%2C75m-3333-5-Erismann-RollOver.jpg","pickupRequiresConfirmation":true},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131
  {"id":"winbud-mapegum-wps-5kg","ean":"8022452002113","name":"Mapei Mapegum WPS folia w płynie  5kg","category":"waterproofing","brand":"Mapei","packageSize":5,"unit":"kg","store":"WinBud","format":"shoper-api","url":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131","productId":131,"retailerSku":"002113","apiPurchaseUnit":"szt.","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_10363_500_500/Mapei-Mapegum-WPS-folia-w-plynie-5kg.png","variant":["5kg"],"pickupRequiresConfirmation":true},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419
  {"id":"winbud-mapegum-wps-10kg","ean":"8022452002120","name":"Mapei Mapegum WPS folia w płynie 10kg","category":"waterproofing","brand":"Mapei","packageSize":10,"unit":"kg","store":"WinBud","format":"shoper-api","url":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419","productId":419,"retailerSku":"002120","apiPurchaseUnit":"szt.","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_10364_500_500/Mapei-Mapegum-WPS-folia-w-plynie-10kg.png","variant":["10kg"],"pickupRequiresConfirmation":true},
  // source: https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-20kg-folia-w-plynie/3543
  {"id":"winbud-mapegum-wps-20kg","ean":"8022452242502","name":"Mapei Mapegum WPS 20kg folia w płynie","category":"waterproofing","brand":"Mapei","packageSize":20,"unit":"kg","store":"WinBud","format":"shoper-api","url":"https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-20kg-folia-w-plynie/3543","productId":3543,"retailerSku":"8022452242502","apiPurchaseUnit":"szt.","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_10095_500_500/Mapei-Mapegum-WPS-folia-w-plynie-20kg.jpg","variant":["20kg"],"pickupRequiresConfirmation":true},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-10mb-Tasma-uszczelniajaca%2C-rolka/3088
  {"id":"winbud-mapeband-w-10m","ean":"8022452113932","name":"Mapei Mapeband W 10mb - Taśma uszczelniająca, rolka","category":"sealing-tape","brand":"Mapei","packageSize":10,"unit":"m","store":"WinBud","format":"shoper-api","url":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-10mb-Tasma-uszczelniajaca%2C-rolka/3088","productId":3088,"retailerSku":"8022452113932","apiPurchaseUnit":"szt.","variant":["10mb"],"imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_445089b9b7c9b68ab49588317e73e9ce_500_500.jpg","pickupRequiresConfirmation":true},
  // source: https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-uszczelniajacy-300-x-300mm%2C-podlogowy/3091
  {"id":"winbud-mapeband-w-floor-300","ean":"8022452113895","name":"Mapei Mapeband W -  mankiet uszczelniający 300 x 300mm, podłogowy","category":"sealing-cuff","brand":"Mapei","packageSize":1,"unit":"szt","store":"WinBud","format":"shoper-api","url":"https://winbud24.pl/pl/p/Mapei-Mapeband-W-mankiet-uszczelniajacy-300-x-300mm%2C-podlogowy/3091","productId":3091,"retailerSku":"8022452113895","apiPurchaseUnit":"szt.","imageUrl":"https://winbud24.pl/environment/cache/images/productGfx_19e0623a7a479d85b5c509f0f7dd6f7e_500_500.jpg","variant":["300"],"pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-1l-KONCENTRAT-GRUNTUJACY-GRUNT/10970
  {"id":"rabdom-primer-g-pro-1l","ean":"8022452241123","name":"MAPEI PRIMER G PRO 1l KONCENTRAT GRUNTUJĄCY GRUNT","category":"primer","brand":"Mapei","packageSize":1,"unit":"l","store":"Rab-Dom","format":"shoper-api","url":"https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-1l-KONCENTRAT-GRUNTUJACY-GRUNT/10970","productId":10970,"retailerSku":"37969","apiPurchaseUnit":"szt.","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_19574_500_500/4_primer-g-pro_1l_pl_2c7d4435f6894c59b7f19830a10992cc.webp","variant":["1l"],"pickupRequiresConfirmation":true},
  // source: https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-5l-KONCENTRAT-GRUNTUJACY-GRUNT/10969
  {"id":"rabdom-primer-g-pro-5l","ean":"8022452241130","name":"MAPEI PRIMER G PRO 5l KONCENTRAT GRUNTUJĄCY GRUNT","category":"primer","brand":"Mapei","packageSize":5,"unit":"l","store":"Rab-Dom","format":"shoper-api","url":"https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-5l-KONCENTRAT-GRUNTUJACY-GRUNT/10969","productId":10969,"retailerSku":"37970","apiPurchaseUnit":"szt.","imageUrl":"https://www.rabdom.pl/environment/cache/images/productGfx_19572_500_500/4_primer-g-pro_5l_pl_ea1ad0866a074cc2a5352b1844b10324.webp","variant":["5l"],"pickupRequiresConfirmation":true},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-naroznik-wewnetrzny-bialy-polysk-01-opakowanie-foliowe
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/naroznik-wew-indo-bialy-polysk-1-arbiton
  {"id":"topboden-indo-inside-gloss-2","ean":"5905167726037","name":"Narożniki do listew przypodłogowych Arbiton INDO - biały połysk 01 - wewnętrzne - 2 szt.","brand":"Arbiton","category":"skirting-accessory","packageSize":2,"unit":"szt","store":"TopBoden","format":"topboden-api","productUuid":"9d18849b-1174-4fb0-a0ef-f78e5ee3e03f","apiPurchaseUnit":"opk.","variant":["INDO","biały połysk","2 szt"],"pickupRequiresConfirmation":true,"url":"https://topboden.pl/listwy-przypodlogowe/indo-naroznik-wewnetrzny-bialy-polysk-01-opakowanie-foliowe","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167726037_P_01.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-naroznik-zewnetrzny-bialy-polysk-01-opakowanie-foliowe
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/naroznik-zew-indo-bialy-polysk-1-arbiton
  {"id":"topboden-indo-outside-gloss-2","ean":"5905167726198","name":"Narożniki do listew przypodłogowych Arbiton INDO - biały połysk 01 - zewnętrzne - 2 szt.","brand":"Arbiton","category":"skirting-accessory","packageSize":2,"unit":"szt","store":"TopBoden","format":"topboden-api","productUuid":"6d0e4dc7-6cc8-4f8a-bd57-4d5f7f634c62","apiPurchaseUnit":"opk.","variant":["INDO","biały połysk","2 szt"],"pickupRequiresConfirmation":true,"url":"https://topboden.pl/listwy-przypodlogowe/indo-naroznik-zewnetrzny-bialy-polysk-01-opakowanie-foliowe","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167726198_P_02.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-lacznik-bialy-polysk-01-opakowanie-foliowe
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/lacznik-indo-bialy-polysk-1-arbiton
  {"id":"topboden-indo-connector-gloss-2","ean":"5905167725870","name":"Łączniki do listew przypodłogowych Arbiton INDO - biały połysk 01 - 2 szt.","brand":"Arbiton","category":"skirting-accessory","packageSize":2,"unit":"szt","store":"TopBoden","format":"topboden-api","productUuid":"46e7fec7-9ef8-4fb3-95c5-29c0b52b7f32","apiPurchaseUnit":"opk.","variant":["INDO","biały połysk","2 szt"],"pickupRequiresConfirmation":true,"url":"https://topboden.pl/listwy-przypodlogowe/indo-lacznik-bialy-polysk-01-opakowanie-foliowe","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167725870_P_01.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/indo-zakonczenie-prawe-lewe-bialy-polysk-01-opakowanie-foliowe
  // source: https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/zakonczenie-l-p-indo-bialy-polysk-1-arbiton
  {"id":"topboden-indo-endcaps-gloss-pair","ean":"5905167726358","name":"Zakończenie listwy przypodłogowej Arbiton INDO - biały połysk 01 - lewe i prawe - 2 szt.","brand":"Arbiton","category":"skirting-accessory","packageSize":1,"unit":"kpl","store":"TopBoden","format":"topboden-api","productUuid":"7e8bcf6a-8e26-4f27-9785-8bb7d087ba48","apiPurchaseUnit":"opk.","variant":["INDO","biały połysk","2 szt"],"pickupRequiresConfirmation":true,"url":"https://topboden.pl/listwy-przypodlogowe/indo-zakonczenie-prawe-lewe-bialy-polysk-01-opakowanie-foliowe","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167726358_P_03.webp"},
  // source: https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml
  // source: https://arbiton.com/pl/klej-montazowy-strongman-300ml
  {"id":"topboden-strongman-300ml","ean":"5905167788264","name":"Klej montażowy Arbiton Strongman 300 ml - klej do listew przypodłogowych","brand":"Arbiton","category":"skirting-adhesive","packageSize":300,"unit":"ml","store":"TopBoden","format":"topboden-api","productUuid":"9cc774ed-c24b-4f3b-a863-a935a86383f4","apiPurchaseUnit":"szt.","variant":["Strongman","300 ml"],"pickupRequiresConfirmation":true,"url":"https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml","imageUrl":"https://topboden.pl/media/cache/gallery/photos/webp/5905167788264_I_01.webp"},
  // source: https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html
  {"id":"izosystems-sws-inside90-30m","ean":"5411183151178","name":"Taśma paroszczelna wewnętrzna Soudal SWS Basic Plus Inside 90mm x 30m","brand":"Soudal","category":"window-tape","packageSize":30,"unit":"m","store":"Izosystems","format":"izosystems","productId":1783,"retailerSku":"135633","apiPurchaseUnit":"szt.","pickupRequiresConfirmation":true,"variant":["Inside","90mm","30m"],"url":"https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html"},
  // source: https://realbud.com/pl/p/Srodek-gruntujacy-KNAUF-Betokontakt-5-kg%2C-grunt-do-powierzchni-betonowych/74052350
  // source: https://knauf.com/pl-PL/p/produkt/knauf-betokontakt-10251_0120
  {"id":"realbud-knauf-betokontakt-5kg","ean":"4006379051014","name":"Środek gruntujący KNAUF Betokontakt 5 kg, grunt do powierzchni betonowych","brand":"Knauf","category":"plaster-primer","packageSize":5,"unit":"kg","store":"Realbud","format":"shoper-api","productId":74052350,"retailerSku":"9341","apiPurchaseUnit":"szt.","url":"https://realbud.com/pl/p/Srodek-gruntujacy-KNAUF-Betokontakt-5-kg%2C-grunt-do-powierzchni-betonowych/74052350","imageUrl":"https://realbud.com/environment/cache/images/productGfx_25859_500_500/9341.png?overlay=1","pickupRequiresConfirmation":true},
  // source: https://realbud.com/pl/p/Siatka-tynkarska-Knauf-PROFIX-szer.-1000-mm-oczko-10x10-mm-50-mb/75057500
  // source: https://knauf.com/pl-PL/p/produkt/knauf-profix-10681_0120
  {"id":"realbud-knauf-profix-50m2","ean":"5902367201067","name":"Siatka tynkarska - Knauf PROFIX szer. 1000 mm ( oczko 10x10 mm ) - 50 mb","brand":"Knauf","category":"plaster-mesh","packageSize":50,"unit":"m2","store":"Realbud","format":"shoper-api","productId":75057500,"retailerSku":"11723","apiPurchaseUnit":"szt.","url":"https://realbud.com/pl/p/Siatka-tynkarska-Knauf-PROFIX-szer.-1000-mm-oczko-10x10-mm-50-mb/75057500","imageUrl":"https://realbud.com/environment/cache/images/productGfx_23636_500_500/7ff3a7398c66270601e5d09d595d52a5.png","pickupRequiresConfirmation":true,"variant":["1000 mm","10x10 mm","50 mb"]},
  // source: https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390
  // source: https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120
  {"id":"liderzycen-knauf-goldband-25kg","ean":"5902367206383","name":"Tynk gipsowy ręczny Knauf Goldband 25 kg","brand":"Knauf","category":"plaster","packageSize":25,"unit":"kg","store":"LiderzyCen","format":"shoper-api","productId":55390,"retailerSku":"ctma_5902367206383","apiPurchaseUnit":"szt.","pickupRequiresConfirmation":true,"url":"https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390","imageUrl":"https://liderzycen.pl/environment/cache/images/productGfx_77582_0_0/32464cdd129db9bfb699808dae441565.webp"},
];

// Stable calculator catalogue labels, not fuzzy matches against store search results.
export const RETAIL_NAME_ALIASES: Readonly<Record<string, string>> = {
  "Knauf Betokontakt — grunt sczepny 5 kg": "4006379051014",
  "Siatka tynkarska Knauf Profix 100 cm × 50 m (50 m²)": "5902367201067",
  "Erismann RollOver 3333-5 — flizelina do malowania, rolka 0,75 × 25 m": "4002790333357",
  'Metylan Direct — klej do tapet flizelinowych 200 g': '4015000402019',
  'Metylan Normal — klej do tapet papierowych 125 g': '4015000095266',
  "Kotwa stalowa sufitowa Rawlplug R-GS-06040 (100 szt.)": "5906675169347",
  "Łącznik krzyżowy Norgips CD 60 (100 szt.)": "5907651696468",
  "Łącznik krzyżowy Budmat CD 60, 0,8 mm (100 szt.)": "5901323043369",
  "Folia paroizolacyjna Conkret Ecovil P 0,20 mm (100 m²)": "5902096431131",
  "Zestaw do układania paneli Wolfcraft 6931000 — 22 elementy": "4006885693104",
  "Taśma aluminiowa Arbiton Izo Floor Tape 50 mm × 25 m": "5905167698778",
  "Metylan Remover — koncentrat do usuwania tapet 500 ml": "9000100222969",
  "Wkręty do płyt GK Koelner FS 3,5×25 mm, 1000 szt.": "5906675305127",
  "Wkręty do profili Koelner WS 3,5×9,5 mm, 1000 szt.": "5906675303024",
  "Kołki do profili Koelner FX-06K040, 6×40 mm, 200 szt.": "5906675107622",
  "Taśma papierowa Norgips 50 mm × 75 m": "5907651699933",
  "Taśma uszczelniająca Norgips 50 mm × 30 m": "5907651698004",
  "Taśma uszczelniająca Norgips 30 mm × 30 m": "5907651698851",
  "Profil Norgips CW 50, 0,6 mm, 3 m (EAN 8912)": "5907651698912",
  "Profil Norgips UW 50 Super, 0,6 mm, 3 m": "5907651698547",
  "Profil Norgips UD 30, 0,6 mm, 3 m (EAN 8905)": "5907651698905",
  // source: https://norgips.pl/produkty/profil-ud-30-super-o-gr-blachy-06-mm-c3-26.html
  "Profil Norgips UD 30 SUPER C3, 0,6 mm, 3 m (EAN 1197)": "5907651691197",
  "Wieszak płaski Norgips ES 60/75, 1 szt.": "5907651699650",
  "Taśma fizelinowa Norgips 50 mm × 25 m": "5907651699926",
  "Łącznik wzdłużny Norgips CD 60, 60×110 mm, 1 szt.": "5907651699674",
  "Taśma papierowa Norgips 50 mm — spoiny ścianki": "5907651699933",
  "Taśma papierowa Norgips 50 mm — spoiny sufitu": "5907651699933",
  "Taśma uszczelniająca Norgips 50 mm pod UW i skrajne CW": "5907651698004",
  "Taśma uszczelniająca Norgips 30 mm pod UD": "5907651698851",
  "Wieszak bezpośredni Norgips ES 60/75": "5907651699650",
  "Łącznik wzdłużny Norgips CD 60": "5907651699674",
  "Profil Norgips UW 50, 0,6 mm — podłoga i sufit": "5907651698547",
  "Profil Norgips UD 30, 0,6 mm — obwód sufitu": "5907651698905",
  // source: https://marbet24.pl/gladzie/1288-norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg-5907651699056.html
  'Gotowa masa do spoin Norgips Start & Finish 20 kg': '5907651699056',
  // source: https://marbet24.pl/gladzie/1363-norgips-gips-szpachlowy-do-spoinowania-polaczen-plyt-gipsowo-kartonowych-start-25-kg-5907651693818.html
  'Gips do spoin Norgips Start 25 kg — proszek': '5907651693818',
  // source: https://marbet24.pl/plyty-karton-gips/1126-norgips-plyta-gipsowo-kartonowa-standardowa-do-wnetrz-o-normalnej-wilgotnosci-s-gkb-125-mm-typ-a-1200-x-2000-mm-5907651690879.html
  'Płyta gipsowa Norgips GKB typ A 12,5 mm 1200×2000 mm (2,4 m²)': '5907651690879',
  // source: https://sklep.sewera.pl/isover-welna-mineralna-aku-plyta-037-5cm-welna-szklana-p11977
  'Wełna mineralna Isover Aku-Płyta 037, 50 mm (14,4 m²)': '5901644653131',
  // source: https://www.rabdom.pl/pl/p/Sniezka-Eko-Supermal-Emalia-Akrylowa-0%2C8l-Bialy-Mat-A500/13990
  "Śnieżka Supermal akrylowa biały mat 0,8 l": "5903973147756",
  // source: https://sklep.sewera.pl/supermal-emalia-akrylowa-bialy-a300-polpolysk-0-8l-p13608
  "Śnieżka Supermal akrylowa biały półpołysk 0,8 l": "5903973232131",
  // source: https://sklep.sewera.pl/grunt-do-drewna-urekor-d-bialy-0-8l-sniezka-p17330
  "Śnieżka Urekor D grunt do drewna biały 0,8 l": "5903973231684",
  // source: https://sklep.sewera.pl/urekor-s-podklad-antykorozyjny-bialy-0-8-l-sniezka-p11955
  "Śnieżka Urekor S podkład antykorozyjny biały 0,8 l": "5903973228790",
  // source: https://www.abud.pl/product-pol-63790-Dulux-do-drewna-i-metalu-RAPIDRY-Bialy-1L-matowa.html
  "Dulux Rapidry biały mat 1 l": "5904078222379",
  // source: https://sklep.sewera.pl/benzyna-ekstrakcyjna-0-5l-anser-p13691
  "Anser benzyna ekstrakcyjna 0,5 l": "5903231606117",
  // source: https://sklep.sewera.pl/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg-p13308
  'ACRYL-PUTZ ST10 START 5 kg': '5903973104414',
  // source: https://sklep.sewera.pl/papier-scierny-gr-120-arkusz-230x280mm-p6899
  'Klingspor PL 28 C P120, arkusz 230 × 280 mm': '5907560017644',
  // source: https://sklep.sewera.pl/papier-scierny-gr-150-arkusz-230x280mm-p6900
  'Klingspor PL 28 C P150, arkusz 230 × 280 mm': '5907560023553',
  // source: https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903
  'Klingspor PL 28 C P240, arkusz 230 × 280 mm': '5907560039820',
  // source: https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044
  'Blue Dolphin FSH, taśma spoinowa 48 mm × 20 m': '5907758504369',
  // source: https://www.rabdom.pl/pl/p/SOUDAL-SRODEK-DO-USUWANIA-SILIKONU-100ml/12481
  'Soudal Silicone Remover 100 ml': '5411183041899',
  // source: https://realbud.com/pl/p/SOUDAL-SILIKON-SANITARNY-KUCHNIA-LAZIENKA-PLESN-STOP-BIALY-280ml/75056922
  'Soudal Silikon Sanitarny STOP biały 280 ml': '5411183200326',
  "Śnieżka Grunt biała farba podkładowa 5 l": "5903973000235",
  // source: https://www.rabdom.pl/pl/p/Mapei-Kerapoxy-Easy-Design-Uniwersalna-fuga-epoksydowa-3kg-Bialy-100/14527
  'Mapei Kerapoxy Easy Design - Uniwersalna fuga epoksydowa 3kg Biały 100': '8022452132940',
  // source: https://sklep.sewera.pl/atlas-plus-klej-do-plytek-bialy-25kg-p8896
  'Atlas Plus klej do płytek biały 25kg': '5905400313390',
  'Mocowanie umywalki Fischer WST 140 K NV M10×140 (2 mocowania)': '8590369454948',
  'Krzyżyki dystansowe do płytek Hardy 3 mm (150 szt.)': '5905061016869',
  'Krzyżyki dystansowe do płytek Hardy 4 mm (100 szt.)': '5905061016876',
  // source: https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd
  'Glazura ścienna Ceramika Color Tamara white 25×40 cm (1,5 m²)': '5907518303911',
  // source: https://www.castorama.pl/umywalka-cersanit-atlantic-new-50-cm/5901771226987_CAPL.prd
  'Umywalka ścienna Cersanit Atlantic New 50 (50,5 × 40 cm, z otworem i przelewem)': '5901771226987',
  // source: https://www.castorama.pl/drzwi-pelne-opp-archi-80-lewe-biale/5063022524263_CAPL.prd
  'Skrzydło drzwiowe pełne OPP Archi 80 lewe białe (2035 × 844 mm)': '5063022524263',
  // source: https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html
  'Folia paroizolacyjna Conkret Conpar 0,20 mm (100 m²)': '5902096430103',
  'Profil przyścienny Budmat UD27 0,5 mm 3 m':'5907738940163',
  'Podkład pod panele winylowe Corksystem LVT 1,5 mm 6 m²':'5061092900925',
  'Panele winylowe GoodHome SPC Arilla Dark Grey click 2,5 m²':'5059340969756',
  'Panele winylowe klejone (samoprzylepne LVT) GoodHome Ragga Ele Marble 1,3 m²':'5059340802435',
  'Taśma brzegowa dylatacyjna Fola 5 mm × 100 mm × 50 mb':'5906725207227',
  'Parapet wewnętrzny PCV Form 30 × 216 cm biały':'5906725219640',
  'Farba biała mat 10 l':'3663602567240',
  'Farba GoodHome Ściany i Sufit biały mat 10 l':'5059340271620',
  'Gładź pod wałek GW180 gotowa polimerowa 20 kg':'5907418038791',
  'Profil sufitowy Norgips CD60 0,6 mm 3 m':'5907651698899',
  'Klej wysokoelastyczny Atlas Plus odkształcalny 25 kg':'5905400658866',
  'Kompakt WC Cersanit Seno bezkołnierzowy 3/5 l z deską wolnoopadającą':'5902115720833',
  'Przewód YDYp 3×1,5 mm² 450/750 V AKS Zielonka (krąg 100 mb)':'5904617573771',
  'Przewód YDYp 3×2,5 mm² 450/750 V AKS Zielonka (krąg 100 mb)':'5904617573764',
  'Puszka podtynkowa fi60 głęboka łączeniowa z wkrętem Elektro-Plast (10 szt.)':'5901752637337',
  'Tynk gipsowy maszynowy Knauf MP 75 25 kg':'5902367206352',
  'Skrzydło drzwiowe OPP Klasyk 70 białe z podcięciem (przylgowe)':'5063022524034',
  'Baza ościeżnicy regulowana PerfectDoor 80-100 mm prawa dąb sonoma (drzwi wewnętrzne)':'5902659279118',
  'Wężyk przyłączeniowy w oplocie Invena 3/8"×M10 30 cm':'5907798716258',
  'Styropian fasadowy grafitowy Yetico Gamma Passive EPS 033 150 mm (2 m²)': '5902578307268',
  'Styropian fasadowy biały Yetico Gamma Fasada 044 100 mm (3 m²)': '5902578301976',
  'Listwa przypodłogowa MDF biała Krono Original LK100F (2,4 mb)': '5907555424969',
  'Pianka montażowa Soudal Low Expansion pistoletowa zimowa 750 ml': '5411183048522',
  'Zaprawa klejąca do styropianu i siatki Atlas Stopter K-20 2w1 25 kg': '5905400160253',
  "Skrzydło drzwiowe pokojowe Erkado Credis 80 lewe białe przylgowe przeszklone": "5900378219590",
  "Kotwa montażowa do ościeżnic (rama okienna) 10 × 182 mm": "5905458019787",
  "Zawias wkręcany regulowany 3D 14 mm ocynkowany Metro": "5906711270471",
  "Skrzydło drzwiowe pokojowe Erkado Credis 80 białe przylgowe przeszklone": "5900378219590",
  "Panele laminowane Oakland wodoodporne AC4 2.51 m²": "5063022887917",
  "Podkład podłogowy Volden XPS Smart 3 mm 10 m²": "5063022038289",
  "Gres Guigliano GoodHome 1 m²": "3663602870821",
  "Zawór kątowy z filtrem Ferro 1/2\" × 3/8\" (chrom)": "5901095614033",
  "Panele winylowe GoodHome SPC Marvo click 2,235 m²": "5063022676757",
  "Panele laminowane wodoodporne AC5 8 mm Classen Dąb Niasa (1,973 m²/paczka)": "4003992571974",
  "Gres szkliwiony rektyfikowany Paradyż U117 (Ennis) Grey mat 59,8×59,8 cm": "5904584158261",
  "Klamka drzwiowa Schaffner Lucy na rozecie (komplet dwustronny)": "5907467760698",
  "Bateria natryskowa ścienna Ferro One (chrom, BFO7)": "5902194954525",
  "Gniazdo pojedyncze z uziemieniem Kontakt-Simon Basic (białe, BMGZ1Z.01/11)": "5902787568238",
  "Listwa przypodłogowa PCV Arbiton Indo biały połysk 01, 2500 mm": "5905167725719",
  "Listwa przypodłogowa PCV Arbiton Indo 2500 mm": "5905167725719",
  "Klej do wykładzin (winyl/LVT/PCV) Soudal 26A 5 kg": "5411183028395",
  "Płyta gipsowo-kartonowa impregnowana Norgips GKBI typ H2 1200×2600×12,5 mm": "5907651691616",
  "Klipsy montażowe do listew Cezar (25 szt.)": "5907684672217",
  "Kliny montażowe Floorpol 30 x 150 mm, 10 szt. (drewno)": "5907508719289",
  "Bateria umywalkowa stojąca Ferro Stillo (chrom, BSL2)": "5902194929837",
  "Profil progowy aluminiowy Cezar 40 mm srebrny 1 m": "5904584845215",
  "Narożnik tynkarski aluminiowy z siatką 2,5 mb": "5900308102411",
  "Tynk gipsowy ręczny Knauf Goldband 25 kg": "5902367206383",
  "Płyta gipsowo-kartonowa zwykła Norgips GKB typ A 1200×2600×12,5 mm": "5907651690442",
  "Podkład Arbiton XPS Smart Aquastop Thermo 1,6 mm (6 m²)": "5905167826942",
  "Narożnik uszczelniający wewnętrzny Mapei Mapeband W (90°)": "8022452113802",
  "Narożnik uszczelniający zewnętrzny Mapei Mapeband W (270°)": "8022452113789",
  "Mankiet uszczelniający ścienny Mapei Mapeband W 12×12 cm, 2 szt.": "8022452113925",
  "Rura PEX-AL/PEX Tycner 16×2 mm (na metry)": "5901095517976",
  "Syfon umywalkowy butelkowy niski McAlpine WHB1-32 (z membraną)": "5036484088390",
  "Łącznik pojedynczy jednobiegunowy Kontakt-Simon Basic (biały, BMW1.01/11)": "5902787568177",
  "Taśma teflonowa uszczelniająca Tycner 12 mm × 10 m": "5900950618100",
  "Kolanko zaciskowe PEX Tycner 16×16 mm": "5901095521003",
  "Siatka ścierna na rzep GRAPHITE 225 mm K180, 10 szt.": "5902062502735",
  'Farba lateksowa Śnieżka Barwy Natury biała 5 l': '5903973139188',
  'Grunt uniwersalny Knauf 5 l': '5901793357737',
  'Taśma malarska Blue Dolphin niebieska 30 mm x 50 m': '5907758515952',
  'Folia malarska gruba Blue Dolphin 4 x 5 m': '5907758504932',
  'Farba lateksowa Dulux EasyCare Nieskazitelna Biel 9 l': '5904078198759',
  'Gotowa gładź polimerowa Atlas GTA 18 kg': '5905400542509',
  'Gładź gipsowa startowa Acryl-Putz ST10 START 20 kg': '5903973104421',
  'Grunt głęboko penetrujący Atlas Uni-Grunt 5 kg': '5905400520026',
  'Gładź szpachlowa wykończeniowa Acryl-Putz FS20 Finisz 27 kg': '5903973104544',
  'Samopoziomujący podkład podłogowy Atlas SAM 100 25 kg (5–30 mm)': '5905400279245',
  'Samopoziomujący podkład podłogowy Atlas SAM 200 25 kg (25–60 mm)': '5905400279269',
  'Podkład / kontakt pod tynki Atlas Cerplast 15 kg': '5905400530032',
  "Farba lateksowa Śnieżka Eko Plus biała 10 l": "5903973205982",
  "Silikon sanitarny Soudal 280 ml": "5411183157064",
  "Grunt głęboko penetrujący Ceresit CT 17 10 l": "5900089617081",
  "Zaprawa klejowa Ceresit CM 11 25 kg": "5900089111251",
  "Taśma malarska Blue Dolphin niebieska 38 mm x 50 m": "5907758507285",
  "Fuga elastyczna Ceresit CE 40 biała 2 kg": "5900089140015",
  "Farba lateksowa Dekoral Akrylit W śnieżnobiała 5 l": "5904000810681",
  "Piana pistoletowa Tytan Professional 65 niskoprężna 750 ml": "5903518052859",
  "Wkręty samowiercące do płyt g-k do metalu Wkręt-Met 3,5×25 mm (100 szt.)": "5907704499015",
  "Krzyżyki dystansowe do płytek Hardy 2 mm (200 szt.)": "5905061016845",
  "Kołki szybkiego montażu rozporowe Wkręt-Met SM 6×40 mm (20 szt.)": "5907704466031",
  "Wełna mineralna szklana Isover Aku-Płyta 10 cm λ=0,037 (7,2 m²)": "5901644653155",
  "Taśma uszczelniająca Ceresit CL 152, 10 m": "5900089115211",
  "Fuga ceramiczna Atlas 001 biała 2 kg": "5905400572254",
  "Folia w płynie (masa hydroizolacyjna 1-składnikowa) Atlas Woder E 15 kg": "5905400514506",
  "Zaprawa samopoziomująca Ceresit CN 72 25 kg (1–20 mm)": "5900089272259",
  "Hydroizolacja 2-składnikowa elastyczna Atlas Woder Duo 16 kg": "5905400195088",
  "Silikon uniwersalny Soudal 280 ml bezbarwny": "5411183157552",
  "Kołek fasadowy z trzpieniem stalowym Koelner KI-200M 10 × 200 mm (250 szt.)": "5906675212647",
  "Tynk cienkowarstwowy silikatowo-silikonowy Ceresit CT 174 baranek 1,5 mm baza biała 25 kg": "9000101109733",
  "Tynk cementowo-wapienny maszynowy Baumit MPI 25 30 kg": "5907534261158",
  "Akryl uniwersalny Soudal biały 280 ml (malowalny)": "5411183157538",
  "Siatka zbrojąca z włókna szklanego Atlas 150 g/m² (rolka 50 m²)": "5905400196993",
  "Klej-uszczelniacz hybrydowy Soudal Fix All High Tack 290 ml biały": "5411183045620",
  "Zestaw przyłączeniowo-mocujący WC Tycner (rury, uszczelki i akcesoria)": "5901095514395",
  "Taśma paroszczelna okienna Soudal SWS Basic Plus Inside 90 mm × 30 m": "5411183151178",
  "Szybkozłączka uniwersalna WAGO 221-413 3×0,2-4 mm² (1 szt.)": "4050821808442",
  "Profil narożny do glazury Cezar aluminiowy 8 mm, tytan szczotkowany mat, 2,5 m": "5904584853500",
  "Mapei Mapegum WPS — folia w płynie 5 kg": "8022452002113",
  "Mapei Mapegum WPS — folia w płynie 10 kg": "8022452002120",
  "Mapei Mapegum WPS — folia w płynie 20 kg": "8022452242502",
  "Mapei Mapeband W — taśma uszczelniająca 120 mm × 10 m": "8022452113932",
  "Mapei Mapeband W — mankiet podłogowy 300 × 300 mm (1 szt.)": "8022452113895",
  "Mapei Primer G Pro — koncentrat gruntujący 1 l": "8022452241123",
  "Mapei Primer G Pro — koncentrat gruntujący 5 l": "8022452241130",
  "Arbiton INDO biały połysk 01 — narożniki wewnętrzne (2 szt.)": "5905167726037",
  "Arbiton INDO biały połysk 01 — narożniki zewnętrzne (2 szt.)": "5905167726198",
  "Arbiton INDO biały połysk 01 — łączniki (2 szt.)": "5905167725870",
  "Arbiton INDO biały połysk 01 — zakończenia lewe + prawe (1 para)": "5905167726358",
  "Arbiton Strongman — klej montażowy 300 ml": "5905167788264",
};
