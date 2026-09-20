// An unset secret must never be the thing that publishes visitor data.

import test from 'node:test';
import assert from 'node:assert/strict';
import { gate, COOKIE } from '../../lib/intel/gate.mjs';

const u = (qs = '') => new URL(`https://killdull.com/intelligence${qs}`);
const SECRET = 'correct-horse-battery-staple';

test('the right key opens it and sets a cookie so the secret leaves the url', () => {
  const r = gate(u('?k=' + SECRET), {}, { DASHBOARD_AUTH_SECRET: SECRET });
  assert.equal(r.ok, true);
  assert.match(r.setCookie, new RegExp(`^${COOKIE}=`));
  assert.match(r.setCookie, /HttpOnly/);
  assert.match(r.setCookie, /Secure/);
  assert.match(r.setCookie, /SameSite=Lax/);
});

test('the cookie alone is enough on later requests', () => {
  const r = gate(u(), { cookie: `${COOKIE}=${encodeURIComponent(SECRET)}` }, { DASHBOARD_AUTH_SECRET: SECRET });
  assert.equal(r.ok, true);
  assert.equal(r.setCookie, undefined);
});

test('no key, a wrong key, and a wrong-length key are all 401', () => {
  const env = { DASHBOARD_AUTH_SECRET: SECRET };
  for (const url of [u(), u('?k=nope'), u('?k=' + SECRET + 'x'), u('?k=')]) {
    const r = gate(url, {}, env);
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
  }
});

test('an unconfigured secret fails closed, and says so distinctly', () => {
  const r = gate(u('?k=anything'), {}, {});
  assert.equal(r.ok, false);
  assert.equal(r.status, 503);
  assert.equal(r.reason, 'not_configured');
});

test('a cookie for a different name does not open it', () => {
  const r = gate(u(), { cookie: `kd_did=${SECRET}` }, { DASHBOARD_AUTH_SECRET: SECRET });
  assert.equal(r.ok, false);
});
