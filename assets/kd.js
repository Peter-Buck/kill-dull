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
    '.masthead{background:var(--ink)!important;color:#fff!important}'+
    '.masthead-top{display:grid!important;grid-template-columns:1fr auto 1fr!important;align-items:center!important;gap:24px!important;padding:52px 120px 38px!important;background:var(--ink)!important;color:#fff!important}'+
    '.masthead-wordmark{justify-self:center!important;font-family:"Space Grotesk",sans-serif!important;font-weight:700!important;font-size:54px!important;letter-spacing:-.03em!important;line-height:1!important;color:#fff!important;text-align:center!important;white-space:nowrap!important}'+
    '.masthead-wordmark a{display:inline-flex!important;align-items:baseline!important;white-space:nowrap!important;font-family:"Space Grotesk",sans-serif!important;font-weight:700!important;font-size:inherit!important;letter-spacing:inherit!important;line-height:1!important;color:#fff!important}'+
    '.masthead-wordmark .terminal{order:1!important;animation:kd-terminal-compound 5.06s linear infinite!important;transform-origin:center!important}'+
    '.masthead-wordmark .tm{order:2!important;display:inline-block!important;font-size:.44em!important;vertical-align:baseline!important;line-height:1!important;margin-left:6px!important;position:relative!important;top:-.895em!important;letter-spacing:0!important;color:#fff!important}'+
    '.masthead-date,.masthead-designation{font-family:"Space Grotesk",sans-serif!important;font-size:15px!important;font-weight:700!important;letter-spacing:.10em!important;line-height:1!important;color:#fff!important;opacity:1!important;text-transform:uppercase!important;white-space:nowrap!important}'+
    '.masthead-date{text-align:left!important;justify-self:start!important}'+
    '.masthead-designation{text-align:right!important;justify-self:end!important}'+
    '.masthead-date .tm,.masthead-designation .tm{color:#fff!important}'+
    '.reg-item,.product-link,.product-cta{font-size:15px!important}'+
    '.product-orientation{font-size:15px!important}'+
    '.masthead-tagline,.bulletin-text{font-size:16px!important}'+
    '.masthead-tagline{display:none!important}'+
    '.masthead-bulletin .bulletin-label{display:none!important}'+
    '.masthead-bulletin{min-height:70px!important;box-sizing:border-box!important;position:relative!important;padding:0 120px!important;text-align:left!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:2px!important}'+
    '.masthead-bulletin .bulletin-mission{display:block!important;font-family:"Space Grotesk",sans-serif!important;font-size:16px!important;line-height:1.2!important;color:inherit!important;margin:0!important}'+
    '.masthead-bulletin .bulletin-text{position:static!important;transform:none!important;display:inline-flex!important;align-items:center!important;gap:8px!important;width:auto!important;text-align:left!important;color:inherit!important;text-decoration:none!important;margin:0!important}'+
    '.masthead-bulletin .bulletin-arrow{display:inline-block!important;color:var(--yellow)!important;transition:transform .22s cubic-bezier(.2,.8,.2,1)}'+
    '.masthead-bulletin .bulletin-text:hover .bulletin-arrow{transform:translate(2px,-2px)}'+
    '.bulletin-arrow,.enter-arrow:before,.bench-arrow:before,.pitch-arrow:before,.text-link span:before,.close-options b:before,.bench-action span:before{font-family:"Space Grotesk",sans-serif!important;font-size:16px!important;font-weight:400!important;line-height:1!important}'+
    '.unified-nav{min-height:44px!important;height:44px!important}'+
    '.footer-inner{padding:80px 120px!important}'+
    '.footer-bureau{font-size:clamp(40px,6vw,80px)!important;margin-bottom:64px!important;padding-top:32px!important}'+
    '.footer-index{margin-bottom:80px!important}'+
    '.footer-section{grid-template-columns:200px 1fr!important;padding:28px 0!important}'+
    '.footer-section-label{font-size:15px!important}'+
    '.footer-section nav a{font-size:18px!important}'+
    '.footer-colophon{font-size:13px!important}'+
    '.readings-page .accumulate{max-width:none!important;width:100%!important;text-transform:uppercase!important}'+
    '.readings-page .accumulate .hero-line-wrap{display:block!important;width:100%!important}'+
    '.readings-page .reading-container{overflow:hidden!important;transition:border-color .18s ease!important}'+
    '.readings-page .reading-container h2{margin:auto 0 0!important;transition:transform .5s cubic-bezier(.2,.8,.2,1)!important}'+
    '.readings-page .reading-container .container-copy{max-height:0!important;margin-top:0!important;padding-top:0!important;opacity:0!important;transform:translateY(10px)!important;overflow:hidden!important;transition:max-height .6s cubic-bezier(.2,.8,.2,1),opacity .4s ease,transform .5s cubic-bezier(.2,.8,.2,1),margin-top .5s ease,padding-top .5s ease!important}'+
    '.readings-page .reading-container:hover .container-copy,.readings-page .reading-container:focus-visible .container-copy{max-height:420px!important;margin-top:24px!important;padding-top:0!important;opacity:1!important;transform:translateY(0)!important}'+
    '.readings-page .reading-container:hover h2,.readings-page .reading-container:focus-visible h2{transform:translateY(-4px)!important}'+
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
    '.pitch-intro.pitch-scroll-ready .pitch-scroll-runway{position:relative;height:var(--pitch-runway-h,1100px)}'+
    '.pitch-intro.pitch-scroll-ready .pitch-scroll-stage{position:sticky;top:24px;z-index:2;background:var(--paper)}'+
    '.pitch-intro.pitch-scroll-ready .pitch-steps{height:var(--pitch-grid-h,520px)!important;align-items:start!important;overflow:hidden!important}'+
    '.pitch-intro.pitch-scroll-ready .pitch-steps>div{will-change:transform;transform:translate3d(0,var(--pitch-y,0px),0);opacity:1!important;border-right-color:#aaa69d!important}'+
    '.pitch-intro.pitch-scroll-ready .pitch-steps>div:last-child{border-right-color:transparent!important}'+
    '.kd-cta-unified{box-sizing:border-box!important;display:inline-flex!important;align-items:center!important;gap:9px!important;border:.5px solid currentColor!important;padding:10px 14px!important;background:transparent!important;color:inherit!important;text-decoration:none!important;text-transform:uppercase!important;font-family:"IBM Plex Mono",monospace!important;font-size:15px!important;font-weight:400!important;line-height:1.2!important;letter-spacing:.04em!important;transition:border-color .18s ease!important}'+
    '.kd-cta-unified *{font-family:inherit!important;font-size:inherit!important;font-weight:400!important;letter-spacing:inherit!important}'+
    '.kd-cta-unified:hover,.kd-cta-unified:focus-visible{background:transparent!important;color:inherit!important;border-color:var(--yellow)!important}'+
    '.kd-cta-unified::after{content:"↗";display:inline-block!important;font-family:"Space Grotesk",sans-serif!important;font-size:16px!important;font-weight:400!important;line-height:1!important;letter-spacing:0!important;margin-left:auto!important;transform:none!important;transition:transform .22s cubic-bezier(.2,.8,.2,1)!important}'+
    '.kd-cta-unified:hover::after,.kd-cta-unified:focus-visible::after{transform:translate(2px,-2px)!important}'+
    '.kd-cta-unified .kd-native-arrow{display:none!important}'+
    '.kd-case-action.kd-cta-unified,.kd-review-cta.kd-cta-unified,.readings-page .container-action.kd-cta-unified{width:100%!important}'+
    '.kd-case-action.kd-cta-unified{padding:18px 20px!important}'+
    '.kd-review-card:nth-of-type(5) .kd-review-cta:first-of-type{margin-bottom:24px!important}'+
    '.readings-page .container-action.kd-cta-unified{margin-top:26px!important;border-top:.5px solid currentColor!important}'+
    '.readings-page .container-action.kd-cta-unified:hover,.readings-page .container-action.kd-cta-unified:focus-visible{border-color:var(--yellow)!important}'+
    '.kd-call.kd-cta-unified,.kd-call-secondary.kd-cta-unified,.discipline-cta.kd-cta-unified{margin-top:28px!important}'+
    '.v5-home #home-close .close-options a.kd-cta-unified:hover,.v5-home #home-close .close-options a.kd-cta-unified:focus-visible{background:transparent!important;border-color:var(--yellow)!important;color:inherit!important}'+
    '@media(max-width:1279px){.masthead-top{padding-left:64px!important;padding-right:64px!important}.footer-inner{padding:64px!important}.masthead-bulletin{padding-left:64px!important;padding-right:64px!important}}'+
    '@media(max-width:767px){.masthead-top{padding:30px 24px 24px!important;grid-template-columns:1fr auto 1fr!important}.masthead-wordmark{font-size:34px!important}.masthead-date,.masthead-designation{font-size:9px!important;letter-spacing:.08em!important}.masthead-bulletin{padding-left:24px!important;padding-right:24px!important}.footer-inner{padding:48px 24px!important}.footer-section{grid-template-columns:1fr!important;gap:12px!important}.readings-page .reading-container .container-copy{max-height:none!important;margin-top:24px!important;opacity:1!important;transform:none!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-runway{height:auto!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-stage{position:static!important}.pitch-intro.pitch-scroll-ready .pitch-steps{height:auto!important;overflow:visible!important}.pitch-intro.pitch-scroll-ready .pitch-steps>div{transform:none!important;will-change:auto!important;border-right-color:transparent!important}}'+
    '@media(prefers-reduced-motion:reduce){.readings-page .reading-container h2,.readings-page .reading-container .container-copy{transition:none!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-runway{height:auto!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-stage{position:static!important}.pitch-intro.pitch-scroll-ready .pitch-steps{height:auto!important;overflow:visible!important}.pitch-intro.pitch-scroll-ready .pitch-steps>div{transform:none!important;will-change:auto!important;border-right-color:transparent!important}.kd-cta-unified::after{transition:none!important}}'+
    '.kd-skip{position:absolute!important;left:-9999px!important;top:0;z-index:10001;display:inline-block;padding:12px 18px;background:var(--ink,#24222B);color:var(--paper,#FFFFFF)!important;font-family:"IBM Plex Mono",monospace;font-size:15px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none}.kd-skip:focus{left:12px!important;top:12px!important;outline:2px solid #FFFF00;outline-offset:2px}main:focus{outline:none}:focus-visible{outline:2px solid #FFFF00!important;outline-offset:2px!important;box-shadow:0 0 0 4px #24222B!important}.product-orientation>span:last-child{color:#736F65!important}.viewport.is-dark .product-orientation>span:last-child,.bench-process .product-orientation>span:last-child,#discuss .product-orientation>span:last-child,.record-intro .product-orientation>span:last-child,.dept-section:not(.is-light) .product-orientation>span:last-child{color:#A5A299!important}.reg-item{color:#A09D94!important}.reg-item.is-current,.reg-item.is-active{color:#FFFFFF!important}'+
    '.kd-talk{background:var(--paper)!important;color:var(--ink)!important}'+
    '.kd-talk .hero-line{color:var(--ink)!important}'+
    '.kd-talk-cta{margin-top:36px;width:max-content}';
  document.head.appendChild(style);

  function routeKey(pathname){
    var p=pathname.replace(/\/$/,'');
    if(p===''||p==='/index.html')return 'home';
    if(p==='/bench'||p==='/bench.html')return 'bench';
    if(p==='/pitch'||p==='/pitch.html')return 'pitch';
    if(p==='/readings'||p==='/readings.html')return 'readings';
    if(p==='/discipline'||p==='/discipline.html'||p==='/go-deeper'||p==='/go-deeper.html')return 'discipline';
    if(p==='/bureau'||p==='/bureau.html')return 'bureau';
    return '';
  }

  function currentKey(){return routeKey(window.location.pathname);}

  function normalizeShell(){
    var key=currentKey();
    var wm=document.querySelector('.masthead-wordmark a');
    if(wm) wm.innerHTML='KILL DULL<span class="terminal"></span><span class="tm">™</span>';
    var date=document.querySelector('.masthead-date');
    if(date) date.textContent='THE DENSE IDEA COMPANY™';
    var designation=document.querySelector('.masthead-designation');
    if(designation) designation.textContent='AAH. HMM. DULL.';
    var tagline=document.querySelector('.masthead-tagline');
    if(tagline) tagline.textContent='';
    var bulletin=document.querySelector('.masthead-bulletin');
    if(bulletin) bulletin.innerHTML='<a class="bulletin-text" href="/readings">Here to compound. Readings in production.<span class="bulletin-arrow">↗</span></a>';
    var desktop=document.getElementById('registrar-desktop');
    if(desktop) desktop.innerHTML='<a class="reg-item'+(key==='home'?' is-current':'')+'" href="/">KILL DULL</a><a class="reg-item'+(key==='discipline'?' is-current':'')+'" href="/discipline">DISCIPLINE</a><a class="reg-item'+(key==='bench'?' is-current':'')+'" href="/bench">BENCH</a><a class="reg-item'+(key==='readings'?' is-current':'')+'" href="/readings">READINGS</a>';
    var products=document.querySelector('.unified-nav-products');
    if(products) products.innerHTML='<a class="product-cta" href="/bench#discuss"><span class="enter-text">DECISION COMING UP?</span><span class="enter-arrow">↗</span></a>';
    var mobile=document.querySelector('.registrar-mobile');
    if(mobile){var label=key==='discipline'?'DISCIPLINE':key==='bench'?'BENCH':key==='readings'?'READINGS':key==='bureau'?'THE BUREAU':key==='pitch'?'PITCH':'KILL DULL';mobile.innerHTML='<button class="reg-mobile-current" id="reg-mobile-btn"><span id="reg-mobile-label">'+label+'</span><span class="reg-mobile-arrow">▾</span></button><div class="reg-mobile-dropdown" id="reg-mobile-dropdown" hidden><a class="reg-item" href="/">KILL DULL</a><a class="reg-item" href="/discipline">DISCIPLINE</a><a class="reg-item" href="/bench">BENCH</a><a class="reg-item" href="/readings">READINGS</a></div>';}
    var burberry=document.querySelector('.readings-page img[alt="Burberry"]');
    if(burberry){burberry.src='/assets/burberry-logo.svg';burberry.classList.add('native-cream');}
    var starbucks=document.querySelector('.readings-page img[alt="Starbucks"]');
    if(starbucks){starbucks.src='/assets/starbucks-logo.svg';starbucks.classList.add('native-cream');}
    var accumulate=document.querySelector('.readings-page .accumulate');
    if(accumulate) accumulate.innerHTML='<span class="hero-line-wrap"><span class="hero-line js-fit">A BODY OF EVIDENCE ABOUT WHAT</span></span><span class="hero-line-wrap"><span class="hero-line js-fit">COMPOUNDS — AND WHAT DOESN’T.</span></span>';
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
        '<a class="kd-cta-unified kd-talk-cta" href="mailto:human@killdull.com">REALHUMAN@KILLDULL.COM</a>';
      footEl.parentNode.insertBefore(contact,footEl);
    }
    var footer=document.querySelector('.footer');
    if(footer) footer.innerHTML='<div class="footer-inner"><div class="footer-bureau">THE BUREAU.</div><div class="footer-index"><div class="footer-section"><div class="footer-section-label">DISCIPLINE</div><nav aria-label="Discipline"><a href="/discipline">The Dense Idea Discipline</a></nav></div><div class="footer-section"><div class="footer-section-label">THE BENCH</div><nav aria-label="The Bench"><a href="/bench">How The Bench Works</a><a href="/readings">Private Readings</a><a href="/readings#record">Published Readings</a></nav></div><div class="footer-section"><div class="footer-section-label">KILL DULL</div><nav aria-label="Kill Dull"><a href="/bureau">Department of Hard Evidence</a><a href="/faq">FAQ</a><a href="/accessibility.html" aria-label="Accessibility statement">Accessibility</a><a href="/privacy.html" aria-label="Privacy policy">Privacy</a><a href="/terms.html" aria-label="Terms of use">Terms</a></nav></div></div><div class="footer-colophon"><span>© 2026 Kill Dull. All rights reserved.</span></div></div>';
  }

  function normalizeCtas(){
    var selector='.product-cta,.bench-action,.reading-cta,.pitch-go,.pitch-watch,.kd-call,.kd-call-secondary,.kd-review-cta,.kd-case-action,.discipline-cta,.text-link,.close-options a,.readings-page .container-action';
    var ctas=document.querySelectorAll(selector);
    for(var i=0;i<ctas.length;i++){
      var cta=ctas[i];
      cta.classList.add('kd-cta-unified');
      var nativeArrows=cta.querySelectorAll('.enter-arrow,.bench-arrow,.pitch-arrow,.kd-review-cta-arrow,.kd-case-action-arrow');
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
    document.addEventListener('click',function(e){if(phase!=='idle')return;if(e.defaultPrevented||e.button!==0)return;if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var anchor=e.target&&e.target.closest?e.target.closest('a'):null;if(!anchor||anchor.hasAttribute('download'))return;if(anchor.target&&anchor.target!=='_self')return;var url;try{url=new URL(anchor.href,window.location.href);}catch(err){return;}if(url.origin!==window.location.origin)return;var from=currentKey(),to=routeKey(url.pathname);if(!from||!to||from===to)return;if(reducedMotion())return;e.preventDefault();var href=url.pathname+url.search+url.hash;phase='cover';mount('is-cover');try{sessionStorage.setItem(STORE,JSON.stringify({to:to,t:Date.now()}));}catch(err){}timers.push(setTimeout(function(){window.location.assign(href);},SWEEP_MS));timers.push(setTimeout(reveal,MAX_HOLD_MS));},true);
    function prepareRoutes(){var seen={},urls=[],links=document.querySelectorAll('a[href]');for(var i=0;i<links.length;i++){var u;try{u=new URL(links[i].href,window.location.href);}catch(err){continue;}var k=routeKey(u.pathname);if(u.origin!==window.location.origin||!k||k===currentKey()||seen[u.pathname])continue;seen[u.pathname]=1;urls.push(u.pathname);}if(!urls.length)return;if(!reducedMotion()&&window.HTMLScriptElement&&HTMLScriptElement.supports&&HTMLScriptElement.supports('speculationrules')){var rules=document.createElement('script');rules.type='speculationrules';rules.textContent=JSON.stringify({prerender:[{where:{or:urls.map(function(p){return {href_matches:p};})},eagerness:'moderate'}]});document.head.appendChild(rules);}else{for(var j=0;j<urls.length;j++){var l=document.createElement('link');l.rel='prefetch';l.href=urls[j];document.head.appendChild(l);}}}
    if(document.readyState==='complete')setTimeout(prepareRoutes,0);else window.addEventListener('load',function(){setTimeout(prepareRoutes,0);});
    window.addEventListener('pageshow',function(ev){if(ev.persisted){unmount();dropEarlyCover();try{sessionStorage.removeItem(STORE);}catch(err){}}});
  }

  function wireReadingFit(){if(!document.querySelector('.reading-fit')||document.documentElement.dataset.kdReadingFit==='1')return;document.documentElement.dataset.kdReadingFit='1';function fit(){var els=document.querySelectorAll('.reading-fit');for(var i=0;i<els.length;i++){var el=els[i],w=el.parentNode.clientWidth;el.style.whiteSpace='nowrap';el.style.fontSize='500px';el.style.fontSize=Math.max(10,Math.floor(w/el.scrollWidth*500))+'px';}}fit();window.addEventListener('resize',fit);window.addEventListener('load',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);}

  function wirePitchScroll(){var pitch=document.getElementById('pitch-intro');if(!pitch||pitch.dataset.scrollWired==='1')return;pitch.dataset.scrollWired='1';pitch.classList.add('pitch-scroll-ready');var grid=pitch.querySelector('.pitch-steps'),actions=pitch.querySelector('.pitch-actions');if(!grid||!actions)return;var runway=document.createElement('div');runway.className='pitch-scroll-runway';var stage=document.createElement('div');stage.className='pitch-scroll-stage';var first=pitch.firstElementChild,nodes=[],node=first;while(node&&node!==actions){nodes.push(node);node=node.nextElementSibling;}pitch.insertBefore(runway,first);runway.appendChild(stage);for(var n=0;n<nodes.length;n++)stage.appendChild(nodes[n]);var steps=stage.querySelectorAll('.pitch-steps>div');if(!steps.length)return;var stagger=90,startOffset=220,settle=startOffset+(steps.length-1)*stagger+50;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;var ticking=false,travel=560;function clamp(v,min,max){return Math.max(min,Math.min(max,v));}function update(){ticking=false;if(window.innerWidth<768)return;var rect=runway.getBoundingClientRect(),stickyTop=24,scrolled=clamp(stickyTop-rect.top,0,travel),progress=scrolled/travel,maxY=0;for(var i=0;i<steps.length;i++){var y=Math.max(0,startOffset+(i*stagger)-(progress*settle));maxY=Math.max(maxY,y);steps[i].style.setProperty('--pitch-y',y.toFixed(1)+'px');}var gridHeight=150+Math.min(370,maxY);grid.style.setProperty('--pitch-grid-h',gridHeight.toFixed(1)+'px');var stageHeight=stage.offsetHeight;runway.style.setProperty('--pitch-runway-h',(stageHeight+travel).toFixed(1)+'px');}function requestUpdate(){if(ticking)return;ticking=true;requestAnimationFrame(update);}update();window.addEventListener('scroll',requestUpdate,{passive:true});window.addEventListener('resize',requestUpdate);}

  // Plate geometry, emitted by the render so the markup and the scroll
  // driver cannot drift from the image they are positioning against.
  window.KD_PS={"w":2132,"h":2400,"n":36,"band":{"x":0,"y":890,"w":2132,"h":640},"anchor":1257,"top":1082,"bot":1449,"masses":[{"name":"PRODUCT","copy":"What you make."},{"name":"PRICE","copy":"What you ask."},{"name":"PLACE","copy":"Where and how it reaches people."},{"name":"PROMOTION","copy":"What you say and signal."}],"frames":[[[0.80765,0.00117,226.286324,-0.007944,0.818512,1084.277773,-7e-06,1e-06],[0.835954,0.001187,691.803109,0.018068,0.830159,1083.853054,1.6e-05,1e-06],[0.786193,0.001172,1098.720702,-0.019783,0.818813,1084.266901,-1.8e-05,1e-06],[0.836576,0.001188,1582.712782,0.01008,0.83138,1083.808565,9e-06,1e-06]],[[0.8078,0.00117,239.053824,-0.007653,0.81824,1084.287715,-7e-06,1e-06],[0.835954,0.001187,691.803109,0.018068,0.830159,1083.853054,1.6e-05,1e-06],[0.786263,0.001171,1098.245052,-0.019768,0.818849,1084.265471,-1.8e-05,1e-06],[0.836576,0.001188,1582.712782,0.01008,0.83138,1083.808565,9e-06,1e-06]],[[0.808298,0.00117,251.563977,-0.007046,0.817876,1084.301019,-6e-06,1e-06],[0.835954,0.001187,691.803109,0.018068,0.830159,1083.853054,1.6e-05,1e-06],[0.787724,0.001172,1095.54047,-0.019361,0.819405,1084.2453,-1.7e-05,1e-06],[0.836237,0.001187,1572.294747,0.009839,0.831121,1083.817935,9e-06,1e-06]],[[0.809015,0.001169,263.617494,-0.006243,0.817489,1084.315109,-6e-06,1e-06],[0.83582,0.001186,694.338551,0.0178,0.829981,1083.859563,1.6e-05,1e-06],[0.790342,0.001172,1093.156504,-0.018543,0.820241,1084.214759,-1.7e-05,1e-06],[0.835166,0.001186,1555.122691,0.008882,0.830409,1083.843899,8e-06,1e-06]],[[0.809858,0.001168,275.1218,-0.005311,0.817097,1084.329414,-5e-06,1e-06],[0.835517,0.001186,697.098475,0.016952,0.829567,1083.874655,1.5e-05,1e-06],[0.793858,0.001175,1091.046516,-0.017371,0.821284,1084.176707,-1.6e-05,1e-06],[0.833714,0.001186,1538.724662,0.007533,0.829559,1083.874941,7e-06,1e-06]],[[0.810755,0.001167,286.012911,-0.004297,0.816716,1084.34329,-4e-06,1e-06],[0.835055,0.001186,699.352569,0.015671,0.829024,1083.894467,1.4e-05,1e-06],[0.798121,0.001176,1089.2086,-0.015862,0.822503,1084.13229,-1.4e-05,1e-06],[0.831973,0.001183,1523.399036,0.005969,0.828657,1083.907843,5e-06,1e-06]],[[0.811653,0.001167,296.242396,-0.003239,0.81635,1084.356594,-3e-06,1e-06],[0.834361,0.001185,701.178158,0.014017,0.828375,1083.918142,1.3e-05,1e-06],[0.80298,0.001179,1087.660292,-0.014034,0.823877,1084.082222,-1.3e-05,1e-06],[0.830019,0.001182,1509.323849,0.004313,0.827756,1083.940673,4e-06,1e-06]],[[0.81251,0.001167,305.774068,-0.002172,0.816004,1084.369254,-2e-06,1e-06],[0.833346,0.001183,702.630268,0.012037,0.827641,1083.944893,1.1e-05,1e-06],[0.808246,0.001179,1086.428025,-0.011915,0.825376,1084.027433,-1.1e-05,1e-06],[0.827924,0.001183,1496.594536,0.002652,0.826889,1083.972359,2e-06,1e-06]],[[0.813304,0.001166,314.582163,-0.00112,0.815682,1084.381056,-1e-06,1e-06],[0.831927,0.001182,703.756807,0.009787,0.826838,1083.974147,9e-06,1e-06],[0.813688,0.001184,1085.535182,-0.009557,0.826969,1083.969426,-9e-06,1e-06],[0.825762,0.001182,1485.23308,0.001049,0.826075,1084.002042,1e-06,1e-06]],[[0.814017,0.001166,322.651655,-0.000105,0.815382,1084.391928,-0.0,1e-06],[0.830046,0.001181,704.605682,0.007339,0.82599,1084.005117,7e-06,1e-06],[0.81904,0.001184,1084.990275,-0.007035,0.828599,1083.909988,-6e-06,1e-06],[0.823603,0.001179,1475.200343,-0.000456,0.825326,1084.029293,-0.0,1e-06]],[[0.814643,0.001166,329.976569,0.000857,0.815111,1084.40187,1e-06,1e-06],[0.827709,0.00118,705.226072,0.004789,0.825124,1084.03666,4e-06,1e-06],[0.824037,0.001187,1084.774371,-0.004458,0.830208,1083.851266,-4e-06,1e-06],[0.821506,0.001179,1466.416011,-0.001839,0.824651,1084.053898,-2e-06,1e-06]],[[0.81518,0.001165,336.558655,0.001754,0.814864,1084.41081,2e-06,1e-06],[0.825001,0.001179,705.667919,0.002259,0.824278,1084.067559,2e-06,1e-06],[0.828455,0.001189,1084.83702,-0.00195,0.831728,1083.795834,-2e-06,1e-06],[0.819514,0.001179,1458.785158,-0.00309,0.824049,1084.075928,-3e-06,1e-06]],[[0.815632,0.001165,342.40633,0.002571,0.814645,1084.418821,2e-06,1e-06],[0.822097,0.001177,705.97767,-0.00012,0.82349,1084.096241,-0.0,1e-06],[0.832151,0.001191,1085.100197,0.000366,0.833098,1083.745909,0.0,1e-06],[0.817667,0.001178,1452.219974,-0.004201,0.823518,1084.09524,-4e-06,1e-06]],[[0.816006,0.001165,347.532938,0.003307,0.814453,1084.425831,3e-06,1e-06],[0.819233,0.001176,706.194146,-0.002228,0.822798,1084.12149,-2e-06,1e-06],[0.835084,0.001192,1085.473422,0.002388,0.83427,1083.703136,2e-06,1e-06],[0.816,0.001177,1446.649803,-0.005168,0.82306,1084.111977,-5e-06,1e-06]],[[0.81631,0.001164,351.958907,0.003954,0.814286,1084.431911,4e-06,1e-06],[0.816625,0.001176,706.346511,-0.003992,0.822221,1084.14259,-4e-06,1e-06],[0.837298,0.001194,1085.873588,0.004055,0.835222,1083.668447,4e-06,1e-06],[0.814539,0.001178,1442.01708,-0.00599,0.822674,1084.126139,-5e-06,1e-06]],[[0.814418,0.001163,323.144269,0.003216,0.812932,1084.481335,3e-06,1e-06],[0.816625,0.001176,706.346511,-0.003992,0.822221,1084.14259,-4e-06,1e-06],[0.837298,0.001194,1085.873588,0.004055,0.835222,1083.668447,4e-06,1e-06],[0.81584,0.001175,1486.291505,-0.004234,0.82173,1084.160471,-4e-06,1e-06]],[[0.810439,0.001159,290.833073,0.001329,0.810481,1084.57067,1e-06,1e-06],[0.816625,0.001176,706.346511,-0.003992,0.822221,1084.14259,-4e-06,1e-06],[0.837298,0.001194,1085.873588,0.004055,0.835222,1083.668447,4e-06,1e-06],[0.817604,0.001173,1514.353179,-0.002052,0.820973,1084.188008,-2e-06,1e-06]],[[0.806415,0.001156,266.782874,-0.000629,0.808284,1084.650779,-1e-06,1e-06],[0.816625,0.001176,706.346511,-0.003992,0.822221,1084.14259,-4e-06,1e-06],[0.840189,0.001198,1099.484817,0.004695,0.837675,1083.578968,4e-06,1e-06],[0.819188,0.001173,1536.820157,0.000125,0.820341,1084.211111,0.0,1e-06]],[[0.802362,0.001153,246.917911,-0.002563,0.806275,1084.724092,-2e-06,1e-06],[0.816643,0.001176,701.198872,-0.004072,0.822335,1084.13837,-4e-06,1e-06],[0.843808,0.001202,1110.851482,0.005757,0.840621,1083.471537,5e-06,1e-06],[0.820514,0.001173,1556.163452,0.00226,0.819786,1084.231424,2e-06,1e-06]],[[0.798263,0.00115,229.700345,-0.004453,0.804408,1084.792185,-4e-06,1e-06],[0.816236,0.001177,684.118375,-0.004898,0.822952,1084.115911,-4e-06,1e-06],[0.847123,0.001206,1120.111845,0.006861,0.843309,1083.373547,6e-06,1e-06],[0.821575,0.001171,1573.449242,0.004349,0.819281,1084.249735,4e-06,1e-06]],[[0.794103,0.001148,214.354149,-0.006298,0.80265,1084.856272,-6e-06,1e-06],[0.815553,0.001178,672.221035,-0.005818,0.823458,1084.097457,-5e-06,1e-06],[0.850165,0.001208,1128.186832,0.007963,0.845793,1083.282924,7e-06,1e-06],[0.822373,0.001171,1589.252424,0.006391,0.818816,1084.266758,6e-06,1e-06]],[[0.789871,0.001145,200.42329,-0.008102,0.800981,1084.91714,-7e-06,1e-06],[0.814755,0.001178,662.536362,-0.00673,0.823893,1084.081578,-6e-06,1e-06],[0.852981,0.001213,1135.482329,0.009055,0.84813,1083.197737,8e-06,1e-06],[0.822918,0.00117,1603.924238,0.008391,0.818381,1084.282565,8e-06,1e-06]],[[0.785563,0.001143,187.613092,-0.009864,0.799388,1084.975219,-9e-06,1e-06],[0.813884,0.001179,654.148511,-0.007625,0.824281,1084.067416,-7e-06,1e-06],[0.855602,0.001217,1142.217542,0.010134,0.850347,1083.116913,9e-06,1e-06],[0.82322,0.00117,1617.697744,0.010352,0.81797,1084.297585,9e-06,1e-06]],[[0.781175,0.001141,175.720454,-0.01159,0.797856,1085.03108,-1e-05,1e-06],[0.812954,0.001179,646.639589,-0.008503,0.824634,1084.054542,-8e-06,1e-06],[0.858054,0.001218,1148.526539,0.0112,0.852464,1083.039665,1e-05,1e-06],[0.823288,0.001168,1630.736236,0.012276,0.817578,1084.311819,1.1e-05,1e-06]],[[0.776706,0.001139,164.59784,-0.013279,0.796378,1085.084939,-1.2e-05,1e-06],[0.811978,0.00118,639.777489,-0.009363,0.824962,1084.042597,-8e-06,1e-06],[0.860357,0.001222,1154.497638,0.012253,0.854503,1082.96535,1.1e-05,1e-06],[0.823131,0.001167,1643.159801,0.014164,0.817203,1084.32548,1.3e-05,1e-06]],[[0.772154,0.001136,154.134518,-0.014936,0.794948,1085.137081,-1.3e-05,1e-06],[0.810958,0.00118,633.418042,-0.010207,0.825267,1084.031439,-9e-06,1e-06],[0.862524,0.001225,1160.193234,0.013294,0.856472,1082.893538,1.2e-05,1e-06],[0.822759,0.001168,1655.059301,0.016021,0.816842,1084.338713,1.4e-05,1e-06]],[[0.767519,0.001134,144.244441,-0.016562,0.793562,1085.18765,-1.5e-05,1e-06],[0.8099,0.00118,627.464162,-0.011037,0.825556,1084.020925,-1e-05,1e-06],[0.864566,0.001228,1165.658947,0.014325,0.858381,1082.823944,1.3e-05,1e-06],[0.822178,0.001166,1666.505517,0.017847,0.816491,1084.351444,1.6e-05,1e-06]],[[0.762804,0.001133,134.859463,-0.018158,0.792215,1085.236788,-1.6e-05,1e-06],[0.808805,0.001181,621.846719,-0.011854,0.825829,1084.010983,-1.1e-05,1e-06],[0.866496,0.001231,1170.929343,0.015345,0.860238,1082.756209,1.4e-05,1e-06],[0.821396,0.001167,1677.554998,0.019644,0.816154,1084.363818,1.8e-05,1e-06]],[[0.758007,0.001131,125.924553,-0.019726,0.790902,1085.28471,-1.8e-05,1e-06],[0.807678,0.00118,616.5145,-0.012659,0.826088,1084.00147,-1.1e-05,1e-06],[0.868318,0.001234,1176.031234,0.016355,0.862048,1082.690191,1.5e-05,1e-06],[0.820418,0.001166,1688.253366,0.021413,0.815822,1084.375906,1.9e-05,1e-06]],[[0.753131,0.001129,117.394375,-0.021268,0.78962,1085.331416,-1.9e-05,1e-06],[0.806518,0.001182,611.428366,-0.013453,0.826339,1083.992386,-1.2e-05,1e-06],[0.87004,0.001236,1180.986479,0.017356,0.863815,1082.625747,1.6e-05,1e-06],[0.819251,0.001165,1698.638233,0.023155,0.815498,1084.387708,2.1e-05,1e-06]],[[0.748176,0.001127,109.230879,-0.022783,0.788368,1085.377121,-2e-05,1e-06],[0.805329,0.001182,606.557564,-0.014235,0.826578,1083.98366,-1.3e-05,1e-06],[0.871667,0.001239,1185.812105,0.018348,0.865546,1082.562661,1.6e-05,1e-06],[0.817902,0.001165,1708.741117,0.024872,0.815181,1084.399223,2.2e-05,1e-06]],[[0.743145,0.001125,101.402056,-0.024274,0.78714,1085.421824,-2.2e-05,1e-06],[0.80411,0.001182,601.877378,-0.015008,0.826809,1083.97522,-1.3e-05,1e-06],[0.873205,0.001241,1190.522853,0.019332,0.867241,1082.500792,1.7e-05,1e-06],[0.816374,0.001164,1718.588449,0.026563,0.81487,1084.410596,2.4e-05,1e-06]],[[0.738038,0.001124,93.880362,-0.025741,0.78594,1085.465598,-2.3e-05,1e-06],[0.802863,0.001182,597.367666,-0.015772,0.82703,1083.967137,-1.4e-05,1e-06],[0.874658,0.001243,1195.130542,0.020309,0.868905,1082.440138,1.8e-05,1e-06],[0.814674,0.001165,1728.202848,0.028232,0.814564,1084.421754,2.5e-05,1e-06]],[[0.732858,0.001122,86.642106,-0.027185,0.784763,1085.508513,-2.4e-05,1e-06],[0.801588,0.001182,593.01159,-0.016528,0.827244,1083.959341,-1.5e-05,1e-06],[0.87603,0.001246,1199.645337,0.021278,0.870541,1082.380486,1.9e-05,1e-06],[0.812804,0.001162,1737.603885,0.029876,0.814261,1084.432769,2.7e-05,1e-06]],[[0.727605,0.00112,79.666812,-0.028607,0.783606,1085.550714,-2.6e-05,1e-06],[0.800288,0.001183,588.794917,-0.017275,0.827453,1083.951759,-1.6e-05,1e-06],[0.877323,0.001248,1204.076007,0.02224,0.872149,1082.321835,2e-05,1e-06],[0.810771,0.001165,1746.80808,0.031498,0.813965,1084.443641,2.8e-05,1e-06]],[[0.722281,0.001119,72.936403,-0.030007,0.782471,1085.592127,-2.7e-05,1e-06],[0.798962,0.001184,584.70583,-0.018014,0.827656,1083.944392,-1.6e-05,1e-06],[0.878541,0.00125,1208.43005,0.023195,0.873732,1082.264113,2.1e-05,1e-06],[0.808577,0.001164,1755.830554,0.033098,0.813671,1084.45437,3e-05,1e-06]]],"floor":"#65635B","still":{"w":1280,"h":516}};

  // ── the four Ps room ─────────────────────────────────────────────────────
  // A rendered cream room. The masses and their shadows are a Cycles frame
  // SEQUENCE, not sprites: they move in depth as well as across, they sit at
  // four different depths rather than in a regimented row, and their shadows
  // fall on each other because every frame is one render. Sprites could not do
  // any of that - measured against real depth-moved renders, transforming a
  // flat sprite was worse than not moving it at all.
  //
  // The movement is in two stages. The masses are first pressed TOGETHER until
  // their faces are a few pixels apart - decelerating the whole way, because
  // the repulsion they are being pushed into keeps growing - and then let go,
  // which throws them wide. Each one also turns and changes depth as it
  // travels, lagged behind the lateral move so the back half of the scroll is
  // still doing something after the spring has spent itself.
  //
  // There is exactly ONE block of copy in this section and it never fades: it
  // is there when the section arrives, it does not move, and it is still there
  // when the masses settle. There is no second block, no alternate state and
  // nothing revealed later.
  //
  // The room plate is static and carries the whole frame; each sequence frame
  // is RGBA over it, opaque only where it differs from the room. Two <img>
  // layers crossfade so the frames read as continuous movement.
  //
  // kd-core rebuilds #observation on both DOMContentLoaded and window.load, so
  // a later rebuild can replace the runway with a fresh empty one. Everything
  // below is re-entrant: state lives in module scope, listeners attach once,
  // and the observer stays connected for the life of the page.
  var psRunway=null,psPlate=null,psBound=false,psTicking=false,psCopies=[],
      psA=null,psB=null,psIA=-1,psIB=-1,psLabels=[],psPreload=[];

  function psReduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  // Ask the same question the stylesheet asks, so the two can never disagree
  // about which treatment is on - innerWidth and the CSS viewport are not
  // always the same number on a tablet, and when they differed the stage was
  // built, hidden by CSS, and every frame fetched for nothing.
  function psSmall(){return !!(window.matchMedia&&
    window.matchMedia('(max-width: 900px)').matches)||window.innerWidth<900;}
  function psEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function psSrc(i){return '/assets/ps-f'+(i<10?'0':'')+i+'.webp';}

  // Phones get the settled composition as one flat image and nothing else: no
  // runway, no sticky stage, no frame sequence, no substitute animation. The
  // section is ordinary document flow - rule, headline, copy, image, copy - and
  // the image is only ever written into the page below 900px, so wider
  // viewports never request it.
  function psStillMarkup(d){
    var s=d.still||{w:1280,h:516},k,alt=[];
    for(k=0;k<4;k++)alt.push(d.masses[k].name+' - '+d.masses[k].copy);
    return '<img class="ps-still" src="/assets/ps-still.webp" width="'+s.w+
           '" height="'+s.h+'" decoding="async" alt="'+
           psEsc('The four Ps as four masses in a cream room. '+alt.join(' '))+'">';
  }

  function psStageMarkup(d){
    var b=d.band,M=d.masses,k,
        h='<div class="ps-stage"><div class="ps-plate">'+
          '<img class="ps-room-img" src="/assets/ps-room.webp" alt="" width="'+d.w+
          '" height="'+d.h+'" decoding="async">';
    // two frame layers, crossfaded; both sit exactly on the band the sequence
    // was rendered from
    var st='left:'+b.x+'px;top:'+b.y+'px;width:'+b.w+'px;height:'+b.h+'px';
    // decoding="async" is load-bearing, not decoration. Assigning src to a
    // DISPLAYED <img> decodes it before the next paint unless this is set, and
    // that decode lands on the frame the index changes - measured at 32.8ms
    // mean against 16.7ms for every other frame, 31 of 34 of them over 20ms.
    // The swap always lands on whichever layer is currently transparent, so
    // letting it paint late costs nothing visible.
    h+='<img class="ps-frame" data-ps-l="a" alt="" aria-hidden="true" decoding="async" style="'+st+'">'+
       '<img class="ps-frame" data-ps-l="b" alt="" aria-hidden="true" decoding="async" style="'+st+'">';
    for(k=0;k<4;k++){
      h+='<div class="ps-label" data-ps-i="'+k+'"><h3>'+psEsc(M[k].name)+'</h3>'+
         '<p>'+psEsc(M[k].copy)+'</p></div>';
    }
    return h+'</div></div>';
  }

  function psFit(){
    if(!psRunway)return;
    var vw=document.documentElement.clientWidth,vh=document.documentElement.clientHeight,
        d=window.KD_PS;
    psRunway.style.setProperty('--ps-vw',vw+'px');
    psRunway.style.marginBottom='';
    if(!psPlate||!d)return;
    psPlate.style.setProperty('--ps-pw',d.w+'px');
    psPlate.style.setProperty('--ps-ph',d.h+'px');
    // The plate is 2132x1600, so for any viewport wider than 4:3 this resolves
    // to the WIDTH term: the whole horizontal composition is always shown and
    // only the empty room above and below is ever cropped.
    var s=Math.max(vw/d.w,vh/d.h);
    psPlate.style.setProperty('--ps-s',s);
    // Explicit pixel offsets with transform-origin 0 0: a percentage translate
    // resolves against the element's UNSCALED width and cannot centre a scaled
    // plate. Clamped so the plate always covers the stage.
    var ox=(vw-d.w*s)/2;
    psPlate.style.setProperty('--ps-ox',ox.toFixed(1)+'px');
    // The section opens on the same rhythm as every other section on the site.
    // Measured at 1440: BENCH's rule sits 81px below the top of its section -
    // 72px of .viewport section padding plus 9px down an 18px marker row. This
    // marker row is 15px, and the site now seats every rule 9px down it, so 72px
    // of top offset - the .viewport section-start padding itself - puts the two
    // rules on the same line. It was 74 before the seat was normalised to 9px.
    var i,w,last,wt,pad,tall,copy=0;
    for(i=0;i<psCopies.length;i++){
      w=psCopies[i];last=w.lastElementChild;
      if(!last)continue;
      w.style.transform='';w.style.paddingTop='72px';
      wt=w.getBoundingClientRect().top;
      copy=Math.max(copy,last.getBoundingClientRect().bottom-wt);
    }

    // The masses hang off the END OF THE COPY, not off a fraction of the
    // viewport. A viewport fraction held the composition together at 900px tall
    // and pulled it apart above that - 74px between the last line and the mass
    // tops at 1440x900, 269 at 1920x1080, 540 at 2560x1440, because the copy
    // does not grow with the screen and the masses do. Hung off the copy, the
    // gap is the same fraction of a mass's height at every size.
    var gap=0.29*((d.bot||0)-(d.top||0))*s,
        oy=copy+gap-(d.top||0)*s;
    // keep a little floor under them, never expose bare stage above the plate,
    // and always cover the bottom of the stage
    oy=Math.min(oy,vh-24-(d.bot||d.anchor)*s);
    oy=Math.max(Math.min(oy,0),vh-d.h*s);
    psPlate.style.setProperty('--ps-oy',oy.toFixed(1)+'px');

    // The section ends sooner after the masses. Two fifths of the floor below
    // them is taken out of the section's height in flow, so the section that
    // follows rises into it. Nothing inside the stage moves: the plate, the
    // masses, the copy and the whole composition above their base are exactly
    // where they were - only where the room stops is different.
    psRunway.style.marginBottom=
      (-Math.max(0,(vh-(oy+(d.bot||d.anchor)*s))*0.40)).toFixed(1)+'px';

    // If those clamps have pulled the masses up into the copy - a window too
    // short to hold both - scale the copy about the text's own left edge, so
    // the margin stays where every other section puts it.
    var room=oy+(d.top||0)*s;
    for(i=0;i<psCopies.length;i++){
      w=psCopies[i];last=w.lastElementChild;
      if(!last)continue;
      wt=w.getBoundingClientRect().top;
      tall=last.getBoundingClientRect().bottom-wt;
      if(tall>room-gap){
        pad=parseFloat(getComputedStyle(w).paddingLeft)||0;
        w.style.transformOrigin=pad+'px 0';
        w.style.transform='scale('+Math.max(0.55,(room-gap)/tall).toFixed(4)+')';
      }
    }
  }

  // build a CSS matrix3d from the 8 homography coefficients the render emitted
  function psMatrix(c){
    return 'matrix3d('+c[0]+','+c[3]+',0,'+c[6]+','+
                       c[1]+','+c[4]+',0,'+c[7]+',0,0,1,0,'+
                       c[2]+','+c[5]+',0,1)';
  }

  function psUpdate(){
    psTicking=false;
    if(!psRunway||!psPlate||!psRunway.isConnected||!window.KD_PS)return;
    var d=window.KD_PS,n=d.n,i;
    var r=psRunway.getBoundingClientRect(),
        travel=r.height-(document.documentElement.clientHeight||1);
    if(travel<=0)travel=1;
    var p=(-r.top)/travel;
    p=p<0?0:(p>1?1:p);

    // No hold at the head: the masses start moving on the first pixel of scroll
    // after the stage pins. The hold at the tail is a beat now rather than a
    // wait - 8vh against the 28vh it was, with the travel the movement itself
    // gets left exactly as approved. Reduced motion pins the settled frame.
    var ia,ib,t;
    if(psReduced()){
      ia=ib=n-1;t=1;                      // one settled frame, nothing fetched
    }else{
      var q=Math.max(0,Math.min(1,p/0.956)),f=q*(n-1);
      ia=Math.floor(f);t=f-ia;
      if(ia>n-2){ia=n-2;t=1;}
      ib=ia+1;
    }

    if(ia!==psIA){psA.src=psSrc(ia);psIA=ia;}
    if(ib!==psIB){psB.src=psSrc(ib);psIB=ib;}
    psB.style.opacity=t.toFixed(3);

    // one frame either side, so a reader scrolling in either direction meets
    // an already-decoded bitmap
    psWarm(ib+1);psWarm(ia-1);

    // the labels ride the faces, interpolated between the two frames in play
    var ca=d.frames[ia],cb=d.frames[ib];
    for(i=0;i<4;i++){
      var m=[],j;
      for(j=0;j<8;j++)m.push(ca[i][j]+(cb[i][j]-ca[i][j])*t);
      psLabels[i].style.transform=psMatrix(m);
    }
  }

  // Decode the frames we are about to need, off the main thread, before the
  // index reaches them. The preloaded Image already holds the bytes; decode()
  // turns them into a bitmap without blocking the compositor, so the src swap
  // in psUpdate is a cache hit rather than a decode.
  function psWarm(k){
    var im=psPreload[k];
    if(!im||im.psWarmed||!im.decode)return;
    im.psWarmed=1;
    im.decode().catch(function(){});
  }

  function psRequest(){if(psTicking)return;psTicking=true;requestAnimationFrame(psUpdate);}

  // Put the section's own text back where the page built it. psBuild wipes the
  // runway, so anything still lifted into the stage would be destroyed with it -
  // which is what crossing the 900px breakpoint used to do to the headline, the
  // chapter rule and both copy blocks.
  function psUnlift(){
    if(!psRunway)return;
    var obs=psRunway.closest('#observation');
    if(!obs)return;
    [].slice.call(psRunway.querySelectorAll('.ps-copy')).forEach(function(w){
      while(w.firstChild)obs.insertBefore(w.firstChild,psRunway);
    });
    obs.style.removeProperty('padding-top');
    obs.style.removeProperty('padding-bottom');
    psCopies=[];
  }

  function psBuild(){
    var runway=document.querySelector('.ps-runway'),d=window.KD_PS;
    if(!runway||!d||!d.frames||d.frames.length!==d.n)return false;
    if(runway===psRunway&&runway.dataset.psWired==='1')return true;
    runway.dataset.psWired='1';
    psRunway=runway;
    // Below 900px the stage is never built, so not one frame is requested -
    // and above it the still is never written, so that is not requested either.
    // display:none would have fetched both in most browsers.
    psRunway.innerHTML=psSmall()?psStillMarkup(d):psStageMarkup(d);
    psPlate=psRunway.querySelector('.ps-plate');
    psIA=psIB=-1;
    psCopies=[];psLabels=[];
    var stage=psRunway.querySelector('.ps-stage');
    if(stage){
      psA=stage.querySelector('[data-ps-l="a"]');
      psB=stage.querySelector('[data-ps-l="b"]');
      psLabels=[].slice.call(stage.querySelectorAll('.ps-label'));
      // Fetch every frame up front. They are small and the section is only a
      // screen or two down the page; without this the sequence would tear as
      // the reader scrolls into frames that have not arrived.
      if(!psPreload.length){
        // reduced motion shows one settled frame and never animates, so it
        // must not pull the other 27 down the wire
        var k0=psReduced()?d.n-1:0;
        for(var k=k0;k<d.n;k++){var im=new Image();im.src=psSrc(k);psPreload.push(im);}
      }
      // Lift the section into the room: the chapter rule, the headline and the
      // copy, as ONE block that is simply always there. The section's own
      // vertical padding goes with them, or it would leave a white band above
      // and below. The block is inserted BEFORE the plate the four labels live
      // in, so a screen reader gets headline, copy, then the four Ps; painting
      // order is taken back by a z-index on .ps-copy.
      var obs=psRunway.closest('#observation');
      // the section's own padding is set with !important in the stylesheet
      if(obs&&obs.style){obs.style.setProperty('padding-top','0','important');
                         obs.style.setProperty('padding-bottom','0','important');}
      else obs=document;
      var found=[];
      ['.kd-chapter-marker','.hero-line-wrap','.premise-lead'].forEach(function(sel){
        [].slice.call(obs.querySelectorAll(sel)).forEach(function(el){
          if(!el.closest('.ps-stage'))found.push(el);
        });
      });
      if(found.length){
        var wrap=document.createElement('div');
        wrap.className='ps-copy';
        found.forEach(function(el){wrap.appendChild(el);});
        stage.insertBefore(wrap,psPlate);
        psCopies.push(wrap);
      }
    }
    document.documentElement.classList.remove('kd-ps-arm');
    psFit();psUpdate();
    return true;
  }

  function wireFourPs(){
    // Until the copy has been lifted into the room it is still sitting in the
    // section's normal flow, where the page put it - so on a slow first paint a
    // reader can see it there, scroll, and then meet it again pinned inside the
    // room. Hide it for exactly that window. The timeout is the failsafe: if
    // anything stops the lift from happening, the text comes back rather than
    // staying hidden.
    if(!psSmall())document.documentElement.classList.add('kd-ps-arm');
    setTimeout(function(){document.documentElement.classList.remove('kd-ps-arm');},3000);
    psBuild();
    if(psBound)return;
    psBound=true;
    window.addEventListener('scroll',psRequest,{passive:true});
    window.addEventListener('resize',function(){
      var wantStage=!psSmall();
      if(psRunway&&window.KD_PS&&wantStage!==!!psPlate){
        psUnlift();psRunway.dataset.psWired='';psRunway=null;psBuild();
      }
      psFit();psRequest();
    });
    window.addEventListener('load',function(){setTimeout(psBuild,0);});
    // Stays connected on purpose: if a later rebuild swaps in a fresh runway,
    // psBuild repopulates it. When the runway is current the callback is one
    // querySelector and a flag check.
    try{
      new MutationObserver(psBuild).observe(
        document.querySelector('main')||document.body,{childList:true,subtree:true});
    }catch(e){}
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(psFit);
    setTimeout(psBuild,300);setTimeout(psBuild,1200);setTimeout(psBuild,2500);
  }

  normalizeShell();normalizeCtas();wireRouteTransition();wireReadingFit();var core=document.createElement('script');core.src='/assets/kd-core.js';core.onload=function(){normalizeShell();normalizeCtas();document.head.appendChild(style);wireRouteTransition();wirePitchScroll();wireFourPs();normalizeCtas();};document.head.appendChild(core);
})();