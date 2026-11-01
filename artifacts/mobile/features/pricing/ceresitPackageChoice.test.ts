import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CERESIT_PACKAGE_PRODUCTS,CERESIT_PACKAGE_CHOICE_PREFIX,parseCeresitPackageChoices,applyCeresitPackageChoices,ceresitPackageRequirements} from './ceresitPackageChoice';
import {ceresitPackageStorage} from './ceresitPackageStorage';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import type {PricingStageInput} from './pricingApi';
import {calculatorEngine} from '../calculator/engine';
import {getJobById} from '../content/registry';
import {generateShoppingItems} from '../calculator/shopping';
import {buildRenovationBasket} from './renovationBasket';
import {applyShoppingContexts} from './projectShoppingInput';
import {recoveryArchiveKey,parsePreferenceRecovery} from '../storage/preferenceRecovery';
import type {Project,ShoppingItem} from '@/types/domain';

const ref=CERESIT_PACKAGE_PRODUCTS.find(r=>r.id==='mat-primer-ceresit-ct17-profi-5l')!,transparent=CERESIT_PACKAGE_PRODUCTS.find(r=>r.id==='mat-primer-ceresit-ct17-transparent-5l')!,choice={from:ref.id,to:'automatic' as const},ean=(id:string)=>PRODUCT_PHOTOS.find(p=>p.ids.includes(id))!.ean!;
const source=():PricingStageInput=>({jobId:'additional-materials',materials:[ref,transparent].map(ref=>({material:{id:ref.id,name:ref.productLabel,ean:ean(ref.id),category:'primer',unit:'l'},quantity:6,packs:2}))});
test('only exact reviewed choices opt into their own Ceresit family, preserving raw demand and immutable fixed defaults',()=>{
  const original=source(),before=JSON.stringify(original);assert.equal(CERESIT_PACKAGE_PRODUCTS.length,4);assert.equal(ceresitPackageRequirements([original]).length,2);assert.deepEqual(applyCeresitPackageChoices([original],[]),[original]);
  const selected=applyCeresitPackageChoices([original],[choice]);assert.equal(selected[0].materials[0].quantity,6);assert.equal(selected[0].materials[0].material.packageFamily,'ceresit-ct17-profi-litres-v1');assert.equal(selected[0].materials[0].material.ean,undefined);assert.equal(selected[0].materials[0].packs,undefined);assert.deepEqual(selected[0].materials[1],original.materials[1]);assert.equal(JSON.stringify(original),before);assert.deepEqual(applyCeresitPackageChoices(selected,[choice]),selected);
  const both=applyCeresitPackageChoices([original],[choice,{from:transparent.id,to:'automatic'}]);assert.equal(both[0].materials[1].material.packageFamily,'ceresit-ct17-transparent-litres-v1');
});
test('a corrupt, foreign or price-bearing Ceresit choice cannot be silently ignored or used as a substitution',()=>{
  for(const value of [{version:2,choices:[]},{version:1,choices:[{from:'mat-primer-g-pro-1l',to:'automatic'}]},{version:1,choices:[choice,choice]},{version:1,choices:[{...choice,to:transparent.id}]},{version:1,choices:[{...choice,price:1}]},{version:1,choices:[null]},{version:1,choices:[],price:1}])assert.throws(()=>parseCeresitPackageChoices(JSON.stringify(value)));
  for(const patch of [{unit:'kg'},{unit:'ml'},{category:'paint'},{gtin:ean(transparent.id)},{ean:'8022452241123'}]){const base=source(),stage:PricingStageInput={...base,materials:base.materials.map((line,index)=>index?line:{...line,material:{...line.material,...patch}})};assert.deepEqual(applyCeresitPackageChoices([stage],[choice]),[stage]);}
});
test('mixed-family persistence keeps order, waits for saves, retains failed writes and isolates the shared basket',async()=>{
  const data=new Map<string,string>();let release!:()=>void;const gate=new Promise<void>(r=>{release=r;}),storage={getItem:async(k:string)=>data.get(k)??null,setItem:async(k:string,v:string)=>{await gate;data.set(k,v);}},choices=[{from:transparent.id,to:'automatic' as const},choice];
  const write=ceresitPackageStorage.write(storage,'a',choices);let done=false;const read=ceresitPackageStorage.read(storage,'a').then(v=>{done=true;return v;});await Promise.resolve();assert.equal(done,false);release();await write;assert.deepEqual(await read,choices);assert.deepEqual(await ceresitPackageStorage.read(storage,'renovation-basket'),[]);
  await assert.rejects(ceresitPackageStorage.write({...storage,setItem:async()=>{throw Error('full');}},'a',[]));assert.deepEqual(await ceresitPackageStorage.read(storage,'a'),choices);
});
test('exact project stock is deducted once before Ceresit pack families and cannot leak across rooms',()=>{
  const calc=calculatorEngine.calculate(getJobById('paint-walls')!,{wallArea:10,coats:2,paintCoverage:10}),projects=['a','b'].map(id=>({id,name:id,jobId:calc.jobId,jobName:'Room',categoryId:'paint',measurements:calc.measurements,calculationResult:calc,status:'planning',createdAt:'',updatedAt:''} as Project));
  const items=Object.fromEntries(projects.map(p=>[p.id,[...generateShoppingItems(p.id,calc).map(row=>({...row,id:p.id+':'+row.materialId,owned:true})),{id:'extra-'+p.id,projectId:p.id,materialId:'manual-primer',name:ref.productLabel,itemType:'material',quantity:6,unit:'l',category:'primer',owned:false,purchased:false} as ShoppingItem]]));
  const stock={a:[{materialId:'manual:extra-a',ean:ean(ref.id),name:ref.productLabel,unit:'l' as const,quantity:1}]},choices={a:[choice],b:[choice]},before=JSON.stringify({projects,items,stock,choices}),result=buildRenovationBasket(projects,['a','b'],'standard',items,{},{},{},{},{},{},stock,{},{},{},choices);
  assert.deepEqual(result.stages.map(s=>s.materials.map(l=>({family:l.material.packageFamily,quantity:l.quantity}))),[[{family:'ceresit-ct17-profi-litres-v1',quantity:5}],[{family:'ceresit-ct17-profi-litres-v1',quantity:6}]]);assert.deepEqual(applyShoppingContexts(result.selectionStages,result.shoppingContexts).stages,result.stages);assert.equal(JSON.stringify({projects,items,stock,choices}),before);
});
test('damaged choices pause reads and archive exact data before restoring fixed-size choices',async()=>{
  const key=CERESIT_PACKAGE_CHOICE_PREFIX+'a',raw='{broken',data=new Map([[key,raw]]),storage={getItem:async(k:string)=>data.get(k)??null,setItem:async(k:string,v:string)=>{data.set(k,v);}};
  await assert.rejects(ceresitPackageStorage.read(storage,'a'));const result=await ceresitPackageStorage.recover(storage,'a');assert.equal(result.reset,true);assert.deepEqual(result.value,[]);assert.equal(parsePreferenceRecovery(data.get(recoveryArchiveKey(key))!).records[0].raw,raw);
});
