import {getRequiredQuantity} from './requirements';
import {parseMeasurements} from '@/shared/lib/measurements';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {calculatorEngine} from './engine';
import {getJobById} from '@/features/content/registry';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS} from '@/data/products/photos';
import {getMaterialsForJob} from '@/features/pricing/registry';
import {toPricingStageInput} from '@/features/pricing/pricingApi';
import {buildRenovationBasket} from '@/features/pricing/renovationBasket';
import {upgradeCalculation,projectShopping} from './upgrades';
import {VINYL_CLICK_MODEL,vinylClickInputVisible,withVinylClickMeasurement} from './vinylClick';
import type {Project,ShoppingItem} from '@/types/domain';

const complete={floorArea:10,vinylPanelChoice:0,vinylUnderlayChoice:1,vinylVaporBarrier:2,vinylJointTapeM:0,vinylThresholdCount:0};
const calc=(m:Record<string,number>={})=>calculatorEngine.calculate(getJobById('vinyl-flooring')!,{...complete,...m});

test('selected click model retains exact EAN, actual packs and one area demand at every price tier',()=>{
 for(const [choice,ean,pack]of [[0,'5063022676757',2.235],[1,'5059340969756',2.5],[3,'5059340969732',2.5]]as const){
  const c=calc({vinylPanelChoice:choice}),p=c.materials.find(l=>l.material.id==='vinyl-panels')!;assert.equal(c.quantityModel,VINYL_CLICK_MODEL);assert.equal(p.rawQuantity,11);assert.equal(p.packs,5);assert.equal(p.material.packaging?.size,pack);
  for(const tier of ['economy','standard','better']as const){const stage=toPricingStageInput(JSON.parse(JSON.stringify(c)),tier);assert.equal(stage.materials.length,2);assert.equal(stage.materials[0].quantity,11);assert.equal(stage.materials[0].material.ean,ean);assert.equal(stage.materials[0].material.unit,'m2');assert.equal(stage.materials[1].material.ean,'5063022038326');assert.equal(stage.materials[1].quantity,11);assert.equal(getMaterialsForJob('vinyl-flooring',tier,c.measurements).filter(r=>r.materialType==='vinyl-panel').length,1);}
 }
 const ref=MATERIAL_PRICES.find(r=>r.id==='mat-vinyl-underlay-volden-lvt-625m2')!,photo=PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))!;assert.equal(ref.packageSize,6.25);assert.equal(ref.pricePerPackage,113.88);assert.equal(photo.ean,'5063022038326');assert.equal(photo.sourceUrl,ref.sourceUrl);
});

test('unknown accessories stay visible; ownership and zero counts are explicit, without inventing a threshold or second membrane',()=>{
 const pending=calculatorEngine.calculate(getJobById('vinyl-flooring')!,{floorArea:10});assert.equal(pending.materials.filter(l=>l.quantityKnown===false).length,5);assert.ok(pending.warnings.some(w=>w.message.includes('Niepełna wycena podłogi winylowej')));
 assert.equal(toPricingStageInput(pending).materials.filter(l=>l.material.unit==='pozycja').length,5);
 const own=toPricingStageInput(calc({vinylUnderlayChoice:3}));assert.equal(own.materials.length,1);assert.equal(own.materials[0].quantity,11);
 const foil=toPricingStageInput(calc({vinylVaporBarrier:1}));assert.equal(foil.materials.length,3);assert.equal(foil.materials.find(l=>l.material.id==='vinyl-vapor-barrier')?.quantity,11);
 const profile=calc({vinylThresholdCount:2,vinylThresholdFit:1,vinylThresholdFixings:0});assert.equal(profile.materials.find(l=>l.material.id==='threshold-vinyl')?.rawQuantity,2);assert.equal(profile.materials.find(l=>l.material.id==='vinyl-threshold-fixings')?.quantityKnown,false);
 assert.equal(toPricingStageInput(calc({vinylThresholdCount:2,vinylThresholdFit:1,vinylThresholdFixings:1})).materials.length,3);
 for(const m of [{vinylPanelChoice:2},{vinylPanelChoice:99},{vinylUnderlayChoice:7},{vinylJointTapeM:-1},{vinylThresholdCount:1.5}] as Record<string,number>[])assert.ok(calc(m).materials.some(l=>l.quantityKnown===false));
});

