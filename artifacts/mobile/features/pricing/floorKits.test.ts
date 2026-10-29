import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatorEngine } from '@/features/calculator/engine';
import { getJobById } from '@/features/content/registry';
import { toPricingStageInput, type SerializedProject } from './pricingApi';
import { floorKitCandidates, deliveredFloorKit, preserveFloorKitAdhesive, updateFloorKitAdhesive, FLOOR_KIT_ADHESIVE } from './floorKits';
import { applyTileChoices, parseTileChoices, type TileChoice } from './tileChoice';
import { applyTileAdhesiveChoices } from './tileAdhesiveChoice';
import { buildRenovationBasket } from './renovationBasket';
import type { Project, ShoppingItem } from '@/types/domain';
import fixture from './fixtures/floor-kit-delivered.json';

const petro = 'mat-gres-paradyz-petro-grey-60x60', grey = 'mat-gres-rekt-paradyz-u117-light-grey-60x60', beige = 'mat-gres-rekt-paradyz-u117-light-beige-60x60', promo = 'mat-tile-adhesive-buildfix-25kg';
const calc = () => calculatorEngine.calculate(getJobById('floor-tiles')!, { floorArea: 10, tileWidthCm: 30, tileHeightCm: 30, wastePercent: 15, groutWidthMm: 3 });
const kit: TileChoice = { from: petro, to: grey, use: 'floor', floorAdhesive: FLOOR_KIT_ADHESIVE };
const settings = { mode: 'shipping' as const, postalCode: '00-001', allowSeparateOrders: true };
const actual = () => structuredClone(fixture.data) as unknown as SerializedProject;

test('two explicit ready kits preview real quantities without changing the current project or applying either alternative', () => {
  const raw = toPricingStageInput(calc()), before = JSON.stringify(raw), candidates = floorKitCandidates([raw], []);
  assert.equal(candidates.length, 2); assert.equal(JSON.stringify(raw), before);
  for (const c of candidates) {
    const lines = c.stages[0].materials;
    assert.equal(lines.find(l=>l.material.id==='tiles')!.quantity, 11.5);
    assert.equal(lines.find(l=>l.material.id==='tile-adhesive')!.quantity, 47.3);
    assert.equal(lines.find(l=>l.material.id==='tile-adhesive')!.material.ean, '5905400488579');
    assert.equal(c.choices[0].floorAdhesive, FLOOR_KIT_ADHESIVE);
  }
  assert.notEqual(candidates[0].stages[0].materials[0].material.ean, candidates[1].stages[0].materials[0].material.ean);
  assert.deepEqual(floorKitCandidates([{...raw, jobId:'kitchen-backsplash'}], []), []);
});

test('one backward-compatible tile JSON record retains both kit identities and rejects unknown or wall adhesive overrides', () => {
  assert.deepEqual(parseTileChoices(JSON.stringify({version:1,choices:[kit]})), [kit]);
  const old = {from:petro,to:grey,use:'floor'};
  assert.deepEqual(parseTileChoices(JSON.stringify({version:1,choices:[old]})), [old]);
  assert.ok(parseTileChoices(JSON.stringify({version:1,choices:[{...kit,from:grey}]}))[0].floorAdhesive);
  for (const choice of [{...kit,floorAdhesive:'unknown'}, {...kit,use:'wall'}, {...old,to:petro}])
    assert.throws(()=>parseTileChoices(JSON.stringify({version:1,choices:[choice]})));
});

