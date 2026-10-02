// killdull.com/intelligence is a machine endpoint and a signpost. BUREAU's
// server reads it with a bearer token; everyone else is sent to BUREAU. No
// secret ever lives in a URL, and no window is answered that was not asked for.

import test from 'node:test';
import assert from 'node:assert/strict';
import { machine, windowOf, bureauURL } from '../../lib/intel/access.mjs';

const TOKEN = 'read-token-for-tests-0123456789abcdef';
const env = { INTELLIGENCE_READ_TOKEN: TOKEN };
const now = new Date('2026-10-02T15:00:00Z');
const p = (q) => new URLSearchParams(q);

test('only the exact bearer token is a machine', () => {
  assert.equal(machine({ authorization: `Bearer ${TOKEN}` }, env), 'ok');
  assert.equal(machine({ authorization: `Bearer ${TOKEN}x` }, env), 'denied');
  assert.equal(machine({ authorization: TOKEN }, env), 'denied');
  assert.equal(machine({}, env), 'denied');
  assert.equal(machine({ cookie: `kd_intel=${TOKEN}` }, env), 'denied', 'the old cookie is not a credential');
});

test('an unset token is not configured, never open', () => {
  assert.equal(machine({ authorization: 'Bearer ' }, {}), 'not_configured');
  assert.equal(machine({ authorization: 'Bearer undefined' }, {}), 'not_configured');
});

test('the window: three lengths, an optional pinned end, nothing else', () => {
  assert.deepEqual(windowOf(p(''), now), { hours: 24, end: null });
  assert.deepEqual(windowOf(p('hours=168'), now), { hours: 168, end: null });
  assert.equal(windowOf(p('hours=25'), now), null);
  assert.equal(windowOf(p('hours=abc'), now), null);
  const w = windowOf(p('hours=24&end=2026-10-02T15:00:00Z'), now);
  assert.equal(w.end.toISOString(), '2026-10-02T15:00:00.000Z');
  assert.ok(windowOf(p('end=2026-10-02T14:59:59.000Z'), now));
});

test('a pinned end must be a UTC instant, not in the future, and not ancient', () => {
  for (const end of ['2026-10-02', '2026-10-02T15:00:00+01:00', 'yesterday', '2026-10-03T00:00:00Z',
    '2025-01-01T00:00:00Z', '2026-10-02T15:00:00Z<script>']) {
    assert.equal(windowOf(p(`end=${encodeURIComponent(end)}`), now), null, end);
  }
});

test('a browser is sent to BUREAU with only its window', () => {
  assert.equal(bureauURL(null), 'https://bureau.killdull.com/intelligence');
  assert.equal(bureauURL({ hours: 72, end: null }), 'https://bureau.killdull.com/intelligence?hours=72');
  assert.equal(bureauURL({ hours: 24, end: new Date('2026-10-02T15:00:00Z') }),
    'https://bureau.killdull.com/intelligence?hours=24&end=2026-10-02T15%3A00%3A00.000Z');
});
