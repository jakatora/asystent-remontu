// FIXTURE z PRAWDZIWYMI danymi feedu produktowego PSB Mrówka (mrowkaonline.pl).
//
// DLACZEGO fixture, a nie live-fetch domyślnie: adapter potrafi pobrać feed z
// MROWKA_FEED_URL (patrz mrowka.source.ts), ale gdy URL nie jest skonfigurowany,
// używa tej migawki realnych danych — żeby CLI i testy działały deterministycznie
// bez sieci. Kształt itemów jest 1:1 zgodny z feedem (Google Merchant / Ceneo).
//
// Rekord poniżej ma TEN SAM EAN co produkt w adapterze Leroy Merlin
// (5903973005797, Śnieżka Eko 10 l), więc po zebraniu z obu sklepów katalog ma
// >=2 oferty na ten sam EAN i selectCheapestOffer ma co porównywać
// (Leroy 79,98 zł vs Mrówka 86,99 zł -> najtańszy Leroy).

import type { ProductFeedItem } from "./mrowka.feed";

export const MROWKA_FEED_FIXTURE: readonly ProductFeedItem[] = [
  {
    // EAN potwierdzony w 2 niezależnych źródłach (kod widoczny w adresie URL
    // oraz w treści karty produktu):
    // source: https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/43071-eko-sniezka-emulsja-biala-10l-5903973005797.html (EAN 5903973005797, cena 86,99 zł)
    // source: https://bat.pl/Farba-akrylowa-Sniezka-Eko-10L/SNIEZKA. (potwierdzenie EAN 5903973005797)
    gtin: "5903973005797",
    mpn: "far.snie.73005797",
    title: "Farba Akrylowa Eko Biała 10 l Śnieżka",
    brand: "Śnieżka",
    productType: "Farby > Farby ścienne > Białe",
    // source: https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/43071-eko-sniezka-emulsja-biala-10l-5903973005797.html
    link: "https://mrowkaonline.pl/bilgoraj/farby-scienne-biale/43071-eko-sniezka-emulsja-biala-10l-5903973005797.html",
    // source: zdjęcie karty produktu mrowkaonline.pl (sierpień 2026)
    imageLink:
      "https://mrowkaonline.pl/bilgoraj/86562-large_default/eko-sniezka-emulsja-biala-10l.jpg",
    // source: cena 86,99 zł (brutto) — karta produktu mrowkaonline.pl (sierpień 2026)
    price: "86,99",
    salePrice: null,
    // availability nie jest jednoznacznie podana na karcie -> null (bez zgadywania)
    availability: null,
    unitPricingMeasure: "10 l",
  },
];
