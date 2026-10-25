import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDeliveryCosts, normalizeDeliveryPostalCode } from './deliveryInput';
test('each user supplies a valid destination postcode instead of a global application address', () => {
  assert.equal(normalizeDeliveryPostalCode('00-001'), '00-001');
  assert.equal(normalizeDeliveryPostalCode(' 30001 '), '30-001');
  for (const invalid of ['', '123', '123456', 'ab-cde', '1-2345']) assert.equal(normalizeDeliveryPostalCode(invalid), null);
});
test('delivery cost input keeps blank distinct from zero and parses Polish currency precisely', () => {
  const result = parseDeliveryCosts({ A: '', B: '0', C: '19,90', D: '0.29' });
  assert.ok(result.ok);
  assert.equal(Object.hasOwn(result.costsGrosze, 'A'), false);
  assert.equal(result.costsGrosze.B, 0); assert.equal(result.costsGrosze.C, 1990); assert.equal(result.costsGrosze.D, 29);
  for (const invalid of ['-1', '1,999', '2abc', '100001', 'NaN', '2,', '1e2']) assert.equal(parseDeliveryCosts({ A: invalid }).ok, false, invalid);
});
