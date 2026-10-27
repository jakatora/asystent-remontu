import { REMOVAL_JOB, removalMaterials, removalReference } from '@/features/calculator/wallpaperRemoval';
import { LAMINATE_JOB, laminateSupplyReference } from '@/features/calculator/laminateSupplies';
import { isGypsumJob, gypsumMaterials, gypsumReference } from '@/features/calculator/gypsumBoard';
import { isFrameJob, frameMaterials, frameReference } from '@/features/calculator/framePainting';
import { isWallFinishingJob, finishingMaterials, finishingReference } from '@/features/calculator/wallFinishing';
import type { LaborPriceReference, MaterialPriceReference, MaterialCategory } from '@/types/pricing';
import { LABOR_PRICES, MATERIAL_PRICES, getLaborIdsForJob, getMaterialIdsForJob } from '@/data/prices';
import { BASELINE_REGION } from '@/data/prices/regions';
import { tileSpacerReferences } from './tileSpacers';
import { KITCHEN_EPOXY_REFERENCE, KITCHEN_WHITE_REFERENCE } from './kitchenMaterials';
import { REPAINT_UNDERCOAT_REFERENCE } from '@/features/calculator/repaint';
import { substratePrimerSpecification } from '@/features/calculator/substratePrimer';
import { levelingTapeReference } from '@/features/calculator/levelingTape';
import { isSanitaryJob, sanitaryReferences, REMOVER_REFERENCE, SANITARY_REFERENCE } from '@/features/calculator/sanitarySealant';

const LABOR_BY_ID = new Map<string, LaborPriceReference>(
  LABOR_PRICES.map((l) => [l.id, l])
);

const MATERIAL_BY_ID = new Map<string, MaterialPriceReference>(
  MATERIAL_PRICES.map((m) => [m.id, m])
);

const MATERIAL_BY_TYPE = new Map<string, MaterialPriceReference[]>();
for (const m of MATERIAL_PRICES) {
  const list = MATERIAL_BY_TYPE.get(m.materialType) ?? [];
  list.push(m);
  MATERIAL_BY_TYPE.set(m.materialType, list);
}

export function getLaborPrice(id: string): LaborPriceReference | undefined {
  return LABOR_BY_ID.get(id);
}

export function getMaterialPrice(id: string): MaterialPriceReference | undefined {
  return MATERIAL_BY_ID.get(id);
}

export function getMaterialsByType(type: string): MaterialPriceReference[] {
  return MATERIAL_BY_TYPE.get(type) ?? [];
}

export function getMaterialsByCategory(category: MaterialCategory): MaterialPriceReference[] {
  return MATERIAL_PRICES.filter((m) => m.category === category);
}

export function getLaborForJob(jobId: string, regionCode?: string): LaborPriceReference[] {
  const ids = getLaborIdsForJob(jobId);
  const dopasowane: LaborPriceReference[] = [];
  const bazowe: LaborPriceReference[] = [];
  for (const id of ids) {
    const ref = LABOR_BY_ID.get(id);
    if (!ref) continue;
    if (!regionCode || ref.regionCode === regionCode) dopasowane.push(ref);
    if (ref.regionCode === BASELINE_REGION.code) bazowe.push(ref);
  }
  // FAIL-OPEN NA REGION: mamy skompletowany zestaw stawek tylko dla regionu bazowego.
  // Filtr po dokladnym `regionCode` oddawal dla Warszawy PUSTA LISTE, przez co wycena
  // po cichu pokazywala same materialy - czyli kwote bez najdrozszej czesci remontu.
  // Regionalna roznice nakladamy mnoznikiem (`RegionProfile.laborMultiplier`) w silniku.
  return dopasowane.length > 0 ? dopasowane : bazowe;
}

