import {z} from 'zod';
import type {DatabaseConnection, DatabaseCommand} from '../../db/connection';
import {validateBackupPreferences} from './projectBackupPreferences';
import {parseBasketSelection} from '../pricing/renovationBasket';

export const BACKUP_MAX_BYTES=20*1024*1024;
const id=z.string().min(1).max(200);
const text=z.string().max(100_000);
const number=z.number().finite();
const nullableNumber=number.nullable();
// Historical snapshots may store a calendar date rather than an ISO instant.
const time=z.string().max(50).refine(value=>/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)&&Number.isFinite(Date.parse(value)));
const bit=z.union([z.literal(0),z.literal(1)]);
const measurements=z.record(z.string(),number).refine(value=>Object.keys(value).length<=500&&!Object.keys(value).some(key=>['__proto__','constructor','prototype'].includes(key)));
const calculation=z.object({jobId:id,measurements,materials:z.array(z.object({
  material:z.object({id,name:text,unit:id}).passthrough(),quantity:number,cost:number,
}).passthrough()).max(1000),totalCost:number,totalDays:number,warnings:z.array(z.object({message:text,level:id}).passthrough()).max(1000)}).passthrough();
const jsonField=(schema:z.ZodTypeAny)=>text.refine(raw=>{try{return schema.safeParse(JSON.parse(raw)).success;}catch{return false;}});

/** Fixed, versioned renovation tables. Never accept SQL, table or column names
 * from a file. House-building and contractor/account data are a separate scope. */
export const BACKUP_TABLES={
  projects:z.object({id,name:text,job_id:id,job_name:text,category_id:id,measurements:jsonField(measurements),calculation_result:jsonField(calculation).nullable(),status:z.enum(['planning','in-progress','completed']),total_budget:nullableNumber,actual_cost:nullableNumber,notes:text.nullable(),created_at:time,updated_at:time,synced_at:time.nullable(),room_name:text.nullable(),room_width:nullableNumber,room_length:nullableNumber,room_height:nullableNumber}).strict(),
  shopping_items:z.object({id,project_id:id,material_id:id,name:text,quantity:number,unit:id,estimated_price:number,purchased:bit,notes:text.nullable(),created_at:time,owned:bit,item_type:z.enum(['material','tool']),tier:z.enum(['economy','standard','premium']),category:text.nullable(),custom_price:nullableNumber,custom_quantity:nullableNumber}).strict(),
  project_photos:z.object({id,project_id:id,uri:z.string().max(BACKUP_MAX_BYTES),photo_type:z.enum(['before','during','after']),caption:text.nullable(),created_at:time}).strict(),
  project_checklist:z.object({id,project_id:id,step_index:number.int().nonnegative(),title:text,description:text.nullable(),completed:bit,completed_at:time.nullable(),created_at:time}).strict(),
  project_activities:z.object({id,project_id:id,action_type:id,description:text,created_at:time}).strict(),
  price_overrides:z.object({id,project_id:id,target_type:z.enum(['material','labor']),target_id:id,override_price:number,notes:text.nullable(),created_at:time}).strict(),
  project_price_snapshots:z.object({id,project_id:id,region_code:id,quality_tier:id,labor_estimate_min:number,labor_estimate_max:number,material_estimate:number,tools_estimate:number,total_estimate_min:number,total_estimate_max:number,currency:z.literal('PLN'),snapshot_date:time,created_at:time}).strict(),
} as const;
export type BackupTable=keyof typeof BACKUP_TABLES;
export type BackupRow=Record<string,string|number|null>;
export const BACKUP_PREFERENCE_PREFIXES=[
  'remont.door-selection.v1:','remont.laminate-choice.v1:','remont.foil-choice.v1:',
  'remont.washbasin-choice.v1:','remont.tile-choice.v1:','remont.tile-adhesive-choice.v1:',
  'remont.delivery.v2:','remont.price-seen.v1:',
] as const;
export const BACKUP_GLOBAL_KEYS=['remont.renovation-basket.v1','remont.basket-extras.v1','remont.delivery.v2:renovation-basket','remont.price-seen.v1:renovation-basket'] as const;
const tables=Object.keys(BACKUP_TABLES) as BackupTable[];
const tableShape=Object.fromEntries(tables.map(table=>[table,z.array(BACKUP_TABLES[table]).max(10_000)]));
const envelope=z.object({format:z.literal('asystent-remontu-projects'),version:z.literal(1),createdAt:time,tables:z.object(tableShape).strict(),preferences:z.record(z.string(),z.string().max(1_000_000))}).strict();
export interface ProjectBackup {format:'asystent-remontu-projects';version:1;createdAt:string;tables:Record<BackupTable,BackupRow[]>;preferences:Record<string,string>}
export interface BackupStorage {getItem(key:string):Promise<string|null>;setItem(key:string,value:string):Promise<void>;removeItem(key:string):Promise<void>}
export const canonical=(value:unknown):string=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
const fail=():never=>{throw Error('invalid_project_backup');};
function containsRows(actual:ProjectBackup['tables'],expected:ProjectBackup['tables']):boolean{
  return tables.every(table=>{
    const saved=new Map(actual[table].map(row=>[row.id,canonical(row)]));
    return expected[table].every(row=>saved.get(row.id)===canonical(row));
  });
}
export function portablePhoto(uri:string):boolean{return /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(uri);}

