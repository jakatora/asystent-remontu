import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {extraMaterial,extraPackageFamily,parseBasketExtras,searchBasketExtraReferences,type BasketExtra} from './basketExtras';
import {getProductPhoto} from '@/data/products/photos';
import {ATLAS_WODER_E_FAMILY} from '../../../../lib/pricing-service/src/reviewed-package-families';

test('2, 5 and 15 kg Woder E references keep exact GTINs by default and allow explicit size selection',()=>{
 for(const [size,ean]of [[2,'5905400514483'],[5,'5905400514490'],[15,'5905400514506']] as const){const id=`mat-waterproof-membrane-atlas-woder-e-${size}kg`,ref=MATERIAL_PRICES.find(r=>r.id===id)!;assert.equal(searchBasketExtraReferences(ean)[0].id,id);assert.ok(getProductPhoto({id}));assert.equal(extraPackageFamily(ref)?.key,ATLAS_WODER_E_FAMILY);
  const fixed:BasketExtra={id:'waterproof',kind:'catalogue',referenceId:id,quantity:7.000001},automatic={...fixed,packageFamily:ATLAS_WODER_E_FAMILY};assert.equal(extraMaterial(fixed).material.ean,ean);const line=extraMaterial(automatic);assert.equal(line.material.ean,undefined);assert.equal(line.quantity,7.000001);assert.equal(line.material.unit,'kg');assert.equal(line.material.packageFamily,ATLAS_WODER_E_FAMILY);assert.deepEqual(parseBasketExtras(JSON.stringify({version:1,items:[automatic]})),[automatic]);}
});

test('a saved Woder Duo or Mapegum requirement cannot inherit the Woder E package family',()=>{
 for(const referenceId of ['mat-waterproof-membrane-atlas-woder-duo-16kg','mat-mapegum-wps-5kg'])assert.throws(()=>parseBasketExtras(JSON.stringify({version:1,items:[{id:'hydro',kind:'catalogue',referenceId,quantity:7,packageFamily:ATLAS_WODER_E_FAMILY}]})),/invalid_basket_extras/);
});
