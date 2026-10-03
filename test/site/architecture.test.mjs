// The site's architecture: WHY, WHAT, HOW, OFFER, OUTCOME. OFFER lives at
// /offer and OUTCOME at /outcome; /bench and /readings are old addresses that
// redirect. These tests hold the routes, redirects, links and page metadata to
// that. They say nothing about copy: the Bench and Readings are Kill Dull's
// terms and appear wherever the copy uses them.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// What is deployed: .vercelignore, read the way Vercel reads it.
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
const SCRIPTS = DEPLOYED.filter((f) => f.startsWith('assets/') && f.endsWith('.js') && !f.startsWith('assets/why/'));

test('OFFER and OUTCOME are deployed as offer.html and outcome.html', () => {
  for (const f of ['offer.html', 'outcome.html']) assert.ok(DEPLOYED.includes(f), f);
  for (const f of ['bench.html', 'readings.html']) assert.equal(fs.existsSync(path.join(ROOT, f)), false, f);
});

test('the old addresses redirect permanently to /offer and /outcome', () => {
  const v = JSON.parse(read('vercel.json'));
  const expected = {
    '/bench': '/offer', '/bench.html': '/offer', '/offer.html': '/offer',
    '/readings': '/outcome', '/readings.html': '/outcome', '/outcome.html': '/outcome',
  };
  for (const [source, destination] of Object.entries(expected)) {
    const r = v.redirects.find((x) => x.source === source);
    assert.ok(r, source);
    assert.equal(r.destination, destination, source);
    assert.equal(r.permanent, true, source);
  }
  assert.deepEqual(v.rewrites.find((x) => x.source === '/offer'), { source: '/offer', destination: '/offer.html' });
  assert.deepEqual(v.rewrites.find((x) => x.source === '/outcome'), { source: '/outcome', destination: '/outcome.html' });
});

test('no deployed page, script or sitemap links to /bench or /readings', () => {
  const OLD = /(href=\\?["']|killdull\.com|<loc>)\/(bench|readings)(\.html)?(?=$|[\s"'#?)\/<\\])/;
  for (const f of [...PAGES, ...SCRIPTS, 'sitemap.xml']) {
    assert.deepEqual(read(f).split('\n').filter((l) => OLD.test(l)), [], f);
  }
});

test('OFFER and OUTCOME carry their section in title, canonical, Open Graph and sitemap', () => {
  const sitemap = read('sitemap.xml');
  for (const [file, name, route] of [['offer.html', 'OFFER', '/offer'], ['outcome.html', 'OUTCOME', '/outcome']]) {
    const page = read(file);
    assert.match(page, new RegExp(`<title>${name} — Kill Dull™</title>`), file);
    assert.match(page, new RegExp(`<meta property="og:title" content="${name} — Kill Dull™">`), file);
    assert.match(page, new RegExp(`<meta name="twitter:title" content="${name} — Kill Dull™">`), file);
    assert.match(page, new RegExp(`<link rel="canonical" href="https://killdull\\.com${route}">`), file);
    assert.match(page, new RegExp(`<meta property="og:url" content="https://killdull\\.com${route}">`), file);
    assert.match(sitemap, new RegExp(`<loc>https://killdull\\.com${route}</loc>`), file);
  }
});

test('the navigation reads WHY, WHAT, HOW, OFFER, OUTCOME and points at /offer and /outcome', () => {
  const order = ['WHY', 'WHAT', 'HOW', 'OFFER', 'OUTCOME'];
  const items = (s) => [...s.matchAll(/class="reg-item[^"]*" href="([^"]*)">([A-Z]+)<\/a>/g)].slice(0, 5);
  const check = (s, label) => {
    const nav = items(s);
    assert.deepEqual(nav.map((m) => m[2]), order, label);
    assert.equal(nav[3][1], '/offer', label);
    assert.equal(nav[4][1], '/outcome', label);
  };
  for (const f of PAGES.filter((p) => /reg-item/.test(read(p)))) check(read(f), f);
  check(read('assets/kd.js').replace(/'\+\(key===[^)]*\)\+'/g, ''), 'kd.js');
});

test('the HELD Readings are not in any deployed page, and their images are not deployed', () => {
  for (const f of PAGES) {
    const s = read(f);
    assert.doesNotMatch(s, /<!-- HELD/, f);
    assert.doesNotMatch(s, /reading-(patagonia|muji|wd40|new-yorker)\.webp/, f);
  }
  for (const img of ['reading-patagonia.webp', 'reading-muji.webp', 'reading-wd40.webp', 'reading-new-yorker.webp']) {
    assert.equal(deployed(`assets/${img}`), false, img);
  }
});
