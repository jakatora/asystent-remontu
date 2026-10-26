import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computePackagesNeeded } from './purchase-quantity';

test('exact decimal pack multiples do not buy one unnecessary physical pack',()=>{
 assert.equal(computePackagesNeeded(33.6,2.4),14);
 assert.equal(computePackagesNeeded(0.1+0.2,0.1),3);
 assert.equal(computePackagesNeeded(1.2+1.2,2.4),1);
 assert.equal(computePackagesNeeded(189.6,2.4),79);
});
test('an actual excess requires another pack, while any positive demand still needs at least one',()=>{
 assert.equal(computePackagesNeeded(33.600001,2.4),15);
 assert.equal(computePackagesNeeded(33.600000001,2.4),15);
 assert.equal(computePackagesNeeded(0.000000001,2.4),1);
 assert.equal(computePackagesNeeded(Number.MIN_VALUE,2.4),1);
 assert.equal(computePackagesNeeded(0,2.4),0);
});
test('floating-point correction respects actual manufacturer order lots',()=>{
 assert.equal(computePackagesNeeded(33.6,2.4,7),14);
 assert.equal(computePackagesNeeded(33.600001,2.4,7),21);
 assert.throws(()=>computePackagesNeeded(1,2.4,0));
});
