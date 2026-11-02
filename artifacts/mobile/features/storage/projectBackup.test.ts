import {CEILING_PAINT_CHOICE_PREFIX,parseCeilingPaintChoices} from '../pricing/ceilingPaintChoice';
import {ceilingPaintStorage} from '../pricing/ceilingPaintStorage';
import assert from 'node:assert/strict';
import {test,type TestContext} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {queuedDatabase,type DatabaseConnection} from '../../db/connection';
import {migration_001} from '../../db/migrations/001_initial';
import {migration_002} from '../../db/migrations/002_shopping_extended';
import {migration_003} from '../../db/migrations/003_project_management';
import {migration_004} from '../../db/migrations/004_pricing';
import {backupExtraCount,canonical,hasBackupContent,importProjectBackup,parseProjectBackup,readProjectBackup,type BackupStorage,type ProjectBackup} from './projectBackup';
import {calculateMaterials} from '../calculator/engine';
import {getJobById} from '../content/registry';
import {PRIMER_PACKAGE_CHOICE_PREFIX,parsePrimerPackageChoices,PRIMER_PACKAGE_PRODUCTS} from '../pricing/primerPackageChoice';
import {writePrimerPackageChoices} from '../pricing/primerPackageStorage';
import {CERESIT_PACKAGE_CHOICE_PREFIX,parseCeresitPackageChoices,CERESIT_PACKAGE_PRODUCTS} from '../pricing/ceresitPackageChoice';
import {ceresitPackageStorage} from '../pricing/ceresitPackageStorage';
import {MAPEGUM_PACKAGE_CHOICE_PREFIX,parseMapegumPackageChoices,MAPEGUM_PACKAGE_PRODUCTS} from '../pricing/mapegumPackageChoice';
import {writeMapegumPackageChoices,mapegumPackageStorage} from '../pricing/mapegumPackageStorage';
import {MAPEGUM_PRODUCT_CHOICE_PREFIX,MAPEGUM_PRODUCT_PAIRS} from '../pricing/mapegumProductChoice';
import {mapegumProductStorage} from '../pricing/mapegumProductStorage';
import {primerPackageStorage} from '../pricing/primerPackageStorage';
import {recoverMaterialStock} from '../pricing/materialStockStorage';
import {recoveryArchiveKey,parsePreferenceRecovery} from './preferenceRecovery';
import {LAMINATE_PRODUCTS} from '../pricing/laminateChoice';
import {FOIL_PRODUCTS} from '../pricing/foilChoice';
import {WASHBASIN_PRODUCTS} from '../pricing/washbasinChoice';
import {TILE_PRODUCTS} from '../pricing/tileChoice';
import {TILE_ADHESIVE_PRODUCTS} from '../pricing/tileAdhesiveChoice';
import {MATERIAL_STOCK_PREFIX,parseMaterialStock,type MaterialStockEntry} from '../pricing/materialStock';
import {writeMaterialStock} from '../pricing/materialStockStorage';

function sharedChoices():Record<string,string>{
  const save=(choices:unknown[])=>JSON.stringify({version:1,choices});
  const floor=TILE_PRODUCTS.filter(p=>p.uses.includes('floor'));
  return{
    [PRIMER_PACKAGE_CHOICE_PREFIX+'renovation-basket']:save([{from:PRIMER_PACKAGE_PRODUCTS[0].id,to:'automatic'}]),
    [CERESIT_PACKAGE_CHOICE_PREFIX+'renovation-basket']:save([{from:CERESIT_PACKAGE_PRODUCTS[0].id,to:'automatic'}]),
    [MAPEGUM_PACKAGE_CHOICE_PREFIX+'renovation-basket']:save([{from:MAPEGUM_PACKAGE_PRODUCTS[0].id,to:'automatic'}]),
    [MAPEGUM_PRODUCT_CHOICE_PREFIX+'renovation-basket']:save([MAPEGUM_PRODUCT_PAIRS[0]]),
    'remont.laminate-choice.v1:renovation-basket':save([{from:LAMINATE_PRODUCTS[0].id,to:LAMINATE_PRODUCTS[1].id}]),
    'remont.foil-choice.v1:renovation-basket':save([{from:FOIL_PRODUCTS[0].id,to:FOIL_PRODUCTS[1].id}]),
    'remont.washbasin-choice.v1:renovation-basket':save([{from:WASHBASIN_PRODUCTS[0].id,to:WASHBASIN_PRODUCTS[1].id}]),
    'remont.tile-choice.v1:renovation-basket':save([{from:floor[0].id,to:floor[1].id,use:'floor',floorAdhesive:'mat-tile-adhesive-atlas-plus-standard-25kg'}]),
    'remont.tile-adhesive-choice.v1:renovation-basket':save([{from:TILE_ADHESIVE_PRODUCTS[0].id,to:TILE_ADHESIVE_PRODUCTS[1].id}]),
    [CEILING_PAINT_CHOICE_PREFIX+'renovation-basket']:save([{from:'mat-paint-standard-white-10l',to:'mat-paint-better-white-10l'}]),
    'remont.flush-box-choice.v1:renovation-basket':save([{from:'mat-flush-box-elektroplast-pk60-10',to:'mat-epn-pk60-pro-0285-01'}]),
  };
}

