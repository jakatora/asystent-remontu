import type {DatabaseConnection} from '../../db/connection';

export interface ResetStorage {clear():Promise<void>;getAllKeys():Promise<readonly string[]>}

async function userTables(db:DatabaseConnection):Promise<string[]>{
  const rows=await db.getAllAsync<{name:string}>("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  if(!rows.some(row=>row.name==='schema_versions')||rows.length>500||rows.some(row=>!/^[a-z][a-z0-9_]{0,80}$/.test(row.name)))throw Error('local_reset_schema_unconfirmed');
  // This is the app's local database. Preserve migration metadata, and include
  // every real data table, also those added after the original Settings screen.
  return rows.map(row=>row.name).filter(name=>name!=='schema_versions');
}
async function empty(db:DatabaseConnection,tables:readonly string[]):Promise<boolean>{
  if(!tables.length)return true;
  const counts=await db.getAllAsync<{n:number}>(tables.map(name=>`SELECT COUNT(*) AS n FROM "${name}"`).join(' UNION ALL '));
  return counts.length===tables.length&&counts.every(row=>row.n===0);
}

/** Only the user's explicitly confirmed local reset calls this function.
 * No backend account deletion, subscription cancellation or money movement.
 * source: https://www.sqlite.org/lang_transaction.html
 * source: https://www.sqlite.org/pragma.html#pragma_defer_foreign_keys */
export async function resetLocalData(db:DatabaseConnection,storage:ResetStorage):Promise<{clearedTables:number}>{
  const tables=await userTables(db);
  const versions=await db.getAllAsync('SELECT * FROM schema_versions ORDER BY version');
  let writeError:unknown;
  try{
    // Deferred constraints are checked on COMMIT and reset by SQLite when the
    // transaction ends. All rows disappear together, including child records.
    await db.runBatchAsync([{sql:'PRAGMA defer_foreign_keys=ON'},...tables.map(name=>({sql:`DELETE FROM "${name}"`}))]);
  }catch(error){writeError=error;}
  try{
    if(!await empty(db,tables)||JSON.stringify(await db.getAllAsync('SELECT * FROM schema_versions ORDER BY version'))!==JSON.stringify(versions))throw Error('not_empty');
  }catch(error){throw new Error('local_reset_database_unconfirmed',{cause:writeError??error});}

  // A lost reply may follow a committed SQLite batch. The actual empty rows
  // above prove that result; never replay the delete automatically.
  try{await storage.clear();}catch{/* Confirm the actual storage state below. */}
  try{if((await storage.getAllKeys()).length)throw Error('not_empty');}
  catch(error){throw new Error('local_reset_preferences_unconfirmed',{cause:error});}
  // Another open tab may still write. Do not claim success if it recreated data.
  try{if(!await empty(db,tables))throw Error('not_empty');}
  catch(error){throw new Error('local_reset_database_unconfirmed',{cause:error});}
  return{clearedTables:tables.length};
}
