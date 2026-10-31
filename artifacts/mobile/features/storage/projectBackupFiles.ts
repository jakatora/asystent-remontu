import type {ProjectBackup} from './projectBackup';
export async function makePortableProjectPhoto(uri:string):Promise<string>{return uri;}
export async function embedBackupPhotos(_backup:ProjectBackup):Promise<ProjectBackup>{throw Error('backup_web_only');}
export function downloadProjectBackup(_raw:string):void{throw Error('backup_web_only');}
export async function chooseProjectBackup():Promise<string|null>{throw Error('backup_web_only');}
