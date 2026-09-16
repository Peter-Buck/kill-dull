// Kill Dull contact endpoint.
//
// Relays the /contact form through Peter's own Google Workspace mailbox using
// the Gmail API: a stored refresh token is exchanged for a short-lived access
// token, and the message is posted as RFC 2822. Because the mail genuinely
// originates from Gmail as the authorised user, the domain's existing SPF,
// DKIM and DMARC already cover it — there is nothing to add to DNS.
//
// No dependencies, no SDK, no package.json: native fetch and Node built-ins
// only. Vercel's Node runtime is Node 18+, where fetch is global.
//
// Everything the browser is told is generic. Provider names, status codes and
// configuration problems stay on this side. Nothing carrying a visitor's name,
// address or message is ever logged.

'use strict';

var TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
var GMAIL_SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

var MAX_BODY_BYTES = 16 * 1024;

// Server-side allow-list. The select is a fixed instrument, so anything that
// is not one of these five was not sent by the form.
var ABOUT_OPTIONS = [
  'Putting a marketing commitment on The Bench',
  'Published Readings',
  'Press',
  'Investors',
  'Something else'
];

var LIMITS = {
  first: 100,
  last: 100,
  company: 200,
  email: 254,     // RFC 5321 maximum
  subject: 300,
  message: 5000
};

var MIN_FILL_MS = 3000;          // a human does not complete this in under 3s
var MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

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

// Vercel parses application/json for us, but not every path guarantees it, and
// a malformed body must fail as a bad request rather than a crash.
async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    if (Buffer.byteLength(JSON.stringify(req.body), 'utf8') > MAX_BODY_BYTES) {
      throw new Error('payload_too_large');
    }
    return req.body;
  }
  var raw = typeof req.body === 'string' ? req.body : await readRawBody(req);
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) throw new Error('payload_too_large');
  if (!raw) throw new Error('bad_json');
  var parsed;
  try { parsed = JSON.parse(raw); } catch (e) { throw new Error('bad_json'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad_json');
  return parsed;
}

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Deliberately permissive on the local part, strict on shape. The real proof
// that an address works is the reply.
function validEmail(value) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value) && value.length <= LIMITS.email;
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function fail(res, status, message) {
  send(res, status, { ok: false, error: message });
}

function field(label, value) {
  return label + '\n' + (value || '—') + '\n';
}

// Belt and braces against header injection. The two values that reach a header
// are an allow-listed selection and an address whose pattern forbids
// whitespace, so neither can carry a line break; this makes that structural.
function headerSafe(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

// RFC 2047 encoded-word, so a subject carrying an em dash survives transit.
function encodeHeader(value) {
  var safe = headerSafe(value);
  if (/^[\x20-\x7E]*$/.test(safe)) return safe;
  return '=?UTF-8?B?' + Buffer.from(safe, 'utf8').toString('base64') + '?=';
}

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildMime(from, to, replyTo, subject, text) {
  var headers = [
    'From: ' + headerSafe(from),
    'To: ' + headerSafe(to),
    'Reply-To: ' + headerSafe(replyTo),
    'Subject: ' + encodeHeader(subject),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64'
  ].join('\r\n');
  // The body is base64 so UTF-8 punctuation in the labels and the visitor's
  // own message survive whatever the hop does with 8-bit content.
  var body = Buffer.from(text, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
  return headers + '\r\n\r\n' + body;
}

async function accessToken(clientId, clientSecret, refreshToken) {
  var response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString()
  });
  if (!response.ok) {
    // Status only. The body can name the credential that failed.
    var err = new Error('token_rejected');
    err.status = response.status;
    throw err;
  }
  var payload = await response.json();
  if (!payload || !payload.access_token) throw new Error('token_missing');
  return payload.access_token;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(res, 405, 'Method not allowed.');
  }

  var body;
  try {
    body = await parseBody(req);
  } catch (e) {
    if (e && e.message === 'payload_too_large') return fail(res, 413, 'That message is too large.');
    return fail(res, 400, 'That request could not be read.');
  }

  // Honeypot. A field placed off-screen, out of the tab order and hidden from
  // assistive technology: only something filling the DOM blindly reaches it.
  if (str(body.company_url)) return fail(res, 400, 'That could not be sent.');

  var started = Number(body.started);
  var age = Date.now() - started;
  if (!isFinite(started) || started <= 0 || age < MIN_FILL_MS || age > MAX_FORM_AGE_MS) {
    return fail(res, 400, 'That could not be sent. Please try again.');
  }

  var first = str(body.first);
  var last = str(body.last);
  var company = str(body.company);
  var email = str(body.email);
  var about = str(body.about);
  var subject = str(body.subject);
  var message = str(body.message);

  if (!validEmail(email)) return fail(res, 400, 'Please enter a valid email address.');
  if (ABOUT_OPTIONS.indexOf(about) === -1) return fail(res, 400, 'Please choose what this is about.');
  if (!message) return fail(res, 400, 'Please tell us enough to start the conversation.');

  if (first.length > LIMITS.first || last.length > LIMITS.last ||
      company.length > LIMITS.company || subject.length > LIMITS.subject ||
      message.length > LIMITS.message) {
    return fail(res, 413, 'That message is too long.');
  }

  var clientId = process.env.GOOGLE_CLIENT_ID;
  var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  var refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  var to = process.env.CONTACT_TO_EMAIL;
  var from = process.env.CONTACT_FROM_EMAIL;
  if (!clientId || !clientSecret || !refreshToken || !to || !from) {
    // Names the missing setting for the operator, never for the browser.
    var missing = [];
    if (!clientId) missing.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
    if (!refreshToken) missing.push('GOOGLE_REFRESH_TOKEN');
    if (!to) missing.push('CONTACT_TO_EMAIL');
    if (!from) missing.push('CONTACT_FROM_EMAIL');
    console.error('contact: configuration incomplete, missing ' + missing.join(', '));
    return fail(res, 500, 'That could not be sent. Please try again later.');
  }

  var name = [first, last].filter(Boolean).join(' ');
  var text =
    field('WHAT’S THIS ABOUT?', about) + '\n' +
    field('FROM', name) + '\n' +
    field('COMPANY', company) + '\n' +
    field('EMAIL', email) + '\n' +
    field('MARKETING COMMITMENT', subject) + '\n' +
    field('MESSAGE', message);

  var token;
  try {
    token = await accessToken(clientId, clientSecret, refreshToken);
  } catch (e) {
    console.error('contact: authorisation failed' + (e && e.status ? ' (' + e.status + ')' : ''));
    return fail(res, 502, 'That could not be sent. Please try again later.');
  }

  var raw = base64url(Buffer.from(
    buildMime(from, to, email, 'Contact form — ' + about, text), 'utf8'));

  var response;
  try {
    response = await fetch(GMAIL_SEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: raw })
    });
  } catch (e) {
    console.error('contact: transport request failed');
    return fail(res, 502, 'That could not be sent. Please try again later.');
  }

  if (!response.ok) {
    // Status only. The provider's body can echo the submission back.
    console.error('contact: transport rejected the message', response.status);
    return fail(res, 502, 'That could not be sent. Please try again later.');
  }

  return send(res, 200, { ok: true });
};

// Exported for local testing only; the platform ignores it.
module.exports.ABOUT_OPTIONS = ABOUT_OPTIONS;
module.exports.LIMITS = LIMITS;
module.exports.MIN_FILL_MS = MIN_FILL_MS;
module.exports.TOKEN_ENDPOINT = TOKEN_ENDPOINT;
module.exports.GMAIL_SEND_ENDPOINT = GMAIL_SEND_ENDPOINT;
