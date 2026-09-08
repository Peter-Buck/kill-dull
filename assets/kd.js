/* =========================================================================
   KILL DULL — shared behaviour
   Motion principle is constitutional: no two interface elements animate
   simultaneously. Nothing here decorates. It measures, positions and marks
   position in the document.
   ========================================================================= */

(function () {
  'use strict';

  /* ---- Fit a headline to the viewport width ---------------------------- */
  function fitToWidth(el, horizontalPad) {
    if (!el) return;
    el.style.whiteSpace = 'nowrap';
    el.style.fontSize = '500px';
    var ratio = (window.innerWidth - horizontalPad) / el.scrollWidth;
    el.style.fontSize = Math.max(10, Math.floor(ratio * 500)) + 'px';
  }

  function fitAll() {
    var pad = window.innerWidth < 768 ? 48 :
              window.innerWidth < 1280 ? 128 : 240;
    var targets = document.querySelectorAll('.js-fit');
    for (var i = 0; i < targets.length; i++) fitToWidth(targets[i], pad);
  }

  /* ---- Masthead date --------------------------------------------------- */
  function setDate() {
    var months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
                  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    var now = new Date();
    var el = document.getElementById('masthead-date');
    if (el) el.textContent = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
  }

  /* ---- Layout offsets -------------------------------------------------- */
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

  /* ---- Homepage BENCH / PITCH introductions --------------------------- */
  function buildHomepageIntroductions() {
    var observation = document.getElementById('observation');
    if (!observation || document.getElementById('pitch-intro')) return;

    var benchLabel = document.createElement('div');
    benchLabel.className = 'product-orientation';
    benchLabel.innerHTML = '<span></span><span>BENCH</span>';
    observation.insertBefore(benchLabel, observation.firstChild);

    var pitch = document.createElement('section');
    pitch.className = 'viewport home-paper pitch-intro';
    pitch.id = 'pitch-intro';
    pitch.innerHTML = '<div class="product-orientation"><span></span><span>PITCH</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">ABOUT TO MAKE SOMETHING</h2></span><span class="hero-line-wrap"><h2 class="hero-line js-fit">YOU’LL WANT TO DEFEND?</h2></span>' +
      '<div class="pitch-copy"><p>Good work rarely becomes dull all at once.</p><p>It happens along the way. A brief closes things down too early. The obvious answer wins before the interesting one gets a chance. Design makes something look finished before the thinking is. And what happened last time gets measured, filed away and forgotten.</p><p><strong>PITCH</strong> brings better judgment into the creative process — while there’s still time to do something about it.</p></div>' +
      '<div class="pitch-steps"><div><strong>BRIEF</strong><span>Interrogate the problem before you solve it.</span></div><div><strong>PLAY</strong><span>Open up possibilities before you narrow them down.</span></div><div><strong>DESIGN</strong><span>Make the strongest idea stronger.</span></div><div><strong>LEARN</strong><span>Turn what happened into an advantage next time.</span></div></div>' +
      '<div class="pitch-actions"><a class="pitch-watch" href="#pitch-video"><span class="pulse-square" aria-hidden="true"></span><span>Watch how PITCH works · 60 sec</span></a><a class="pitch-go" href="https://pitchagainstdull.com"><span class="pitch-prompt">Have something in the works?</span><span class="pitch-command">Pitch it</span><span class="pitch-arrow">→</span></a></div>' +
      '<div class="pitch-video" id="pitch-video" aria-label="PITCH video placeholder"><span aria-hidden="true">▶</span></div>';
    observation.insertAdjacentElement('afterend', pitch);

    var style = document.createElement('style');
    style.textContent =
      '.product-orientation{display:flex;align-items:center;gap:20px;margin-bottom:42px;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.24em;color:var(--text-secondary)}' +
      '.product-orientation:before{content:"";display:block;flex:1;height:1px;background:var(--border)}' +
      '.product-orientation>span:first-child{display:none}' +
      '#observation .product-orientation{color:var(--text-secondary)}' +
      '.pitch-intro{background:var(--paper);color:var(--ink)}' +
      '.pitch-intro .product-orientation{color:#77736b}.pitch-intro .product-orientation:before{background:#aaa69d}' +
      '.pitch-intro .hero-line{color:var(--ink)}' +
      '.pitch-copy{width:100%;max-width:50%;font-size:17px;line-height:1.8;color:#44413c;margin-top:36px}.pitch-copy p{margin:0}.pitch-copy p+p{margin-top:18px}.pitch-copy strong{color:var(--ink)}' +
      '.pitch-steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:48px;border-top:1px solid #aaa69d;border-bottom:1px solid #aaa69d}.pitch-steps>div{padding:22px 22px 24px 0;border-right:1px solid #aaa69d}.pitch-steps>div+div{padding-left:22px}.pitch-steps>div:last-child{border-right:0}.pitch-steps strong{display:block;font-family:"IBM Plex Mono",monospace;font-size:12px;letter-spacing:.16em;color:var(--ink);margin-bottom:12px}.pitch-steps span{display:block;font-size:15px;line-height:1.55;color:#55514b}' +
      '.pitch-actions{display:flex;align-items:center;gap:34px;flex-wrap:wrap;margin-top:36px}.pitch-watch,.pitch-go{display:inline-flex;align-items:center;text-decoration:none;text-transform:none}.pitch-watch{gap:10px;color:#77736b;font-size:14px}.pitch-watch .pulse-square{width:10px;height:10px;background:var(--yellow);display:inline-block;animation:kdPulse 1.8s ease-in-out infinite}.pitch-go{gap:8px;font-size:17px;margin-left:auto}.pitch-prompt{color:#77736b}.pitch-command,.pitch-arrow{font-weight:700;color:var(--ink)}.pitch-arrow{display:inline-block;transition:transform .22s cubic-bezier(.2,.8,.2,1)}.pitch-go:hover .pitch-arrow{transform:translateX(7px)}' +
      '.pitch-video{width:100%;aspect-ratio:16/9;margin-top:48px;border:1px solid #aaa69d;background:#e5e2d9;display:flex;align-items:center;justify-content:center}.pitch-video>span{color:var(--ink);font-size:34px;line-height:1;padding-left:3px}' +
      '@media(max-width:767px){.product-orientation{margin-bottom:30px}.pitch-copy{max-width:100%}.pitch-steps{grid-template-columns:1fr}.pitch-steps>div,.pitch-steps>div+div{padding:18px 0;border-right:0;border-bottom:1px solid #aaa69d}.pitch-steps>div:last-child{border-bottom:0}.pitch-go{margin-left:0}}' +
      '@media(prefers-reduced-motion:reduce){.pitch-watch .pulse-square{animation:none}.pitch-arrow{transition:none}}';
    document.head.appendChild(style);
  }

  /* ---- Chapter registrar (home only) ----------------------------------- */
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

  /* ---- Mobile chapter dropdown ----------------------------------------- */
  function wireMobile() {
    var btn = document.getElementById('reg-mobile-btn');
    var dropdown = document.getElementById('reg-mobile-dropdown');
    if (!btn || !dropdown) return;
    btn.addEventListener('click', function () {
      if (dropdown.hasAttribute('hidden')) dropdown.removeAttribute('hidden');
      else dropdown.setAttribute('hidden', '');
    });
    var links = dropdown.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () { dropdown.setAttribute('hidden', ''); });
    }
  }

  /* ---- Smooth scroll for in-page chapter links ------------------------- */
  function wireChapterScroll() {
    var anchors = document.querySelectorAll('.reg-item[data-chapter]');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function (e) {
        var target = document.getElementById(this.getAttribute('data-chapter'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - getOffset(),
          behavior: 'smooth'
        });
      });
    }
  }

  /* ---- Boot ------------------------------------------------------------ */
  function boot() {
    buildHomepageIntroductions();
    setDate();
    positionRegistrar();
    setBodyOffset();
    updateRegistrar();
    fitAll();
  }

  wireMobile();
  wireChapterScroll();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', boot);

  window.addEventListener('scroll', updateRegistrar);
  window.addEventListener('resize', function () {
    positionRegistrar();
    setBodyOffset();
    updateRegistrar();
    fitAll();
  });
})();
