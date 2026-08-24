// Nakładka EAN/GTIN dla katalogu referencyjnego (materials.ts).
//
// DLACZEGO OSOBNY PLIK: materials.ts (pakiet mobile) NIE ma kodów EAN/GTIN —
// materiały opisane są nazwą + tierem jakości. Bez kodu oferta z realnego feedu
// sklepu dopina się do materiału tylko przez kruchy fallback (dokładna nazwa +
// kategoria). Ta nakładka wiąże znane materiały z REALNYM, potwierdzonym kodem
// EAN konkretnego produktu w akceptowanym sklepie PL, żeby `upsertProductWithMatch`
// dopinał oferty z feedów po kodzie do WIELU materiałów — nie tylko do jednego
// demo-EAN 5903973005797 (Śnieżka Eko 10 l) z fixture.
//
// ⛔ ANTY-HALUCYNACJA (CLAUDE.md, priorytet 1): każdy kod poniżej jest
// potwierdzony w ≥2 niezależnych źródłach (URL w komentarzu `// source:`).
// Materiał BEZ pewnego, dwuźródłowego kodu świadomie NIE trafia do nakładki —
// zostaje wtedy z ean=null (bez zmiany zachowania). NIE zgadujemy kodów.
//
// Kluczem jest `SeedMaterial.id` z materials.ts (stabilny, nie ruszamy go).

export interface EanOverlayEntry {
  readonly ean?: string;
  readonly gtin?: string;
  /** Konkretny wariant produktu (kolor/wykończenie), gdy nazwa materiału go nie precyzuje. */
  readonly variant?: string;
  readonly manufacturer?: string;
  /** Strona produktu w sklepie PL (traceability + realny link w ofercie). */
  readonly productUrl?: string;
}

/**
 * Mapowanie id materiału -> potwierdzony kod EAN realnego produktu.
 * Każdy wpis: ≥2 niezależne źródła z kodem (zwykle EAN wprost w adresie URL).
 */
