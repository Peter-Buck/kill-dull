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
 * THE STANDING RULE, which governs the copy in this file:
 *   ASK KILL DULL may explain approved Kill Dull doctrine.
 *   It may not create Kill Dull doctrine.
 * Every authored answer below is drawn from a live killdull.com page.
 *
 * Ten questions, ten authored answers, and nothing else. The panel asks the
 * model nothing: there is no free-text field, so every word a visitor can
 * read here is a word Kill Dull wrote. The model's half of the boundary
 * (api/_lib/knowledge.js, /api/ask) is held in the repository, unbuilt, for
 * whenever the field comes back.
 */
(function () {
  'use strict';

  var TITLE = 'ASK KILL DULL';
  var BOUNDARY = 'Public material only.';

  /*
    Sources, in order: /bureau, /bureau, / and /bench, /bench, /,
    /discipline, /bench, /bench and /discipline, / , / and /bureau.
  */
  var STARTERS = [
    {
      q: 'What exactly does Kill Dull do?',
      a: 'Kill Dull brings independent scrutiny to consequential marketing commitments before they are made.\n\n' +
         'One commitment goes before the Bench. Evidence and assumptions are interrogated across Product, Price, Place and Promotion. A judgment comes back — AAH. HMM. or DULL. — with the reasoning behind it.\n\n' +
         'You decide what happens next.'
    },
    {
      q: 'Why does Kill Dull exist?',
      a: 'Companies have plenty of marketing expertise. What they don’t always have is an independent place to scrutinize the whole decision before they commit.\n\n' +
         'Kill Dull exists to provide it.'
    },
    {
      q: 'What makes Kill Dull different?',
      a: 'Kill Dull is independent of the outcome.\n\n' +
         'An AAH is as successful for us as a DULL.\n\n' +
         'A company cannot buy an AAH or negotiate away a DULL. Published Readings cannot be commissioned, suppressed or changed by the companies they examine.\n\n' +
         'Private Readings are paid for. The judgment isn’t.'
    },
    {
      q: 'What is The Bench?',
      a: 'The Bench is where a consequential marketing commitment goes for independent scrutiny before it is made.\n\n' +
         'You make the case. Then you leave.\n\n' +
         'We interrogate the evidence, assumptions and consequences.\n\n' +
         'What comes back is a Private Reading: our recommendation and the reasoning behind it.\n\n' +
         'You decide.'
    },
    {
      q: 'What is a Dense Idea?',
      a: 'An idea that keeps a company recognizably itself while everything around it changes.\n\n' +
         'Dense Ideas don’t just last. They compound.\n\n' +
         'Consistency repeats. Coherence connects. Density generates. Compounding endures.'
    },
    {
      q: 'What do AAH. HMM. DULL. mean?',
      a: 'The three judgments.\n\n' +
         'AAH. The commitment deserves to be made.\n\n' +
         'HMM. Not enough to responsibly say AAH or DULL.\n\n' +
         'DULL. The commitment does not deserve to be made in its present form.'
    },
    {
      q: 'What kind of decisions do you examine?',
      a: 'Big enough to matter. Early enough to stop.\n\n' +
         'A product launch. Market entry. Repositioning. Brand architecture. Naming. Partnership. Customer-experience change. Major AI commitment. Distribution change.\n\n' +
         'A commitment you’re actually considering.'
    },
    {
      q: 'Why should this happen before commitment?',
      a: 'Because scrutiny is worth more while the decision is still cheap to change.\n\n' +
         'Once a commitment is made, the pressure shifts from questioning it to defending it.\n\n' +
         'We also ask what happens if you don’t proceed. Doing nothing is still a decision.'
    },
    {
      q: 'How does Kill Dull think about judgment?',
      a: 'Evidence and instinct both matter.\n\n' +
         'Data without judgment is analysis. Gut without evidence is opinion. Good decisions need both.\n\n' +
         'Decisions accumulate. Every decision leaves a precedent. Precedent changes what feels reasonable next time.\n\n' +
         'EVERY YES TRAINS THE NEXT YES.\n\n' +
         'A company can make a long series of perfectly reasonable decisions and become less itself.'
    },
    {
      q: 'Why would a company pay for this?',
      a: 'Because the cost of scrutiny is small compared with the cost of getting a consequential commitment wrong.\n\n' +
         'System1 and eatbigfish estimate dull US advertising would require $189B in additional media investment to match the predicted results of non-dull advertising. McKinsey estimates better marketing analytics can free 15–20% of marketing spending.\n\n' +
         'Different research, different definitions, different parts of marketing. And only part of the bill.'
    }
  ];

  /* ---------------------------------------------------------------------- */


  var nav = document.getElementById('registrar');
  if (!nav) return;

  var trigger = null;
  var panel = null;
  var readEl = null;   // the scrolling reading surface
  var listEl = null;   // the ruled list of questions inside it
  var open = false;
  var openRow = null;

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

  /* -- the index ---------------------------------------------------------
     Ten questions, each with its answer folded underneath it. One answer is
     open at a time: opening the next closes the last, so the list never grows
     past the height of the panel and the question you came for stays in view.
     The same rule kd.js applies to the Bench cards.
     -------------------------------------------------------------------- */

  function buildRow(item, index) {
    var id = 'ask-kd-a' + index;

    var question = el('button', 'ask-kd-starter');
    question.type = 'button';
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', id);
    question.appendChild(el('span', null, item.q));
    question.appendChild(el('span', 'ask-kd-starter__mark'));

    var answer = el('div', 'ask-kd-answer');
    answer.id = id;
    answer.hidden = true;
    answer.appendChild(el('div', 'ask-kd-answer__body', item.a));

    var row = { question: question, answer: answer };
    question.addEventListener('click', function () { toggle(row); });

    listEl.appendChild(question);
    listEl.appendChild(answer);
  }

  function shut(row) {
    row.answer.hidden = true;
    row.question.setAttribute('aria-expanded', 'false');
    row.question.classList.remove('is-open');
  }

  function toggle(row) {
    if (openRow === row) {
      shut(row);
      openRow = null;
      return;
    }
    if (openRow) shut(openRow);

    row.answer.hidden = false;
    row.question.setAttribute('aria-expanded', 'true');
    row.question.classList.add('is-open');
    openRow = row;

    // Land on the question, not below it.
    readEl.scrollTop = row.question.offsetTop - readEl.offsetTop;
  }

  function buildPanel() {
    panel = el('div', 'ask-kd-panel');
    panel.id = 'ask-kill-dull-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Ask Kill Dull');

    var record = el('div', 'ask-kd-record');
    var close = el('button', 'ask-kd-record__close', 'Close');
    close.type = 'button';
    close.addEventListener('click', function () {
      setOpen(false);
      trigger.focus();
    });
    record.appendChild(close);
    panel.appendChild(record);

    readEl = el('div', 'ask-kd-read');
    panel.appendChild(readEl);

    // The title is the whole opening. Nothing explains the questions.
    readEl.appendChild(el('h2', 'ask-kd-title', TITLE));
    listEl = el('div', 'ask-kd-starters');
    readEl.appendChild(listEl);
    STARTERS.forEach(buildRow);

    panel.appendChild(el('div', 'ask-kd-boundary', BOUNDARY));
    panel.addEventListener('keydown', onPanelKeyDown);

    document.body.appendChild(panel);
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

    var focusable = panel.querySelectorAll('button:not([disabled])');
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
      window.addEventListener('resize', position);
      window.addEventListener('scroll', position, { passive: true });
      document.addEventListener('click', onDocumentClick);
    } else {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position);
      document.removeEventListener('click', onDocumentClick);
      // Next opening starts from the index, not from where you left off.
      if (openRow) { shut(openRow); openRow = null; }
      if (readEl) readEl.scrollTop = 0;
    }
  }

  buildTrigger();
  buildPanel();
})();
