// Excluding Kill Dull's own browsers from Intelligence.
//
// Visiting /api/intelligence-optout?state=on in a browser sets one first-party
// cookie, kd_internal=1, on killdull.com and www.killdull.com. The collector
// refuses every event from a browser carrying it, so that browser's own visits
// never reach PostHog (the refusal is still counted, as "internal"). ?state=off
// removes it. Opening the page with no state says which state this browser is in.
//
// It is deliberately not a secret: the only thing it can do is stop the browser
// that opens it from being counted. It identifies nobody, keys on nothing about
// the person or their network, and does nothing for anyone who has not opened it.

'use strict';

var COOKIE = 'kd_internal';
var MAX_AGE = 400 * 24 * 60 * 60; // the longest lifetime browsers honour

function readCookie(req, name) {
  var raw = (req.headers && req.headers.cookie) || '';
  var m = String(raw).match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? m[1] : null;
}

function page(on, changed) {
  var title = on ? 'This browser is excluded from Kill Dull Intelligence.' : 'This browser is counted by Kill Dull Intelligence.';
  var detail = on
    ? 'Its visits to killdull.com are refused by the collector and never reach analytics. Reverse it with ?state=off.'
    : 'Its visits are treated like any visitor’s (with consent). Exclude it with ?state=on.';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex,nofollow,noarchive"><title>Intelligence · this browser</title>' +
    '<style>body{margin:0;background:#24222B;color:#fff;font:16px/1.5 system-ui,sans-serif}main{max-width:560px;margin:0 auto;padding:64px 20px}h1{font-size:22px;margin:0 0 12px}p{color:#b9b6ae}</style>' +
    '</head><body><main><h1>' + title + '</h1><p>' + detail + '</p>' + (changed ? '<p>Saved.</p>' : '') + '</main></body></html>';
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET');
    res.statusCode = 405;
    return res.end();
  }
  var url = new URL(req.url, 'https://' + (req.headers.host || 'killdull.com'));
  var state = url.searchParams.get('state');
  var host = String(req.headers.host || '').toLowerCase().split(':')[0];
  // One cookie for the apex and www together; on any other host, that host only.
  var domain = /(^|\.)killdull\.com$/.test(host) ? '; Domain=killdull.com' : '';
  var on = readCookie(req, COOKIE) === '1';
  var changed = false;
  if (state === 'on') {
    res.setHeader('Set-Cookie', COOKIE + '=1; Path=/; Max-Age=' + MAX_AGE + '; Secure; HttpOnly; SameSite=Lax' + domain);
    on = true;
    changed = true;
  } else if (state === 'off') {
    res.setHeader('Set-Cookie', COOKIE + '=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax' + domain);
    on = false;
    changed = true;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.end(page(on, changed));
};

module.exports.COOKIE = COOKIE;
