import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getJobById} from '@/features/content/registry';
import {calculatorEngine} from './engine';
import {ROLLED_MODEL,rolledDemand,rolledInputVisible,withRolledMeasurement} from './rolledVinyl';
import {parseMeasurements} from '@/shared/lib/measurements';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {buildRenovationBasket} from '@/features/pricing/renovationBasket';
import {upgradeCalculation,projectShopping} from './upgrades';
import type {Project,ShoppingItem} from '@/types/domain';
const job=getJobById('vinyl-glued')!;
const complete={rollChoice:1,rollRoomLengthM:3,rollRoomWidthM:1.8,rollAdhesiveChoice:3,rollAdhesiveFit:1,rollAdhesiveGm2:400,rollAdhesiveReserve:5,rollPreparation:1,rollSkirting:1};
const calc=(m:Record<string,number>={})=>calculatorEngine.calculate(job,{...complete,...m});

test('one full-width cut includes 10 cm at dimensions, not floor area plus ten percent or self-adhesive tiles',()=>{
 const c=calc();assert.equal(c.quantityModel,ROLLED_MODEL);assert.equal(c.measurements.floorArea,5.4);
 const roll=c.materials.find(l=>l.material.id==='vinyl-roll')!;assert.equal(roll.rawQuantity,6.2);assert.equal(roll.quantity,6.2);assert.equal(roll.packs,undefined);assert.equal(roll.cost,341);
 const glue=c.materials.find(l=>l.material.id==='vinyl-adhesive')!;assert.equal(glue.rawQuantity,2.268);assert.equal(glue.packs,1);assert.equal(glue.material.packaging?.size,4);assert.equal(glue.cost,55.45);
 assert.equal(c.quantityIssues?.length,0);
 for(const tier of ['economy','standard','better']as const){const stage=toPricingStageInput(JSON.parse(JSON.stringify(c)),tier);assert.equal(stage.materials.length,2);assert.equal(stage.materials[0].quantity,6.2);assert.deepEqual(stage.materials[0].cutRoll,{version:1,widthMm:2000,cuts:[{id:'room',lengthMm:3100}]});assert.equal(stage.materials[1].material.ean,'5903518039515');assert.ok(stage.materials.every(l=>l.material.ean!=='5059340802435'));assert.equal(getMaterialsForJob(job.id,tier,c.measurements).length,2);}
 const detailed=calculatorEngine.calculateDetailed(job,complete);assert.equal(detailed.totalCost,c.totalCost);assert.deepEqual(detailed.materials.map(l=>[l.quantity,l.rawQuantity,l.cost]),c.materials.map(l=>[l.quantity,l.rawQuantity,l.cost]));
});
test('wider rooms require a measured matching layout and joint work; individual leftovers never become usable floor coverage',()=>{
 assert.equal(rolledDemand({...complete,rollRoomWidthM:3}),null);
 const pending=calc({rollRoomWidthM:3,rollStripCount:2,rollStripLengthM:4,rollLayoutFit:1});assert.equal(pending.materials[0].rawQuantity,16);assert.equal(pending.materials.find(l=>l.material.id==='roll-joint-work')?.quantityKnown,false);
 const ready=calc({rollRoomWidthM:3,rollStripCount:2,rollStripLengthM:4,rollLayoutFit:1,rollJointReady:1});assert.equal(ready.quantityIssues?.length,0);
 for(const m of [{rollStripCount:1},{rollStripLengthM:3},{rollLayoutFit:0}])assert.equal(rolledDemand({...complete,rollRoomWidthM:3,rollStripCount:2,rollStripLengthM:4,rollLayoutFit:1,...m}),null);
});
test('two rooms retain exact cut lengths and combine the raw adhesive requirement before bucket rounding',()=>{
 const a=calc(),b=calc({rollRoomLengthM:2.2}),basket=buildRenovationBasket([{id:'a',name:'a',jobId:job.id,calculationResult:a},{id:'b',name:'b',jobId:job.id,calculationResult:b}]as Project[],['a','b'],'standard');
 assert.equal(basket.measurementReviews.length,0);assert.equal(basket.stages.flatMap(s=>s.materials).filter(m=>m.material.id==='vinyl-roll').reduce((n,m)=>n+m.quantity,0),10.8);
 assert.equal(Number(basket.stages.flatMap(s=>s.materials).filter(m=>m.material.id==='vinyl-adhesive').reduce((n,m)=>n+m.quantity,0).toFixed(8)),3.9312);
 assert.deepEqual(basket.stages.map(s=>s.materials[0].cutRoll?.cuts[0].lengthMm),[3100,2300]);
});
test('manufacturer consumption ranges remain specific to the selected glue; existing materials and blanks stay explicit',()=>{
 assert.equal(calc({rollAdhesiveChoice:1,rollAdhesiveGm2:600}).materials[1].rawQuantity,3.402);
 assert.equal(calc({rollAdhesiveChoice:1,rollAdhesiveGm2:300}).materials[1].quantityKnown,false);
 assert.equal(calc({rollAdhesiveChoice:3,rollAdhesiveGm2:1700}).materials[1].rawQuantity,9.639);
 const blank={...complete}as Record<string,number>;delete blank.rollAdhesiveGm2;assert.equal(calculatorEngine.calculate(job,blank).materials[1].quantityKnown,false);
 assert.equal(toPricingStageInput(calc({rollAdhesiveChoice:2})).materials.length,1);
 const old=calculatorEngine.calculate(job,{floorArea:10,perimeter:14});assert.ok(old.materials.every(l=>l.quantityKnown===false));
});
test('old generic snapshots and changed product identities cannot retain purchased status or silently adopt new cuts',()=>{
 const c=calc(),old=JSON.parse(JSON.stringify(c));delete old.quantityModel;const before=JSON.stringify(old),reviewed=upgradeCalculation(old)!;assert.equal(JSON.stringify(old),before);assert.ok(reviewed.materials.every(l=>l.quantityKnown===false));
 const item={id:'i',projectId:'p',materialId:'vinyl-roll',itemType:'material',name:c.materials[0].material.name,unit:'m2',quantity:6.2,owned:true,purchased:true}as ShoppingItem;
 assert.equal(projectShopping([item],c)[0].owned,true);assert.equal(projectShopping([item],calc({rollChoice:2}))[0].owned,false);assert.equal(projectShopping([item],reviewed)[0].owned,false);
 const tampered=JSON.parse(JSON.stringify(c));tampered.materials[0].material.sourceUrl='https://example.org/';assert.equal(upgradeCalculation(tampered)!.materials[0].quantityKnown,false);
 for(const index of [0,1]){const changed=JSON.parse(JSON.stringify(c));changed.materials[index].material.ean='5901234567890';assert.equal(upgradeCalculation(changed)!.materials[index].quantityKnown,false);assert.equal(toPricingStageInput(changed).materials.find(l=>l.material.id===changed.materials[index].material.id)?.material.unit,'pozycja');}
});
test('hidden old area is ignored, derived area is consistent, and changed dimensions reopen full-quantity confirmations',()=>{
 assert.equal(rolledInputVisible(job.id,'floorArea',{}),false);assert.equal(rolledInputVisible(job.id,'rollStripCount',complete),false);
 const parsed=parseMeasurements(job,Object.fromEntries(Object.entries({...complete,floorArea:-10,perimeter:-1}).map(([k,v])=>[k,String(v)])));assert.deepEqual(parsed.errors,[]);assert.equal(parsed.values.floorArea,5.4);assert.equal(parsed.values.perimeter,undefined);
 const raw={rollRoomLengthM:'3',rollAdhesiveChoice:'2',rollPreparation:'1',rollSkirting:'1'};assert.equal(withRolledMeasurement(raw,'rollRoomLengthM','3,0').rollPreparation,'1');const changed=withRolledMeasurement(raw,'rollRoomLengthM','4');assert.equal(changed.rollAdhesiveChoice,'0');assert.equal(changed.rollPreparation,'0');assert.equal(changed.rollSkirting,'0');
 const glue=withRolledMeasurement({rollAdhesiveChoice:'1',rollAdhesiveGm2:'600',rollAdhesiveFit:'1'},'rollAdhesiveChoice',3);assert.equal(glue.rollAdhesiveGm2,'');assert.equal(glue.rollAdhesiveFit,'0');
});
