import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {resolveMaterialQuantity} from '@/features/pricing/quantity';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
const calc=(m:Record<string,number>={})=>calculatorEngine.calculate(getJobById('gypsum-ceiling')!,{ceilingArea:10,perimeter:14,gypsumCdProfile:1,gypsumCeilingSubstrate:1,gypsumCeilingAnchors:1,gypsumAnchorCount:26,...m});
test('selected IRBUD merchant profile survives JSON without a fabricated EAN and preserves raw36.3m/13whole3m lengths',()=>{
 for(const tier of ['economy','standard','better']as const){const c=calc(),l=c.materials.find(l=>l.material.id==='profile-cd')!;assert.equal(l.rawQuantity,36.3);assert.equal(l.packs,13);assert.equal(l.cost,148.85);assert.ok(!('ean' in l.material)||!l.material.ean);const refs=getMaterialsForJob(c.jobId,tier,c.measurements),ref=refs.find(r=>r.id==='mat-profile-cd60-irbud-3m')!;assert.equal(resolveMaterialQuantity(ref,JSON.parse(JSON.stringify(c)))?.quantity,36.3);const staged=toPricingStageInput(JSON.parse(JSON.stringify(c)),tier).materials.find(l=>l.material.id==='profile-cd')!;assert.equal(staged.quantity,36.3);assert.match(staged.material.name,/oferta IRBUD/);assert.ok(!staged.material.ean);
 const wrong={...c,materials:c.materials.map(row=>row.material.id===l.material.id?{...row,material:{...row.material,ean:'5907651698899'}}:row)};assert.equal(resolveMaterialQuantity(ref,wrong),null);}
 assert.equal(calc({gypsumCdProfile:2}).materials.find(l=>l.material.id==='profile-cd')!.quantityKnown,false);
});
test('R-GS requires a confirmed concrete choice and a positive integral project count; stock reserve is explicit',()=>{
 const c=calc(),l=c.materials.find(l=>l.material.id==='ceiling-steel-anchors')!;assert.equal(l.rawQuantity,29);assert.equal(l.packs,1);assert.equal(l.material.packaging?.size,100);assert.ok('ean' in l.material);assert.equal(l.material.ean,'5906675169347');
 const invalid:Record<string,number>[]=[{gypsumCeilingSubstrate:0},{gypsumAnchorCount:0},{gypsumAnchorCount:1.5},{gypsumCeilingAnchors:2}];for(const m of invalid)assert.equal(calc(m).materials.find(row=>row.material.id==='ceiling-steel-anchors')!.quantityKnown,false);
 const missing=calc();delete missing.measurements.gypsumAnchorCount;const input=toPricingStageInput(missing);assert.equal(input.materials.find(l=>l.material.id==='ceiling-steel-anchors')!.material.unit,'pozycja');
});
