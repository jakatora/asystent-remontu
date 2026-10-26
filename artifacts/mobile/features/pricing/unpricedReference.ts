import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS, getProductPhoto } from '@/data/products/photos';
import { normalizeProductName } from '../../../../lib/db/src/repositories/helpers';
import { normalizeUnit } from './quantity';
import type { SerializedLine } from './pricingApi';

/** A known reference helps the user check a shop; it never supplies a price,
 * availability, delivery charge or a replacement product for the ranking. */
export function unpricedReference(line: SerializedLine) {
  if (line.resolved) return null;
  const codes = [line.product?.ean, line.product?.gtin, line.query.ean, line.query.gtin].filter((code): code is string => Boolean(code));
  if (new Set(codes).size > 1) return null;
  const category = line.product?.category ?? line.query.category;
  const name = line.query.normalizedName;
  const candidates = MATERIAL_PRICES.filter(ref => {
    if (category && category !== ref.materialType) return false;
    if (line.unit && normalizeUnit(line.unit) !== normalizeUnit(ref.packageUnit)) return false;
    const photo = PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id));
    if (codes.length) return photo?.ean === codes[0];
    return Boolean(category && name && normalizeProductName(ref.productLabel) === name);
  });
  if (candidates.length !== 1) return null;
  const ref = candidates[0], photo = PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id));
  if (!ref.sourceUrl) return null;
  try {
    const url = new URL(ref.sourceUrl);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
  } catch { return null; }
  return { id: ref.id, name: ref.productLabel, ean: photo?.ean, imageUrl: getProductPhoto(ref),
    store: ref.storeName, url: ref.sourceUrl, packageSize: ref.packageSize, packageUnit: ref.packageUnit };
}
