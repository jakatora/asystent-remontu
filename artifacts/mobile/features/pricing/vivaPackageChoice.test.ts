import assert from 'node:assert/strict';
import {test} from 'node:test';
import {applyCeresitPackageChoices,ceresitPackageRequirements,parseCeresitPackageChoices,CERESIT_PACKAGE_PRODUCTS,CERESIT_PACKAGE_CHOICE_PREFIX} from './ceresitPackageChoice';
import {ceresitPackageStorage} from './ceresitPackageStorage';
import {validateBackupPreferences} from '../storage/projectBackupPreferences';
import {withBasketExtras} from './basketExtras';
import {CERESIT_VIVA_WHITE_FAMILY,CERESIT_VIVA_WHITE_FAMILY_NAME} from '../../../../lib/pricing-service/src/reviewed-package-families';
import type {ProjectBackup} from '../storage/projectBackup';

const id='mat-grout-ceresit-viva-white-2kg',choice={from:id,to:'automatic' as const},input=()=>withBasketExtras([],[{id:'viva',kind:'catalogue',referenceId:id,quantity:5}]);
test('Viva bucket selection is explicit, keeps raw kg and IDs, and cannot substitute old CE40 or another product',()=>{
  const stages=input(),before=JSON.stringify(stages);assert.equal(ceresitPackageRequirements(stages)[0].id,id);assert.deepEqual(applyCeresitPackageChoices(stages,[]),stages);
  const result=applyCeresitPackageChoices(stages,[choice]),line=result[0].materials[0];assert.equal(line.quantity,5);assert.equal(line.material.id,stages[0].materials[0].material.id);assert.equal(line.material.packageFamily,CERESIT_VIVA_WHITE_FAMILY);assert.equal(line.material.name,CERESIT_VIVA_WHITE_FAMILY_NAME);assert.equal(line.material.ean,undefined);assert.equal(line.material.unit,'kg');assert.equal(JSON.stringify(stages),before);
  const old=withBasketExtras([],[{id:'old',kind:'catalogue',referenceId:'mat-grout-ceresit-ce40-white-2kg',quantity:5}]);assert.deepEqual(applyCeresitPackageChoices(old,[choice]),old);assert.deepEqual(ceresitPackageRequirements(old),[]);assert.equal(CERESIT_PACKAGE_PRODUCTS.filter(p=>p.materialType==='grout').length,2);
  for(const material of[{...stages[0].materials[0].material,unit:'l'},{...stages[0].materials[0].material,category:'primer'},{...stages[0].materials[0].material,gtin:'5900089140015'}]){const changed=[{...stages[0],materials:[{...stages[0].materials[0],material}]}];assert.deepEqual(applyCeresitPackageChoices(changed,[choice]),changed);}
});
test('Viva and CT17 choices round-trip through the existing common-basket storage and backup validator without mixing kg and litres',async()=>{
  const primer={from:'mat-primer-ceresit-ct17-profi-5l',to:'automatic' as const},choices=[primer,choice],data=new Map<string,string>(),s={getItem:async(k:string)=>data.get(k)??null,setItem:async(k:string,v:string)=>{data.set(k,v);}};await ceresitPackageStorage.write(s,'renovation-basket',choices);assert.deepEqual(await ceresitPackageStorage.read(s,'renovation-basket'),choices);assert.deepEqual(await ceresitPackageStorage.read(s,'other-project'),[]);
  const preferences=Object.fromEntries(data),backup={tables:{projects:[]},preferences}as unknown as ProjectBackup;validateBackupPreferences(backup);assert.deepEqual(parseCeresitPackageChoices(preferences[CERESIT_PACKAGE_CHOICE_PREFIX+'renovation-basket']),choices);
  assert.throws(()=>parseCeresitPackageChoices(JSON.stringify({version:1,choices:[{from:'mat-grout-ceresit-ce40-white-2kg',to:'automatic'}]})));assert.throws(()=>parseCeresitPackageChoices(JSON.stringify({version:1,choices:[{...choice,to:'mat-grout-ceresit-viva-white-4kg'}]})));
});
