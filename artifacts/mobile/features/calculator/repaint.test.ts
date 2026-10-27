import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {getMaterialsForJob,hasMaterialData} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {generateShoppingItems} from './shopping';
import {upgradeCalculation,projectShopping} from './upgrades';
import {REPAINT_UNDERCOAT_REFERENCE,upgradeRepaintCalculation} from './repaint';
import type {CalculationResult,ShoppingItem} from '@/types/domain';

const repaint=getJobById('repaint-walls')!,ceiling=getJobById('paint-ceiling')!;
const calc=(more:Record<string,number>={})=>calculatorEngine.calculate(repaint,{wallArea:10,coats:2,coveragePerLiter:8,...more});
const line=(result:CalculationResult,id:string)=>result.materials.find(l=>l.material.id===id)!;
const inputLine=(result:CalculationResult,id:string)=>toPricingStageInput(result).materials.find(l=>l.material.id===id)!;

test('repainting prices the opaque undercoat separately from topcoat layers and coverage',()=>{
  const first=calc(),changed=calc({coats:3,coveragePerLiter:5});
  assert.equal(inputLine(first,'primer-repaint').quantity,1.1667);assert.equal(inputLine(changed,'primer-repaint').quantity,1.1667);
  assert.notEqual(inputLine(first,'paint').quantity,inputLine(changed,'paint').quantity);
  assert.equal(inputLine(first,'painters-tape').quantity,50);assert.equal(inputLine(first,'drop-cloth').quantity,20);
  assert.equal(first.totalCost,174.49);
  assert.equal(calculatorEngine.calculateDetailed(repaint,first.measurements).totalCost,first.totalCost);
});
test('each repainting tier includes exact undercoat, tape and film; a deep primer is rejected',()=>{
  assert.equal(hasMaterialData('repaint-walls'),true);
  for(const tier of ['economy','standard','better'] as const){
    const refs=getMaterialsForJob('repaint-walls',tier),input=toPricingStageInput(calc(),tier);
    assert.equal(input.materials.length,4);assert.equal(refs.filter(r=>r.materialType==='paint-undercoat').length,1);
    assert.equal(refs.find(r=>r.materialType==='paint-undercoat')!.id,REPAINT_UNDERCOAT_REFERENCE);
    assert.equal(input.materials.find(l=>l.material.id==='primer-repaint')!.material.category,'paint-undercoat');
    assert.ok(input.materials.every(l=>l.material.category!==null));
  }
  const primer=getMaterialsForJob('paint-ceiling','standard').find(r=>r.materialType==='primer')!;
  assert.equal(resolveMaterialQuantity(primer,calc()),null);
});
test('zero counts are explicit choices; malformed counts or coverage stay unknown instead of becoming free',()=>{
  const onlyPaint=calc({undercoatChoice:0,tapeRolls:0,protectiveFilmPacks:0});
  assert.deepEqual(toPricingStageInput(onlyPaint).materials.map(l=>l.material.id),['paint']);
  assert.deepEqual(generateShoppingItems('test',onlyPaint).map(l=>l.materialId),['paint']);
  for(const [field,value,id] of [['tapeRolls',1.5,'painters-tape'],['protectiveFilmPacks',-1,'drop-cloth'],['undercoatCoverage',11,'primer-repaint'],['undercoatChoice',3,'primer-repaint']] as const){
    const invalid=calc({[field]:value});assert.equal(line(invalid,id).quantityKnown,false);assert.equal(inputLine(invalid,id).material.unit,'pozycja');assert.equal(inputLine(invalid,id).quantity,1);
  }
});
test('historical repaint JSON preserves old tape rolls and undercoat demand; missing film input remains unknown across reads',()=>{
  const saved=JSON.parse(JSON.stringify(calc())) as CalculationResult;
  const old={...saved,materials:saved.materials.filter(l=>l.material.id!=='drop-cloth').map(l=>l.material.id==='painters-tape'
    ?{...l,quantity:3,rawQuantity:3,material:{...l.material,brand:'Tesa Taśma malarska Standard 25 mm × 50 m (referencja)',formulaKey:'tape'}}
    :l.material.id==='primer-repaint'?{...l,rawQuantity:1.3}:l)};
  const snapshot=JSON.stringify(old),once=upgradeRepaintCalculation(old)!,twice=upgradeRepaintCalculation(JSON.parse(JSON.stringify(once)))!;
  assert.equal(JSON.stringify(old),snapshot);assert.equal(line(once,'drop-cloth').quantityKnown,false);assert.equal(line(twice,'drop-cloth').quantityKnown,false);
  assert.equal(inputLine(twice,'painters-tape').quantity,150);assert.equal(inputLine(twice,'primer-repaint').quantity,1.3);assert.equal(inputLine(twice,'drop-cloth').material.unit,'pozycja');
  const decided=upgradeRepaintCalculation({...old,measurements:{...old.measurements,protectiveFilmPacks:0}})!;
  assert.ok(!toPricingStageInput(decided).materials.some(l=>l.material.id==='drop-cloth'));
});
test('unidentified tape length cannot silently become a 50 metre roll',()=>{
  const saved=calc(),result={...saved,materials:saved.materials.map(l=>l.material.id==='painters-tape'?{...l,material:{...l.material,brand:'Taśma nieznanej długości'}}:l)};
  const ref=getMaterialsForJob('repaint-walls','standard').find(r=>r.materialType==='masking-tape')!;
  assert.equal(resolveMaterialQuantity(ref,result),null);
});
test('ceiling primer demand has its own consumption, independent of finishing paint',()=>{
  const run=(more:Record<string,number>={})=>calculatorEngine.calculate(ceiling,{ceilingArea:40,coats:2,coveragePerLiter:10,...more});
  const first=run(),other=run({coats:3,coveragePerLiter:18});
  assert.equal(inputLine(first,'primer-ceiling').quantity,6);assert.equal(inputLine(other,'primer-ceiling').quantity,6);
  assert.equal(line(first,'primer-ceiling').quantity,10);assert.equal(inputLine(run({primerConsumption:0.1}),'primer-ceiling').quantity,4);
  assert.equal(inputLine(first,'primer-ceiling').material.name,'Grunt uniwersalny Knauf 5 l');
  assert.ok(!toPricingStageInput(run({ceilingPrimerChoice:0})).materials.some(l=>l.material.id==='primer-ceiling'));
  assert.equal(inputLine(run({primerConsumption:0}),'primer-ceiling').material.unit,'pozycja');
});
test('old ceiling JSON is recalculated without mutation, and an insufficient owned quantity cannot hide the new need',()=>{
  const saved=JSON.parse(JSON.stringify(calculatorEngine.calculate(ceiling,{ceilingArea:80,coats:2,coveragePerLiter:18}))) as CalculationResult;
  const old={...saved,materials:saved.materials.map(l=>l.material.id==='primer-ceiling'?{...l,rawQuantity:4.5,quantity:5,packs:1,material:{...l.material,formulaKey:'primer'}}:l)};
  const snapshot=JSON.stringify(old),updated=upgradeCalculation(old)!;
  assert.equal(JSON.stringify(old),snapshot);assert.equal(line(updated,'primer-ceiling').rawQuantity,12);assert.equal(line(updated,'primer-ceiling').quantity,15);
  assert.equal(line(upgradeCalculation(JSON.parse(JSON.stringify(updated)))!,'primer-ceiling').quantity,15);
  const owned={projectId:'test',materialId:'primer-ceiling',itemType:'material',quantity:5,unit:'litr',owned:true,purchased:true} as ShoppingItem;
  const projected=projectShopping([owned],old)[0];assert.equal(projected.owned,false);assert.equal(projected.purchased,false);assert.equal(projected.requiredQuantity,15);assert.equal(owned.quantity,5);
  assert.equal(projectShopping([{...owned,quantity:15}],updated)[0].owned,true);
});
