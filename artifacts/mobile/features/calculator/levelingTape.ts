import type { MaterialItem, CalculationResult, Project } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
import { MATERIAL_PRICES } from '@/data/prices/materials';

export const PACKCENTER_EDGE_TAPE = 'mat-edge-tape-packcenter-tb-fb00202-50m';
export const FOLA_EDGE_TAPE = 'mat-edge-tape-fola-100mm-50m';

/** Saved calculations predate the model selector and used Fola's reference.
 * Keep that choice as a read-only projection; never silently substitute a
 * cheaper manufacturer's product when reopening an existing project. */
export function reviewHistoricalLevelingTape(calc: CalculationResult | undefined): CalculationResult | undefined {
  return calc?.jobId==='self-leveling'&&calc.measurements.edgeTapeChoice===undefined
    ? {...calc,measurements:{...calc.measurements,edgeTapeChoice:1}}:calc;
}

export function reviewLevelingTapeProject(project:Project): Project {
  return project.jobId==='self-leveling'&&project.measurements.edgeTapeChoice===undefined
    ? {...project,measurements:{...project.measurements,edgeTapeChoice:1},calculationResult:reviewHistoricalLevelingTape(project.calculationResult)}:project;
}

// Different reviewed products with the same dimensions, not interchangeable
// EAN offers. The user's choice applies to every tier and store comparison.
// source: https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282
// source: https://www.bricomarche.pl/tasma-brzegowa-5-mm-x-100-mm-x-50-m
export function levelingTapeReference(m?: MeasurementMap): string | null {
  const choice=m?.edgeTapeChoice??0;
  return choice===0?PACKCENTER_EDGE_TAPE:choice===1?FOLA_EDGE_TAPE:null;
}

export function levelingTapeMaterial(material: MaterialItem, m: MeasurementMap): MaterialItem {
  const id=levelingTapeReference(m),ref=MATERIAL_PRICES.find(row=>row.id===id);
  if(!ref)return material;
  return {...material,name:ref.productLabel,brand:ref.brand,sourceUrl:ref.sourceUrl,unit:ref.packageUnit,
    pricePerUnit:ref.pricePerPackage,priceBasis:'package',
    packaging:{size:ref.packageSize,label:`rolka ${ref.packageSize} m`,purchaseUnit:'rolka'},
    notes:`${ref.productLabel}. Odrębny wybrany model; zapotrzebowanie z długości krawędzi + jawny zapas 5%. Pełne rolki dobieramy we wspólnym koszyku.`};
}
