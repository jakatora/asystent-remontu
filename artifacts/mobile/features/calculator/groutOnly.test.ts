import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {applyProjectShopping,shoppingQuantityAction} from '@/features/pricing/projectShoppingInput';
import {upgradeCalculation, projectShopping} from './upgrades';
import {generateShoppingItems} from './shopping';
import {parseMeasurements} from '@/shared/lib/measurements';
import {GROUT_ONLY_JOB,GROUT_ONLY_MODEL,GROUT_REFERENCE,GROUT_CLEANER_REFERENCE,groutOnlyQuantity,groutOnlyInputVisible} from './groutOnly';
import type {ShoppingItem} from '@/types/domain';

const job=getJobById(GROUT_ONLY_JOB)!;
const m={wallArea:10,tileWidthCm:30,tileHeightCm:30,groutWidthMm:3,groutDepthMm:8,groutProduct:1,groutReservePercent:10,groutSealantLength:4,groutSealantModel:1,groutSealantWidthMm:5,groutSealantDepthMm:5,groutCleanerChoice:2,groutCleanerPacks:1};
const calc=(patch:Record<string,number>={})=>calculatorEngine.calculate(job,{...m,...patch});

test('grout-only uses Atlas joint geometry, actual depth and density, then whole 2kg packs',()=>{
 const c=calc(),g=c.materials[0];assert.equal(c.quantityModel,GROUT_ONLY_MODEL);assert.equal(g.rawQuantity,2.904);assert.equal(g.quantity,4);assert.equal(g.packs,2);assert.equal(g.material.unit,'kg');
 assert.equal(groutOnlyQuantity('grout',{...m,groutDepthMm:4}),1.452);
 assert.equal(groutOnlyQuantity('grout',{...m,groutReservePercent:0}),2.64);
 assert.equal(groutOnlyQuantity('grout',{...m,groutWidthMm:20}),19.36);
});
test('no assumed depth, colour, silicone length or cleaner decision may become a complete free purchase',()=>{
 for(const key of ['groutDepthMm','groutProduct','groutSealantLength','groutCleanerChoice']){const missing={...m};delete missing[key as keyof typeof missing];const c=calculatorEngine.calculate(job,missing),s=toPricingStageInput(c,'standard');assert.ok(c.materials.some(l=>l.quantityKnown===false));assert.ok(s.materials.some(l=>l.material.unit==='pozycja'));}
 for(const patch of [{groutWidthMm:21},{groutDepthMm:0},{groutDepthMm:NaN},{groutReservePercent:31}] as Record<string,number>[])assert.equal(calc(patch).materials[0].quantityKnown,false);
});
test('silicone is measured in ml; explicit zero excludes the purchase without requiring hidden fields',()=>{
 const c=calc();assert.equal(c.materials[1].rawQuantity,110);assert.equal(c.materials[1].quantity,280);assert.equal(c.materials[1].packs,1);assert.equal(c.materials[1].material.unit,'ml');
 const zero=calc({groutSealantLength:0,groutSealantModel:0,groutSealantWidthMm:NaN,groutSealantDepthMm:NaN});assert.equal(zero.materials[1].quantityKnown,true);assert.equal(zero.materials[1].quantity,0);assert.ok(!toPricingStageInput(zero,'standard').materials.some(l=>l.material.id==='silicone-grout'));
 assert.equal(calc({groutSealantModel:0}).materials[1].quantityKnown,false);
});
test('cleaner requires a decision and whole 1kg bottles, never an invented area yield or litre conversion',()=>{
 assert.equal(groutOnlyQuantity('grout-cleaner',{...m,groutCleanerPacks:2}),2);assert.equal(calc({groutCleanerPacks:1.5}).materials[2].quantityKnown,false);assert.equal(calc({groutCleanerPacks:0}).materials[2].quantityKnown,false);
 const no=calc({groutCleanerChoice:1,groutCleanerPacks:NaN});assert.equal(no.materials[2].quantity,0);assert.ok(!toPricingStageInput(no,'standard').materials.some(l=>l.material.id==='grout-cleaner'));
});
test('all price tiers preserve the chosen Atlas white colour and exact silicone chemistry',()=>{
 for(const tier of ['economy','standard','better']as const){const c=calc({groutSealantModel:2}),refs=getMaterialsForJob(GROUT_ONLY_JOB,tier,c.measurements);assert.deepEqual(refs.map(r=>r.id),[GROUT_REFERENCE,'mat-sanitary-silicone-soudal-stop-white-280ml',GROUT_CLEANER_REFERENCE]);const s=toPricingStageInput(c,tier);assert.deepEqual(s.materials.map(l=>l.material.ean),['5905400572254','5411183200326','5905400990010']);assert.deepEqual(s.materials.map(l=>l.quantity),[2.904,110,1]);}
});
test('strict pricing rejects old units, different EAN, pack size or historical quantity model',()=>{
 const c=calc(),ref=getMaterialsForJob(GROUT_ONLY_JOB,'standard',c.measurements)[0];assert.equal(resolveMaterialQuantity(ref,c)?.quantity,2.904);
 assert.equal(resolveMaterialQuantity({...ref,packageSize:5},c),null);assert.equal(resolveMaterialQuantity(ref,{...c,quantityModel:undefined}),null);
 for(const material of [{...c.materials[0].material,ean:'5905400990010'},{...c.materials[0].material,unit:'szt'}])assert.equal(resolveMaterialQuantity(ref,{...c,materials:[{...c.materials[0],material}]}),null);
});
test('historical generic grout and cartridge ownership require review instead of silently reusing guesses',()=>{
 const original={...calc(),quantityModel:undefined},c=upgradeCalculation(original)!;assert.ok(c.materials.every(l=>l.quantityKnown===false));
 const old=generateShoppingItems('test',original).map((i,n)=>({...i,id:String(n),owned:true,purchased:true})) as ShoppingItem[];
 const reviewed=projectShopping(old,c);assert.equal(reviewed.length,3);assert.ok(reviewed.every(i=>i.quantityKnown===false&&i.needsQuantityConfirmation&&!i.owned&&!i.purchased));
 assert.ok(original.materials.every(l=>l.quantityKnown===true));
});
test('ordinary and detailed results agree and explanations use measured depth and declared reserve',()=>{
 const c=calc({groutReservePercent:20}),d=calculatorEngine.calculateDetailed(job,c.measurements);assert.deepEqual(d.materials.map(l=>[l.rawQuantity,l.quantity,l.cost]),c.materials.map(l=>[l.rawQuantity,l.quantity,l.cost]));assert.equal(d.totalCost,c.totalCost);assert.match(d.materials[0].explanation.assumptions[0],/3 mm × 8 mm/);assert.match(d.materials[1].explanation.assumptions[0],/4 m × 5 mm × 5 mm/);assert.ok(d.materials[0].explanation.assumptions.includes('Zapas zakupowy: 20%.'));assert.equal(d.materials[2].wasteQuantity,0);
 assert.ok(job.materials.every(l=>!('formula'in l)));assert.deepEqual(job.materials.map(l=>l.id),['grout','silicone-grout','grout-cleaner']);
});
test('input parser hides only deliberately unused fields and validates the depth plus optional cleaner count',()=>{
 const raw=Object.fromEntries(Object.entries({...m,groutSealantLength:0,groutCleanerChoice:1}).map(([k,v])=>[k,String(v)]));raw.groutSealantWidthMm='bad';raw.groutSealantDepthMm='bad';raw.groutCleanerPacks='bad';assert.equal(parseMeasurements(job,raw).errors.length,0);assert.ok(!('groutCleanerPacks'in parseMeasurements(job,raw).values));
 assert.equal(groutOnlyInputVisible(GROUT_ONLY_JOB,'groutSealantModel',raw),false);assert.equal(groutOnlyInputVisible(GROUT_ONLY_JOB,'groutCleanerPacks',{...raw,groutCleanerChoice:2}),true);
 assert.ok(parseMeasurements(job,{...raw,groutDepthMm:''}).errors.some(e=>e.id==='groutDepthMm'));assert.ok(parseMeasurements(job,{...raw,groutCleanerChoice:'2'}).errors.some(e=>e.id==='groutCleanerPacks'));
});
test('measured quantities survive serialization, and changing the colour choice clears the priced identity',()=>{
 const c=JSON.parse(JSON.stringify(calc())),s=toPricingStageInput(c,'standard');assert.equal(s.materials[0].quantity,2.904);assert.equal(s.materials[1].quantity,110);
 const changed=calc({groutProduct:0});assert.equal(changed.materials[0].quantityKnown,false);assert.ok(!getMaterialsForJob(GROUT_ONLY_JOB,'standard',changed.measurements).some(r=>r.id===GROUT_REFERENCE));
});
test('a damaged current snapshot cannot silently drop missing dimensions or a changed exact product',()=>{
 const c=calc();
 for(const changed of [{...c,measurements:{...c.measurements,groutDepthMm:0}},{...c,materials:c.materials.map((l,i)=>i===0?{...l,material:{...l.material,ean:'5905400990010'}}:l)},{...c,measurements:{...c.measurements,groutDepthMm:4}}]){
  const reviewed=upgradeCalculation(changed)!;assert.equal(reviewed.materials[0].quantityKnown,false);const input=toPricingStageInput(changed,'standard');assert.equal(input.materials.find(l=>l.material.id==='grout')?.material.unit,'pozycja');
 }
});
test('current stock ownership excludes only a confirmed complete amount; old or short declarations stay in both baskets',()=>{
 const c=calc(),stage=toPricingStageInput(c,'standard'),items=generateShoppingItems('grout-test',c).map((i,n)=>({...i,id:String(n),owned:true,purchased:false})) as ShoppingItem[];
 assert.equal(applyProjectShopping(stage,c,'grout-test',items).stage.materials.length,0);
 const old={...c,quantityModel:undefined},historical=applyProjectShopping(toPricingStageInput(old,'standard'),old,'grout-test',items);assert.equal(historical.stage.materials.length,3);assert.ok(historical.stage.materials.every(l=>l.material.unit==='pozycja'));
 const short=items.map(i=>i.materialId==='grout'?{...i,customQuantity:1}:i),result=applyProjectShopping(stage,c,'grout-test',short);assert.equal(result.stage.materials.length,1);assert.equal(result.stage.materials[0].material.id,'grout');
 const reviewed=projectShopping(short,c).find(i=>i.materialId==='grout')!;assert.equal(shoppingQuantityAction(GROUT_ONLY_JOB,reviewed).allowed,false);
});
