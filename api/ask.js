/**
 * ASK KILL DULL — /api/ask
 *
 * One conversation over Kill Dull's public record. The widget holds the
 * conversation in page memory and posts it back each turn; nothing is kept
 * here. A suggested question and a typed question arrive the same way and are
 * answered the same way.
 *
 * Knowledge: the site's own pages, bundled into this function and read once
 * per instance (_lib/public-record.js). Behaviour: _lib/instructions.js.
 *
 * Model: ASK_MODEL, defaulting to Claude Sonnet 5.5. Only that model is
 * called. If it refuses or fails, the visitor gets a plain message; no other
 * model is substituted.
 *
 * Follows the conventions of the functions already here (contact.js,
 * collect.js): CommonJS, no npm dependencies, global fetch. There is no
 * package.json in this repository, so nothing here may require an installed
 * module, and the Anthropic API is called over HTTP.
 *
 * Never logged: anything a visitor typed, any answer, any IP address. Logs
 * carry status, fixed error types, token counts and timings only.
 */

'use strict';

var crypto = require('crypto');
var record = require('./_lib/public-record.js');
var instructions = require('./_lib/instructions.js');

var ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
var ANTHROPIC_VERSION = '2023-06-01';
var DEFAULT_MODEL = 'claude-sonnet-5-5';
var EFFORT = 'low';
var MAX_TOKENS = 4000;
var UPSTREAM_TIMEOUT_MS = 50000;

var LIMITS = { maxMessages: 40, maxCharsPerMessage: 2000, maxCharsTotal: 40000 };
var PER_MINUTE = 15;
var PER_DAY = 150;

// Fixed messages, sent instead of an answer. They are marked as notices so
// the widget keeps them out of the conversation and links "contact Kill Dull".
var TEXT = {
  failed: 'That did not go through. Try again, or contact Kill Dull.',
  unavailable: 'Ask Kill Dull isn’t available right now. You can still contact Kill Dull.',
  busy: 'Too many questions at once. Give it a moment.',
  daily: 'That’s the limit for today. You can still contact Kill Dull.',
  refused: 'That’s not something Ask Kill Dull can answer. Contact Kill Dull if you’d like to take it further.',
  long: 'That answer ran long. Try asking it more narrowly, or contact Kill Dull.',
  full: 'This conversation has run long. Start over to keep asking.'
};

// Same-origin, plus the apex and www serving the same site. No *.vercel.app:
// that would admit every other app on the domain. A preview is same-origin
// with itself, so previews need no entry.
var ALLOWED_HOSTS = { 'killdull.com': true, 'www.killdull.com': true };

function isProduction() { return process.env.VERCEL_ENV === 'production'; }

function model() {
  var m = (process.env.ASK_MODEL || '').trim();
  return /^claude-[a-z0-9.-]{1,60}$/.test(m) ? m : DEFAULT_MODEL;
}

// Built once per instance, whole or not at all.
var systemText = null;
function system() {
  if (systemText === null) systemText = instructions.systemPrompt(record.build(record.defaultRoot()));
  return systemText;
}

// One dynamic import, memoised, as in collect.js.
var limitersPromise = null;
function limiters() {
  if (!limitersPromise) {
    limitersPromise = Promise.all([
      import('../lib/collect/cache.mjs'),
      import('../lib/collect/ratelimit.mjs')
    ]).then(function (m) {
      var cache = m[0].createCache();
      return {
        minute: m[1].createRateLimiter({ cache: cache, limit: PER_MINUTE, windowMs: 60000, prefix: 'ask:min' }),
        day: m[1].createRateLimiter({ cache: cache, limit: PER_DAY, windowMs: 86400000, prefix: 'ask:day' })
      };
    });
  }
  return limitersPromise;
}

/**
 * The limiter identity: a salted one-way hash of the address and today's UTC
 * date. The address itself goes no further than this function. ":ask:" keeps
 * it from ever matching the network-lookup key built from the same salt.
 */
function identity(req, salt) {
  var ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (!ip || !salt) return null;
  var day = new Date().toISOString().slice(0, 10);
  return crypto.createHash('sha256').update(salt + ':ask:' + day + ':' + ip).digest('hex').slice(0, 32);
}

/** 'ok', 'minute', 'day' or 'unavailable'. Fails closed in production only. */
async function checkLimits(req) {
  var salt = (process.env.COLLECT_IP_SALT || '').trim();
  var id = identity(req, salt);
  var l = null;
  try { l = await limiters(); } catch (e) { l = null; }
  if (!id || !l || !l.minute || !l.day) return isProduction() ? 'unavailable' : 'ok';

  var results = await Promise.all([l.minute.check(id), l.day.check(id)]);
  if (results[0].degraded || results[1].degraded) return isProduction() ? 'unavailable' : 'ok';
  if (!results[1].allowed) return 'day';
  if (!results[0].allowed) return 'minute';
  return 'ok';
}

function send(res, status, text) {
  res.status(status).json({ text: text, notice: true });
}

