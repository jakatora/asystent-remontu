import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine, computeRawQuantity } from './engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { buildRenovationBasket } from '@/features/pricing/renovationBasket';
import { applyProjectShopping, shoppingQuantityAction } from '@/features/pricing/projectShoppingInput';
import { upgradeCalculation, projectShopping } from './upgrades';
import { generateShoppingItems } from './shopping';
import { substratePrimerSpecification, substratePrimerQuantity, SUBSTRATE_PRIMER_MODEL } from './substratePrimer';
import type { CalculationResult, ShoppingItem, Project } from '@/types/domain';

const ids = ['primer-walls','wall-repair','wallpaper','wallpaper-install','wallpaper-remove','floor-tiles','self-leveling'];
const calc = (id: string, more: Record<string, number> = {}) => calculatorEngine.calculate(getJobById(id)!, { wallArea: 10, floorArea: 10, perimeter: 14, levelingThickness: 5, ...more });
const primer = (result: CalculationResult) => result.materials.find(line => line.material.id === substratePrimerSpecification(result.jobId)!.materialId)!;

test('self-leveling cannot omit edge tape when area was entered without a perimeter',()=>{
  const job=getJobById('self-leveling')!;
  const missing=calculatorEngine.calculate(job,{floorArea:10,levelingThickness:5});
  const input=toPricingStageInput(missing).materials.find(row=>row.material.id==='expansion-tape')!;
  assert.equal(input.material.unit,'pozycja');assert.equal(input.quantity,1);
  assert.ok(job.measurementInputs.some(field=>field.id==='perimeter'&&field.required!==false));
  const first=calc('self-leveling'),changed=calc('self-leveling',{floorArea:20});
  for(const result of [first,changed])assert.equal(toPricingStageInput(result).materials.find(row=>row.material.id==='expansion-tape')!.quantity,14.7);
});

test('seven preparation recipes use exactly one reviewed primer at every price tier', () => {
  for (const id of ids) for (const tier of ['economy','standard','better'] as const) {
    const result = calc(id), spec = substratePrimerSpecification(id)!;
    const refs = getMaterialsForJob(id, tier).filter(ref => ref.materialType === 'primer');
    assert.equal(refs.length, 1, id); assert.equal(refs[0].id, spec.referenceId);
    const input = toPricingStageInput(result, tier).materials.find(row => row.material.id === spec.materialId)!;
    assert.equal(input.material.ean, spec.ean); assert.equal(input.material.category, 'primer');
    assert.equal(input.material.unit, id === 'self-leveling' ? 'kg' : 'l');
    assert.equal(result.quantityModel, SUBSTRATE_PRIMER_MODEL);
    assert.equal(computeRawQuantity(primer(result).material,result.measurements),primer(result).rawQuantity);
  }
});

test('primer quantities use their product allowance, separately from paint, layers and screed thickness', () => {
  assert.equal(primer(calc('primer-walls')).rawQuantity, 1);
  assert.equal(primer(calc('primer-walls',{coveragePerLiter:5})).rawQuantity, 2);
  for (const id of ['wall-repair','wallpaper','wallpaper-install','wallpaper-remove']) {
    assert.equal(primer(calc(id)).rawQuantity, 1.5);
    assert.equal(primer(calc(id,{coats:4,layers:4,coveragePerLiter:1,levelingThickness:25})).rawQuantity, 1.5);
    assert.equal(primer(calc(id,{primerConsumption:0.3})).rawQuantity, 3);
  }
  assert.equal(primer(calc('floor-tiles')).rawQuantity, 2);
  assert.equal(primer(calc('self-leveling')).rawQuantity, 2);
  assert.equal(primer(calc('self-leveling',{wallArea:200,levelingThickness:20})).rawQuantity, 2);
});

test('base units stay raw for aggregation; rounding cannot erase a second retail pack', () => {
  const result=calc('self-leveling',{floorArea:25.00001});
  assert.equal(primer(result).rawQuantity,5.000002);assert.equal(primer(result).packs,2);
  assert.equal(toPricingStageInput(result).materials.find(row=>row.material.id==='primer-leveling')!.quantity,5.000002);
  const stripped={...result,materials:result.materials.map(line=>({...line,rawQuantity:undefined}))};
  assert.equal(toPricingStageInput(stripped).materials.find(row=>row.material.id==='primer-leveling')!.quantity,5.000002);
});

test('invalid measurements remain an unknown material rather than a free complete quote', () => {
  for(const [id,more] of [['self-leveling',{primerConsumption:0.3}],['floor-tiles',{primerConsumption:0}],['wallpaper',{wallArea:NaN}],['wall-repair',{primerConsumption:Infinity}],['primer-walls',{coveragePerLiter:20}]] as const){
    const result=calc(id,more), line=primer(result);
    assert.equal(line.quantityKnown,false,id);
    const input=toPricingStageInput(result).materials.find(row=>row.material.id===line.material.id)!;
    assert.equal(input.material.unit,'pozycja');assert.equal(input.quantity,1);
    assert.ok(generateShoppingItems('p',result).some(row=>row.materialId===line.material.id&&row.quantityKnown===false));
  }
  assert.equal(substratePrimerQuantity('not-a-job',{}),null);
});