const stockEntry:MaterialStockEntry={materialId:'plaster-base',ean:'5902367206451',name:'Knauf MP 75 L 30 kg',unit:'kg',quantity:30};
const primerChoice={from:PRIMER_PACKAGE_PRODUCTS.find(p=>p.packageSize===1)!.id,to:'automatic' as const};
const mapegumChoice={from:MAPEGUM_PACKAGE_PRODUCTS.find(p=>p.packageSize===3)!.id,to:'automatic' as const};

test('separate Ceresit families, project/common choices and exact damaged archives survive real SQLite export/import',async t=>{
  const a=await source(t),b=await fixture(t),choices=CERESIT_PACKAGE_PRODUCTS.filter(p=>p.packageSize===5).map(p=>({from:p.id,to:'automatic' as const})),key=CERESIT_PACKAGE_CHOICE_PREFIX+'room';
  await a.storage.setItem(key,'{damaged-ceresit');await ceresitPackageStorage.recover(a.storage,'room');await ceresitPackageStorage.write(a.storage,'room',choices.slice(0,1));await ceresitPackageStorage.write(a.storage,'renovation-basket',choices.slice().reverse());
  const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));await importProjectBackup(backup,b.db,b.storage);const restored=await readProjectBackup(b.db,b.storage);
  assert.deepEqual(await ceresitPackageStorage.read(b.storage,'room'),choices.slice(0,1));assert.deepEqual(await ceresitPackageStorage.read(b.storage,'renovation-basket'),choices.slice().reverse());assert.equal(parsePreferenceRecovery(restored.preferences[recoveryArchiveKey(key)]).records[0].raw,'{damaged-ceresit');assert.equal(canonical(restored.tables),canonical(backup.tables));
});
test('Ceresit export waits for a queued selection and for both recovery writes',async t=>{
  const a=await source(t),key=CERESIT_PACKAGE_CHOICE_PREFIX+'room',choice={from:CERESIT_PACKAGE_PRODUCTS[0].id,to:'automatic' as const},set=a.storage.setItem.bind(a.storage);
  for(const recovery of [false,true]){
    if(recovery)await set(key,'{broken-ct17');let release!:()=>void,began!:()=>void;const gate=new Promise<void>(r=>{release=r;}),started=new Promise<void>(r=>{began=r;});a.storage.setItem=async(k,v)=>{if(k===(recovery?recoveryArchiveKey(key):key)){began();await gate;}await set(k,v);};
    const write=recovery?ceresitPackageStorage.recover(a.storage,'room'):ceresitPackageStorage.write(a.storage,'room',[choice]);await started;let done=false;const exportPromise=readProjectBackup(a.db,a.storage).then(v=>{done=true;return v;});await new Promise(r=>setImmediate(r));assert.equal(done,false);release();await write;const backup=await exportPromise;assert.deepEqual(parseCeresitPackageChoices(backup.preferences[key]),recovery?[]:[choice]);if(recovery)assert.equal(parsePreferenceRecovery(backup.preferences[recoveryArchiveKey(key)]).records[0].raw,'{broken-ct17');a.storage.setItem=set;
  }
});
test('a Ceresit-only shared basket transfers without inventing project rows or leaking choices into a project',async t=>{
  const a=await fixture(t),b=await fixture(t),choice={from:CERESIT_PACKAGE_PRODUCTS[0].id,to:'automatic' as const};await ceresitPackageStorage.write(a.storage,'renovation-basket',[choice]);const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));assert.equal(backup.tables.projects.length,0);assert.equal(hasBackupContent(backup),true);await importProjectBackup(backup,b.db,b.storage);assert.deepEqual(await ceresitPackageStorage.read(b.storage,'renovation-basket'),[choice]);assert.deepEqual(await ceresitPackageStorage.read(b.storage,'room'),[]);
});
test('foreign, crossed or price-bearing Ceresit choices reject the entire backup',async t=>{
  const a=await source(t);const backup=await readProjectBackup(a.db,a.storage),choice={from:CERESIT_PACKAGE_PRODUCTS[0].id,to:'automatic'};
  for(const choices of [[{...choice,to:CERESIT_PACKAGE_PRODUCTS[2].id}],[{from:'mat-primer-g-pro-1l',to:'automatic'}],[{...choice,price:1}],[choice,choice]]){const bad=structuredClone(backup);bad.preferences[CERESIT_PACKAGE_CHOICE_PREFIX+'room']=JSON.stringify({version:1,choices});assert.throws(()=>parseProjectBackup(JSON.stringify(bad)));}
});

