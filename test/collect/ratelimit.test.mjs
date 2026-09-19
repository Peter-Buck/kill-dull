// The rate limiter has two hard rules: it never keys on an IP, and it never
// drops a legitimate event because the limiter itself is broken. Most of what
// follows tests the second one, because fail-closed is the easy mistake.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, DEFAULT_LIMIT, DEFAULT_WINDOW_MS } from '../../lib/collect/ratelimit.mjs';

const DID = '7f3c1a9e-0b2d-4c6f-9a81-2e5d7c4b0a13';
const IP = '203.0.113.47';

/** A cache whose pipeline returns a fixed ZCARD, recording what it was asked. */
function fakeCache(zcard, behaviour = 'ok') {
  const seen = [];
  return {
    seen,
    async pipeline(commands) {
      seen.push(commands);
      if (behaviour === 'throw') throw new Error('upstash down');
      if (behaviour === 'null') return null;
      if (behaviour === 'garbage') return [{}, {}, { result: 'not a number' }, {}];
      if (behaviour === 'notarray') return { result: 'nope' };
      return [0, 1, zcard, 1];
    },
  };
}

test('defaults are 100 events per 60 seconds', () => {
  assert.equal(DEFAULT_LIMIT, 100);
  assert.equal(DEFAULT_WINDOW_MS, 60_000);
});

test('under the limit is allowed; at the limit is allowed; over is not', async () => {
  for (const [count, expected] of [[1, true], [99, true], [100, true], [101, false], [500, false]]) {
    const limiter = createRateLimiter({ cache: fakeCache(count) });
    const v = await limiter.check(DID);
    assert.equal(v.allowed, expected, `count ${count}`);
    assert.equal(v.degraded, false);
  }
});

test('THE KEY IS THE DISTINCT ID AND NEVER AN IP', async () => {
  const cache = fakeCache(1);
  const limiter = createRateLimiter({ cache });
  await limiter.check(DID);

  const wire = JSON.stringify(cache.seen);
  assert.equal(wire.includes(IP), false, 'no IP may appear in any command');
  assert.equal(wire.includes('203.'), false, 'not even an octet');
  assert.ok(wire.includes(DID), 'the verified distinctId is the identifier');

  const key = cache.seen[0][0][1];
  assert.equal(key, `collect:min:${DID}`);
});

test('the sliding window trims, records, counts and expires in one round trip', async () => {
  const now = 1_700_000_000_000;
  const cache = fakeCache(1);
  const limiter = createRateLimiter({ cache, now: () => now });
  await limiter.check(DID);

  const [trim, add, card, expire] = cache.seen[0];
  assert.equal(cache.seen.length, 1, 'one pipeline, not four requests');
  assert.deepEqual(trim.slice(0, 3), ['ZREMRANGEBYSCORE', `collect:min:${DID}`, '0']);
  assert.equal(trim[3], String(now - DEFAULT_WINDOW_MS), 'trims exactly one window back');
  assert.equal(add[0], 'ZADD');
  assert.equal(add[2], String(now), 'scored by timestamp');
  assert.equal(card[0], 'ZCARD');
  assert.equal(expire[0], 'PEXPIRE');
  assert.ok(Number(expire[2]) > DEFAULT_WINDOW_MS, 'idle keys disappear on their own');
});

test('two events in the same millisecond both count', async () => {
  const now = 1_700_000_000_000;
  const cache = fakeCache(2);
  const limiter = createRateLimiter({ cache, now: () => now });
  await limiter.check(DID);
  await limiter.check(DID);
  const [m1, m2] = [cache.seen[0][1][3], cache.seen[1][1][3]];
  assert.notEqual(m1, m2, 'sorted-set members must be unique or one overwrites the other');
});

test('different visitors have independent budgets', async () => {
  const cache = fakeCache(1);
  const limiter = createRateLimiter({ cache });
  await limiter.check('visitor-a');
  await limiter.check('visitor-b');
  assert.notEqual(cache.seen[0][0][1], cache.seen[1][0][1]);
});

// ── fail open, every way it can break ───────────────────────────────────────

test('FAILS OPEN when Upstash throws', async () => {
  const limiter = createRateLimiter({ cache: fakeCache(1, 'throw') });
  const v = await limiter.check(DID);
  assert.equal(v.allowed, true);
  assert.equal(v.degraded, true);
});

test('FAILS OPEN when the pipeline returns null (HTTP error or timeout)', async () => {
  const v = await createRateLimiter({ cache: fakeCache(1, 'null') }).check(DID);
  assert.equal(v.allowed, true);
  assert.equal(v.degraded, true);
});

test('FAILS OPEN on an unexpected answer shape', async () => {
  for (const behaviour of ['garbage', 'notarray']) {
    const v = await createRateLimiter({ cache: fakeCache(1, behaviour) }).check(DID);
    assert.equal(v.allowed, true, behaviour);
    assert.equal(v.degraded, true, behaviour);
  }
});

test('no cache at all means no limiter, which the route treats as allowed', () => {
  assert.equal(createRateLimiter({ cache: null }), null);
  assert.equal(createRateLimiter({ cache: {} }), null);
  assert.equal(createRateLimiter({}), null);
});

test('an empty identifier is allowed rather than throwing', async () => {
  const limiter = createRateLimiter({ cache: fakeCache(1) });
  for (const id of ['', null, undefined, 42]) {
    const v = await limiter.check(id);
    assert.equal(v.allowed, true);
  }
});

test('a custom limit and window are honoured', async () => {
  const now = 1_700_000_000_000;
  const cache = fakeCache(6);
  const limiter = createRateLimiter({ cache, limit: 5, windowMs: 10_000, now: () => now });
  const v = await limiter.check(DID);
  assert.equal(v.allowed, false);
  assert.equal(cache.seen[0][0][3], String(now - 10_000));
});
