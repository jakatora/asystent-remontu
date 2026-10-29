import { CABINET_JOB, cabinetReference, reviewCabinetCalculation } from '@/features/calculator/cabinetPainting';
import { calculateMaterials } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';
import type { MaterialCategory } from '@/types/pricing';
import { toPricingStageInput, type SerializedProject } from './pricingApi';
import { withManualShopping, applyProjectShopping } from './projectShoppingInput';
import { deliveredKit } from './deliveredKit';
import { estimateHonoursStore } from './storeChoice';
import { normalizeUnit } from './quantity';
import type { DeliverySettings } from '../../../../lib/pricing-service/src/delivery';

const choices = [2, 3] as const;
export type CabinetPreparation = typeof choices[number];
export const cabinetCalculationKey = (calc?: CalculationResult) => calc && JSON.stringify([
  calc.jobId, calc.quantityModel, Object.entries(calc.measurements).sort(([a], [b]) => a.localeCompare(b)),
  calc.materials.map(l => [l.material.id, l.material.name, l.material.unit, 'ean' in l.material ? l.material.ean : null,
    'packageFamily' in l.material ? l.material.packageFamily : null, l.material.packaging?.size, l.rawQuantity, l.quantityKnown]).sort(([a], [b]) => String(a).localeCompare(String(b))),
]);

/** Alternatives change only the explicitly bought preparation brand. Existing
 * surface/paint/counts and owned detergent must already be confirmed. Never turn
 * an unknown preparation or unsupported substrate into a supposedly full kit.
 * source: https://www.v33.pl/faq/
 * source: https://www.chem-rozlew.com/benzyna-ekstrakcyjna/
 */
export function cabinetPreparationKits(calc: CalculationResult | undefined, projectId: string, items: readonly ShoppingItem[] = [], tier: MaterialCategory = 'standard') {
  if (calc?.jobId !== CABINET_JOB || !choices.includes(calc.measurements.cabinetPreparation as CabinetPreparation)) return [];
  const reviewed = reviewCabinetCalculation(calc)!;
  if (reviewed.materials.some(l => l.quantityKnown === false)) return [];
  const original = withManualShopping(toPricingStageInput(calc, tier), calc, projectId, items);
  return choices.map(preparation => {
    const calculation = calculateMaterials(getJobById(CABINET_JOB)!, { ...calc.measurements, cabinetPreparation: preparation });
    const product = MATERIAL_PRICES.find(p => p.id === cabinetReference('degreaser-cabinet', calculation.measurements))!;
    const selected = withManualShopping(toPricingStageInput(calculation, tier), calculation, projectId, items);
    return { preparation, product, calculation, projectId, basedOn: cabinetCalculationKey(calc)!,
      stages: [applyProjectShopping(selected, calculation, projectId, items, original).stage] };
  });
}
export type CabinetPreparationKit = ReturnType<typeof cabinetPreparationKits>[number];

/** Apply one explicit choice through the normal project save/readback path.
 * Refuse an older preview after changed measurements or a different project. */
export function projectWithCabinetPreparation(project: Project, kit: CabinetPreparationKit): Project | null {
  if (project.id !== kit.projectId || project.jobId !== CABINET_JOB || cabinetCalculationKey(project.calculationResult) !== kit.basedOn) return null;
  const valid = cabinetPreparationKits(project.calculationResult, project.id).find(row => row.preparation === kit.preparation);
  return valid ? { ...project, measurements: valid.calculation.measurements, calculationResult: valid.calculation } : null;
}

export function deliveredCabinetPreparation(kit: CabinetPreparationKit, data: SerializedProject, settings: DeliverySettings, store: string | null = null, now = Date.now()) {
  const expected = kit.stages[0], actual = data.stages?.[0];
  if (data.stages?.length !== 1 || actual?.jobId !== expected.jobId || actual.lines.length !== expected.materials.length || store && !estimateHonoursStore(data, store)) return null;
  if (expected.materials.some((line, i) => {
    const result = actual.lines[i];
    return !result || !result.resolved || Math.abs(result.quantity - line.quantity) > 1e-7 || normalizeUnit(result.unit ?? '') !== normalizeUnit(line.material.unit)
      || line.material.ean && (result.query.ean !== line.material.ean || result.product?.ean !== line.material.ean)
      || line.material.packageFamily && result.product?.id !== 'remont-family-' + line.material.packageFamily;
  })) return null;
  return deliveredKit(data, settings, now);
}
