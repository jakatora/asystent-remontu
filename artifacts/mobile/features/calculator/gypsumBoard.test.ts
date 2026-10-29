import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { GYPSUM_MODEL, gypsumQuantity,gypsumInputVisible,withGypsumMeasurement } from './gypsumBoard';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { getProductPhoto } from '@/data/products/photos';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { upgradeCalculation, projectShopping } from './upgrades';
import { applyProjectShopping } from '@/features/pricing/projectShoppingInput';
import { parseMeasurements } from '@/shared/lib/measurements';
import type { ShoppingItem } from '@/types/domain';

const wall=getJobById('gypsum-wall')!,ceiling=getJobById('gypsum-ceiling')!;
const calculate=(id='gypsum-wall',more:Record<string,number>={})=>calculatorEngine.calculate(getJobById(id)!,{wallArea:10,gypsumWallHeight:2.5,ceilingArea:10,perimeter:id==='gypsum-wall'?13:14,...more});
test('SUPER C3 is an explicit different UD profile, whose quantity stays unknown until its fit is confirmed',()=>{
 const old=calculate('gypsum-ceiling'),waiting=calculate('gypsum-ceiling',{gypsumUdProfile:1}),chosen=calculate('gypsum-ceiling',{gypsumUdProfile:1,gypsumUdFit:1});
 const ud=(c:typeof chosen)=>c.materials.find(l=>l.material.id==='profile-ud')!;
 const oldMaterial=ud(old).material,waitingMaterial=ud(waiting).material;assert.ok('ean' in oldMaterial);assert.ok('ean' in waitingMaterial);
 assert.equal(oldMaterial.ean,'5907651698905');assert.equal(waitingMaterial.ean,'5907651691197');assert.equal(ud(waiting).quantityKnown,false);
 assert.equal(ud(chosen).rawQuantity,15.4);assert.equal(ud(chosen).packs,6);assert.equal(ud(chosen).cost,67.14);assert.equal(ud(chosen).material.packaging?.size,3);
 for(const tier of ['economy','standard','better'] as const){const row=toPricingStageInput(chosen,tier).materials.find(l=>l.material.id==='profile-ud')!;assert.equal(row.material.ean,'5907651691197');assert.equal(row.quantity,15.4);const ref=getMaterialsForJob(chosen.jobId,tier,chosen.measurements).find(r=>r.id==='mat-profile-ud30-norgips-super-c3-3m')!;assert.ok(ref);assert.equal(resolveMaterialQuantity(ref,old),null);assert.equal(resolveMaterialQuantity(ref,waiting),null);assert.ok(getProductPhoto(row.material));}
 for(const value of [NaN,0.5,2])assert.equal(gypsumQuantity('gypsum-ceiling','profile-ud',{ceilingArea:10,perimeter:14,gypsumUdProfile:value,gypsumUdFit:1}),null);
});
test('changing UD or CD clears SUPER fit and owned C2 stock cannot silently cover C3',()=>{
 const fields={gypsumUdProfile:'1',gypsumUdFit:'1',gypsumCdProfile:'0'};
 assert.equal(withGypsumMeasurement('gypsum-ceiling',fields,'gypsumUdProfile',0).gypsumUdFit,'0');assert.equal(withGypsumMeasurement('gypsum-ceiling',fields,'gypsumCdProfile',1).gypsumUdFit,'0');assert.equal(withGypsumMeasurement('gypsum-ceiling',fields,'gypsumUdProfile',1).gypsumUdFit,'1');
 assert.equal(gypsumInputVisible('gypsum-ceiling','gypsumUdFit',{}),false);assert.equal(gypsumInputVisible('gypsum-ceiling','gypsumUdFit',fields),true);
 const old=calculate('gypsum-ceiling'),line=old.materials.find(l=>l.material.id==='profile-ud')!,item:ShoppingItem={id:'ud',projectId:'p',materialId:'profile-ud',name:line.material.name,unit:'mb',quantity:18,estimatedPrice:0,owned:true,purchased:true,itemType:'material',tier:'standard',createdAt:''};assert.equal(projectShopping([item],old)[0].owned,true);
 const next=calculate('gypsum-ceiling',{gypsumUdProfile:1,gypsumUdFit:1}),review=projectShopping([item],next)[0];assert.equal(review.owned,false);assert.equal(review.purchased,false);assert.equal(review.needsQuantityConfirmation,true);assert.ok(applyProjectShopping(toPricingStageInput(next),next,'p',[item]).stage.materials.some(l=>l.material.id==='profile-ud'));
});
test('wall counts both board faces, 8 whole 3m studs and UW only along floor and ceiling',()=>{
  const c=calculate(),line=(id:string)=>c.materials.find(row=>row.material.id===id)!;
  assert.equal(c.quantityModel,GYPSUM_MODEL);
  assert.ok(c.warnings.some(row=>row.message.includes('Niepełna wycena: 2 pozycji')),'reference amount cannot masquerade as the complete wall cost');
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

test('paper and fleece use the same manufacturer allowance but their own EAN and whole rolls in all tiers',()=>{
 for(const id of ['gypsum-wall','gypsum-ceiling'])for(const tier of ['economy','standard','better'] as const){
  const a=calculate(id),b=calculate(id,{gypsumJointTape:1}),key=id==='gypsum-wall'?'gk-tape':'ceiling-tape',paper=a.materials.find(l=>l.material.id===key)!,fleece=b.materials.find(l=>l.material.id===key)!;
  assert.ok('ean' in paper.material);assert.ok('ean' in fleece.material);
  assert.equal(paper.rawQuantity,fleece.rawQuantity);assert.equal(paper.material.ean,'5907651699933');assert.equal(paper.material.packaging?.size,75);assert.equal(fleece.material.ean,'5907651699926');assert.equal(fleece.material.packaging?.size,25);assert.equal(fleece.material.packaging?.purchaseUnit,'rolka');assert.equal(fleece.packs,id==='gypsum-wall'?2:1);
  const refs=getMaterialsForJob(id,tier,b.measurements),ref=refs.find(r=>r.id==='mat-gypsum-fleece-norgips-50x25')!;assert.ok(ref);assert.equal(resolveMaterialQuantity(ref,b)?.quantity,fleece.rawQuantity);assert.ok(!refs.some(r=>r.id==='mat-gypsum-paper-norgips-50x75'));
 }
 const invalid=calculate('gypsum-wall',{gypsumJointTape:5});assert.equal(invalid.materials.find(l=>l.material.id==='gk-tape')!.quantityKnown,false);
});
test('Rigips paper tape is an explicit 75 m choice with its own EAN and photograph',()=>{
 for(const id of ['gypsum-wall','gypsum-ceiling']){
  const norgips=calculate(id),rigips=calculate(id,{gypsumJointTape:2});
  const key=id==='gypsum-wall'?'gk-tape':'ceiling-tape';
  const original=norgips.materials.find(line=>line.material.id===key)!;
  const selected=rigips.materials.find(line=>line.material.id===key)!;
  assert.equal(selected.rawQuantity,original.rawQuantity);
  assert.ok('ean' in selected.material);
  assert.equal(selected.material.ean,'5905637118010');
  assert.equal(selected.material.packaging?.size,75);
  assert.match(getProductPhoto({ean:selected.material.ean})??'',/sklep\.sewera\.pl\/photo\/25025\//);
  const references=getMaterialsForJob(id,'standard',rigips.measurements);
  assert.ok(references.some(ref=>ref.id==='mat-gypsum-paper-rigips-50x75'));
  assert.ok(!references.some(ref=>ref.id==='mat-gypsum-paper-norgips-50x75'));
 }
});
test('Rigips acoustic tapes are explicit 50 mm wall and 30 mm ceiling choices with separate photos',()=>{
 for(const [job,key,field,ean,refId,image] of [
  ['gypsum-wall','wall-acoustic-tape','gypsumWallAcousticBrand','5905637113503','mat-gypsum-acoustic-rigips-50x30','191957'],
  ['gypsum-ceiling','ceiling-acoustic-tape','gypsumCeilingAcousticBrand','5905637148819','mat-gypsum-acoustic-rigips-30x30','191959'],
 ]){
  const before=calculate(job),after=calculate(job,{[field]:1});
  const original=before.materials.find(line=>line.material.id===key)!,selected=after.materials.find(line=>line.material.id===key)!;
  assert.equal(selected.rawQuantity,original.rawQuantity);
  assert.ok('ean' in selected.material);
  assert.equal(selected.material.ean,ean);
  assert.equal(selected.material.packaging?.size,30);
  assert.equal(selected.material.packaging?.purchaseUnit,'rolka');
  assert.match(getProductPhoto({ean})??'',new RegExp(`/photo/${image}/`));
  for(const tier of ['economy','standard','better'] as const){
   const stage=toPricingStageInput(after,tier),row=stage.materials.find(line=>line.material.id===key)!;
   assert.ok('ean' in row.material);assert.equal(row.material.ean,ean);
   const refs=getMaterialsForJob(job,tier,after.measurements);
   assert.ok(refs.some(ref=>ref.id===refId));
   assert.ok(!refs.some(ref=>ref.id===refId.replace('rigips','norgips')));
  }
  const owned:ShoppingItem={id:key,projectId:'p',materialId:key,name:original.material.name,quantity:original.rawQuantity??0,unit:'m',estimatedPrice:0,owned:true,purchased:true,itemType:'material',tier:'standard',createdAt:''};
  assert.equal(projectShopping([owned],after)[0].owned,false);
  assert.equal(projectShopping([owned],after)[0].needsQuantityConfirmation,true);
  assert.equal(calculate(job,{[field]:2}).materials.find(line=>line.material.id===key)!.quantityKnown,false);
 }
});
test('an owned paper roll cannot cover fleece; old explicit CW EAN is not silently replaced with current retail profile',()=>{
 const a=calculate(),b=calculate('gypsum-wall',{gypsumJointTape:1}),line=a.materials.find(l=>l.material.id==='gk-tape')!,item:ShoppingItem={id:'t',projectId:'p',materialId:'gk-tape',name:line.material.name,quantity:75,unit:'m',estimatedPrice:0,owned:true,purchased:false,itemType:'material',tier:'standard',createdAt:''};
 assert.equal(projectShopping([item],a)[0].owned,true);assert.equal(projectShopping([item],b)[0].owned,false);
 const ref=getMaterialsForJob('gypsum-wall','standard',a.measurements).find(r=>r.id==='mat-profile-cw50-norgips-06-3m-retail')!;
 const old={...a,materials:a.materials.map(l=>l.material.id==='profile-cw'?{...l,material:{...l.material,ean:'5907651698165'}}:l)};
 assert.equal(resolveMaterialQuantity(ref,old),null);const cw=a.materials.find(l=>l.material.id==='profile-cw')!.material;assert.ok('ean' in cw);assert.equal(cw.ean,'5907651698912');
});
