import {useRecoverablePreference} from '../storage/useRecoverablePreference';
import {mapegumProductStorage} from './mapegumProductStorage';
import {NO_MAPEGUM_PRODUCT_CHOICES,type MapegumProductChoice} from './mapegumProductChoice';
export function useMapegumProducts(projectId:string|undefined,enabled:boolean){
  const state=useRecoverablePreference<readonly MapegumProductChoice[]>(projectId??'preview',enabled,mapegumProductStorage,NO_MAPEGUM_PRODUCT_CHOICES);
  return{...state,choices:state.value};
}
