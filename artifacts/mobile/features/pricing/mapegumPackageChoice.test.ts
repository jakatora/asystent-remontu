import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MAPEGUM_PACKAGE_PRODUCTS,MAPEGUM_PACKAGE_CHOICE_PREFIX,applyMapegumPackageChoices,parseMapegumPackageChoices,mapegumPackageRequirements,type MapegumPackageChoice} from './mapegumPackageChoice';
import {readMapegumPackageChoices,writeMapegumPackageChoices} from './mapegumPackageStorage';
import {readPrimerPackageChoices,writePrimerPackageChoices} from './primerPackageStorage';
import {PRIMER_PACKAGE_PRODUCTS} from './primerPackageChoice';
import {MAPEGUM_WPS_FAMILY} from '../../../../lib/pricing-service/src/reviewed-package-families';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import type {PricingStageInput} from './pricingApi';
import {calculatorEngine} from '../calculator/engine';
import {getJobById} from '../content/registry';
import {generateShoppingItems} from '../calculator/shopping';
import {buildRenovationBasket} from './renovationBasket';
import {applyShoppingContexts} from './projectShoppingInput';
import {applyMaterialStock} from './materialStock';
import type {Project,ShoppingItem} from '@/types/domain';
const ref=MAPEGUM_PACKAGE_PRODUCTS.find(r=>r.packageSize===3)!,ean=PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))!.ean!,choice:MapegumPackageChoice={from:ref.id,to:'automatic'};
const source=(quantity=6):PricingStageInput=>({jobId:'additional-materials',materials:[{material:{id:'membrane',name:ref.productLabel,category:'waterproofing',unit:'kg',ean},quantity,packs:2}]});
test('an explicit Mapegum choice sends raw kilograms, retaining the fixed default and immutable input',()=>{
  const stage=source(),before=JSON.stringify(stage),result=applyMapegumPackageChoices([stage],[choice]);assert.equal(result[0].materials[0].quantity,6);assert.equal(result[0].materials[0].material.packageFamily,MAPEGUM_WPS_FAMILY);assert.equal(result[0].materials[0].material.ean,undefined);assert.equal(result[0].materials[0].packs,undefined);assert.equal(JSON.stringify(stage),before);assert.deepEqual(applyMapegumPackageChoices([stage],[]),[stage]);assert.deepEqual(applyMapegumPackageChoices(result,[choice]),result);
});
test('only four reviewed kg identities can opt in, excluding the old 5/10 kg codes and other membranes',()=>{
  assert.equal(MAPEGUM_PACKAGE_PRODUCTS.length,4);assert.equal(mapegumPackageRequirements([source()]).length,1);
  for(const patch of [{ean:'8022452002113'},{ean:'8022452002120'},{unit:'l'},{category:'primer'},{gtin:'8022452242489'},{ean:undefined,name:'Mapelastic'}]){const base=source(),stage:PricingStageInput={...base,materials:base.materials.map(line=>({...line,material:{...line.material,...patch}}))};assert.deepEqual(applyMapegumPackageChoices([stage],[choice]),[stage]);}
  for(const bad of [{version:2,choices:[]},{version:1,choices:[{...choice,to:'other'}]},{version:1,choices:[{from:'mat-mapegum-wps-5kg',to:'automatic'}]},{version:1,choices:[choice,choice]},{version:1,choices:[{...choice,price:1}]}])assert.throws(()=>parseMapegumPackageChoices(JSON.stringify(bad)));
});
test('navigation waits for a Mapegum save and preserves prior choices after a failed write',async()=>{
  let raw:string|null=null,finish!:()=>void;const gate=new Promise<void>(r=>{finish=r;}),storage={getItem:async()=>raw,setItem:async(_key:string,value:string)=>{await gate;raw=value;}};
  const write=writeMapegumPackageChoices(storage,'room',[choice]);let done=false;const read=readMapegumPackageChoices(storage,'room').then(result=>{done=true;return result;});await Promise.resolve();assert.equal(done,false);finish();await write;assert.deepEqual(await read,[choice]);storage.setItem=async()=>{throw Error('full');};await assert.rejects(writeMapegumPackageChoices(storage,'room',[]));assert.deepEqual(await readMapegumPackageChoices(storage,'room'),[choice]);
});
test('shared persistence machinery isolates product families and project queues',async()=>{
  const data=new Map<string,string>();let finish!:()=>void;const gate=new Promise<void>(r=>{finish=r;}),storage={getItem:async(k:string)=>data.get(k)??null,setItem:async(k:string,v:string)=>{if(k.startsWith(MAPEGUM_PACKAGE_CHOICE_PREFIX))await gate;data.set(k,v);}};
  const map=writeMapegumPackageChoices(storage,'room',[choice]),primer={from:PRIMER_PACKAGE_PRODUCTS[0].id,to:'automatic' as const};await writePrimerPackageChoices(storage,'room',[primer]);assert.deepEqual(await readPrimerPackageChoices(storage,'room'),[primer]);finish();await map;assert.deepEqual(await readMapegumPackageChoices(storage,'room'),[choice]);await Promise.all([writeMapegumPackageChoices(storage,'a',[choice]),writeMapegumPackageChoices(storage,'a',[]),writeMapegumPackageChoices(storage,'b',[choice])]);assert.deepEqual(await readMapegumPackageChoices(storage,'a'),[]);assert.deepEqual(await readMapegumPackageChoices(storage,'b'),[choice]);await assert.rejects(readMapegumPackageChoices({...storage,getItem:async()=>'{broken'},'b'));
});
test('allocated exact-product stock is deducted before Mapegum families are merged across rooms',()=>{
  const calc=calculatorEngine.calculate(getJobById('wall-plastering')!,{wallArea:4,plasterThickness:10,plasterSystem:4,plasterReservePercent:10,plasterPrimerChoice:2,plasterMeshArea:0,plasterCornerCount:0});
  const projects=['a','b'].map(id=>({id,name:id,jobId:calc.jobId,jobName:'Room',categoryId:'plaster',measurements:calc.measurements,calculationResult:calc,status:'planning',createdAt:'',updatedAt:''} as Project)),items=Object.fromEntries(projects.map(p=>[p.id,[...generateShoppingItems(p.id,calc).map(row=>({...row,id:p.id+':'+row.materialId,owned:true})),{id:'extra:'+p.id,projectId:p.id,materialId:'manual-membrane',name:ref.productLabel,itemType:'material',quantity:3,unit:'kg',category:'waterproofing',owned:false,purchased:false} as ShoppingItem]]));
  const stock={a:[{materialId:'manual:extra:a',ean,name:ref.productLabel,unit:'kg' as const,quantity:1}]},choices={a:[choice],b:[choice]},before=JSON.stringify({projects,items,stock,choices}),result=buildRenovationBasket(projects,['a','b'],'standard',items,{},{},{},{},{},{},stock,{},choices);
  assert.deepEqual(result.stages.map(s=>s.materials.map(l=>({family:l.material.packageFamily,quantity:l.quantity}))),[[{family:MAPEGUM_WPS_FAMILY,quantity:2}],[{family:MAPEGUM_WPS_FAMILY,quantity:3}]]);assert.deepEqual(applyShoppingContexts(result.selectionStages,result.shoppingContexts).stages,result.stages);assert.equal(JSON.stringify({projects,items,stock,choices}),before);
});
test('a tiny positive stock remainder is retained for a real Mapegum purchase',()=>{
  const pending=applyMaterialStock(source(1),[{materialId:'membrane',ean,name:ref.productLabel,unit:'kg',quantity:0.99999999}]);const line=applyMapegumPackageChoices([pending.stage],[choice])[0].materials[0];assert.equal(line.quantity,1e-8);assert.equal(line.material.packageFamily,MAPEGUM_WPS_FAMILY);
});
