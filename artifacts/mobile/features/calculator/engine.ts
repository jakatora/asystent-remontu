import type { RenovationJob, CalculationResult, MaterialLineItem, MaterialItem } from '@/types/domain';
import type { MaterialRequirement } from '@/types/engine';
import type { CalculatorEngine, MeasurementMap } from '@/types/calculator';
import type { MaterialLineItemDetail, CalculationResultDetail } from '@/types/calculation';
import { resolveFormula } from './formulas';
import { generateExplanation } from './explanation';
import { getJobConfig } from './job-config';
import { resolveWarnings } from '../warnings/resolver';
import { roundMoney } from '@/shared/lib/currency';
import { calculateEpsItems, EPS_JOB_ID, EPS_QUANTITY_MODEL } from './eps';
import { isSinkConnection, sinkConnectionQuantity, SINK_JOB_ID, SINK_QUANTITY_MODEL } from './sink';
import { REPAINT_JOB_ID, isRepaintQuantity, repaintQuantity } from './repaint';
import { ceilingPrimerLitres } from './ceilingPrimer';

const DEFAULT_WASTE_FACTOR = 1.1;

// ─── Material resolution helpers ───────────────────────────────────────────────

function isRichMaterial(m: MaterialItem | MaterialRequirement): m is MaterialRequirement {
  return 'formula' in m && typeof (m as MaterialRequirement).formula === 'function';
}

function applyRounding(
  quantity: number,
  material: MaterialItem | MaterialRequirement
): { quantity: number; packs: number | undefined } {
  const rule = material.roundingRule ?? 'ceil';
  const packaging = material.packaging;

  if (packaging) {
    // Convert to pack count — always rounds up
    const packs = Math.ceil(quantity / packaging.size);
    return { quantity: packs * packaging.size, packs };
  }

  switch (rule) {
    case 'none':
      return { quantity, packs: undefined };
    case 'round':
      return { quantity: Math.round(quantity * 10) / 10, packs: undefined };
    case 'ceil':
    default:
      return { quantity: Math.ceil(quantity * 10) / 10, packs: undefined };
  }
}

export function computeRawQuantity(
  material: MaterialItem | MaterialRequirement,
  measurements: MeasurementMap
): number {
  const wasteFactor = material.wasteFactor ?? DEFAULT_WASTE_FACTOR;

  if (isRichMaterial(material) && material.formula) {
    // Priority 1: inline formula function — already includes waste in most cases
    return material.formula(measurements, wasteFactor);
  }

  // Priority 2: formula registry key
  const key = (material as MaterialItem).formulaKey ?? '';
  const formulaFn = resolveFormula(key);
  return formulaFn(measurements, wasteFactor);
}

