// The collection layer's epistemic rules have to survive reporting. These are
// the tests that stop the briefing from claiming more than the data supports.

import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregate, networkClaim, placeLabel } from '../../lib/intel/aggregate.mjs';

const at = (n) => `2026-09-20 1${n}:00:00`;
const view = (id, extra = {}) => ({
  event: 'content_view', distinct_id: id, timestamp: at(0), path: '/', page_type: 'HOME', ...extra,
});

test('only a corroborated company is named as an organisation', () => {
  const m = aggregate({ rows: [view('a', {
    net_state: 'ORG_IDENTIFIED', net_org: 'WPP', net_name: 'WPP plc', org_confidence: 'HIGH',
  })] });
  assert.deepEqual(m.organisations.identified.map((o) => o.org), ['WPP']);
  assert.equal(m.organisations.possible.length, 0);
  assert.equal(m.visitors[0].network.label, 'WPP');
});

test('ORG_POSSIBLE is never promoted, and always carries its hedge', () => {
  const m = aggregate({ rows: [view('a', {
    net_state: 'ORG_POSSIBLE', net_org: 'Acme Media', org_confidence: 'NONE',
  })] });
  assert.equal(m.organisations.identified.length, 0);
  assert.deepEqual(m.organisations.possible.map((o) => o.org), ['Acme Media']);
  assert.equal(m.visitors[0].network.confidence, 'LOW');
  assert.match(m.visitors[0].network.label, /ORG POSSIBLE$/);
});

test('org_confidence is believed over net_state — a mismatch fails closed', () => {
  // A row claiming ORG_IDENTIFIED without HIGH confidence is not evidence of a
  // company. It must not appear as an identified organisation.
  const m = aggregate({ rows: [view('a', {
    net_state: 'ORG_IDENTIFIED', net_org: 'Fabricated Ltd', net_name: 'Some ISP', org_confidence: 'NONE',
  })] });
  assert.equal(m.organisations.identified.length, 0);
  assert.equal(m.visitors[0].network.org, null);
  assert.equal(JSON.stringify(m).includes('Fabricated Ltd'), false);
});

test('a network operator is not an employer', () => {
  const m = aggregate({ rows: [view('a', { net_state: 'RESIDENTIAL', net_name: 'Verizon Fios' })] });
  assert.equal(m.organisations.identified.length, 0);
  assert.equal(m.visitors[0].network.org, null);
  assert.equal(m.visitors[0].network.label, 'Verizon Fios · ORG UNKNOWN');
});

test('UNKNOWN stays UNKNOWN and is counted, not hidden', () => {
  const m = aggregate({ rows: [view('a'), view('b', { net_state: 'UNKNOWN' })] });
  assert.equal(m.networkStates.find((n) => n.state === 'UNKNOWN').visitors, 2);
  assert.equal(m.visitors[0].network.label, 'ORG UNKNOWN');
});

test('a relay is only Apple\'s when the facts said Apple', () => {
  assert.equal(networkClaim({ net_state: 'PRIVATE_RELAY', net_name: 'Apple Private Relay' }).label,
    'Apple Private Relay · ORG UNKNOWN');
  assert.equal(networkClaim({ net_state: 'PRIVATE_RELAY', net_name: 'Cloudflare WARP' }).label,
    'Cloudflare WARP · PRIVATE RELAY · ORG UNKNOWN');
});

test('the strongest claim a visitor\'s own events support is the one shown', () => {
  // Office wifi then a phone. The office visit is not erased, and the two are
  // never merged into a claim neither row made.
  const m = aggregate({ rows: [
    view('a', { net_state: 'ORG_IDENTIFIED', net_org: 'WPP', org_confidence: 'HIGH' }),
    { ...view('a'), timestamp: at(2), net_state: 'MOBILE', net_name: 'Verizon' },
  ] });
  assert.equal(m.visitors[0].network.org, 'WPP');
  assert.equal(m.visitors.length, 1);
});

test('no distinct_id reaches the model, anywhere', () => {
  const m = aggregate({ rows: [view('a-very-distinctive-uuid')] });
  assert.equal(JSON.stringify(m).includes('a-very-distinctive-uuid'), false);
  assert.equal('id' in m.visitors[0], false);
});

