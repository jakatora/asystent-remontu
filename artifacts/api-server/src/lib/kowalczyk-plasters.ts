import type { RetailSource } from './retail-pages';

// Factory GTINs and pack sizes; pallet counts are not minimum purchase quantities.
// source: https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120
// source: https://knauf.com/pl-PL/p/produkt/knauf-betokontakt-10251_0120
export const KOWALCZYK_PLASTER_REVIEWS = [
  // source: https://sklep-kowalczyk.pl/knauf-goldband-gipsowa-zaprawa-tynkarska-5kg-507331-52455-52455.html
  {
    sourceId: 'kowalczyk-knauf-goldband-5kg', id: 33872,
    ean: '5901793354729', size: 5, unit: 'kg', brand: 'Knauf', category: 'plaster',
    name: 'KNAUF Goldband Gipsowa Zaprawa Tynkarska 5kg (507331)',
    path: '/knauf-goldband-gipsowa-zaprawa-tynkarska-5kg-507331-52455-52455.html',
    photo: '/5/9/5901793354729.png',
  },
  // source: https://sklep-kowalczyk.pl/knauf-goldband-gipsowa-zaprawa-tynkarska-10-kg-94713-52454-52454.html
  {
    sourceId: 'kowalczyk-knauf-goldband-10kg', id: 33873,
    ean: '5901793351162', size: 10, unit: 'kg', brand: 'Knauf', category: 'plaster',
    name: 'KNAUF Goldband Gipsowa Zaprawa Tynkarska 10kg (94713)',
    path: '/knauf-goldband-gipsowa-zaprawa-tynkarska-10-kg-94713-52454-52454.html',
    photo: '/5/9/5901793351162.png',
  },
  // source: https://sklep-kowalczyk.pl/knauf-grunt-betokontakt-5kg.html
  {
    sourceId: 'kowalczyk-knauf-betokontakt-5kg', id: 36040,
    ean: '4006379051014', size: 5, unit: 'kg', brand: 'Knauf', category: 'plaster-primer',
    name: 'KNAUF Grunt Betokontakt 5kg/op. 80szt/pal.(21023)',
    path: '/knauf-grunt-betokontakt-5kg.html',
    photo: '/4/0/4006379051014.jpg',
  },
] as const;

export const KOWALCZYK_PLASTER_SOURCES: readonly RetailSource[] = KOWALCZYK_PLASTER_REVIEWS.map(review => ({
  id: review.sourceId, productId: review.id, ean: review.ean, name: review.name,
  brand: review.brand, category: review.category, packageSize: review.size, unit: review.unit,
  store: 'E-Kowalczyk', format: 'kowalczyk-magento', retailerSku: review.ean,
  url: 'https://sklep-kowalczyk.pl' + review.path,
  imageUrl: 'https://sklep-kowalczyk.pl/media/catalog/product/cache/d24a34bded6d2df740ef66d66d2112c9' + review.photo,
  pickupRequiresConfirmation: true,
}));
