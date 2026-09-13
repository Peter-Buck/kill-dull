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
  window.KD_PS={"w":2132,"h":1600,"n":28,"band":{"x":0,"y":500,"w":2132,"h":720},"anchor":820,"masses":[{"name":"PRODUCT","copy":"What you make."},{"name":"PRICE","copy":"What you ask."},{"name":"PLACE","copy":"Where and how it reaches people."},{"name":"PROMOTION","copy":"What you say and signal."}],"frames":[[[1.00784,0.001433,203.751995,0.007011,1.001476,609.072351,1e-05,1e-06],[0.999722,0.001439,636.4867,-0.003133,1.006032,608.594489,-4e-06,1e-06],[1.008215,0.001436,1073.807998,0.004687,1.003613,608.848262,7e-06,1e-06],[0.990943,0.00144,1512.166691,-0.007835,1.007491,608.441353,-1.1e-05,1e-06]],[[1.006481,0.001431,196.034285,0.007002,1.000126,609.214044,1e-05,1e-06],[0.999722,0.001439,636.4867,-0.003133,1.006032,608.594489,-4e-06,1e-06],[1.008215,0.001436,1073.807998,0.004687,1.003613,608.848262,7e-06,1e-06],[0.991725,0.001444,1517.246471,-0.007841,1.008287,608.357954,-1.1e-05,1e-06]],[[1.005361,0.001429,189.675776,0.006993,0.999013,609.330845,1e-05,1e-06],[0.999722,0.001439,636.4867,-0.003133,1.006032,608.594489,-4e-06,1e-06],[1.008215,0.001436,1073.807998,0.004687,1.003613,608.848262,7e-06,1e-06],[0.993264,0.001443,1527.248201,-0.007853,1.009849,608.193946,-1.1e-05,1e-06]],[[1.004385,0.001428,184.133943,0.006987,0.998043,609.432554,1e-05,1e-06],[0.999722,0.001439,636.4867,-0.003133,1.006032,608.594489,-4e-06,1e-06],[1.007986,0.001435,1074.813305,0.004685,1.003385,608.872151,7e-06,1e-06],[0.994534,0.001447,1535.512025,-0.007863,1.011143,608.058405,-1.1e-05,1e-06]],[[1.003509,0.001426,179.160781,0.00698,0.997172,609.523892,1e-05,1e-06],[0.99983,0.00144,636.223206,-0.003133,1.006142,608.582973,-4e-06,1e-06],[1.007526,0.001434,1076.837771,0.004683,1.002926,608.920217,7e-06,1e-06],[0.99565,0.001449,1542.765713,-0.007872,1.012278,607.939386,-1.1e-05,1e-06]],[[1.002709,0.001425,174.615646,0.006976,0.996376,609.607291,1e-05,1e-06],[1.000463,0.00144,634.684747,-0.003135,1.006778,608.516169,-4e-06,1e-06],[1.007014,0.001433,1079.086273,0.004681,1.002417,608.973575,7e-06,1e-06],[0.996658,0.001449,1549.320986,-0.00788,1.013302,607.831812,-1.1e-05,1e-06]],[[1.001967,0.001424,170.408743,0.00697,0.99564,609.684539,1e-05,1e-06],[1.001386,0.001441,632.443805,-0.003138,1.007707,608.418751,-4e-06,1e-06],[1.006515,0.001433,1081.283944,0.004679,1.00192,609.025788,7e-06,1e-06],[0.997585,0.00145,1555.350413,-0.007888,1.014245,607.732964,-1.1e-05,1e-06]],[[1.001275,0.001423,166.478454,0.006965,0.994952,609.756708,1e-05,1e-06],[1.002343,0.001443,630.120074,-0.003141,1.00867,608.317757,-4e-06,1e-06],[1.006038,0.001433,1083.379065,0.004676,1.001446,609.075499,7e-06,1e-06],[0.998448,0.001452,1560.963027,-0.007894,1.015122,607.64091,-1.1e-05,1e-06]],[[1.000624,0.001423,162.779574,0.006961,0.994306,609.824586,1e-05,1e-06],[1.003269,0.001444,627.869538,-0.003144,1.009602,608.219981,-4e-06,1e-06],[1.005588,0.001432,1085.363882,0.004674,1.000997,609.122634,7e-06,1e-06],[0.999259,0.001453,1566.233932,-0.007901,1.015946,607.554436,-1.1e-05,1e-06]],[[1.000007,0.001422,159.278456,0.006956,0.993693,609.888887,1e-05,1e-06],[1.004148,0.001445,625.73496,-0.003147,1.010486,608.127213,-4e-06,1e-06],[1.00516,0.001431,1087.244115,0.004673,1.000571,609.167266,7e-06,1e-06],[1.000025,0.001452,1571.217768,-0.007907,1.016725,607.47261,-1.1e-05,1e-06]],[[0.999421,0.001421,155.948512,0.006952,0.99311,609.950042,1e-05,1e-06],[1.004978,0.001447,623.719009,-0.003149,1.011322,608.039594,-4e-06,1e-06],[1.004755,0.001431,1089.02904,0.004671,1.000168,609.209609,7e-06,1e-06],[1.000755,0.001455,1575.955584,-0.007912,1.017467,607.394934,-1.1e-05,1e-06]],[[0.998861,0.00142,152.768694,0.006948,0.992553,610.008407,1e-05,1e-06],[1.005766,0.001448,621.804847,-0.003151,1.012115,607.956409,-4e-06,1e-06],[1.004367,0.001429,1090.728315,0.004669,0.999782,609.250021,7e-06,1e-06],[1.00145,0.001457,1580.479529,-0.007918,1.018175,607.32069,-1.1e-05,1e-06]],[[0.998324,0.001419,149.722036,0.006945,0.992019,610.06434,1e-05,1e-06],[1.006516,0.001449,619.982371,-0.003154,1.01287,607.877231,-4e-06,1e-06],[1.003998,0.001429,1092.350835,0.004667,0.999415,609.288573,7e-06,1e-06],[1.002118,0.001457,1584.8154,-0.007923,1.018852,607.249594,-1.1e-05,1e-06]],[[0.997808,0.001418,146.794275,0.006941,0.991507,610.118055,1e-05,1e-06],[1.007233,0.00145,618.242177,-0.003156,1.013591,607.801557,-4e-06,1e-06],[1.003646,0.001429,1093.90448,0.004666,0.999064,609.325409,7e-06,1e-06],[1.002759,0.001459,1588.984164,-0.007928,1.019504,607.181215,-1.1e-05,1e-06]],[[0.997311,0.001418,143.973798,0.006938,0.991014,610.16984,1e-05,1e-06],[1.007918,0.001451,616.575624,-0.003159,1.014282,607.729173,-4e-06,1e-06],[1.003307,0.001429,1095.396111,0.004664,0.998727,609.360814,7e-06,1e-06],[1.003377,0.00146,1593.003104,-0.007933,1.020133,607.11534,-1.1e-05,1e-06]],[[0.996832,0.001417,141.250504,0.006934,0.990538,610.219836,1e-05,1e-06],[1.008577,0.001452,614.977439,-0.00316,1.014943,607.659721,-4e-06,1e-06],[1.00298,0.001429,1096.831574,0.004662,0.998402,609.394932,7e-06,1e-06],[1.003974,0.00146,1596.886708,-0.007938,1.02074,607.051611,-1.1e-05,1e-06]],[[0.996368,0.001416,138.615831,0.006931,0.990076,610.268259,1e-05,1e-06],[1.009208,0.001452,613.443555,-0.003163,1.015578,607.59306,-4e-06,1e-06],[1.002666,0.001428,1098.214427,0.004661,0.998088,609.427762,7e-06,1e-06],[1.004553,0.001461,1600.6473,-0.007942,1.021329,606.989884,-1.1e-05,1e-06]],[[0.995918,0.001416,136.062439,0.006928,0.989629,610.315108,1e-05,1e-06],[1.009818,0.001454,611.962662,-0.003165,1.016192,607.528687,-4e-06,1e-06],[1.002362,0.001428,1099.549499,0.004659,0.997787,609.459448,7e-06,1e-06],[1.005113,0.001462,1604.295557,-0.007947,1.021899,606.930089,-1.1e-05,1e-06]],[[0.995482,0.001415,133.583943,0.006925,0.989195,610.360599,1e-05,1e-06],[1.010408,0.001454,610.530185,-0.003166,1.016785,607.466459,-4e-06,1e-06],[1.002068,0.001427,1100.842381,0.004658,0.997494,609.490132,7e-06,1e-06],[1.005658,0.001462,1607.8405,-0.007951,1.022453,606.871939,-1.1e-05,1e-06]],[[0.995057,0.001414,131.174616,0.006922,0.988774,610.404873,1e-05,1e-06],[1.010979,0.001456,609.141868,-0.003168,1.017361,607.406092,-4e-06,1e-06],[1.001782,0.001426,1102.096505,0.004656,0.99721,609.519958,7e-06,1e-06],[1.006189,0.001464,1611.290262,-0.007956,1.022993,606.815362,-1.1e-05,1e-06]],[[0.994644,0.001414,128.829432,0.006919,0.988364,610.44786,1e-05,1e-06],[1.011534,0.001456,607.794406,-0.00317,1.017919,607.347512,-4e-06,1e-06],[1.001505,0.001426,1103.314666,0.004655,0.996934,609.548855,7e-06,1e-06],[1.006707,0.001467,1614.651833,-0.007959,1.02352,606.760216,-1.1e-05,1e-06]],[[0.994242,0.001413,126.544165,0.006916,0.987964,610.489845,1e-05,1e-06],[1.012073,0.001457,606.48513,-0.003171,1.018461,607.290649,-4e-06,1e-06],[1.001236,0.001425,1104.499533,0.004654,0.996665,609.576964,7e-06,1e-06],[1.007212,0.001464,1617.931566,-0.007963,1.024031,606.706357,-1.1e-05,1e-06]],[[0.993849,0.001413,124.31478,0.006914,0.987574,610.530758,1e-05,1e-06],[1.012596,0.001457,605.214105,-0.003173,1.018988,607.235432,-4e-06,1e-06],[1.000974,0.001425,1105.65352,0.004653,0.996405,609.604359,7e-06,1e-06],[1.007703,0.001466,1621.134671,-0.007967,1.024532,606.653857,-1.1e-05,1e-06]],[[0.993466,0.001412,122.137711,0.006911,0.987193,610.570741,1e-05,1e-06],[1.013106,0.001458,603.974913,-0.003175,1.019501,607.181573,-4e-06,1e-06],[1.000718,0.001425,1106.778534,0.004652,0.99615,609.631109,7e-06,1e-06],[1.008186,0.001468,1624.266232,-0.007971,1.025022,606.602502,-1.1e-05,1e-06]],[[0.993091,0.001412,120.009853,0.006909,0.98682,610.609794,1e-05,1e-06],[1.013604,0.00146,602.765266,-0.003176,1.020003,607.129002,-4e-06,1e-06],[1.000468,0.001425,1107.87648,0.004651,0.995902,609.657145,7e-06,1e-06],[1.008656,0.001467,1627.330823,-0.007975,1.025501,606.552219,-1.1e-05,1e-06]],[[0.992724,0.001411,117.928115,0.006906,0.986455,610.64806,1e-05,1e-06],[1.014091,0.00146,601.583576,-0.003177,1.020492,607.077646,-4e-06,1e-06],[1.000225,0.001424,1108.949138,0.004649,0.995659,609.682608,7e-06,1e-06],[1.009118,0.001466,1630.332385,-0.007978,1.02597,606.502938,-1.1e-05,1e-06]],[[0.992365,0.00141,115.890267,0.006903,0.986098,610.685468,1e-05,1e-06],[1.014567,0.001461,600.427873,-0.003179,1.020971,607.027435,-4e-06,1e-06],[0.999986,0.001423,1109.997905,0.004648,0.995421,609.707499,7e-06,1e-06],[1.009571,0.001467,1633.27422,-0.007982,1.02643,606.45473,-1.1e-05,1e-06]],[[0.992014,0.00141,113.893584,0.006901,0.98575,610.722089,1e-05,1e-06],[1.015033,0.001461,599.296696,-0.00318,1.021439,606.978226,-4e-06,1e-06],[0.999753,0.001422,1111.02418,0.004648,0.995188,609.731889,7e-06,1e-06],[1.010015,0.001468,1636.160013,-0.007985,1.026881,606.40738,-1.1e-05,1e-06]]]};

  // ── the four Ps room ─────────────────────────────────────────────────────
  // A rendered cream room. The masses and their shadows are a Cycles frame
  // SEQUENCE, not sprites: they move in depth as well as across, they sit at
  // four different depths rather than in a regimented row, and their shadows
  // fall on each other because every frame is one render. Sprites could not do
  // any of that - measured against real depth-moved renders, transforming a
  // flat sprite was worse than not moving it at all.
  //
  // The room plate is static and carries the whole frame; each sequence frame
  // is RGBA over it, opaque only where it differs from the room. Two <img>
  // layers crossfade so 28 frames read as continuous movement.
  //
  // kd-core rebuilds #observation on both DOMContentLoaded and window.load, so
  // a later rebuild can replace the runway with a fresh empty one. Everything
  // below is re-entrant: state lives in module scope, listeners attach once,
  // and the observer stays connected for the life of the page.
  var psRunway=null,psPlate=null,psBound=false,psTicking=false,psCopies=[],
      psA=null,psB=null,psIA=-1,psIB=-1,psLabels=[],psPreload=[];

  function psReduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function psSmall(){return window.innerWidth<900;}
  function psEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function psSrc(i){return '/assets/ps-f'+(i<10?'0':'')+i+'.webp';}

  function psStaticMarkup(M){
    var h='<div class="ps-static">',k;
    for(k=0;k<4;k++)h+='<div><h3>'+psEsc(M[k].name)+'</h3><p>'+psEsc(M[k].copy)+'</p></div>';
    return h+'</div>';
  }

  function psStageMarkup(d){
    var b=d.band,M=d.masses,k,
        h='<div class="ps-stage"><div class="ps-plate">'+
          '<img class="ps-room-img" src="/assets/ps-room.webp" alt="" width="'+d.w+
          '" height="'+d.h+'" decoding="async">';
    // two frame layers, crossfaded; both sit exactly on the band the sequence
    // was rendered from
    var st='left:'+b.x+'px;top:'+b.y+'px;width:'+b.w+'px;height:'+b.h+'px';
    h+='<img class="ps-frame" data-ps-l="a" alt="" aria-hidden="true" style="'+st+'">'+
       '<img class="ps-frame" data-ps-l="b" alt="" aria-hidden="true" style="'+st+'">';
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
    psPlate.style.setProperty('--ps-ox',((vw-d.w*s)/2).toFixed(1)+'px');
    var oy=vh*0.70-d.anchor*s;
    psPlate.style.setProperty('--ps-oy',Math.max(Math.min(oy,0),vh-d.h*s).toFixed(1)+'px');
  }

  function psRamp(p,a,b){var t=(p-a)/(b-a);return t<0?0:(t>1?1:t*t*(3-2*t));}

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

    if(psCopies.length===2){
      psCopies[0].style.opacity=(1-psRamp(p,0.20,0.34)).toFixed(3);
      psCopies[1].style.opacity=psRamp(p,0.60,0.74).toFixed(3);
      psCopies[0].classList.toggle('is-on',p<0.34);
      psCopies[1].classList.toggle('is-on',p>=0.60);
    }

    // hold at both ends so the movement happens inside the section rather than
    // as a transition into or out of it; reduced motion pins the settled frame
    var ia,ib,t;
    if(psReduced()){
      ia=ib=n-1;t=1;                      // one settled frame, nothing fetched
    }else{
      var q=Math.max(0,Math.min(1,(p-0.10)/0.80)),f=q*(n-1);
      ia=Math.floor(f);t=f-ia;
      if(ia>n-2){ia=n-2;t=1;}
      ib=ia+1;
    }

    if(ia!==psIA){psA.src=psSrc(ia);psIA=ia;}
    if(ib!==psIB){psB.src=psSrc(ib);psIB=ib;}
    psB.style.opacity=t.toFixed(3);

    // the labels ride the faces, interpolated between the two frames in play
    var ca=d.frames[ia],cb=d.frames[ib];
    for(i=0;i<4;i++){
      var m=[],j;
      for(j=0;j<8;j++)m.push(ca[i][j]+(cb[i][j]-ca[i][j])*t);
      psLabels[i].style.transform=psMatrix(m);
    }
  }

  function psRequest(){if(psTicking)return;psTicking=true;requestAnimationFrame(psUpdate);}

  function psBuild(){
    var runway=document.querySelector('.ps-runway'),d=window.KD_PS;
    if(!runway||!d||!d.frames||d.frames.length!==d.n)return false;
    if(runway===psRunway&&runway.dataset.psWired==='1')return true;
    runway.dataset.psWired='1';
    psRunway=runway;
    // Below 900px the stage is never built, so not one frame is requested.
    // display:none would still have fetched them in most browsers.
    psRunway.innerHTML=(psSmall()?'':psStageMarkup(d))+psStaticMarkup(d.masses);
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
      var wantStage=!psSmall();
      if(psRunway&&window.KD_PS&&wantStage!==!!psPlate){
        psRunway.dataset.psWired='';psRunway=null;psBuild();
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