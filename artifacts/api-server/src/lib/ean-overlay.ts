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
};

/** Zwraca wpis nakładki dla materiału albo undefined (brak pewnego kodu). */
export function getEanOverlay(materialId: string): EanOverlayEntry | undefined {
  return MATERIAL_EAN_OVERLAY[materialId];
}
