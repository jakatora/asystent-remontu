import type {Project} from '@/types/domain';

const fields=['id','name','jobId','jobName','categoryId','measurements','calculationResult','status','totalBudget','actualCost','notes','roomName','roomWidth','roomLength','roomHeight'] as const;
function canonical(value:unknown):unknown{
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));
  return value;
}
const contents=(project:Project)=>JSON.stringify(canonical(Object.fromEntries(fields.map(key=>[key,project[key]]))));

// source: https://www.sqlite.org/lang_transaction.html
/** A lost RPC reply can follow a committed SQLite write. Read the actual row,
 * compare the requested contents, and never replay the write automatically.
 */
export async function saveProjectWithReadback(project:Project,io:{write:(project:Project)=>Promise<void>;read:(id:string)=>Promise<Project|null>}):Promise<Project>{
  let writeError:unknown;
  try{await io.write(project);}catch(error){writeError=error;}
  let saved:Project|null;
  try{saved=await io.read(project.id);}catch(error){throw new Error('project_save_unconfirmed_check_saved_changes',{cause:writeError??error});}
  if(!saved||contents(saved)!==contents(project))throw new Error('project_save_unconfirmed_check_saved_changes',{cause:writeError});
  return saved;
}
