import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine, computeRawQuantity} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {upgradeCalculation, upgradeProject, projectShopping} from './upgrades';
import {generateShoppingItems} from './shopping';
import {parseMeasurements} from '@/shared/lib/measurements';
import {WINDOW_MODEL, windowQuantity, windowInputVisible, windowInputHint, withWindowMeasurement} from './windowSealing';
import type {CalculationResult, Project} from '@/types/domain';

const job = getJobById('window-sealing')!;
const acrylic = {windowRepair:2, perimeter:12, windowJointSize:5, windowMaskingRolls:1, windowFit:1, windowPreparation:1};
const membrane = {windowRepair:3, perimeter:12, windowTapeJoints:2, windowTapeExtraMetres:0.5, windowFoamCans:2, windowFoamProduct:1, windowFit:1, windowPreparation:1};
const calc = (m:Record<string,number>) => calculatorEngine.calculate(job,m);
const row = (c:CalculationResult,id:string) => c.materials.find(l=>l.material.id===id)!;

test('window acrylic uses square-joint volume, current exact EAN and one physical 50m masking roll',()=>{
  const c=calc(acrylic),api=toPricingStageInput(c),detailed=calculatorEngine.calculateDetailed(job,acrylic);
  assert.equal(c.quantityModel,WINDOW_MODEL);assert.equal(detailed.quantityModel,WINDOW_MODEL);assert.deepEqual(c.quantityIssues,[]);
  assert.equal(detailed.materials.find(l=>l.material.id==='silicone-window')!.wasteQuantity,30);
  assert.equal(row(c,'silicone-window').rawQuantity,330);assert.equal(row(c,'silicone-window').quantity,560);assert.equal(row(c,'silicone-window').packs,2);
  assert.equal(api.materials.length,2);assert.equal(api.materials.find(l=>l.material.id==='silicone-window')!.quantity,330);
  assert.equal(api.materials.find(l=>l.material.id==='silicone-window')!.material.ean,'5411183157538');
  assert.equal(api.materials.find(l=>l.material.id==='window-masking-tape')!.quantity,50);
  for(const line of c.materials)assert.equal(computeRawQuantity(line.material,acrylic),line.rawQuantity);
  for(const tier of ['economy','standard','better']as const)assert.deepEqual(getMaterialsForJob(job.id,tier,acrylic).map(r=>r.id),['mat-acrylic-soudal-white-280ml','mat-masking-tape-bluedolphin-30mm']);
  assert.ok(!JSON.stringify(detailed).includes('8 mb'));assert.ok(!JSON.stringify(detailed).includes('silikon do okien'));
  assert.equal(toPricingStageInput(calc({...acrylic,windowMaskingRolls:0})).materials.length,1);
});

test('SWS Inside uses measured length, 3cm for each join, extra slack and reserve; foam cans remain separate',()=>{
  const c=calc(membrane),api=toPricingStageInput(c);assert.deepEqual(c.quantityIssues,[]);
  assert.equal(row(c,'window-tape').rawQuantity,13.816);assert.equal(row(c,'window-tape').quantity,30);assert.equal(row(c,'window-tape').packs,1);
  assert.equal(row(c,'mounting-foam').rawQuantity,1500);assert.equal(row(c,'mounting-foam').packs,2);
  const detailed=calculatorEngine.calculateDetailed(job,membrane);assert.equal(detailed.materials.find(l=>l.material.id==='window-tape')!.wasteQuantity,1.3);assert.equal(detailed.materials.find(l=>l.material.id==='mounting-foam')!.wasteQuantity,0);
  assert.equal(api.materials.length,2);assert.equal(api.materials.find(l=>l.material.id==='window-tape')!.material.ean,'5411183151178');
  assert.equal(api.materials.find(l=>l.material.id==='mounting-foam')!.quantity,1500);
  for(const line of c.materials)assert.equal(computeRawQuantity(line.material,membrane),line.rawQuantity);
  for(const tier of ['economy','standard','better']as const)assert.deepEqual(getMaterialsForJob(job.id,tier,membrane).map(r=>r.id),['mat-foam-soudal-lowexp-750ml','mat-window-tape-soudal-sws-inside-90mm']);
  assert.equal(windowQuantity('window-tape',{...membrane,perimeter:29.97,windowTapeJoints:1,windowTapeExtraMetres:0,windowReservePercent:0}),30);
  assert.equal(windowQuantity('window-tape',{...membrane,perimeter:2,windowTapeJoints:0,windowTapeExtraMetres:0,windowReservePercent:0}),2);
  assert.equal(toPricingStageInput(calc({...membrane,windowFoamCans:0})).materials.length,1);
});

