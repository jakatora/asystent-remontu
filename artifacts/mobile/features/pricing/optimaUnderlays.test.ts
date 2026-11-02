import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from '../calculator/engine';
import {getJobById} from '../content/registry';
import {toPricingStageInput} from './pricingApi';
import {getMaterialsForJob} from './registry';
import {underlayInputVisible,withUnderlayMeasurement} from '../calculator/underlayInstall';
import {buildRenovationBasket} from './renovationBasket';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import type {Project} from '@/types/domain';

test('explicit Optima choices quote raw m² for one 10 m² roll SKU at every tier, without another vapour foil',()=>{
 for(const[choice,ean]of [[3,'5905167881811'],[4,'5905167881804']] as const)for(const jobId of ['laminate-flooring','underlay-install']){
  const m=jobId==='laminate-flooring'?{floorArea:20,laminateUnderlayChoice:choice,laminateThresholdCount:0,laminateKitCount:1,laminateJointTapeM:5}:{floorArea:20,underlaySystem:choice,underlayFit:1,underlayTapeM:5,underlayBarrierChoice:1,underlayFoilFit:1,underlayFoilAreaM2:30};
  const calc=calculatorEngine.calculate(getJobById(jobId)!,m);
  for(const tier of ['economy','standard','better']as const){
   const input=toPricingStageInput(calc,tier),line=input.materials.find(l=>l.material.id==='underlay')!;
   assert.equal(line.quantity,22);assert.equal(line.material.ean,ean);assert.equal(line.material.unit,'m²');assert(!input.materials.some(l=>l.material.category==='vapor-barrier'));
   const ref=getMaterialsForJob(jobId,tier,m).find(r=>r.materialType==='underlay')!;assert.equal(ref.packageSize,10);assert.equal(PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))?.ean,ean);
  }
 }
});
test('choosing another underlay resets its suitability confirmation, hides extra foil and preserves the saved foil measurements',()=>{
 const old={underlaySystem:'2',underlayFit:'1',underlayFoilFit:'1',underlayBarrierChoice:'1',underlayFoilAreaM2:'30'};
 for(const choice of [3,4]){const next=withUnderlayMeasurement(old,'underlaySystem',choice);assert.equal(next.underlayFit,'0');assert.equal(next.underlayFoilFit,'0');assert.equal(next.underlayFoilAreaM2,'30');for(const id of ['underlayBarrierChoice','underlayFoilFit','underlayFoilAreaM2'])assert.equal(underlayInputVisible('underlay-install',id,next),false);
  const calc=calculatorEngine.calculate(getJobById('underlay-install')!,{floorArea:20,underlaySystem:choice,underlayFit:0,underlayTapeM:0});assert.equal(toPricingStageInput(calc).materials.find(l=>l.material.id==='underlay')!.material.unit,'pozycja');
 }
 assert.equal(old.underlayFit,'1');
});
test('two room calculations preserve raw underlay demand for one later package rounding; existing systems remain unchanged',()=>{
 const projects=[10,15].map((floorArea,i)=>({id:'room-'+i,name:'Pokój',jobId:'underlay-install',calculationResult:calculatorEngine.calculate(getJobById('underlay-install')!,{floorArea,underlaySystem:3,underlayFit:1,underlayTapeM:0})}))as Project[];
 const before=JSON.stringify(projects),basket=buildRenovationBasket(projects,projects.map(p=>p.id),'standard');assert.equal(basket.stages.flatMap(s=>s.materials).filter(l=>l.material.id==='underlay').reduce((sum,l)=>sum+l.quantity,0),27.5);assert.equal(JSON.stringify(projects),before);
 for(const[choice,ean]of [[1,'5063022038289'],[2,'5905167826942']]as const){const calc=calculatorEngine.calculate(getJobById('underlay-install')!,{floorArea:20,underlaySystem:choice,underlayFit:1,underlayTapeM:0});assert.equal(toPricingStageInput(calc).materials.find(l=>l.material.id==='underlay')!.material.ean,ean);}
});
