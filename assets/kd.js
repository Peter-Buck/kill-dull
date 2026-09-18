/* Canonical shell wrapper — homepage header/footer everywhere. */
(function(){
  'use strict';

  var palette=document.createElement('style');
  palette.id='kd-global-palette';
  palette.textContent=':root{--ink:#24222B!important;--paper:#FFFFFF!important;--border:#504D57!important;--border-inner:#3E3B45!important;--yellow:#FFFF00!important}';
  document.head.appendChild(palette);

  var style=document.createElement('style');
  style.id='kd-shell-override';
  style.textContent='@keyframes kd-terminal-compound{0%{transform:scale(1)}50%{transform:scale(1.175)}100%{transform:scale(1)}}'+
    '.masthead{background:var(--ink)!important;color:#fff!important;border-bottom:0!important}'+
    '.masthead-rule{margin:0 120px!important}'+
    '.masthead-top{display:flex!important;flex-direction:column!important;align-items:center!important;gap:16px!important;padding:32px 120px 24px!important;background:var(--ink)!important;color:#fff!important}'+
    '.masthead-wordmark{justify-self:center!important;font-family:"Space Grotesk",sans-serif!important;font-weight:700!important;font-size:54px!important;letter-spacing:-.03em!important;line-height:1!important;color:#fff!important;text-align:center!important;white-space:nowrap!important}'+
    '.masthead-wordmark a{display:inline-flex!important;align-items:baseline!important;white-space:nowrap!important;font-family:"Space Grotesk",sans-serif!important;font-weight:700!important;font-size:inherit!important;letter-spacing:inherit!important;line-height:1!important;color:#fff!important}'+
    '.masthead-wordmark a{position:relative!important}.masthead-wordmark .kd-wordmark-glyphs{display:inline-flex!important;align-items:baseline!important;white-space:nowrap!important}.masthead-wordmark .terminal{animation:none!important;transform:none!important}'+
    '.masthead-wordmark .tm{order:2!important;display:inline-block!important;font-size:.44em!important;vertical-align:baseline!important;line-height:1!important;margin-left:0!important;position:relative!important;top:-.895em!important;letter-spacing:0!important;color:#fff!important;width:0!important;overflow:visible!important;text-indent:6px!important;white-space:nowrap!important}'+
    '.masthead-date{font-family:"Space Grotesk",sans-serif!important;font-size:15px!important;font-weight:700!important;letter-spacing:.10em!important;line-height:1!important;color:#fff!important;opacity:1!important;text-transform:uppercase!important;white-space:nowrap!important}'+
    '.masthead-designation{font-family:"IBM Plex Mono",monospace!important;font-size:15px!important;font-weight:500!important;letter-spacing:.16em!important;line-height:1!important;color:#fff!important;opacity:1!important;text-transform:uppercase!important;white-space:nowrap!important}'+
    '.masthead-date{text-align:center!important;align-self:center!important}'+
    '.masthead-designation{text-align:center!important;padding:16px 120px!important;background:var(--ink)!important}'+
    '.masthead-date .tm,.masthead-designation .tm{color:#fff!important}'+
    '.reg-item,.product-link,.product-cta{font-size:15px!important}'+
    '.product-orientation{font-size:15px!important}'+
    '.masthead-tagline,.bulletin-text{font-size:16px!important}'+
    '.masthead-tagline{display:none!important}'+
    '.bulletin-arrow,.enter-arrow:before,.bench-arrow:before,.text-link span:before,.close-options b:before,.bench-action span:before{font-family:"Space Grotesk",sans-serif!important;font-size:16px!important;font-weight:400!important;line-height:1!important}'+
    '.unified-nav{min-height:44px!important;height:44px!important;display:grid!important;grid-template-columns:1fr auto 1fr!important;align-items:center!important}.unified-nav-chapters{grid-column:2!important;grid-row:1!important;justify-self:center!important}.unified-nav-products{grid-column:3!important;grid-row:1!important;justify-self:end!important;border-left:0!important}.reg-item{border-right:0!important}.unified-nav-products .product-cta::after{content:none!important}.unified-nav-products .product-cta{gap:0!important}.registrar-mobile{grid-column:1/-1!important;grid-row:1!important}'+
    '.footer-inner{padding:80px 120px!important}'+
    '.footer-bureau{font-size:clamp(40px,6vw,80px)!important;margin-bottom:64px!important;padding-top:32px!important}'+
    '.footer-index{margin-bottom:80px!important}'+
    '.footer-section{grid-template-columns:200px 1fr!important;padding:28px 0!important}'+
    '.footer-section-label{font-size:15px!important}'+
    '.footer-section nav a{font-size:18px!important}'+
    '.footer-colophon{font-size:13px!important}'+
    '.readings-page .reading-container{overflow:hidden!important;transition:border-color .18s ease!important}'+
    '.readings-page .reading-container h2{margin:auto 0 0!important;transition:transform .5s cubic-bezier(.2,.8,.2,1)!important}'+
    '.readings-page .reading-container .container-copy{max-height:0!important;margin-top:0!important;padding-top:0!important;opacity:0!important;transform:translateY(10px)!important;overflow:hidden!important;transition:max-height .6s cubic-bezier(.2,.8,.2,1),opacity .4s ease,transform .5s cubic-bezier(.2,.8,.2,1),margin-top .5s ease,padding-top .5s ease!important}'+
    '.readings-page .reading-container.is-active .container-copy,.readings-page .reading-container:focus-visible .container-copy{max-height:420px!important;margin-top:24px!important;padding-top:0!important;opacity:1!important;transform:translateY(0)!important}'+
    '.readings-page .reading-container.is-active h2,.readings-page .reading-container:focus-visible h2{transform:translateY(-4px)!important}'+
    '@media(hover:hover){'+
      '.readings-page .reading-container:hover .container-copy{max-height:420px!important;margin-top:24px!important;padding-top:0!important;opacity:1!important;transform:translateY(0)!important}'+
      '.readings-page .reading-container:hover h2{transform:translateY(-4px)!important}'+
    '}'+
    '.readings-page .record-logo{transform-origin:left center!important}'+
    '.readings-page .record-row:nth-child(1) .record-logo{transform:scale(.748)!important}'+
    '.readings-page .record-row:nth-child(2) .record-logo{transform:scale(1.3175)!important}'+
    '.readings-page .record-row:nth-child(3) .record-logo{transform:scale(.82)!important}'+
    '.readings-page .record-row:nth-child(4) .record-logo{transform:scale(.9)!important}'+
    '.readings-page .record-row:nth-child(5) .record-logo{transform:scale(1.062)!important}'+
    '.readings-page .record-row:nth-child(6) .record-logo{transform:scale(1.7)!important}'+
    '.readings-page .record-row:nth-child(7) .record-logo{transform:scale(.92)!important}'+
    '.readings-page .record-row:nth-child(8) .record-logo{transform:scale(.92)!important}'+
    '.readings-page .record-row:nth-child(9) .record-logo{transform:scale(1.2)!important}'+
    '.kd-cta-unified{box-sizing:border-box!important;display:inline-flex!important;align-items:center!important;gap:9px!important;border:1px solid currentColor!important;padding:10px 14px!important;background:transparent!important;color:inherit!important;text-decoration:none!important;text-transform:uppercase!important;font-family:"IBM Plex Mono",monospace!important;font-size:15px!important;font-weight:400!important;line-height:1.2!important;letter-spacing:.04em!important;transition:border-color .18s ease!important}'+
    '.kd-cta-unified *{font-family:inherit!important;font-size:inherit!important;font-weight:400!important;letter-spacing:inherit!important}'+
    '.kd-cta-unified:hover,.kd-cta-unified:focus-visible{background:transparent!important;color:inherit!important;border-color:var(--yellow)!important}'+
    '.kd-cta-unified::after{content:""!important;display:block!important;flex:0 0 11px!important;width:11px!important;height:11px!important;margin-left:auto!important;background-color:currentColor!important;-webkit-mask:var(--kd-arrow-ne) center/contain no-repeat!important;mask:var(--kd-arrow-ne) center/contain no-repeat!important;transform:none!important;transition:transform .22s cubic-bezier(.2,.8,.2,1)!important}'+
    '.kd-cta-unified:hover::after,.kd-cta-unified:focus-visible::after{transform:translate(2px,-2px)!important}'+
    '.kd-cta-unified .kd-native-arrow{display:none!important}'+
    '.kd-case-action.kd-cta-unified,.kd-review-cta.kd-cta-unified,.readings-page .container-action.kd-cta-unified{width:100%!important}'+
    '.kd-case-action.kd-cta-unified{padding:18px 20px!important}'+
    '.kd-review-card:nth-of-type(5) .kd-review-cta:first-of-type{margin-bottom:24px!important}'+
    '.readings-page .container-action.kd-cta-unified{margin-top:26px!important;border-top:.5px solid currentColor!important}'+
    '.readings-page .container-action.kd-cta-unified:hover,.readings-page .container-action.kd-cta-unified:focus-visible{border-color:var(--yellow)!important}'+
    '.kd-call.kd-cta-unified,.kd-call-secondary.kd-cta-unified,.discipline-cta.kd-cta-unified{margin-top:28px!important}'+
    '.v5-home #home-close .close-options a.kd-cta-unified:hover,.v5-home #home-close .close-options a.kd-cta-unified:focus-visible{background:transparent!important;border-color:var(--yellow)!important;color:inherit!important}'+
    '@media(max-width:1279px){.masthead-top{padding-left:64px!important;padding-right:64px!important}.masthead-designation{padding-left:64px!important;padding-right:64px!important}.masthead-rule{margin:0 64px!important}.footer-inner{padding:64px!important}}'+
    '@media(max-width:1000px){.masthead-top{gap:8px!important}.masthead-date,.masthead-wordmark,.masthead-designation{text-align:center!important}}'+
    '@media(max-width:767px){.masthead-top{padding:30px 24px 24px!important}.masthead-wordmark{font-size:34px!important}.masthead-date{font-size:9px!important;letter-spacing:.08em!important}.masthead-designation{font-size:clamp(10px,3.1vw,13px)!important;letter-spacing:.08em!important}.masthead-designation{padding:12px 24px!important}.masthead-rule{margin:0 24px!important}.unified-nav{grid-template-columns:1fr auto!important}.registrar-mobile{grid-column:1!important}.unified-nav-products{display:flex!important;grid-column:2!important;justify-self:end!important;padding-right:24px!important}.footer-inner{padding:48px 24px!important}.footer-section{grid-template-columns:1fr!important;gap:12px!important}}'+
    /* Cards that open, on a phone.
       A card is a fixed 2:3 frame with a glass panel sized by its copy, and on
       a narrow screen those two move in opposite directions: the card gets
       shorter as the viewport narrows, while the copy gets longer. Past a
       point the panel outgrew the frame and was cut off at the top, taking the
       headline with it, or climbed over the yellow label.
       So when a card is open on a phone the frame stops dictating height: the
       panel returns to normal flow and the card grows to hold it, never below
       the 2:3 it started at. Nothing scrolls inside anything. */
    /* The gate is the pointer, not the viewport.
       A card opened by a finger is opened deliberately and stays open, so it
       has to show everything. A card opened by hovering is a preview that
       leaves when the cursor does, and its fixed frame is the point. The old
       gate said "narrower than 768px", which made an iPad in landscape a desk:
       the copy grows as the column narrows while the 2:3 frame shrinks with it,
       so at 1024x768 every card on the homepage and the Bench lost the top of
       its panel, headline and all, exactly as a phone used to.
       The floor is the card's own width now rather than the viewport's. A
       zero-width float with a percentage top padding is measured against the
       card, so one rule holds at one column or three. */
    '@media(hover:none){'+
      '.kd-review-card.is-active,.bench-card.is-active{aspect-ratio:auto!important}'+
      '.kd-review-card.is-active::before,.bench-card.is-active::before{'+
        'content:""!important;display:block!important;float:left!important;width:0!important;padding-top:150%!important}'+
      '.kd-review-card.is-active .kd-review-panel,.bench-card.is-active .bench-card-panel{'+
        'position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;'+
        'margin:56px 18px 18px!important;min-height:0!important;overflow:hidden!important}'+
      '.kd-review-card.is-active .kd-review-copy,.bench-card.is-active .bench-card-copy{'+
        'max-height:none!important;margin-top:18px!important;opacity:1!important;transform:none!important}'+
      /* The Reading panels grow within their own flex column, so they need no
         geometry change - only the clip that lets the panel do the revealing,
         and a copy that stops racing 600ms of easing into 110ms of travel. */
      '.readings-page .reading-container .reading-container-panel{overflow:hidden!important}'+
      '.readings-page .reading-container .container-copy{transition:opacity .45s ease!important}'+
    '}'+
    /* The record cards are a horizontal runway until they stack at 767px, and
       a card that grows inside that runway would be cut off by the track, not
       by itself. So this family keeps the width gate as well as the pointer. */
    '@media(hover:none) and (max-width:767px){'+
      '.record-card.is-active{aspect-ratio:auto!important}'+
      '.record-card.is-active::before{'+
        'content:""!important;display:block!important;float:left!important;width:0!important;padding-top:150%!important}'+
      '.record-card.is-active .record-panel{'+
        'position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;'+
        'margin:56px 18px 18px!important;min-height:0!important;overflow:hidden!important}'+
      '.record-card.is-active .record-reveal{'+
        'max-height:none!important;margin-top:18px!important;opacity:1!important;transform:none!important}'+
    '}'+
    '@media(prefers-reduced-motion:reduce){.readings-page .reading-container h2,.readings-page .reading-container .container-copy{transition:none!important}.kd-cta-unified::after{transition:none!important}}'+
    '.kd-skip{position:absolute!important;left:-9999px!important;top:0;z-index:10001;display:inline-block;padding:12px 18px;background:var(--ink,#24222B);color:var(--paper,#FFFFFF)!important;font-family:"IBM Plex Mono",monospace;font-size:15px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none}.kd-skip:focus{left:12px!important;top:12px!important;outline:2px solid #FFFF00;outline-offset:2px}main:focus{outline:none}:focus-visible{outline:2px solid #FFFF00!important;outline-offset:2px!important;box-shadow:0 0 0 4px #24222B!important}.product-orientation>span:last-child{color:#736F65!important}.viewport.is-dark .product-orientation>span:last-child,.bench-process .product-orientation>span:last-child,#discuss .product-orientation>span:last-child,.record-intro .product-orientation>span:last-child,.dept-section:not(.is-light) .product-orientation>span:last-child{color:#A5A299!important}.reg-item{color:#A09D94!important}.reg-item.is-current,.reg-item.is-active{color:#FFFFFF!important}'+
    '.kd-talk{background:var(--paper)!important;color:var(--ink)!important}'+
    '.kd-talk .hero-line{color:var(--ink)!important;white-space:normal!important}'+
    '.kd-talk-cta{margin-top:36px;width:max-content}'+
    '.bureau-full-divider{width:100%;height:1px;background:#504D57}'+
    '.kd-full-divider .footer-bureau{border-top:0!important}'+
    '.kd-full-divider .footer{border-top:0!important}';
  document.head.appendChild(style);

  function routeKey(pathname){
    var p=pathname.replace(/\/$/,'');
    if(p===''||p==='/index.html')return 'home';
    if(p==='/bench'||p==='/bench.html')return 'bench';
    if(p==='/readings'||p==='/readings.html')return 'readings';
    if(p==='/discipline'||p==='/discipline.html'||p==='/go-deeper'||p==='/go-deeper.html')return 'discipline';
    if(p==='/bureau'||p==='/bureau.html')return 'bureau';
    if(p==='/contact'||p==='/contact.html')return 'contact';
    return '';
  }

  function currentKey(){return routeKey(window.location.pathname);}

  function normalizeShell(){
    var key=currentKey();
    var wm=document.querySelector('.masthead-wordmark a');
    if(wm) wm.innerHTML='<span class="kd-wordmark-glyphs">KILL DULL<span class="terminal"></span></span><span class="tm">™</span>';
    var date=document.querySelector('.masthead-date');
    if(date) date.textContent='THE DENSE IDEA COMPANY™';
    var designation=document.querySelector('.masthead-designation');
    if(designation) designation.textContent='PROVIDING INDEPENDENT MARKETING JUDGMENT';
    var tagline=document.querySelector('.masthead-tagline');
    if(tagline) tagline.textContent='';
    var desktop=document.getElementById('registrar-desktop');
    var deskHtml='<a class="reg-item'+(key==='home'?' is-current':'')+'" href="/">WHY</a><a class="reg-item'+(key==='discipline'?' is-current':'')+'" href="/discipline">HOW</a><a class="reg-item'+(key==='bench'?' is-current':'')+'" href="/bench">BENCH</a><a class="reg-item'+(key==='readings'?' is-current':'')+'" href="/readings">READINGS</a>';
    if(desktop&&desktop.getAttribute('data-kd-nav')!==key){desktop.innerHTML=deskHtml;desktop.setAttribute('data-kd-nav',key);}
    var products=document.querySelector('.unified-nav-products');
    if(products) products.innerHTML='<a class="product-cta" href="/contact"><span class="enter-text">CONTACT</span></a>';
    var mobile=document.querySelector('.registrar-mobile');
    if(mobile){var label=key==='discipline'?'HOW':key==='bench'?'BENCH':key==='readings'?'READINGS':key==='bureau'?'THE COMPANY':key==='contact'?'MENU':key==='home'?'WHY':'MENU';var mobHtml='<button class="reg-mobile-current" id="reg-mobile-btn" aria-expanded="false" aria-controls="reg-mobile-dropdown"><span id="reg-mobile-label">'+label+'</span><span class="reg-mobile-arrow" aria-hidden="true"></span></button><div class="reg-mobile-dropdown" id="reg-mobile-dropdown" hidden><a class="reg-item" href="/">WHY</a><a class="reg-item" href="/discipline">HOW</a><a class="reg-item" href="/bench">BENCH</a><a class="reg-item" href="/readings">READINGS</a></div>';if(mobile.getAttribute('data-kd-nav')!==label){mobile.innerHTML=mobHtml;mobile.setAttribute('data-kd-nav',label);}}
    var burberry=document.querySelector('.readings-page img[alt="Burberry"]');
    if(burberry){burberry.src='/assets/burberry-logo.svg';burberry.classList.add('native-cream');}
    var starbucks=document.querySelector('.readings-page img[alt="Starbucks"]');
    if(starbucks){starbucks.src='/assets/starbucks-logo.svg';starbucks.classList.add('native-cream');}
    var mainTarget=document.querySelector('main');
    if(mainTarget&&!mainTarget.id){mainTarget.id='main';mainTarget.setAttribute('tabindex','-1');}
    if(mainTarget&&!document.querySelector('.kd-skip')){
      var skip=document.createElement('a');
      skip.className='kd-skip';skip.href='#main';skip.textContent='Skip to content';
      document.body.insertBefore(skip,document.body.firstChild);
    }
    var footEl=document.querySelector('.footer');
    if(footEl&&footEl.parentNode&&!document.querySelector('.kd-talk')){
      var contact=document.createElement('section');
      contact.className='viewport home-paper kd-talk';contact.setAttribute('aria-label','Contact Kill Dull');
      contact.innerHTML='<span class="hero-line-wrap"><h2 class="hero-line js-fit">BRING WHAT’S BUGGING YOU.</h2></span>'+
        '<a class="kd-cta-unified kd-talk-cta" href="mailto:human@killdull.com">HUMAN@KILLDULL.COM</a>';
      footEl.parentNode.insertBefore(contact,footEl);
    }
    // One full-width divider between the CTA and the footer, on every page whose
    // contact section is light. Where that section is dark its own edge already
    // divides it from the footer, so the rule would only double it.
    var talkEl=document.querySelector('.kd-talk');
    if(footEl&&footEl.parentNode&&talkEl&&!document.querySelector('.bureau-full-divider')){
      var rgb=(getComputedStyle(talkEl).backgroundColor.match(/\d+/g)||['255','255','255']).map(Number);
      if(rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722>128){
        var bureauRule=document.createElement('div');
        bureauRule.className='bureau-full-divider';bureauRule.setAttribute('aria-hidden','true');
        footEl.parentNode.insertBefore(bureauRule,footEl);
        document.body.classList.add('kd-full-divider');
      }
    }
    var footer=document.querySelector('.footer');
    if(footer) footer.innerHTML='<div class="footer-inner"><div class="footer-bureau">THE COMPANY.</div><div class="footer-index"><div class="footer-section"><div class="footer-section-label">DISCIPLINE</div><nav aria-label="Discipline"><a href="/discipline">Dense Ideas</a></nav></div><div class="footer-section"><div class="footer-section-label">BENCH</div><nav aria-label="Bench"><a href="/bench">How the Bench works</a><a href="/readings">Private Readings</a><a href="/readings#record">Published Readings</a></nav></div><div class="footer-section"><div class="footer-section-label">KILL DULL</div><nav aria-label="Kill Dull"><a href="/bureau">Department of Hard Evidence</a><a href="/accessibility" aria-label="Accessibility statement">Accessibility</a><a href="/privacy" aria-label="Privacy policy">Privacy</a><a href="/terms" aria-label="Terms of use">Terms</a><a href="/contact">Contact</a></nav></div></div><div class="footer-colophon"><span>© 2026 Kill Dull. All rights reserved.</span></div></div>';
  }

  function normalizeCtas(){
    var selector='.product-cta,.bench-action,.reading-cta,.kd-call,.kd-call-secondary,.kd-review-cta,.kd-case-action,.discipline-cta,.text-link,.close-options a,.readings-page .container-action';
    var ctas=document.querySelectorAll(selector);
    for(var i=0;i<ctas.length;i++){
      var cta=ctas[i];
      cta.classList.add('kd-cta-unified');
      var nativeArrows=cta.querySelectorAll('.enter-arrow,.bench-arrow,.kd-review-cta-arrow,.kd-case-action-arrow');
      for(var j=0;j<nativeArrows.length;j++)nativeArrows[j].classList.add('kd-native-arrow');
      var spans=cta.querySelectorAll('span,b');
      for(var k=0;k<spans.length;k++){
        var t=(spans[k].textContent||'').trim();
        if(t==='↗'||t==='→'||t==='↓')spans[k].classList.add('kd-native-arrow');
      }
      var walker=document.createTreeWalker(cta,NodeFilter.SHOW_TEXT,null);
      var textNodes=[];
      while(walker.nextNode())textNodes.push(walker.currentNode);
      for(var n=0;n<textNodes.length;n++){
        var node=textNodes[n];
        if(node.parentElement&&node.parentElement.classList.contains('kd-native-arrow'))continue;
        node.nodeValue=node.nodeValue.replace(/\s*[↗→↓]\s*$/,'');
      }
    }
  }

  /* Route transition — ported from peter-buck.com components/RouteTransition.tsx + RouteTransition.module.css.
     A single yellow panel sweeps up through the viewport: it enters from the bottom edge, covers,
     navigates, then (on the next page) keeps travelling and reveals it. */
  var routeStyle=document.createElement('style');
  routeStyle.id='kd-route-transition';
  routeStyle.textContent='.kd-route-panel{position:fixed;inset:0;z-index:10000;background:var(--yellow);transform:translate3d(0,100%,0);pointer-events:none;will-change:transform}'+
    '.kd-route-panel.is-cover{animation:kd-sweep-in var(--kd-sweep,280ms) cubic-bezier(0.7,0,0.3,1) forwards}'+
    '.kd-route-panel.is-covered{transform:translate3d(0,0,0)}'+
    '.kd-route-panel.is-reveal{animation:kd-sweep-out var(--kd-sweep,280ms) cubic-bezier(0.7,0,0.3,1) forwards}'+
    '@keyframes kd-sweep-in{from{transform:translate3d(0,100%,0)}to{transform:translate3d(0,0,0)}}'+
    '@keyframes kd-sweep-out{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-100%,0)}}'+
    '@media(prefers-reduced-motion:reduce){.kd-route-panel{display:none}}';
  document.head.appendChild(routeStyle);

  function wireRouteTransition(){
    if(document.documentElement.dataset.kdRouteTransition==='1')return;
    document.documentElement.dataset.kdRouteTransition='1';
    var SWEEP_MS=280;
    var SETTLE_MS=80;
    var MAX_HOLD_MS=2400;
    var STORE='kd-route-sweep';
    var phase='idle',panel=null,timers=[];
    function reducedMotion(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
    function clearTimers(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);timers=[];}
    function mount(cls){if(!panel){panel=document.createElement('div');panel.setAttribute('aria-hidden','true');panel.style.setProperty('--kd-sweep',SWEEP_MS+'ms');(document.body||document.documentElement).appendChild(panel);}panel.className='kd-route-panel '+cls;}
    function unmount(){clearTimers();if(panel&&panel.parentNode)panel.parentNode.removeChild(panel);panel=null;phase='idle';}
    function reveal(){clearTimers();phase='reveal';mount('is-reveal');timers.push(setTimeout(unmount,SWEEP_MS));}
    function dropEarlyCover(){document.documentElement.removeAttribute('data-kd-arriving');var s=document.getElementById('kd-route-arriving');if(s&&s.parentNode)s.parentNode.removeChild(s);}
    function arrive(){var pending=null;try{pending=JSON.parse(sessionStorage.getItem(STORE)||'null');sessionStorage.removeItem(STORE);}catch(err){pending=null;}if(pending&&pending.to===currentKey()&&(Date.now()-pending.t)<MAX_HOLD_MS&&!reducedMotion()){phase='cover';mount('is-covered');requestAnimationFrame(function(){timers.push(setTimeout(reveal,SETTLE_MS));});}dropEarlyCover();}
    if(document.prerendering){if(!reducedMotion())mount('is-covered');document.addEventListener('prerenderingchange',function(){if(panel)unmount();arrive();},{once:true});}else arrive();
    document.addEventListener('click',function(e){if(phase!=='idle')return;if(e.defaultPrevented||e.button!==0)return;if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(cardClaimsClick(e))return;var anchor=e.target&&e.target.closest?e.target.closest('a'):null;if(!anchor||anchor.hasAttribute('download'))return;if(anchor.target&&anchor.target!=='_self')return;var url;try{url=new URL(anchor.href,window.location.href);}catch(err){return;}if(url.origin!==window.location.origin)return;var from=currentKey(),to=routeKey(url.pathname);if(!from||!to||from===to)return;if(reducedMotion())return;e.preventDefault();var href=url.pathname+url.search+url.hash;phase='cover';mount('is-cover');try{sessionStorage.setItem(STORE,JSON.stringify({to:to,t:Date.now()}));}catch(err){}timers.push(setTimeout(function(){window.location.assign(href);},SWEEP_MS));timers.push(setTimeout(reveal,MAX_HOLD_MS));},true);
    function prepareRoutes(){var seen={},urls=[],links=document.querySelectorAll('a[href]');for(var i=0;i<links.length;i++){var u;try{u=new URL(links[i].href,window.location.href);}catch(err){continue;}var k=routeKey(u.pathname);if(u.origin!==window.location.origin||!k||k===currentKey()||seen[u.pathname])continue;seen[u.pathname]=1;urls.push(u.pathname);}if(!urls.length)return;if(!reducedMotion()&&window.HTMLScriptElement&&HTMLScriptElement.supports&&HTMLScriptElement.supports('speculationrules')){var rules=document.createElement('script');rules.type='speculationrules';rules.textContent=JSON.stringify({prerender:[{where:{or:urls.map(function(p){return {href_matches:p};})},eagerness:'moderate'}]});document.head.appendChild(rules);}else{for(var j=0;j<urls.length;j++){var l=document.createElement('link');l.rel='prefetch';l.href=urls[j];document.head.appendChild(l);}}}
    if(document.readyState==='complete')setTimeout(prepareRoutes,0);else window.addEventListener('load',function(){setTimeout(prepareRoutes,0);});
    window.addEventListener('pageshow',function(ev){if(ev.persisted){unmount();dropEarlyCover();try{sessionStorage.removeItem(STORE);}catch(err){}}});
  }

  function wireReadingFit(){if(!document.querySelector('.reading-fit')||document.documentElement.dataset.kdReadingFit==='1')return;document.documentElement.dataset.kdReadingFit='1';function fit(){var els=document.querySelectorAll('.reading-fit');for(var i=0;i<els.length;i++){var el=els[i],w=el.parentNode.clientWidth;el.style.fontSize='500px';el.style.fontSize=Math.max(10,Math.floor(w/el.scrollWidth*500))+'px';}}fit();window.addEventListener('resize',fit);window.addEventListener('load',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);}

  // ── the four Ps ───────────────────────────────────────────────────────────
  //
  // These were a photographed room: a 2132px plate, thirty-six frames driven by
  // the scroll, and four labels positioned onto the faces of four rendered
  // cubes by a matrix per frame. It was beautiful at 1440 and it did not
  // survive being made smaller. Shrunk to a phone the names came out around
  // six pixels; cropped one cube at a time they became four separate pictures,
  // each with its label sitting over it rather than belonging to it.
  //
  // But the four Ps were never four pictures. They are four equal parts of one
  // thing, which is the argument the section is making - and four identical
  // squares say that where four photographs could not, at any width, with the
  // label inside its own square rather than floating over one.
  //
  // What is left is the four names and what each one means.
  window.KD_PS={"masses":[
    {"name":"PRODUCT","copy":"What you make.","img":"product"},
    {"name":"PRICE","copy":"What you ask.","img":"price"},
    {"name":"PLACE","copy":"Where it reaches people.","img":"place"},
    {"name":"PROMOTION","copy":"What you say and signal.","img":"promotion"}]};

  // kd-core rebuilds #observation on both DOMContentLoaded and window.load, so
  // a later rebuild can replace the runway with a fresh empty one. This stays
  // re-entrant: the observer is connected for the life of the page, and when
  // the runway is already current the callback is one querySelector and a flag.
  var psRunway=null,psBound=false;

  function psEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}

  function psMassesMarkup(d){
    var h='',k;
    for(k=0;k<d.masses.length;k++){
      h+='<li class="ps-mass">'+
         (d.masses[k].img?'<img class="ps-mass-image" src="/assets/fourps-'+psEsc(d.masses[k].img)+'.webp" alt="" loading="lazy" decoding="async">':'')+
         '<h2>'+psEsc(d.masses[k].name)+'</h2>'+
         '<p>'+psEsc(d.masses[k].copy)+'</p></li>';
    }
    return '<ul class="ps-masses">'+h+'</ul>';
  }

  function psBuild(){
    var runway=document.querySelector('.ps-runway'),d=window.KD_PS;
    if(!runway||!d||!d.masses)return false;
    if(runway===psRunway&&runway.dataset.psWired==='1')return true;
    runway.dataset.psWired='1';
    psRunway=runway;
    psRunway.innerHTML=psMassesMarkup(d);
    return true;
  }

  function wireFourPs(){
    psBuild();
    if(psBound)return;
    psBound=true;
    window.addEventListener('load',function(){setTimeout(psBuild,0);});
    try{
      new MutationObserver(psBuild).observe(
        document.querySelector('main')||document.body,{childList:true,subtree:true});
    }catch(e){}
    setTimeout(psBuild,300);setTimeout(psBuild,1200);
  }

  /* Opening a card on a touch screen.
     These cards only ever opened on :hover and :focus-visible. A phone has
     neither: iOS fakes a hover on the first tap, so a card opened by accident,
     stayed open until you tapped somewhere else, and announced nothing. The
     tap is now deliberate and says what it did - one card open at a time, tap
     an open card to close it - and the hover preview is left to pointers that
     actually hover. Enter and Space arrive here as clicks. */
  var KD_CARDS='.kd-review-card,.bench-card,.record-card,.reading-container';

  // Two of these cards ARE links: the Private and Published Reading panels.
  // They keep the link's job and the link's role; only the way a finger opens
  // them differs, below.
  function cardIsLink(card){
    return card.tagName==='A'||card.tagName==='BUTTON';
  }

  function cardHovers(){
    return !!(window.matchMedia&&window.matchMedia('(hover: hover)').matches);
  }

  function cardReduced(){
    return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* Opening a card on a phone arrived in a single frame, and it had to.
     On a desk one property moves: the panel's min-height, on a 650ms curve,
     and the copy fades up behind it. On a phone the whole layout changes -
     the panel leaves absolute positioning, the card lets go of its 2:3 ratio
     and grows to hold what is inside. Position and ratio cannot be
     transitioned at all, so there was nothing for the browser to animate and
     the card simply appeared.
     So the new layout is applied first and then played back from where the old
     one was: the panel travels and resizes from the rect it occupied to the
     one it now occupies, the card's height from its old to its new, both on
     the same curve and duration the desktop panel has always used. Nothing
     about the resting state changes - this only fills in the gap between two
     of them. */
  var CARD_PANEL='.kd-review-panel,.bench-card-panel,.record-panel,.reading-container-panel';
  var CARD_EASE='cubic-bezier(.2,.8,.2,1)';
  var CARD_MS=650;

  function cardFlip(moving,apply){
    if(cardHovers()||cardReduced()||!document.body||!document.body.animate){apply();return;}
    var before=[],i,card,panel,cr,pr;
    for(i=0;i<moving.length;i++){
      card=moving[i];panel=card.querySelector(CARD_PANEL);
      if(!panel){before.push(null);continue;}
      cr=card.getBoundingClientRect();pr=panel.getBoundingClientRect();
      before.push({panel:panel,h:cr.height,top:pr.top-cr.top,ph:pr.height});
    }
    apply();
    for(i=0;i<moving.length;i++){
      var was=before[i];
      if(!was)continue;
      card=moving[i];
      cr=card.getBoundingClientRect();pr=was.panel.getBoundingClientRect();
      var h=cr.height,top=pr.top-cr.top,ph=pr.height;
      if(Math.abs(h-was.h)<1&&Math.abs(ph-was.ph)<1&&Math.abs(top-was.top)<1)continue;
      if(Math.abs(h-was.h)>=1){
        card.animate([{height:was.h+'px'},{height:h+'px'}],
          {duration:CARD_MS,easing:CARD_EASE});
      }
      was.panel.animate([
        {height:was.ph+'px',transform:'translateY('+(was.top-top)+'px)'},
        {height:ph+'px',transform:'translateY(0)'}
      ],{duration:CARD_MS,easing:CARD_EASE});
    }
  }

  // The route sweep takes every same-origin link click in the capture phase and
  // drives the navigation itself. That is why a tap on a Reading panel left the
  // page before anything could open it: the sweep had already claimed the click
  // before the card ever saw it. It asks this first now, and stands aside for
  // the one tap that belongs to the card.
  function cardClaimsClick(e){
    var t=e.target;
    if(!t||!t.closest)return false;
    var card=t.closest(KD_CARDS);
    if(!card||!cardIsLink(card))return false;
    if(cardHovers())return false;
    return !t.closest('.container-action');
  }

  function cardsAnnounce(){
    var cards=document.querySelectorAll(KD_CARDS);
    for(var i=0;i<cards.length;i++){
      var card=cards[i];
      if(card.getAttribute('data-kd-card')!==null)continue;
      card.setAttribute('data-kd-card','');
      // A card holding its own link keeps that link's job intact; giving the
      // card a button role as well would nest one control inside another. A
      // card that IS a link keeps the role and the focus it already has.
      if(!cardIsLink(card)){
        if(!card.querySelector('a,button'))card.setAttribute('role','button');
        if(!card.hasAttribute('tabindex'))card.setAttribute('tabindex','0');
      }
      cardAria(card);
    }
  }

  // A card is open if it was tapped open, or if a keyboard has landed on it -
  // :focus-visible has always opened these. Reading both means aria-expanded
  // says what the card actually looks like rather than what was last clicked.
  function cardAria(card){
    var open=card.classList.contains('is-active');
    if(!open){try{open=card.matches(':focus-visible');}catch(e){}}
    card.setAttribute('aria-expanded',open?'true':'false');
  }

  function cardToggle(card){
    var wasOpen=card.classList.contains('is-active');
    var cards=document.querySelectorAll(KD_CARDS),moving=[card],i;
    // the one being asked for, and whichever one is giving way to it
    for(i=0;i<cards.length;i++){
      if(cards[i]!==card&&cards[i].classList.contains('is-active'))moving.push(cards[i]);
    }
    cardFlip(moving,function(){
      for(var j=0;j<cards.length;j++)cards[j].classList.remove('is-active');
      if(!wasOpen)card.classList.add('is-active');
    });
    for(i=0;i<cards.length;i++)cardAria(cards[i]);
  }

  function wireCards(){
    cardsAnnounce();
    if(wireCards.bound)return;
    wireCards.bound=true;
    document.addEventListener('click',function(e){
      var t=e.target;
      if(!t||!t.closest)return;
      var card=t.closest(KD_CARDS);
      if(!card)return;
      if(cardIsLink(card)){
        // Two of these cards are links. Where there is a real pointer, hover
        // already shows what is inside and a click goes where the link says.
        // Where there is not, one tap cannot both open the card and leave it,
        // so the card takes the tap and the row that names the destination
        // keeps it - and that row is only reachable once the card is open,
        // which is the only moment the destination has been explained.
        if(cardHovers())return;
        if(t.closest('.container-action'))return;
        e.preventDefault();
        cardToggle(card);
        return;
      }
      if(t.closest('a,button'))return;   // a control inside the card wins
      cardToggle(card);
    });
    document.addEventListener('keydown',function(e){
      if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar')return;
      var t=e.target;
      if(!t||!t.closest||t!==t.closest(KD_CARDS))return;
      if(cardIsLink(t))return;           // Enter on a link still follows it
      e.preventDefault();
      cardToggle(t);
    });
    // Focus opens these too, so the announced state has to follow focus.
    document.addEventListener('focusin',function(e){
      var t=e.target;if(!t||!t.closest)return;
      var card=t.closest(KD_CARDS);if(card)cardAria(card);
    });
    document.addEventListener('focusout',function(e){
      var t=e.target;if(!t||!t.closest)return;
      var card=t.closest(KD_CARDS);if(card)setTimeout(function(){cardAria(card);},0);
    });
  }

  normalizeShell();normalizeCtas();wireCards();wireRouteTransition();wireReadingFit();var core=document.createElement('script');core.src='/assets/kd-core.js';core.onload=function(){normalizeShell();normalizeCtas();wireCards();document.head.appendChild(style);wireRouteTransition();wireFourPs();normalizeCtas();};document.head.appendChild(core);
})();