test('current Mapegum SKU choices and recovery copies survive SQLite export and import for project and common scopes',async t=>{
  const a=await source(t),b=await fixture(t),key=MAPEGUM_PRODUCT_CHOICE_PREFIX+'room';
  await a.storage.setItem(key,'{damaged-product');await mapegumProductStorage.recover(a.storage,'room');
  await mapegumProductStorage.write(a.storage,'room',[MAPEGUM_PRODUCT_PAIRS[0]]);
  await mapegumProductStorage.write(a.storage,'renovation-basket',[MAPEGUM_PRODUCT_PAIRS[1]]);
  const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));await importProjectBackup(backup,b.db,b.storage);
  assert.deepEqual(await mapegumProductStorage.read(b.storage,'room'),[MAPEGUM_PRODUCT_PAIRS[0]]);
  assert.deepEqual(await mapegumProductStorage.read(b.storage,'renovation-basket'),[MAPEGUM_PRODUCT_PAIRS[1]]);
  assert.equal(parsePreferenceRecovery(await b.storage.getItem(recoveryArchiveKey(key))).records[0].raw,'{damaged-product');
  assert.equal(canonical((await readProjectBackup(b.db,b.storage)).tables),canonical(backup.tables));
});

test('backup waits for an in-flight current-product selection before reading its namespace',async t=>{
  const a=await source(t),set=a.storage.setItem.bind(a.storage);let release!:()=>void,began!:()=>void;
  const gate=new Promise<void>(r=>{release=r;}),started=new Promise<void>(r=>{began=r;});
  a.storage.setItem=async(k,v)=>{if(k===MAPEGUM_PRODUCT_CHOICE_PREFIX+'room'){began();await gate;}await set(k,v);};
  const write=mapegumProductStorage.write(a.storage,'room',[MAPEGUM_PRODUCT_PAIRS[0]]);await started;
  let done=false;const snapshot=readProjectBackup(a.db,a.storage).then(value=>{done=true;return value;});await new Promise(r=>setTimeout(r,15));assert.equal(done,false);release();await write;
  assert.deepEqual(JSON.parse((await snapshot).preferences[MAPEGUM_PRODUCT_CHOICE_PREFIX+'room']).choices,[MAPEGUM_PRODUCT_PAIRS[0]]);
});

