// The public architecture is WHY → WHAT → HOW → OFFER → OUTCOME. "The Bench"
// is retired: it is not a page, a route, a label or a word a visitor can read.
// These tests read the files exactly as they deploy, so a retired name cannot
// come back in through copy, metadata, a link, the nav kd.js writes, the
// Assessment's Reading, ASK KILL DULL's answers, or the routing table.
//
// Internal names are deliberately out of scope: CSS class names, image file
// names under /assets, the analytics key BENCH (kept for continuity in
// assets/kd-collect.js and lib/intel/) and the redirects that carry old links.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

// The deployed pages are the HTML files .vercelignore re-includes.
const PAGES = read('.vercelignore').split('\n')
  .map((l) => l.trim()).filter((l) => /^![\w-]+\.html$/.test(l)).map((l) => l.slice(1));

// The one deferred exception: the Reading photograph has "BENCH" printed on
// the book in the image itself. Its replacement is tracked separately; until
// then its file name and the alt text that quotes the printed cover are allowed.
const DEFERRED_PHOTO = 'bench-reading-in-situ.webp';

const RETIRED = /bench/i;

function strip(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
}

function visibleText(html) {
  return strip(html).replace(/<[^>]+>/g, ' ').replace(/&[#\w]+;/g, ' ');
}

function attributes(html, names) {
  const out = [];
  const re = new RegExp(`<([a-z0-9]+)\\b([^>]*)>`, 'gi');
  for (const tag of strip(html).matchAll(re)) {
    for (const a of tag[2].matchAll(/\b([\w:-]+)\s*=\s*"([^"]*)"/g)) {
      if (names.includes(a[1].toLowerCase())) out.push({ name: a[1].toLowerCase(), value: a[2], tag: tag[0] });
    }
  }
  return out;
}

test('the deploy list carries offer.html and not bench.html', () => {
  assert.ok(PAGES.includes('offer.html'), 'offer.html is re-included');
  assert.ok(PAGES.includes('outcome.html'), 'outcome.html is re-included');
  assert.ok(!PAGES.includes('bench.html'));
  assert.ok(existsSync(join(ROOT, 'offer.html')));
  assert.ok(!existsSync(join(ROOT, 'bench.html')));
  for (const p of PAGES) assert.ok(existsSync(join(ROOT, p)), `${p} exists`);
});

test('no deployed page shows the retired name in its visible copy', () => {
  for (const p of PAGES) {
    const hit = visibleText(read(p)).match(/.{0,40}bench.{0,40}/i);
    assert.equal(hit, null, `${p}: "${hit && hit[0].trim()}"`);
  }
});

test('no title, description, label or alt text carries the retired name', () => {
  for (const p of PAGES) {
    for (const a of attributes(read(p), ['content', 'title', 'aria-label', 'alt', 'placeholder', 'value'])) {
      if (a.name === 'alt' && a.tag.includes(DEFERRED_PHOTO)) continue;
      assert.doesNotMatch(a.value, RETIRED, `${p}: ${a.name}="${a.value}"`);
    }
  }
});

test('no link, canonical or social URL points at /bench', () => {
  for (const p of PAGES) {
    for (const a of attributes(read(p), ['href', 'content'])) {
      assert.doesNotMatch(a.value, RETIRED, `${p}: ${a.name}="${a.value}"`);
    }
  }
  assert.doesNotMatch(read('sitemap.xml'), RETIRED);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/killdull\.com\/offer<\/loc>/);
});

test('the OFFER page declares /offer as its canonical and social URL', () => {
  const html = read('offer.html');
  assert.match(html, /<link rel="canonical" href="https:\/\/killdull\.com\/offer">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/killdull\.com\/offer">/);
  assert.match(html, /<title>OFFER — Kill Dull™<\/title>/);
});

test('/bench survives only as permanent redirects to /offer', () => {
  const cfg = JSON.parse(read('vercel.json'));
  const benchRedirects = (cfg.redirects || []).filter((r) => RETIRED.test(r.source));
  assert.deepEqual(benchRedirects.map((r) => r.source).sort(), ['/bench', '/bench.html']);
  for (const r of benchRedirects) {
    assert.equal(r.destination, '/offer');
    assert.equal(r.permanent, true);
  }
  for (const r of cfg.redirects || []) assert.doesNotMatch(r.destination, RETIRED);
  for (const r of cfg.rewrites || []) {
    assert.doesNotMatch(`${r.source} ${r.destination}`, RETIRED);
  }
  const toOffer = (cfg.redirects || []).find((r) => r.source === '/offer.html');
  assert.ok(toOffer && toOffer.destination === '/offer' && toOffer.permanent);
  assert.ok((cfg.rewrites || []).some((r) => r.source === '/offer' && r.destination === '/offer.html'));
});

test('every page and the nav kd.js writes run WHY → WHAT → HOW → OFFER → OUTCOME', () => {
  const ORDER = [['/why', 'WHY'], ['/', 'WHAT'], ['/how', 'HOW'], ['/offer', 'OFFER'], ['/outcome', 'OUTCOME']];
  const navs = PAGES.map((p) => [p, (read(p).match(/id="registrar-desktop">([\s\S]*?)<\/div>/) || [])[1]]);
  // kd.js builds the desktop and phone navs from string fragments, one line each.
  const kdLines = read('assets/kd.js').split('\n').filter((l) => l.includes('href="/why">WHY</a>'));
  assert.ok(kdLines.length >= 2, 'kd.js writes a desktop and a phone nav');
  kdLines.forEach((l, i) => navs.push([`assets/kd.js nav ${i + 1}`, l]));
  for (const [where, nav] of navs) {
    assert.ok(nav, `${where}: nav found`);
    const links = [...nav.matchAll(/href="([^"]+)">([A-Z]+)<\/a>/g)].map((x) => [x[1], x[2]]);
    assert.deepEqual(links.slice(0, 5), ORDER, where);
  }
});

test('copy that scripts write into the page never uses the retired name', () => {
  // kd.js writes the nav and footer; kd-assess.js writes the Assessment's
  // Reading; ask-kill-dull.js holds ASK KILL DULL's answers. CSS selectors
  // such as .bench-card are internal and excluded by the lookahead.
  for (const f of ['assets/kd.js', 'assets/kd-assess.js', 'assets/ask-kill-dull.js']) {
    const hit = read(f).match(/.{0,40}bench(?!-).{0,40}/i);
    assert.equal(hit, null, `${f}: "${hit && hit[0]}"`);
  }
});

test('the contact form and its server accept exactly the same subjects', async () => {
  const html = read('contact.html');
  const select = html.match(/<select[\s\S]*?<\/select>/)[0];
  const options = [...select.matchAll(/<option(?![^>]*disabled)[^>]*>([^<]+)<\/option>/g)].map((m) => m[1]);
  const { ABOUT_OPTIONS } = await import(join(ROOT, 'api', 'contact.js'));
  assert.deepEqual(options, ABOUT_OPTIONS);
  assert.ok(options.includes('PRIVATE READINGS'));
  for (const o of options) assert.doesNotMatch(o, RETIRED);
});

test('unpublished material is not in any deployed page source', () => {
  for (const p of PAGES) {
    const html = read(p);
    assert.doesNotMatch(html, /<!--/, `${p} carries an HTML comment`);
    assert.doesNotMatch(html, /\bHELD\b/, `${p} carries held material`);
  }
});