test('a single saved kit cannot be overridden by an older independent pack preference', () => {
  const selected = applyTileChoices([toPricingStageInput(calc())], [kit]);
  const result = applyTileAdhesiveChoices(selected, [{from:FLOOR_KIT_ADHESIVE,to:promo}], [kit]);
  assert.equal(result[0].materials.find(l=>l.material.id==='tile-adhesive')!.material.ean,'5905400488579');
  const manual = updateFloorKitAdhesive([kit], [{from:FLOOR_KIT_ADHESIVE,to:promo}]);
  assert.equal(applyTileChoices([toPricingStageInput(calc())], manual)[0].materials.find(l=>l.material.id==='tile-adhesive')!.material.ean,'5905400658866');
  assert.deepEqual(preserveFloorKitAdhesive([{from:petro,to:beige,use:'floor'}],[kit]),[{...kit,to:beige}]);
  assert.deepEqual(updateFloorKitAdhesive([kit], []), [kit]);
  assert.throws(()=>updateFloorKitAdhesive([kit],[{from:FLOOR_KIT_ADHESIVE,to:'unknown'}]));
});

test('ready-kit previews retain manual shopping and do not let an owned old tile hide the new model', () => {
  const calculation=calc(), raw=toPricingStageInput(calculation);
  const old={id:'owned',projectId:'a',materialId:'tiles',name:'Petro Grey gatunek 2',quantity:20,unit:'m2',owned:true,purchased:false,itemType:'material'} as ShoppingItem;
  const candidates=floorKitCandidates([raw],[],[{projectId:'a',calc:calculation,original:raw,items:[old]}]);
  assert.ok(candidates.every(c=>c.stages[0].materials.some(l=>l.material.id==='tiles'&&l.quantity===11.5)));
});

test('common renovation reads the one-record kit before legacy pack preferences and ownership', () => {
  const c=calc(), p:Project={id:'a',name:'QA',jobId:c.jobId,jobName:'Floor',categoryId:'floor-tiles',measurements:c.measurements,calculationResult:c,status:'planning',createdAt:'',updatedAt:''};
  const before=JSON.stringify(p), basket=buildRenovationBasket([p],['a'],'standard',{}, {}, {}, {}, {}, {a:[kit]}, {a:[{from:FLOOR_KIT_ADHESIVE,to:promo}]});
  assert.equal(basket.stages[0].materials.find(l=>l.material.id==='tiles')!.material.ean,'5904584158285');
  assert.equal(basket.stages[0].materials.find(l=>l.material.id==='tile-adhesive')!.material.ean,'5905400488579');
  assert.equal(JSON.stringify(p),before);
});

test('preview shows exact native full-cart money and all five required orders from actual production evidence', () => {
  const result=deliveredFloorKit(actual(),settings,fixture.verificationTime)!;
  assert.equal(result.materialsGrosze,123293);assert.equal(result.deliveryGrosze,34269);assert.equal(result.totalGrosze,157562);
  assert.equal(result.orders,5);assert.deepEqual(result.stores,['Modna Łazienka','Rab-Dom','Sewera']);assert.equal(result.scopeLimited,true);
});

test('partial, expired, invalid-money and wrong-postcode results cannot become selectable priced kits', () => {
  const mutations:((d:SerializedProject)=>void)[]=[
    d=>{d.deliveryComparison!.missingProductCount=1;},d=>{d.deliveryComparison!.best=null;},d=>{d.deliveryComparison!.postalCode='42-209';},
    d=>{d.deliveryComparison!.best!.totalGrosze=157561;},d=>{d.deliveryComparison!.best!.deliveryGrosze=NaN;},
    d=>{d.deliveryComparison!.best!.stores[0].quote!.expiresAt=new Date(fixture.verificationTime).toISOString();},
    d=>{d.deliveryComparison!.best!.stores[0].quote!.checkedAt=new Date(fixture.verificationTime+1).toISOString();},
    d=>{d.deliveryComparison!.best!.stores[2].quote!.postalCode='42-209';},d=>{d.stages[0].lines[0].resolved=false;},
  ];
  for(const change of mutations){const d=actual();change(d);assert.equal(deliveredFloorKit(d,settings,fixture.verificationTime),null);}
  assert.equal(deliveredFloorKit(actual(),{...settings,allowSeparateOrders:false},fixture.verificationTime),null);
  assert.equal(deliveredFloorKit(actual(),{mode:'pickup'},fixture.verificationTime),null);
});
