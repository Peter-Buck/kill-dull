// The opt-out is a cookie on the browser that asks for it, and nothing else.

import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/intelligence-optout.js';

function call(url, headers = {}) {
  const req = { method: 'GET', url, headers: { host: 'killdull.com', ...headers } };
  const res = { statusCode: 0, headers: {}, body: '',
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  handler(req, res);
  return res;
}

test('state=on sets a durable, first-party, HttpOnly cookie for apex and www', () => {
  const c = call('/api/intelligence-optout?state=on').headers['set-cookie'];
  assert.match(c, /^kd_internal=1;/);
  assert.match(c, /Max-Age=34560000/);
  assert.match(c, /HttpOnly/);
  assert.match(c, /Secure/);
  assert.match(c, /Domain=killdull\.com/);
});

test('state=off removes it', () => {
  assert.match(call('/api/intelligence-optout?state=off').headers['set-cookie'], /^kd_internal=; .*Max-Age=0/);
});

test('with no state it only reports, and changes nothing', () => {
  const r = call('/api/intelligence-optout', { cookie: 'kd_internal=1' });
  assert.equal(r.headers['set-cookie'], undefined);
  assert.match(r.body, /excluded/);
  assert.match(call('/api/intelligence-optout').body, /counted/);
});

test('it is never cached or indexed, and reads nothing about the network', () => {
  const r = call('/api/intelligence-optout?state=on', { 'x-forwarded-for': '203.0.113.9' });
  assert.equal(r.headers['cache-control'], 'no-store, private');
  assert.match(r.headers['x-robots-tag'], /noindex/);
  assert.equal(r.body.includes('203.0.113.9'), false);
});

test('a host outside killdull.com gets a host-only cookie', () => {
  assert.equal(call('/api/intelligence-optout?state=on', { host: 'kill-dull-x.vercel.app' }).headers['set-cookie'].includes('Domain='), false);
});
