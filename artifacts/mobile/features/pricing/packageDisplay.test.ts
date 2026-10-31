import assert from 'node:assert/strict';
import {test} from 'node:test';
import {formatPackageSize,formatPackageUnit,formatPurchase} from './packageDisplay';

test('package specifications retain their precision independently of two-decimal prices',()=>{
  assert.equal(formatPackageSize(2.235),'2,235');
  assert.equal(formatPackageSize(6.25),'6,25');
  assert.equal(formatPackageSize(0.015),'0,015');
  assert.equal(formatPackageSize(2.235,'en'),'2.235');
  assert.equal(formatPackageSize(5),'5');
  assert.equal(formatPackageSize(NaN),'—');
  assert.equal(formatPackageUnit('m2'),'m²');
  assert.equal(formatPackageUnit('ml'),'ml');
  assert.equal(formatPackageUnit(null),'');
  assert.equal(formatPurchase({count:1,packageSize:6.2,cutRoll:{widthMm:2000,lengthMm:3100}},'m2'),'1 × odcinek 2 m × 3,1 m');
});

test('a reviewed Dekork bundle shows the number of physical packs; other units, links and offers keep their own meaning',()=>{
 const url='https://dekork.pl/products/profesjonalny-podklad-lvt-1-5mm-wysoka-gestosc-6m2-do-60m2?variant=57433631392075',pack={count:1,packageSize:12,offerId:'dekork-professional-2pack',url};
 assert.equal(formatPurchase(pack,'m2'),'1 × zestaw 2 paczek po 6 m² (12 m²)');assert.equal(formatPurchase({...pack,count:2},'m2','en'),'2 × set of 2 packs of 6 m² (12 m²)');
 assert.equal(formatPurchase({...pack,url:url.replace('57433631392075','57433631359307')},'m2'),'1 × 12 m²');assert.equal(formatPurchase({...pack,offerId:'other'},'m2'),'1 × 12 m²');assert.equal(formatPurchase({...pack,packageSize:10},'m2'),'1 × 10 m²');assert.equal(formatPurchase({...pack,url:'https://other.example'},'m2'),'1 × 12 m²');assert.equal(formatPurchase({...pack,url:'invalid'},'m2'),'1 × 12 m²');assert.equal(formatPurchase(pack,'m'),'1 × 12 m');
});
