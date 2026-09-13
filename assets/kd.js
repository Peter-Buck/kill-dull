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
    '@media(prefers-reduced-motion:reduce){.readings-page .reading-container h2,.readings-page .reading-container .container-copy{transition:none!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-runway{height:auto!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-stage{position:static!important}.pitch-intro.pitch-scroll-ready .pitch-steps{height:auto!important;overflow:visible!important}.pitch-intro.pitch-scroll-ready .pitch-steps>div{transform:none!important;will-change:auto!important;border-right-color:transparent!important}.kd-cta-unified::after{transition:none!important}}';
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
    if(desktop) desktop.innerHTML='<a class="reg-item'+(key==='home'?' is-current':'')+'" href="/">KILL DULL</a><a class="reg-item'+(key==='bench'?' is-current':'')+'" href="/bench">BENCH</a><a class="reg-item'+(key==='pitch'?' is-current':'')+'" href="/pitch">PITCH</a><a class="reg-item'+(key==='readings'?' is-current':'')+'" href="/readings">READINGS</a><a class="reg-item'+(key==='discipline'?' is-current':'')+'" href="/discipline">DISCIPLINE</a><a class="reg-item'+(key==='bureau'?' is-current':'')+'" href="/bureau">BUREAU</a>';
    var products=document.querySelector('.unified-nav-products');
    if(products) products.innerHTML='<a class="product-cta" href="/bench#discuss"><span class="enter-text">DECISION COMING UP?</span><span class="enter-arrow">↗</span></a>';
    var mobile=document.querySelector('.registrar-mobile');
    if(mobile){var label=key==='bench'?'BENCH':key==='pitch'?'PITCH':key==='readings'?'READINGS':key==='discipline'?'DISCIPLINE':key==='bureau'?'BUREAU':key==='home'?'KILL DULL':'KILL DULL';mobile.innerHTML='<button class="reg-mobile-current" id="reg-mobile-btn"><span id="reg-mobile-label">'+label+'</span><span class="reg-mobile-arrow">▾</span></button><div class="reg-mobile-dropdown" id="reg-mobile-dropdown" hidden><a class="reg-item" href="/">KILL DULL</a><a class="reg-item" href="/bench">BENCH</a><a class="reg-item" href="/pitch">PITCH</a><a class="reg-item" href="/readings">READINGS</a><a class="reg-item" href="/discipline">DISCIPLINE</a><a class="reg-item" href="/bureau">BUREAU</a></div>';}
    var burberry=document.querySelector('.readings-page img[alt="Burberry"]');
    if(burberry){burberry.src='/assets/burberry-logo.svg';burberry.classList.add('native-cream');}
    var starbucks=document.querySelector('.readings-page img[alt="Starbucks"]');
    if(starbucks){starbucks.src='/assets/starbucks-logo.svg';starbucks.classList.add('native-cream');}
    var accumulate=document.querySelector('.readings-page .accumulate');
    if(accumulate) accumulate.innerHTML='<span class="hero-line-wrap"><span class="hero-line js-fit">A BODY OF EVIDENCE ABOUT WHAT</span></span><span class="hero-line-wrap"><span class="hero-line js-fit">COMPOUNDS — AND WHAT DOESN’T.</span></span>';
    var footer=document.querySelector('.footer');
    if(footer) footer.innerHTML='<div class="footer-inner"><div class="footer-bureau">THE BUREAU.</div><div class="footer-index"><div class="footer-section"><div class="footer-section-label">THE PRACTICE</div><nav aria-label="The practice"><a href="/discipline">The Dense Idea Discipline</a><a href="/bench">BENCH</a><a href="/pitch">PITCH</a></nav></div><div class="footer-section"><div class="footer-section-label">PUBLIC RECORD</div><nav aria-label="Public record"><a href="/readings">Published Readings</a><a href="/bureau">Department of Hard Evidence</a></nav></div><div class="footer-section"><div class="footer-section-label">INSTITUTION</div><nav aria-label="Institution"><a href="/office">The Office</a><a href="/faq">FAQ</a><a href="/accessibility.html" aria-label="Accessibility statement">Accessibility</a><a href="/language.html" aria-label="Language settings">Language</a><a href="/privacy.html" aria-label="Privacy policy">Privacy</a><a href="/terms.html" aria-label="Terms of use">Terms</a></nav></div></div><div class="footer-colophon"><span>© 2026 Kill Dull. All rights reserved.</span></div></div>';
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
  window.KD_PS={"w":2132,"h":1600,"masses":[{"name":"PRODUCT","copy":"What you make.","mass":{"x":99,"y":602,"w":437,"h":435},"shadow":{"x":0,"y":204,"w":2093,"h":1086},"matrix3d":[1.007391,0.005614,0,8e-06,0.001434,1.002004,0,1e-06,0,0,1,0,97.960792,609.016991,0,1],"quad":[[98.0,609.0],[519.4,609.4],[519.7,1028.2],[98.5,1029.3]],"travel":-50.46,"curve":[-0.0,0.0379,0.0751,0.1118,0.148,0.1836,0.2187,0.2533,0.2875,0.3212,0.3544,0.3873,0.4197,0.4518,0.4835,0.5148,0.5457,0.5764,0.6066,0.6366,0.6662,0.6955,0.7246,0.7533,0.7818,0.8099,0.8379,0.8655,0.8929,0.92,0.9469,0.9736,1.0],"phase":0.0,"dscale":0.00465,"ddy":1.45,"dshadow":31.23},{"name":"PRICE","copy":"What you ask.","mass":{"x":603,"y":600,"w":439,"h":440},"shadow":{"x":6,"y":210,"w":2107,"h":1080},"matrix3d":[1.019322,0.005053,0,7e-06,0.001451,1.01439,0,1e-06,0,0,1,0,602.719582,607.717657,0,1],"quad":[[602.7,607.7],[1027.8,608.0],[1027.8,1032.2],[603.0,1033.2]],"travel":-16.63,"curve":[-0.0,0.0299,0.0603,0.091,0.1222,0.1536,0.1852,0.217,0.249,0.281,0.3131,0.3453,0.3774,0.4095,0.4416,0.4737,0.5057,0.5375,0.5693,0.601,0.6326,0.664,0.6953,0.7265,0.7575,0.7884,0.8191,0.8496,0.88,0.9103,0.9404,0.9703,1.0],"phase":0.12,"dscale":-0.00295,"ddy":-0.92,"dshadow":-20.16},{"name":"PLACE","copy":"Where and how it reaches people.","mass":{"x":1095,"y":602,"w":448,"h":434},"shadow":{"x":23,"y":211,"w":2109,"h":1079},"matrix3d":[1.004782,0.00529,0,7e-06,0.001431,0.99966,0,1e-06,0,0,1,0,1111.30807,609.262967,0,1],"quad":[[1111.3,609.3],[1528.6,609.6],[1528.3,1027.6],[1111.3,1028.5]],"travel":16.82,"curve":[0.0,0.0262,0.0534,0.0814,0.1102,0.1397,0.1697,0.2002,0.2311,0.2624,0.2939,0.3257,0.3577,0.3898,0.4221,0.4544,0.4868,0.5192,0.5517,0.5842,0.6166,0.649,0.6814,0.7137,0.7459,0.778,0.81,0.842,0.8738,0.9055,0.9372,0.9686,1.0],"phase":0.07,"dscale":0.00204,"ddy":0.63,"dshadow":13.61},{"name":"PROMOTION","copy":"What you say and signal.","mass":{"x":1595,"y":601,"w":466,"h":438},"shadow":{"x":37,"y":211,"w":2095,"h":1079},"matrix3d":[1.015473,0.00472,0,7e-06,0.001447,1.010838,0,1e-06,0,0,1,0,1626.735594,608.090377,0,1],"quad":[[1626.7,608.1],[2047.6,608.4],[2047.0,1031.2],[1626.4,1032.1]],"travel":50.89,"curve":[0.0,0.0402,0.0795,0.118,0.1556,0.1925,0.2286,0.2641,0.2989,0.3331,0.3667,0.3998,0.4324,0.4644,0.496,0.5271,0.5578,0.588,0.6179,0.6473,0.6764,0.7051,0.7335,0.7615,0.7892,0.8165,0.8436,0.8704,0.8968,0.923,0.9489,0.9746,1.0],"phase":0.02,"dscale":-0.00406,"ddy":-1.26,"dshadow":-27.44}],"anchor":820};

  // ── the four Ps room ─────────────────────────────────────────────────────
  // A rendered cream room with four blue-black masses, composited from flat
  // plates: room x shadow (multiply) over mass (alpha), with the labels as
  // live HTML transformed onto each face. The masses repel on scroll.
  //
  // kd-core rebuilds #observation on both DOMContentLoaded and window.load,
  // and the inline homepage script removes the legacy sections that
  // buildHomepage() guards on - so a second rebuild can replace the runway
  // with a fresh empty one. Everything below is therefore re-entrant: state
  // lives in module scope, listeners attach once, and the observer stays
  // connected for the life of the page so a replaced runway is rebuilt.
  var psRunway=null,psPlate=null,psBound=false,psTicking=false,psCopies=[];

  // Each mass carries its own travel, progress curve and phase, baked from an
  // overdamped simulation of four like poles repelling on the face gap - so
  // they separate fastest when closest, and the four no longer move in
  // lockstep. Progress runs 0 (tight) -> 1 (the rendered positions). The
  // plates were rendered fully repelled, so the scroll CONTRACTS toward them
  // rather than expanding past them: the composition fills its width and
  // there is no room to the sides. Every offset keeps its sign, so the gaps
  // open monotonically and the masses never touch by construction.

  function psReduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function psSmall(){return window.innerWidth<900;}
  function psEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}

  function psStaticMarkup(M){
    var h='<div class="ps-static">',k;
    for(k=0;k<4;k++)h+='<div><h3>'+psEsc(M[k].name)+'</h3><p>'+psEsc(M[k].copy)+'</p></div>';
    return h+'</div>';
  }

  function psStageMarkup(d){
    var M=d.masses,h='<div class="ps-stage"><div class="ps-plate">'+
      '<img class="ps-room-img" src="/assets/ps-room.webp" alt="" width="'+d.w+
      '" height="'+d.h+'" decoding="async">',k,s,m;
    // every shadow paints before any mass, so a mass occludes its neighbour's
    // shadow instead of being tinted by it
    for(k=0;k<4;k++){
      s=M[k].shadow;
      h+='<img class="ps-shadow" data-ps-i="'+k+'" src="/assets/ps-shadow-'+k+'.webp" '+
         'alt="" aria-hidden="true" decoding="async" style="left:'+s.x+'px;top:'+s.y+
         'px;width:'+s.w+'px;height:'+s.h+'px">';
    }
    for(k=0;k<4;k++){
      m=M[k].mass;
      h+='<div class="ps-obj" data-ps-i="'+k+'">'+
         '<img class="ps-mass" src="/assets/ps-mass-'+k+'.webp" alt="" aria-hidden="true" '+
         'decoding="async" style="left:'+m.x+'px;top:'+m.y+'px;width:'+m.w+'px;height:'+m.h+'px">'+
         '<div class="ps-label" style="transform:matrix3d('+M[k].matrix3d.join(',')+')">'+
         '<h3>'+psEsc(M[k].name)+'</h3><p>'+psEsc(M[k].copy)+'</p></div></div>';
    }
    return h+'</div></div>';
  }

  function psFit(){
    if(!psRunway)return;
    var vw=document.documentElement.clientWidth,vh=document.documentElement.clientHeight,
        d=window.KD_PS;
    psRunway.style.setProperty('--ps-vw',vw+'px');
    if(!psPlate||!d)return;
    psPlate.style.setProperty('--ps-pw',d.w+'px');
    psPlate.style.setProperty('--ps-ph',d.h+'px');
    // The plate is 2132x1600, so for any viewport wider than 4:3 this resolves
    // to the WIDTH term: the full horizontal composition is always shown and
    // only the empty room above and below is ever cropped. The masses cannot
    // be clipped, at rest or at full spread.
    var s=Math.max(vw/d.w,vh/d.h);
    psPlate.style.setProperty('--ps-s',s);
    // Explicit pixel offsets with transform-origin 0 0. A percentage translate
    // resolves against the element's UNSCALED width, so it cannot centre a
    // scaled plate.
    psPlate.style.setProperty('--ps-ox',((vw - d.w*s)/2).toFixed(1)+'px');
    // Anchor the masses low in frame rather than centring the plate, so the
    // upper half is clear cream for the copy and the darkest part of the floor
    // falls below the fold. Clamped so the plate always covers the stage:
    // without the clamp the anchor can pull the plate down off its own top
    // edge and expose the bare stage behind it.
    var oy=vh*0.70 - d.anchor*s;
    oy=Math.max(Math.min(oy,0),vh - d.h*s);
    psPlate.style.setProperty('--ps-oy',oy.toFixed(1)+'px');
  }

  // smoothstep across the middle of the runway only, so the masses hold still
  // as the room arrives and again before it leaves: the movement reads as
  // something happening inside the section, not as a transition into it
  function psRamp(p,a,b){var t=(p-a)/(b-a);return t<0?0:(t>1?1:t*t*(3-2*t));}

  function psCurve(m,p){
    var c=m.curve,n=c.length,
        t=(p-m.phase)/(1-m.phase);
    t=t<0?0:(t>1?1:t);
    var j=t*(n-1),k=Math.floor(j);
    if(k>=n-1)return c[n-1];
    return c[k]+(c[k+1]-c[k])*(j-k);
  }

  function psUpdate(){
    psTicking=false;
    if(!psRunway||!psPlate||!psRunway.isConnected||!window.KD_PS)return;
    var M=window.KD_PS.masses,i;
    if(psReduced()){
      for(i=0;i<4;i++){
        psPlate.style.setProperty('--dx'+i,'0px');
        psPlate.style.setProperty('--sx'+i,'0px');
      }
      return;
    }
    var r=psRunway.getBoundingClientRect(),
        travel=r.height-(document.documentElement.clientHeight||1);
    if(travel<=0)travel=1;
    var p=(-r.top)/travel;
    p=p<0?0:(p>1?1:p);
    // hold at both ends so the movement happens inside the section rather
    // than as a transition into or out of it
    var q=(p-0.10)/0.80;
    q=q<0?0:(q>1?1:q);
    // the premise reads as the room arrives, the conclusion as it settles
    if(psCopies.length===2){
      psCopies[0].style.opacity=(1-psRamp(p,0.20,0.34)).toFixed(3);
      psCopies[1].style.opacity=psRamp(p,0.60,0.74).toFixed(3);
      psCopies[0].classList.toggle('is-on',p<0.34);
      psCopies[1].classList.toggle('is-on',p>=0.60);
    }
    // Movement is horizontal only. Depth was tried and removed: measured
    // against Cycles renders of the masses actually moved in depth, a sprite
    // transform is WORSE than not moving them at all - 1.90 levels vs 1.58 at
    // 0.25m, and at 1.2m, the smallest move that actually reads, a real depth
    // change differs from a flat sprite by 20.8 levels. Scaling about the base
    // does not help (21.7). Depth needs the frames rendered.
    for(i=0;i<4;i++){
      var m=M[i],back=1-psCurve(m,q),dx=(-m.travel*back).toFixed(2)+'px';
      psPlate.style.setProperty('--dx'+i,dx);
      psPlate.style.setProperty('--sx'+i,dx);
    }
  }

  function psRequest(){if(psTicking)return;psTicking=true;requestAnimationFrame(psUpdate);}

  function psBuild(){
    var runway=document.querySelector('.ps-runway'),d=window.KD_PS;
    if(!runway||!d||!d.masses||d.masses.length!==4)return false;
    if(runway===psRunway&&runway.dataset.psWired==='1')return true;
    runway.dataset.psWired='1';
    psRunway=runway;
    // Below 900px the stage is never built, so none of the plates are even
    // requested. display:none would still have fetched them in most browsers.
    psRunway.innerHTML=(psSmall()?'':psStageMarkup(d))+psStaticMarkup(d.masses);
    psPlate=psRunway.querySelector('.ps-plate');
    psCopies=[];
    var stage=psRunway.querySelector('.ps-stage');
    if(stage){
      // lift the copy out of the flow and into the room
      var obs=psRunway.closest('#observation')||document;
      ['.premise-lead','.opening-copy'].forEach(function(sel){
        var el=obs.querySelector(sel);
        if(!el||el.closest('.ps-stage'))return;
        var wrap=document.createElement('div');
        wrap.className='ps-copy';
        el.parentNode.insertBefore(wrap,el);
        wrap.appendChild(el);
        stage.appendChild(wrap);
        psCopies.push(wrap);
      });
    }
    psFit();psUpdate();
    return true;
  }

  function wireFourPs(){
    psBuild();
    if(psBound)return;
    psBound=true;
    window.addEventListener('scroll',psRequest,{passive:true});
    window.addEventListener('resize',function(){
      // crossing the breakpoint changes whether the stage exists at all
      var wantStage=!psSmall();
      if(psRunway&&window.KD_PS&&wantStage!==!!psPlate){
        psRunway.innerHTML=(wantStage?psStageMarkup(window.KD_PS):'')+
                           psStaticMarkup(window.KD_PS.masses);
        psPlate=psRunway.querySelector('.ps-plate');
      }
      psFit();psRequest();
    });
    window.addEventListener('load',function(){setTimeout(psBuild,0);});
    // Stays connected for the life of the page on purpose: if a later rebuild
    // swaps in a fresh runway, psBuild repopulates it. When the runway is
    // already current the callback is one querySelector and a flag check.
    try{
      new MutationObserver(psBuild).observe(
        document.querySelector('main')||document.body,{childList:true,subtree:true});
    }catch(e){}
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(psFit);
    setTimeout(psBuild,300);setTimeout(psBuild,1200);setTimeout(psBuild,2500);
  }

  normalizeShell();normalizeCtas();wireRouteTransition();wireReadingFit();var core=document.createElement('script');core.src='/assets/kd-core.js';core.onload=function(){normalizeShell();normalizeCtas();document.head.appendChild(style);wireRouteTransition();wirePitchScroll();wireFourPs();normalizeCtas();};document.head.appendChild(core);
})();