/* Cookie consent — ported from peter-buck.com's CookieConsent component.
   Copy, behaviour and the equal Decline/Accept choice are preserved exactly;
   only the styling is adapted to the Kill Dull surface. React state becomes two
   local variables, the effect becomes a load handler, and the CSS module becomes
   an injected sheet, which is how every other script on this site works.

   PHASE 1: this file records a choice and nothing else. There is no collector,
   no cookie, no network call and no analytics anywhere in it. The stored value
   and the kd-consent-changed event are the hooks a later phase reads. */
(function () {
  'use strict';

  var STORAGE_KEY = 'kd-cookie-consent';
  var TIMESTAMP_KEY = 'kd-cookie-consent-at';
  var POLICY_HREF = '/privacy';

  /* localStorage throws in some private-browsing modes. A visitor who cannot
     store a choice is treated as not having made one: the notice shows, and
     because nothing is ever recorded, analytics stay off. Failing closed. */
  function read() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
      localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());
    } catch (e) { /* unstorable: the choice applies to this page only */ }
    /* Renamed from peter-buck.com's pb-consent-changed so the event sits in the
       same kd- namespace as the keys above. Nothing listens to it yet. */
    window.dispatchEvent(new Event('kd-consent-changed'));
  }

  var STYLE =
    '.kd-consent{position:fixed;inset-inline:0;bottom:0;z-index:100;' +
      'background:var(--ink);border-top:1px solid var(--border);' +
      'padding:clamp(16px,2.5vw,24px) clamp(20px,4vw,64px);' +
      'display:flex;flex-wrap:wrap;align-items:center;gap:clamp(12px,2vw,20px);' +
      'animation:kd-consent-in .5s cubic-bezier(.2,.8,.2,1) both}' +
    '@keyframes kd-consent-in{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
    '.kd-consent-copy{font-family:"Space Grotesk",sans-serif;font-size:14px;line-height:1.6;' +
      'color:var(--text-body);max-width:70ch;flex:1 1 300px;margin:0}' +
    '.kd-consent-buttons{display:flex;gap:12px;flex-shrink:0}' +
    '.kd-consent-decline,.kd-consent-accept{font-family:"Space Grotesk",sans-serif;font-size:13px;' +
      'line-height:1.5;padding:10px 20px;border-radius:0;cursor:pointer;' +
      'transition:opacity .18s ease,border-color .18s ease}' +
    '.kd-consent-decline{background:transparent;border:1px solid var(--border);color:var(--paper)}' +
    '.kd-consent-decline:hover{border-color:var(--paper)}' +
    '.kd-consent-accept{background:var(--paper);border:1px solid var(--paper);color:var(--ink)}' +
    '.kd-consent-accept:hover{opacity:.85}' +
    '.kd-consent-decline:focus-visible,.kd-consent-accept:focus-visible{outline:2px solid var(--yellow);outline-offset:2px}' +
    '.kd-consent-link{color:inherit;text-decoration:underline;text-underline-offset:2px;transition:color .18s ease}' +
    '.kd-consent-link:hover{color:var(--paper)}' +
    /* The footer is cream here, not ink, so the reopen control is set in the
       colophon's own mono face and colour rather than borrowed from the banner. */
    '.kd-consent-settings{font:inherit;color:inherit;letter-spacing:inherit;background:none;border:0;padding:0;' +
      'cursor:pointer;text-decoration:underline;text-underline-offset:2px;transition:color .18s ease}' +
    '.kd-consent-settings:hover{color:var(--ink)}' +
    '.kd-consent-settings:focus-visible{outline:2px solid var(--yellow);outline-offset:2px}' +
    '@media(prefers-reduced-motion:reduce){.kd-consent{animation:none}' +
      '.kd-consent-decline,.kd-consent-accept,.kd-consent-settings{transition:none}}';

  function injectStyle() {
    if (document.getElementById('kd-consent-style')) return;
    var s = document.createElement('style');
    s.id = 'kd-consent-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  var banner = null;
  var declineBtn = null;
  var acceptBtn = null;

  function build() {
    if (banner) return banner;
    banner = document.createElement('section');
    banner.className = 'kd-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p class="kd-consent-copy">This site uses cookies for analytics, to understand how it&#8217;s used. ' +
      'Analytics stay off unless you accept. ' +
      '<a class="kd-consent-link" href="' + POLICY_HREF + '">Privacy &amp; Cookie Policy</a>.</p>' +
      '<div class="kd-consent-buttons">' +
        '<button type="button" class="kd-consent-decline">Decline all</button>' +
        '<button type="button" class="kd-consent-accept">Accept all</button>' +
      '</div>';
    declineBtn = banner.querySelector('.kd-consent-decline');
    acceptBtn = banner.querySelector('.kd-consent-accept');
    declineBtn.addEventListener('click', function () { choose('denied'); });
    acceptBtn.addEventListener('click', function () { choose('granted'); });
    return banner;
  }

  function reflect(choice) {
    if (!declineBtn) return;
    declineBtn.setAttribute('aria-pressed', String(choice === 'denied'));
    acceptBtn.setAttribute('aria-pressed', String(choice === 'granted'));
  }

  function show(choice) {
    injectStyle();
    build();
    reflect(choice);
    if (!banner.isConnected) document.body.appendChild(banner);
    /* Same 50ms as the source: the banner has to be in the tree and painted
       before focus lands, and Decline is deliberately the one that receives it. */
    setTimeout(function () { if (declineBtn) declineBtn.focus(); }, 50);
  }

  function hide() {
    if (banner && banner.isConnected) banner.remove();
  }

  function choose(choice) {
    saveChoice(choice);
    reflect(choice);
    hide();
  }

  /* The footer is rebuilt by kd.js on every load, so the reopen control is
     wired by delegation rather than by holding a reference to one button. */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('.kd-consent-settings')) {
      e.preventDefault();
      show(read());
    }
  });

  function start() {
    /* No stored choice -> show the notice. A stored choice, either way, is
       respected in silence: the visitor is never asked twice. */
    if (!read()) show(null);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
