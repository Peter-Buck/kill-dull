// killdull.com/intelligence is a machine endpoint and a signpost. BUREAU's
// server reads it with its Vercel-signed identity; everyone else is sent to BUREAU. No
// secret ever lives in a URL, and no window is answered that was not asked for.

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { machine, bureauIdentity, resetKeys, windowOf, bureauURL, READER } from '../../lib/intel/access.mjs';

const now = new Date('2026-10-02T15:00:00Z');
const p = (q) => new URLSearchParams(q);

// A stand-in for Vercel's OIDC issuer: a real RSA key, published as a JWKS.
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };
let jwksCalls = 0;
const fetchJwks = async (url) => {
  jwksCalls++;
  assert.match(url, /^https:\/\/oidc\.vercel\.com(\/peter-buck-s-projects)?\/\.well-known\/jwks$/);
  return { ok: true, json: async () => ({ keys: [jwk] }) };
};
const NOW = Date.parse('2026-10-02T15:00:00Z');
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function jwt(over = {}, { key = privateKey, kid = 'k1', alg = 'RS256' } = {}) {
  const t = Math.floor(NOW / 1000);
  const claims = {
    iss: 'https://oidc.vercel.com/peter-buck-s-projects', aud: 'https://vercel.com/peter-buck-s-projects',
    sub: 'owner:peter-buck-s-projects:project:bureau:environment:production',
    iat: t - 60, nbf: t - 60, exp: t + 3600,
    owner: 'peter-buck-s-projects', owner_id: READER.ownerId, project: 'bureau', project_id: READER.projectId, environment: 'production',
    ...over,
  };
  const head = b64({ typ: 'JWT', alg, kid });
  const body = b64(claims);
  return `${head}.${body}.${sign('RSA-SHA256', Buffer.from(`${head}.${body}`), key).toString('base64url')}`;
}
const opts = { now: NOW, fetch: fetchJwks };

test("BUREAU's production identity, signed by Vercel, is the reader", async () => {
  assert.equal(await bureauIdentity(jwt(), opts), true);
  assert.equal(await machine({ authorization: `Bearer ${jwt()}` }, {}, opts), 'ok');
  assert.equal(await bureauIdentity(jwt({ iss: 'https://oidc.vercel.com' }), opts), true, 'global issuer mode');
});

test('anything else is denied: another project, a preview, another team, expired, forged, or a stranger', async () => {
  for (const [why, token] of [
    ['another project', jwt({ project_id: 'prj_other' })],
    ['a BUREAU preview', jwt({ environment: 'preview' })],
    ['another team', jwt({ owner_id: 'team_other' })],
    ['expired', jwt({ exp: Math.floor(NOW / 1000) - 3600 })],
    ['not yet valid', jwt({ nbf: Math.floor(NOW / 1000) + 3600 })],
    ['a foreign issuer', jwt({ iss: 'https://evil.example' })],
    ['signed by another key', jwt({}, { key: other.privateKey })],
    ['an unknown key id', jwt({}, { kid: 'k2' })],
    ['alg none', jwt({}, { alg: 'none' })],
    ['garbage', 'a.b.c'],
  ]) {
    assert.equal(await bureauIdentity(token, opts), false, why);
  }
  const t = jwt().split('.');
  const tampered = `${t[0]}.${b64({ ...JSON.parse(Buffer.from(t[1], 'base64url')), project_id: READER.projectId, environment: 'production', exp: 9e9 })}.${t[2]}`;
  assert.equal(await bureauIdentity(tampered, opts), false, 'claims edited after signing');
});

test('no header, a cookie or a query secret is never a machine', async () => {
  assert.equal(await machine({}, {}, opts), 'denied');
  assert.equal(await machine({ cookie: 'kd_intel=x' }, {}, opts), 'denied');
  assert.equal(await machine({ authorization: jwt() }, {}, opts), 'denied', 'must be a Bearer header');
});

test("Vercel's keys are cached rather than fetched on every request", async () => {
  const before = jwksCalls;
  for (let i = 0; i < 5; i++) await bureauIdentity(jwt(), opts);
  assert.ok(jwksCalls - before <= 1);
});

test('an unreachable key set denies rather than admits', async () => {
  resetKeys();
  assert.equal(await bureauIdentity(jwt(), { now: NOW, fetch: async () => { throw new Error('down'); } }), false);
  assert.equal(await bureauIdentity(jwt(), { now: NOW, fetch: async () => ({ ok: false, json: async () => ({}) }) }), false);
});

test('an optional static token still works only when configured, and only exactly', async () => {
  assert.equal(await machine({ authorization: 'Bearer static-token-0123456789' }, { INTELLIGENCE_READ_TOKEN: 'static-token-0123456789' }, opts), 'ok');
  assert.equal(await machine({ authorization: 'Bearer static-token-012345678' }, { INTELLIGENCE_READ_TOKEN: 'static-token-0123456789' }, opts), 'denied');
  assert.equal(await machine({ authorization: 'Bearer undefined' }, {}, opts), 'denied');
});

test('the window: three lengths, an optional pinned end, nothing else', () => {
  assert.deepEqual(windowOf(p(''), now), { hours: 24, end: null });
  assert.deepEqual(windowOf(p('hours=168'), now), { hours: 168, end: null });
  assert.equal(windowOf(p('hours=25'), now), null);
  assert.equal(windowOf(p('hours=abc'), now), null);
  const w = windowOf(p('hours=24&end=2026-10-02T15:00:00Z'), now);
  assert.equal(w.end.toISOString(), '2026-10-02T15:00:00.000Z');
  assert.ok(windowOf(p('end=2026-10-02T14:59:59.000Z'), now));
});

test('a pinned end must be a UTC instant, not in the future, and not ancient', () => {
  for (const end of ['2026-10-02', '2026-10-02T15:00:00+01:00', 'yesterday', '2026-10-03T00:00:00Z',
    '2025-01-01T00:00:00Z', '2026-10-02T15:00:00Z<script>']) {
    assert.equal(windowOf(p(`end=${encodeURIComponent(end)}`), now), null, end);
  }
});

test('a browser is sent to BUREAU with only its window', () => {
  assert.equal(bureauURL(null), 'https://bureau.killdull.com/intelligence');
  assert.equal(bureauURL({ hours: 72, end: null }), 'https://bureau.killdull.com/intelligence?hours=72');
  assert.equal(bureauURL({ hours: 24, end: new Date('2026-10-02T15:00:00Z') }),
    'https://bureau.killdull.com/intelligence?hours=24&end=2026-10-02T15%3A00%3A00.000Z');
});