test('recovered stock and both family archives round-trip through real SQLite without applying damaged contents',async t=>{
 const a=await source(t),b=await fixture(t),sources=[MATERIAL_STOCK_PREFIX+'room',PRIMER_PACKAGE_CHOICE_PREFIX+'room',MAPEGUM_PACKAGE_CHOICE_PREFIX+'room',MAPEGUM_PACKAGE_CHOICE_PREFIX+'renovation-basket'];
 for(const key of sources)await a.storage.setItem(key,'{broken-'+key);
 await recoverMaterialStock(a.storage,'room');await primerPackageStorage.recover(a.storage,'room');await mapegumPackageStorage.recover(a.storage,'room');await mapegumPackageStorage.recover(a.storage,'renovation-basket');
 const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));await importProjectBackup(backup,b.db,b.storage);const restored=await readProjectBackup(b.db,b.storage);
 for(const key of sources){assert.equal(parsePreferenceRecovery(restored.preferences[recoveryArchiveKey(key)]).records[0].raw,'{broken-'+key);assert.equal(restored.preferences[key],backup.preferences[key]);}
 assert.deepEqual(parseMaterialStock(restored.preferences[MATERIAL_STOCK_PREFIX+'room']),[]);assert.deepEqual(parseMapegumPackageChoices(restored.preferences[MAPEGUM_PACKAGE_CHOICE_PREFIX+'room']),[]);
});
test('backup waits for both the archive and source replacement during recovery',async t=>{
 const a=await source(t),key=MAPEGUM_PACKAGE_CHOICE_PREFIX+'room';await a.storage.setItem(key,'{broken');const set=a.storage.setItem.bind(a.storage);let release!:()=>void,began!:()=>void;const gate=new Promise<void>(r=>{release=r;}),started=new Promise<void>(r=>{began=r;});a.storage.setItem=async(k,v)=>{if(k===recoveryArchiveKey(key)){began();await gate;}await set(k,v);};
 const recovery=mapegumPackageStorage.recover(a.storage,'room');await started;let done=false;const exportPromise=readProjectBackup(a.db,a.storage).then(v=>{done=true;return v;});await new Promise(r=>setImmediate(r));assert.equal(done,false);release();await recovery;const backup=await exportPromise;assert.equal(parsePreferenceRecovery(backup.preferences[recoveryArchiveKey(key)]).records[0].raw,'{broken');assert.deepEqual(parseMapegumPackageChoices(backup.preferences[key]),[]);
});
test('an archive-only common basket is transferable and arbitrary recovery keys or malformed records reject import',async t=>{
 const a=await fixture(t),b=await fixture(t),key=MAPEGUM_PACKAGE_CHOICE_PREFIX+'renovation-basket';await a.storage.setItem(key,'{broken');await mapegumPackageStorage.recover(a.storage,'renovation-basket');const backup=await readProjectBackup(a.db,a.storage);assert.equal(hasBackupContent(backup),true);await importProjectBackup(parseProjectBackup(JSON.stringify(backup)),b.db,b.storage);assert.equal(parsePreferenceRecovery((await readProjectBackup(b.db,b.storage)).preferences[recoveryArchiveKey(key)]).records[0].raw,'{broken');
 for(const [k,v]of [['remont.preference-recovery.v1:unreviewed:renovation-basket',JSON.stringify({version:1,records:[]})],[recoveryArchiveKey(key),JSON.stringify({version:1,records:[{raw:'data',savedAt:'yesterday',price:0}]})]]){const bad=structuredClone(backup);bad.preferences[k]=v;assert.throws(()=>parseProjectBackup(JSON.stringify(bad)));}
});

