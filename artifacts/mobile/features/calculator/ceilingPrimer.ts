import type { CalculationResult, Project, ShoppingItem } from '@/types/domain';
import type { MeasurementMap } from '@/types/calculator';
// The technical card's wall allowance (0.15 l/m²) is the visible assumption
// for a ceiling. Absorbency must be checked on site, independently of paint.
// source: https://knauf.com/api/download-center/v1/assets/3ed7306f-27be-4d9d-a14d-388477a68c24?country=pl&download=true
export function ceilingPrimerLitres(m:MeasurementMap):number|null {
  if(m.ceilingPrimerChoice===0)return 0;
  if(m.ceilingPrimerChoice!==undefined&&m.ceilingPrimerChoice!==1)return null;
  const usage=m.primerConsumption??0.15;
  return Number.isFinite(m.ceilingArea)&&m.ceilingArea>0&&m.ceilingArea<=200&&Number.isFinite(usage)&&usage>0&&usage<=1
    ?Number((m.ceilingArea*usage).toFixed(4)):null;
}
export function upgradeCeilingCalculation(calc:CalculationResult|undefined):CalculationResult|undefined {
  if(!calc||calc.jobId!=='paint-ceiling')return calc;
  const materials=calc.materials.map(line=>{
    if(line.material.id!=='primer-ceiling')return line;
    const required=['litr','l'].includes(line.material.unit)?ceilingPrimerLitres(calc.measurements):null;
    const packs=required===null?undefined:Math.ceil(required/5),quantity=packs===undefined?0:packs*5;
    return {...line,quantity,rawQuantity:required??0,packs,quantityKnown:required!==null,cost:packs===undefined?0:Number((packs*line.material.pricePerUnit).toFixed(2))};
  });
  return {...calc,materials,totalCost:Number(materials.reduce((sum,l)=>sum+l.cost,0).toFixed(2)),quantityIssues:materials.filter(line=>line.quantityKnown===false).map(line=>line.material.name)};
}
export const upgradeCeilingProject=(project:Project):Project=>project.jobId==='paint-ceiling'&&project.calculationResult
  ?{...project,calculationResult:upgradeCeilingCalculation(project.calculationResult)}:project;

/** An old owned primer quantity must not hide the corrected requirement.
 * Custom rows/quantities stay persisted; this is a read-only projection. */
export function projectCeilingShopping(items:readonly ShoppingItem[],calc?:CalculationResult):ShoppingItem[]{
  if(calc?.jobId!=='paint-ceiling')return [...items];
  const line=upgradeCeilingCalculation(calc)!.materials.find(line=>line.material.id==='primer-ceiling');
  if(!line)return [...items];
  return items.flatMap(item=>{
    if(item.itemType!=='material'||item.materialId!=='primer-ceiling')return item;
    if(line.quantityKnown!==false&&line.quantity===0)return [];
    const known=line.quantityKnown!==false,matches=known&&Math.abs((item.customQuantity??item.quantity)-line.quantity)<1e-8&&item.unit===line.material.unit;
    return {...item,quantity:line.quantity,estimatedPrice:line.cost,quantityKnown:known,requiredQuantity:known?line.quantity:undefined,needsQuantityConfirmation:!matches,owned:matches&&item.owned,purchased:matches&&item.purchased};
  });
}
