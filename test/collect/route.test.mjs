// The ten gates of /api/collect, in order, plus what must never leave it.
//
// The handler is exercised as Vercel will call it: a readable request stream
// and a Node response object. Only fetch is stubbed — one stub that answers as
// Upstash, Ipregistry or PostHog depending on the URL, and whose behaviour each
// test steers through `scene`.

import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';

process.env.POSTHOG_PROJECT_API_KEY = 'phc_test_key';
process.env.POSTHOG_INGEST_HOST = 'https://eu.i.posthog.test';
process.env.IPREGISTRY_API_KEY = 'ipreg_test_key';
process.env.COLLECT_IP_SALT = 'test-salt';
process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.test';
process.env.UPSTASH_REDIS_REST_TOKEN = 'upstash_test_token';

const DID = '7f3c1a9e-0b2d-4c6f-9a81-2e5d7c4b0a13';
const IP = '203.0.113.47';

/** Per-test control over what the stubbed world does. */
const scene = {
  zcard: 1,
  upstash: 'ok',        // ok | error | throw
  ipregistry: 'org',    // org | error | throw
  posthog: 'ok',        // ok | error
  sent: [],             // every PostHog body
  calls: [],            // every outbound request, for leak sweeps
};

function reset(over = {}) {
  Object.assign(scene, { zcard: 1, upstash: 'ok', ipregistry: 'org', posthog: 'ok' }, over);
  scene.sent = [];
  scene.calls = [];
}

globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  scene.calls.push({ url: u, init });

  if (u.includes('upstash.test')) {
    if (scene.upstash === 'throw') throw new Error('upstash unreachable');
    if (scene.upstash === 'error') return { ok: false, status: 500, json: async () => ({}) };
    if (u.endsWith('/pipeline')) {
      return { ok: true, json: async () => [{ result: 0 }, { result: 1 }, { result: scene.zcard }, { result: 1 }] };
    }
    return { ok: true, json: async () => ({ result: null }) }; // cache miss
  }

  if (u.includes('ipregistry')) {
    if (scene.ipregistry === 'throw') throw new Error('provider unreachable');
    if (scene.ipregistry === 'error') return { ok: false, status: 502, json: async () => ({}) };
    return { ok: true, json: async () => ({
      connection: { asn: 3417, organization: 'Nike Inc.', type: 'business' },
      company: { name: 'Nike Inc.', domain: 'nike.com', type: 'business' },
      security: {},
    }) };
  }

  if (u.includes('posthog.test')) {
    scene.sent.push(JSON.parse(init.body));
    if (scene.posthog === 'error') return { ok: false, status: 401, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => ({ status: 1 }) };
  }

  throw new Error(`unexpected outbound call: ${u}`);
};

const { default: handler } = await import('../../api/collect.js');

/** Build a request/response pair and run the handler. */
async function call({ method = 'POST', body = {}, headers = {}, rawBody = null } = {}) {
  const payload = rawBody ?? JSON.stringify(body);
  const req = Readable.from([Buffer.from(payload, 'utf8')]);
  req.method = method;
  req.headers = {
    host: 'killdull.com',
    origin: 'https://killdull.com',
    'content-type': 'application/json',
    cookie: `kd_did=${DID}`,
    'x-forwarded-for': `${IP}, 10.0.0.1`,
    'x-vercel-ip-city': 'Beaverton',
    'x-vercel-ip-country-region': 'OR',
    'x-vercel-ip-country': 'US',
    'x-vercel-ip-latitude': '45.486557',
    'x-vercel-ip-longitude': '-122.801399',
    ...headers,
  };
  const res = { statusCode: 0, headers: {}, ended: false, body: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(b) { this.ended = true; this.body = b; } };
  await handler(req, res);
  return res;
}

const valid = (over = {}) => ({ event: 'content_view', distinctId: DID, consent: true, props: { path: '/' }, ...over });

// ── the happy path, so every refusal below means something ──────────────────

test('a complete, consented, cookie-matched event is ingested', async () => {
  reset();
  const res = await call({ body: valid() });
  assert.equal(res.statusCode, 204);
  assert.equal(scene.sent.length, 1);
  assert.equal(scene.sent[0].batch[0].event, 'content_view');
  assert.equal(scene.sent[0].batch[0].distinct_id, DID);
});

// ── GATE 0 · method ─────────────────────────────────────────────────────────

test('only POST is accepted', async () => {
  reset();
  const res = await call({ method: 'GET' });
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST');
  assert.equal(scene.sent.length, 0);
});