test('project and common Mapegum choices round-trip through real SQLite with the other family preferences',async t=>{
 const a=await source(t),b=await fixture(t);await writeMapegumPackageChoices(a.storage,'room',[mapegumChoice]);await writeMapegumPackageChoices(a.storage,'renovation-basket',[mapegumChoice]);await writePrimerPackageChoices(a.storage,'room',[primerChoice]);
 const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));await importProjectBackup(backup,b.db,b.storage);const restored=await readProjectBackup(b.db,b.storage);
 for(const id of ['room','renovation-basket'])assert.deepEqual(parseMapegumPackageChoices(restored.preferences[MAPEGUM_PACKAGE_CHOICE_PREFIX+id]),[mapegumChoice]);assert.deepEqual(parsePrimerPackageChoices(restored.preferences[PRIMER_PACKAGE_CHOICE_PREFIX+'room']),[primerChoice]);
});
test('export waits for a pending Mapegum preference write',async t=>{
 const a=await source(t),set=a.storage.setItem.bind(a.storage);let finish!:()=>void;const gate=new Promise<void>(r=>{finish=r;});a.storage.setItem=async(key,value)=>{if(key.startsWith(MAPEGUM_PACKAGE_CHOICE_PREFIX))await gate;await set(key,value);};
 const write=writeMapegumPackageChoices(a.storage,'room',[mapegumChoice]);let done=false;const read=readProjectBackup(a.db,a.storage).then(result=>{done=true;return result;});await new Promise(r=>setImmediate(r));assert.equal(done,false);finish();await write;assert.deepEqual(parseMapegumPackageChoices((await read).preferences[MAPEGUM_PACKAGE_CHOICE_PREFIX+'room']),[mapegumChoice]);
});
test('a Mapegum-only common basket preference transfers without creating a project',async t=>{
 const a=await fixture(t),b=await fixture(t);await writeMapegumPackageChoices(a.storage,'renovation-basket',[mapegumChoice]);const backup=await readProjectBackup(a.db,a.storage);assert.equal(backup.tables.projects.length,0);assert.equal(hasBackupContent(backup),true);await importProjectBackup(parseProjectBackup(JSON.stringify(backup)),b.db,b.storage);assert.deepEqual(parseMapegumPackageChoices((await readProjectBackup(b.db,b.storage)).preferences[MAPEGUM_PACKAGE_CHOICE_PREFIX+'renovation-basket']),[mapegumChoice]);
});
test('foreign, older or price-bearing Mapegum choices reject the entire archive',async t=>{
 const a=await source(t),backup=await readProjectBackup(a.db,a.storage);for(const choice of [{from:'mat-mapegum-wps-5kg',to:'automatic'},{from:primerChoice.from,to:'automatic'},{...mapegumChoice,to:'other'},{...mapegumChoice,price:1}]){const bad=structuredClone(backup);bad.preferences[MAPEGUM_PACKAGE_CHOICE_PREFIX+'room']=JSON.stringify({version:1,choices:[choice]});assert.throws(()=>parseProjectBackup(JSON.stringify(bad)));}
});
test('project and common-basket primer pack choices survive real SQLite export and import',async t=>{
 const a=await source(t),b=await fixture(t);await writePrimerPackageChoices(a.storage,'room',[primerChoice]);await writePrimerPackageChoices(a.storage,'renovation-basket',[primerChoice]);
 const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));await importProjectBackup(backup,b.db,b.storage);const restored=await readProjectBackup(b.db,b.storage);
 for(const id of ['room','renovation-basket'])assert.deepEqual(parsePrimerPackageChoices(restored.preferences[PRIMER_PACKAGE_CHOICE_PREFIX+id]),[primerChoice]);
});

test('backup export waits for a pending primer pack choice save',async t=>{
 const a=await source(t),set=a.storage.setItem.bind(a.storage);let finish!:()=>void;const gate=new Promise<void>(r=>{finish=r;});
 a.storage.setItem=async(key,value)=>{if(key.startsWith(PRIMER_PACKAGE_CHOICE_PREFIX))await gate;await set(key,value);};
 const write=writePrimerPackageChoices(a.storage,'room',[primerChoice]);let finished=false;const snapshot=readProjectBackup(a.db,a.storage).then(value=>{finished=true;return value;});
 await new Promise(r=>setImmediate(r));assert.equal(finished,false);finish();await write;assert.deepEqual(parsePrimerPackageChoices((await snapshot).preferences[PRIMER_PACKAGE_CHOICE_PREFIX+'room']),[primerChoice]);
});

test('an automatic primer choice is transferable even without any projects',async t=>{
 const a=await fixture(t),b=await fixture(t);await writePrimerPackageChoices(a.storage,'renovation-basket',[primerChoice]);const backup=await readProjectBackup(a.db,a.storage);assert.equal(backup.tables.projects.length,0);assert.equal(hasBackupContent(backup),true);
 await importProjectBackup(parseProjectBackup(JSON.stringify(backup)),b.db,b.storage);assert.deepEqual(parsePrimerPackageChoices((await readProjectBackup(b.db,b.storage)).preferences[PRIMER_PACKAGE_CHOICE_PREFIX+'renovation-basket']),[primerChoice]);
});