export function getMaterialsForJob(jobId: string, tier: MaterialCategory, measurements?: Readonly<Record<string, number>>): MaterialPriceReference[] {
  const ids = getMaterialIdsForJob(jobId, tier);
  const results: MaterialPriceReference[] = [];
  for (const id of ids) {
    const ref = MATERIAL_BY_ID.get(id);
    if (ref) results.push(ref);
  }
  if (jobId === LAMINATE_JOB) {
    for (const id of ['underlay', 'vapor-barrier', 'threshold', 'spacers', 'laminate-joint-tape']) {
      const referenceId = laminateSupplyReference(id, measurements), ref = referenceId ? MATERIAL_BY_ID.get(referenceId) : undefined;
      if (!ref) continue;
      for (let i = results.length - 1; i >= 0; i--) if (results[i].materialType === ref.materialType) results.splice(i, 1);
      results.push(ref);
    }
  }
  const primer = substratePrimerSpecification(jobId);
  if (primer) {
    for (let i = results.length - 1; i >= 0; i--) if (results[i].materialType === 'primer') results.splice(i, 1);
    const ref = MATERIAL_BY_ID.get(primer.referenceId);
    if (ref) results.push(ref);
  }
  if(jobId===REMOVAL_JOB){
    results.splice(0,results.length);
    for(const material of removalMaterials(measurements)){const id=removalReference(material.id,measurements),ref=id?MATERIAL_BY_ID.get(id):undefined;if(ref)results.push(ref);}
    const primerRef=primer?MATERIAL_BY_ID.get(primer.referenceId):undefined;if(primerRef)results.push(primerRef);
  }
  if(isGypsumJob(jobId)){
    results.splice(0,results.length);
    for(const material of gypsumMaterials(jobId,measurements)){const id=gypsumReference(material.id,measurements),ref=id?MATERIAL_BY_ID.get(id):undefined;if(ref)results.push(ref);}
  }
  if(isFrameJob(jobId)){
    results.splice(0,results.length);
    for(const material of frameMaterials(measurements)){const id=frameReference(material.id,measurements),ref=id?MATERIAL_BY_ID.get(id):undefined;if(ref)results.push(ref);}
  }
  if(isWallFinishingJob(jobId)){
    results.splice(0,results.length);
    for(const material of finishingMaterials(jobId,measurements)){const id=finishingReference(jobId,material.id,measurements),ref=id?MATERIAL_BY_ID.get(id):undefined;if(ref)results.push(ref);}
    const primerRef=primer?MATERIAL_BY_ID.get(primer.referenceId):undefined;if(primerRef)results.push(primerRef);
  }
  if (jobId === 'self-leveling') {
    // A separate reviewed merchant SKU, never an offer for Fola's EAN.
    // source: https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282
    for (let i = results.length - 1; i >= 0; i--) if (results[i].materialType === 'expansion-tape') results.splice(i, 1);
    const selected = levelingTapeReference(measurements);
    const tape = selected ? MATERIAL_BY_ID.get(selected) : undefined;
    if (tape) results.push(tape);
  }
  if(isSanitaryJob(jobId)){
    for(let i=results.length-1;i>=0;i--)if(['silicone','silicone-remover','masking-tape'].includes(results[i].materialType))results.splice(i,1);
    const chosen=sanitaryReferences(measurements);
    for(const id of [chosen.silicone,REMOVER_REFERENCE,chosen.tape]){const ref=id?MATERIAL_BY_ID.get(id):undefined;if(ref)results.push(ref);}
  }
  if(['wall-tiles-bathroom','grout-only','toilet-installation','kitchen-countertop'].includes(jobId)){
    for(let i=results.length-1;i>=0;i--)if(results[i].materialType==='silicone')results.splice(i,1);
    const ref=MATERIAL_BY_ID.get(SANITARY_REFERENCE);if(ref)results.push(ref);
  }
  if(jobId==='paint-ceiling') {
    const ref=MATERIAL_BY_ID.get('mat-universal-primer-5l');if(ref&&!results.some(row=>row.id===ref.id))results.push(ref);
  }
  if(jobId==='repaint-walls') {
    const paintId=tier==='economy'?'mat-paint-latex-dekoral-akrylit-w-white-5l':tier==='better'?'mat-paint-latex-dulux-easycare-white-9l':'mat-paint-latex-sniezka-barwy-natury-white-5l';
    for(const id of [paintId,REPAINT_UNDERCOAT_REFERENCE,'mat-masking-tape-bluedolphin-30mm','mat-protective-film-bluedolphin-4x5m']) {
      const ref=MATERIAL_BY_ID.get(id);if(ref&&!results.some(row=>row.id===id))results.push(ref);
    }
  }
  // A different price tier must not omit the required basin drain or explicit
  // extra hoses. Same exact references; quantities still come from calculator.
  // source: https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/
  if (jobId === 'sink-installation') {
    for (const id of ['mat-basin-trap-mcalpine-whb1-32', 'mat-hose-braided-invena-3-8-30', 'mat-basin-fixings-fischer-wst140k-2']) {
      const ref = MATERIAL_BY_ID.get(id);
      if (ref && !results.some(row => row.id === id)) results.push(ref);
    }
  }
  if (jobId === 'kitchen-backsplash') {
    // The recipe explicitly requires epoxy grout and WHITE adhesive. Keep this
    // correction outside historical mappings; generic cement/grey references
    // cannot satisfy these materials at another tier.
    // source: https://www.atlas.com.pl/produkt/atlas-plus-bialy/
    for (let i=results.length-1;i>=0;i--) if (['grout','adhesive'].includes(results[i].materialType)) results.splice(i,1);
    for (const id of [KITCHEN_EPOXY_REFERENCE,KITCHEN_WHITE_REFERENCE]) {
      const ref=MATERIAL_BY_ID.get(id);if(ref&&!results.some(row=>row.id===id))results.push(ref);
    }
  }
  return measurements ? tileSpacerReferences(results, jobId, measurements) : results;
}

export function hasLaborData(jobId: string): boolean {
  return getLaborIdsForJob(jobId).length > 0;
}

export function hasMaterialData(jobId: string): boolean {
  return getMaterialsForJob(jobId, 'standard').length > 0;
}

export function getLatestUpdateDate(): string {
  let latest = '';
  for (const l of LABOR_PRICES) {
    if (l.lastUpdated > latest) latest = l.lastUpdated;
  }
  for (const m of MATERIAL_PRICES) {
    if (m.lastUpdated > latest) latest = m.lastUpdated;
  }
  return latest;
}
