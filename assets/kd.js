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
      '<div class="drift-copy"><p>At first, you don’t notice it.</p><p>One reasonable commitment.<br>Then another.<br>A new trend.<br>A new priority.<br>A new opinion.<br>A new technology.<br>A new strategy.</p><p>None of them are wrong.</p><p>Until one day, you no longer recognize<br>the organization you’ve become.</p><p>Every commitment changes the course.</p><p>When everything tells you where to go,<br>what reminds you who you are?</p></div>' +
      '<div class="drift-close"><strong>DRIFT IS SUBTLE.</strong><strong>DANGEROUSLY SUBTLE.</strong></div>' +
      '<p class="drift-bridge">And that’s why there’s <strong>BENCH</strong> and <strong>PITCH</strong>.</p>';
    pitch.insertAdjacentElement('afterend', drift);

    var dense = document.createElement('section');
    dense.className = 'viewport home-paper compact-section';
    dense.id = 'dense-home';
    dense.innerHTML =
      '<div class="product-orientation"><span></span><span>DENSE IDEAS</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">THE BEST IDEAS</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">DON’T JUST LAST.</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">THEY COMPOUND.</h2></span>' +
      '<div class="compact-copy"><p>A Dense Idea keeps a company recognizably itself while everything around it changes.</p><p>Not a tagline.<br>Not a campaign.<br>Not a set of guidelines.</p><p>An idea dense enough to help you decide what belongs — and what doesn’t.</p></div>' +
      '<div class="compact-signature"><strong>KILL DULL™</strong><span>THE DENSE IDEA COMPANY™</span></div>' +
      '<a class="text-link" href="/dense-ideas">Learn about Dense Ideas <span>→</span></a>';
    drift.insertAdjacentElement('afterend', dense);

    var readings = document.createElement('section');
    readings.className = 'viewport compact-section readings-home';
    readings.id = 'readings-home';
    readings.innerHTML =
      '<div class="product-orientation"><span></span><span>READINGS</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">DON’T TAKE</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">OUR WORD FOR IT.</h2></span>' +
      '<div class="compact-copy"><p>We put the thinking on record.</p><p>Published Readings examine real decisions, what they add, what they subtract, and what they might teach the organization to approve next.</p></div>' +
      '<a class="text-link light-link" href="/readings">Read the Readings <span>→</span></a>';
    dense.insertAdjacentElement('afterend', readings);

    var close = document.createElement('section');
    close.className = 'viewport home-paper compact-section home-new-close';
    close.id = 'home-close';
    close.innerHTML =
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">WHAT ARE YOU</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">ABOUT TO DO?</h2></span>' +
      '<div class="close-options"><div><span>A consequential decision?</span><a href="/bench#discuss">Bench it <b>→</b></a></div><div><span>Something you’re making?</span><a href="https://pitchagainstdull.com">Pitch it <b>→</b></a></div></div>';
    readings.insertAdjacentElement('afterend', close);

    var oldSections = document.querySelectorAll('main > section:not(#observation):not(#pitch-intro):not(#drift):not(#dense-home):not(#readings-home):not(#home-close)');
    for (var i = 0; i < oldSections.length; i++) oldSections[i].style.display = 'none';

    var style = document.createElement('style');
    style.textContent =
      '.product-orientation{display:flex;align-items:center;gap:20px;margin-bottom:42px;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.24em;color:var(--text-secondary)}' +
      '.product-orientation:before{content:"";display:block;flex:1;height:1px;background:var(--border)}.product-orientation>span:first-child{display:none}' +
      '#observation .opening-copy p+p{margin-top:18px}' +
      '.pitch-intro{background:var(--paper);color:var(--ink)}.pitch-intro .product-orientation,.compact-section .product-orientation{color:#77736b}.pitch-intro .product-orientation:before,.compact-section .product-orientation:before{background:#aaa69d}.pitch-intro .hero-line,.compact-section .hero-line{color:var(--ink)}' +
      '.pitch-copy,.compact-copy{width:100%;max-width:50%;font-size:17px;line-height:1.8;color:#44413c;margin-top:36px}.pitch-copy p,.compact-copy p{margin:0}.pitch-copy p+p,.compact-copy p+p{margin-top:18px}.pitch-copy strong{color:var(--ink)}' +
      '.pitch-steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:48px;border-top:1px solid #aaa69d;border-bottom:1px solid #aaa69d}.pitch-steps>div{padding:22px 22px 24px 0;border-right:1px solid #aaa69d}.pitch-steps>div+div{padding-left:22px}.pitch-steps>div:last-child{border-right:0}.pitch-steps strong{display:block;font-family:"IBM Plex Mono",monospace;font-size:12px;letter-spacing:.16em;color:var(--ink);margin-bottom:12px}.pitch-steps span{display:block;font-size:15px;line-height:1.55;color:#55514b}' +
      '.pitch-actions{display:flex;align-items:center;gap:34px;flex-wrap:wrap;margin-top:36px}.pitch-watch,.pitch-go{display:inline-flex;align-items:center;text-decoration:none;text-transform:none}.pitch-watch{gap:10px;color:#77736b;font-size:14px}.pitch-watch .pulse-square{width:10px;height:10px;background:var(--yellow);display:inline-block;animation:kdPulse 1.8s ease-in-out infinite}.pitch-go{gap:8px;font-size:17px;margin-left:auto}.pitch-prompt{color:#77736b}.pitch-command,.pitch-arrow{font-weight:700;color:var(--ink)}.pitch-arrow{display:inline-block;transition:transform .22s cubic-bezier(.2,.8,.2,1)}.pitch-go:hover .pitch-arrow{transform:translateX(7px)}' +
      '.pitch-video{width:100%;aspect-ratio:16/9;margin-top:48px;border:1px solid #aaa69d;background:#e5e2d9;display:flex;align-items:center;justify-content:center}.pitch-video>span{color:var(--ink);font-size:34px;line-height:1;padding-left:3px}' +
      '.drift-intro{background:var(--ink);color:var(--paper)}.drift-intro .hero-line,.readings-home .hero-line{color:var(--paper)}.drift-copy{width:100%;max-width:50%;font-size:17px;line-height:1.8;color:var(--text-body);margin-top:36px}.drift-copy p{margin:0}.drift-copy p+p{margin-top:24px}.drift-close{margin-top:48px;display:flex;flex-direction:column;font-size:clamp(24px,3vw,48px);line-height:1.05;letter-spacing:-.02em;color:var(--paper)}.drift-close strong:last-child{color:var(--yellow)}.drift-bridge{margin:36px 0 0;font-size:17px;line-height:1.8;color:var(--text-body)}.drift-bridge strong{color:var(--paper)}' +
      '.compact-signature{display:flex;flex-direction:column;gap:5px;margin-top:42px}.compact-signature strong{font-size:20px}.compact-signature span{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.14em;color:#77736b}.text-link{display:inline-flex;gap:8px;align-items:center;margin-top:36px;font-size:17px;font-weight:700;text-decoration:none;text-transform:none;color:var(--ink)}.text-link span{transition:transform .22s cubic-bezier(.2,.8,.2,1)}.text-link:hover span{transform:translateX(7px)}' +
      '.readings-home{background:var(--ink);color:var(--paper)}.readings-home .product-orientation{color:var(--text-secondary)}.readings-home .product-orientation:before{background:var(--border)}.readings-home .compact-copy{color:var(--text-body)}.light-link{color:var(--yellow)}' +
      '.home-new-close{background:var(--paper);color:var(--ink)}.close-options{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:48px;border-top:1px solid #aaa69d;border-bottom:1px solid #aaa69d}.close-options>div{display:flex;flex-direction:column;gap:12px;padding:28px 28px 30px 0}.close-options>div+div{padding-left:28px;border-left:1px solid #aaa69d}.close-options span{font-size:17px;color:#77736b}.close-options a{font-size:28px;font-weight:700;color:var(--ink);text-decoration:none;text-transform:none}.close-options b{font-weight:700}' +
      '@media(max-width:767px){.product-orientation{margin-bottom:30px}.pitch-copy,.drift-copy,.compact-copy{max-width:100%}.pitch-steps{grid-template-columns:1fr}.pitch-steps>div,.pitch-steps>div+div{padding:18px 0;border-right:0;border-bottom:1px solid #aaa69d}.pitch-steps>div:last-child{border-bottom:0}.pitch-go{margin-left:0}.close-options{grid-template-columns:1fr}.close-options>div+div{padding-left:0;border-left:0;border-top:1px solid #aaa69d}}' +
      '@media(prefers-reduced-motion:reduce){.pitch-watch .pulse-square{animation:none}.pitch-arrow,.text-link span{transition:none}}';
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
    fitAll();
  }

  wireMobile();
  wireChapterScroll();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load', boot);
  window.addEventListener('scroll', updateRegistrar);
  window.addEventListener('resize', function () { positionRegistrar(); setBodyOffset(); updateRegistrar(); fitAll(); });
})();
