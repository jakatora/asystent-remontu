import {TRAP_MODEL,isTrapMaterial,trapQuantity} from './trapReplacement';
import {SEAT_MODEL,isSeatMaterial,seatQuantity} from './toiletSeatReplacement';
import {SOCKET_FRAME_MODEL,isSocketFrame,socketFrameQuantity} from './socketFrames';
import {HARDWARE_MODEL,isHardwareMaterial,hardwareQuantity} from './cabinetHardware';
import {CABINET_MODEL,isCabinetMaterial,cabinetQuantity} from './cabinetPainting';
import {UNDERLAY_MODEL,isUnderlayMaterial,underlayQuantity} from './underlayInstall';
import {GROUT_ONLY_MODEL,isGroutOnlyMaterial,groutOnlyQuantity} from './groutOnly';
import {PLASTER_MODEL,isPlasterMaterial,plasterQuantity} from './plastering';
import {WINDOW_JOB, WINDOW_MODEL, isWindowMaterial, windowMaterials, windowQuantity} from './windowSealing';
import { SKIRTING_JOB, SKIRTING_MODEL, isSkirtingMaterial, skirtingMaterials, skirtingQuantity } from './skirting';
import { WATERPROOFING_JOB, WATERPROOFING_MODEL, isWaterproofingMaterial, waterproofingMaterials, waterproofingQuantity } from './waterproofing';
import { REMOVAL_JOB, REMOVAL_MODEL, isRemovalMaterial, removalMaterials, removalQuantity } from './wallpaperRemoval';
import { isWallpaperAdhesive, isCurrentWallpaperAdhesiveModel, isCurrentWallpaperTapeModel, WALLPAPER_ROLLS_MODEL, wallpaperAdhesiveQuantity } from './wallpaperAdhesive';
import { isWallpaperRoll, wallpaperRollQuantity } from './wallpaperRolls';
import { isWallpaperTape, wallpaperTapeQuantity } from './wallpaperTape';
import { isGypsumMaterial, gypsumQuantity, GYPSUM_MODEL } from './gypsumBoard';
import { isFrameMaterial, frameQuantity, FRAME_MODEL } from './framePainting';
import { isFinishingMaterial, finishingQuantity, WALL_FINISHING_MODEL } from './wallFinishing';
import type { CalculationResult, MaterialLineItem } from '@/types/domain';
import { getJobById } from '@/features/content/registry';
import { computeRawQuantity } from './engine';
import { epsRequirement, EPS_JOB_ID } from './eps';
import { isSinkConnection, sinkConnectionQuantity, SINK_JOB_ID, SINK_QUANTITY_MODEL } from './sink';
import { ceilingPrimerLitres } from './ceilingPrimer';
import { isCurrentSubstratePrimer, substratePrimerQuantity, levelingEdgeTapeMetres, SUBSTRATE_PRIMER_MODEL } from './substratePrimer';
import { isSanitaryMaterial, sanitaryQuantity, SANITARY_MODEL } from './sanitarySealant';
import { isLaminateSupply, laminateSupplyQuantity, LAMINATE_SUPPLIES_MODEL } from './laminateSupplies';