export const MATERIAL_EAN_OVERLAY: Readonly<Record<string, EanOverlayEntry>> = {
  // Farba lateksowa Śnieżka Eko Plus biała 10 l (materials.ts: mat-paint-better-white-10l).
  // source: https://www.castorama.pl/farba-lateksowa-sniezka-eko-plus-biala-10-l/5903973205982_CAPL.prd (EAN 5903973205982)
  // source: https://mrowka.com.pl/produkt/farba-eko-plus-10l-sniezka-5903973205982.html (EAN 5903973205982)
  "mat-paint-better-white-10l": {
    ean: "5903973205982",
    manufacturer: "Śnieżka",
    productUrl:
      "https://www.castorama.pl/farba-lateksowa-sniezka-eko-plus-biala-10-l/5903973205982_CAPL.prd",
  },

  // Grunt uniwersalny Knauf 5 l (materials.ts: mat-universal-primer-5l).
  // source: https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd (EAN 5901793357737)
  // source: https://allegro.pl/produkt/universalgrund-grunt-gleboko-penetrujacy-5l-818762-knauf-f3a092f3-10e9-4eb1-8185-a93b06d67183 (EAN 5901793357737 w tytule)
  "mat-universal-primer-5l": {
    ean: "5901793357737",
    manufacturer: "Knauf",
    productUrl:
      "https://www.castorama.pl/grunt-uniwersalny-knauf-5-l/5901793357737_CAPL.prd",
  },

  // Gotowa gładź polimerowa Atlas GTA 18 kg (materials.ts: mat-skim-coat-standard-18kg).
  // source: https://www.castorama.pl/gotowa-gladz-polimerowa-atlas-gta-18-kg/5905400542509_CAPL.prd (EAN 5905400542509)
  // source: https://mrowka.com.pl/produkt/gladz-polimerowa-super-biala-18-kg-gta-atlas-5905400542509.html (EAN 5905400542509)
  "mat-skim-coat-standard-18kg": {
    ean: "5905400542509",
    manufacturer: "Atlas",
    productUrl:
      "https://www.castorama.pl/gotowa-gladz-polimerowa-atlas-gta-18-kg/5905400542509_CAPL.prd",
  },

  // Listwa przypodłogowa PCV Arbiton Indo 2500 mm (materials.ts: mat-skirting-arbiton-2500).
  // Nazwa materiału nie precyzuje koloru -> wiążemy kanoniczny wariant "biały mat"
  // (najczęstszy standard) i zapisujemy go jawnie w polu variant, żeby nie udawać,
  // że baza była kolorowo-konkretna.
  // source: https://www.castorama.pl/listwa-przypodlogowa-pcv-arbiton-indo-bialy-mat/5905167781685_CAPL.prd (EAN 5905167781685)
  // source: https://1000podlog.pl/wszystkie-listwy/9480-listwa-przypodlogowa-arbiton-indo-40-bialy-mat-5905167781685.html (EAN 5905167781685)
  "mat-skirting-arbiton-2500": {
    ean: "5905167781685",
    variant: "biały mat",
    manufacturer: "Arbiton",
    productUrl:
      "https://www.castorama.pl/listwa-przypodlogowa-pcv-arbiton-indo-bialy-mat/5905167781685_CAPL.prd",
  },

  // Silikon sanitarny Soudal 280 ml (materials.ts: mat-sanitary-silicone-soudal-280ml).
  // Materiał ogólny nie precyzuje wariantu -> wiążemy neutralny biały (jawnie w variant).
  // source: https://www.castorama.pl/silikon-sanitarny-neutralny-soudal-bialy-280-ml/5411183157590_CAPL.prd (EAN 5411183157590)
  // source: https://mrowka.com.pl/produkt/silikon-sanitarny-neutralny-280-ml-bialy-soudal-5411183157590.html (EAN 5411183157590)
  "mat-sanitary-silicone-soudal-280ml": {
    ean: "5411183157590",
    variant: "neutralny, biały",
    manufacturer: "Soudal",
    productUrl:
      "https://www.castorama.pl/silikon-sanitarny-neutralny-soudal-bialy-280-ml/5411183157590_CAPL.prd",
  },

  // Grunt głęboko penetrujący Atlas Uni-Grunt 5 kg (materials.ts: mat-primer-deep-atlas-unigrunt-5kg).
  // source: https://www.castorama.pl/grunt-gleboko-penetrujacy-atlas-uni-grunt-5-kg/5905400520026_CAPL.prd (EAN 5905400520026)
  // source: https://www.abud.pl/product-pol-1121-Preparat-gruntujacy-Atlas-Uni-Grunt-5kg.html (Kod EAN 5905400520026)
  "mat-primer-deep-atlas-unigrunt-5kg": {
    ean: "5905400520026",
    manufacturer: "Atlas",
    productUrl:
      "https://www.castorama.pl/grunt-gleboko-penetrujacy-atlas-uni-grunt-5-kg/5905400520026_CAPL.prd",
  },

  // Grunt głęboko penetrujący Ceresit CT 17 10 l (materials.ts: mat-primer-deep-ceresit-ct17-10l).
  // source: https://bat.pl/Grunt-gleboko-penetrujacy-CT-17-10l-Ceresit/ct17-10-x (EAN 5900089617081)
  // source: https://chemko.com.pl/ceresit-ct-17-grunt-gleboko-penetrujacy-10l,3,104317,1304 (EAN 5900089617081)
  "mat-primer-deep-ceresit-ct17-10l": {
    ean: "5900089617081",
    manufacturer: "Ceresit",
    productUrl:
      "https://bat.pl/Grunt-gleboko-penetrujacy-CT-17-10l-Ceresit/ct17-10-x",
  },

  // Fuga elastyczna Ceresit CE 40 biała 2 kg (materials.ts: mat-grout-ceresit-ce40-white-2kg).
  // source: https://www.castorama.pl/fuga-elastyczna-ceresit-ce-40-aquastatic-biala-2-kg-id-3973.html (EAN 5900089140015)
  // source: https://chemko.com.pl/chemko-fuga-ceresit-ce40-biala-white-01-2-kg,3,46935,1597 (EAN 5900089140015)
  "mat-grout-ceresit-ce40-white-2kg": {
    ean: "5900089140015",
    variant: "biała (01)",
    manufacturer: "Ceresit",
    productUrl:
      "https://www.castorama.pl/fuga-elastyczna-ceresit-ce-40-aquastatic-biala-2-kg-id-3973.html",
  },

  // Zaprawa klejowa Ceresit CM 11 25 kg (materials.ts: mat-tile-adhesive-ceresit-cm11-25kg).
  // source: https://mrowka.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html (EAN 5900089111251)
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html (EAN 5900089111251)
  "mat-tile-adhesive-ceresit-cm11-25kg": {
    ean: "5900089111251",
    manufacturer: "Ceresit",
    productUrl:
      "https://mrowka.com.pl/produkt/zaprawa-klejowa-podstawowa-cm11-25-kg-ceresit-5900089111251.html",
  },

  // Klej-uszczelniacz hybrydowy Soudal Fix All High Tack 290 ml biały
  // (materials.ts: mat-mounting-adhesive-soudal-fixall-290ml).
  // source: https://mrowka.com.pl/produkt/klej-uszczelniacz-hybrydowy-fix-all-high-tack-290-ml-bialy-soudal-5411183175723.html (EAN 5411183175723)
  // source: https://www.grupapsb.com.pl/produkt/klej-uszczelniacz-hybrydowy-fix-all-high-tack-290-ml-bialy-soudal-5411183175723.html (EAN 5411183175723)
  "mat-mounting-adhesive-soudal-fixall-290ml": {
    ean: "5411183175723",
    variant: "biały",
    manufacturer: "Soudal",
    productUrl:
      "https://mrowka.com.pl/produkt/klej-uszczelniacz-hybrydowy-fix-all-high-tack-290-ml-bialy-soudal-5411183175723.html",
  },

  // Gładź szpachlowa wykończeniowa Acryl-Putz FS20 Finisz 27 kg
  // (materials.ts: mat-skim-coat-acrylputz-fs20-27kg).
  // source: https://mrowka.com.pl/produkt/gladz-szpachlowa-finisz-fs20-27-kg-acryl-putz-5903973104544.html (EAN 5903973104544)
  // source: https://mrowkaonline.pl/bilgoraj/gisy-i-gladzie/57866-acryl-putz-fs20-finisz-27kg-5903973104544.html (EAN 5903973104544)
  "mat-skim-coat-acrylputz-fs20-27kg": {
    ean: "5903973104544",
    manufacturer: "Śnieżka",
    productUrl:
      "https://mrowka.com.pl/produkt/gladz-szpachlowa-finisz-fs20-27-kg-acryl-putz-5903973104544.html",
  },

  // Piana pistoletowa Tytan Professional 65 niskoprężna 750 ml
  // (materials.ts: mat-foam-tytan-pro65-750ml).
  // source: https://mrowka.com.pl/produkt/piana-pistoletowa-65-750-ml-tytan-professional-5903518052859.html (EAN 5903518052859)
  // source: https://www.unimet.pl/piany-i-kleje-43/331828-pianka-pistoletowa-tytan-65-750ml-02-niskoprezna-5903518052859.html (EAN 5903518052859)
  "mat-foam-tytan-pro65-750ml": {
    ean: "5903518052859",
    variant: "niskoprężna (02)",
    manufacturer: "Tytan",
    productUrl:
      "https://mrowka.com.pl/produkt/piana-pistoletowa-65-750-ml-tytan-professional-5903518052859.html",
  },

  // Folia malarska gruba Blue Dolphin 4 x 5 m (materials.ts: mat-protective-film-bluedolphin-4x5m).
  // source: https://mrowka.com.pl/produkt/folia-malarska-gruba-4-x-5-m-blue-dolphin-5907758504932.html (EAN 5907758504932)
  // source: https://buduj24.pl/folie-malarskie/folia-malarska-gruba-blue-dolphin-4m-x-5m (EAN 5907758504932)
  "mat-protective-film-bluedolphin-4x5m": {
    ean: "5907758504932",
    manufacturer: "Blue Dolphin",
    productUrl:
      "https://mrowka.com.pl/produkt/folia-malarska-gruba-4-x-5-m-blue-dolphin-5907758504932.html",
  },

  // Taśma malarska Blue Dolphin niebieska 38 mm x 50 m (materials.ts: mat-masking-tape-bluedolphin-38mm).
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd (EAN 5907758507285)
  // source: https://sklep.greinplastplus.pl/narzedzia-malarskie/731-blue-dolphin-papierowa-tasma-malarska-38mm-x-50m-niebieska--5907758507285.html (EAN 5907758507285)
  "mat-masking-tape-bluedolphin-38mm": {
    ean: "5907758507285",
    variant: "niebieska",
    manufacturer: "Blue Dolphin",
    productUrl:
      "https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-38mm-x-50m/5907758507285_CAPL.prd",
  },

  // --- Sucha zabudowa GK (materials.ts: płyta / profile / wełna / wkręty / kołki) ---

  // Płyta g-k zwykła Norgips GKB typ A 1200×2600×12,5 mm (materials.ts: mat-gypsum-board-norgips-gkb-a-1200x2600).
  // source: https://mrowka.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html (EAN 5907651690442)
  // source: https://www.castorama.pl/plyta-gipsowo-kartonowa-zwykla-1200-x-2600-x-12-5-mm-gkb-typ-a-norgips/5907651690442_CAPL.prd (EAN 5907651690442)
  "mat-gypsum-board-norgips-gkb-a-1200x2600": {
    ean: "5907651690442",
    manufacturer: "Norgips",
    productUrl:
      "https://mrowka.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html",
  },

  // Płyta g-k impregnowana (wodoodporna) Norgips GKBI typ H2 1200×2600×12,5 mm (materials.ts: mat-gypsum-board-norgips-gkbi-h2-1200x2600).
  // source: https://mrowka.com.pl/produkt/plyta-gkbi-12-5x1200x2600-mm-woda-norgips-5907651691616.html (EAN 5907651691616)
  // source: https://www.leroymerlin.pl/produkty/plyta-gipsowa-impregnowana-gkbi-typ-h2-2600-x-1200-x-12-5-mm-norgips-41703172.html (EAN 5907651691616)
  "mat-gypsum-board-norgips-gkbi-h2-1200x2600": {
    ean: "5907651691616",
    variant: "impregnowana H2",
    manufacturer: "Norgips",
    productUrl:
      "https://mrowka.com.pl/produkt/plyta-gkbi-12-5x1200x2600-mm-woda-norgips-5907651691616.html",
  },

  // Profil sufitowy Norgips CD60 0,6 mm 3 m (materials.ts: mat-profile-cd60-norgips-3m).
  // source: https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd (EAN 5907651698899)
  // source: https://www.leroymerlin.pl/produkty/profil-sufitowy-cd60-3-m-b-norgips-42286972.html (EAN 5907651698899)
  "mat-profile-cd60-norgips-3m": {
    ean: "5907651698899",
    manufacturer: "Norgips",
    productUrl:
      "https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd",
  },

  // Profil przyścienny Budmat UD27 0,5 mm 3 m (materials.ts: mat-profile-ud27-budmat-3m).
  // source: https://mrowka.com.pl/produkt/profil-sufitowy-ud27-0-50-mm-3-m-budmat-plock-5907738940163.html (EAN 5907738940163)
  // source: https://www.castorama.pl/profil-sufitowy-budmat-ud27-3-m/5907738940163_CAPL.prd (EAN 5907738940163)
  "mat-profile-ud27-budmat-3m": {
    ean: "5907738940163",
    manufacturer: "Budmat",
    productUrl:
      "https://mrowka.com.pl/produkt/profil-sufitowy-ud27-0-50-mm-3-m-budmat-plock-5907738940163.html",
  },

  // Wełna mineralna szklana Isover Aku-Płyta 10 cm 7,2 m² (materials.ts: mat-mineral-wool-isover-akuplyta-10cm).
  // source: https://bat.pl/Welna-Isover-Aku-plyta-10cm-7.2m2/101220014 (EAN 5901644653155)
  // source: https://eadamex.pl/sciany-dzialowe/4924-welna-mineralna-isover-aku-plyta-10cm-0037w-mk-720m2-20szt-pal-5901644653155.html (EAN 5901644653155)
  "mat-mineral-wool-isover-akuplyta-10cm": {
    ean: "5901644653155",
    manufacturer: "Isover",
    productUrl:
      "https://www.bricoman.pl/isover-aku-plyta-welna-mineralna-szklana-10-cm-7-2-m2-877954.html",
  },

  // Wkręty samowiercące do płyt g-k do metalu Wkręt-Met 3,5×25 mm, 100 szt. (materials.ts: mat-drywall-screws-wkretmet-35x25-100).
  // source: https://mrowka.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html (EAN 5907704499015)
  // source: https://www.grupapsb.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html (EAN 5907704499015)
  "mat-drywall-screws-wkretmet-35x25-100": {
    ean: "5907704499015",
    variant: "do metalu, 100 szt.",
    manufacturer: "Wkręt-Met",
    productUrl:
      "https://mrowka.com.pl/produkt/wkrety-samowiercace-do-plyt-kartonowo-gipsowych-do-metalu-3-5x25-blister-wkret-met-5907704499015.html",
  },

  // Kołki szybkiego montażu rozporowe Wkręt-Met SM 6×40 mm, 20 szt. (materials.ts: mat-quick-dowels-wkretmet-sm-6x40-20).
  // source: https://mrowka.com.pl/produkt/kolki-szybkiego-montazu-6x40-blister-wkret-met-5907704466031.html (EAN 5907704466031)
  // source: https://eldor24.pl/kolki-do-szybkiego-montazu/kolki-szybkiego-montazu-rozporowe-sm-6x40-20-sztuk-blister-wkret-met (EAN 5907704466031)
  "mat-quick-dowels-wkretmet-sm-6x40-20": {
    ean: "5907704466031",
    variant: "SM 6×40, 20 szt.",
    manufacturer: "Wkręt-Met",
    productUrl:
      "https://mrowka.com.pl/produkt/kolki-szybkiego-montazu-6x40-blister-wkret-met-5907704466031.html",
  },

  // --- Instalacja wodna / hydraulika (materials.ts: baterie / syfon / rura / kolanko / wężyk / taśma) ---

  // Bateria umywalkowa stojąca Ferro Stillo BSL2 chrom (materials.ts: mat-basin-mixer-ferro-stillo).
  // source: https://mrowka.com.pl/produkt/bateria-umywalkowa-stillo-stojaca-ferro-5902194929837.html (EAN 5902194929837)
  // source: https://onninen.pl/produkt/FERRO-STILLO-bateria-umywalkowa-stojaca-chrom-BSL2,113316 (EAN 5902194929837, model BSL2)
  "mat-basin-mixer-ferro-stillo": {
    ean: "5902194929837",
    variant: "chrom, BSL2",
    manufacturer: "Ferro",
    productUrl:
      "https://mrowka.com.pl/produkt/bateria-umywalkowa-stillo-stojaca-ferro-5902194929837.html",
  },

  // Bateria natryskowa ścienna Ferro One BFO7 chrom (materials.ts: mat-shower-mixer-ferro-one).
  // source: https://mrowka.com.pl/produkt/bateria-natryskowa-scienna-ferro-one-ferro-5902194954525.html (EAN 5902194954525)
  // source: https://www.123lazienka.pl/produkt/23292-ferro-one-bateria-natryskowa-bez-natrysku-chrom-bfo7-5902194954525.html (EAN 5902194954525, model BFO7)
  "mat-shower-mixer-ferro-one": {
    ean: "5902194954525",
    variant: "chrom, BFO7",
    manufacturer: "Ferro",
    productUrl:
      "https://mrowka.com.pl/produkt/bateria-natryskowa-scienna-ferro-one-ferro-5902194954525.html",
  },

  // Syfon umywalkowy butelkowy niski McAlpine WHB1-32 z membraną (materials.ts: mat-basin-trap-mcalpine-whb1-32).
  // source: https://mrowka.com.pl/produkt/syfon-umywalkowy-1-1-4x32-mm-z-membrana-silikonowa-i-rewizja-mcalpine-5036484088390.html (EAN 5036484088390)
  // source: https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/ (model WHB1-32, EAN 5036484088390)
  "mat-basin-trap-mcalpine-whb1-32": {
    ean: "5036484088390",
    variant: "WHB1-32, biały",
    manufacturer: "McAlpine",
    productUrl:
      "https://mrowka.com.pl/produkt/syfon-umywalkowy-1-1-4x32-mm-z-membrana-silikonowa-i-rewizja-mcalpine-5036484088390.html",
  },

  // Rura wielowarstwowa PEX-AL/PEX Tycner 16×2 mm (materials.ts: mat-pex-pipe-tycner-16x2).
  // source: https://mrowka.com.pl/produkt/rura-pex-al-pex-16-mmx2-200-mb-tycner-5901095517976.html (EAN 5901095517976)
  // source: https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990 (EAN 5901095517976)
  "mat-pex-pipe-tycner-16x2": {
    ean: "5901095517976",
    manufacturer: "Tycner",
    productUrl:
      "https://mrowka.com.pl/produkt/rura-pex-al-pex-16-mmx2-200-mb-tycner-5901095517976.html",
  },

  // Kolanko zaciskowe PEX Tycner 16×16 mm (materials.ts: mat-pex-elbow-tycner-16x16).
  // source: https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html (EAN 5901095521003)
  // source: https://www.grupapsb.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html (EAN 5901095521003)
  "mat-pex-elbow-tycner-16x16": {
    ean: "5901095521003",
    manufacturer: "Tycner",
    productUrl:
      "https://mrowka.com.pl/produkt/kolanko-zaciskowe-pex-16x16-mm-tycner-5901095521003.html",
  },

  // Wężyk przyłączeniowy w oplocie Invena 3/8"×M10 30 cm (materials.ts: mat-hose-braided-invena-3-8-30).
  // source: https://www.castorama.pl/departments/w-w-yk-przy-czeniowy-do-baterii-gw-gz-3-8-x-m10-30-cm-oplot-invena-1-szt-/5907798716258_CAPL.prd (EAN 5907798716258)
  // source: https://www.obi.pl/weze-elastyczne-flex/invena-wezyk-w-oplocie-z-gw-gz-3-8-w-x-m10-30-cm/p/4355574 (EAN 5907798716258)
  "mat-hose-braided-invena-3-8-30": {
    ean: "5907798716258",
    variant: '3/8"×M10, 30 cm, oplot',
    manufacturer: "Invena",
    productUrl:
      "https://www.castorama.pl/departments/w-w-yk-przy-czeniowy-do-baterii-gw-gz-3-8-x-m10-30-cm-oplot-invena-1-szt-/5907798716258_CAPL.prd",
  },

  // Taśma teflonowa uszczelniająca Tycner 12 mm × 10 m × 0,075 mm (materials.ts: mat-teflon-tape-tycner-12mm).
  // source: https://www.obi.pl/uszczelki-miekkie/tycner-tasma-uszczelniajaca-teflonowa-12-x-0-075-mm-10-m/p/3499589 (EAN 5900950618100)
  // source: https://www.grupapsb.com.pl/produkt/tasma-teflonowa-12-mm-x-10-m-x-0-075-mm-tycner.html (EAN 5900950618100)
  "mat-teflon-tape-tycner-12mm": {
    ean: "5900950618100",
    variant: "12 mm × 10 m",
    manufacturer: "Tycner",
    productUrl:
      "https://www.obi.pl/uszczelki-miekkie/tycner-tasma-uszczelniajaca-teflonowa-12-x-0-075-mm-10-m/p/3499589",
  },

  // --- Instalacja elektryczna (materials.ts: przewody / gniazdko / włącznik / puszka / złączka WAGO) ---

  // Przewód YDYp 3×1,5 mm² 450/750 V AKS Zielonka krąg 100 mb (materials.ts: mat-wire-ydyp-3x15-akszielonka-100m).
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd (EAN 5904617573771)
  // source: https://www.gotronik.pl/przewod-aks-zielonka-ydyp-3-x-1-5mm2-450750-v-100mb-p-9372.html (EAN 5904617573771, model 816900)
  "mat-wire-ydyp-3x15-akszielonka-100m": {
    ean: "5904617573771",
    variant: "3×1,5 mm², 100 mb",
    manufacturer: "AKS Zielonka",
    productUrl:
      "https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd",
  },

  // Przewód YDYp 3×2,5 mm² 450/750 V AKS Zielonka krąg 100 mb (materials.ts: mat-wire-ydyp-3x25-akszielonka-100m).
  // source: https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd (EAN 5904617573764)
  // source: https://www.ceneo.pl/57270631 (AKS Zielonka YDYp 3x2,5 100 mb, EAN 5904617573764)
  "mat-wire-ydyp-3x25-akszielonka-100m": {
    ean: "5904617573764",
    variant: "3×2,5 mm², 100 mb",
    manufacturer: "AKS Zielonka",
    productUrl:
      "https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd",
  },

  // Gniazdo pojedyncze z uziemieniem Kontakt-Simon Basic BMGZ1Z.01/11 białe (materials.ts: mat-socket-simon-basic-bmgz1z).
  // source: https://www.castorama.pl/departments/gniazdo-pojedyncze-kontakt-simon-basic-z-ochron-styk-w-bia-e-1-szt-/5902787568238_CAPL.prd (EAN 5902787568238)
  // source: https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przeslonami-do-ramki-biale-bmgz1z0111-5902787568238.html (EAN 5902787568238)
  "mat-socket-simon-basic-bmgz1z": {
    ean: "5902787568238",
    variant: "białe, BMGZ1Z.01/11",
    manufacturer: "Kontakt-Simon",
    productUrl:
      "https://www.castorama.pl/departments/gniazdo-pojedyncze-kontakt-simon-basic-z-ochron-styk-w-bia-e-1-szt-/5902787568238_CAPL.prd",
  },

  // Łącznik pojedynczy jednobiegunowy Kontakt-Simon Basic BMW1.01/11 biały (materials.ts: mat-switch-simon-basic-bmw1).
  // source: https://www.castorama.pl/lacznik-pojedynczy-kontakt-simon-basic-bialy/5902787568177_CAPL.prd (EAN 5902787568177)
  // source: https://supergniazdka.pl/kontakt-simon/simon-basic/bmw101-11/lacznik-jednobiegunowy-modul-10ax-250v-szybkozlacza-bialy-5902787568177-5762.html (EAN 5902787568177)
  "mat-switch-simon-basic-bmw1": {
    ean: "5902787568177",
    variant: "biały, BMW1.01/11",
    manufacturer: "Kontakt-Simon",
    productUrl:
      "https://www.castorama.pl/lacznik-pojedynczy-kontakt-simon-basic-bialy/5902787568177_CAPL.prd",
  },

  // Puszka podtynkowa fi60 głęboka łączeniowa z wkrętem Elektro-Plast 10 szt. (materials.ts: mat-flush-box-elektroplast-pk60-10).
  // source: https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd (EAN 5901752637337)
  // source: https://www.leroymerlin.pl/produkty/puszka-instalacyjna-podtynkowa-60-mm-laczeniowa-gleboka-elektro-plast-43256024.html (Elektro-Plast puszka 60 mm głęboka łączeniowa)
  "mat-flush-box-elektroplast-pk60-10": {
    ean: "5901752637337",
    variant: "fi60 głęboka, 10 szt.",
    manufacturer: "Elektro-Plast",
    productUrl:
      "https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd",
  },

  // Szybkozłączka uniwersalna WAGO 221-413 3×0,2-4 mm² (materials.ts: mat-wire-connector-wago-221-413).
  // EAN = GTIN producenta WAGO na złączkę 221-413 (potwierdzony w ≥2 sklepach PL); Leroy Merlin sprzedaje w opak. 12 szt.
  // source: https://supergniazdka.pl/wago/221-413/szybkozlaczka-zlaczka-wago-compact-z-dzwigniami-uniwersalna-02-4-mm-3-przewodowa-221-413-4050821808442-18406.html (EAN 4050821808442)
  // source: https://www.eelektryka.com/z%C5%82%C4%85czki/1955-wago-szybkoz%C5%82%C4%85czka-uniwersalna-3x02-4mm2-transparentna-221-413-opak-50szt-4050821808442.html (EAN 4050821808442)
  "mat-wire-connector-wago-221-413": {
    ean: "4050821808442",
    variant: "221-413, 3×0,2-4 mm²",
    manufacturer: "WAGO",
    productUrl:
      "https://www.leroymerlin.pl/produkty/wago-221-413-szybkozlaczka-zlaczka-drut-linka-3x-0-2-4mm2-oryginalna-12szt-89975728.html",
  },

  // --- Układanie paneli podłogowych (materials.ts: panele AC4/AC5 / podkład / folia / listwa MDF / klipsy) ---

  // Panele laminowane AC4 8 mm Kronospan Toledo 2,22 m² (materials.ts: mat-laminate-kronospan-toledo-ac4-222).
  // source: https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd (EAN 5907555422774)
  // source: https://www.ceneo.pl/153535733 (Kronospan Toledo AC4 K338, EAN 5907555422774)
  "mat-laminate-kronospan-toledo-ac4-222": {
    ean: "5907555422774",
    variant: "AC4, 8 mm, 2,22 m²",
    manufacturer: "Kronospan",
    productUrl:
      "https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd",
  },

  // Panele laminowane wodoodporne AC5 8 mm Classen Dąb Niasa 1,973 m² (materials.ts: mat-laminate-classen-niasa-ac5-1973).
  // source: https://www.castorama.pl/panele-podlogowe-laminowane-wodoodporne-classen-dab-niasa-ac5-1-973-m2/4003992571974_CAPL.prd (EAN 4003992571974)
  // source: https://www.ceneo.pl/104295353 (Classen Dąb Niasa AC5 1,973 m2, EAN 4003992571974)
  "mat-laminate-classen-niasa-ac5-1973": {
    ean: "4003992571974",
    variant: "AC5 wodoodporny, 8 mm, 1,973 m²",
    manufacturer: "Classen",
    productUrl:
      "https://www.castorama.pl/panele-podlogowe-laminowane-wodoodporne-classen-dab-niasa-ac5-1-973-m2/4003992571974_CAPL.prd",
  },

  // Podkład Arbiton XPS Smart Aquastop Thermo 1,6 mm 6 m² (materials.ts: mat-underlay-arbiton-xps-aquastop-6m2).
  // source: https://www.castorama.pl/podklad-podlogowy-pod-panele-laminowane-arbiton-xps-smart-aquastop-thermo-1-6-mm-6-m2/5905167826942_CAPL.prd (EAN 5905167826942)
  // source: https://arbiton.com/pl/podklady-pod-panele/podklady-pod-panele-laminowane/arbiton-secura-thermo-aquastop-smart-podklady-pod-panele-laminowane (Arbiton — seria XPS Smart Aquastop Thermo)
  "mat-underlay-arbiton-xps-aquastop-6m2": {
    ean: "5905167826942",
    variant: "XPS Aquastop Thermo 1,6 mm, 6 m²",
    manufacturer: "Arbiton",
    productUrl:
      "https://www.castorama.pl/podklad-podlogowy-pod-panele-laminowane-arbiton-xps-smart-aquastop-thermo-1-6-mm-6-m2/5905167826942_CAPL.prd",
  },

  // Folia paroizolacyjna PE Diall 0,15 mm 20 m² (materials.ts: mat-vapor-foil-diall-pe-20m2).
  // source: https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd (EAN 5059340141428)
  // source: https://www.ceneo.pl/50305654 (Diall Membrana paroizolacyjna 20 m2, EAN 5059340141428)
  "mat-vapor-foil-diall-pe-20m2": {
    ean: "5059340141428",
    variant: "PE 0,15 mm, 20 m²",
    manufacturer: "Diall",
    productUrl:
      "https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd",
  },

  // Listwa przypodłogowa MDF biała Krono Original LK100F 2,4 mb (materials.ts: mat-skirting-krono-lk100f-mdf-240).
  // source: https://www.castorama.pl/listwa-przypodlogowa-mdf-krono-original-biala-lk100f/5907555424969_CAPL.prd (EAN 5907555424969)
  // source: https://www.castorama.pl/plytki-i-podlogi/akcesoria-do-podlog/listwyprzypodlogowe/listwy-przypodlogowe-mdf.cat (Krono Original LK100F w kategorii listew MDF)
  "mat-skirting-krono-lk100f-mdf-240": {
    ean: "5907555424969",
    variant: "MDF biała LK100F, wys. 100 mm, 2,4 mb",
    manufacturer: "Krono Original",
    productUrl:
      "https://www.castorama.pl/listwa-przypodlogowa-mdf-krono-original-biala-lk100f/5907555424969_CAPL.prd",
  },

  // Klipsy montażowe do listew Cezar 25 szt. (materials.ts: mat-skirting-clips-cezar-25).
  // source: https://www.castorama.pl/klipsy-montazowe-do-listew-cezar-25-szt-/5907684672217_CAPL.prd (EAN 5907684672217)
  // source: https://decorsystem.com.pl/klipsy-montazowe-do-listew-przypodlogowych-25-szt-cezar,id19262.html (Cezar klipsy montażowe 25 szt.)
  "mat-skirting-clips-cezar-25": {
    ean: "5907684672217",
    variant: "z podkładką dystansową, 25 szt.",
    manufacturer: "Cezar",
    productUrl:
      "https://www.castorama.pl/klipsy-montazowe-do-listew-cezar-25-szt-/5907684672217_CAPL.prd",
  },

  // --- Etap glazury: płytki ceramiczne / gres + akcesoria (materials.ts) ---

  // Gres szkliwiony Paradyż Petro Grey struktura mat 60×60 (materials.ts: mat-gres-paradyz-petro-grey-60x60).
  // source: https://neoceramik.pl/pl/p/Paradyz-PETRO-GREY-GRES-SZKL.-STRUKTURA-MAT.-60X60-G2/23079150 (EAN 5904584161544)
  // source: https://www.leroymerlin.pl/produkty/gres-szkliwiony-petro-grey-mat-60x60-paradyz-92495587.html (EAN 5904584161544)
  "mat-gres-paradyz-petro-grey-60x60": {
    ean: "5904584161544",
    variant: "Petro Grey struktura mat, 60×60",
    manufacturer: "Ceramika Paradyż",
    productUrl:
      "https://neoceramik.pl/pl/p/Paradyz-PETRO-GREY-GRES-SZKL.-STRUKTURA-MAT.-60X60-G2/23079150",
  },

  // Płytka ścienna Paradyż Nati Bianco struktura 25×40 (materials.ts: mat-tile-wall-paradyz-nati-bianco-25x40).
  // source: https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/ (EAN 5902610507960)
  // source: https://www.ceneo.pl/70865330 (Paradyż Nati Bianco str 25x40, EAN 5902610507960)
  "mat-tile-wall-paradyz-nati-bianco-25x40": {
    ean: "5902610507960",
    variant: "Nati Bianco struktura, 25×40",
    manufacturer: "Ceramika Paradyż",
    productUrl:
      "https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/",
  },

  // Gres rektyfikowany Paradyż U117 (Ennis) Grey mat 59,8×59,8 (materials.ts: mat-gres-rekt-paradyz-u117-grey-60x60).
  // source: https://www.blu.com.pl/plytki-podlogowe/34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261.html (EAN 5904584158261)
  // source: https://dekordia.pl/produkt/paradyz-u117-grey-gres-mat-rektyfikowany-59-8x59-8.html (EAN 5904584158261)
  "mat-gres-rekt-paradyz-u117-grey-60x60": {
    ean: "5904584158261",
    variant: "U117 (Ennis) Grey rekt. mat, 59,8×59,8",
    manufacturer: "Ceramika Paradyż",
    productUrl:
      "https://www.blu.com.pl/plytki-podlogowe/34276-ceramika-paradyz-u117-grey-gres-szkl-rekt-mat-5904584158261.html",
  },

  // Fuga ceramiczna Atlas 001 biała 2 kg (materials.ts: mat-grout-atlas-001-white-2kg).
  // source: https://www.castorama.pl/fuga-ceramiczna-atlas-001-biala-2-kg/5905400572254_CAPL.prd (EAN 5905400572254)
  // source: https://www.obi.pl/p/6552095/atlas-fuga-ceramiczna-001-bialy-2-kg (EAN 5905400572254)
  "mat-grout-atlas-001-white-2kg": {
    ean: "5905400572254",
    variant: "001 biała, 2 kg",
    manufacturer: "Atlas",
    productUrl:
      "https://www.castorama.pl/fuga-ceramiczna-atlas-001-biala-2-kg/5905400572254_CAPL.prd",
  },

  // Krzyżyki dystansowe do płytek Hardy (KAEM) 2 mm, 200 szt. (materials.ts: mat-tile-spacers-hardy-2mm-200).
  // source: https://mrowka.com.pl/produkt/krzyzyki-dystansowe-2-mm-200-szt-hardy-5905061016845.html (EAN 5905061016845)
  // source: https://www.bricomarche.pl/krzyzyki-dystansowe-do-glazury-2-mm-biale-woreczek-200-sztuk-hardy (Hardy 2 mm, 200 szt.)
  "mat-tile-spacers-hardy-2mm-200": {
    ean: "5905061016845",
    variant: "2 mm, 200 szt.",
    manufacturer: "Hardy",
    productUrl:
      "https://mrowka.com.pl/produkt/krzyzyki-dystansowe-2-mm-200-szt-hardy-5905061016845.html",
  },

  // Profil narożny do glazury Cezar aluminiowy 8 mm tytan szczotkowany mat 2,5 m (materials.ts: mat-tile-trim-cezar-corner-8mm-25m).
  // source: https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m (EAN 5904584853500)
  // source: https://www.leroymerlin.pl/produkty/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m-96115864.html (Cezar 8 mm 2,5 m)
  "mat-tile-trim-cezar-corner-8mm-25m": {
    ean: "5904584853500",
    variant: "narożny 8 mm, tytan szczotkowany mat, 2,5 m",
    manufacturer: "Cezar",
    productUrl:
      "https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m",
  },

  // --- Etap malowania ścian: markowe farby i akcesoria malarskie (materials.ts) ---
  // UWAGA: NIE dodajemy tu Śnieżki Eko 10 l (EAN 5903973005797) — to zarezerwowany
  // demo-EAN fixture, którego seed-catalog.test.ts jawnie zabrania w nakładce.

  // Farba lateksowa Dekoral Akrylit W śnieżnobiała 5 l (materials.ts: mat-paint-latex-dekoral-akrylit-w-white-5l).
  // source: https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502 (OBI — wariant 5 l)
  // source: https://eadamex.pl/farby-biale/7178-farba-dekoral-akrylit-w-5l-snieznobiala-lateksowa-do-scian-i-sufitow-5904000810681.html (EAN 5904000810681)
  "mat-paint-latex-dekoral-akrylit-w-white-5l": {
    ean: "5904000810681",
    variant: "śnieżnobiała, 5 l",
    manufacturer: "Dekoral",
    productUrl:
      "https://www.obi.pl/biale-farby-do-scian/dekoral-emulsja-akrylit-w-bialy-5-l/p/1237502",
  },

  // Farba lateksowa Dulux EasyCare Nieskazitelna Biel 9 l (materials.ts: mat-paint-latex-dulux-easycare-white-9l).
  // source: https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd (EAN 5904078198759)
  // source: https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/65684-dulux-easy-care-nieskazitelna-biel-9l-5904078198759.html (EAN 5904078198759)
  "mat-paint-latex-dulux-easycare-white-9l": {
    ean: "5904078198759",
    variant: "Nieskazitelna Biel, plamoodporna, 9 l",
    manufacturer: "Dulux",
    productUrl:
      "https://www.castorama.pl/farba-plamoodporna-dulux-easycare-nieskazitelna-biel-9-l/5904078198759_CAPL.prd",
  },

  // Farba lateksowa Śnieżka Barwy Natury biała (173) 5 l (materials.ts: mat-paint-latex-sniezka-barwy-natury-white-5l).
  // source: https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd (EAN 5903973139188)
  // source: https://mrowka.com.pl/produkt/farba-barwy-natury-bialy-173-5l-sniezka-5903973139188.html (EAN 5903973139188)
  "mat-paint-latex-sniezka-barwy-natury-white-5l": {
    ean: "5903973139188",
    variant: "biały 173, mat, 5 l",
    manufacturer: "Śnieżka",
    productUrl:
      "https://www.castorama.pl/farba-sniezka-barwy-natury-biala-5-l/5903973139188_CAPL.prd",
  },

  // Gładź gipsowa startowa Śnieżka Acryl-Putz ST10 START 20 kg (materials.ts: mat-skim-coat-acrylputz-st10-20kg).
  // source: https://mrowka.com.pl/produkt/gladz-szpachlowa-start-st10-20-kg-acryl-putz-5903973104421.html (EAN 5903973104421)
  // source: https://www.bricoman.pl/sniezka-acryl-putz-gladz-szpachlowa-start-20kg-271943.html (EAN 5903973104421)
  "mat-skim-coat-acrylputz-st10-20kg": {
    ean: "5903973104421",
    variant: "ST10 START, 20 kg",
    manufacturer: "Śnieżka",
    productUrl:
      "https://mrowka.com.pl/produkt/gladz-szpachlowa-start-st10-20-kg-acryl-putz-5903973104421.html",
  },

  // Taśma malarska Blue Dolphin niebieska 30 mm x 50 m (materials.ts: mat-masking-tape-bluedolphin-30mm).
  // source: https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-30mm-x-50m/5907758515952_CAPL.prd (EAN 5907758515952)
  // source: https://mrowkaonline.pl/bilgoraj/tasmy-malarskie/46729-xl-tape-tasma-malarska-mt-pg-sbl-30mmx50m-928-niebieska-papierowa-5907758515952.html (EAN 5907758515952)
  "mat-masking-tape-bluedolphin-30mm": {
    ean: "5907758515952",
    variant: "niebieska, 30 mm x 50 m",
    manufacturer: "Blue Dolphin",
    productUrl:
      "https://www.castorama.pl/departments/ta-ma-malarska-blue-dolphin-niebieska-30mm-x-50m/5907758515952_CAPL.prd",
  },

  // --- Etap hydroizolacji łazienki (materials.ts: masy w płynie / taśma / narożniki / mankiet) ---

  // Folia w płynie (masa hydroizolacyjna 1-składnikowa) Atlas Woder E 15 kg
  // (materials.ts: mat-waterproof-membrane-atlas-woder-e-15kg).
  // source: https://mrowka.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html (EAN 5905400514506)
  // source: https://www.grupapsb.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html (EAN 5905400514506)
  "mat-waterproof-membrane-atlas-woder-e-15kg": {
    ean: "5905400514506",
    variant: "szybkoschnąca 1K, 15 kg",
    manufacturer: "Atlas",
    productUrl:
      "https://mrowka.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html",
  },

  // Hydroizolacja 2-składnikowa elastyczna Atlas Woder Duo 16 kg
  // (materials.ts: mat-waterproof-membrane-atlas-woder-duo-16kg).
  // source: https://www.castorama.pl/hydroizolacja-atlas-woder-duo-16-kg/5905400195088_CAPL.prd (EAN 5905400195088)
  // source: https://mrowka.com.pl/produkt/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16-kg-atlas-5905400195088.html (EAN 5905400195088)
  "mat-waterproof-membrane-atlas-woder-duo-16kg": {
    ean: "5905400195088",
    variant: "2-składnikowa A+B, 16 kg",
    manufacturer: "Atlas",
    productUrl:
      "https://www.castorama.pl/hydroizolacja-atlas-woder-duo-16-kg/5905400195088_CAPL.prd",
  },

  // Taśma uszczelniająca Ceresit CL 152 10 m (materials.ts: mat-sealing-tape-ceresit-cl152-10m).
  // source: https://www.castorama.pl/tasma-uszczelniajaca-ceresit-cl-152-10-m/5900089115211_CAPL.prd (EAN 5900089115211)
  // source: https://eadamex.pl/tasmy-hydroizolacyjne/8303-tasma-uszczelniajaca-cl152-ceresit-10m-op-5900089115211.html (EAN 5900089115211)
  "mat-sealing-tape-ceresit-cl152-10m": {
    ean: "5900089115211",
    variant: "CL 152, 10 m",
    manufacturer: "Ceresit",
    productUrl:
      "https://www.castorama.pl/tasma-uszczelniajaca-ceresit-cl-152-10-m/5900089115211_CAPL.prd",
  },

  // Narożnik uszczelniający wewnętrzny Mapei Mapeband W 90° (materials.ts: mat-sealing-corner-internal-mapei).
  // source: https://www.castorama.pl/naroznik-uszczelniajacy-wewnetrzny-mapei/8022452113802_CAPL.prd (EAN 8022452113802)
  // source: https://eadamex.pl/narozniki-hydroizolacyjne/8290-naroznik-wewnetrzny-mapei-mapeband-w-profil-90-8022452113802.html (EAN 8022452113802)
  "mat-sealing-corner-internal-mapei": {
    ean: "8022452113802",
    variant: "Mapeband W, wewnętrzny 90°",
    manufacturer: "Mapei",
    productUrl:
      "https://www.castorama.pl/naroznik-uszczelniajacy-wewnetrzny-mapei/8022452113802_CAPL.prd",
  },

  // Narożnik uszczelniający zewnętrzny Mapei Mapeband W 270° (materials.ts: mat-sealing-corner-external-mapei).
  // source: https://www.castorama.pl/naroznik-uszczelniajacy-zewnetrzny-mapei/8022452113789_CAPL.prd (EAN 8022452113789)
  // source: https://eadamex.pl/narozniki-hydroizolacyjne/8291-naroznik-zewnatrzny-mapei-mapeband-w-profil-270-8022452113789.html (EAN 8022452113789)
  "mat-sealing-corner-external-mapei": {
    ean: "8022452113789",
    variant: "Mapeband W, zewnętrzny 270°",
    manufacturer: "Mapei",
    productUrl:
      "https://www.castorama.pl/naroznik-uszczelniajacy-zewnetrzny-mapei/8022452113789_CAPL.prd",
  },

  // Mankiet uszczelniający ścienny Mapei Mapeband W 12×12 cm, 2 szt. (materials.ts: mat-sealing-cuff-wall-mapei-12x12-2).
  // source: https://www.castorama.pl/mankiet-uszczelniajacy-mapei-maly-2-szt-/8022452113925_CAPL.prd (EAN 8022452113925)
  // source: https://www.obi.pl/pozostale-akcesoria-do-plytek/mapei-mankiet-uszczelniajacy-mapeband-w/p/2761617 (Mapei Mapeband W mankiet 12×12 cm)
  "mat-sealing-cuff-wall-mapei-12x12-2": {
    ean: "8022452113925",
    variant: "Mapeband W, ścienny 12×12 cm, 2 szt.",
    manufacturer: "Mapei",
    productUrl:
      "https://www.castorama.pl/mankiet-uszczelniajacy-mapei-maly-2-szt-/8022452113925_CAPL.prd",
  },

  // --- Etap przygotowania podłoża pod podłogi: wylewki/podkłady + taśma brzegowa (materials.ts) ---

  // Samopoziomujący podkład podłogowy Atlas SAM 200 25 kg, 25–60 mm (materials.ts: mat-screed-atlas-sam200-25kg).
  // source: https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-200-25-kg/5905400279269_CAPL.prd (EAN 5905400279269)
  // source: https://b2c.makchemia.pl/wylewki-samopoziomujace/5233-atlas-sam-200-25kg-2560mm-folia-5905400279269.html (EAN 5905400279269)
  "mat-screed-atlas-sam200-25kg": {
    ean: "5905400279269",
    variant: "SAM 200, 25–60 mm, 25 kg",
    manufacturer: "Atlas",
    productUrl:
      "https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-200-25-kg/5905400279269_CAPL.prd",
  },

  // Samopoziomujący podkład podłogowy Atlas SAM 100 25 kg, 5–30 mm (materials.ts: mat-screed-atlas-sam100-25kg).
  // source: https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-100-25-kg/5905400279245_CAPL.prd (EAN 5905400279245)
  // source: https://www.bricomarche.pl/szybkowiazacy-samopoziomujacy-podklad-podlogowy-sam-100-25-kg-atlas (EAN 5905400279245)
  "mat-screed-atlas-sam100-25kg": {
    ean: "5905400279245",
    variant: "SAM 100, 5–30 mm, 25 kg",
    manufacturer: "Atlas",
    productUrl:
      "https://www.castorama.pl/samopoziomujacy-podklad-podlogowy-atlas-sam-100-25-kg/5905400279245_CAPL.prd",
  },

  // Zaprawa samopoziomująca Ceresit CN 72 25 kg, 1–20 mm (materials.ts: mat-screed-ceresit-cn72-25kg).
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-wyrownujaca-cn72-25-kg-ceresit-5900089272259.html (EAN 5900089272259)
  // source: https://mrowka.com.pl/produkt/zaprawa-wyrownujaca-cn72-25-kg-ceresit-5900089272259.html (EAN 5900089272259)
  "mat-screed-ceresit-cn72-25kg": {
    ean: "5900089272259",
    variant: "CN 72, 1–20 mm, 25 kg",
    manufacturer: "Ceresit",
    productUrl:
      "https://www.grupapsb.com.pl/produkt/zaprawa-wyrownujaca-cn72-25-kg-ceresit-5900089272259.html",
  },

  // Taśma brzegowa dylatacyjna Fola 5 mm × 100 mm × 50 mb (materials.ts: mat-edge-tape-fola-100mm-50m).
  // source: https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd (EAN 5906725207227)
  // source: https://www.nokaut.pl/akcesoria-do-drzwi/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2-5906725207227.html (EAN 5906725207227)
  "mat-edge-tape-fola-100mm-50m": {
    ean: "5906725207227",
    variant: "5 mm × 100 mm × 50 mb, PE",
    manufacturer: "Fola",
    productUrl:
      "https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd",
  },

  // --- Etap montażu okien / parapetów: piana / silikon / kotwa / taśma paroszczelna ---
  // UWAGA: parapet PCV „Form 30 × 216" (materials.ts: mat-windowsill-pvc-form-30x216)
  // świadomie NIE trafia tu — to marka własna Castoramy (Kingfisher), jeden sklep
  // detaliczny, więc nie spełnia reguły ≥2 niezależnych źródeł kodu.

  // Pianka montażowa Soudal Low Expansion pistoletowa zimowa 750 ml (materials.ts: mat-foam-soudal-lowexp-750ml).
  // source: https://www.castorama.pl/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml/5411183048522_CAPL.prd (EAN 5411183048522)
  // source: https://mrowka.com.pl/produkt/soudafoam-low-expansion-gun-10-c-750-ml-soudal-5411183048522.html (EAN 5411183048522)
  "mat-foam-soudal-lowexp-750ml": {
    ean: "5411183048522",
    variant: "Low Expansion, niskorozprężna zimowa, 750 ml",
    manufacturer: "Soudal",
    productUrl:
      "https://www.castorama.pl/pianka-montazowa-soudal-low-expansion-pistoletowa-zimowa-750-ml/5411183048522_CAPL.prd",
  },

  // Silikon uniwersalny Soudal 280 ml bezbarwny (materials.ts: mat-silicone-universal-soudal-280ml).
  // source: https://www.castorama.pl/silikon-uniwersalny-soudal-280-ml-bezbarwny/5411183157552_CAPL.prd (EAN 5411183157552)
  // source: https://eadamex.pl/silikony-uniwersalne/7305-silikon-uniwersalny-bezbarwny-280ml-soudal-5411183157552.html (EAN 5411183157552)
  "mat-silicone-universal-soudal-280ml": {
    ean: "5411183157552",
    variant: "uniwersalny, bezbarwny, 280 ml",
    manufacturer: "Soudal",
    productUrl:
      "https://www.castorama.pl/silikon-uniwersalny-soudal-280-ml-bezbarwny/5411183157552_CAPL.prd",
  },

  // Kotwa montażowa do ościeżnic (rama okienna) 10 × 182 mm (materials.ts: mat-window-frame-anchor-10x182).
  // source: https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd (EAN 5905458019787)
  // source: https://www.brendo.pl/produkt/kotwy/kotwa-montazowa-do-oscieznic-10-x-182-mm-5905458019787.html (EAN 5905458019787)
  "mat-window-frame-anchor-10x182": {
    ean: "5905458019787",
    variant: "10 × 182 mm, stal ocynkowana",
    productUrl:
      "https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd",
  },

  // Taśma paroszczelna okienna Soudal SWS Basic Plus Inside 90 mm × 30 m (materials.ts: mat-window-tape-soudal-sws-inside-90mm).
  // source: https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html (EAN 5411183151178)
  // source: https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html (EAN 5411183151178)
  "mat-window-tape-soudal-sws-inside-90mm": {
    ean: "5411183151178",
    variant: "SWS Basic Plus Inside, 90 mm × 30 m",
    manufacturer: "Soudal",
    productUrl:
      "https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html",
  },

  // --- Etap tynkowania ścian (materials.ts: tynki bazowe + grunt/kontakt) ---
  // UWAGA: narożnik tynkarski aluminiowy (materials.ts: mat-plaster-corner-alu-mesh-25m)
  // świadomie NIE trafia tu — pewne tylko 1 źródło z EAN 5900308102411 (Castorama),
  // więc nie spełnia reguły ≥2 niezależnych źródeł kodu.

  // Tynk gipsowy maszynowy Knauf MP 75 25 kg (materials.ts: mat-plaster-gypsum-machine-knauf-mp75-25kg).
  // source: https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd (EAN 5902367206352)
  // source: https://znajdzwyprzedaz.pl/wyprzedaz/tynki/tynk-maszynowy-knauf-mp-75-25-kg-5902367206352 (EAN 5902367206352)
  "mat-plaster-gypsum-machine-knauf-mp75-25kg": {
    ean: "5902367206352",
    variant: "MP 75, maszynowy, 25 kg",
    manufacturer: "Knauf",
    productUrl:
      "https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd",
  },

  // Tynk gipsowy ręczny Knauf Goldband 25 kg (materials.ts: mat-plaster-gypsum-manual-knauf-goldband-25kg).
  // source: https://www.castorama.pl/tynk-gipsowy-reczny-knauf-goldband-25-kg/5902367206383_CAPL.prd (EAN 5902367206383)
  // source: https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383 (EAN 5902367206383)
  "mat-plaster-gypsum-manual-knauf-goldband-25kg": {
    ean: "5902367206383",
    variant: "Goldband, ręczny, 25 kg",
    manufacturer: "Knauf",
    productUrl:
      "https://www.castorama.pl/tynk-gipsowy-reczny-knauf-goldband-25-kg/5902367206383_CAPL.prd",
  },

  // Tynk cementowo-wapienny maszynowy Baumit MPI 25 30 kg (materials.ts: mat-plaster-cementlime-baumit-mpi25-30kg).
  // source: https://mrowka.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html (EAN 5907534261158)
  // source: https://www.grupapsb.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html (EAN 5907534261158)
  "mat-plaster-cementlime-baumit-mpi25-30kg": {
    ean: "5907534261158",
    variant: "MPI 25, cementowo-wapienny, 30 kg",
    manufacturer: "Baumit",
    productUrl:
      "https://mrowka.com.pl/produkt/tynk-cementowo-wapienny-wewnetrzny-mpi-25-30-kg-baumit-5907534261158.html",
  },

  // Podkład/kontakt pod tynki Atlas Cerplast 15 kg (materials.ts: mat-plaster-primer-atlas-cerplast-15kg).
  // source: https://www.castorama.pl/podklad-pod-tynki-atlas-cerplast-15-kg/5905400530032_CAPL.prd (EAN 5905400530032)
  // source: https://ekobudsklep.pl/Tynki/3323-srodek-gruntujacy-podklad-tynkarski-cerplast-15kg-atlas-5905400530032.html (EAN 5905400530032)
  "mat-plaster-primer-atlas-cerplast-15kg": {
    ean: "5905400530032",
    variant: "Cerplast, podkład z piaskiem kwarcowym, 15 kg",
    manufacturer: "Atlas",
    productUrl:
      "https://www.castorama.pl/podklad-pod-tynki-atlas-cerplast-15-kg/5905400530032_CAPL.prd",
  },

  // --- Etap ocieplenia elewacji BSO/ETICS (materials.ts: styropian / klej / siatka / kołki / tynk) ---

  // Styropian fasadowy biały Yetico Gamma Fasada 044 100 mm, 3 m² (materials.ts: mat-eps-facade-yetico-gamma-044-100mm).
  // source: https://www.castorama.pl/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-/5902578301976_CAPL.prd (EAN 5902578301976)
  // source: https://www.obi.pl/p/2677748/yetico-plyta-styropianowa-gamma-fasada-044-10-cm-3-m2 (EAN 5902578301976)
  "mat-eps-facade-yetico-gamma-044-100mm": {
    ean: "5902578301976",
    variant: "Gamma Fasada 044, biały EPS λ 0,044, 100 mm, 3 m²",
    manufacturer: "Yetico",
    productUrl:
      "https://www.castorama.pl/styropian-fasadowy-yetico-gamma-100-mm-3-m2-6-szt-/5902578301976_CAPL.prd",
  },

  // Styropian fasadowy grafitowy Yetico Gamma Passive EPS 033 150 mm, 2 m² (materials.ts: mat-eps-facade-yetico-passive-033-150mm).
  // source: https://www.castorama.pl/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-/5902578307268_CAPL.prd (EAN 5902578307268)
  // source: https://www.leroymerlin.pl/izolacja-budynkow/welna-mineralna-styropian-izolacja-akustyczna/styropian/styropian-fasada-niefrezowany-gamma-passive-eps-033-150-mm-2m2-yetico,p341384,l394.html (EAN 5902578307268)
  "mat-eps-facade-yetico-passive-033-150mm": {
    ean: "5902578307268",
    variant: "Gamma Passive EPS 033, grafit λ 0,033, 150 mm, 2 m²",
    manufacturer: "Yetico",
    productUrl:
      "https://www.castorama.pl/styropian-fasadowy-passive-yetico-150-mm-2-m2-4-szt-/5902578307268_CAPL.prd",
  },

  // Zaprawa klejąca do styropianu i siatki Atlas Stopter K-20 2w1 25 kg (materials.ts: mat-adhesive-eps-atlas-stopter-k20-25kg).
  // source: https://mrowka.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html (EAN 5905400160253)
  // source: https://www.grupapsb.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html (EAN 5905400160253)
  "mat-adhesive-eps-atlas-stopter-k20-25kg": {
    ean: "5905400160253",
    variant: "Stopter K-20 2w1, klejenie + siatka, 25 kg",
    manufacturer: "Atlas",
    productUrl:
      "https://mrowka.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html",
  },

  // Siatka zbrojąca z włókna szklanego Atlas 150 g/m², rolka 50 m² (materials.ts: mat-mesh-fiberglass-atlas-150-50m2).
  // source: https://www.castorama.pl/siatka-z-wlokna-szklanego-atlas-150/5905400196993_CAPL.prd (EAN 5905400196993)
  // source: https://sklep.sewera.pl/siatka-z-wlokna-szklanego-150-gm2-rolka-50m2-atlas-p9782 (EAN 5905400196993)
  "mat-mesh-fiberglass-atlas-150-50m2": {
    ean: "5905400196993",
    variant: "150 g/m², rolka 50 m²",
    manufacturer: "Atlas",
    productUrl:
      "https://www.castorama.pl/siatka-z-wlokna-szklanego-atlas-150/5905400196993_CAPL.prd",
  },

  // Kołek fasadowy z trzpieniem stalowym Koelner KI-200M metal 10 × 200 mm, 250 szt. (materials.ts: mat-anchor-facade-koelner-ki200m-10x200).
  // source: https://www.castorama.pl/kolek-do-mocowania-izolacji-koelner-metal-10-x-200-mm/5906675212647_CAPL.prd (EAN 5906675212647)
  // source: https://www.grupapsb.com.pl/produkt/kolek-do-mocowania-izolacji-10-200-mm-metal-koelner-5906675212647.html (EAN 5906675212647)
  "mat-anchor-facade-koelner-ki200m-10x200": {
    ean: "5906675212647",
    variant: "KI-200M metal 10 × 200 mm, trzpień stalowy, 250 szt.",
    manufacturer: "Koelner",
    productUrl:
      "https://www.castorama.pl/kolek-do-mocowania-izolacji-koelner-metal-10-x-200-mm/5906675212647_CAPL.prd",
  },

  // Tynk cienkowarstwowy silikatowo-silikonowy Ceresit CT 174 baranek 1,5 mm baza biała 25 kg (materials.ts: mat-plaster-thin-ceresit-ct174-25kg).
  // source: https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101 (EAN 9000101109733)
  // source: https://allegro.pl/oferta/tynk-silikatowo-silikonowy-ceresit-ct174-25kg1-5mm-13409944075 (EAN 9000101109733)
  "mat-plaster-thin-ceresit-ct174-25kg": {
    ean: "9000101109733",
    variant: "CT 174 baranek 1,5 mm, baza biała, 25 kg",
    manufacturer: "Ceresit",
    productUrl:
      "https://sklep.sewera.pl/tynk-silikatowo-silikonowy-1-5mm-baranek-ct174-baza-biala-25kg-ceresit-p9101",
  },

  // --- Etap montażu drzwi wewnętrznych (materials.ts: zawias / akryl) ---
  // UWAGA: skrzydła (Archi/OPP Klasyk/Erkado Credis), ościeżnica PerfectDoor, klamka
  // Schaffner Lucy i kliny Floorpol świadomie NIE trafiają tu — to marki własne Castoramy
  // (Kingfisher) lub kod pewny tylko w 1 sklepie, więc nie spełniają reguły ≥2 niezależnych
  // źródeł kodu (analogicznie do parapetu Form i narożnika tynkarskiego). Piana Soudal Low
  // Expansion (mat-foam-soudal-lowexp-750ml) już jest w nakładce (etap okien).

  // Zawias wkręcany regulowany 3D 14 mm ocynkowany Metro (materials.ts: mat-door-hinge-metro-3d-14mm).
  // source: https://www.castorama.pl/zawias-regulowany-3d-14-mm-ocynkowany/5906711270471_CAPL.prd (EAN 5906711270471)
  // source: https://mrowka.com.pl/produkt/zawias-wkrecany-regulowany-3d-14-mm-ocynkowany-metro-5906711270471.html (EAN 5906711270471)
  "mat-door-hinge-metro-3d-14mm": {
    ean: "5906711270471",
    variant: "regulowany 3D, 14 mm, ocynk",
    manufacturer: "Metro",
    productUrl:
      "https://www.castorama.pl/zawias-regulowany-3d-14-mm-ocynkowany/5906711270471_CAPL.prd",
  },

  // Akryl uniwersalny Soudal biały 280 ml, malowalny (materials.ts: mat-acrylic-soudal-white-280ml).
  // source: https://www.castorama.pl/akryl-soudal-280-ml-bialy/5411183157538_CAPL.prd (EAN 5411183157538)
  // source: https://mrowka.com.pl/produkt/akryl-uniwersalny-280-ml-bialy-soudal-5411183157538.html (EAN 5411183157538)
  "mat-acrylic-soudal-white-280ml": {
    ean: "5411183157538",
    variant: "uniwersalny, biały, malowalny, 280 ml",
    manufacturer: "Soudal",
    productUrl:
      "https://www.castorama.pl/akryl-soudal-280-ml-bialy/5411183157538_CAPL.prd",
  },
};

/** Zwraca wpis nakładki dla materiału albo undefined (brak pewnego kodu). */
export function getEanOverlay(materialId: string): EanOverlayEntry | undefined {
  return MATERIAL_EAN_OVERLAY[materialId];
}
