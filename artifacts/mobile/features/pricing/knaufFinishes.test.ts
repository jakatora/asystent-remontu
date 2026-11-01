import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS,getProductPhoto} from '@/data/products/photos';
import {extraMaterial,parseBasketExtras,searchBasketExtraReferences} from './basketExtras';
import {catalogueRefreshIdentity} from './catalogAvailability';

test('both Super Finish packages retain separate factory codes, photographs, physical kg and searchable identities',()=>{
 for(const [suffix,size,ean]of [['54kg',5.4,'5901793357959'],['28kg',28,'5901793357935']]as const){
  const id='mat-skim-coat-knauf-superfinish-'+suffix,ref=MATERIAL_PRICES.find(r=>r.id===id)!;assert.ok(ref);assert.equal(ref.packageSize,size);assert.equal(ref.packageUnit,'kg');
  const photos=PRODUCT_PHOTOS.filter(p=>p.ids.includes(id));assert.equal(photos.length,1);assert.equal(photos[0].ean,ean);assert.equal(getProductPhoto(ref),photos[0].imageUrl);assert.deepEqual(searchBasketExtraReferences(ean).map(r=>r.id),[id]);
  assert.deepEqual(catalogueRefreshIdentity(ref),{ean,category:'skim-coat',packageSize:size,unit:'kg'});
 }
});
test('saved demand is kilograms, never pre-rounded buckets or a replacement for the selected model',()=>{
 const items=parseBasketExtras(JSON.stringify({version:1,items:[{id:'little',kind:'catalogue',referenceId:'mat-skim-coat-knauf-superfinish-54kg',quantity:5.5},{id:'big',kind:'catalogue',referenceId:'mat-skim-coat-knauf-superfinish-28kg',quantity:29}]}));
 assert.deepEqual(items.map(extraMaterial).map(l=>[l.material.ean,l.material.unit,l.quantity]),[['5901793357959','kg',5.5],['5901793357935','kg',29]]);
 assert.equal(MATERIAL_PRICES.find(r=>r.id==='mat-skim-coat-economy-20kg')!.productLabel,'Gładź pod wałek GW180 gotowa polimerowa 20 kg');
});