/** Old JSON snapshots do not retain inline formula functions. Resolve by stable ID. */
export function getRequiredQuantity(line: MaterialLineItem, calc: CalculationResult): number {
  if(calc.quantityModel===TRAP_MODEL&&isTrapMaterial(calc.jobId,line.material.id))return trapQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===SEAT_MODEL&&isSeatMaterial(calc.jobId,line.material.id))return seatQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===SOCKET_FRAME_MODEL&&isSocketFrame(calc.jobId,line.material.id))return socketFrameQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===HARDWARE_MODEL&&isHardwareMaterial(calc.jobId,line.material.id))return hardwareQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===CABINET_MODEL&&isCabinetMaterial(calc.jobId,line.material.id))return cabinetQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===UNDERLAY_MODEL&&isUnderlayMaterial(calc.jobId,line.material.id))return underlayQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===GROUT_ONLY_MODEL&&isGroutOnlyMaterial(calc.jobId,line.material.id))return groutOnlyQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===PLASTER_MODEL&&isPlasterMaterial(calc.jobId,line.material.id))return plasterQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===WINDOW_MODEL&&isWindowMaterial(calc.jobId,line.material.id))return windowQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===SKIRTING_MODEL&&isSkirtingMaterial(calc.jobId,line.material.id))return skirtingQuantity(line.material.id,calc.measurements)??0;
  if (calc.quantityModel === WATERPROOFING_MODEL && isWaterproofingMaterial(calc.jobId, line.material.id)) return waterproofingQuantity(line.material.id, calc.measurements) ?? 0;
  if (calc.quantityModel === WALLPAPER_ROLLS_MODEL && isWallpaperRoll(calc.jobId, line.material.id)) return wallpaperRollQuantity(calc.measurements) ?? 0;
  if (isCurrentWallpaperAdhesiveModel(calc.quantityModel) && isWallpaperAdhesive(calc.jobId, line.material.id)) return wallpaperAdhesiveQuantity(calc.measurements) ?? 0;
  if (isCurrentWallpaperTapeModel(calc.quantityModel) && isWallpaperTape(calc.jobId, line.material.id)) return wallpaperTapeQuantity(calc.measurements) ?? 0;
  if (calc.quantityModel === LAMINATE_SUPPLIES_MODEL && isLaminateSupply(calc.jobId, line.material.id)) return laminateSupplyQuantity(line.material.id, calc.measurements) ?? 0;
  // Old laminate and click-vinyl snapshots stored pack counts labelled m².
  // Recover the original floor area plus its existing cutting allowance.
  // source: https://krono-shop.com/ro/en/faq
  // source: https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474
  if (calc.jobId === 'laminate-flooring' && line.material.id === 'laminate-panels'
      || calc.jobId === 'vinyl-flooring' && line.material.id === 'vinyl-panels') {
    const definition = getJobById(calc.jobId)?.materials.find(material => material.id === line.material.id);
    if (definition) return Math.max(0, computeRawQuantity(definition, calc.measurements));
  }
  if(calc.quantityModel===REMOVAL_MODEL&&isRemovalMaterial(calc.jobId,line.material.id))return removalQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===GYPSUM_MODEL&&isGypsumMaterial(calc.jobId,line.material.id))return gypsumQuantity(calc.jobId,line.material.id,calc.measurements)??0;
  if(calc.quantityModel===FRAME_MODEL&&isFrameMaterial(calc.jobId,line.material.id))return frameQuantity(line.material.id,calc.measurements)??0;
  if(calc.quantityModel===WALL_FINISHING_MODEL&&isFinishingMaterial(calc.jobId,line.material.id))return finishingQuantity(calc.jobId,line.material.id,calc.measurements)??0;
  if(calc.quantityModel===SANITARY_MODEL&&isSanitaryMaterial(calc.jobId,line.material.id))return sanitaryQuantity(calc.jobId,line.material.id,calc.measurements)??0;
  if (calc.jobId === 'self-leveling' && calc.quantityModel === SUBSTRATE_PRIMER_MODEL && line.material.id === 'expansion-tape') return levelingEdgeTapeMetres(calc.measurements) ?? 0;
  if (isCurrentSubstratePrimer(calc, line)) return substratePrimerQuantity(calc.jobId, calc.measurements) ?? 0;
  if (calc.jobId === EPS_JOB_ID) return epsRequirement(line.material.id, calc.measurements) ?? 0;
  if (calc.jobId === SINK_JOB_ID && isSinkConnection(line.material.id)) return sinkConnectionQuantity(line.material.id, calc.measurements, calc.quantityModel === SINK_QUANTITY_MODEL) ?? 0;
  if(calc.jobId==='paint-ceiling'&&line.material.id==='primer-ceiling')return ceilingPrimerLitres(calc.measurements)??0;
  // Historical grout snapshots contain the former unit/fallback error. Resolve
  // from saved dimensions instead of trusting that stale rounded/raw amount.
  if (['floor-tiles', 'wall-tiles-bathroom', 'kitchen-backsplash', 'grout-only'].includes(calc.jobId)) {
    const definition = getJobById(calc.jobId)?.materials.find(material => material.id === line.material.id);
    if (definition && 'formulaKey' in definition && ['grout','kitchenEpoxyGrout','kitchenWhiteAdhesive','kitchenSpacers'].includes(definition.formulaKey ?? '')) return computeRawQuantity(definition, calc.measurements);
  }
  // Historical self-leveling snapshots have rawQuantity=1 because byThickness
  // fell back to the constant formula. Restore demand from their saved measures.
  if (calc.jobId === 'self-leveling' && line.material.id === 'leveling-compound') {
    const definition = getJobById(calc.jobId)?.materials.find(material => material.id === line.material.id);
    if (definition) return Math.max(0, computeRawQuantity(definition, calc.measurements));
  }
  // Historical painting snapshots stored one 20 m² sheet as "1 m²".
  // Preserve the purchased package count while restoring the real base unit.
  if (calc.jobId === 'paint-walls' && line.material.id === 'drop-cloth' && line.material.packaging?.size === 1) return (line.packs ?? line.quantity) * 20;
  // Old tape snapshots use rolls; do not recompute them from new default inputs.
  if (calc.jobId === 'paint-walls' && line.material.id === 'painters-tape' && line.material.unit === 'rolka') return line.rawQuantity ?? line.quantity;
  if (Number.isFinite(line.rawQuantity) && line.rawQuantity! >= 0) return line.rawQuantity!;
  const definition = getJobById(calc.jobId)?.materials.find(material => material.id === line.material.id);
  return definition ? Math.max(0, computeRawQuantity(definition, calc.measurements)) : line.quantity;
}
