/**
 * ASK KILL DULL — the public record.
 *
 * ASK's only knowledge is the text of the public pages, read from the HTML
 * files bundled into this deployment (vercel.json functions.includeFiles).
 * There is no second copy: change a page, deploy, and ASK reads the change.
 *
 * Only each page's <main> is read. Comments, scripts, styles and SVG are
 * removed first, so held material in HTML comments never enters, and the
 * nav, footer and anything a script injects are left out.
 */

'use strict';

var fs = require('fs');
var path = require('path');

// Page file -> public route, in reading order. One list: a test holds it to
// vercel.json includeFiles and to .vercelignore.
var PAGES = [
  ['index.html', '/'],
  ['why.html', '/why'],
  ['how.html', '/how'],
  ['offer.html', '/offer'],
  ['outcome.html', '/outcome'],
  ['bureau.html', '/bureau'],
  ['assessment.html', '/assessment'],
  ['contact.html', '/contact'],
  ['privacy.html', '/privacy'],
  ['terms.html', '/terms'],
  ['accessibility.html', '/accessibility']
];

var ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  mdash: '—', ndash: '–', middot: '·', hellip: '…',
  copy: '©', trade: '™', rarr: '→', nearr: '↗'
};

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (m, e) {
    if (e[0] === '#') {
      var n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(n);
    }
    var v = ENTITIES[e.toLowerCase()];
    return v != null ? v : m;
  });
}

/** The readable text of one page's <main>. Throws if the page has none. */
function pageText(html) {
  var s = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, '');
  var main = s.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!main) throw new Error('no <main>');
  s = main[1]
    // Internal links keep their destination, so ASK can point to it.
    .replace(/<a\b[^>]*\bhref="(\/[^"#?]*)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, function (m, href, inner) {
      return inner + ' (' + href + ') ';
    })
    // Alt text describes the public photographs, including words printed in them.
    .replace(/<img\b[^>]*\balt="([^"]+)"[^>]*>/gi, '\n[Image: $1]\n')
    .replace(/<\/?(p|div|h[1-6]|li|ul|ol|section|article|br|tr|td|th|dt|dd|blockquote|figure|figcaption|button|header|footer|label|option|summary|details)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return decode(s)
    .split('\n')
    .map(function (l) { return l.replace(/\s+/g, ' ').trim(); })
    .filter(Boolean)
    .join('\n');
}

function masthead(html) {
  var m = html.match(/class="masthead-designation"[^>]*>([^<]+)</);
  return m ? decode(m[1]).trim() : '';
}

/**
 * Build the record from the page files under root. Fails whole: a missing
 * page or a page without <main> throws, so ASK never runs on part of the site.
 */
function build(root) {
  var read = function (f) { return fs.readFileSync(path.join(root, f), 'utf8'); };
  var line = masthead(read('index.html'));
  if (!line) throw new Error('no masthead');
  var out = ['=== Kill Dull (masthead, every page) ===\nKILL DULL™ — ' + line];
  PAGES.forEach(function (p) {
    var text;
    try { text = pageText(read(p[0])); } catch (e) { throw new Error('record: ' + p[0]); }
    out.push('=== ' + p[1] + ' ===\n' + text);
  });
  return out.join('\n\n');
}

/** Where the bundled pages are: the project root in a deployment and locally. */
function defaultRoot() {
  var candidates = [process.cwd(), path.join(__dirname, '..', '..')];
  for (var i = 0; i < candidates.length; i++) {
    if (fs.existsSync(path.join(candidates[i], 'index.html'))) return candidates[i];
  }
  return candidates[0];
}

module.exports = { PAGES: PAGES, build: build, pageText: pageText, defaultRoot: defaultRoot };
