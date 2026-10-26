import { MATERIAL_PRICES } from '@/data/prices/materials';
import { PRODUCT_PHOTOS } from '@/data/products/photos';
import { getJobById } from '@/features/content/registry';
import { groutMassKg } from '@/features/calculator/grout';
import { resolveFormula } from '@/features/calculator/formulas';
import { createProductChoiceGroup } from './productChoice';
import type { PricingMaterialLineInput, PricingStageInput } from './pricingApi';

export type TileUse = 'wall' | 'floor';
export type TileChoice = { from: string; to: string; use: TileUse };
type Specification = { id: string; widthCm: number; heightCm: number; depthMm: number; uses: readonly TileUse[] };
export const TILE_CHOICE_PREFIX = 'remont.tile-choice.v1:';
const specifications: readonly Specification[] = [
  // source: https://www.castorama.pl/gres-guigliano-goodhome-18-5-x-59-8-cm-beige-1-m2/3663602870821_CAPL.prd
  { id: 'mat-gres-guigliano-1m2', widthCm: 18.5, heightCm: 59.8, depthMm: 8, uses: ['wall', 'floor'] },
  // source: https://taniaplytka.pl/produkty/paradyz-petro-grey-struktura-mat-600x600-2
  { id: 'mat-gres-paradyz-petro-grey-60x60', widthCm: 60, heightCm: 60, depthMm: 9.5, uses: ['floor'] },
  // source: https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/
  { id: 'mat-tile-wall-paradyz-nati-bianco-25x40', widthCm: 25, heightCm: 40, depthMm: 8, uses: ['wall'] },
  // source: https://www.castorama.pl/gres-play-paradyz-59-8-x-59-8-cm-grey-1-43-m2/5904584158261_CAPL.prd
  { id: 'mat-gres-rekt-paradyz-u117-grey-60x60', widthCm: 59.8, heightCm: 59.8, depthMm: 8, uses: ['wall', 'floor'] },
  // source: https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd
  { id: 'mat-tile-wall-tamara-white-25x40', widthCm: 25, heightCm: 40, depthMm: 7.7, uses: ['wall'] },
];
const group = createProductChoiceGroup(specifications.map(row => row.id), 'tile', 'm2');
export const TILE_PRODUCTS = group.products.flatMap(product => {
  const spec = specifications.find(row => row.id === product.id), ean = PRODUCT_PHOTOS.find(row => row.ids.includes(product.id))?.ean;
  return spec && ean ? [{ ...product, ...spec, ean }] : [];
});
export type TileProduct = typeof TILE_PRODUCTS[number];
export type TileRequirement = { product: TileProduct; use: TileUse };
export const tileReference = (material: Parameters<typeof group.reference>[0]) => {
  const ref = group.reference(material); return ref ? TILE_PRODUCTS.find(row => row.id === ref.id) ?? null : null;
};
const useFor = (stage: PricingStageInput, product: TileProduct): TileUse | null => {
  const use = stage.jobId === 'floor-tiles' ? 'floor' : ['wall-tiles-bathroom', 'kitchen-backsplash'].includes(stage.jobId) ? 'wall' : product.uses.length === 1 ? product.uses[0] : null;
  return use && product.uses.includes(use) ? use : null;
};
export function parseTileChoices(raw: string | null): TileChoice[] {
  if (raw === null) return [];
  if (raw.length > 8_000) throw Error('invalid_tile_choices');
  const saved = JSON.parse(raw);
  if (saved?.version !== 1 || !Array.isArray(saved.choices) || saved.choices.length > TILE_PRODUCTS.length * 2) throw Error('invalid_tile_choices');
  const used = new Set<string>();
  return saved.choices.map((row: any) => {
    const from = TILE_PRODUCTS.find(p => p.id === row?.from), to = TILE_PRODUCTS.find(p => p.id === row?.to);
    const use = row?.use as TileUse, key = use + ':' + row?.from;
    if (!from || !to || from.id === to.id || !['wall', 'floor'].includes(use) || !from.uses.includes(use) || !to.uses.includes(use) || used.has(key)) throw Error('invalid_tile_choices');
    used.add(key); return { from: from.id, to: to.id, use };
  });
}
export function tileRequirements(stages: readonly PricingStageInput[]): TileRequirement[] {
  const found = new Map<string, TileRequirement>();
  for (const stage of stages) for (const line of stage.materials) {
    const product = line.quantity > 0 ? tileReference(line.material) : null, use = product && useFor(stage, product);
    if (product && use) found.set(use + ':' + product.id, { product, use });
  }
  return [...found.values()];
}
const primaryId = (job: string) => job === 'floor-tiles' ? 'tiles' : job === 'wall-tiles-bathroom' ? 'wall-tiles' : job === 'kitchen-backsplash' ? 'backsplash-tiles' : null;
function catalogueLine(line: PricingMaterialLineInput, id: string, quantity = line.quantity): PricingMaterialLineInput {
  const ref = MATERIAL_PRICES.find(row => row.id === id), ean = PRODUCT_PHOTOS.find(row => row.ids.includes(id))?.ean;
  if (!ref || !ean) throw Error('tile_kit_identity_missing');
  const { packs: _packs, ...demand } = line, { ean: _ean, gtin: _gtin, ...identity } = line.material;
  return { ...demand, quantity, material: { ...identity, name: ref.productLabel, category: ref.materialType, unit: ref.packageUnit, ean } };
}

