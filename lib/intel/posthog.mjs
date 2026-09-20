// Reading Kill Dull's own PostHog project.
//
// Collection writes with the project API key; reporting reads with the personal
// API key, against one explicit project id. That id is what guarantees this
// only ever sees Kill Dull — there is no cross-project query here and no way to
// widen one.
//
// Ingest and the query API live on different hosts: events go to eu.i.posthog.com,
// the API answers on eu.posthog.com. POSTHOG_HOST is whichever was configured,
// so the ingest prefix is normalised away rather than requiring a second variable.

const TIMEOUT_MS = 20000;

// ClickHouse wants 'YYYY-MM-DD hh:mm:ss'. These bounds are built by this server
// from a Date, never from a request, so this is a formatter and not a defence —
// but the values are still the only thing interpolated into any query here.
function ch(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new TypeError('bad timestamp');
  return d.toISOString().slice(0, 19).replace('T', ' ');
}


export function apiHost(env = process.env) {
  const raw = (env.POSTHOG_API_HOST || env.POSTHOG_HOST || 'https://eu.posthog.com').trim();
  return raw.replace(/\/+$/, '').replace('://eu.i.posthog.com', '://eu.posthog.com')
    .replace('://us.i.posthog.com', '://us.posthog.com')
    .replace('://app.i.posthog.com', '://app.posthog.com');
}

export function configured(env = process.env) {
  return Boolean(env.POSTHOG_PERSONAL_API_KEY && env.POSTHOG_PROJECT_ID);
}

/**
 * Run one HogQL query. Returns { ok, columns, results } or { ok:false, reason }.
 * Never throws: a reporting surface that crashes on a provider hiccup is worse
 * than one that says the read failed.
 */
export async function hogql(query, env = process.env) {
  if (!configured(env)) return { ok: false, reason: 'posthog_not_configured' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${apiHost(env)}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
    });
    if (!res.ok) {
      // Status only. A PostHog error body can echo the query back.
      return { ok: false, reason: `posthog_http_${res.status}` };
    }
    const body = await res.json();
    return { ok: true, columns: body.columns || [], results: body.results || [] };
  } catch (e) {
    return { ok: false, reason: e && e.name === 'AbortError' ? 'posthog_timeout' : 'posthog_unreachable' };
  } finally {
    clearTimeout(timer);
  }
}

// The columns the reporting layer reads. Kept as one list so the query and the
// row decoder cannot drift apart.
export const COLUMNS = [
  'event', 'distinct_id', 'timestamp',
  'path', 'page_type', 'dwell_bucket', 'scroll_depth_bucket', 'reading_brand',
  'referrer_domain', 'utm_source', 'target', 'location',
  'geo_city', 'geo_region', 'geo_country',
  'net_state', 'net_name', 'net_org', 'net_domain', 'net_asn',
  'org_name', 'org_confidence',
];

const SELECT = COLUMNS.map((c) =>
  ['event', 'distinct_id', 'timestamp'].includes(c) ? c : `properties.${c} AS ${c}`
).join(', ');

/** Every event in [start, end). ISO strings in, decoded row objects out. */
export async function events(startISO, endISO, env = process.env) {
  const q = `SELECT ${SELECT} FROM events
WHERE timestamp >= toDateTime('${ch(startISO)}')
  AND timestamp <  toDateTime('${ch(endISO)}')
ORDER BY timestamp ASC
LIMIT 20000`;
  const r = await hogql(q, env);
  if (!r.ok) return r;
  const idx = {};
  (r.columns.length ? r.columns : COLUMNS).forEach((c, i) => { idx[c] = i; });
  const rows = r.results.map((row) => {
    const o = {};
    for (const c of COLUMNS) o[c] = row[idx[c]] ?? null;
    return o;
  });
  return { ok: true, rows };
}

/**
 * Distinct ids seen in [sinceISO, beforeISO) — the lookback that makes
 * "returning" mean something wider than yesterday. Ids only, nothing else.
 */
export async function priorVisitorIds(sinceISO, beforeISO, env = process.env) {
  const q = `SELECT DISTINCT distinct_id FROM events
WHERE timestamp >= toDateTime('${ch(sinceISO)}')
  AND timestamp <  toDateTime('${ch(beforeISO)}')
LIMIT 50000`;
  const r = await hogql(q, env);
  if (!r.ok) return r;
  return { ok: true, ids: new Set(r.results.map((row) => row[0]).filter(Boolean)) };
}

/** Are events still arriving at all? One cheap count over the last 7 days. */
export async function recentEventCount(env = process.env) {
  const r = await hogql(
    "SELECT count() FROM events WHERE timestamp >= now() - INTERVAL 7 DAY",
    env,
  );
  if (!r.ok) return r;
  return { ok: true, count: Number(r.results?.[0]?.[0] || 0) };
}
