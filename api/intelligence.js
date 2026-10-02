// killdull.com/intelligence — a machine endpoint and a signpost.
//
// BUREAU's server reads Intelligence here — identified by the OIDC token Vercel
// signs for BUREAU's production deployment — and gets the
// model as JSON. Everyone else — a browser, an old bookmark, a link from an old
// email — is redirected to BUREAU, where people sign in with Google and read
// the same model. There is no human login on this host any more: no ?k=, no
// cookie, no secret in any link. Nothing here is public.
//
// Same handler shape as api/collect.js: a CommonJS function with no
// dependencies and no build step, loading the ESM modules through one
// memoised dynamic import with literal specifiers so the file tracer follows them.

'use strict';

var modulesPromise = null;
function modules() {
  if (!modulesPromise) {
    modulesPromise = Promise.all([
      import('../lib/intel/access.mjs'),
      import('../lib/intel/briefing.mjs')
    ]).then(function (m) {
      return { access: m[0], build: m[1].build };
    });
  }
  return modulesPromise;
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // A briefing is private and perishable. Nothing caches it, anywhere.
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.end(JSON.stringify(payload, null, 2));
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.end();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  var mods = await modules();
  var url = new URL(req.url, 'https://killdull.com');
  var now = new Date();
  var win = mods.access.windowOf(url.searchParams, now);
  var who = await mods.access.machine(req.headers);

  // Anyone who is not BUREAU's production server is a person or a stranger:
  // send them to BUREAU. Only the window travels; any other parameter, an old
  // ?k= included, is dropped rather than forwarded.
  if (who !== 'ok') {
    var asked = url.searchParams.has('hours') || url.searchParams.has('end');
    return redirect(res, mods.access.bureauURL(asked ? win : null));
  }

  if (!win) return json(res, 400, { ok: false, error: 'bad_window' });

  var result = await mods.build({ hours: win.hours, now: win.end || now });
  if (!result.ok) {
    return json(res, 503, { ok: false, error: result.reason, window: result.window ? {
      hours: result.window.hours, start: result.window.start, end: result.window.end, label: result.window.label
    } : null });
  }
  return json(res, 200, result.model);
};
