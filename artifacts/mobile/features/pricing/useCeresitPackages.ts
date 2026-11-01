import {usePackageChoices} from './usePackageChoices';
import {ceresitPackageStorage} from './ceresitPackageStorage';
export const useCeresitPackages=(projectId:string|undefined,enabled:boolean)=>usePackageChoices(projectId,enabled,ceresitPackageStorage);
