/* =========================================================================
   KILL DULL — shared behaviour
   ========================================================================= */
(function () {
  'use strict';

  /* Canonical shell: every Kill Dull page uses the homepage header/footer scale. */
  var shellStyle = document.createElement('style');
  shellStyle.id = 'kd-canonical-shell';
  shellStyle.textContent =
    '.masthead-date,.reg-item,.product-link,.product-cta{font-size:15px!important}' +
    '.masthead-tagline,.bulletin-text{font-size:16px!important}' +
    '.masthead-designation{font-size:19px!important}' +
    '.bulletin-label{font-size:14px!important}' +
    '.unified-nav{min-height:40px!important;height:40px!important}' +
    '.masthead-wordmark .tm{display:inline-block;font-size:.44em;vertical-align:baseline;line-height:1;margin-left:6px;position:relative;top:-.895em;letter-spacing:0}' +
    '.footer-inner{padding:80px 120px!important}' +
    '.footer-bureau{font-size:clamp(40px,6vw,80px)!important;margin-bottom:64px!important;padding-top:32px!important}' +
    '.footer-index{margin-bottom:80px!important}' +
    '.footer-section{grid-template-columns:200px 1fr!important;padding:28px 0!important}' +
    '.footer-section-label{font-size:10px!important}' +
    '.footer-section nav a{font-size:15px!important}' +
    '.footer-colophon{font-size:10px!important}' +
    '@media(max-width:1279px){.footer-inner{padding:64px!important}}' +
    '@media(max-width:767px){.footer-inner{padding:48px 24px!important}.footer-section{grid-template-columns:1fr!important;gap:12px!important}}';
  document.head.appendChild(shellStyle);

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
    if (!observation || document.getElementById('cost-home')) return;

    observation.innerHTML =
      '<span class="hero-line-wrap"><h1 class="hero-line js-fit">ABOUT TO MAKE A BIG</h1></span>' +
      '<span class="hero-line-wrap"><h1 class="hero-line js-fit">MARKETING DECISION?</h1></span>' +
      '<div class="home-copy opening-copy">' +
        '<p>Before you commit, find out what else you might be committing to.</p>' +
        '<p>Inside most companies, the fundamentals of marketing — the four Ps: <strong>Product, Price, Place, Promotion</strong> — don\'t live in the same room.</p>' +
        '<p>Customers don\'t care.</p>' +
        '<p><strong>They experience one company.</strong></p>' +
        '<p>A decision in one place can strengthen—or quietly depreciate—what the rest of the company has spent years building.</p>' +
      '</div>';

    var cost = document.createElement('section');
    cost.className = 'viewport compact-section cost-home';
    cost.id = 'cost-home';
    cost.innerHTML =
      '<div class="product-orientation"><span></span><span>THE COST OF DULL</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">DULL IS EXPENSIVE.</h2></span>' +
      '<div class="home-copy">' +
        '<p>McKinsey has found that better marketing analytics can free <strong>15–20% of marketing spending</strong> for reinvestment or the bottom line. Its work across more than 400 engagements put the global opportunity at up to $200 billion annually.</p>' +
        '<p>System1, working with Adam Morgan of eatbigfish and Peter Field, estimated that dull US advertising would require <strong>$189 billion in additional media investment</strong> to achieve the predicted results of non-dull advertising.</p>' +
        '<p>Different research.<br>Different definitions.<br>Different parts of marketing.</p>' +
        '<p><strong>And only part of the bill.</strong></p>' +
        '<p>Neither tells you what happens when the product is wrong.<br>The price weakens preference.<br>The place changes the experience.<br>Or a succession of perfectly reasonable decisions makes the company less itself.</p>' +
        '<p>Those costs are harder to put into one number.</p>' +
        '<p><strong>That doesn\'t make them free.</strong></p>' +
      '</div>' +
      '<div class="source-links"><a href="https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/using-marketing-analytics-to-drive-superior-growth" target="_blank" rel="noopener">McKinsey — Using marketing analytics to drive superior growth ↗</a><a href="https://system1group.com/the-extraordinary-cost-of-dull" target="_blank" rel="noopener">System1 — The Extraordinary Cost of Dull ↗</a></div>';
    observation.insertAdjacentElement('afterend', cost);

    var balance = document.createElement('section');
    balance.className = 'viewport compact-section balance-home';
    balance.id = 'balance-home';
    balance.innerHTML =
      '<div class="product-orientation"><span></span><span>THE IDEA BALANCE SHEET</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">NOT EVERYTHING THAT MATTERS</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">FITS IN THE DATA.</h2></span>' +
      '<div class="home-copy">' +
        '<p>Consequential marketing decisions rarely suffer from a shortage of information.</p>' +
        '<p>Research. Performance. Finance. Markets. Customer behavior. Analytics. AI.</p>' +
        '<p><strong>BIG DATA.</strong></p>' +
        '<p>What the organization can measure.</p>' +
        '<p>But companies also know things that are harder to put in a spreadsheet.</p>' +
        '<p>Experience. Instinct. Pattern recognition. Culture. Context. Tacit knowledge. Taste.</p>' +
        '<p><strong>GUT DATA.</strong></p>' +
        '<p>What experienced humans can recognize.</p>' +
        '<p>One without the other isn\'t enough.</p>' +
        '<p><strong>Data without judgment is analysis.<br>Gut without evidence is opinion.</strong></p>' +
        '<p>The Idea Balance Sheet puts both in view before the decision is made.</p>' +
        '<p><strong>BIG DATA + GUT DATA.</strong></p>' +
      '</div>';
    cost.insertAdjacentElement('afterend', balance);

    var drift = document.createElement('section');
    drift.className = 'viewport compact-section drift-home';
    drift.id = 'drift';
    drift.innerHTML =
      '<div class="product-orientation"><span></span><span>DRIFT</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">GOOD DECISIONS CAN</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">STILL ADD UP WRONG.</h2></span>' +
      '<div class="home-copy">' +
        '<p>One reasonable commitment.</p>' +
        '<p>Then another.</p>' +
        '<p>A new trend.<br>A new priority.<br>A new technology.<br>A new strategy.</p>' +
        '<p>None has to be catastrophically wrong.</p>' +
        '<p>Eventually the company simply becomes <strong>less itself</strong>.</p>' +
        '<p>Because every decision does more than produce an outcome.</p>' +
        '<p>It creates a precedent.</p>' +
        '<p><strong>EVERY YES TRAINS THE NEXT YES.</strong></p>' +
      '</div>';
    balance.insertAdjacentElement('afterend', drift);

    var dense = document.createElement('section');
    dense.className = 'viewport compact-section dense-home';
    dense.id = 'dense-home';
    dense.innerHTML =
      '<div class="product-orientation"><span></span><span>DENSE IDEAS</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">DENSE IDEAS DON’T JUST LAST.</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">THEY COMPOUND.</h2></span>' +
      '<div class="home-copy">' +
        '<p>A Dense Idea keeps the company recognizably itself while everything around it changes.</p>' +
        '<p>Not a tagline.<br>Not a campaign.<br>Not a set of guidelines.</p>' +
        '<p>An idea dense enough to help determine what belongs—and what doesn\'t.</p>' +
        '<p>Consistency repeats.<br>Coherence connects.<br>Density generates.</p>' +
        '<p><strong>Compounding endures.</strong></p>' +
      '</div>';
    drift.insertAdjacentElement('afterend', dense);

    var why = document.createElement('section');
    why.className = 'viewport compact-section why-home';
    why.id = 'why-home';
    why.innerHTML =
      '<div class="product-orientation"><span></span><span>WHY KILL DULL?</span></div>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">WHY CALL IT</h2></span>' +
      '<span class="hero-line-wrap"><h2 class="hero-line js-fit">KILL DULL?</h2></span>' +
      '<div class="home-copy">' +
        '<p>We could have called ourselves:</p>' +
        '<p><strong>The Institute for Independent Marketing Judgment and Compounding Institutional Value.</strong></p>' +
        '<p>We didn\'t.</p>' +
        '<p>There are enough dull companies trying to solve dull.</p>' +
        '<p><strong>KILL DULL seemed clearer.</strong></p>' +
        '<p>Dull isn\'t a style.</p>' +
        '<p><strong>It\'s what happens when a company repeatedly chooses what is reasonable over what makes it valuable.</strong></p>' +
      '</div>';
    dense.insertAdjacentElement('afterend', why);

    var oldSections = document.querySelectorAll('main > section:not(#observation):not(#cost-home):not(#balance-home):not(#drift):not(#dense-home):not(#why-home)');
    for (var i = 0; i < oldSections.length; i++) oldSections[i].style.display = 'none';

    var style = document.createElement('style');
    style.id = 'kd-home-argument';
    style.textContent =
      '#masthead,#registrar{transition:transform .28s cubic-bezier(.2,.8,.2,1);will-change:transform}' +
      '.product-orientation{display:flex;align-items:center;gap:20px;margin-bottom:42px;font-family:"IBM Plex Mono",monospace;font-size:15px;letter-spacing:.12em;color:var(--text-secondary)}' +
      '.product-orientation:before{content:"";display:block;flex:1;height:1px;background:var(--border)}.product-orientation>span:first-child{display:none}' +
      '.home-copy{width:100%;max-width:50%;font-size:17px;line-height:1.8;margin-top:36px}.home-copy p{margin:0}.home-copy p+p{margin-top:20px}' +
      '.source-links{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin-top:38px;max-width:70%}.source-links a{font-family:"IBM Plex Mono",monospace;font-size:11px;line-height:1.5;letter-spacing:.04em;text-decoration:none}' +
      '#observation,.balance-home,.dense-home{background:var(--paper)!important;color:var(--ink)!important}' +
      '#observation .hero-line,.balance-home .hero-line,.dense-home .hero-line{color:var(--ink)!important}' +
      '#observation .home-copy,.balance-home .home-copy,.dense-home .home-copy{color:#44413c}' +
      '#observation .home-copy strong,.balance-home .home-copy strong,.dense-home .home-copy strong{color:var(--ink)}' +
      '.balance-home .product-orientation,.dense-home .product-orientation{color:#77736b}.balance-home .product-orientation:before,.dense-home .product-orientation:before{background:#aaa69d}' +
      '.cost-home,.drift-home,.why-home{background:var(--ink)!important;color:var(--paper)!important}' +
      '.cost-home .hero-line,.drift-home .hero-line,.why-home .hero-line{color:var(--paper)!important}' +
      '.cost-home .home-copy,.drift-home .home-copy,.why-home .home-copy{color:var(--text-body)}' +
      '.cost-home .home-copy strong,.drift-home .home-copy strong,.why-home .home-copy strong{color:var(--paper)}' +
      '.cost-home .source-links a{color:var(--paper)}' +
      '@media(max-width:767px){.product-orientation{margin-bottom:30px}.home-copy,.source-links{max-width:100%}}' +
      '@media(prefers-reduced-motion:reduce){#masthead,#registrar{transition:none}}';
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