test('foreign or price-bearing primer family choices cannot enter an imported archive',async t=>{
 const a=await source(t),backup=await readProjectBackup(a.db,a.storage);
 for(const choice of [{from:'unreviewed',to:'automatic'},{...primerChoice,to:'other'},{...primerChoice,price:1}]){const bad=structuredClone(backup);bad.preferences[PRIMER_PACKAGE_CHOICE_PREFIX+'room']=JSON.stringify({version:1,choices:[choice]});assert.throws(()=>parseProjectBackup(JSON.stringify(bad)));}
});

test('allocated usable material stock survives a real SQLite and preference backup round trip',async t=>{
 const a=await source(t),b=await fixture(t);await writeMaterialStock(a.storage,'room',[stockEntry]);
 const snapshot=await readProjectBackup(a.db,a.storage),backup=parseProjectBackup(JSON.stringify(snapshot));
 assert.deepEqual(parseMaterialStock(backup.preferences[MATERIAL_STOCK_PREFIX+'room']),[stockEntry]);
 await importProjectBackup(backup,b.db,b.storage);
 assert.deepEqual(parseMaterialStock((await readProjectBackup(b.db,b.storage)).preferences[MATERIAL_STOCK_PREFIX+'room']),[stockEntry]);
});
test('a backup waits for an in-flight inventory save and never captures its previous empty value',async t=>{
 const a=await source(t),set=a.storage.setItem.bind(a.storage);let finish!:()=>void;
 const gate=new Promise<void>(resolve=>{finish=resolve;});
 a.storage.setItem=async(key,value)=>{if(key.startsWith(MATERIAL_STOCK_PREFIX))await gate;await set(key,value);};
 const write=writeMaterialStock(a.storage,'room',[stockEntry]);let done=false;
 const reading=readProjectBackup(a.db,a.storage).then(value=>{done=true;return value;});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(done,false);finish();await write;
 assert.deepEqual(parseMaterialStock((await reading).preferences[MATERIAL_STOCK_PREFIX+'room']),[stockEntry]);
});
test('corrupt, foreign-project and shared-pool inventory records cannot enter an imported archive',async t=>{
 const a=await source(t),snapshot=await readProjectBackup(a.db,a.storage);
 for(const[key,entries]of [[MATERIAL_STOCK_PREFIX+'room',[{...stockEntry,quantity:-1}]],[MATERIAL_STOCK_PREFIX+'missing',[stockEntry]],[MATERIAL_STOCK_PREFIX+'renovation-basket',[stockEntry]],[MATERIAL_STOCK_PREFIX+'room',[stockEntry,stockEntry]]]as const){
  const broken=structuredClone(snapshot);broken.preferences[key]=JSON.stringify({version:1,entries});
  assert.throws(()=>parseProjectBackup(JSON.stringify(broken)));
 }
});
async function setSharedChoices(storage:BackupStorage){for(const[key,value]of Object.entries(sharedChoices()))await storage.setItem(key,value);}

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
  await storage.setItem('remont.flush-box-choice.v1:renovation-basket',JSON.stringify({version:1,choices:[{from:'mat-flush-box-elektroplast-pk60-10',to:'mat-epn-pk60-pro-0285-01'}]}));
  return result;
}

