import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {upgradeCalculation,projectShopping} from './upgrades';
import {HARDWARE_JOB,HARDWARE_MODEL,hardwareQuantity} from './cabinetHardware';
import {applyProjectShopping} from '@/features/pricing/projectShoppingInput';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {parseMeasurements} from '@/shared/lib/measurements';
import type {ShoppingItem} from '@/types/domain';

const measures={handleCount:15,handleVariant:1,handleHolePitchMm:128,handleScrewFit:1};
const make=(changes={})=>calculatorEngine.calculate(getJobById(HARDWARE_JOB)!,{...measures,...changes});
test('handles use their own whole count without waste; 2 screws per purchased handle are already included',()=>{
 for(const handleCount of [1,15,100]){
  const calc=make({handleCount,faucetCount:82}),stage=toPricingStageInput(calc);
  assert.equal(calc.quantityModel,HARDWARE_MODEL);assert.equal(calc.materials[0].rawQuantity,handleCount);assert.equal(calc.materials[0].packs,handleCount);assert.equal(calc.materials[1].rawQuantity,0);assert.equal(calc.materials[1].quantityKnown,true);
  assert.equal(stage.materials.length,1);assert.equal(stage.materials[0].quantity,handleCount);assert.equal(stage.materials[0].material.ean,'5902801422652');
 }
});
test('gold and black remain separate exact EANs and photographs; tier does not change the selected variant',()=>{
 for(const tier of ['economy','standard','better'] as const)for(const handleVariant of [1,2]){
  const calc=make({handleVariant}),ref=getMaterialsForJob(HARDWARE_JOB,tier,calc.measurements)[0];
  assert.equal(ref.id,handleVariant===1?'mat-handle-gtv-nyxa-128-black':'mat-handle-gtv-nyxa-128-gold');assert.equal(resolveMaterialQuantity(ref,calc)?.quantity,15);
  assert.equal(toPricingStageInput(calc).materials[0].material.ean,handleVariant===1?'5902801422652':'5902801422737');
 }
});
test('unknown product, unmeasured/different hole pitch and invalid handle counts never become priced complete kits',()=>{
 for(const change of [{handleVariant:0},{handleHolePitchMm:0},{handleHolePitchMm:96},{handleHolePitchMm:138},...[0,-1,1.5,101,NaN,Infinity].map(handleCount=>({handleCount}))]){
  const calc=make(change);assert.equal(hardwareQuantity('cabinet-handles',calc.measurements),null);assert.equal(calc.materials[0].quantityKnown,false);assert.equal(toPricingStageInput(calc).materials[0].material.ean,undefined);
 }
});
test('unconfirmed screw fit or another length remains a separate unresolved requirement',()=>{
 for(const handleScrewFit of [0,3,undefined]){const calc=make({handleScrewFit}),stage=toPricingStageInput(calc);assert.equal(calc.materials[0].quantityKnown,true);assert.equal(calc.materials[1].quantityKnown,false);assert.equal(stage.materials.length,2);assert.equal(stage.materials[1].material.ean,undefined);}
 assert.equal(toPricingStageInput(make({handleScrewFit:2})).materials.length,1);
});
test('normal and detailed calculations agree; input parser rejects fractional counts and requires actual pitch',()=>{
 const job=getJobById(HARDWARE_JOB)!,a=make(),b=calculatorEngine.calculateDetailed(job,measures);
 assert.equal(b.quantityModel,HARDWARE_MODEL);assert.deepEqual(b.materials.map(m=>[m.rawQuantity,m.quantity,m.cost,m.quantityKnown]),a.materials.map(m=>[m.rawQuantity,m.quantity,m.cost,m.quantityKnown]));
 assert.ok(parseMeasurements(job,{handleCount:'1.5',handleVariant:'1',handleHolePitchMm:'128',handleScrewFit:'1'}).errors.some(e=>e.id==='handleCount'));
 assert.ok(parseMeasurements(job,{handleCount:'15',handleVariant:'1',handleScrewFit:'1'}).errors.some(e=>e.id==='handleHolePitchMm'));
});
test('historical faucet-based quantities, altered identities and missing material rows cannot bypass review',()=>{
 const original=make(),old={...original,quantityModel:undefined},before=JSON.stringify(old);assert.equal(upgradeCalculation(old)!.materials[0].quantityKnown,false);assert.equal(JSON.stringify(old),before);
 for(const line of [{...original.materials[0],rawQuantity:1},{...original.materials[0],material:{...original.materials[0].material,ean:'5902801422737'}}])assert.equal(toPricingStageInput({...original,materials:[line,original.materials[1]]}).materials[0].material.ean,undefined);
 assert.equal(upgradeCalculation({...original,materials:[]})!.materials[0].quantityKnown,false);
});
test('owned handles cannot hide a changed colour or increased count; sufficient matching ownership remains usable',()=>{
 const calc=make(),line=calc.materials[0],item={id:'qa-handles',projectId:'qa',materialId:'cabinet-handles',name:line.material.name,unit:'szt',quantity:15,owned:true,purchased:true,itemType:'material'} as ShoppingItem;
 assert.equal(applyProjectShopping(toPricingStageInput(calc),calc,'qa',[item]).stage.materials.length,0);
 for(const changed of [make({handleCount:16}),make({handleVariant:2}),{...calc,quantityModel:undefined}]){
  const reviewed=projectShopping([item],changed)[0];assert.equal(reviewed.owned,false);assert.equal(reviewed.purchased,false);assert.ok(applyProjectShopping(toPricingStageInput(changed),changed,'qa',[item]).stage.materials.length>0);
 }
});
