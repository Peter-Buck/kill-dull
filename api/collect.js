// Kill Dull event ingestion.
//
// First-party, consent-gated, explicit events only. No autocapture, no replay,
// no third-party script anywhere on the site. A browser can offer an event; it
// cannot decide what is recorded about it, where it came from, or who sent it.
//
// The request IP is read exactly once, by lib/collect/network.mjs, to ask which
// network the visit came from. It is never stored, never logged, and never sent
// to PostHog — $ip is nulled and PostHog's own geo lookup is switched off on
// every event.
//
// No dependencies, no SDK, no package.json: native fetch and Node built-ins
// only, the same as api/contact.js. The pure modules are ESM, so they are
// loaded with a dynamic import that resolves once per cold start.

'use strict';

var MAX_BODY_BYTES = 4096;               // beacons are tiny
var DID_COOKIE = 'kd_did';
// Set by /api/intelligence-optout on Kill Dull's own browsers. Its presence is
// the whole signal: nothing about the person is in it, and it is not a secret.
var INTERNAL_COOKIE = 'kd_internal';
var COUNTER_TTL_SECONDS = 45 * 24 * 60 * 60;

// Same-origin only.
//
// The collector posts to a RELATIVE url, so the browser resolves it against
// whatever host served the page: Origin and Host are the same host by
// construction. That covers every preview deployment, every branch alias and
// local development without naming any of them, which is why there is no
// *.vercel.app entry here and never needs to be — one would admit every other
// app on that domain.
//
// This list is only for the genuine cross-host case: the apex and www serving
// the same site. Nothing else belongs in it.
var ALLOWED_HOSTS = ['killdull.com', 'www.killdull.com'];

var POSTHOG_INGEST_HOST = process.env.POSTHOG_INGEST_HOST || 'https://eu.i.posthog.com';

// One dynamic import, memoised. Literal specifiers so the deployment's file
// tracer can follow them.
var modulesPromise = null;
function modules() {
  if (!modulesPromise) {
    modulesPromise = Promise.all([
      import('../lib/collect/schema.mjs'),
      import('../lib/collect/geo.mjs'),
      import('../lib/collect/network.mjs'),
      import('../lib/collect/cache.mjs'),
      import('../lib/collect/ratelimit.mjs')
    ]).then(function (m) {
      var cache = m[3].createCache();
      return {
        EVENTS: m[0].EVENTS,
        sanitizeWithCount: m[0].sanitizeWithCount,
        readGeo: m[1].readGeo,
        resolveNetwork: m[2].resolveNetwork,
        cache: cache,
        limiter: m[4].createRateLimiter({ cache: cache })
      };
    });
  }
  return modulesPromise;
}

// Read the body as bytes so the cap is a real byte cap, and so nothing has
// parsed it before we have decided whether to accept it at all.
function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    var size = 0;
    req.on('data', function (chunk) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('payload_too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', function () { resolve(Buffer.concat(chunks).toString('utf8')); });
    req.on('error', reject);
  });
}

function readCookie(req, name) {
  var raw = req.headers ? req.headers.cookie : null;
  if (!raw) return null;
  var parts = String(raw).split(';');
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    var eq = p.indexOf('=');
    if (eq < 1) continue;
    if (p.slice(0, eq) !== name) continue;
    try { return decodeURIComponent(p.slice(eq + 1)); } catch (e) { return p.slice(eq + 1); }
  }
  return null;
}