test('missing fit, quantities, preparation or unsupported geometry cannot become a complete free kit',()=>{
  const bare=calc({perimeter:12});assert.equal(bare.quantityIssues!.length,6);
  assert.equal(toPricingStageInput(bare).materials.length,6);assert.ok(toPricingStageInput(bare).materials.every(l=>l.material.unit==='pozycja'));
  for(const size of [0,4.99,20.01,NaN,Infinity])assert.equal(windowQuantity('silicone-window',{...acrylic,windowJointSize:size}),null);
  for(const length of [0,-1,201,NaN])assert.equal(windowQuantity('window-tape',{...membrane,perimeter:length}),null);
  for(const patch of [{windowTapeJoints:-1},{windowTapeJoints:1.5},{windowTapeExtraMetres:NaN},{windowTapeExtraMetres:-1},{windowReservePercent:31},{windowFit:0}] as Record<string,number>[])assert.equal(windowQuantity('window-tape',{...membrane,...patch}),null);
  for(const count of [-1,0.1,101,NaN])assert.equal(windowQuantity('mounting-foam',{...membrane,windowFoamCans:count}),null);
  assert.equal(windowQuantity('window-preparation',{...acrylic,windowPreparation:0}),null);
  const unknown=toPricingStageInput(calc({...acrylic,windowPreparation:0}));assert.equal(unknown.materials.filter(l=>l.material.unit==='pozycja').length,1);
  assert.equal(windowQuantity('silicone-window',{...acrylic,windowRepair:4}),null);
});

test('a sash gasket needs individual fit and complete owned quantity; it never inherits SWS or foam purchases',()=>{
  const m={windowRepair:1,windowFit:1,windowGasketMetres:8,windowGasketOwned:0,windowPreparation:1};
  const c=calc(m),api=toPricingStageInput(c);assert.deepEqual(c.quantityIssues,['Uszczelka skrzydła — dopasuj profil i potrzebną długość']);
  assert.equal(api.materials.length,1);assert.equal(api.materials[0].material.unit,'pozycja');assert.equal(getMaterialsForJob(job.id,'standard',m).length,0);
  assert.equal(windowQuantity('window-gasket',{...m,windowGasketOwned:1}),0);
  assert.equal(windowQuantity('window-gasket',{...m,windowGasketOwned:1,windowGasketMetres:0}),null);
  assert.equal(windowQuantity('window-gasket',{...m,windowGasketOwned:1,windowFit:0}),null);
  assert.equal(toPricingStageInput(calc({...m,windowGasketOwned:1})).materials.length,0);
});

test('saved window snapshots retain raw physical demand and reject another pack, EAN, unit or unselected model',()=>{
  const c=calc(membrane),before=JSON.stringify(c),saved=JSON.parse(before)as CalculationResult;
  for(const line of saved.materials)delete (line as {rawQuantity?:number}).rawQuantity;
  const ref=MATERIAL_PRICES.find(r=>r.id==='mat-window-tape-soudal-sws-inside-90mm')!;
  assert.equal(resolveMaterialQuantity(ref,saved)!.quantity,13.816);
  assert.equal(resolveMaterialQuantity({...ref,packageSize:25},saved),null);
  const bad=JSON.parse(before)as CalculationResult;Object.assign(row(bad,'window-tape').material,{ean:'5411183151179'});assert.equal(resolveMaterialQuantity(ref,bad),null);
  Object.assign(row(bad,'window-tape').material,{ean:'5411183151178',unit:'szt'});assert.equal(resolveMaterialQuantity(ref,bad),null);
  assert.equal(resolveMaterialQuantity(ref,{...c,quantityModel:undefined}),null);
  assert.equal(resolveMaterialQuantity(ref,calc(acrylic)),null);assert.equal(JSON.stringify(c),before);
});

