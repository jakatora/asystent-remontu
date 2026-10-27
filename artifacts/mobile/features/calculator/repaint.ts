import type { CalculationResult, MaterialItem, Project } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';

export const REPAINT_JOB_ID='repaint-walls';
export const REPAINT_UNDERCOAT_REFERENCE='mat-paint-undercoat-sniezka-grunt-5l';
export const isRepaintQuantity=(id:string)=>['primer-repaint','painters-tape','drop-cloth'].includes(id);
export function repaintQuantity(id:string,m:MeasurementMap):number|null {
  if(id==='primer-repaint'){
    if(m.undercoatChoice===0)return 0;
    if(m.undercoatChoice!==undefined&&m.undercoatChoice!==1)return null;
    const coverage=m.undercoatCoverage??9;
    return Number.isFinite(m.wallArea)&&m.wallArea>0&&m.wallArea<=500&&Number.isFinite(coverage)&&coverage>=1&&coverage<=10?repaintUndercoatLitres(m):null;
  }
  const packs=id==='painters-tape'?m.tapeRolls??1:id==='drop-cloth'?m.protectiveFilmPacks??1:NaN;
  return Number.isSafeInteger(packs)&&packs>=0&&packs<=20?packs*(id==='drop-cloth'?20:1):null;
}
// One opaque undercoat, separately from the finishing paint's coats/coverage.
// Manufacturer: up to 10 m²/l. Reviewed retailer label: up to 9 m²/l;
// 9 is the visible estimating assumption, plus the recipe's 5% reserve.
// source: https://www.sniezka.pl/produkt/sniezka-grunt/
// source: https://www.rabdom.pl/pl/p/Sniezka-Grunt-biala-farba-podkladowa-5l/97
export function repaintUndercoatLitres(m:MeasurementMap):number {
  if(m.undercoatChoice===0)return 0;
  const coverage=m.undercoatCoverage??9;
  return Number.isFinite(m.wallArea)&&m.wallArea>0&&Number.isFinite(coverage)&&coverage>0&&coverage<=10
    ? Number((m.wallArea/coverage*1.05).toFixed(4)):0;
}
export const repaintTapeRolls=(m:MeasurementMap)=>m.tapeRolls??1;
export const repaintFilmArea=(m:MeasurementMap)=>(m.protectiveFilmPacks??1)*20;

// source: https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034
export const REPAINT_FILM_MATERIAL:MaterialItem={
  id:'drop-cloth',name:'Folia malarska Blue Dolphin 4 × 5 m',brand:'Blue Dolphin 4 × 5 m (20 m²)',unit:'m²',
  formulaKey:'repaintFilmArea',roundingRule:'ceil',packaging:{size:20,label:'opakowanie 4 × 5 m (20 m²)',purchaseUnit:'opakowanie'},
  pricePerUnit:7.90,category:'akcesoria',notes:'Podaj liczbę opakowań do kupienia; 0 jeśli masz odpowiednią folię. Nie wyliczamy liczby arkuszy z powierzchni ścian.',
};

/** Missing saved film input is unknown, not free or an automatic purchase.
 * This only projects historical calculations; it never writes to the DB. */
export function upgradeRepaintCalculation(calc:CalculationResult|undefined):CalculationResult|undefined {
  if(!calc||calc.jobId!==REPAINT_JOB_ID||calc.materials.some(line=>line.material.id==='drop-cloth'))return calc;
  const packs=calc.measurements.protectiveFilmPacks,known=Number.isSafeInteger(packs)&&packs>=0&&packs<=20;
  const line={material:REPAINT_FILM_MATERIAL,quantity:known?packs*20:0,rawQuantity:known?packs*20:0,packs:known?packs:undefined,cost:known?Number((packs*7.90).toFixed(2)):0,quantityKnown:known};
  return {...calc,materials:[...calc.materials,line],totalCost:Number((calc.totalCost+line.cost).toFixed(2)),quantityIssues:[...(calc.quantityIssues??[]),...(!known?[line.material.name]:[])]};
}
export const upgradeRepaintProject=(project:Project):Project=>project.jobId===REPAINT_JOB_ID&&project.calculationResult
  ? {...project,calculationResult:upgradeRepaintCalculation(project.calculationResult)}:project;