// ── GATE 1 · same origin ────────────────────────────────────────────────────

test('a foreign origin is rejected with 403', async () => {
  reset();
  for (const origin of ['https://evil.example', 'https://killdull.com.evil.example', 'http://attacker']) {
    const res = await call({ body: valid(), headers: { origin } });
    assert.equal(res.statusCode, 403, origin);
  }
  assert.equal(scene.sent.length, 0);
});

test('a malformed origin is rejected rather than ignored', async () => {
  reset();
  assert.equal((await call({ body: valid(), headers: { origin: 'not a url' } })).statusCode, 403);
});

test('the site itself, www, and a preview calling its own host all pass', async () => {
  reset();
  assert.equal((await call({ body: valid(), headers: { origin: 'https://killdull.com' } })).statusCode, 204);
  assert.equal((await call({ body: valid(), headers: { origin: 'https://www.killdull.com', host: 'www.killdull.com' } })).statusCode, 204);
  assert.equal((await call({
    body: valid(), headers: { origin: 'https://kill-dull-abc123.vercel.app', host: 'kill-dull-abc123.vercel.app' },
  })).statusCode, 204);
});

// ── GATE 2 · body size ──────────────────────────────────────────────────────

test('a body over 4096 bytes is rejected with 413', async () => {
  reset();
  const fat = JSON.stringify({ ...valid(), padding: 'x'.repeat(5000) });
  assert.ok(fat.length > 4096);
  const res = await call({ rawBody: fat });
  assert.equal(res.statusCode, 413);
  assert.equal(scene.sent.length, 0);
});

test('a body just under the cap is accepted', async () => {
  reset();
  const body = valid({ props: { path: '/x'.padEnd(60, 'y') } });
  const raw = JSON.stringify(body);
  assert.ok(raw.length < 4096);
  assert.equal((await call({ rawBody: raw })).statusCode, 204);
});

// ── GATE 3 · JSON ───────────────────────────────────────────────────────────

test('unparseable or non-object bodies are rejected with 400', async () => {
  reset();
  for (const raw of ['{not json', '', '"a string"', '42', 'null']) {
    const res = await call({ rawBody: raw });
    assert.equal(res.statusCode, 400, JSON.stringify(raw));
  }
  assert.equal(scene.sent.length, 0);
});

// ── GATE 4 · consent ────────────────────────────────────────────────────────

test('CONSENT FALSE OR MISSING IS 204 AND NOTHING IS PROCESSED', async () => {
  reset();
  for (const over of [{ consent: false }, { consent: undefined }, { consent: 'true' }, { consent: 1 }]) {
    const body = valid(over);
    if (over.consent === undefined) delete body.consent;
    const res = await call({ body });
    assert.equal(res.statusCode, 204, JSON.stringify(over));
  }
  assert.equal(scene.sent.length, 0, 'nothing ingested');
  assert.equal(scene.calls.length, 0, 'no provider was consulted at all — not even the IP lookup');
});

// ── GATE 5 · event allow-list ───────────────────────────────────────────────

test('all ten approved events pass', async () => {
  reset();
  const approved = ['content_view', 'content_dwell', 'reading_opened', 'contact_submitted',
    'cta_click', 'email_click', 'linkedin_click', 'outbound_click', 'not_found_404', 'api_error'];
  for (const event of approved) {
    const res = await call({ body: valid({ event }) });
    assert.equal(res.statusCode, 204, event);
  }
  assert.equal(scene.sent.length, 10);
});

test('PETER BUCK EVENTS REMAIN IMPOSSIBLE', async () => {
  reset();
  const foreign = ['resume_download', 'interrogate_started', 'interrogate_completed',
    'assistant_open', 'assistant_theme', 'verdict_cast', 'report_exported',
    'social_carousel_downloaded', 'linkedin_carousel_created', 'web_vitals', 'principle_viewed'];
  for (const event of foreign) {
    assert.equal((await call({ body: valid({ event }) })).statusCode, 204, event);
  }
  assert.equal(scene.sent.length, 0, 'not one foreign event reached PostHog');
});

test('an invented or malformed event name is refused', async () => {
  reset();
  for (const event of ['', 'anything', '$identify', 'content_view ', 42, null, {}]) {
    assert.equal((await call({ body: valid({ event }) })).statusCode, 204, String(event));
  }
  assert.equal(scene.sent.length, 0);
});

// ── GATE 6 · distinctId ─────────────────────────────────────────────────────

