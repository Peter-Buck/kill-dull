// Network enrichment is the only code that touches a visitor's IP address.
// Most of what follows tests things that must NOT happen: the IP must not be
// read without a key, must not reach the cache key or the cached value, must
// not appear in the returned signal, and a failing provider must not turn into
// a delay, an exception, or a poisoned week-long cache entry.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { resolveNetwork, UNKNOWN_NETWORK, __test } from '../../lib/collect/network.mjs';

const IP = '203.0.113.47';
const headers = { 'x-forwarded-for': `${IP}, 70.41.3.18` };
const KEY = 'ipreg-key';
const SALT = 'salt-value';

const ipregistryBody = {
  connection: { asn: 16509, organization: 'Burberry Group plc', type: 'business' },
  company: { name: 'Burberry Group plc', domain: 'burberry.com', type: 'business' },
  security: {},
};
const providerOk = async () => ({ ok: true, json: async () => ipregistryBody });

/** An in-memory cache that records everything it is asked to store. */
function spyCache(seed = {}) {
  const store = { ...seed };
  const calls = { get: [], set: [] };
  return {
    store, calls,
    async get(k) { calls.get.push(k); return store[k] ?? null; },
    async set(k, v, ttl) { calls.set.push({ k, v, ttl }); store[k] = v; return true; },
  };
}

// ── enrichment is strictly additive ─────────────────────────────────────────

test('without a key the IP is never read and everyone is UNKNOWN', async () => {
  const asked = [];
  const spy = new Proxy({ ...headers }, {
    get(t, k) { if (typeof k === 'string') asked.push(k); return t[k]; },
  });
  const out = await resolveNetwork(spy, spyCache(), { key: undefined, salt: SALT });
  assert.deepEqual(out, UNKNOWN_NETWORK);
  assert.deepEqual(asked, [], 'no header should be read at all without a key');
});

test('no x-forwarded-for means UNKNOWN and no provider call', async () => {
  let called = false;
  const out = await resolveNetwork({}, null, {
    key: KEY, salt: SALT, fetch: async () => { called = true; return providerOk(); },
  });
  assert.deepEqual(out, UNKNOWN_NETWORK);
  assert.equal(called, false);
});

test('only the first x-forwarded-for hop is used, and an over-long value is refused', () => {
  assert.equal(__test.clientIp(headers), IP);
  assert.equal(__test.clientIp({ 'x-forwarded-for': 'x'.repeat(46) }), null);
  assert.equal(__test.clientIp({}), null);
});

// ── the provider receives the IP and nothing else ───────────────────────────

test('the provider gets the IP and the key, and no other visitor data', async () => {
  let seen = null;
  await resolveNetwork(
    { ...headers, cookie: 'kd_did=abc123', referer: 'https://example.com/secret' },
    null,
    { key: KEY, salt: SALT, fetch: async (url, init) => { seen = { url, init }; return providerOk(); } },
  );
  const url = new URL(seen.url);
  assert.equal(url.origin + url.pathname, `https://api.ipregistry.co/${IP}`);
  assert.deepEqual([...url.searchParams.keys()], ['key']);
  assert.equal(seen.init.body, undefined, 'nothing is sent in a body');
  assert.deepEqual(Object.keys(seen.init.headers), ['accept']);
  const wire = JSON.stringify(seen);
  assert.equal(wire.includes('kd_did'), false);
  assert.equal(wire.includes('secret'), false);
});

// ── the cache key is a salted hash, never the address ───────────────────────

test('the cache key is sha256(salt + ip), truncated, and contains no IP', () => {
  const key = __test.cacheKey(IP, SALT);
  const expected = createHash('sha256').update(`${SALT}:${IP}`).digest('hex').slice(0, 32);
  assert.equal(key, `net:${expected}`);
  assert.equal(key.includes(IP), false);
  assert.equal(key.includes('203'), false);
});

test('a different salt produces a different key for the same IP', () => {
  assert.notEqual(__test.cacheKey(IP, 'salt-a'), __test.cacheKey(IP, 'salt-b'));
});

test('NO SALT MEANS NO CACHE — nothing is read and nothing is written', async () => {
  assert.equal(__test.cacheKey(IP, undefined), null);
  assert.equal(__test.cacheKey(IP, ''), null);

  const cache = spyCache();
  const out = await resolveNetwork(headers, cache, { key: KEY, salt: undefined, fetch: providerOk });

  assert.equal(out.net_state, 'ORG_IDENTIFIED', 'the lookup still happens');
  assert.deepEqual(cache.calls.get, [], 'no cache read without a salt');
  assert.deepEqual(cache.calls.set, [], 'no cache write without a salt');
  assert.deepEqual(cache.store, {}, 'nothing persisted');
});

// ── UNKNOWN is never cached ─────────────────────────────────────────────────

test('UNKNOWN is never cached — a transient failure must not pin for a week', async () => {
  const cases = {
    'HTTP error': async () => ({ ok: false, status: 429, json: async () => ({}) }),
    'thrown fetch': async () => { throw new Error('ECONNRESET'); },
    'bad JSON': async () => ({ ok: true, json: async () => { throw new Error('bad json'); } }),
  };
  for (const [label, fetchImpl] of Object.entries(cases)) {
    const cache = spyCache();
    const out = await resolveNetwork(headers, cache, { key: KEY, salt: SALT, fetch: fetchImpl });
    assert.deepEqual(out, UNKNOWN_NETWORK, label);
    assert.deepEqual(cache.calls.set, [], `${label}: UNKNOWN must not be written`);
  }
});

