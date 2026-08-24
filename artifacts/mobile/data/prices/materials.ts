import type { MaterialPriceReference } from '@/types/pricing';

export const MATERIAL_PRICES: readonly MaterialPriceReference[] = [
  {
    id: 'mat-paint-economy-white-10l',
    materialType: 'paint',
    productLabel: 'Farba biała mat 10 l',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 54.98,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-biala-mat-10-l/3663602567240_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-paint-standard-white-10l',
    materialType: 'paint',
    productLabel: 'Farba GoodHome Ściany i Sufit biały mat 10 l',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 62.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-goodhome-sciany-i-sufit-bialy-mat-10-l/5059340271620_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-paint-better-white-10l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Śnieżka Eko Plus biała 10 l',
    brand: 'Śnieżka',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 108.0,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-lateksowa-sniezka-eko-plus-biala-10-l/5903973205982_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-universal-primer-5l',
    materialType: 'primer',
    productLabel: 'Grunt uniwersalny Knauf 5 l',
    brand: 'Knauf',
    packageSize: 5,
    packageUnit: 'l',
    pricePerPackage: 35.48,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-skim-coat-economy-20kg',
    materialType: 'skim-coat',
    productLabel: 'Gładź pod wałek GW180 gotowa polimerowa 20 kg',
    packageSize: 20,
    packageUnit: 'kg',
    pricePerPackage: 38.68,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/gladz-pod-walek-gw180-20-kg/5907418038791_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-skim-coat-standard-18kg',
    materialType: 'skim-coat',
    productLabel: 'Gotowa gładź polimerowa Atlas GTA 18 kg',
    brand: 'Atlas',
    packageSize: 18,
    packageUnit: 'kg',
    pricePerPackage: 69.78,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/gotowa-gladz-polimerowa-atlas-gta-18-kg/5905400542509_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-laminate-oakland-ac4',
    materialType: 'laminate',
    productLabel: 'Panele laminowane Oakland wodoodporne AC4 2.51 m²',
    packageSize: 2.51,
    packageUnit: 'm2',
    pricePerPackage: 67.72,
    pricePerM2: 26.98,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/panele-laminowane-oakland-wodoodporne-ac4-2-51-m2/5063022887917_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-underlay-volden-xps-10m2',
    materialType: 'underlay',
    productLabel: 'Podkład podłogowy Volden XPS Smart 3 mm 10 m²',
    brand: 'Volden',
    packageSize: 10,
    packageUnit: 'm2',
    pricePerPackage: 74.8,
    pricePerM2: 6.98,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/podklad-podlogowy-pod-panele-laminowane-volden-xps-smart-3-mm-10-m2/5063022038289_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-skirting-arbiton-2500',
    materialType: 'skirting',
    productLabel: 'Listwa przypodłogowa PCV Arbiton Indo 2500 mm',
    brand: 'Arbiton',
    packageSize: 2.5,
    packageUnit: 'mb',
    pricePerPackage: 32.98,
    pricePerMb: 12.79,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/listwa-przypodlogowa-pcv-arbiton-indo-26-x-70-x-2500-mm-bialy-polysk/5905167725719_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-gres-guigliano-1m2',
    materialType: 'tile',
    productLabel: 'Gres Guigliano GoodHome 1 m²',
    packageSize: 1,
    packageUnit: 'm2',
    pricePerPackage: 73.98,
    pricePerM2: 69.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/gres-mrozoodporny-szkliwiony-guigliano-goodhome-18-5-x-59-8-cm-beige-1-m2/3663602870821_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-tile-adhesive-buildfix-25kg',
    materialType: 'adhesive',
    productLabel: 'Klej wysokoelastyczny Atlas Plus odkształcalny 25 kg',
    brand: 'Atlas',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 63.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },
  {
    id: 'mat-sanitary-silicone-soudal-280ml',
    materialType: 'silicone',
    productLabel: 'Silikon sanitarny Soudal 280 ml',
    brand: 'Soudal',
    packageSize: 280,
    packageUnit: 'ml',
    pricePerPackage: 19.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Materiały markowe w kategoriach dotąd pokrytych tylko markami własnymi ---
  // Dodane, by nakładka EAN (api-server/src/lib/ean-overlay.ts) miała realne
  // materiały do powiązania z potwierdzonymi kodami (marki własne sklepów są
  // jednosklepowe, więc nie spełniają reguły „≥2 niezależne źródła"). Każda cena
  // i EAN mają ≥2 źródła (sklep PL) w komentarzach `// source:`. Materiały NIE są
  // mapowane do żadnego joba (JOB_MATERIAL_MAPPINGS), więc nie zmieniają istniejących
  // wycen — służą jako pozycje katalogowe do dopięcia ofert z feedów po EAN.

  // Grunt głęboko penetrujący Atlas Uni-Grunt 5 kg — EAN 5905400520026.
  // source: https://www.castorama.pl/grunt-gleboko-penetrujacy-atlas-uni-grunt-5-kg/5905400520026_CAPL.prd (EAN + cena 44,98 zł)
  // source: https://www.abud.pl/product-pol-1121-Preparat-gruntujacy-Atlas-Uni-Grunt-5kg.html (Kod EAN 5905400520026)
  {
    id: 'mat-primer-deep-atlas-unigrunt-5kg',
    materialType: 'primer',
    productLabel: 'Grunt głęboko penetrujący Atlas Uni-Grunt 5 kg',
    brand: 'Atlas',
    packageSize: 5,
    packageUnit: 'kg',
    pricePerPackage: 44.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/grunt-gleboko-penetrujacy-atlas-uni-grunt-5-kg/5905400520026_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Grunt głęboko penetrujący Ceresit CT 17 10 l — EAN 5900089617081.
  // source: https://bat.pl/Grunt-gleboko-penetrujacy-CT-17-10l-Ceresit/ct17-10-x (EAN 5900089617081)
  // source: https://chemko.com.pl/ceresit-ct-17-grunt-gleboko-penetrujacy-10l,3,104317,1304 (EAN 5900089617081)
  // source: https://www.bricoman.pl/grunt-gleboko-penetrujacy-ceresit-ct17-10l-20914943.html (cena 99,95 zł)
  {
    id: 'mat-primer-deep-ceresit-ct17-10l',
    materialType: 'primer',
    productLabel: 'Grunt głęboko penetrujący Ceresit CT 17 10 l',
    brand: 'Ceresit',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 99.95,
    category: 'standard',
    storeName: 'Bricoman',
    sourceUrl:
      'https://www.bricoman.pl/grunt-gleboko-penetrujacy-ceresit-ct17-10l-20914943.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Fuga elastyczna Ceresit CE 40 biała 2 kg — EAN 5900089140015.
  // source: https://www.castorama.pl/fuga-elastyczna-ceresit-ce-40-aquastatic-biala-2-kg-id-3973.html (EAN + cena 41,98 zł)
  // source: https://chemko.com.pl/chemko-fuga-ceresit-ce40-biala-white-01-2-kg,3,46935,1597 (EAN 5900089140015)
  {
    id: 'mat-grout-ceresit-ce40-white-2kg',
    materialType: 'grout',
    productLabel: 'Fuga elastyczna Ceresit CE 40 biała 2 kg',
    brand: 'Ceresit',
    packageSize: 2,
    packageUnit: 'kg',
    pricePerPackage: 41.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/fuga-elastyczna-ceresit-ce-40-aquastatic-biala-2-kg-id-3973.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Zaprawa klejowa Ceresit CM 11 25 kg — EAN 5900089111251.
  // source: https://mrowka.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html (EAN + cena 39,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html (EAN 5900089111251)
  {
    id: 'mat-tile-adhesive-ceresit-cm11-25kg',
    materialType: 'adhesive',
    productLabel: 'Zaprawa klejowa Ceresit CM 11 25 kg',
    brand: 'Ceresit',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 39.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Klej-uszczelniacz hybrydowy Soudal Fix All High Tack 290 ml biały — EAN 5411183175723.
  // source: https://mrowka.com.pl/produkt/klej-uszczelniacz-hybrydowy-fix-all-high-tack-290-ml-bialy-soudal-5411183175723.html (EAN + cena 24,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/klej-uszczelniacz-hybrydowy-fix-all-high-tack-290-ml-bialy-soudal-5411183175723.html (EAN 5411183175723)
  {
    id: 'mat-mounting-adhesive-soudal-fixall-290ml',
    materialType: 'mounting-adhesive',
    productLabel: 'Klej-uszczelniacz hybrydowy Soudal Fix All High Tack 290 ml biały',
    brand: 'Soudal',
    packageSize: 290,
    packageUnit: 'ml',
    pricePerPackage: 24.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/klej-uszczelniacz-hybrydowy-fix-all-high-tack-290-ml-bialy-soudal-5411183175723.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Gładź szpachlowa wykończeniowa Acryl-Putz FS20 Finisz 27 kg — EAN 5903973104544.
  // source: https://mrowka.com.pl/produkt/gladz-szpachlowa-finisz-fs20-27-kg-acryl-putz-5903973104544.html (EAN + cena 83,99 zł)
  // source: https://mrowkaonline.pl/bilgoraj/gisy-i-gladzie/57866-acryl-putz-fs20-finisz-27kg-5903973104544.html (EAN 5903973104544)
  {
    id: 'mat-skim-coat-acrylputz-fs20-27kg',
    materialType: 'skim-coat',
    productLabel: 'Gładź szpachlowa wykończeniowa Acryl-Putz FS20 Finisz 27 kg',
    brand: 'Śnieżka',
    packageSize: 27,
    packageUnit: 'kg',
    pricePerPackage: 83.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/gladz-szpachlowa-finisz-fs20-27-kg-acryl-putz-5903973104544.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Piana pistoletowa Tytan Professional 65 niskoprężna 750 ml — EAN 5903518052859.
  // source: https://mrowka.com.pl/produkt/piana-pistoletowa-65-750-ml-tytan-professional-5903518052859.html (EAN + cena 40,99 zł)
  // source: https://www.unimet.pl/piany-i-kleje-43/331828-pianka-pistoletowa-tytan-65-750ml-02-niskoprezna-5903518052859.html (EAN 5903518052859)
  {
    id: 'mat-foam-tytan-pro65-750ml',
    materialType: 'foam',
    productLabel: 'Piana pistoletowa Tytan Professional 65 niskoprężna 750 ml',
    brand: 'Tytan',
    packageSize: 750,
    packageUnit: 'ml',
    pricePerPackage: 40.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/piana-pistoletowa-65-750-ml-tytan-professional-5903518052859.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Folia malarska gruba Blue Dolphin 4 x 5 m — EAN 5907758504932.
  // source: https://mrowka.com.pl/produkt/folia-malarska-gruba-4-x-5-m-blue-dolphin-5907758504932.html (EAN + cena 10,99 zł)
  // source: https://buduj24.pl/folie-malarskie/folia-malarska-gruba-blue-dolphin-4m-x-5m (EAN 5907758504932)
  {
    id: 'mat-protective-film-bluedolphin-4x5m',
    materialType: 'protective-film',
    productLabel: 'Folia malarska gruba Blue Dolphin 4 x 5 m',
    brand: 'Blue Dolphin',
    packageSize: 20,
    packageUnit: 'm2',
    pricePerPackage: 10.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/folia-malarska-gruba-4-x-5-m-blue-dolphin-5907758504932.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Taśma malarska Blue Dolphin niebieska 38 mm x 50 m — EAN 5907758507285.
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd (EAN + cena 27,55 zł)
  // source: https://sklep.greinplastplus.pl/narzedzia-malarskie/731-blue-dolphin-papierowa-tasma-malarska-38mm-x-50m-niebieska--5907758507285.html (EAN 5907758507285)
  {
    id: 'mat-masking-tape-bluedolphin-38mm',
    materialType: 'masking-tape',
    productLabel: 'Taśma malarska Blue Dolphin niebieska 38 mm x 50 m',
    brand: 'Blue Dolphin',
    packageSize: 50,
    packageUnit: 'mb',
    pricePerPackage: 27.55,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Malowanie ścian: markowe farby i akcesoria z realnym EAN ---------------
  // Flagowy etap „malowanie ścian" miał dotąd farby economy/standard bez EAN
  // (generic „Farba biała mat", GoodHome — zostają w katalogu, ID nie ruszamy).
  // Dodajemy markowe produkty z realnym, ≥2-źródłowym EAN dla pełnych tierów
  // economy/standard/better + gładź startową i taśmę 30 mm. Ceny brutto ze sklepu
  // PL, packageSize/packageUnit z opakowania handlowego. Każdy EAN wpisany też do
  // MATERIAL_EAN_OVERLAY (api-server) → seed:offers/feed dopina realne oferty.
  // DOKŁADNIE jedna farba na tier w mappings.ts (inaczej engine podwoi ilość).
  // UWAGA: świadomie NIE dodajemy tu Śnieżki Eko 10 l — jej EAN 5903973005797 to
  // zarezerwowany demo-EAN fixture (guard w seed-catalog.test.ts zabrania go w
  // nakładce). Grunt głęboko penetrujący i folia malarska już są w katalogu z EAN.

  // Farba lateksowa Dekoral Akrylit W śnieżnobiała 5 l — EAN 5904000810681
  // (economy, odporna na szorowanie, wyd. 14 m²/l). Cena 59,90 zł (PSB Lobo).
  // source: https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502 (OBI — dostępność wariantu 5 l)
  // source: https://eadamex.pl/farby-biale/7178-farba-dekoral-akrylit-w-5l-snieznobiala-lateksowa-do-scian-i-sufitow-5904000810681.html (EAN 5904000810681)
  {
    id: 'mat-paint-latex-dekoral-akrylit-w-white-5l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Dekoral Akrylit W śnieżnobiała 5 l',
    brand: 'Dekoral',
    packageSize: 5,
    packageUnit: 'l',
    pricePerPackage: 59.90,
    category: 'economy',
    storeName: 'OBI',
    sourceUrl:
      'https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Farba lateksowa Dulux EasyCare Nieskazitelna Biel 9 l — EAN 5904078198759
  // (better, plamoodporna hydrofobowa, wyd. 14 m²/l). Największe wiadro Dulux to 9 l.
  // source: https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd (EAN + cena 228 zł)
  // source: https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/65684-dulux-easy-care-nieskazitelna-biel-9l-5904078198759.html (EAN 5904078198759)
  {
    id: 'mat-paint-latex-dulux-easycare-white-9l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Dulux EasyCare Nieskazitelna Biel 9 l',
    brand: 'Dulux',
    packageSize: 9,
    packageUnit: 'l',
    pricePerPackage: 228.0,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Farba lateksowa Śnieżka Barwy Natury biała (173) 5 l — EAN 5903973139188
  // (standard, matowa lateksowa, odporna na szorowanie).
  // source: https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd (EAN + cena 118 zł)
  // source: https://mrowka.com.pl/produkt/farba-barwy-natury-bialy-173-5l-sniezka-5903973139188.html (EAN 5903973139188)
  {
    id: 'mat-paint-latex-sniezka-barwy-natury-white-5l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Śnieżka Barwy Natury biała 5 l',
    brand: 'Śnieżka',
    packageSize: 5,
    packageUnit: 'l',
    pricePerPackage: 118.0,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Gładź gipsowa startowa Śnieżka Acryl-Putz ST10 START 20 kg — EAN 5903973104421
  // (start pod gładź finiszową/malowanie; wariant startowy, FS20 to finisz — patrz wyżej).
  // source: https://mrowka.com.pl/produkt/gladz-szpachlowa-start-st10-20-kg-acryl-putz-5903973104421.html (EAN + cena 42,99 zł)
  // source: https://www.bricoman.pl/sniezka-acryl-putz-gladz-szpachlowa-start-20kg-271943.html (EAN 5903973104421, cena 41,35 zł)
  {
    id: 'mat-skim-coat-acrylputz-st10-20kg',
    materialType: 'skim-coat',
    productLabel: 'Gładź gipsowa startowa Acryl-Putz ST10 START 20 kg',
    brand: 'Śnieżka',
    packageSize: 20,
    packageUnit: 'kg',
    pricePerPackage: 42.99,
    category: 'economy',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/gladz-szpachlowa-start-st10-20-kg-acryl-putz-5903973104421.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Taśma malarska Blue Dolphin niebieska 30 mm x 50 m — EAN 5907758515952
  // (węższy wariant obok 38 mm — do wąskich profili/krawędzi).
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-30mm-x-50m/5907758515952_CAPL.prd (EAN + cena 25,17 zł)
  // source: https://mrowkaonline.pl/bilgoraj/tasmy-malarskie/46729-xl-tape-tasma-malarska-mt-pg-sbl-30mmx50m-928-niebieska-papierowa-5907758515952.html (EAN 5907758515952)
  {
    id: 'mat-masking-tape-bluedolphin-30mm',
    materialType: 'masking-tape',
    productLabel: 'Taśma malarska Blue Dolphin niebieska 30 mm x 50 m',
    brand: 'Blue Dolphin',
    packageSize: 50,
    packageUnit: 'mb',
    pricePerPackage: 25.17,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-30mm-x-50m/5907758515952_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // --- Sucha zabudowa GK: płyta, profile, wełna, wkręty, kołki -----------------
  // Duże pozycje wprost brakujące w katalogu (patrz mappings.ts: „płyta GK,
  // profile, wełna nie są jeszcze w katalogu"). Każdy materiał markowy z realnym
  // EAN (≥2 niezależne źródła w komentarzach `// source:`) → EAN wpisany też do
  // MATERIAL_EAN_OVERLAY (api-server), więc seed:offers dopina oferty z feedów.
  // Ceny brutto ze sklepu PL, packageSize/packageUnit z opakowania handlowego.

  // Płyta gipsowo-kartonowa zwykła Norgips GKB typ A 1200×2600×12,5 mm — EAN 5907651690442.
  // Karton = 1,2 m × 2,6 m = 3,12 m²/szt. Cena 34,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html (EAN + cena 34,99 zł)
  // source: https://www.castorama.pl/plyta-gipsowo-kartonowa-zwykla-1200-x-2600-x-12-5-mm-gkb-typ-a-norgips/5907651690442_CAPL.prd (EAN 5907651690442)
  // source: https://www.grupapsb.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html (EAN 5907651690442)
  {
    id: 'mat-gypsum-board-norgips-gkb-a-1200x2600',
    materialType: 'gypsum-board',
    productLabel: 'Płyta gipsowo-kartonowa zwykła Norgips GKB typ A 1200×2600×12,5 mm',
    brand: 'Norgips',
    packageSize: 3.12,
    packageUnit: 'm2',
    pricePerPackage: 34.99,
    pricePerM2: 11.22,
    category: 'economy',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Płyta gipsowo-kartonowa impregnowana (wodoodporna) Norgips GKBI typ H2 1200×2600×12,5 mm — EAN 5907651691616.
  // Karton 3,12 m²/szt. Cena 49,99 zł/szt (Mrówka). Do pomieszczeń wilgotnych.
  // source: https://mrowka.com.pl/produkt/plyta-gkbi-12-5x1200x2600-mm-woda-norgips-5907651691616.html (EAN + cena 49,99 zł)
  // source: https://www.castorama.pl/plyta-gipsowo-kartonowa-impregnowana-1200-x-2600-x-12-5-mm-gkbi-typ-h2-norgips/5907651691616_CAPL.prd (EAN 5907651691616)
  // source: https://www.leroymerlin.pl/produkty/plyta-gipsowa-impregnowana-gkbi-typ-h2-2600-x-1200-x-12-5-mm-norgips-41703172.html (EAN 5907651691616)
  {
    id: 'mat-gypsum-board-norgips-gkbi-h2-1200x2600',
    materialType: 'gypsum-board',
    productLabel: 'Płyta gipsowo-kartonowa impregnowana Norgips GKBI typ H2 1200×2600×12,5 mm',
    brand: 'Norgips',
    packageSize: 3.12,
    packageUnit: 'm2',
    pricePerPackage: 49.99,
    pricePerM2: 16.02,
    category: 'better',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/plyta-gkbi-12-5x1200x2600-mm-woda-norgips-5907651691616.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Profil sufitowy (nośny) Norgips CD60 0,6 mm 3 m — EAN 5907651698899. Cena 11,98 zł/szt (Castorama).
  // source: https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd (EAN + cena 11,98 zł)
  // source: https://www.leroymerlin.pl/produkty/profil-sufitowy-cd60-3-m-b-norgips-42286972.html (EAN 5907651698899)
  {
    id: 'mat-profile-cd60-norgips-3m',
    materialType: 'profile',
    productLabel: 'Profil sufitowy Norgips CD60 0,6 mm 3 m',
    brand: 'Norgips',
    packageSize: 3,
    packageUnit: 'mb',
    pricePerPackage: 11.98,
    pricePerMb: 3.99,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Profil przyścienny (obwodowy) Budmat UD27 0,5 mm 3 m — EAN 5907738940163. Cena 7,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/profil-sufitowy-ud27-0-50-mm-3-m-budmat-plock-5907738940163.html (EAN + cena 7,99 zł)
  // source: https://www.castorama.pl/profil-sufitowy-budmat-ud27-3-m/5907738940163_CAPL.prd (EAN 5907738940163)
  {
    id: 'mat-profile-ud27-budmat-3m',
    materialType: 'profile',
    productLabel: 'Profil przyścienny Budmat UD27 0,5 mm 3 m',
    brand: 'Budmat',
    packageSize: 3,
    packageUnit: 'mb',
    pricePerPackage: 7.99,
    pricePerMb: 2.66,
    category: 'economy',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/profil-sufitowy-ud27-0-50-mm-3-m-budmat-plock-5907738940163.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Wełna mineralna szklana Isover Aku-Płyta 10 cm λ=0,037 W/mK — EAN 5901644653155. Opakowanie 7,2 m², 172 zł (Bricoman).
  // source: https://bat.pl/Welna-Isover-Aku-plyta-10cm-7.2m2/101220014 (EAN 5901644653155)
  // source: https://eadamex.pl/sciany-dzialowe/4924-welna-mineralna-isover-aku-plyta-10cm-0037w-mk-720m2-20szt-pal-5901644653155.html (EAN 5901644653155)
  // source: https://www.bricoman.pl/isover-aku-plyta-welna-mineralna-szklana-10-cm-7-2-m2-877954.html (cena 172 zł / 7,2 m²)
  {
    id: 'mat-mineral-wool-isover-akuplyta-10cm',
    materialType: 'mineral-wool',
    productLabel: 'Wełna mineralna szklana Isover Aku-Płyta 10 cm λ=0,037 (7,2 m²)',
    brand: 'Isover',
    packageSize: 7.2,
    packageUnit: 'm2',
    pricePerPackage: 172.00,
    pricePerM2: 23.89,
    category: 'standard',
    storeName: 'Bricoman',
    sourceUrl:
      'https://www.bricoman.pl/isover-aku-plyta-welna-mineralna-szklana-10-cm-7-2-m2-877954.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Wkręty samowiercące do płyt g-k do metalu Wkręt-Met 3,5×25 mm, 100 szt. — EAN 5907704499015. Cena 12,99 zł/op (Mrówka).
  // source: https://mrowka.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html (EAN + cena 12,99 zł, 100 szt.)
  // source: https://www.grupapsb.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html (EAN 5907704499015)
  {
    id: 'mat-drywall-screws-wkretmet-35x25-100',
    materialType: 'screws',
    productLabel: 'Wkręty samowiercące do płyt g-k do metalu Wkręt-Met 3,5×25 mm (100 szt.)',
    brand: 'Wkręt-Met',
    packageSize: 100,
    packageUnit: 'szt',
    pricePerPackage: 12.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Kołki szybkiego montażu rozporowe Wkręt-Met SM 6×40 mm, 20 szt. — EAN 5907704466031. Cena 6,00 zł/op (Mrówka).
  // source: https://mrowka.com.pl/produkt/kolki-szybkiego-montazu-6x40-blister-wkret-met-5907704466031.html (EAN + cena 6,00 zł, 20 szt.)
  // source: https://eldor24.pl/kolki-do-szybkiego-montazu/kolki-szybkiego-montazu-rozporowe-sm-6x40-20-sztuk-blister-wkret-met (EAN 5907704466031)
  {
    id: 'mat-quick-dowels-wkretmet-sm-6x40-20',
    materialType: 'dowels',
    productLabel: 'Kołki szybkiego montażu rozporowe Wkręt-Met SM 6×40 mm (20 szt.)',
    brand: 'Wkręt-Met',
    packageSize: 20,
    packageUnit: 'szt',
    pricePerPackage: 6.00,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/kolki-szybkiego-montazu-6x40-blister-wkret-met-5907704466031.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Instalacja wodna / hydraulika: armatura, rury, złączki, uszczelnienia ----
  // Materiały etapu łazienki/kuchni brakujące w katalogu (baterie, syfon, rura,
  // kolanko, wężyk, taśma teflonowa). Każdy markowy, z realnym EAN potwierdzonym
  // w ≥2 niezależnych źródłach (komentarze `// source:`) → EAN wpisany też do
  // MATERIAL_EAN_OVERLAY (api-server), więc seed:offers dopina oferty z feedów.
  // Ceny brutto ze sklepu PL, packageSize/packageUnit z opakowania handlowego.

  // Bateria umywalkowa stojąca Ferro Stillo BSL2 chrom — EAN 5902194929837. Cena 194,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/bateria-umywalkowa-stillo-stojaca-ferro-5902194929837.html (EAN + cena 194,99 zł)
  // source: https://onninen.pl/produkt/FERRO-STILLO-bateria-umywalkowa-stojaca-chrom-BSL2,113316 (EAN 5902194929837, model BSL2)
  // source: https://www.ceneo.pl/44139801 (Ferro Stillo BSL2A, EAN 5902194929837)
  {
    id: 'mat-basin-mixer-ferro-stillo',
    materialType: 'faucet',
    productLabel: 'Bateria umywalkowa stojąca Ferro Stillo (chrom, BSL2)',
    brand: 'Ferro',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 194.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/bateria-umywalkowa-stillo-stojaca-ferro-5902194929837.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Bateria natryskowa (prysznicowa) ścienna Ferro One BFO7 chrom — EAN 5902194954525. Cena 193,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/bateria-natryskowa-scienna-ferro-one-ferro-5902194954525.html (EAN + cena 193,99 zł)
  // source: https://www.123lazienka.pl/produkt/23292-ferro-one-bateria-natryskowa-bez-natrysku-chrom-bfo7-5902194954525.html (EAN 5902194954525, model BFO7)
  // source: https://onninen.pl/produkt/FERRO-FERRO-ONE-bateria-natryskowa-bez-natrysku-chrom-BFO7,432032 (EAN 5902194954525)
  {
    id: 'mat-shower-mixer-ferro-one',
    materialType: 'faucet',
    productLabel: 'Bateria natryskowa ścienna Ferro One (chrom, BFO7)',
    brand: 'Ferro',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 193.99,
    category: 'better',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/bateria-natryskowa-scienna-ferro-one-ferro-5902194954525.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Syfon umywalkowy butelkowy niski McAlpine WHB1-32 (z membraną silikonową, 5/4"×32) — EAN 5036484088390. Cena 104,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/syfon-umywalkowy-1-1-4x32-mm-z-membrana-silikonowa-i-rewizja-mcalpine-5036484088390.html (EAN + cena 104,99 zł)
  // source: https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/ (model WHB1-32, EAN 5036484088390)
  // source: https://www.blu.com.pl/syfony-i-polsyfony-do-umywalek/29748-mcalpine-whb1-32-5036484088390.html (EAN 5036484088390)
  {
    id: 'mat-basin-trap-mcalpine-whb1-32',
    materialType: 'trap',
    productLabel: 'Syfon umywalkowy butelkowy niski McAlpine WHB1-32 (z membraną)',
    brand: 'McAlpine',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 104.99,
    category: 'better',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/syfon-umywalkowy-1-1-4x32-mm-z-membrana-silikonowa-i-rewizja-mcalpine-5036484088390.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Rura wielowarstwowa PEX-AL/PEX Tycner 16×2 mm — EAN 5901095517976. Sprzedawana na metry (rolka 200 mb), cena 4,99 zł/mb (Mrówka).
  // source: https://mrowka.com.pl/produkt/rura-pex-al-pex-16-mmx2-200-mb-tycner-5901095517976.html (EAN + cena 4,99 zł/mb)
  // source: https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990 (EAN 5901095517976, sprzedaż na mb)
  {
    id: 'mat-pex-pipe-tycner-16x2',
    materialType: 'pipe',
    productLabel: 'Rura PEX-AL/PEX Tycner 16×2 mm (na metry)',
    brand: 'Tycner',
    packageSize: 1,
    packageUnit: 'mb',
    pricePerPackage: 4.99,
    pricePerMb: 4.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/rura-pex-al-pex-16-mmx2-200-mb-tycner-5901095517976.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Kolanko (kolano) zaciskowe PEX Tycner 16×16 mm — EAN 5901095521003. Cena 12,99 zł/szt (Mrówka).
  // source: https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html (EAN + cena 12,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html (EAN 5901095521003)
  {
    id: 'mat-pex-elbow-tycner-16x16',
    materialType: 'fitting',
    productLabel: 'Kolanko zaciskowe PEX Tycner 16×16 mm',
    brand: 'Tycner',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 12.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Wężyk przyłączeniowy w oplocie ze stali nierdzewnej Invena 3/8"×M10 30 cm — EAN 5907798716258. Cena 37,17 zł/szt (Castorama).
  // source: https://www.castorama.pl/departments/w-w-yk-przy-czeniowy-do-baterii-gw-gz-3-8-x-m10-30-cm-oplot-invena-1-szt-/5907798716258_CAPL.prd (EAN + cena 37,17 zł)
  // source: https://www.obi.pl/weze-elastyczne-flex/invena-wezyk-w-oplocie-z-gw-gz-3-8-w-x-m10-30-cm/p/4355574 (EAN 5907798716258)
  {
    id: 'mat-hose-braided-invena-3-8-30',
    materialType: 'hose',
    productLabel: 'Wężyk przyłączeniowy w oplocie Invena 3/8"×M10 30 cm',
    brand: 'Invena',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 37.17,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/departments/w-w-yk-przy-czeniowy-do-baterii-gw-gz-3-8-x-m10-30-cm-oplot-invena-1-szt-/5907798716258_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Taśma teflonowa uszczelniająca Tycner 12 mm × 10 m × 0,075 mm — EAN 5900950618100. Cena 12,99 zł/szt (OBI).
  // source: https://www.obi.pl/uszczelki-miekkie/tycner-tasma-uszczelniajaca-teflonowa-12-x-0-075-mm-10-m/p/3499589 (EAN + cena 12,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/tasma-teflonowa-12-mm-x-10-m-x-0-075-mm-tycner.html (EAN 5900950618100)
  {
    id: 'mat-teflon-tape-tycner-12mm',
    materialType: 'sealing-tape',
    productLabel: 'Taśma teflonowa uszczelniająca Tycner 12 mm × 10 m',
    brand: 'Tycner',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 12.99,
    category: 'economy',
    storeName: 'OBI',
    sourceUrl:
      'https://www.obi.pl/uszczelki-miekkie/tycner-tasma-uszczelniajaca-teflonowa-12-x-0-075-mm-10-m/p/3499589',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Instalacja elektryczna: przewody, gniazdka, włączniki, puszki, złączki ----
  // Materiały etapu elektrycznego (wymiana/montaż gniazdek, włączników, opraw)
  // brakujące w katalogu. Każdy markowy, z realnym EAN potwierdzonym w ≥2
  // niezależnych źródłach (komentarze `// source:`) → EAN wpisany też do
  // MATERIAL_EAN_OVERLAY (api-server), więc seed:offers dopina oferty z feedów.
  // Ceny brutto ze sklepu PL z listy akceptowanej, packageSize/packageUnit z
  // opakowania handlowego (przewody = krąg 100 mb; drobnica = szt/opak.).

  // Przewód instalacyjny płaski YDYp 3×1,5 mm² 450/750 V AKS Zielonka, krąg 100 mb — EAN 5904617573771. Cena 375 zł/100 mb (3,75 zł/mb, Castorama).
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd (EAN + cena 375 zł)
  // source: https://www.gotronik.pl/przewod-aks-zielonka-ydyp-3-x-1-5mm2-450750-v-100mb-p-9372.html (EAN 5904617573771, model 816900)
  // source: https://www.abud.pl/product-pol-50450-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x1-5-100m.html (AKS Zielonka YDYp 3x1,5 100m)
  {
    id: 'mat-wire-ydyp-3x15-akszielonka-100m',
    materialType: 'wire',
    productLabel: 'Przewód YDYp 3×1,5 mm² 450/750 V AKS Zielonka (krąg 100 mb)',
    brand: 'AKS Zielonka',
    packageSize: 100,
    packageUnit: 'mb',
    pricePerPackage: 375.00,
    pricePerMb: 3.75,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Przewód instalacyjny płaski YDYp 3×2,5 mm² 450/750 V AKS Zielonka, krąg 100 mb — EAN 5904617573764. Cena 572 zł/100 mb (5,72 zł/mb, Castorama).
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd (EAN + cena 572 zł)
  // source: https://www.ceneo.pl/57270631 (AKS Zielonka YDYp 3x2,5 100 mb, EAN 5904617573764)
  // source: https://www.abud.pl/product-pol-50414-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-100m.html (AKS Zielonka YDYp 3x2,5 100m)
  {
    id: 'mat-wire-ydyp-3x25-akszielonka-100m',
    materialType: 'wire',
    productLabel: 'Przewód YDYp 3×2,5 mm² 450/750 V AKS Zielonka (krąg 100 mb)',
    brand: 'AKS Zielonka',
    packageSize: 100,
    packageUnit: 'mb',
    pricePerPackage: 572.00,
    pricePerMb: 5.72,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Gniazdo pojedyncze z uziemieniem i przesłonami styków Kontakt-Simon Basic BMGZ1Z.01/11 białe — EAN 5902787568238. Cena 17,56 zł/szt (Castorama).
  // source: https://www.castorama.pl/departments/gniazdo-pojedyncze-kontakt-simon-basic-z-ochron-styk-w-bia-e-1-szt-/5902787568238_CAPL.prd (EAN + cena 17,56 zł)
  // source: https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przeslonami-do-ramki-biale-bmgz1z0111-5902787568238.html (EAN 5902787568238, model BMGZ1Z.01/11)
  {
    id: 'mat-socket-simon-basic-bmgz1z',
    materialType: 'socket',
    productLabel: 'Gniazdo pojedyncze z uziemieniem Kontakt-Simon Basic (białe, BMGZ1Z.01/11)',
    brand: 'Kontakt-Simon',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 17.56,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/departments/gniazdo-pojedyncze-kontakt-simon-basic-z-ochron-styk-w-bia-e-1-szt-/5902787568238_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Łącznik (wyłącznik) pojedynczy jednobiegunowy Kontakt-Simon Basic BMW1.01/11 biały — EAN 5902787568177. Cena 14,98 zł/szt (Castorama).
  // source: https://www.castorama.pl/lacznik-pojedynczy-kontakt-simon-basic-bialy/5902787568177_CAPL.prd (EAN + cena 14,98 zł)
  // source: https://supergniazdka.pl/kontakt-simon/simon-basic/bmw101-11/lacznik-jednobiegunowy-modul-10ax-250v-szybkozlacza-bialy-5902787568177-5762.html (EAN 5902787568177, model BMW1.01/11)
  {
    id: 'mat-switch-simon-basic-bmw1',
    materialType: 'switch',
    productLabel: 'Łącznik pojedynczy jednobiegunowy Kontakt-Simon Basic (biały, BMW1.01/11)',
    brand: 'Kontakt-Simon',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 14.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/lacznik-pojedynczy-kontakt-simon-basic-bialy/5902787568177_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Puszka podtynkowa fi60 głęboka łączeniowa z wkrętem Elektro-Plast, opak. 10 szt. — EAN 5901752637337. Cena 14,78 zł/opak. (1,48 zł/szt, Castorama).
  // source: https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd (EAN + cena 14,78 zł)
  // source: https://www.leroymerlin.pl/produkty/puszka-instalacyjna-podtynkowa-60-mm-laczeniowa-gleboka-elektro-plast-43256024.html (Elektro-Plast puszka podtynkowa 60 mm głęboka łączeniowa)
  {
    id: 'mat-flush-box-elektroplast-pk60-10',
    materialType: 'flush-box',
    productLabel: 'Puszka podtynkowa fi60 głęboka łączeniowa z wkrętem Elektro-Plast (10 szt.)',
    brand: 'Elektro-Plast',
    packageSize: 10,
    packageUnit: 'szt',
    pricePerPackage: 14.78,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Szybkozłączka uniwersalna WAGO 221-413 3×0,2-4 mm² (COMPACT, z dźwigniami), opak. 12 szt. — EAN 4050821808442 (GTIN producenta na złączkę). Cena 23,88 zł/opak. 12 szt (Leroy Merlin).
  // source: https://www.leroymerlin.pl/produkty/wago-221-413-szybkozlaczka-zlaczka-drut-linka-3x-0-2-4mm2-oryginalna-12szt-89975728.html (opak. 12 szt, cena 23,88 zł, Leroy Merlin)
  // source: https://supergniazdka.pl/wago/221-413/szybkozlaczka-zlaczka-wago-compact-z-dzwigniami-uniwersalna-02-4-mm-3-przewodowa-221-413-4050821808442-18406.html (EAN 4050821808442, 1,85 zł/szt)
  // source: https://www.eelektryka.com/z%C5%82%C4%85czki/1955-wago-szybkoz%C5%82%C4%85czka-uniwersalna-3x02-4mm2-transparentna-221-413-opak-50szt-4050821808442.html (EAN 4050821808442)
  {
    id: 'mat-wire-connector-wago-221-413',
    materialType: 'wire-connector',
    productLabel: 'Szybkozłączka uniwersalna WAGO 221-413 3×0,2-4 mm² (12 szt.)',
    brand: 'WAGO',
    packageSize: 12,
    packageUnit: 'szt',
    pricePerPackage: 23.88,
    category: 'standard',
    storeName: 'Leroy Merlin',
    sourceUrl:
      'https://www.leroymerlin.pl/produkty/wago-221-413-szybkozlaczka-zlaczka-drut-linka-3x-0-2-4mm2-oryginalna-12szt-89975728.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Układanie paneli podłogowych: panele AC4/AC5, podkład, folia, listwy, klipsy -
  // Materiały etapu układania paneli (laminate-flooring / underlay-install) brakujące
  // w katalogu. Każdy markowy, z realnym EAN potwierdzonym w ≥2 niezależnych źródłach
  // (komentarze `// source:`) → EAN wpisany też do MATERIAL_EAN_OVERLAY (api-server),
  // więc seed:offers dopina oferty z feedów. Ceny brutto ze sklepu PL z listy
  // akceptowanej; packageSize/packageUnit z opakowania handlowego (panele = m²/paczka,
  // podkład/folia = m²/rolka, listwa = mb, klipsy = szt/opak.). Tier rośnie z klasą
  // ścieralności AC (economy AC4 budżet → standard AC4 markowy → better AC5 wodoodporny).

  // Panele laminowane AC4 8 mm Kronospan Toledo (K338), 9 szt. = 2,22 m²/paczka — EAN 5907555422774. Cena 88,76 zł/paczka (39,98 zł/m², Castorama). Markowy AC4 do pomieszczeń o średnim natężeniu ruchu.
  // source: https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd (EAN 5907555422774, cena 88,76 zł, AC4, 8 mm, 2,22 m²)
  // source: https://www.ceneo.pl/153535733 (Kronospan Toledo AC4 K338, EAN 5907555422774)
  {
    id: 'mat-laminate-kronospan-toledo-ac4-222',
    materialType: 'laminate',
    productLabel: 'Panele laminowane AC4 8 mm Kronospan Toledo (2,22 m²/paczka)',
    brand: 'Kronospan',
    packageSize: 2.22,
    packageUnit: 'm2',
    pricePerPackage: 88.76,
    pricePerM2: 39.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Panele laminowane wodoodporne AC5 8 mm Classen Dąb Niasa (Megaloc 2.0 Aquaprotect), 8 szt. = 1,973 m²/paczka — EAN 4003992571974. Cena 92,69 zł/paczka (46,98 zł/m², Castorama). Odporność na wodę 24 h, do kuchni/łazienki.
  // source: https://www.castorama.pl/panele-podlogowe-laminowane-wodoodporne-classen-dab-niasa-ac5-1-973-m2/4003992571974_CAPL.prd (EAN 4003992571974, cena 92,69 zł, AC5, 8 mm, 1,973 m²)
  // source: https://www.ceneo.pl/104295353 (Classen Dąb Niasa AC5 1,973 m2, EAN 4003992571974)
  // source: https://eadamex.pl/panele-podlogowe/11020-panel-dab-niasa-expedition-ac5-8mm-classen-op1973m2-4003992571974.html (EAN 4003992571974 w URL)
  {
    id: 'mat-laminate-classen-niasa-ac5-1973',
    materialType: 'laminate',
    productLabel: 'Panele laminowane wodoodporne AC5 8 mm Classen Dąb Niasa (1,973 m²/paczka)',
    brand: 'Classen',
    packageSize: 1.973,
    packageUnit: 'm2',
    pricePerPackage: 92.69,
    pricePerM2: 46.98,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/panele-podlogowe-laminowane-wodoodporne-classen-dab-niasa-ac5-1-973-m2/4003992571974_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Podkład podłogowy pod panele Arbiton XPS Smart Aquastop Thermo 1,6 mm, rolka/harmonijka 6 m² (3w1 z zintegrowaną folią paroizolacyjną) — EAN 5905167826942. Cena 70,68 zł/opak. (11,78 zł/m², Castorama). Do ogrzewania podłogowego, redukcja hałasu do 19 dB.
  // source: https://www.castorama.pl/podklad-podlogowy-pod-panele-laminowane-arbiton-xps-smart-aquastop-thermo-1-6-mm-6-m2/5905167826942_CAPL.prd (EAN 5905167826942, cena 70,68 zł, 6 m²)
  // source: https://arbiton.com/pl/podklady-pod-panele/podklady-pod-panele-laminowane/arbiton-secura-thermo-aquastop-smart-podklady-pod-panele-laminowane (Arbiton — karta serii XPS Smart Aquastop Thermo)
  {
    id: 'mat-underlay-arbiton-xps-aquastop-6m2',
    materialType: 'underlay',
    productLabel: 'Podkład Arbiton XPS Smart Aquastop Thermo 1,6 mm (6 m²)',
    brand: 'Arbiton',
    packageSize: 6,
    packageUnit: 'm2',
    pricePerPackage: 70.68,
    pricePerM2: 11.78,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/podklad-podlogowy-pod-panele-laminowane-arbiton-xps-smart-aquastop-thermo-1-6-mm-6-m2/5905167826942_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Folia paroizolacyjna PE Diall 0,15 mm, rolka 2 × 10 m = 20 m² — EAN 5059340141428. Cena 89,60 zł/rolka (4,48 zł/m², Castorama). Polietylen (PE), zabezpiecza panele przed wilgocią z podłoża.
  // source: https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd (EAN 5059340141428, cena 89,60 zł, PE 0,15 mm, 20 m²)
  // source: https://www.ceneo.pl/50305654 (Diall Membrana paroizolacyjna 20 m2, EAN 5059340141428)
  {
    id: 'mat-vapor-foil-diall-pe-20m2',
    materialType: 'vapor-barrier',
    productLabel: 'Folia paroizolacyjna PE Diall 0,15 mm (20 m²)',
    brand: 'Diall',
    packageSize: 20,
    packageUnit: 'm2',
    pricePerPackage: 89.60,
    pricePerM2: 4.48,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Listwa przypodłogowa MDF biała Krono Original LK100F, wys. 100 mm, dł. 2,4 mb — EAN 5907555424969. Cena 26,98 zł/szt. (11,24 zł/mb, Castorama). Do maskowania szczeliny dylatacyjnej przy ścianie.
  // source: https://www.castorama.pl/listwa-przypodlogowa-mdf-krono-original-biala-lk100f/5907555424969_CAPL.prd (EAN 5907555424969, cena 26,98 zł/szt = 11,24 zł/mb, 2,4 m, wys. 100 mm)
  // source: https://www.castorama.pl/plytki-i-podlogi/akcesoria-do-podlog/listwyprzypodlogowe/listwy-przypodlogowe-mdf.cat (Krono Original LK100F w kategorii listew MDF Castorama)
  {
    id: 'mat-skirting-krono-lk100f-mdf-240',
    materialType: 'skirting',
    productLabel: 'Listwa przypodłogowa MDF biała Krono Original LK100F (2,4 mb)',
    brand: 'Krono Original',
    packageSize: 2.4,
    packageUnit: 'mb',
    pricePerPackage: 26.98,
    pricePerMb: 11.24,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/listwa-przypodlogowa-mdf-krono-original-biala-lk100f/5907555424969_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Klipsy montażowe do listew przypodłogowych Cezar z podkładką dystansową, opak. 25 szt. — EAN 5907684672217. Cena 49,98 zł/opak. (2,00 zł/szt, Castorama). Szybki montaż listwy bez uszkodzeń, dystans 3 mm.
  // source: https://www.castorama.pl/klipsy-montazowe-do-listew-cezar-25-szt-/5907684672217_CAPL.prd (EAN 5907684672217, cena 49,98 zł, 25 szt.)
  // source: https://decorsystem.com.pl/klipsy-montazowe-do-listew-przypodlogowych-25-szt-cezar,id19262.html (Cezar klipsy montażowe 25 szt.)
  {
    id: 'mat-skirting-clips-cezar-25',
    materialType: 'skirting-clip',
    productLabel: 'Klipsy montażowe do listew Cezar (25 szt.)',
    brand: 'Cezar',
    packageSize: 25,
    packageUnit: 'szt',
    pricePerPackage: 49.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/klipsy-montazowe-do-listew-cezar-25-szt-/5907684672217_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Etap glazury: płytki ceramiczne / gres + akcesoria (fuga, krzyżyki, profil) ---
  // Materiały markowe z REALNYM EAN (≥2 niezależne źródła w komentarzach `// source:`).
  // Tiery per klasa/format: standard = gres szkliwiony 60×60, better = gres rektyfikowany.
  // Ceny za m² dla płytek (pricePerM2 + packageUnit 'm2', 1 m²/opak. jak istniejący gres
  // mat-gres-guigliano-1m2), akcesoria za opakowanie. NIE ruszamy istniejących materiałów.

  // Gres szkliwiony Ceramika Paradyż Petro Grey struktura mat 60×60 cm — EAN 5904584161544.
  // source: https://neoceramik.pl/pl/p/Paradyz-PETRO-GREY-GRES-SZKL.-STRUKTURA-MAT.-60X60-G2/23079150 (EAN 5904584161544, cena 69,00 zł/m²)
  // source: https://www.leroymerlin.pl/produkty/gres-szkliwiony-petro-grey-mat-60x60-paradyz-92495587.html (Paradyż Petro Grey mat 60x60, EAN 5904584161544)
  {
    id: 'mat-gres-paradyz-petro-grey-60x60',
    materialType: 'tile',
    productLabel: 'Gres szkliwiony Paradyż Petro Grey struktura mat 60×60 cm',
    brand: 'Ceramika Paradyż',
    packageSize: 1,
    packageUnit: 'm2',
    pricePerPackage: 69.0,
    pricePerM2: 69.0,
    category: 'standard',
    storeName: 'neoCERAMIK',
    sourceUrl:
      'https://neoceramik.pl/pl/p/Paradyz-PETRO-GREY-GRES-SZKL.-STRUKTURA-MAT.-60X60-G2/23079150',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Płytka ścienna łazienkowa Ceramika Paradyż Nati Bianco struktura 25×40 cm — EAN 5902610507960.
  // source: https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/ (EAN 5902610507960, cena 74,88 zł/m²)
  // source: https://www.ceneo.pl/70865330 (Paradyż Nati Bianco str 25x40, EAN 5902610507960)
  {
    id: 'mat-tile-wall-paradyz-nati-bianco-25x40',
    materialType: 'tile',
    productLabel: 'Płytka ścienna Paradyż Nati Bianco struktura 25×40 cm',
    brand: 'Ceramika Paradyż',
    packageSize: 1,
    packageUnit: 'm2',
    pricePerPackage: 74.88,
    pricePerM2: 74.88,
    category: 'standard',
    storeName: 'eLazienki',
    sourceUrl:
      'https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Gres szkliwiony REKTYFIKOWANY Ceramika Paradyż U117 (Ennis) Grey mat 59,8×59,8 cm — EAN 5904584158261.
  // source: https://www.blu.com.pl/plytki-podlogowe/34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261.html (EAN 5904584158261, cena 77,00 zł/m²)
  // source: https://dekordia.pl/produkt/paradyz-u117-grey-gres-mat-rektyfikowany-59-8x59-8.html (Paradyż U117 Grey rekt., EAN 5904584158261, 64,07 zł/m²)
  {
    id: 'mat-gres-rekt-paradyz-u117-grey-60x60',
    materialType: 'tile',
    productLabel: 'Gres szkliwiony rektyfikowany Paradyż U117 (Ennis) Grey mat 59,8×59,8 cm',
    brand: 'Ceramika Paradyż',
    packageSize: 1,
    packageUnit: 'm2',
    pricePerPackage: 77.0,
    pricePerM2: 77.0,
    category: 'better',
    storeName: 'BLU',
    sourceUrl:
      'https://www.blu.com.pl/plytki-podlogowe/34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Fuga ceramiczna Atlas 001 biała 2 kg (spoina 1–20 mm, elastyczna) — EAN 5905400572254.
  // source: https://www.castorama.pl/fuga-ceramiczna-atlas-001-biala-2-kg/5905400572254_CAPL.prd (EAN 5905400572254, cena 39,98 zł/2 kg)
  // source: https://www.obi.pl/p/6552095/atlas-fuga-ceramiczna-001-bialy-2-kg (OBI: Atlas Fuga ceramiczna 001 biały 2 kg, EAN 5905400572254)
  {
    id: 'mat-grout-atlas-001-white-2kg',
    materialType: 'grout',
    productLabel: 'Fuga ceramiczna Atlas 001 biała 2 kg',
    brand: 'Atlas',
    packageSize: 2,
    packageUnit: 'kg',
    pricePerPackage: 39.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/fuga-ceramiczna-atlas-001-biala-2-kg/5905400572254_CAPL.prd',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Krzyżyki dystansowe do płytek Hardy (KAEM) 2 mm, 200 szt. — EAN 5905061016845.
  // source: https://mrowka.com.pl/produkt/krzyzyki-dystansowe-2-mm-200-szt-hardy-5905061016845.html (EAN 5905061016845, cena 3,99 zł/op.)
  // source: https://www.bricomarche.pl/krzyzyki-dystansowe-do-glazury-2-mm-biale-woreczek-200-sztuk-hardy (Bricomarché: Hardy krzyżyki 2 mm, 200 szt.)
  {
    id: 'mat-tile-spacers-hardy-2mm-200',
    materialType: 'tile-spacer',
    productLabel: 'Krzyżyki dystansowe do płytek Hardy 2 mm (200 szt.)',
    brand: 'Hardy',
    packageSize: 200,
    packageUnit: 'szt',
    pricePerPackage: 3.99,
    category: 'standard',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/krzyzyki-dystansowe-2-mm-200-szt-hardy-5905061016845.html',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // Profil narożny (zewnętrzny) do glazury Cezar aluminiowy 8 mm, tytan szczotkowany mat, 2,5 m — EAN 5904584853500.
  // source: https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m (EAN 5904584853500, cena 27,32 zł/szt, dł. 2,5 m)
  // source: https://www.leroymerlin.pl/produkty/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m-96115864.html (Leroy Merlin: Cezar profil narożny 8 mm 2,5 m)
  {
    id: 'mat-tile-trim-cezar-corner-8mm-25m',
    materialType: 'tile-trim',
    productLabel: 'Profil narożny do glazury Cezar aluminiowy 8 mm, tytan szczotkowany mat, 2,5 m',
    brand: 'Cezar',
    packageSize: 2.5,
    packageUnit: 'szt',
    pricePerPackage: 27.32,
    pricePerMb: 10.93, // 27,32 zł / 2,5 m
    category: 'standard',
    storeName: 'Cezar',
    sourceUrl:
      'https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m',
    lastUpdated: '2026-08-23',
    currency: 'PLN',
  },

  // --- Etap hydroizolacji łazienki: masy w płynie / taśma / narożniki / mankiet ---
  // Bazowa masa na m² = DOKŁADNIE jedna na tier (economy/standard = Woder E 1K,
  // better = Woder Duo 2K), żeby engine nie liczył podwójnie hydroizolacji.

  // Masa hydroizolacyjna 1-składnikowa (folia w płynie) Atlas Woder E 15 kg — EAN 5905400514506.
  // Zużycie ok. 2 kg/m² przy hydroizolacji (2 warstwy). source: karta techniczna Atlas.
  // source: https://mrowka.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html (EAN 5905400514506, cena 311,99 zł)
  // source: https://www.grupapsb.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html (EAN 5905400514506)
  {
    id: 'mat-waterproof-membrane-atlas-woder-e-15kg',
    materialType: 'waterproofing',
    productLabel: 'Folia w płynie (masa hydroizolacyjna 1-składnikowa) Atlas Woder E 15 kg',
    brand: 'Atlas',
    packageSize: 15,
    packageUnit: 'kg',
    pricePerPackage: 311.99,
    category: 'economy',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Gotowa do użycia, elastyczna. Ok. 2 kg/m² dla pełnej hydroizolacji (2 warstwy).',
  },

  // Hydroizolacja 2-składnikowa elastyczna Atlas Woder Duo 16 kg (komponent A 12 kg + B 4 kg) — EAN 5905400195088.
  // Wyższa klasa: mostkuje rysy podłoża, na podłoża odkształcalne/baseny. source: karta techniczna Atlas.
  // source: https://www.castorama.pl/hydroizolacja-atlas-woder-duo-16-kg/5905400195088_CAPL.prd (EAN 5905400195088, cena 268 zł)
  // source: https://mrowka.com.pl/produkt/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16-kg-atlas-5905400195088.html (EAN 5905400195088)
  {
    id: 'mat-waterproof-membrane-atlas-woder-duo-16kg',
    materialType: 'waterproofing',
    productLabel: 'Hydroizolacja 2-składnikowa elastyczna Atlas Woder Duo 16 kg',
    brand: 'Atlas',
    packageSize: 16,
    packageUnit: 'kg',
    pricePerPackage: 268,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/hydroizolacja-atlas-woder-duo-16-kg/5905400195088_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Zaprawa dwuskładnikowa (A suchy + B płynny), mostkuje rysy do 1 mm. Ok. 1,75 kg/m²/1 mm.',
  },

  // Taśma uszczelniająca do naroży i dylatacji Ceresit CL 152, 10 m — EAN 5900089115211.
  // Wzmacnia powłoki wodoszczelne CL 50/51, CR 166 w narożach ściana-podłoga.
  // source: https://www.castorama.pl/tasma-uszczelniajaca-ceresit-cl-152-10-m/5900089115211_CAPL.prd (EAN 5900089115211, cena 168 zł)
  // source: https://eadamex.pl/tasmy-hydroizolacyjne/8303-tasma-uszczelniajaca-cl152-ceresit-10m-op-5900089115211.html (EAN 5900089115211)
  {
    id: 'mat-sealing-tape-ceresit-cl152-10m',
    materialType: 'sealing-tape',
    productLabel: 'Taśma uszczelniająca Ceresit CL 152, 10 m',
    brand: 'Ceresit',
    packageSize: 10,
    packageUnit: 'm',
    pricePerPackage: 168,
    pricePerMb: 16.8, // 168 zł / 10 m
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/tasma-uszczelniajaca-ceresit-cl-152-10-m/5900089115211_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Narożnik uszczelniający WEWNĘTRZNY Mapei Mapeband W (profil 90°) — EAN 8022452113802.
  // Do naroży wklęsłych ściana-ściana / ściana-podłoga; zatapiany w masie.
  // source: https://www.castorama.pl/naroznik-uszczelniajacy-wewnetrzny-mapei/8022452113802_CAPL.prd (EAN 8022452113802, cena 20,98 zł)
  // source: https://eadamex.pl/narozniki-hydroizolacyjne/8290-naroznik-wewnetrzny-mapei-mapeband-w-profil-90-8022452113802.html (EAN 8022452113802)
  {
    id: 'mat-sealing-corner-internal-mapei',
    materialType: 'sealing-corner',
    productLabel: 'Narożnik uszczelniający wewnętrzny Mapei Mapeband W (90°)',
    brand: 'Mapei',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 20.98,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/naroznik-uszczelniajacy-wewnetrzny-mapei/8022452113802_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Narożnik uszczelniający ZEWNĘTRZNY Mapei Mapeband W (profil 270°) — EAN 8022452113789.
  // Do naroży wypukłych (np. obudowa wanny, ścianka działowa).
  // source: https://www.castorama.pl/naroznik-uszczelniajacy-zewnetrzny-mapei/8022452113789_CAPL.prd (EAN 8022452113789, cena 20,98 zł)
  // source: https://eadamex.pl/narozniki-hydroizolacyjne/8291-naroznik-zewnatrzny-mapei-mapeband-w-profil-270-8022452113789.html (EAN 8022452113789)
  {
    id: 'mat-sealing-corner-external-mapei',
    materialType: 'sealing-corner',
    productLabel: 'Narożnik uszczelniający zewnętrzny Mapei Mapeband W (270°)',
    brand: 'Mapei',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 20.98,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/naroznik-uszczelniajacy-zewnetrzny-mapei/8022452113789_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
  },

  // Mankiet uszczelniający ŚCIENNY Mapei Mapeband W 12×12 cm, 2 szt. — EAN 8022452113925.
  // Do przejść rur pod baterie/zawory; zatapiany w masie hydroizolacyjnej.
  // source: https://www.castorama.pl/mankiet-uszczelniajacy-mapei-maly-2-szt-/8022452113925_CAPL.prd (EAN 8022452113925, cena 37,98 zł / 2 szt.)
  // source: https://www.obi.pl/pozostale-akcesoria-do-plytek/mapei-mankiet-uszczelniajacy-mapeband-w/p/2761617 (Mapei Mapeband W mankiet 12×12 cm)
  {
    id: 'mat-sealing-cuff-wall-mapei-12x12-2',
    materialType: 'sealing-cuff',
    productLabel: 'Mankiet uszczelniający ścienny Mapei Mapeband W 12×12 cm, 2 szt.',
    brand: 'Mapei',
    packageSize: 2,
    packageUnit: 'szt',
    pricePerPackage: 37.98,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/mankiet-uszczelniajacy-mapei-maly-2-szt-/8022452113925_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Do uszczelnienia przejść rur pod baterie/wypływy w strefie mokrej.',
  },

  // --- Etap przygotowania podłoża pod podłogi: wylewki/podkłady + akcesoria ---
  // Materiały markowe z REALNYM EAN (≥2 niezależne źródła w komentarzach `// source:`).
  // Job: self-leveling (data/jobs/floor-prep.ts). Tiery per zakres grubości/klasa
  // wylewki (DOKŁADNIE JEDNA wylewka bazowa/tier — engine liczy każdą pozycję na
  // całą powierzchnię, więc dwie wylewki w jednym tierze podwoiłyby masę). Grunt
  // (mat-primer-deep-atlas-unigrunt-5kg) i folia PE (mat-vapor-foil-diall-pe-20m2)
  // reużyte z katalogu. NIE ruszamy istniejących materiałów. Wylewki wyceniane za kg
  // (pricePerKg), taśma za mb (pricePerMb) — spójnie z formułami joba.

  // Samopoziomujący podkład podłogowy Atlas SAM 200 25 kg (anhydrytowy, 25–60 mm) — EAN 5905400279269. Cena 36,98 zł/worek (1,48 zł/kg, Castorama). Grubszy jastrych/podkład pod ogrzewanie podłogowe. Zużycie ok. 20 kg/m²/10 mm.
  // source: https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-200-25-kg/5905400279269_CAPL.prd (EAN 5905400279269, cena 36,98 zł, 25 kg, 25–60 mm)
  // source: https://b2c.makchemia.pl/wylewki-samopoziomujace/5233-atlas-sam-200-25kg-2560mm-folia-5905400279269.html (EAN 5905400279269, Atlas SAM 200 25 kg)
  {
    id: 'mat-screed-atlas-sam200-25kg',
    materialType: 'screed',
    productLabel: 'Samopoziomujący podkład podłogowy Atlas SAM 200 25 kg (25–60 mm)',
    brand: 'Atlas',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 36.98,
    pricePerKg: 1.48,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-200-25-kg/5905400279269_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Zużycie ok. 20 kg/m² na 10 mm grubości. Grubsza warstwa 25–60 mm (jastrych), tylko wewnątrz, dobra pod ogrzewanie podłogowe.',
  },

  // Samopoziomujący podkład podłogowy Atlas SAM 100 25 kg (szybkowiążący, 5–30 mm) — EAN 5905400279245. Cena 43,98 zł/worek (1,76 zł/kg, Castorama). Zużycie ok. 20 kg/m²/10 mm.
  // source: https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-100-25-kg/5905400279245_CAPL.prd (EAN 5905400279245, cena 43,98 zł, 25 kg, 5–30 mm)
  // source: https://www.bricomarche.pl/szybkowiazacy-samopoziomujacy-podklad-podlogowy-sam-100-25-kg-atlas (EAN 5905400279245, Atlas SAM 100 25 kg)
  {
    id: 'mat-screed-atlas-sam100-25kg',
    materialType: 'screed',
    productLabel: 'Samopoziomujący podkład podłogowy Atlas SAM 100 25 kg (5–30 mm)',
    brand: 'Atlas',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 43.98,
    pricePerKg: 1.76,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-100-25-kg/5905400279245_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Zużycie ok. 20 kg/m² na 10 mm grubości. Warstwa 5–30 mm, wyrównanie pod płytki/panele/parkiet w pomieszczeniach suchych.',
  },

  // Zaprawa samopoziomująca Ceresit CN 72 25 kg (cienkowarstwowa wykończeniowa, 1–20 mm) — EAN 5900089272259. Cena 81,68 zł/worek (3,27 zł/kg, E-Kowalczyk). Zużycie ok. 1,6 kg/m²/mm. Premium finisz pod płytki/panele/parkiet.
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-wyrownujaca-cn72-25-kg-ceresit-5900089272259.html (EAN 5900089272259, Ceresit CN 72 25 kg)
  // source: https://sklep-kowalczyk.pl/ceresit-cn-72-zaprawa-samopoziomujaca-25-kg-219136.html (EAN 5900089272259, cena 81,68 zł, 25 kg)
  {
    id: 'mat-screed-ceresit-cn72-25kg',
    materialType: 'screed',
    productLabel: 'Zaprawa samopoziomująca Ceresit CN 72 25 kg (1–20 mm)',
    brand: 'Ceresit',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 81.68,
    pricePerKg: 3.27,
    category: 'better',
    storeName: 'E-Kowalczyk',
    sourceUrl:
      'https://sklep-kowalczyk.pl/ceresit-cn-72-zaprawa-samopoziomujaca-25-kg-219136.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Zużycie ok. 1,6 kg/m² na 1 mm grubości. Cienka warstwa 1–20 mm, szybkoschnąca (ruch po 3 h), pod ogrzewanie podłogowe.',
  },

  // Taśma brzegowa (dylatacyjna obwodowa) Fola 5 mm × 100 mm × 50 mb — EAN 5906725207227. Cena 35,48 zł/rolka (0,71 zł/mb, Castorama). PE, przyklejana przy ścianach pod wylewkę — kompensuje pracę posadzki.
  // source: https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd (EAN 5906725207227, cena 35,48 zł, 5 mm × 10 cm × 50 mb)
  // source: https://www.nokaut.pl/akcesoria-do-drzwi/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2-5906725207227.html (EAN 5906725207227, Fola taśma brzegowa 50 mb)
  {
    id: 'mat-edge-tape-fola-100mm-50m',
    materialType: 'expansion-tape',
    productLabel: 'Taśma brzegowa dylatacyjna Fola 5 mm × 100 mm × 50 mb',
    brand: 'Fola',
    packageSize: 50,
    packageUnit: 'mb',
    pricePerPackage: 35.48,
    pricePerMb: 0.71,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Obwodowa dylatacja przy ścianach — układana przed wylaniem masy, zapobiega pękaniu posadzki przy pracy budynku.',
  },

  // --- Etap montażu okien / parapetów: piana + taśma + parapet + kotwy + silikon ---
  // Etap „okna" (data/jobs/windows.ts: window-sealing, windowsill-install) miał w
  // katalogu tylko piankę Tytan i silikon sanitarny. Dokładamy markowe materiały
  // montażowe z realnym EAN (≥2 niezależne sklepy PL w // source), by pełne tiery
  // economy/standard/better joba miały pokrycie. Ceny brutto ze sklepu, packageSize
  // z opakowania handlowego. EAN 2-źródłowe wpisane też do MATERIAL_EAN_OVERLAY
  // (api-server). DOKŁADNIE jeden parapet i jedna piana na tier w mappings.ts —
  // inaczej engine (getQuantityForMaterial) policzyłby je na całą długość okien 2×.

  // Pianka montażowa Soudal Low Expansion pistoletowa zimowa 750 ml — EAN 5411183048522.
  // Niskorozprężna (bezpieczna dla ościeżnic), praca do -10°C, izolacja akust. do -58 dB.
  // source: https://www.castorama.pl/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml/5411183048522_CAPL.prd (EAN + cena 47,48 zł)
  // source: https://mrowka.com.pl/produkt/soudafoam-low-expansion-gun-10-c-750-ml-soudal-5411183048522.html (EAN 5411183048522)
  {
    id: 'mat-foam-soudal-lowexp-750ml',
    materialType: 'foam',
    productLabel: 'Pianka montażowa Soudal Low Expansion pistoletowa zimowa 750 ml',
    brand: 'Soudal',
    packageSize: 750,
    packageUnit: 'ml',
    pricePerPackage: 47.48,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml/5411183048522_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Niskorozprężna — nie rozpiera ościeżnicy. 1 puszka na ok. 8–10 mb szczeliny. Wariant premium względem Tytan Professional 65.',
  },

  // Silikon uniwersalny Soudal 280 ml bezbarwny — EAN 5411183157552.
  // Uszczelnienie styku ościeżnica/ściana, parapet, przeszklenia; odporność -60…180°C.
  // source: https://www.castorama.pl/silikon-uniwersalny-soudal-280-ml-bezbarwny/5411183157552_CAPL.prd (EAN + cena 27,48 zł)
  // source: https://eadamex.pl/silikony-uniwersalne/7305-silikon-uniwersalny-bezbarwny-280ml-soudal-5411183157552.html (EAN 5411183157552)
  {
    id: 'mat-silicone-universal-soudal-280ml',
    materialType: 'silicone',
    productLabel: 'Silikon uniwersalny Soudal 280 ml bezbarwny',
    brand: 'Soudal',
    packageSize: 280,
    packageUnit: 'ml',
    pricePerPackage: 27.48,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/silikon-uniwersalny-soudal-280-ml-bezbarwny/5411183157552_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Uniwersalny (dekarsko-budowlany) — styk ościeżnicy ze ścianą, parapet, przeszklenia. Bezbarwny.',
  },

  // Kotwa montażowa do ościeżnic (rama okienna/drzwiowa) 10 × 182 mm — EAN 5905458019787.
  // Stalowa ocynkowana, do betonu/cegły/betonu komórkowego; sprzedawana na sztuki.
  // source: https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd (EAN + cena 5,28 zł/szt)
  // source: https://www.brendo.pl/produkt/kotwy/kotwa-montazowa-do-oscieznic-10-x-182-mm-5905458019787.html (EAN 5905458019787)
  {
    id: 'mat-window-frame-anchor-10x182',
    materialType: 'anchor',
    productLabel: 'Kotwa montażowa do ościeżnic (rama okienna) 10 × 182 mm',
    packageSize: 1,
    packageUnit: 'szt',
    pricePerPackage: 5.28,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Mocowanie ramy okiennej/ościeżnicy w murze. Kilka sztuk na okno (bok co ok. 60–70 cm).',
  },

  // Taśma paroszczelna okienna Soudal SWS Basic Plus Inside 90 mm × 30 m — EAN 5411183151178.
  // Wewnętrzna warstwa „ciepłego montażu" — chroni piankę przed parą wodną od strony pomieszczenia.
  // Produkt specjalistyczny (poza asortymentem marketów) — cena ze sklepu budowlanego PL.
  // source: https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html (EAN + cena 171,60 zł)
  // source: https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html (EAN 5411183151178)
  {
    id: 'mat-window-tape-soudal-sws-inside-90mm',
    materialType: 'window-tape',
    productLabel: 'Taśma paroszczelna okienna Soudal SWS Basic Plus Inside 90 mm × 30 m',
    brand: 'Soudal',
    packageSize: 30,
    packageUnit: 'm',
    pricePerPackage: 171.60,
    category: 'standard',
    storeName: 'BestBudowa',
    sourceUrl:
      'https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Wewnętrzna taśma paroszczelna do ciepłego montażu okien. Rolka 30 mb — zwykle 1 rolka na kilka okien.',
  },

  // Parapet wewnętrzny PCV Form 30 × 216 cm biały — EAN 5906725219640. Cena 178 zł/szt (82,41 zł/mb).
  // UWAGA: „Form" to marka własna Castoramy (Kingfisher) — realny EAN, ale JEDEN sklep
  // detaliczny, więc świadomie NIE trafia do MATERIAL_EAN_OVERLAY (reguła ≥2 źródeł).
  // source: https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd (EAN + cena 178 zł, 30 × 216 cm)
  // source: https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy-id-8547.html (Castorama — karta produktu Form 30 × 216 cm biały)
  {
    id: 'mat-windowsill-pvc-form-30x216',
    materialType: 'windowsill',
    productLabel: 'Parapet wewnętrzny PCV Form 30 × 216 cm biały',
    brand: 'Form',
    packageSize: 2.16,
    packageUnit: 'm',
    pricePerPackage: 178.0,
    pricePerMb: 82.41,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Głębokość 30 cm dopasuj do wnęki. Deska 216 cm — na szersze okna dobierz liczbę sztuk.',
  },

  // --- Etap tynkowania ścian: tynki bazowe + grunt/kontakt + narożnik ---
  // NOWY etap (job wall-plastering, data/jobs/walls.ts). Tynk BAZOWY wewnętrzny na
  // surowym murze: gips maszynowy/ręczny (pomieszczenia suche) lub cementowo-wapienny
  // (wilgotne). Materiały markowe z REALNYM EAN (≥2 niezależne źródła w // source).
  // DOKŁADNIE JEDEN tynk bazowy na tier w mappings.ts (materialType 'plaster') — engine
  // liczy każdą pozycję na całą powierzchnię, więc dwa tynki w tierze podwoiłyby masę.
  // Grunt/kontakt (Cerplast) i narożnik reużyte we wszystkich tierach. Tynki wyceniane
  // za kg (pricePerKg), narożnik za mb (pricePerMb) — spójnie z formułami joba.
  // 4 markowe EAN (tynki + grunt) wpisane do MATERIAL_EAN_OVERLAY (api-server); narożnik
  // ma pewne tylko 1 źródło z EAN (Castorama) → świadomie POZA overlay (jak parapet Form).

  // Tynk gipsowy maszynowy Knauf MP 75 25 kg — EAN 5902367206352. Cena 25,48 zł/worek (1,02 zł/kg, Castorama).
  // Jednowarstwowy tynk gipsowy, zużycie ok. 10 kg/m²/10 mm, wilgotność do 70%. Najtańszy/najczęstszy → tier economy.
  // source: https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd (EAN 5902367206352, cena 25,48 zł, 25 kg)
  // source: https://znajdzwyprzedaz.pl/wyprzedaz/tynki/tynk-maszynowy-knauf-mp-75-25-kg-5902367206352 (EAN 5902367206352, Knauf MP 75 25 kg)
  {
    id: 'mat-plaster-gypsum-machine-knauf-mp75-25kg',
    materialType: 'plaster',
    productLabel: 'Tynk gipsowy maszynowy Knauf MP 75 25 kg',
    brand: 'Knauf',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 25.48,
    pricePerKg: 1.02,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Jednowarstwowy tynk gipsowy nakładany agregatem. Zużycie ok. 10 kg/m² na 10 mm. Pomieszczenia o wilgotności do 70%.',
  },

  // Tynk gipsowy ręczny Knauf Goldband 25 kg — EAN 5902367206383. Cena 31,98 zł/worek (1,28 zł/kg, Castorama).
  // Nakładany ręcznie, warstwa 8–35 mm, zużycie ok. 13 kg/m²/15 mm. Do ręcznego tynkowania/wyrównań → tier standard.
  // source: https://www.castorama.pl/tynk-gipsowy-reczny-knauf-goldband-25-kg/5902367206383_CAPL.prd (EAN 5902367206383, cena 31,98 zł, 25 kg)
  // source: https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383 (EAN 5902367206383, Knauf Goldband 25 kg)
  {
    id: 'mat-plaster-gypsum-manual-knauf-goldband-25kg',
    materialType: 'plaster',
    productLabel: 'Tynk gipsowy ręczny Knauf Goldband 25 kg',
    brand: 'Knauf',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 31.98,
    pricePerKg: 1.28,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/tynk-gipsowy-reczny-knauf-goldband-25-kg/5902367206383_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Ręczny tynk gipsowy do wyrównywania krzywych ścian, ościeży, ubytków po instalacjach. Warstwa 8–35 mm (2 warstwy do 50 mm).',
  },

  // Tynk cementowo-wapienny maszynowy Baumit MPI 25 30 kg — EAN 5907534261158. Cena 27,99 zł/worek (0,93 zł/kg, Mrówka).
  // Trwalszy, do pomieszczeń wilgotnych/obciążonych, klasa CS II, A1. Zużycie ok. 14 kg/m²/10 mm → tier better.
  // source: https://mrowka.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html (EAN 5907534261158, cena 27,99 zł, 30 kg)
  // source: https://www.grupapsb.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html (EAN 5907534261158, Baumit MPI 25 30 kg)
  {
    id: 'mat-plaster-cementlime-baumit-mpi25-30kg',
    materialType: 'plaster',
    productLabel: 'Tynk cementowo-wapienny maszynowy Baumit MPI 25 30 kg',
    brand: 'Baumit',
    packageSize: 30,
    packageUnit: 'kg',
    pricePerPackage: 27.99,
    pricePerKg: 0.93,
    category: 'better',
    storeName: 'Mrówka',
    sourceUrl:
      'https://mrowka.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Tynk cementowo-wapienny do pomieszczeń wilgotnych (łazienka, garaż, piwnica). Twardszy od gipsowego. Zużycie ok. 14 kg/m² na 10 mm.',
  },

  // Podkład/kontakt pod tynki Atlas Cerplast 15 kg — EAN 5905400530032. Cena 148 zł/wiadro (9,87 zł/kg, Castorama).
  // Masa gruntująca z piaskiem kwarcowym — chropowaci gładkie podłoża (beton) pod tynk. Zużycie ok. 0,3 kg/m².
  // source: https://www.castorama.pl/podklad-pod-tynki-atlas-cerplast-15-kg/5905400530032_CAPL.prd (EAN 5905400530032, cena 148 zł, 15 kg)
  // source: https://ekobudsklep.pl/Tynki/3323-srodek-gruntujacy-podklad-tynkarski-cerplast-15kg-atlas-5905400530032.html (EAN 5905400530032, Atlas Cerplast 15 kg)
  {
    id: 'mat-plaster-primer-atlas-cerplast-15kg',
    materialType: 'primer',
    productLabel: 'Podkład / kontakt pod tynki Atlas Cerplast 15 kg',
    brand: 'Atlas',
    packageSize: 15,
    packageUnit: 'kg',
    pricePerPackage: 148.0,
    pricePerKg: 9.87,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/podklad-pod-tynki-atlas-cerplast-15-kg/5905400530032_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Kontakt z kruszywem kwarcowym — chropowaci gładki beton pod tynk gipsowy. Zużycie ok. 0,3 kg/m². Na chłonny mur zamiast tego grunt głęboko penetrujący.',
  },

  // Narożnik tynkarski aluminiowy z siatką 2,5 mb — EAN 5900308102411. Cena 18,48 zł/szt (7,39 zł/mb, Castorama).
  // Aluminiowy narożnik perforowany z siatką na krawędzie zewnętrzne pod tynk. Producent Budmat.
  // UWAGA: pewne tylko 1 źródło z tym EAN (Castorama) → świadomie NIE w MATERIAL_EAN_OVERLAY (reguła ≥2 źródeł).
  // source: https://www.castorama.pl/naroznik-aluminiowy-z-siatka-2-5-mb/5900308102411_CAPL.prd (EAN 5900308102411, cena 18,48 zł, 2,5 mb)
  // source: https://www.bricomarche.pl/naroznik-aluminiowy-20-x-20-z-siatka-7-x-7-l-2-5-mb (narożnik aluminiowy 20×20 z siatką 7×7, 2,5 mb — ten sam typ Budmat)
  {
    id: 'mat-plaster-corner-alu-mesh-25m',
    materialType: 'plaster-corner',
    productLabel: 'Narożnik tynkarski aluminiowy z siatką 2,5 mb',
    packageSize: 2.5,
    packageUnit: 'mb',
    pricePerPackage: 18.48,
    pricePerMb: 7.39,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/naroznik-aluminiowy-z-siatka-2-5-mb/5900308102411_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Na zewnętrzne krawędzie (ościeża, słupki). Siatka zbroi tynk przy narożniku i chroni przed wykruszeniem.',
  },

  // --- Etap ocieplenia ścian zewnętrznych metodą lekką mokrą (BSO/ETICS) ---
  // Job eps-insulation-bso (data/jobs/new-additions.ts) miał w katalogu tylko legacy
  // materials[] joba (bez EAN). Dokładamy 6 markowych materiałów systemowych z realnym
  // EAN (≥2 niezależne sklepy PL w // source): styropian fasadowy biały EPS 044 +
  // grafitowy EPS 033, klej-zaprawa 2w1 do klejenia płyt i zatapiania siatki, siatka
  // z włókna szklanego, kołki fasadowe z trzpieniem stalowym i tynk cienkowarstwowy
  // silikatowo-silikonowy. W mappings.ts DOKŁADNIE jeden styropian na tier (materialType
  // 'insulation'), bo lokalny engine liczy każdą pozycję na całą powierzchnię elewacji —
  // dwie płyty podwoiłyby ilość. Ceny brutto ze sklepu, packageSize z opakowania
  // handlowego. EAN 2-źródłowe wpisane też do MATERIAL_EAN_OVERLAY (api-server).

  // Styropian fasadowy Yetico Gamma Fasada 044 gr. 100 mm, paczka 3 m² (6 płyt 500×1000) — EAN 5902578301976.
  // Białą płyta EPS elewacyjna λ 0,044 W/(m·K), do metody lekkiej mokrej (BSO). Cena 68,94 zł/paczka (22,98 zł/m², Castorama).
  // source: https://www.castorama.pl/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-/5902578301976_CAPL.prd (EAN 5902578301976, cena 68,94 zł, 3 m², 100 mm)
  // source: https://www.obi.pl/p/2677748/yetico-plyta-styropianowa-gamma-fasada-044-10-cm-3-m2 (EAN 5902578301976, Yetico Gamma Fasada 044 10 cm 3 m²)
  {
    id: 'mat-eps-facade-yetico-gamma-044-100mm',
    materialType: 'insulation',
    productLabel: 'Styropian fasadowy biały Yetico Gamma Fasada 044 100 mm (3 m²)',
    brand: 'Yetico',
    packageSize: 3,
    packageUnit: 'm2',
    pricePerPackage: 68.94,
    pricePerM2: 22.98,
    category: 'economy',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-/5902578301976_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Białą płyta EPS elewacyjna λ 0,044 W/(m·K). Standardowe grubości 5–20 cm — tu 100 mm. Klejenie pasmowo-punktowe + kołkowanie ≥4 szt/m².',
  },

  // Styropian fasadowy grafitowy Yetico Gamma Passive Fasada EPS 033 gr. 150 mm, paczka 2 m² (4 płyty) — EAN 5902578307268.
  // Płyta grafitowa λ 0,033 W/(m·K) — ok. 20% lepsza izolacyjność niż biała, cieńsza warstwa dla tej samej U. Cena 82,96 zł/paczka (41,48 zł/m², Castorama).
  // source: https://www.castorama.pl/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-/5902578307268_CAPL.prd (EAN 5902578307268, cena 82,96 zł, 2 m², 150 mm, grafit λ 0,033)
  // source: https://www.leroymerlin.pl/izolacja-budynkow/welna-mineralna-styropian-izolacja-akustyczna/styropian/styropian-fasada-niefrezowany-gamma-passive-eps-033-150-mm-2m2-yetico,p341384,l394.html (EAN 5902578307268, Yetico Gamma Passive EPS 033 150 mm 2 m²)
  {
    id: 'mat-eps-facade-yetico-passive-033-150mm',
    materialType: 'insulation',
    productLabel: 'Styropian fasadowy grafitowy Yetico Gamma Passive EPS 033 150 mm (2 m²)',
    brand: 'Yetico',
    packageSize: 2,
    packageUnit: 'm2',
    pricePerPackage: 82.96,
    pricePerM2: 41.48,
    category: 'better',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-/5902578307268_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Grafitowa płyta EPS λ 0,033 W/(m·K) — ok. 20% lepsza izolacyjność niż biała. Klejenie w cieniu/rusztowanie z siatką (nagrzewa się na słońcu).',
  },

  // Zaprawa klejąca do styropianu i zatapiania siatki Atlas Stopter K-20 2w1 25 kg — EAN 5905400160253.
  // Elastyczna, zbrojona włóknem — do klejenia płyt EPS/XPS i wykonania warstwy zbrojonej z siatką (praca od 0°C). Zużycie ok. 5 kg/m² (klejenie) + 3–3,5 kg/m² (siatka). Cena ok. 60,76 zł/worek brutto (Ceneo).
  // source: https://mrowka.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html (EAN 5905400160253, Atlas Stopter K-20 25 kg)
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html (EAN 5905400160253, Atlas Stopter K-20 25 kg)
  // source: https://www.ceneo.pl/4910673 (Atlas Stopter K-20 25 kg — cena brutto ok. 60,76 zł)
  {
    id: 'mat-adhesive-eps-atlas-stopter-k20-25kg',
    materialType: 'adhesive-eps',
    productLabel: 'Zaprawa klejąca do styropianu i siatki Atlas Stopter K-20 2w1 25 kg',
    brand: 'Atlas',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 60.76,
    pricePerKg: 2.43,
    category: 'standard',
    storeName: 'Grupa PSB',
    sourceUrl:
      'https://www.grupapsb.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: '2w1 — te same worki do klejenia płyt (ok. 5 kg/m²) i zatapiania siatki (ok. 3–3,5 kg/m²). Łącznie ok. 8 kg/m². Praca +0…+25°C.',
  },

  // Siatka zbrojąca z włókna szklanego Atlas 150 g/m², rolka 50 m² (1 m × 50 m) — EAN 5905400196993.
  // Alkalioodporna, do zatapiania w warstwie zbrojonej BSO. Zakłady ≥10 cm, pasy diagonalne w narożnikach otworów. Cena 254 zł/rolka (5,08 zł/m², Castorama).
  // source: https://www.castorama.pl/siatka-z-wlokna-szklanego-atlas-150/5905400196993_CAPL.prd (EAN 5905400196993, cena 254 zł, 150 g/m², 50 m²)
  // source: https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782 (EAN 5905400196993, Atlas siatka 150 g/m² 50 m²)
  {
    id: 'mat-mesh-fiberglass-atlas-150-50m2',
    materialType: 'mesh',
    productLabel: 'Siatka zbrojąca z włókna szklanego Atlas 150 g/m² (rolka 50 m²)',
    brand: 'Atlas',
    packageSize: 50,
    packageUnit: 'm2',
    pricePerPackage: 254.0,
    pricePerM2: 5.08,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/siatka-z-wlokna-szklanego-atlas-150/5905400196993_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Gramatura 150 g/m² (zakres fasadowy 145–165 g/m²), alkalioodporna. Zatapiana w środku warstwy kleju — nie na powierzchni. Zapas ok. 10% na zakłady.',
  },

  // Kołek fasadowy z wbijanym trzpieniem stalowym Koelner KI-200M metal 10 × 200 mm, opak. 250 szt. — EAN 5906675212647.
  // Łącznik do mechanicznego mocowania płyt EPS do 15 cm; talerzyk 60 mm, ETA-07/0291. Min. 4 szt/m² w polu, 6–8 szt/m² w strefie narożnej. Cena 220 zł/opak. (0,88 zł/szt, Castorama).
  // source: https://www.castorama.pl/kolek-do-mocowania-izolacji-koelner-metal-10-x-200-mm/5906675212647_CAPL.prd (EAN 5906675212647, cena 220 zł, 250 szt, trzpień stalowy)
  // source: https://www.grupapsb.com.pl/produkt/kolek-do-mocowania-izolacji-10-200-mm-metal-koelner-5906675212647.html (EAN 5906675212647, Koelner KI-200M 10×200 mm)
  {
    id: 'mat-anchor-facade-koelner-ki200m-10x200',
    materialType: 'anchor',
    productLabel: 'Kołek fasadowy z trzpieniem stalowym Koelner KI-200M 10 × 200 mm (250 szt.)',
    brand: 'Koelner',
    packageSize: 250,
    packageUnit: 'szt',
    pricePerPackage: 220.0,
    category: 'standard',
    storeName: 'Castorama',
    sourceUrl:
      'https://www.castorama.pl/kolek-do-mocowania-izolacji-koelner-metal-10-x-200-mm/5906675212647_CAPL.prd',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Trzpień stalowy (mocne podłoża, kat. A–E), talerzyk 60 mm. Długość 200 mm pod płytę ~150 mm. Min. 4 szt/m², 6–8 szt/m² w strefie narożnej.',
  },

  // Tynk cienkowarstwowy silikatowo-silikonowy Ceresit CT 174 baranek 1,5 mm baza biała 25 kg — EAN 9000101109733.
  // Wyprawa dekoracyjna na warstwę zbrojoną BSO: paroprzepuszczalna, samoczyszcząca (Double Dry), z ochroną BioProtect. Zużycie ok. 2,5 kg/m². Cena 197 zł/wiadro (7,88 zł/kg, Sewera).
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101 (EAN 9000101109733, cena 197 zł, 25 kg, baranek 1,5 mm baza biała)
  // source: https://allegro.pl/oferta/tynk-silikatowo-silikonowy-ceresit-ct174-25kg1-5mm-13409944075 (EAN 9000101109733, Ceresit CT174 25 kg baranek 1,5 mm baza biała)
  {
    id: 'mat-plaster-thin-ceresit-ct174-25kg',
    materialType: 'thin-coat-plaster',
    productLabel: 'Tynk cienkowarstwowy silikatowo-silikonowy Ceresit CT 174 baranek 1,5 mm baza biała 25 kg',
    brand: 'Ceresit',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 197.0,
    pricePerKg: 7.88,
    category: 'better',
    storeName: 'Sewera',
    sourceUrl:
      'https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101',
    lastUpdated: '2026-08-24',
    currency: 'PLN',
    notes: 'Baza biała barwiona maszynowo. Zużycie ok. 2,5 kg/m² (baranek 1,5 mm). Nanoszony na zagruntowaną warstwę zbrojoną, praca +5…+25°C, nie w pełnym słońcu/przed deszczem.',
  },
];
