import {PRIMER_PACKAGE_CHOICE_PREFIX,parsePrimerPackageChoices,type PrimerPackageChoice} from './primerPackageChoice';
interface ChoiceStorage{getItem(key:string):Promise<string|null>;setItem(key:string,value:string):Promise<void>}
const writes=new WeakMap<ChoiceStorage,Map<string,Promise<void>>>();
export async function waitForPrimerPackageWrites(storage:ChoiceStorage,id:string){await writes.get(storage)?.get(id);}
export async function readPrimerPackageChoices(storage:ChoiceStorage,id:string){
  await waitForPrimerPackageWrites(storage,id);return parsePrimerPackageChoices(await storage.getItem(PRIMER_PACKAGE_CHOICE_PREFIX+id));
}
export async function writePrimerPackageChoices(storage:ChoiceStorage,id:string,choices:readonly PrimerPackageChoice[]){
  if(!id||id.length>200)throw Error('invalid_primer_package_project');
  const raw=JSON.stringify({version:1,choices}),validated=parsePrimerPackageChoices(raw),queue=writes.get(storage)??new Map<string,Promise<void>>();writes.set(storage,queue);
  const pending=(queue.get(id)??Promise.resolve()).catch(()=>{}).then(()=>storage.setItem(PRIMER_PACKAGE_CHOICE_PREFIX+id,raw));queue.set(id,pending);
  try{await pending;return validated;}finally{if(queue.get(id)===pending)queue.delete(id);}
}
