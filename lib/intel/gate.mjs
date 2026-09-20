// Access control for the private Intelligence surface.
//
// One shared secret (DASHBOARD_AUTH_SECRET), supplied as ?k= once and then
// carried by a cookie so the secret stops living in the address bar. Compared
// in constant time. If the secret is not configured the surface stays CLOSED —
// an unset variable must never be the thing that publishes visitor data.

import { timingSafeEqual } from 'node:crypto';

export const COOKIE = 'kd_intel';

function equal(a, b) {
  const A = Buffer.from(String(a), 'utf8');
  const B = Buffer.from(String(b), 'utf8');
  if (A.length !== B.length) return false;      // length alone is not a secret
  return timingSafeEqual(A, B);
}

function cookie(header, name) {
  const raw = header || '';
  const m = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * @returns {{ok: true, setCookie?: string} | {ok: false, status: number, reason: string}}
 */
export function gate(url, headers, env = process.env) {
  const secret = env.DASHBOARD_AUTH_SECRET;
  if (!secret) return { ok: false, status: 503, reason: 'not_configured' };

  const supplied = url.searchParams.get('k');
  if (supplied && equal(supplied, secret)) {
    // Twelve hours, HttpOnly, Secure, SameSite=Lax: long enough for a working
    // session, short enough that a shared link stops working.
    return {
      ok: true,
      setCookie: `${COOKIE}=${encodeURIComponent(secret)}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Lax`,
    };
  }
  const held = cookie(headers.cookie || headers.Cookie, COOKIE);
  if (held && equal(held, secret)) return { ok: true };

  return { ok: false, status: 401, reason: 'unauthorized' };
}
