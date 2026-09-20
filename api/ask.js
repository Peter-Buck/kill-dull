/**
 * ASK KILL DULL — /api/ask
 *
 * One question, one answer, over the approved public knowledge in
 * _lib/knowledge.js. The conversation is stateless: the widget posts the
 * history back each turn.
 *
 * Follows the conventions of the functions already here (contact.js,
 * collect.js): CommonJS, no npm dependencies, global fetch. There is no
 * package.json in this repository and .vercelignore would not deploy one,
 * so nothing here may require an installed module.
 *
 * Files under api/ starting with an underscore are not routed, so _lib is
 * importable without becoming an endpoint.
 */

'use strict';

var K = require('./_lib/knowledge.js');

var ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
var ANTHROPIC_VERSION = '2023-06-01';
var UPSTREAM_TIMEOUT_MS = 50000;

var ALLOWED_HOSTS = {
  'killdull.com': true,
  'www.killdull.com': true,
  'localhost:3000': true,
  'localhost:8000': true
};

// Per-instance floor. Not a substitute for a shared limiter, but it stops one
// client hammering one lambda, and this endpoint costs money per call.
var WINDOW_MS = 60000;
var MAX_PER_WINDOW = 20;
var hits = Object.create(null);

function rateLimited(ip) {
  var now = Date.now();
  var recent = (hits[ip] || []).filter(function (t) { return now - t < WINDOW_MS; });
  recent.push(now);
  hits[ip] = recent;
  if (Object.keys(hits).length > 5000) hits = Object.create(null);
  return recent.length > MAX_PER_WINDOW;
}

function send(res, status, text) {
  res.status(status).json({ text: text });
}

/** Accept only what the widget sends: plain-text user/assistant turns. */
function readMessages(body) {
  var raw = body && body.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (raw.length > K.LIMITS.maxMessages) return null;

  var total = 0;
  var messages = [];
  for (var i = 0; i < raw.length; i++) {
    var m = raw[i];
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return null;
    if (typeof m.content !== 'string') return null;
    var content = m.content.trim();
    if (!content || content.length > K.LIMITS.maxCharsPerMessage) return null;
    total += content.length;
    if (total > K.LIMITS.maxCharsTotal) return null;
    messages.push({ role: m.role, content: content });
  }
  if (messages[0].role !== 'user') return null;
  if (messages[messages.length - 1].role !== 'user') return null;
  return messages;
}

/* TEMPORARY verification hook — removed once the endpoint is confirmed.
   A GET with the token runs one fixed question through the identical path a
   real question takes. Never active in production. */
var SELFTEST_TOKEN = 'd47fae528d6474bcf924c2d9';

module.exports = async function handler(req, res) {
  var selftest =
    req.method === 'GET' &&
    process.env.VERCEL_ENV !== 'production' &&
    req.query && req.query.selftest === SELFTEST_TOKEN;

  if (selftest) {
    req.body = { messages: [{ role: 'user', content: 'Who owns Kill Dull?' }] };
  } else if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, K.FALLBACK_TEXT);
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return send(res, 503, 'ASK KILL DULL is not available right now.');

  var origin = req.headers.origin;
  if (origin) {
    var host = '';
    try { host = new URL(origin).host; } catch (e) { return send(res, 403, K.FALLBACK_TEXT); }
    var selfHost = req.headers.host || '';
    if (host !== selfHost && !ALLOWED_HOSTS[host] && !/\.vercel\.app$/.test(host)) {
      return send(res, 403, K.FALLBACK_TEXT);
    }
  }

  var ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return send(res, 429, 'Too many questions at once. Give it a moment.');
  }

  var messages = readMessages(req.body);
  if (!messages) return send(res, 400, K.FALLBACK_TEXT);

  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, UPSTREAM_TIMEOUT_MS);

  try {
    var upstream = await fetch(ANTHROPIC_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        // Current docs make Authorization: Bearer the primary scheme for an
        // API key; x-api-key is the documented legacy fallback.
        'authorization': 'Bearer ' + apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: K.MODEL,
        max_tokens: K.MAX_TOKENS,
        output_config: { effort: K.EFFORT },
        // The prompt is long and fixed; the varying history sits after it.
        system: [{
          type: 'text',
          text: K.SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }],
        messages: messages
      })
    });

    if (!upstream.ok) {
      // Status and Anthropic's error.type only. error.type is a fixed enum
      // ("authentication_error", "not_found_error", ...), so it carries no
      // message text, no request body and nothing from the question. It is
      // still shape-checked before being logged, so an unexpected value can
      // never become the log line.
      var kind = 'none';
      try {
        var errBody = await upstream.json();
        var t = errBody && errBody.error && errBody.error.type;
        kind = (typeof t === 'string' && /^[a-z_]{1,40}$/.test(t)) ? t : 'unrecognized';
      } catch (e) {
        kind = 'unparseable';
      }
      console.error('ask: upstream ' + upstream.status + ' ' + kind);
      if (upstream.status === 429) {
        return send(res, 429, 'Too many questions at once. Give it a moment.');
      }
      return send(res, 502, K.FALLBACK_TEXT);
    }

    var data = await upstream.json();

    if (data.stop_reason === 'refusal') {
      return send(res, 200, 'That one is not something to answer here.');
    }

    var text = (data.content || [])
      .filter(function (b) { return b && b.type === 'text'; })
      .map(function (b) { return b.text; })
      .join('\n')
      .trim();

    return send(res, 200, text || K.FALLBACK_TEXT);
  } catch (err) {
    console.error('ask: ' + (err && err.name === 'AbortError' ? 'upstream timeout' : 'request failed'));
    return send(res, 502, K.FALLBACK_TEXT);
  } finally {
    clearTimeout(timer);
  }
};
