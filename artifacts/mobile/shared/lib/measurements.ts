import {ROLLED_JOB,rolledFloorArea,rolledInputVisible} from '@/features/calculator/rolledVinyl';
import {vinylClickInputVisible} from '@/features/calculator/vinylClick';
import {SOCKET_FRAME_JOB,socketFrameInputVisible} from '@/features/calculator/socketFrames';
import {cabinetInputVisible} from '@/features/calculator/cabinetPainting';
import {UNDERLAY_JOB,underlayInputVisible} from '@/features/calculator/underlayInstall';
import {groutOnlyInputVisible} from '@/features/calculator/groutOnly';
import {windowInputVisible} from '@/features/calculator/windowSealing';
import {plasterInputVisible} from '@/features/calculator/plastering';
import type { RenovationJob } from '@/types/domain';
import { parseDecimal } from './number';
import { isFrameJob, frameInputVisible } from '@/features/calculator/framePainting';

export function parseMeasurements(job: RenovationJob, raw: Readonly<Record<string, string | undefined>>) {
  const values: Record<string, number> = {};
  const errors: { label: string; id: string; min?: number; max?: number }[] = [];
  for (const input of job.measurementInputs) {
    if (!rolledInputVisible(job.id,input.id,raw) || !vinylClickInputVisible(job.id,input.id,raw) || !socketFrameInputVisible(job.id,input.id,raw) || !cabinetInputVisible(job.id,input.id,raw) || !underlayInputVisible(job.id,input.id,raw) || !groutOnlyInputVisible(job.id,input.id,raw) || !frameInputVisible(job.id,input.id,raw.frameSystem) || !windowInputVisible(job.id,input.id,raw) || !plasterInputVisible(job.id,input.id,raw)) continue;
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
  if(job.id===UNDERLAY_JOB&&values.underlayFoilAreaM2<values.floorArea)errors.push({id:'underlayFoilAreaM2',label:'Powierzchnia folii nie może być mniejsza od podłogi',min:values.floorArea});
  if(job.id===SOCKET_FRAME_JOB&&values.frameLayout===2&&Number.isFinite(values.frameCount)&&values.frameDoubleCount+values.frameTripleCount>values.frameCount)errors.push({id:'frameDoubleCount',label:'Suma ramek podwójnych i potrójnych przekracza łączną liczbę ramek',max:values.frameCount});
  if(job.id===ROLLED_JOB&&values.rollAdhesiveChoice===1&&Number.isFinite(values.rollAdhesiveGm2)&&(values.rollAdhesiveGm2<400||values.rollAdhesiveGm2>600))errors.push({id:'rollAdhesiveGm2',label:'Soudal 26A: zużycie od 400 do 600 g/m²',min:400,max:600});
  if(job.id===ROLLED_JOB){const area=rolledFloorArea(values);if(area===null)errors.push({id:'rollRoomWidthM',label:'Sprawdź wymiary: powierzchnia podłogi musi mieścić się w 200 m²'});else values.floorArea=area;}
  return { values, errors };
}