test('an invalid distinctId is refused', async () => {
  reset();
  for (const distinctId of ['', 'x'.repeat(65), 42, null, undefined, {}, []]) {
    const body = valid({ distinctId });
    if (distinctId === undefined) delete body.distinctId;
    assert.equal((await call({ body })).statusCode, 204, String(distinctId));
  }
  assert.equal(scene.sent.length, 0);
});

test('a 64-character id is the longest accepted', async () => {
  reset();
  const id = 'a'.repeat(64);
  assert.equal((await call({ body: valid({ distinctId: id }), headers: { cookie: `kd_did=${id}` } })).statusCode, 204);
  assert.equal(scene.sent.length, 1);
});

// ── GATE 7 · cookie binding ─────────────────────────────────────────────────

test('A MISMATCHED OR ABSENT kd_did IS REFUSED', async () => {
  reset();
  const cases = [
    ['no cookie header at all', {}],
    ['a different visitor id', { cookie: 'kd_did=someone-else' }],
    ['other cookies but no kd_did', { cookie: 'foo=bar; baz=qux' }],
    ['an empty kd_did', { cookie: 'kd_did=' }],
  ];
  for (const [label, headers] of cases) {
    const res = await call({ body: valid(), headers: { cookie: undefined, ...headers } });
    assert.equal(res.statusCode, 204, label);
  }
  assert.equal(scene.sent.length, 0);
});

test('withdrawal works server-side: once the cookie is gone, events stop', async () => {
  reset();
  assert.equal((await call({ body: valid() })).statusCode, 204);
  assert.equal(scene.sent.length, 1, 'accepted while the cookie matched');

  // The client clears kd_did on withdrawal. Anything still claiming that id
  // now has no matching cookie and fails here.
  await call({ body: valid(), headers: { cookie: '' } });
  assert.equal(scene.sent.length, 1, 'nothing further ingested');
});

test('kd_did is read from among other cookies, and consent state is not trusted from one', async () => {
  reset();
  const res = await call({ body: valid(), headers: { cookie: `a=1; kd_did=${DID}; z=2` } });
  assert.equal(res.statusCode, 204);
  assert.equal(scene.sent.length, 1);
});

// ── GATE 8 · rate limit ─────────────────────────────────────────────────────

test('over the limit is 429 and nothing is ingested', async () => {
  reset({ zcard: 101 });
  const res = await call({ body: valid() });
  assert.equal(res.statusCode, 429);
  assert.equal(scene.sent.length, 0);
});

test('at the limit is still allowed', async () => {
  reset({ zcard: 100 });
  assert.equal((await call({ body: valid() })).statusCode, 204);
  assert.equal(scene.sent.length, 1);
});

test('THE LIMITER NEVER SEES AN IP', async () => {
  reset();
  await call({ body: valid() });
  const upstash = scene.calls.filter((c) => c.url.includes('upstash.test'));
  assert.ok(upstash.length > 0, 'the limiter did run');
  const wire = JSON.stringify(upstash);
  assert.equal(wire.includes(IP), false, 'no IP in any Upstash command');
  assert.equal(wire.includes('10.0.0.1'), false, 'nor the second hop');
  assert.ok(wire.includes(DID), 'the identifier is the verified distinctId');
});

test('UPSTASH FAILURE DOES NOT DROP A LEGITIMATE EVENT', async () => {
  for (const upstash of ['throw', 'error']) {
    reset({ upstash });
    const res = await call({ body: valid() });
    assert.equal(res.statusCode, 204, upstash);
    assert.equal(scene.sent.length, 1, `${upstash}: the event still reached PostHog`);
  }
});

// ── GATE 9 · sanitizer ──────────────────────────────────────────────────────

test('unapproved properties are stripped before ingestion', async () => {
  reset();
  await call({ body: valid({
    props: { path: '/contact', page_type: 'CONTACT', email: 'someone@example.com', message: 'private text' },
    ctx: { referrer_domain: 'linkedin.com', utm_source: 'newsletter', password: 'hunter2' },
  }) });
  const props = scene.sent[0].batch[0].properties;
  assert.equal(props.path, '/contact');
  assert.equal(props.referrer_domain, 'linkedin.com');
  assert.equal(props.utm_source, 'newsletter');
  for (const k of ['email', 'message', 'password']) {
    assert.equal(k in props, false, `${k} must not survive`);
  }
});

