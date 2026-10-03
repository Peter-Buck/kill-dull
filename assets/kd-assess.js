/* Kill Dull Marketing Judgment Test — a diagnostic instrument, not a quiz.
   Loaded only by /assessment. Everything below runs client-side; no response,
   email address or Reading ever leaves the browser. */
(function () {
  'use strict';

  var VERSION = 1;
  var STORE_KEY = 'kd_assessment_v1';

  /* ---------------------------------------------------------------- responses */

  var RESPONSES = [
    { id: 'YES',       label: 'YES',        note: 'This consistently describes how we operate.', score: 3 },
    { id: 'SOMETIMES', label: 'SOMETIMES',  note: 'It happens, but not consistently.',           score: 2 },
    { id: 'NO',        label: 'NO',         note: 'This generally does not happen.',             score: 0 },
    { id: 'DK',        label: "DON'T KNOW", note: "I can't confidently say.",                    score: 1 }
  ];
  var SCORE = {}; var i;
  for (i = 0; i < RESPONSES.length; i++) SCORE[RESPONSES[i].id] = RESPONSES[i].score;

  /* ---------------------------------------------------------------- questions */

  var CONDITIONS = [
    { key: 'clarity',         n: '01', name: 'CLARITY' },
    { key: 'evidence',        n: '02', name: 'EVIDENCE' },
    { key: 'independence',    n: '03', name: 'INDEPENDENCE' },
    { key: 'challenge',       n: '04', name: 'CHALLENGE' },
    { key: 'distinctiveness', n: '05', name: 'DISTINCTIVENESS' },
    { key: 'time',            n: '06', name: 'TIME' },
    { key: 'accountability',  n: '07', name: 'ACCOUNTABILITY' }
  ];

  var FOURP = [
    { key: 'product',   name: 'PRODUCT' },
    { key: 'price',     name: 'PRICE' },
    { key: 'place',     name: 'PLACE' },
    { key: 'promotion', name: 'PROMOTION' }
  ];

  /* 16 screens. Screens 15 and 16 carry two inputs each — 18 inputs in all.
     The respondent never chooses a P; all four are always assessed. */
  var QUESTIONS = [
    { id: 'q1', cond: 'clarity',
      text: 'Before a consequential marketing decision is approved, is it clear exactly what is being decided, why now, and what alternatives are being rejected?',
      example: '“Launch this product” is not the same decision as “enter this category now with this product rather than extend the existing range.”' },
    { id: 'q2', cond: 'clarity',
      text: 'Could someone who did not develop the recommendation accurately explain the argument for making the decision?',
      example: 'If the decision only makes sense after a 60-slide presentation from the people proposing it, answer accordingly.' },
    { id: 'q3', cond: 'evidence',
      text: 'Before commitment, is there evidence capable of changing the preferred decision, rather than primarily supporting it?',
      example: 'Six months of work supports a launch, but late customer evidence contradicts a central assumption. Is stopping still genuinely possible?' },
    { id: 'q4', cond: 'evidence',
      text: 'Does the organization distinguish between what it knows, what it believes, and what it is assuming when making major marketing decisions?',
      example: "Confidence is useful. It isn't evidence." },
    { id: 'q5', cond: 'independence',
      text: 'Does someone who did not propose, sell or own the decision formally scrutinize it before commitment?',
      example: 'Not another pair of eyes on the execution. Someone able to question whether the commitment itself should be made.' },
    { id: 'q6', cond: 'independence',
      text: 'Can that person credibly recommend NO without having a commercial, political or organizational interest in getting to YES?',
      example: "An agency judging the strategy it will execute, or a team judging the initiative it has spent six months developing, isn't fully independent." },
    { id: 'q7', cond: 'challenge',
      text: 'Before approval, does someone deliberately construct the strongest credible argument against the preferred decision?',
      example: '“Any concerns?” at the end of the meeting is not this.' },
    { id: 'q8', cond: 'challenge',
      text: 'When senior stakeholders agree quickly, does the organization test whether consensus has replaced scrutiny?',
      example: 'Agreement can be evidence of a good decision. It can also mean nobody wants to be the difficult person in the room.',
      statement: 'CONSENSUS IS NOT DUE DILIGENCE.' },
    { id: 'q9', cond: 'distinctiveness',
      text: 'Before committing, does the organization explicitly consider whether the decision makes the company more recognizable and preferable — or more interchangeable?',
      example: "This applies to products, prices, distribution and promotion. Distinctiveness isn't an advertising issue." },
    { id: 'q10', cond: 'distinctiveness',
      text: 'Can the people approving consequential marketing decisions identify what customers value about the company that should not be casually traded away?',
      example: 'Efficiency can remove cost. It can also remove the thing people came for.' },
    { id: 'q11', cond: 'time',
      text: 'Are major marketing decisions evaluated for what they may build or erode over several years, not only what they are expected to deliver next quarter?' },
    { id: 'q12', cond: 'time',
      text: "Does the organization consider whether today's decision makes future decisions more valuable, less valuable or more constrained?",
      example: 'Some decisions generate returns. Others generate options. Others quietly remove them.' },
    { id: 'q13', cond: 'accountability',
      text: 'Before commitment, is it clear who owns the reasoning behind the decision?',
      example: 'Not merely who owns implementation or the P&L.' },
    { id: 'q14', cond: 'accountability',
      text: 'After consequential decisions, does the organization revisit the original assumptions and reasoning — not merely whether the outcome was good or bad?',
      example: 'Good decisions can have bad outcomes. Bad decisions can get lucky.' },
    { id: 'q15', pair: true, marker: 'PRODUCT + PRICE', parts: [
        { id: 'q15a', cond: 'product', label: 'PRODUCT',
          scenario: 'A change would materially reduce cost or complexity but removes something customers distinctly associate with the product.',
          text: 'Would the potential loss of customer value and distinctiveness carry meaningful weight alongside the operational gain?' },
        { id: 'q15b', cond: 'price', label: 'PRICE',
          scenario: 'A price reduction is forecast to produce significant short-term volume.',
          text: 'Would its potential effect on perceived value, future pricing power and the ability to recover the price be formally considered?' }
      ] },
    { id: 'q16', pair: true, marker: 'PLACE + PROMOTION', parts: [
        { id: 'q16a', cond: 'place', label: 'PLACE',
          scenario: 'A new channel or distribution partner could substantially increase reach but would change where, how and alongside whom customers encounter the brand.',
          text: 'Would those consequences receive meaningful scrutiny alongside the commercial opportunity?' },
        { id: 'q16b', cond: 'promotion', label: 'PROMOTION',
          scenario: 'A new communications platform performs strongly in testing but substantially reduces what makes the company recognizable from competitors.',
          text: 'Could protecting distinctiveness credibly outweigh the stronger immediate test result?' }
      ] }
  ];

  var INPUTS = [];   /* flat list of every scored input id, in order */
  var INPUT_COND = {};
  (function () {
    for (var q = 0; q < QUESTIONS.length; q++) {
      var Q = QUESTIONS[q];
      if (Q.pair) {
        for (var p = 0; p < Q.parts.length; p++) { INPUTS.push(Q.parts[p].id); INPUT_COND[Q.parts[p].id] = Q.parts[p].cond; }
      } else { INPUTS.push(Q.id); INPUT_COND[Q.id] = Q.cond; }
    }
  })();

  /* ------------------------------------------------------------------ scoring */

  function band(pct) { return pct >= 75 ? 'AAH' : (pct >= 40 ? 'HMM' : 'DULL'); }
  function rank(v) { return v === 'AAH' ? 2 : (v === 'HMM' ? 1 : 0); }

  function score(answers) {
    var dims = {}, key, k;
    for (k = 0; k < INPUTS.length; k++) {
      key = INPUT_COND[INPUTS[k]];
      if (!dims[key]) dims[key] = { got: 0, max: 0 };
      dims[key].got += SCORE[answers[INPUTS[k]]];
      dims[key].max += 3;
    }
    var conditions = {}, fours = {}, total = 0, totalMax = 0;
    for (key in dims) {
      if (!dims.hasOwnProperty(key)) continue;
      var pct = Math.round((dims[key].got / dims[key].max) * 100);
      var v = band(pct);
      if (key === 'product' || key === 'price' || key === 'place' || key === 'promotion') fours[key] = v;
      else conditions[key] = v;
      total += dims[key].got; totalMax += dims[key].max;
    }

    var overall = band(Math.round((total / totalMax) * 100));
    var gates = [];

    /* Rules and judgment outrank the arithmetic. */
    if (overall === 'AAH' && conditions.independence === 'DULL') {
      overall = 'HMM'; gates.push('independence');
    }
    if (overall === 'AAH' && (answers.q3 === 'NO' || answers.q3 === 'DK')) {
      overall = 'HMM'; gates.push('evidence');
    }
    if (overall === 'AAH' &&
        (answers.q7 === 'NO' || answers.q7 === 'DK') &&
        (answers.q8 === 'NO' || answers.q8 === 'DK')) {
      overall = 'HMM'; gates.push('challenge');
    }
    if (overall === 'AAH' && (fours.product === 'DULL' || fours.price === 'DULL' ||
                              fours.place === 'DULL' || fours.promotion === 'DULL')) {
      overall = 'HMM'; gates.push('breadth');
    }

    return { overall: overall, conditions: conditions, fours: fours, gates: gates };
  }

  window.KD_ASSESS = {
    VERSION: VERSION, STORE_KEY: STORE_KEY,
    RESPONSES: RESPONSES, SCORE: SCORE, CONDITIONS: CONDITIONS, FOURP: FOURP,
    QUESTIONS: QUESTIONS, INPUTS: INPUTS, INPUT_COND: INPUT_COND,
    band: band, rank: rank, score: score
  };
})();

/* Kill Dull Marketing Judgment Test — the written Reading.
   Every line below is selected from the actual responses. Nothing is boilerplate
   applied regardless of answers, and no number is ever shown to the respondent. */
