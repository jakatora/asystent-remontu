import type { StoreDeliveryPolicy } from '../../../../lib/pricing-service/src/delivery';

/** Reviewed delivery pages, fetched 2026-10-25. These are LOWER BOUNDS for
 * prepaid home delivery in Poland, not guessed fees for an arbitrary basket.
 * Weight, dimensions, payment and postcode can change the checkout quote. */
export const STORE_DELIVERY_POLICIES: readonly StoreDeliveryPolicy[] = [
  // source: https://chemiadoparkietu25.pl/pol-delivery.html
  {store:'ChemiaDoParkietu25',minimumGrosze:null,checkedAt:null,sourceUrl:'https://chemiadoparkietu25.pl/pol-delivery.html'},
  // source: https://ewinyl.pl/koszyk/
  {store:'eWinyl',minimumGrosze:null,checkedAt:null,sourceUrl:'https://ewinyl.pl/koszyk/'},
  // Cost depends on the exact cart; quotation confirms any free threshold.
  // source: https://dekoratormarket.pl/zasady-wysylki-pm-16.html
  {store:'DekoratorMarket',minimumGrosze:null,checkedAt:null,sourceUrl:'https://dekoratormarket.pl/zasady-wysylki-pm-16.html'},
  // A zero charge requires a current selected whole-basket quotation.
  // source: https://www.mlazienka.pl/koszty-dostawy
  {store:'mŁazienka',minimumGrosze:null,checkedAt:null,sourceUrl:'https://www.mlazienka.pl/koszty-dostawy'},
  // source: https://integra-bielinscy.pl/content/1-koszty-dostawy
  {store:'Integra Bielińscy',minimumGrosze:null,checkedAt:null,sourceUrl:'https://integra-bielinscy.pl/content/1-koszty-dostawy'},
  // Separate seller and checkout shipping; do not inherit Castorama's tariff.
  // source: https://www.castorama.pl/verified-sellers/seller/2601
  {store:'Corksystem (Castorama)',minimumGrosze:null,checkedAt:null,sourceUrl:'https://www.castorama.pl/verified-sellers/seller/2601'},
  { store:'Kronosfera',minimumGrosze:null,checkedAt:null,sourceUrl:'https://kronosfera.pl/dostawa' },
  // Current native delivery quotes supersede the older amounts on this page.
  { store: 'Folnet', minimumGrosze: null, checkedAt: null, sourceUrl: 'https://folnet.pl/pl/delivery.html' },
  { store: 'Betterial', minimumGrosze: null, checkedAt: null,
    // source: https://betterial.pl/content/4-transport
    sourceUrl: 'https://betterial.pl/content/4-transport' },
  { store: 'Zino', minimumGrosze: null, checkedAt: null,
    // source: https://sklep.zino.pl/pl/basket
    sourceUrl: 'https://sklep.zino.pl/pl/basket' },
  {
    store: 'Sewera', minimumGrosze: 1990, checkedAt: '2026-10-25T10:22:27.530Z',
    // source: https://sklep.sewera.pl/warunki-i-koszty-dostaw
    sourceUrl: 'https://sklep.sewera.pl/warunki-i-koszty-dostaw',
  },
  {
    store: 'Rab-Dom', minimumGrosze: 1799, freeFromGrosze: 50001, checkedAt: '2026-10-25T10:14:54.450Z',
    // source: https://www.rabdom.pl/czas-i-koszt-dostawy
    sourceUrl: 'https://www.rabdom.pl/czas-i-koszt-dostawy',
  },
  {
    store: 'Buduj24', minimumGrosze: 1500, freeFromGrosze: 29900, checkedAt: '2026-10-25T10:14:55.448Z',
    // source: https://buduj24.pl/dostawa-i-platnosc
    sourceUrl: 'https://buduj24.pl/dostawa-i-platnosc',
  },
  { store: 'Realbud', minimumGrosze: null, checkedAt: '2026-10-25T10:14:55.052Z',
    // source: https://realbud.com/koszty-transportu
    sourceUrl: 'https://realbud.com/koszty-transportu' },
  { store: 'Castorama', minimumGrosze: null, checkedAt: null,
    // source: https://www.castorama.pl/informacje/zamow-z-dostawa
    sourceUrl: 'https://www.castorama.pl/informacje/zamow-z-dostawa' },
  { store: 'OBI', minimumGrosze: null, checkedAt: null,
    // Delivery must be checked for this actual product and destination.
    // source: https://www.obi.pl/p/6314371/farba-sniezka-barwy-natury-biala-5-l
    sourceUrl: 'https://www.obi.pl/p/6314371/farba-sniezka-barwy-natury-biala-5-l' },
];
