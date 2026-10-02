// Who may read Intelligence at killdull.com, and which window they asked for.
//
// There is one reader: BUREAU's production server, presenting the OIDC token
// Vercel signs for it. People read Intelligence in BUREAU, signed in with Google;
// this host no longer has a human login at all. Anything that is not BUREAU's server
// is sent to BUREAU, carrying only the window it asked for.

import { createPublicKey, timingSafeEqual, verify as verifySignature } from 'node:crypto';

export const BUREAU_URL = 'https://bureau.killdull.com/intelligence';
export const HOURS = [24, 72, 168];
// How far back a pinned window may end, and how far ahead (clock skew).
export const MAX_AGE_MS = 400 * 86400000;
export const SKEW_MS = 5 * 60000;

// The one reader: BUREAU's production deployment, identified by the OIDC token
// Vercel itself signs for that project's functions. There is no shared secret
// to create, copy, rotate or leak: the token is minted by Vercel, lives about an
// hour, and names the team, project and environment it was issued to. These are
// identifiers, not credentials.
export const READER = {
  team: 'peter-buck-s-projects',
  ownerId: 'team_0aQVQlLLKB8gu88SkVmbJo8b',
  projectId: 'prj_XrqxU74XG54FeydQnQAn43501Hy7',
  environment: 'production',
};
const ISSUERS = [`https://oidc.vercel.com/${READER.team}`, 'https://oidc.vercel.com'];
const JWKS_TTL_MS = 10 * 60000;
const JWKS_TIMEOUT_MS = 3000;
const jwksCache = new Map();
/** Forget cached keys (tests). */
export function resetKeys() { jwksCache.clear(); }

function equal(a, b) {
  const A = Buffer.from(String(a), 'utf8');
  const B = Buffer.from(String(b), 'utf8');
  if (A.length !== B.length) return false;      // length alone is not a secret
  return timingSafeEqual(A, B);
}

function part(s) {
  return JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));
}

async function keysFor(iss, doFetch) {
  const hit = jwksCache.get(iss);
  if (hit && hit.until > Date.now()) return hit.keys;
  const res = await doFetch(`${iss}/.well-known/jwks`, { signal: AbortSignal.timeout(JWKS_TIMEOUT_MS) });
  if (!res.ok) throw new Error('jwks_unavailable');
  const keys = (await res.json()).keys || [];
  jwksCache.set(iss, { keys, until: Date.now() + JWKS_TTL_MS });
  return keys;
}

/**
 * Is this a Vercel OIDC token issued to BUREAU's production deployment?
 * Signature (RS256, against Vercel's published keys), issuer, expiry and the
 * team/project/environment claims are all checked. Any doubt is a no.
 */
export async function bureauIdentity(token, { now = Date.now(), fetch: doFetch = globalThis.fetch, reader = READER } = {}) {
  try {
    const [h, p, sig] = String(token).split('.');
    if (!h || !p || !sig) return false;
    const header = part(h);
    const claims = part(p);
    if (header.alg !== 'RS256' || !header.kid) return false;
    if (!ISSUERS.includes(claims.iss)) return false;
    const t = Math.floor(now / 1000);
    if (typeof claims.exp !== 'number' || claims.exp < t - 60) return false;
    const nbf = claims.nbf ?? claims.nfb ?? claims.iat;
    if (typeof nbf === 'number' && nbf > t + 60) return false;
    if (claims.owner_id !== reader.ownerId || claims.project_id !== reader.projectId || claims.environment !== reader.environment) return false;
    const jwk = (await keysFor(claims.iss, doFetch)).find((k) => k.kid === header.kid && k.kty === 'RSA');
    if (!jwk) return false;
    const key = createPublicKey({ key: jwk, format: 'jwk' });
    return verifySignature('RSA-SHA256', Buffer.from(`${h}.${p}`), key, Buffer.from(sig, 'base64url'));
  } catch {
    return false;
  }
}

/** 'ok' or 'denied'. Never says anything about why, or about any credential. */
export async function machine(headers, env = process.env, opts = {}) {
  const auth = String(headers.authorization || headers.Authorization || '');
  const m = /^Bearer (\S+)$/.exec(auth);
  if (!m) return 'denied';
  // An optional static token, for a reader that is not on Vercel. Unset by default.
  if (env.INTELLIGENCE_READ_TOKEN && equal(m[1], env.INTELLIGENCE_READ_TOKEN)) return 'ok';
  return (await bureauIdentity(m[1], opts)) ? 'ok' : 'denied';
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
