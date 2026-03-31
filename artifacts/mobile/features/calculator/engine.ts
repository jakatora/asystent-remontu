import type { RenovationJob, CalculationResult, MaterialLineItem, MaterialItem } from '@/types/domain';
import type { MaterialRequirement } from '@/types/engine';
import type { CalculatorEngine, MeasurementMap } from '@/types/calculator';
import type { MaterialLineItemDetail, CalculationResultDetail } from '@/types/calculation';
import { resolveFormula } from './formulas';
import { generateExplanation } from './explanation';
import { getJobConfig } from './job-config';
import { resolveWarnings } from '../warnings/resolver';
import { roundMoney } from '@/shared/lib/currency';

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

function computeRawQuantity(
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
  measurements: MeasurementMap
): { rawQuantity: number; quantity: number; packs: number | undefined } {
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
    const materials = this.calculateMaterialItems(job, measurements);
    const totalCost = roundMoney(materials.reduce((sum, m) => sum + m.cost, 0));
    const warnings = resolveWarnings(job.warningRules, { measurements });

    return {
      jobId: job.id,
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
      const { quantity, packs } = resolveMaterialQuantity(material, measurements);
      const billableQty = packs !== undefined ? packs : quantity;
      const cost = roundMoney(billableQty * material.pricePerUnit);
      return { material, quantity, packs, cost };
    });
  }

  private calculateDetailedItems(
    job: RenovationJob,
    measurements: MeasurementMap,
    config: ReturnType<typeof getJobConfig>
  ): MaterialLineItemDetail[] {
    return job.materials.map((material) => {
      const { rawQuantity, quantity, packs } = resolveMaterialQuantity(material, measurements);

      const packaging = material.packaging;
      const purchaseQuantity = packs !== undefined && packaging ? packs : quantity;
      const purchaseUnit = packs !== undefined && packaging
        ? packaging.purchaseUnit
        : (material.purchaseUnit ?? material.unit);

      const billableQty = packs !== undefined ? packs : quantity;
      const cost = roundMoney(billableQty * material.pricePerUnit);

      const wasteQty = Math.max(0, rawQuantity - (rawQuantity / (material.wasteFactor ?? DEFAULT_WASTE_FACTOR)));

      // Check for per-material explanation override in job config
      const overrideFn = config?.materialExplanationOverrides?.[material.id];
      const explanation = overrideFn
        ? overrideFn({ material, rawQuantity, quantity, packs, purchaseQuantity, purchaseUnit, wasteFactor: material.wasteFactor ?? DEFAULT_WASTE_FACTOR, measurements })
        : generateExplanation(material, measurements, rawQuantity, quantity, packs);

      return {
        material,
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
