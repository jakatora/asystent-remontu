import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { MATERIAL_PRICES } from '@/data/prices/materials';
import type { Project, ShoppingItem } from '@/types/domain';
import { toPricingStageInput, type PricingStageInput } from './pricingApi';
import { applyTileChoices, parseTileChoices, TILE_PRODUCTS, tileRequirements, type TileChoice } from './tileChoice';
import { buildRenovationBasket } from './renovationBasket';

const nati='mat-tile-wall-paradyz-nati-bianco-25x40',tamara='mat-tile-wall-tamara-white-25x40',petro='mat-gres-paradyz-petro-grey-60x60',u117='mat-gres-rekt-paradyz-u117-grey-60x60',guigliano='mat-gres-guigliano-1m2';
const wallChoice:TileChoice={from:nati,to:tamara,use:'wall'};
const calc=(job='wall-tiles-bathroom',joint=2)=>calculatorEngine.calculate(getJobById(job)!,{wallArea:10,floorArea:10,tileWidthCm:30,tileHeightCm:30,groutWidthMm:joint,wastePercent:10});
const save=(choices:unknown[])=>JSON.stringify({version:1,choices});

test('tile metadata separates wall-only products and retains the real physical packs',()=>{
 assert.deepEqual(TILE_PRODUCTS.find(row=>row.id===tamara)!.uses,['wall']);assert.equal(TILE_PRODUCTS.find(row=>row.id===tamara)!.ean,'5907518303911');
 for(const[id,size]of [[nati,1.2],[petro,1.44],[u117,1.43],[tamara,1.5]] as const)assert.equal(MATERIAL_PRICES.find(row=>row.id===id)!.packageSize,size);
 assert.equal(MATERIAL_PRICES.find(row=>row.id===nati)!.pricePerPackage,89.86);
});

test('preferences cannot place wall-only Tamara or Nati on a floor, or choose a model without a surface',()=>{
 assert.deepEqual(parseTileChoices(save([wallChoice])),[wallChoice]);
 for(const row of [{from:petro,to:tamara,use:'floor'},{from:petro,to:nati,use:'floor'},{from:nati,to:tamara},{...wallChoice,use:'roof'},{...wallChoice,to:'unknown'},{...wallChoice,to:nati}])assert.throws(()=>parseTileChoices(save([row])));
 assert.throws(()=>parseTileChoices(save([wallChoice,wallChoice])));
});

test('one common SKU can be chosen differently for floors and walls without leaking either choice',()=>{
 const product=TILE_PRODUCTS.find(row=>row.id===guigliano)!;
 const line={material:{id:'manual',name:product.productLabel,unit:'m2',category:'tile',ean:product.ean},quantity:3};
 const stages:PricingStageInput[]=[{jobId:'floor-tiles',materials:[line]},{jobId:'wall-tiles-bathroom',materials:[line]}];
 assert.equal(tileRequirements(stages).length,2);
 const chosen=applyTileChoices(stages,[{from:guigliano,to:tamara,use:'wall'},{from:guigliano,to:u117,use:'floor'}]);
 assert.equal(chosen[0].materials[0].material.ean,'5904584158261');assert.equal(chosen[1].materials[0].material.ean,'5907518303911');
});

test('a changed wall tile keeps raw area and recalculates the explicitly accepted adhesive, grout and two-mm spacers for the new format',()=>{
 const result=calc(),input=[toPricingStageInput(result)],before=JSON.stringify({result,input}),stage=applyTileChoices(input,[wallChoice])[0];
 const tiles=stage.materials.find(row=>row.material.id==='wall-tiles')!;
 assert.equal(tiles.quantity,11);assert.equal(tiles.packs,undefined);assert.equal(tiles.material.ean,'5907518303911');
 const adhesive=stage.materials.find(row=>row.material.id==='wall-tile-adhesive')!;assert.equal(adhesive.quantity,25.3);assert.equal(adhesive.material.ean,'5905400658866');
 const grout=stage.materials.find(row=>row.material.id==='wall-grout')!;assert.equal(grout.quantity,1.816815);assert.equal(grout.material.ean,'5905400572254');
 const spacers=stage.materials.find(row=>row.material.id==='wall-crosses')!;assert.equal(spacers.quantity,200);assert.equal(spacers.material.unit,'szt');assert.equal(spacers.material.ean,'5905061016845');
 assert.equal(stage.measurements!.tileWidthCm,25);assert.equal(stage.measurements!.tileThicknessMm,7.7);assert.equal(stage.measurements!.wallArea,10);
 assert.equal(JSON.stringify({result,input}),before);
});

test('an unreviewed spacer width remains unpriced rather than charging the wrong two-mm bag',()=>{
 const stage=applyTileChoices([toPricingStageInput(calc('floor-tiles',5))],[{from:petro,to:u117,use:'floor'}])[0];
 const spacers=stage.materials.find(row=>row.material.id==='tile-crosses')!;assert.equal(spacers.material.ean,undefined);assert.equal(spacers.material.category,'tile-spacer-review');assert.match(spacers.material.name,/5 mm/);
 const grout=stage.materials.find(row=>row.material.id==='grout')!;assert.equal(grout.quantity,2.42809365);
});

test('project tile choices recheck the adhesive product and preserve saved calculations',()=>{
 const result=calc();const project:Project={id:'a',name:'Ściana',jobId:result.jobId,jobName:'Płytki',categoryId:'tiles',measurements:result.measurements,calculationResult:result,status:'planning',createdAt:'',updatedAt:''};
 const owned={id:'glue',projectId:'a',materialId:'wall-tile-adhesive',quantity:50,unit:'kg',owned:true,purchased:false,itemType:'material'} as ShoppingItem;
 const before=JSON.stringify(project),basket=buildRenovationBasket([project],['a'],'standard',{a:[owned]},{},{},{},{},{a:[wallChoice]});
 assert.equal(basket.stages[0].materials.find(row=>row.material.id==='wall-tiles')!.material.ean,'5907518303911');
 assert.equal(basket.stages[0].materials.find(row=>row.material.id==='wall-tile-adhesive')?.material.ean,'5905400658866');assert.equal(basket.excludedMaterials,0);assert.equal(JSON.stringify(project),before);
});

test('extra tile-only items keep their exact demand and do not invent room geometry or installation materials',()=>{
 const product=TILE_PRODUCTS.find(row=>row.id===nati)!;
 const stage:PricingStageInput={jobId:'basket-extras',materials:[{material:{id:'extra:one',name:product.productLabel,category:'tile',unit:'m2',ean:product.ean},quantity:4.8}]};
 const chosen=applyTileChoices([stage],[wallChoice])[0];assert.equal(chosen.materials.length,1);assert.equal(chosen.materials[0].quantity,4.8);assert.equal(chosen.materials[0].material.ean,'5907518303911');assert.equal(chosen.measurements,undefined);
});