/** Explicit selection also accepts the displayed ATLAS adhesive/white grout
 * kit. Update only present lines: Owned/Purchased items must not reappear.
 * Original saved calculations and room measurements are never mutated. */
export function applyTileChoices(stages: readonly PricingStageInput[], choices: readonly TileChoice[]): PricingStageInput[] {
  const validated = parseTileChoices(JSON.stringify({ version: 1, choices }));
  if (!validated.length) return [...stages];
  return stages.map(stage => {
    let selected: TileRequirement | undefined;
    const materials = stage.materials.map(line => {
      const from = tileReference(line.material), use = from && useFor(stage, from);
      const choice = from && use && validated.find(row => row.from === from.id && row.use === use);
      const to = choice && TILE_PRODUCTS.find(row => row.id === choice.to);
      if (!to || !use) return line;
      if (line.material.id === primaryId(stage.jobId)) selected = { product: to, use };
      return catalogueLine(line, to.id);
    });
    if (!selected) return { ...stage, materials };
    const { product, use } = selected as TileRequirement;
    const m = { ...stage.measurements, tileWidthCm: product.widthCm, tileHeightCm: product.heightCm, tileThicknessMm: product.depthMm, groutDensityKgM3: 1650 };
    const area = use === 'floor' ? stage.measurements?.floorArea : stage.measurements?.wallArea;
    if (!Number.isFinite(area) || area! <= 0) throw Error('tile_measurements_missing');
    const joint = stage.measurements?.groutWidthMm ?? 3;
    const definitions = getJobById(stage.jobId)?.materials ?? [];
    const reserve = (id: string) => definitions.find(row => row.id === id)?.wasteFactor ?? 1.1;
    // Reviewed upper size row for these <=60 cm products, on a level substrate.
    // source: https://www.atlas.com.pl/produkt/atlas-plus/ (25x40 wall 2.3; 60x60 wall 3.5/floor4.3 kg/m²)
    const adhesiveRate = use === 'floor' ? 4.3 : Math.max(product.widthCm, product.heightCm) <= 40 ? 2.3 : 3.5;
    return { ...stage, measurements: m, materials: materials.map(line => {
      if (['tile-adhesive', 'wall-tile-adhesive'].includes(line.material.id)) return catalogueLine(line, 'mat-tile-adhesive-buildfix-25kg', Number((area! * adhesiveRate * reserve(line.material.id)).toFixed(8)));
      if (['grout', 'wall-grout', 'grout-kitchen'].includes(line.material.id)) return catalogueLine(line, 'mat-grout-atlas-001-white-2kg', groutMassKg(area!, product.widthCm, product.heightCm, product.depthMm, joint, 1650, reserve(line.material.id)));
      if (['tile-crosses', 'wall-crosses', 'tile-crosses-kitchen'].includes(line.material.id)) {
        const quantity = resolveFormula('crosses')(m, 1);
        if (joint === 2) return catalogueLine(line, 'mat-tile-spacers-hardy-2mm-200', quantity);
        const { packs: _packs, ...demand } = line;
        // A reviewed 2mm spacer is not a quote for another joint width.
        return { ...demand, quantity, material: { id: line.material.id, name: `Krzyżyki dystansowe ${joint} mm — dobierz opakowanie`, category: 'tile-spacer-review', unit: 'szt' } };
      }
      return line;
    }) };
  });
}