test('the light-grey Arilla is an explicit new choice; original dark-grey and unknown selections keep their meaning and ownership',()=>{
 const current=calc({vinylPanelChoice:3}),panel=current.materials.find(row=>row.material.id==='vinyl-panels')!,photo=PRODUCT_PHOTOS.find(row=>row.ids.includes('mat-vinyl-spc-click-goodhome-arilla-light-grey-25m2'))!;
 assert.equal('ean'in panel.material?panel.material.ean:undefined,'5059340969732');assert.equal(panel.material.packaging?.size,2.5);assert.equal(panel.material.pricePerUnit,164.45);assert.equal(photo.ean,'5059340969732');assert.match(photo.imageUrl,/54664/);assert.match(panel.material.notes??'',/pomieszczenia wilgotne/);
 assert.equal(toPricingStageInput(calc({vinylPanelChoice:1})).materials[0].material.ean,'5059340969756');assert.equal(calc({vinylPanelChoice:2}).materials[0].quantityKnown,false);
 const old=calc({vinylPanelChoice:1}),item={id:'owned',projectId:'room',materialId:'vinyl-panels',itemType:'material',name:old.materials[0].material.name,unit:'m2',quantity:12.5,owned:true,purchased:true}as ShoppingItem;
 assert.equal(projectShopping([item],old)[0].owned,true);assert.equal(projectShopping([item],current)[0].owned,false);
 const before={...complete,vinylPanelChoice:'1',vinylUnderlayChoice:'1',vinylVaporBarrier:'2',vinylThresholdFit:'1'} as unknown as Record<string,string>,next=withVinylClickMeasurement(before,'vinylPanelChoice',3);assert.equal(next.vinylUnderlayChoice,'0');assert.equal(next.vinylVaporBarrier,'0');assert.equal(next.vinylThresholdFit,'0');
 const parsed=parseMeasurements(getJobById('vinyl-flooring')!,{...Object.fromEntries(Object.entries(complete).map(([key,value])=>[key,String(value)])),vinylPanelChoice:'3'});assert.deepEqual(parsed.errors,[]);assert.equal(parsed.values.vinylPanelChoice,3);
 const projects=['a','b'].map(id=>({id,name:id,jobId:'vinyl-flooring',calculationResult:calc({floorArea:5,vinylPanelChoice:3})}))as Project[],basket=buildRenovationBasket(projects,['a','b'],'economy');assert.equal(basket.measurementReviews.length,0);assert.equal(basket.stages.flatMap(stage=>stage.materials).filter(row=>row.material.ean==='5059340969732').reduce((n,row)=>n+row.quantity,0),11);
});

test('two rooms send raw combined square metres; local room pack rounding is never charged twice',()=>{
 const a=calc({floorArea:5}),b=calc({floorArea:5});assert.equal(a.materials[0].packs,3);assert.equal(b.materials[0].packs,3);
 const projects=[{id:'a',name:'a',jobId:'vinyl-flooring',calculationResult:a},{id:'b',name:'b',jobId:'vinyl-flooring',calculationResult:b}]as Project[];
 const basket=buildRenovationBasket(projects,['a','b'],'economy');assert.equal(basket.measurementReviews.length,0);assert.equal(basket.stages.length,2);for(const id of ['vinyl-panels','underlay-vinyl'])assert.equal(basket.stages.flatMap(s=>s.materials).filter(l=>l.material.id===id).reduce((n,l)=>n+l.quantity,0),11);
});

test('new Dekork underlays keep their exact barcode and pack on every tier, require a fresh barrier decision and sum rooms before buying',()=>{
 for(const[choice,ean,size,price]of[[4,'3067088472737',6,68.99],[5,'4000543672678',10,152.99],[6,'4006149126867',10,169.99]]as const){
  const result=calc({floorArea:5,vinylUnderlayChoice:choice}),line=result.materials.find(row=>row.material.id==='underlay-vinyl')!;assert.equal(line.quantityKnown,true);assert.equal(line.rawQuantity,5.5);assert.equal(line.material.packaging?.size,size);assert.equal(line.material.pricePerUnit,price);
  for(const tier of['economy','standard','better']as const){const stage=toPricingStageInput(result,tier);assert.equal(stage.materials.find(row=>row.material.id==='underlay-vinyl')?.material.ean,ean);}
  const parsed=parseMeasurements(getJobById('vinyl-flooring')!,Object.fromEntries(Object.entries({...complete,vinylUnderlayChoice:choice}).map(([k,v])=>[k,String(v)])));assert.deepEqual(parsed.errors,[]);assert.equal(parsed.values.vinylUnderlayChoice,choice);
  const projects=['a','b'].map(id=>({id,name:id,jobId:'vinyl-flooring',calculationResult:result}))as Project[],basket=buildRenovationBasket(projects,['a','b'],'economy');assert.equal(basket.stages.flatMap(stage=>stage.materials).filter(row=>row.material.ean===ean).reduce((n,row)=>n+row.quantity,0),11);
  const before={vinylUnderlayChoice:'1',vinylVaporBarrier:'2',vinylThresholdFit:'1'},next=withVinylClickMeasurement(before,'vinylUnderlayChoice',choice);assert.equal(next.vinylVaporBarrier,'0');assert.equal(next.vinylThresholdFit,'0');
  const old=calc(),item={id:'owned',projectId:'room',materialId:'underlay-vinyl',itemType:'material',name:old.materials.find(row=>row.material.id==='underlay-vinyl')!.material.name,unit:'m2',quantity:20,owned:true,purchased:true}as ShoppingItem;assert.equal(projectShopping([item],result)[0].owned,false);
 }
 assert.equal(toPricingStageInput(calc({vinylUnderlayChoice:2})).materials.find(row=>row.material.id==='underlay-vinyl')?.material.ean,'5061092900925');assert.equal(toPricingStageInput(calc({vinylUnderlayChoice:3})).materials.length,1);
});

