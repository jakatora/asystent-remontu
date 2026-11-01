import type { PricingMaterialLineInput, PricingStageInput } from './pricingApi';
import { normalizeUnit } from './quantity';

export const MATERIAL_STOCK_PREFIX = 'remont.material-stock.v1:';
export const MATERIAL_STOCK_UNITS = ['kg', 'l', 'ml', 'szt'] as const;
export interface MaterialStockEntry { materialId: string; ean: string; name: string; unit: typeof MATERIAL_STOCK_UNITS[number]; quantity: number }
export interface MaterialStockRequirement extends Omit<MaterialStockEntry, 'quantity'> { requiredQuantity: number }
export interface MaterialStockAdjustment extends MaterialStockRequirement { coveredQuantity: number; remainingQuantity: number }
const validQuantity = (n: unknown, unit: string): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= 100_000 && Number(n.toFixed(8)) === n && (unit !== 'szt' || Number.isSafeInteger(n));
export const materialStockKey = (entry: Pick<MaterialStockEntry, 'materialId' | 'ean' | 'unit'>) => JSON.stringify([entry.materialId, entry.ean, entry.unit]);

/** A damaged inventory must stop the quote, never silently reappear as empty. */
export function parseMaterialStock(raw: string | null): MaterialStockEntry[] {
  if (raw === null) return [];
  if (raw.length > 100_000) throw Error('invalid_material_stock');
  const data = JSON.parse(raw), seen = new Set<string>();
  if (data?.version !== 1 || !Array.isArray(data.entries) || data.entries.length > 200 || Object.keys(data).some(key => !['version', 'entries'].includes(key))) throw Error('invalid_material_stock');
  return data.entries.map((row: MaterialStockEntry) => {
    if (!row || Object.keys(row).some(key => !['materialId', 'ean', 'name', 'unit', 'quantity'].includes(key))
      || typeof row.materialId !== 'string' || !row.materialId || row.materialId.length > 200
      || typeof row.ean !== 'string' || !/^\d{13}$/.test(row.ean) || typeof row.name !== 'string' || !row.name.trim() || row.name.length > 300
      || /[\u0000-\u001f\u007f]/.test(row.materialId + row.name) || !MATERIAL_STOCK_UNITS.includes(row.unit) || !validQuantity(row.quantity, row.unit)) throw Error('invalid_material_stock');
    const key = materialStockKey(row); if (seen.has(key)) throw Error('invalid_material_stock'); seen.add(key);
    return { materialId: row.materialId, ean: row.ean, name: row.name.trim(), unit: row.unit, quantity: row.quantity };
  });
}
export function parseMaterialStockQuantity(text: string, unit: string): number | null {
  if (!/^\d{1,6}(?:[.,]\d{1,8})?$/.test(text.trim())) return null;
  const n = Number(text.trim().replace(',', '.'));
  return n === 0 || validQuantity(n, unit) ? n : null;
}
export function materialStockRequirement(line: PricingMaterialLineInput): MaterialStockRequirement | null {
  const ean = line.material.ean || line.material.gtin, unit = normalizeUnit(line.material.unit);
  // Area or linear stock needs a physical cut/laying plan. Do not subtract a
  // nominal area of offcuts from whole-width rolls, tiles, panels or profiles.
  if (!ean || !/^\d{13}$/.test(ean) || !MATERIAL_STOCK_UNITS.includes(unit as MaterialStockEntry['unit'])
    || line.cutRoll || line.plainWallpaper || line.indoEndcaps || !Number.isFinite(line.quantity) || line.quantity <= 0) return null;
  return { materialId: line.material.id, ean, name: line.material.name, unit: unit as MaterialStockEntry['unit'], requiredQuantity: line.quantity };
}
export function materialStockRequirements(stages: readonly PricingStageInput[]): MaterialStockRequirement[] {
  const entries = new Map<string, MaterialStockRequirement>();
  for (const stage of stages) for (const line of stage.materials) {
    const entry = materialStockRequirement(line); if (!entry) continue;
    const key = materialStockKey(entry), previous = entries.get(key);
    entries.set(key, { ...entry, requiredQuantity: (previous?.requiredQuantity ?? 0) + entry.requiredQuantity });
  }
  return [...entries.values()];
}

/** Project-specific usable stock is deducted once, after whole-line ownership
 * and product choices, before any packaging or delivery quote. Exact barcode,
 * recipe ID and physical unit must match. No money is calculated here. */
export function applyMaterialStock(stage: PricingStageInput, entries: readonly MaterialStockEntry[]): { stage: PricingStageInput; adjustments: MaterialStockAdjustment[] } {
  const validated = parseMaterialStock(JSON.stringify({ version: 1, entries }));
  const available = new Map(validated.map(entry => [materialStockKey(entry), entry.quantity]));
  const adjustments: MaterialStockAdjustment[] = [];
  const materials = stage.materials.flatMap(line => {
    const requirement = materialStockRequirement(line); if (!requirement) return [line];
    const key = materialStockKey(requirement), quantity = available.get(key) ?? 0;
    if (quantity <= 0) return [line];
    const coveredQuantity = Math.min(line.quantity, quantity), delta = Math.max(0, line.quantity - coveredQuantity);
    const remainingQuantity = delta === 0 ? 0 : Math.max(0.00000001, Number(delta.toFixed(8)));
    available.set(key, Number(Math.max(0, quantity - coveredQuantity).toFixed(8)));
    adjustments.push({ ...requirement, coveredQuantity, remainingQuantity });
    return remainingQuantity === 0 ? [] : [{ ...line, quantity: remainingQuantity, packs: undefined }];
  });
  return { stage: { ...stage, materials }, adjustments };
}