test('old mixed window JSON is reviewed read-only and old generic owned rows cannot hide necessary purchases',()=>{
  const current=calc(membrane),old=JSON.parse(JSON.stringify({...current,quantityModel:undefined,materials:current.materials.slice(0,4).map(l=>({...l,quantityKnown:undefined}))}))as CalculationResult;
  Object.assign(row(old,'window-tape').material,{name:'Taśma rozprężna (Pro Clima lub podobna)',unit:'m'});
  const before=JSON.stringify(old),reviewed=upgradeCalculation(old)!;assert.equal(JSON.stringify(old),before);assert.equal(reviewed.materials.length,6);assert.ok(reviewed.materials.every(l=>l.quantityKnown===false));
  assert.equal(toPricingStageInput(old).materials.filter(l=>l.material.unit==='pozycja').length,6);
  const p={jobId:job.id,calculationResult:old}as Project;assert.equal(upgradeProject(p).calculationResult!.materials.length,6);assert.equal(JSON.stringify(old),before);
  const owned=generateShoppingItems('qa-window',current).map((item,i)=>({...item,id:'qa-'+i,owned:true,purchased:true}));
  const historical=projectShopping(owned,old);assert.ok(historical.every(i=>!i.owned&&!i.purchased&&i.needsQuantityConfirmation));
  const dirty=owned.map(i=>({...i,needsQuantityConfirmation:true}));assert.ok(projectShopping(dirty,current).every(i=>!i.owned&&!i.purchased));
  const tooSmall=owned.map(i=>({...i,quantity:0.01,customQuantity:0.01}));assert.ok(projectShopping(tooSmall,current).every(i=>!i.owned&&!i.purchased));
});

test('wizard parsing and editing discard hidden stale sibling inputs while preserving the existing perimeter ID',()=>{
  assert.equal(job.measurementInputs.filter(i=>i.id==='perimeter').length,1);assert.ok(job.materials.every(m=>!('formula'in m)));
  const fields=Object.fromEntries(Object.entries(acrylic).map(([k,v])=>[k,String(v)]));
  const parsed=parseMeasurements(job,{...fields,windowFoamCans:'bad',windowTapeJoints:'0',windowGasketMetres:'bad'});
  assert.deepEqual(parsed.errors,[]);assert.equal(parsed.values.perimeter,12);assert.equal(parsed.values.windowFoamCans,undefined);
  const gasket=parseMeasurements(job,{windowRepair:'1',windowGasketMetres:'8,5',perimeter:'bad',windowJointSize:'1'});
  assert.deepEqual(gasket.errors,[]);assert.equal(gasket.values.windowGasketMetres,8.5);assert.equal(gasket.values.perimeter,undefined);
  assert.equal(windowInputVisible(job.id,'windowFoamCans',{windowRepair:'2'}),false);assert.equal(windowInputVisible(job.id,'windowFoamCans',{windowRepair:'3'}),true);
  assert.equal(windowInputVisible(job.id,'perimeter',{windowRepair:'0'}),false);assert.equal(windowInputVisible('paint-walls','perimeter',{}),true);
  assert.ok(windowInputHint(job.id,'windowFit',{windowRepair:2})!.includes('7,5%'));assert.ok(windowInputHint(job.id,'windowFit',{windowRepair:3})!.includes('90 mm'));
  assert.equal(parseMeasurements(job,{...fields,windowJointSize:'4'}).errors[0].id,'windowJointSize');
  assert.equal(parseMeasurements(job,{windowRepair:'3',windowTapeJoints:'1.5'}).errors[0].id,'windowTapeJoints');
});

