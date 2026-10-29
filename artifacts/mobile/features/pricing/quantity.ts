import {TRAP_JOB,TRAP_MODEL,trapMaterials,trapReference,trapQuantity} from '@/features/calculator/trapReplacement';
import {SEAT_JOB,SEAT_MODEL,seatMaterials,seatReference,seatQuantity} from '@/features/calculator/toiletSeatReplacement';
import {SOCKET_FRAME_JOB,SOCKET_FRAME_MODEL,socketFrameMaterials,socketFrameReference,socketFrameQuantity} from '@/features/calculator/socketFrames';
import {HARDWARE_JOB,HARDWARE_MODEL,hardwareMaterials,hardwareReference,hardwareQuantity} from '@/features/calculator/cabinetHardware';
import {CABINET_JOB,CABINET_MODEL,cabinetMaterials,cabinetReference} from '@/features/calculator/cabinetPainting';
import {UNDERLAY_JOB,UNDERLAY_MODEL,underlayMaterials,underlayReference} from '@/features/calculator/underlayInstall';
import {GROUT_ONLY_JOB,GROUT_ONLY_MODEL,groutOnlyMaterials,groutOnlyReference} from '@/features/calculator/groutOnly';
import {PLASTER_JOB,PLASTER_MODEL,plasterMaterials,plasterReference} from '@/features/calculator/plastering';
import {WINDOW_JOB,WINDOW_MODEL,windowMaterials,windowReference} from '@/features/calculator/windowSealing';
import {SKIRTING_JOB,SKIRTING_MODEL,skirtingMaterials,skirtingReference} from '@/features/calculator/skirting';
import { WATERPROOFING_JOB, WATERPROOFING_MODEL, waterproofingMaterials, waterproofingReference } from '@/features/calculator/waterproofing';
import { REMOVAL_JOB, REMOVAL_MODEL, isRemovalMaterial, removalMaterials, removalReference } from '@/features/calculator/wallpaperRemoval';
import { isWallpaperAdhesiveJob, wallpaperAdhesiveReference, wallpaperAdhesiveEan, isCurrentWallpaperAdhesiveModel, isCurrentWallpaperTapeModel, WALLPAPER_ROLLS_MODEL } from '@/features/calculator/wallpaperAdhesive';
import { WALLPAPER_ROLL_REFERENCE } from '@/features/calculator/wallpaperRolls';
import { ERISMANN_3333_5_EAN } from '../../../../lib/pricing-service/src/wallpaper-rolls';
import { WALLPAPER_TAPE_ID, WALLPAPER_TAPE_REFERENCE, WALLPAPER_TAPE_EAN } from '@/features/calculator/wallpaperTape';
import { LAMINATE_JOB, LAMINATE_SUPPLIES_MODEL, laminateSupplyReference } from '@/features/calculator/laminateSupplies';
import { isGypsumJob, gypsumMaterials, gypsumReference, GYPSUM_MODEL } from '@/features/calculator/gypsumBoard';
import { isFrameJob, frameMaterials, frameReference, FRAME_MODEL } from '@/features/calculator/framePainting';
import { isWallFinishingJob, finishingMaterials, finishingReference, WALL_FINISHING_MODEL } from '@/features/calculator/wallFinishing';
import type { CalculationResult, MaterialLineItem } from '@/types/domain';
import type { MaterialPriceReference } from '@/types/pricing';
import { getRequiredQuantity } from '@/features/calculator/requirements';
import { isTileSpacer } from './tileSpacers';
import { substratePrimerSpecification, isCurrentSubstratePrimer } from '@/features/calculator/substratePrimer';

export function normalizeUnit(unit: string): string {
  const key = unit.toLowerCase().replace(/[.\s]/g, '');
  if (['l', 'litr', 'litry', 'litrow'].includes(key)) return 'l';
  if (['m²', 'm2'].includes(key)) return 'm2';
  if (['m', 'mb', 'mbieżący'].includes(key)) return 'm';
  if (['szt', 'sztuka', 'sztuki'].includes(key)) return 'szt';
  return key;
}

