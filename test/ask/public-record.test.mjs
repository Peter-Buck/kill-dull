// ASK KILL DULL's knowledge is the public site itself. These tests hold the
// record to the deployed pages, keep held material out, and prove that a
// change to a page is a change to what ASK knows, with nothing else to update.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '../..');
const record = require('../../api/_lib/public-record.js');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

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

test('the record builds from every public page, labelled by route', () => {
  const text = record.build(ROOT);
  assert.match(text, /KILL DULL™ — INDEPENDENT MARKETING JUDGMENT FOR BRANDS/);
  for (const [, route] of record.PAGES) assert.ok(text.includes(`=== ${route} ===`), route);
  assert.equal(text.includes('<'), false, 'no markup survives');
});

test('the page list, the function bundle and the deploy agree', () => {
  const files = record.PAGES.map((p) => p[0]).sort();
  const vercel = JSON.parse(read('vercel.json'));
  const glob = vercel.functions['api/ask.js'].includeFiles;
  const m = glob.match(/^\{([a-z,]+)\}\.html$/);
  assert.ok(m, 'includeFiles is a {a,b}.html list');
  assert.deepEqual(m[1].split(',').map((n) => n + '.html').sort(), files);
  for (const f of files) assert.ok(deployed(f), `${f} is deployed`);
  for (const f of ['api/ask.js', 'api/_lib/public-record.js', 'api/_lib/instructions.js']) {
    assert.ok(deployed(f), `${f} is deployed`);
  }
});

test('every route in the record is a real route', () => {
  const vercel = JSON.parse(read('vercel.json'));
  const routes = new Set(['/', ...vercel.rewrites.map((r) => r.source)]);
  for (const [, route] of record.PAGES) assert.ok(routes.has(route), route);
});

test('held material never enters: no HELD Readings, no comments', () => {
  const text = record.build(ROOT);
  for (const held of ['PATAGONIA', 'MUJI', 'WD-40', 'THE NEW YORKER']) {
    assert.equal(text.toUpperCase().includes(held), false, held);
  }
  assert.equal(/HELD/.test(text), false);
  assert.equal(text.includes('<!--'), false);
});

test('a page without <main> stops the build rather than leaving it out', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-record-'));
  for (const [f] of record.PAGES) fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  fs.writeFileSync(path.join(dir, 'terms.html'), '<html><body>no main</body></html>');
  assert.throws(() => record.build(dir), /record: terms\.html/);
});

test('CHANGE HMM. ON /how AND ASK KNOWS IT: one line in, one line out', () => {
  const before = record.build(ROOT);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-hmm-'));
  for (const [f] of record.PAGES) fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  const how = read('how.html');
  const OLD = 'Something consequential remains unresolved.';
  const NEW = 'TEST EDIT: the case is not yet strong enough either way.';
  assert.ok(how.includes(OLD));
  fs.writeFileSync(path.join(dir, 'how.html'), how.replace(OLD, NEW));
  const after = record.build(dir);

  const a = before.split('\n');
  const b = after.split('\n');
  assert.equal(a.length, b.length);
  const changed = a.map((l, i) => [l, b[i]]).filter(([x, y]) => x !== y);
  assert.equal(changed.length, 1);
  assert.ok(changed[0][0].includes(OLD) && changed[0][1].includes(NEW));
});
