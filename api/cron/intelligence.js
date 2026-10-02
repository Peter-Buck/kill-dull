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
      import('../../lib/collect/cache.mjs'),
      import('../../lib/intel/access.mjs')
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
        cache: m[4].createCache(),
        bureauURL: m[5].bureauURL
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
 * Bearer tokens only — nothing in the URL, so no link, log line or browser
 * history ever carries a credential.
 *
 * Vercel's scheduler presents CRON_SECRET; that is the only credential that can
 * send. BUREAU's read token may ask for a dry run, which renders the identical
 * briefing and sends nothing — it can already read the same model, so this
 * grants it nothing new. Both are compared in constant time and never echoed.
 *
 * If CRON_SECRET is not configured the job refuses to run rather than leaving
 * a mailer open to the internet.
 */
function authorised(req) {
  var cronSecret = process.env.CRON_SECRET;
  var readToken = process.env.INTELLIGENCE_READ_TOKEN;
  if (!cronSecret) return { ok: false, status: 503, reason: 'not_configured' };

  var auth = req.headers['authorization'] || '';
  if (same(auth, 'Bearer ' + cronSecret)) return { ok: true, by: 'schedule' };
  if (readToken && same(auth, 'Bearer ' + readToken)) return { ok: true, by: 'reader', dryOnly: true };

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

/**
 * Give the day back when nothing was sent.
 *
 * The claim is taken before the briefing is built, because that is the only
 * order in which it prevents two overlapping runs from both sending. The cost
 * is that a run which then fails would hold the day against a retry — turning
 * one bad minute at PostHog or Google into a silent missing day. Releasing it
 * on every failure path costs one Redis call and removes that.
 */
async function releaseDay(cache, day, claim) {
  if (!claim || !claim.guarded || !cache || typeof cache.pipeline !== 'function') return;
  await cache.pipeline([['DEL', 'kd:intel:sent:' + day]]);
}

module.exports = async function handler(req, res) {
  var mods = await modules();
  var url = new URL(req.url, 'https://' + (req.headers['host'] || 'killdull.com'));

  var auth = authorised(req);
  if (!auth.ok) return json(res, auth.status, { ok: false, error: auth.reason });

  // Whole seconds, so the end written into the email's link is exactly the end
  // the briefing was built with, and opening the link rebuilds the same window.
  var now = new Date(Math.floor(Date.now() / 1000) * 1000);
  var hour = mods.laHour(now);
  // A deliberate run with the scheduler's credential: ignore the hour guard and the
  // once-a-day claim, because the point of it is to run now.
  var force = url.searchParams.get('force') === '1';
  // A dry run builds the identical briefing and renders it, and sends nothing.
  // It is how this job is checked against real data without putting a test
  // email in Peter's inbox, and it is the same build() call the real run makes.
  var dry = url.searchParams.get('dry') === '1';
  if (auth.dryOnly && (!dry || force)) return json(res, 403, { ok: false, error: 'dry_run_only' });

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
    //
    // The log line matters more than the status code: when the briefing cannot
    // be sent, the log is the only channel left that Peter can be pointed at.
    // It carries the reason and the day, and never a credential.
    console.error('intelligence: build failed', result.reason, day);
    await releaseDay(mods.cache, day, claim);
    return json(res, 503, { ok: false, error: result.reason, day: day, la_hour: hour });
  }

  var model = result.model;
  var meta = {
    // BUREAU, pinned to this exact window. No secret: BUREAU asks the reader to
    // sign in, then rebuilds the same report from the same raw events.
    dashboardURL: mods.bureauURL({ hours: 24, end: now }),
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

  if (!sent.ok) {
    console.error('intelligence: send failed', sent.reason, day);
    await releaseDay(mods.cache, day, claim);
    return json(res, 502, { ok: false, error: sent.reason, day: day });
  }

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