// These aliases identify existing calculator materials. They do not introduce
// consumption assumptions or conversions between unrelated physical units.
const MATERIAL_IDS: Readonly<Record<string, RegExp>> = {
  paint: /^(paint|ceiling-paint|cabinet-paint)$/,
  primer: /primer/,
  'paint-undercoat': /^primer-repaint$/,
  'skim-coat': /^skim-coat$/,
  plaster: /^plaster-base$/,
  'plaster-corner': /^plaster-corner$/,
  screed: /^leveling-compound$/,
  adhesive: /^(tile-adhesive|wall-tile-adhesive|vinyl-adhesive)$/,
  grout: /^(grout|wall-grout)$/,
  'epoxy-grout': /^grout-kitchen$/,
  'white-tile-adhesive': /^tile-adhesive$/,
  'tile-spacer': /^(tile-crosses|wall-crosses|tile-crosses-kitchen)$/,
  tile: /^(tiles|wall-tiles|backsplash-tiles)$/,
  laminate: /^laminate-panels$/,
  'vinyl-panel': /^(vinyl-panels|vinyl-roll)$/,
  underlay: /^underlay/,
  'vapor-barrier': /^vapor-barrier$/,
  skirting: /^(skirting|skirting-glued)$/,
  'expansion-tape': /^expansion-tape$/,
  'sealing-tape': /^sealing-tape$/,
  waterproofing: /^membrane$/,
  'masking-tape': /^(painters-tape|masking-tape.*)$/,
  'protective-film': /^drop-cloth$/,
  washbasin: /^washbasin$/,
  toilet: /^wc-compact$/,
  faucet: /^basin-mixer$/,
  trap: /^basin-trap$/,
  silicone: /^(sanitary-silicone|silicone-kitchen|wall-silicone|silicone-grout|wc-silicone|countertop-silicone|silicone|fresh-silicone)$/,
  'silicone-remover': /^silicone-remover$/,
  valve: /angle-valve/,
  hose: /flex-hose/,
  'mounting-set': /^wc-mounting-set$/,
  'basin-fixings': /^basin-fixings$/,
  threshold: /^threshold/,
  screws: /^gk-screws(?:-ceiling)?$/,
  dowels: /^dowels-uw$/,
  'adhesive-eps': /^glue-k20$/,
  foam: /^(mounting-foam|windowsill-foam)$/,
};

