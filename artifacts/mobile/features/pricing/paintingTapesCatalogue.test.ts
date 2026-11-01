import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS,getProductPhoto} from '@/data/products/photos';
import {extraMaterial,parseBasketExtras,searchBasketExtraReferences,withBasketExtras} from './basketExtras';

test('additional painting tapes retain width, colour, GTIN and demand in metres rather than roll counts',()=>{
  const cases=[['blue25','5907758507308','niebieska 25'],['blue48','5907758507292','niebieska 48'],['yellow38','5907758504789','żółta 38'],['yellow48','5907758504581','żółta 48']];
  const extras=cases.map(([key,ean,variant],index)=>{
    const ref=searchBasketExtraReferences(ean).find(r=>r.id===`mat-tape-bluedolphin-${key}-50m`)!;assert.ok(ref);assert.ok(ref.productLabel.includes(variant));
    assert.equal(ref.materialType,'masking-tape');assert.equal(ref.packageSize,50);assert.equal(ref.packageUnit,'mb');
    assert.equal(PRODUCT_PHOTOS.find(photo=>photo.ids.includes(ref.id))?.ean,ean);assert.ok(getProductPhoto(ref)?.startsWith('https://sklep.sewera.pl/photo/'));
    const extra={id:'qa-tape-'+key,kind:'catalogue' as const,referenceId:ref.id,quantity:51+index};
    const line=extraMaterial(extra);assert.equal(line.quantity,51+index);assert.equal(line.material.unit,'mb');assert.equal(line.material.ean,ean);assert.ok(!('price' in line.material));
    return extra;
  });
  assert.deepEqual(parseBasketExtras(JSON.stringify({version:1,items:extras})),extras);
  const stages=withBasketExtras([],extras);assert.equal(stages[0].materials.length,4);
  assert.deepEqual(stages[0].materials.map(row=>row.material.ean),cases.map(row=>row[1]));
  assert.deepEqual(stages[0].materials.map(row=>row.quantity),[51,52,53,54]);
});

test('adding tape variants preserves the existing 30 and 38 mm blue references and barcodes',()=>{
  const rows=MATERIAL_PRICES.filter(ref=>ref.materialType==='masking-tape');
  for(const ean of ['5907758515952','5907758507285']){
    const old=searchBasketExtraReferences(ean);assert.ok(old.length>0);
    assert.ok(old.every(ref=>!ref.id.startsWith('mat-tape-bluedolphin-blue25')&&!ref.id.startsWith('mat-tape-bluedolphin-blue48')&&!ref.id.includes('yellow')));
  }
  assert.ok(rows.length>=6);
});
