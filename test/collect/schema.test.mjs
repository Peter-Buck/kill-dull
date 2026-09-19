// The sanitizer is the only thing standing between a browser and PostHog.
// These tests hold the allow-list closed: anything not named is dropped, and
// the drop is by key, type and length, not by inspecting the value's meaning.

import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, sanitizeProps } from '../../lib/collect/schema.mjs';

test('the event list describes only what Kill Dull actually does', () => {
  assert.deepEqual([...EVENTS].sort(), [
    'api_error', 'contact_submitted', 'content_dwell', 'content_view',
    'cta_click', 'email_click', 'linkedin_click', 'not_found_404',
    'outbound_click', 'reading_opened',
  ]);
});

test('no event ported from peter-buck.com describes absent functionality', () => {
  const absent = [
    'resume_download', 'interrogate_started', 'interrogate_completed',
    'interrogate_viewed', 'principle_viewed', 'report_exported',
    'assistant_open', 'assistant_theme', 'assistant_followup',
    'verdict_cast', 'linkedin_carousel_created', 'social_carousel_downloaded',
    'web_vitals', 'upload_failed', 'transcription_failed',
  ];
  for (const e of absent) assert.equal(EVENTS.has(e), false, `${e} must not exist here`);
});

test('an allowed scalar survives unchanged', () => {
  const out = sanitizeProps({ path: '/readings', page_type: 'READINGS', dwell_bucket: 30 });
  assert.deepEqual(out, { path: '/readings', page_type: 'READINGS', dwell_bucket: 30 });
});

test('an unlisted key is dropped however innocent it looks', () => {
  const out = sanitizeProps({ path: '/contact', email: 'someone@example.com', name: 'Peter' });
  assert.deepEqual(out, { path: '/contact' });
});

test('contact form field names are not allow-listed', () => {
  // The form posts first/last/company/email/subject/message to /api/contact.
  // None of them is analytics data, and none may pass even if a caller
  // mistakenly spreads the form body into an event.
  const formish = {
    first: 'Peter', last: 'Buck', company: 'Kill Dull',
    email: 'human@killdull.com', subject: 'A commitment', message: 'Long text here',
    about: 'Press', company_url: 'x', started: '1',
  };
  assert.deepEqual(sanitizeProps(formish), {});
});

test('null and undefined are dropped rather than stored as empty', () => {
  assert.deepEqual(sanitizeProps({ path: null, page_type: undefined, target: 'x' }), { target: 'x' });
});

test('a string over 64 characters is dropped, not truncated', () => {
  const long = 'x'.repeat(65);
  assert.deepEqual(sanitizeProps({ path: long }), {});
  assert.deepEqual(sanitizeProps({ path: 'x'.repeat(64) }), { path: 'x'.repeat(64) });
});

test('non-scalars are dropped — no nested objects, arrays or functions', () => {
  const out = sanitizeProps({
    path: '/', target: { nested: true }, location: ['a'], reason: () => {}, code: 404,
  });
  assert.deepEqual(out, { path: '/', code: 404 });
});

test('booleans and numbers are allowed types', () => {
  assert.deepEqual(sanitizeProps({ status: true, code: 0 }), { status: true, code: 0 });
});

test('geo and network keys cannot be claimed by the browser', () => {
  // Server-derived values are merged AFTER sanitizing, in the route. If a
  // client sends them they must not survive this step, or a visitor could
  // assert a location or an employer they do not have.
  const spoofed = {
    geo_city: 'London', geo_country: 'GB', geo_latitude: 51.5,
    net_state: 'ORG_IDENTIFIED', net_org: 'Nike', org_name: 'Nike', org_confidence: 'HIGH',
  };
  assert.deepEqual(sanitizeProps(spoofed), {});
});

test('PostHog control properties cannot be injected', () => {
  assert.deepEqual(sanitizeProps({ $ip: '1.2.3.4', $geoip_disable: false, distinct_id: 'x' }), {});
});

test('no arguments at all is an empty object, not a throw', () => {
  assert.deepEqual(sanitizeProps(), {});
});
