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
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-paint-standard-white-10l',
    materialType: 'paint',
    productLabel: 'Farba GoodHome Ściany i Sufit biały mat 10 l',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 72.98,
    category: 'standard',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-paint-better-white-10l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Śnieżka Eko Plus biała 10 l',
    brand: 'Śnieżka',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 108.00,
    category: 'better',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-universal-primer-5l',
    materialType: 'primer',
    productLabel: 'Grunt uniwersalny Knauf 5 l',
    brand: 'Knauf',
    packageSize: 5,
    packageUnit: 'l',
    pricePerPackage: 30.98,
    category: 'standard',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-skim-coat-economy-20kg',
    materialType: 'skim-coat',
    productLabel: 'Gładź pod wałek GW180 gotowa polimerowa 20 kg',
    packageSize: 20,
    packageUnit: 'kg',
    pricePerPackage: 43.98,
    category: 'economy',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
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
    lastUpdated: '2026-04-01',
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
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-underlay-volden-xps-10m2',
    materialType: 'underlay',
    productLabel: 'Podkład podłogowy Volden XPS Smart 3 mm 10 m²',
    brand: 'Volden',
    packageSize: 10,
    packageUnit: 'm2',
    pricePerPackage: 69.80,
    pricePerM2: 6.98,
    category: 'economy',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-skirting-arbiton-2500',
    materialType: 'skirting',
    productLabel: 'Listwa przypodłogowa PCV Arbiton Indo 2500 mm',
    brand: 'Arbiton',
    packageSize: 2.5,
    packageUnit: 'mb',
    pricePerPackage: 31.98,
    pricePerMb: 12.79,
    category: 'standard',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-gres-guigliano-1m2',
    materialType: 'tile',
    productLabel: 'Gres Guigliano GoodHome 1 m²',
    packageSize: 1,
    packageUnit: 'm2',
    pricePerPackage: 69.98,
    pricePerM2: 69.98,
    category: 'standard',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-tile-adhesive-buildfix-25kg',
    materialType: 'adhesive',
    productLabel: 'Klej do gresu szybkowiążący Buildfix 25 kg',
    brand: 'Buildfix',
    packageSize: 25,
    packageUnit: 'kg',
    pricePerPackage: 48.98,
    category: 'standard',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-sanitary-silicone-soudal-280ml',
    materialType: 'silicone',
    productLabel: 'Silikon sanitarny Soudal 280 ml',
    brand: 'Soudal',
    packageSize: 280,
    packageUnit: 'ml',
    pricePerPackage: 18.98,
    category: 'standard',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
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
];
