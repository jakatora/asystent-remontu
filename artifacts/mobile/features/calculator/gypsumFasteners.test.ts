import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {gypsumQuantity,gypsumReference} from './gypsumBoard';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {projectShopping} from './upgrades';
import type {ShoppingItem} from '@/types/domain';
const calculate=(jobId='gypsum-wall',more:Record<string,number>={})=>calculatorEngine.calculate(getJobById(jobId)!,{wallArea:10,gypsumWallHeight:2.5,ceilingArea:10,perimeter:jobId==='gypsum-wall'?13:14,gypsumFasteners:1,gypsumPerimeterFixings:1,...more});
test('explicit Koelner choice prices a full 1000-screw carton and 200-fixing carton; defaults keep the previous selection',()=>{
 const c=calculate(),screw=c.materials.find(l=>l.material.id==='gk-screws')!,fixing=c.materials.find(l=>l.material.id==='dowels-uw')!;
 assert.equal(screw.rawQuantity,264);assert.equal(screw.packs,1);assert.equal(screw.cost,24.89);assert.equal(screw.material.packaging?.size,1000);
 assert.equal(fixing.rawQuantity,25);assert.equal(fixing.packs,1);assert.equal(fixing.cost,21.9);assert.equal(fixing.material.packaging?.size,200);
 assert.ok(c.materials.filter(l=>l.rawQuantity!>0).every(l=>l.material.pricePerUnit>0));assert.ok(!c.warnings.some(w=>w.message.startsWith('Niepełna wycena:')));
 assert.equal(gypsumReference('gk-screws',{}),null);assert.equal(gypsumReference('dowels-uw',{}),null);
 assert.equal(gypsumReference('ceiling-steel-anchors',{gypsumPerimeterFixings:1,gypsumCeilingSubstrate:1}),null,'plastic perimeter fixing cannot become an overhead steel anchor');
});
test('ceiling separates 275 sharp board screws from 132 self-drilling profile screws and steel anchors',()=>{
 const c=calculate('gypsum-ceiling',{gypsumCeilingSubstrate:1}),sharp=c.materials.find(l=>l.material.id==='gk-screws-ceiling')!,self=c.materials.find(l=>l.material.id==='ceiling-metal-screws')!,anchor=c.materials.find(l=>l.material.id==='ceiling-steel-anchors')!;
 assert.ok('ean'in sharp.material&&'ean'in self.material);assert.equal(sharp.material.ean,'5906675305127');assert.equal(self.material.ean,'5906675303024');assert.equal(sharp.rawQuantity,275);assert.equal(self.rawQuantity,132);assert.equal(self.packs,1);assert.equal(anchor.material.pricePerUnit,0);assert.notEqual(anchor.material.packaging?.size,200);
});
test('raw piece demand, rather than rounded cartons, is sent to the common basket in every tier',()=>{
 for(const tier of ['economy','standard','better'] as const)for(const job of ['gypsum-wall','gypsum-ceiling']){const c=calculate(job),refs=getMaterialsForJob(job,tier,c.measurements);for(const id of ['mat-gk-screws-koelner-fs3525-1000','mat-gk-perimeter-koelner-fx06k040-200',...(job==='gypsum-ceiling'?['mat-gk-profile-screws-koelner-ws3595-1000']:[])]){const ref=refs.find(r=>r.id===id)!;assert.ok(ref);const q=resolveMaterialQuantity(ref,c)!;assert.ok(q);assert.equal(q.quantity,q.source.rawQuantity);assert.ok(q.quantity<ref.packageSize);}const stage=toPricingStageInput(c);assert.equal(stage.materials.find(l=>l.material.id===(job==='gypsum-wall'?'gk-screws':'gk-screws-ceiling'))!.quantity,job==='gypsum-wall'?264:275);}
});
test('invalid choices stay unknown and changing an owned unspecified screw or fixing restores purchasing',()=>{
 for(const field of ['gypsumFasteners','gypsumPerimeterFixings']){const c=calculate('gypsum-wall',{[field]:7}),id=field==='gypsumFasteners'?'gk-screws':'dowels-uw';assert.equal(c.materials.find(l=>l.material.id===id)!.quantityKnown,false);assert.equal(gypsumQuantity('gypsum-wall',id,c.measurements),null);}
 const old=calculate('gypsum-wall',{gypsumFasteners:0,gypsumPerimeterFixings:0}),next=calculate();for(const id of ['gk-screws','dowels-uw']){const line=old.materials.find(l=>l.material.id===id)!,item:ShoppingItem={id,projectId:'test',materialId:id,name:line.material.name,unit:'szt',quantity:1000,estimatedPrice:0,owned:true,purchased:false,itemType:'material',tier:'standard',createdAt:''};assert.equal(projectShopping([item],next)[0].owned,false);}
});
