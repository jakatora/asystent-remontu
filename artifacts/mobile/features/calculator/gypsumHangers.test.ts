import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import {gypsumInputVisible,gypsumReference,reviewGypsumShopping,withGypsumMeasurement} from './gypsumBoard';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {buildRenovationBasket} from '@/features/pricing/renovationBasket';
import {searchBasketExtraReferences} from '@/features/pricing/basketExtras';
import type {Project,ShoppingItem} from '@/types/domain';

const calc=(m:Record<string,number>={})=>calculatorEngine.calculate(getJobById('gypsum-ceiling')!,{ceilingArea:10,perimeter:14,...m});
const hanger=(c:ReturnType<typeof calc>)=>c.materials.find(l=>l.material.id==='hanger')!;
test('saved default ceiling keeps Norgips identity and allowance; Rigips has two distinct native piece identities and photos',()=>{
 const old=hanger(calc());assert.equal(old.rawQuantity,15);assert.equal(old.material.name,'Wieszak płaski Norgips ES 60/75, 1 szt.');assert.ok('ean'in old.material);assert.equal(old.material.ean,'5907651699650');
 for(const [choice,refId,ean,price]of [[1,'mat-gypsum-hanger-rigips-es6075','5905637101074',1.38],[2,'mat-gypsum-hanger-rigips-es60125','5905637101081',1.75]]as const){
  const ref=MATERIAL_PRICES.find(r=>r.id===refId)!,photo=PRODUCT_PHOTOS.find(r=>r.ids.includes(refId))!;assert.equal(ref.packageSize,1);assert.equal(ref.packageUnit,'szt');assert.equal(ref.pricePerPackage,price);assert.equal(photo.ean,ean);assert.equal(photo.sourceUrl,ref.sourceUrl);assert.ok(photo.imageUrl.includes(choice===1?'6075':'60125'));
  assert.equal(gypsumReference('hanger',{gypsumHanger:choice}),refId);assert.ok(searchBasketExtraReferences(ean).some(r=>r.id===refId));
 }
});
test('Rigips uses an integral project count plus explicit reserve, never the Norgips per-area allowance',()=>{
 for(const choice of [1,2])for(const tier of ['economy','standard','better']as const){
  const c=JSON.parse(JSON.stringify(calc({gypsumHanger:choice,gypsumHangerCount:26}))),line=hanger(c);assert.equal(line.quantityKnown,true);assert.equal(line.rawQuantity,29);assert.equal(line.packs,29);assert.equal(line.material.packaging?.size,1);assert.equal(line.cost,choice===1?40.02:50.75);assert.doesNotMatch(line.material.notes!,/Norma 1,3/);
  const ref=getMaterialsForJob(c.jobId,tier,c.measurements).find(r=>r.id===(choice===1?'mat-gypsum-hanger-rigips-es6075':'mat-gypsum-hanger-rigips-es60125'))!;
  assert.equal(resolveMaterialQuantity(ref,c)?.quantity,29);const staged=toPricingStageInput(c,tier).materials.find(l=>l.material.id==='hanger')!;assert.equal(staged.quantity,29);assert.equal(staged.material.ean,choice===1?'5905637101074':'5905637101081');assert.equal(staged.material.unit,'szt');
  assert.equal(hanger(calc({gypsumHanger:choice,gypsumHangerCount:26,gypsumReservePercent:0})).rawQuantity,26);
 }
 for(const m of [{gypsumHanger:1},{gypsumHanger:2},{gypsumHanger:3,gypsumHangerCount:26},{gypsumHanger:1,gypsumHangerCount:0},{gypsumHanger:1,gypsumHangerCount:1.5},{gypsumHanger:2,gypsumHangerCount:10001}] as Record<string,number>[]){
  const c=calc(m);assert.equal(hanger(c).quantityKnown,false);assert.equal(toPricingStageInput(c).materials.find(l=>l.material.id==='hanger')!.material.unit,'pozycja');
 }
});
test('project count appears only for Rigips and is cleared on a changed hanger or CD profile',()=>{
 const current={gypsumHanger:'1',gypsumHangerCount:'26',gypsumCdProfile:'0'};
 assert.equal(gypsumInputVisible('gypsum-ceiling','gypsumHangerCount',{}),false);assert.equal(gypsumInputVisible('gypsum-ceiling','gypsumHangerCount',{gypsumHanger:'1'}),true);assert.equal(gypsumInputVisible('gypsum-ceiling','gypsumHangerCount',{gypsumHanger:2}),true);assert.equal(gypsumInputVisible('gypsum-ceiling','gypsumHangerCount',{gypsumHanger:3}),false);
 assert.equal(withGypsumMeasurement('gypsum-ceiling',current,'gypsumHanger',2).gypsumHangerCount,undefined);assert.equal(withGypsumMeasurement('gypsum-ceiling',current,'gypsumCdProfile',1).gypsumHangerCount,undefined);assert.equal(withGypsumMeasurement('gypsum-ceiling',current,'gypsumHanger',1).gypsumHangerCount,'26');assert.equal(current.gypsumHangerCount,'26');
});
test('both rooms retain the selected exact hanger in the renovation basket and changing part clears previous ownership',()=>{
 const first=calc({gypsumHanger:1,gypsumHangerCount:26}),second=calc({gypsumHanger:1,gypsumHangerCount:10});const project=(id:string,c:ReturnType<typeof calc>)=>({id,name:id,jobId:'gypsum-ceiling',calculationResult:c})as Project;
 const result=buildRenovationBasket([project('a',first),project('b',second)],['a','b'],'standard'),lines=result.stages.flatMap(s=>s.materials).filter(l=>l.material.id==='hanger');assert.equal(lines.length,2);assert.equal(lines.reduce((n,l)=>n+l.quantity,0),40);assert.ok(lines.every(l=>l.material.ean==='5905637101074'));
 const item={id:'h',projectId:'a',itemType:'material',materialId:'hanger',name:hanger(first).material.name,unit:'szt',quantity:29,owned:true,purchased:true}as ShoppingItem;
 const same=reviewGypsumShopping([item],first)[0];assert.equal(same.owned,true);const changed=reviewGypsumShopping([item],calc({gypsumHanger:2,gypsumHangerCount:26}))[0];assert.equal(changed.owned,false);assert.equal(changed.purchased,false);assert.equal(changed.needsQuantityConfirmation,true);
});
