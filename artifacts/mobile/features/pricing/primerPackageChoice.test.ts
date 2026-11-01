import assert from 'node:assert/strict';
import {test} from 'node:test';
import {applyPrimerPackageChoices,parsePrimerPackageChoices,primerPackageRequirements,PRIMER_PACKAGE_PRODUCTS,type PrimerPackageChoice} from './primerPackageChoice';
import {readPrimerPackageChoices,writePrimerPackageChoices} from './primerPackageStorage';
import {PRIMER_G_PRO_FAMILY} from '../../../../lib/pricing-service/src/reviewed-package-families';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import type {PricingStageInput} from './pricingApi';
import {calculatorEngine} from '../calculator/engine';
import {getJobById} from '../content/registry';
import {generateShoppingItems} from '../calculator/shopping';
import {buildRenovationBasket} from './renovationBasket';
import {applyShoppingContexts} from './projectShoppingInput';
import {applyMaterialStock} from './materialStock';
import type {Project,ShoppingItem} from '@/types/domain';

const ref=PRIMER_PACKAGE_PRODUCTS.find(r=>r.packageSize===1)!,ean=PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))!.ean!;
const choice:PrimerPackageChoice={from:ref.id,to:'automatic'};
const source=(quantity=6):PricingStageInput=>({jobId:'additional-materials',materials:[{material:{id:'primer',name:ref.productLabel,category:'primer',unit:'l',ean},quantity,packs:6}]});

test('an explicit choice sends raw litres as a reviewed family, without a guessed barcode or old pack count',()=>{
  const stage=source(),before=JSON.stringify(stage),result=applyPrimerPackageChoices([stage],[choice]);
  assert.equal(result[0].materials[0].quantity,6);assert.equal(result[0].materials[0].material.packageFamily,PRIMER_G_PRO_FAMILY);assert.equal(result[0].materials[0].material.ean,undefined);assert.equal(result[0].materials[0].packs,undefined);assert.equal(JSON.stringify(stage),before);
  assert.deepEqual(applyPrimerPackageChoices([stage],[]),[stage]);assert.deepEqual(applyPrimerPackageChoices(result,[choice]),result);
});

test('only the four reviewed litre identities can opt in; wrong brand, unit, barcode or contradictory codes stay fixed',()=>{
  assert.equal(PRIMER_PACKAGE_PRODUCTS.length,4);assert.equal(primerPackageRequirements([source()]).length,1);
  for(const patch of [{ean:'8022452002564'},{unit:'kg'},{category:'waterproofing'},{gtin:'8022452241130'},{ean:undefined,name:'Primer G'}]){const base=source(),stage:PricingStageInput={...base,materials:base.materials.map(line=>({...line,material:{...line.material,...patch}}))};assert.deepEqual(applyPrimerPackageChoices([stage],[choice]),[stage]);}
  for(const bad of [{version:2,choices:[]},{version:1,choices:[{...choice,to:'other'}]},{version:1,choices:[{from:'arbitrary',to:'automatic'}]},{version:1,choices:[choice,choice]},{version:1,choices:[{...choice,price:1}]}])assert.throws(()=>parsePrimerPackageChoices(JSON.stringify(bad)));
});

test('navigation reads wait for a durable choice write and a failed write preserves the previous setting',async()=>{
  let raw:string|null=null,finish!:()=>void;const gate=new Promise<void>(r=>{finish=r;}),storage={getItem:async()=>raw,setItem:async(_key:string,value:string)=>{await gate;raw=value;}};
  const write=writePrimerPackageChoices(storage,'room',[choice]);let readDone=false;const read=readPrimerPackageChoices(storage,'room').then(value=>{readDone=true;return value;});await Promise.resolve();assert.equal(readDone,false);finish();await write;assert.deepEqual(await read,[choice]);
  storage.setItem=async()=>{throw Error('full');};await assert.rejects(writePrimerPackageChoices(storage,'room',[]));assert.deepEqual(await readPrimerPackageChoices(storage,'room'),[choice]);
});

test('queued writes retain project isolation, and corrupt choices do not turn into a fixed-pack fallback',async()=>{
  const data=new Map<string,string>(),storage={getItem:async(key:string)=>data.get(key)??null,setItem:async(key:string,value:string)=>{data.set(key,value);}};
  await Promise.all([writePrimerPackageChoices(storage,'a',[choice]),writePrimerPackageChoices(storage,'a',[]),writePrimerPackageChoices(storage,'b',[choice])]);assert.deepEqual(await readPrimerPackageChoices(storage,'a'),[]);assert.deepEqual(await readPrimerPackageChoices(storage,'b'),[choice]);
  const broken={...storage,getItem:async()=>'{broken'};await assert.rejects(readPrimerPackageChoices(broken,'b'));
});

test('owned materials and allocated exact-product stock are deducted before family selection in two rooms',()=>{
  const calc=calculatorEngine.calculate(getJobById('wall-plastering')!,{wallArea:4,plasterThickness:10,plasterSystem:4,plasterReservePercent:10,plasterPrimerChoice:2,plasterMeshArea:0,plasterCornerCount:0});
  const projects=['a','b'].map(id=>({id,name:id,jobId:calc.jobId,jobName:'Room',categoryId:'plaster',measurements:calc.measurements,calculationResult:calc,status:'planning',createdAt:'',updatedAt:''} as Project));
  const items=Object.fromEntries(projects.map(p=>[p.id,[...generateShoppingItems(p.id,calc).map(row=>({...row,id:p.id+':'+row.materialId,owned:true})),{id:'extra:'+p.id,projectId:p.id,materialId:'manual-primer',name:ref.productLabel,itemType:'material',quantity:3,unit:'l',category:'primer',owned:false,purchased:false} as ShoppingItem]]));
  const stock={a:[{materialId:'manual:extra:a',ean,name:ref.productLabel,unit:'l' as const,quantity:1}]},choices={a:[choice],b:[choice]},before=JSON.stringify({projects,items,stock,choices});
  const result=buildRenovationBasket(projects,['a','b'],'standard',items,{},{},{},{},{},{},stock,choices);
  assert.deepEqual(result.stages.map(s=>s.materials.map(l=>({family:l.material.packageFamily,quantity:l.quantity}))),[[{family:PRIMER_G_PRO_FAMILY,quantity:2}],[{family:PRIMER_G_PRO_FAMILY,quantity:3}]]);
  assert.deepEqual(applyShoppingContexts(result.selectionStages,result.shoppingContexts).stages,result.stages);assert.equal(result.excludedMaterials,2);assert.equal(JSON.stringify({projects,items,stock,choices}),before);
});

test('a positive stock remainder is preserved when switching the pending litres to a package family',()=>{
  const before=source(1),pending=applyMaterialStock(before,[{materialId:'primer',ean,name:ref.productLabel,unit:'l',quantity:0.99999999}]);
  const line=applyPrimerPackageChoices([pending.stage],[choice])[0].materials[0];assert.equal(line.quantity,1e-8);assert.equal(line.material.packageFamily,PRIMER_G_PRO_FAMILY);
});
