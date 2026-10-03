// The Bench is retired from the public site. OFFER is the page, /offer is its
// route, and a Private Reading is what it offers. These tests keep the old name
// out of everything a visitor can read or follow: page copy, metadata, URLs,
// the copy kd.js and ASK KILL DULL write into the page, and ASK's knowledge.
//
// Implementation names a visitor never reads are left alone on purpose: CSS
// classes (.bench-card), image filenames (bench-card-01.jpg) and the BENCH
// analytics value, which keeps the record continuous across the rename.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// The word itself, not a class or file name built from it (.bench-card,
// bench_commitment) and not "benchmark".
const BENCH = /(?<![\w./-])bench(?![\w-])/i;

// The one exception, deferred by decision: the Private Reading photograph on
// OUTCOME shows a cover printed "Bench". Its alt text describes what is in the
// picture. When the photograph is replaced, remove this and the test holds it.
const DEFERRED = [
  'its cover reading &#8220;Bench, Reading No 001, On entering the U.S. market.&#8221;',
];

// ── what is deployed: .vercelignore, read the way Vercel reads it ─────────────
function deployed(rel) {
  let out = true;
  for (const raw of read('.vercelignore').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const neg = line.startsWith('!');
    const pat = neg ? line.slice(1) : line;
    let hit;
    if (pat === '/*') hit = true;
    else if (pat.endsWith('/')) hit = rel.startsWith(pat);
    else hit = rel === pat.replace(/^\//, '');
    if (hit) out = neg;
  }
  return out;
}

function walk(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.name === '.git' || e.name === 'node_modules') return [];
    return e.isDirectory() ? walk(rel) : [rel];
  });
}

const DEPLOYED = walk('').filter(deployed);
const PAGES = DEPLOYED.filter((f) => f.endsWith('.html'));
// kd-collect.js only reports to analytics; its BENCH is the recorded value.
const SCRIPTS = DEPLOYED.filter((f) => f.startsWith('assets/') && f.endsWith('.js')
  && f !== 'assets/kd-collect.js' && !f.startsWith('assets/why/'));

// ── what a visitor can read in a page ─────────────────────────────────────────
const SKIP_ATTR = new Set(['class', 'id', 'src', 'srcset', 'style', 'for', 'name', 'type', 'rel']);

function visible(html) {
  const found = [];
  const body = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, (s) => { found.push(...strings(s)); return ' '; });
  for (const m of body.matchAll(/<!--([\s\S]*?)-->/g)) found.push(m[1]);
  for (const tag of body.matchAll(/<[a-z][^>]*>/gi)) {
    for (const a of tag[0].matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      const name = a[1].toLowerCase();
      if (!SKIP_ATTR.has(name) && !name.startsWith('data-')) found.push(a[3] ?? a[4]);
    }
  }
  found.push(...body.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, '\n').split('\n'));
  return found;
}

// String literals in script source: everything kd.js and ASK write into a page.
function strings(src) {
  const noComments = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
  return [...noComments.matchAll(/'((?:\\.|[^'\\\n])*)'|"((?:\\.|[^"\\\n])*)"|`((?:\\.|[^`\\])*)`/g)]
    .map((m) => m[1] ?? m[2] ?? m[3]);
}

const offending = (texts) => texts.filter((t) => BENCH.test(t) && !DEFERRED.some((d) => t.includes(d)));

test('the deploy list is what the tests think it is', () => {
  for (const f of ['index.html', 'offer.html', 'outcome.html', 'assets/kd.js', 'assets/ask-kill-dull.js']) {
    assert.ok(DEPLOYED.includes(f), `${f} should be deployed`);
  }
  assert.equal(deployed('bench.html'), false);
  assert.equal(deployed('api/_lib/knowledge.js'), false);
});

test('no page says Bench: copy, titles, metadata, alt text, labels, comments', () => {
  for (const f of PAGES) {
    assert.deepEqual(offending(visible(read(f))), [], f);
  }
});