test('visitors are ordinals in order of first appearance, not names', () => {
  const m = aggregate({ rows: [
    { ...view('second'), timestamp: at(5) },
    { ...view('first'), timestamp: at(1) },
  ] });
  assert.deepEqual(m.visitors.map((v) => v.label), ['Anonymous #1', 'Anonymous #2']);
});

test('returning means seen before this window, by either route', () => {
  const rows = [view('a'), view('b'), view('c')];
  const m = aggregate({
    rows,
    priorRows: [{ ...view('b'), timestamp: '2026-09-19 10:00:00' }],
    knownIds: ['c'],
  });
  assert.equal(m.totals.returning, 2);
  assert.equal(m.totals.new, 1);
});

test('change is measured, and a rise from nothing is not a percentage', () => {
  const m = aggregate({ rows: [view('a'), view('b')], priorRows: [] });
  assert.equal(m.change.visitors.now, 2);
  assert.equal(m.change.visitors.before, 0);
  assert.equal(m.change.visitors.pct, null);
});

test('a quiet window is a finding, not an empty object', () => {
  const m = aggregate({ rows: [], priorRows: [view('a')] });
  assert.equal(m.quiet, true);
  assert.equal(m.totals.visitors, 0);
  assert.equal(m.change.visitors.before, 1);
  assert.equal(m.attention.length, 0);
});

test('deliberate actions are counted and attributed to visitors', () => {
  const m = aggregate({ rows: [
    view('a'),
    { event: 'cta_click', distinct_id: 'a', timestamp: at(1), target: 'bench_commitment', location: 'BENCH' },
    { event: 'contact_submitted', distinct_id: 'b', timestamp: at(2) },
    { event: 'reading_opened', distinct_id: 'b', timestamp: at(3), reading_brand: 'LEGO' },
  ] });
  assert.equal(m.totals.intents, 3);
  assert.equal(m.intents.find((i) => i.event === 'cta_click').visitors, 1);
  assert.deepEqual(m.readings.map((r) => r.brand), ['LEGO']);
});

test('the attention list states its reasons and drops visitors with none', () => {
  const m = aggregate({ rows: [
    view('quiet'),
    view('loud', { net_state: 'ORG_IDENTIFIED', net_org: 'WPP', org_confidence: 'HIGH' }),
  ] });
  assert.equal(m.attention.length, 1);
  assert.equal(m.attention[0].label, 'Anonymous #2');
  assert.deepEqual(m.attention[0].reasons, ['Identified organisation: WPP']);
});

test('geography is city-level and says so when it is absent', () => {
  assert.equal(placeLabel({ geo_city: 'New York', geo_region: 'NY' }), 'New York, NY');
  assert.equal(placeLabel({ geo_city: 'London', geo_country: 'GB' }), 'London, GB');
  assert.equal(placeLabel({}), null);
  const m = aggregate({ rows: [view('a')] });
  assert.deepEqual(m.places, [{ place: 'Location unknown', visitors: 1 }]);
});

test('journeys are page types in order, without repeats', () => {
  const m = aggregate({ rows: [
    view('a'),
    { ...view('a'), timestamp: at(1), path: '/bench', page_type: 'BENCH' },
    { ...view('a'), timestamp: at(2), path: '/bench', page_type: 'BENCH' },
    { ...view('a'), timestamp: at(3), path: '/contact', page_type: 'CONTACT' },
  ] });
  assert.deepEqual(m.visitors[0].journey, ['HOME', 'BENCH', 'CONTACT']);
});

test('dwell is reported in the collector\'s buckets and never as a number of seconds', () => {
  const m = aggregate({ rows: [
    { event: 'content_dwell', distinct_id: 'a', timestamp: at(1), page_type: 'HOME', dwell_bucket: 120, scroll_depth_bucket: 75 },
  ] });
  assert.equal(m.pages.length, 0); // a dwell is not a view
  assert.deepEqual(m.dwellDist, [{ bucket: 120, label: '1–2m', count: 1 }]);
});
