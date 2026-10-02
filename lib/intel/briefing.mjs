// The one path from "what window" to "here is the briefing".
//
// Both surfaces call build(): BUREAU reads what it returns, the daily job mails
// what it returns. There is exactly one place where the window is chosen, one
// place where PostHog is read and one place where the model is built, so the
// email and BUREAU cannot drift into disagreeing about the same window.
//
// `now` is the window's end. Passing the same end reproduces the same window,
// which is how the email's link opens exactly the report that was sent — rebuilt
// from the same raw events, never stored as a copy.

import { windows } from './window.mjs';
import { events, priorVisitorIds, configured, apiHost, ingestHost, regionOf } from './posthog.mjs';
import { aggregate } from './aggregate.mjs';
import { collection } from './collection.mjs';
import { createCache } from '../collect/cache.mjs';

const LOOKBACK_DAYS = 30;

/** Which region the collector writes to and which this reads from. Host names only. */
export function posthogRegions(env = process.env) {
  const write = regionOf(ingestHost(env));
  const read = regionOf(apiHost(env));
  const known = (r) => r === 'eu' || r === 'us';
  // A custom host (a reverse proxy, say) cannot be placed in a region from its
  // name; that is reported as unverified rather than guessed either way.
  const verified = known(write) && known(read);
  return { write: known(write) ? write : 'custom', read: known(read) ? read : 'custom', verified, aligned: !verified || write === read };
}

/**
 * @param {object} opts
 * @param {number} [opts.hours]  window length; 24 is the daily briefing
 * @param {Date}   [opts.now]    the window's end
 * @returns {Promise<{ok:true, model:object} | {ok:false, reason:string, window:object}>}
 */
export async function build({ hours = 24, now = new Date(), env = process.env, cache } = {}) {
  const w = windows(now, hours);
  if (!configured(env)) return { ok: false, reason: 'posthog_not_configured', window: w };

  const regions = posthogRegions(env);
  if (!regions.aligned) {
    // Reading one region while writing another would report an empty site as a
    // quiet one. Refuse instead, and say which regions, never which credentials.
    console.error(JSON.stringify({ where: 'intelligence', fault: 'posthog_region_mismatch', write: regions.write, read: regions.read }));
    return { ok: false, reason: 'posthog_region_mismatch', window: w };
  }

  const counters = cache === undefined ? createCache() : cache;
  const [current, prior, collected] = await Promise.all([
    events(w.start.toISOString(), w.end.toISOString(), env),
    events(w.priorStart.toISOString(), w.priorEnd.toISOString(), env),
    collection(counters, w.start, w.end),
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

  // Completeness. A report that read fewer events than PostHog holds says so
  // in the first thing anyone reads; it never presents a partial count as whole.
  model.completeness = {
    complete: current.complete,
    eventsInWindow: current.total,
    eventsRead: current.rows.length,
  };
  model.collection = collected.ok ? collected : { ok: false, reason: collected.reason };
  model.posthog = { read: regions.read, write: regions.write, verified: regions.verified };
  model.degraded = [
    current.complete ? null : `only ${current.rows.length} of ${current.total} events in this window were read — every figure below is a lower bound`,
    prior.ok ? (prior.complete ? null : 'comparison window read incompletely') : `comparison window unavailable (${prior.reason})`,
    known.ok ? (known.complete ? null : 'returning-visitor lookback hit its cap') : `returning-visitor lookback unavailable (${known.reason})`,
  ].filter(Boolean);
  return { ok: true, model };
}