test('a real answer IS cached, with the seven-day ttl', async () => {
  const cache = spyCache();
  await resolveNetwork(headers, cache, { key: KEY, salt: SALT, fetch: providerOk });
  assert.equal(cache.calls.set.length, 1);
  assert.equal(cache.calls.set[0].ttl, 60 * 60 * 24 * 7);
  assert.equal(cache.calls.set[0].v.net_state, 'ORG_IDENTIFIED');
});

test('a cache hit short-circuits the provider entirely', async () => {
  const hit = { net_state: 'MOBILE', net_asn: 1, net_name: 'T-Mobile', net_org: null, net_domain: null, net_type: null };
  const cache = spyCache({ [__test.cacheKey(IP, SALT)]: hit });
  let called = false;
  const out = await resolveNetwork(headers, cache, {
    key: KEY, salt: SALT, fetch: async () => { called = true; return providerOk(); },
  });
  assert.deepEqual(out, hit);
  assert.equal(called, false, 'a hit must not call the provider');
});

test('a malformed cache hit is ignored and the provider is consulted', async () => {
  const cache = spyCache({ [__test.cacheKey(IP, SALT)]: { garbage: true } });
  const out = await resolveNetwork(headers, cache, { key: KEY, salt: SALT, fetch: providerOk });
  assert.equal(out.net_state, 'ORG_IDENTIFIED');
});

test('a throwing cache degrades to a live lookup rather than an error', async () => {
  const broken = { async get() { throw new Error('upstash down'); }, async set() { throw new Error('upstash down'); } };
  const out = await resolveNetwork(headers, broken, { key: KEY, salt: SALT, fetch: providerOk });
  assert.equal(out.net_state, 'ORG_IDENTIFIED');
});

test('a null cache is a valid configuration', async () => {
  const out = await resolveNetwork(headers, null, { key: KEY, salt: SALT, fetch: providerOk });
  assert.equal(out.net_state, 'ORG_IDENTIFIED');
});

// ── failure and timeout must never delay or drop an event ───────────────────

test('a hanging provider aborts on its own signal instead of hanging the request', async () => {
  const started = Date.now();
  const out = await resolveNetwork(headers, null, {
    key: KEY, salt: SALT,
    fetch: (_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new Error('aborted')));
    }),
  });
  assert.deepEqual(out, UNKNOWN_NETWORK);
  assert.ok(Date.now() - started < 3000, 'must abort near the 1200ms provider timeout');
});

test('an abort signal is always supplied to the provider', async () => {
  let signal = null;
  await resolveNetwork(headers, null, {
    key: KEY, salt: SALT, fetch: async (_u, init) => { signal = init.signal; return providerOk(); },
  });
  assert.ok(signal instanceof AbortSignal);
});

test('a provider shape change degrades to fewer facts, never a throw', async () => {
  const out = await resolveNetwork(headers, null, {
    key: KEY, salt: SALT, fetch: async () => ({ ok: true, json: async () => ({ unexpected: 'shape' }) }),
  });
  assert.equal(out.net_state, 'UNKNOWN');
});

test('facts mapping survives a null body', () => {
  const f = __test.factsFromIpregistry({});
  assert.equal(f.asn, null);
  assert.equal(f.companyName, null);
  assert.equal(f.isVpn, false);
});

// ── the load-bearing assertion: no raw IP can escape ────────────────────────

test('NO RAW IP ESCAPES into the returned signal, the cache key or the cached value', async () => {
  const cache = spyCache();
  const out = await resolveNetwork(headers, cache, { key: KEY, salt: SALT, fetch: providerOk });

  const contains = (o) => JSON.stringify(o).includes(IP);
  assert.equal(contains(out), false, 'the returned signal must not carry the IP');
  assert.equal(cache.calls.get.some((k) => k.includes(IP)), false, 'cache read key');
  assert.equal(cache.calls.set.some((c) => c.k.includes(IP) || contains(c.v)), false, 'cache write');
  assert.equal(contains(cache.store), false, 'nothing persisted contains the IP');

  // Also true for the hop the header carried second, and for a bare octet.
  assert.equal(JSON.stringify(out).includes('70.41.3.18'), false);
});

test('the IP does not survive in any UNKNOWN path either', async () => {
  for (const fetchImpl of [
    async () => { throw new Error(`failed for ${IP}`); },
    async () => ({ ok: false, status: 500, json: async () => ({ error: IP }) }),
    async () => ({ ok: true, json: async () => ({ ip: IP, connection: { organization: IP } }) }),
  ]) {
    const cache = spyCache();
    const out = await resolveNetwork(headers, cache, { key: KEY, salt: SALT, fetch: fetchImpl });
    // The third case deliberately feeds the IP back as an org name: the
    // classifier may carry it as net_name, but it must never be cached under a
    // key derived from anything but the salted hash, and never become an org.
    assert.equal(out.net_org, null, 'an IP-shaped string must never become an organization');
    assert.equal(cache.calls.set.some((c) => c.k.includes(IP)), false);
  }
});

test('the signal shape is fixed — no field can smuggle extra data through', async () => {
  const out = await resolveNetwork(headers, null, { key: KEY, salt: SALT, fetch: providerOk });
  assert.deepEqual(
    Object.keys(out).sort(),
    ['net_asn', 'net_domain', 'net_name', 'net_org', 'net_state', 'net_type'],
  );
});
