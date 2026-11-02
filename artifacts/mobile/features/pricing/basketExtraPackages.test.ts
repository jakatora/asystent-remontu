import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import {extraMaterial,extraPackageFamily,parseBasketExtras,withBasketExtras,type BasketExtra} from './basketExtras';
import {validateBackupPreferences} from '../storage/projectBackupPreferences';
import {KNAUF_SUPER_FINISH_FAMILY,REVIEWED_PACKAGE_FAMILIES} from '../../../../lib/pricing-service/src/reviewed-package-families';

const referenceId='mat-skim-coat-knauf-superfinish-28kg';
const fixed:BasketExtra={id:'finish',kind:'catalogue',referenceId,quantity:29.000001};
const automatic:BasketExtra={...fixed,packageFamily:KNAUF_SUPER_FINISH_FAMILY};
const saved=(items:unknown[])=>JSON.stringify({version:1,items});

test('opting into Super Finish pack sizes preserves raw kilograms and the original reference for returning to a fixed size',()=>{
 const before=JSON.stringify(automatic),line=extraMaterial(automatic);
 assert.equal(line.quantity,29.000001);assert.equal(line.material.packageFamily,KNAUF_SUPER_FINISH_FAMILY);
 assert.equal(line.material.unit,'kg');assert.equal(line.material.category,'skim-coat');assert.equal(line.material.ean,undefined);
 assert.deepEqual(Object.keys(line).sort(),['material','quantity']);assert.deepEqual(Object.keys(line.material).sort(),['category','id','name','packageFamily','unit']);
 assert.equal(JSON.stringify(automatic),before);assert.deepEqual(parseBasketExtras(saved([automatic])),[automatic]);
 const locked=extraMaterial(fixed);assert.equal(locked.material.ean,'5901793357935');assert.equal(locked.material.packageFamily,undefined);assert.equal(locked.quantity,line.quantity);
});

test('only exact catalogue GTIN, package size, category and physical unit enable a reviewed family',()=>{
 const ref=MATERIAL_PRICES.find(ref=>ref.id===referenceId)!;
 assert.equal(extraPackageFamily(ref)?.key,KNAUF_SUPER_FINISH_FAMILY);
 for(const patch of [{id:'unreviewed-product'},{packageSize:20},{packageUnit:'l'},{materialType:'primer'}])assert.equal(extraPackageFamily({...ref,...patch}),undefined);
 for(const family of REVIEWED_PACKAGE_FAMILIES){
  const refs=MATERIAL_PRICES.filter(ref=>family.packs.some(pack=>pack.size===ref.packageSize&&PRODUCT_PHOTOS.some(photo=>photo.ids.includes(ref.id)&&photo.ean===pack.ean)));
  assert.ok(refs.length>0,family.key);
  for(const ref of refs)assert.equal(extraPackageFamily(ref)?.key,family.key);
 }
});

test('unknown or contradictory stored choices stop the basket instead of silently reverting to a fixed pack',()=>{
 const unrelated=MATERIAL_PRICES.find(ref=>!extraPackageFamily(ref))!;
 for(const row of [{...automatic,packageFamily:'arbitrary'}, {...automatic,packageFamily:null}, {...automatic,packageFamily:'mapei-mapegum-wps-kg-v1'},
  {...automatic,referenceId:unrelated.id},{id:'custom',kind:'custom',name:'Knauf Super Finish',unit:'kg',quantity:29,packageFamily:KNAUF_SUPER_FINISH_FAMILY}]){
  assert.throws(()=>parseBasketExtras(saved([row])),/invalid_basket_extras/);
 }
 assert.throws(()=>extraMaterial({...automatic,referenceId:unrelated.id}),/invalid_basket_extras/);
 assert.deepEqual(parseBasketExtras(saved([fixed])),[fixed]);
});

test('automatic and fixed requirements remain separate inputs until server consolidation, without mutating other works',()=>{
 const work={jobId:'existing',materials:[{material:{id:'unknown',name:'Other model',unit:'kg'},quantity:12}]};
 const items=[automatic,{...fixed,id:'fixed',quantity:5.4}],before=JSON.stringify({work,items});
 const result=withBasketExtras([work],items);
 assert.equal(result.length,2);assert.equal(result[1].materials[0].quantity,29.000001);assert.equal(result[1].materials[0].material.packageFamily,KNAUF_SUPER_FINISH_FAMILY);
 assert.equal(result[1].materials[1].quantity,5.4);assert.equal(result[1].materials[1].material.ean,'5901793357935');
 assert.equal(JSON.stringify({work,items}),before);
});

test('backup preference validation preserves explicit package choices and rejects damaged choices',()=>{
 const locked={...fixed,id:'fixed'},raw=saved([automatic,locked]),backup={tables:{projects:[]},preferences:{'remont.basket-extras.v1':raw}} as any;
 validateBackupPreferences(backup);assert.equal(backup.preferences['remont.basket-extras.v1'],raw);
 assert.deepEqual(parseBasketExtras(backup.preferences['remont.basket-extras.v1']),[automatic,locked]);
 backup.preferences['remont.basket-extras.v1']=saved([{...automatic,packageFamily:'wrong-model'}]);
 assert.throws(()=>validateBackupPreferences(backup),/invalid_basket_extras/);
});
