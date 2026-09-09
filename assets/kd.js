/* Canonical shell wrapper — homepage header/footer everywhere. */
(function(){
  'use strict';

  var style=document.createElement('style');
  style.id='kd-shell-override';
  style.textContent='@keyframes kd-terminal-compound{0%{transform:scale(1)}50%{transform:scale(1.175)}100%{transform:scale(1)}}'+
    '.masthead-wordmark a{display:inline-flex!important;align-items:baseline!important;white-space:nowrap!important}'+
    '.masthead-wordmark .terminal{order:1!important;animation:kd-terminal-compound 5.06s linear infinite!important;transform-origin:center!important}'+
    '.masthead-wordmark .tm{order:2!important;display:inline-block!important;font-size:.44em!important;vertical-align:baseline!important;line-height:1!important;margin-left:6px!important;position:relative!important;top:-.895em!important;letter-spacing:0!important}'+
    '.masthead-date,.reg-item,.product-link,.product-cta{font-size:15px!important}'+
    '.masthead-tagline,.bulletin-text{font-size:16px!important}'+
    '.masthead-designation{font-size:19px!important}'+
    '.bulletin-label{font-size:14px!important}'+
    '.unified-nav{min-height:40px!important;height:40px!important}'+
    '.footer-inner{padding:80px 120px!important}'+
    '.footer-bureau{font-size:clamp(40px,6vw,80px)!important;margin-bottom:64px!important;padding-top:32px!important}'+
    '.footer-index{margin-bottom:80px!important}'+
    '.footer-section{grid-template-columns:200px 1fr!important;padding:28px 0!important}'+
    '.footer-section-label{font-size:10px!important}'+
    '.footer-section nav a{font-size:15px!important}'+
    '.footer-colophon{font-size:10px!important}'+
    '@media(max-width:1279px){.footer-inner{padding:64px!important}}'+
    '@media(max-width:767px){.footer-inner{padding:48px 24px!important}.footer-section{grid-template-columns:1fr!important;gap:12px!important}}';
  document.head.appendChild(style);

  function currentKey(){
    var p=window.location.pathname.replace(/\/$/,'');
    if(p===''||p==='/index.html')return 'home';
    if(p==='/bench'||p==='/bench.html')return 'bench';
    if(p==='/readings'||p==='/readings.html')return 'readings';
    if(p==='/bureau'||p==='/bureau.html')return 'bureau';
    return '';
  }

  function normalizeShell(){
    var key=currentKey();
    var wm=document.querySelector('.masthead-wordmark a');
    if(wm) wm.innerHTML='KILL DULL<span class="terminal"></span><span class="tm">™</span>';

    var designation=document.querySelector('.masthead-designation');
    if(designation) designation.innerHTML='<span>THE</span> DENSE IDEA COMPANY<span class="tm">™</span>';

    var bulletin=document.querySelector('.masthead-bulletin .bulletin-text');
    if(bulletin) bulletin.textContent='First Readings in production.';

    var desktop=document.getElementById('registrar-desktop');
    if(desktop){
      desktop.innerHTML=
        '<a class="reg-item'+(key==='home'?' is-current':'')+'" href="/">KILL DULL</a>'+ 
        '<a class="reg-item'+(key==='bench'?' is-current':'')+'" href="/bench">BENCH</a>'+ 
        '<a class="reg-item" href="https://pitchagainstdull.com">PITCH</a>'+ 
        '<a class="reg-item'+(key==='readings'?' is-current':'')+'" href="/readings">READINGS</a>'+ 
        '<a class="reg-item'+(key==='bureau'?' is-current':'')+'" href="/bureau">THE BUREAU</a>';
    }

    var products=document.querySelector('.unified-nav-products');
    if(products) products.innerHTML='<a class="product-cta" href="/bench#discuss"><span class="enter-text">DECISION COMING UP?</span><span class="enter-arrow">↗</span></a>';

    var mobile=document.querySelector('.registrar-mobile');
    if(mobile){
      var label=key==='bench'?'BENCH':key==='readings'?'READINGS':key==='bureau'?'THE BUREAU':key==='home'?'KILL DULL':'KILL DULL';
      mobile.innerHTML='<button class="reg-mobile-current" id="reg-mobile-btn"><span id="reg-mobile-label">'+label+'</span><span class="reg-mobile-arrow">▾</span></button><div class="reg-mobile-dropdown" id="reg-mobile-dropdown" hidden><a class="reg-item" href="/">KILL DULL</a><a class="reg-item" href="/bench">BENCH</a><a class="reg-item" href="https://pitchagainstdull.com">PITCH</a><a class="reg-item" href="/readings">READINGS</a><a class="reg-item" href="/bureau">THE BUREAU</a></div>';
    }

    var footer=document.querySelector('.footer');
    if(footer){
      footer.innerHTML='<div class="footer-inner"><div class="footer-bureau">THE BUREAU.</div><div class="footer-index"><div class="footer-section"><div class="footer-section-label">THE PRACTICE</div><nav aria-label="The practice"><a href="/discipline">The Dense Idea Discipline</a><a href="/bench">The Bench</a><a href="/bench#discuss">Independent Interrogation</a></nav></div><div class="footer-section"><div class="footer-section-label">PUBLIC RECORD</div><nav aria-label="Public record"><a href="/readings">Published Readings</a><a href="/bureau">Department of Hard Evidence</a></nav></div><div class="footer-section"><div class="footer-section-label">INSTITUTION</div><nav aria-label="Institution"><a href="/office">The Office</a><a href="/faq">FAQ</a><a href="/accessibility.html" aria-label="Accessibility statement">Accessibility</a><a href="/language.html" aria-label="Language settings">Language</a><a href="/privacy.html" aria-label="Privacy policy">Privacy</a><a href="/terms.html" aria-label="Terms of use">Terms</a></nav></div></div><div class="footer-colophon"><span>© 2026 Kill Dull<span class="tm">™</span></span><span>KD · OFFICE · MAN—001</span></div></div>';
    }
  }

  normalizeShell();

  var core=document.createElement('script');
  core.src='/assets/kd-core.js';
  core.onload=function(){
    normalizeShell();
    document.head.appendChild(style);
  };
  document.head.appendChild(core);
})();
