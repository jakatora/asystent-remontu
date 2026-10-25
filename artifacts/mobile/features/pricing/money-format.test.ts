import assert from 'node:assert/strict';
import {test} from 'node:test';
import {formatGrosze} from './pricingApi';

test('unknown delivery amounts cannot display as free; Polish prices keep grosze and change direction',()=>{
 for(const value of [null,undefined,NaN,Infinity,12.5])assert.equal(formatGrosze(value),'—');
 const text=(amount:number)=>formatGrosze(amount).replace(/\s/g,' ');
 assert.equal(text(0),'0,00 zł');assert.equal(text(34979),'349,79 zł');assert.equal(text(-123),'-1,23 zł');assert.equal(text(1234567),'12 345,67 zł');
 assert.equal(formatGrosze(34979,'PLN','en-GB'),'PLN\u00a0349.79');
});