export function parseProjectBackup(raw:string,portable=true):ProjectBackup{
  if(new TextEncoder().encode(raw).byteLength>BACKUP_MAX_BYTES)throw Error('backup_too_large');
  let backup:ProjectBackup;
  try{backup=envelope.parse(JSON.parse(raw)) as unknown as ProjectBackup;}catch{throw Error('invalid_project_backup');}
  if(!tables.every(table=>Array.isArray(backup.tables[table])))fail();
  const projects=new Set(backup.tables.projects.map(row=>row.id));
  if(projects.size!==backup.tables.projects.length||projects.size>1000)fail();
  let rowCount=0;
  for(const table of tables){
    const rows=backup.tables[table];rowCount+=rows.length;
    if(new Set(rows.map(row=>row.id)).size!==rows.length)fail();
    if(table!=='projects'&&rows.some(row=>!projects.has(row.project_id)))fail();
    if(portable&&table==='project_photos'&&rows.some(row=>!portablePhoto(String(row.uri))))throw Error('backup_photo_not_portable');
  }
  if(rowCount>10_000||new Set(backup.tables.project_price_snapshots.map(row=>row.project_id)).size!==backup.tables.project_price_snapshots.length)fail();
  const keys=Object.keys(backup.preferences);
  if(keys.length>projects.size*BACKUP_PREFERENCE_PREFIXES.length+BACKUP_GLOBAL_KEYS.length)fail();
  for(const key of keys){
    if(!BACKUP_GLOBAL_KEYS.includes(key as any)&&!BACKUP_PREFERENCE_PREFIXES.some(prefix=>key.startsWith(prefix)&&projects.has(key.slice(prefix.length))))fail();
    try{const value=JSON.parse(backup.preferences[key]);if(!value||typeof value!=='object'||Array.isArray(value))fail();}catch{fail();}
  }
  validateBackupPreferences(backup);
  return backup;
}

/** One SQLite statement is a coherent snapshot even when another tab writes.
 * source: https://www.sqlite.org/isolation.html */
