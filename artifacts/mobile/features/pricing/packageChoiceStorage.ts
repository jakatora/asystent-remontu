import type {PackageChoice} from './packageChoiceModel';
export interface ChoiceStorage{getItem(key:string):Promise<string|null>;setItem(key:string,value:string):Promise<void>}
export function createPackageChoiceStorage(prefix:string,parse:(raw:string|null)=>PackageChoice[],invalidProject:string){
  const writes=new WeakMap<ChoiceStorage,Map<string,Promise<void>>>();
  async function wait(storage:ChoiceStorage,id:string){await writes.get(storage)?.get(id);}
  async function read(storage:ChoiceStorage,id:string){await wait(storage,id);return parse(await storage.getItem(prefix+id));}
  async function write(storage:ChoiceStorage,id:string,choices:readonly PackageChoice[]){
    if(!id||id.length>200)throw Error(invalidProject);
    const raw=JSON.stringify({version:1,choices}),validated=parse(raw),queue=writes.get(storage)??new Map<string,Promise<void>>();writes.set(storage,queue);
    const pending=(queue.get(id)??Promise.resolve()).catch(()=>{}).then(()=>storage.setItem(prefix+id,raw));queue.set(id,pending);
    try{await pending;return validated;}finally{if(queue.get(id)===pending)queue.delete(id);}
  }
  return{wait,read,write};
}
