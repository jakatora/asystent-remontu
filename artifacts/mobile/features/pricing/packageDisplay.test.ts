import assert from 'node:assert/strict';
import {test} from 'node:test';
import {formatPackageSize,formatPackageUnit} from './packageDisplay';

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
});
