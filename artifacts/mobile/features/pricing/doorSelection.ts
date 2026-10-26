import type { CalculationResult } from '@/types/domain';
import type { PricingStageInput } from './pricingApi';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const DOOR_SELECTION_PREFIX = 'remont.door-selection.v1:';
export const DOOR_LEAVES = [
  // source: https://www.castorama.pl/drzwi-pelne-archi-80-lewe-biale-lakierowane/5903917782364_CAPL.prd
  { id: 'mat-door-leaf-archi-80-white', ean: '5903917782364', label: 'Archi 80 — lewe, białe, pełne', labelEn: 'Archi 80 — left-hand, white, solid' },
  // source: https://www.castorama.pl/drzwi-pelne-opp-archi-80-lewe-biale/5063022524263_CAPL.prd
  { id: 'mat-door-leaf-opp-archi-full-80-left', ean: '5063022524263', label: 'OPP Archi 80 — lewe, białe, pełne, 2035 × 844 mm', labelEn: 'OPP Archi 80 — left-hand, white, solid, 2035 × 844 mm' },
  // source: https://www.castorama.pl/drzwi-pokojowe-credis-80-lewe-biale/5900378219590_CAPL.prd
  { id: 'mat-door-leaf-erkado-credis-80-glazed', ean: '5900378219590', label: 'Credis 80 — lewe, białe, przeszklone', labelEn: 'Credis 80 — left-hand, white, glazed' },
] as const;

export type DoorLeafChoice = typeof DOOR_LEAVES[number]['id'] | 'owned' | null;
export interface DoorSelection {
  version: 1;
  measurements: string;
  leaf: DoorLeafChoice;
  frameOwned: boolean;
  handleOwned: boolean;
}

function measurementKey(calc: CalculationResult): string {
  return JSON.stringify(Object.entries(calc.measurements).sort(([a], [b]) => a.localeCompare(b)));
}
export function makeDoorSelection(calc: CalculationResult, leaf: DoorLeafChoice, frameOwned: boolean, handleOwned = false): DoorSelection {
  return { version: 1, measurements: measurementKey(calc), leaf, frameOwned, handleOwned };
}
export function parseDoorSelection(raw: string | null, calc: CalculationResult): DoorSelection | null {
  if (!raw || raw.length > 8_000 || calc.jobId !== 'interior-doors') return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || value.measurements !== measurementKey(calc) || typeof value.frameOwned !== 'boolean' || (value.handleOwned !== undefined && typeof value.handleOwned !== 'boolean') ||
      !(value.leaf === null || value.leaf === 'owned' || DOOR_LEAVES.some(leaf => leaf.id === value.leaf))) return null;
    return makeDoorSelection(calc, value.leaf, value.frameOwned, value.handleOwned ?? false);
  } catch { return null; }
}

/** An explicit choice splits a complete set into its two original components.
 * An unselected frame never resolves to the right-hand base in the catalogue:
 * that base has not been confirmed as a complete frame assembly.
 * source: https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd
 */
export function applyDoorSelection(stage: PricingStageInput, calc: CalculationResult, saved?: DoorSelection | null): PricingStageInput {
  if (stage.jobId !== 'interior-doors' || !saved) return stage;
  const selection = parseDoorSelection(JSON.stringify(saved), calc);
  const sets = stage.materials.filter(line => line.material.id === 'door-set');
  if (!selection || sets.length !== 1 || !Number.isSafeInteger(sets[0].quantity) || sets[0].quantity < 1) return stage;
  const set = sets[0], parts: PricingStageInput['materials'][number][] = [];
  if (selection.leaf !== 'owned') {
    const chosen = DOOR_LEAVES.find(leaf => leaf.id === selection.leaf);
    const ref = chosen && MATERIAL_PRICES.find(ref => ref.id === chosen.id);
    parts.push({ material: { id: 'door-set-leaf', name: ref?.productLabel ?? 'Skrzydło drzwiowe — wybierz rozmiar i stronę', unit: 'szt', category: 'door-leaf', ...(chosen ? { ean: chosen.ean } : {}) }, quantity: set.quantity });
  }
  if (!selection.frameOwned) parts.push({ material: { id: 'door-set-frame', name: 'Kompletna ościeżnica pasująca do skrzydła — dobierz model', unit: 'szt', category: 'door-frame-set' }, quantity: set.quantity });
  // These reviewed leaves exclude the handle; never silently omit it from a
  // purported complete quote. Existing whole-set ownership covers leaf/frame.
  // source: https://www.castorama.pl/drzwi-pokojowe-credis-80-lewe-biale/5900378219590_CAPL.prd
  if (!selection.handleOwned) parts.push({ material: { id: 'door-handle', name: 'Klamka z szyldami pasująca do drzwi — dobierz model', unit: 'szt', category: 'door-handle' }, quantity: set.quantity });
  return { ...stage, materials: stage.materials.flatMap(line => line === set ? parts : [line]) };
}

/** Shopping's whole-set Owned/Purchased flag covers both explicit components. */
export const doorOriginMaterialId = (id: string): string => ['door-set-leaf', 'door-set-frame'].includes(id) ? 'door-set' : id;
