import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from '@/features/calculator/engine';
import {getJobById} from '@/features/content/registry';
import {getRequiredQuantity} from '@/features/calculator/requirements';
import {kitchenEpoxyGroutKg,kitchenWhiteAdhesiveRate} from '@/features/calculator/kitchen';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {getMaterialsForJob} from './registry';
import {resolveMaterialQuantity} from './quantity';
import {toPricingStageInput} from './pricingApi';
import {applyTileChoices} from './tileChoice';
import {buildRenovationBasket} from './renovationBasket';
import {KITCHEN_EPOXY_REFERENCE,KITCHEN_WHITE_REFERENCE,priceKitchenMaterial} from './kitchenMaterials';
import type {Project,ShoppingItem} from '@/types/domain';

const job=getJobById('kitchen-backsplash')!;
const calculate=(m:Record<string,number>={wallArea:3})=>calculatorEngine.calculate(job,m);
const change={from:'mat-tile-wall-paradyz-nati-bianco-25x40',to:'mat-tile-wall-tamara-white-25x40',use:'wall' as const};
test('every kitchen tier prices specified epoxy and WHITE adhesive, not lower-cost cement or grey references',()=>{
 for(const tier of ['economy','standard','better'] as const){
  const refs=getMaterialsForJob(job.id,tier,{wallArea:3});
  assert.ok(refs.some(ref=>ref.id===KITCHEN_EPOXY_REFERENCE));assert.ok(refs.some(ref=>ref.id===KITCHEN_WHITE_REFERENCE));
  assert.ok(!refs.some(ref=>['grout','adhesive'].includes(ref.materialType)));
  const stage=toPricingStageInput(calculate(),tier);
  const epoxy=stage.materials.find(row=>row.material.id==='grout-kitchen')!,white=stage.materials.find(row=>row.material.id==='tile-adhesive')!;
  assert.equal(epoxy.material.ean,'8022452132940');assert.equal(epoxy.material.category,'epoxy-grout');assert.equal(epoxy.quantity,0.54912);assert.equal(epoxy.packs,undefined);
  assert.equal(white.material.ean,'5905400313390');assert.equal(white.quantity,7.26);
  assert.equal(stage.materials.find(row=>row.material.id==='silicone-kitchen')!.quantity,280);
  assert.equal(stage.materials.find(row=>row.material.id==='tile-crosses-kitchen')!.quantity,60);
 }
});
test('kitchen grout geometry uses its own 1.6 coefficient and a larger joint can require two complete 3 kg packs',()=>{
 const stage=toPricingStageInput(calculate({wallArea:3,tileWidthCm:10,tileHeightCm:10,tileThicknessMm:10,groutWidthMm:5}));
 const epoxy=stage.materials.find(row=>row.material.id==='grout-kitchen')!;assert.equal(epoxy.quantity,5.28);assert.equal(Math.ceil(epoxy.quantity/3),2);
 assert.equal(stage.materials.find(row=>row.material.id==='tile-crosses-kitchen')!.material.ean,undefined,'unreviewed 5mm spacers remain visible and unpriced');
 for(const joint of [0,16,NaN])assert.throws(()=>kitchenEpoxyGroutKg({wallArea:3,groutWidthMm:joint},1.1));
 assert.equal(kitchenWhiteAdhesiveRate(25,40),2.2);assert.equal(kitchenWhiteAdhesiveRate(40,40),2.8);assert.equal(kitchenWhiteAdhesiveRate(60,60),3.4);
});
test('historical kitchen snapshots are re-evaluated without rewriting their old formula, pack count or raw quantity',()=>{
 const old=JSON.parse(JSON.stringify(calculate()));
 for(const row of old.materials)if(['tile-adhesive','grout-kitchen','tile-crosses-kitchen'].includes(row.material.id)){row.rawQuantity=1;row.quantity=1;row.packs=1;row.material.formulaKey=row.material.id==='grout-kitchen'?'grout':'tileAdhesive';}
 const before=JSON.stringify(old),stage=toPricingStageInput(old);
 assert.equal(stage.materials.find(row=>row.material.id==='grout-kitchen')!.quantity,0.54912);assert.equal(stage.materials.find(row=>row.material.id==='tile-adhesive')!.quantity,7.26);assert.equal(stage.materials.find(row=>row.material.id==='tile-crosses-kitchen')!.quantity,60);
 assert.equal(JSON.stringify(old),before);
});
test('changing kitchen tiles recalculates the epoxy and white adhesive, while bathroom grout remains ceramic',()=>{
 const base=toPricingStageInput(calculate()),before=JSON.stringify(base),chosen=applyTileChoices([base],[change])[0];
 assert.equal(chosen.materials.find(row=>row.material.id==='grout-kitchen')!.material.ean,'8022452132940');assert.equal(chosen.materials.find(row=>row.material.id==='grout-kitchen')!.quantity,0.528528);
 assert.equal(chosen.materials.find(row=>row.material.id==='tile-adhesive')!.material.ean,'5905400313390');assert.equal(chosen.materials.find(row=>row.material.id==='tile-adhesive')!.quantity,7.26);
 assert.equal(chosen.measurements!.groutDensityKgM3,1600);assert.equal(JSON.stringify(base),before);
 const bathroom=toPricingStageInput(calculatorEngine.calculate(getJobById('wall-tiles-bathroom')!,{wallArea:3}));
 assert.equal(applyTileChoices([bathroom],[change])[0].materials.find(row=>row.material.id==='wall-grout')!.material.ean,'5905400572254');
});
test('owned kitchen chemistry stays excluded after choosing another tile; choices do not change saved projects',()=>{
 const result=calculate(),project:Project={id:'kitchen',name:'Kuchnia',jobId:job.id,jobName:job.name,categoryId:job.categoryId,measurements:result.measurements,calculationResult:result,status:'planning',createdAt:'',updatedAt:''};
 const chosen=applyTileChoices([toPricingStageInput(result)],[change])[0];
 const owned=['tile-adhesive','grout-kitchen'].map((materialId,i)=>({id:'owned-'+i,projectId:project.id,materialId,name:chosen.materials.find(row=>row.material.id===materialId)!.material.name,quantity:10,unit:'kg',owned:true,purchased:false,itemType:'material'} as ShoppingItem));
 const before=JSON.stringify(project),basket=buildRenovationBasket([project],[project.id],'standard',{kitchen:owned},{},{},{},{},{kitchen:[change]});
 assert.equal(basket.excludedMaterials,2);assert.ok(!basket.stages[0].materials.some(row=>['tile-adhesive','grout-kitchen'].includes(row.material.id)));assert.equal(JSON.stringify(project),before);
});
test('a kitchen requirement cannot borrow cement grout, grey adhesive, or an unrelated silicone cartridge conversion',()=>{
 const calc=calculate();for(const id of ['mat-grout-atlas-001-white-2kg','mat-tile-adhesive-ceresit-cm11-25kg'])assert.equal(resolveMaterialQuantity(MATERIAL_PRICES.find(ref=>ref.id===id)!,calc),null);
 const silicone=calc.materials.find(row=>row.material.id==='silicone-kitchen')!;assert.equal(getRequiredQuantity(silicone,calc),1);
 const other=JSON.parse(JSON.stringify(calc));other.materials.find((row:any)=>row.material.id==='silicone-kitchen').material.brand='Inny silikon 310 ml';assert.equal(resolveMaterialQuantity(MATERIAL_PRICES.find(ref=>ref.id==='mat-sanitary-silicone-soudal-280ml')!,other),null);
 const line={material:{id:'grout-kitchen',name:'custom',unit:'kg'},quantity:1};assert.equal(priceKitchenMaterial(line,'other-job'),line);
});
