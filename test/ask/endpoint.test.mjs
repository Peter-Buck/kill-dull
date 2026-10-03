// /api/ask exercised as Vercel calls it, with the Anthropic API stubbed so
// nothing leaves the process.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '../..');

process.env.ANTHROPIC_API_KEY = 'test-key';
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
delete process.env.ASK_MODEL;
delete process.env.VERCEL_ENV;
process.env.COLLECT_IP_SALT = 'salt-for-tests';

const handler = require('../../api/ask.js');

let calls;
let reply;
let logs;
beforeEach(() => {
  calls = [];
  reply = { ok: true, status: 200, body: { stop_reason: 'end_turn', content: [{ type: 'text', text: 'An answer.' }], usage: {} } };
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return { ok: reply.ok, status: reply.status, json: async () => reply.body };
  };
  logs = [];
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => logs.push(a.join(' '));
  delete process.env.ASK_MODEL;
  delete process.env.VERCEL_ENV;
});

async function ask(messages, headers = {}) {
  const req = { method: 'POST', headers: { host: 'preview.example', 'x-forwarded-for': '203.0.113.9', ...headers }, body: { messages } };
  const res = { statusCode: 0, headers: {}, payload: null,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(c) { this.statusCode = c; return this; },
    json(p) { this.payload = p; return this; } };
  await handler(req, res);
  return res;
}

const Q = 'What is The Bench?';

test('a question is answered from the instructions and the public record', async () => {
  const res = await ask([{ role: 'user', content: Q }]);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.text, 'An answer.');
  assert.equal(res.payload.notice, undefined);
  const body = calls[0].body;
  assert.equal(body.system[0].cache_control.type, 'ephemeral');
  assert.match(body.system[0].text, /<public_record>[\s\S]*=== \/offer ===[\s\S]*<\/public_record>/);
  assert.deepEqual(body.messages, [{ role: 'user', content: Q }]);
});

test('Sonnet 5.5 by default; ASK_MODEL chooses; nothing else is substituted', async () => {
  await ask([{ role: 'user', content: Q }]);
  assert.equal(calls[0].body.model, 'claude-sonnet-5-5');
  process.env.ASK_MODEL = 'claude-opus-5-5';
  await ask([{ role: 'user', content: Q }]);
  assert.equal(calls[1].body.model, 'claude-opus-5-5');
  for (const c of calls) {
    assert.equal('fallbacks' in c.body, false);
    assert.equal('thinking' in c.body, false);
    assert.equal(c.body.output_config.effort, 'low');
  }
});

test('a refusal is answered plainly, with no second model', async () => {
  reply.body = { stop_reason: 'refusal', stop_details: { type: 'refusal', category: 'cyber' }, content: [], usage: {} };
  const res = await ask([{ role: 'user', content: Q }]);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.text, 'That’s not something Ask Kill Dull can answer. Contact Kill Dull if you’d like to take it further.');
  assert.equal(res.payload.notice, true, 'kept out of the conversation');
  assert.equal(calls.length, 1);
});

test('an upstream failure is a plain message, not an error page', async () => {
  reply = { ok: false, status: 500, body: { error: { type: 'api_error' } } };
  const res = await ask([{ role: 'user', content: Q }]);
  assert.equal(res.statusCode, 502);
  assert.match(res.payload.text, /did not go through/);
});

test('a conversation continues: earlier turns are sent back', async () => {
  const convo = [
    { role: 'user', content: Q },
    { role: 'assistant', content: 'Where a commitment goes.' },
    { role: 'user', content: 'Why?' }
  ];
  const res = await ask(convo);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(calls[0].body.messages, convo);
});

test('malformed conversations are refused before any call', async () => {
  for (const bad of [
    [],
    [{ role: 'assistant', content: 'x' }],
    [{ role: 'user', content: 'a' }, { role: 'user', content: 'b' }],
    [{ role: 'system', content: 'x' }],
    [{ role: 'user', content: 'x'.repeat(2001) }]
  ]) {
    const res = await ask(bad);
    assert.equal(res.statusCode, 400);
  }
  assert.equal(calls.length, 0);
});

test('another site cannot call it; *.vercel.app is not trusted', async () => {
  const res = await ask([{ role: 'user', content: Q }], { origin: 'https://someone-else.vercel.app' });
  assert.equal(res.statusCode, 403);
  const ok = await ask([{ role: 'user', content: Q }], { origin: 'https://preview.example' });
  assert.equal(ok.statusCode, 200);
});

test('PRODUCTION FAILS CLOSED when the limiter is not there', async () => {
  process.env.VERCEL_ENV = 'production';
  const res = await ask([{ role: 'user', content: Q }]);
  assert.equal(res.statusCode, 503);
  assert.equal(calls.length, 0);
  assert.equal(res.headers['x-ask-model'], undefined);
});

test('NOTHING A VISITOR TYPED, NO ANSWER AND NO ADDRESS REACHES A LOG', async () => {
  const secret = 'our confidential launch plan';
  reply.body.content = [{ type: 'text', text: 'answer text that must not be logged' }];
  await ask([{ role: 'user', content: secret }]);
  reply.body = { stop_reason: 'refusal', stop_details: { category: secret }, content: [], usage: {} };
  await ask([{ role: 'user', content: secret }]);
  const all = logs.join('\n');
  assert.ok(logs.length > 0);
  for (const s of [secret, 'answer text', '203.0.113.9']) assert.equal(all.includes(s), false, s);
});

test('no message a visitor sees names a raw route', () => {
  const src = fs.readFileSync(path.join(ROOT, 'api/ask.js'), 'utf8');
  const block = src.slice(src.indexOf('var TEXT = {'), src.indexOf('};', src.indexOf('var TEXT = {')));
  assert.equal(/\/contact|ASK KILL DULL/.test(block), false);
  const widget = fs.readFileSync(path.join(ROOT, 'assets/ask-kill-dull.js'), 'utf8');
  assert.equal(/var FALLBACK = '[^']*\/contact/.test(widget), false);
});

test('the limiter identity is a salted daily hash, never the address', () => {
  const req = { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } };
  const id = handler.identity(req, 'salt');
  assert.match(id, /^[0-9a-f]{32}$/);
  assert.equal(id, handler.identity(req, 'salt'));
  assert.notEqual(id, handler.identity(req, 'other-salt'));
  assert.equal(handler.identity(req, ''), null);
});

test('the widget asks the ten questions and answers none of them itself', () => {
  const src = fs.readFileSync(path.join(ROOT, 'assets/ask-kill-dull.js'), 'utf8');
  const block = src.slice(src.indexOf('var STARTERS = ['), src.indexOf('];', src.indexOf('var STARTERS = [')));
  const qs = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.equal(qs.length, 10);
  assert.equal(qs[3], 'What is The Bench?');
  assert.equal(/\ba:\s/.test(block), false, 'no authored answers');
  assert.equal(/localStorage|sessionStorage|document\.cookie/.test(src), false, 'no persistence');
});
