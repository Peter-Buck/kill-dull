/**
 * ASK KILL DULL
 *
 * The public window into Kill Dull. It answers questions about Kill Dull. It
 * does not judge the visitor's commitment — that is the Bench.
 *
 * The control is an icon only, placed in the persistent nav's empty top-left
 * grid column, opposite CONTACT. It is created here rather than authored into
 * the pages because kd.js rewrites the innerHTML of #registrar-desktop,
 * .unified-nav-products and .registrar-mobile on every load. A direct child of
 * #registrar is outside all three, so it survives, whichever script runs first.
 *
 * THE STANDING RULE, which governs the copy in this file as much as the model:
 *   ASK KILL DULL may explain approved Kill Dull doctrine.
 *   It may not create Kill Dull doctrine.
 * Every authored answer below is drawn from a live killdull.com page. The
 * model's half of the boundary is api/_lib/knowledge.js. The two must agree.
 */
(function () {
  'use strict';

  var ENDPOINT = '/api/ask';
  var RECORD_ID = 'KD · ASK — 001';
  var TITLE = 'ASK KILL DULL.';
  var PLACEHOLDER = 'Ask Kill Dull';
  var BOUNDARY = 'Public material only.';
  var FALLBACK = 'That did not go through. Try again, or use /contact.';

  /*
    Starter questions, each with an authored answer returned locally — no model
    call, no latency, and Kill Dull's own words on the questions that matter
    most. Question and answer both enter the history, so follow-ups keep
    context.

    Sources, in order: /bureau, /bureau, / and /bench, /bench, /,
    /discipline, /bench, /bench and /discipline, / , / and /bureau.
  */
  var STARTERS = [
    {
      q: 'What exactly does Kill Dull do?',
      a: 'Kill Dull brings independent scrutiny to consequential marketing commitments before they are made.\n\n' +
         'At its heart is the Bench. One commitment comes in. Evidence and assumptions are interrogated. The consequences across Product, Price, Place and Promotion are considered together. A judgment comes back — AAH. HMM. or DULL. — with the reasoning behind it.\n\n' +
         'What the company does with it remains the company’s decision. That’s the point.'
    },
    {
      q: 'Why does Kill Dull exist?',
      a: 'Because companies have specialists for every part of marketing except the part where the decision gets made.\n\n' +
         'Research, strategy, agencies, analytics, effectiveness, finance. What they don’t always have is an independent place to put the whole decision under scrutiny before they commit.\n\n' +
         'Kill Dull came from that gap.'
    },
    {
      q: 'What makes Kill Dull different?',
      a: 'It is outside the outcome.\n\n' +
         'Kill Dull doesn’t execute the decision, doesn’t produce the work and doesn’t profit from what comes next. An AAH is as successful for us as a DULL, which means there is nothing to sell you by saying either one.\n\n' +
         'A company cannot buy an AAH. It cannot negotiate away a DULL. Published Readings cannot be commissioned, suppressed or changed by the companies they examine.\n\n' +
         'Private Readings are paid for. The judgment isn’t.'
    },
    {
      q: 'What is The Bench?',
      a: 'Where a consequential commitment goes to be judged before it is made. Three parts.\n\n' +
         'You bring the proposed commitment, why you believe in it, and the evidence that matters. Then you leave. No workshop, no steering committee, no weekly PowerPoint tennis.\n\n' +
         'Independent scrutiny begins. If something material is missing, we ask.\n\n' +
         'Then a Private Reading lands on the table: the recommendation and the reasoning behind it. The Bench does not approve the decision and does not make it for you. You decide.'
    },
    {
      q: 'What is a Dense Idea?',
      a: 'An idea that keeps a company recognizably itself while everything around it changes.\n\n' +
         'It isn’t a tagline, a campaign or a set of guidelines. Dense Ideas don’t just last. They compound.\n\n' +
         'Consistency repeats. Coherence connects. Density generates. Compounding endures.'
    },
    {
      q: 'What do AAH. HMM. DULL. mean?',
      a: 'The three judgments.\n\n' +
         'AAH. The commitment deserves to be made.\n\n' +
         'HMM. Not enough to responsibly say AAH or DULL.\n\n' +
         'DULL. The commitment does not deserve to be made in its present form.\n\n' +
         'What comes back is the judgment plus the reasoning and evidence behind it, so you and your board can make the decision. Not us.'
    },
    {
      q: 'What kind of decisions do you examine?',
      a: 'Ones big enough to matter and early enough to stop.\n\n' +
         'A product launch. A market entry. A repositioning. A brand architecture decision. A name. A partnership. A customer-experience change. A major AI commitment. A distribution change.\n\n' +
         'The subject can change. The condition doesn’t: not an idea you might explore, a commitment you are actually considering.'
    },
    {
      q: 'Why should this happen before commitment?',
      a: 'Because afterwards the argument is about defending the decision rather than improving it.\n\n' +
         'Some commitments are too consequential to be judged only by the people trying to move them forward. Independent scrutiny is worth most while the thing is still cheap to stop.\n\n' +
         'And it isn’t only the commitment that gets judged. We also ask what happens if you don’t do it, because doing nothing is still a decision — and sometimes the safest-looking option carries the larger risk.'
    },
    {
      q: 'What does Kill Dull believe that others don’t?',
      a: 'That evidence and instinct are both evidence.\n\n' +
         'Data without judgment is analysis. Gut without evidence is opinion. Good decisions need both. When Big Data and Gut Data agree, that matters. When they disagree, that matters more — and the contradiction doesn’t get averaged away.\n\n' +
         'And that companies rarely drift because of one bad decision. Every decision leaves a precedent, and precedent changes what feels reasonable next time. Every yes trains the next yes.\n\n' +
         'A company can make a long series of perfectly reasonable decisions and become less itself.'
    },
    {
      q: 'Why would a company pay for this?',
      a: 'Because dull is expensive, and it is expensive quietly.\n\n' +
         'System1 and eatbigfish put a number on one part of it: US advertisers would need $189B in additional media investment for dull advertising to perform as well as non-dull advertising. McKinsey puts better marketing analytics at 15–20% of marketing spending freed.\n\n' +
         'Different research, different definitions, different parts of marketing. And only part of the bill.\n\n' +
         'The cost of scrutinizing a commitment before it is made is small against the cost of discovering the problem afterwards.'
    }
  ];

  /* ---------------------------------------------------------------------- */

  var nav = document.getElementById('registrar');
  if (!nav) return;

  var trigger = null;
  var panel = null;
  var readEl = null;
  var fieldEl = null;
  var sendEl = null;
  var open = false;
  var loading = false;
  var history = [];
  var asked = [];

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
    record.appendChild(el('span', null, RECORD_ID));
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

  function remaining() {
    return STARTERS.filter(function (s) { return asked.indexOf(s.q) === -1; });
  }

  function starterList(label) {
    var wrap = el('div');
    if (label) wrap.appendChild(el('div', 'ask-kd-label', label));
    var list = el('div', 'ask-kd-starters');
    remaining().forEach(function (s) {
      var btn = el('button', 'ask-kd-starter');
      btn.type = 'button';
      btn.appendChild(el('span', null, s.q));
      btn.appendChild(el('span', 'ask-kd-starter__mark'));
      btn.addEventListener('click', function () { send(s.q); });
      list.appendChild(btn);
    });
    wrap.appendChild(list);
    return wrap;
  }

  function turn(label, body, kind) {
    var t = el('div', 'ask-kd-turn ask-kd-turn--' + kind);
    t.appendChild(el('div', 'ask-kd-turn__label', label));
    t.appendChild(el('div', 'ask-kd-turn__body', body));
    return t;
  }

  function render() {
    readEl.textContent = '';

    // The opening is the title and the questions. Nothing explains them.
    if (history.length === 0) {
      readEl.appendChild(el('h2', 'ask-kd-title', TITLE));
      readEl.appendChild(starterList(null));
      return;
    }

    history.forEach(function (m) {
      readEl.appendChild(
        m.role === 'user'
          ? turn('Question', m.content, 'question')
          : turn('Kill Dull', m.content, 'answer')
      );
    });

    if (loading) {
      var w = el('div', 'ask-kd-turn ask-kd-turn--answer');
      w.appendChild(el('div', 'ask-kd-turn__label', 'Kill Dull'));
      var working = el('div', 'ask-kd-working');
      working.appendChild(el('span', 'ask-kd-working__mark'));
      working.appendChild(el('span', null, 'Examining'));
      w.appendChild(working);
      readEl.appendChild(w);
    } else if (remaining().length) {
      var more = starterList('Also ask');
      more.className = 'ask-kd-more';
      readEl.appendChild(more);
    }

    // Land on the exchange just added, not below it.
    var questions = readEl.querySelectorAll('.ask-kd-turn--question');
    var last = questions[questions.length - 1];
    readEl.scrollTop = last ? last.offsetTop - readEl.offsetTop : readEl.scrollHeight;
  }

  /* -- conversation ------------------------------------------------------ */

  function authored(question) {
    for (var i = 0; i < STARTERS.length; i++) {
      if (STARTERS[i].q === question) return STARTERS[i].a;
    }
    return null;
  }

  function send(text) {
    var question = (text || '').trim();
    if (!question || loading) return;

    fieldEl.value = '';
    var local = authored(question);
    if (local && asked.indexOf(question) === -1) asked.push(question);

    history.push({ role: 'user', content: question });

    if (local) {
      history.push({ role: 'assistant', content: local });
      render();
      syncSend();
      return;
    }

    loading = true;
    syncSend();
    render();

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    })
      .then(function (res) { return res.json()['catch'](function () { return {}; }); })
      .then(function (data) {
        history.push({ role: 'assistant', content: (data && data.text) || FALLBACK });
      })
      ['catch'](function () {
        history.push({ role: 'assistant', content: FALLBACK });
      })
      .then(function () {
        loading = false;
        render();
        syncSend();
        fieldEl.focus();
      });
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

    var focusable = panel.querySelectorAll('button:not([disabled]), input:not([disabled])');
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
    // Answering a starter re-renders the surface, so the clicked button is
    // already detached by the time this runs. The dispatch path still has it.
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
      window.addEventListener('resize', position);
      window.addEventListener('scroll', position, { passive: true });
      document.addEventListener('click', onDocumentClick);
      fieldEl.focus();
    } else {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position);
      document.removeEventListener('click', onDocumentClick);
    }
  }

  buildTrigger();
  buildPanel();
})();