test('historical generic quantities cannot silently adopt a new model or hide a different product as already owned',()=>{
 const current=calc(),old=JSON.parse(JSON.stringify(current));delete old.quantityModel;old.materials=old.materials.slice(0,2);old.materials[0].material.name='Panele winylowe LVT/SPC';delete old.materials[0].material.ean;const before=JSON.stringify(old);
 const reviewed=upgradeCalculation(old)!;assert.equal(reviewed.materials.length,6);assert.ok(reviewed.materials.every(l=>l.quantityKnown===false));assert.equal(JSON.stringify(old),before);assert.equal(getRequiredQuantity(old.materials[0],old),11);assert.ok(toPricingStageInput(old).materials.every(l=>l.material.unit==='pozycja'));
 const item={id:'p',projectId:'a',materialId:'vinyl-panels',itemType:'material',name:current.materials[0].material.name,unit:'m2',quantity:11.175,owned:true,purchased:true}as ShoppingItem;
 assert.equal(projectShopping([item],current)[0].owned,true);assert.equal(projectShopping([item],calc({vinylPanelChoice:1}))[0].owned,false);assert.equal(projectShopping([item],reviewed)[0].owned,false);
 const tampered=JSON.parse(JSON.stringify(current));tampered.measurements.vinylPanelChoice=1;assert.equal(upgradeCalculation(tampered)!.materials[0].quantityKnown,false);assert.equal(projectShopping([item],tampered)[0].owned,false);
});

test('changing model or underlay reopens compatibility decisions; secondary profile inputs appear only for a positive count',()=>{
 const m={vinylPanelChoice:'0',vinylUnderlayChoice:'1',vinylVaporBarrier:'2',vinylThresholdFit:'1',vinylThresholdCount:'2'};
 const next=withVinylClickMeasurement(m,'vinylPanelChoice',1);assert.equal(next.vinylUnderlayChoice,'0');assert.equal(next.vinylVaporBarrier,'0');assert.equal(next.vinylThresholdFit,'0');assert.equal(m.vinylUnderlayChoice,'1');
 assert.equal(withVinylClickMeasurement(m,'vinylUnderlayChoice',2).vinylThresholdFit,'0');assert.equal(withVinylClickMeasurement(m,'vinylPanelChoice',0).vinylUnderlayChoice,'1');
 const resized=withVinylClickMeasurement({...m,floorArea:'10',vinylUnderlayChoice:'3'},'floorArea','20');assert.equal(resized.vinylUnderlayChoice,'0');assert.equal(resized.vinylVaporBarrier,'0');assert.equal(resized.vinylThresholdFit,'0');assert.equal(withVinylClickMeasurement({...m,floorArea:'10',vinylUnderlayChoice:'3'},'floorArea','10,0').vinylUnderlayChoice,'3');
 assert.equal(vinylClickInputVisible('vinyl-flooring','panelPackCoverageM2',m),false);assert.equal(vinylClickInputVisible('vinyl-flooring','vinylThresholdFit',{}),false);assert.equal(vinylClickInputVisible('vinyl-flooring','vinylThresholdFixings',m),true);assert.equal(vinylClickInputVisible('laminate-flooring','panelPackCoverageM2',m),true);
 const parsed=parseMeasurements(getJobById('vinyl-flooring')!,{floorArea:'10',panelPackCoverageM2:'-1',vinylThresholdCount:'0',vinylThresholdFit:'99',vinylThresholdFixings:'99'});assert.deepEqual(parsed.errors,[]);assert.equal(parsed.values.panelPackCoverageM2,undefined);assert.equal(parsed.values.vinylThresholdFit,undefined);assert.equal(parsed.values.vinylJointTapeM,undefined);
});

test('rolled glued flooring never inherits self-adhesive tiles, click underlay or unrelated tier mappings',()=>{
 for(const tier of ['economy','standard','better']as const){assert.deepEqual(getMaterialsForJob('vinyl-glued',tier,{floorArea:10}),[]);const stage=toPricingStageInput(calculatorEngine.calculate(getJobById('vinyl-glued')!,{floorArea:10,perimeter:14}),tier);assert.ok(stage.materials.every(l=>l.material.ean!=='5059340802435'&&!l.material.name.includes('Ragga')));assert.ok(stage.materials.some(l=>l.material.id==='vinyl-roll'));}
});
