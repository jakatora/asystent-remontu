// FIXTURE z PRAWDZIWYMI danymi produktowego feedu Castorama PL (castorama.pl).
//
// DLACZEGO fixture, a nie live-fetch domyślnie: adapter potrafi pobrać feed z
// STORE2_FEED_URL (patrz castorama.source.ts), ale gdy URL nie jest
// skonfigurowany, używa tej migawki realnych danych — żeby CLI i testy działały
// deterministycznie bez sieci. Kształt itemów jest 1:1 zgodny z feedem
// produktowym (Google Merchant / Ceneo).
//
// Rekord poniżej ma TEN SAM EAN co produkty w adapterach Leroy Merlin i Mrówka
// (5903973005797, Śnieżka Eko 10 l), więc po zebraniu z tych sklepów katalog ma
// >=2 REALNE oferty na ten sam EAN i selectCheapestOffer ma realny wybór między
// sklepami: Leroy 79,98 zł < Mrówka 86,99 zł < Castorama 94,98 zł -> najtańszy Leroy.

import type { ProductFeedItem } from "./mrowka.feed";

export const CASTORAMA_FEED_FIXTURE: readonly ProductFeedItem[] = [
  {
    // EAN potwierdzony w 2 niezależnych miejscach TEJ SAMEJ karty produktu Castoramy
    // (kod w adresie URL oraz w treści karty), spójny z Leroy Merlin i Mrówką:
    // source: https://www.castorama.pl/farba-akrylowa-sniezka-eko-biala-10-l/5903973005797_CAPL.prd (EAN 5903973005797 w URL i w karcie produktu)
    // source: https://bat.pl/Farba-akrylowa-Sniezka-Eko-10L/SNIEZKA. (potwierdzenie EAN 5903973005797)
    gtin: "5903973005797",
    mpn: null,
    title: "Farba akrylowa Śnieżka Eko biała 10 l",
    brand: "Śnieżka",
    productType: "Malowanie > Farby wewnętrzne > Białe",
    // source: https://www.castorama.pl/farba-akrylowa-sniezka-eko-biala-10-l/5903973005797_CAPL.prd
    link: "https://www.castorama.pl/farba-akrylowa-sniezka-eko-biala-10-l/5903973005797_CAPL.prd",
    // Brak zweryfikowanego stabilnego URL zdjęcia (CDN karty jest dynamiczny) -> null (bez zgadywania).
    imageLink: null,
    // source: cena 94,98 zł/szt (9,50 zł/l) — karta produktu castorama.pl (sierpień 2026)
    price: "94,98",
    salePrice: null,
    // source: "In stock / można dodać do koszyka" — karta produktu castorama.pl (sierpień 2026)
    availability: "in_stock",
    unitPricingMeasure: "10 l",
  },
];
