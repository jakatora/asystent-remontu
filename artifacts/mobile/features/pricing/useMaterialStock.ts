import { type MaterialStockEntry } from './materialStock';
import { readMaterialStock, writeMaterialStock, recoverMaterialStock } from './materialStockStorage';
import { useRecoverablePreference } from '../storage/useRecoverablePreference';
const EMPTY: readonly MaterialStockEntry[] = [];
const persistence={read:readMaterialStock,write:writeMaterialStock,recover:recoverMaterialStock};
export function useMaterialStock(projectId: string | undefined, enabled: boolean) {
  const state=useRecoverablePreference(projectId??'',enabled,persistence,EMPTY);
  return {...state,entries:state.value};
}
