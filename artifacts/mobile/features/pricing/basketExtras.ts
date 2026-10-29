import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import type { MaterialPriceReference } from '@/types/pricing';
import type { PricingMaterialLineInput, PricingStageInput } from './pricingApi';
import { normalizeProductName } from '../../../../lib/db/src/repositories/helpers';
import { normalizeUnit } from './quantity';

export const BASKET_EXTRAS_KEY = 'remont.basket-extras.v1';
export const MAX_BASKET_EXTRAS = 50;
export const EXTRA_UNITS = ['szt', 'kg', 'l', 'ml', 'mb', 'm2', 'm3'] as const;
export type BasketExtra = { id: string; quantity: number } & (
  { kind: 'catalogue'; referenceId: string } | { kind: 'custom'; name: string; unit: typeof EXTRA_UNITS[number] }
);

const EXTRA_SEARCH_ROWS = MATERIAL_PRICES.map(ref => ({
  ref,
  name: normalizeProductName(`${ref.productLabel} ${ref.brand ?? ''}`),
  ean: PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id))?.ean ?? '',
}));

/** Every word may appear anywhere in the product name; exact EAN also works. */
export function searchBasketExtraReferences(query: string): MaterialPriceReference[] {
  const normalized = normalizeProductName(query);
  if (!normalized) return [];
  const tokens = normalized.split(' ');
  return EXTRA_SEARCH_ROWS.filter(row => tokens.every(token => row.name.includes(token) || row.ean.includes(token)))
    .sort((a, b) => Number(b.ean === normalized) - Number(a.ean === normalized) ||
      Number(b.name.startsWith(normalized)) - Number(a.name.startsWith(normalized)))
    .map(row => row.ref);
}

/** Demand only: no typed price can become a retailer offer or free delivery. */
export function parseExtraQuantity(value: string): number | null {
  if (!/^\d{1,6}(?:[.,]\d{1,6})?$/.test(value.trim())) return null;
  const quantity = Number(value.trim().replace(',', '.'));
  return Number.isFinite(quantity) && quantity > 0 && quantity <= 100_000 ? quantity : null;
}

/** Reject damaged saved lists rather than silently dropping required items. */
export function parseBasketExtras(raw: string | null): BasketExtra[] {
  if (raw === null) return [];
  if (raw.length > 50_000) throw Error('invalid_basket_extras');
  const value = JSON.parse(raw);
  if (value?.version !== 1 || !Array.isArray(value.items) || value.items.length > MAX_BASKET_EXTRAS) throw Error('invalid_basket_extras');
  const ids = new Set<string>();
  return value.items.map((row: any) => {
    if (!row || typeof row.id !== 'string' || !row.id || row.id.length > 200 || ids.has(row.id) ||
      typeof row.quantity !== 'number' || !Number.isFinite(row.quantity) || row.quantity <= 0 || row.quantity > 100_000) throw Error('invalid_basket_extras');
    ids.add(row.id);
    if (row.kind === 'catalogue' && MATERIAL_PRICES.some(ref => ref.id === row.referenceId)) return {
      id: row.id, quantity: row.quantity, kind: 'catalogue', referenceId: row.referenceId,
    };
    if (row.kind === 'custom' && typeof row.name === 'string' && row.name.trim().length > 0 && row.name.length <= 200 &&
      !/[\u0000-\u001f]/.test(row.name) && EXTRA_UNITS.includes(row.unit)) return {
      id: row.id, quantity: row.quantity, kind: 'custom', name: row.name.trim(), unit: row.unit,
    };
    throw Error('invalid_basket_extras');
  });
}

export function extraMaterial(item: BasketExtra): PricingMaterialLineInput {
  if (item.kind === 'custom') return additionalMaterial(`extra:${item.id}`, item.name, item.unit, item.quantity);
  const ref = MATERIAL_PRICES.find(ref => ref.id === item.referenceId);
  if (!ref) throw Error('unknown_extra_reference');
  const photo = PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id));
  return { material: { id: `extra:${item.id}`, name: ref.productLabel, unit: ref.packageUnit, category: ref.materialType,
    ...(photo?.ean ? { ean: photo.ean } : {}) }, quantity: item.quantity };
}

/** The API requires a category or barcode. Supply one only for an unambiguous
 * full catalogue name in the same physical unit, never a fuzzy substitute. */
export function additionalMaterial(id: string, name: string, unit: string, quantity: number): PricingMaterialLineInput {
  const matches = MATERIAL_PRICES.filter(ref => normalizeProductName(ref.productLabel) === normalizeProductName(name) && normalizeUnit(ref.packageUnit) === normalizeUnit(unit));
  const ref = matches.length === 1 ? matches[0] : null;
  const ean = ref ? PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id))?.ean : null;
  return { material: { id, name: ref?.productLabel ?? name, unit: ref?.packageUnit ?? unit, category: ref?.materialType ?? null,
    ...(ean ? { ean } : {}) }, quantity };
}

/** Keep raw demand in the common request; the server merges identical
 * products across works and extras before rounding to purchasable packages. */
export function withBasketExtras(stages: readonly PricingStageInput[], extras: readonly BasketExtra[]): PricingStageInput[] {
  return extras.length ? [...stages, { jobId: 'additional-materials', materials: extras.map(extraMaterial) }] : [...stages];
}
