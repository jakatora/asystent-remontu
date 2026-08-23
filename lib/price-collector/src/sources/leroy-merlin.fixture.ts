// FIXTURE z PRAWDZIWYMI danymi produktowego feedu Leroy Merlin PL (leroymerlin.pl).
//
// DLACZEGO fixture, a nie live-fetch domyślnie: adapter potrafi pobrać feed z
// STORE3_FEED_URL (patrz leroy-merlin.source.ts), ale gdy URL nie jest
// skonfigurowany, używa tej migawki realnych danych — żeby CLI i testy działały
// deterministycznie bez sieci. Leroy Merlin nie udostępnia publicznego feedu do
// swobodnego pobierania, a bezpośredni fetch stron zwraca HTTP 403 (bot-blok);
// zgodnie z regułami projektu NIE omijamy blokad scrapingiem — gdy pojawi się
// legalny URL feedu, wystarczy ustawić STORE3_FEED_URL, a kształt itemów jest
// 1:1 zgodny z feedem produktowym (Google Merchant / Ceneo).
//
// Rekord z EAN poniżej ma TEN SAM EAN co produkty w adapterach Mrówka i Castorama
// (5903973005797, Śnieżka Eko 10 l), więc po zebraniu z tych sklepów katalog ma
// >=3 REALNE oferty na ten sam EAN i selectCheapestOffer ma realny wybór między
// sklepami: Leroy 79,98 zł < Mrówka 86,99 zł < Castorama 94,98 zł -> najtańszy Leroy.

import type { ProductFeedItem } from "./mrowka.feed";

export const LEROY_MERLIN_FEED_FIXTURE: readonly ProductFeedItem[] = [
  {
    // EAN potwierdzony w 2 niezależnych źródłach (kod w adresie URL):
    // source: https://bat.pl/Farba-akrylowa-Sniezka-Eko-10L/SNIEZKA. (5903973005797)
    // source: https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/43071-eko-sniezka-emulsja-biala-10l-5903973005797.html
    gtin: "5903973005797",
    mpn: null,
    title: "Farba Śnieżka Eko hipoalergiczna Biały 10 l",
    brand: "Śnieżka",
    productType: "Malowanie > Farby wewnętrzne > Białe",
    // source: https://www.leroymerlin.pl/produkty/farba-sniezka-eko-hipoalergiczna-bialy-10-l-43041761.html
    link: "https://www.leroymerlin.pl/produkty/farba-sniezka-eko-hipoalergiczna-bialy-10-l-43041761.html",
    // Brak zweryfikowanego stabilnego URL zdjęcia (CDN karty jest dynamiczny) -> null (bez zgadywania).
    imageLink: null,
    // source: cena 79,98 zł/szt — indeks leroymerlin.pl (sierpień 2026)
    price: "79,98",
    salePrice: null,
    availability: "in_stock",
    unitPricingMeasure: "10 l",
  },
  {
    // EAN nieznany z wiarygodnego źródła -> null. Orkiestrator utworzy NOWY
    // wpis produktu (NIGDY nie łączymy po samej nazwie).
    gtin: null,
    mpn: null,
    title: "Farba wewnętrzna Max White Effect 10 l biała Śnieżka",
    brand: "Śnieżka",
    productType: "Malowanie > Farby wewnętrzne > Białe",
    // source: https://www.leroymerlin.pl/produkty/farba-wewnetrzna-max-white-effect-10-l-15-biala-sniezka-45584434.html
    link: "https://www.leroymerlin.pl/produkty/farba-wewnetrzna-max-white-effect-10-l-15-biala-sniezka-45584434.html",
    imageLink: null,
    // source: cena 145 zł/szt — indeks leroymerlin.pl (sierpień 2026)
    price: "145,00",
    salePrice: null,
    availability: "in_stock",
    unitPricingMeasure: "10 l",
  },
];
