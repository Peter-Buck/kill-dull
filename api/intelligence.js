// The private Intelligence page.
//
// Same handler shape as api/collect.js and api/contact.js: a CommonJS function
// with no dependencies and no build step, loading the pure ESM modules through
// one memoised dynamic import with literal specifiers so the file tracer can
// follow them.
//
// It reads Kill Dull's own PostHog project and renders the briefing. It is a
// reporting surface only: it writes nothing, it does not touch collection, and
// it never sees an IP address, because collection never stored one.

'use strict';

var modulesPromise = null;
function modules() {
  if (!modulesPromise) {
    modulesPromise = Promise.all([
      import('../lib/intel/gate.mjs'),
      import('../lib/intel/briefing.mjs'),
      import('../lib/intel/render.mjs')
    ]).then(function (m) {
      return { gate: m[0].gate, build: m[1].build, pageHTML: m[2].pageHTML };
    });
  }
  return modulesPromise;
}

// The three windows worth having. Anything else is rejected rather than
// clamped, so a mistyped url cannot quietly answer a different question.
var RANGES = [
  { hours: 24, label: '24 hours' },
  { hours: 72, label: '3 days' },
  { hours: 168, label: '7 days' }
];

function html(res, status, body, extraHeaders) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // A briefing is private and perishable. Nothing caches it, anywhere.
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (extraHeaders && extraHeaders.setCookie) res.setHeader('Set-Cookie', extraHeaders.setCookie);
  res.end(body);
}

function plain(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.end(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET');
    return plain(res, 405, 'Method not allowed.');
  }

  var mods = await modules();
  var url = new URL(req.url, 'https://' + (req.headers['host'] || 'killdull.com'));

  var pass = mods.gate(url, req.headers);
  if (!pass.ok) {
    // 401 and 503 are told apart deliberately: an unconfigured secret is an
    // operational fault, and reporting it as "wrong key" would hide it. Neither
    // answer reveals anything about the secret itself.
    return plain(res, pass.status, pass.reason === 'not_configured'
      ? 'Intelligence is not configured.'
      : 'Not authorised.');
  }

  var hours = parseInt(url.searchParams.get('hours') || '24', 10);
  if (!RANGES.some(function (r) { return r.hours === hours; })) hours = 24;

  var result = await mods.build({ hours: hours });
  if (!result.ok) {
    return plain(res, 503, 'Intelligence could not be built: ' + result.reason + '\n' +
      'Window: ' + (result.window && result.window.label ? result.window.label : 'unknown'));
  }

  // The model, for verifying the data rather than the layout. Gated by the same
  // secret as the page, and built from the same call, so it cannot disagree
  // with what the page shows.
  if (url.searchParams.get('format') === 'json') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, private');
    if (pass.setCookie) res.setHeader('Set-Cookie', pass.setCookie);
    return res.end(JSON.stringify(result.model, null, 2));
  }

  var key = url.searchParams.get('k');
  var ranges = RANGES.map(function (r) {
    return {
      // The secret stays out of the nav once the cookie exists; it is only
      // carried forward on the first visit, which is the one that set it.
      href: '/intelligence?hours=' + r.hours + (key ? '&k=' + encodeURIComponent(key) : ''),
      label: r.label,
      current: r.hours === hours
    };
  });

  var note = (result.model.degraded && result.model.degraded.length)
    ? 'Partial read: ' + result.model.degraded.join('; ') + '.'
    : '';

  return html(res, 200, mods.pageHTML(result.model, { ranges: ranges, note: note }), pass);
};
