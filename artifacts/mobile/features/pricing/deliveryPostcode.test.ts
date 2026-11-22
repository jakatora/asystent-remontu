import assert from 'node:assert/strict';
import {test} from 'node:test';
import {isClearedSharedPostcode,parseSharedPostcode,serializeSharedPostcode} from './deliveryPostcode';
test('shared delivery preference contains only a validated postcode, never shipping prices',()=>{
  assert.equal(parseSharedPostcode(serializeSharedPostcode('00-001')),'00-001');
  const raw=JSON.stringify({version:1,postalCode:'30-001',deliveryGrosze:0,quotes:[{expiresAt:'2099-01-01'}]});
  assert.deepEqual(JSON.parse(serializeSharedPostcode(parseSharedPostcode(raw)!)!),{version:1,postalCode:'30-001'});
});
test('partial or corrupt postcode cannot become an automatic delivery destination',()=>{
  for(const raw of [null,'{','null',JSON.stringify({version:2,postalCode:'00-001'}),JSON.stringify({version:1,postalCode:12345}),JSON.stringify({version:1,postalCode:'00-00'})])assert.equal(parseSharedPostcode(raw),null);
  assert.equal(serializeSharedPostcode('00001'),null);
  assert.equal(isClearedSharedPostcode(serializeSharedPostcode(undefined)),true);
  assert.equal(isClearedSharedPostcode(serializeSharedPostcode("00-001")),false);
});
