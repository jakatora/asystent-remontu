import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from './engine';
import { getJobById } from '@/features/content/registry';
import { getMaterialsForJob } from '@/features/pricing/registry';
import { resolveMaterialQuantity } from '@/features/pricing/quantity';
import { toPricingStageInput } from '@/features/pricing/pricingApi';
import { projectShopping } from './upgrades';
import type { ShoppingItem } from '@/types/domain';
const calc=(choice=0,area=10)=>calculatorEngine.calculate(getJobById('gypsum-ceiling')!,{ceilingArea:area,perimeter:4*Math.sqrt(area),gypsumCrossConnector:choice});

test('ceiling keeps28 raw connectors but buys one100-piece carton of the explicitly selected brand',()=>{
 for(const choice of [0,1])for(const tier of ['economy','standard','better']as const){const c=calc(choice),l=c.materials.find(l=>l.material.id==='ceiling-cross')!;assert.equal(l.rawQuantity,28);assert.equal(l.packs,1);assert.equal(l.quantity,100);assert.equal(l.cost,choice===0?89.99:49);assert.equal(l.material.brand,choice===0?'Norgips':'Budmat');const refs=getMaterialsForJob(c.jobId,tier,c.measurements),ref=refs.find(r=>r.id==='mat-gypsum-cross-'+(choice===0?'norgips':'budmat')+'-100')!;assert.ok(ref);assert.equal(resolveMaterialQuantity(ref,c)?.quantity,28);assert.equal(toPricingStageInput(c,tier).materials.find(l=>l.material.id==='ceiling-cross')!.quantity,28);}
 const invalid=calc(2);assert.equal(invalid.materials.find(l=>l.material.id==='ceiling-cross')!.quantityKnown,false);assert.equal(toPricingStageInput(invalid).materials.find(l=>l.material.id==='ceiling-cross')!.material.unit,'pozycja');
 const wall=getJobById('gypsum-wall')!;assert.ok(!wall.measurementInputs.some(i=>i.id==='gypsumCrossConnector'));
});

test('owned Norgips carton cannot remove a Budmat requirement; partial quantity does not cover the whole job',()=>{
 const c=calc(),line=c.materials.find(l=>l.material.id==='ceiling-cross')!;const item:ShoppingItem={id:'cross',projectId:'p',materialId:'ceiling-cross',name:line.material.name,quantity:100,unit:'szt',estimatedPrice:0,owned:true,purchased:false,itemType:'material',tier:'standard',createdAt:''};
 assert.equal(projectShopping([item],c)[0].owned,true);assert.equal(projectShopping([item],calc(1))[0].owned,false);assert.equal(projectShopping([{...item,quantity:3}],c)[0].owned,false);
 const historical={...c,materials:c.materials.map(l=>l.material.id==='ceiling-cross'?{...l,material:{...l.material,ean:'another-existing-product'}}:l)};assert.equal(resolveMaterialQuantity(getMaterialsForJob(c.jobId,'standard',c.measurements).find(r=>r.id==='mat-gypsum-cross-norgips-100')!,historical),null);
});
