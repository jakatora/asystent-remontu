import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { normalizeProductName } from '../../../../lib/db/src/repositories/helpers';
import { normalizeUnit } from './quantity';
import type { PricingMaterialInput, PricingStageInput } from './pricingApi';

export type ProductChoice = { from: string; to: string };
export const NO_PRODUCT_CHOICES: readonly never[] = [];

/** Reviewed groups permit an explicit product choice in the same demand unit.
 * Membership never declares two SKUs or technical specifications equivalent. */
export function createProductChoiceGroup(ids: readonly string[], category: string, unit: string) {
  const products = MATERIAL_PRICES.filter(ref => ids.includes(ref.id) && ref.materialType === category && normalizeUnit(ref.packageUnit) === unit);
  const parse = (raw: string | null): ProductChoice[] => {
    if (raw === null) return [];
    if (raw.length > 8_000) throw Error('invalid_product_choices');
    const saved = JSON.parse(raw);
    if (saved?.version !== 1 || !Array.isArray(saved.choices) || saved.choices.length > products.length) throw Error('invalid_product_choices');
    const used = new Set<string>();
    return saved.choices.map((row: any) => {
      const from = products.find(ref => ref.id === row?.from), to = products.find(ref => ref.id === row?.to);
      if (!from || !to || from.id === to.id || used.has(from.id)) throw Error('invalid_product_choices');
      used.add(from.id); return { from: from.id, to: to.id };
    });
  };
  const reference = (material: PricingMaterialInput) => {
    if (normalizeUnit(material.unit) !== unit || material.category && material.category !== category) return null;
    const codes = [material.ean, material.gtin].filter((value): value is string => Boolean(value));
    if (new Set(codes).size > 1) return null;
    const matches = products.filter(ref => codes.length
      ? PRODUCT_PHOTOS.find(photo => photo.ids.includes(ref.id))?.ean === codes[0]
      : material.category === category && normalizeProductName(material.name) === normalizeProductName(ref.productLabel));
    return matches.length === 1 ? matches[0] : null;
  };
  const requirements = (stages: readonly PricingStageInput[]) => {
    const found = stages.flatMap(stage => stage.materials).filter(line => line.quantity > 0).map(line => reference(line.material));
    return products.filter(ref => found.some(match => match?.id === ref.id));
  };
  const apply = (stages: readonly PricingStageInput[], choices: readonly ProductChoice[]): PricingStageInput[] => {
    const validated = parse(JSON.stringify({ version: 1, choices }));
    if (!validated.length) return [...stages];
    const targets = new Map(validated.map(choice => [choice.from, choice.to]));
    return stages.map(stage => ({ ...stage, materials: stage.materials.map(line => {
      const from = reference(line.material), to = from && products.find(ref => ref.id === targets.get(from.id));
      if (!to) return line;
      const ean = PRODUCT_PHOTOS.find(photo => photo.ids.includes(to.id))?.ean;
      if (!ean) throw Error('product_choice_identity_missing');
      const { packs: _oldPacks, ...demand } = line;
      const { ean: _oldEan, gtin: _oldGtin, ...identity } = line.material;
      // Preserve raw demand and IDs; the real API computes packs and money.
      return { ...demand, material: { ...identity, name: to.productLabel, unit: to.packageUnit, category: to.materialType, ean } };
    }) }));
  };
  return { products, parse, reference, requirements, apply };
}
