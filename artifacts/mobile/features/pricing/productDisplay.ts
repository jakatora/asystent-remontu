import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';

const references = new Map(MATERIAL_PRICES.map(reference => [reference.id, reference.productLabel]));
const labels = new Map<string, Set<string>>();
for (const photo of PRODUCT_PHOTOS) {
  if (!photo.ean) continue;
  for (const id of photo.ids) {
    const label = references.get(id);
    if (!label) continue;
    if (!labels.has(photo.ean)) labels.set(photo.ean, new Set());
    labels.get(photo.ean)!.add(label);
  }
}

/** Use the reviewed reference label only for an exact, unambiguous barcode. */
export function displayProductName(product: { id: string; name: string }): string {
  const ean = /^remont-(\d{13})$/.exec(product.id)?.[1];
  const names = ean ? labels.get(ean) : undefined;
  return names?.size === 1 ? [...names][0] : product.name;
}
