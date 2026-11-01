import {createRecoverablePreferenceStorage,type PreferenceStorage} from '../storage/recoverablePreferenceStorage';
import {MAPEGUM_PRODUCT_CHOICE_PREFIX,parseMapegumProductChoices,type MapegumProductChoice} from './mapegumProductChoice';
const codec=(raw:string|null)=>({version:1 as const,choices:parseMapegumProductChoices(raw)});
const storage=createRecoverablePreferenceStorage(MAPEGUM_PRODUCT_CHOICE_PREFIX,codec,{version:1 as const,choices:[]},id=>Boolean(id)&&id.length<=200,'invalid_mapegum_product_project');
export const mapegumProductStorage={
  read:async(s:PreferenceStorage,id:string)=>(await storage.read(s,id)).choices,
  write:async(s:PreferenceStorage,id:string,choices:readonly MapegumProductChoice[])=>(await storage.write(s,id,{version:1,choices:[...choices]})).choices,
  recover:async(s:PreferenceStorage,id:string)=>{const result=await storage.recover(s,id);return{value:result.value.choices,reset:result.reset};},
};
export const readMapegumProductChoices=mapegumProductStorage.read;
export const waitForMapegumProductWrites=storage.wait;
