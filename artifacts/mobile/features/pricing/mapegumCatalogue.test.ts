import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '../../data/prices/materials';
import {PRODUCT_PHOTOS,getProductPhoto} from '../../data/products/photos';
import {extraMaterial,parseBasketExtras,searchBasketExtraReferences} from './basketExtras';

test('Mapegum manufacturer codes select the new exact GTIN and whole bucket without changing older references',()=>{
  for(const [size,code,ean,oldEan]of [[5,'124805PL','8022452242489','8022452002113'],[10,'124810PL','8022452242496','8022452002120']] as const){
    const ref=MATERIAL_PRICES.find(r=>r.id===`mat-mapegum-wps-${size}kg-${code.toLowerCase()}`)!,old=MATERIAL_PRICES.find(r=>r.id===`mat-mapegum-wps-${size}kg`)!;
    assert.ok(ref);assert.ok(old);assert.ok(ref.productLabel.includes(code));assert.notEqual(ref.productLabel,old.productLabel);
    assert.equal(PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))!.ean,ean);assert.equal(PRODUCT_PHOTOS.find(p=>p.ids.includes(old.id))!.ean,oldEan);assert.ok(getProductPhoto(ref)?.startsWith('https://www.rabdom.pl/'));
    assert.ok(searchBasketExtraReferences(code).some(r=>r.id===ref.id));assert.ok(searchBasketExtraReferences(ean).some(r=>r.id===ref.id));
    const extra={id:'qa-'+code,kind:'catalogue' as const,referenceId:ref.id,quantity:size+0.1},material=extraMaterial(extra);
    assert.equal(material.quantity,size+0.1);assert.equal(material.material.unit,'kg');assert.equal(material.material.ean,ean);assert.ok(!('price' in material.material));
    assert.deepEqual(parseBasketExtras(JSON.stringify({version:1,items:[extra]})),[extra]);
  }
});