test('switching a window repair clears fit and preparation confirmations before its sibling can be quoted',()=>{
  const current=Object.fromEntries(Object.entries({...acrylic,...membrane,windowRepair:2}).map(([k,v])=>[k,String(v)])),before=JSON.stringify(current);
  const changed=withWindowMeasurement(job.id,current,'windowRepair',3);
  assert.equal(changed.windowFit,'0');assert.equal(changed.windowPreparation,'0');assert.equal(JSON.stringify(current),before);
  const parsed=parseMeasurements(job,changed);assert.deepEqual(parsed.errors,[]);
  const c=calc(parsed.values);assert.equal(row(c,'window-tape').quantityKnown,false);assert.equal(row(c,'mounting-foam').quantityKnown,false);assert.equal(row(c,'window-preparation').quantityKnown,false);
  const same=withWindowMeasurement(job.id,current,'windowRepair',2);assert.equal(same.windowFit,'1');assert.equal(same.windowPreparation,'1');
  assert.equal(withWindowMeasurement('paint-walls',current,'windowRepair',3).windowFit,'1');
  const partial=withWindowMeasurement(job.id,changed,'windowFit',1);assert.equal(partial.windowPreparation,'0');
  assert.equal(windowQuantity('window-preparation',parseMeasurements(job,partial).values),null);
});

test('an explicit warm-weather Tytan choice keeps its EAN and cannot inherit Soudal can counts or owned statuses',()=>{
  const m={...membrane,windowFoamProduct:2},c=calc(m),input=toPricingStageInput(c,'better');
  const foam=input.materials.find(l=>l.material.id==='mounting-foam')!;assert.equal(foam.material.ean,'5903518052859');assert.equal(foam.quantity,1500);
  assert.match(row(c,'mounting-foam').material.notes!,/\+5 do \+30°C/);
  const soudal=MATERIAL_PRICES.find(r=>r.id==='mat-foam-soudal-lowexp-750ml')!,tytan=MATERIAL_PRICES.find(r=>r.id==='mat-foam-tytan-pro65-750ml')!;
  assert.equal(resolveMaterialQuantity(soudal,c),null);assert.equal(resolveMaterialQuantity(tytan,c)!.quantity,1500);
  assert.equal(windowQuantity('mounting-foam',{...m,windowFoamProduct:0}),null);
  assert.equal(windowQuantity('mounting-foam',{...m,windowFoamProduct:99}),null);
  assert.equal(windowQuantity('mounting-foam',{...m,windowFoamCans:0,windowFoamProduct:0}),0);
  for(const tier of ['economy','standard','better']as const)assert.ok(getMaterialsForJob(job.id,tier,m).some(r=>r.id===tytan.id));
  const previous=Object.fromEntries(Object.entries(membrane).map(([k,v])=>[k,String(v)])),next=withWindowMeasurement(job.id,previous,'windowFoamProduct',2);
  assert.equal(next.windowFoamCans,undefined);assert.equal(next.windowFit,'0');assert.equal(next.windowPreparation,'0');
  assert.equal(windowInputVisible(job.id,'windowFoamProduct',next),true);assert.equal(windowInputVisible(job.id,'windowFoamProduct',{...next,windowFoamCans:'0'}),false);
  const old={...calc(membrane),quantityModel:'window-repair-v1'};assert.ok(upgradeCalculation(old)!.materials.every(l=>l.quantityKnown===false));
  const oldItems=generateShoppingItems('old',calc(membrane)).map((i,n)=>({...i,id:String(n),owned:true,purchased:true}));
  const reviewed=projectShopping(oldItems,c);assert.equal(reviewed.find(i=>i.materialId==='mounting-foam')!.owned,false);
});
