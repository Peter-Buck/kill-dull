// The one path from "what time is it" to "here is the briefing".
//
// Both surfaces call build(). The page renders what it returns; the daily job
// mails what it returns. There is exactly one place where the window is chosen,
// one place where PostHog is read and one place where the model is built, so
// the email and the page cannot drift into disagreeing about the same day.

import { windows } from './window.mjs';
import { events, priorVisitorIds, configured } from './posthog.mjs';
import { aggregate } from './aggregate.mjs';

const LOOKBACK_DAYS = 30;

/**
 * @param {object} opts
 * @param {number} [opts.hours]  window length; 24 is the daily briefing
 * @param {Date}   [opts.now]
 * @returns {Promise<{ok:true, model:object} | {ok:false, reason:string, window:object}>}
 */
export async function build({ hours = 24, now = new Date(), env = process.env } = {}) {
  const w = windows(now, hours);
  if (!configured(env)) return { ok: false, reason: 'posthog_not_configured', window: w };

  const [current, prior] = await Promise.all([
    events(w.start.toISOString(), w.end.toISOString(), env),
    events(w.priorStart.toISOString(), w.priorEnd.toISOString(), env),
  ]);
  if (!current.ok) return { ok: false, reason: current.reason, window: w };

  const lookbackFrom = new Date(w.priorStart.getTime() - LOOKBACK_DAYS * 86400000);
  const known = await priorVisitorIds(lookbackFrom.toISOString(), w.start.toISOString(), env);

  const model = aggregate({
    rows: current.rows,
    // A failed comparison window must not fail the briefing; it degrades to
    // "nothing to compare against", which the renderer states plainly.
    priorRows: prior.ok ? prior.rows : [],
    knownIds: known.ok ? known.ids : [],
    window: w,
  });
  model.degraded = [
    prior.ok ? null : `comparison window unavailable (${prior.reason})`,
    known.ok ? null : `returning-visitor lookback unavailable (${known.reason})`,
  ].filter(Boolean);
  return { ok: true, model };
}
