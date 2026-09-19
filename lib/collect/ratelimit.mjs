// Abuse control for /api/collect.
//
// peter-buck.com uses @upstash/ratelimit's sliding window. There is no SDK
// here, so the same shape is built from Redis primitives: a sorted set per
// identifier, scored by timestamp, trimmed to the window on every check. One
// pipelined round trip does all four operations.
//
// Two rules govern this file and neither is negotiable:
//
//   1. IT NEVER KEYS ON AN IP ADDRESS. The identifier is the distinctId the
//      route has already verified against the kd_did cookie. Keying on IP
//      would make the limiter a place where addresses are stored for a
//      minute at a time, which is precisely what the rest of this system is
//      built to avoid.
//
//   2. IT FAILS OPEN. If Upstash is slow, unreachable, unconfigured or
//      answers something unexpected, the event is allowed through. A limiter
//      that drops real analytics when the limiter itself is broken has done
//      more damage than the abuse it was guarding against.

export const DEFAULT_LIMIT = 100;
export const DEFAULT_WINDOW_MS = 60_000;

/**
 * @param {{cache: {pipeline: Function}|null, limit?: number, windowMs?: number, prefix?: string, now?: () => number}} opts
 * @returns {{check: (identifier: string) => Promise<{allowed: boolean, count: number|null, degraded: boolean}>}|null}
 */
export function createRateLimiter(opts = {}) {
  const cache = opts.cache;
  const limit = opts.limit ?? DEFAULT_LIMIT;
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
  const prefix = opts.prefix ?? 'collect:min';
  const now = opts.now ?? (() => Date.now());

  // No cache means no limiter. The route treats a null limiter as "allowed",
  // which is the same fail-open posture as an unreachable one.
  if (!cache || typeof cache.pipeline !== 'function') return null;

  return {
    async check(identifier) {
      const allowed = { allowed: true, count: null, degraded: true };
      if (typeof identifier !== 'string' || !identifier) return allowed;

      const key = `${prefix}:${identifier}`;
      const t = now();
      // Unique member per event: two events in the same millisecond must both
      // count, and a sorted set would otherwise collapse them into one.
      const member = `${t}-${Math.random().toString(36).slice(2, 10)}`;

      let results;
      try {
        results = await cache.pipeline([
          ['ZREMRANGEBYSCORE', key, '0', String(t - windowMs)], // drop what has aged out
          ['ZADD', key, String(t), member],                      // record this one
          ['ZCARD', key],                                        // how many remain in the window
          ['PEXPIRE', key, String(windowMs + 1000)],             // let an idle key disappear
        ]);
      } catch {
        return allowed; // unreachable -> allow
      }

      if (!Array.isArray(results)) return allowed;
      const count = Number(results[2]);
      if (!Number.isFinite(count)) return allowed; // unexpected answer -> allow

      return { allowed: count <= limit, count, degraded: false };
    },
  };
}
