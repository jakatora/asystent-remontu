import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { computePricedBudget } from './engine';
import { toPricingStageInput } from './pricingApi';
import { applyTileChoices } from './tileChoice';
import { priceTileSpacer, tileJointWidth } from './tileSpacers';
import { buildRenovationBasket } from './renovationBasket';
import type { Project, ShoppingItem } from '@/types/domain';

const calculate=(jobId='floor-tiles',width=3)=>calculatorEngine.calculate(getJobById(jobId)!,{floorArea:10,wallArea:10,tileWidthCm:30,tileHeightCm:30,groutWidthMm:width});
const spacer=(calc:ReturnType<typeof calculate>)=>toPricingStageInput(calc).materials.find(row=>/^(tile-crosses|wall-crosses|tile-crosses-kitchen)$/.test(row.material.id))!;
const models=[[2,'5905061016845',200],[3,'5905061016869',150],[4,'5905061016876',100]] as const;

test('actual calculator demands and local budgets select the measured spacer width and real physical bag for floors, walls and kitchen',()=>{
 for(const jobId of ['floor-tiles','wall-tiles-bathroom','kitchen-backsplash'])for(const [width,ean,size]of models){
  const calc=calculate(jobId,width),before=JSON.stringify(calc),line=spacer(calc);
  assert.equal(line.material.ean,ean);assert.equal(line.material.unit,'szt');assert.ok(line.quantity>0);assert.equal(line.packs,undefined);
  const budget=computePricedBudget({job:getJobById(jobId)!,calc,regionCode:'lodzkie',qualityTier:'standard',overrides:[]});
  const priced=budget.materialDetails.find(row=>row.materialRef.materialType==='tile-spacer')!;
  assert.ok(priced);assert.equal(priced.materialRef.packageSize,size);assert.equal(priced.quantity,line.quantity);assert.equal(priced.packagesNeeded,Math.ceil(line.quantity/size));
  assert.equal(JSON.stringify(calc),before);
 }
});

test('optional old measurements follow the saved job definitions, while unknown widths cannot inherit a two-mm offer or historical override',()=>{
 assert.equal(tileJointWidth('floor-tiles',{}),3);assert.equal(tileJointWidth('wall-tiles-bathroom',{}),3);assert.equal(tileJointWidth('kitchen-backsplash',{}),2);
 const calc=calculate('floor-tiles',5),line=spacer(calc);assert.equal(line.material.ean,undefined);assert.equal(line.material.category,'tile-spacer-review');assert.match(line.material.name,/5 mm/);
 const budget=computePricedBudget({job:getJobById(calc.jobId)!,calc,regionCode:'lodzkie',qualityTier:'standard',overrides:[{id:'old',projectId:'old',targetType:'material',targetId:'mat-tile-spacers-hardy-2mm-200',overridePrice:0.01,createdAt:''}]});
 assert.ok(!budget.materialDetails.some(row=>row.materialRef.materialType==='tile-spacer'));assert.ok(budget.unpricedMaterials?.some(name=>name.includes('Krzyżyki')));
 const known=calculate('floor-tiles',3);assert.equal(spacer(known).material.ean,'5905061016869');
});

test('historical package-labelled crosses snapshots are read as the original piece count, without rewriting saved calculations',()=>{
 const original=calculate(),calc={...original,materials:original.materials.map(line=>line.material.id==='tile-crosses'?{...line,material:{...line.material,unit:'opak.'}}:line)};
 const before=JSON.stringify(calc);
 const api=spacer(calc);assert.equal(api.quantity,223);assert.equal(api.material.unit,'szt');
 const budget=computePricedBudget({job:getJobById(calc.jobId)!,calc,regionCode:'lodzkie',qualityTier:'standard',overrides:[]});
 const priced=budget.materialDetails.find(row=>row.materialRef.materialType==='tile-spacer')!;assert.equal(priced.quantity,223);assert.equal(priced.packagesNeeded,2);assert.equal(priced.totalCost,6.92);assert.equal(JSON.stringify(calc),before);
});

test('an explicit tile change recalculates spacers and keeps 3mm and 4mm identities separate',()=>{
 for(const [width,ean]of models.slice(1)){
  const calc=calculate('floor-tiles',width),before=JSON.stringify(calc);
  const changed=applyTileChoices([toPricingStageInput(calc)],[{from:'mat-gres-paradyz-petro-grey-60x60',to:'mat-gres-rekt-paradyz-u117-grey-60x60',use:'floor'}])[0];
  const line=changed.materials.find(row=>row.material.id==='tile-crosses')!;assert.equal(line.material.ean,ean);assert.equal(line.quantity,56);assert.equal(JSON.stringify(calc),before);
 }
});

test('old explicit codes and packs cannot override a new measured width, and unrelated extra materials are untouched',()=>{
 const line={material:{id:'tile-crosses',name:'Old 2mm',ean:'5905061016845',gtin:'5905061016845',unit:'szt'},quantity:151,packs:1};
 const updated=priceTileSpacer(line,'floor-tiles',{groutWidthMm:3});assert.equal(updated.quantity,151);assert.equal(updated.material.id,'tile-crosses');assert.equal(updated.material.ean,'5905061016869');assert.equal(updated.material.gtin,undefined);assert.equal(updated.packs,undefined);
 assert.equal(priceTileSpacer(line,'basket-extras',{groutWidthMm:3}),line);assert.equal(line.material.ean,'5905061016845');
 const unreviewed=priceTileSpacer(line,'floor-tiles',{groutWidthMm:2.5});assert.equal(unreviewed.material.ean,undefined);assert.equal(unreviewed.material.gtin,undefined);
 const ambiguous=priceTileSpacer({...line,material:{...line.material,unit:'opak.'}},'floor-tiles',{groutWidthMm:3});assert.equal(ambiguous.material.ean,undefined);assert.equal(ambiguous.material.unit,'opak.');assert.equal(ambiguous.material.category,'tile-spacer-review');
});

test('common basket preserves measured width and excludes owned spacers without bringing them back after a tile choice',()=>{
 const result=calculate(),project:Project={id:'a',name:'Podłoga',jobId:result.jobId,jobName:'Płytki',categoryId:'tiles',measurements:result.measurements,calculationResult:result,status:'planning',createdAt:'',updatedAt:''};
 const owned={id:'owned',projectId:'a',materialId:'tile-crosses',quantity:223,unit:'szt',owned:true,purchased:false,itemType:'material'} as ShoppingItem;
 const baseline=buildRenovationBasket([project],['a'],'standard',{});assert.equal(baseline.stages[0].materials.find(row=>row.material.id==='tile-crosses')!.material.ean,'5905061016869');
 const selected=buildRenovationBasket([project],['a'],'standard',{a:[owned]},{},{},{},{},{a:[{from:'mat-gres-paradyz-petro-grey-60x60',to:'mat-gres-rekt-paradyz-u117-grey-60x60',use:'floor'}]});
 assert.equal(selected.excludedMaterials,1);assert.ok(!selected.stages[0].materials.some(row=>row.material.id==='tile-crosses'));
});
