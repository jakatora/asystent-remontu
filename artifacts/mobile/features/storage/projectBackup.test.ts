import assert from 'node:assert/strict';
import {test,type TestContext} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {queuedDatabase,type DatabaseConnection} from '../../db/connection';
import {migration_001} from '../../db/migrations/001_initial';
import {migration_002} from '../../db/migrations/002_shopping_extended';
import {migration_003} from '../../db/migrations/003_project_management';
import {migration_004} from '../../db/migrations/004_pricing';
import {canonical,importProjectBackup,parseProjectBackup,readProjectBackup,type BackupStorage,type ProjectBackup} from './projectBackup';
import {calculateMaterials} from '../calculator/engine';
import {getJobById} from '../content/registry';
import {LAMINATE_PRODUCTS} from '../pricing/laminateChoice';

async function fixture(t:TestContext){
  const sqlite=new DatabaseSync(':memory:');t.after(()=>sqlite.close());sqlite.exec('PRAGMA foreign_keys=ON;');
  const params=(args:any[])=>Array.isArray(args[1])?args[1]:args.slice(1);
  const raw={execAsync:async(sql:string)=>sqlite.exec(sql),runAsync:async(...args:any[])=>{const result=sqlite.prepare(args[0]).run(...params(args));return{changes:Number(result.changes),lastInsertRowId:Number(result.lastInsertRowid)};},getAllAsync:async(...args:any[])=>sqlite.prepare(args[0]).all(...params(args)).map(row=>({...row})),getFirstAsync:async(...args:any[])=>{const row=sqlite.prepare(args[0]).get(...params(args));return row?{...row}:null;}};
  for(const migration of[migration_001,migration_002,migration_003,migration_004])await migration(raw as any);
  const db=queuedDatabase(raw as any,()=>{}),values=new Map<string,string>();
  const storage:BackupStorage={getItem:async key=>values.get(key)??null,setItem:async(key,value)=>{values.set(key,value);},removeItem:async key=>{values.delete(key);}};
  return{sqlite,db,storage,values};
}
async function source(t:TestContext){
  const result=await fixture(t),{sqlite,storage}=result;
  const calc=calculateMaterials(getJobById('rolled-vinyl-floor')??getJobById('vinyl-flooring')!,{});
  // A real engine result and all seven real migration tables, not a mock schema.
  sqlite.prepare('INSERT INTO projects(id,name,job_id,job_name,category_id,measurements,calculation_result,created_at,updated_at,room_width) VALUES(?,?,?,?,?,?,?,?,?,?)').run('room','Łazienka',calc.jobId,'Podłoga','flooring',JSON.stringify({width:1.8}),JSON.stringify(calc),'2026-10-31T09:00:00Z','2026-10-31T09:01:00Z',1.8);
  sqlite.exec(`INSERT INTO shopping_items(id,project_id,material_id,name,quantity,unit,estimated_price,purchased,owned,custom_quantity,custom_price,created_at) VALUES('item','room','glue','Klej',2,'szt',93.5,1,1,3,90,'2026-10-31');
    INSERT INTO project_checklist VALUES('check','room',1,'Sprawdź podłoże','Sucho',1,'2026-10-31','2026-10-31');
    INSERT INTO project_activities VALUES('activity','room','edited','Notatka','2026-10-31');
    INSERT INTO price_overrides VALUES('override','room','material','glue',90,'Moja cena','2026-10-31');
    INSERT INTO project_price_snapshots(id,project_id,region_code,snapshot_date,created_at) VALUES('old-estimate','room','lodzkie','2026-10-30','2026-10-31');`);
  sqlite.prepare('INSERT INTO project_photos VALUES(?,?,?,?,?,?)').run('photo','room','data:image/png;base64,iVBORw0KGgo=','before','Przed remontem','2026-10-31');
  await storage.setItem('remont.delivery.v2:room',JSON.stringify({scope:'old',settings:{mode:'shipping',method:'manual',postalCode:'30-001',legacyFees:{Sewera:0}},store:null}));
  await storage.setItem('remont.renovation-basket.v1',JSON.stringify({version:1,projectIds:['room']}));
  await storage.setItem('remont.basket-extras.v1',JSON.stringify({version:1,items:[{id:'extra',kind:'custom',name:'Listwa',unit:'mb',quantity:3}]}));
  await storage.setItem('remont.price-seen.v1:room',JSON.stringify({version:1,offers:{}}));
  await storage.setItem('remont.laminate-choice.v1:room',JSON.stringify({version:1,choices:[{from:LAMINATE_PRODUCTS[0].id,to:LAMINATE_PRODUCTS[1].id}]}));
  return result;
}

test('real SQLite round trip retains all renovation records, owned/purchased flags, custom quantities, embedded photos and choices',async t=>{
  const a=await source(t),b=await fixture(t),snapshot=await readProjectBackup(a.db,a.storage);
  const backup=parseProjectBackup(JSON.stringify(snapshot));assert.equal(Object.keys(backup.tables).length,7);
  const delivery=JSON.parse(backup.preferences['remont.delivery.v2:room']);assert.equal(delivery.settings.method,'automatic');assert.equal(delivery.settings.legacyFees,undefined);assert.equal(delivery.scope,undefined);
  const result=await importProjectBackup(backup,b.db,b.storage);assert.deepEqual(result,{projects:1,keptBasketSettings:false});
  const restored=await readProjectBackup(b.db,b.storage);assert.equal(canonical(restored.tables),canonical(backup.tables));assert.equal(canonical(restored.preferences),canonical(backup.preferences));
  assert.equal(restored.tables.shopping_items[0].owned,1);assert.equal(restored.tables.shopping_items[0].purchased,1);assert.equal(restored.tables.shopping_items[0].custom_quantity,3);
});