test('real SQLite round trip retains all renovation records, owned/purchased flags, custom quantities, embedded photos and choices',async t=>{
  const a=await source(t),b=await fixture(t),snapshot=await readProjectBackup(a.db,a.storage);
  const backup=parseProjectBackup(JSON.stringify(snapshot));assert.equal(Object.keys(backup.tables).length,7);
  const delivery=JSON.parse(backup.preferences['remont.delivery.v2:room']);assert.equal(delivery.settings.method,'automatic');assert.equal(delivery.settings.legacyFees,undefined);assert.equal(delivery.scope,undefined);
  const result=await importProjectBackup(backup,b.db,b.storage);assert.deepEqual(result,{projects:1,keptBasketSettings:false});
  const restored=await readProjectBackup(b.db,b.storage);assert.equal(canonical(restored.tables),canonical(backup.tables));assert.equal(canonical(restored.preferences),canonical(backup.preferences));
  assert.deepEqual(JSON.parse(restored.preferences['remont.flush-box-choice.v1:renovation-basket']).choices,[{from:'mat-flush-box-elektroplast-pk60-10',to:'mat-epn-pk60-pro-0285-01'}]);
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

test('all shared product choices survive real SQLite export, file parsing and import',async t=>{
  const a=await source(t),b=await fixture(t);await setSharedChoices(a.storage);
  const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));
  for(const[key,value]of Object.entries(sharedChoices()))assert.equal(backup.preferences[key],value,'The shared choice must be exported even though renovation-basket is not a project row');
  await importProjectBackup(backup,b.db,b.storage);
  const restored=await readProjectBackup(b.db,b.storage);
  for(const[key,value]of Object.entries(sharedChoices()))assert.equal(restored.preferences[key],value);
  assert.equal(canonical(restored.tables),canonical(backup.tables));
});
test('adding projects preserves all existing shared choices, including explicit empty selections',async t=>{
  const a=await source(t),b=await fixture(t);await setSharedChoices(a.storage);
  b.sqlite.exec("INSERT INTO projects(id,name,job_id,job_name,category_id,created_at,updated_at) VALUES('existing','Mój remont','paint','Ściany','paint','2026-10-31','2026-10-31')");
  const empty=JSON.stringify({version:1,choices:[]});for(const key of Object.keys(sharedChoices()))await b.storage.setItem(key,empty);
  const result=await importProjectBackup(await readProjectBackup(a.db,a.storage),b.db,b.storage);
  assert.equal(result.keptBasketSettings,true);
  for(const key of Object.keys(sharedChoices()))assert.equal(b.values.get(key),empty);
});
test('a basket-only renovation round-trips without manufacturing a project or losing product choices',async t=>{
  const a=await fixture(t),b=await fixture(t);await setSharedChoices(a.storage);
  await a.storage.setItem('remont.basket-extras.v1',JSON.stringify({version:1,items:[{id:'basket-boxes',kind:'catalogue',referenceId:'mat-flush-box-elektroplast-pk60-10',quantity:11}]}));
  await a.storage.setItem('remont.delivery.v2:renovation-basket',JSON.stringify({store:null,settings:{mode:'shipping',method:'automatic',postalCode:'30-001'}}));
  const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));
  assert.equal(backup.tables.projects.length,0);assert.equal(backupExtraCount(backup),1);assert.equal(hasBackupContent(backup),true);
  assert.deepEqual(await importProjectBackup(backup,b.db,b.storage),{projects:0,keptBasketSettings:false});
  const restored=await readProjectBackup(b.db,b.storage);assert.equal(canonical(restored.preferences),canonical(backup.preferences));
  assert.equal(b.sqlite.prepare('SELECT COUNT(*) AS n FROM projects').get()!.n,0);
});
test('an existing basket without projects is preserved when projects are added',async t=>{
  const a=await source(t),b=await fixture(t);await setSharedChoices(a.storage);
  const current=JSON.stringify({version:1,items:[{id:'mine',kind:'custom',name:'Moja listwa',unit:'mb',quantity:7}]});
  await b.storage.setItem('remont.basket-extras.v1',current);
  const delivery=JSON.stringify({store:null,settings:{mode:'shipping',method:'automatic',postalCode:'00-001'}});await b.storage.setItem('remont.delivery.v2:renovation-basket',delivery);
  const result=await importProjectBackup(await readProjectBackup(a.db,a.storage),b.db,b.storage);
  assert.equal(result.keptBasketSettings,true);assert.equal(b.values.get('remont.basket-extras.v1'),current);assert.equal(b.values.get('remont.delivery.v2:renovation-basket'),delivery);
  assert.ok(Object.keys(sharedChoices()).every(key=>!b.values.has(key)));
});
test('a basket-only conflict stops before any writes rather than claiming an import while discarding its only contents',async t=>{
  const a=await fixture(t),b=await source(t);await setSharedChoices(a.storage);
  const backup=await readProjectBackup(a.db,a.storage),before=new Map(b.values);let writes=0;
  const storage={...b.storage,setItem:async(k:string,v:string)=>{writes++;await b.storage.setItem(k,v);}};
  await assert.rejects(importProjectBackup(backup,b.db,storage),/backup_basket_conflict/);
  assert.equal(writes,0);assert.deepEqual(b.values,before);assert.equal(b.sqlite.prepare('SELECT COUNT(*) AS n FROM projects').get()!.n,1);
});
test('default empty settings remain empty; a deliberate postcode or product choice is transferable content',async t=>{
  const a=await fixture(t),b=await fixture(t);
  await a.storage.setItem('remont.delivery.v2:renovation-basket',JSON.stringify({store:null,settings:{mode:'shipping',method:'automatic'}}));
  let backup=await readProjectBackup(a.db,a.storage);assert.equal(hasBackupContent(backup),false);
  await assert.rejects(importProjectBackup(backup,b.db,b.storage),/backup_empty/);
  await a.storage.setItem('remont.delivery.v2:renovation-basket',JSON.stringify({store:null,settings:{mode:'shipping',method:'automatic',postalCode:'30-001'}}));
  backup=await readProjectBackup(a.db,a.storage);assert.equal(hasBackupContent(backup),true);
  assert.deepEqual(await importProjectBackup(backup,b.db,b.storage),{projects:0,keptBasketSettings:false});
  assert.equal(JSON.parse(b.values.get('remont.delivery.v2:renovation-basket')!).settings.postalCode,'30-001');
});
test('invalid identities in every shared product selector reject the entire archive',async t=>{
  const a=await source(t);await setSharedChoices(a.storage);const backup=await readProjectBackup(a.db,a.storage);
  for(const key of Object.keys(sharedChoices())){const bad=structuredClone(backup);bad.preferences[key]=JSON.stringify({version:1,choices:[{from:'missing',to:'missing',use:'floor'}]});assert.throws(()=>parseProjectBackup(JSON.stringify(bad)));}
});


