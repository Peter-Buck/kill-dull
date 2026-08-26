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
