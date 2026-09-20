// The page and the email are the same briefing. These tests hold that, and hold
// the two things a rendered briefing must never do: assert more than the model
// said, or execute something a third party put in a field.

import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregate } from '../../lib/intel/aggregate.mjs';
import { briefingBody, emailHTML, pageHTML, briefingText, subjectFor } from '../../lib/intel/render.mjs';

const win = { label: 'Sat 19 Sept, 08:00 → Sun 20 Sept, 08:00 Pacific', priorLabel: 'Fri 18 Sept, 08:00 → Sat 19 Sept, 08:00 Pacific' };
const rows = [
  { event: 'content_view', distinct_id: 'a', timestamp: '2026-09-20 10:00:00', path: '/', page_type: 'HOME',
    geo_city: 'New York', geo_region: 'NY', geo_country: 'US',
    net_state: 'ORG_IDENTIFIED', net_org: 'WPP', net_name: 'WPP plc', org_confidence: 'HIGH' },
  { event: 'cta_click', distinct_id: 'a', timestamp: '2026-09-20 10:04:00', target: 'bench_commitment',
    net_state: 'ORG_IDENTIFIED', net_org: 'WPP', org_confidence: 'HIGH' },
];
const model = aggregate({ rows, priorRows: [], window: win });
const quiet = aggregate({ rows: [], priorRows: [], window: win });

test('the email and the page carry the identical briefing body', () => {
  const body = briefingBody(model);
  assert.ok(emailHTML(model).includes(body));
  assert.ok(pageHTML(model).includes(body));
});

test('the email is self-contained — no stylesheet, no script, no remote asset', () => {
  const html = emailHTML(model);
  assert.equal(/<script/i.test(html), false);
  assert.equal(/<link /i.test(html), false);
  assert.equal(/ src=/i.test(html), false);
});

test('a hostile company name is escaped, not executed', () => {
  const nasty = aggregate({ rows: [{
    event: 'content_view', distinct_id: 'x', timestamp: '2026-09-20 10:00:00', page_type: 'HOME',
    net_state: 'ORG_IDENTIFIED', org_confidence: 'HIGH',
    net_org: '<script>alert(1)</script>', geo_city: '"><img onerror=1>',
  }], window: win });
  const html = emailHTML(nasty) + pageHTML(nasty);
  assert.equal(html.includes('<script>alert(1)</script>'), false);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.equal(html.includes('<img onerror=1>'), false);
});

test('the page is marked not to be indexed', () => {
  assert.match(pageHTML(model), /<meta name="robots" content="noindex,nofollow,noarchive">/);
});

test('a quiet window still renders a briefing, and explains the silence', () => {
  const html = emailHTML(quiet);
  assert.match(html, /No events were recorded in this window/);
  assert.match(html, /declined consent/);
  assert.match(briefingText(quiet), /No events were recorded/);
  assert.equal(subjectFor(quiet), 'Kill Dull Intelligence — no recorded activity');
});

test('the subject states the finding', () => {
  assert.match(subjectFor(model), /^Kill Dull Intelligence — WPP, 1 visitor$/);
});

test('an unconfirmed company never reaches a subject line', () => {
  const m = aggregate({ rows: [{ event: 'content_view', distinct_id: 'x', timestamp: '2026-09-20 10:00:00',
    page_type: 'HOME', net_state: 'ORG_POSSIBLE', net_org: 'Acme Media', org_confidence: 'NONE' }], window: win });
  assert.equal(subjectFor(m).includes('Acme Media'), false);
  // but it is still reported, with its hedge attached
  assert.match(emailHTML(m), /ORG POSSIBLE/);
});

test('the footer states what the briefing is not', () => {
  for (const out of [emailHTML(model), pageHTML(model), briefingText(model)]) {
    assert.match(out, /No third-party tracker/);
    assert.match(out, /No IP address is stored/);
  }
});

test('nothing rendered contains an ip address or a distinct id', () => {
  const out = emailHTML(model) + pageHTML(model) + briefingText(model);
  assert.equal(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(out), false);
  assert.equal(out.includes('distinct_id'), false);
});

test('the plain text twin carries the same hedges as the html', () => {
  const m = aggregate({ rows: [{ event: 'content_view', distinct_id: 'x', timestamp: '2026-09-20 10:00:00',
    page_type: 'HOME', net_state: 'ORG_POSSIBLE', net_org: 'Acme Media', org_confidence: 'NONE' }], window: win });
  assert.match(briefingText(m), /POSSIBLE ONLY \(leads, not facts\)/);
});
