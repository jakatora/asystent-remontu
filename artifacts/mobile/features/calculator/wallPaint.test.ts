import assert from 'node:assert/strict';
import test from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {buildRenovationBasket} from '@/features/pricing/renovationBasket';
import {upgradeCalculation,projectShopping} from './upgrades';
import type {Project,ShoppingItem} from '@/types/domain';

const job=getJobById('paint-walls')!;
const calc=(more:Record<string,number|undefined>={})=>calculatorEngine.calculate(job,{wallArea:40.5,coats:2,coveragePerLiter:10,tapeRolls:1,protectiveFilmPacks:1,...more});
const line=(c:ReturnType<typeof calc>,id:string)=>c.materials.find(l=>l.material.id===id)!;

test('a small excess over five litres still requires the second real paint can',()=>{
  const result=calc({wallArea:23.81}),paint=line(result,'paint');
  assert.equal(paint.rawQuantity,5.0001);assert.equal(paint.packs,2);
  assert.equal(toPricingStageInput(result).materials.find(l=>l.material.id==='paint')!.quantity,5.0001);
});

test('wall primer uses its own product allowance and application count, independently of paint coverage and coats',()=>{
  assert.equal(line(calc(),'primer-paint').rawQuantity,6.075);
  for(const more of [{coveragePerLiter:6,coats:1},{coveragePerLiter:18,coats:3}])assert.equal(line(calc(more),'primer-paint').rawQuantity,6.075);
  assert.equal(line(calc({primerConsumption:0.2,primerApplications:2}),'primer-paint').rawQuantity,16.2);
  const field=job.measurementInputs.find(i=>i.id==='primerConsumption');assert(field);assert.equal(field.defaultValue,0.15);assert.equal(field.unit,'l/m²');
});

test('the whole renovation aggregates raw litres before choosing retail cans',()=>{
  const projects=['a','b'].map(id=>({id,name:id,jobId:job.id,calculationResult:calc({wallArea:11.91})} as Project));
  const basket=buildRenovationBasket(projects,['a','b'],'standard');assert.equal(basket.stages.length,2);
  const litres=basket.stages.reduce((n,s)=>n+s.materials.find(l=>l.material.id==='paint')!.quantity,0);
  assert.equal(Number(litres.toFixed(8)),5.0022);
  assert(basket.stages.every(s=>s.materials.length===4&&s.materials.every(l=>l.quantity>0)));
});

test('invalid primer usage or application count stays unknown instead of turning into a complete free material',()=>{
  for(const more of [{primerConsumption:0},{primerConsumption:Infinity},{primerApplications:0},{primerApplications:3},{primerApplications:1.5}]){
    const result=calc(more);assert.equal(line(result,'primer-paint').quantityKnown,false);
    const input=toPricingStageInput(result).materials.find(l=>l.material.id==='primer-paint')!;assert.equal(input.material.unit,'pozycja');
  }
});

test('old painting snapshots and purchase declarations require review without changing the saved JSON',()=>{
  const old=JSON.parse(JSON.stringify(calc()));delete old.quantityModel;const original=JSON.stringify(old),reviewed=upgradeCalculation(old)!;
  for(const id of ['paint','primer-paint'])assert.equal(line(reviewed,id).quantityKnown,false);
  const items=['paint','primer-paint'].map((materialId,i)=>({id:String(i),projectId:'old',itemType:'material',materialId,name:line(old,materialId).material.name,unit:'litr',quantity:5,owned:true,purchased:true,estimatedPrice:50} as ShoppingItem));
  const projected=projectShopping(items,old);assert(projected.every(i=>!i.owned&&!i.purchased&&i.needsQuantityConfirmation));assert.equal(JSON.stringify(old),original);assert(items.every(i=>i.owned&&i.purchased));
});

test('saved current calculations keep exact raw requirements and the selected primer identity',()=>{
  const result=JSON.parse(JSON.stringify(calc())),stage=toPricingStageInput(result);
  assert.equal(stage.materials.find(l=>l.material.id==='paint')!.quantity,8.505);
  const primer=stage.materials.find(l=>l.material.id==='primer-paint')!;assert.equal(primer.quantity,6.075);assert.equal(primer.material.unit,'l');assert.equal(primer.material.ean,'5901793357737');
});
