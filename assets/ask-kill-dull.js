/**
 * ASK KILL DULL
 *
 * The public window into Kill Dull. It answers questions about Kill Dull from
 * the public record. It does not judge the visitor's commitment — that is
 * the Bench.
 *
 * The control is an icon only, placed in the persistent nav's empty top-left
 * grid column, opposite CONTACT. It is created here rather than authored into
 * the pages because kd.js rewrites the innerHTML of #registrar-desktop,
 * .unified-nav-products and .registrar-mobile on every load. A direct child of
 * #registrar is outside all three, so it survives, whichever script runs first.
 *
 * One conversation, two states.
 *   Opening: the title, ten suggested questions, the question field.
 *   Conversation: each question and its answer in order, the question field
 *   for the next one, and START OVER, which clears the conversation and
 *   returns to the opening.
 * A suggested question and a typed question are the same thing: either is
 * sent to /api/ask with the conversation so far and answered from the public
 * site. Nothing here is answered from text written into this file.
 *
 * The conversation lives in this page's memory only. Nothing is written to
 * cookies or storage; reloading or leaving the page ends it.
 */
(function () {
  'use strict';

  var ENDPOINT = '/api/ask';
  var TITLE = 'ASK KILL DULL';
  var PLACEHOLDER = 'Ask Kill Dull';
  var BOUNDARY = 'Public material only.';
  var FALLBACK = 'That did not go through. Try again, or use /contact.';
  var MAX_CHARS = 2000;

  // The ids are fixed so analytics can tell the questions apart (q1–q10).
  var STARTERS = [
    'What exactly does Kill Dull do?',
    'Why does Kill Dull exist?',
    'What makes Kill Dull different?',
    'What is The Bench?',
    'What is a Dense Idea?',
    'What do AAH. HMM. DULL. mean?',
    'What kind of decisions do you examine?',
    'Why should this happen before commitment?',
    'How does Kill Dull think about judgment?',
    'Why would a company pay for this?'
  ];

  /* ---------------------------------------------------------------------- */

  var nav = document.getElementById('registrar');
  if (!nav) return;

  var trigger = null;
  var panel = null;
  var restartEl = null;
  var readEl = null;
  var fieldEl = null;
  var sendEl = null;
  var open = false;
  var loading = false;
  // What is sent: alternating user / assistant turns.
  var history = [];
  // What is shown: the same turns, plus notices that are never sent.
  var turns = [];
  // Bumped by START OVER, so an answer to a cleared conversation is dropped.
  var generation = 0;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function buildTrigger() {
    trigger = el('button', 'ask-kd-trigger');
    trigger.type = 'button';
    trigger.id = 'ask-kill-dull-trigger';
    trigger.setAttribute('aria-label', 'Ask Kill Dull');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'ask-kill-dull-panel');
    trigger.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      '</svg>';
    // A direct child of the nav: outside the three containers kd.js rewrites.
    nav.appendChild(trigger);
    trigger.addEventListener('click', function () { setOpen(!open); });
  }

  function buildPanel() {
    panel = el('div', 'ask-kd-panel');
    panel.id = 'ask-kill-dull-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Ask Kill Dull');

    var record = el('div', 'ask-kd-record');
    restartEl = el('button', 'ask-kd-record__restart', 'Start over');
    restartEl.type = 'button';
    restartEl.hidden = true;
    restartEl.addEventListener('click', startOver);
    record.appendChild(restartEl);

    var close = el('button', 'ask-kd-record__close', 'Close');
    close.type = 'button';
    close.addEventListener('click', function () {
      setOpen(false);
      trigger.focus();
    });
    record.appendChild(close);
    panel.appendChild(record);

    readEl = el('div', 'ask-kd-read');
    readEl.setAttribute('role', 'log');
    readEl.setAttribute('aria-live', 'polite');
    panel.appendChild(readEl);

    var ask = el('form', 'ask-kd-ask');
    fieldEl = el('input', 'ask-kd-ask__field');
    fieldEl.type = 'text';
    fieldEl.autocomplete = 'off';
    fieldEl.maxLength = MAX_CHARS;
    fieldEl.placeholder = PLACEHOLDER;
    fieldEl.setAttribute('aria-label', 'Ask Kill Dull a question');
    fieldEl.addEventListener('input', syncSend);

    sendEl = el('button', 'ask-kd-ask__send', 'Ask');
    sendEl.type = 'submit';
    sendEl.disabled = true;

    ask.addEventListener('submit', function (e) {
      e.preventDefault();
      send(fieldEl.value);
    });
    ask.appendChild(fieldEl);
    ask.appendChild(sendEl);
    panel.appendChild(ask);

    panel.appendChild(el('div', 'ask-kd-boundary', BOUNDARY));
    panel.addEventListener('keydown', onPanelKeyDown);

    document.body.appendChild(panel);
    render();
  }

  function syncSend() {
    if (sendEl) sendEl.disabled = loading || !fieldEl.value.trim();
  }

  /* -- rendering --------------------------------------------------------- */

  function starterList() {
    var list = el('div', 'ask-kd-starters');
    STARTERS.forEach(function (q, i) {
      var btn = el('button', 'ask-kd-starter');
      btn.type = 'button';
      btn.setAttribute('data-ask-starter', 'q' + (i + 1));
      btn.appendChild(el('span', null, q));
      btn.appendChild(el('span', 'ask-kd-starter__mark'));
      btn.addEventListener('click', function () { send(q); });
      list.appendChild(btn);
    });
    return list;
  }

  function turn(label, body, kind) {
    var t = el('div', 'ask-kd-turn ask-kd-turn--' + kind);
    t.appendChild(el('div', 'ask-kd-turn__label', label));
    t.appendChild(el('div', 'ask-kd-turn__body', body));
    return t;
  }

  function render() {
    readEl.textContent = '';
    var conversing = turns.length > 0;
    restartEl.hidden = !conversing;

    // The opening is the title and the questions. Nothing explains them.
    if (!conversing) {
      readEl.appendChild(el('h2', 'ask-kd-title', TITLE));
      readEl.appendChild(starterList());
      readEl.scrollTop = 0;
      return;
    }

    turns.forEach(function (t) {
      if (t.kind === 'question') readEl.appendChild(turn('Question', t.text, 'question'));
      else readEl.appendChild(turn('Kill Dull', t.text, t.kind === 'notice' ? 'answer ask-kd-turn--notice' : 'answer'));
    });

    if (loading) {
      var w = el('div', 'ask-kd-turn ask-kd-turn--answer');
      w.appendChild(el('div', 'ask-kd-turn__label', 'Kill Dull'));
      var working = el('div', 'ask-kd-working');
      working.appendChild(el('span', 'ask-kd-working__mark'));
      working.appendChild(el('span', null, 'Examining'));
      w.appendChild(working);
      readEl.appendChild(w);
    }

    // Land on the exchange just added, not below it.
    var questions = readEl.querySelectorAll('.ask-kd-turn--question');
    var last = questions[questions.length - 1];
    readEl.scrollTop = last ? last.offsetTop - readEl.offsetTop : readEl.scrollHeight;
  }

  /* -- conversation ------------------------------------------------------ */

  function send(text) {
    var question = (text || '').trim().slice(0, MAX_CHARS);
    if (!question || loading) return;

    fieldEl.value = '';
    history.push({ role: 'user', content: question });
    turns.push({ kind: 'question', text: question });

    loading = true;
    syncSend();
    render();

    var mine = generation;
    var ok = false;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    })
      .then(function (res) {
        ok = res.ok;
        return res.json()['catch'](function () { return {}; });
      })
      .then(function (data) {
        if (mine !== generation) return;
        var answer = data && typeof data.text === 'string' && data.text ? data.text : FALLBACK;
        if (ok) {
          history.push({ role: 'assistant', content: answer });
          turns.push({ kind: 'answer', text: answer });
        } else {
          // Not part of the conversation: the question is withdrawn from what
          // is sent next, so the visitor can simply ask again.
          history.pop();
          turns.push({ kind: 'notice', text: answer });
        }
      })
      ['catch'](function () {
        if (mine !== generation) return;
        history.pop();
        turns.push({ kind: 'notice', text: FALLBACK });
      })
      .then(function () {
        if (mine !== generation) return;
        loading = false;
        render();
        syncSend();
        if (open) fieldEl.focus();
      });
  }

  function startOver() {
    generation++;
    history = [];
    turns = [];
    loading = false;
    fieldEl.value = '';
    render();
    syncSend();
    fieldEl.focus();
  }

  /* -- open / close / position ------------------------------------------- */

  function position() {
    if (!panel || !open) return;
    var navRect = nav.getBoundingClientRect();
    var top = navRect.bottom > 0 ? navRect.bottom : 0;
    panel.style.top = top + 'px';

    var narrow = window.innerWidth <= 767;
    panel.style.left = narrow ? '0px' : trigger.getBoundingClientRect().left + 'px';
    panel.style.maxHeight = (window.innerHeight - top - (narrow ? 0 : 32)) + 'px';
  }

  function onPanelKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
      trigger.focus();
      return;
    }
    if (e.key !== 'Tab') return;

    var focusable = Array.prototype.filter.call(
      panel.querySelectorAll('button:not([disabled]), input:not([disabled])'),
      function (n) { return !n.hidden; }
    );
    if (focusable.length < 2) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onDocumentClick(e) {
    if (!open) return;
    var path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    if (path.indexOf(panel) !== -1 || path.indexOf(trigger) !== -1) return;
    if (panel.contains(e.target) || trigger.contains(e.target)) return;
    setOpen(false);
  }

  function setOpen(next) {
    if (next === open) return;
    open = next;
    trigger.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);

    if (open) {
      position();
      render();
      window.addEventListener('resize', position);
      window.addEventListener('scroll', position, { passive: true });
      document.addEventListener('click', onDocumentClick);
    } else {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position);
      document.removeEventListener('click', onDocumentClick);
    }
  }

  buildTrigger();
  buildPanel();
})();
