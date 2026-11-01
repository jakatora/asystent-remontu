import type {PackageChoice} from './packageChoiceModel';
import {createRecoverablePreferenceStorage} from '../storage/recoverablePreferenceStorage';
export interface ChoiceStorage{getItem(key:string):Promise<string|null>;setItem(key:string,value:string):Promise<void>}
export function createPackageChoiceStorage(prefix:string,parse:(raw:string|null)=>PackageChoice[],invalidProject:string){
  const codec=(raw:string|null)=>({version:1 as const,choices:parse(raw)});
  const storage=createRecoverablePreferenceStorage(prefix,codec,{version:1 as const,choices:[]},id=>Boolean(id)&&id.length<=200,invalidProject);
  return{wait:storage.wait,read:async(s:ChoiceStorage,id:string)=>(await storage.read(s,id)).choices,
    write:async(s:ChoiceStorage,id:string,choices:readonly PackageChoice[])=>(await storage.write(s,id,{version:1,choices:[...choices]})).choices,
    recover:async(s:ChoiceStorage,id:string)=>{const result=await storage.recover(s,id);return{value:result.value.choices,reset:result.reset};}};
}
