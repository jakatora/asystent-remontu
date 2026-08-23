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
};

/** Zwraca wpis nakładki dla materiału albo undefined (brak pewnego kodu). */
export function getEanOverlay(materialId: string): EanOverlayEntry | undefined {
  return MATERIAL_EAN_OVERLAY[materialId];
}
