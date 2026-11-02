import assert from 'node:assert/strict';
import {test} from 'node:test';
import {withBasketExtras} from './basketExtras';
import {applyCeresitPackageChoices,parseCeresitPackageChoices,CERESIT_PACKAGE_CHOICE_PREFIX} from './ceresitPackageChoice';
import {ceresitPackageStorage} from './ceresitPackageStorage';
import {validateBackupPreferences} from '../storage/projectBackupPreferences';
import type {ProjectBackup} from '../storage/projectBackup';
const refs=['mat-grout-ceresit-viva-grey-2kg','mat-grout-ceresit-viva-manhattan-4kg','mat-grout-ceresit-viva-white-4kg'],families=['ceresit-viva-grey07-kg-v1','ceresit-viva-manhattan10-kg-v1','ceresit-viva-white01-kg-v1'],choices=refs.map(from=>({from,to:'automatic' as const})),input=()=>withBasketExtras([],refs.map((referenceId,i)=>({id:'shade'+i,kind:'catalogue' as const,referenceId,quantity:i===2?20:5})));
test('explicit Viva choices retain each shade and its kilograms; selecting grey cannot recolour white, Manhattan or old CE40',()=>{
 const stages=input(),before=JSON.stringify(stages),all=applyCeresitPackageChoices(stages,choices);assert.deepEqual(all[0].materials.map(l=>l.quantity),[5,5,20]);assert.deepEqual(all[0].materials.map(l=>l.material.packageFamily),families);assert.deepEqual(all[0].materials.map(l=>l.material.id),stages[0].materials.map(l=>l.material.id));const grey=applyCeresitPackageChoices(stages,[choices[0]]);assert.equal(grey[0].materials[0].material.packageFamily,families[0]);assert.deepEqual(grey[0].materials.slice(1),stages[0].materials.slice(1));assert.equal(JSON.stringify(stages),before);const old=withBasketExtras([],[{id:'ce40',kind:'catalogue',referenceId:'mat-grout-ceresit-ce40-white-2kg',quantity:5}]);assert.deepEqual(applyCeresitPackageChoices(old,choices),old);
});
test('three colour choices survive existing shared-basket storage and real backup validation without adding a preference namespace',async()=>{
 const data=new Map<string,string>(),storage={getItem:async(k:string)=>data.get(k)??null,setItem:async(k:string,v:string)=>{data.set(k,v);}};await ceresitPackageStorage.write(storage,'renovation-basket',choices);assert.deepEqual(await ceresitPackageStorage.read(storage,'renovation-basket'),choices);assert.deepEqual(await ceresitPackageStorage.read(storage,'room'),[]);const preferences=Object.fromEntries(data);validateBackupPreferences({tables:{projects:[]},preferences}as unknown as ProjectBackup);assert.deepEqual(parseCeresitPackageChoices(preferences[CERESIT_PACKAGE_CHOICE_PREFIX+'renovation-basket']),choices);assert.throws(()=>parseCeresitPackageChoices(JSON.stringify({version:1,choices:[{from:refs[0],to:refs[1]}]})));
});
