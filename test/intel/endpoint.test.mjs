// The two handlers that answer for Intelligence at killdull.com: the read
// endpoint and the daily job. Both are exercised as Vercel calls them, with
// PostHog unconfigured so nothing leaves the process.

import test from 'node:test';
import assert from 'node:assert/strict';

// The optional static reader token stands in for BUREAU's OIDC identity here;
// the identity itself is tested against real signatures in access.test.mjs.
const TOKEN = 'read-token-for-tests-0123456789abcdef';
const CRON = 'cron-secret-for-tests-0123456789abcdef';
process.env.INTELLIGENCE_READ_TOKEN = TOKEN;
process.env.CRON_SECRET = CRON;
delete process.env.POSTHOG_PERSONAL_API_KEY;
delete process.env.UPSTASH_REDIS_REST_URL;

const { default: intelligence } = await import('../../api/intelligence.js');
const { default: cron } = await import('../../api/cron/intelligence.js');

async function call(handler, url, headers = {}, method = 'GET') {
  const req = { method, url, headers: { host: 'killdull.com', ...headers } };
  const res = { statusCode: 0, headers: {}, body: '',
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(b) { this.body = b || ''; } };
  await handler(req, res);
  return res;
}

test('A BROWSER IS REDIRECTED TO BUREAU, never shown data', async () => {
  const res = await call(intelligence, '/intelligence');
  assert.equal(res.statusCode, 302);
  assert.equal(res.headers.location, 'https://bureau.killdull.com/intelligence');
  assert.equal(res.body, '');
});

test('the window travels with the redirect; nothing else does', async () => {
  const res = await call(intelligence, '/intelligence?hours=72&k=old-secret&format=json');
  assert.equal(res.statusCode, 302);
  assert.equal(res.headers.location, 'https://bureau.killdull.com/intelligence?hours=72');
  assert.equal(res.headers.location.includes('old-secret'), false);
});

test('THE OLD ?k= AND kd_intel COOKIE OPEN NOTHING', async () => {
  const res = await call(intelligence, `/intelligence?format=json&k=${TOKEN}`, { cookie: `kd_intel=${TOKEN}` });
  assert.equal(res.statusCode, 302);
  assert.equal(res.headers['set-cookie'], undefined);
});

test('a wrong bearer is redirected like any browser', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ keys: [] }) });
  const res = await call(intelligence, '/intelligence', { authorization: 'Bearer nope' });
  assert.equal(res.statusCode, 302);
});

test('BUREAU\'s server gets JSON, never a page, and nothing is cached', async () => {
  const res = await call(intelligence, '/intelligence?hours=24', { authorization: `Bearer ${TOKEN}` });
  // PostHog is not configured here, so the honest answer is a 503 that names why.
  assert.equal(res.statusCode, 503);
  assert.match(res.headers['content-type'], /application\/json/);
  assert.equal(res.headers['cache-control'], 'no-store, private');
  const body = JSON.parse(res.body);
  assert.equal(body.error, 'posthog_not_configured');
  assert.equal(body.window.hours, 24);
});

test('a pinned end is honoured exactly', async () => {
  const end = new Date(Math.floor(Date.now() / 1000) * 1000 - 3600000).toISOString();
  const res = await call(intelligence, `/intelligence?hours=24&end=${end}`, { authorization: `Bearer ${TOKEN}` });
  const body = JSON.parse(res.body);
  assert.equal(new Date(body.window.end).toISOString(), end);
  assert.equal(new Date(body.window.start).toISOString(), new Date(Date.parse(end) - 86400000).toISOString());
});

test('a bad window is refused to the machine, not answered as a different one', async () => {
  const res = await call(intelligence, '/intelligence?hours=5', { authorization: `Bearer ${TOKEN}` });
  assert.equal(res.statusCode, 400);
});

test('the daily job accepts only bearer credentials — never ?k=', async () => {
  assert.equal((await call(cron, `/api/cron/intelligence?k=${CRON}&dry=1`)).statusCode, 401);
  assert.equal((await call(cron, '/api/cron/intelligence?dry=1', { authorization: `Bearer ${CRON}` })).statusCode, 503);
});

test('the read token may only ask for a dry run, never a send', async () => {
  const auth = { authorization: `Bearer ${TOKEN}` };
  assert.equal((await call(cron, '/api/cron/intelligence', auth)).statusCode, 403);
  assert.equal((await call(cron, '/api/cron/intelligence?force=1&dry=1', auth)).statusCode, 403);
  // A dry run gets as far as building, which fails honestly without PostHog.
  assert.equal((await call(cron, '/api/cron/intelligence?dry=1', auth)).statusCode, 503);
});
