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
        sanitizeProps: m[0].sanitizeProps,
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return end(res, 405);
  }

  // ── GATE 1 · same origin ────────────────────────────────────────────────
  var origin = req.headers['origin'];
  if (origin) {
    var host;
    try { host = new URL(origin).host; } catch (e) { return end(res, 403); }
    var self = req.headers['host'] || '';
    if (host !== self && ALLOWED_HOSTS.indexOf(host) === -1) return end(res, 403);
  }

  // ── GATE 2 · body size ──────────────────────────────────────────────────
  var raw;
  try {
    raw = await readRawBody(req);
  } catch (e) {
    return end(res, e && e.message === 'payload_too_large' ? 413 : 400);
  }
  if (raw.length > MAX_BODY_BYTES) return end(res, 413);

  // ── GATE 3 · parseable JSON ─────────────────────────────────────────────
  var body;
  try { body = JSON.parse(raw); } catch (e) { return end(res, 400); }
  if (!body || typeof body !== 'object') return end(res, 400);

  // ── GATE 4 · consent is mandatory ───────────────────────────────────────
  // Without it nothing is processed, nothing is enriched and nothing is stored.
  // This is checked before the event name, before the cookie and before the IP
  // is capable of being read, so a request without consent costs a parse.
  if (body.consent !== true) return end(res, 204);

  var mods = await modules();

  // ── GATE 5 · the event must be one we have declared ─────────────────────
  var event = body.event;
  if (typeof event !== 'string' || !mods.EVENTS.has(event)) return end(res, 204);

  // ── GATE 6 · a plausible distinct id ────────────────────────────────────
  var distinctId = body.distinctId;
  if (typeof distinctId !== 'string' || !distinctId || distinctId.length > 64) return end(res, 204);

  // ── GATE 7 · the id must match the first-party cookie ───────────────────
  // This is what makes withdrawal work server-side: the client clears kd_did,
  // so anything still claiming that id afterwards fails here. It is also the
  // spoof guard — an id invented by a caller has no matching cookie.
  var cookieDid = readCookie(req, DID_COOKIE);
  if (!cookieDid || cookieDid !== distinctId) return end(res, 204);

  // ── GATE 8 · rate limit, keyed on the verified id and never on an IP ────
  if (mods.limiter) {
    var verdict = await mods.limiter.check(distinctId);
    if (!verdict.allowed) return end(res, 429);
  }

  // ── GATE 9 · only declared properties survive ───────────────────────────
  // Props and ctx go through one validator, so acquisition data is held to the
  // same allow-list as everything else.
  var merged = mods.sanitizeProps(
    Object.assign({}, body.props || {}, body.ctx || {})
  );

  // ── GATE 10 · server-derived context, then ingest ───────────────────────
  // Geo and network are computed here and merged AFTER sanitizing, so a browser
  // can neither claim a location it is not in nor an organisation it is not at.
  var geo = mods.readGeo(req.headers);
  var net = await mods.resolveNetwork(req.headers, mods.cache);

  // Carried for continuity with the reporting layer, which reads these names.
  var orgName = net.net_state === 'ORG_IDENTIFIED' ? net.net_org : null;
  var orgConfidence = net.net_state === 'ORG_IDENTIFIED' ? 'HIGH' : 'NONE';

  var posthogKey = process.env.POSTHOG_PROJECT_API_KEY;
  if (!posthogKey) return end(res, 204);

  var properties = Object.assign({}, merged, {
    $ip: null,                // PostHog must never receive an address
    $geoip_disable: true,     // nor derive one of its own
    org_name: orgName,
    org_confidence: orgConfidence
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
    return end(res, 502);
  }
  if (!ingest.ok) {
    console.error('collect: ingest rejected with status ' + ingest.status);
    return end(res, 502);
  }

  return end(res, 204);
};

// Exported for tests only.
module.exports.MAX_BODY_BYTES = MAX_BODY_BYTES;
module.exports.ALLOWED_HOSTS = ALLOWED_HOSTS;
module.exports.DID_COOKIE = DID_COOKIE;
module.exports.readCookie = readCookie;