test('nothing kd.js or ASK KILL DULL writes into a page says Bench', () => {
  for (const f of SCRIPTS) {
    assert.deepEqual(offending(strings(read(f))), [], f);
  }
});

test('ASK KILL DULL knowledge never says Bench', () => {
  assert.deepEqual(offending(strings(read('api/_lib/knowledge.js'))), []);
});

test('the contact form and its server agree, without THE BENCH', () => {
  const options = [...read('contact.html').matchAll(/<option>([^<]+)<\/option>/g)].map((m) => m[1]);
  const server = read('api/contact.js').match(/ABOUT_OPTIONS = \[([\s\S]*?)\]/)[1];
  const allowed = [...server.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(options, allowed);
  assert.ok(allowed.includes('A PRIVATE READING'));
  assert.equal(offending(allowed).length, 0);
});

// ── URLs ──────────────────────────────────────────────────────────────────────
const OLD_ROUTE = /(^|["'(\s=]|killdull\.com)\/bench(\.html)?(?=$|[\s"'#?)\/<])/;

test('no deployed page, script or sitemap links to /bench', () => {
  for (const f of [...PAGES, ...SCRIPTS, 'sitemap.xml']) {
    const lines = read(f).split('\n').filter((l) => OLD_ROUTE.test(l));
    assert.deepEqual(lines, [], f);
  }
});

test('OFFER is canonical at /offer: canonical, Open Graph and sitemap', () => {
  const page = read('offer.html');
  assert.match(page, /<link rel="canonical" href="https:\/\/killdull\.com\/offer">/);
  assert.match(page, /<meta property="og:url" content="https:\/\/killdull\.com\/offer">/);
  assert.match(page, /<title>OFFER — Kill Dull™<\/title>/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/killdull\.com\/offer<\/loc>/);
});

test('/bench, /bench.html and /offer.html redirect permanently to /offer', () => {
  const v = JSON.parse(read('vercel.json'));
  for (const source of ['/bench', '/bench.html', '/offer.html']) {
    const r = v.redirects.find((x) => x.source === source);
    assert.ok(r, source);
    assert.equal(r.destination, '/offer', source);
    assert.equal(r.permanent, true, source);
  }
  assert.deepEqual(v.rewrites.find((x) => x.source === '/offer'), { source: '/offer', destination: '/offer.html' });
  assert.equal(v.rewrites.some((x) => /bench/.test(x.source + x.destination)), false);
});

test('the navigation reads WHY, WHAT, HOW, OFFER, OUTCOME', () => {
  const order = ['WHY', 'WHAT', 'HOW', 'OFFER', 'OUTCOME'];
  const nav = (s) => [...s.matchAll(/class="reg-item[^"]*" href="[^"]*">([A-Z]+)<\/a>/g)].map((m) => m[1]).slice(0, 5);
  for (const f of PAGES.filter((p) => /reg-item/.test(read(p)))) assert.deepEqual(nav(read(f)), order, f);
  assert.deepEqual(nav(read('assets/kd.js').replace(/'\+\(key===[^)]*\)\+'/g, '')), order, 'kd.js');
});

// ── retired content stays out of the deploy ───────────────────────────────────
test('the HELD Readings are not in any deployed page or asset', () => {
  for (const f of PAGES) {
    const s = read(f);
    assert.doesNotMatch(s, /<!-- HELD/, f);
    assert.doesNotMatch(s, /PATAGONIA|MUJI|WD-40|THE NEW YORKER/, f);
  }
  for (const img of ['reading-patagonia.webp', 'reading-muji.webp', 'reading-wd40.webp', 'reading-new-yorker.webp']) {
    assert.equal(deployed(`assets/${img}`), false, img);
  }
});

test('the nail-bench photograph is gone from OFFER and from the deploy', () => {
  for (const f of [...PAGES, ...SCRIPTS]) assert.doesNotMatch(read(f), /nailbench|bench-nails/, f);
  assert.equal(deployed('assets/kill-dull-nailbench.webp'), false);
});
