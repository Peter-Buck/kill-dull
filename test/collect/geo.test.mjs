// Geography comes from Vercel's edge headers and nothing else. These tests
// cover the rounding — which is a statement about precision, not a tidy-up —
// and the two header shapes this site has to accept.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readGeo, geoLabel, EMPTY_GEO } from '../../lib/collect/geo.mjs';

const nodeHeaders = {
  'x-vercel-ip-city': 'New%20York',
  'x-vercel-ip-country-region': 'NY',
  'x-vercel-ip-country': 'US',
  'x-vercel-ip-latitude': '40.712776',
  'x-vercel-ip-longitude': '-74.005974',
  'x-vercel-ip-timezone': 'America/New_York',
  'x-vercel-ip-postal-code': '10007',
};

test('coordinates round to two decimals — city centroid, not a doorstep', () => {
  const g = readGeo(nodeHeaders);
  assert.equal(g.geo_latitude, 40.71);
  assert.equal(g.geo_longitude, -74.01);
});

test('rounding matches the reference implementation exactly, float warts included', () => {
  // Math.round(n * 100) / 100 is NOT decimal half-up, because the multiply
  // happens in binary floating point: 1.005 * 100 is 100.49999999999999, so it
  // rounds DOWN. peter-buck.com's coord() has the same behaviour, and matching
  // it matters more than matching a tidier rule — these two sites should bucket
  // a given coordinate identically. Nothing about the privacy property depends
  // on the tie direction; it depends on there being only two decimals.
  const at = (lat) => readGeo({ 'x-vercel-ip-latitude': lat }).geo_latitude;
  assert.equal(at('1.005'), 1);      // not 1.01 — see above
  assert.equal(at('1.004'), 1);
  assert.equal(at('-1.005'), -1);
  assert.equal(at('-1.006'), -1.01);
  assert.equal(at('2.675'), 2.68);   // this one does land on .5 exactly
  assert.equal(at('0'), 0);
});

test('every coordinate keeps at most two decimals', () => {
  // The property that actually carries the privacy claim, asserted directly
  // rather than inferred from individual cases.
  const samples = ['1.005', '-1.006', '40.712776', '-74.005974', '51.5074', '0', '2.675', '-0.1278'];
  for (const v of samples) {
    const n = readGeo({ 'x-vercel-ip-latitude': v }).geo_latitude;
    const decimals = (String(n).split('.')[1] || '').length;
    assert.ok(decimals <= 2, `${v} -> ${n} kept ${decimals} decimals`);
  }
});

test('two addresses inside the same ~1.1km cell are indistinguishable', () => {
  const a = readGeo({ 'x-vercel-ip-latitude': '40.712776', 'x-vercel-ip-longitude': '-74.005974' });
  const b = readGeo({ 'x-vercel-ip-latitude': '40.714500', 'x-vercel-ip-longitude': '-74.009100' });
  assert.deepEqual(
    [a.geo_latitude, a.geo_longitude],
    [b.geo_latitude, b.geo_longitude],
  );
});

test('percent-encoded city names are decoded', () => {
  assert.equal(readGeo(nodeHeaders).geo_city, 'New York');
  assert.equal(readGeo({ 'x-vercel-ip-city': 'Z%C3%BCrich' }).geo_city, 'Zürich');
});

test('a malformed escape falls back to the raw value instead of throwing', () => {
  assert.equal(readGeo({ 'x-vercel-ip-city': 'Bad%ZZ' }).geo_city, 'Bad%ZZ');
});

test('absent headers give nulls, never throws', () => {
  assert.deepEqual(readGeo({}), EMPTY_GEO);
  assert.deepEqual(readGeo(null), EMPTY_GEO);
  assert.deepEqual(readGeo(undefined), EMPTY_GEO);
});

test('a non-numeric coordinate is null, not NaN', () => {
  assert.equal(readGeo({ 'x-vercel-ip-latitude': 'north' }).geo_latitude, null);
  assert.equal(readGeo({ 'x-vercel-ip-latitude': '' }).geo_latitude, null);
});

test('an over-long header value is refused', () => {
  assert.equal(readGeo({ 'x-vercel-ip-city': 'x'.repeat(65) }).geo_city, null);
});

test('a WHATWG Headers object works identically to Node\'s plain object', () => {
  const h = new Headers(nodeHeaders);
  assert.deepEqual(readGeo(h), readGeo(nodeHeaders));
});

test('a repeated Node header takes the first value rather than stringifying an array', () => {
  assert.equal(readGeo({ 'x-vercel-ip-country': ['US', 'GB'] }).geo_country, 'US');
});

test('no IP header is ever read by the geo path', async () => {
  // readGeo must not consult x-forwarded-for. Proxy the header bag and record
  // every key it asks for.
  const asked = [];
  const spy = new Proxy({ ...nodeHeaders }, {
    get(t, k) { if (typeof k === 'string') asked.push(k); return t[k]; },
  });
  readGeo(spy);
  assert.equal(asked.some((k) => /forwarded|real-ip|client-ip/i.test(k)), false);
});

test('geoLabel degrades honestly as detail disappears', () => {
  assert.equal(geoLabel(readGeo(nodeHeaders)), 'New York, NY');
  assert.equal(geoLabel({ geo_city: 'London', geo_region: null, geo_country: 'GB' }), 'London, GB');
  assert.equal(geoLabel({ geo_city: 'Paris', geo_region: null, geo_country: null }), 'Paris');
  assert.equal(geoLabel({ geo_city: null, geo_region: null, geo_country: 'JP' }), 'JP');
  assert.equal(geoLabel(EMPTY_GEO), null);
});
