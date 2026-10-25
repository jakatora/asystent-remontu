import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QuoteQueue } from '../src/lib/quote-queue';

test('quote permits wait in FIFO order, release once, and never exceed concurrency', async()=>{
  const queue = new QuoteQueue(1,2,1000);
  const first = await queue.acquire(); assert.ok(first);
  const sequence: number[]=[];
  const second = queue.acquire().then(release=>{assert.ok(release);sequence.push(2);return release;});
  const third = queue.acquire().then(release=>{assert.ok(release);sequence.push(3);return release;});
  assert.equal(await queue.acquire(),null);
  first();first();
  const releaseSecond = await second;
  assert.deepEqual(sequence,[2]);
  releaseSecond();const releaseThird=await third;
  assert.deepEqual(sequence,[2,3]);releaseThird();
  const last=await queue.acquire();assert.ok(last);last();
});

test('expired quote waiters do not steal a permit or leave the queue full',async()=>{
  const queue = new QuoteQueue(1,1,5), release=await queue.acquire();assert.ok(release);
  assert.equal(await queue.acquire(),null);
  release();const next=await queue.acquire();assert.ok(next);next();
});
