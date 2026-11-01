import type {PackageChoice} from './packageChoiceModel';
import type {createPackageChoiceStorage} from './packageChoiceStorage';
import {useRecoverablePreference} from '../storage/useRecoverablePreference';
const EMPTY:readonly PackageChoice[]=[];
export function usePackageChoices(projectId:string|undefined,enabled:boolean,storage:ReturnType<typeof createPackageChoiceStorage>){
  const state=useRecoverablePreference(projectId??'preview',enabled,storage,EMPTY);
  return{...state,choices:state.value};
}
