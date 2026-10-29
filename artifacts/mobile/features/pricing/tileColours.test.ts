import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from '@/features/calculator/engine';
import {getJobById} from '@/features/content/registry';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import {applyTileChoices,parseTileChoices,TILE_PRODUCTS,type TileChoice} from './tileChoice';
import {toPricingStageInput} from './pricingApi';
import {buildRenovationBasket} from './renovationBasket';
import type {Project,ShoppingItem} from '@/types/domain';
const petro='mat-gres-paradyz-petro-grey-60x60',ids=['mat-gres-rekt-paradyz-u117-light-grey-60x60','mat-gres-rekt-paradyz-u117-light-beige-60x60'];
const calculation=(joint=3)=>calculatorEngine.calculate(getJobById('floor-tiles')!,{floorArea:10,tileWidthCm:30,tileHeightCm:30,wastePercent:15,groutWidthMm:joint});
const choice=(to:string):TileChoice=>({from:petro,to,use:'floor'});

test('two new floor/wall colour choices retain distinct EANs, real four-tile packs and manufacturer joint guidance',()=>{
 for(const[id,ean]of ids.map((id,i)=>[id,i===0?'5904584158285':'5904584158247'])){const p=TILE_PRODUCTS.find(p=>p.id===id)!,ref=MATERIAL_PRICES.find(r=>r.id===id)!;assert.equal(p.ean,ean);assert.equal(p.packageSize,1.43);assert.equal(p.depthMm,8);assert.equal(p.minJointMm,1.5);assert.deepEqual(p.uses,['wall','floor']);assert.equal(ref.pricePerPackage,107.29);assert.ok(PRODUCT_PHOTOS.find(p=>p.ids.includes(id))?.imageUrl.includes(iOf(id)===0?'light-grey':'light-beige'));assert.deepEqual(parseTileChoices(JSON.stringify({version:1,choices:[choice(id)]})),[choice(id)]);}
});
const iOf=(id:string)=>ids.indexOf(id);
test('a chosen Ennis colour preserves11.5rawm², but recalculates its47.3kg adhesive, grout and56spacers for59.8cm tiles',()=>{
 for(const id of ids){const calc=calculation(),input=toPricingStageInput(calc),before=JSON.stringify({calc,input}),stage=applyTileChoices([input],[choice(id)])[0],line=(id:string)=>stage.materials.find(l=>l.material.id===id)!;
  assert.equal(line('tiles').quantity,11.5);assert.equal(line('tiles').packs,undefined);assert.equal(line('tiles').material.ean,id===ids[0]?'5904584158285':'5904584158247');assert.equal(line('tile-adhesive').quantity,47.3);assert.equal(line('tile-adhesive').material.ean,'5905400658866');assert.equal(line('grout').quantity,1.45685619);assert.equal(line('grout').material.ean,'5905400572254');assert.equal(line('tile-crosses').quantity,56);assert.equal(line('tile-crosses').material.ean,'5905061016869');assert.equal(stage.measurements!.tileWidthCm,59.8);assert.equal(stage.measurements!.tileThicknessMm,8);assert.equal(JSON.stringify({calc,input}),before);
 }
});
test('a one-mm joint is not silently widened or priced as a complete kit below the manufacturer recommendation',()=>{
 for(const id of ids){const stage=applyTileChoices([toPricingStageInput(calculation(1))],[choice(id)])[0];assert.equal(stage.measurements!.groutWidthMm,1);for(const material of ['grout','tile-crosses']){const l=stage.materials.find(l=>l.material.id===material)!;assert.equal(l.material.ean,undefined);assert.equal(l.material.gtin,undefined);assert.equal(l.material.unit,'pozycja');assert.equal(l.material.category,'tile-joint-review');assert.match(l.material.name,/1,5 mm/);}assert.equal(stage.materials.find(l=>l.material.id==='tiles')!.quantity,11.5);}
 const valid=applyTileChoices([toPricingStageInput(calculation(1.5))],[choice(ids[0])])[0];assert.equal(valid.materials.find(l=>l.material.id==='grout')!.material.ean,'5905400572254');assert.equal(valid.materials.find(l=>l.material.id==='tile-crosses')!.material.category,'tile-spacer-review');
});
test('owning the old Petro model cannot remove the newly selected colour from the shared renovation basket',()=>{
 const calc=calculation(),p:Project={id:'qa',name:'Floor',jobId:calc.jobId,jobName:'Tiles',categoryId:'floor-tiles',measurements:calc.measurements,calculationResult:calc,status:'planning',createdAt:'',updatedAt:''};
 const owned={id:'old',projectId:'qa',materialId:'tiles',name:'Petro Grey gatunek2',quantity:20,unit:'m2',owned:true,purchased:false,itemType:'material'} as ShoppingItem;
 const result=buildRenovationBasket([p],['qa'],'standard',{qa:[owned]},{},{},{},{},{qa:[choice(ids[0])]});assert.equal(result.excludedMaterials,0);assert.equal(result.stages[0].materials.find(l=>l.material.id==='tiles')!.quantity,11.5);assert.equal(result.stages[0].materials.find(l=>l.material.id==='tiles')!.material.ean,'5904584158285');
});
