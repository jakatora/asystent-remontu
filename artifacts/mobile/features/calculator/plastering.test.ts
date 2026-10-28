import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {applyProjectShopping} from '@/features/pricing/projectShoppingInput';
import {upgradeCalculation,projectShopping} from './upgrades';
import {generateShoppingItems} from './shopping';
import {PLASTER_JOB,PLASTER_MODEL,plasterQuantity,plasterInputVisible,withPlasterMeasurement} from './plastering';
import type {ShoppingItem} from '@/types/domain';

const job=getJobById(PLASTER_JOB)!;
const measures={wallArea:10,plasterThickness:15,plasterSystem:2,plasterReservePercent:10,plasterPrimerChoice:1,plasterMeshArea:2,plasterMeshChoice:1,plasterCornerCount:2,plasterCornerFit:1};
const calculate=(patch:Record<string,number>={})=>calculatorEngine.calculate(job,{...measures,...patch});
const line=(id:string,patch:Record<string,number>={})=>calculate(patch).materials.find(l=>l.material.id===id)!;

test('selected plaster product controls kg demand and whole bags independently of the price tier',()=>{
 for(const[system,kg,packs]of [[1,110,5],[2,93.5,4],[3,154,6]]){
  const calc=calculate({plasterSystem:system,plasterThickness:10,plasterMeshArea:0,plasterPrimerChoice:2});
  assert.equal(calc.quantityModel,PLASTER_MODEL);const base=calc.materials.find(l=>l.material.id==='plaster-base')!;
  assert.equal(base.rawQuantity,kg);assert.equal(base.packs,packs);
  for(const tier of ['economy','standard','better']as const){const stage=toPricingStageInput(calc,tier);assert.equal(stage.materials.find(l=>l.material.id==='plaster-base')?.quantity,kg);assert.ok(getMaterialsForJob(PLASTER_JOB,tier,calc.measurements).some(r=>resolveMaterialQuantity(r,calc)?.source.material.id==='plaster-base'));}
 }
 assert.equal(plasterQuantity('plaster-base',{...measures,plasterSystem:3,plasterThickness:8}),null);
 assert.equal(plasterQuantity('plaster-base',{...measures,plasterSystem:3,plasterThickness:26}),null);
});

test('primer uses kg of the whole5kg bucket and cannot become a generic litre or Baumit primer',()=>{
 const primer=line('plaster-primer');assert.equal(primer.material.unit,'kg');assert.equal(primer.rawQuantity,2.475);assert.equal(primer.packs,1);assert.equal(primer.cost,66.79);
 const input=toPricingStageInput(calculate()).materials.find(l=>l.material.id==='plaster-primer')!;assert.equal(input.quantity,2.475);assert.equal(input.material.ean,'4006379051014');
 assert.equal(line('plaster-primer',{plasterSystem:3}).quantityKnown,false);
 assert.equal(line('plaster-primer',{plasterPrimerChoice:0}).quantityKnown,false);
 assert.equal(line('plaster-primer',{plasterPrimerChoice:2}).rawQuantity,0);
});

test('reinforcement uses the measured area with one overlap allowance and the required minimum15mm plaster',()=>{
 assert.equal(line('plaster-mesh').rawQuantity,2.2);assert.equal(line('plaster-mesh').quantity,50);assert.equal(line('plaster-mesh').packs,1);assert.equal(line('plaster-mesh').cost,227);
 assert.equal(line('plaster-mesh',{plasterReservePercent:30}).rawQuantity,2.2);
 const invalid:Record<string,number>[]=[{plasterMeshArea:11},{plasterMeshChoice:0},{plasterSystem:3},{plasterThickness:10}];
 for(const patch of invalid)assert.equal(line('plaster-mesh',patch).quantityKnown,false);
 assert.equal(line('plaster-base',{plasterThickness:10}).quantityKnown,false);
 assert.equal(line('plaster-base').rawQuantity,140.25);
});

test('corner shopping requires measured whole stock lengths and a compatible profile, never the wall perimeter',()=>{
 assert.equal(line('plaster-corner').rawQuantity,5);assert.equal(line('plaster-corner').packs,2);
 assert.equal(line('plaster-corner',{plasterCornerCount:1.5}).quantityKnown,false);
 assert.equal(line('plaster-corner',{plasterCornerFit:0}).quantityKnown,false);
 assert.equal(line('plaster-corner',{wallArea:80}).rawQuantity,5);
});

