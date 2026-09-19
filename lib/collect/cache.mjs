// Upstash Redis over its REST API.
//
// peter-buck.com reaches Upstash through the @upstash/redis SDK. This site has
// no package.json and no build step, so the same two operations are done with
// plain fetch against the documented REST endpoint. The behaviour the caller
// depends on is identical: get returns the stored value or null, set stores it
// with a TTL, and every failure is swallowed and reported as a miss.
//
// Two differences follow from dropping the SDK, and both are handled here so
// callers never see them:
//   • The SDK serialises objects; REST stores strings. JSON is encoded and
//     decoded in this file.
//   • The SDK has no request timeout. This does, because the contract in
//     network.mjs is that enrichment must never delay or drop an event, and a
//     hanging cache read would break that as surely as a hanging provider.

const CACHE_TIMEOUT_MS = 600;

/**
 * A cache backed by Upstash, or null when it isn't configured. A null cache is
 * a valid state everywhere it is used: the site works, lookups just aren't
 * memoised.
 * @param {{url?: string, token?: string, fetch?: typeof fetch}} [opts]
 */
export function createCache(opts = {}) {
  const url = (opts.url ?? process.env.UPSTASH_REDIS_REST_URL ?? '').replace(/\/$/, '');
  const token = opts.token ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
  const doFetch = opts.fetch ?? globalThis.fetch;
  if (!url || !token || typeof doFetch !== 'function') return null;

  /** Issue one Redis command. Returns the raw `result`, or undefined on any failure. */
  async function command(args) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CACHE_TIMEOUT_MS);
    try {
      const res = await doFetch(url, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(args),
        signal: controller.signal,
      });
      if (!res.ok) return undefined;
      const body = await res.json();
      return body?.result;
    } catch {
      return undefined; // timeout, abort, network error, bad JSON
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Issue several commands in one round trip. Returns an array of raw results,
   * or null on any failure — callers decide what a failure means for them.
   */
  async function pipelineCommands(commands) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CACHE_TIMEOUT_MS);
    try {
      const res = await doFetch(`${url}/pipeline`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(commands),
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const body = await res.json();
      if (!Array.isArray(body)) return null;
      return body.map((r) => (r && typeof r === 'object' ? r.result : undefined));
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    pipeline: pipelineCommands,

    /** @returns {Promise<unknown|null>} the decoded value, or null on miss or failure. */
    async get(key) {
      const result = await command(['GET', key]);
      if (typeof result !== 'string') return null;
      try { return JSON.parse(result); } catch { return null; }
    },

    /** Store with a TTL in seconds. Returns true only on a confirmed write. */
    async set(key, value, ttlSeconds) {
      const result = await command(['SET', key, JSON.stringify(value), 'EX', String(ttlSeconds)]);
      return result === 'OK';
    },
  };
}
