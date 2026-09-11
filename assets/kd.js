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
    '.masthead-wordmark a{display:inline-flex!important;align-items:baseline!important;white-space:nowrap!important}'+
    '.masthead-wordmark .terminal{order:1!important;animation:kd-terminal-compound 5.06s linear infinite!important;transform-origin:center!important}'+
    '.masthead-wordmark .tm{order:2!important;display:inline-block!important;font-size:.44em!important;vertical-align:baseline!important;line-height:1!important;margin-left:6px!important;position:relative!important;top:-.895em!important;letter-spacing:0!important}'+
    '.masthead-date,.reg-item,.product-link,.product-cta{font-size:15px!important}'+
    '.product-orientation{font-size:15px!important}'+
    '.masthead-tagline,.bulletin-text{font-size:16px!important}'+
    '.masthead-designation{font-size:19px!important}'+
    '.masthead-bulletin .bulletin-label{display:none!important}'+
    '.masthead-bulletin{min-height:70px!important;box-sizing:border-box!important;position:relative!important;padding:0!important;text-align:left!important}'+
    '.masthead-bulletin .bulletin-text{position:absolute!important;left:120px!important;top:50%!important;transform:translateY(-50%)!important;display:inline-flex!important;align-items:center!important;gap:8px!important;width:auto!important;text-align:left!important;color:inherit!important;text-decoration:none!important;margin:0!important}'+
    '.masthead-bulletin .bulletin-arrow{display:inline-block!important;color:var(--yellow)!important;transition:transform .22s cubic-bezier(.2,.8,.2,1)}'+
    '.masthead-bulletin .bulletin-text:hover .bulletin-arrow{transform:translate(2px,-2px)}'+
    '.bulletin-arrow,.enter-arrow:before,.bench-arrow:before,.pitch-arrow:before,.text-link span:before,.close-options b:before,.bench-action span:before{font-family:"Space Grotesk",sans-serif!important;font-size:16px!important;font-weight:400!important;line-height:1!important}'+
    '.unified-nav{min-height:44px!important;height:44px!important}'+
    '.footer-inner{padding:80px 120px!important}'+
    '.footer-bureau{font-size:clamp(40px,6vw,80px)!important;margin-bottom:64px!important;padding-top:32px!important}'+
    '.footer-index{margin-bottom:80px!important}'+
    '.footer-section{grid-template-columns:200px 1fr!important;padding:28px 0!important}'+
    '.footer-section-label{font-size:10px!important}'+
    '.footer-section nav a{font-size:15px!important}'+
    '.footer-colophon{font-size:10px!important}'+
    '.pitch-intro.pitch-scroll-ready .pitch-scroll-runway{position:relative;height:var(--pitch-runway-h,1100px)}'+
    '.pitch-intro.pitch-scroll-ready .pitch-scroll-stage{position:sticky;top:24px;z-index:2;background:var(--paper)}'+
    '.pitch-intro.pitch-scroll-ready .pitch-steps{height:var(--pitch-grid-h,520px)!important;align-items:start!important;overflow:hidden!important}'+
    '.pitch-intro.pitch-scroll-ready .pitch-steps>div{will-change:transform;transform:translate3d(0,var(--pitch-y,0px),0);opacity:1!important;border-right-color:#aaa69d!important}'+
    '.pitch-intro.pitch-scroll-ready .pitch-steps>div:last-child{border-right-color:transparent!important}'+
    '@media(max-width:1279px){.footer-inner{padding:64px!important}.masthead-bulletin .bulletin-text{left:64px!important}}'+
    '@media(max-width:767px){.masthead-bulletin .bulletin-text{left:24px!important}.footer-inner{padding:48px 24px!important}.footer-section{grid-template-columns:1fr!important;gap:12px!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-runway{height:auto!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-stage{position:static!important}.pitch-intro.pitch-scroll-ready .pitch-steps{height:auto!important;overflow:visible!important}.pitch-intro.pitch-scroll-ready .pitch-steps>div{transform:none!important;will-change:auto!important;border-right-color:transparent!important}}'+
    '@media(prefers-reduced-motion:reduce){.pitch-intro.pitch-scroll-ready .pitch-scroll-runway{height:auto!important}.pitch-intro.pitch-scroll-ready .pitch-scroll-stage{position:static!important}.pitch-intro.pitch-scroll-ready .pitch-steps{height:auto!important;overflow:visible!important}.pitch-intro.pitch-scroll-ready .pitch-steps>div{transform:none!important;will-change:auto!important}}';
  document.head.appendChild(style);

  function currentKey(){
    var p=window.location.pathname.replace(/\/$/,'');
    if(p===''||p==='/index.html')return 'home';
    if(p==='/bench'||p==='/bench.html')return 'bench';
    if(p==='/pitch'||p==='/pitch.html')return 'pitch';
    if(p==='/readings'||p==='/readings.html')return 'readings';
    if(p==='/go-deeper'||p==='/go-deeper.html')return 'deeper';
    if(p==='/bureau'||p==='/bureau.html')return 'bureau';
    return '';
  }

  function normalizeShell(){
    var key=currentKey();
    var wm=document.querySelector('.masthead-wordmark a');
    if(wm) wm.innerHTML='KILL DULL<span class="terminal"></span><span class="tm">™</span>';
    var designation=document.querySelector('.masthead-designation');
    if(designation) designation.innerHTML='<span>THE</span> DENSE IDEA COMPANY<span class="tm">™</span>';
    var bulletin=document.querySelector('.masthead-bulletin');
    if(bulletin) bulletin.innerHTML='<a class="bulletin-text" href="/readings">First Readings in production.<span class="bulletin-arrow">↗</span></a>';
    var desktop=document.getElementById('registrar-desktop');
    if(desktop) desktop.innerHTML='<a class="reg-item'+(key==='home'?' is-current':'')+'" href="/">KILL DULL</a><a class="reg-item'+(key==='bench'?' is-current':'')+'" href="/bench">BENCH</a><a class="reg-item'+(key==='pitch'?' is-current':'')+'" href="/pitch">PITCH</a><a class="reg-item'+(key==='readings'?' is-current':'')+'" href="/readings">READINGS</a><a class="reg-item'+(key==='deeper'?' is-current':'')+'" href="/go-deeper">GO DEEPER</a><a class="reg-item'+(key==='bureau'?' is-current':'')+'" href="/bureau">THE BUREAU</a>';
    var products=document.querySelector('.unified-nav-products');
    if(products) products.innerHTML='<a class="product-cta" href="/bench#discuss"><span class="enter-text">DECISION COMING UP?</span><span class="enter-arrow">↗</span></a>';
    var mobile=document.querySelector('.registrar-mobile');
    if(mobile){var label=key==='bench'?'BENCH':key==='pitch'?'PITCH':key==='readings'?'READINGS':key==='deeper'?'GO DEEPER':key==='bureau'?'THE BUREAU':key==='home'?'KILL DULL':'KILL DULL';mobile.innerHTML='<button class="reg-mobile-current" id="reg-mobile-btn"><span id="reg-mobile-label">'+label+'</span><span class="reg-mobile-arrow">▾</span></button><div class="reg-mobile-dropdown" id="reg-mobile-dropdown" hidden><a class="reg-item" href="/">KILL DULL</a><a class="reg-item" href="/bench">BENCH</a><a class="reg-item" href="/pitch">PITCH</a><a class="reg-item" href="/readings">READINGS</a><a class="reg-item" href="/go-deeper">GO DEEPER</a><a class="reg-item" href="/bureau">THE BUREAU</a></div>';}
    var footer=document.querySelector('.footer');
    if(footer) footer.innerHTML='<div class="footer-inner"><div class="footer-bureau">THE BUREAU.</div><div class="footer-index"><div class="footer-section"><div class="footer-section-label">THE PRACTICE</div><nav aria-label="The practice"><a href="/discipline">The Dense Idea Discipline</a><a href="/bench">BENCH</a></nav></div><div class="footer-section"><div class="footer-section-label">PUBLIC RECORD</div><nav aria-label="Public record"><a href="/readings">Published Readings</a><a href="/bureau">Department of Hard Evidence</a></nav></div><div class="footer-section"><div class="footer-section-label">INSTITUTION</div><nav aria-label="Institution"><a href="/office">The Office</a><a href="/faq">FAQ</a><a href="/accessibility.html" aria-label="Accessibility statement">Accessibility</a><a href="/language.html" aria-label="Language settings">Language</a><a href="/privacy.html" aria-label="Privacy policy">Privacy</a><a href="/terms.html" aria-label="Terms of use">Terms</a></nav></div></div><div class="footer-colophon"><span>© 2026 Kill Dull<span class="tm">™</span></span><span>KD · OFFICE · MAN—001</span></div></div>';
  }

  function wirePitchScroll(){
    var pitch=document.getElementById('pitch-intro');if(!pitch||pitch.dataset.scrollWired==='1')return;pitch.dataset.scrollWired='1';pitch.classList.add('pitch-scroll-ready');
    var grid=pitch.querySelector('.pitch-steps'),actions=pitch.querySelector('.pitch-actions');if(!grid||!actions)return;
    var runway=document.createElement('div');runway.className='pitch-scroll-runway';var stage=document.createElement('div');stage.className='pitch-scroll-stage';var first=pitch.firstElementChild,nodes=[],node=first;while(node&&node!==actions){nodes.push(node);node=node.nextElementSibling;}pitch.insertBefore(runway,first);runway.appendChild(stage);for(var n=0;n<nodes.length;n++)stage.appendChild(nodes[n]);
    var steps=stage.querySelectorAll('.pitch-steps>div');if(!steps.length)return;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var ticking=false,travel=560;function clamp(v,min,max){return Math.max(min,Math.min(max,v));}function update(){ticking=false;if(window.innerWidth<768)return;var rect=runway.getBoundingClientRect(),stickyTop=24,scrolled=clamp(stickyTop-rect.top,0,travel),progress=scrolled/travel,stagger=90,startOffset=220,maxY=0;for(var i=0;i<steps.length;i++){var y=Math.max(0,startOffset+(i*stagger)-(progress*540));maxY=Math.max(maxY,y);steps[i].style.setProperty('--pitch-y',y.toFixed(1)+'px');}var gridHeight=150+Math.min(370,maxY);grid.style.setProperty('--pitch-grid-h',gridHeight.toFixed(1)+'px');var stageHeight=stage.offsetHeight;runway.style.setProperty('--pitch-runway-h',(stageHeight+travel).toFixed(1)+'px');}function requestUpdate(){if(ticking)return;ticking=true;requestAnimationFrame(update);}update();window.addEventListener('scroll',requestUpdate,{passive:true});window.addEventListener('resize',requestUpdate);
  }

  normalizeShell();var core=document.createElement('script');core.src='/assets/kd-core.js';core.onload=function(){normalizeShell();document.head.appendChild(style);wirePitchScroll();};document.head.appendChild(core);
})();