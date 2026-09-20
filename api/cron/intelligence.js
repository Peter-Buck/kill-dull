// The daily Intelligence job.
//
// Vercel's scheduler is UTC-only, so 08:00 Pacific is two cron entries — 15:00
// and 16:00 UTC — and this handler decides which of them is actually 08:00 in
// Los Angeles today. The IANA database answers that, so the changeover is
// handled by the same rule in March and in November and needs no maintenance.
//
// It sends every day. A quiet day is a finding, not a reason for silence: an
// email that only arrives when something happened is indistinguishable from an
// email that has quietly broken, and Peter would have no way to tell which he
// was looking at.

'use strict';

var timingSafeEqual = require('node:crypto').timingSafeEqual;

var TARGET_HOUR = 8;            // 08:00 America/Los_Angeles
var GUARD_TTL_SECONDS = 20 * 60 * 60;

var modulesPromise = null;
function modules() {
  if (!modulesPromise) {
    modulesPromise = Promise.all([
      import('../../lib/intel/window.mjs'),
      import('../../lib/intel/briefing.mjs'),
      import('../../lib/intel/render.mjs'),
      import('../../lib/intel/mail.mjs'),
      import('../../lib/collect/cache.mjs')
    ]).then(function (m) {
      return {
        laHour: m[0].laHour,
        laDate: m[0].laDate,
        build: m[1].build,
        emailHTML: m[2].emailHTML,
        pageHTML: m[2].pageHTML,
        briefingText: m[2].briefingText,
        subjectFor: m[2].subjectFor,
        sendBriefing: m[3].sendBriefing,
        recipient: m[3].recipient,
        cache: m[4].createCache()
      };
    });
  }
  return modulesPromise;
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

/** Constant-time string comparison. Length alone is not a secret. */
function same(a, b) {
  if (!a || !b) return false;
  var A = Buffer.from(String(a), 'utf8');
  var B = Buffer.from(String(b), 'utf8');
  if (A.length !== B.length) return false;
  return timingSafeEqual(A, B);
}

/**
 * Authenticated three ways, by two credentials.
 *
 * Vercel's scheduler presents CRON_SECRET as a bearer token. A deliberate run
 * by hand presents either secret as ?k= — the scheduler's own credential,
 * because an operator triggering this job is standing in for the scheduler, or
 * the Intelligence secret, because whoever can read the briefing can ask for
 * it to be sent. Both are high-entropy server-side values, both are compared in
 * constant time, and neither is ever echoed back.
 *
 * If neither variable is configured the job refuses to run rather than leaving
 * a mailer open to the internet.
 */
function authorised(req, url) {
  var cronSecret = process.env.CRON_SECRET;
  var dash = process.env.DASHBOARD_AUTH_SECRET;
  if (!cronSecret && !dash) return { ok: false, status: 503, reason: 'not_configured' };

  var auth = req.headers['authorization'] || '';
  if (cronSecret && same(auth, 'Bearer ' + cronSecret)) return { ok: true, by: 'schedule' };

  var k = url.searchParams.get('k');
  if (same(k, cronSecret) || same(k, dash)) return { ok: true, by: 'manual' };

  return { ok: false, status: 401, reason: 'unauthorized' };
}

/**
 * One send per Pacific day. The two cron entries already differ by the hour
 * guard, but a retry after a slow send would not, so the day is claimed in
 * Redis before the mail goes out. Without Redis configured the guard is absent
 * and the hour check stands alone — stated in the response rather than implied.
 */
async function claimDay(cache, day) {
  if (!cache || typeof cache.pipeline !== 'function') return { claimed: true, guarded: false };
  var out = await cache.pipeline([
    ['SET', 'kd:intel:sent:' + day, '1', 'EX', String(GUARD_TTL_SECONDS), 'NX']
  ]);
  if (!out || out.length === 0 || out[0] === undefined) return { claimed: true, guarded: false };
  return { claimed: out[0] === 'OK', guarded: true };
}

module.exports = async function handler(req, res) {
  var mods = await modules();
  var url = new URL(req.url, 'https://' + (req.headers['host'] || 'killdull.com'));

  var auth = authorised(req, url);
  if (!auth.ok) return json(res, auth.status, { ok: false, error: auth.reason });

  var now = new Date();
  var hour = mods.laHour(now);
  // A deliberate run, by either credential: ignore the hour guard and the
  // once-a-day claim, because the point of it is to run now.
  var force = url.searchParams.get('force') === '1';
  // A dry run builds the identical briefing and renders it, and sends nothing.
  // It is how this job is checked against real data without putting a test
  // email in Peter's inbox, and it is the same build() call the real run makes.
  var dry = url.searchParams.get('dry') === '1';

  // The DST guard. Exactly one of the two UTC entries is 08:00 in Los Angeles
  // on any given day; the other one stops here.
  if (hour !== TARGET_HOUR && !force && !dry) {
    return json(res, 200, { ok: true, skipped: 'not_send_hour', la_hour: hour, target_hour: TARGET_HOUR });
  }

  var day = mods.laDate(now);
  var claim = (force || dry) ? { claimed: true, guarded: false } : await claimDay(mods.cache, day);
  if (!claim.claimed) {
    return json(res, 200, { ok: true, skipped: 'already_sent_today', day: day });
  }

  var result = await mods.build({ hours: 24, now: now });
  if (!result.ok) {
    // A failed read is itself worth knowing about, but it is not a briefing and
    // must never be dressed up as one. Report the fault; send nothing.
    return json(res, 503, { ok: false, error: result.reason, day: day, la_hour: hour });
  }

  var model = result.model;
  var meta = {
    dashboardURL: process.env.DASHBOARD_URL || null,
    note: (model.degraded && model.degraded.length) ? 'Partial read: ' + model.degraded.join('; ') + '.' : ''
  };

  if (dry) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res.end(mods.pageHTML(model, meta));
  }

  var sent = await mods.sendBriefing({
    subject: mods.subjectFor(model),
    html: mods.emailHTML(model, meta),
    text: mods.briefingText(model, meta)
  });

  if (!sent.ok) return json(res, 502, { ok: false, error: sent.reason, day: day });

  return json(res, 200, {
    ok: true,
    day: day,
    la_hour: hour,
    by: auth.by,
    guarded: claim.guarded,
    window: model.window.label,
    subject: mods.subjectFor(model),
    totals: model.totals,
    degraded: model.degraded || [],
    // Where it actually went, so the recipient is confirmed rather than assumed.
    to: sent.to,
    message_id: sent.id
  });
};
