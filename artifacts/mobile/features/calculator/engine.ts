import {TRAP_JOB,TRAP_MODEL,isTrapMaterial,trapMaterials,trapQuantity} from './trapReplacement';
import {SEAT_JOB,SEAT_MODEL,isSeatMaterial,seatMaterials,seatQuantity} from './toiletSeatReplacement';
import {SOCKET_FRAME_JOB,SOCKET_FRAME_MODEL,isSocketFrame,socketFrameMaterials,socketFrameQuantity} from './socketFrames';
import {HARDWARE_JOB,HARDWARE_MODEL,isHardwareMaterial,hardwareMaterials,hardwareQuantity} from './cabinetHardware';
import {CABINET_JOB,CABINET_MODEL,isCabinetMaterial,cabinetMaterials,cabinetQuantity,cabinetReferencePlan} from './cabinetPainting';
import { CO_JOB, CO_MODEL, coDetectorMaterial, coDetectorQuantity } from './coDetector';
import {UNDERLAY_JOB,UNDERLAY_MODEL,isUnderlayMaterial,underlayMaterials,underlayQuantity} from './underlayInstall';
import {GROUT_ONLY_JOB,GROUT_ONLY_MODEL,isGroutOnlyMaterial,groutOnlyMaterials,groutOnlyQuantity,groutOnlyExplanation} from './groutOnly';
import {PLASTER_JOB,PLASTER_MODEL,isPlasterMaterial,plasterMaterials,plasterQuantity} from './plastering';
import {WINDOW_JOB, WINDOW_MODEL, isWindowMaterial, windowMaterials, windowQuantity} from './windowSealing';
import { SKIRTING_JOB, SKIRTING_MODEL, isSkirtingMaterial, skirtingMaterials, skirtingQuantity } from './skirting';
import { WATERPROOFING_JOB, WATERPROOFING_MODEL, isWaterproofingMaterial, waterproofingMaterials, waterproofingQuantity } from './waterproofing';
import { REMOVAL_JOB, REMOVAL_MODEL, isRemovalMaterial, removalMaterials, removalQuantity, removalWarnings } from './wallpaperRemoval';
import { WALLPAPER_ADHESIVE_MODEL, WALLPAPER_SUPPLIES_MODEL, WALLPAPER_ROLLS_MODEL, isWallpaperAdhesiveJob, isWallpaperAdhesive, wallpaperAdhesiveMaterial, wallpaperAdhesiveQuantity, wallpaperAdhesiveWarnings } from './wallpaperAdhesive';
import { isWallpaperRoll, wallpaperRollMaterial, wallpaperRollQuantity, wallpaperRollWarnings } from './wallpaperRolls';
import { isWallpaperTape, wallpaperTapeMaterial, wallpaperTapeQuantity, wallpaperTapeWarnings } from './wallpaperTape';
import { isGypsumJob, isGypsumMaterial, gypsumMaterials, gypsumQuantity, gypsumPriceWarnings, GYPSUM_MODEL } from './gypsumBoard';
import { isFrameJob, isFrameMaterial, frameMaterials, frameQuantity, FRAME_MODEL } from './framePainting';
import { isWallFinishingJob, isFinishingMaterial, finishingMaterials, finishingQuantity, WALL_FINISHING_MODEL } from './wallFinishing';
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
import { substratePrimerSpecification, substratePrimerQuantity, levelingEdgeTapeMetres, SUBSTRATE_PRIMER_MODEL } from './substratePrimer';
import { levelingTapeMaterial } from './levelingTape';
import { isSanitaryJob, isSanitaryMaterial, sanitaryMaterials, sanitaryQuantity, SANITARY_MODEL } from './sanitarySealant';
import { LAMINATE_JOB, LAMINATE_SUPPLIES_MODEL, isLaminateSupply, laminateSupplyMaterial, laminateSupplyQuantity, laminateSupplyWarnings } from './laminateSupplies';

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
  if(jobId&&isTrapMaterial(jobId,material.id)){const n=trapQuantity(material.id,measurements),rawQuantity=n??0;return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:n!==null};}
  if(jobId&&isSeatMaterial(jobId,material.id)){const n=seatQuantity(material.id,measurements),rawQuantity=n??0;return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:n!==null};}
  if(jobId&&isSocketFrame(jobId,material.id)){const n=socketFrameQuantity(material.id,measurements),rawQuantity=n??0;return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:n!==null};}
  if(jobId&&isHardwareMaterial(jobId,material.id)){const required=hardwareQuantity(material.id,measurements),rawQuantity=required??0;return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};}
  if(jobId&&isCabinetMaterial(jobId,material.id)){const needed=cabinetQuantity(material.id,measurements),rawQuantity=needed??0;return {rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:needed!==null};}
  if (jobId === CO_JOB && material.id === 'co-detector') { const required = coDetectorQuantity(measurements), rawQuantity = required ?? 0; return { rawQuantity, ...applyRounding(rawQuantity, material), quantityKnown: required !== null }; }
  if(jobId&&isUnderlayMaterial(jobId,material.id)){const required=underlayQuantity(material.id,measurements),rawQuantity=required??0;return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};}
  if(jobId&&isGroutOnlyMaterial(jobId,material.id)){const required=groutOnlyQuantity(material.id,measurements),rawQuantity=required??0;return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};}
  if(jobId&&isPlasterMaterial(jobId,material.id)){const required=plasterQuantity(material.id,measurements),rawQuantity=required??0;return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};}
  if (jobId && isWindowMaterial(jobId, material.id)) {
    const required=windowQuantity(material.id,measurements),rawQuantity=required??0;
    return {rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  if (jobId && isSkirtingMaterial(jobId, material.id)) {
    const required=skirtingQuantity(material.id,measurements),rawQuantity=required??0;
    return {rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  if (jobId && isWaterproofingMaterial(jobId, material.id)) {
    const required = waterproofingQuantity(material.id, measurements), rawQuantity = required ?? 0;
    return { rawQuantity, ...applyRounding(rawQuantity, material), quantityKnown: required !== null };
  }
  if (jobId && isWallpaperRoll(jobId, material.id)) {
    const required = wallpaperRollQuantity(measurements), rawQuantity = required ?? 0;
    return { rawQuantity, ...applyRounding(rawQuantity, material), quantityKnown: required !== null };
  }
  if (jobId && isWallpaperTape(jobId, material.id)) {
    const required = wallpaperTapeQuantity(measurements), rawQuantity = required ?? 0;
    return { rawQuantity, ...applyRounding(rawQuantity, material), quantityKnown: required !== null };
  }
  if (jobId && isWallpaperAdhesive(jobId, material.id)) {
    const required = wallpaperAdhesiveQuantity(measurements), rawQuantity = required ?? 0;
    return { rawQuantity, ...applyRounding(rawQuantity, material), quantityKnown: required !== null };
  }
  if (jobId && isLaminateSupply(jobId, material.id)) {
    const required = laminateSupplyQuantity(material.id, measurements), rawQuantity = required ?? 0;
    return { rawQuantity, ...applyRounding(rawQuantity, material), quantityKnown: required !== null };
  }
  if (jobId === 'laminate-flooring' && material.id === 'laminate-panels'
      || jobId === 'vinyl-flooring' && material.id === 'vinyl-panels') {
    const rawQuantity = Math.max(0, computeRawQuantity(material, measurements));
    const coverage = measurements.panelPackCoverageM2 ?? material.packaging?.size ?? (jobId === 'vinyl-flooring' ? 2 : 2.196);
    if (!Number.isFinite(coverage) || coverage <= 0) return { rawQuantity, quantity: 0, packs: undefined, quantityKnown: false };
    const packs = Math.ceil(rawQuantity / coverage - 1e-10);
    return { rawQuantity, quantity: Number((packs * coverage).toFixed(8)), packs, quantityKnown: true };
  }
  if(jobId&&isRemovalMaterial(jobId,material.id)){
    const required=removalQuantity(material.id,measurements),rawQuantity=required??0;
    return {rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  if(jobId&&isGypsumMaterial(jobId,material.id)){
    const required=gypsumQuantity(jobId,material.id,measurements),rawQuantity=required??0;
    return {rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  if(jobId&&isFrameMaterial(jobId,material.id)){
    const required=frameQuantity(material.id,measurements),rawQuantity=required??0;
    return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  if(jobId&&isFinishingMaterial(jobId,material.id)){
    const required=finishingQuantity(jobId,material.id,measurements),rawQuantity=required??0;
    return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  if(jobId&&isSanitaryMaterial(jobId,material.id)){
    const required=sanitaryQuantity(jobId,material.id,measurements),rawQuantity=required??0;
    return{rawQuantity,...applyRounding(rawQuantity,material),quantityKnown:required!==null};
  }
  if (jobId === 'self-leveling' && material.id === 'expansion-tape') {
    const required = levelingEdgeTapeMetres(measurements), rawQuantity = required ?? 0;
    return { rawQuantity, ...applyRounding(rawQuantity, material), quantityKnown: required !== null };
  }
  if (jobId && substratePrimerSpecification(jobId)?.materialId === material.id) {
    const required = substratePrimerQuantity(jobId, measurements), rawQuantity = required ?? 0;
    return { rawQuantity, ...applyRounding(rawQuantity, material), quantityKnown: required !== null };
  }
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
    if(job.id==='self-leveling'&&measurements.edgeTapeChoice===undefined)measurements={...measurements,edgeTapeChoice:0};
    const materials = job.id === EPS_JOB_ID ? calculateEpsItems(job.materials as readonly MaterialItem[], measurements) : this.calculateMaterialItems(job, measurements);
    const totalCost = roundMoney(materials.reduce((sum, m) => sum + m.cost, 0));
    const warnings = [...resolveWarnings(job.warningRules, { measurements }), ...((isGypsumJob(job.id)||job.id===PLASTER_JOB)?gypsumPriceWarnings(materials):[]), ...(job.id===REMOVAL_JOB?removalWarnings(materials):[]), ...(job.id===LAMINATE_JOB?laminateSupplyWarnings(materials):[]), ...(isWallpaperAdhesiveJob(job.id)?wallpaperAdhesiveWarnings(materials):[]), ...wallpaperTapeWarnings(materials), ...(isWallpaperAdhesiveJob(job.id) ? wallpaperRollWarnings(materials) : [])];

    return {
      jobId: job.id,
      ...(job.id === TRAP_JOB ? {quantityModel:TRAP_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id === SEAT_JOB ? {quantityModel:SEAT_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id === SOCKET_FRAME_JOB ? {quantityModel:SOCKET_FRAME_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id === HARDWARE_JOB ? { quantityModel: HARDWARE_MODEL, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === CABINET_JOB ? { quantityModel: CABINET_MODEL, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === CO_JOB ? { quantityModel: CO_MODEL, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id===UNDERLAY_JOB?{quantityModel:UNDERLAY_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id===GROUT_ONLY_JOB?{quantityModel:GROUT_ONLY_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id===PLASTER_JOB?{quantityModel:PLASTER_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(isGypsumJob(job.id)?{quantityModel:GYPSUM_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(isFrameJob(job.id)?{quantityModel:FRAME_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(isSanitaryJob(job.id)?{quantityModel:SANITARY_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(substratePrimerSpecification(job.id) ? { quantityModel: SUBSTRATE_PRIMER_MODEL, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(isWallpaperAdhesiveJob(job.id) ? { quantityModel: WALLPAPER_ROLLS_MODEL, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === WATERPROOFING_JOB ? { quantityModel: WATERPROOFING_MODEL, quantityIssues: materials.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === SKIRTING_JOB ? {quantityModel:SKIRTING_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)} : {}),
      ...(job.id === WINDOW_JOB ? {quantityModel:WINDOW_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)} : {}),
      ...(job.id===REMOVAL_JOB?{quantityModel:REMOVAL_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id===LAMINATE_JOB?{quantityModel:LAMINATE_SUPPLIES_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(isWallFinishingJob(job.id)?{quantityModel:WALL_FINISHING_MODEL,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
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
    if(job.id==='self-leveling'&&measurements.edgeTapeChoice===undefined)measurements={...measurements,edgeTapeChoice:0};
    const config = getJobConfig(job.id);

    // Run validation if config has a validator
    const validationErrors = config?.validate?.(measurements) ?? [];

    const detailedItems = this.calculateDetailedItems(job, measurements, config);
    const totalCost = roundMoney(detailedItems.reduce((sum, m) => sum + m.cost, 0));
    const warnings = [...resolveWarnings(job.warningRules, { measurements }), ...((isGypsumJob(job.id)||job.id===PLASTER_JOB)?gypsumPriceWarnings(detailedItems):[]), ...(job.id===REMOVAL_JOB?removalWarnings(detailedItems):[]), ...(job.id===LAMINATE_JOB?laminateSupplyWarnings(detailedItems):[]), ...(isWallpaperAdhesiveJob(job.id)?wallpaperAdhesiveWarnings(detailedItems):[]), ...wallpaperTapeWarnings(detailedItems), ...(isWallpaperAdhesiveJob(job.id) ? wallpaperRollWarnings(detailedItems) : [])];

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
      ...(job.id === TRAP_JOB ? {quantityModel:TRAP_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id === SEAT_JOB ? {quantityModel:SEAT_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id === SOCKET_FRAME_JOB ? {quantityModel:SOCKET_FRAME_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id === HARDWARE_JOB ? { quantityModel: HARDWARE_MODEL, quantityIssues: detailedItems.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === CABINET_JOB ? { quantityModel: CABINET_MODEL, quantityIssues: detailedItems.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === CO_JOB ? { quantityModel: CO_MODEL, quantityIssues: detailedItems.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id===UNDERLAY_JOB?{quantityModel:UNDERLAY_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id===GROUT_ONLY_JOB?{quantityModel:GROUT_ONLY_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id===PLASTER_JOB?{quantityModel:PLASTER_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(isGypsumJob(job.id)?{quantityModel:GYPSUM_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(isFrameJob(job.id)?{quantityModel:FRAME_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(isSanitaryJob(job.id)?{quantityModel:SANITARY_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(substratePrimerSpecification(job.id) ? { quantityModel: SUBSTRATE_PRIMER_MODEL, quantityIssues: detailedItems.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(isWallpaperAdhesiveJob(job.id) ? { quantityModel: WALLPAPER_ROLLS_MODEL, quantityIssues: detailedItems.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === WATERPROOFING_JOB ? { quantityModel: WATERPROOFING_MODEL, quantityIssues: detailedItems.filter(line => line.quantityKnown === false).map(line => line.material.name) } : {}),
      ...(job.id === SKIRTING_JOB ? {quantityModel:SKIRTING_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)} : {}),
      ...(job.id === WINDOW_JOB ? {quantityModel:WINDOW_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)} : {}),
      ...(job.id===REMOVAL_JOB?{quantityModel:REMOVAL_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(job.id===LAMINATE_JOB?{quantityModel:LAMINATE_SUPPLIES_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
      ...(isWallFinishingJob(job.id)?{quantityModel:WALL_FINISHING_MODEL,quantityIssues:detailedItems.filter(line=>line.quantityKnown===false).map(line=>line.material.name)}:{}),
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
      if(job.id===TRAP_JOB)material=trapMaterials(measurements).find(row=>row.id===material.id)??material;
      if(job.id===SEAT_JOB)material=seatMaterials(measurements).find(row=>row.id===material.id)??material;
      if(job.id===SOCKET_FRAME_JOB)material=socketFrameMaterials(measurements).find(row=>row.id===material.id)??material;
      if(job.id===HARDWARE_JOB)material=hardwareMaterials(measurements).find(row=>row.id===material.id)??material;
      if(job.id===CABINET_JOB)material=cabinetMaterials(measurements).find(row=>row.id===material.id)??material;
      if (job.id === CO_JOB && material.id === 'co-detector') material = coDetectorMaterial(measurements);
      if(job.id===UNDERLAY_JOB)material=underlayMaterials(measurements).find(r=>r.id===material.id)??material;
      if(job.id===GROUT_ONLY_JOB)material=groutOnlyMaterials(measurements).find(r=>r.id===material.id)??material;
      if(job.id===PLASTER_JOB)material=plasterMaterials(measurements).find(r=>r.id===material.id)??material;
      if (job.id === WINDOW_JOB) material = windowMaterials(measurements).find(row => row.id === material.id) ?? material;
      if (job.id === SKIRTING_JOB) material = skirtingMaterials(measurements).find(row => row.id === material.id) ?? material;
      if (job.id === WATERPROOFING_JOB) material = waterproofingMaterials(measurements).find(row => row.id === material.id) ?? material;
      if (isWallpaperRoll(job.id, material.id) && !isRichMaterial(material)) material = wallpaperRollMaterial(material, measurements);
      if (isWallpaperTape(job.id, material.id) && !isRichMaterial(material)) material = wallpaperTapeMaterial(material);
      if (isWallpaperAdhesive(job.id, material.id) && !isRichMaterial(material)) material = wallpaperAdhesiveMaterial(material, measurements);
      if (isLaminateSupply(job.id, material.id) && !isRichMaterial(material)) material = laminateSupplyMaterial(material, measurements);
      if(job.id===REMOVAL_JOB)material=removalMaterials(measurements).find(row=>row.id===material.id)??material;
      if(isGypsumJob(job.id))material=gypsumMaterials(job.id,measurements).find(row=>row.id===material.id)??material;
      if(isFrameJob(job.id))material=frameMaterials(measurements).find(row=>row.id===material.id)??material;
      if(isWallFinishingJob(job.id))material=finishingMaterials(job.id,measurements).find(row=>row.id===material.id)??material;
      if(isSanitaryJob(job.id))material=sanitaryMaterials(job.id,measurements).find(row=>row.id===material.id)??material;
      if (job.id === 'self-leveling' && material.id === 'expansion-tape' && !isRichMaterial(material)) material = levelingTapeMaterial(material, measurements);
      const { rawQuantity, quantity, packs, quantityKnown } = resolveMaterialQuantity(material, measurements, job.id);
      const billableQty = material.priceBasis === 'unit' ? quantity : packs ?? quantity;
      const cost = job.id===CABINET_JOB && material.id==='cabinet-paint' && measurements.cabinetPaintPack===3 ? (cabinetReferencePlan(measurements)?.totalGrosze??0)/100 : roundMoney(billableQty * material.pricePerUnit);
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
      if(job.id===TRAP_JOB)material=trapMaterials(measurements).find(row=>row.id===material.id)??material;
      if(job.id===SEAT_JOB)material=seatMaterials(measurements).find(row=>row.id===material.id)??material;
      if(job.id===SOCKET_FRAME_JOB)material=socketFrameMaterials(measurements).find(row=>row.id===material.id)??material;
      if(job.id===HARDWARE_JOB)material=hardwareMaterials(measurements).find(row=>row.id===material.id)??material;
      if(job.id===CABINET_JOB)material=cabinetMaterials(measurements).find(row=>row.id===material.id)??material;
      if (job.id === CO_JOB && material.id === 'co-detector') material = coDetectorMaterial(measurements);
      if(job.id===UNDERLAY_JOB)material=underlayMaterials(measurements).find(r=>r.id===material.id)??material;
      if(job.id===GROUT_ONLY_JOB)material=groutOnlyMaterials(measurements).find(r=>r.id===material.id)??material;
      if(job.id===PLASTER_JOB)material=plasterMaterials(measurements).find(r=>r.id===material.id)??material;
      if (job.id === WINDOW_JOB) material = windowMaterials(measurements).find(row => row.id === material.id) ?? material;
      if (job.id === SKIRTING_JOB) material = skirtingMaterials(measurements).find(row => row.id === material.id) ?? material;
      if (job.id === WATERPROOFING_JOB) material = waterproofingMaterials(measurements).find(row => row.id === material.id) ?? material;
      if (isWallpaperRoll(job.id, material.id) && !isRichMaterial(material)) material = wallpaperRollMaterial(material, measurements);
      if (isWallpaperTape(job.id, material.id) && !isRichMaterial(material)) material = wallpaperTapeMaterial(material);
      if (isWallpaperAdhesive(job.id, material.id) && !isRichMaterial(material)) material = wallpaperAdhesiveMaterial(material, measurements);
      if (isLaminateSupply(job.id, material.id) && !isRichMaterial(material)) material = laminateSupplyMaterial(material, measurements);
      if(job.id===REMOVAL_JOB)material=removalMaterials(measurements).find(row=>row.id===material.id)??material;
      if(isGypsumJob(job.id))material=gypsumMaterials(job.id,measurements).find(row=>row.id===material.id)??material;
      if(isFrameJob(job.id))material=frameMaterials(measurements).find(row=>row.id===material.id)??material;
      if(isWallFinishingJob(job.id))material=finishingMaterials(job.id,measurements).find(row=>row.id===material.id)??material;
      if(isSanitaryJob(job.id))material=sanitaryMaterials(job.id,measurements).find(row=>row.id===material.id)??material;
      if (job.id === 'self-leveling' && material.id === 'expansion-tape' && !isRichMaterial(material)) material = levelingTapeMaterial(material, measurements);
      const { rawQuantity, quantity, packs, quantityKnown } = epsItems?.[index] ?? resolveMaterialQuantity(material, measurements, job.id);

      const packaging = material.packaging;
      const purchaseQuantity = packs !== undefined && packaging ? packs : quantity;
      const purchaseUnit = packs !== undefined && packaging
        ? packaging.purchaseUnit
        : (material.purchaseUnit ?? material.unit);

      const billableQty = material.priceBasis === 'unit' ? quantity : packs ?? quantity;
      const cost = job.id===CABINET_JOB && material.id==='cabinet-paint' && measurements.cabinetPaintPack===3 ? (cabinetReferencePlan(measurements)?.totalGrosze??0)/100 : roundMoney(billableQty * material.pricePerUnit);

      const appliedWasteFactor = isCabinetMaterial(job.id,material.id) ? (material.id === 'cabinet-paint' ? 1 + (measurements.cabinetReservePercent ?? 10) / 100 : 1) : job.id === WINDOW_JOB && quantityKnown !== false && ['silicone-window','window-tape'].includes(material.id)
        ? 1 + (measurements.windowReservePercent ?? 10) / 100 : material.wasteFactor ?? DEFAULT_WASTE_FACTOR;
      const wasteQty = Math.max(0, rawQuantity - (rawQuantity / appliedWasteFactor));

      // Check for per-material explanation override in job config
      const overrideFn = config?.materialExplanationOverrides?.[material.id];
      const explanation = isTrapMaterial(job.id,material.id) ? {text:quantityKnown===false?'Dobierz syfon i potwierdź komplet pasujących połączeń.':rawQuantity===0?'Potwierdzono komplet połączeń bez dodatkowych zakupów.':`${rawQuantity} syfonów = ${purchaseQuantity} szt.`,assumptions:[material.notes??'','Całe sztuki bez automatycznego zapasu. Taśma PTFE nie jest automatycznym dodatkiem.']} : isSocketFrame(job.id,material.id) ? {text:quantityKnown===false?'Potwierdź zgodność serii i policz całe ramki w poszczególnych układach.':rawQuantity===0?'Tego rodzaju ramki nie potrzebujesz.':`${rawQuantity} całych ramek = ${purchaseQuantity} szt.`,assumptions:[material.notes??'','Bez zapasu i bez mnożenia przez liczbę otworów. Pojedyncze = łączna liczba ramek minus podwójne i potrójne.']} : isHardwareMaterial(job.id,material.id) ? {text:quantityKnown===false?'Wybierz uchwyt, zmierz rozstaw i potwierdź pasowanie śrub.':rawQuantity===0?'Śruby są w zestawie lub potwierdzono odpowiednie posiadane śruby.':`${rawQuantity} uchwytów = ${purchaseQuantity} szt.; po dwie śruby M4×22 w każdym zestawie.`,assumptions:[material.notes??'','Bez automatycznego zapasu. Rozstaw 128 mm wymaga pomiaru; długość całkowita uchwytu to 138 mm.']} : isCabinetMaterial(job.id,material.id) ? {
        text:quantityKnown===false?'Uzupełnij podłoże, powierzchnię, opakowanie lub potrzebne środki w obmiarach.':rawQuantity===0?'Dla tego wariantu zakup nie jest potrzebny lub potwierdzono posiadane środki.':measurements.cabinetPaintPack===3&&material.id==='cabinet-paint'?`${Number(rawQuantity.toFixed(2))} ml: pełne puszki dobierzemy w porównaniu całego koszyka z dostawą.`:`${Number(rawQuantity.toFixed(2))} ${material.unit} → ${purchaseQuantity} ${purchaseUnit}.`,
        assumptions:[material.notes??'','Farba: powierzchnia wszystkich malowanych stron × liczba warstw ÷ wydajność, z jednym podanym zapasem. Liczba frontów nie wyznacza powierzchni.','Arkusze i butelki według podanej liczby. Surowe ilości tego samego EAN sumujemy między pracami przed doborem opakowań.'],
      } : isUnderlayMaterial(job.id,material.id) ? {text:quantityKnown===false?'Uzupełnij dobór, zgodność lub rzeczywisty pomiar w obmiarach.':rawQuantity===0?'Zakup świadomie pominięty lub bariera jest zintegrowana z podkładem.':`${rawQuantity} ${material.unit} → ${purchaseQuantity} ${purchaseUnit}.`,assumptions:[material.notes??'','Zapas na docinki dotyczy tylko podkładu. Powierzchnia folii zawiera podane zakłady i wywinięcia, długość taśmy pochodzi z pomiaru.','Surowe ilości identycznych produktów łączymy przed zakupem pełnych opakowań.']} : isGroutOnlyMaterial(job.id,material.id) ? groutOnlyExplanation(material.id,measurements,rawQuantity,packs,material.unit) : isWindowMaterial(job.id,material.id) ? {
        text:quantityKnown===false?'Wybierz zakres naprawy i uzupełnij dobór lub ilość w obmiarach.':rawQuantity===0?'Zakup pominięty w wybranym zakresie lub potwierdzono posiadanie.':`${rawQuantity} ${material.unit} z obmiarów → ${purchaseQuantity} ${purchaseUnit} (${material.packaging?.label}).`,
        assumptions:[material.notes??'',`Zapas akrylu lub długości taśmy: ${measurements.windowReservePercent??10}%. Puszki pianki i rolki taśmy maskującej liczone oddzielnie.`,'Wspólny koszyk sumuje surowe zapotrzebowanie tego samego produktu przed doborem opakowań.'],
      } : isWallpaperAdhesive(job.id,material.id) ? {text:quantityKnown===false?'Wybierz rodzaj tapety zgodny z kartą producenta.':`${rawQuantity} g suchego kleju → ${purchaseQuantity} ${purchaseUnit} (${material.packaging?.label}).`,assumptions:[material.notes??'','Zapas z obmiarów. Gramy tego samego kleju sumujemy między pracami przed doborem opakowań.']} : isRemovalMaterial(job.id,material.id) ? {text:quantityKnown===false?'Uzupełnij ilość napraw lub powierzchnię do zabezpieczenia w obmiarach.':`${rawQuantity} ${material.unit} z obmiarów → ${purchaseQuantity} ${purchaseUnit} (${material.packaging?.label}).`,assumptions:[material.notes??'','Wspólny koszyk sumuje zapotrzebowanie przed doborem pełnych opakowań.']} : isGypsumJob(job.id) ? { text: quantityKnown===false?'Potwierdź wymiary, wariant konstrukcji lub dobór mocowań.':`${rawQuantity} ${material.unit} → ${purchaseQuantity} ${purchaseUnit}.`, assumptions:[material.notes??'','Normy producenta + jawny zapas. Zestawienie zakupów wymaga sprawdzenia z projektem konstrukcji.'] } : isFinishingMaterial(job.id,material.id) ? {
        text:quantityKnown===false?'Uzupełnij powierzchnię napraw, głębokość, długość rys lub liczbę arkuszy w obmiarach.':`${rawQuantity} ${material.unit} z obmiarów → ${purchaseQuantity} ${purchaseUnit} (${material.packaging?.label}).`,
        assumptions:[material.notes??'','Opakowania zaokrąglamy dopiero po zsumowaniu prac w koszyku.'],
      } : isSanitaryMaterial(job.id,material.id) ? {
        text:quantityKnown===false?'Sprawdź długość, wymiary spoiny i wybrany produkt w obmiarach.':`${rawQuantity} ${material.unit} z obmiarów → ${purchaseQuantity} ${purchaseUnit} (${material.packaging?.label}).`,
        assumptions:[material.notes??'','Przekrój silikonu: '+(measurements.sealantWidthMm??5)+' × '+(measurements.sealantDepthMm??5)+' mm; zapas '+(measurements.sealantReservePercent??10)+'%.','Pełne opakowania dobieramy po zsumowaniu prac.'],
      } : substratePrimerSpecification(job.id)?.materialId === material.id ? {
        text: quantityKnown === false ? 'Uzupełnij powierzchnię i zużycie gruntu w obmiarach.' : `${rawQuantity} ${material.unit} gruntu z obmiarów → ${purchaseQuantity} ${purchaseUnit} (${material.packaging?.label}).`,
        assumptions: [material.notes ?? '', 'Wspólny koszyk sumuje zużycie przed doborem pełnych opakowań.'],
      } : quantityKnown === false && !epsItems ? { text: job.id === 'self-leveling' ? 'Podaj długość taśmy przy ścianach w obmiarach.' : job.id === SINK_JOB_ID ? 'Podaj liczbę umywalek i dodatkowych wężyków w obmiarach.' : 'Uzupełnij ilość tego materiału w obmiarach.', assumptions: ['Nieznana ilość nie jest darmowym materiałem.'] } : epsItems ? {
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
