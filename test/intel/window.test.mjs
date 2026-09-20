// The send hour is the one thing in this feature that changes twice a year on
// its own. These tests pin both sides of both changeovers.

import test from 'node:test';
import assert from 'node:assert/strict';
import { laHour, laDate, windows } from '../../lib/intel/window.mjs';

test('15:00 UTC is 08:00 in Los Angeles during daylight time', () => {
  assert.equal(laHour(new Date('2026-07-01T15:00:00Z')), 8);
  assert.equal(laHour(new Date('2026-07-01T16:00:00Z')), 9);
});

test('16:00 UTC is 08:00 in Los Angeles during standard time', () => {
  assert.equal(laHour(new Date('2026-12-01T16:00:00Z')), 8);
  assert.equal(laHour(new Date('2026-12-01T15:00:00Z')), 7);
});

test('exactly one of the two cron entries is the send hour, every day of the year', () => {
  // Both changeover weekends, hour by hour, plus a plain week either side.
  for (const start of ['2026-03-05', '2026-10-29', '2026-06-10', '2027-01-10']) {
    for (let d = 0; d < 10; d += 1) {
      const day = new Date(`${start}T00:00:00Z`);
      day.setUTCDate(day.getUTCDate() + d);
      const at15 = new Date(day); at15.setUTCHours(15, 0, 0, 0);
      const at16 = new Date(day); at16.setUTCHours(16, 0, 0, 0);
      const hits = [at15, at16].filter((t) => laHour(t) === 8).length;
      assert.equal(hits, 1, `${at15.toISOString()} — ${hits} of 2 entries hit 08:00 Pacific`);
    }
  }
});

test('the day is claimed in Pacific time, not UTC', () => {
  // 15:00 UTC on 1 July is still the morning of 1 July in Los Angeles, and
  // 02:00 UTC on 2 July is still 1 July there. Both must claim the same day.
  assert.equal(laDate(new Date('2026-07-01T15:00:00Z')), '2026-07-01');
  assert.equal(laDate(new Date('2026-07-02T02:00:00Z')), '2026-07-01');
});

test('the comparison window is the same length, immediately before', () => {
  const w = windows(new Date('2026-09-20T15:00:00Z'), 24);
  assert.equal(w.end.getTime() - w.start.getTime(), 24 * 3600 * 1000);
  assert.equal(w.priorEnd.getTime(), w.start.getTime());
  assert.equal(w.start.getTime() - w.priorStart.getTime(), 24 * 3600 * 1000);
  assert.match(w.label, /Pacific$/);
});
