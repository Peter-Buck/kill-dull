// The classifier decides what a set of network facts is ALLOWED to claim.
// These tests exist to hold the precedence order still: every branch that runs
// before the org claim is a reason not to name a company, so if one of them
// stops firing, a VPN or a datacenter starts being reported as an employer.

import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, orgLabel } from '../../lib/collect/classify.mjs';

test('no facts at all is UNKNOWN, not a guess', () => {
  for (const input of [null, undefined, {}]) {
    const s = classify(input);
    assert.equal(s.net_state, 'UNKNOWN');
    assert.equal(s.net_org, null);
  }
});

test('a relay is a relay even when the company field names Apple', () => {
  // Apple's own corporate network IS a real employer, so the relay branch must
  // be reached by the relay flag — not by the name — or a genuine Apple
  // employee gets suppressed.
  const s = classify({ isRelay: true, companyName: 'iCloud Private Relay', isp: 'Apple Inc.' });
  assert.equal(s.net_state, 'PRIVATE_RELAY');
  assert.equal(s.net_name, 'Apple Private Relay');
  assert.equal(s.net_org, null);
});

test('a non-Apple relay is not labelled as Apple', () => {
  const s = classify({ isRelay: true, isp: 'Cloudflare WARP' });
  assert.equal(s.net_state, 'PRIVATE_RELAY');
  assert.notEqual(s.net_name, 'Apple Private Relay');
});

test('Apple corporate is NOT swallowed by the relay branch', () => {
  const s = classify({
    companyName: 'Apple Inc.', companyType: 'business',
    connectionType: 'business', isp: 'Apple Inc.',
  });
  assert.equal(s.net_state, 'ORG_IDENTIFIED');
  assert.equal(s.net_org, 'Apple Inc.');
});

test('precedence: relay beats VPN beats hosting beats mobile', () => {
  const all = { isRelay: true, isVpn: true, isHosting: true, carrier: 'T-Mobile' };
  assert.equal(classify(all).net_state, 'PRIVATE_RELAY');

  const { isRelay, ...noRelay } = all;
  assert.equal(classify(noRelay).net_state, 'VPN_PROXY');

  const { isVpn, ...noVpn } = noRelay;
  assert.equal(classify(noVpn).net_state, 'DATACENTER');

  const { isHosting, ...noHosting } = noVpn;
  assert.equal(classify(noHosting).net_state, 'MOBILE');
});

test('Tor is VPN_PROXY and never names an org', () => {
  const s = classify({ isTor: true, companyName: 'Some Co', companyType: 'business' });
  assert.equal(s.net_state, 'VPN_PROXY');
  assert.equal(s.net_org, null);
});

test('a datacenter is never an employer, even with a corporate company type', () => {
  const s = classify({
    companyName: 'Amazon Technologies', companyType: 'business',
    connectionType: 'hosting', isHosting: true,
  });
  assert.equal(s.net_state, 'DATACENTER');
  assert.equal(s.net_org, null);
});

test('ORG_IDENTIFIED requires corroboration from the network type', () => {
  const corroborated = classify({
    companyName: 'Burberry Group plc', companyType: 'business', connectionType: 'business',
  });
  assert.equal(corroborated.net_state, 'ORG_IDENTIFIED');
  assert.equal(corroborated.net_org, 'Burberry Group plc');

  // A company name with no supporting network type is a lead, not a fact.
  const bare = classify({ companyName: 'Burberry Group plc' });
  assert.equal(bare.net_state, 'ORG_POSSIBLE');
  assert.equal(bare.net_org, 'Burberry Group plc');
});

test('education and government also earn ORG_IDENTIFIED', () => {
  for (const t of ['education', 'government']) {
    const s = classify({ companyName: 'Example Institution', companyType: t, connectionType: t });
    assert.equal(s.net_state, 'ORG_IDENTIFIED', `${t} should identify`);
  }
});

test('a consumer ISP in the company field is never an employer', () => {
  // The governing case: "Verizon Fios · ORG UNKNOWN". A network operator that
  // happens to occupy the company field must not be read as a workplace.
  const s = classify({
    companyName: 'Comcast Cable Communications', companyType: 'business',
    connectionType: 'business', isp: 'Comcast',
  });
  assert.equal(s.net_state, 'RESIDENTIAL');
  assert.equal(s.net_org, null);
});

test('net_name always describes the pipe and is safe to show', () => {
  const s = classify({ isp: 'Verizon Fios', asn: 701 });
  assert.equal(s.net_name, 'Verizon Fios');
  assert.equal(s.net_asn, 701);
  assert.equal(s.net_org, null);
});

test('a non-finite ASN becomes null rather than NaN', () => {
  assert.equal(classify({ asn: Number.NaN, isp: 'X' }).net_asn, null);
  assert.equal(classify({ asn: 'not a number', isp: 'X' }).net_asn, null);
});

test('facts present but supporting nothing stay UNKNOWN', () => {
  const s = classify({ asn: 64500, asName: 'Some Unlisted Network' });
  assert.equal(s.net_state, 'UNKNOWN');
  assert.equal(s.net_org, null);
});

test('orgLabel states ignorance explicitly in every uncertain state', () => {
  const cases = [
    ['PRIVATE_RELAY', { net_name: 'Apple Private Relay' }],
    ['VPN_PROXY', { net_name: 'NordVPN' }],
    ['DATACENTER', { net_name: 'AWS' }],
    ['MOBILE', { net_name: 'T-Mobile' }],
    ['RESIDENTIAL', { net_name: 'Comcast' }],
    ['UNKNOWN', {}],
  ];
  for (const [net_state, rest] of cases) {
    assert.match(orgLabel({ net_state, ...rest }), /ORG UNKNOWN/, `${net_state} must say ORG UNKNOWN`);
  }
});

test('orgLabel hedges ORG_POSSIBLE and only ORG_IDENTIFIED stands unhedged', () => {
  assert.equal(orgLabel({ net_state: 'ORG_POSSIBLE', net_org: 'Acme' }), 'Acme · ORG POSSIBLE');
  assert.equal(orgLabel({ net_state: 'ORG_IDENTIFIED', net_org: 'Acme' }), 'Acme');
});

test('the classifier never invents a person', () => {
  // Nothing it returns may describe an individual. The shape is fixed to six
  // network-level keys, and this asserts no seventh appears.
  const s = classify({ companyName: 'Acme', companyType: 'business', connectionType: 'business' });
  assert.deepEqual(
    Object.keys(s).sort(),
    ['net_asn', 'net_domain', 'net_name', 'net_org', 'net_state', 'net_type'],
  );
});
