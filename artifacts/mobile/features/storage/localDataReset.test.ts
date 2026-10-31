import assert from 'node:assert/strict';
import {test,type TestContext} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {queuedDatabase,type DatabaseConnection} from '../../db/connection';
import {runMigrations} from '../../db/migrations/runner';
import {resetLocalData} from './localDataReset';

async function fixture(t:TestContext){
  const sqlite=new DatabaseSync(':memory:');t.after(()=>sqlite.close());sqlite.exec('PRAGMA foreign_keys=ON');
  const params=(args:any[])=>Array.isArray(args[1])?args[1]:args.slice(1);
  const raw={execAsync:async(sql:string)=>sqlite.exec(sql),runAsync:async(...args:any[])=>{const row=sqlite.prepare(args[0]).run(...params(args));return{changes:Number(row.changes),lastInsertRowId:Number(row.lastInsertRowid)};},getAllAsync:async(...args:any[])=>sqlite.prepare(args[0]).all(...params(args)).map(row=>({...row})),getFirstAsync:async(...args:any[])=>{const row=sqlite.prepare(args[0]).get(...params(args));return row?{...row}:null;}};
  await runMigrations(raw as any);
  const tables=(await raw.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name!='schema_versions' AND name NOT LIKE 'sqlite_%' ORDER BY CASE name WHEN 'projects' THEN 0 ELSE 1 END,name")).map(row=>String(row.name));
  // Populate every table created by the actual fourteen app migrations. A new
  // table must be cleared too; this is not a mirror of a hand-written list.
  for(const table of tables){
    const columns=await raw.getAllAsync(`PRAGMA table_info("${table}")`);
    const values=columns.map(column=>column.name==='project_id'?'project':column.name==='id'?column.type==='INTEGER'?1:table==='projects'?'project':'qa-'+table:/INT|REAL/.test(String(column.type))?1:'QA local reset '+table);
    sqlite.prepare(`INSERT INTO "${table}" (${columns.map(c=>`"${c.name}"`).join(',')}) VALUES(${columns.map(()=>'?').join(',')})`).run(...values as any[]);
  }
  const db=queuedDatabase(raw as any,()=>{}),values=new Map([['app.language','pl'],['wizard_draft_v2','private draft'],['remont.price-seen.v1:project','history'],['remont.laminate-choice.v1:project','selection']]);
  const storage={clear:async()=>{values.clear();},getAllKeys:async()=>[...values.keys()]};
  const snapshot=()=>tables.map(table=>({table,rows:sqlite.prepare(`SELECT * FROM "${table}"`).all()}));
  return{sqlite,raw,db,tables,values,storage,snapshot};
}

test('confirmed reset clears every real data table from all14 migrations and preferences, preserving migration metadata and schema',async t=>{
  const f=await fixture(t),versions=f.sqlite.prepare('SELECT * FROM schema_versions ORDER BY version').all();assert.equal(versions.length,14);assert.ok(f.tables.length>40);
  const result=await resetLocalData(f.db,f.storage);assert.equal(result.clearedTables,f.tables.length);assert.ok(f.snapshot().every(table=>table.rows.length===0));assert.equal(f.values.size,0);assert.deepEqual(f.sqlite.prepare('SELECT * FROM schema_versions ORDER BY version').all(),versions);
  await runMigrations(f.raw as any);assert.deepEqual(f.sqlite.prepare('SELECT * FROM schema_versions ORDER BY version').all(),versions);
});

test('a late SQL failure rolls all local data back and does not clear any preference',async t=>{
  const f=await fixture(t),before=f.snapshot(),prefs=new Map(f.values);
  f.sqlite.exec("CREATE TRIGGER stop_reset BEFORE DELETE ON shopping_items BEGIN SELECT RAISE(ABORT,'disk_failure_fixture'); END;");
  await assert.rejects(resetLocalData(f.db,f.storage),/local_reset_database_unconfirmed/);assert.deepEqual(f.snapshot(),before);assert.deepEqual(f.values,prefs);
});

test('lost SQLite and storage replies are checked against actual state without a second delete or false failure',async t=>{
  const f=await fixture(t);let batches=0,clears=0;
  const db:DatabaseConnection={...f.db,runBatchAsync:async commands=>{batches++;await f.db.runBatchAsync(commands);throw Error('lost_reply');}};
  const storage={...f.storage,clear:async()=>{clears++;await f.storage.clear();throw Error('lost_reply');}};
  await resetLocalData(db,storage);assert.equal(batches,1);assert.equal(clears,1);assert.ok(f.snapshot().every(table=>table.rows.length===0));
});

test('unconfirmed preference removal after SQL deletion is an explicit partial failure, not success',async t=>{
  const f=await fixture(t);await assert.rejects(resetLocalData(f.db,{...f.storage,clear:async()=>{throw Error('permission_denied');}}),/local_reset_preferences_unconfirmed/);
  assert.ok(f.snapshot().every(table=>table.rows.length===0));assert.ok(f.values.size>0);
  await resetLocalData(f.db,f.storage);assert.equal(f.values.size,0);
});

test('unreadable post-delete state and data recreated by another caller never produce success',async t=>{
  const f=await fixture(t);let deleted=false;
  const db:DatabaseConnection={...f.db,runBatchAsync:async commands=>{await f.db.runBatchAsync(commands);deleted=true;},getAllAsync:async(...args:any[])=>{if(deleted)throw Error('lost_connection');return(f.db.getAllAsync as any)(...args);}};
  await assert.rejects(resetLocalData(db,f.storage),/local_reset_database_unconfirmed/);assert.ok(f.values.size>0);
  const g=await fixture(t);await assert.rejects(resetLocalData(g.db,{...g.storage,clear:async()=>{await g.storage.clear();await g.db.runAsync("INSERT INTO projects(id,name,job_id,job_name,category_id,created_at,updated_at) VALUES('new','From another tab','paint','Paint','paint','2026-10-31','2026-10-31')");}}),/local_reset_database_unconfirmed/);
});

test('an unexpected unsafe table name blocks all deletion before SQL mutation',async t=>{
  const f=await fixture(t),before=f.snapshot();f.sqlite.exec('CREATE TABLE "unexpected-table"(value TEXT)');
  await assert.rejects(resetLocalData(f.db,f.storage),/local_reset_schema_unconfirmed/);assert.deepEqual(f.snapshot(),before);assert.ok(f.values.size>0);
});
