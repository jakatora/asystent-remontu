import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {saveProjectWithReadback} from './projectSave';
import type {Project} from '@/types/domain';
const project:Project={id:'qa',name:'Sufit',jobId:'gypsum-ceiling',jobName:'Sufit g-k',categoryId:'gypsum',measurements:{ceilingArea:10,gypsumUdProfile:1,gypsumUdFit:1},status:'planning',createdAt:'2026-10-28T00:00:00Z',updatedAt:'2026-10-28T00:00:00Z'};
test('a committed SQLite update with a lost reply is read back once and never written twice',async t=>{
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());db.exec('CREATE TABLE projects(id TEXT PRIMARY KEY, body TEXT);');let writes=0,reads=0;
 const saved=await saveProjectWithReadback(project,{write:async p=>{writes++;db.prepare('INSERT INTO projects VALUES(?,?)').run(p.id,JSON.stringify({...p,updatedAt:'2026-10-28T01:00:00Z'}));throw Error('database_request_timeout_check_saved_changes');},read:async id=>{reads++;const row=db.prepare('SELECT body FROM projects WHERE id=?').get(id);return row?JSON.parse(String(row.body)):null;}});
 assert.equal(writes,1);assert.equal(reads,1);assert.equal(saved.updatedAt,'2026-10-28T01:00:00Z');assert.equal(db.prepare('SELECT COUNT(*) AS n FROM projects').get()!.n,1);
});
test('failed, missing, changed or unreadable saved data cannot turn an uncertain write into success',async()=>{
 for(const saved of [null,{...project,measurements:{...project.measurements,gypsumUdFit:0}},{...project,name:'Inny projekt'}]){let writes=0;await assert.rejects(saveProjectWithReadback(project,{write:async()=>{writes++;throw Error('write_failed');},read:async()=>saved}),/save_unconfirmed/);assert.equal(writes,1);}
 await assert.rejects(saveProjectWithReadback(project,{write:async()=>{},read:async()=>{throw Error('read_timeout');}}),/save_unconfirmed/);
});
test('a normal acknowledged save returns actual metadata and tolerates JSON object order without hiding changed contents',async()=>{
 const result=await saveProjectWithReadback(project,{write:async()=>{},read:async()=>({...project,measurements:{gypsumUdFit:1,gypsumUdProfile:1,ceilingArea:10},updatedAt:'2026-10-28T02:00:00Z'})});assert.equal(result.updatedAt,'2026-10-28T02:00:00Z');
});