const SNAPSHOT_SQL=tables.map(table=>`SELECT '${table}' AS table_name,json_object(${Object.keys(BACKUP_TABLES[table].shape).map(column=>`'${column}',"${column}"`).join(',')}) AS body FROM "${table}"`).join(' UNION ALL ');
async function readBackupTables(db:DatabaseConnection):Promise<ProjectBackup['tables']>{
  const rows=await db.getAllAsync<{table_name:BackupTable;body:string}>(SNAPSHOT_SQL);
  const data=Object.fromEntries(tables.map(table=>[table,[]])) as unknown as ProjectBackup['tables'];
  for(const row of rows)data[row.table_name].push(JSON.parse(row.body));
  return data;
}
export async function readProjectBackup(db:DatabaseConnection,storage:BackupStorage):Promise<ProjectBackup>{
  const data=await readBackupTables(db);
  const keys=[...data.projects.flatMap(project=>BACKUP_PREFERENCE_PREFIXES.map(prefix=>prefix+project.id)),...BACKUP_GLOBAL_KEYS];
  const preferences=Object.fromEntries((await Promise.all(keys.map(async key=>[key,await storage.getItem(key)] as const))).filter((entry):entry is readonly[string,string]=>entry[1]!==null));
  // Removing a project can leave its old ID in the basket's selection. Deleted
  // work is not part of this snapshot and must not make its backup unreadable.
  const basketKey='remont.renovation-basket.v1';
  if(preferences[basketKey]){
    const value=JSON.parse(preferences[basketKey]),selected=parseBasketSelection(preferences[basketKey]);
    if(value?.version!==1||!Array.isArray(value.projectIds)||selected.length!==value.projectIds.length)throw Error('backup_invalid_basket');
    preferences[basketKey]=JSON.stringify({version:1,projectIds:selected.filter(id=>data.projects.some(project=>project.id===id))});
  }
  // Local photo URIs are embedded by the browser adapter before download.
  return parseProjectBackup(JSON.stringify({format:'asystent-remontu-projects',version:1,createdAt:new Date().toISOString(),tables:data,preferences}),false);
}

/** Add whole projects only. Original IDs and all child records are retained;
 * a duplicate is an explicit conflict, never REPLACE/cascade or silent merge. */
export async function importProjectBackup(backup:ProjectBackup,db:DatabaseConnection,storage:BackupStorage):Promise<{projects:number;keptBasketSettings:boolean}>{
  backup=parseProjectBackup(JSON.stringify(backup));
  const before=await readProjectBackup(db,storage),existing=new Set(before.tables.projects.map(row=>row.id));
  if(!backup.tables.projects.length)throw Error('backup_empty');
  if(backup.tables.projects.some(row=>existing.has(row.id)))throw Error('backup_project_conflict');
  const globalKeys=new Set<string>(BACKUP_GLOBAL_KEYS);
  const entries=Object.entries(backup.preferences).filter(([key])=>!globalKeys.has(key)||existing.size===0);
  const previous=new Map(await Promise.all(entries.map(async([key])=>[key,await storage.getItem(key)] as const)));
  const commands:DatabaseCommand[]=tables.flatMap(table=>{
    const columns=Object.keys(BACKUP_TABLES[table].shape);
    return backup.tables[table].map(row=>({sql:`INSERT INTO "${table}" (${columns.map(column=>`"${column}"`).join(',')}) VALUES (${columns.map(()=>'?').join(',')})`,params:columns.map(column=>row[column])}));
  });
  const restore=async()=>{for(const[key,value]of previous)value===null?await storage.removeItem(key):await storage.setItem(key,value);};
  try{
    // Choices are saved and read back before any imported project becomes visible.
    // On failure, SQLite remains untouched. Only these reviewed local keys move.
    for(const[key,value]of entries){await storage.setItem(key,value);if(await storage.getItem(key)!==value)throw Error('backup_preferences_unconfirmed');}
  }catch(error){try{await restore();}catch{throw Error('backup_import_unconfirmed');}throw error;}
  try{await db.runBatchAsync(commands);}catch(error){
    // A lost cross-tab reply may follow COMMIT. Read back; never repeat writes.
    let after:ProjectBackup['tables'];
    try{after=await readBackupTables(db);}catch{throw Error('backup_import_unconfirmed');}
    const complete=containsRows(after,backup.tables);
    if(complete)return{projects:backup.tables.projects.length,keptBasketSettings:existing.size>0};
    if(after.projects.some(row=>backup.tables.projects.some(imported=>row.id===imported.id)))throw Error('backup_import_unconfirmed');
    try{await restore();}catch{throw Error('backup_import_unconfirmed');}throw error;
  }
  let after:ProjectBackup['tables'];
  try{after=await readBackupTables(db);}catch{throw Error('backup_import_unconfirmed');}
  if(!containsRows(after,backup.tables))throw Error('backup_import_unconfirmed');
  return{projects:backup.tables.projects.length,keptBasketSettings:existing.size>0};
}
