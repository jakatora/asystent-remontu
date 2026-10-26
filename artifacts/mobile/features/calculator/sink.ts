import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import { roundMoney } from '@/shared/lib/currency';

export const SINK_JOB_ID = 'sink-installation';
export const SINK_QUANTITY_MODEL = 'sink-connections-v1';
export const isSinkConnection = (id: string) => id === 'angle-valve' || id === 'flex-hose';

// Cold and hot supply need separate connections. BSL2 includes flexible
// G3/8–M10x1 connectors; additional/replacement hoses are an explicit count.
// source: https://www.ferrocompany.com/pliki/en/FERRO_Stillo_EN.pdf
// source: https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44
export function sinkConnectionQuantity(id: string, m: MeasurementMap, currentModel: boolean): number | null {
  if (!Number.isSafeInteger(m.sinkCount) || m.sinkCount < 1 || m.sinkCount > 10) return null;
  if (id === 'angle-valve') return 2 * m.sinkCount;
  if (id !== 'flex-hose') return null;
  const count = m.sinkExtraHoses ?? (currentModel ? 0 : undefined);
  return count !== undefined && Number.isSafeInteger(count) && count >= 0 && count <= 20 ? count : null;
}

/** Correct a view of saved calculations without rewriting JSON, prices or
 * manual shopping rows. An old one-hose assumption is not an explicit choice. */
export function upgradeSinkCalculation(calc: CalculationResult | undefined): CalculationResult | undefined {
  if (!calc || calc.jobId !== SINK_JOB_ID) return calc;
  const materials = calc.materials.map(line => {
    if (!isSinkConnection(line.material.id)) return line;
    const pieces = ['szt', 'szt.'].includes(line.material.unit);
    const required = pieces ? sinkConnectionQuantity(line.material.id, calc.measurements, calc.quantityModel === SINK_QUANTITY_MODEL) : null;
    const quantity = required ?? 0;
    const notes = line.material.id === 'angle-valve'
      ? 'Dwa zawory na umywalkę: ciepła i zimna woda. Potwierdź gwinty podejść i baterii.'
      : 'Dodatkowe lub wymienne wężyki poza kompletem baterii. Ferro Stillo BSL2 ma przyłącza G3/8–M10x1 w zestawie. Sprawdź ich długość; inne połączenie dobierz osobno.';
    return { ...line, material: { ...line.material, notes }, quantity, rawQuantity: quantity, packs: undefined,
      quantityKnown: required !== null, cost: required === null ? 0 : roundMoney(quantity * line.material.pricePerUnit) };
  });
  // Keep the old model until missing hose input is explicitly supplied. Repeated
  // reads must never turn "unknown" into zero included hoses.
  return { ...calc, materials, totalCost: roundMoney(materials.reduce((sum, line) => sum + line.cost, 0)),
    quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) };
}

export const upgradeSinkProject = (project: Project): Project => project.jobId === SINK_JOB_ID && project.calculationResult
  ? { ...project, calculationResult: upgradeSinkCalculation(project.calculationResult) } : project;

/** Previously owning one valve cannot cover two. Preserve persisted data and
 * custom rows; confirming the current quantity uses the existing Shopping UI. */
export function projectSinkShopping(items: readonly ShoppingItem[], calc?: CalculationResult): ShoppingItem[] {
  if (calc?.jobId !== SINK_JOB_ID) return [...items];
  const current = upgradeSinkCalculation(calc)!;
  return items.flatMap(item => {
    if (item.itemType !== 'material' || !isSinkConnection(item.materialId)) return [item];
    const line = current.materials.find(line => line.material.id === item.materialId);
    if (!line) return [item];
    if (line.quantityKnown !== false && line.quantity === 0) return [];
    const known = line.quantityKnown !== false;
    const matches = known && Math.abs((item.customQuantity ?? item.quantity) - line.quantity) < 1e-8 && item.unit === line.material.unit;
    return [{ ...item, notes: line.material.notes, quantity: line.quantity, estimatedPrice: line.cost, quantityKnown: known,
      requiredQuantity: known ? line.quantity : undefined, needsQuantityConfirmation: !matches,
      owned: matches && item.owned, purchased: matches && item.purchased }];
  });
}
