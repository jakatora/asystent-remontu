import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PRODUCT_PHOTOS,getProductPhoto} from '@/data/products/photos';
import {extraMaterial,parseBasketExtras,searchBasketExtraReferences,withBasketExtras} from './basketExtras';

test('75 mm Norgips is a photographed independent SKU with raw metre demand and no client price',()=>{
  const [ref,...others]=searchBasketExtraReferences('5907651698011');assert.ok(ref);assert.deepEqual(others,[]);
  assert.equal(ref.id,'mat-gypsum-acoustic-norgips-75x30');assert.equal(ref.packageSize,30);assert.equal(ref.packageUnit,'m');
  assert.equal(PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))?.ean,'5907651698011');assert.equal(getProductPhoto(ref),'https://sklep-elmas.pl/upload/2890a51b478292855b3e5e15866f.jpg');
  const extra={id:'tape75',kind:'catalogue' as const,referenceId:ref.id,quantity:31},line=extraMaterial(extra);
  assert.equal(line.material.ean,'5907651698011');assert.equal(line.quantity,31);assert.equal(line.material.unit,'m');assert.equal(line.packs,undefined);assert.ok(!('price' in line.material));
  assert.deepEqual(parseBasketExtras(JSON.stringify({version:1,items:[extra]})),[extra]);
});

test('adding 75 mm never substitutes existing 30/50 mm demand and preserves both after export/import',()=>{
  const ids=['mat-gypsum-acoustic-norgips-30x30','mat-gypsum-acoustic-norgips-50x30','mat-gypsum-acoustic-norgips-75x30'];
  const extras=ids.map((referenceId,i)=>({id:'width-'+i,kind:'catalogue' as const,referenceId,quantity:30+i}));
  const restored=parseBasketExtras(JSON.stringify({version:1,items:extras})),stages=withBasketExtras([],restored);
  assert.deepEqual(stages[0].materials.map(l=>[l.material.ean,l.quantity]),[['5907651698851',30],['5907651698004',31],['5907651698011',32]]);
  assert.deepEqual(searchBasketExtraReferences('5907651698004').map(r=>r.id),[ids[1]]);
});