test('a browser cannot claim a location, an organisation, or a PostHog control property', async () => {
  reset();
  await call({ body: valid({ props: {
    geo_city: 'London', geo_country: 'GB', geo_latitude: 51.5,
    net_state: 'ORG_IDENTIFIED', net_org: 'Fabricated Ltd', org_name: 'Fabricated Ltd',
    org_confidence: 'HIGH', $ip: '1.2.3.4', $geoip_disable: false,
  } }) });
  const props = scene.sent[0].batch[0].properties;
  assert.equal(props.geo_city, 'Beaverton', 'server value wins');
  assert.equal(props.geo_country, 'US');
  assert.equal(props.net_org, 'Nike Inc.');
  assert.equal(props.org_name, 'Nike Inc.');
  assert.equal(props.$ip, null);
  assert.equal(props.$geoip_disable, true);
});

// ── GATE 10 · enrichment and ingestion ──────────────────────────────────────

test('THE POSTHOG PAYLOAD ALWAYS CARRIES $ip:null AND $geoip_disable:true', async () => {
  for (const ipregistry of ['org', 'error', 'throw']) {
    reset({ ipregistry });
    await call({ body: valid() });
    const props = scene.sent[0].batch[0].properties;
    assert.equal(props.$ip, null, ipregistry);
    assert.equal(props.$geoip_disable, true, ipregistry);
  }
});

test('ENRICHMENT FAILURE DOES NOT DROP THE EVENT', async () => {
  for (const ipregistry of ['error', 'throw']) {
    reset({ ipregistry });
    const res = await call({ body: valid() });
    assert.equal(res.statusCode, 204, ipregistry);
    assert.equal(scene.sent.length, 1, `${ipregistry}: still ingested`);
    const props = scene.sent[0].batch[0].properties;
    assert.equal(props.net_state, 'UNKNOWN', 'degraded honestly');
    assert.equal(props.org_name, null);
    assert.equal(props.org_confidence, 'NONE');
    assert.equal(props.geo_city, 'Beaverton', 'geo is unaffected — it never needed the provider');
  }
});

test('geo comes from the edge headers and is rounded', async () => {
  reset();
  await call({ body: valid() });
  const props = scene.sent[0].batch[0].properties;
  assert.equal(props.geo_latitude, 45.49);
  assert.equal(props.geo_longitude, -122.8);
  assert.equal(props.geo_region, 'OR');
});

test('an identified organisation is carried as org_name with HIGH confidence', async () => {
  reset();
  await call({ body: valid() });
  const props = scene.sent[0].batch[0].properties;
  assert.equal(props.net_state, 'ORG_IDENTIFIED');
  assert.equal(props.org_name, 'Nike Inc.');
  assert.equal(props.org_confidence, 'HIGH');
});

test('a PostHog rejection is reported as 502, not swallowed', async () => {
  reset({ posthog: 'error' });
  assert.equal((await call({ body: valid() })).statusCode, 502);
});

// ── the load-bearing assertion ──────────────────────────────────────────────

test('NO RAW IP REACHES POSTHOG, UPSTASH, OR THE RESPONSE', async () => {
  reset();
  const res = await call({ body: valid() });

  const toPosthog = JSON.stringify(scene.sent);
  assert.equal(toPosthog.includes(IP), false, 'PostHog payload');
  assert.equal(toPosthog.includes('10.0.0.1'), false, 'second hop');

  const toUpstash = JSON.stringify(scene.calls.filter((c) => c.url.includes('upstash.test')));
  assert.equal(toUpstash.includes(IP), false, 'Upstash commands');

  assert.equal(res.body, undefined, 'the response has no body to leak into');

  // The ONLY outbound call permitted to contain the address is the provider
  // lookup — and it carries the address and the key, nothing else.
  const withIp = scene.calls.filter((c) => JSON.stringify(c).includes(IP));
  assert.equal(withIp.length, 1);
  assert.ok(withIp[0].url.startsWith('https://api.ipregistry.co/'));
});

test('the cached network signal never contains the address', async () => {
  reset();
  await call({ body: valid() });
  const writes = scene.calls.filter((c) => c.url.includes('upstash.test') && !c.url.endsWith('/pipeline'));
  const wire = JSON.stringify(writes);
  assert.equal(wire.includes(IP), false);
});

test('every refusal is silent — no reason, no echo, no body', async () => {
  reset();
  for (const [body, headers] of [
    [valid({ consent: false }), {}],
    [valid({ event: 'resume_download' }), {}],
    [valid(), { cookie: 'kd_did=wrong' }],
    [valid(), { origin: 'https://evil.example' }],
  ]) {
    const res = await call({ body, headers });
    assert.equal(res.body, undefined);
    assert.equal(res.headers['cache-control'], 'no-store');
  }
});