test('tile finish requires at least10mm gypsum plaster independently of the normal8mm minimum',()=>{
 assert.equal(line('plaster-base',{plasterFinish:0,plasterMeshArea:0,plasterThickness:8}).quantityKnown,true);
 assert.equal(line('plaster-base',{plasterFinish:1,plasterMeshArea:0,plasterThickness:8}).quantityKnown,false);
 assert.equal(line('plaster-base',{plasterFinish:1,plasterMeshArea:0,plasterThickness:10}).quantityKnown,true);
 assert.equal(line('plaster-base',{plasterFinish:1,plasterThickness:10}).quantityKnown,false);
});

test('missing choices remain visible, while explicit zeros remove only the purchases the user has covered',()=>{
 const missing=calculatorEngine.calculate(job,{wallArea:10,plasterThickness:10});assert.ok(missing.materials.every(l=>l.quantityKnown===false));
 assert.equal(toPricingStageInput(missing).materials.length,4);assert.ok(toPricingStageInput(missing).materials.every(l=>l.material.unit==='pozycja'));
 const explicit=calculate({plasterSystem:3,plasterThickness:10,plasterPrimerChoice:2,plasterMeshArea:0,plasterCornerCount:0});
 assert.deepEqual(toPricingStageInput(explicit).materials.map(l=>l.material.id),['plaster-base']);
});

test('historical litre and estimated-perimeter snapshots require review without rewriting saved JSON',()=>{
 const old=JSON.parse(JSON.stringify(calculate()));delete old.quantityModel;old.materials.find((l:any)=>l.material.id==='plaster-primer').material.unit='litr';
 const before=JSON.stringify(old),reviewed=upgradeCalculation(old)!;assert.ok(reviewed.materials.every(l=>l.quantityKnown===false));assert.equal(JSON.stringify(old),before);
 const owned=generateShoppingItems('a',calculate()).map((item,i)=>({...item,id:'owned-'+i,owned:true,purchased:true}));
 assert.ok(projectShopping(owned,old).every(l=>!l.owned&&!l.purchased&&l.needsQuantityConfirmation));
 assert.ok(toPricingStageInput(old).materials.every(l=>l.material.unit==='pozycja'));
});

test('new bucket identity cannot borrow ownership of an old generic litre product',()=>{
 const calc=calculate(),stage=toPricingStageInput(calc),item={id:'old',projectId:'a',materialId:'plaster-primer',name:'Grunt / kontakt pod tynk',unit:'litr',quantity:5,itemType:'material',owned:true,purchased:false}as ShoppingItem;
 assert.equal(applyProjectShopping(stage,calc,'a',[item]).excludedMaterials,0);
 const same={...item,name:line('plaster-primer').material.name,unit:'kg',quantity:5};
 assert.equal(applyProjectShopping(stage,calc,'a',[same]).excludedMaterials,1);
});

test('changing plaster system resets previous compatibility choices; same selection and other jobs are preserved',()=>{
 const current={plasterSystem:'2',plasterPrimerChoice:'1',plasterMeshChoice:'1',plasterCornerFit:'1'};
 assert.deepEqual(withPlasterMeasurement(PLASTER_JOB,current,'plasterSystem',3),{plasterSystem:'3',plasterPrimerChoice:'0',plasterMeshChoice:'0',plasterCornerFit:'0'});
 assert.deepEqual(withPlasterMeasurement(PLASTER_JOB,current,'plasterSystem',2),current);
 assert.equal(withPlasterMeasurement('paint-walls',current,'plasterSystem',3).plasterPrimerChoice,'1');
 assert.equal(plasterInputVisible(PLASTER_JOB,'plasterMeshChoice',{plasterMeshArea:'0'}),false);assert.equal(plasterInputVisible(PLASTER_JOB,'plasterCornerFit',{plasterCornerCount:'0'}),false);
 assert.equal(plasterInputVisible(PLASTER_JOB,'plasterMeshChoice',{}),true);
});
