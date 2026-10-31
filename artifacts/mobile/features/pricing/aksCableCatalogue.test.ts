import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MATERIAL_PRICES} from '@/data/prices/materials';
import {PRODUCT_PHOTOS,getProductPhoto} from '@/data/products/photos';
import {extraMaterial,searchBasketExtraReferences,withBasketExtras} from './basketExtras';

test('new AKS codes select exact photographed rolls without aliasing old GTINs or changing metre demand',()=>{
 const rows=[['777214','5901602190944',5],['777096','5904617579735',100],['777097','5904617578721',25],['777099','5904617579759',100]] as const;
 const extras=rows.map(([code,ean,length],i)=>{const found=searchBasketExtraReferences(ean);assert.equal(found.length,1);const ref=found[0];assert.ok(ref.id.startsWith('mat-wire-aks-'));assert.ok(ref.productLabel.includes(code));assert.equal(ref.packageSize,length);assert.equal(ref.packageUnit,'mb');assert.equal(PRODUCT_PHOTOS.find(p=>p.ids.includes(ref.id))?.ean,ean);assert.ok(getProductPhoto(ref)?.startsWith('https://www.abud.pl/'));return{id:'qa-'+i,kind:'catalogue' as const,referenceId:ref.id,quantity:2.4};});
 const stage=withBasketExtras([],extras)[0];assert.equal(stage.jobId,'additional-materials');assert.equal(new Set(stage.materials.map(l=>l.material.ean)).size,4);assert.ok(stage.materials.every(l=>l.quantity===2.4&&l.material.unit==='mb'&&l.material.category==='wire'));assert.equal(extraMaterial(extras[0]).quantity,2.4);
 for(const [id,ean]of[['mat-wire-ydyp-3x15-akszielonka-100m','5904617573771'],['mat-wire-ydyp-3x25-akszielonka-100m','5904617573764']]){assert.ok(MATERIAL_PRICES.some(r=>r.id===id));assert.equal(PRODUCT_PHOTOS.find(p=>p.ids.includes(id))?.ean,ean);}
});
