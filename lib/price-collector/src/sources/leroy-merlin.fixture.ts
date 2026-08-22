// FIXTURE z PRAWDZIWYMI danymi produktów Leroy Merlin PL.
//
// DLACZEGO fixture, a nie live-fetch: Leroy Merlin nie udostępnia publicznego
// feedu produktowego, a bezpośredni fetch stron zwraca HTTP 403 (bot-blok).
// Zgodnie z regułami projektu NIE omijamy blokad scrapingiem — adapter czyta
// migawkę realnych danych z pliku poniżej. Każdy rekord ma URL strony produktu
// i komentarz `// source:` z pochodzeniem ceny/EAN. Gdy pojawi się legalny feed
// (oficjalne API / XML), wystarczy podmienić źródło danych w adapterze.
//
// Ceny: migawka z indeksu wyszukiwarki leroymerlin.pl (sierpień 2026) — format
// PL (przecinek dziesiętny) celowo, żeby przejść przez normalizację cen.

export interface LeroyFixtureRecord {
  ean: string | null;
  gtin: string | null;
  manufacturer: string | null;
  brand: string | null;
  name: string;
  category: string | null;
  packageSize: number | null;
  packageUnit: string | null;
  imageUrl: string | null;
  productUrl: string;
  price: string | null;
  promoPrice: string | null;
  regularPrice: string | null;
  availability: string | null;
}

export const LEROY_MERLIN_FIXTURE: readonly LeroyFixtureRecord[] = [
  {
    // EAN potwierdzony w 2 niezależnych źródłach (kod w adresie URL):
    // source: https://bat.pl/Farba-akrylowa-Sniezka-Eko-10L/SNIEZKA. (5903973005797)
    // source: https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/43071-eko-sniezka-emulsja-biala-10l-5903973005797.html
    ean: "5903973005797",
    gtin: null,
    manufacturer: "Śnieżka",
    brand: "Śnieżka",
    name: "Farba Śnieżka Eko hipoalergiczna Biały 10 l",
    category: "farby-scienne-biale",
    packageSize: 10,
    packageUnit: "l",
    imageUrl: null,
    // source: https://www.leroymerlin.pl/produkty/farba-sniezka-eko-hipoalergiczna-bialy-10-l-43041761.html
    productUrl:
      "https://www.leroymerlin.pl/produkty/farba-sniezka-eko-hipoalergiczna-bialy-10-l-43041761.html",
    // source: cena 79,98 zł/szt — indeks leroymerlin.pl (sierpień 2026)
    price: "79,98",
    promoPrice: null,
    regularPrice: null,
    availability: null,
  },
  {
    // EAN nieznany z wiarygodnego źródła -> null. Orkiestrator utworzy NOWY
    // wpis produktu (NIGDY nie łączymy po samej nazwie).
    ean: null,
    gtin: null,
    manufacturer: "Śnieżka",
    brand: "Śnieżka",
    name: "Farba wewnętrzna Max White Effect 10 l biała Śnieżka",
    category: "farby-scienne-biale",
    packageSize: 10,
    packageUnit: "l",
    imageUrl: null,
    // source: https://www.leroymerlin.pl/produkty/farba-wewnetrzna-max-white-effect-10-l-15-biala-sniezka-45584434.html
    productUrl:
      "https://www.leroymerlin.pl/produkty/farba-wewnetrzna-max-white-effect-10-l-15-biala-sniezka-45584434.html",
    // source: cena 145 zł/szt — indeks leroymerlin.pl (sierpień 2026)
    price: "145,00",
    promoPrice: null,
    regularPrice: null,
    availability: null,
  },
];
