import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { GYPSUM_MODEL, gypsumQuantity } from './gypsumBoard';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { upgradeCalculation, projectShopping } from './upgrades';
import { applyProjectShopping } from '@/features/pricing/projectShoppingInput';
import { parseMeasurements } from '@/shared/lib/measurements';
import { getProductPhoto } from '@/data/products/photos';
import type { ShoppingItem } from '@/types/domain';

const wall=getJobById('gypsum-wall')!,ceiling=getJobById('gypsum-ceiling')!;
const calculate=(id='gypsum-wall',more:Record<string,number>={})=>calculatorEngine.calculate(getJobById(id)!,{wallArea:10,gypsumWallHeight:2.5,ceilingArea:10,perimeter:id==='gypsum-wall'?13:14,...more});
test('wall counts both board faces, 8 whole 3m studs and UW only along floor and ceiling',()=>{
  const c=calculate(),line=(id:string)=>c.materials.find(row=>row.material.id===id)!;
  assert.equal(c.quantityModel,GYPSUM_MODEL);
  assert.ok(c.warnings.some(row=>row.message.includes('Niepełna wycena: 6 pozycji')),'reference amount cannot masquerade as the complete wall cost');
  assert.equal(line('gk-board').rawQuantity,22);assert.equal(line('gk-board').packs,8);
  assert.equal(line('profile-cw').rawQuantity,24);assert.equal(line('profile-cw').packs,8);
  assert.equal(line('profile-uw').rawQuantity,8.8);assert.equal(line('wall-acoustic-tape').rawQuantity,14.3);
  assert.equal(line('mineral-wool').rawQuantity,11);assert.equal(line('mineral-wool').material.packaging?.size,14.4);
  assert.equal(line('gk-filler').rawQuantity,6.6);assert.equal(line('gk-tape').rawQuantity,28.6);
  assert.equal(line('gk-screws').rawQuantity,264);assert.equal(line('dowels-uw').rawQuantity,25);
  assert.ok(!toPricingStageInput(c).materials.some(row=>row.material.id==='gypsum-openings'));
  assert.equal(gypsumQuantity('gypsum-wall','profile-cw',{wallArea:1,gypsumWallHeight:0.5}),3,'one 3m stock length provides five complete 0.5m studs; no joining offcuts');
});
test('ceiling uses double-level CD/ES norms and separate fasteners rather than plaster and sandpaper formulas',()=>{
  const c=calculate('gypsum-ceiling',{gypsumCeilingSubstrate:1}),line=(id:string)=>c.materials.find(row=>row.material.id===id)!;
  assert.equal(line('profile-cd').rawQuantity,36.3);assert.equal(line('profile-ud').rawQuantity,15.4);
  assert.equal(line('hanger').rawQuantity,15);assert.equal(line('ceiling-cross').rawQuantity,28);assert.equal(line('ceiling-longitudinal').rawQuantity,7);
  assert.equal(line('ceiling-metal-screws').rawQuantity,132);assert.equal(line('ceiling-steel-anchors').rawQuantity,15);
  assert.equal(line('ceiling-wall-dowels').rawQuantity,25);assert.equal(line('gk-screws-ceiling').rawQuantity,275);
  assert.equal(line('ceiling-filler').rawQuantity,3.3);assert.equal(line('ceiling-tape').rawQuantity,14.3);
  assert.equal(gypsumQuantity('gypsum-ceiling','gk-screws-ceiling',{ceilingArea:2}),55,'floating point must not add a 56th screw');
});
test('unknown overhead substrate and door reinforcements stay visible as missing requirements',()=>{
  const c=calculate('gypsum-ceiling'),line=c.materials.find(row=>row.material.id==='ceiling-steel-anchors')!;
  assert.equal(line.quantityKnown,false);
  assert.equal(toPricingStageInput(c).materials.find(row=>row.material.id==='ceiling-steel-anchors')!.material.unit,'pozycja');
  assert.ok(toPricingStageInput(c).materials.some(row=>row.material.id==='ceiling-wall-dowels'));
  const door=toPricingStageInput(calculate('gypsum-wall',{gypsumOpenings:1}));
  assert.equal(door.materials.find(row=>row.material.id==='gypsum-openings')!.material.unit,'pozycja');
  assert.equal(gypsumQuantity('gypsum-ceiling','ceiling-acoustic-tape',{ceilingArea:10,perimeter:14,gypsumCeilingAcoustic:0}),0);
});
test('each quality tier preserves exact board format, ready filler and 50mm wool; incompatible mappings do not leak',()=>{
  for(const job of [wall,ceiling])for(const size of [0,1])for(const tier of ['economy','standard','better'] as const){
    const c=calculate(job.id,{gypsumBoardSize:size,gypsumCeilingSubstrate:1}),input=toPricingStageInput(c,tier);
    const board=input.materials.find(row=>['gk-board','gk-ceiling'].includes(row.material.id))!;
    assert.equal(board.material.ean,size===0?'5907651690442':'5907651690879');
    const refs=getMaterialsForJob(job.id,tier,c.measurements);
    assert.ok(refs.every(row=>!row.id.includes('ud27')&&!row.id.includes('akuplyta-10cm')&&!row.id.includes('wkretmet')));
    assert.ok(input.materials.some(row=>['gk-filler','ceiling-filler'].includes(row.material.id)&&row.material.ean==='5907651699056'));
    for(const row of input.materials.filter(row=>row.material.ean&&row.material.ean!=='5907651698165'))assert.ok(getProductPhoto(row.material));
    const detail=calculatorEngine.calculateDetailed(job,c.measurements);
    assert.deepEqual(c.materials.map(row=>[row.rawQuantity,row.quantity,row.cost]),detail.materials.map(row=>[row.rawQuantity,row.quantity,row.cost]));
    assert.ok(job.materials.every(row=>!('formula'in row)));
  }
});
test('invalid dimensions, format and finish cannot become complete material quantities',()=>{
  const invalidBase: Record<string,number>[]=[{wallArea:0},{wallArea:NaN},{gypsumBoardSize:3},{gypsumFinish:2},{gypsumReservePercent:Infinity}];
  const invalidStructure: Record<string,number>[]=[{gypsumWallHeight:3.1},{gypsumWallHeight:0},{perimeter:9}];
  for(const values of invalidBase)assert.equal(calculate('gypsum-wall',values).materials[0].quantityKnown,false);
  for(const values of invalidStructure)assert.equal(calculate('gypsum-wall',values).materials.find(row=>row.material.id==='profile-cw')!.quantityKnown,false);
  const raw={wallArea:'10',gypsumWallHeight:'2,5',perimeter:''};assert.equal(parseMeasurements(wall,raw).errors.length,0);
  assert.ok(parseMeasurements(wall,{...raw,perimeter:'9'}).errors.some(row=>row.id==='perimeter'));
  assert.ok(parseMeasurements(wall,{...raw,gypsumWallHeight:''}).errors.some(row=>row.id==='gypsumWallHeight'));
});
test('legacy records are immutable and explicitly reviewed, with missing accessories restored',()=>{
  for(const job of [wall,ceiling]){
    const c=calculate(job.id),old={...c,quantityModel:undefined,materials:c.materials.slice(0,7)},before=JSON.stringify(old),review=upgradeCalculation(old)!;
    assert.equal(JSON.stringify(old),before);assert.equal(review.materials.length,job.materials.length);assert.ok(review.materials.every(row=>row.quantityKnown===false));
    assert.deepEqual(upgradeCalculation(review),review);
    assert.equal(resolveMaterialQuantity(getMaterialsForJob(job.id,'standard',c.measurements)[0],old),null);
    assert.ok(toPricingStageInput(old).materials.every(row=>row.material.unit==='pozycja'));
  }
});
test('owned stock must cover exact current identity and raw requirement; switching board format restores purchase',()=>{
  const c=calculate(),line=c.materials[0],item:ShoppingItem={id:'i',projectId:'p',materialId:line.material.id,name:line.material.name,quantity:24.96,unit:'m2',estimatedPrice:0,owned:true,purchased:false,itemType:'material',tier:'standard',createdAt:''};
  assert.equal(projectShopping([item],c)[0].owned,true);
  assert.ok(!applyProjectShopping(toPricingStageInput(c),c,'p',[item]).stage.materials.some(row=>row.material.id==='gk-board'));
  for(const bad of [{...item,quantity:11},{...item,unit:'płyta'},{...item,name:'Inna płyta'}])assert.ok(applyProjectShopping(toPricingStageInput(c),c,'p',[bad]).stage.materials.some(row=>row.material.id==='gk-board'));
  const next=calculate('gypsum-wall',{gypsumBoardSize:1});assert.ok(applyProjectShopping(toPricingStageInput(next),next,'p',[item]).stage.materials.some(row=>row.material.id==='gk-board'));
});