function answer(res, text) {
  res.status(200).json({ text: text });
}

/** Accept only what the widget sends: plain-text user/assistant turns. */
function readMessages(body) {
  var raw = body && body.messages;
  if (!Array.isArray(raw) || raw.length === 0) return { error: 'bad' };
  if (raw.length > LIMITS.maxMessages) return { error: 'full' };

  var total = 0;
  var messages = [];
  for (var i = 0; i < raw.length; i++) {
    var m = raw[i];
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return { error: 'bad' };
    if (typeof m.content !== 'string') return { error: 'bad' };
    var content = m.content.trim();
    if (!content || content.length > LIMITS.maxCharsPerMessage * (m.role === 'assistant' ? 4 : 1)) return { error: 'bad' };
    if (i > 0 && messages[i - 1].role === m.role) return { error: 'bad' };
    total += content.length;
    if (total > LIMITS.maxCharsTotal) return { error: 'full' };
    messages.push({ role: m.role, content: content });
  }
  if (messages[0].role !== 'user' || messages[messages.length - 1].role !== 'user') return { error: 'bad' };
  return { messages: messages };
}

// A fixed-vocabulary value from the API is logged only after a shape check,
// so an unexpected value can never become the log line.
function word(v) {
  return (typeof v === 'string' && /^[a-z_]{1,40}$/.test(v)) ? v : 'unrecognized';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, TEXT.failed);
  }
  res.setHeader('Cache-Control', 'no-store');

  var apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) return send(res, 503, TEXT.unavailable);

  var origin = req.headers.origin;
  if (origin) {
    var host = '';
    try { host = new URL(origin).host; } catch (e) { return send(res, 403, TEXT.failed); }
    if (host !== (req.headers.host || '') && !ALLOWED_HOSTS[host]) return send(res, 403, TEXT.failed);
  }

  var read = readMessages(req.body);
  if (read.error === 'full') return send(res, 413, TEXT.full);
  if (read.error) return send(res, 400, TEXT.failed);

  var limit = await checkLimits(req);
  if (limit === 'unavailable') {
    console.error('ask: limiter unavailable');
    return send(res, 503, TEXT.unavailable);
  }
  if (limit === 'day') return send(res, 429, TEXT.daily);
  if (limit === 'minute') return send(res, 429, TEXT.busy);

  var prompt;
  try {
    prompt = system();
  } catch (e) {
    console.error('ask: record build failed ' + (e && /^record: [a-z0-9.-]+$/.test(e.message) ? e.message : 'unknown'));
    return send(res, 503, TEXT.unavailable);
  }

  var useModel = model();
  // Which model answered is useful when comparing on a preview. Production
  // does not say.
  if (!isProduction()) res.setHeader('X-Ask-Model', useModel);

  var started = Date.now();
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, UPSTREAM_TIMEOUT_MS);

  try {
    var upstream = await fetch(ANTHROPIC_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: useModel,
        max_tokens: MAX_TOKENS,
        output_config: { effort: EFFORT },
        // The instructions and the record are long and fixed; the varying
        // conversation sits after them.
        system: [{ type: 'text', text: prompt, cache_control: { type: 'ephemeral' } }],
        messages: read.messages
      })
    });

    if (!upstream.ok) {
      var kind = 'none';
      try {
        var errBody = await upstream.json();
        kind = word(errBody && errBody.error && errBody.error.type);
      } catch (e) {
        kind = 'unparseable';
      }
      console.error('ask: upstream ' + upstream.status + ' ' + kind);
      if (upstream.status === 429 || upstream.status === 529) return send(res, 503, TEXT.busy);
      return send(res, 502, TEXT.failed);
    }

    var data = await upstream.json();
    var u = data.usage || {};
    console.log('ask: ' + word(data.stop_reason) + ' ms=' + (Date.now() - started) +
      ' in=' + (u.input_tokens | 0) + ' cache_read=' + (u.cache_read_input_tokens | 0) +
      ' cache_write=' + (u.cache_creation_input_tokens | 0) + ' out=' + (u.output_tokens | 0));

    if (data.stop_reason === 'refusal') {
      var cat = data.stop_details && data.stop_details.category;
      console.error('ask: refusal ' + (cat == null ? 'none' : word(cat)));
      return send(res, 200, TEXT.refused);
    }
    if (data.stop_reason === 'max_tokens') return send(res, 200, TEXT.long);

    var text = (data.content || [])
      .filter(function (b) { return b && b.type === 'text'; })
      .map(function (b) { return b.text; })
      .join('\n')
      .trim();

    return text ? answer(res, text) : send(res, 502, TEXT.failed);
  } catch (err) {
    console.error('ask: ' + (err && err.name === 'AbortError' ? 'upstream timeout' : 'request failed'));
    return send(res, 502, TEXT.failed);
  } finally {
    clearTimeout(timer);
  }
};

// For tests.
module.exports.readMessages = readMessages;
module.exports.identity = identity;
module.exports.model = model;
module.exports.LIMITS = LIMITS;
