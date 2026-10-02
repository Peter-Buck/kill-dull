// What the collector accepted and refused, read back for the briefing.
//
// The collector counts every outcome per UTC day in Upstash — an event name when
// it was accepted, a reason when it was refused — and nothing else: no id, no
// path, no address. Intelligence reads those counters for the days the window
// touches, so a report can say "events were refused for having no consent"
// instead of silently showing less. Counters are whole UTC days, never the exact
// window, and the report says so.

import { EVENTS, REFUSALS } from '../collect/schema.mjs';

export function counterKey(day, kind, name) {
  return `kd:collect:${day}:${kind === 'accepted' ? 'ok' : 'rej'}:${name}`;
}

/** UTC yyyy-mm-dd for every day from start to end inclusive. */
export function utcDays(start, end) {
  const days = [];
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  for (; d <= end && days.length < 400; d.setUTCDate(d.getUTCDate() + 1)) days.push(d.toISOString().slice(0, 10));
  return days;
}

/**
 * @returns {Promise<{ok:true, days:string[], accepted:object, refused:object, totalAccepted:number, totalRefused:number} | {ok:false, reason:string}>}
 */
export async function collection(cache, start, end) {
  if (!cache || typeof cache.pipeline !== 'function') return { ok: false, reason: 'counters_not_configured' };
  const days = utcDays(start, end);
  const names = [
    ...[...EVENTS].map((n) => ['accepted', n]),
    ...REFUSALS.map((n) => ['refused', n]),
  ];
  const keys = days.flatMap((day) => names.map(([kind, n]) => counterKey(day, kind, n)));
  const out = await cache.pipeline([['MGET', ...keys]]);
  if (!out || !Array.isArray(out[0])) return { ok: false, reason: 'counters_unavailable' };
  const values = out[0];
  const accepted = {};
  const refused = {};
  keys.forEach((_, i) => {
    const v = Number(values[i] || 0);
    if (!v) return;
    const [kind, n] = names[i % names.length];
    const bag = kind === 'accepted' ? accepted : refused;
    bag[n] = (bag[n] || 0) + v;
  });
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  return { ok: true, days, accepted, refused, totalAccepted: sum(accepted), totalRefused: sum(refused) };
}
