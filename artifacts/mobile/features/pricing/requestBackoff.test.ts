import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, createBackoffFetch, RequestBackoff, retryAfterDeadline } from './requestBackoff';

test('Retry-After accepts seconds and HTTP dates without shortening the server wait', () => {
  const now = Date.parse('2026-10-31T14:00:00Z');
  assert.equal(retryAfterDeadline('125', now), now + 125_000);
  assert.equal(retryAfterDeadline('Sat, 31 Oct 2026 14:03:00 GMT', now), now + 180_000);
  assert.equal(retryAfterDeadline('Sat, 31 Oct 2026 13:59:00 GMT', now), now);
  assert.equal(retryAfterDeadline('0', now), now);
});
test('missing, overflowing and malformed headers use the conservative fallback', () => {
  for (const header of [null, '', '-1', '1.5', '999999999999999999999', 'tomorrow']) assert.equal(retryAfterDeadline(header, 1000), 61_000);
});
test('a shared cooldown covers later calls and expires without an automatic retry', () => {
  const backoff = new RequestBackoff();
  assert.equal(backoff.remainingDeadline(1000), null);
  assert.equal(backoff.observe('120', 1000), 121_000);
  assert.equal(backoff.observe('1', 2000), 121_000);
  assert.equal(backoff.remainingDeadline(120_999), 121_000);
  assert.equal(backoff.remainingDeadline(121_000), null);
});

test('429 stops all later network calls until Retry-After, including a changed basket', async () => {
  let now = 1000, calls = 0;
  const request = createBackoffFetch(async () => {
    calls++;
    return calls === 1 ? new Response('Too many requests', { status: 429, headers: { 'retry-after': '125' } }) : new Response('{"ok":true}');
  }, () => now);
  await assert.rejects(request('/project', { method: 'POST', body: 'basket one' }), (e: unknown) => e instanceof ApiError && e.retryAt === 126_000);
  now = 125_999;
  for (const url of ['/project', '/history']) await assert.rejects(request(url), (e: unknown) => e instanceof ApiError && e.status === 429 && e.retryAt === 126_000);
  assert.equal(calls, 1);
  now = 126_000;
  assert.equal((await request('/project', { method: 'POST', body: 'latest basket' })).status, 200);
  assert.equal(calls, 2);
});
test('network and non-429 errors retain their behavior without starting a cooldown', async () => {
  let calls = 0;
  const request = createBackoffFetch(async () => { if (++calls === 1) throw Error('offline'); return new Response('unavailable', { status: 503 }); });
  await assert.rejects(request('/project'), /offline/);
  assert.equal((await request('/project')).status, 503);
  assert.equal((await request('/project')).status, 503);
  assert.equal(calls, 3);
});
