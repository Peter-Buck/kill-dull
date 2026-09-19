// The Upstash REST cache. Its job is to be invisible: a hit returns the value,
// and every other outcome — missing config, HTTP error, timeout, malformed
// body — is a miss that the caller can ignore.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createCache } from '../../lib/collect/cache.mjs';

const ok = (result) => ({ ok: true, json: async () => ({ result }) });
const opts = (fetchImpl) => ({ url: 'https://example.upstash.io', token: 't0ken', fetch: fetchImpl });

test('no url or no token means no cache at all', () => {
  assert.equal(createCache({ url: '', token: 't', fetch: () => {} }), null);
  assert.equal(createCache({ url: 'https://x', token: '', fetch: () => {} }), null);
});

test('a get issues a Redis GET and decodes the stored JSON', async () => {
  let sent = null;
  const cache = createCache(opts(async (url, init) => {
    sent = { url, body: JSON.parse(init.body), auth: init.headers.authorization };
    return ok(JSON.stringify({ net_state: 'ORG_IDENTIFIED' }));
  }));
  const value = await cache.get('net:abc');
  assert.deepEqual(value, { net_state: 'ORG_IDENTIFIED' });
  assert.deepEqual(sent.body, ['GET', 'net:abc']);
  assert.equal(sent.auth, 'Bearer t0ken');
});

test('a set sends SET with an EX ttl and reports the confirmed write', async () => {
  let body = null;
  const cache = createCache(opts(async (_url, init) => { body = JSON.parse(init.body); return ok('OK'); }));
  const stored = await cache.set('net:abc', { net_state: 'MOBILE' }, 604800);
  assert.equal(stored, true);
  assert.deepEqual(body, ['SET', 'net:abc', '{"net_state":"MOBILE"}', 'EX', '604800']);
});

test('a missing key is null, not undefined or a throw', async () => {
  const cache = createCache(opts(async () => ok(null)));
  assert.equal(await cache.get('net:missing'), null);
});

test('an HTTP error is a miss', async () => {
  const cache = createCache(opts(async () => ({ ok: false, status: 500, json: async () => ({}) })));
  assert.equal(await cache.get('net:abc'), null);
  assert.equal(await cache.set('net:abc', {}, 60), false);
});

test('a thrown fetch is a miss rather than an exception', async () => {
  const cache = createCache(opts(async () => { throw new Error('ECONNRESET'); }));
  assert.equal(await cache.get('net:abc'), null);
  assert.equal(await cache.set('net:abc', {}, 60), false);
});

test('an unparseable stored value is a miss', async () => {
  const cache = createCache(opts(async () => ok('{not json')));
  assert.equal(await cache.get('net:abc'), null);
});

test('a hanging cache is abandoned, not waited on', async () => {
  // The contract is that enrichment never delays an event. A cache read that
  // never resolves has to abort on its own signal.
  const cache = createCache(opts((_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')));
  })));
  const started = Date.now();
  assert.equal(await cache.get('net:abc'), null);
  assert.ok(Date.now() - started < 1500, 'must abort well inside the provider timeout');
});
