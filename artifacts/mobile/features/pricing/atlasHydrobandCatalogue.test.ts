import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {extraMaterial,extraPackageFamily,parseBasketExtras,searchBasketExtraReferences,type BasketExtra} from './basketExtras';
import {getProductPhoto} from '@/data/products/photos';

test('Hydroband roll and individual corners keep their exact retail identities and raw needs in backups',()=>{
 const items:BasketExtra[]=[];
 for(const [referenceId,ean,quantity,size,unit]of [
  ['mat-atlas-hydroband-125-10m','5905400602807',12.5,10,'m'],
  ['mat-atlas-hydroband-internal-piece','4260112880754',4,1,'szt'],
  ['mat-atlas-hydroband-external-piece','4260112880761',1,1,'szt'],
 ] as const){const ref=MATERIAL_PRICES.find(r=>r.id===referenceId)!;assert.equal(searchBasketExtraReferences(ean)[0].id,referenceId);assert.equal(ref.packageSize,size);assert.equal(ref.packageUnit,unit);assert.equal(extraPackageFamily(ref),undefined);assert.ok(getProductPhoto({id:referenceId}));const item:BasketExtra={id:referenceId,kind:'catalogue',referenceId,quantity};items.push(item);const line=extraMaterial(item);assert.equal(line.material.ean,ean);assert.equal(line.material.unit,unit);assert.equal(line.quantity,quantity);}
 assert.deepEqual(parseBasketExtras(JSON.stringify({version:1,items})),items);
 assert.deepEqual(searchBasketExtraReferences('5905400601459'),[]);
 assert.deepEqual(searchBasketExtraReferences('5905400601442'),[]);
});
