import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { normalizeProductName } from '../../../../lib/db/src/repositories/helpers';
import { normalizeUnit } from './quantity';
import type { PricingMaterialInput, PricingStageInput } from './pricingApi';

export const LAMINATE_CHOICE_PREFIX = 'remont.laminate-choice.v1:';
// Explicit product choices, never aliases for the same SKU or an assertion
// that different decors, locks and moisture specifications are interchangeable.
// source: https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd
// source: https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535
// source: https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472
const REVIEWED_IDS = ['mat-laminate-oakland-ac4', 'mat-laminate-kronospan-toledo-ac4-222', 'mat-laminate-classen-niasa-ac5-1973'] as const;
export const LAMINATE_PRODUCTS = MATERIAL_PRICES.filter(ref => REVIEWED_IDS.some(id => id === ref.id));
export type LaminateChoice = { from: string; to: string };
export const NO_LAMINATE_CHOICES: readonly LaminateChoice[] = [];

/** A saved choice is a purchasing requirement. Corrupt or unknown choices
 * must stop the quote rather than silently price the original product. */
export function parseLaminateChoices(raw: string | null): LaminateChoice[] {
  if (raw === null) return [];
  if (raw.length > 8_000) throw Error('invalid_laminate_choices');
  const saved = JSON.parse(raw);
  if (saved?.version !== 1 || !Array.isArray(saved.choices) || saved.choices.length > REVIEWED_IDS.length) throw Error('invalid_laminate_choices');
  const ids = new Set<string>();
  return saved.choices.map((row: any) => {
    const from = LAMINATE_PRODUCTS.find(ref => ref.id === row?.from);
    const to = LAMINATE_PRODUCTS.find(ref => ref.id === row?.to);
    if (!from || !to || from.id === to.id || ids.has(from.id) || from.materialType !== 'laminate' || to.materialType !== 'laminate' ||
      normalizeUnit(from.packageUnit) !== 'm2' || normalizeUnit(to.packageUnit) !== 'm2') throw Error('invalid_laminate_choices');
    ids.add(from.id);
    return { from: from.id, to: to.id };
  });
}

export function laminateReference(material: PricingMaterialInput) {
  if (normalizeUnit(material.unit) !== 'm2' || material.category && material.category !== 'laminate') return null;
  const codes = [material.ean, material.gtin].filter((value): value is string => Boolean(value));
  if (new Set(codes).size > 1) return null;
  const matches = LAMINATE_PRODUCTS.filter(ref => codes.length
    ? PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id))?.ean === codes[0]
    : material.category === 'laminate' && normalizeProductName(material.name) === normalizeProductName(ref.productLabel));
  return matches.length === 1 ? matches[0] : null;
}

export function laminateRequirements(stages: readonly PricingStageInput[]) {
  const references = stages.flatMap(stage => stage.materials).filter(line => line.quantity > 0).map(line => laminateReference(line.material));
  return LAMINATE_PRODUCTS.filter(ref => references.some(found => found?.id === ref.id));
}

/** Change only the explicitly selected product identity. Keep raw m² demand,
 * measurements, stage/material IDs, owned-item filtering and other materials.
 * Whole packs and all monetary amounts are recalculated by the real API. */
export function applyLaminateChoices(stages: readonly PricingStageInput[], choices: readonly LaminateChoice[]): PricingStageInput[] {
  const validated = parseLaminateChoices(JSON.stringify({ version: 1, choices }));
  if (!validated.length) return [...stages];
  const targets = new Map(validated.map(choice => [choice.from, choice.to]));
  return stages.map(stage => ({ ...stage, materials: stage.materials.map(line => {
    const from = laminateReference(line.material);
    const to = from && LAMINATE_PRODUCTS.find(ref => ref.id === targets.get(from.id));
    if (!to) return line;
    const ean = PRODUCT_PHOTOS.find(photo => photo.ids.includes(to.id))?.ean;
    if (!ean) throw Error('laminate_identity_missing');
    const { packs: _oldPacks, ...demand } = line;
    const { ean: _oldEan, gtin: _oldGtin, ...identity } = line.material;
    return { ...demand, material: { ...identity, name: to.productLabel, unit: to.packageUnit, category: to.materialType, ean } };
  }) }));
}
