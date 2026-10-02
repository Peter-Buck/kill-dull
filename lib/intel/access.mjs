// Who may read Intelligence at killdull.com, and which window they asked for.
//
// There is one reader: BUREAU's server, presenting INTELLIGENCE_READ_TOKEN as a
// bearer token. People read Intelligence in BUREAU, signed in with Google; this
// host no longer has a human login at all. Anything that is not BUREAU's server
// is sent to BUREAU, carrying only the window it asked for.

import { timingSafeEqual } from 'node:crypto';

export const BUREAU_URL = 'https://bureau.killdull.com/intelligence';
export const HOURS = [24, 72, 168];
// How far back a pinned window may end, and how far ahead (clock skew).
export const MAX_AGE_MS = 400 * 86400000;
export const SKEW_MS = 5 * 60000;

function equal(a, b) {
  const A = Buffer.from(String(a), 'utf8');
  const B = Buffer.from(String(b), 'utf8');
  if (A.length !== B.length) return false;      // length alone is not a secret
  return timingSafeEqual(A, B);
}

/** 'ok', 'denied', or 'not_configured'. Never says anything about the token. */
export function machine(headers, env = process.env) {
  const token = env.INTELLIGENCE_READ_TOKEN;
  if (!token) return 'not_configured';
  const auth = String(headers.authorization || headers.Authorization || '');
  return auth && equal(auth, `Bearer ${token}`) ? 'ok' : 'denied';
}

/**
 * The window the request names: hours from a fixed list, and an optional
 * pinned end. Invalid values are rejected (null) rather than clamped, so a
 * mistyped link cannot quietly answer a different question.
 * @returns {{hours:number, end:Date|null} | null}
 */
export function windowOf(params, now = new Date()) {
  const h = params.get('hours');
  const hours = h == null || h === '' ? 24 : Number(h);
  if (!HOURS.includes(hours)) return null;
  const e = params.get('end');
  if (e == null || e === '') return { hours, end: null };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/.test(e)) return null;
  const end = new Date(e);
  if (Number.isNaN(end.getTime())) return null;
  if (end.getTime() > now.getTime() + SKEW_MS) return null;
  if (end.getTime() < now.getTime() - MAX_AGE_MS) return null;
  return { hours, end };
}

/** Where a browser goes: BUREAU, with the same window if it named a valid one. */
export function bureauURL(win) {
  const u = new URL(BUREAU_URL);
  if (win) {
    u.searchParams.set('hours', String(win.hours));
    if (win.end) u.searchParams.set('end', win.end.toISOString());
  }
  return u.toString();
}
