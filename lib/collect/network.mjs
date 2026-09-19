// Network/organisation enrichment — the ONLY place in this codebase that reads a
// visitor's IP address.
//
// Contract, in order of importance:
//   1. The IP is read from the request, used, and discarded within one request.
//      It is never stored, never logged, never sent to PostHog, and never cached.
//   2. Without an enrichment key configured the IP is not read at all, and every
//      visitor is UNKNOWN. Enrichment is strictly additive.
//   3. The provider receives the IP address and nothing else — no cookie, no
//      visitor id, no path, no referrer.
//   4. A slow or failing provider degrades to UNKNOWN. It must never delay or
//      drop an analytics event.
//
// Classification itself lives in classify.mjs, which is pure and unit-tested.
//
// Ported from peter-buck.com's network.ts. The contract above and every value
// below are unchanged. TypeScript types are gone, the @upstash/redis client is
// now the REST cache in cache.mjs, and the header accessor takes either a
// WHATWG Headers or Node's plain object — see geo.mjs for the same reason.

import { createHash } from 'node:crypto';
import { classify } from './classify.mjs';

export const UNKNOWN_NETWORK = {
  net_state: 'UNKNOWN',
  net_asn: null,
  net_name: null,
  net_org: null,
  net_domain: null,
  net_type: null,
};

const PROVIDER_TIMEOUT_MS = 1200;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // a week; networks change slowly

/** One accessor for both header shapes. See geo.mjs. */
function header(h, key) {
  if (h && typeof h.get === 'function') return h.get(key);
  if (h && typeof h === 'object') {
    const v = h[key] ?? h[key.toLowerCase()];
    return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
  }
  return null;
}

/**
 * The client IP, for transient use only. Vercel overwrites x-forwarded-for at the
 * edge and does not forward client-supplied values, so this cannot be spoofed.
 */
function clientIp(h) {
  const fwd = header(h, 'x-forwarded-for');
  if (!fwd) return null;
  const first = String(fwd).split(',')[0]?.trim();
  if (!first || first.length > 45) return null; // longest valid IPv6 form
  return first;
}

/**
 * Cache key: a salted hash, never the address. Without a salt configured we skip
 * the cache entirely rather than persist a weakly-keyed digest of an IP.
 */
function cacheKey(ip, salt = process.env.COLLECT_IP_SALT) {
  if (!salt) return null;
  return `net:${createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)}`;
}

const obj = (v) => (v && typeof v === 'object' ? v : {});
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 64) : null);
const bool = (v) => v === true;

/**
 * Map an Ipregistry response onto the classifier's fact shape. Written defensively:
 * every field is optional and a shape change degrades to fewer facts, never a throw.
 */
function factsFromIpregistry(body) {
  const connection = obj(body.connection);
  const company = obj(body.company);
  const carrier = obj(body.carrier);
  const security = obj(body.security);
  const asn = Number(connection.asn);
  return {
    asn: Number.isFinite(asn) ? asn : null,
    asName: str(connection.organization),
    isp: str(connection.organization) ?? str(company.name),
    companyName: str(company.name),
    companyDomain: str(company.domain),
    companyType: str(company.type),
    connectionType: str(connection.type),
    carrier: str(carrier.name),
    isVpn: bool(security.is_vpn),
    isProxy: bool(security.is_proxy),
    isTor: bool(security.is_tor),
    isRelay: bool(security.is_relay),
    isHosting: bool(security.is_cloud_provider) || str(connection.type) === 'hosting',
    isAnonymous: bool(security.is_anonymous),
  };
}

async function lookup(ip, key, doFetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const res = await doFetch(
      `https://api.ipregistry.co/${encodeURIComponent(ip)}?key=${encodeURIComponent(key)}`,
      { signal: controller.signal, headers: { accept: 'application/json' } },
    );
    if (!res.ok) return UNKNOWN_NETWORK;
    return classify(factsFromIpregistry(obj(await res.json())));
  } catch {
    return UNKNOWN_NETWORK; // timeout, abort, network error, bad JSON
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve the network behind a request. Returns UNKNOWN — never throws, never
 * blocks past the timeout — when enrichment is unconfigured or unavailable.
 *
 * @param {Headers|Record<string,string|string[]>} h  request headers
 * @param {{get:Function,set:Function}|null} cache    from createCache(), or null
 * @param {{key?:string, salt?:string, fetch?:typeof fetch}} [env]
 */
export async function resolveNetwork(h, cache, env = {}) {
  const key = env.key ?? process.env.IPREGISTRY_API_KEY;
  if (!key) return UNKNOWN_NETWORK; // not configured -> the IP is never read

  const ip = clientIp(h);
  if (!ip) return UNKNOWN_NETWORK;

  const salt = env.salt ?? process.env.COLLECT_IP_SALT;
  const cacheAt = cacheKey(ip, salt);
  if (cache && cacheAt) {
    try {
      const hit = await cache.get(cacheAt);
      if (hit && typeof hit === 'object' && typeof hit.net_state === 'string') return hit;
    } catch { /* cache unavailable -> fall through to a live lookup */ }
  }

  const signal = await lookup(ip, key, env.fetch ?? globalThis.fetch);

  // Only cache a real answer; caching UNKNOWN would pin a transient failure for a week.
  if (cache && cacheAt && signal.net_state !== 'UNKNOWN') {
    try { await cache.set(cacheAt, signal, CACHE_TTL_SECONDS); } catch { /* non-fatal */ }
  }
  return signal;
}

// Exported for tests only. Nothing in the request path calls these directly.
export const __test = { clientIp, cacheKey, factsFromIpregistry, CACHE_TTL_SECONDS, PROVIDER_TIMEOUT_MS };
