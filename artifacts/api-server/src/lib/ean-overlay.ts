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
};

/** Zwraca wpis nakładki dla materiału albo undefined (brak pewnego kodu). */
export function getEanOverlay(materialId: string): EanOverlayEntry | undefined {
  return MATERIAL_EAN_OVERLAY[materialId];
}
