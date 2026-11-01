import {usePackageChoices} from './usePackageChoices';
import {primerPackageStorage} from './primerPackageStorage';
export const usePrimerPackages=(projectId:string|undefined,enabled:boolean)=>usePackageChoices(projectId,enabled,primerPackageStorage);