// Every refusal is silent and identical from the outside: no reason, no echo,
// no body. A caller learns whether the request was shaped correctly, never
// what the gate was checking.
function end(res, status) {
  res.statusCode = status;
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

/**
 * Where this request is being served: the real production site, or anything
 * else. Production is the production deployment answering on a real domain;
 * a preview, a branch alias, local development or a *.vercel.app alias of
 * production is never production, so it can never write into the production
 * dataset or be mistaken for it.
 */
function siteOf(req) {
  var host = String((req.headers && req.headers.host) || '').toLowerCase().split(':')[0];
  var env = process.env.VERCEL_ENV || 'development';
  var production = env === 'production' && host !== '' && host !== 'localhost' && !/\.vercel\.app$/.test(host);
  return { host: host.slice(0, 64), env: env, production: production };
}

/**
 * Operational visibility. Every request ends in exactly one outcome — the
 * event that was accepted, or the reason it was refused — and that outcome is
 * counted per UTC day in Upstash and written as one log line. The count and
 * the line carry the outcome name and nothing else: no visitor id, no path, no
 * address, no content. This is what lets Intelligence say why it stopped
 * seeing something, instead of silently seeing less.
 */
async function outcome(mods, kind, name) {
  var line = { where: 'collect', outcome: kind };
  line[kind === 'accepted' ? 'event' : 'reason'] = name;
  console.log(JSON.stringify(line));
  if (!mods || !mods.cache || typeof mods.cache.pipeline !== 'function') return;
  var key = 'kd:collect:' + new Date().toISOString().slice(0, 10) + ':' + (kind === 'accepted' ? 'ok' : 'rej') + ':' + name;
  try {
    await mods.cache.pipeline([['INCR', key], ['EXPIRE', key, String(COUNTER_TTL_SECONDS)]]);
  } catch (e) { /* a counter is never worth an error */ }
}

/** Refuse quietly, and count why. */
async function refuse(res, mods, status, reason) {
  await outcome(mods, 'rejected', reason);
  return end(res, status);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return end(res, 405);
  }
  var mods = await modules();

  // ── GATE 1 · same origin ────────────────────────────────────────────────
  var origin = req.headers['origin'];
  if (origin) {
    var host;
    try { host = new URL(origin).host; } catch (e) { return refuse(res, mods, 403, 'bad_origin'); }
    var self = req.headers['host'] || '';
    if (host !== self && ALLOWED_HOSTS.indexOf(host) === -1) return refuse(res, mods, 403, 'bad_origin');
  }

  // ── GATE 2 · production only ────────────────────────────────────────────
  // Previews, branch aliases, local development and *.vercel.app aliases are
  // refused before the body is read, so nothing they send reaches PostHog.
  var site = siteOf(req);
  if (!site.production) return refuse(res, mods, 204, 'non_production');

  // ── GATE 3 · Kill Dull's own browsers ───────────────────────────────────
  if (readCookie(req, INTERNAL_COOKIE) === '1') return refuse(res, mods, 204, 'internal');

  // ── GATE 4 · body size ──────────────────────────────────────────────────
  var raw;
  try {
    raw = await readRawBody(req);
  } catch (e) {
    return e && e.message === 'payload_too_large' ? refuse(res, mods, 413, 'too_large') : refuse(res, mods, 400, 'bad_body');
  }
  if (raw.length > MAX_BODY_BYTES) return refuse(res, mods, 413, 'too_large');

  // ── GATE 5 · parseable JSON ─────────────────────────────────────────────
  var body;
  try { body = JSON.parse(raw); } catch (e) { return refuse(res, mods, 400, 'bad_body'); }
  if (!body || typeof body !== 'object') return refuse(res, mods, 400, 'bad_body');

  // ── GATE 6 · consent is mandatory ───────────────────────────────────────
  // Without it nothing is processed, nothing is enriched and nothing is stored.
  if (body.consent !== true) return refuse(res, mods, 204, 'no_consent');

  // ── GATE 7 · the event must be one we have declared ─────────────────────
  var event = body.event;
  if (typeof event !== 'string' || !mods.EVENTS.has(event)) return refuse(res, mods, 204, 'unknown_event');

  // ── GATE 8 · a plausible distinct id ────────────────────────────────────
  var distinctId = body.distinctId;
  if (typeof distinctId !== 'string' || !distinctId || distinctId.length > 64) return refuse(res, mods, 204, 'bad_id');

  // ── GATE 9 · the id must match the first-party cookie ───────────────────
  // This is what makes withdrawal work server-side: the client clears kd_did,
  // so anything still claiming that id afterwards fails here. It is also the
  // spoof guard — an id invented by a caller has no matching cookie.
  var cookieDid = readCookie(req, DID_COOKIE);
  if (!cookieDid || cookieDid !== distinctId) return refuse(res, mods, 204, 'cookie_mismatch');

  // ── GATE 10 · rate limit, keyed on the verified id and never on an IP ───
  if (mods.limiter) {
    var verdict = await mods.limiter.check(distinctId);
    if (!verdict.allowed) return refuse(res, mods, 429, 'rate_limited');
  }

  // ── GATE 11 · only declared properties survive ──────────────────────────
  // Props and ctx go through one validator, so acquisition data is held to the
  // same allow-list as everything else. A refused property is counted, never logged.
  var checked = mods.sanitizeWithCount(Object.assign({}, body.props || {}, body.ctx || {}));
  var merged = checked.props;
  if (checked.dropped > 0) await outcome(mods, 'rejected', 'props_dropped');

  // ── GATE 12 · server-derived context, then ingest ───────────────────────
  // Geo, network and the site are computed here and merged AFTER sanitizing,
  // so a browser can claim neither a location, an organisation nor a site.
  var geo = mods.readGeo(req.headers);
  var net = await mods.resolveNetwork(req.headers, mods.cache);

  // Carried for continuity with the reporting layer, which reads these names.
  var orgName = net.net_state === 'ORG_IDENTIFIED' ? net.net_org : null;
  var orgConfidence = net.net_state === 'ORG_IDENTIFIED' ? 'HIGH' : 'NONE';

  var posthogKey = process.env.POSTHOG_PROJECT_API_KEY;
  if (!posthogKey) return refuse(res, mods, 204, 'not_configured');

  var properties = Object.assign({}, merged, {
    $ip: null,                // PostHog must never receive an address
    $geoip_disable: true,     // nor derive one of its own
    org_name: orgName,
    org_confidence: orgConfidence,
    site_env: 'production',   // only production reaches this line
    site_host: site.host
  }, geo, net);

  var ingest;
  try {
    ingest = await fetch(POSTHOG_INGEST_HOST + '/batch/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: posthogKey,
        batch: [{
          event: event,
          distinct_id: distinctId,
          properties: properties,
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (e) {
    // Nothing about the visitor is logged — only that ingestion failed.
    console.error('collect: ingest request failed');
    return refuse(res, mods, 502, 'ingest_failed');
  }
  if (!ingest.ok) {
    console.error('collect: ingest rejected with status ' + ingest.status);
    return refuse(res, mods, 502, 'ingest_failed');
  }

  await outcome(mods, 'accepted', event);
  return end(res, 204);
};

// Exported for tests only.
module.exports.MAX_BODY_BYTES = MAX_BODY_BYTES;
module.exports.ALLOWED_HOSTS = ALLOWED_HOSTS;
module.exports.DID_COOKIE = DID_COOKIE;
module.exports.INTERNAL_COOKIE = INTERNAL_COOKIE;
module.exports.siteOf = siteOf;
module.exports.readCookie = readCookie;
