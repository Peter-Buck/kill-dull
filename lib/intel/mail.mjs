// Sending the briefing.
//
// The same transport /api/contact has used in production since this site
// launched: a stored Google refresh token is exchanged for a short-lived access
// token and the message is posted to the Gmail API as RFC 2822. The mail
// genuinely originates from Gmail as the authorised user, so killdull.com's
// existing SPF, DKIM and DMARC already cover it and there is nothing to add to
// DNS — which is the whole reason no third-party email provider is introduced
// here. Nothing about the privacy page changes, because no new processor does.
//
// Two differences from contact.js, both because this is a briefing rather than
// a relayed form: the body is multipart/alternative so the HTML has a plain
// text twin, and the recipient is configured rather than derived from input.

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

function headerSafe(v) {
  return String(v).replace(/[\r\n]+/g, ' ').trim();
}

/** RFC 2047 encoded-word, so a subject carrying an em dash survives transit. */
function encodeHeader(v) {
  const safe = headerSafe(v);
  if (/^[\x20-\x7E]*$/.test(safe)) return safe;
  return `=?UTF-8?B?${Buffer.from(safe, 'utf8').toString('base64')}?=`;
}

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64Body(s) {
  return Buffer.from(s, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
}

export function buildMime({ from, to, subject, text, html }) {
  const boundary = `kd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const head = [
    `From: ${headerSafe(from)}`,
    `To: ${headerSafe(to)}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join('\r\n');

  const parts = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    b64Body(text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    b64Body(html),
    `--${boundary}--`,
    '',
  ].join('\r\n');

  return `${head}\r\n\r\n${parts}`;
}

async function accessToken(env) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }).toString(),
  });
  // Status only, never the body: it can name the credential that failed.
  if (!res.ok) throw Object.assign(new Error('token_rejected'), { status: res.status });
  const payload = await res.json();
  if (!payload || !payload.access_token) throw new Error('token_missing');
  return payload.access_token;
}

/** Which variables are missing. Names only — never values, anywhere. */
export function missingMailConfig(env = process.env) {
  const need = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
  const missing = need.filter((k) => !env[k]);
  if (!recipient(env)) missing.push('ALERT_EMAIL_TO');
  if (!sender(env)) missing.push('CONTACT_FROM_EMAIL');
  return missing;
}

/** ALERT_EMAIL_TO is what this environment already provisions for alerting. */
export function recipient(env = process.env) {
  return env.ALERT_EMAIL_TO || env.INTELLIGENCE_EMAIL_TO || env.CONTACT_TO_EMAIL || null;
}

export function sender(env = process.env) {
  return env.CONTACT_FROM_EMAIL || recipient(env);
}

/**
 * Send one briefing. Resolves { ok, id } or { ok:false, reason } — it does not
 * throw, because a failed send must still be reportable by the caller.
 */
export async function sendBriefing({ subject, html, text, to, from }, env = process.env) {
  const missing = missingMailConfig(env);
  if (missing.length) return { ok: false, reason: `mail_not_configured:${missing.join(',')}` };

  const target = to || recipient(env);
  const source = from || sender(env);
  try {
    const token = await accessToken(env);
    const res = await fetch(GMAIL_SEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: base64url(Buffer.from(buildMime({ from: source, to: target, subject, text, html }), 'utf8')) }),
    });
    if (!res.ok) return { ok: false, reason: `gmail_http_${res.status}` };
    const body = await res.json().catch(() => ({}));
    return { ok: true, id: body.id || null, to: target };
  } catch (e) {
    return { ok: false, reason: e && e.message ? e.message : 'send_failed' };
  }
}
