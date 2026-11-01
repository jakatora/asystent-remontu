import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MAPEGUM_PRODUCT_PAIRS,MAPEGUM_PRODUCT_CHOICE_PREFIX,mapegumProductReference,mapegumProductEan,parseMapegumProductChoices,mapegumProductRequirements,applyMapegumProductChoices} from './mapegumProductChoice';
import {applyMapegumPackageChoices,mapegumPackageRequirements,parseMapegumPackageChoices} from './mapegumPackageChoice';
import {mapegumProductStorage} from './mapegumProductStorage';
import {recoveryArchiveKey,parsePreferenceRecovery} from '../storage/preferenceRecovery';
import {calculatorEngine} from '../calculator/engine';
import {getJobById} from '../content/registry';
import {generateShoppingItems} from '../calculator/shopping';
import {toPricingStageInput,type PricingStageInput} from './pricingApi';
import {applyProjectShopping,applyShoppingContexts} from './projectShoppingInput';
import {reviewSelectedShopping} from './selectedShopping';
import {buildRenovationBasket} from './renovationBasket';
import type {Project} from '@/types/domain';

const choice=MAPEGUM_PRODUCT_PAIRS[0],from=mapegumProductReference(choice.from)!,to=mapegumProductReference(choice.to)!;
const source=():PricingStageInput=>({jobId:'bathroom-waterproofing',materials:[{material:{id:'membrane',name:from.productLabel,category:'waterproofing',unit:'kg',ean:mapegumProductEan(from.id)},quantity:22.44,packs:5}]});
function fixture(id='a'){
  const calc=calculatorEngine.calculate(getJobById('bathroom-waterproofing')!,{wallArea:12,floorArea:5,perimeter:15,hydroSystem:1,hydroSubstrate:1,hydroPrimerPack:1,hydroTapeOverlaps:0,hydroInsideCorners:4,hydroOutsideCorners:0,hydroWallCollars:0,hydroFloorCollars:0});
  const original=toPricingStageInput(calc),selected=applyMapegumProductChoices([original],[choice])[0];
  const item={...generateShoppingItems(id,calc).find(row=>row.materialId==='membrane')!,id:'shopping-'+id,owned:true,customPrice:123};
  const project:Project={id,name:id,jobId:calc.jobId,jobName:'Hydroizolacja',categoryId:'bathroom',measurements:calc.measurements,calculationResult:calc,status:'planning',createdAt:'',updatedAt:''};
  return{calc,original,selected,item,project};
}
test('a current Mapegum SKU requires an explicit exact same-size pair and never aliases legacy EANs into a package family',()=>{
  assert.deepEqual(parseMapegumProductChoices(null),[]);
  assert.deepEqual(parseMapegumProductChoices(JSON.stringify({version:1,choices:MAPEGUM_PRODUCT_PAIRS})),MAPEGUM_PRODUCT_PAIRS);
  for(const bad of [{version:2,choices:[]},{version:1,choices:[{...choice,to:MAPEGUM_PRODUCT_PAIRS[1].to}]},{version:1,choices:[{...choice,to:'automatic'}]},{version:1,choices:[choice,choice]},{version:1,choices:[{...choice,price:1}]},{version:1,choices:[null]},{version:1,choices:[],price:1}])assert.throws(()=>parseMapegumProductChoices(JSON.stringify(bad)));
  assert.throws(()=>parseMapegumPackageChoices(JSON.stringify({version:1,choices:[{from:choice.from,to:'automatic'}]})));
  assert.equal(mapegumPackageRequirements([source()]).length,0);
});
test('explicit SKU selection keeps raw demand, stable IDs and other materials, removes stale pack counts, and is immutable/idempotent',()=>{
  const {original}=fixture(),before=JSON.stringify(original),selected=applyMapegumProductChoices([original],[choice]);
  assert.deepEqual(applyMapegumProductChoices([original],[]),[original]);
  const line=selected[0].materials.find(row=>row.material.id==='membrane')!;
  assert.equal(line.quantity,22.44);assert.equal(line.material.id,'membrane');assert.equal(line.material.ean,'8022452242489');assert.equal(line.material.name,to.productLabel);assert.equal(line.packs,undefined);
  assert.deepEqual(selected[0].materials.filter(row=>row.material.id!=='membrane'),original.materials.filter(row=>row.material.id!=='membrane'));
  assert.equal(JSON.stringify(original),before);assert.deepEqual(applyMapegumProductChoices(selected,[choice]),selected);
  const automatic=applyMapegumPackageChoices(selected,[{from:choice.to,to:'automatic'}])[0].materials.find(row=>row.material.id==='membrane')!;
  assert.equal(automatic.quantity,22.44);assert.equal(automatic.material.packageFamily,'mapei-mapegum-wps-kg-v1');assert.equal(automatic.material.ean,undefined);
});
test('wrong units, categories, competing codes and other products cannot inherit this selection',()=>{
  assert.equal(mapegumProductRequirements([source()]).length,1);
  for(const patch of [{unit:'l'},{category:'primer'},{gtin:'8022452242489'},{ean:'8022452242489'},{packageFamily:'mapei-mapegum-wps-kg-v1' as const},{ean:undefined,name:'Inna folia'}]){
    const base=source(),stage:PricingStageInput={...base,materials:base.materials.map(line=>({...line,material:{...line.material,...patch}}))};
    assert.deepEqual(mapegumProductRequirements([stage]),[]);assert.deepEqual(applyMapegumProductChoices([stage],[choice]),[stage]);
  }
});
test('old ownership, purchased status, custom prices and partial stock never transfer to a newly selected SKU',()=>{
  const {calc,original,selected,item}=fixture(),before=JSON.stringify({calc,item});
  for(const purchased of [true,false]){
    const view=reviewSelectedShopping([{...item,owned:!purchased,purchased}],original,selected)[0];
    assert.equal(view.owned,false);assert.equal(view.purchased,false);assert.equal(view.customPrice,undefined);assert.equal(view.selectedProductChanged,true);
    const stock={materialId:'membrane',ean:mapegumProductEan(from.id)!,name:from.productLabel,unit:'kg' as const,quantity:20};
    const pending=applyProjectShopping(selected,calc,'a',[view],original,[stock]);
    assert.equal(pending.excludedMaterials,0);assert.equal(pending.stage.materials.find(row=>row.material.id==='membrane')!.quantity,22.44);assert.equal(pending.stockAdjustments.length,0);
    const exact=applyProjectShopping(selected,calc,'a',[view],original,[{...stock,ean:mapegumProductEan(to.id)!,name:to.productLabel}]);
    assert.equal(exact.stage.materials.find(row=>row.material.id==='membrane')!.quantity,2.44);
  }
  assert.equal(JSON.stringify({calc,item}),before);
});
test('the whole basket inherits only the selected project SKU and a common override keeps source projects unchanged',()=>{
  const a=fixture('a'),b=fixture('b'),projects=[a.project,b.project],before=JSON.stringify(projects);
  const inherited=buildRenovationBasket(projects,['a','b'],'standard',{},{},{},{},{},{},{},{},{},{},{a:[choice]});
  assert.deepEqual(inherited.selectionStages.map(stage=>stage.materials.find(row=>row.material.id==='membrane')!.material.ean),['8022452242489','8022452002113']);
  assert.deepEqual(applyShoppingContexts(inherited.selectionStages,inherited.shoppingContexts).stages,inherited.stages);
  const common=applyShoppingContexts(applyMapegumProductChoices(inherited.selectionStages,[choice]),inherited.shoppingContexts);
  assert.deepEqual(common.stages.map(stage=>stage.materials.find(row=>row.material.id==='membrane')!.material.ean),['8022452242489','8022452242489']);assert.equal(JSON.stringify(projects),before);
});
test('reads wait for confirmed SKU writes, failed writes preserve the previous choice, and project/global scopes are isolated',async()=>{
  const values=new Map<string,string>();let release!:()=>void;const gate=new Promise<void>(r=>{release=r;}),storage={getItem:async(k:string)=>values.get(k)??null,setItem:async(k:string,v:string)=>{await gate;values.set(k,v);}};
  const write=mapegumProductStorage.write(storage,'a',[choice]);let finished=false;const read=mapegumProductStorage.read(storage,'a').then(value=>{finished=true;return value;});await Promise.resolve();assert.equal(finished,false);release();await write;assert.deepEqual(await read,[choice]);
  assert.deepEqual(await mapegumProductStorage.read(storage,'renovation-basket'),[]);
  const broken={...storage,setItem:async()=>{throw Error('full');}};await assert.rejects(mapegumProductStorage.write(broken,'a',[]));assert.deepEqual(await mapegumProductStorage.read(storage,'a'),[choice]);
});
test('corrupt choices pause reads and recovery preserves exact damaged contents before restoring the original product',async()=>{
  const key=MAPEGUM_PRODUCT_CHOICE_PREFIX+'a',raw='{broken',values=new Map([[key,raw]]),storage={getItem:async(k:string)=>values.get(k)??null,setItem:async(k:string,v:string)=>{values.set(k,v);}};
  await assert.rejects(mapegumProductStorage.read(storage,'a'));const recovered=await mapegumProductStorage.recover(storage,'a');assert.deepEqual(recovered,{value:[],reset:true});assert.equal(parsePreferenceRecovery(values.get(recoveryArchiveKey(key))!).records[0].raw,raw);assert.deepEqual(await mapegumProductStorage.read(storage,'a'),[]);
  values.set(key,raw);const denied={...storage,setItem:async()=>{throw Error('full');}};await assert.rejects(mapegumProductStorage.recover(denied,'a'));assert.equal(values.get(key),raw);
});