function resolveMaterialQuantity(
  material: MaterialItem | MaterialRequirement,
  measurements: MeasurementMap,
  jobId?: string,
): { rawQuantity: number; quantity: number; packs: number | undefined; quantityKnown?: boolean } {
  if (jobId === SINK_JOB_ID && isSinkConnection(material.id)) {
    const required = sinkConnectionQuantity(material.id, measurements, true);
    return { rawQuantity: required ?? 0, quantity: required ?? 0, packs: undefined, quantityKnown: required !== null };
  }
  if(jobId===REPAINT_JOB_ID&&isRepaintQuantity(material.id)){
    const required=repaintQuantity(material.id,measurements),rawQuantity=required??0;
    return {rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  if(jobId==='paint-ceiling'&&material.id==='primer-ceiling'){
    const required=ceilingPrimerLitres(measurements),rawQuantity=required??0;
    return {rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  const rawQty = Math.max(0, computeRawQuantity(material, measurements));
  const { quantity, packs } = applyRounding(rawQty, material);
  return { rawQuantity: rawQty, quantity, packs };
}

// ─── Summary text ─────────────────────────────────────────────────────────────

function buildSummaryText(
  job: RenovationJob,
  items: readonly MaterialLineItemDetail[],
  measurements: MeasurementMap
): string {
  const area = measurements.wallArea ?? measurements.floorArea ?? measurements.ceilingArea ?? measurements.area;
  const areaStr = area ? ` (${Math.round(area)} m²)` : '';

  const parts = items
    .filter(i => i.purchaseQuantity > 0)
    .slice(0, 3)
    .map(i => {
      const qty = i.packs !== undefined ? i.packs : i.purchaseQuantity;
      const unit = i.purchaseUnit;
      return `${Math.ceil(qty)} ${unit} ${i.material.name.toLowerCase()}`;
    });

  const jobName = job.name.toLowerCase();
  return `${jobName}${areaStr}: ${parts.join(', ')}`;
}

// ─── Engine ────────────────────────────────────────────────────────────────────

class RenovationCalculatorEngine implements CalculatorEngine {
  calculate(job: RenovationJob, measurements: MeasurementMap): CalculationResult {
    const materials = job.id === EPS_JOB_ID ? calculateEpsItems(job.materials as readonly MaterialItem[], measurements) : this.calculateMaterialItems(job, measurements);
    const totalCost = roundMoney(materials.reduce((sum, m) => sum + m.cost, 0));
    const warnings = resolveWarnings(job.warningRules, { measurements });

    return {
      jobId: job.id,
      ...(job.id === EPS_JOB_ID ? { quantityModel: EPS_QUANTITY_MODEL, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === SINK_JOB_ID ? { quantityModel: SINK_QUANTITY_MODEL, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === REPAINT_JOB_ID ? {quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)} : {}),
      measurements,
      materials,
      totalCost,
      totalDays: job.estimatedDays,
      warnings,
    };
  }

  /**
   * Returns the full rich calculation result — with per-material explanations,
   * purchase quantities, waste breakdowns, and a summary text.
   * Suitable for display in result screens and persistable as JSON.
   */
  calculateDetailed(job: RenovationJob, measurements: MeasurementMap): CalculationResultDetail {
    const config = getJobConfig(job.id);

    // Run validation if config has a validator
    const validationErrors = config?.validate?.(measurements) ?? [];

    const detailedItems = this.calculateDetailedItems(job, measurements, config);
    const totalCost = roundMoney(detailedItems.reduce((sum, m) => sum + m.cost, 0));
    const warnings = resolveWarnings(job.warningRules, { measurements });

    // Append validation errors as warnings
    const allWarnings = [
      ...warnings,
      ...validationErrors.map(msg => ({
        condition: 'validation' as const,
        message: msg,
        level: 'warning' as const,
      })),
    ];

    return {
      jobId: job.id,
      measurements,
      materials: detailedItems,
      ...(job.id === EPS_JOB_ID ? { quantityModel: EPS_QUANTITY_MODEL, quantityIssues: detailedItems.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === SINK_JOB_ID ? { quantityModel: SINK_QUANTITY_MODEL, quantityIssues: detailedItems.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === REPAINT_JOB_ID ? {quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)} : {}),
      totalCost,
      totalDays: job.estimatedDays,
      warnings: allWarnings,
      summaryText: buildSummaryText(job, detailedItems, measurements),
      calculatedAt: new Date().toISOString(),
      schemaVersion: 1,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private calculateMaterialItems(
    job: RenovationJob,
    measurements: MeasurementMap
  ): MaterialLineItem[] {
    return job.materials.map((material) => {
      const { rawQuantity, quantity, packs, quantityKnown } = resolveMaterialQuantity(material, measurements, job.id);
      const billableQty = material.priceBasis === 'unit' ? quantity : packs ?? quantity;
      const cost = roundMoney(billableQty * material.pricePerUnit);
      return { material, rawQuantity, quantity, packs, cost, ...(quantityKnown !== undefined ? { quantityKnown } : {}) };
    });
  }

  private calculateDetailedItems(
    job: RenovationJob,
    measurements: MeasurementMap,
    config: ReturnType<typeof getJobConfig>
  ): MaterialLineItemDetail[] {
    const epsItems = job.id === EPS_JOB_ID ? calculateEpsItems(job.materials as readonly MaterialItem[], measurements) : undefined;
    return job.materials.map((material, index) => {
      const { rawQuantity, quantity, packs, quantityKnown } = epsItems?.[index] ?? resolveMaterialQuantity(material, measurements, job.id);

      const packaging = material.packaging;
      const purchaseQuantity = packs !== undefined && packaging ? packs : quantity;
      const purchaseUnit = packs !== undefined && packaging
        ? packaging.purchaseUnit
        : (material.purchaseUnit ?? material.unit);

      const billableQty = material.priceBasis === 'unit' ? quantity : packs ?? quantity;
      const cost = roundMoney(billableQty * material.pricePerUnit);

      const wasteQty = Math.max(0, rawQuantity - (rawQuantity / (material.wasteFactor ?? DEFAULT_WASTE_FACTOR)));

      // Check for per-material explanation override in job config
      const overrideFn = config?.materialExplanationOverrides?.[material.id];
      const explanation = quantityKnown === false && !epsItems ? { text: 'Podaj liczbę umywalek i dodatkowych wężyków w obmiarach.', assumptions: ['Nieznana ilość nie jest darmowym materiałem.'] } : epsItems ? {
        text: epsItems[index].quantityKnown === false ? 'Podaj ilość z projektu lub karty wybranego produktu.' : `${quantity} ${material.unit} z obmiarów i jawnych założeń ocieplenia.`,
        assumptions: ['Zapas płyt i klejów oraz zapas siatki to osobne ustawienia.', 'Liczba łączników, ilości gruntu i tynku oraz długości profili wymagają osobnych danych.'],
      } : overrideFn
        ? overrideFn({ material, rawQuantity, quantity, packs, purchaseQuantity, purchaseUnit, wasteFactor: material.wasteFactor ?? DEFAULT_WASTE_FACTOR, measurements })
        : generateExplanation(material, measurements, rawQuantity, quantity, packs);

      return {
        material: epsItems?.[index].material ?? material,
        ...(epsItems ? { quantityKnown: epsItems[index].quantityKnown } : {}),
        ...(!epsItems && quantityKnown !== undefined ? { quantityKnown } : {}),
        quantity,
        packs,
        cost,
        rawQuantity,
        wasteQuantity: Math.round(wasteQty * 10) / 10,
        purchaseQuantity,
        purchaseUnit,
        explanation,
      };
    });
  }
}

// ─── Singleton + public API ────────────────────────────────────────────────────

export const calculatorEngine: CalculatorEngine & {
  calculateDetailed(job: RenovationJob, m: MeasurementMap): CalculationResultDetail;
} = new RenovationCalculatorEngine();

export function calculateMaterials(
  job: RenovationJob,
  measurements: MeasurementMap
): CalculationResult {
  return calculatorEngine.calculate(job, measurements);
}

export function calculateDetailed(
  job: RenovationJob,
  measurements: MeasurementMap
): CalculationResultDetail {
  return calculatorEngine.calculateDetailed(job, measurements);
}
