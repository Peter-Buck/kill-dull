// A report never presents a partial read as a complete one, reads only the
// production site, and states what the collector refused.

import test from 'node:test';
import assert from 'node:assert/strict';
import { events, PRODUCTION_ONLY, regionOf } from '../../lib/intel/posthog.mjs';
import { collection, utcDays, counterKey } from '../../lib/intel/collection.mjs';
import { posthogRegions } from '../../lib/intel/briefing.mjs';
import { aggregate } from '../../lib/intel/aggregate.mjs';
import { emailHTML, briefingText, subjectFor } from '../../lib/intel/render.mjs';

const env = { POSTHOG_PERSONAL_API_KEY: 'phx_test', POSTHOG_PROJECT_ID: '1', POSTHOG_HOST: 'https://eu.posthog.com' };
const COLS = ['event', 'distinct_id', 'timestamp'];

// Behaves as PostHog does for a personal API key: OFFSET is refused with a 400, and
// pages are read by keyset on the event id.
function fakePostHog(total, { cap = Infinity } = {}) {
  const queries = [];
  const ids = Array.from({ length: total }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`);
  globalThis.fetch = async (url, init) => {
    const q = JSON.parse(init.body).query.query;
    queries.push(q);
    if (/\bOFFSET\b/.test(q)) return { ok: false, status: 400, json: async () => ({ type: 'validation_error', code: 'hogql_query_error', detail: 'OFFSET is not supported on queries made with a personal API key.' }) };
    if (/SELECT count\(\)/.test(q)) return { ok: true, json: async () => ({ columns: ['count()'], results: [[total]] }) };
    const limit = Number(q.match(/LIMIT (\d+)/)[1]);
    const after = (q.match(/toString\(uuid\) > '([^']+)'/) || [])[1];
    const from = after ? ids.indexOf(after) + 1 : 0;
    const slice = ids.slice(from, Math.min(from + limit, cap));
    // Timestamps run backwards against ids, so the reader must restore time order itself.
    const results = slice.map((id) => ['content_view', `v${id.slice(-4)}`, `2026-10-01T10:${String(59 - (ids.indexOf(id) % 60)).padStart(2, '0')}:00Z`, id]);
    return { ok: true, json: async () => ({ columns: [...COLS, 'kd_key'], results }) };
  };
  return queries;
}

test('every row is read across pages, and the read says it is complete', async () => {
  const q = fakePostHog(25);
  const r = await events('2026-10-01T00:00:00Z', '2026-10-02T00:00:00Z', env, { pageRows: 10 });
  assert.equal(r.rows.length, 25);
  assert.equal(r.total, 25);
  assert.equal(r.complete, true);
  assert.equal(q.filter((x) => /kd_key/.test(x)).length, 3, 'three keyset pages');
  assert.equal(q.some((x) => /OFFSET/.test(x)), false, 'never OFFSET');
  assert.equal(new Set(r.rows.map((x) => x.distinct_id)).size, 25, 'no row read twice');
  const t = r.rows.map((x) => Date.parse(x.timestamp));
  assert.deepEqual(t, [...t].sort((a, b) => a - b), 'rows come back in time order');
});

test('A SHORT READ IS REPORTED AS INCOMPLETE, never as the whole window', async () => {
  fakePostHog(40, { cap: 15 });
  const r = await events('2026-10-01T00:00:00Z', '2026-10-02T00:00:00Z', env, { pageRows: 10 });
  assert.equal(r.complete, false);
  fakePostHog(40);
  const capped = await events('2026-10-01T00:00:00Z', '2026-10-02T00:00:00Z', env, { pageRows: 10, maxRows: 20 });
  assert.equal(capped.rows.length, 20);
  assert.equal(capped.complete, false);
});

test('every query reads only production (or untagged history)', async () => {
  const q = fakePostHog(3);
  await events('2026-10-01T00:00:00Z', '2026-10-02T00:00:00Z', env);
  assert.ok(q.length >= 2);
  for (const x of q) assert.ok(x.includes(PRODUCTION_ONLY), x);
});

test('an incomplete model is flagged first, in the subject, page and text', () => {
  const m = aggregate({ rows: [{ event: 'content_view', distinct_id: 'a', timestamp: '2026-10-01 10:00:00', page_type: 'HOME' }], window: { label: 'w' } });
  m.completeness = { complete: false, eventsInWindow: 50000, eventsRead: 200000 > 50000 ? 20000 : 0 };
  assert.match(subjectFor(m), /\(incomplete read\)$/);
  assert.match(emailHTML(m), /INCOMPLETE READ/);
  assert.match(emailHTML(m), /lower bound/);
  assert.match(briefingText(m), /^KILL DULL INTELLIGENCE\n.*\n\nINCOMPLETE READ/);
});

test('region alignment: eu with eu is aligned; eu with us is not; a custom host is unverified', () => {
  assert.equal(regionOf('https://eu.i.posthog.com'), 'eu');
  assert.equal(regionOf('https://us.posthog.com'), 'us');
  assert.deepEqual(posthogRegions({ POSTHOG_HOST: 'https://eu.posthog.com' }), { write: 'eu', read: 'eu', verified: true, aligned: true });
  assert.equal(posthogRegions({ POSTHOG_HOST: 'https://us.posthog.com' }).aligned, false);
  assert.equal(posthogRegions({ POSTHOG_HOST: 'https://ph.example.com' }).verified, false);
});

test('refusal counters are read for the whole UTC days the window touches', async () => {
  assert.deepEqual(utcDays(new Date('2026-10-01T15:00:00Z'), new Date('2026-10-02T15:00:00Z')), ['2026-10-01', '2026-10-02']);
  const store = { [counterKey('2026-10-01', 'refused', 'no_consent')]: '7', [counterKey('2026-10-02', 'refused', 'no_consent')]: '2',
    [counterKey('2026-10-02', 'accepted', 'content_view')]: '11', [counterKey('2026-10-02', 'refused', 'internal')]: '3' };
  const cache = { pipeline: async ([[cmd, ...keys]]) => [keys.map((k) => store[k] ?? null)] };
  const c = await collection(cache, new Date('2026-10-01T15:00:00Z'), new Date('2026-10-02T15:00:00Z'));
  assert.deepEqual(c.refused, { no_consent: 9, internal: 3 });
  assert.deepEqual(c.accepted, { content_view: 11 });
  assert.equal(c.totalRefused, 12);
});

test('no counters is said, not silently omitted', async () => {
  assert.deepEqual(await collection(null, new Date(), new Date()), { ok: false, reason: 'counters_not_configured' });
  const m = aggregate({ rows: [], window: { label: 'w' } });
  m.collection = { ok: false, reason: 'counters_unavailable' };
  assert.match(emailHTML(m), /Refusal counts unavailable \(counters_unavailable\)/);
});

test('refusals are shown by reason, with the language Peter asked for', () => {
  const m = aggregate({ rows: [], window: { label: 'w' } });
  m.collection = { ok: true, days: ['2026-10-01'], refused: { no_consent: 4, cookie_mismatch: 1, non_production: 2, rate_limited: 1, bad_body: 1, unknown_event: 1 }, accepted: {}, totalRefused: 10 };
  const html = emailHTML(m);
  for (const label of ['No consent', 'Cookie mismatch', 'Not the production site', 'Rate limit', 'Schema failure', 'Unknown event']) {
    assert.ok(html.includes(label), label);
  }
});
