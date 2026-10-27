import type { RenovationJob } from '@/types/domain';
import { parseDecimal } from './number';
import { isFrameJob, frameInputVisible } from '@/features/calculator/framePainting';

export function parseMeasurements(job: RenovationJob, raw: Readonly<Record<string, string | undefined>>) {
  const values: Record<string, number> = {};
  const errors: { label: string; id: string; min?: number; max?: number }[] = [];
  for (const input of job.measurementInputs) {
    if (!frameInputVisible(job.id,input.id,raw.frameSystem)) continue;
    const text = raw[input.id]?.trim() ?? '';
    if (!text && input.defaultValue === undefined && input.required === false) continue;
    const value = text ? parseDecimal(text) : input.defaultValue;
    if (value === undefined || !Number.isFinite(value) ||
      (input.min !== undefined ? value < input.min : value <= 0) ||
      (input.max !== undefined && value > input.max) ||
      ('inputType' in input && input.inputType === 'select' && !input.options?.some(option => option.value === value)) ||
      ('inputType' in input && input.inputType === 'count' && !Number.isInteger(value))) {
      errors.push({ label: input.label, id: input.id, min: input.min, max: input.max });
    } else values[input.id] = value;
  }
  if (isFrameJob(job.id)) {
    const selected=values.frameSystem??0, pvc=selected===4;
    if(values.coveragePerLiter>(pvc?16:14))errors.push({id:'coveragePerLiter',label:`Wydajność wybranej emalii: maksymalnie ${pvc?16:14} m²/l`,max:pvc?16:14});
    if(pvc&&values.coats<2)errors.push({id:'coats',label:'Dulux Rapidry wymaga co najmniej 2 warstw',min:2});
    if(!pvc&&selected<2&&values.framePrimerCoats>1)errors.push({id:'framePrimerCoats',label:'Urekor D: jedna warstwa podkładu',max:1});
    if(!pvc&&values.framePrimerArea>values.wallArea)errors.push({id:'framePrimerArea',label:'Powierzchnia podkładu nie może przekraczać powierzchni ram',max:values.wallArea});
    if(pvc&&values.frameCoarseSheets>0)errors.push({id:'frameCoarseSheets',label:'Dla PVC wybierz drobny papier; pozostaw P120 = 0',max:0});
  }
  if (job.id==='gypsum-wall'&&values.gypsumWallHeight>0&&values.wallArea>0&&values.perimeter!==undefined&&Math.abs(values.perimeter-2*(values.wallArea/values.gypsumWallHeight+values.gypsumWallHeight))>0.1)errors.push({id:'perimeter',label:'Obwód nie zgadza się z powierzchnią i wysokością; popraw lub pozostaw pusty'});
  if (job.id==='gypsum-ceiling'&&values.ceilingArea>0&&values.perimeter+0.1<4*Math.sqrt(values.ceilingArea))errors.push({id:'perimeter',label:'Obwód jest za mały dla podanej powierzchni; sprawdź pomiary'});
  return { values, errors };
}