test('ceiling paint project/common choices and a damaged original survive SQLite export/import',async t=>{
  const a=await source(t),b=await fixture(t),choice={from:'mat-paint-standard-white-10l',to:'mat-paint-better-white-10l'},key=CEILING_PAINT_CHOICE_PREFIX+'room';
  await a.storage.setItem(key,'{damaged-ceiling-paint');await assert.rejects(ceilingPaintStorage.read(a.storage,'room'));
  await ceilingPaintStorage.recover(a.storage,'room');await ceilingPaintStorage.write(a.storage,'room',[choice]);await ceilingPaintStorage.write(a.storage,'renovation-basket',[{...choice,from:'mat-paint-economy-white-10l'}]);
  const backup=parseProjectBackup(JSON.stringify(await readProjectBackup(a.db,a.storage)));await importProjectBackup(backup,b.db,b.storage);const restored=await readProjectBackup(b.db,b.storage);
  assert.deepEqual(await ceilingPaintStorage.read(b.storage,'room'),[choice]);assert.deepEqual(await ceilingPaintStorage.read(b.storage,'renovation-basket'),[{...choice,from:'mat-paint-economy-white-10l'}]);
  assert.equal(parsePreferenceRecovery(restored.preferences[recoveryArchiveKey(key)]).records[0].raw,'{damaged-ceiling-paint');assert.equal(canonical(restored.tables),canonical(backup.tables));
});
test('backup waits for the exact pending ceiling paint selection',async t=>{
  const a=await source(t),key=CEILING_PAINT_CHOICE_PREFIX+'room',choice={from:'mat-paint-standard-white-10l',to:'mat-paint-better-white-10l'},set=a.storage.setItem.bind(a.storage);
  let release!:()=>void,began!:()=>void;const gate=new Promise<void>(r=>{release=r;}),started=new Promise<void>(r=>{began=r;});a.storage.setItem=async(k,v)=>{if(k===key){began();await gate;}await set(k,v);};
  const write=ceilingPaintStorage.write(a.storage,'room',[choice]);await started;let done=false;const exporting=readProjectBackup(a.db,a.storage).then(value=>{done=true;return value;});await new Promise(r=>setImmediate(r));assert.equal(done,false);release();await write;
  assert.deepEqual(parseCeilingPaintChoices((await exporting).preferences[key]),[choice]);
});
