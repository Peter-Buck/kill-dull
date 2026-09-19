/* Kill Dull collector.

   Ported from peter-buck.com's collector component. React state becomes local
   variables and the route-change effect becomes a page load, because this site
   is static HTML rather than a single-page app — every navigation is a real
   unload, so a page records itself once when it opens and once when it leaves.

   What it does NOT do is the point of it. There is no third-party script, no
   autocapture, no session replay, no heatmap and no form listener. It never
   reads the value of an input. It sends nine named events and nothing else,
   and it is completely silent until someone has pressed Accept.

   Everything here is gated on kd-cookie-consent === 'granted'. Before that,
   this file adds listeners and sends nothing. There is no cookie, no id and no
   request until consent exists, and withdrawing it clears both. */
(function () {
  'use strict';

  var CONSENT_KEY = 'kd-cookie-consent';
  var DID_KEY = 'kd_did';
  var SRC_KEY = 'kd_src';
  var ENDPOINT = '/api/collect';

  function granted() {
    try { return localStorage.getItem(CONSENT_KEY) === 'granted'; } catch (e) { return false; }
  }

  /* The visitor id. Minted on first use AFTER consent and never before — the
     cookie's existence is itself a record, so it must not precede the answer.
     The server checks the submitted id against this cookie, which is what makes
     clearing it on withdrawal effective rather than decorative. */
  function did() {
    if (!granted()) return null;
    var m = document.cookie.match(/(?:^|;\s*)kd_did=([^;]+)/);
    if (m) return m[1];
    var id = (window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : String(Math.random()).slice(2) + String(Date.now());
    document.cookie = DID_KEY + '=' + id + '; Path=/; Max-Age=' + (60 * 60 * 24 * 365) +
      '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    return id;
  }

  function clearDid() {
    document.cookie = DID_KEY + '=; Path=/; Max-Age=0; SameSite=Lax';
  }

  /* How this visit arrived, resolved once and reused for the rest of the
     session. Only the referrer's hostname is kept — never the path someone came
     from, which can carry a search term or a private URL. */
  function sessionSource() {
    try {
      var cached = sessionStorage.getItem(SRC_KEY);
      if (cached) return JSON.parse(cached);
      var u = new URLSearchParams(location.search);
      var ref = '';
      try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { /* ignore */ }
      var src = {};
      if (ref && ref !== location.hostname) src.referrer_domain = ref;
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
        var v = u.get(k);
        if (v) src[k] = v;
      });
      sessionStorage.setItem(SRC_KEY, JSON.stringify(src));
      return src;
    } catch (e) { return {}; }
  }

  /* sendBeacon first, because it survives the page going away. Safari returns
     false when it cannot queue one, and throws in a few older versions, so a
     keepalive fetch stands behind it in both cases. */
  function send(payload) {
    var blobbed = false;
    try {
      if (navigator.sendBeacon) {
        blobbed = navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
      }
    } catch (e) { blobbed = false; }
    if (blobbed) return 'beacon';
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        body: payload,
        keepalive: true,
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' }
      })['catch'](function () { /* an analytics event is never worth an error */ });
    } catch (e) { /* ignore */ }
    return 'fetch';
  }

  function track(event, props) {
    if (!granted()) return;
    var id = did();
    if (!id) return;
    send(JSON.stringify({
      event: event,
      props: props || {},
      distinctId: id,
      consent: true,
      ctx: sessionSource()
    }));
  }

  /* Kill Dull's routes. /bureau reports as COMPANY, which is what the page is
     called now; the path is unchanged because renaming it would break links. */
  function pageType(path) {
    var p = (path || '/').replace(/\.html$/, '');
    if (p === '/' || p === '') return 'HOME';
    if (p.indexOf('/discipline') === 0) return 'DISCIPLINE';
    if (p.indexOf('/bench') === 0) return 'BENCH';
    if (p.indexOf('/readings') === 0) return 'READINGS';
    if (p.indexOf('/bureau') === 0) return 'COMPANY';
    if (p.indexOf('/contact') === 0) return 'CONTACT';
    if (p.indexOf('/privacy') === 0 || p.indexOf('/terms') === 0 || p.indexOf('/accessibility') === 0) return 'LEGAL';
    return 'OTHER';
  }

  function bucket(n, edges) {
    for (var i = 0; i < edges.length; i++) if (n <= edges[i]) return edges[i];
    return edges[edges.length - 1];
  }

  var enteredAt = Date.now();
  var maxScroll = 0;
  var viewed = false;
  var dwellSentThisHide = false;

  function emitView() {
    if (!granted() || viewed) return;
    viewed = true;
    track('content_view', { path: location.pathname, page_type: pageType(location.pathname) });
  }

  /* Time and depth are recorded as buckets, never as raw seconds or pixels.
     "Between one and two minutes, past halfway" is what is useful; anything
     finer describes a person rather than a page. */
  function emitDwell() {
    if (!granted()) return;
    var seconds = Math.round((Date.now() - enteredAt) / 1000);
    track('content_dwell', {
      path: location.pathname,
      page_type: pageType(location.pathname),
      dwell_bucket: bucket(seconds, [5, 15, 30, 60, 120, 300, 100000]),
      scroll_depth_bucket: bucket(maxScroll, [25, 50, 75, 100])
    });
  }

  function onScroll() {
    var h = document.documentElement;
    var pct = Math.min(100, Math.round(((h.scrollTop + h.clientHeight) / (h.scrollHeight || 1)) * 100));
    if (pct > maxScroll) maxScroll = pct;
  }

  /* One dwell per departure. visibilitychange covers navigation and tab
     switching; pagehide covers the browsers that skip it on unload. Both firing
     for one departure must not send twice, so the flag clears only when the
     page becomes visible again. */
  function leaving() {
    if (dwellSentThisHide) return;
    dwellSentThisHide = true;
    emitDwell();
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') leaving();
    else dwellSentThisHide = false;
  }

  /* The five deliberate destinations this site actually offers. Matched on the
     href, in the capture phase, so a click on something inside the link still
     resolves to the link. No other click is looked at. */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var a = t.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var where = pageType(location.pathname);

    if (href.indexOf('mailto:') === 0) {
      if (/subject=/i.test(href) && /bench/i.test(href)) {
        track('cta_click', { target: 'bench_commitment', location: where });
      } else {
        track('email_click', { target: 'email', location: where });
      }
      return;
    }
    if (/linkedin\.com\//i.test(href)) {
      track('linkedin_click', { location: where });
      return;
    }
    if (/^https?:\/\//i.test(href)) {
      var host;
      try { host = new URL(href).hostname; } catch (err) { return; }
      if (host === location.hostname) return;         // an absolute self-link is not outbound
      track('outbound_click', { target: host.slice(0, 64), location: where });
    }
  }

  /* A Published Reading opens by gaining .is-active — kd.js sets it on a
     deliberate tap, click or Enter/Space, and never on the desktop hover
     preview. Watching the class is therefore the honest signal: it records
     "this was opened", not "a cursor passed over it". */
  function watchReadings() {
    if (!window.MutationObserver) return;
    var cards = document.querySelectorAll('.record-card');
    if (!cards.length) return;
    var observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var card = records[i].target;
        if (!card.classList || !card.classList.contains('is-active')) continue;
        if (card.__kdOpened) continue;               // once per card per page
        card.__kdOpened = true;
        var brand = card.querySelector('.record-brand');
        var props = { location: pageType(location.pathname) };
        if (brand && brand.textContent) props.reading_brand = brand.textContent.trim().slice(0, 64);
        track('reading_opened', props);
      }
    });
    for (var i = 0; i < cards.length; i++) {
      observer.observe(cards[i], { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* The contact form. Only that it was submitted, and whether the server
     accepted it — never a single character of what was typed into it. */
  function watchContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function () {
      track('contact_submitted', { location: pageType(location.pathname) });
    });
  }

  function emitNotFound() {
    // The 404 page is served for an unmatched path; record that it happened,
    // and the path that produced it, which is the only way to find broken links.
    if (!document.body || document.body.getAttribute('data-page') === '404' ||
        /(^|\/)404(\.html)?$/.test(location.pathname)) {
      track('not_found_404', { path: location.pathname.slice(0, 64) });
    }
  }

  /* Consent changing is the only thing that turns this file on or off.
     Granting starts the page properly, including the view it could not send
     when the page loaded. Withdrawing clears the id and the acquisition cache
     immediately — the next request would fail the server's cookie check
     anyway, but nothing should be left sitting in the browser either. */
  function onConsentChanged() {
    if (granted()) {
      start();
    } else {
      clearDid();
      try { sessionStorage.removeItem(SRC_KEY); } catch (e) { /* ignore */ }
      viewed = false;
    }
  }

  var started = false;
  function start() {
    if (!granted() || started) return;
    started = true;
    enteredAt = Date.now();
    emitView();
    watchReadings();
    watchContactForm();
    if (/(^|\/)404(\.html)?$/.test(location.pathname)) emitNotFound();
  }

  // Listeners are attached unconditionally; every one of them checks consent
  // before doing anything, so an un-consented visit installs handlers that
  // return immediately and send nothing.
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', leaving);
  document.addEventListener('click', onClick, true);
  window.addEventListener('kd-consent-changed', onConsentChanged);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
