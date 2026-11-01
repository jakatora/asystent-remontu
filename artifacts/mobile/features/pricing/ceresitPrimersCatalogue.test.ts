import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS,getProductPhoto} from '@/data/products/photos';
import {extraMaterial,parseBasketExtras,searchBasketExtraReferences,withBasketExtras} from './basketExtras';
import {toPricingStageInput} from './pricingApi';
import {calculatorEngine} from '../calculator/engine';
import {getJobById} from '../content/registry';

const cases=[['mat-primer-ceresit-ct17-profi-5l','5900089617050',5],['mat-primer-ceresit-ct17-transparent-5l','5900089218653',5],['mat-primer-ceresit-ct17-transparent-10l','5900089218677',10]] as const;
test('exact CT17 barcode search produces independent photographed raw-litre basket additions without client prices',()=>{
  const extras=cases.map(([id,ean,size],index)=>{
    const matches=searchBasketExtraReferences(ean);assert.deepEqual(matches.map(ref=>ref.id),[id]);const ref=matches[0];
    assert.equal(ref.packageSize,size);assert.equal(ref.packageUnit,'l');assert.equal(ref.materialType,'primer');
    assert.equal(PRODUCT_PHOTOS.find(photo=>photo.ids.includes(id))?.ean,ean);assert.ok(getProductPhoto(ref)?.endsWith(ean+'_1.webp'));
    const extra={id:'qa-primer-'+index,kind:'catalogue' as const,referenceId:id,quantity:6.1+index};
    const line=extraMaterial(extra);assert.equal(line.quantity,extra.quantity);assert.equal(line.material.ean,ean);assert.equal(line.material.unit,'l');assert.equal(line.packs,undefined);assert.ok(!('price' in line.material));return extra;
  });
  assert.deepEqual(parseBasketExtras(JSON.stringify({version:1,items:extras})),extras);
  assert.deepEqual(withBasketExtras([],extras)[0].materials.map(line=>line.material.ean),cases.map(row=>row[1]));
});
test('new catalogue cans do not replace the primer or raw demand in an existing paint project',()=>{
  const calc=calculatorEngine.calculate(getJobById('paint-walls')!,{wallArea:35,coats:2,paintCoverage:10,primerCoverage:10}),stage=toPricingStageInput(calc),before=JSON.stringify({calc,stage});
  const extra={id:'manual-primer',kind:'catalogue' as const,referenceId:cases[0][0],quantity:6};
  const result=withBasketExtras([stage],[extra]);assert.equal(result[0],stage);assert.equal(result[1].materials[0].material.ean,cases[0][1]);assert.equal(JSON.stringify({calc,stage}),before);
  const old=MATERIAL_PRICES.find(ref=>ref.id==='mat-primer-deep-ceresit-ct17-10l')!;assert.equal(old.packageSize,10);assert.equal(PRODUCT_PHOTOS.find(photo=>photo.ids.includes(old.id))?.ean,'5900089617081');
});