(function () {
  'use strict';

  var A = window.KD_ASSESS;
  var weak = function (v) { return v === 'NO' || v === 'DK'; };
  var firm = function (v) { return v === 'YES'; };

  /* ------------------------------------------------------------ overall verdict */

  var VERDICT = {
    AAH: {
      head: 'YOUR MARKETING JUDGMENT HAS TEETH.',
      body: 'Consequential decisions are clearly framed, evidence can overturn preferred answers, meaningful challenge occurs before commitment and independent scrutiny exists.',
      tail: 'On this evidence you may not have a Kill Dull problem. We would rather tell you that than sell you a Private Reading you don’t need.'
    },
    HMM: {
      head: 'YOUR MARKETING JUDGMENT HAS GAPS.',
      body: 'The organization has many of the ingredients for good decision-making, but important decisions can still reach commitment without sufficient independence, challenge or long-term scrutiny.',
      tail: 'The gaps are specific rather than general. They are set out below.'
    },
    DULL: {
      head: 'YOUR MARKETING DECISIONS ARE EXPOSED.',
      body: 'Consequential decisions can move from recommendation to commitment without sufficient independent scrutiny. Evidence, challenge or accountability may exist, but the system does not reliably protect the organization from its own conviction.',
      tail: 'This is the gap Kill Dull exists to address.'
    }
  };

  /* Where a gate overrode the arithmetic, say so plainly. */
  var GATE_NOTE = {
    independence: 'The rest of your answers were stronger than this verdict. Independent scrutiny is the condition the others depend on, so it sets the ceiling.',
    evidence: 'The rest of your answers were stronger than this verdict. Evidence that cannot overturn the preferred decision is not yet scrutiny, so it sets the ceiling.',
    challenge: 'The rest of your answers were stronger than this verdict. Without deliberate challenge before approval, the other conditions are not load-bearing.',
    breadth: 'The rest of your answers were stronger than this verdict. Marketing is Product, Price, Place and Promotion — a gap in any one of them sets the ceiling.'
  };

  /* -------------------------------------------------- the seven conditions */

  var CONDITION_COPY = {
    clarity: {
      AAH: 'Decisions arrive named. What is being decided, why now and what is being rejected are legible before approval.',
      HMM: 'The decision is usually clear to the people proposing it. It is not always clear to the people approving it.',
      DULL: 'Consequential decisions can be approved without a shared account of what is actually being decided.'
    },
    evidence: {
      AAH: 'Evidence is allowed to be inconvenient, and what the organization knows is held apart from what it believes.',
      HMM: 'Evidence is gathered. Whether it can still change the answer late depends on who is asking.',
      DULL: 'Evidence largely arrives to support a decision that has already been made.'
    },
    independence: {
      AAH: 'Someone outside the recommendation can say no, and has no stake in getting to yes.',
      HMM: 'Scrutiny exists. Disinterest is less certain.',
      DULL: 'The decision is largely judged by the people who want it made.'
    },
    challenge: {
      AAH: 'The strongest case against is built deliberately, before approval, by someone whose job it is to build it.',
      HMM: 'Challenge happens. It depends on individuals rather than on the process.',
      DULL: 'Objection is available in principle and rare in practice.'
    },
    distinctiveness: {
      AAH: 'Whether a decision makes the company more recognizable or more interchangeable is an explicit question.',
      HMM: 'Distinctiveness is considered, but more readily in promotion than in product, price or place.',
      DULL: 'Decisions are judged on efficiency and performance. What makes the company preferable is not formally in the room.'
    },
    time: {
      AAH: 'Decisions are judged on what they build or erode over years, and on what they do to the decisions that follow.',
      HMM: 'Long-term consequences are acknowledged. Next quarter usually decides.',
      DULL: 'The horizon is the forecast. What a decision removes from the future is not examined.'
    },
    accountability: {
      AAH: 'Ownership of the reasoning is explicit, and the reasoning is revisited afterwards — not only the outcome.',
      HMM: 'Implementation has an owner. The argument behind the decision is less clearly owned.',
      DULL: 'Decisions have owners for delivery. The reasoning that produced them has none.'
    }
  };

  /* Pattern beats band: a specific shape of answers says more than a level. */
  function conditionLine(key, verdict, a) {
    if (key === 'clarity' && firm(a.q1) && weak(a.q2))
      return 'The decision is framed. It does not reliably survive being explained by anyone who did not build it.';
    if (key === 'evidence' && weak(a.q3) && !weak(a.q4))
      return 'The organization separates knowledge from belief, but by the time evidence lands the decision is difficult to stop.';
    if (key === 'evidence' && !weak(a.q3) && weak(a.q4))
      return 'Evidence can still change the answer. Knowing, believing and assuming are not reliably separated.';
    if (key === 'independence' && firm(a.q5) && weak(a.q6))
      return 'Someone scrutinizes the decision. They are not disinterested in the answer.';
    if (key === 'challenge' && firm(a.q7) && weak(a.q8))
      return 'The case against gets built. Quick agreement is not itself treated as something to test.';
    if (key === 'challenge' && weak(a.q7) && firm(a.q8))
      return 'Consensus is questioned, but nobody is tasked with building the strongest case against.';
    if (key === 'distinctiveness' && firm(a.q9) && weak(a.q10))
      return 'The question gets asked. What should not be traded away is not commonly held by the people approving.';
    if (key === 'time' && firm(a.q11) && weak(a.q12))
      return 'Multi-year effects are considered. Whether today’s decision constrains tomorrow’s is not.';
    if (key === 'accountability' && firm(a.q13) && weak(a.q14))
      return 'The reasoning has an owner before commitment. It is not revisited afterwards.';
    if (key === 'accountability' && weak(a.q13) && firm(a.q14))
      return 'Decisions are reviewed afterwards. Before commitment, the reasoning belongs to nobody in particular.';
    return CONDITION_COPY[key][verdict];
  }

  /* --------------------------------------------------------- the four Ps */

  var FOUR_COPY = {
    product: {
      AAH: 'A change that strips cost would be weighed against what customers distinctly value. Both sides get a hearing.',
      HMM: 'Operational gain is easier to quantify than distinctiveness, and tends to win on that basis.',
      DULL: 'Cost and complexity decide. What customers came for is not formally weighed.'
    },
    price: {
      AAH: 'Price moves are judged on perceived value, future pricing power and recoverability — not only on volume.',
      HMM: 'Short-term volume is modelled. Long-term pricing power is discussed rather than assessed.',
      DULL: 'Price is judged by what it moves this quarter, not by what it would cost to recover.'
    },
    place: {
      AAH: 'Where, how and alongside whom the brand is encountered is scrutinized alongside the reach a channel buys.',
      HMM: 'Distribution decisions weigh reach first. Context is a secondary consideration.',
      DULL: 'Reach decides. What a channel does to how the brand is encountered is not examined.'
    },
    promotion: {
      AAH: 'A stronger immediate test result does not automatically outrank staying recognizable.',
      HMM: 'Testing carries real weight. Whether a platform keeps the company recognizable is argued rather than decided.',
      DULL: 'Test performance settles it. Recognizability is not a competing consideration.'
    }
  };
  function fourLine(key, verdict) { return FOUR_COPY[key][verdict]; }

  /* ------------------------------------------------ what we'd pay attention to */

  /* Candidates are patterns, not low scores. The first three that apply are used,
     and no dimension is allowed to supply more than one of them. */
  function findings(result, a) {
    var c = result.conditions, f = result.fours, R = A.rank;
    var cand = [];
    function add(group, label, text) { cand.push({ group: group, label: label, text: text }); }

    if (firm(a.q5) && weak(a.q6))
      add('independence', 'INDEPENDENCE', 'Your organization has challenge. It does not consistently have independent challenge. The person scrutinizing the decision has an interest in the answer.');
    else if (c.independence === 'DULL')
      add('independence', 'INDEPENDENCE', 'Consequential decisions are judged largely by the people proposing them. Nothing else in the system compensates for that.');
    else if (R(c.challenge) > R(c.independence))
      add('independence', 'INDEPENDENCE', 'Challenge is stronger than independence. The argument gets tested; who tests it is less settled.');

    if (weak(a.q3))
      add('commitment', 'COMMITMENT', 'Scrutiny becomes strongest after considerable organizational commitment already exists. By the time evidence could change the decision, stopping is expensive.');

    if (f.price === 'DULL' || (f.price === 'HMM' && R(f.price) < R(c.time)))
      add('price', 'PRICE', 'Pricing decisions appear better scrutinized for immediate commercial impact than for what they do to future willingness to pay.');
    if (f.product === 'DULL')
      add('product', 'PRODUCT', 'Product decisions are resolved on cost and complexity. What customers distinctly associate with the product is not weighed against the saving.');
    if (f.place === 'DULL')
      add('place', 'PLACE', 'Distribution is judged on reach. Where and alongside whom customers meet the brand is not part of the commitment.');
    if (f.promotion === 'DULL')
      add('promotion', 'PROMOTION', 'Communications decisions follow the test result. Whether the company stays recognizable is not a competing input.');

    if (weak(a.q7) && weak(a.q8))
      add('challenge', 'CHALLENGE', 'No one is tasked with building the case against, and rapid agreement is not treated as a signal. Consensus is doing the work of due diligence.');
    if (weak(a.q14))
      add('accountability', 'ACCOUNTABILITY', 'Outcomes are reviewed. The assumptions that produced them are not, so the organization learns results rather than judgment.');
    if (firm(a.q11) && weak(a.q12))
      add('time', 'TIME', 'Long-term value is assessed. Optionality is not: whether a decision constrains the decisions that follow it goes unexamined.');
    if (weak(a.q2))
      add('clarity', 'CLARITY', 'The argument for a decision does not travel independently of the people who made it. That makes it hard to scrutinize and easy to approve.');
    if (c.distinctiveness === 'DULL')
      add('distinctiveness', 'DISTINCTIVENESS', 'Decisions across all four Ps are judged on efficiency. Nothing in the process asks whether the company is becoming more interchangeable.');

    /* Little or nothing is wrong: name what is carrying the weight instead. */
    if (!cand.length) {
      add('holding-independence', 'INDEPENDENCE', 'Independent scrutiny exists and can return a no. That is the condition most organizations are missing, and it is the one doing the most work here.');
      add('holding-evidence', 'EVIDENCE', 'Evidence is permitted to overturn a preferred answer before commitment rather than after it.');
    }

    /* Top up to three from the thinnest remaining dimensions, weakest first, so a
       Reading always says three things and never repeats a dimension. */
    var all = [], k;
    for (k in c) if (c.hasOwnProperty(k)) all.push({ key: k, v: c[k], four: false });
    for (k in f) if (f.hasOwnProperty(k)) all.push({ key: k, v: f[k], four: true });
    all.sort(function (x, y) { return R(x.v) - R(y.v); });
    for (k = 0; k < all.length; k++) {
      cand.push({
        group: all[k].key,
        label: all[k].key.toUpperCase(),
        text: all[k].four ? fourLine(all[k].key, all[k].v)
                          : conditionLine(all[k].key, all[k].v, a),
        weakest: all[k].v !== 'DULL'
      });
    }

    var out = [], seen = {}, n;
    for (n = 0; n < cand.length && out.length < 3; n++) {
      if (seen[cand[n].group]) continue;
      seen[cand[n].group] = 1;
      out.push({ n: '0' + (out.length + 1), label: cand[n].label, text: cand[n].text });
    }
    return out;
  }

  /* The Reading's closing instruction, one per verdict. Taken from the approved
     Marketing Judgment Reading master, which is the only place this line lives. */
  var NEXT_STEP = {
    AAH:  'When a commitment is too consequential for your own system alone, Kill Dull can read it independently.',
    HMM:  'Bring Kill Dull the commitment you are least sure would be examined properly.',
    DULL: 'Put your next consequential commitment in front of Kill Dull before it is made.'
  };

  A.VERDICT = VERDICT;
  A.NEXT_STEP = NEXT_STEP;
  A.GATE_NOTE = GATE_NOTE;
  A.conditionLine = conditionLine;
  A.fourLine = fourLine;
  A.findings = findings;
})();

