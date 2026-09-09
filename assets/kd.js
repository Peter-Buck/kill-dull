/* =========================================================================
   KILL DULL — shared behaviour
   ========================================================================= */
(function () {
  'use strict';

  function fitToWidth(el, horizontalPad) {
    if (!el) return;
    el.style.whiteSpace = 'nowrap';
    el.style.fontSize = '500px';
    var ratio = (window.innerWidth - horizontalPad) / el.scrollWidth;
    el.style.fontSize = Math.max(10, Math.floor(ratio * 500)) + 'px';
  }

  function fitAll() {
    var pad = window.innerWidth < 768 ? 48 : window.innerWidth < 1280 ? 128 : 240;
    var targets = document.querySelectorAll('.js-fit');
    for (var i = 0; i < targets.length; i++) fitToWidth(targets[i], pad);
  }

  function setDate() {
    var months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    var now = new Date();
    var el = document.getElementById('masthead-date');
    if (el) el.textContent = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
  }

  function getOffset() {
    var mh = document.getElementById('masthead');
    var reg = document.getElementById('registrar');
    return (mh ? mh.offsetHeight : 0) + (reg ? reg.offsetHeight : 0);
  }

  function positionRegistrar() {
    var mh = document.getElementById('masthead');
    var reg = document.getElementById('registrar');
    if (reg) reg.style.top = (mh ? mh.offsetHeight : 0) + 'px';
  }

  function setBodyOffset() {
    var main = document.querySelector('main');
    if (main) main.style.paddingTop = getOffset() + 'px';
  }

  var lastScrollY = window.scrollY || 0;
  var headerHidden = false;

  function setHeaderHidden(hidden) {
    if (hidden === headerHidden) return;
    var mh = document.getElementById('masthead');
    var reg = document.getElementById('registrar');
    if (!mh && !reg) return;
    headerHidden = hidden;
    if (mh) mh.style.transform = hidden ? 'translateY(-' + mh.offsetHeight + 'px)' : 'translateY(0)';
    if (reg) reg.style.transform = hidden ? 'translateY(-' + ((mh ? mh.offsetHeight : 0) + reg.offsetHeight) + 'px)' : 'translateY(0)';
  }

  function updateHeaderVisibility() {
    var y = window.scrollY || 0;
    if (y <= 8) setHeaderHidden(false);
    else if (y > lastScrollY + 2) setHeaderHidden(true);
    else if (y < lastScrollY - 2) setHeaderHidden(false);
    lastScrollY = y;
  }

  function buildHomepage() {
    var observation = document.getElementById('observation');
    if (!observation || document.getElementById('pitch-intro')) return;

    observation.innerHTML =
      '<div class="product-orientation"><span></span><span>BENCH</span></div>' +
      '<span class="hero-line-wrap"><h1 class="hero-line js-fit">ABOUT TO MAKE A BIG</h1></span>' +
      '<span class="hero-line-wrap"><h1 class="hero-line js-fit">MARKETING DECISION?</h1></span>' +
      '<div class="opening-copy"><p>Before you commit, find out what else you might be committing to.</p><p>Every decision adds up. Some <strong>compound</strong> what makes the company valuable. Some <strong>depreciate</strong> it. The difficult ones can look perfectly sensible either way.</p><p><strong>BENCH</strong> brings independent scrutiny to consequential marketing decisions — before they become expensive to undo.</p></div>' +
      '<div class="opening-actions"><a class="watch-action" href="#opening-video"><span class="pulse-square" aria-hidden="true"></span><span>Watch how it works · 60 sec</span></a><a class="bench-action" href="/bench#discuss"><span class="bench-prompt">Have a decision in mind?</span><span class="bench-command">Bench it</span><span class="bench-arrow">→</span></a></div>' +
      '<div class="opening-video" id="opening-video" aria-label="Video placeholder"><span class="opening-video-mark" aria-hidden="true">▶</span></div>';

    var pitch = document.createElement('section');
    pitch.className = 'viewport home-paper pitch-intro';
    pitch.id = 'pitch-intro';
    pitch.innerHTML =
      '<div class="product-orientation"><span></span><span>PITCH</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">ABOUT TO MAKE SOMETHING</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">YOU’LL WANT TO DEFEND?</h2></span>' +
      '<div class="pitch-copy"><p>Good work rarely becomes dull all at once.</p><p>It happens along the way.</p><p>The brief gets safer.<br>The obvious answer gets easier.<br>The interesting bit gets explained away.<br>The work gets polished before it gets better.</p><p>None of it looks like a bad decision.</p><p><strong>Until the interesting thing is gone.</strong></p><p><strong>PITCH</strong> brings better judgment into the creative process — while there’s still time to make the work better.</p></div>' +
      '<div class="pitch-steps"><div><strong>BRIEF</strong><span>Interrogate the problem before you solve it.</span></div><div><strong>PLAY</strong><span>Open up possibilities before you narrow them down.</span></div><div><strong>DESIGN</strong><span>Make the strongest idea stronger.</span></div><div><strong>LEARN</strong><span>Turn what happened into an advantage next time.</span></div></div>' +
      '<div class="pitch-actions"><a class="pitch-watch" href="#pitch-video"><span class="pulse-square" aria-hidden="true"></span><span>Watch how PITCH works · 60 sec</span></a><a class="pitch-go" href="https://pitchagainstdull.com"><span class="pitch-prompt">Have something in the works?</span><span class="pitch-command">Pitch it</span><span class="pitch-arrow">→</span></a></div>' +
      '<div class="pitch-video" id="pitch-video" aria-label="PITCH video placeholder"><span aria-hidden="true">▶</span></div>';
    observation.insertAdjacentElement('afterend', pitch);

    var drift = document.createElement('section');
    drift.className = 'viewport drift-intro';
    drift.id = 'drift';
    drift.innerHTML =
      '<div class="product-orientation"><span></span><span>DRIFT</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">GOOD DECISIONS CAN</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">STILL ADD UP WRONG.</h2></span>' +
      '<div class="drift-copy"><p>At first, you don’t notice it.</p><p>One reasonable commitment.<br>Then another.<br>A new trend.<br>A new priority.<br>A new opinion.<br>A new technology.<br>A new strategy.</p><p>None of them are wrong. Until one day, you no longer recognize the organization you’ve become. <strong>When every commitment tells you where to go, what reminds you who you are?</strong></p></div>' +
      '<p class="drift-close"><strong>Drift is subtle. Dangerously subtle.</strong></p>';
    pitch.insertAdjacentElement('afterend', drift);

    var independence = document.createElement('section');
    independence.className = 'viewport compact-section independence-home';
    independence.id = 'independence-home';
    independence.innerHTML =
      '<div class="product-orientation"><span></span><span>INDEPENDENCE</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">NOTHING FOR SALE BUT</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">THE RIGHT ANSWER.</h2></span>' +
      '<div class="independence-copy"><p>Your agency wants to make it.<br>Your team wants to move it forward.<br>Your consultancy has a recommendation.<br>Leadership has a decision to make.</p><p>Everyone in the room has an interest in what happens next.</p><p><strong>We don’t.</strong></p><p>We don’t execute the decision.<br>We don’t produce the work.<br>We don’t profit from what comes next.</p><p><strong>A no is as successful for us as a yes.</strong></p><p class="independence-close">Independence isn’t about being outside the company.<br><strong>It’s about being outside the outcome.</strong></p></div>';
    drift.insertAdjacentElement('afterend', independence);

    var dense = document.createElement('section');
    dense.className = 'viewport home-paper compact-section';
    dense.id = 'dense-home';
    dense.innerHTML =
      '<div class="product-orientation"><span></span><span>DENSE IDEAS</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">DENSE IDEAS DON’T JUST LAST.</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">THEY COMPOUND.</h2></span>' +
      '<div class="compact-copy"><p>A Dense Idea keeps a company recognizably itself while everything around it changes.</p><p>Not a tagline.<br>Not a campaign.<br>Not a set of guidelines.</p><p>An idea dense enough to help you decide what belongs — and what doesn’t.</p></div>' +
      '<div class="compact-signature"><strong>KILL DULL<span class="signature-terminal" aria-hidden="true"></span><span class="signature-tm">™</span></strong><span>THE DENSE IDEA COMPANY™</span></div>' +
      '<a class="text-link" href="/dense-ideas">Learn about Dense Ideas <span>→</span></a>';
    independence.insertAdjacentElement('afterend', dense);

    var readings = document.createElement('section');
    readings.className = 'viewport compact-section readings-home';
    readings.id = 'readings-home';
    readings.innerHTML =
      '<div class="product-orientation"><span></span><span>READINGS</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">AAH. HMM. DULL.</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">ONLY ONE REACTION COMPOUNDS.</h2></span>' +
      '<div class="compact-copy"><p><strong>AAH.</strong> So good.<br><strong>HMM.</strong> So so.<br><strong>DULL.</strong> So not.</p></div>' +
      '<a class="text-link light-link" href="/readings">See what earned the reaction <span>→</span></a>';
    dense.insertAdjacentElement('afterend', readings);

    var close = document.createElement('section');
    close.className = 'viewport compact-section home-new-close';
    close.id = 'home-close';
    close.innerHTML =
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">KEEPING YOU UP AT NIGHT?</h2></span>' +
      '<div class="close-options">' +
        '<a class="close-choice" href="/bench#discuss"><span class="close-choice-label">ABOUT TO DECIDE?</span><span class="close-choice-copy">A consequential marketing decision.<br>A lot riding on the answer.<br><strong>Now is the time to question it.</strong></span><span class="close-reveal"><strong class="close-reveal-action">Bench it <b>→</b></strong></span></a>' +
        '<a class="close-choice" href="https://pitchagainstdull.com"><span class="close-choice-label">ABOUT TO MAKE?</span><span class="close-choice-copy">A creative idea in the making.<br>A lot riding on what it becomes.<br><strong>Now is the time to make it better.</strong></span><span class="close-reveal"><strong class="close-reveal-action">Pitch it <b>→</b></strong></span></a>' +
      '</div>';
    readings.insertAdjacentElement('afterend', close);

    var oldSections = document.querySelectorAll('main > section:not(#observation):not(#pitch-intro):not(#drift):not(#independence-home):not(#dense-home):not(#readings-home):not(#home-close)');
    for (var i = 0; i < oldSections.length; i++) oldSections[i].style.display = 'none';

    var style = document.createElement('style');
    style.textContent =
      '#masthead,#registrar{transition:transform .28s cubic-bezier(.2,.8,.2,1);will-change:transform}' +
      '.product-orientation{display:flex;align-items:center;gap:20px;margin-bottom:42px;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.24em;color:var(--text-secondary)}' +
      '.product-orientation:before{content:"";display:block;flex:1;height:1px;background:var(--border)}.product-orientation>span:first-child{display:none}' +
      '#observation .opening-copy p+p{margin-top:18px}' +
      '.pitch-copy,.compact-copy,.independence-copy{width:100%;max-width:50%;font-size:17px;line-height:1.8;margin-top:36px}.pitch-copy p,.compact-copy p,.independence-copy p{margin:0}.pitch-copy p+p,.compact-copy p+p,.independence-copy p+p{margin-top:18px}' +
      '.pitch-steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:48px}.pitch-steps>div{padding:22px 22px 24px 0}.pitch-steps>div+div{padding-left:22px}.pitch-steps>div:last-child{border-right:0}.pitch-steps strong{display:block;font-family:"IBM Plex Mono",monospace;font-size:12px;letter-spacing:.16em;margin-bottom:12px}.pitch-steps span{display:block;font-size:15px;line-height:1.55}' +
      '.pitch-actions{display:flex;align-items:center;gap:34px;flex-wrap:wrap;margin-top:36px}.pitch-watch,.pitch-go{display:inline-flex;align-items:center;text-decoration:none;text-transform:none}.pitch-watch{gap:10px;font-size:14px}.pitch-watch .pulse-square{width:10px;height:10px;background:var(--yellow);display:inline-block;animation:kdPulse 1.8s ease-in-out infinite}.pitch-go{gap:8px;font-size:17px;margin-left:auto}.pitch-arrow{display:inline-block;transition:transform .22s cubic-bezier(.2,.8,.2,1)}.pitch-go:hover .pitch-arrow{transform:translateY(-5px)}' +
      '.pitch-video{width:100%;aspect-ratio:16/9;margin-top:48px;display:flex;align-items:center;justify-content:center}.pitch-video>span{font-size:34px;line-height:1;padding-left:3px}' +
      '.drift-copy{width:100%;max-width:50%;font-size:17px;line-height:1.8;margin-top:36px}.drift-copy p{margin:0}.drift-copy p+p{margin-top:24px}.drift-close{margin:24px 0 0;font-size:17px;line-height:1.8;letter-spacing:0}' +
      '.compact-signature{display:flex;flex-direction:column;gap:5px;margin-top:42px}.compact-signature strong{display:flex;align-items:flex-start;width:max-content;font-size:20px;line-height:1}.compact-signature .signature-terminal{display:inline-block;width:1em;height:1em;margin-left:.12em;background:var(--yellow);font-size:1em;letter-spacing:0}.compact-signature .signature-tm{font-size:.45em;line-height:1;margin-left:2px;transform:translateY(-.08em)}.compact-signature>span{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.14em}.text-link{display:inline-flex;gap:8px;align-items:center;margin-top:36px;font-size:17px;font-weight:700;text-decoration:none;text-transform:none}.text-link span{display:inline-block;transition:transform .22s cubic-bezier(.2,.8,.2,1)}.text-link:hover span{transform:translateY(-5px)}' +
      '#home-close{background:var(--yellow)!important;color:var(--ink)!important;padding-bottom:96px}.home-new-close .hero-line{color:var(--ink)!important}.close-options{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:54px}.v5-home #home-close .close-choice{position:relative;overflow:hidden;aspect-ratio:1/1;min-height:0;width:100%!important;max-width:none!important;padding:34px!important;border:0!important;background:var(--paper)!important;color:var(--ink)!important;display:flex!important;flex-direction:column;align-items:flex-start!important;justify-content:flex-start;gap:0!important;text-decoration:none!important;text-transform:none;box-sizing:border-box}.v5-home #home-close .close-choice:hover{border-color:transparent!important;background:var(--paper)!important;color:var(--ink)!important}.close-choice-label{font-family:"IBM Plex Mono",monospace;font-size:15px;letter-spacing:.14em}.close-choice-copy{display:block;margin-top:54px;font-size:clamp(18px,1.7vw,24px);line-height:1.55;color:var(--ink)!important}.close-choice-copy strong{color:var(--ink)!important}.close-reveal-action{display:inline-flex!important;align-items:center;gap:14px;width:max-content;border:.5px solid currentColor;padding:12px 16px;box-sizing:border-box;font-size:clamp(28px,3vw,44px);line-height:1;letter-spacing:-.03em}.close-reveal-action b{display:inline-flex!important;align-items:center;font-size:0!important;transform:none!important;transition:transform .22s cubic-bezier(.2,.8,.2,1)}.close-reveal-action b:before{content:"↗";font-size:.68em;line-height:1}.close-choice:hover .close-reveal-action b{transform:translate(2px,-2px)!important}.close-reveal{position:absolute;left:0;right:0;bottom:0;height:28%;padding:34px;background:var(--ink);color:var(--paper)!important;display:flex;align-items:center;justify-content:flex-start;transform:translateY(100%);transition:transform .34s cubic-bezier(.2,.8,.2,1);box-sizing:border-box}.close-reveal *{color:var(--paper)!important}.close-choice:hover .close-reveal,.close-choice:focus-visible .close-reveal{transform:translateY(0)}' +
      '#observation{background:var(--paper)!important;color:var(--ink)!important}#observation .product-orientation{color:#77736b}#observation .product-orientation:before{background:#aaa69d}#observation .hero-line{color:var(--ink)!important}#observation .opening-copy{color:#44413c}#observation .opening-copy strong{color:var(--ink)}#observation .watch-action{color:#77736b}#observation .bench-prompt{color:#77736b}#observation .bench-command,#observation .bench-arrow{color:var(--ink)}#observation .opening-video{border-color:#aaa69d;background:#e5e2d9}#observation .opening-video-mark{color:var(--ink)}' +
      '.pitch-intro{background:var(--ink)!important;color:var(--paper)!important}.pitch-intro .product-orientation{color:var(--text-secondary)}.pitch-intro .product-orientation:before{background:var(--border)}.pitch-intro .hero-line{color:var(--paper)!important}.pitch-intro .pitch-copy{color:var(--text-body)}.pitch-intro .pitch-copy strong{color:var(--paper)}.pitch-intro .pitch-steps{border-top:0;border-bottom:0}.pitch-intro .pitch-steps>div{border-right:1px solid var(--border)}.pitch-intro .pitch-steps strong{color:var(--paper)}.pitch-intro .pitch-steps span{color:var(--text-body)}.pitch-intro .pitch-watch,.pitch-intro .pitch-prompt{color:var(--text-secondary)}.pitch-intro .pitch-command,.pitch-intro .pitch-arrow{color:var(--paper)}.pitch-intro .pitch-video{border:1px solid var(--border);background:#171715}.pitch-intro .pitch-video>span{color:var(--paper)}' +
      '.drift-intro{background:var(--paper)!important;color:var(--ink)!important}.drift-intro .product-orientation{color:#77736b}.drift-intro .product-orientation:before{background:#aaa69d}.drift-intro .hero-line{color:var(--ink)!important}.drift-intro .drift-copy{color:#44413c}.drift-intro .drift-copy strong,.drift-intro .drift-close{color:var(--ink)}' +
      '.independence-home{background:var(--ink)!important;color:var(--paper)!important}.independence-home .product-orientation{color:var(--text-secondary)}.independence-home .product-orientation:before{background:var(--border)}.independence-home .hero-line{color:var(--paper)!important}.independence-home .independence-copy{color:var(--text-body)}.independence-home .independence-copy strong{color:var(--paper)}' +
      '#dense-home{background:var(--paper)!important;color:var(--ink)!important}#dense-home .product-orientation{color:#77736b}#dense-home .product-orientation:before{background:#aaa69d}#dense-home .hero-line{color:var(--ink)!important}#dense-home .compact-copy{color:#44413c}#dense-home .compact-signature strong{color:var(--ink)}#dense-home .compact-signature>span{color:#77736b}#dense-home .compact-signature .signature-terminal{background:var(--yellow)}#dense-home .text-link{color:var(--ink)}' +
      '.readings-home{background:var(--ink)!important;color:var(--paper)!important}.readings-home .product-orientation{color:var(--text-secondary)}.readings-home .product-orientation:before{background:var(--border)}.readings-home .hero-line{color:var(--paper)!important}.readings-home .compact-copy{color:var(--text-body)}.readings-home .text-link{color:var(--paper)}' +
      '@media(max-width:767px){.product-orientation{margin-bottom:30px}.pitch-copy,.drift-copy,.compact-copy,.independence-copy{max-width:100%}.pitch-steps{grid-template-columns:1fr}.pitch-steps>div,.pitch-steps>div+div{padding:18px 0;border-right:0!important;border-bottom:1px solid currentColor}.pitch-steps>div:last-child{border-bottom:0}.pitch-go{margin-left:0}.close-options{grid-template-columns:1fr;gap:18px}.v5-home #home-close .close-choice{padding:24px!important}.close-choice-copy{margin-top:34px;font-size:18px}.close-reveal{height:30%;padding:24px}}' +
      '@media(prefers-reduced-motion:reduce){#masthead,#registrar{transition:none}.pitch-watch .pulse-square{animation:none}.pitch-arrow,.text-link span,.close-reveal-action b,.close-reveal{transition:none}}';
    document.head.appendChild(style);
  }

  var deskItems = document.querySelectorAll('#registrar-desktop .reg-item[data-chapter]');
  var chapters = [];
  var labels = [];
  for (var i = 0; i < deskItems.length; i++) {
    chapters.push(deskItems[i].getAttribute('data-chapter'));
    labels.push(deskItems[i].textContent.trim());
  }

  function getActiveIndex() {
    var threshold = getOffset() + 20;
    var active = 0;
    for (var i = 0; i < chapters.length; i++) {
      var el = document.getElementById(chapters[i]);
      if (el && el.getBoundingClientRect().top <= threshold) active = i;
    }
    return active;
  }

  function updateRegistrar() {
    if (!chapters.length) return;
    var activeIdx = getActiveIndex();
    for (var i = 0; i < deskItems.length; i++) {
      deskItems[i].classList.remove('is-active', 'is-past');
      if (i < activeIdx) deskItems[i].classList.add('is-past');
      else if (i === activeIdx) deskItems[i].classList.add('is-active');
    }
    var mobileLabel = document.getElementById('reg-mobile-label');
    if (mobileLabel) mobileLabel.textContent = labels[activeIdx] || labels[0];
  }

  function wireMobile() {
    var btn = document.getElementById('reg-mobile-btn');
    var dropdown = document.getElementById('reg-mobile-dropdown');
    if (!btn || !dropdown) return;
    btn.addEventListener('click', function () {
      if (dropdown.hasAttribute('hidden')) dropdown.removeAttribute('hidden');
      else dropdown.setAttribute('hidden', '');
    });
    var links = dropdown.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) links[i].addEventListener('click', function () { dropdown.setAttribute('hidden', ''); });
  }

  function wireChapterScroll() {
    var anchors = document.querySelectorAll('.reg-item[data-chapter]');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function (e) {
        var target = document.getElementById(this.getAttribute('data-chapter'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({top: target.getBoundingClientRect().top + window.scrollY - getOffset(), behavior: 'smooth'});
      });
    }
  }

  function boot() {
    buildHomepage();
    setDate();
    positionRegistrar();
    setBodyOffset();
    updateRegistrar();
    updateHeaderVisibility();
    fitAll();
  }

  wireMobile();
  wireChapterScroll();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load', boot);
  window.addEventListener('scroll', function () { updateRegistrar(); updateHeaderVisibility(); });
  window.addEventListener('resize', function () { positionRegistrar(); setBodyOffset(); updateRegistrar(); updateHeaderVisibility(); fitAll(); });
})();