test('duplicate project IDs stop before any write and preserve current child rows and preferences',async t=>{
  const a=await source(t),backup=await readProjectBackup(a.db,a.storage),before=canonical(backup);await assert.rejects(importProjectBackup(backup,a.db,a.storage),/backup_project_conflict/);
  const after=await readProjectBackup(a.db,a.storage);assert.equal(canonical(after.tables),canonical(backup.tables));assert.equal(canonical(after.preferences),canonical(backup.preferences));assert.ok(before);
});

test('invalid, foreign and partial archives are rejected without silently dropping project content',async t=>{
  const a=await source(t),backup=await readProjectBackup(a.db,a.storage);
  const mutate=[(b:any)=>b.version=2,(b:any)=>delete b.tables.shopping_items,(b:any)=>b.tables.projects[0].measurements='{"width":"oops"}',(b:any)=>b.tables.projects[0].calculation_result='{}',(b:any)=>b.tables.shopping_items[0].project_id='unknown',(b:any)=>b.tables.shopping_items.push(b.tables.shopping_items[0]),(b:any)=>b.tables.projects[0].rogue=1,(b:any)=>b.preferences['account.token']='secret',(b:any)=>b.preferences['remont.laminate-choice.v1:room']='{"version":1,"choices":[{"from":"missing","to":"missing"}]}',(b:any)=>b.tables.project_photos[0].uri='blob:https://old-browser/photo',(b:any)=>b.tables.project_photos[0].uri='data:image/svg+xml;base64,PHN2Zz4='];
  for(const change of mutate){const bad=structuredClone(backup);change(bad);assert.throws(()=>parseProjectBackup(JSON.stringify(bad)));}
  assert.throws(()=>parseProjectBackup('null'));assert.throws(()=>parseProjectBackup('{'));
});

test('a SQL failure rolls the entire import back and restores the exact prior local preferences',async t=>{
  const a=await source(t),b=await fixture(t),backup=await readProjectBackup(a.db,a.storage);
  await b.storage.setItem('remont.delivery.v2:room','old orphan value');const before=new Map(b.values);
  // SQLite aborts after the project has been inserted inside the real batch.
  b.sqlite.exec("CREATE TRIGGER reject_import BEFORE INSERT ON shopping_items BEGIN SELECT RAISE(ABORT,'disk_full_fixture'); END;");
  await assert.rejects(importProjectBackup(backup,b.db,b.storage),/disk_full_fixture/);
  assert.equal(b.sqlite.prepare('SELECT COUNT(*) AS n FROM projects').get()!.n,0);assert.deepEqual(b.values,before);
});

test('a failed preference write never exposes an imported project',async t=>{
  const a=await source(t),b=await fixture(t),backup=await readProjectBackup(a.db,a.storage);let writes=0;
  const storage={...b.storage,setItem:async(key:string,value:string)=>{if(++writes===2)throw Error('quota_exceeded');await b.storage.setItem(key,value);}};
  await assert.rejects(importProjectBackup(backup,b.db,storage),/quota_exceeded/);assert.equal(b.values.size,0);assert.equal(b.sqlite.prepare('SELECT COUNT(*) AS n FROM projects').get()!.n,0);
});

test('a committed import with a lost RPC reply is read back once without replaying or erasing preferences',async t=>{
  const a=await source(t),b=await fixture(t),backup=await readProjectBackup(a.db,a.storage);let batches=0;
  const db:DatabaseConnection={...b.db,runBatchAsync:async commands=>{batches++;await b.db.runBatchAsync(commands);throw Error('lost_reply');}};
  assert.equal((await importProjectBackup(backup,db,b.storage)).projects,1);assert.equal(batches,1);assert.equal(b.values.get('remont.delivery.v2:room'),backup.preferences['remont.delivery.v2:room']);
});

test('adding projects to a different existing renovation keeps its shared basket and extra products',async t=>{
  const a=await source(t),b=await fixture(t),backup=await readProjectBackup(a.db,a.storage);
  b.sqlite.exec("INSERT INTO projects(id,name,job_id,job_name,category_id,created_at,updated_at) VALUES('existing','Mój salon','paint','Ściany','paint','2026-10-31','2026-10-31')");
  const current=JSON.stringify({version:1,projectIds:['existing']});await b.storage.setItem('remont.renovation-basket.v1',current);
  assert.equal((await importProjectBackup(backup,b.db,b.storage)).keptBasketSettings,true);assert.equal(b.values.get('remont.renovation-basket.v1'),current);assert.equal(b.values.has('remont.basket-extras.v1'),false);assert.equal(b.sqlite.prepare('SELECT COUNT(*) AS n FROM projects').get()!.n,2);
});

test('deleted work left in a saved shared basket does not prevent backing up the remaining projects',async t=>{
  const a=await source(t);await a.storage.setItem('remont.renovation-basket.v1',JSON.stringify({version:1,projectIds:['deleted','room']}));
  const backup=await readProjectBackup(a.db,a.storage);assert.deepEqual(JSON.parse(backup.preferences['remont.renovation-basket.v1']).projectIds,['room']);
});