/* Kill Dull Marketing Judgment Test — the Reading as a PDF.
   Written by hand rather than with a library: it keeps the page dependency-free
   and lets the document embed the real Kill Dull faces. */
(function () {
  'use strict';

  var A = window.KD_ASSESS;

  var INK = [0.141, 0.133, 0.169];      /* #24222B */
  var GREY = [0.314, 0.302, 0.341];     /* #504D57 */
  var YELLOW = [1, 1, 0];               /* #FFFF00 */
  var PAGE_W = 612, PAGE_H = 792, M = 54;   /* US Letter, 0.75in margins */

  /* WinAnsi: the handful of non-ASCII characters this document can contain. */
  var WINANSI = { '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94,
                  '•': 0x95, '–': 0x96, '—': 0x97, '™': 0x99,
                  '…': 0x85, '·': 0xB7, '©': 0xA9, '°': 0xB0 };

  function enc(str) {
    var out = [], i, ch, c;
    for (i = 0; i < str.length; i++) {
      ch = str.charAt(i); c = str.charCodeAt(i);
      if (WINANSI[ch] !== undefined) out.push(WINANSI[ch]);
      else if (c < 256) out.push(c);
      else out.push(63); /* '?' — never reached by the copy we author */
    }
    return out;
  }
  function pdfString(str) {
    var b = enc(str), s = '', i, c;
    for (i = 0; i < b.length; i++) {
      c = b[i];
      if (c === 40 || c === 41 || c === 92) s += '\\' + String.fromCharCode(c);
      else if (c < 32 || c > 126) s += '\\' + ('00' + c.toString(8)).slice(-3);
      else s += String.fromCharCode(c);
    }
    return '(' + s + ')';
  }
  function bytes(str) {
    var a = new Uint8Array(str.length), i;
    for (i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 0xFF;
    return a;
  }

  function width(font, size, str) {
    var b = enc(str), w = 0, i, c;
    for (i = 0; i < b.length; i++) {
      c = b[i];
      w += (c >= font.firstChar && c <= font.lastChar) ? font.widths[c - font.firstChar] : 0;
    }
    return w * size / 1000;
  }
  function wrap(font, size, max, str) {
    var words = String(str).split(/\s+/), lines = [], line = '', i, test;
    for (i = 0; i < words.length; i++) {
      if (!words[i]) continue;
      test = line ? line + ' ' + words[i] : words[i];
      if (line && width(font, size, test) > max) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function Doc(fonts) {
    this.fonts = fonts;
    this.pages = [];
    this.ops = null;
    this.y = 0;
    this.newPage();
  }
  Doc.prototype.newPage = function () { this.ops = []; this.pages.push(this.ops); this.y = PAGE_H - M; };
  Doc.prototype.need = function (h) { if (this.y - h < M + 28) this.newPage(); };
  Doc.prototype.rgb = function (c) { return c[0].toFixed(3) + ' ' + c[1].toFixed(3) + ' ' + c[2].toFixed(3); };
  Doc.prototype.rect = function (x, y, w, h, c) {
    this.ops.push(this.rgb(c) + ' rg ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re f');
  };
  Doc.prototype.text = function (str, x, y, fontKey, size, colour, tracking) {
    var t = tracking || 0;
    /* Tc is text state and survives BT/ET, so it is always written, never inherited. */
    this.ops.push('BT ' + this.rgb(colour) + ' rg /' + fontKey + ' ' + size + ' Tf ' +
      t.toFixed(2) + ' Tc ' +
      '1 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Tm ' + pdfString(str) + ' Tj ET');
  };
  /* Flow a paragraph from the cursor, breaking pages as needed. */
  Doc.prototype.para = function (str, x, maxW, fontKey, size, leading, colour, tracking) {
    var font = this.fonts[fontKey], lines = wrap(font, size, maxW, str), i;
    for (i = 0; i < lines.length; i++) {
      this.need(leading);
      this.y -= leading;
      this.text(lines[i], x, this.y, fontKey, size, colour, tracking);
    }
  };
  Doc.prototype.rule = function (x, w, colour) {
    this.need(1); this.rect(x, this.y, w, 0.6, colour || GREY);
  };

  /* ------------------------------------------------------------- the document */

  /* ---------------------------------------------------------- the document

     The same four pages the browser shows, drawn directly into a PDF so the
     download is a file rather than a print dialog: no browser headers, no
     footers, no fifth page, and the page boxes are Letter by construction.

     Everything is placed absolutely from the master's own measurements. One
     inch is 72 points; the master's inches and points are used as written. */

  var IN = 72;
  var C = {
    ink:      [0.141, 0.133, 0.169],   /* #24222B Dark Grey   */
    paper:    [1, 1, 1],               /* #FFFFFF Off-White   */
    yellow:   [1, 1, 0],               /* #FFFF00 Neon Yellow */
    stone:    [0.627, 0.616, 0.580],   /* #A09D94 */
    slate:    [0.365, 0.357, 0.329],   /* #5D5B54 */
    hair:     [0.765, 0.749, 0.694],   /* #C3BFB1 */
    hairdark: [0.204, 0.192, 0.231]    /* #34313B */
  };

  Doc.prototype.strokeRect = function (x, y, w, h, colour, lw) {
    this.ops.push(this.rgb(colour) + ' RG ' + (lw || 1).toFixed(2) + ' w ' +
      x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re S');
  };
  Doc.prototype.hline = function (x, y, w, colour, lw) {
    this.rect(x, y, w, lw || 0.5, colour);
  };
  /* Absolute paragraph: draws from a top edge and reports the height used. */
  Doc.prototype.block = function (str, x, top, maxW, fontKey, size, leading, colour, tracking) {
    var lines = wrap(this.fonts[fontKey], size, maxW, str), i, y = top;
    for (i = 0; i < lines.length; i++) {
      y -= leading;
      this.text(lines[i], x, y + leading * 0.24, fontKey, size, colour, tracking);
    }
    return lines.length * leading;
  };
  Doc.prototype.blockHeight = function (str, maxW, fontKey, size, leading) {
    return wrap(this.fonts[fontKey], size, maxW, str).length * leading;
  };
  Doc.prototype.centre = function (str, cx, y, fontKey, size, colour, tracking) {
    var w = width(this.fonts[fontKey], size, str) + (tracking || 0) * (str.length - 1);
    this.text(str, cx - w / 2, y, fontKey, size, colour, tracking);
  };

  /* AAH. fills, HMM. outlines, DULL. reverses — the master's one badge. */
  function drawBadge(doc, verdict, x, y, w, h, size, onInk) {
    var label = verdict + '.';
    if (verdict === 'AAH') {
      doc.rect(x, y, w, h, C.yellow);
      doc.centre(label, x + w / 2, y + (h - size * 0.7) / 2, 'sg700', size, C.ink, -0.02 * size);
    } else if (verdict === 'HMM') {
      if (!onInk) {
        doc.rect(x, y, w, h, C.paper);
        doc.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, C.ink, 1.5);
      }
      doc.centre(label, x + w / 2, y + (h - size * 0.7) / 2, 'sg700', size,
        onInk ? C.ink : C.ink, -0.02 * size);
      if (onInk) { doc.rect(x, y, w, h, C.paper); doc.centre(label, x + w / 2, y + (h - size * 0.7) / 2, 'sg700', size, C.ink, -0.02 * size); }
    } else {
      if (onInk) { doc.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, C.stone, 1.5); doc.centre(label, x + w / 2, y + (h - size * 0.7) / 2, 'sg700', size, C.paper, -0.02 * size); }
      else { doc.rect(x, y, w, h, C.ink); doc.centre(label, x + w / 2, y + (h - size * 0.7) / 2, 'sg700', size, C.paper, -0.02 * size); }
    }
  }

  /* The KD mark: the letterforms and the square, drawn in the document's own face. */
  function drawMark(doc, x, y, h, light) {
    var size = h / 0.7;
    doc.text('KD', x, y, 'sg700', size, light ? C.paper : C.ink, -0.02 * size);
    var w = width(doc.fonts.sg700, size, 'KD') - 0.02 * size;
    doc.rect(x + w + size * 0.12, y - h * 0.02, h, h, C.yellow);
    return w + size * 0.12 + h;
  }

  function runningHead(doc, top, label) {
    var y = PAGE_H - top;
    doc.text('MARKETING JUDGMENT READING', M, y, 'mono400', 8, C.slate, 8 * 0.12);
    var t = label.toUpperCase();
    doc.text(t, PAGE_W - M - width(doc.fonts.mono400, 8, t) - 8 * 0.12 * (t.length - 1),
      y, 'mono400', 8, C.slate, 8 * 0.12);
    doc.hline(M, y - 6, PAGE_W - M * 2, C.hair, 0.5);
  }

  function folio(doc, n, light) {
    var y = PAGE_H - 11 * IN + 0.42 * IN;
    doc.text(n + ' / 4', M, y, 'mono400', 9, light ? C.paper : C.ink, 0);
    drawMark(doc, PAGE_W - M - 26, y, 9, light);
  }

  function opener(doc, top, n, title, note) {
    doc.hline(M, top, PAGE_W - M * 2, C.ink, 1.5);
    doc.text(n, M, top - 8 - 9, 'mono400', 9, C.slate, 9 * 0.12);
    var h2y = top - 8 - 9 - 5 - 20 * 0.82;
    doc.text(title.toUpperCase(), M, h2y, 'sg700', 20, C.ink, -0.02 * 20);
    if (note) {
      var t = note.toUpperCase();
      doc.text(t, PAGE_W - M - width(doc.fonts.mono400, 8, t) - 8 * 0.14 * (t.length - 1),
        h2y + 1, 'mono400', 8, C.slate, 8 * 0.14);
    }
    return top - (8 + 9 + 5 + 20 * 1.05);      /* bottom edge of the opener */
  }

  /* One register row: badge, name, text — the master's three columns. */
  function regRow(doc, top, row) {
    var badgeW = 0.95 * IN, nameW = 1.54 * IN, gap = 14, textX = M + badgeW + nameW + 12;
    var textW = PAGE_W - M - textX;
    var lines = doc.blockHeight(row.text, textW, 'sg500', 11, 11 * 1.3);
    var h = Math.max(42, lines + 8);
    drawBadge(doc, row.verdict, M, top - (h + 34) / 2, badgeW, 34, 14);
    doc.text(row.name.toUpperCase(), M + badgeW + gap, top - h / 2 - 3,
      'mono400', 9, C.ink, 9 * 0.12);
    doc.block(row.text, textX, top - (h - lines) / 2, textW, 'sg500', 11, 11 * 1.3, C.ink, 0);
    doc.hline(M + badgeW, top - h, PAGE_W - M - M - badgeW, C.hair, 0.5);
    return h;
  }

  /* The master states its measures in em. One em is the font size, and no
     measure may exceed the text column. */
  function em(n, size, maxW) { return Math.min(n * size, maxW); }

  function layout(doc, r) {
    var W = PAGE_W - M * 2, top, y, i;

    /* ── 01 Cover ─────────────────────────────────────────────────────── */
    doc.rect(0, 0, PAGE_W, PAGE_H, C.ink);
    var cpad = 0.75 * IN;
    /* The wordmark, set rather than traced: the same face the artwork is cut from. */
    var wmY = PAGE_H - 0.8 * IN - 34;
    doc.text('KILL DULL', cpad, wmY, 'sg700', 46, C.paper, -0.03 * 46);
    var wmW = width(doc.fonts.sg700, 46, 'KILL DULL') - 0.03 * 46 * 8;
    doc.rect(cpad + wmW + 8, wmY - 2, 34, 34, C.yellow);
    doc.text('™', cpad + wmW + 8 + 36, wmY + 22, 'sg500', 9, C.paper, 0);
    doc.text('THE DENSE IDEA COMPANY™', cpad, wmY - 20, 'mono400', 9.5, C.paper, 9.5 * 0.16);

    /* The colophon is anchored to the foot; the title block sits above it. */
    var colTop = 0.75 * IN + 4 * 24 + 6;
    var subTop = colTop + 54;
    var CW = PAGE_W - M * 2;
    var subH = doc.blockHeight(
      'How your organization makes consequential marketing decisions, read against seven conditions of judgment and across Product, Price, Place and Promotion.',
      em(28, 14, CW), 'sg500', 14, 14 * 1.45);
    var h1 = wrap(doc.fonts.sg700, 60, W, 'THE STATE OF YOUR MARKETING JUDGMENT.');
    var h1H = h1.length * 60 * 0.92;
    var blockTop = subTop + subH + 18 + h1H + 14 + 11;

    doc.text('MARKETING JUDGMENT READING · ' + r.dateLong.toUpperCase(),
      cpad, blockTop, 'mono400', 9, C.yellow, 9 * 0.16);
    y = blockTop - 14;
    for (i = 0; i < h1.length; i++) { y -= 60 * 0.92; doc.text(h1[i], cpad, y, 'sg700', 60, C.paper, -0.04 * 60); }
    doc.block('How your organization makes consequential marketing decisions, read against seven conditions of judgment and across Product, Price, Place and Promotion.',
      cpad, y - 18, em(28, 14, CW), 'sg500', 14, 14 * 1.45, C.paper, 0);

    doc.hline(cpad, colTop, W, C.slate, 0.5);
    var rows = [['Issued', r.dateLong, ''],
                ['Method', 'Kill Dull Marketing Judgment Test', ''], ['Verdict', 'Page 02.', '']];
    y = colTop;
    for (i = 0; i < rows.length; i++) {
      y -= 24;
      doc.text(rows[i][0].toUpperCase(), cpad, y + 7, 'mono400', 9, C.stone, 9 * 0.12);
      if (rows[i][2] === 'mono') doc.text(rows[i][1], cpad + 1.3 * IN, y + 7, 'mono400', 11, C.paper, 11 * 0.06);
      else doc.text(rows[i][1], cpad + 1.3 * IN, y + 7, 'sg500', 12, C.paper, 0);
      if (i < rows.length - 1) doc.hline(cpad, y, W, C.hairdark, 0.5);
    }

    /* ── 02 Verdict ───────────────────────────────────────────────────── */
    doc.newPage();
    doc.rect(0, 0, PAGE_W, PAGE_H, C.paper);
    runningHead(doc, 0.45 * IN, 'The verdict');
    top = PAGE_H - 0.95 * IN;
    y = opener(doc, top, '01', 'The verdict.');

    /* The master gives this badge 4in x 2in, but it is a flex child of the text
       column and the column shrinks it: what the design actually renders is
       4in x 106.3pt. The document follows what the master does, not what it
       declares, so page and file agree. */
    y -= 0.7 * IN;
    var XL_H = 106.3;
    drawBadge(doc, r.verdict, M, y - XL_H, 4 * IN, XL_H, 80);
    y -= XL_H;

    y -= 0.45 * IN;
    var hl = wrap(doc.fonts.sg700, 32, em(14, 32, W), r.verdictHead.toUpperCase());
    for (i = 0; i < hl.length; i++) { y -= 32 * 0.98; doc.text(hl[i], M, y, 'sg700', 32, C.ink, -0.03 * 32); }

    y -= 20;
    y -= doc.block(r.verdictBody, M, y, em(28, 17, W), 'sg500', 17, 17 * 1.38, C.ink, 0);
    y -= 16;
    y -= doc.block(r.verdictTail, M, y, em(30, 15, W), 'sg700', 15, 15 * 1.3, C.ink, 0);
    var noteText = r.gateNote;

    /* The scale sits on the foot of the text block, as in the master. */
    /* The scale block is 125.7pt tall as the master renders it: a 19pt head and
       three 34pt rows. Reserving less was what pushed the note into its rule. */
    var SCALE_ROW = 34, SCALE_HEAD = 19;
    var scaleBottom = PAGE_H - 11 * IN + 0.95 * IN;
    var scaleTop = scaleBottom + 3 * SCALE_ROW + SCALE_HEAD;

    /* The same note the page carries, in the same place, on the same condition:
       after the closing line, and never closer than 18pt to the scale above
       which it sits. The scale itself does not move. */
    if (noteText) {
      var noteW = em(34, 12, W), noteH = doc.blockHeight(noteText, noteW, 'sg500', 12, 12 * 1.35);
      /* Higher y is higher on the page: when the natural position would sit
         too low, the note is raised, not lowered. */
      var noteTop = Math.max(y - 20, scaleTop + 18 + noteH);
      doc.block(noteText, M, noteTop, noteW, 'sg500', 12, 12 * 1.35, C.slate, 0);
    }
    doc.hline(M, scaleTop, W, C.ink, 1);
    doc.text('THE SCALE', M, scaleTop - 7 - 8, 'mono400', 8, C.slate, 8 * 0.14);
    var rt = 'EVERY CONDITION AND EVERY P IS READ ON IT';
    doc.text(rt, PAGE_W - M - width(doc.fonts.mono400, 8, rt) - 8 * 0.14 * (rt.length - 1),
      scaleTop - 7 - 8, 'mono400', 8, C.slate, 8 * 0.14);
    var scale = [['AAH', 'The condition reliably protects consequential decisions.'],
                 ['HMM', 'The condition exists but does not reliably protect them.'],
                 ['DULL', 'The condition is absent, or overridden by conviction.']];
    y = scaleTop - SCALE_HEAD;
    for (i = 0; i < scale.length; i++) {
      y -= SCALE_ROW;
      drawBadge(doc, scale[i][0], M, y + (SCALE_ROW - 24) / 2, 0.95 * IN, 24, 12);
      doc.text(scale[i][1], M + 0.95 * IN + 14, y + SCALE_ROW / 2 - 4, 'sg500', 12, C.ink, 0);
      if (i < scale.length - 1) doc.hline(M, y, W, C.hair, 0.5);
    }
    folio(doc, 2);

    /* ── 03 Diagnosis ─────────────────────────────────────────────────── */
    doc.newPage();
    doc.rect(0, 0, PAGE_W, PAGE_H, C.paper);
    runningHead(doc, 0.45 * IN, 'The diagnosis');
    top = PAGE_H - 0.95 * IN;
    y = opener(doc, top, '02', 'How you judge.', 'Seven conditions of judgment') - 12;
    for (i = 0; i < r.conditions.length; i++) y -= regRow(doc, y, r.conditions[i]);
    y -= 30;
    y = opener(doc, y, '03', 'Where you’re exposed.', 'Product · Price · Place · Promotion') - 12;
    for (i = 0; i < r.fours.length; i++) y -= regRow(doc, y, r.fours[i]);
    folio(doc, 3);

    /* ── 04 Focus ─────────────────────────────────────────────────────── */
    doc.newPage();
    doc.rect(0, 0, PAGE_W, PAGE_H, C.paper);
    runningHead(doc, 0.45 * IN, 'The focus');
    top = PAGE_H - 0.95 * IN;
    y = opener(doc, top, '04', 'What we’d pay attention to.') - 14;
    for (i = 0; i < r.findings.length; i++) {
      var f = r.findings[i];
      var tw = W - 0.95 * IN - 14;
      var fh = doc.blockHeight(f.text, Math.min(tw, em(28, 15, W)), 'sg500', 15, 15 * 1.38);
      var rowH = 14 + 9 + 6 + fh + 14;
      doc.text(f.n, M, y - 14 - 32 * 0.9, 'sg700', 32, C.ink, -0.03 * 32);
      doc.text(f.label.toUpperCase(), M + 0.95 * IN + 14, y - 14 - 9, 'mono400', 9, C.ink, 9 * 0.12);
      doc.block(f.text, M + 0.95 * IN + 14, y - 14 - 9 - 6, Math.min(tw, em(28, 15, W)),
        'sg500', 15, 15 * 1.38, C.ink, 0);
      doc.hline(M, y - rowH, W, C.hair, 0.5);
      y -= rowH;
    }
    y -= 22;
    var bl = wrap(doc.fonts.sg700, 18, em(24, 18, W),
      'THESE ARE NOT RECOMMENDATIONS. THEY ARE SIGNALS WORTH EXAMINING BEFORE YOUR NEXT CONSEQUENTIAL MARKETING COMMITMENT.');
    for (i = 0; i < bl.length; i++) { y -= 18 * 1.1; doc.text(bl[i], M, y, 'sg700', 18, C.ink, -0.02 * 18); }

    /* The colophon block and the stamp are anchored to the foot of the page. */
    var stampTop = PAGE_H - 11 * IN + 0.95 * IN + 19;   /* one row now, not two */
    var about = 'The Marketing Judgment Test examines the conditions under which consequential marketing decisions are made. It does not evaluate marketing performance, and it does not replace a Kill Dull Reading of a specific commitment.';
    var colW = (W - 24) / 2;
    var aboutH = doc.blockHeight(about, colW, 'sg500', 10, 10 * 1.45);
    var nextH = doc.blockHeight(r.nextStep, colW, 'sg500', 10, 10 * 1.45);
    var footTop = stampTop + 14 + Math.max(aboutH, nextH + 8 + 15) + 8 + 6 + 10;
    doc.hline(M, footTop, W, C.ink, 1);
    doc.text('ABOUT THIS READING', M, footTop - 10 - 8, 'mono400', 8, C.slate, 8 * 0.14);
    doc.block(about, M, footTop - 10 - 8 - 6, colW, 'sg500', 10, 10 * 1.45, C.ink, 0);
    doc.text('THE NEXT STEP', M + colW + 24, footTop - 10 - 8, 'mono400', 8, C.slate, 8 * 0.14);
    var nb = doc.block(r.nextStep, M + colW + 24, footTop - 10 - 8 - 6, colW, 'sg500', 10, 10 * 1.45, C.ink, 0);
    doc.text('killdull.com', M + colW + 24, footTop - 10 - 8 - 6 - nb - 6 - 15 * 0.72, 'sg700', 15, C.ink, -0.01 * 15);

    doc.hline(M, stampTop, W, C.hair, 0.5);
    /* Document, Issued, Pages. Each cell is set to the width its own text needs
       at 9pt, a 12pt gutter holds a key to its value, and what is left over is
       shared evenly between the three pairs so the row reads across the page. */
    var stamp = ['DOCUMENT', 'MARKETING JUDGMENT READING', 'ISSUED', r.dateLong.toUpperCase(), 'PAGES', '4'];
    var cellW = [], textTotal = 0;
    for (i = 0; i < stamp.length; i++) {
      cellW.push(width(doc.fonts.mono400, 9, stamp[i]) + 9 * 0.06 * (stamp[i].length - 1));
      textTotal += cellW[i];
    }
    var between = Math.max(12, (W - textTotal - 3 * 12) / 2);
    y = stampTop - 19;
    var at = M;
    for (i = 0; i < stamp.length; i++) {
      doc.text(stamp[i], at, y + 6, 'mono400', 9, i % 2 ? C.ink : C.slate, 9 * 0.06);
      at += cellW[i] + (i % 2 ? between : 12);
    }

    /* The foot of the last page is the only reversed bar in the document. */
    doc.rect(0, 0, PAGE_W, 20, C.ink);
    doc.text('4 / 4', M, 6, 'mono400', 9, C.paper, 0);
    drawMark(doc, PAGE_W - M - 26, 6, 9, true);
  }

  function build(reading, files) {
    var F = window.KD_PDF_FONTS;
    var doc = new Doc(F);
    layout(doc, reading);

    var objs = [], n;
    function obj(body) { objs.push(body); return objs.length; }   /* 1-based */

    var pageCount = doc.pages.length;
    var catalog = obj(null), pagesObj = obj(null);
    var fontIds = {}, key;
    var order = ['sg500', 'sg700', 'mono400'];
    for (n = 0; n < order.length; n++) {
      key = order[n];
      var fileId = obj({ stream: files[key], dict: '<</Length ' + files[key].length + ' /Length1 ' + files[key].length + '>>' });
      var descId = obj('<</Type/FontDescriptor/FontName/' + F[key].name + '/Flags ' + F[key].flags +
        '/FontBBox[' + F[key].bbox.join(' ') + ']/ItalicAngle 0/Ascent ' + F[key].ascent +
        '/Descent ' + F[key].descent + '/CapHeight ' + F[key].capHeight + '/StemV ' + F[key].stemV +
        '/FontFile2 ' + fileId + ' 0 R>>');
      fontIds[key] = obj('<</Type/Font/Subtype/TrueType/BaseFont/' + F[key].name +
        '/FirstChar ' + F[key].firstChar + '/LastChar ' + F[key].lastChar +
        '/Widths[' + F[key].widths.join(' ') + ']/Encoding/WinAnsiEncoding/FontDescriptor ' + descId + ' 0 R>>');
    }
    var resources = '<</Font<</sg500 ' + fontIds.sg500 + ' 0 R/sg700 ' + fontIds.sg700 +
                    ' 0 R/mono400 ' + fontIds.mono400 + ' 0 R>>>>';

    var pageIds = [];
    for (n = 0; n < pageCount; n++) {
      var content = doc.pages[n].join('\n');
      var cid = obj({ stream: bytes(content), dict: '<</Length ' + bytes(content).length + '>>' });
      pageIds.push(obj('<</Type/Page/Parent ' + pagesObj + ' 0 R/MediaBox[0 0 ' +
        PAGE_W.toFixed(2) + ' ' + PAGE_H.toFixed(2) + ']/Resources ' + resources +
        '/Contents ' + cid + ' 0 R>>'));
    }
    objs[catalog - 1] = '<</Type/Catalog/Pages ' + pagesObj + ' 0 R>>';
    objs[pagesObj - 1] = '<</Type/Pages/Kids[' + pageIds.map(function (id) { return id + ' 0 R'; }).join(' ') +
                         ']/Count ' + pageCount + '>>';

    var chunks = [], len = 0, offsets = [];
    function push(u8) { chunks.push(u8); len += u8.length; }
    push(bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
    for (n = 0; n < objs.length; n++) {
      offsets.push(len);
      var o = objs[n];
      if (o && o.stream) {
        push(bytes((n + 1) + ' 0 obj\n' + o.dict + '\nstream\n'));
        push(o.stream);
        push(bytes('\nendstream\nendobj\n'));
      } else {
        push(bytes((n + 1) + ' 0 obj\n' + o + '\nendobj\n'));
      }
    }
    var xref = len;
    var x = 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
    for (n = 0; n < offsets.length; n++) x += ('0000000000' + offsets[n]).slice(-10) + ' 00000 n \n';
    x += 'trailer\n<</Size ' + (objs.length + 1) + '/Root ' + catalog + ' 0 R>>\nstartxref\n' + xref + '\n%%EOF\n';
    push(bytes(x));

    var out = new Uint8Array(len), at = 0;
    for (n = 0; n < chunks.length; n++) { out.set(chunks[n], at); at += chunks[n].length; }
    return out;
  }

  A.pdf = { build: build, width: width, wrap: wrap };
})();

/* Kill Dull Marketing Judgment Test — assembling one Reading from one set of answers. */
(function () {
  'use strict';
  var A = window.KD_ASSESS;
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  /* A local record key, not a Reading ID. The Marketing Judgment Test runs in
     the browser and Kill Dull never receives a Reading, so nothing here
     corresponds to a record Kill Dull could look up. This value exists only to
     key the anonymised record this device stores for itself, and is never
     rendered, printed, emailed or put in a filename. */
  function recordKey(d) {
    var s = '', abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r, i;
    try { r = new Uint8Array(4); (window.crypto || window.msCrypto).getRandomValues(r); }
    catch (e) { r = [Math.random()*256, Math.random()*256, Math.random()*256, Math.random()*256]; }
    for (i = 0; i < 4; i++) s += abc.charAt(Math.floor(r[i]) % abc.length);
    return 'KD-' + String(d.getFullYear()).slice(2) +
           ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + s;
  }

  function buildReading(answers, existing) {
    var res = A.score(answers);
    var d = existing && existing.date ? new Date(existing.date) : new Date();
    var V = A.VERDICT[res.overall];
    var conditions = [], fours = [], i, c;

    for (i = 0; i < A.CONDITIONS.length; i++) {
      c = A.CONDITIONS[i];
      conditions.push({ key: c.key, name: c.name, verdict: res.conditions[c.key],
                        text: A.conditionLine(c.key, res.conditions[c.key], answers) });
    }
    for (i = 0; i < A.FOURP.length; i++) {
      c = A.FOURP[i];
      fours.push({ key: c.key, name: c.name, verdict: res.fours[c.key],
                   text: A.fourLine(c.key, res.fours[c.key]) });
    }

    return {
      recordId: existing && (existing.recordId || existing.assessmentId) || recordKey(d),
      version: A.VERSION,
      date: d.toISOString(),
      dateLong: d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(),
      verdict: res.overall,
      verdictHead: V.head,
      verdictBody: V.body,
      verdictTail: V.tail,
      gateNote: res.gates.length ? A.GATE_NOTE[res.gates[0]] : '',
      nextStep: A.NEXT_STEP[res.overall],
      gates: res.gates,
      conditions: conditions,
      fours: fours,
      findings: A.findings(res, answers),
      answers: answers
    };
  }

  /* The shape a future State of Marketing Judgment study would aggregate.
     Written to this browser only. Nothing here identifies anyone, and nothing
     is transmitted: there is no endpoint, by design. */
  function record(reading) {
    var r = { recordId: reading.recordId, version: reading.version, date: reading.date,
              responses: reading.answers, overall: reading.verdict, conditions: {}, fourP: {} }, i;
    for (i = 0; i < reading.conditions.length; i++) r.conditions[reading.conditions[i].key] = reading.conditions[i].verdict;
    for (i = 0; i < reading.fours.length; i++) r.fourP[reading.fours[i].key] = reading.fours[i].verdict;
    return r;
  }

  function save(reading) {
    try { window.localStorage.setItem(A.STORE_KEY, JSON.stringify(record(reading))); } catch (e) {}
  }
  function load() {
    try { return JSON.parse(window.localStorage.getItem(A.STORE_KEY) || 'null'); } catch (e) { return null; }
  }
  function clear() { try { window.localStorage.removeItem(A.STORE_KEY); } catch (e) {} }

  /* Plain-text Reading — used for the email body and as the PDF's accessible twin. */
  function asText(r) {
    var L = [], i;
    L.push('KILL DULL — MARKETING JUDGMENT READING');
    L.push(r.dateLong);
    L.push('');
    L.push('VERDICT: ' + r.verdict + '.');
    L.push(r.verdictHead);
    L.push('');
    L.push(r.verdictBody);
    if (r.verdictTail) { L.push(''); L.push(r.verdictTail); }
    if (r.gateNote) { L.push(''); L.push(r.gateNote); }
    L.push(''); L.push('HOW YOU JUDGE');
    for (i = 0; i < r.conditions.length; i++)
      L.push('  ' + r.conditions[i].name + ' — ' + r.conditions[i].verdict + '.  ' + r.conditions[i].text);
    L.push(''); L.push('WHERE YOU’RE EXPOSED');
    for (i = 0; i < r.fours.length; i++)
      L.push('  ' + r.fours[i].name + ' — ' + r.fours[i].verdict + '.  ' + r.fours[i].text);
    L.push(''); L.push('WHAT WE’D PAY ATTENTION TO');
    for (i = 0; i < r.findings.length; i++)
      L.push('  ' + r.findings[i].n + ' ' + r.findings[i].label + ' — ' + r.findings[i].text);
    L.push('');
    L.push('These are not recommendations. They are signals worth examining before your next consequential marketing commitment.');
    L.push('');
    L.push('ABOUT THIS READING');
    L.push('The Marketing Judgment Test examines the conditions under which consequential marketing decisions are made across Product, Price, Place and Promotion. It does not evaluate marketing performance and does not replace a Kill Dull Reading of a specific commitment.');
    L.push('');
    L.push('killdull.com');
    return L.join('\n');
  }

  A.buildReading = buildReading;
  A.record = record;
  A.save = save;
  A.load = load;
  A.clear = clear;
  A.asText = asText;
})();

/* Kill Dull Marketing Judgment Test — the experience.
   Three views on one route: ENTRY, the run, the Reading. Nothing leaves the
   browser at any point; the two storage keys below are this device only. */
(function () {
  'use strict';

  var A = window.KD_ASSESS;
  if (!A || !document.body || document.body.className.indexOf('assessment-page') < 0) return;

  var PROGRESS_KEY = A.STORE_KEY + '_progress';
  var HANDOFF_KEY = A.STORE_KEY + '_handoff';
  var entry = document.getElementById('kda-entry');
  var run = document.getElementById('kda-run');
  var readingHost = document.getElementById('kda-reading');
  var live = document.getElementById('kda-live');
  if (!entry || !run || !readingHost) return;

  var state = { answers: {}, at: 0, reading: null, view: 'entry' };

  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function say(msg) { if (live) live.textContent = msg; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ----------------------------------------------------------- local storage */

  function saveProgress() {
    try { window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ v: A.VERSION, at: state.at, answers: state.answers })); }
    catch (e) {}
  }
  function loadProgress() {
    try {
      var p = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) || 'null');
      return p && p.v === A.VERSION && p.answers ? p : null;
    } catch (e) { return null; }
  }
  function clearProgress() { try { window.localStorage.removeItem(PROGRESS_KEY); } catch (e) {} }

  function complete(answers) {
    for (var i = 0; i < A.INPUTS.length; i++) if (!answers[A.INPUTS[i]]) return false;
    return true;
  }

  /* ------------------------------------------------------------------- views */

  function show(view) {
    state.view = view;
    entry.hidden = view !== 'entry';
    run.hidden = view !== 'run';
    readingHost.hidden = view !== 'reading';
    /* The site-wide contact block sits below every page. During the run it is
       one more thing to look at, so it steps out of the way. */
    document.body.classList[view === 'run' ? 'add' : 'remove']('is-running');
  }

  /* --------------------------------------------------------------- the run */

  function optionsHtml(inputId, current) {
    var out = '', i, r;
    for (i = 0; i < A.RESPONSES.length; i++) {
      r = A.RESPONSES[i];
      out += '<label class="kda-option"><input type="radio" name="kda-' + inputId + '" value="' + r.id + '" ' +
             'data-input="' + inputId + '"' + (current === r.id ? ' checked' : '') + '>' +
             '<span class="kda-option-face">' +
             '<span class="kda-option-key">' + (i + 1) + '</span>' +
             '<span class="kda-option-label">' + esc(r.label) + '</span>' +
             '<span class="kda-option-note">' + esc(r.note) + '</span></span></label>';
    }
    return out;
  }

  function condName(key) {
    var i;
    for (i = 0; i < A.CONDITIONS.length; i++) if (A.CONDITIONS[i].key === key) return A.CONDITIONS[i].name;
    for (i = 0; i < A.FOURP.length; i++) if (A.FOURP[i].key === key) return A.FOURP[i].name;
    return '';
  }

  function paint() {
    var Q = A.QUESTIONS[state.at];
    var total = A.QUESTIONS.length;
    var pct = Math.round((state.at / total) * 100);
    var marker = Q.pair ? Q.marker : condName(Q.cond);
    var html =
      '<div class="kda-progress">' +
        '<span class="kda-progress-num">' + pad(state.at + 1) + ' / ' + pad(total) + '</span>' +
        '<span class="kda-progress-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></span>' +
        '<span class="kda-progress-cond">' + esc(marker) + '</span>' +
      '</div><div class="kda-q">';

    if (Q.pair) {
      html += '<h1 class="kda-qhead kda-qtext" id="kda-qhead" tabindex="-1">Two situations. Judge each one on its own.</h1>';
      for (var p = 0; p < Q.parts.length; p++) {
        var part = Q.parts[p];
        html += '<div class="kda-pair">' +
          '<p class="kda-pair-label">' + esc(part.label) + '</p>' +
          '<p class="kda-scenario">' + esc(part.scenario) + '</p>' +
          '<h2 class="kda-qtext" id="kda-t-' + part.id + '">' + esc(part.text) + '</h2>' +
          '<div class="kda-responses" role="radiogroup" aria-labelledby="kda-t-' + part.id + '">' +
            optionsHtml(part.id, state.answers[part.id]) +
          '</div></div>';
      }
    } else {
      html += '<h1 class="kda-qhead kda-qtext" id="kda-qhead" tabindex="-1">' + esc(Q.text) + '</h1>';
      if (Q.example) html += '<p class="kda-example">' + esc(Q.example) + '</p>';
      if (Q.statement) html += '<p class="kda-statement">' + esc(Q.statement) + '</p>';
      html += '<div class="kda-responses" role="radiogroup" aria-labelledby="kda-qhead">' +
              optionsHtml(Q.id, state.answers[Q.id]) + '</div>';
    }

    html += '</div><div class="kda-run-foot">' +
      '<button type="button" class="kda-cta is-back" id="kda-back">' +
        (state.at === 0 ? 'Leave the Test' : 'Previous question') + '</button>' +
      '<span class="kda-hint">Press 1–4 to answer</span></div>';

    run.innerHTML = html;
  }

  /* One advance at a time. During the hand-over the old inputs are still in the
     document, so a fast second key or click would otherwise answer a question
     that is already on its way out. */
  var busy = false;
  var LEAVE_MS = 140;

  /* Every new question starts at the top of the run and takes focus, so the
     change is never something you have to notice in your peripheral vision.
     This is what carries the transition when motion is switched off. */
  function settle() {
    var nav = document.querySelector('.unified-nav');
    var top = run.getBoundingClientRect().top + (window.pageYOffset || 0);
    var offset = nav && getComputedStyle(nav).position === 'fixed' ? nav.offsetHeight : 0;
    try { window.scrollTo(0, Math.max(0, Math.round(top - offset))); }
    catch (e) { window.scrollTo(0, 0); }
    var head = document.getElementById('kda-qhead');
    if (head) head.focus();
    say('Question ' + (state.at + 1) + ' of ' + A.QUESTIONS.length + '.');
  }

  /* Change the question behind a clear break: out, empty, in. */
  function step(mutate) {
    if (busy) return;
    if (reduced()) { mutate(); paint(); settle(); return; }
    busy = true;
    run.classList.add('is-leaving');
    window.setTimeout(function () {
      mutate();
      run.classList.remove('is-leaving');
      run.classList.add('is-entering');
      paint();
      settle();
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          run.classList.remove('is-entering');
          busy = false;
        });
      });
    }, LEAVE_MS);
  }

  /* Opening the run for the first time, or after Take it again, arrives the same
     way a later question does. */
  function renderRun() {
    paint();
    settle();
    if (reduced()) return;
    run.classList.add('is-entering');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { run.classList.remove('is-entering'); });
    });
  }

  function answered(Q) {
    if (!Q.pair) return !!state.answers[Q.id];
    for (var p = 0; p < Q.parts.length; p++) if (!state.answers[Q.parts[p].id]) return false;
    return true;
  }

  function advance() {
    if (state.at + 1 >= A.QUESTIONS.length) { finish(); return; }
    step(function () { state.at++; saveProgress(); });
  }

  function record(inputId, value) {
    if (busy) return;
    state.answers[inputId] = value;
    saveProgress();
    var Q = A.QUESTIONS[state.at];
    if (!answered(Q)) return;
    if (reduced()) advance();
    else window.setTimeout(advance, 220);
  }

  run.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || t.type !== 'radio' || !t.getAttribute('data-input')) return;
    record(t.getAttribute('data-input'), t.value);
  });

  run.addEventListener('click', function (e) {
    var back = e.target && e.target.closest ? e.target.closest('#kda-back') : null;
    if (!back) return;
    if (state.at === 0) { show('entry'); say('Test closed.'); window.scrollTo(0, 0); return; }
    step(function () { state.at--; saveProgress(); });
  });

  /* 1–4 answers the question in front of you. In a pair screen the keys act on
     whichever half the cursor is in, and otherwise on the first unanswered half. */
  document.addEventListener('keydown', function (e) {
    if (state.view !== 'run' || busy) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var n = e.key && e.key.length === 1 ? '1234'.indexOf(e.key) : -1;
    if (n < 0) return;
    var active = document.activeElement;
    var group = active && active.closest ? active.closest('.kda-responses') : null;
    if (!group) {
      var groups = run.querySelectorAll('.kda-responses'), g;
      for (var i = 0; i < groups.length; i++) {
        if (!groups[i].querySelector('input:checked')) { group = groups[i]; break; }
      }
      if (!group && groups.length) group = groups[groups.length - 1];
    }
    if (!group) return;
    var input = group.querySelectorAll('input[type="radio"]')[n];
    if (!input) return;
    e.preventDefault();
    input.checked = true;
    input.focus();
    record(input.getAttribute('data-input'), input.value);
  });

  /* --------------------------------------------------------------- the Reading */

  /* ------------------------------------------------- the Reading, as a document

     The Marketing Judgment Reading is a four-page US Letter document: Cover,
     Verdict, Diagnosis, Focus. Its design is fixed; everything variable in it
     comes from the Reading this browser just produced. The page that issues it
     is the Marketing Judgment Test — the two are never called the same thing. */

  var MARK_LIGHT = '/assets/reading/kd-mark-light.svg';
  var MARK_DARK = '/assets/reading/kd-mark-dark.svg';

  /* AAH. fills, HMM. outlines, DULL. reverses. One badge, three sizes. */
  function badge(verdict, size) {
    var k = verdict === 'AAH' ? 'is-aah' : verdict === 'HMM' ? 'is-hmm' : 'is-dull';
    return '<span class="kdr-badge ' + k + ' ' + size + '">' + esc(verdict) + '.</span>';
  }

  function head(label) {
    return '<div class="kdr-head"><span>Marketing Judgment Reading</span>' +
           '<span>' + esc(label) + '</span></div>';
  }
  function folio(n) {
    return '<div class="kdr-folio"><span>' + n + ' / 4</span>' +
           '<img src="' + MARK_DARK + '" alt="KD"></div>';
  }
  function opener(n, title, note, second) {
    return '<div class="kdr-open' + (second ? ' is-second' : '') + '">' +
      '<span class="kdr-open-n">' + n + '</span>' +
      (note
        ? '<div class="kdr-open-split"><h2>' + esc(title) + '</h2><span class="kdr-open-note">' + esc(note) + '</span></div>'
        : '<h2>' + esc(title) + '</h2>') +
      '</div>';
  }

  /* The seven conditions and the four Ps share one register. */
  function registerHtml(rows) {
    var out = '', i;
    for (i = 0; i < rows.length; i++) {
      out += '<div class="kdr-reg-row">' +
        '<div class="kdr-reg-badge">' + badge(rows[i].verdict, 'kdr-badge-row') + '</div>' +
        '<span class="kdr-reg-name">' + esc(rows[i].name) + '</span>' +
        '<span class="kdr-reg-text">' + esc(rows[i].text) + '</span></div>';
    }
    return out;
  }

  function focusHtml(list) {
    var out = '', i;
    for (i = 0; i < list.length; i++) {
      out += '<div class="kdr-focus-row">' +
        '<span class="kdr-focus-n">' + esc(list[i].n) + '</span>' +
        '<div class="kdr-focus-body">' +
          '<span class="kdr-focus-name">' + esc(list[i].label) + '</span>' +
          '<p class="kdr-focus-text">' + esc(list[i].text) + '</p>' +
        '</div></div>';
    }
    return out;
  }

  function documentHtml(r) {
    return '<div class="kdr" id="kdr">' +

      /* 01 Cover */
      '<section class="kdr-page kdr-cover" aria-label="Cover">' +
        '<img class="kdr-cover-mark" src="/assets/reading/kd-wordmark.svg" alt="Kill Dull — The Dense Idea Company">' +
        '<div>' +
          '<span class="kdr-cover-eyebrow">Marketing Judgment Reading · ' + esc(r.dateLong) + '</span>' +
          '<h1>The state of your marketing judgment.</h1>' +
          '<p class="kdr-cover-sub">How your organization makes consequential marketing decisions, read against seven conditions of judgment and across Product, Price, Place and Promotion.</p>' +
        '</div>' +
        '<div class="kdr-colophon">' +
          '<div class="kdr-colophon-row"><span class="kdr-colophon-key">Issued</span><span class="kdr-colophon-val">' + esc(r.dateLong) + '</span></div>' +
          '<div class="kdr-colophon-row"><span class="kdr-colophon-key">Method</span><span class="kdr-colophon-val">Kill Dull Marketing Judgment Test</span></div>' +
          '<div class="kdr-colophon-row"><span class="kdr-colophon-key">Verdict</span><span class="kdr-colophon-val">Page 02.</span></div>' +
        '</div>' +
      '</section>' +

      /* 02 Verdict */
      '<section class="kdr-page" aria-label="The verdict">' +
        head('The verdict') +
        '<div class="kdr-body">' +
          opener('01', 'The verdict.') +
          badge(r.verdict, 'kdr-badge-xl') +
          '<h3 class="kdr-headline">' + esc(r.verdictHead) + '</h3>' +
          '<p class="kdr-reading">' + esc(r.verdictBody) + '</p>' +
          '<p class="kdr-close">' + esc(r.verdictTail) + '</p>' +
          /* Only when a rule overrode the arithmetic. No gate, no element,
             and the page keeps the spacing the master gives it. */
          (r.gateNote ? '<p class="kdr-note">' + esc(r.gateNote) + '</p>' : '') +
          '<div class="kdr-scale">' +
            '<div class="kdr-scale-head"><span>The scale</span><span>Every condition and every P is read on it</span></div>' +
            '<div class="kdr-scale-row">' + badge('AAH', 'kdr-badge-sm') + '<span>The condition reliably protects consequential decisions.</span></div>' +
            '<div class="kdr-scale-row">' + badge('HMM', 'kdr-badge-sm') + '<span>The condition exists but does not reliably protect them.</span></div>' +
            '<div class="kdr-scale-row">' + badge('DULL', 'kdr-badge-sm') + '<span>The condition is absent, or overridden by conviction.</span></div>' +
          '</div>' +
        '</div>' +
        folio(2) +
      '</section>' +

      /* 03 Diagnosis */
      '<section class="kdr-page" aria-label="The diagnosis">' +
        head('The diagnosis') +
        '<div class="kdr-body">' +
          opener('02', 'How you judge.', 'Seven conditions of judgment') +
          '<div class="kdr-register">' + registerHtml(r.conditions) + '</div>' +
          opener('03', 'Where you’re exposed.', 'Product · Price · Place · Promotion', true) +
          '<div class="kdr-register">' + registerHtml(r.fours) + '</div>' +
        '</div>' +
        folio(3) +
      '</section>' +

      /* 04 Focus */
      '<section class="kdr-page" aria-label="The focus">' +
        head('The focus') +
        '<div class="kdr-body">' +
          opener('04', 'What we’d pay attention to.') +
          '<div class="kdr-focus">' + focusHtml(r.findings) + '</div>' +
          '<p class="kdr-boundary">These are not recommendations. They are signals worth examining before your next consequential marketing commitment.</p>' +
          '<div class="kdr-foot">' +
            '<div class="kdr-foot-col">' +
              '<span class="kdr-foot-label">About this Reading</span>' +
              '<p>The Marketing Judgment Test examines the conditions under which consequential marketing decisions are made. It does not evaluate marketing performance, and it does not replace a Kill Dull Reading of a specific commitment.</p>' +
            '</div>' +
            '<div class="kdr-foot-col">' +
              '<span class="kdr-foot-label">The next step</span>' +
              '<p>' + esc(r.nextStep) + '</p>' +
              '<span class="kdr-foot-url">killdull.com</span>' +
            '</div>' +
          '</div>' +
          '<div class="kdr-stamp">' +
            '<span class="is-key">Document</span><span>Marketing Judgment Reading</span>' +
            '<span class="is-key">Issued</span><span>' + esc(r.dateLong) + '</span>' +
            '<span class="is-key">Pages</span><span>4</span>' +
          '</div>' +
        '</div>' +
        '<div class="kdr-folio-bar"><span>4 / 4</span><img src="' + MARK_LIGHT + '" alt="KD"></div>' +
      '</section>' +
    '</div>';
  }

  function actionsHtml() {
    return '<section class="viewport is-dark kda-issue" aria-label="Your Reading">' +
      '<div class="kda-actions">' +
      '<button type="button" class="kda-cta is-down" id="kda-download">Download Reading</button>' +
      '<button type="button" class="kda-cta" id="kda-email-open" aria-expanded="false" aria-controls="kda-email">Email my Reading</button>' +
      '<a class="kda-cta" id="kda-talk" href="mailto:human@killdull.com">Talk to us</a>' +
      '</div>' +
      '<p class="kda-note" id="kda-action-note" hidden></p>' +
      '<form class="kda-email" id="kda-email" hidden>' +
        '<label for="kda-email-input">Send to</label>' +
        '<input type="email" id="kda-email-input" name="email" autocomplete="email" inputmode="email" placeholder="you@company.com" required>' +
        '<button type="submit" class="kda-cta">Email my Reading</button>' +
        '<p class="kda-email-note">This opens your own mail application with the Reading already written into the message. The Reading is not sent to Kill Dull, and the address is not collected. If your mail application shortens long messages, download the PDF instead.</p>' +
      '</form>' +
      '<p class="kda-note">Your Reading is private. It is stored on this device and is not transmitted to Kill Dull. It is not published, not shared and not compared with anyone else’s.</p>' +
      '<div class="kda-aftermath">' +
        '<button type="button" class="kda-cta is-quiet" id="kda-retake">Take the Test again</button>' +
        '<button type="button" class="kda-cta is-quiet" id="kda-forget">Forget this Reading</button>' +
      '</div></section>';
  }

  /* The document builder is part of the Reading's public surface: given a
     Reading it returns the four pages, with no dependence on this page. */
  A.documentHtml = documentHtml;

  /* A Letter page is 816px wide and stays that wide. On a narrower screen the
     desk is zoomed to fit, which changes nothing about the document itself —
     the stylesheet applies this only to screens, never to print. */
  var PAGE_PX = 816;
  function fitDocument() {
    var el = document.querySelector('.kdr');
    if (!el) return;
    var room = document.documentElement.clientWidth - 24;
    el.style.setProperty('--kdr-zoom', room < PAGE_PX ? (room / PAGE_PX).toFixed(4) : '1');
  }
  window.addEventListener('resize', fitDocument);

  function renderReading(r) {
    readingHost.innerHTML = documentHtml(r) + actionsHtml();
    fitDocument();
    var first = document.querySelector('.kdr-cover');
    if (first) { first.setAttribute('tabindex', '-1'); first.focus(); }
    say('Your Reading is ready. ' + r.verdict + '. ' + r.verdictHead);
    wireActions(r);
  }

  function finish() {
    state.reading = A.buildReading(state.answers, null);
    A.save(state.reading);
    clearProgress();
    show('reading');
    window.scrollTo(0, 0);
    renderReading(state.reading);
  }

  /* ------------------------------------------------------------------ actions */

  function note(msg) {
    var el = document.getElementById('kda-action-note');
    if (!el) return;
    el.textContent = msg; el.hidden = !msg;
    say(msg);
  }

  /* The three faces are only fetched when someone actually asks for the PDF. */
  function fetchFonts(done, fail) {
    var F = window.KD_PDF_FONTS;
    if (!F) { fail(); return; }
    var keys = ['sg500', 'sg700', 'mono400'], files = {}, left = keys.length, dead = false;
    for (var i = 0; i < keys.length; i++) (function (key) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', F[key].file, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        if (dead) return;
        if (xhr.status < 200 || xhr.status >= 300 || !xhr.response) { dead = true; fail(); return; }
        files[key] = new Uint8Array(xhr.response);
        if (--left === 0) done(files);
      };
      xhr.onerror = function () { if (!dead) { dead = true; fail(); } };
      xhr.send();
    })(keys[i]);
  }

  function download(reading, btn) {
    if (!window.Uint8Array || !window.Blob) {
      note('This browser cannot assemble the PDF. Your Reading is on this page, and Email my Reading still works.');
      return;
    }
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Preparing…';
    function restore() { btn.disabled = false; btn.textContent = label; }
    fetchFonts(function (files) {
      var blob, url, a;
      try {
        blob = new Blob([A.pdf.build(reading, files)], { type: 'application/pdf' });
      } catch (e) { restore(); note('The PDF could not be assembled. Your Reading is on this page.'); return; }
      url = URL.createObjectURL(blob);
      a = document.createElement('a');
      a.href = url;
      a.download = 'Kill-Dull-Marketing-Judgment-Reading.pdf';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      restore(); note('');
    }, function () {
      restore();
      note('The PDF could not be prepared — the document fonts did not load. Your Reading is on this page, and Email my Reading still works.');
    });
  }

  function mailto(to, subject, body) {
    var href = 'mailto:' + encodeURIComponent(to || '') +
               '?subject=' + encodeURIComponent(subject) +
               '&body=' + encodeURIComponent(body);
    window.location.href = href;
  }

  function wireActions(r) {
    var dl = document.getElementById('kda-download');
    var open = document.getElementById('kda-email-open');
    var form = document.getElementById('kda-email');
    var input = document.getElementById('kda-email-input');
    var talk = document.getElementById('kda-talk');
    var retake = document.getElementById('kda-retake');
    var forget = document.getElementById('kda-forget');

    if (dl) dl.addEventListener('click', function () { download(r, dl); });

    if (open && form && input) {
      open.addEventListener('click', function () {
        var showing = form.hidden;
        form.hidden = !showing;
        open.setAttribute('aria-expanded', showing ? 'true' : 'false');
        if (showing) input.focus();
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!input.value || input.value.indexOf('@') < 0) { input.focus(); return; }
        /* The pointer goes first: if a mail client truncates a long body, the
           reader still learns the complete Reading exists as a PDF. */
        mailto(input.value, 'Your Kill Dull Marketing Judgment Reading',
          'Your Kill Dull Reading is below. The complete Reading, typeset, is the PDF you can download at killdull.com/assessment.\n\n' +
          '— — —\n\n' + A.asText(r));
        /* The address was used to address one message and is not kept. */
        input.value = '';
      });
    }

    /* TALK TO US goes to the site's own contact page. The Reading summary is
       handed over through sessionStorage rather than the URL, so it never
       appears in an address bar, a referrer or a log — and it is still only a
       draft in a textarea until the person decides to send it. No name, no
       company, no email address: the Test has never had any. */
    if (talk) {
      talk.setAttribute('href', '/contact');
      talk.addEventListener('click', function () {
        var lines = ['I took the Kill Dull Marketing Judgment Test.', '',
                     'Overall: ' + r.verdict + '.', '',
                     'HOW I JUDGE'], i;
        for (i = 0; i < r.conditions.length; i++) lines.push('  ' + r.conditions[i].name + ': ' + r.conditions[i].verdict + '.');
        lines.push('', 'WHERE I\u2019M EXPOSED');
        for (i = 0; i < r.fours.length; i++) lines.push('  ' + r.fours[i].name + ': ' + r.fours[i].verdict + '.');
        lines.push('', 'What I would like to talk about:', '');
        try {
          window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({
            v: A.VERSION, about: 'A MARKETING DECISION', message: lines.join('\n')
          }));
        } catch (e) { /* the contact page simply opens empty */ }
      });
    }

    if (retake) retake.addEventListener('click', function () {
      state.answers = {}; state.at = 0; state.reading = null;
      clearProgress();
      show('run'); window.scrollTo(0, 0); renderRun();
    });

    if (forget) forget.addEventListener('click', function () {
      A.clear(); clearProgress();
      state.answers = {}; state.at = 0; state.reading = null;
      readingHost.innerHTML = '';
      show('entry'); window.scrollTo(0, 0);
      syncEntry();
      say('Reading deleted from this browser.');
    });
  }

  /* -------------------------------------------------------------------- entry */

  function syncEntry() {
    var resume = document.getElementById('kda-resume');
    var begin = document.getElementById('kda-begin');
    var stored = A.load();
    var progress = loadProgress();
    if (resume) resume.hidden = !(stored && stored.responses && complete(stored.responses));
    if (begin) begin.textContent = (progress && progress.at > 0 && !complete(progress.answers))
      ? 'Resume the Test' : 'Begin the Test';
  }

  var beginBtn = document.getElementById('kda-begin');
  if (beginBtn) beginBtn.addEventListener('click', function () {
    var progress = loadProgress();
    if (progress && !complete(progress.answers)) { state.answers = progress.answers; state.at = Math.min(progress.at, A.QUESTIONS.length - 1); }
    else { state.answers = {}; state.at = 0; }
    show('run'); window.scrollTo(0, 0); renderRun();
  });

  var resumeBtn = document.getElementById('kda-resume');
  if (resumeBtn) resumeBtn.addEventListener('click', function () {
    var stored = A.load();
    if (!stored || !stored.responses || !complete(stored.responses)) { syncEntry(); return; }
    state.answers = stored.responses;
    state.reading = A.buildReading(stored.responses, stored);
    show('reading'); window.scrollTo(0, 0);
    renderReading(state.reading);
  });

  syncEntry();
  show('entry');
})();