test('legacy litre and constant guesses do not acquire an unrelated price or rewrite saved JSON', () => {
  for(const id of ids){
    const fresh=calc(id),spec=substratePrimerSpecification(id)!;
    const {quantityModel:_,...rest}=JSON.parse(JSON.stringify(fresh)) as CalculationResult;
    const old={...rest,materials:rest.materials.map(line=>line.material.id===spec.materialId
      ?{...line,rawQuantity:1,quantity:5,material:{...line.material,ean:undefined,name:'Stary grunt',brand:'Dragon',unit:'litr'}}:line)};
    const before=JSON.stringify(old),updated=upgradeCalculation(old)!;
    assert.equal(primer(updated).quantityKnown,false);assert.equal(JSON.stringify(old),before);
    assert.equal(primer(upgradeCalculation(JSON.parse(JSON.stringify(updated)))!).quantityKnown,false);
    assert.equal(toPricingStageInput(old).materials.find(row=>row.material.id===spec.materialId)!.material.unit,'pozycja');
    const reference=getMaterialsForJob(id,'standard').find(ref=>ref.id===spec.referenceId)!;
    assert.equal(resolveMaterialQuantity(reference,old),null);
  }
});

test('owned legacy guesses stay visible in both project and shared baskets until recalculation',()=>{
  const fresh=calc('self-leveling'),old={...fresh,quantityModel:undefined};
  const saved:ShoppingItem={id:'old',projectId:'p',materialId:'primer-leveling',name:'Grunt',quantity:5,unit:'litr',estimatedPrice:12,owned:true,purchased:true,itemType:'material',tier:'standard',createdAt:''};
  const before=JSON.stringify(saved),projected=projectShopping([saved],old)[0];
  assert.equal(projected.owned,false);assert.equal(projected.purchased,false);assert.equal(projected.quantityKnown,false);
  assert.deepEqual(shoppingQuantityAction(old.jobId,projected),{allowed:false});
  assert.ok(applyProjectShopping(toPricingStageInput(old),old,'p',[saved]).stage.materials.some(row=>row.material.id==='primer-leveling'));
  assert.equal(JSON.stringify(saved),before);
  const current={...saved,quantity:primer(fresh).quantity,unit:'kg',name:primer(fresh).material.name};
  assert.ok(!applyProjectShopping(toPricingStageInput(fresh),fresh,'p',[current]).stage.materials.some(row=>row.material.id==='primer-leveling'));
});

test('the shared basket identifies the selected project that needs measurement review',()=>{
  const fresh=calc('self-leveling'),old={...fresh,quantityModel:undefined};
  const project:Project={id:'old',name:'Podłoga w salonie',jobId:old.jobId,jobName:'Wylewka',categoryId:'floor-prep',measurements:old.measurements,calculationResult:old,status:'planning',createdAt:'',updatedAt:''};
  const before=JSON.stringify(project),basket=buildRenovationBasket([project],['old'],'standard');
  assert.deepEqual(basket.measurementReviews,[{projectId:'old',projectName:'Podłoga w salonie',materials:[primer(old).material.name]}]);
  assert.deepEqual(buildRenovationBasket([project],[],'standard').measurementReviews,[]);
  assert.deepEqual(buildRenovationBasket([{...project,calculationResult:fresh}],['old'],'standard').measurementReviews,[]);
  assert.equal(JSON.stringify(project),before);
});

test('recalculation projects a changed unit and all changed quantities; explicit confirmation can persist the new basis',()=>{
  const fresh=calc('self-leveling',{floorArea:30,perimeter:20});
  const saved:ShoppingItem={id:'old',projectId:'p',materialId:'primer-leveling',name:'Dragon',quantity:5,unit:'litr',estimatedPrice:12,owned:true,purchased:true,itemType:'material',tier:'standard',createdAt:''};
  const tape={...saved,id:'tape',materialId:'expansion-tape',name:'Taśma dylatacyjna przy ścianach',quantity:5,unit:'mb'};
  const before=JSON.stringify([saved,tape]),projected=projectShopping([saved,tape],fresh);
  assert.equal(projected[0].unit,'kg');assert.equal(projected[0].requiredQuantity,10);assert.equal(projected[0].owned,false);
  assert.equal(projected[1].requiredQuantity,21);assert.equal(projected[1].purchased,false);
  assert.deepEqual(shoppingQuantityAction(fresh.jobId,projected[0]),{allowed:true,confirmQuantity:10});
  const confirmed={...saved,customQuantity:10,unit:projected[0].unit,name:projected[0].name};
  assert.equal(projectShopping([confirmed],fresh)[0].owned,true);
  assert.ok(!applyProjectShopping(toPricingStageInput(fresh),fresh,'p',[confirmed]).stage.materials.some(row=>row.material.id==='primer-leveling'));
  assert.equal(JSON.stringify([saved,tape]),before);
});

test('simple and detailed calculators agree on product, money and unknown quantity explanation',()=>{
  for(const id of ids){
    const simple=calc(id),detailed=calculatorEngine.calculateDetailed(getJobById(id)!,simple.measurements);
    assert.equal(simple.totalCost,detailed.totalCost);assert.equal(simple.quantityModel,detailed.quantityModel);
    const line=detailed.materials.find(row=>row.material.id===substratePrimerSpecification(id)!.materialId)!;
    assert.equal(line.rawQuantity,primer(simple).rawQuantity);assert.equal(line.quantity,primer(simple).quantity);
    assert.ok(line.explanation.text.includes(line.material.unit));
  }
  const invalid=calculatorEngine.calculateDetailed(getJobById('self-leveling')!,{floorArea:10,levelingThickness:5,primerConsumption:0});
  assert.match(invalid.materials.find(row=>row.material.id==='primer-leveling')!.explanation.text,/zużycie gruntu/);
});
