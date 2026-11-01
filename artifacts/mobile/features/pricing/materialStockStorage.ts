import { MATERIAL_STOCK_PREFIX, parseMaterialStock, type MaterialStockEntry } from './materialStock';
import { createRecoverablePreferenceStorage, type PreferenceStorage } from '../storage/recoverablePreferenceStorage';
const storage=createRecoverablePreferenceStorage(MATERIAL_STOCK_PREFIX,raw=>({version:1 as const,entries:parseMaterialStock(raw)}),{version:1 as const,entries:[]},id=>Boolean(id)&&id!=='renovation-basket'&&id.length<=200,'invalid_material_stock_project');
export const waitForMaterialStockWrites=storage.wait;
export const readMaterialStock=async(s:PreferenceStorage,id:string)=>(await storage.read(s,id)).entries;
export const writeMaterialStock=async(s:PreferenceStorage,id:string,entries:readonly MaterialStockEntry[])=>(await storage.write(s,id,{version:1,entries:[...entries]})).entries;
export const recoverMaterialStock=async(s:PreferenceStorage,id:string)=>{const result=await storage.recover(s,id);return{value:result.value.entries,reset:result.reset};};
