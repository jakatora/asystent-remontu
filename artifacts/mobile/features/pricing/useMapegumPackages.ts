import {usePackageChoices} from './usePackageChoices';
import {mapegumPackageStorage} from './mapegumPackageStorage';
export const useMapegumPackages=(projectId:string|undefined,enabled:boolean)=>usePackageChoices(projectId,enabled,mapegumPackageStorage);
