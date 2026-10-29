import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {applyProjectShopping} from '@/features/pricing/projectShoppingInput';
import {upgradeCalculation,projectShopping} from './upgrades';
import {parseMeasurements} from '@/shared/lib/measurements';
import {generateAllShoppingItems} from './shopping';
import {SEAT_JOB,SEAT_MODEL,seatQuantity,withSeatMeasurement} from './toiletSeatReplacement';
import type {ShoppingItem} from '@/types/domain';

const confirmed={seatCount:2,seatVariant:2,seatFit:1,seatMounts:1,seatTools:1};
const make=(patch={})=>calculatorEngine.calculate(getJobById(SEAT_JOB)!,{...confirmed,...patch});

test('seat count buys exact whole units of the chosen original Carina product',()=>{
  const eans={1:'5907720651077',2:'5907720651084',3:'5902115712524'};
  for(const [variant,ean] of Object.entries(eans))for(const seatCount of [1,2,10]){
    const c=make({seatCount,seatVariant:Number(variant),faucetCount:77});
    assert.equal(c.quantityModel,SEAT_MODEL);
    assert.deepEqual(c.materials.map(l=>l.rawQuantity),[seatCount,0,0]);
    assert.equal(c.materials[0].packs,seatCount);
    const stage=toPricingStageInput(c);
    assert.equal(stage.materials.length,1);
    assert.equal(stage.materials[0].quantity,seatCount);
    assert.equal(stage.materials[0].material.ean,ean);
  }
});
test('unconfirmed model, bowl or invalid counts cannot receive a full price',()=>{
  for(const patch of [{seatVariant:0},{seatFit:0},{seatFit:2},...[0,-1,1.5,11,NaN,Infinity].map(seatCount=>({seatCount}))]){
    const c=make(patch);
    assert.equal(seatQuantity('toilet-seat-mat',c.measurements),null);
    assert.ok(c.materials.every(l=>l.quantityKnown===false));
    assert.ok(toPricingStageInput(c).materials.every(l=>!l.material.ean));
  }
});
test('missing or unconfirmed fixings remain an unresolved part beside the chosen seat',()=>{
  for(const seatMounts of [undefined,0,2]){
    const c=make({seatMounts});
    assert.equal(c.materials[0].quantityKnown,true);
    assert.equal(c.materials[1].quantityKnown,false);
    const stage=toPricingStageInput(c);
    assert.equal(stage.materials.length,2);
    assert.equal(stage.materials[0].material.ean,'5907720651084');
    assert.equal(stage.materials[1].material.ean,undefined);
    assert.ok(stage.materials[1].quantity>0);
  }
});
test('missing installation tool blocks the full price; owned tool creates no shopping row',()=>{
  const job=getJobById(SEAT_JOB)!;
  assert.deepEqual(generateAllShoppingItems('qa',make(),job).map(item=>item.materialId),['toilet-seat-mat']);
  const oldTool={id:'old-tool',projectId:'qa',materialId:'screwdriver-seat',name:'Wkrętaki lub klucz do nakrętek',quantity:1,unit:'szt.',estimatedPrice:0,purchased:false,owned:false,itemType:'tool',tier:'standard',createdAt:'2026-10-29'} as ShoppingItem;
  assert.equal(projectShopping([oldTool],make()).length,0);
  assert.equal(projectShopping([{...oldTool,purchased:true}],make()).length,1);
  for(const seatTools of [undefined,0,2]){
    const c=make({seatTools});
    assert.equal(c.materials[0].quantityKnown,true);
    assert.equal(c.materials[1].quantityKnown,true);
    assert.equal(c.materials[2].quantityKnown,false);
    const stage=toPricingStageInput(c);
    assert.equal(stage.materials.length,2);
    assert.equal(stage.materials[1].material.id,'seat-installation-tool');
    assert.equal(stage.materials[1].material.ean,undefined);
    assert.ok(stage.materials[1].quantity>0);
  }
});
test('normal and detailed calculations preserve the same seat identity and quantity',()=>{
  const a=make(),b=calculatorEngine.calculateDetailed(getJobById(SEAT_JOB)!,confirmed);
  assert.equal(b.quantityModel,SEAT_MODEL);
  assert.deepEqual(b.materials.map(l=>[l.rawQuantity,l.quantity,l.cost,l.quantityKnown]),a.materials.map(l=>[l.rawQuantity,l.quantity,l.cost,l.quantityKnown]));
});
test('old estimates, changed codes and missing accessory rows are reviewed',()=>{
  const c=make(),old={...c,quantityModel:undefined},before=JSON.stringify(old);
  assert.ok(upgradeCalculation(old)!.materials.every(l=>l.quantityKnown===false));
  assert.equal(JSON.stringify(old),before);
  const altered={...c,materials:[{...c.materials[0],material:{...c.materials[0].material,ean:'8586005352624'}},...c.materials.slice(1)]};
  assert.equal(toPricingStageInput(altered).materials[0].material.ean,undefined);
  const missing=upgradeCalculation({...make({seatMounts:0}),materials:[c.materials[0]]})!;
  assert.equal(missing.materials.length,2);
  assert.equal(missing.materials[1].quantityKnown,false);
  const noTool=upgradeCalculation({...make({seatTools:0}),materials:c.materials.slice(0,2)})!;
  assert.equal(noTool.materials.length,3);
  assert.equal(noTool.materials[2].quantityKnown,false);
});
test('owned seats cannot hide increased count, changed model or unresolved fasteners',()=>{
  const c=make(),item={id:'owned-seat',projectId:'qa',materialId:'toilet-seat-mat',name:c.materials[0].material.name,unit:'szt',quantity:2,owned:true,purchased:true,itemType:'material'} as ShoppingItem;
  assert.equal(applyProjectShopping(toPricingStageInput(c),c,'qa',[item]).stage.materials.length,0);
  for(const other of [make({seatCount:3}),make({seatVariant:3}),make({seatFit:0}),{...c,quantityModel:undefined}]){
    assert.equal(projectShopping([item],other)[0].owned,false);
    assert.ok(applyProjectShopping(toPricingStageInput(other),other,'qa',[item]).stage.materials.length>0);
  }
  const unknown=make({seatMounts:0}),fake={...item,materialId:'seat-mounting-parts',name:unknown.materials[1].material.name,quantity:1};
  assert.equal(applyProjectShopping(toPricingStageInput(unknown),unknown,'qa',[fake]).stage.materials.length,2);
});
test('seat job keeps legacy material ID and validates integer wizard inputs',()=>{
  const job=getJobById(SEAT_JOB)!;
  assert.deepEqual(job.materials.map(l=>l.id),['toilet-seat-mat','seat-mounting-parts','seat-installation-tool']);
  assert.ok(job.materials.every(l=>!('formula'in l)));
  assert.equal(parseMeasurements(job,{seatCount:'2',seatVariant:'2',seatFit:'1',seatMounts:'1',seatTools:'1'}).errors.length,0);
  assert.ok(parseMeasurements(job,{seatCount:'1.5'}).errors.length>0);
});
test('changing seat model or bowl count clears previous fit and hardware confirmations',()=>{
  const old={seatCount:'2',seatVariant:'1',seatFit:'1',seatMounts:'1',seatTools:'1'};
  assert.deepEqual(withSeatMeasurement(old,'seatVariant',3),{seatCount:'2',seatVariant:'3',seatFit:'0',seatMounts:'0',seatTools:'0'});
  assert.deepEqual(withSeatMeasurement(old,'seatCount','3'),{seatCount:'3',seatVariant:'1',seatFit:'0',seatMounts:'0',seatTools:'0'});
  assert.deepEqual(withSeatMeasurement(old,'seatVariant',1),old);
  assert.deepEqual(withSeatMeasurement(old,'seatFit',2),{...old,seatFit:'2'});
});
