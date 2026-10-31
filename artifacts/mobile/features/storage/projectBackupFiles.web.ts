import {BACKUP_MAX_BYTES,portablePhoto,type ProjectBackup} from './projectBackup';

// source: https://developer.mozilla.org/en-US/docs/Web/API/Blob
// source: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
export async function embedBackupPhotos(backup:ProjectBackup):Promise<ProjectBackup>{
  const copy=JSON.parse(JSON.stringify(backup)) as ProjectBackup;
  for(const row of copy.tables.project_photos){
    row.uri=await makePortableProjectPhoto(String(row.uri));
    if(new TextEncoder().encode(JSON.stringify(copy)).byteLength>BACKUP_MAX_BYTES)throw Error('backup_too_large');
  }
  return copy;
}

export async function makePortableProjectPhoto(uri:string):Promise<string>{
    if(portablePhoto(uri))return uri;
    // Local object URLs belong to this browser. No arbitrary remote fetch from
    // a supplied import file; imported images must already be embedded.
    if(!uri.startsWith('blob:'+window.location.origin+'/'))throw Error('backup_photo_unreadable');
    const response=await fetch(uri,{signal:AbortSignal.timeout(10_000)});
    if(!response.ok)throw Error('backup_photo_unreadable');
    const blob=await response.blob();
    if(!/^image\/(jpeg|png|webp|gif)$/.test(blob.type)||blob.size>BACKUP_MAX_BYTES)throw Error('backup_photo_unreadable');
    return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(Error('backup_photo_unreadable'));reader.onload=()=>resolve(String(reader.result));reader.readAsDataURL(blob);});
}

export function downloadProjectBackup(raw:string):void{
  const blob=new Blob([raw],{type:'application/json'});
  if(blob.size>BACKUP_MAX_BYTES)throw Error('backup_too_large');
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`asystent-remontu-projekty-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30_000);
}

export function chooseProjectBackup():Promise<string|null>{
  return new Promise((resolve,reject)=>{
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
    input.style.display='none';document.body.appendChild(input);
    const cleanup=()=>input.remove();
    input.oncancel=()=>{cleanup();resolve(null);};
    input.onchange=()=>{const file=input.files?.[0];cleanup();if(!file){resolve(null);return;}if(file.size>BACKUP_MAX_BYTES){reject(Error('backup_too_large'));return;}void file.text().then(resolve,reject);};
    input.click();
  });
}
