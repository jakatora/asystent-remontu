import type {CalculationResult,Project,ShoppingItem} from '@/types/domain';
import type {MeasurementMap} from '@/types/calculator';

export const WALL_PAINT_JOB='paint-walls';
export const WALL_PAINT_MODEL='wall-painting-v2';
export const isWallPaintingMaterial=(job:string,id:string)=>job===WALL_PAINT_JOB&&['paint','primer-paint'].includes(id);

/** The existing recipe's 5% purchase reserve is applied once. Keep litres
 * before rounding to cans, including small excesses and shared room totals. */
export function wallPaintLitres(m:MeasurementMap,waste=1.05):number|null {
  const area=m.wallArea,coats=m.coats??2,coverage=m.coveragePerLiter??10;
  if(!Number.isFinite(area)||area!<1||area!>500||!Number.isSafeInteger(coats)||coats<1||coats>3
    ||!Number.isFinite(coverage)||coverage<6||coverage>18||!Number.isFinite(waste)||waste<1||waste>1.5)return null;
  return Number((area!*coats/coverage*waste).toFixed(8));
}

/** A historical calculation rounded paint litres and tied primer demand to
 * paint coverage. Recalculation is explicit; persisted JSON stays untouched. */
export function reviewWallPaintCalculation(calc:CalculationResult|undefined):CalculationResult|undefined {
  if(!calc||calc.jobId!==WALL_PAINT_JOB||calc.quantityModel===WALL_PAINT_MODEL)return calc;
  const materials=calc.materials.map(line=>isWallPaintingMaterial(calc.jobId,line.material.id)?{...line,quantityKnown:false}:line);
  return{...calc,materials,quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)};
}
export const reviewWallPaintProject=(project:Project):Project=>project.jobId===WALL_PAINT_JOB
  ?{...project,calculationResult:reviewWallPaintCalculation(project.calculationResult)}:project;

/** Primer declarations use the existing substrate reviewer. Paint must also
 * be reviewed when the old rounded amount could conceal a second can. */
export function reviewWallPaintShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[]{
  if(calc?.jobId!==WALL_PAINT_JOB)return[...items];
  return items.map(item=>{
    if(item.itemType!=='material'||!isWallPaintingMaterial(calc.jobId,item.materialId))return item;
    const line=calc.materials.find(line=>line.material.id===item.materialId);
    if(calc.quantityModel!==WALL_PAINT_MODEL||!line||line.quantityKnown===false)return{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false};
    if(item.materialId!=='paint')return item;
    const needed=wallPaintLitres(calc.measurements,line.material.wasteFactor??1.05);
    if(needed===null)return{...item,quantityKnown:false,needsQuantityConfirmation:true,owned:false,purchased:false};
    const matches=item.name===line.material.name&&item.unit===line.material.unit&&Number.isFinite(item.customQuantity??item.quantity)&&(item.customQuantity??item.quantity)+1e-8>=needed;
    return{...item,quantity:line.quantity,estimatedPrice:line.cost,requiredQuantity:needed,quantityKnown:true,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased};
  });
}