/** Match a known material and compatible units; missing information is not m². */
export function resolveMaterialQuantity(
  ref: MaterialPriceReference,
  calc: CalculationResult,
): { quantity: number; source: MaterialLineItem } | null {
  if(calc.jobId===SEAT_JOB){
    const def=seatMaterials(calc.measurements).find(row=>seatReference(row.id,calc.measurements)===ref.id),source=def&&calc.materials.find(l=>l.material.id===def.id),n=def&&seatQuantity(def.id,calc.measurements);
    if(calc.quantityModel!==SEAT_MODEL||!source||source.quantityKnown===false||!def?.ean||!('ean'in source.material)||source.material.ean!==def.ean||source.material.unit!=='szt'||ref.packageSize!==1||source.material.packaging?.size!==1||n==null||source.rawQuantity!==n)return null;
    return{quantity:n,source};
  }
  if(calc.jobId===TRAP_JOB){
    const def=trapMaterials(calc.measurements).find(row=>trapReference(row.id,calc.measurements)===ref.id),source=def&&calc.materials.find(l=>l.material.id===def.id),n=def&&trapQuantity(def.id,calc.measurements);
    if(calc.quantityModel!==TRAP_MODEL||!source||source.quantityKnown===false||!def?.ean||!('ean'in source.material)||source.material.ean!==def.ean||source.material.unit!=='szt'||ref.packageSize!==1||source.material.packaging?.size!==1||n==null||source.rawQuantity!==n)return null;
    return{quantity:n,source};
  }
  if(calc.jobId===SOCKET_FRAME_JOB){
    const def=socketFrameMaterials(calc.measurements).find(row=>socketFrameReference(row.id)===ref.id),source=def&&calc.materials.find(l=>l.material.id===def.id),n=def&&socketFrameQuantity(def.id,calc.measurements);
    if(calc.quantityModel!==SOCKET_FRAME_MODEL||!source||source.quantityKnown===false||!def?.ean||!('ean'in source.material)||source.material.ean!==def.ean||source.material.unit!=='szt'||ref.packageSize!==1||source.material.packaging?.size!==1||n==null||source.rawQuantity!==n)return null;
    return{quantity:n,source};
  }
  if(calc.jobId===HARDWARE_JOB){
    const definition=hardwareMaterials(calc.measurements).find(row=>hardwareReference(row.id,calc.measurements)===ref.id),source=definition&&calc.materials.find(row=>row.material.id===definition.id);
    const quantity=definition&&hardwareQuantity(definition.id,calc.measurements);
    if(calc.quantityModel!==HARDWARE_MODEL||!source||source.quantityKnown===false||!definition?.ean||!('ean'in source.material)||source.material.ean!==definition.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit)||ref.packageSize!==1||source.material.packaging?.size!==1||quantity==null||source.rawQuantity!==quantity)return null;
    return{quantity,source};
  }
  if(calc.jobId===CABINET_JOB){
    const definition=cabinetMaterials(calc.measurements).find(row=>cabinetReference(row.id,calc.measurements)===ref.id),source=definition&&calc.materials.find(row=>row.material.id===definition.id);
    if(calc.quantityModel!==CABINET_MODEL||!source||source.quantityKnown===false||!definition?.ean||!('ean' in source.material)||source.material.ean!==definition.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit)||definition.packaging?.size!==ref.packageSize)return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if(calc.jobId===WINDOW_JOB){
    if(calc.quantityModel!==WINDOW_MODEL)return null;
    const definition=windowMaterials(calc.measurements).find(m=>windowReference(m.id,calc.measurements)===ref.id),source=definition&&calc.materials.find(l=>l.material.id===definition.id);
    if(!source||source.quantityKnown===false||!('ean' in source.material)||source.material.ean!==definition!.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit)||definition!.packaging?.size!==ref.packageSize)return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if(calc.jobId===SKIRTING_JOB){
    if(calc.quantityModel!==SKIRTING_MODEL)return null;
    const definition=skirtingMaterials(calc.measurements).find(m=>skirtingReference(m.id,calc.measurements)===ref.id),source=definition&&calc.materials.find(l=>l.material.id===definition.id);
    if(!source||source.quantityKnown===false||!('ean' in source.material)||source.material.ean!==definition!.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit))return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if (calc.jobId === WATERPROOFING_JOB) {
    if (calc.quantityModel !== WATERPROOFING_MODEL) return null;
    const definition = waterproofingMaterials(calc.measurements).find(row => waterproofingReference(row.id, calc.measurements) === ref.id);
    const source = definition && calc.materials.find(row => row.material.id === definition.id);
    if (!source || source.quantityKnown === false || !('ean' in source.material) || source.material.ean !== definition!.ean || normalizeUnit(source.material.unit) !== normalizeUnit(ref.packageUnit)) return null;
    const quantity = getRequiredQuantity(source, calc); return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  if(calc.jobId===UNDERLAY_JOB){
    const definition=underlayMaterials(calc.measurements).find(m=>underlayReference(m.id,calc.measurements)===ref.id),source=definition&&calc.materials.find(l=>l.material.id===definition.id);
    if(calc.quantityModel!==UNDERLAY_MODEL||!source||source.quantityKnown===false||!definition?.ean||!('ean'in source.material)||source.material.ean!==definition.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit)||definition.packaging?.size!==ref.packageSize)return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if(calc.jobId===GROUT_ONLY_JOB){
    const definition=groutOnlyMaterials(calc.measurements).find(row=>groutOnlyReference(row.id,calc.measurements)===ref.id),source=definition&&calc.materials.find(row=>row.material.id===definition.id);
    if(calc.quantityModel!==GROUT_ONLY_MODEL||!source||source.quantityKnown===false||!definition?.ean||!('ean'in source.material)||source.material.ean!==definition.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit)||definition.packaging?.size!==ref.packageSize)return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if(calc.jobId===PLASTER_JOB){
    const definition=plasterMaterials(calc.measurements).find(row=>plasterReference(row.id,calc.measurements)===ref.id),source=definition&&calc.materials.find(row=>row.material.id===definition.id);
    if(calc.quantityModel!==PLASTER_MODEL||!source||source.quantityKnown===false||!definition?.ean||!('ean'in source.material)||source.material.ean!==definition.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit))return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if (isWallpaperAdhesiveJob(calc.jobId) && ref.materialType === 'wallpaper') {
    const source = calc.materials.find(line => line.material.id === 'wallpaper');
    if (ref.id !== WALLPAPER_ROLL_REFERENCE || calc.quantityModel !== WALLPAPER_ROLLS_MODEL || !source || source.quantityKnown === false || source.material.unit !== 'szt' || !('ean' in source.material) || source.material.ean !== ERISMANN_3333_5_EAN) return null;
    const quantity = getRequiredQuantity(source, calc); return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  if (calc.jobId === 'wallpaper-install' && ref.materialType === 'masking-tape') {
    const source = calc.materials.find(line => line.material.id === WALLPAPER_TAPE_ID);
    if (ref.id !== WALLPAPER_TAPE_REFERENCE || !isCurrentWallpaperTapeModel(calc.quantityModel) || !source || source.quantityKnown === false || source.material.unit !== 'mb' || !('ean' in source.material) || source.material.ean !== WALLPAPER_TAPE_EAN) return null;
    const quantity = getRequiredQuantity(source, calc); return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  if (isWallpaperAdhesiveJob(calc.jobId) && ref.materialType === 'wallpaper-adhesive') {
    const source = calc.materials.find(line => line.material.id === 'wallpaper-glue');
    if (!source || source.quantityKnown === false || !isCurrentWallpaperAdhesiveModel(calc.quantityModel) || wallpaperAdhesiveReference(calc.measurements) !== ref.id) return null;
    if (source.material.unit !== 'g' || !('ean' in source.material) || source.material.ean !== wallpaperAdhesiveEan(calc.measurements)) return null;
    const quantity = getRequiredQuantity(source, calc); return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  if (calc.jobId === LAMINATE_JOB && ['underlay', 'vapor-barrier', 'threshold', 'laminate-installation-kit', 'underlay-joint-tape'].includes(ref.materialType)) {
    const id = ({ underlay: 'underlay', 'vapor-barrier': 'vapor-barrier', threshold: 'threshold', 'laminate-installation-kit': 'spacers', 'underlay-joint-tape': 'laminate-joint-tape' } as Record<string, string>)[ref.materialType];
    const expected = laminateSupplyReference(id, calc.measurements), source = calc.materials.find(line => line.material.id === id);
    if (calc.quantityModel !== LAMINATE_SUPPLIES_MODEL || !source || source.quantityKnown === false || expected && expected !== ref.id || normalizeUnit(source.material.unit) !== normalizeUnit(ref.packageUnit)) return null;
    const quantity = getRequiredQuantity(source, calc);
    return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  if(calc.jobId===REMOVAL_JOB&&ref.materialType!=='primer'){
    const definition=removalMaterials(calc.measurements).find(r=>removalReference(r.id,calc.measurements)===ref.id);
    if(!definition||calc.quantityModel!==REMOVAL_MODEL)return null;
    const source=calc.materials.find(r=>r.material.id===definition.id);
    if(!source||source.quantityKnown===false||!('ean' in source.material)||source.material.ean!==definition.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit))return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if(isGypsumJob(calc.jobId)){
    const definition=gypsumMaterials(calc.jobId,calc.measurements).find(row=>gypsumReference(row.id,calc.measurements)===ref.id);
    if(!definition||calc.quantityModel!==GYPSUM_MODEL)return null;
    const source=calc.materials.find(row=>row.material.id===definition.id);
    if(!source||source.quantityKnown===false||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit))return null;
    const identityMatches=definition.ean
      ? 'ean' in source.material&&source.material.ean===definition.ean
      : !('ean' in source.material&&source.material.ean)
        &&source.material.name===definition.name
        &&'sourceUrl' in source.material&&source.material.sourceUrl===definition.sourceUrl;
    if(!identityMatches)return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if(isFrameJob(calc.jobId)){
    const definition=frameMaterials(calc.measurements).find(row=>frameReference(row.id,calc.measurements)===ref.id);
    if(!definition||calc.quantityModel!==FRAME_MODEL)return null;
    const source=calc.materials.find(row=>row.material.id===definition.id);
    if(!source||source.quantityKnown===false||!('ean' in source.material)||source.material.ean!==definition.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit))return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  if(isWallFinishingJob(calc.jobId)&&ref.materialType!=='primer'){
    const definition=finishingMaterials(calc.jobId,calc.measurements).find(row=>finishingReference(calc.jobId,row.id,calc.measurements)===ref.id);
    if(!definition||calc.quantityModel!==WALL_FINISHING_MODEL)return null;
    const source=calc.materials.find(row=>row.material.id===definition.id);
    if(!source||source.quantityKnown===false||!('ean' in source.material)||source.material.ean!==definition.ean||normalizeUnit(source.material.unit)!==normalizeUnit(ref.packageUnit))return null;
    const quantity=getRequiredQuantity(source,calc);return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  const pattern = MATERIAL_IDS[ref.materialType];
  const candidates = calc.materials.filter(line =>
    line.material.id === ref.id || pattern?.test(line.material.id),
  );
  if (candidates.length !== 1) return null;
  const source = candidates[0];
  if (source.quantityKnown === false) return null;
  const primer = substratePrimerSpecification(calc.jobId);
  if (ref.materialType === 'primer' && primer &&
      (ref.id !== primer.referenceId || !isCurrentSubstratePrimer(calc, source))) return null;
  if (['epoxy-grout','white-tile-adhesive'].includes(ref.materialType) && calc.jobId !== 'kitchen-backsplash') return null;
  if (calc.jobId === 'kitchen-backsplash' && ref.materialType === 'adhesive') return null;
  if(ref.materialType==='paint-undercoat'&&calc.jobId!=='repaint-walls')return null;
  if(calc.jobId==='repaint-walls'&&ref.materialType==='primer'&&source.material.id==='primer-repaint')return null;
  // The sink recipe explicitly counts cartridges of this exact 280 ml model.
  // Preserve that allowance; the API/catalogue require millilitres, not "1 ml".
  // source: https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd
  if ((calc.jobId === 'sink-installation' && source.material.id === 'sanitary-silicone'
      || calc.jobId === 'kitchen-backsplash' && source.material.id === 'silicone-kitchen') && ref.id === 'mat-sanitary-silicone-soudal-280ml'
      && source.material.unit === 'kartusze'
      && (calc.jobId === 'sink-installation' ? /Soudal 280 ml/.test(source.material.brand ?? '') : source.material.brand === 'Soudal Silikon sanitarny biały 280 ml (referencja)') && ref.packageUnit === 'ml' && ref.packageSize === 280) {
    const quantity = getRequiredQuantity(source, calc) * 280;
    return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  if (ref.materialType === 'adhesive-eps' &&
      (calc.jobId !== 'eps-insulation-bso' || ref.id !== 'mat-adhesive-eps-atlas-stopter-k20-25kg' || source.material.id !== 'glue-k20' || !/Atlas Stopter K-20 25 kg/i.test(source.material.brand ?? ''))) return null;
  // These existing jobs count cans. The selected references each contain
  // exactly 750 ml; convert the same demand, then let the basket round once.
  // Never apply a can-to-volume assumption to another product or unit.
  if (ref.materialType === 'foam') {
    const knownCan = ['mat-foam-tytan-pro65-750ml', 'mat-foam-soudal-lowexp-750ml'].includes(ref.id)
      && ref.packageSize === 750 && ref.packageUnit === 'ml'
      && ['window-sealing', 'windowsill-install', 'interior-doors'].includes(calc.jobId)
      && (normalizeUnit(source.material.unit) === 'szt' || calc.jobId === 'interior-doors' && source.material.unit === 'puszka');
    if (!knownCan) return null;
    const quantity = Number((getRequiredQuantity(source, calc) * 750).toFixed(8));
    return Number.isFinite(quantity) && quantity >= 0 ? { quantity, source } : null;
  }
  const legacySanitary={ 'wall-tiles-bathroom':'wall-silicone','grout-only':'silicone-grout','toilet-installation':'wc-silicone','kitchen-countertop':'countertop-silicone' } as const;
  if(source.material.id===legacySanitary[calc.jobId as keyof typeof legacySanitary]&&ref.id==='mat-sanitary-silicone-soudal-280ml'&&source.material.unit==='kartusze'&&/Soudal.*280 ml/.test(source.material.brand??'')&&ref.packageUnit==='ml'&&ref.packageSize===280){
    const quantity=getRequiredQuantity(source,calc)*280;return Number.isFinite(quantity)&&quantity>=0?{quantity,source}:null;
  }
  const legacyPaintingTape = (calc.jobId === 'paint-walls' || calc.jobId==='repaint-walls'&&ref.id==='mat-masking-tape-bluedolphin-30mm'&&ref.packageSize===50&&/50\s*m\b/.test(source.material.brand??'')) && source.material.id === 'painters-tape' && source.material.unit === 'rolka' && normalizeUnit(ref.packageUnit) === 'm';
  // Old tile snapshots called the crosses formula (a count of individual
  // spacers) but labelled its result "opak.". Never multiply that raw count
  // by a guessed bag size; accept only the known job/ID/formula combination.
  const legacySpacer = ref.materialType === 'tile-spacer' && isTileSpacer(calc.jobId, source.material.id)
    && source.material.formulaKey === 'crosses' && ['opak', 'opakowanie'].includes(normalizeUnit(source.material.unit))
    && normalizeUnit(ref.packageUnit) === 'szt';
  if (!legacyPaintingTape && !legacySpacer && normalizeUnit(source.material.unit) !== normalizeUnit(ref.packageUnit)) return null;
  if (calc.jobId === 'self-leveling' && ref.materialType === 'screed') {
    const thickness = calc.measurements.levelingThickness, area = calc.measurements.floorArea;
    // source: https://www.atlas.com.pl/produkt/atlas-sam-100/ (5–30 mm, 1.6 kg/m²/mm)
    // source: https://www.atlas.com.pl/produkt/atlas-sam-200/ (25–60 mm, 2 kg/m²/mm)
    const specification = ref.id === 'mat-screed-atlas-sam100-25kg' ? { min: 5, max: 30, rate: 1.6 }
      : ref.id === 'mat-screed-atlas-sam200-25kg' ? { min: 25, max: 60, rate: 2 } : undefined;
    if (specification) {
      if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(thickness) || thickness < specification.min || thickness > specification.max) return null;
      const quantity = Math.round(area * thickness * specification.rate * (source.material.wasteFactor ?? 1.1) * 10) / 10;
      return { quantity, source };
    }
  }
  // Old saved results contain rounded quantities only. Recompute their original
  // requirement from the same calculator formula instead of rounding twice.
  // Original tape reference was explicitly 50 m per roll. Never infer this for other materials.
  const quantity = getRequiredQuantity(source, calc) * (legacyPaintingTape ? 50 : 1);
  if (!Number.isFinite(quantity) || quantity < 0) return null;
  return { quantity, source };
}
